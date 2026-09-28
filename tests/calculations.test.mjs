// Core calculation regression tests. Uses jsdom to load the app exactly the
// way a browser would (single <script> globals, no bundler), then calls the
// app's own functions directly. Run with `npm test` or `node --test tests/`.
//
// jsdom is a devDependency (`npm install`) — it is not shipped to the
// browser build, only used here for testing.

import { test, describe, before, after, afterEach } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), "utf8");

const DATA_FILES = [
  "data/gpus.js",
  "data/quantizations.js",
  "data/precision-profiles.js",
  "data/models.js",
  "data/embedding-models.js",
  "data/reranker-models.js",
  "data/ocr-models.js",
  "data/audio-models.js",
  "data/model-metadata.js",
  "data/model-capabilities.js",
  "data/benchmarks.js",
  "data/licenses.js",
  "data/decision-data.js",
  "data/coupang-affiliate-links.js",
  "data/cloud-gpu-pricing.js",
  "features/quick-recommendation.js",
  "features/community-feedback.js",
  "features/privacy-analytics.js",
  "features/workspace-controller.js",
  "features/guided-experience.js",
  "features/decision-guidance.js",
  "features/catalog-requests.js",
  "features/catalog-search.js",
  "features/evidence-policy.js",
  "features/pricing-policy.js",
  "features/infrastructure-sizing.js",
  "features/locale-context.js",
  "features/data-trust.js",
  "features/runtime-localization.js",
  "features/promotion-kit.js",
];

// Loads the app into a fresh jsdom window and returns that window. Each
// call gets an independent global scope so tests can't leak state into
// each other through top-level `let`/`const` bindings in app.js.
// Names app.js declares with `const` at the top level. A single window.eval()
// call keeps these as live lexical bindings, but a *separate*, later
// window.eval() call cannot see them (only function declarations and `var`
// attach to the global object and survive across eval calls). So after the
// initial load we copy everything tests need onto `window` explicitly.
const BRIDGED_NAMES = [
  "$", "GENERATIVE_MODELS", "EMBEDDING_MODELS", "RERANKER_MODELS", "OCR_MODELS", "AUDIO_MODELS", "AVATAR_GENERATION_MODELS",
  "QUANTS", "KV_PRECISION_META", "GPU_PRESETS", "ENCODER_PRECISIONS", "OCR_PRECISIONS",
  "BENCHMARKS", "PRIMARY_GPU_STORAGE_KEY", "KOREAN_GPU_MARKET", "SYSTEM_PART_CATALOG",
  "GPU_PHYSICAL_REFERENCE", "studioState",
];

const openTestWindows = new Set();
const persistentTestWindows = new Set();

function loadApp(url = "https://example.com/?gpu=rtx4090-24", storage = {}, { persistent = false, platformV2 = false } = {}) {
  const dom = new JSDOM(read("index.html"), { url, runScripts: "outside-only" });
  const { window } = dom;
  openTestWindows.add(window);
  if (persistent) persistentTestWindows.add(window);
  Object.entries(storage).forEach(([key, value]) => window.localStorage.setItem(key, value));
  // jsdom's navigator.language defaults to "en-US". The app now auto-detects the UI
  // language from the browser on a first visit (no ?lang=, no saved preference) --
  // pin the simulated browser to Korean so these tests keep exercising the app's
  // existing Korean-default assumptions unless a test explicitly overrides language
  // via the storage/url params (e.g. ?lang=en, which still wins over detection).
  Object.defineProperty(window.navigator, "language", { value: "ko-KR", configurable: true });
  Object.defineProperty(window.navigator, "languages", { value: ["ko-KR", "ko"], configurable: true });
  let combined = DATA_FILES.map(read).join("\n;\n");
  combined += "\n;\n" + read("features/i18n-catalog.js");
  combined += "\n;\n" + read("features/estimation-engine.js");
  combined += "\n;\n" + read("features/hf-import.js");
  combined += "\n;\n" + read("app.js");
  combined += "\n;\n" + read("features/i18n-runtime.js");
  combined += "\n;\n" + read("features/affiliate-links.js");
  combined += "\n;\n" + read("features/gpu-advisor.js");
  combined += "\n;\n" + read("features/model-placement.js");
  combined += "\n;\n" + read("features/value-frontier.js");
  combined += "\n;\n" + read("features/benchmark-workspace.js");
  if (platformV2) combined += "\n;\n" + read("platform-v2.js") + "\n;\n" + read("platform-v3.js");
  combined += "\n;\ninit();\n";
  if (platformV2) combined += "\n;\ninitPlatformV2();\ninitDecisionStudio();\n";
  combined += BRIDGED_NAMES.map((name) => `window.${name} = typeof ${name} === "undefined" ? undefined : ${name};`).join("\n");
  window.eval(combined);
  return window;
}

afterEach(() => {
  [...openTestWindows].forEach((window) => {
    if (persistentTestWindows.has(window)) return;
    window.close();
    openTestWindows.delete(window);
  });
});

after(() => {
  openTestWindows.forEach((window) => window.close());
  openTestWindows.clear();
  persistentTestWindows.clear();
});

let win;

before(() => {
  win = loadApp("https://example.com/?gpu=rtx4090-24", {}, { persistent: true });
});

describe("weights: dense vs MoE (active vs total params)", () => {
  test("KV cache scales with active params, not total params", () => {
    const dense = win.eval(`GENERATIVE_MODELS.find((m) => m.params === m.active && m.params > 3 && m.params < 40)`);
    const moe = win.eval(`GENERATIVE_MODELS.find((m) => m.active < m.params * 0.5 && m.params > 20)`);
    assert.ok(dense, "expected at least one dense model in the catalog");
    assert.ok(moe, "expected at least one MoE model in the catalog");

    const hardware = win.eval(`({ ...getHardware(), context: 8192, concurrency: 1, kvMeta: KV_PRECISION_META.fp16 })`);
    win.denseModel = dense;
    win.moeModel = moe;
    win.testHardware = hardware;

    const denseKv = win.eval("estimateKvCacheGb(denseModel, testHardware)");
    const moeKv = win.eval("estimateKvCacheGb(moeModel, testHardware)");

    // KV cache should track active params: a MoE model with far fewer active
    // params than a similarly-sized dense model must report smaller KV cache
    // per token, even though its total (loaded) weight is comparable or larger.
    const denseActiveRatio = denseKv / dense.active;
    const moeActiveRatio = moeKv / moe.active;
    assert.ok(
      Math.abs(denseActiveRatio - moeActiveRatio) < 0.01,
      `KV cache should be proportional to active params for both dense and MoE (dense ratio ${denseActiveRatio}, moe ratio ${moeActiveRatio})`,
    );
  });

  test("weight footprint scales with total params (quant bytes * params * 1.08)", () => {
    const model = win.eval(`GENERATIVE_MODELS.find((m) => m.params > 5)`);
    const quant = win.eval(`QUANTS.find((q) => q.id === "fp16")`);
    const hardware = win.eval(`({ ...getHardware(), concurrency: 1 })`);
    win.wModel = model;
    win.wQuant = quant;
    win.wHardware = hardware;
    const estimate = win.eval("estimateWithQuant(wModel, wQuant, wHardware)");
    const expectedWeightsGb = model.params * quant.bytesPerB * 1.08;
    assert.ok(
      estimate.requiredGb >= expectedWeightsGb,
      `required VRAM (${estimate.requiredGb}) should be at least the raw weight footprint (${expectedWeightsGb})`,
    );
  });
});

describe("auto quantization selection", () => {
  test("recommends a smaller quant on a tighter VRAM budget than on a roomy one", () => {
    const model = win.eval(`GENERATIVE_MODELS.find((m) => m.params > 20 && m.params < 40)`);
    win.qModel = model;
    const tight = win.eval(`(() => { const h = { ...getHardware(), vram: 10, totalVram: 10, baseEffectiveVram: 10, availableVram: 9, count: 1, primaryCount: 1 }; return recommendQuant(qModel, h); })()`);
    const roomy = win.eval(`(() => { const h = { ...getHardware(), vram: 80, totalVram: 80, baseEffectiveVram: 80, availableVram: 78, count: 1, primaryCount: 1 }; return recommendQuant(qModel, h); })()`);
    assert.ok(tight, "expected a recommendation even under a tight budget");
    assert.ok(roomy, "expected a recommendation under a roomy budget");
    const quantOrder = win.eval("QUANTS.map((q) => q.id)");
    const tightIndex = quantOrder.indexOf(tight.id);
    const roomyIndex = quantOrder.indexOf(roomy.id);
    assert.ok(
      tightIndex >= roomyIndex,
      `tighter budget (${tight.id}) should not recommend a larger quant than the roomy budget (${roomy.id})`,
    );
  });
});

describe("fit grading / offload threshold", () => {
  test("grade boundaries follow the documented pressure thresholds", () => {
    assert.equal(win.eval("gradeFromPressure(0.5, 10, 0)"), "S");
    assert.equal(win.eval("gradeFromPressure(0.8, 10, 0)"), "A");
    assert.equal(win.eval("gradeFromPressure(0.95, 10, 0)"), "B");
    assert.equal(win.eval("gradeFromPressure(1.10, 10, 0)"), "C");
    assert.equal(win.eval("gradeFromPressure(1.10, 10, 0)"), "C");
  });

  test("beyond grade C, RAM offload room determines D vs F", () => {
    const withRoom = win.eval("gradeFromPressure(1.5, 10, 20)");
    const withoutRoom = win.eval("gradeFromPressure(1.5, 10, 0)");
    assert.equal(withRoom, "D");
    assert.equal(withoutRoom, "F");
  });
});

describe("heterogeneous GPU sharding loss", () => {
  test("identical multi-GPU pooling applies a smaller loss than mixed-vendor pooling", () => {
    const identical = win.eval(`(() => {
      $("gpuPreset").value = "rtx4090-24";
      $("gpuCount").value = "2";
      $("secondaryGpuPreset").value = "none";
      return getHardware().shardingEfficiency;
    })()`);
    const heterogeneous = win.eval(`(() => {
      $("gpuPreset").value = "rtx4090-24";
      $("gpuCount").value = "1";
      $("secondaryGpuPreset").value = "rtx3090-24";
      $("secondaryGpuCount").value = "1";
      return getHardware().shardingEfficiency;
    })()`);
    assert.equal(identical, 0.92);
    assert.equal(heterogeneous, 0.88);
    assert.ok(heterogeneous < identical, "mixed-GPU pooling should be penalized more than same-GPU pooling");

    // reset shared window state for later tests
    win.eval(`$("gpuCount").value = "1"; $("secondaryGpuPreset").value = "none";`);
  });
});

describe("embedding batch memory", () => {
  test("required VRAM increases with batch size", () => {
    const model = win.eval("EMBEDDING_MODELS[0]");
    win.eModel = model;
    const hardware = win.eval("getHardware()");
    win.eHardware = hardware;
    const small = win.eval(`estimateEncoderModel(eModel, eHardware, { inputTokens: 256, batchSize: 4, maxBatchTokens: 16384, runtime: "tei" }, "auto")`);
    const large = win.eval(`estimateEncoderModel(eModel, eHardware, { inputTokens: 256, batchSize: 64, maxBatchTokens: 16384, runtime: "tei" }, "auto")`);
    assert.ok(large.requiredGb > small.requiredGb, `batch 64 (${large.requiredGb}GB) should need more VRAM than batch 4 (${small.requiredGb}GB)`);
  });
});

describe("reranker candidate latency", () => {
  test("more candidates require more rerank passes and higher query latency", () => {
    const model = win.eval("RERANKER_MODELS[0]");
    win.rModel = model;
    const hardware = win.eval(`(() => {
      $("gpuPreset").value = "h100-sxm-80";
      applyPreset("h100-sxm-80");
      return getHardware();
    })()`);
    win.rHardware = hardware;
    const few = win.eval(`estimateRerankerModel(rModel, rHardware, {
      queryTokens: 64,
      docTokens: 512,
      candidates: 16,
      batchSize: 8,
      precisionId: "fp16",
      runtime: "tei",
    })`);
    const many = win.eval(`estimateRerankerModel(rModel, rHardware, {
      queryTokens: 64,
      docTokens: 512,
      candidates: 80,
      batchSize: 8,
      precisionId: "fp16",
      runtime: "tei",
    })`);

    assert.ok(many.rerankPasses > few.rerankPasses);
    assert.ok(
      many.latencySeconds > few.latencySeconds,
      `80 candidates (${many.latencySeconds}s) should take longer than 16 (${few.latencySeconds}s)`,
    );
  });
});

describe("OCR resolution scaling", () => {
  test("required VRAM increases with image resolution", () => {
    const model = win.eval("OCR_MODELS.find((m) => m.type === 'ocr-pipeline')");
    win.oModel = model;
    const hardware = win.eval("getHardware()");
    win.oHardware = hardware;
    const small = win.eval(`estimateOcrModel(oModel, oHardware, { width: 800, height: 600, batchSize: 1, featureSet: "basic" }, "auto")`);
    const large = win.eval(`estimateOcrModel(oModel, oHardware, { width: 2480, height: 3508, batchSize: 1, featureSet: "basic" }, "auto")`);
    assert.ok(large.requiredGb > small.requiredGb, `A4 300DPI (${large.requiredGb}GB) should need more VRAM than a small thumbnail (${small.requiredGb}GB)`);
  });
});

describe("mode, filtering, and sorting UI", () => {
  test("switches modes and applies search and speed sorting", () => {
    const fresh = loadApp();
    const simpleTab = fresh.document.querySelector('[data-app-mode="simple"]');
    const expertTab = fresh.document.querySelector('[data-app-mode="expert"]');

    simpleTab.dispatchEvent(new fresh.MouseEvent("click", { bubbles: true }));
    assert.equal(fresh.document.getElementById("simpleModePanel").hidden, false);
    assert.equal(fresh.document.getElementById("expertModeSection").hidden, true);

    expertTab.dispatchEvent(new fresh.MouseEvent("click", { bubbles: true }));
    assert.equal(fresh.document.getElementById("simpleModePanel").hidden, true);
    assert.equal(fresh.document.getElementById("expertModeSection").hidden, false);
    assert.equal(expertTab.getAttribute("aria-selected"), "true");
    assert.match(fresh.document.getElementById("appModeStatus").textContent, /전체 모델 탐색/);
    assert.ok(fresh.document.querySelectorAll("#modelResults .model-row, #modelResults .model-card").length > 0, "full catalog should render model rows");

    const search = fresh.document.getElementById("searchInput");
    search.value = "Qwen";
    search.dispatchEvent(new fresh.Event("input", { bubbles: true }));
    const visibleNames = [...fresh.document.querySelectorAll(".model-name-cell strong")].map((node) => node.textContent);
    assert.ok(visibleNames.length > 0, "expected at least one filtered Qwen result");
    assert.ok(visibleNames.every((name) => name.toLowerCase().includes("qwen")));

    search.value = "";
    const sort = fresh.document.getElementById("sortBy");
    sort.value = "speed";
    sort.dispatchEvent(new fresh.Event("change", { bubbles: true }));
    const speeds = fresh.eval("getFilteredEstimates().slice(0, 12).map((estimate) => estimate.speed)");
    assert.deepEqual([...speeds], [...speeds].sort((a, b) => b - a));
  });
});

describe("first-visit GPU onboarding", () => {
  test("starts in quick recommendation mode without inventing a GPU", () => {
    const fresh = loadApp("https://example.com/");

    assert.equal(fresh.document.getElementById("gpuPreset").value, "");
    assert.equal(fresh.document.getElementById("hardwareHeadline").textContent, "GPU를 선택해 주세요");
    assert.equal(fresh.document.getElementById("settingsDrawer").hidden, true);
    assert.equal(fresh.document.getElementById("simpleModePanel").hidden, false);
    assert.equal(fresh.document.getElementById("expertModeSection").hidden, true);
    assert.equal(fresh.document.getElementById("calculationBasisStrip").hidden, true);
    assert.equal(fresh.document.querySelectorAll(".simple-pick-card").length, 0);
    assert.match(fresh.document.getElementById("simpleModeResult").textContent, /내 GPU를 선택하면 추천을 시작합니다/);
  });

  test("remembers a fixed GPU as an explicit shortcut without bypassing the chooser", () => {
    const fresh = loadApp("https://example.com/");
    const select = fresh.document.getElementById("gpuPreset");
    select.value = "rtx3060-12";
    select.dispatchEvent(new fresh.Event("change", { bubbles: true }));

    const storageKey = fresh.PRIMARY_GPU_STORAGE_KEY;
    assert.equal(fresh.localStorage.getItem(storageKey), "rtx3060-12");
    assert.ok(fresh.document.querySelectorAll(".simple-pick-card").length > 0);

    const restored = loadApp("https://example.com/", {
      [storageKey]: "rtx3060-12",
    });
    assert.equal(restored.document.getElementById("gpuPreset").value, "");
    assert.equal(restored.document.getElementById("onboardingScreen").hidden, false);
    const recent = restored.document.querySelector("[data-quick-gpu]");
    assert.equal(recent.dataset.quickGpu, "rtx3060-12");
    assert.match(recent.textContent, /최근 선택/);
    recent.click();
    assert.equal(restored.document.getElementById("gpuPreset").value, "rtx3060-12");
    assert.match(restored.document.getElementById("simpleModeGpuReadout").textContent, /RTX 3060/);
  });

  test("URL GPU overrides the remembered GPU without replacing the preference", () => {
    const storageKey = "ai-hardware-fit-primary-gpu-v1";
    const fresh = loadApp("https://example.com/?gpu=h100-sxm-80", {
      [storageKey]: "rtx3060-12",
    });

    assert.equal(fresh.document.getElementById("gpuPreset").value, "h100-sxm-80");
    assert.equal(fresh.localStorage.getItem(storageKey), "rtx3060-12");
  });

  test("custom GPU input is usable for the session but is not persisted", () => {
    const storageKey = "ai-hardware-fit-primary-gpu-v1";
    const fresh = loadApp("https://example.com/", {
      [storageKey]: "rtx3060-12",
    });
    const select = fresh.document.getElementById("gpuPreset");
    select.value = "custom";
    select.dispatchEvent(new fresh.Event("change", { bubbles: true }));

    assert.equal(fresh.localStorage.getItem(storageKey), null);
    assert.equal(fresh.document.getElementById("settingsDrawer").hidden, false);
    assert.equal(fresh.document.getElementById("gpuPresetSearch").hidden, false);
  });

  test("hides the GPU picker behind a Change GPU toggle and collapses it after a real pick", () => {
    const fresh = loadApp("https://example.com/?gpu=rtx4090-24");
    const panel = fresh.document.getElementById("gpuChangePanel");
    const button = fresh.document.getElementById("changeGpuButton");
    assert.equal(panel.hidden, true);
    assert.equal(button.getAttribute("aria-expanded"), "false");
    assert.equal(button.textContent, "GPU 변경");

    button.dispatchEvent(new fresh.MouseEvent("click", { bubbles: true }));
    assert.equal(panel.hidden, false);
    assert.equal(button.getAttribute("aria-expanded"), "true");
    assert.equal(button.textContent, "GPU 변경 닫기");

    const select = fresh.document.getElementById("gpuPreset");
    select.value = "rtx3060-12";
    select.dispatchEvent(new fresh.Event("change", { bubbles: true }));
    assert.equal(panel.hidden, true);
    assert.equal(button.getAttribute("aria-expanded"), "false");
    assert.equal(fresh.document.getElementById("hardwareHeadline").textContent.includes("3060"), true);
  });

  test("keeps hardware settings compact and moves placement out of advanced tools", () => {
    const fresh = loadApp();
    fresh.document.getElementById("settingsToggle")
      .dispatchEvent(new fresh.MouseEvent("click", { bubbles: true }));

    const drawer = fresh.document.getElementById("settingsDrawer");
    const groupTitles = [...drawer.querySelectorAll(".settings-cluster h3")]
      .map((title) => title.childNodes[0].textContent.trim());
    assert.equal(drawer.hidden, false);
    assert.deepEqual(groupTitles, ["기본 하드웨어", "보조 GPU", "메모리 보정"]);
    assert.equal(drawer.querySelectorAll(".advanced-tools-inline > details").length, 1);
    assert.equal(fresh.document.getElementById("gpuPlacementPanel").closest("#settingsDrawer"), null);
    assert.equal(fresh.document.querySelector('[data-workload-settings="generative"]').hidden, false);
    assert.equal(fresh.document.getElementById("vramGb").value, "24");
  });

  test("opens the placement planner directly with a simple starter screen", () => {
    const fresh = loadApp("https://example.com/?mode=placement");
    assert.equal(fresh.document.getElementById("onboardingScreen").hidden, true);
    assert.equal(fresh.document.getElementById("hardwarePanel").hidden, false);
    assert.equal(fresh.document.getElementById("gpuPlacementPanel").hidden, false);
    assert.equal(fresh.document.getElementById("placementWelcome").hidden, false);
    assert.equal(
      fresh.document.querySelector("#placementGuide > summary")?.textContent.trim(),
      "사용 가이드",
    );
    assert.match(
      fresh.document.querySelector(".placement-guide-popover")?.textContent || "",
      /파이프라인.*독립 서비스.*순차 실행/s,
    );
    assert.equal(fresh.document.getElementById("placementBuilder").hidden, true);
    assert.equal(fresh.document.getElementById("resultsPanel").hidden, true);
    assert.equal(new URLSearchParams(fresh.location.search).get("mode"), "placement");

    fresh.document.querySelector("[data-placement-starter='rag']")
      .dispatchEvent(new fresh.MouseEvent("click", { bubbles: true }));
    assert.equal(fresh.document.getElementById("placementWelcome").hidden, true);
    assert.equal(fresh.document.getElementById("placementBuilder").hidden, false);
    assert.equal(fresh.document.querySelectorAll(".placement-stepper li").length, 4);
    assert.equal(fresh.document.querySelectorAll(".placement-model-config").length, 3);
    assert.ok(fresh.document.querySelector(".placement-model-gate"), "full model catalog should stay gated before search/category browse");
    assert.equal(fresh.document.getElementById("placementResultStage").hidden, true);
  });
});

describe("quick recommendation navigation", () => {
  test("opens a recommendation detail and exposes an explicit full-catalog action", () => {
    const fresh = loadApp();
    const card = fresh.document.querySelector(".simple-pick-card");
    assert.ok(card, "expected a quick recommendation card");
    assert.match(card.querySelector(".simple-pick-cta").textContent, /상세 계산 보기/);
    assert.equal(card.querySelector(".simple-pick-cta").tagName, "BUTTON");
    assert.equal(card.querySelector(".simple-pick-copy").tagName, "BUTTON");
    assert.equal(fresh.document.querySelector(".mobile-decision-summary"), null);
    assert.equal(fresh.document.getElementById("hardwareCapabilityDetails").hidden, false);
    assert.equal(fresh.document.getElementById("hardwareCapabilityDetails").open, false);
    assert.equal(fresh.document.getElementById("benchmarkSheet").hidden, true);
    assert.equal(fresh.document.getElementById("valueFrontier").closest("#resultsPanel")?.id, "resultsPanel");
    assert.ok(fresh.document.getElementById("valueFrontierChart").querySelector("svg"), "the selected-GPU result should include the VRAM-quality chart");
    assert.equal(fresh.document.getElementById("gpuDetailSummary").hidden, true);
    assert.equal(fresh.document.getElementById("gpuCompareBuilder").hidden, true);
    assert.ok(fresh.document.querySelector("[data-share-toggle]"));
    assert.ok(fresh.document.querySelector("[data-share-link]"));
    assert.ok(fresh.document.querySelector("[data-download-share-card]"));
    assert.equal(fresh.document.querySelector("[data-share-3060]"), null, "RTX 3060 static share link was dropped from the Share menu");

    const languageToggle = fresh.document.querySelector("[data-language-toggle]");
    const englishButton = languageToggle.querySelector("[data-lang='en']");
    englishButton.dispatchEvent(new fresh.MouseEvent("click", { bubbles: true }));
    assert.equal(fresh.document.documentElement.lang, "en");
    assert.equal(englishButton.classList.contains("active"), true);
    assert.equal(fresh.document.querySelector("[data-theme-toggle]").getAttribute("aria-label"), "Theme");
    assert.equal(fresh.document.getElementById("workspaceJourney").getAttribute("aria-label"), "Current task progress");
    assert.doesNotMatch(fresh.document.getElementById("gpuSourceLinks").textContent, /스펙|출처/);
    languageToggle.querySelector("[data-lang='ko']")
      .dispatchEvent(new fresh.MouseEvent("click", { bubbles: true }));
    assert.equal(fresh.document.documentElement.lang, "ko");
    assert.equal(fresh.document.querySelector("[data-theme-toggle]").getAttribute("aria-label"), "테마 선택");
    assert.equal(fresh.document.getElementById("workspaceJourney").getAttribute("aria-label"), "현재 작업 진행 단계");

    const liveCard = fresh.document.querySelector(".simple-pick-card");
    const cardOrderBefore = [...fresh.document.querySelectorAll(".simple-pick-card-toggle")]
      .map((button) => button.dataset.modelKey);
    liveCard.querySelector(".simple-pick-card-toggle")
      .dispatchEvent(new fresh.MouseEvent("click", { bubbles: true }));
    assert.equal(fresh.document.getElementById("modelDetail").hidden, true, "quick-recommend clicks must not open the expert-mode drawer");
    const inspector = fresh.document.getElementById("simpleRecommendationPanel");
    assert.equal(inspector.hidden, false, "expected the compact recommendation inspector to open");
    assert.ok(fresh.document.querySelector(".simple-pick-card.is-selected"));
    assert.equal(fresh.document.querySelector(".simple-pick-card.is-expanded"), null, "cards must never span/reflow the grid");
    assert.ok(inspector.querySelector("[data-share-model-link]"));
    assert.ok(inspector.querySelector("[data-download-simple-card]"));
    assert.ok(inspector.querySelector("[data-open-full-simple-detail]"));

    const secondCard = fresh.document.querySelectorAll(".simple-pick-card-toggle")[1];
    secondCard.dispatchEvent(new fresh.MouseEvent("click", { bubbles: true }));
    const cardOrderAfter = [...fresh.document.querySelectorAll(".simple-pick-card-toggle")]
      .map((button) => button.dataset.modelKey);
    assert.deepEqual(cardOrderAfter, cardOrderBefore, "opening rank 2 must not reorder ranks 1 and 3");
    assert.equal(fresh.document.querySelector(".simple-pick-card.is-selected .simple-pick-card-toggle").dataset.modelKey, cardOrderBefore[1]);

    const purpose = fresh.document.getElementById("simplePurpose");
    const priority = fresh.document.getElementById("simplePriority");
    purpose.value = "coding";
    priority.value = "quality";
    purpose.dispatchEvent(new fresh.Event("change", { bubbles: true }));
    const params = new URLSearchParams(fresh.location.search);
    assert.equal(params.get("purpose"), "coding");
    assert.equal(params.get("priority"), "quality");

    fresh.document.getElementById("simpleOpenExpert")
      .dispatchEvent(new fresh.MouseEvent("click", { bubbles: true }));
    assert.equal(fresh.document.getElementById("simpleModePanel").hidden, true);
    assert.equal(fresh.document.getElementById("expertModeSection").hidden, false);
    assert.equal(fresh.document.getElementById("calculationBasisStrip").hidden, false);
    assert.equal(fresh.document.getElementById("benchmarkSheet").hidden, false);
    assert.equal(new URLSearchParams(fresh.location.search).get("ui"), "expert");
  });

  test("restores an explicit UI mode and treats a model-only link as expert mode", () => {
    const explicit = loadApp("https://example.com/?gpu=rtx4090-24&ui=expert");
    assert.equal(explicit.document.getElementById("simpleModePanel").hidden, true);
    assert.equal(explicit.document.getElementById("expertModeSection").hidden, false);

    const key = win.eval("modelKey(GENERATIVE_MODELS[0])");
    const linked = loadApp(`https://example.com/?gpu=rtx4090-24&model=${encodeURIComponent(key)}`);
    assert.equal(linked.document.getElementById("simpleModePanel").hidden, true);
    assert.equal(linked.document.getElementById("expertModeSection").hidden, false);
    assert.equal(linked.document.getElementById("modelDetail").hidden, false);

    linked.document.querySelector("[data-add-detail-to-placement]")
      .dispatchEvent(new linked.MouseEvent("click", { bubbles: true }));
    assert.equal(linked.document.getElementById("gpuPlacementPanel").hidden, false);
    assert.equal(linked.document.getElementById("placementBuilder").hidden, false);
    assert.equal(linked.document.querySelectorAll(".placement-model-config").length, 1);
    assert.equal(new URLSearchParams(linked.location.search).get("mode"), "placement");
  });
});

describe("multi-GPU placement optimizer", () => {
  let fresh;

  before(() => {
    fresh = loadApp("https://example.com/?gpu=rtx4090-24", {}, { persistent: true });
  });

  test("rebalances the reported 3B/1.7B/0.6B two-GPU scenario", () => {
    fresh.testScenarioKeys = fresh.eval(`
      [
        "Llama 3.2 3B Instruct",
        "Qwen2.5 3B Instruct",
        "SmolLM2 1.7B Instruct",
        "Qwen3 1.7B",
        "Qwen3 0.6B",
      ].map((name) => modelKey(GENERATIVE_MODELS.find((model) => model.name === name))).filter(Boolean)
    `);
    fresh.testRows = [
      { id: "scenario-gpu-1", presetId: "rtx4090-24", count: 1 },
      { id: "scenario-gpu-2", presetId: "rtx4090-24", count: 1 },
    ];
    const placement = fresh.eval("computeGpuPlacement(testRows, testScenarioKeys, 'balanced', '')");
    const free = placement.gpus.map((gpu) => gpu.remaining);
    assert.equal(placement.unplaced.length, 0);
    assert.ok(Math.max(...free) - Math.min(...free) < 4, `expected balanced free VRAM, got ${free.join(" / ")}`);
    assert.ok(placement.stats.serviceFloor >= 1, "balanced mode must avoid a zero-concurrency recommendation when a safe alternative exists");
  });

  test("honors user headroom, explores alternatives, and can pin a model", () => {
    fresh.testKeys = fresh.eval(`
      GENERATIVE_MODELS
        .filter((model) => model.params >= 1 && model.params <= 4)
        .slice(0, 5)
        .map(modelKey)
    `);
    assert.equal(fresh.testKeys.length, 5);
    fresh.testRows = [
      { id: "test-gpu-1", presetId: "rtx4090-24", count: 1 },
      { id: "test-gpu-2", presetId: "rtx4090-24", count: 1 },
    ];
    const placement = fresh.eval("computeGpuPlacement(testRows, testKeys, 'balanced', '')");
    assert.equal(placement.gpus.length, 2);
    assert.equal(Math.round(placement.gpus[0].physicalCapacityGb), 24);
    assert.equal(Math.round(placement.gpus[0].reservedHeadroomGb * 10) / 10, 3.6);
    assert.ok(["exact", "approximate"].includes(placement.searchMeta.mode));
    assert.ok(placement.searchMeta.exploredStates > 0);
    assert.ok(placement.gpus.some((gpu) => gpu.placements.length), "expected at least one placed model");

    fresh.firstPlacementKey = fresh.testKeys[0];
    const pinned = fresh.eval(`
      getPlacementModelConfig(firstPlacementKey).pinnedGpu = "1";
      computeGpuPlacement(testRows, testKeys, "balanced", "")
    `);
    const actualPinnedGpu = pinned.gpus.findIndex((gpu) => gpu.placements.some((item) => item.model.name === fresh.eval("getModelByKey(firstPlacementKey).name")));
    assert.equal(actualPinnedGpu, 1);
  });

  test("renders four optimization strategies and model-level controls", () => {
    const strategyKeys = [...fresh.document.querySelectorAll("[data-placement-strategy]")]
      .map((button) => button.dataset.placementStrategy);
    assert.deepEqual(strategyKeys, ["balanced", "compact", "throughput", "primary"]);
    assert.equal(fresh.document.getElementById("placementMinHeadroom").value, "15");
    assert.equal(fresh.document.getElementById("placementAllowQuantChange").checked, true);

    fresh.document.querySelector("[data-open-placement-browser]")
      .dispatchEvent(new fresh.MouseEvent("click", { bubbles: true }));
    const firstCheckbox = fresh.document.querySelector("#placementModelList [data-model-key]");
    fresh.controlModelKey = firstCheckbox.dataset.modelKey;
    fresh.eval("togglePlacementModel(controlModelKey)");
    assert.ok(fresh.document.querySelector(".placement-model-config"));
    assert.ok(fresh.document.querySelector("[data-placement-config-field='pinnedGpu']"));
    assert.ok(fresh.document.querySelector("[data-placement-config-field='requestShare']"));
    assert.ok(fresh.document.querySelector("[data-placement-config-field='minConcurrency']"));
  });

  test("locks a preferred precision and only creates replicas in independent mode", () => {
    fresh.singleKey = fresh.eval(`modelKey(GENERATIVE_MODELS.find((model) => model.name === "Qwen3 0.6B"))`);
    fresh.testRows = [
      { id: "replica-gpu-1", presetId: "rtx4090-24", count: 1 },
      { id: "replica-gpu-2", presetId: "rtx4090-24", count: 1 },
    ];
    fresh.eval(`getPlacementModelConfig(singleKey).preferredSetting = "fp16"`);
    const quantToggle = fresh.document.getElementById("placementAllowQuantChange");
    quantToggle.checked = false;
    quantToggle.dispatchEvent(new fresh.Event("change", { bubbles: true }));
    const locked = fresh.eval("computeGpuPlacement(testRows, [singleKey], 'balanced', '')");
    const lockedItems = locked.gpus.flatMap((gpu) => gpu.placements);
    assert.ok(lockedItems.length > 0);
    assert.ok(lockedItems.every((item) => item.setting.id === "fp16"));

    quantToggle.checked = true;
    quantToggle.dispatchEvent(new fresh.Event("change", { bubbles: true }));
    const replicaToggle = fresh.document.getElementById("placementAllowReplication");
    replicaToggle.checked = true;
    replicaToggle.dispatchEvent(new fresh.Event("change", { bubbles: true }));
    const replicated = fresh.eval("computeGpuPlacement(testRows, [singleKey], 'throughput', '')");
    assert.equal(replicated.gpus.flatMap((gpu) => gpu.placements).filter((item) => item.model.name === "Qwen3 0.6B").length, 2);

    fresh.document.querySelector("[data-placement-usage='pipeline']")
      .dispatchEvent(new fresh.MouseEvent("click", { bubbles: true }));
    const pipeline = fresh.eval("computeGpuPlacement(testRows, [singleKey], 'throughput', '')");
    assert.equal(pipeline.gpus.flatMap((gpu) => gpu.placements).filter((item) => item.model.name === "Qwen3 0.6B").length, 1);
    assert.equal(replicaToggle.disabled, true);
  });

  test("only explores shorter contexts after the user allows reduction", () => {
    fresh.contextKey = fresh.eval(`modelKey(GENERATIVE_MODELS.find((model) => model.name === "Llama 3.2 3B Instruct"))`);
    fresh.eval(`getPlacementModelConfig(contextKey).contextTokens = 32768`);
    const lockedContexts = fresh.eval(`
      [...new Set(getPlacementSearchCandidates(
        getModelByKey(contextKey),
        getPlacementModelConfig(contextKey),
        { ...getHardware(), concurrency: 1 },
        24,
      ).map((candidate) => candidate.contextTokens))]
    `);
    assert.equal(lockedContexts.length, 1);
    assert.equal(lockedContexts[0], 32768);

    const contextToggle = fresh.document.getElementById("placementAllowContextReduction");
    contextToggle.checked = true;
    contextToggle.dispatchEvent(new fresh.Event("change", { bubbles: true }));
    const reducedContexts = fresh.eval(`
      [...new Set(getPlacementSearchCandidates(
        getModelByKey(contextKey),
        getPlacementModelConfig(contextKey),
        { ...getHardware(), concurrency: 1 },
        24,
      ).map((candidate) => candidate.contextTokens))]
    `);
    assert.ok(reducedContexts.includes(32768));
    assert.ok(reducedContexts.some((value) => value < 32768));
  });

  test("renders a plain-language overview, three plans, and collapsed calculation details", () => {
    if (!fresh.document.querySelector(".placement-model-config")) {
      fresh.document.querySelector("[data-open-placement-browser]")
        ?.dispatchEvent(new fresh.MouseEvent("click", { bubbles: true }));
      const checkbox = fresh.document.querySelector("#placementModelList [data-model-key]");
      fresh.overviewModelKey = checkbox.dataset.modelKey;
      fresh.eval("togglePlacementModel(overviewModelKey)");
    }
    fresh.document.querySelector("[data-placement-usage='independent']")
      .dispatchEvent(new fresh.MouseEvent("click", { bubbles: true }));
    fresh.document.getElementById("runPlacementButton")
      .dispatchEvent(new fresh.MouseEvent("click", { bubbles: true }));
    assert.equal(fresh.document.getElementById("placementResultStage").hidden, false);
    assert.match(fresh.document.getElementById("placementResultOverview").textContent, /추천:|현재 안전 동시 접속|예상 총 처리량/);
    assert.equal(fresh.document.querySelectorAll(".placement-plan-card").length, 3);
    assert.equal(fresh.document.getElementById("placementCalculationDetails").open, false);
    assert.ok(fresh.document.getElementById("gpuPlacementResult").textContent.trim());
  });
});

describe("model comparison table rendering", () => {
  test("keeps one item column per row and labels incomparable public evaluations", () => {
    const fresh = loadApp();
    const candidates = [...fresh.document.querySelectorAll("[data-compare-key]")]
      .map((checkbox) => {
        fresh.testModelKey = checkbox.dataset.compareKey;
        const model = fresh.eval("getModelByKey(window.testModelKey)");
        return {
          key: checkbox.dataset.compareKey,
          metric: model?.qualityBenchmark?.metric || null,
        };
      })
      .filter((candidate) => candidate.metric);
    const first = candidates[0];
    assert.ok(first, "expected at least one model with a public benchmark metric");
    const second = candidates.find((candidate) => candidate.metric !== first.metric);

    assert.ok(second, "expected two models with different public benchmark metrics");
    [first.key, second.key].forEach((key) => {
      const checkbox = [...fresh.document.querySelectorAll("[data-compare-key]")]
        .find((item) => item.dataset.compareKey === key);
      checkbox.checked = true;
      checkbox.dispatchEvent(new fresh.Event("change", { bubbles: true }));
    });

    fresh.document.querySelector("[data-open-compare]")
      .dispatchEvent(new fresh.MouseEvent("click", { bubbles: true }));

    const modal = fresh.document.getElementById("compareModal");
    const headerCells = modal.querySelectorAll("thead th");
    const bodyRows = [...modal.querySelectorAll("tbody tr")];
    assert.equal(headerCells.length, 3, "item + two model columns should render");
    assert.ok(bodyRows.length > 0);
    assert.ok(bodyRows.every((row) => row.children.length === 3), "every row should keep the same three-column grid");
    assert.match(modal.querySelector(".compare-summary-line").textContent, /권장합니다|실행 가능한 모델이 없습니다/);
    assert.equal(
      modal.querySelector("tbody tr:nth-child(4) > th").textContent.trim(),
      "대표 공개 평가",
    );
    const caveats = [...modal.querySelectorAll(".compare-caveat")].map((node) => node.textContent.trim());
    assert.ok(caveats.length > 0);
    assert.ok(caveats.every((text) => text === "서로 다른 벤치마크로 직접 비교할 수 없습니다."));

    fresh.document.querySelector("[data-add-compare-to-placement]")
      .dispatchEvent(new fresh.MouseEvent("click", { bubbles: true }));
    assert.equal(fresh.document.getElementById("gpuPlacementPanel").hidden, false);
    assert.equal(fresh.document.querySelectorAll(".placement-model-config").length, 2);
  });
});

describe("URL state save / restore", () => {
  test("lang query restores English UI and survives a GPU rerender", () => {
    const english = loadApp("https://example.com/?gpu=rtx4090-24&lang=en");
    assert.equal(english.document.documentElement.lang, "en");
    assert.equal(english.document.getElementById("settingsToggle").textContent, "Advanced settings");
    assert.equal(english.document.getElementById("providerFilter").options[0].textContent, "All providers");
    english.document.getElementById("gpuPreset").dispatchEvent(new english.Event("change", { bubbles: true }));
    assert.equal(english.document.getElementById("settingsToggle").textContent, "Advanced settings");
    assert.equal(new URLSearchParams(english.location.search).get("lang"), "en");
    assert.match(english.document.querySelector(".placement-advanced-conditions").textContent, /Minimum VRAM headroom/);
    assert.match(english.document.querySelector(".gpu-placement-policy-toggles").textContent, /automatic quantization\/precision changes/);

    english.document.querySelector("[data-open-placement-browser]")
      .dispatchEvent(new english.MouseEvent("click", { bubbles: true }));
    const placementCheckbox = english.document.querySelector("#placementModelList [data-model-key]");
    placementCheckbox.checked = true;
    placementCheckbox.dispatchEvent(new english.Event("change", { bubbles: true }));
    const modelControls = english.document.querySelector(".placement-model-config-grid").textContent;
    assert.match(modelControls, /Preferred setting/);
    assert.doesNotMatch(modelControls, /선호|요청 비율|최소 동시|GPU 고정/);

    english.document.querySelector(".core-task-actions [data-core-task='placement']")
      .dispatchEvent(new english.MouseEvent("click", { bubbles: true }));
    english.document.querySelector("[data-placement-starter='rag']")
      .dispatchEvent(new english.MouseEvent("click", { bubbles: true }));
    const placementText = english.document.getElementById("gpuPlacementPanel").textContent;
    assert.match(placementText, /AI Stack Placement Planner|Basic RAG stack|Operating goals|Quick guide/);
    assert.doesNotMatch(placementText, /여러 모델|처음이라면|하드웨어|모델 선택|운영 목표|세부 조건|배치 결과|사용 가이드/);
  });

  test("share URL encodes the current GPU and context settings", () => {
    win.eval(`
      $("gpuPreset").value = "h100-sxm-80";
      applyPreset("h100-sxm-80");
      $("contextSize").value = "32768";
      $("concurrency").value = "4";
    `);
    win.eval("syncUrlState()");
    const search = win.location.search;
    const params = new URLSearchParams(search);
    assert.equal(params.get("gpu"), "h100-sxm-80");
    assert.equal(params.get("ctx"), "32768");
    assert.equal(params.get("con"), "4");
    assert.equal(params.get("ui"), null);
  });

  test("default controls collapse to a readable GPU result URL", () => {
    const compact = loadApp("https://example.com/?ui=simple&lang=ko&mode=generative&gpu=rtx5070ti-16&vram=16&ram=64&count=1&gpu2=none&count2=1&bandwidth=896&reserved=0&margin=2&power=115&ctx=8192&con=1&out=512&kv=fp16&runtime=llamacpp&quant=auto&embTokens=384&embBatch=32&embPrecision=auto&embRuntime=tei&embBatchTokens=16384&rerankQuery=64&rerankDoc=512&rerankCandidates=40&rerankBatch=16&rerankPrecision=auto&rerankRuntime=tei&ocrPreset=a4-200&ocrWidth=1654&ocrHeight=2339&ocrBatch=1&ocrPrecision=auto&ocrFeature=text&mediaSteps=28&mediaFrames=81&mediaFps=16&mediaLora=0&mediaOffload=none&mediaOptimization=standard&advisorModel=tinyllama-1-1b-chat&advisorCategory=all&budget=2800000&currentPrice=0&electricity=150&hours=120&advisorVendor=all&advisorForm=all&task=all&provider=all&license=all&licenseUse=all&grade=all&fit=all&sort=latest&view=list&purpose=general&priority=balanced");
    assert.equal(compact.location.search, "?lang=ko&gpu=rtx5070ti-16");
  });

  test("loading a URL with query params restores the same settings on a fresh session", () => {
    const restored = loadApp("https://example.com/?gpu=h100-sxm-80&vram=80&ram=128&count=1&ctx=32768&con=4&out=512&kv=fp16&runtime=vllm&purpose=coding&priority=quality");
    const hardware = restored.eval("getHardware()");
    assert.equal(hardware.preset.id, "h100-sxm-80");
    assert.equal(hardware.context, 32768);
    assert.equal(hardware.concurrency, 4);
    assert.equal(hardware.runtime, "vllm");
    assert.equal(restored.document.getElementById("simplePurpose").value, "coding");
    assert.equal(restored.document.getElementById("simplePriority").value, "quality");
  });

  test("multi-GPU placement constraints survive a shared URL", () => {
    const source = loadApp();
    source.document.querySelector("[data-open-placement-browser]")
      .dispatchEvent(new source.MouseEvent("click", { bubbles: true }));
    const checkbox = source.document.querySelector("#placementModelList [data-model-key]");
    checkbox.checked = true;
    checkbox.dispatchEvent(new source.Event("change", { bubbles: true }));
    source.document.getElementById("placementMinHeadroom").value = "20";
    source.document.getElementById("placementMinHeadroom")
      .dispatchEvent(new source.Event("change", { bubbles: true }));
    source.document.getElementById("placementAllowContextReduction").checked = true;
    source.document.getElementById("placementAllowContextReduction")
      .dispatchEvent(new source.Event("change", { bubbles: true }));
    source.eval("syncUrlState()");

    const params = new URLSearchParams(source.location.search);
    assert.ok(params.get("pgModels"));
    assert.equal(params.get("pgHeadroom"), "20");
    assert.equal(params.get("pgContext"), "1");

    const restored = loadApp(source.location.href);
    assert.equal(restored.document.querySelectorAll(".placement-model-config").length, 1);
    assert.equal(restored.document.getElementById("placementMinHeadroom").value, "20");
    assert.equal(restored.document.getElementById("placementAllowContextReduction").checked, true);
  });
});

describe("benchmark estimate-error aggregate stats", () => {
  test("returns null when there are no measured rows (current live state)", () => {
    const stats = win.eval("computeBenchmarkErrorStats()");
    assert.equal(stats, null);
  });

  test("averages |error%| across measured rows once they exist", () => {
    const fresh = win;
    const model = fresh.eval(`GENERATIVE_MODELS.find((m) => m.params < 10 && m.params > 3)`);
    const gpuId = "rtx4090-24";
    fresh.eval(`
      $("gpuPreset").value = "${gpuId}";
      applyPreset("${gpuId}");
      $("contextSize").value = "8192";
      $("concurrency").value = "1";
      $("outputTokens").value = "512";
      $("runtimeMode").value = "llamacpp";
    `);
    const estimate = fresh.eval(`estimateModel(GENERATIVE_MODELS.find((m) => m.name === ${JSON.stringify(model.name)}), "auto", getHardware())`);

    // one row 10% below the estimate, one row 10% above -> average |error| should land near 10%
    fresh.eval(`
      BENCHMARKS.push({
        evidenceType: "user",
        modelName: ${JSON.stringify(model.name)},
        gpu: "${gpuId}",
        gpuId: "${gpuId}",
        workload: "generative",
        runtime: "llamacpp",
        quantization: ${JSON.stringify(estimate.quant.label)},
        context: 8192,
        concurrency: 1,
        inputTokens: 8192,
        outputTokens: 512,
        tokensPerSecond: ${estimate.speed} * 0.9,
        sourceUrl: "https://example.com/1",
      });
      BENCHMARKS.push({
        evidenceType: "project",
        modelName: ${JSON.stringify(model.name)},
        gpu: "${gpuId}",
        gpuId: "${gpuId}",
        workload: "generative",
        runtime: "llamacpp",
        quantization: ${JSON.stringify(estimate.quant.label)},
        context: 8192,
        concurrency: 1,
        inputTokens: 8192,
        outputTokens: 512,
        tokensPerSecond: ${estimate.speed} * 1.1,
        sourceUrl: "https://example.com/2",
      });
      BENCHMARKS.push({
        evidenceType: "external",
        modelName: ${JSON.stringify(model.name)},
        gpu: "${gpuId}",
        gpuId: "${gpuId}",
        workload: "generative",
        runtime: "llamacpp",
        quantization: ${JSON.stringify(estimate.quant.label)},
        context: 8192,
        concurrency: 1,
        inputTokens: 8192,
        outputTokens: 512,
        tokensPerSecond: ${estimate.speed} * 10,
        sourceUrl: "https://example.com/external-reference",
      });
    `);

    const stats = fresh.eval("computeBenchmarkErrorStats()");
    assert.ok(stats, "expected non-null stats once rows exist");
    assert.equal(stats.sampleCount, 2);
    assert.equal(stats.gpuCoverage, 1);
    // 0.9x -> ~+11.1% abs error, 1.1x -> ~-9.1% abs error, average ~10.1%
    assert.ok(stats.avgAbsErrorPct > 8 && stats.avgAbsErrorPct < 13, `expected avg abs error near 10%, got ${stats.avgAbsErrorPct}`);
  });
});

describe("GPU contribution and media-generation upgrades", () => {
  test("finds a GPU by community-friendly aliases and uses its GPU-usable memory", () => {
    const fresh = loadApp("https://example.com/");
    assert.equal(fresh.eval(`findGpuPresetByName("Radeon 8060S", false)?.id`), "ryzen-ai-max-plus-395-128");
    assert.equal(fresh.eval(`findGpuPresetByName("AI Max 395 64GB", false)?.id`), "ryzen-ai-max-plus-395-64");
    assert.equal(fresh.eval(`GPU_PRESETS.find((gpu) => gpu.id === "ryzen-ai-max-plus-395-64")?.gpuUsableMemoryGb`), 48);
    fresh.eval(`selectPrimaryGpu("ryzen-ai-max-plus-395-128")`);
    const hardware = fresh.eval("getHardware()");
    assert.equal(hardware.preset.memoryType, "unified");
    assert.equal(hardware.vram, 96);
  });

  test("shows direct-entry and request actions for an unknown GPU", () => {
    const fresh = loadApp("https://example.com/");
    const input = fresh.document.getElementById("onboardingGpuSearch");
    input.value = "Future GPU 9999";
    input.dispatchEvent(new fresh.Event("input", { bubbles: true }));
    const actions = fresh.document.getElementById("onboardingGpuNotFound");
    assert.equal(actions.hidden, false);
    assert.match(actions.querySelector("[data-request-gpu]").href, /gpu-request\.yml/);
  });

  test("video frames and offloading change media VRAM and speed estimates", () => {
    const fresh = loadApp();
    const model = fresh.eval(`OCR_MODELS.find((item) => item.type === "video-generation")`);
    fresh.testVideoModel = model;
    const base = fresh.eval(`estimateOcrModel(testVideoModel, getHardware(), {
      type: "videoGeneration", width: 832, height: 480, batchSize: 1,
      precisionId: "fp16", featureSet: "text", steps: 28, frames: 81, fps: 16,
      loraCount: 0, offload: "none"
    })`);
    const longer = fresh.eval(`estimateOcrModel(testVideoModel, getHardware(), {
      type: "videoGeneration", width: 832, height: 480, batchSize: 1,
      precisionId: "fp16", featureSet: "text", steps: 28, frames: 161, fps: 16,
      loraCount: 1, offload: "none"
    })`);
    const offloaded = fresh.eval(`estimateOcrModel(testVideoModel, getHardware(), {
      type: "videoGeneration", width: 832, height: 480, batchSize: 1,
      precisionId: "fp16", featureSet: "text", steps: 28, frames: 161, fps: 16,
      loraCount: 1, offload: "sequential"
    })`);
    assert.ok(longer.requiredGb > base.requiredGb);
    assert.ok(longer.speed < base.speed);
    assert.ok(offloaded.requiredGb < longer.requiredGb);
    assert.ok(offloaded.speed < longer.speed);
  });
});

describe("v1.3 GPU platform upgrades", () => {
  test("normalizes every GPU schema record", () => {
    const fresh = loadApp();
    const invalid = fresh.eval(`GPU_PRESETS.filter((gpu) => !gpu.vendor || !gpu.architecture || !gpu.memoryType || !gpu.formFactor || !Array.isArray(gpu.runtimes) || !Array.isArray(gpu.aliases))`);
    assert.deepEqual([...invalid], []);
    assert.equal(fresh.eval(`["rtx5090laptop-24", "rx9070-16", "arcb580-12"].every((id) => GPU_PRESETS.some((gpu) => gpu.id === id))`), true);
  });

  test("scales laptop compute by selected TGP and preserves it in shared URLs", () => {
    const fresh = loadApp("https://example.com/?gpu=rtx4090laptop-16");
    const low = fresh.eval(`estimateHardwareCompute(GPU_PRESETS.find((gpu) => gpu.id === "rtx4090laptop-16"), 576, 80).fp16Tflops`);
    const high = fresh.eval(`estimateHardwareCompute(GPU_PRESETS.find((gpu) => gpu.id === "rtx4090laptop-16"), 576, 175).fp16Tflops`);
    assert.ok(high > low);
    fresh.document.getElementById("powerLimitW").value = "90";
    fresh.eval("syncUrlState()");
    assert.equal(new URLSearchParams(fresh.location.search).get("power"), "90");
  });

  test("calibrates estimates from source-linked user measurements and exposes uncertainty", () => {
    const fresh = loadApp();
    const model = fresh.eval(`GENERATIVE_MODELS.find((item) => item.name === "Llama 3.1 8B Instruct")`);
    fresh.testCalibrationModel = model;
    const raw = fresh.eval(`normalizeGenerativeEstimate(estimateModel(testCalibrationModel, "q4", getHardware()))`);
    for (const factor of [0.72, 0.76, 0.8]) {
      fresh.BENCHMARKS.push({
        evidenceType: "user",
        modelName: model.name,
        gpu: "RTX 4090 24GB",
        gpuId: "rtx4090-24",
        workload: "generative",
        runtime: "llamacpp",
        quantization: "Q4_K_M",
        context: 8192,
        concurrency: 1,
        inputTokens: 8192,
        outputTokens: 512,
        tokensPerSecond: raw.speed * factor,
        sourceUrl: `https://example.com/${factor}`,
      });
    }
    const calibrated = fresh.eval(`applyMeasuredCalibration(normalizeGenerativeEstimate(estimateModel(testCalibrationModel, "q4", getHardware())), getHardware())`);
    assert.ok(calibrated.speed < raw.speed);
    assert.equal(calibrated.calibration.sampleCount, 3);
    fresh.testCalibrated = calibrated;
    const confidence = fresh.eval(`getEstimateConfidence(testCalibrationModel, testCalibrated, getHardware())`);
    assert.equal(confidence.className, "confidence-high");
  });

  test("uses a dedicated media engine and renders GPU comparison accessibly", () => {
    const fresh = loadApp();
    const model = fresh.eval(`OCR_MODELS.find((item) => item.type === "video-generation")`);
    fresh.testDedicatedMedia = model;
    const estimate = fresh.eval(`estimateMediaModel(testDedicatedMedia, getHardware(), {
      type: "videoGeneration", width: 832, height: 480, batchSize: 1,
      precisionId: "fp16", featureSet: "text", steps: 28, frames: 81, fps: 16,
      loraCount: 1, offload: "none"
    })`);
    assert.ok(estimate.textEncoderGb > 0);
    assert.ok(estimate.temporalActivationGb > 0);
    fresh.eval(`selectPrimaryGpu("rtx4090-24"); renderGpuInsights(getHardware()); $("toggleGpuCompare").click(); $("compareGpuA").value = "rtx5090-32"; renderGpuInsights(getHardware())`);
    const table = fresh.document.querySelector(".gpu-comparison-table");
    assert.ok(table);
    assert.ok(table.textContent.includes("RTX 5090"));
    assert.equal(fresh.document.getElementById("gpuComparisonResult").getAttribute("aria-live"), "polite");
    fresh.eval(`setUiLanguage("en"); renderGpuInsights(getHardware())`);
    assert.doesNotMatch(fresh.document.getElementById("gpuInsightsPanel").textContent, /[가-힣]/);
    assert.doesNotMatch(fresh.document.getElementById("hardwareCapabilitySummary").textContent, /[가-힣]/);
  });
});

describe("v1.4 advisor and media optimization", () => {
  test("model-first recommendations use real model, budget, and result screens", () => {
    const fresh = loadApp("https://example.com/?mode=modelFinder&lang=ko");
    const panel = fresh.document.getElementById("gpuAdvisorPanel");
    const visibleStep = () => [...panel.querySelectorAll("[data-advisor-step-panel]")]
      .find((section) => !section.hidden)?.dataset.advisorStepPanel;

    assert.equal(panel.dataset.advisorStep, "1");
    assert.equal(visibleStep(), "1");
    assert.match(fresh.document.querySelector("#workspaceJourney .is-current")?.textContent || "", /모델 선택/);

    panel.querySelector("[data-advisor-next]").click();
    assert.equal(panel.dataset.advisorStep, "2");
    assert.equal(visibleStep(), "2");
    assert.equal(new URL(fresh.location.href).searchParams.get("advisorStep"), "2");

    panel.querySelector("[data-advisor-next]").click();
    assert.equal(panel.dataset.advisorStep, "3");
    assert.equal(visibleStep(), "3");
    assert.ok(panel.querySelectorAll(".gpu-advisor-card").length > 0);
    assert.ok(panel.querySelector(".advisor-frontier"));
    assert.ok(panel.querySelectorAll("[data-advisor-frontier-point]").length > 1);
    assert.match(panel.querySelector(".advisor-frontier").textContent, /가격·속도 프런티어/);
    assert.match(panel.querySelector(".advisor-frontier-table").textContent, /실측|외부 공개|계산 속도 추정|관련 실측/);
    assert.match(fresh.document.querySelector("#workspaceJourney .is-current")?.textContent || "", /GPU 3안 비교/);

    fresh.document.querySelector('[data-core-task="modelFinder"]').click();
    assert.equal(panel.dataset.advisorStep, "1");
    assert.equal(visibleStep(), "1");
    assert.equal(new URL(fresh.location.href).searchParams.has("advisorStep"), false);
  });

  test("ranks model-first GPU recommendations with budget and energy cost", () => {
    const fresh = loadApp("https://example.com/?gpu=rtx4090-24&lang=en&mode=modelFinder");
    const panel = fresh.document.getElementById("gpuAdvisorPanel");
    fresh.eval(`$("advisorModel").value = modelKey(GENERATIVE_MODELS.find((model) => model.name === "Llama 3.1 8B Instruct")); renderGpuAdvisor()`);
    assert.equal(panel.hidden, false);
    assert.ok(panel.querySelectorAll(".gpu-advisor-card").length > 0);
    assert.match(panel.textContent, /Monthly energy/);
    assert.match(panel.querySelector(".advisor-frontier").textContent, /GPU price–speed frontier/);
    assert.match(panel.querySelector(".advisor-frontier").textContent, /Calculated speed estimate|measurement|benchmark/i);
    assert.doesNotMatch(panel.textContent, /[가-힣]/);
  });

  test("filters advisor models by workload and partial name search", () => {
    const fresh = loadApp("https://example.com/?mode=modelFinder&lang=en");
    fresh.eval(`$("advisorModelCategory").value = "image"; $("advisorModelCategory").dispatchEvent(new Event("change"))`);
    const categoryOptions = [...fresh.document.getElementById("advisorModel").options];
    assert.ok(categoryOptions.length > 0);
    assert.equal(fresh.eval(`[...$("advisorModel").options].every((option) => getAdvisorModelCategory(getModelByKey(option.value)) === "image")`), true);

    fresh.eval(`$("advisorModelSearch").value = "flux"; $("advisorModelSearch").dispatchEvent(new Event("input"))`);
    const searchOptions = [...fresh.document.getElementById("advisorModel").options];
    assert.ok(searchOptions.length > 0);
    assert.equal(searchOptions.every((option) => option.textContent.toLowerCase().includes("flux")), true);
    assert.match(fresh.document.getElementById("advisorModelCount").textContent, /models/);

    fresh.eval(`$("advisorModelSearch").value = "no-such-model-xyz"; $("advisorModelSearch").dispatchEvent(new Event("input"))`);
    assert.equal(fresh.document.getElementById("advisorModel").disabled, true);
    assert.match(fresh.document.getElementById("gpuAdvisorResult").textContent, /No matching model/);
  });

  test("shows runnable alternatives when vendor and form filters have no exact match", () => {
    const fresh = loadApp("https://example.com/?mode=modelFinder&lang=ko");
    fresh.eval(`$("advisorModelCategory").value = "image"; refreshAdvisorModelOptions(); $("advisorModel").value = modelKey(OCR_MODELS.find((model) => model.name === "stabilityai/stable-diffusion-xl-base-1.0")); $("advisorVendor").value = "AMD"; $("advisorFormFactor").value = "laptop"; $("advisorBudgetUsd").value = "2000"; renderGpuAdvisor()`);
    assert.ok(fresh.document.querySelectorAll(".gpu-advisor-card").length > 0);
    assert.match(fresh.document.getElementById("gpuAdvisorResult").textContent, /가까운 대안/);
    assert.ok(fresh.document.querySelector("[data-advisor-relax]"));
    assert.match(read("styles.css"), /\.advisor-model-select-field small\s*\{[^}]*position:\s*absolute;/s);
  });

  test("attention and cache optimization changes media memory and speed", () => {
    const fresh = loadApp();
    const model = fresh.eval(`OCR_MODELS.find((item) => item.type === "video-generation")`);
    fresh.testOptimizedMedia = model;
    const standard = fresh.eval(`estimateMediaModel(testOptimizedMedia, getHardware(), {
      type: "videoGeneration", width: 832, height: 480, batchSize: 1,
      precisionId: "fp16", featureSet: "text", steps: 28, frames: 81, fps: 16,
      loraCount: 0, offload: "none", optimization: "standard"
    })`);
    const optimized = fresh.eval(`estimateMediaModel(testOptimizedMedia, getHardware(), {
      type: "videoGeneration", width: 832, height: 480, batchSize: 1,
      precisionId: "fp16", featureSet: "text", steps: 28, frames: 81, fps: 16,
      loraCount: 0, offload: "none", optimization: "combined"
    })`);
    assert.ok(optimized.requiredGb < standard.requiredGb);
    assert.ok(optimized.speed > standard.speed);
  });
});

describe("v1.5 catalog, audio, and model-first experience", () => {
  test("includes the requested GPU families and audio catalogs", () => {
    const fresh = loadApp();
    assert.equal(fresh.eval(`["rx9070gre-12", "rx9060xt-16", "arcprob70-32", "arcprob60-24", "rtxpro5000blackwell-48", "rtxpro2000blackwell-16"].every((id) => GPU_PRESETS.some((gpu) => gpu.id === id))`), true);
    assert.ok(fresh.AUDIO_MODELS.length >= 10);
    assert.ok(fresh.eval(`AUDIO_MODELS.some((model) => model.type === "audio-stt") && AUDIO_MODELS.some((model) => model.type === "audio-tts")`));
  });

  test("estimates STT and TTS in realtime factors", () => {
    const fresh = loadApp();
    const stt = fresh.eval(`estimateAudioModel(AUDIO_MODELS.find((model) => model.type === "audio-stt"), getHardware())`);
    const tts = fresh.eval(`estimateAudioModel(AUDIO_MODELS.find((model) => model.type === "audio-tts"), getHardware())`);
    assert.ok(stt.requiredGb > 0 && stt.speed > 0);
    assert.ok(tts.requiredGb > 0 && tts.speed > 0);
    assert.equal(stt.unitLabel, "x realtime");
  });

  test("opens a model-first screen without requiring a selected GPU", () => {
    const fresh = loadApp("https://example.com/?mode=modelFinder&lang=en");
    assert.equal(fresh.document.getElementById("gpuAdvisorPanel").hidden, false);
    assert.equal(fresh.document.getElementById("onboardingScreen").hidden, true);
    assert.equal(fresh.document.getElementById("simpleModePanel").hidden, true);
    assert.equal(fresh.document.getElementById("resultsPanel").hidden, true);
    assert.match(fresh.document.querySelector('[data-core-task="modelFinder"]').textContent, /Find a GPU for a model/);

    const selected = loadApp("https://example.com/?gpu=rtx6000ada-48&lang=ko");
    assert.equal(selected.document.getElementById("simpleModePanel").hidden, false);
    selected.document.querySelector('[data-core-task="modelFinder"]').click();
    assert.equal(selected.document.getElementById("gpuAdvisorPanel").hidden, false);
    assert.equal(selected.document.getElementById("hardwarePanel").hidden, true);
    assert.equal(selected.document.getElementById("gpuInsightsPanel").hidden, true);
    assert.equal(selected.document.getElementById("simpleModePanel").hidden, true);
    assert.equal(selected.document.getElementById("benchmarkDashboard").hidden, true);
  });

  test("renders benchmark coverage and mobile comparison cards", () => {
    const fresh = loadApp("https://example.com/?gpu=rtx4090-24&lang=en");
    const dashboard = fresh.document.getElementById("benchmarkDashboard");
    assert.match(dashboard.textContent, /Benchmark coverage dashboard/);
    assert.equal(dashboard.parentElement.classList.contains("app-shell"), true);
    assert.match(read("styles.css"), /\.benchmark-v2-toolbar \.check-field input\[type="checkbox"\]\s*\{[^}]*width:\s*16px;[^}]*height:\s*16px;/s);
    fresh.eval(`renderGpuInsights(getHardware()); $("toggleGpuCompare").click(); renderGpuInsights(getHardware())`);
    assert.ok(fresh.document.querySelector(".gpu-mobile-comparison-cards article"));
  });
});

describe("v2.0 decision platform", () => {
  test("calculates measurement confidence and upgrade TCO", () => {
    const platform = loadApp("https://example.com/?gpu=rtx3060-12&hub=reliability", {}, { platformV2: true });
    platform.testRows = [
      { tokensPerSecond: 40 },
      { tokensPerSecond: 44 },
      { tokensPerSecond: 46 },
    ];
    const stats = platform.eval("calculateReliabilityStats(testRows)");
    assert.equal(stats.count, 3);
    assert.equal(stats.median, 44);
    assert.ok(stats.ciLow < stats.ciHigh);
    const tco = platform.eval(`calculateUpgradeTco({
      newPriceUsd: 1200, currentResaleUsd: 200, targetPowerW: 350, currentPowerW: 170,
      years: 3, hoursPerMonth: 120, electricityUsdKwh: 0.15, targetSpeed: 90, currentSpeed: 40
    })`);
    assert.equal(tco.verdict, "worth");
    assert.ok(tco.tco > 1000);
  });

  test("renders deep links, benchmark filters, and launch recipes", () => {
    const platform = loadApp("https://example.com/?gpu=rtx4090-24&detail=model&model=generative%3AQwen3%208B&hub=launch", {}, { platformV2: true });
    assert.ok(platform.document.querySelector("#decisionHub"));
    assert.match(platform.document.querySelector("#decisionHubBody").textContent, /Ollama|실행 도우미|Launch/);
    const recipe = platform.eval(`generateLaunchRecipe({ runtime: "vllm", platform: "linux" })`);
    assert.match(recipe.command, /vllm serve/);
    assert.match(recipe.command, /max-model-len/);
    const gpuUrl = platform.eval("buildGpuDetailUrl(currentPlatformGpu())");
    assert.match(gpuUrl, /detail=gpu/);
  });

  test("supports four-way model and GPU comparisons with accessible mobile output", () => {
    const platform = loadApp("https://example.com/?gpu=rtx4090-24&compareA=rtx5090-32&compareB=rx7900xtx-24&compareC=arcb580-12", {}, { platformV2: true });
    assert.match(read("app.js"), /const MAX_COMPARE_MODELS = 4/);
    assert.equal(platform.document.querySelector("#compareGpuC").value, "arcb580-12");
    platform.document.querySelector("#toggleGpuCompare").click();
    assert.equal(platform.document.querySelectorAll(".gpu-mobile-comparison-cards article").length, 4);
    assert.equal(platform.eval("auditPlatformAccessibility(document).length"), 0);
  });
});

describe("v2.2 user build calculator", () => {
  test("calculates PSU, RAM, case fit, total price, and upgrade order", () => {
    const platform = loadApp("https://example.com/?gpu=rtx4090-24&hub=build&lang=en", {}, { platformV2: true });
    platform.buildEstimate = { grade: "A", requiredGb: 20 };
    const blocked = platform.eval(`calculateSystemBuild({
      estimate: buildEstimate, gpuVramGb: 24, gpuPowerW: 450,
      cpuScore: 65, cpuPowerW: 125, ramGb: 64, psuW: 550,
      caseClearanceMm: 320, gpuLengthMm: 340,
      prices: { gpu: 1200, cpu: 300, ram: 150, psu: 100, case: 100 }
    })`);
    assert.equal(blocked.verdict, "blocked");
    assert.ok(blocked.recommendedPsuW >= 850);
    assert.equal(blocked.priorities[0].id, "psu");
    assert.equal(blocked.totalPriceUsd, 1850);

    const ready = platform.eval(`calculateSystemBuild({
      estimate: buildEstimate, gpuVramGb: 24, gpuPowerW: 300,
      cpuScore: 82, cpuPowerW: 125, ramGb: 64, psuW: 1000,
      caseClearanceMm: 400, gpuLengthMm: 320, prices: { gpu: 900 }
    })`);
    assert.equal(ready.verdict, "runnable");
    assert.equal(ready.priorities[0].id, "none");
  });

  test("renders a bilingual, shareable build form and updates its verdict", () => {
    const platform = loadApp("https://example.com/?gpu=rtx4090-24&hub=build&lang=en", {}, { platformV2: true });
    assert.match(platform.document.querySelector("#decisionHubBody").textContent, /CPU|System RAM|Total system price/);
    assert.ok(platform.document.querySelector("#buildModel"));
    assert.ok(platform.document.querySelector("#buildGpu"));
    const psu = platform.document.querySelector("#buildPsuW");
    psu.value = "500";
    psu.dispatchEvent(new platform.Event("change", { bubbles: true }));
    assert.match(platform.location.search, /hub=build/);
    assert.match(platform.location.search, /build=/);
    assert.equal(platform.eval("auditPlatformAccessibility(document).length"), 0);
  });
});

describe("v3.7 infrastructure sizing and multimodal stack", () => {
  test("a fresh infra-tab click starts at service selection while shared result links stay on their requested step", () => {
    const staleState = encodeURIComponent(JSON.stringify({ siInputMode: "simple", siWizardStep: 4 }));
    const clicked = loadApp(`https://example.com/?mode=infra&lang=ko&studio=consulting&schema=3&studioState=${staleState}`, {}, { platformV2: true });
    assert.equal(clicked.eval("studioState.siWizardStep"), 4);
    clicked.document.querySelector('[data-core-task="modelFinder"]').click();
    clicked.document.querySelector('[data-core-task="infra"]').click();
    assert.equal(clicked.eval("studioState.siWizardStep"), 1);
    assert.equal(clicked.document.getElementById("decisionStudio").dataset.wizardStep, "1");
    assert.equal(new URL(clicked.location.href).searchParams.has("studioState"), false);

    const shared = loadApp(`https://example.com/?mode=infra&lang=ko&studio=consulting&studioState=${staleState}`, {}, { platformV2: true });
    assert.equal(shared.eval("studioState.siWizardStep"), 4);
    assert.equal(shared.document.getElementById("decisionStudio").dataset.wizardStep, "4");
  });

  test("opens infrastructure sizing as a separate beginner-first workspace", () => {
    const platform = loadApp("https://example.com/?gpu=rtx5070ti-16&lang=ko", {}, { platformV2: true });
    assert.equal(platform.document.querySelectorAll(".core-task-actions [data-core-task]").length, 6);
    assert.ok(platform.document.querySelector(".core-task-actions [data-core-task='placement']"));
    assert.equal(platform.document.querySelector("#gpuAdvisorPanel").hidden, true);
    assert.equal(platform.document.querySelector("#resultsPanel").previousElementSibling.id, "hardwarePanel");
    assert.equal(platform.document.querySelector("#decisionStudio").hidden, true);
    platform.document.querySelector('[data-core-task="infra"]').click();
    assert.equal(platform.document.querySelector("#decisionStudio").hidden, false);
    assert.equal(platform.document.querySelector("#hardwarePanel").hidden, true);
    const wizard = platform.document.querySelector(".si-simple-wizard");
    assert.ok(wizard);
    assert.match(platform.document.querySelector(".si-auto-result").textContent, /GPU|CPU|RAM|Storage|Network/);
    assert.equal(platform.document.querySelector(".si-expert-form").open, false);
    platform.document.querySelector('[data-si-input-mode="expert"]').click();
    assert.equal(platform.document.querySelector(".si-expert-form").open, true);
    assert.ok(platform.document.querySelector(".si-editable-bom"));
    assert.ok(platform.document.querySelector("#siBomCpuId").options.length >= 10);
    assert.ok(platform.document.querySelector("#siBomMemoryId").options.length >= 6);
    assert.ok(platform.document.querySelector("#siBomPsuId").options.length >= 7);
    const bomBefore = platform.eval("siEditableBom(calculateSiSizing().plans[1]).total");
    const extra = platform.document.querySelector("#siBomExtraKrw");
    extra.value = "1000000";
    extra.dispatchEvent(new platform.Event("change", { bubbles: true }));
    assert.equal(platform.eval("studioState.siBomExtraKrw"), 1000000);
    assert.ok(platform.eval("siEditableBom(calculateSiSizing().plans[1]).total") > bomBefore);
    assert.match(platform.document.querySelector(".si-bom-summary").textContent, /편집 견적 합계/);
  });

  test("expands workstation and server component tiers", () => {
    const platform = loadApp("https://example.com/?mode=infra&lang=en", {}, { platformV2: true });
    assert.ok(platform.eval("SYSTEM_PART_CATALOG.cpu.length") >= 11);
    assert.ok(platform.eval("SYSTEM_PART_CATALOG.motherboard.length") >= 8);
    assert.ok(platform.eval("SYSTEM_PART_CATALOG.memory.length") >= 6);
    assert.ok(platform.eval("SYSTEM_PART_CATALOG.storage.length") >= 5);
    assert.ok(platform.eval("SYSTEM_PART_CATALOG.nic.length") >= 5);
    assert.ok(platform.eval("SYSTEM_PART_CATALOG.ups.length") >= 4);
    assert.match(platform.document.querySelector(".si-simple-wizard").textContent, /Complete the estimate in three steps/);
    assert.doesNotMatch(platform.document.querySelector(".si-simple-wizard").textContent, /[가-힣]/);
  });

  test("renders seven decision tools and source-linked Korean prices", () => {
    const platform = loadApp("https://example.com/?gpu=rtx5070ti-16&lang=ko", {}, { platformV2: true });
    assert.equal(platform.document.querySelectorAll("[data-studio-tab]").length, 7);
    platform.eval(`updateStudio("tab", "market")`);
    assert.equal(platform.document.querySelectorAll(".studio-table tbody tr").length, platform.eval("KOREAN_GPU_MARKET.length"));
    assert.match(platform.document.querySelector("#decisionStudioBody").textContent, /다나와|성능\/가격/);
    assert.equal(platform.eval("KOREAN_GPU_MARKET.every((row) => row.sourceUrl && row.updatedAt && row.newKrw > 0)"), true);
  });

  test("calculates a custom model and checks component and runtime compatibility", () => {
    const platform = loadApp("https://example.com/?gpu=rtx5070ti-16&lang=en", {}, { platformV2: true });
    const custom = platform.eval(`Object.assign(studioState, { customTotalB: 32, customActiveB: 4, customLayers: 64, customBits: 4, customContext: 32768, customVision: true }); calculateCustomModel()`);
    assert.ok(custom.requiredGb > custom.weightsGb);
    assert.ok(custom.kvGb > 0);
    platform.eval(`updateStudio("tab", "parts")`);
    assert.ok(platform.document.querySelector(".parts-check-list"));
    platform.eval(`updateStudio("tab", "runtime")`);
    assert.match(platform.document.querySelector(".runtime-compat-card").textContent, /CUDA|vLLM|TensorRT/);
  });

  test("shows three recommendation roles and validates measurement drafts", () => {
    const platform = loadApp("https://example.com/?gpu=rtx5070ti-16&lang=en", {}, { platformV2: true });
    platform.eval(`Object.assign(studioState, { tab: "recommend", budgetKrw: 8000000, powerLimitW: 1000, targetSpeed: 0, formFactor: "desktop", modelKey: modelKey(GENERATIVE_MODELS.find((model) => model.name === "Llama 3.1 8B Instruct")) }); renderDecisionStudio()`);
    assert.equal(platform.document.querySelectorAll(".studio-pick-card").length, 3);
    assert.match(platform.document.querySelector("#decisionStudioBody").textContent, /Lowest cost|Balanced|Highest performance/);
    platform.eval(`updateStudio("tab", "community")`);
    assert.ok(platform.document.querySelector("#communityBenchmarkForm"));
    assert.equal(platform.eval("auditPlatformAccessibility(document).length"), 0);
  });

  test("creates three infrastructure sizing options with infrastructure and PoC outputs", () => {
    const platform = loadApp("https://example.com/?gpu=rtx5070ti-16&lang=ko&studio=consulting", {}, { platformV2: true });
    assert.equal(platform.document.querySelectorAll(".si-plan-card").length, 3);
    assert.match(platform.document.querySelector("#decisionStudioBody").textContent, /경제형|권장형|확장형/);
    assert.match(platform.document.querySelector("#decisionStudioBody").textContent, /CPU|RAM|NVMe|네트워크|PoC/);
    assert.ok(platform.document.querySelector("[data-si-export]"));
    platform.eval(`document.querySelector('[data-si-preset="private-assistant"]').click()`);
    assert.equal(platform.document.querySelector("#siConcurrency").value, "20");
  });

  test("supports easy sizing scenarios, custom users, clickable plans, and price sources", () => {
    const platform = loadApp("https://example.com/?gpu=rtx5070ti-16&lang=ko&studio=consulting", {}, { platformV2: true });
    assert.ok(platform.document.querySelector('[data-si-preset="ai-chatbot"]'));
    assert.ok(platform.document.querySelector('[data-si-preset="avatar-chat"]'));
    const customUsers = platform.document.querySelector("#siCustomUsers");
    customUsers.value = "175";
    customUsers.dispatchEvent(new platform.Event("change", { bubbles: true }));
    assert.equal(platform.document.querySelector("#siCustomUsers").value, "175");
    assert.equal(platform.eval("studioState.siTotalUsers"), 175);
    platform.document.querySelector('[data-si-plan="economy"]').click();
    assert.equal(platform.document.querySelector('[data-si-plan="economy"]').getAttribute("aria-pressed"), "true");
    assert.match(platform.document.querySelector(".si-plan-detail").textContent, /경제형|비용 산정 근거/);
    assert.ok(platform.document.querySelectorAll(".si-source-links a").length >= 3);
    assert.equal(platform.eval("auditPlatformAccessibility(document).length"), 0);
  });

  test("opens shareable infrastructure scenarios with a custom user count", () => {
    const platform = loadApp("https://example.com/?mode=infra&lang=en&studio=consulting&scenario=avatar-chat&users=75", {}, { platformV2: true });
    assert.equal(platform.document.querySelector("#decisionStudio").hidden, false);
    assert.equal(platform.eval("studioState.siScenario"), "avatar-chat");
    assert.equal(platform.eval("studioState.siTotalUsers"), 75);
    assert.equal(platform.eval("studioState.siConcurrency"), 12);
    assert.equal(platform.eval("studioState.siInputMode"), "simple");
    assert.match(platform.document.querySelector(".si-simple-wizard").textContent, /AI avatar chat/);
  });

  test("the ontology-construction batch scenario (v7.27.0) sizes infra like any other SI_SCENARIOS entry", () => {
    const platform = loadApp("https://example.com/?mode=infra&lang=en&studio=consulting&scenario=ontology-batch", {}, { platformV2: true });
    assert.equal(platform.document.querySelector("#decisionStudio").hidden, false);
    assert.equal(platform.eval("studioState.siScenario"), "ontology-batch");
    assert.equal(platform.eval("studioState.siServiceType"), "rag");
    assert.match(platform.document.querySelector(".si-simple-wizard").textContent, /Ontology construction batch/);

    // Same event the Infra tab's "온톨로지 구축 배치 견적" demo chip dispatches
    // (see app.js's [data-demo-infra] click handler) -- confirms the whole
    // wire-up, not just the URL-param restore path exercised above.
    platform.eval(`
      window.dispatchEvent(new CustomEvent("ai-hardware-fit:infra-demo", {
        detail: { scenario: "ontology-batch", users: 20 },
      }));
    `);
    assert.equal(platform.eval("studioState.siScenario"), "ontology-batch");
    assert.equal(platform.eval("studioState.siTotalUsers"), 20);
    assert.equal(platform.eval("auditPlatformAccessibility(document).length"), 0);
  });

  test("supports v4.4-v4.8 validation, commercial pricing, topology, approval, and option comparison", () => {
    const platform = loadApp("https://example.com/?gpu=rtx5070ti-16&lang=ko&studio=consulting", {}, { platformV2: true });
    platform.document.querySelector('[data-si-input-mode="expert"]').click();
    assert.equal(platform.document.querySelectorAll(".si-validation-grid article").length, 8);
    assert.ok(platform.document.querySelector("#siBomMotherboardId"));
    const commercial = platform.eval("calculateSiCommercial(calculateSiSizing().plans[1])");
    assert.ok(commercial.finalPrice > commercial.listPrice);
    assert.ok(commercial.topology.racks >= 1);
    assert.ok(commercial.topology.pduCircuits >= 2);
    assert.equal(platform.document.querySelectorAll(".si-v48-table thead th").length, 4);
    const discount = platform.document.querySelector("#siDiscountPct");
    discount.value = "10";
    discount.dispatchEvent(new platform.Event("change", { bubbles: true }));
    assert.equal(platform.eval("studioState.siDiscountPct"), 10);
    platform.document.querySelector('[data-si-status="approved"]').click();
    assert.equal(platform.eval("studioState.siQuoteStatus"), "approved");
    assert.ok(platform.eval("Boolean(studioState.siApprovedAt)"));
    assert.match(platform.document.querySelector(".si-quote-status").textContent, /승인/);
    assert.equal(platform.eval("auditPlatformAccessibility(document).length"), 0);
  });

  test("captures detailed SLA, BOM, TCO, confidence, and measured PoC fields", () => {
    const platform = loadApp("https://example.com/?gpu=rtx5070ti-16&lang=en&studio=consulting", {}, { platformV2: true });
    ["siIndustry", "siContact", "siQps", "siMaxInputTokens", "siTtftP95", "siLatencyP95", "siOperatingHours"].forEach((id) => assert.ok(platform.document.querySelector(`#${id}`)));
    assert.equal(platform.document.querySelectorAll(".si-topology-row").length, 3);
    assert.ok(platform.document.querySelector(".si-bom-grid"));
    assert.match(platform.document.querySelector("#decisionStudioBody").textContent, /3-year TCO|Evidence confidence|PoC required/);
    const ttft = platform.document.querySelector("#siMeasuredTtft");
    ttft.value = "1.5";
    ttft.dispatchEvent(new platform.Event("change", { bubbles: true }));
    assert.match(platform.document.querySelector(".si-poc-verdict").textContent, /adjustment|required|passed/i);
    assert.equal(platform.eval("auditPlatformAccessibility(document).length"), 0);
  });

  test("supports v3.8-v4.2 SLA, project history, proposal, benchmark, and TCO flows", () => {
    const platform = loadApp("https://example.com/?gpu=rtx5070ti-16&lang=en&studio=consulting", {}, { platformV2: true });
    assert.equal(platform.document.querySelectorAll(".si-version-section").length, 6);
    ["siMaxBatch", "siMinReplicas", "siMaxReplicas", "siBenchmarkRuntime", "siUtilizationPct", "siCloudHourlyUsd"].forEach((id) => assert.ok(platform.document.querySelector(`#${id}`)));
    const result = platform.eval("calculateRealtimeSla(calculateSiSizing().plans[1])");
    assert.ok(result.capacityRps > 0);
    assert.ok(result.latencyP95 >= result.ttftP95);
    assert.ok(result.requiredReplicas >= 1);
    const tco = platform.eval("calculateTcoComparison(calculateSiSizing().plans[1])");
    assert.equal(tco.onprem.length, 3);
    assert.ok(tco.onprem[2] > tco.onprem[0]);
    assert.match(platform.document.querySelector(".si-avatar-latency").textContent, /STT.*LLM.*TTS.*Lip-sync/s);
    assert.match(platform.document.querySelector(".si-command").textContent, /vllm bench serve/);
    assert.doesNotMatch(platform.document.querySelector("#decisionStudioBody").textContent, /시세 입력 필요|추정 사양/);
  });

  test("builds an avatar chat stack with STT, LLM, TTS, and video models", () => {
    const platform = loadApp("https://example.com/?gpu=rtx4090-24&mode=placement&lang=en");
    platform.document.querySelector("[data-placement-starter='voice-avatar']").click();
    assert.equal(platform.document.querySelector("[data-placement-usage='pipeline']").getAttribute("aria-selected"), "true");
    assert.equal(platform.document.querySelectorAll(".placement-model-config").length, 4);
    assert.match(platform.document.querySelector("#placementModelSelected").textContent, /Whisper small|Kokoro-82M|MuseTalk/);
    assert.equal(platform.document.querySelectorAll("[data-placement-type='avatar-generation'], [data-placement-type='audio-stt'], [data-placement-type='audio-tts']").length, 3);
    assert.equal(platform.eval("getPlacementBaselineOptions(AUDIO_MODELS.find((model) => model.type === 'audio-stt'), { ...getHardware(), concurrency: 1 })[0].setting.id"), "fp16");
    assert.equal(platform.eval("getPlacementCapacity(AUDIO_MODELS.find((model) => model.type === 'audio-tts'), { id: 'fp16' }, getHardware(), getHardware().availableVram).unit"), "× realtime");
  });

  test("exposes avatar models in catalog, advisor, and placement flows", () => {
    const platform = loadApp("https://example.com/?gpu=rtx4090-24&lang=en", {}, { platformV2: true });
    assert.equal(platform.eval("AVATAR_GENERATION_MODELS.length"), 4);
    assert.equal(platform.document.querySelectorAll("[data-workload-tab='avatarGeneration']").length, 1);
    assert.equal(platform.document.querySelector("#advisorModelCategory option[value='avatar-generation']").textContent, "Avatar / lip sync");
    const museTalk = platform.eval("AVATAR_GENERATION_MODELS.find((model) => model.name.includes('MuseTalk'))");
    const estimate = platform.eval("estimateOcrModel(AVATAR_GENERATION_MODELS.find((model) => model.name.includes('MuseTalk')), getHardware(), { width: 512, height: 512, frames: 81, fps: 25, steps: 1, batchSize: 1, precisionId: 'fp16', offload: 'none', optimization: 'none', loraCount: 0 })");
    assert.equal(museTalk.type, "avatar-generation");
    assert.equal(estimate.unitLabel, "clip/s");
    assert.ok(estimate.requiredGb > 0);
    assert.match(platform.eval("getLicensePolicy(AVATAR_GENERATION_MODELS.find((model) => model.name.includes('LivePortrait'))).summary.en"), /InsightFace|detector/);
  });
});
