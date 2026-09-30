import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const context = vm.createContext({ window: {} });
for (const file of ["gpus", "models", "audio-models", "model-metadata", "api-models", "licenses"]) {
  vm.runInContext(fs.readFileSync(`data/${file}.js`, "utf8"), context);
}
const data = context.window.LLM_GPU_CHECKER_DATA;

test("M5 GPU bins have distinct official bandwidth and conservative unified budgets", () => {
  for (const [id, bandwidth, memory] of [["m5-32", 153, 32], ["m5pro-64", 307, 64], ["m5max-36", 460, 36], ["m5max-64", 614, 64], ["m5max-128", 614, 128]]) {
    const gpu = data.gpus.find((item) => item.id === id);
    assert.equal(gpu.bandwidth, bandwidth);
    assert.equal(gpu.vram, memory);
    assert.equal(gpu.gpuUsableMemoryGb, memory * 0.75);
    assert.equal(gpu.memoryType, "unified");
    assert.equal(gpu.verifiedAt, "2026-09-30");
    assert.ok(gpu.runtimes.includes("MLX"));
  }
});

test("rack accelerators use per-GPU memory and require a system quote", () => {
  for (const [id, memory, bandwidth] of [["rubin-288", 288, 22000], ["mi455x-432", 432, 23300]]) {
    const gpu = data.gpus.find((item) => item.id === id);
    assert.equal(gpu.vram, memory);
    assert.equal(gpu.bandwidth, bandwidth);
    assert.equal(gpu.requiresSystemQuote, true);
    assert.equal(gpu.enterpriseOnly, true);
    assert.equal(gpu.formFactor, "datacenter");
    assert.equal(gpu.msrpUsd, undefined);
  }
});

test("checkpoint counts include auxiliary encoders and MoE uses full weights", () => {
  const qwen = data.models.find((item) => item.name === "Qwen3.5 9B");
  assert.ok(qwen.params > 9.6);
  const liquid = data.models.find((item) => item.name === "LFM2.5 8B A1B");
  assert.ok(liquid.params > 8.4);
  assert.equal(liquid.active, 1.5);
  const nano = data.models.find((item) => item.name === "Nemotron 3 Nano 30B A3B");
  assert.ok(nano.params > 31);
  assert.equal(nano.active, 3.5);
  const asr = data.audioModels.find((item) => item.name === "Qwen3-ASR 1.7B");
  assert.ok(asr.params > 2.3);
});

test("new audio speed is explicitly unknown and S2 Pro is noncommercial", () => {
  const rows = data.audioModels.filter((item) => item.speedStatus === "unverified");
  assert.equal(rows.length, 6);
  for (const row of rows) {
    assert.equal(row.realtimeBase, 0);
    assert.ok(data.modelMetadata[row.name].sourceUrl.startsWith("https://huggingface.co/"));
    const policy = data.modelLicensePolicies[row.name] || data.licensePolicies[row.license];
    assert.ok(policy, `${row.name} must have a license policy`);
  }
  assert.equal(data.modelLicensePolicies["Fish Audio S2 Pro"].commercialUse, "noncommercial");
});

test("quality evaluation conditions remain separate and GLM uses its publisher", () => {
  const small = data.modelMetadata["Qwen3.5 0.8B"].qualityBenchmark;
  assert.equal(small.value, 42.3);
  assert.match(small.metric, /thinking/);
  const liquid = data.modelMetadata["LFM2.5 2.6B"].qualityBenchmark;
  assert.match(liquid.metric, /Liquid harness/);
  assert.equal(data.modelMetadata["GLM-5.3-Flash"].sourceUrl, "https://huggingface.co/zai-org/GLM-5.3-Flash");
});

test("API catalog is separate and contains standard rather than batch/fast prices", () => {
  const expected = {
    "openai-gpt-6-astra": [10, 1, 50],
    "openai-gpt-6.1-sol": [2, 0.1, 10],
    "openai-gpt-6-luna": [0.1, 0.01, 0.5],
    "anthropic-claude-opus-5.5": [4, 0.2, 20],
    "anthropic-claude-sonnet-5.5": [2, 0.2, 10],
    "anthropic-claude-fable-5.1": [10, 0.25, 50],
    "google-gemini-3.8-flash": [0.75, 0.075, 3.75],
    "deepseek-v4.1-flash": [0.3, 0.006, 1.2],
    "mistral-medium-3.5": [1.5, 0.15, 7.5],
    "mistral-small-4": [0.15, 0.015, 0.6],
  };
  for (const [id, prices] of Object.entries(expected)) {
    const row = data.apiModels.find((item) => item.id === id);
    assert.deepEqual([row.inputPerMTokUsd, row.cachedInputPerMTokUsd, row.outputPerMTokUsd], prices);
    assert.equal(row.verifiedAt, "2026-09-30");
    assert.equal(row.params, undefined);
    // An open-weight family can also be hosted by an API provider. The
    // pricing record must still remain separate from local sizing records.
    assert.equal(Object.hasOwn(row, "active"), false);
  }
  assert.equal(data.apiModels.length, 13);
  assert.match(data.apiModels.find((item) => item.id === "deepseek-v4.1-flash").note.en, /Peak rates/);
  assert.match(data.apiModels.find((item) => item.id === "google-gemini-3.8-flash").note.en, /2027-01-01/);
});
