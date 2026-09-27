#!/usr/bin/env node

globalThis.window = globalThis;
await import("../data/gpus.js");
await import("../features/evidence-policy.js");

const data = globalThis.LLM_GPU_CHECKER_DATA || {};
const evidence = globalThis.AIHardwareEvidence;
const priority = evidence.PRIORITY_GPU_IDS;
const byId = new Map((data.gpus || []).map((gpu) => [gpu.id, gpu]));
const officialHosts = /(^|\.)(nvidia|amd|intel|apple)\.com$/i;
const failures = [];

for (const id of priority) {
  const gpu = byId.get(id);
  if (!gpu) {
    failures.push(`${id}: priority GPU is missing`);
    continue;
  }
  let url;
  try { url = new URL(gpu.sourceUrl); } catch { failures.push(`${id}: valid sourceUrl is required`); continue; }
  if (url.protocol !== "https:" || !officialHosts.test(url.hostname)) failures.push(`${id}: manufacturer HTTPS source required`);
  if (!gpu.verifiedAt) failures.push(`${id}: verifiedAt is required`);
  if (!(Number(gpu.vram || gpu.gpuUsableMemoryGb) > 0)) failures.push(`${id}: memory is missing`);
  if (!(Number(gpu.bandwidth) > 0)) failures.push(`${id}: bandwidth is missing`);
}

const remoteMode = process.argv.includes("--remote");
if (remoteMode) {
  const uniqueUrls = [...new Set(priority.map((id) => byId.get(id)?.sourceUrl).filter(Boolean))];
  const results = await Promise.all(uniqueUrls.map(async (url) => {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        headers: { "user-agent": "ai-hardware-fit-data-audit/7.5" },
        signal: AbortSignal.timeout(25000),
      });
      return { url, ok: response.ok, status: response.status };
    } catch (error) {
      return { url, ok: false, status: error.name || "network-error" };
    }
  }));
  results.filter((result) => !result.ok).forEach((result) => failures.push(`${result.url}: remote status ${result.status}`));
  console.log(JSON.stringify({ checkedAt: new Date().toISOString(), urls: results }, null, 2));
}

if (failures.length) {
  failures.forEach((failure) => console.error(failure));
  process.exit(1);
}
if (remoteMode) console.error(`official source audit passed for ${priority.length} priority GPUs`);
else console.log(`official source audit passed for ${priority.length} priority GPUs`);
