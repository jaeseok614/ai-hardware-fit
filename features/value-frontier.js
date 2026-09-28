(() => {
const BUDGETS_GB = [8, 12, 16, 24, 32, 48, 80, 128];
const MAX_VRAM_GB = 128;
const BASELINE = { quantId: "q4", quantLabel: "Q4_K_M" };
let selectedMetric = "";

function metricName(row) {
  return String(row.qualityMetricName || "").trim();
}

function metricDisplay(metric, en) {
  if (!en) return metric;
  return String(metric)
    .replace(/Base 모델/g, "base model")
    .replace(/Open LLM Leaderboard 연동/g, "Open LLM Leaderboard")
    .replace(/평균/g, "average");
}

function estimateVram(model) {
  const quant = QUANTS.find((item) => item.id === BASELINE.quantId);
  if (!quant || !model?.params || !model?.active) return null;
  const weightsGb = model.params * quant.bytesPerB * 1.08;
  const kvGb = model.active * 0.09;
  const runtimeOverheadGb = 1.2 + Math.min(3, weightsGb * 0.06);
  return weightsGb + kvGb + runtimeOverheadGb;
}

function compute(entries) {
  const sorted = [...entries].sort((a, b) => a.requiredGb - b.requiredGb || b.score - a.score || a.name.localeCompare(b.name));
  let bestScore = -Infinity;
  return sorted.map((entry) => {
    const onFrontier = entry.score > bestScore;
    if (onFrontier) bestScore = entry.score;
    return { ...entry, onFrontier };
  });
}

function entriesFor(rows, metric) {
  return compute(rows
    .filter((row) => row.model?.type === "generative")
    .filter((row) => metricName(row) === metric)
    .map((row) => ({
      name: row.modelName,
      model: row.model,
      score: row.qualityValue,
      requiredGb: estimateVram(row.model),
      releaseDate: row.releaseDate || "",
      sourceUrl: row.sourceUrl || "",
    }))
    .filter((entry) => Number.isFinite(entry.score) && Number.isFinite(entry.requiredGb) && entry.requiredGb <= MAX_VRAM_GB));
}

function familiesFor(rows) {
  const counts = new Map();
  rows
    .filter((row) => row.model?.type === "generative" && Number.isFinite(row.qualityValue))
    .forEach((row) => {
      const metric = metricName(row);
      if (metric) counts.set(metric, (counts.get(metric) || 0) + 1);
    });
  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function render(rows) {
  const chart = $("valueFrontierChart");
  const budget = $("valueFrontierBudget");
  const select = $("valueFrontierMetric");
  const footer = $("valueFrontierFooter");
  if (!chart || !budget || !select || !footer) return;
  const en = uiLanguage === "en";
  const families = familiesFor(rows);
  if (!families.length) {
    chart.innerHTML = `<div class="empty-state">${en ? "At least two models with the same published benchmark are needed." : "같은 공개 벤치마크가 있는 모델이 두 개 이상 필요합니다."}</div>`;
    budget.innerHTML = "";
    select.innerHTML = "";
    footer.innerHTML = "";
    return;
  }

  if (!families.some(([metric]) => metric === selectedMetric)) {
    selectedMetric = families.find(([metric]) => metric === "MMLU-Pro")?.[0] || families[0][0];
  }
  select.innerHTML = families.map(([metric, count]) => `<option value="${escapeAttr(metric)}">${escapeHtml(metricDisplay(metric, en))} (${count})</option>`).join("");
  select.value = selectedMetric;
  select.onchange = (event) => {
    selectedMetric = event.target.value;
    render(rows);
  };

  const title = $("valueFrontierTitle");
  const description = $("valueFrontierDescription");
  const method = $("valueFrontierMethod");
  if (title) title.textContent = en ? "Best local model for your VRAM" : "내 VRAM에서 가장 성능 좋은 로컬 모델";
  if (description) description.textContent = en
    ? "Compare estimated Q4_K_M VRAM and quality only within the same published benchmark."
    : "같은 공개 벤치마크끼리만 Q4_K_M 예상 VRAM과 성능을 비교합니다.";
  if (method) method.textContent = en
    ? "Baseline: Q4_K_M · 4K context · 1 concurrent request · llama.cpp. Scores are source-reported; check each source for evaluation details."
    : "기준: Q4_K_M · 4K context · 동시 요청 1 · llama.cpp. 점수는 각 모델 제작자가 공개한 값이며, 시험 세부 조건은 출처에서 확인하세요.";
  const filterLabel = select.closest("label")?.querySelector("span");
  if (filterLabel) filterLabel.textContent = en ? "Benchmark" : "비교 지표";

  const entries = entriesFor(rows, selectedMetric);
  const displayMetric = metricDisplay(selectedMetric, en);
  renderChart(chart, entries, displayMetric, en);
  renderBudget(budget, entries, displayMetric, en);
  footer.innerHTML = `
    <span>${en ? "Frontier = no lower-VRAM model in this group has an equal or higher score." : "프런티어 = 같은 그룹에서 더 적은 VRAM으로 같거나 높은 점수를 내는 모델이 없는 경우입니다."}</span>
    <a href="./model-value/" target="_blank" rel="noreferrer">${en ? "Weekly model-value changes ↗" : "주간 모델·VRAM 변경 요약 ↗"}</a>
  `;
}

function renderChart(target, entries, metric, en) {
  if (!entries.length) {
    target.innerHTML = `<div class="empty-state">${en ? "No chartable models for this benchmark." : "이 지표로 그릴 수 있는 모델이 없습니다."}</div>`;
    return;
  }
  const width = 760;
  const height = 370;
  const margin = { top: 28, right: 34, bottom: 52, left: 58 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const maxRequired = Math.max(...entries.map((entry) => entry.requiredGb), 8);
  const maxX = Math.ceil(maxRequired / 8) * 8;
  const minScore = Math.min(...entries.map((entry) => entry.score));
  const maxScore = Math.max(...entries.map((entry) => entry.score));
  const scorePadding = Math.max(2, (maxScore - minScore) * 0.12);
  const minY = Math.max(0, minScore - scorePadding);
  const maxY = maxScore + scorePadding;
  const x = (value) => margin.left + (value / maxX) * plotWidth;
  const y = (value) => margin.top + ((maxY - value) / Math.max(1, maxY - minY)) * plotHeight;
  const available = Math.max(0, getHardware().availableVram || 0);
  const selectedX = Math.min(maxX, available);
  const frontier = entries.filter((entry) => entry.onFrontier);
  const line = frontier.map((entry) => `${x(entry.requiredGb).toFixed(1)},${y(entry.score).toFixed(1)}`).join(" ");
  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => Math.round(maxX * ratio));
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => minY + (maxY - minY) * ratio);

  target.innerHTML = `<svg viewBox="0 0 ${width} ${height}" aria-hidden="true" focusable="false">
    ${xTicks.map((tick) => `<line class="frontier-grid" x1="${x(tick)}" y1="${margin.top}" x2="${x(tick)}" y2="${height - margin.bottom}"></line><text class="frontier-axis-label" x="${x(tick)}" y="${height - 23}" text-anchor="middle">${tick}GB</text>`).join("")}
    ${yTicks.map((tick) => `<line class="frontier-grid" x1="${margin.left}" y1="${y(tick)}" x2="${width - margin.right}" y2="${y(tick)}"></line><text class="frontier-axis-label" x="${margin.left - 9}" y="${y(tick) + 4}" text-anchor="end">${tick.toFixed(tick < 10 ? 1 : 0)}</text>`).join("")}
    ${available > 0 ? `<line class="frontier-gpu-line" x1="${x(selectedX)}" y1="${margin.top}" x2="${x(selectedX)}" y2="${height - margin.bottom}"></line><text class="frontier-gpu-label" x="${Math.min(width - 120, x(selectedX) + 5)}" y="${margin.top + 13}">${escapeHtml(en ? `Your GPU ${available.toFixed(1)}GB` : `내 GPU ${available.toFixed(1)}GB`)}</text>` : ""}
    ${frontier.length > 1 ? `<polyline class="frontier-line" points="${line}"></polyline>` : ""}
    ${entries.map((entry) => `<a href="${escapeAttr(entry.sourceUrl || "#")}" ${entry.sourceUrl ? "target=\"_blank\" rel=\"noreferrer\"" : ""}><circle class="frontier-point ${entry.onFrontier ? "is-frontier" : "is-dominated"}" cx="${x(entry.requiredGb)}" cy="${y(entry.score)}" r="${entry.onFrontier ? 6 : 4}"><title>${escapeHtml(`${entry.name} · ${entry.requiredGb.toFixed(1)}GB · ${metric} ${entry.score}`)}</title></circle></a>`).join("")}
    ${frontier.map((entry, index) => `<text class="frontier-model-label" x="${Math.min(width - 145, x(entry.requiredGb) + 8)}" y="${y(entry.score) + (index % 2 ? 16 : -8)}">${escapeHtml(entry.name.length > 24 ? `${entry.name.slice(0, 22)}…` : entry.name)}</text>`).join("")}
    <text class="frontier-axis-title" x="${margin.left + plotWidth / 2}" y="${height - 3}" text-anchor="middle">${en ? "Estimated VRAM required" : "예상 필요 VRAM"}</text>
    <text class="frontier-axis-title" transform="translate(15 ${margin.top + plotHeight / 2}) rotate(-90)" text-anchor="middle">${escapeHtml(metric)}</text>
  </svg>`;
  const list = entries.map((entry) => `${entry.name}: ${entry.requiredGb.toFixed(1)} GB, ${metric} ${entry.score}${entry.onFrontier ? (en ? ", on frontier" : ", 프런티어") : ""}`).join("; ");
  target.setAttribute("aria-label", en ? `${metric} VRAM frontier. ${list}` : `${metric} VRAM 프런티어. ${list}`);
}

function renderBudget(target, entries, metric, en) {
  const rows = BUDGETS_GB.map((vram) => {
    const candidates = entries.filter((entry) => entry.requiredGb <= vram).sort((a, b) => b.score - a.score || b.releaseDate.localeCompare(a.releaseDate));
    return { vram, best: candidates[0], runnerUp: candidates[1] };
  });
  target.innerHTML = `<h4>${en ? "Best score by VRAM" : "VRAM별 최고 점수"}</h4><p>${escapeHtml(metric)} · ${BASELINE.quantLabel}</p>
    <div class="value-frontier-budget-table" role="table" aria-label="${escapeAttr(en ? "Best local model by VRAM" : "VRAM별 추천 로컬 모델")}">
      <div class="value-frontier-budget-row is-head" role="row"><span role="columnheader">VRAM</span><span role="columnheader">${en ? "Best fit" : "1순위"}</span><span role="columnheader">${en ? "Runner-up" : "2순위"}</span></div>
      ${rows.map(({ vram, best, runnerUp }) => `<div class="value-frontier-budget-row" role="row"><strong role="cell">${vram}GB</strong><span role="cell">${best ? `${escapeHtml(best.name)} <small>${best.score} · ${best.requiredGb.toFixed(1)}GB</small>` : "—"}</span><span role="cell">${runnerUp ? `${escapeHtml(runnerUp.name)} <small>${runnerUp.score}</small>` : "—"}</span></div>`).join("")}
    </div>`;
}

window.AIHardwareValueFrontier = { render, compute };
})();
