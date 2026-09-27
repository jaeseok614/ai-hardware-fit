import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import zlib from "node:zlib";

const SITE_URL = "https://jaeseok614.github.io/ai-hardware-fit";
const ROOT = "docs/spotlights";
const ROTATION = [
  "rtx3060-12",
  "rtx4060ti-16",
  "rtx5070ti-16",
  "rtx4090-24",
  "rtx5090-32",
  "rx7900xtx-24",
  "m4max-128",
  "ryzen-ai-max-plus-395-128",
];

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync("data/gpus.js", "utf8"), context, { filename: "data/gpus.js" });
const gpus = context.window.LLM_GPU_CHECKER_DATA.gpus;

function main() {
const today = process.env.SPOTLIGHT_DATE || new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) throw new Error("SPOTLIGHT_DATE must be YYYY-MM-DD");
const weekNumber = Math.floor(Date.parse(`${today}T00:00:00Z`) / 604800000);
const gpuId = process.env.SPOTLIGHT_GPU || ROTATION[((weekNumber % ROTATION.length) + ROTATION.length) % ROTATION.length];
const gpu = gpus.find((item) => item.id === gpuId);
if (!gpu) throw new Error(`Unknown spotlight GPU: ${gpuId}`);

const safeName = gpu.name.replace(/\s*통합메모리/g, " unified memory");
const koUrl = `${SITE_URL}/?lang=ko&gpu=${encodeURIComponent(gpu.id)}`;
const enUrl = `${SITE_URL}/?lang=en&gpu=${encodeURIComponent(gpu.id)}`;
const slug = `${today}-${gpu.id}`;
const postPath = path.join(ROOT, "posts", `${slug}.md`);
const cardPath = path.join(ROOT, "cards", `${slug}.png`);

fs.mkdirSync(path.dirname(postPath), { recursive: true });
fs.mkdirSync(path.dirname(cardPath), { recursive: true });

const post = `# ${today} GPU Spotlight — ${gpu.name}

![${gpu.name} share card](../cards/${slug}.png)

## 한국어 게시 문안

이번 주 GPU는 **${gpu.name}**입니다.

VRAM ${gpu.vram}GB, 메모리 대역폭 ${gpu.bandwidth}GB/s 기준으로 어떤 AI 모델이 들어가고 어떤 양자화가 적절한지, 예상 속도와 실행 명령어까지 한 번에 확인해 보세요.

${koUrl}

> 속도는 계획용 범위입니다. 결과 화면에서 동일 조건 실측, 실측 보정, 관련 실측, 외부 참고, 계산 추정을 구분해 표시합니다.

## English post copy

This week's GPU is **${safeName}**.

Can my GPU run this? Check which AI models fit ${gpu.vram} GB of memory, the recommended quantization, expected speed range, and a ready-to-run command.

${enUrl}

> Speed is a planning range, not a guarantee. Each result identifies exact measurements, calibrated estimates, related evidence, external references, or formula-only estimates.

## Source facts

- Memory: ${gpu.vram} GB
- Memory bandwidth: ${gpu.bandwidth} GB/s
- Hardware source: ${gpu.sourceUrl || "See the project data source list"}
- Calculator: ${enUrl}
`;

fs.writeFileSync(postPath, post);
renderCard(cardPath, gpu);
fs.copyFileSync(cardPath, path.join(ROOT, "latest.png"));

const latest = `# GPU of the week: ${gpu.name}

![${gpu.name} share card](./latest.png)

Published ${today}. [Open the Korean result](${koUrl}) · [Open the English result](${enUrl}) · [Copy the Korean/English post text](./posts/${slug}.md)

The card rotates automatically every Monday at 09:00 KST. Figures are planning estimates; the result page identifies the evidence level behind each speed range.
`;
fs.writeFileSync(path.join(ROOT, "latest.md"), latest);

const posts = fs.readdirSync(path.join(ROOT, "posts"))
  .filter((name) => name.endsWith(".md"))
  .sort()
  .reverse();
const archive = `# Weekly GPU spotlight archive

Every Monday, this directory receives a share card plus ready-to-post Korean and English copy.

${posts.map((name) => `- [${name.replace(/\.md$/, "")}](./posts/${name})`).join("\n")}
`;
fs.writeFileSync(path.join(ROOT, "README.md"), archive);
fs.writeFileSync(path.join(ROOT, "index.html"), renderHtml(gpu, today, slug, koUrl, enUrl));

console.log(`Generated weekly spotlight for ${gpu.name}: ${postPath}`);
}

function renderHtml(item, date, itemSlug, koLink, enLink) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GPU of the week: ${escapeHtml(item.name)} — AI Hardware Fit</title><meta name="description" content="Can my GPU run this? Weekly ${escapeHtml(item.name)} fit check."><meta property="og:title" content="Can my GPU run this? ${escapeHtml(item.name)}"><meta property="og:description" content="${item.vram} GB memory · ${item.bandwidth} GB/s bandwidth · model fit, quantization, speed range, and run command."><meta property="og:image" content="${SITE_URL}/spotlights/latest.png"><style>body{margin:0;background:#071f2d;color:#eef8fb;font:16px/1.6 system-ui,sans-serif}.wrap{max-width:960px;margin:auto;padding:48px 24px 80px}img{width:100%;height:auto;border:1px solid #47616d}h1{font-size:clamp(2rem,5vw,4rem);line-height:1.05}a{color:#83d8bd}.actions{display:flex;gap:12px;flex-wrap:wrap}.actions a{background:#0f766e;color:white;padding:12px 18px;text-decoration:none;border-radius:8px}.note{color:#bed2dc}</style></head><body><main class="wrap"><p>AI HARDWARE FIT · ${date}</p><h1>Can my GPU run this?<br>${escapeHtml(item.name)}</h1><img src="./latest.png" alt="${escapeHtml(item.name)} share card"><p>${item.vram} GB memory · ${item.bandwidth} GB/s memory bandwidth</p><div class="actions"><a href="${koLink}">한국어 결과</a><a href="${enLink}">English result</a><a href="./posts/${itemSlug}.md">Post copy</a></div><p class="note">Speed is a planning range. Open the result to see whether it is measured, calibrated, referenced, or calculated.</p></main></body></html>`;
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderCard(outputPath, item) {
  const width = 1200;
  const height = 630;
  const pixels = Buffer.alloc((width * 3 + 1) * height);
  const ink = [238, 248, 251];
  const muted = [184, 207, 218];
  const mint = [131, 216, 189];
  const panel = [15, 54, 72];

  const setPixel = (x, y, color) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const offset = y * (width * 3 + 1) + 1 + x * 3;
    pixels[offset] = color[0]; pixels[offset + 1] = color[1]; pixels[offset + 2] = color[2];
  };
  const rect = (x, y, w, h, color) => {
    for (let yy = y; yy < y + h; yy += 1) for (let xx = x; xx < x + w; xx += 1) setPixel(xx, yy, color);
  };
  const text = (x, y, value, scale, color) => {
    let cursor = x;
    for (const char of value.toUpperCase()) {
      if (char === " ") { cursor += 4 * scale; continue; }
      const glyph = FONT[char] || FONT["?"];
      for (let row = 0; row < glyph.length; row += 1) for (let col = 0; col < glyph[row].length; col += 1) if (glyph[row][col] === "1") rect(cursor + col * scale, y + row * scale, scale, scale, color);
      cursor += 6 * scale;
    }
  };

  rect(0, 0, width, height, [7, 31, 45]);
  rect(0, 0, 18, height, mint);
  text(70, 58, "AI HARDWARE FIT / GPU OF THE WEEK", 3, mint);
  text(70, 128, "CAN MY GPU RUN THIS?", 5, ink);
  rect(70, 218, 1060, 2, [68, 97, 110]);
  const cardName = safeCardName(item.name);
  text(70, 266, cardName, cardName.length > 26 ? 3 : 4, ink);
  rect(70, 355, 1060, 128, panel);
  text(102, 383, `${item.vram} GB MEMORY`, 3, mint);
  text(102, 431, `${item.bandwidth} GB/S BANDWIDTH`, 3, ink);
  text(650, 383, "3 MODEL PICKS", 3, mint);
  text(650, 431, "QUANT / SPEED / COMMAND", 2, ink);
  text(70, 526, "MEASURED / REFERENCED / CALCULATED", 2, muted);
  text(70, 568, "JAESEOK614.GITHUB.IO/AI-HARDWARE-FIT", 2, ink);

  const chunks = [chunk("IHDR", Buffer.concat([u32(width), u32(height), Buffer.from([8, 2, 0, 0, 0])])), chunk("IDAT", zlib.deflateSync(pixels)), chunk("IEND", Buffer.alloc(0))];
  fs.writeFileSync(outputPath, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), ...chunks]));
}

function safeCardName(value) {
  return value.normalize("NFKD").replace(/[^a-zA-Z0-9 +\-/]/g, "").replace(/\s+/g, " ").trim() || "GPU SPOTLIGHT";
}

function chunk(type, data) {
  const name = Buffer.from(type);
  return Buffer.concat([u32(data.length), name, data, u32(crc32(Buffer.concat([name, data])))]);
}

function u32(value) {
  const buffer = Buffer.alloc(4); buffer.writeUInt32BE(value >>> 0); return buffer;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) { crc ^= byte; for (let i = 0; i < 8; i += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); }
  return (crc ^ 0xffffffff) >>> 0;
}

const FONT = {
  A:["01110","10001","10001","11111","10001","10001","10001"],B:["11110","10001","10001","11110","10001","10001","11110"],C:["01111","10000","10000","10000","10000","10000","01111"],D:["11110","10001","10001","10001","10001","10001","11110"],E:["11111","10000","10000","11110","10000","10000","11111"],F:["11111","10000","10000","11110","10000","10000","10000"],G:["01111","10000","10000","10111","10001","10001","01111"],H:["10001","10001","10001","11111","10001","10001","10001"],I:["11111","00100","00100","00100","00100","00100","11111"],J:["00111","00010","00010","00010","10010","10010","01100"],K:["10001","10010","10100","11000","10100","10010","10001"],L:["10000","10000","10000","10000","10000","10000","11111"],M:["10001","11011","10101","10101","10001","10001","10001"],N:["10001","11001","10101","10011","10001","10001","10001"],O:["01110","10001","10001","10001","10001","10001","01110"],P:["11110","10001","10001","11110","10000","10000","10000"],Q:["01110","10001","10001","10001","10101","10010","01101"],R:["11110","10001","10001","11110","10100","10010","10001"],S:["01111","10000","10000","01110","00001","00001","11110"],T:["11111","00100","00100","00100","00100","00100","00100"],U:["10001","10001","10001","10001","10001","10001","01110"],V:["10001","10001","10001","10001","10001","01010","00100"],W:["10001","10001","10001","10101","10101","10101","01010"],X:["10001","10001","01010","00100","01010","10001","10001"],Y:["10001","10001","01010","00100","00100","00100","00100"],Z:["11111","00001","00010","00100","01000","10000","11111"],
  0:["01110","10001","10011","10101","11001","10001","01110"],1:["00100","01100","00100","00100","00100","00100","01110"],2:["01110","10001","00001","00010","00100","01000","11111"],3:["11110","00001","00001","01110","00001","00001","11110"],4:["00010","00110","01010","10010","11111","00010","00010"],5:["11111","10000","10000","11110","00001","00001","11110"],6:["01110","10000","10000","11110","10001","10001","01110"],7:["11111","00001","00010","00100","01000","01000","01000"],8:["01110","10001","10001","01110","10001","10001","01110"],9:["01110","10001","10001","01111","00001","00001","01110"],
  ".":["00000","00000","00000","00000","00000","01100","01100"],"-":["00000","00000","00000","11111","00000","00000","00000"],"/":["00001","00001","00010","00100","01000","10000","10000"],"+":["00000","00100","00100","11111","00100","00100","00000"],"?":["01110","10001","00001","00010","00100","00000","00100"],
};

main();
