import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = path.join("docs", "model-value");
const REPORTS = path.join(ROOT, "reports");
const SNAPSHOTS = path.join(ROOT, "snapshots");
const SITE_URL = "https://jaeseok614.github.io/ai-hardware-fit";
const BASELINE = "Q4_K_M · 4K context · concurrency 1 · llama.cpp";
const BUDGETS = [8, 12, 16, 24, 32, 48, 80, 128];

function loadCatalog() {
  const context = { window: {} };
  vm.createContext(context);
  for (const file of ["data/models.js", "data/model-metadata.js"]) {
    vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
  }
  const data = context.window.LLM_GPU_CHECKER_DATA;
  const metadata = data.modelMetadata || {};
  return (data.models || []).map((model) => ({ ...model, ...(metadata[`generative:${model.name}`] || metadata[model.name] || {}) }));
}

function requiredVramGb(model) {
  const weightsGb = model.params * 0.6 * 1.08;
  const kvGb = model.active * 0.09;
  const runtimeOverheadGb = 1.2 + Math.min(3, weightsGb * 0.06);
  return weightsGb + kvGb + runtimeOverheadGb;
}

function metricFamilies(models) {
  const groups = new Map();
  for (const model of models) {
    const benchmark = model.qualityBenchmark;
    if (!benchmark || !Number.isFinite(benchmark.value) || !benchmark.metric) continue;
    const metric = String(benchmark.metric).trim();
    const rows = groups.get(metric) || [];
    rows.push({
      name: model.name,
      score: benchmark.value,
      requiredGb: requiredVramGb(model),
      releaseDate: model.releaseDate || "",
      sourceUrl: benchmark.sourceUrl || model.sourceUrl || "",
    });
    groups.set(metric, rows);
  }
  return [...groups.entries()].filter(([, rows]) => rows.length >= 2);
}

function computeFrontier(entries) {
  const sorted = [...entries].sort((a, b) => a.requiredGb - b.requiredGb || b.score - a.score || a.name.localeCompare(b.name));
  let bestScore = -Infinity;
  return sorted.map((entry) => {
    const onFrontier = entry.score > bestScore;
    if (onFrontier) bestScore = entry.score;
    return { ...entry, onFrontier };
  });
}

function bestByBudget(entries) {
  return Object.fromEntries(BUDGETS.map((vram) => {
    const candidates = entries
      .filter((entry) => entry.requiredGb <= vram)
      .sort((a, b) => b.score - a.score || b.releaseDate.localeCompare(a.releaseDate));
    return [vram, candidates.slice(0, 2).map((entry) => entry.name)];
  }));
}

function buildSnapshot(models, date) {
  const families = metricFamilies(models).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  const [metric, rows] = families.find(([name]) => name === "MMLU-Pro") || families[0] || ["", []];
  const frontier = computeFrontier(rows);
  return {
    date,
    baseline: BASELINE,
    metric,
    models: models
      .filter((model) => model.qualityBenchmark)
      .map((model) => ({
        name: model.name,
        releaseDate: model.releaseDate || "",
        metric: model.qualityBenchmark.metric || "",
        score: model.qualityBenchmark.value,
        requiredGb: Number(requiredVramGb(model).toFixed(2)),
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    frontier: frontier.filter((entry) => entry.onFrontier).map((entry) => entry.name),
    picks: bestByBudget(frontier),
    entries: frontier,
    familyCounts: Object.fromEntries(families.map(([name, items]) => [name, items.length])),
  };
}

function diffSnapshots(previous, current) {
  if (!previous) return { baseline: true, added: current.models.map((model) => model.name), removed: [], changed: [], pickChanges: [] };
  const before = new Map(previous.models.map((model) => [model.name, model]));
  const after = new Map(current.models.map((model) => [model.name, model]));
  const added = [...after.keys()].filter((name) => !before.has(name));
  const removed = [...before.keys()].filter((name) => !after.has(name));
  const changed = [...after.keys()].filter((name) => {
    if (!before.has(name)) return false;
    const a = before.get(name);
    const b = after.get(name);
    return a.metric !== b.metric || a.score !== b.score || a.requiredGb !== b.requiredGb || a.releaseDate !== b.releaseDate;
  });
  const pickChanges = BUDGETS.filter((vram) => JSON.stringify(previous.picks?.[vram] || []) !== JSON.stringify(current.picks?.[vram] || []));
  return { baseline: false, added, removed, changed, pickChanges };
}

function markdownLink(entry) {
  return entry.sourceUrl ? `[${entry.name}](${entry.sourceUrl})` : entry.name;
}

function summaryLines(diff) {
  if (diff.baseline) return ["첫 기준 스냅샷을 생성했습니다. 다음 주부터 모델·점수·VRAM 추천 변화를 비교합니다."];
  const lines = [];
  if (diff.added.length) lines.push(`벤치마크 모델 추가: ${diff.added.join(", ")}`);
  if (diff.removed.length) lines.push(`벤치마크 모델 제거: ${diff.removed.join(", ")}`);
  if (diff.changed.length) lines.push(`점수·메타데이터 변경: ${diff.changed.join(", ")}`);
  if (diff.pickChanges.length) lines.push(`VRAM 추천 변경: ${diff.pickChanges.map((vram) => `${vram}GB`).join(", ")}`);
  if (!lines.length) lines.push("지난 스냅샷 이후 모델·점수·VRAM 추천 변경이 없습니다.");
  return lines;
}

function renderMarkdown(snapshot, diff) {
  const frontier = snapshot.entries.filter((entry) => entry.onFrontier);
  return `# Weekly local-model value report — ${snapshot.date}

같은 공개 벤치마크 안에서만 모델을 비교한 AI Hardware Fit 주간 요약입니다.

- 비교 지표: **${snapshot.metric}** (${snapshot.entries.length}개 모델)
- 메모리 기준: **${BASELINE}**
- 주의: 공개 점수의 세부 평가 조건은 모델마다 다를 수 있으므로 각 출처를 함께 확인하세요.

## 이번 주 변경

${summaryLines(diff).map((line) => `- ${line}`).join("\n")}

## VRAM별 최고 점수

| VRAM | 1순위 | 2순위 |
| ---: | --- | --- |
${BUDGETS.map((vram) => {
  const [first, second] = snapshot.picks[vram] || [];
  return `| ${vram}GB | ${first || "—"} | ${second || "—"} |`;
}).join("\n")}

## VRAM–성능 프런티어

${frontier.map((entry) => `- ${markdownLink(entry)} — ${entry.requiredGb.toFixed(1)}GB · ${snapshot.metric} ${entry.score}`).join("\n")}

프런티어는 같은 그룹에서 더 적은 VRAM을 쓰면서 같거나 높은 점수를 내는 다른 모델이 없는 경우입니다. [대화형 차트 열기](${SITE_URL}/?lang=ko#valueFrontier) · [Open in English](${SITE_URL}/?lang=en#valueFrontier)
`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderHtml(snapshot, diff) {
  const frontier = snapshot.entries.filter((entry) => entry.onFrontier);
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Weekly local-model value report — ${snapshot.date}</title><meta name="description" content="Best local AI models by VRAM, compared within ${escapeHtml(snapshot.metric)}."><style>:root{color-scheme:light dark}body{margin:0;background:#f2f3f1;color:#17202a;font:15px/1.6 system-ui,sans-serif}.wrap{max-width:980px;margin:auto;padding:42px 22px 80px}.hero,.panel{background:#fff;border:1px solid #cfd5d9;border-radius:8px;padding:24px;margin-bottom:16px}h1{font-size:clamp(1.9rem,5vw,3.4rem);line-height:1.08;margin:.2em 0}.kicker{color:#14745a;font-weight:800;letter-spacing:.08em}.note{color:#5c6873}.changes{border-left:4px solid #14745a;padding-left:18px}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:10px;border-top:1px solid #cfd5d9}a{color:#16577a}.actions{display:flex;gap:10px;flex-wrap:wrap}.actions a{background:#16577a;color:#fff;padding:10px 14px;text-decoration:none;border-radius:5px}@media(prefers-color-scheme:dark){body{background:#14171a;color:#e7eaee}.hero,.panel{background:#21262b;border-color:#4a535c}.note{color:#9aa4ae}a{color:#6fb2e0}}</style></head><body><main class="wrap"><section class="hero"><span class="kicker">AI HARDWARE FIT · WEEKLY</span><h1>VRAM별 최고 로컬 모델</h1><p>${escapeHtml(snapshot.date)} · ${escapeHtml(snapshot.metric)} · ${escapeHtml(BASELINE)}</p><p class="note">같은 공개 벤치마크 안에서만 비교합니다. 세부 평가 조건은 각 출처에서 확인하세요.</p><div class="actions"><a href="${SITE_URL}/?lang=ko#valueFrontier">대화형 차트</a><a href="${SITE_URL}/?lang=en#valueFrontier">English</a></div></section><section class="panel changes"><h2>이번 주 변경</h2><ul>${summaryLines(diff).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul></section><section class="panel"><h2>VRAM별 최고 점수</h2><table><thead><tr><th>VRAM</th><th>1순위</th><th>2순위</th></tr></thead><tbody>${BUDGETS.map((vram) => { const [first, second] = snapshot.picks[vram] || []; return `<tr><th>${vram}GB</th><td>${escapeHtml(first || "—")}</td><td>${escapeHtml(second || "—")}</td></tr>`; }).join("")}</tbody></table></section><section class="panel"><h2>VRAM–성능 프런티어</h2><ul>${frontier.map((entry) => `<li>${entry.sourceUrl ? `<a href="${escapeHtml(entry.sourceUrl)}">${escapeHtml(entry.name)}</a>` : escapeHtml(entry.name)} — ${entry.requiredGb.toFixed(1)}GB · ${escapeHtml(snapshot.metric)} ${entry.score}</li>`).join("")}</ul></section></main></body></html>`;
}

function main() {
  const date = process.env.MODEL_VALUE_DATE || new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("MODEL_VALUE_DATE must be YYYY-MM-DD");
  fs.mkdirSync(REPORTS, { recursive: true });
  fs.mkdirSync(SNAPSHOTS, { recursive: true });
  const latestSnapshotPath = path.join(SNAPSHOTS, "latest.json");
  const previous = fs.existsSync(latestSnapshotPath) ? JSON.parse(fs.readFileSync(latestSnapshotPath, "utf8")) : null;
  const snapshot = buildSnapshot(loadCatalog(), date);
  if (!snapshot.metric || snapshot.entries.length < 2) throw new Error("No benchmark family has enough models for the value report");
  const diff = diffSnapshots(previous, snapshot);
  const markdown = renderMarkdown(snapshot, diff);
  fs.writeFileSync(path.join(REPORTS, `${date}.md`), markdown);
  fs.writeFileSync(path.join(ROOT, "latest.md"), markdown);
  fs.writeFileSync(path.join(ROOT, "index.html"), renderHtml(snapshot, diff));
  fs.writeFileSync(latestSnapshotPath, `${JSON.stringify({ ...snapshot, entries: undefined }, null, 2)}\n`);
  const reports = fs.readdirSync(REPORTS).filter((name) => name.endsWith(".md")).sort().reverse();
  fs.writeFileSync(path.join(ROOT, "README.md"), `# Weekly model-value reports\n\nGenerated from the same Q4_K_M VRAM baseline used by the interactive benchmark workspace.\n\n${reports.map((name) => `- [${name.replace(/\.md$/, "")}](./reports/${name})`).join("\n")}\n`);
  console.log(`Generated ${snapshot.metric} model-value report for ${date}`);
}

main();
