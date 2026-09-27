import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import vm from "node:vm";

const outputDir = "_site";
const excluded = new Set([".git", ".github", "node_modules", "_site", "work", "outputs",
  "tests", "scripts", "package.json", "package-lock.json", "lighthouserc.cjs", ".gitignore"]);
const baseUrl = (process.env.SITE_URL || "https://jaeseok614.github.io/ai-hardware-fit").replace(/\/$/, "");
let version = process.env.GITHUB_SHA?.slice(0, 12) || "";

if (!version) {
  try {
    version = execFileSync("git", ["rev-parse", "--short=12", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    version = String(Date.now());
  }
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for (const entry of fs.readdirSync(".")) {
  if (excluded.has(entry)) continue;
  fs.cpSync(entry, path.join(outputDir, entry), { recursive: true });
}

const spotlightSource = path.join("docs", "spotlights");
if (fs.existsSync(spotlightSource)) {
  fs.cpSync(spotlightSource, path.join(outputDir, "spotlights"), { recursive: true });
}

const indexPath = path.join(outputDir, "index.html");
const index = fs.readFileSync(indexPath, "utf8").replaceAll("__CACHE_VERSION__", version);
fs.writeFileSync(indexPath, index);

if (index.includes("__CACHE_VERSION__")) throw new Error("cache version placeholder was not fully replaced");

const context = { window: {} };
vm.createContext(context);
for (const file of [
  "data/gpus.js",
  "data/models.js",
  "data/embedding-models.js",
  "data/reranker-models.js",
  "data/ocr-models.js",
  "data/audio-models.js",
  "data/model-capabilities.js",
]) {
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
}

const data = context.window.LLM_GPU_CHECKER_DATA;
const workloadMeta = {
  generative: ["생성형 LLM", "Generative LLM", "generative"],
  embedding: ["임베딩", "Embedding", "embedding"],
  reranker: ["리랭커", "Reranker", "reranker"],
  ocrPipeline: ["OCR", "OCR", "ocr-pipeline"],
  documentVlm: ["문서 VLM", "Document VLM", "document-vlm"],
  generalVlm: ["범용 VLM", "General VLM", "general-vlm"],
  imageGeneration: ["이미지 생성", "Image generation", "image-generation"],
  videoGeneration: ["비디오 생성", "Video generation", "video-generation"],
  avatarGeneration: ["아바타·립싱크", "Avatar / lip sync", "avatar-generation"],
  audioStt: ["음성 인식", "Speech recognition", "audio-stt"],
  audioTts: ["음성 합성", "Speech synthesis", "audio-tts"],
};

const modelGroups = [
  ["generative", "generative", data.models || []],
  ["embedding", "embedding", data.embeddingModels || []],
  ["reranker", "reranker", data.rerankerModels || []],
  ["ocrPipeline", "ocr-pipeline", (data.ocrModels || []).filter((model) => model.type === "ocr-pipeline")],
  ["documentVlm", "document-vlm", (data.ocrModels || []).filter((model) => ["ocr-vlm", "document-vlm"].includes(model.type))],
  ["generalVlm", "general-vlm", (data.ocrModels || []).filter((model) => model.type === "general-vlm")],
  ["imageGeneration", "image-generation", (data.ocrModels || []).filter((model) => model.type === "image-generation")],
  ["videoGeneration", "video-generation", (data.ocrModels || []).filter((model) => model.type === "video-generation")],
  ["avatarGeneration", "avatar-generation", (data.ocrModels || []).filter((model) => model.type === "avatar-generation")],
  ["audioStt", "audio-stt", (data.audioModels || []).filter((model) => model.type === "audio-stt")],
  ["audioTts", "audio-tts", (data.audioModels || []).filter((model) => model.type === "audio-tts")],
];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugify(value) {
  return String(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "item";
}

function appModelKey(model, type) {
  const slug = String(model.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return type !== "generative" ? `${model.type || type}-${slug}` : slug;
}

function pageTemplate({ title, description, canonical, alternate, eyebrow, facts, body, appUrl, sourceUrl = "", schemaType = "WebPage", lang = "ko" }) {
  const en = lang === "en";
  const schema = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: title,
    description,
    url: canonical,
    isPartOf: { "@type": "WebSite", name: "AI Hardware Fit", url: `${baseUrl}/` },
  };
  return `<!doctype html>
<html lang="${lang}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} — AI Hardware Fit</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${escapeHtml(canonical)}">
${alternate ? `<link rel="alternate" hreflang="${en ? "ko" : "en"}" href="${escapeHtml(alternate)}">` : ""}
<link rel="alternate" hreflang="${lang}" href="${escapeHtml(canonical)}">
<meta property="og:type" content="website"><meta property="og:title" content="${escapeHtml(title)} — AI Hardware Fit">
<meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:image" content="https://raw.githubusercontent.com/jaeseok614/ai-hardware-fit/main/docs/social-preview.png">
<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>
<style>
:root{color-scheme:light dark;font-family:system-ui,-apple-system,"Noto Sans KR",sans-serif}*{box-sizing:border-box}body{margin:0;background:#f4f7f9;color:#17212a}main{width:min(860px,calc(100% - 32px));margin:48px auto;padding:32px;border:1px solid #ccd6dd;border-radius:16px;background:#fff;box-shadow:0 16px 45px #17212a12}.eyebrow{color:#12658c;font-size:13px;font-weight:800}h1{margin:8px 0 12px;font-size:clamp(26px,5vw,42px)}p{line-height:1.7;color:#52616d}.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:24px 0}.fact{padding:14px;border-radius:10px;background:#edf4f7}.fact span{display:block;color:#60717c;font-size:12px}.fact strong{display:block;margin-top:5px;overflow-wrap:anywhere}.actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:26px}.actions a{display:inline-flex;min-height:44px;align-items:center;padding:0 16px;border:1px solid #176f99;border-radius:9px;color:#0b5f87;font-weight:800;text-decoration:none}.actions a.primary{background:#176f99;color:#fff}nav a{color:#176f99}@media(prefers-color-scheme:dark){body{background:#11171b;color:#edf4f7}main{background:#192126;border-color:#34434c}.fact{background:#232e35}p,.fact span{color:#aebbc3}}
</style></head><body><main>
<nav><a href="${baseUrl}/">AI Hardware Fit</a></nav>
<div class="eyebrow">${escapeHtml(eyebrow)}</div><h1>${escapeHtml(title)}</h1>
<p>${escapeHtml(description)}</p>
<div class="facts">${facts.map(([label, value]) => `<div class="fact"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}</div>
${body}
<div class="actions"><a class="primary" href="${escapeHtml(appUrl)}">${en ? "Open in calculator" : "계산기에서 바로 확인"}</a>${sourceUrl ? `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">${en ? "Official / registered source" : "공식·등록 출처"}</a>` : ""}<a href="https://github.com/jaeseok614/ai-hardware-fit">GitHub</a></div>
</main></body></html>`;
}

function writePage(relativePath, html) {
  const directory = path.join(outputDir, relativePath);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, "index.html"), html);
}

const sitemapUrls = [`${baseUrl}/`];
const gpuPageRows = [];
for (const gpu of data.gpus || []) {
  const slug = slugify(gpu.id || gpu.name);
  const canonical = `${baseUrl}/gpu/${slug}/`;
  sitemapUrls.push(canonical);
  gpuPageRows.push({ gpu, slug });
  const description = `${gpu.name}의 VRAM ${gpu.gpuUsableMemoryGb || gpu.vram}GB, 메모리 대역폭 ${gpu.bandwidth}GB/s와 실행 가능한 AI 모델을 확인합니다.`;
  writePage(path.join("gpu", slug), pageTemplate({
    title: gpu.name,
    description,
    canonical,
    alternate: `${baseUrl}/en/gpu/${slug}/`,
    eyebrow: "GPU PROFILE · GPU 상세",
    facts: [
      ["GPU 메모리", `${gpu.gpuUsableMemoryGb || gpu.vram} GB`],
      ["대역폭", `${gpu.bandwidth} GB/s`],
      ["아키텍처", gpu.architecture || "확인 필요"],
      ["형태", gpu.formFactor || "확인 필요"],
      ["런타임", (gpu.runtimes || []).join(" · ") || "확인 필요"],
      ["사양 상태", gpu.specStatus || "검증 필요"],
    ],
    body: "<p>실제 성능은 모델, 정밀도, 컨텍스트, 런타임과 전력 제한에 따라 달라집니다. 계산기에서 조건을 선택해 범위와 근거를 확인하세요.</p>",
    appUrl: `${baseUrl}/?gpu=${encodeURIComponent(gpu.id)}&lang=ko`,
    sourceUrl: gpu.sourceUrl,
  }));
}

const usedModelSlugs = new Map();
const modelPageRows = [];
for (const [workload, fallbackType, models] of modelGroups) {
  for (const model of models) {
    const baseSlug = slugify(model.name);
    const seen = usedModelSlugs.get(baseSlug) || 0;
    usedModelSlugs.set(baseSlug, seen + 1);
    const slug = seen ? `${baseSlug}-${slugify(model.type || fallbackType)}` : baseSlug;
    const canonical = `${baseUrl}/model/${slug}/`;
    sitemapUrls.push(canonical);
    const type = model.type || fallbackType;
    const capabilities = data.modelCapabilities?.[`${type}:${model.name}`] || {};
    const summary = typeof model.summary === "object" ? model.summary.ko || model.summary.en : model.summary;
    const description = summary || `${model.name}의 GPU 메모리 요구량과 실행 가능 하드웨어를 확인합니다.`;
    const useCases = (capabilities.useCases || []).map((id) => data.useCaseDefinitions?.[id]?.ko || id);
    modelPageRows.push({ workload, fallbackType, model, slug, type, capabilities });
    writePage(path.join("model", slug), pageTemplate({
      title: model.name,
      description,
      canonical,
      alternate: `${baseUrl}/en/model/${slug}/`,
      eyebrow: `${workloadMeta[workload][0]} · MODEL PROFILE`,
      facts: [
        ["제공자", model.maker || model.provider || "확인 필요"],
        ["파라미터", model.params ? `${model.params}B` : "확인 필요"],
        ["라이선스", model.license || "확인 필요"],
        ["주요 용도", useCases.slice(0, 6).join(" · ") || "확인 필요"],
        ["입력", (capabilities.inputModality || []).join(" · ")],
        ["출력", (capabilities.outputModality || []).join(" · ")],
      ],
      body: "<p>표시된 VRAM과 속도는 계산 추정입니다. 실제 환경에서는 드라이버, 런타임, 입력 길이와 배치 조건을 포함한 PoC 검증이 필요합니다.</p>",
      appUrl: `${baseUrl}/?mode=${encodeURIComponent(workload)}&ui=expert&model=${encodeURIComponent(appModelKey(model, fallbackType))}&lang=ko`,
      sourceUrl: model.sourceUrl,
    }));
  }
}

for (const [workload, [ko, en]] of Object.entries(workloadMeta)) {
  const canonical = `${baseUrl}/workload/${slugify(workload)}/`;
  sitemapUrls.push(canonical);
  const models = modelGroups.find(([id]) => id === workload)?.[2] || [];
  writePage(path.join("workload", slugify(workload)), pageTemplate({
    title: `${ko} GPU 추천`,
    description: `${ko} 모델 ${models.length}종을 GPU 메모리, 속도, 품질, 라이선스와 용도 기준으로 비교합니다.`,
    canonical,
    alternate: `${baseUrl}/en/workload/${slugify(workload)}/`,
    eyebrow: `${en.toUpperCase()} · WORKLOAD`,
    facts: [["등록 모델", `${models.length}개`], ["지원 언어", "한국어 · English"], ["결과", "실행 가능 모델 3개 · 전체 탐색"]],
    body: `<p>${escapeHtml(ko)} 용도에 맞는 모델을 선택하고 GPU별 실행 가능 여부와 예상 범위를 확인하세요.</p>`,
    appUrl: `${baseUrl}/?mode=${encodeURIComponent(workload)}&lang=ko`,
  }));
}

for (const { gpu, slug } of gpuPageRows) {
  const canonical = `${baseUrl}/en/gpu/${slug}/`;
  const alternate = `${baseUrl}/gpu/${slug}/`;
  sitemapUrls.push(canonical);
  writePage(path.join("en", "gpu", slug), pageTemplate({
    lang: "en",
    title: gpu.name,
    description: `Check ${gpu.name} VRAM (${gpu.gpuUsableMemoryGb || gpu.vram} GB), ${gpu.bandwidth} GB/s memory bandwidth, and runnable AI models.`,
    canonical,
    alternate,
    eyebrow: "GPU PROFILE",
    facts: [
      ["GPU memory", `${gpu.gpuUsableMemoryGb || gpu.vram} GB`],
      ["Bandwidth", `${gpu.bandwidth} GB/s`],
      ["Architecture", gpu.architecture || "Needs review"],
      ["Form factor", gpu.formFactor || "Needs review"],
      ["Runtime", (gpu.runtimes || []).join(" · ") || "Needs review"],
      ["Specification status", gpu.specStatus || "Needs validation"],
    ],
    body: "<p>Actual performance depends on the model, precision, context, runtime, and power limit. Open the calculator to review the estimate range and evidence.</p>",
    appUrl: `${baseUrl}/?gpu=${encodeURIComponent(gpu.id)}&lang=en`,
    sourceUrl: gpu.sourceUrl,
  }));
}

for (const { workload, fallbackType, model, slug, type, capabilities } of modelPageRows) {
  const canonical = `${baseUrl}/en/model/${slug}/`;
  const alternate = `${baseUrl}/model/${slug}/`;
  sitemapUrls.push(canonical);
  const summary = typeof model.summary === "object" ? model.summary.en || model.summary.ko : model.summary;
  const useCases = (capabilities.useCases || []).map((id) => data.useCaseDefinitions?.[id]?.en || id);
  writePage(path.join("en", "model", slug), pageTemplate({
    lang: "en",
    title: model.name,
    description: summary || `Check estimated GPU memory requirements and compatible hardware for ${model.name}.`,
    canonical,
    alternate,
    eyebrow: `${workloadMeta[workload][1].toUpperCase()} · MODEL PROFILE`,
    facts: [
      ["Provider", model.maker || model.provider || "Needs review"],
      ["Parameters", model.params ? `${model.params}B` : "Needs review"],
      ["License", model.license || "Needs review"],
      ["Primary use cases", useCases.slice(0, 6).join(" · ") || "Needs review"],
      ["Input", (capabilities.inputModality || []).join(" · ")],
      ["Output", (capabilities.outputModality || []).join(" · ")],
    ],
    body: "<p>VRAM and speed figures are calculated estimates. Validate the exact driver, runtime, input length, and batch settings in a representative PoC.</p>",
    appUrl: `${baseUrl}/?mode=${encodeURIComponent(workload)}&ui=expert&model=${encodeURIComponent(appModelKey(model, fallbackType))}&lang=en`,
    sourceUrl: model.sourceUrl,
  }));
}

for (const [workload, [ko, en]] of Object.entries(workloadMeta)) {
  const canonical = `${baseUrl}/en/workload/${slugify(workload)}/`;
  const alternate = `${baseUrl}/workload/${slugify(workload)}/`;
  sitemapUrls.push(canonical);
  const models = modelGroups.find(([id]) => id === workload)?.[2] || [];
  writePage(path.join("en", "workload", slugify(workload)), pageTemplate({
    lang: "en",
    title: `${en} GPU recommendations`,
    description: `Compare ${models.length} ${en} models by GPU memory, speed, quality, license, and intended use.`,
    canonical,
    alternate,
    eyebrow: `${en.toUpperCase()} · WORKLOAD`,
    facts: [["Registered models", `${models.length}`], ["Languages", "Korean · English"], ["Results", "3 quick picks · full catalog"]],
    body: `<p>Choose a model for ${escapeHtml(en)} and review estimated compatibility and performance ranges across GPUs.</p>`,
    appUrl: `${baseUrl}/?mode=${encodeURIComponent(workload)}&lang=en`,
  }));
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((url) => `  <url><loc>${escapeHtml(url)}</loc></url>`).join("\n")}
</urlset>`;
fs.writeFileSync(path.join(outputDir, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(outputDir, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`);

console.log(`built ${outputDir} with cache version ${version}, ${data.gpus.length} GPU pages, ${usedModelSlugs.size} model slugs, and ${Object.keys(workloadMeta).length} workload pages`);
