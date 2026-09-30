import fs from "node:fs";

const eventPath = process.env.GITHUB_EVENT_PATH;
const event = eventPath && fs.existsSync(eventPath) ? JSON.parse(fs.readFileSync(eventPath, "utf8")) : {};
const body = event.issue?.body || process.env.BENCHMARK_REQUEST_BODY || "";
const sections = parseSections(body);
const cliJson = parseCliJson(valueFor("CLI 측정 결과 (JSON)"));
const row = cliJson || buildManualRow();
const errors = validateRow(row);
const duplicate = findDuplicate(row);
if (duplicate) errors.push("동일 GPU·모델·런타임·설정·측정값이 이미 등록되어 있습니다.");

const report = errors.length
  ? `### 벤치마크 자동 검사\n\n${errors.map((error) => `- ❌ ${error}`).join("\n")}`
  : `### 벤치마크 자동 검사\n\n- ✅ GPU·모델·실행 조건 확인 완료\n- ✅ 중복 측정 없음\n\n추가 후보:\n\n\`\`\`js\n${serialize(row)}\n\`\`\`\n\n관리자가 \`benchmark-ready\` 라벨을 붙이면 데이터 PR을 생성합니다.`;

console.log(report);
writeOutput("valid", String(errors.length === 0));
writeOutput("report", report);

if (process.argv.includes("--append") && errors.length === 0) {
  const file = "data/benchmarks.js";
  const source = fs.readFileSync(file, "utf8");
  fs.writeFileSync(file, source.replace(/\n\];\s*$/, `\n  ${serialize(row)},\n];\n`));
}

function parseSections(markdown) {
  return Object.fromEntries(
    [...String(markdown).matchAll(/### ([^\n]+)\n\n([\s\S]*?)(?=\n### |\s*$)/g)]
      .map(([, label, value]) => [label.trim(), value.trim()]),
  );
}

function valueFor(label) {
  const aliases = {
    "CLI 측정 결과 (JSON)": ["CLI measurement result (JSON)"],
    "사이트 GPU ID": ["Site GPU ID"],
    "모델": ["Model"],
    "워크로드": ["Workload"],
    "런타임": ["Runtime"],
    "운영체제·드라이버": ["OS / driver"],
    "전력 제한·노트북 TGP": ["Power limit / laptop TGP"],
    "최대 VRAM 사용량": ["Peak VRAM usage"],
    "실행 설정": ["Run settings"],
    "입력·컨텍스트 토큰": ["Input / context tokens"],
    "출력 토큰": ["Output tokens"],
    "동시 요청": ["Concurrent requests"],
    "실제 결과": ["Measured result"],
    "로그 또는 참고 자료": ["Logs or references"],
  };
  const value = [label, ...(aliases[label] || [])].map((key) => sections[key]).find((entry) => entry && entry !== "_No response_");
  return value || "";
}

function parseCliJson(value) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value.replace(/^```json\s*|\s*```$/g, ""));
    return normalizeRow(parsed);
  } catch {
    return null;
  }
}

function numberFrom(value) {
  const match = String(value || "").replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function buildManualRow() {
  const result = valueFor("실제 결과");
  const settings = valueFor("실행 설정");
  const metric = result.match(/([\d.]+)\s*(tok\/s|tokens?\/s|doc\/s|pair\/s|page\/s)/i);
  const context = settings.match(/([\d,.]+)\s*([Kk])?\s*context/i);
  return normalizeRow({
    evidenceType: "user",
    modelName: valueFor("모델"),
    gpu: valueFor("GPU"),
    gpuId: valueFor("사이트 GPU ID"),
    workload: valueFor("워크로드"),
    runtime: valueFor("런타임"),
    quantization: settings.match(/\b(?:Q\d[^,\s]*|FP\d+|BF16|INT\d+)\b/i)?.[0] || "",
    context: context ? numberFrom(context[1]) * (context[2] ? 1024 : 1) : 0,
    concurrency: numberFrom(valueFor("동시 요청")) || numberFrom(settings.match(/concurrency\s*(\d+)/i)?.[0]) || 1,
    inputTokens: numberFrom(valueFor("입력·컨텍스트 토큰")),
    outputTokens: numberFrom(valueFor("출력 토큰")),
    tokensPerSecond: metric && /tok|token/i.test(metric[2]) ? Number(metric[1]) : 0,
    docsPerSecond: metric && /doc/i.test(metric[2]) ? Number(metric[1]) : 0,
    pairsPerSecond: metric && /pair/i.test(metric[2]) ? Number(metric[1]) : 0,
    pagesPerSecond: metric && /page/i.test(metric[2]) ? Number(metric[1]) : 0,
    osDriver: valueFor("운영체제·드라이버"),
    power: valueFor("전력 제한·노트북 TGP"),
    peakVramGb: numberFrom(valueFor("최대 VRAM 사용량")),
    sourceUrl: event.issue?.html_url || "",
    note: valueFor("로그 또는 참고 자료").slice(0, 500),
  });
}

function normalizeRow(row) {
  const metricData = {
    docsPerSecond: Number(row.docsPerSecond) || 0,
    pairsPerSecond: Number(row.pairsPerSecond) || 0,
    pagesPerSecond: Number(row.pagesPerSecond) || 0,
  };
  return {
    evidenceType: row.evidenceType || "user",
    modelName: String(row.modelName || row.model || ""),
    gpu: String(row.gpu || ""),
    gpuId: String(row.gpuId || ""),
    workload: normalizeWorkload(row.workload, metricData),
    runtime: String(row.runtime || ""),
    quantization: String(row.quantization || ""),
    context: Number(row.context) || 0,
    concurrency: Number(row.concurrency) || 1,
    inputTokens: Number(row.inputTokens) || Number(row.context) || 0,
    outputTokens: Number(row.outputTokens) || 0,
    tokensPerSecond: Number(row.tokensPerSecond) || 0,
    docsPerSecond: Number(row.docsPerSecond) || 0,
    pairsPerSecond: Number(row.pairsPerSecond) || 0,
    pagesPerSecond: Number(row.pagesPerSecond) || 0,
    peakVramGb: Number(row.peakVramGb) || 0,
    osDriver: String(row.osDriver || ""),
    power: String(row.power || ""),
    sourceUrl: /^https:\/\//i.test(String(row.sourceUrl || "")) ? String(row.sourceUrl) : String(event.issue?.html_url || ""),
    note: String(row.note || ""),
    date: String(row.date || new Date().toISOString().slice(0, 10)),
  };
}

function normalizeWorkload(value, metrics = {}) {
  const label = String(value || "").toLowerCase();
  if (/embed|임베딩/.test(label) || metrics.docsPerSecond) return "embedding";
  if (/rerank|리랭커|재순위/.test(label) || metrics.pairsPerSecond) return "reranker";
  if (/ocr|document|문서|페이지/.test(label) || metrics.pagesPerSecond) return "ocr";
  if (/audio|speech|stt|tts|음성/.test(label)) return "audio";
  if (/image|video|avatar|이미지|영상|아바타/.test(label)) return "image-generation";
  if (/generative|generation|llm|text generation|생성형|텍스트 생성/.test(label) || !label) return "generative";
  return String(value);
}

function validateRow(item) {
  const errors = [];
  if (!["generative", "embedding", "reranker", "ocr"].includes(item.workload)) {
    errors.push("현재 자동 등록은 generative, embedding, reranker, ocr 워크로드를 지원합니다.");
  }
  const gpuSource = fs.readFileSync("data/gpus.js", "utf8");
  const modelSource = ["data/models.js", "data/embedding-models.js", "data/reranker-models.js", "data/ocr-models.js"]
    .map((file) => fs.readFileSync(file, "utf8")).join("\n");
  if (!item.modelName || !modelSource.includes(JSON.stringify(item.modelName))) errors.push("등록된 정확한 모델명이 필요합니다.");
  if (!item.gpuId || !gpuSource.includes(`id: "${item.gpuId}"`)) errors.push("data/gpus.js에 등록된 사이트 GPU ID가 필요합니다.");
  if (!item.runtime) errors.push("런타임이 필요합니다.");
  if (!item.tokensPerSecond && !item.docsPerSecond && !item.pairsPerSecond && !item.pagesPerSecond) errors.push("숫자 측정값과 단위가 필요합니다.");
  if (!/^https:\/\//.test(item.sourceUrl)) errors.push("재현 가능한 HTTPS 출처가 필요합니다.");
  if (item.workload === "generative" && (!item.quantization || !item.context || !item.outputTokens)) {
    errors.push("LLM 측정은 양자화·컨텍스트·출력 토큰 조건이 필요합니다.");
  }
  return errors;
}

function findDuplicate(item) {
  const source = fs.readFileSync("data/benchmarks.js", "utf8");
  const metric = item.tokensPerSecond || item.docsPerSecond || item.pairsPerSecond || item.pagesPerSecond;
  return source.includes(`modelName: ${JSON.stringify(item.modelName)}`)
    && source.includes(`gpuId: ${JSON.stringify(item.gpuId)}`)
    && source.includes(String(metric));
}

function serialize(item) {
  const clean = Object.fromEntries(Object.entries(item).filter(([, value]) => value !== "" && value !== 0));
  return JSON.stringify(clean).replace(/"([^"]+)":/g, "$1:");
}

function writeOutput(name, value) {
  if (!process.env.GITHUB_OUTPUT) return;
  const delimiter = `BENCHMARK_${name.toUpperCase()}`;
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}<<${delimiter}\n${value}\n${delimiter}\n`);
}
