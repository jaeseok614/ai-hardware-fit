import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const dataFiles = [
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
  "data/api-models.js",
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

let dom;
let app;

before(() => {
  dom = new JSDOM(read("index.html"), {
    url: "https://example.com/?gpu=rtx3060-12",
    runScripts: "outside-only",
  });
  app = dom.window;
  // jsdom's navigator.language defaults to "en-US". The app now auto-detects the UI
  // language from the browser on a first visit (no ?lang=, no saved preference) --
  // pin the simulated browser to Korean so this suite keeps exercising the app's
  // existing Korean-default assumptions.
  Object.defineProperty(app.navigator, "language", { value: "ko-KR", configurable: true });
  Object.defineProperty(app.navigator, "languages", { value: ["ko-KR", "ko"], configurable: true });
  const source = [
    ...dataFiles.map(read),
    read("ui-foundation.js"),
    read("features/i18n-catalog.js"),
    read("features/estimation-engine.js"),
    read("features/hf-import.js"),
    read("app.js"),
    read("features/i18n-runtime.js"),
    read("features/affiliate-links.js"),
    read("features/gpu-advisor.js"),
    read("features/equipment-planner.js"),
    read("features/advisor-use-profiles.js"),
    read("features/model-placement.js"),
    read("features/api-cost-estimator.js"),
    read("features/ontology-cost-estimator.js"),
    read("features/value-frontier.js"),
    read("features/benchmark-workspace.js"),
    read("platform-v2.js"),
    read("platform-v3.js"),
    "init(); initPlatformV2(); initDecisionStudio();",
  ].join("\n;\n");
  app.eval(source);
});

test("v7.1 key catalog survives Korean-English-Korean round trips", () => {
  app.setUiLanguage("ko");
  const korean = app.document.querySelector("#brandSubtitle").textContent;
  app.setUiLanguage("en");
  assert.equal(app.document.querySelector("#brandSubtitle").textContent, "Can my GPU run this?");
  app.setUiLanguage("ko");
  assert.equal(app.document.querySelector("#brandSubtitle").textContent, korean);
  assert.ok(app.AIHardwareI18n.audit().keyedNodes >= 20);
  assert.deepEqual(Array.from(app.AIHardwareI18n.audit().missing), []);
});

test("v7.2 priority sources and completeness are deterministic", () => {
  assert.equal(app.AIHardwareEvidence.PRIORITY_GPU_IDS.length, 30);
  const priority = app.AIHardwareEvidence.audit(app.LLM_GPU_CHECKER_DATA.gpus, app.LLM_GPU_CHECKER_DATA.koreanGpuMarket).priority;
  assert.equal(priority.length, 30);
  assert.ok(priority.every((row) => row.source.level >= 2));
  const gpu = app.LLM_GPU_CHECKER_DATA.gpus.find((row) => row.id === "rtx5090-32");
  assert.ok(app.AIHardwareDataTrust.scoreGpu(gpu).score >= 80);
  assert.equal(app.AIHardwareDataTrust.freshness("2026-07-20", new Date("2026-08-03T00:00:00Z")).id, "fresh");
  assert.equal(app.AIHardwareDataTrust.freshness("2026-04-01", new Date("2026-08-03T00:00:00Z")).id, "stale");
});

test("v7.3 local behavior counters never retain payload values", () => {
  app.AIHardwareLocalAnalytics.clear();
  assert.equal(app.AIHardwareLocalAnalytics.track("share", { customer: "secret" }), true);
  assert.equal(app.AIHardwareLocalAnalytics.track("unknown_event"), false);
  const summary = app.AIHardwareLocalAnalytics.exportSummary();
  assert.match(summary, /"share": 1/);
  assert.doesNotMatch(summary, /secret|customer/);
});

test("v7.5 terminal results are sanitized before submission", () => {
  const parsed = app.AIHardwareCommunityFeedback.parseTerminalResult(JSON.stringify({
    model: "Qwen3 8B", gpu: "RTX 3060", tokensPerSecond: 42, prompt: "private", apiKey: "secret",
  }));
  assert.deepEqual(Array.from(Object.keys(parsed)).sort(), ["gpu", "model", "tokensPerSecond"]);
  assert.doesNotMatch(app.AIHardwareCommunityFeedback.measurementIssueUrl(parsed), /private|secret/);
  assert.equal(app.AIHardwareCommunityFeedback.neededCombinations().length, 10);
});

test("measurement preview creates a validator-ready issue and holds the link until required facts exist", () => {
  const feedback = app.AIHardwareCommunityFeedback;
  const partial = feedback.measurementReadiness({ model: "Qwen3 8B", gpu: "RTX 3060" });
  assert.equal(partial.ready, false);
  assert.ok(partial.missing.includes("GPU and site GPU ID"));
  assert.ok(partial.missing.includes("measured throughput"));
  const unsupported = feedback.measurementReadiness({
    model: "Qwen3 8B", gpu: "RTX 3060", gpuId: "rtx3060-12", workload: "audio-tts",
    runtime: "PyTorch", tokensPerSecond: 42,
  });
  assert.equal(unsupported.ready, false);
  assert.ok(unsupported.missing.includes("supported workload type"));

  const measurement = {
    model: "Qwen3 8B",
    modelKey: "qwen3-8b",
    gpu: "GeForce RTX 3060 12GB",
    gpuId: "rtx3060-12",
    workload: "generative",
    runtime: "ollama",
    quantization: "Q4_K_M",
    context: 8192,
    outputTokens: 256,
    tokensPerSecond: 98765.43,
    prompt: "do not share this private prompt",
    apiKey: "secret",
  };
  const readiness = feedback.measurementReadiness(measurement);
  assert.equal(readiness.ready, true);
  const previousLanguage = app.document.documentElement.lang;
  let body;
  try {
    app.document.documentElement.lang = "en";
    const url = new URL(feedback.measurementIssueUrl(measurement));
    body = url.searchParams.get("body");
    assert.match(url.searchParams.get("title"), /^\[Benchmark\]/);
    assert.match(body, /### CLI measurement result \(JSON\)/);
    assert.match(body, /### Site GPU ID/);
    assert.match(body, /"gpuId": "rtx3060-12"/);
    assert.match(body, /"tokensPerSecond": 98765\.43/);
    assert.doesNotMatch(body, /private prompt|secret|apiKey/);
  } finally {
    app.document.documentElement.lang = previousLanguage;
  }

  const tempEvent = path.join(os.tmpdir(), `ai-hardware-benchmark-event-${process.pid}.json`);
  fs.writeFileSync(tempEvent, JSON.stringify({ issue: { html_url: "https://github.com/jaeseok614/ai-hardware-fit/issues/99999", body: "" } }));
  try {
    const result = spawnSync(process.execPath, ["scripts/benchmark-request-tools.mjs"], {
      cwd: root,
      env: { ...process.env, GITHUB_EVENT_PATH: tempEvent, BENCHMARK_REQUEST_BODY: body },
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /✅ GPU·모델·실행 조건 확인 완료/);
    assert.match(result.stdout, /tokensPerSecond:\s*98765\.43/);
  } finally {
    fs.unlinkSync(tempEvent);
  }
});

after(() => dom?.window.close());

test("first screen prioritizes three common tasks and keeps advanced tools accessible", () => {
  const actions = app.document.querySelector(".core-task-actions");
  assert.equal(actions.querySelectorAll("[data-core-task]").length, 6);
  assert.equal(actions.querySelectorAll(".core-task-primary [data-core-task]").length, 3);
  assert.equal(actions.querySelectorAll(".core-task-secondary [data-core-task]").length, 3);
  assert.equal(app.document.querySelectorAll(".task-choice-number").length, 0);
  assert.ok(actions.querySelector('[data-core-task="finder"]'));
  assert.ok(actions.querySelector('[data-core-task="modelFinder"]'));
  assert.ok(actions.querySelector('[data-core-task="infra"]'));
  assert.ok(actions.querySelector('[data-core-task="placement"]'));
  assert.ok(actions.querySelector('[data-core-task="apiCost"]'));
  assert.equal(actions.querySelector('[data-core-task="ontologyCost"]'), null);
  assert.ok(actions.querySelector('[data-core-task="community"]'));
  assert.ok(app.document.querySelector(".core-task-more"));
  assert.equal(app.document.querySelector(".core-task-more").open, false);
  assert.ok(app.document.querySelector('[data-demo-gpu="rtx3060-12"]'));
  assert.ok(app.document.querySelector('[data-demo-infra="internal-rag"]'));
  assert.ok(app.document.querySelector('[data-demo-model]'));
  assert.ok(app.document.getElementById("workspaceJourney"));
  assert.ok(app.document.querySelector("[data-open-start-guide]"));
  assert.ok(app.document.querySelector(".app-header [data-open-start-guide]"));
  [...actions.querySelectorAll("[data-core-task]")].forEach((button) => {
    assert.notEqual(button.getAttribute("role"), "tab");
    assert.equal(button.hasAttribute("aria-pressed"), false);
  });
  assert.equal(app.document.querySelector('[data-core-task="finder"]').getAttribute("aria-current"), "page");
  assert.equal(actions.querySelectorAll('[aria-current="page"]').length, 1);

  const html = read("index.html");
  const loader = read("feature-loader.js");
  assert.doesNotMatch(html, /<script src="\.\/features\/(?:api-cost-estimator|ontology-cost-estimator)\.js/);
  assert.match(loader, /loadApiCostEstimator/);
  assert.match(loader, /loadOntologyCostEstimator/);
  assert.doesNotMatch(loader, /decisionTarget/);
});
test("locale helpers and price data trust remain deterministic", () => {
  assert.equal(app.AIHardwareLocale.confidence("낮음", "en"), "Low");
  assert.equal(app.AIHardwareLocale.confidence("Low", "ko"), "낮음");
  assert.match(app.AIHardwareLocale.usedPriceMethod("신품 최저가의 75% 계산 참고값", "en"), /75%/);
  // Coverage counts are derived from the actual KOREAN_GPU_MARKET row count
  // rather than a hardcoded number, so this test doesn't need a manual edit
  // every time price-data coverage grows (only the >= floor guards against
  // an accidental regression that silently drops rows).
  const coverage = app.AIHardwareDataTrust.priceCoverage(
    app.LLM_GPU_CHECKER_DATA.gpus.filter((gpu) => gpu.id !== "custom"),
    app.LLM_GPU_CHECKER_DATA.koreanGpuMarket,
    new Date("2026-08-11T00:00:00Z"),
  );
  const pricedCount = app.LLM_GPU_CHECKER_DATA.koreanGpuMarket.length;
  assert.equal(coverage.sourced, pricedCount);
  assert.equal(coverage.fresh, pricedCount, "every KOREAN_GPU_MARKET row is dated on/before the fixed reference date above, so all of them should count as fresh");
  assert.equal(coverage.missing, coverage.total - coverage.enterpriseOnly - pricedCount);
  assert.equal(coverage.missing + coverage.enterpriseOnly + coverage.sourced, coverage.total, "every GPU should land in exactly one of missing/enterpriseOnly/sourced");
  assert.ok(coverage.enterpriseOnly > 0, "expected at least one GPU to be flagged as enterprise-only (no consumer retail channel)");
  assert.ok(pricedCount >= 37, `price coverage regressed below the last known floor (37 GPUs), got ${pricedCount}`);
  assert.equal(app.AIHardwareDataTrust.validateMarketRows(app.LLM_GPU_CHECKER_DATA.koreanGpuMarket).length, 0);
});

test("selecting a task marks the workspace as started, with no separate change-path button", () => {
  // The always-visible tool-switcher tab bar (GPU→Model / Model→GPU / ...)
  // is itself the way back to another task, so there is no separate "Choose
  // another task" button living inside the progress nav anymore -- clicking
  // a tab (or the header logo, covered by a separate test) is enough.
  assert.equal(app.document.querySelector("[data-change-path]"), null);
  app.document.querySelector('[data-core-task="finder"]').click();
  assert.equal(app.document.getElementById("coreTaskSwitcher").classList.contains("is-collapsed"), true);
  assert.ok(app.document.body.classList.contains("guided-workspace-started"));
});

test("catalog search accepts aliases, typos, and natural GPU conditions", () => {
  const gpus = app.LLM_GPU_CHECKER_DATA.gpus;
  const typo = app.AIHardwareCatalogSearch.search("RTX 509O", gpus, { limit: 1 });
  assert.match(typo[0].name, /5090/);
  const natural = app.AIHardwareCatalogSearch.search("24GB 노트북", gpus, {
    limit: 5,
    filter: (gpu) => gpu.formFactor === "laptop" && Number(gpu.vram) >= 24,
  });
  assert.ok(natural.length > 0);
  assert.ok(natural.every((gpu) => gpu.formFactor === "laptop" && Number(gpu.vram) >= 24));
  app.eval("window.__catalogModels = getAllModels()");
  const speech = app.AIHardwareCatalogSearch.search("음성 합성", app.__catalogModels, { limit: 5 });
  assert.ok(speech.some((model) => model.type === "audio-tts"));
});

test("evidence policy distinguishes official model and family sources", () => {
  const audit = app.AIHardwareEvidence.audit(app.LLM_GPU_CHECKER_DATA.gpus, app.LLM_GPU_CHECKER_DATA.koreanGpuMarket);
  assert.equal(audit.total, app.LLM_GPU_CHECKER_DATA.gpus.filter((gpu) => gpu.id !== "custom").length);
  assert.ok(audit.official > 0);
  assert.ok(audit.family + audit.missing > 0);
  assert.ok(audit.priority.length >= 10);
});

test("workspace journey steps are clickable and navigate between finder steps", () => {
  app.eval('selectPrimaryGpu("rtx3060-12"); coreTaskMode = "finder"; appMode = "simple"; render();');
  const journeySteps = () => app.document.querySelectorAll("#workspaceJourney [data-journey-step]");
  assert.equal(journeySteps().length, 3);
  assert.equal(app.document.getElementById("simpleModePanel").hidden, false);
  assert.equal(app.document.getElementById("expertModeSection").hidden, true);

  // Reading top-level `let appMode` back out through a *separate* app.eval()
  // call is unreliable in this jsdom harness (each eval() gets its own
  // lexical scope for let/const, so the mutation made by the real,
  // in-process click handler doesn't reliably show up that way) -- so this
  // asserts on the DOM side effects setAppMode() itself drives instead,
  // which are backed by real, shared DOM node references.
  journeySteps()[2].dispatchEvent(new app.MouseEvent("click", { bubbles: true }));
  assert.equal(app.document.getElementById("expertModeSection").hidden, false);
  assert.equal(app.document.getElementById("simpleModePanel").hidden, true);

  journeySteps()[1].dispatchEvent(new app.MouseEvent("click", { bubbles: true }));
  assert.equal(app.document.getElementById("simpleModePanel").hidden, false);
  assert.equal(app.document.getElementById("expertModeSection").hidden, true);

  app.eval('gpuChangeExpanded = false; refreshGpuChangePanel();');
  assert.equal(app.document.getElementById("gpuChangePanel").hidden, true);
  journeySteps()[0].dispatchEvent(new app.MouseEvent("click", { bubbles: true }));
  assert.equal(app.document.getElementById("gpuChangePanel").hidden, false);
  assert.equal(app.document.activeElement.id, "gpuPresetTrigger");

  app.eval('gpuChangeExpanded = false; refreshGpuChangePanel(); setCoreTaskMode("infra");');
  assert.equal(app.document.querySelectorAll("#workspaceJourney [data-journey-step]").length, 4);
  assert.match(app.document.querySelector("#workspaceJourney .is-current")?.textContent || "", /서비스 선택/);
  app.eval('setCoreTaskMode("finder"); appMode = "simple"; render();');
});

test("GPU selection renders three quick recommendations", () => {
  app.eval('selectPrimaryGpu("rtx3060-12"); coreTaskMode = "finder"; appMode = "simple"; render();');
  assert.equal(app.document.querySelectorAll(".simple-pick-card").length, 3);
  assert.match(app.document.getElementById("simpleModeGpuReadout").textContent, /RTX 3060/);
  const missingCapabilities = app.eval(`getAllModels().filter((model) =>
    !model.capabilities?.useCases?.length
    || !model.capabilities?.inputModality?.length
    || !model.capabilities?.outputModality?.length
  ).length`);
  assert.equal(missingCapabilities, 0, "every catalog model should have normalized capabilities");
  const capabilityEvidenceMissing = app.eval(`getAllModels().filter((model) =>
    model.capabilities.useCases.some((useCase) => !model.capabilities.useCaseEvidence?.[useCase])
  ).length`);
  assert.equal(capabilityEvidenceMissing, 0, "every use case should explain its evidence");
  assert.notEqual(
    app.eval(`getAllModels().filter((model) => model.type === "audio-tts" && model.capabilities.useCases.includes("voiceCloning")).length`),
    app.eval(`getAllModels().filter((model) => model.type === "audio-tts").length`),
    "voice cloning must not be assigned to every TTS model",
  );
});

test("the \"내 GPU\" picker is a custom in-flow dropdown, not a native <select> overlay", () => {
  app.eval('gpuChangeExpanded = true; refreshGpuChangePanel();');
  const trigger = app.document.getElementById("gpuPresetTrigger");
  const panel = app.document.getElementById("gpuPresetListPanel");
  const filter = app.document.getElementById("gpuPresetFilter");
  assert.equal(panel.hidden, true);
  assert.equal(trigger.getAttribute("aria-expanded"), "false");

  // Opening the list must not switch to position:absolute/overlay styling --
  // it's meant to grow the panel in place instead of covering the page, so
  // the underlying native <select> stays hidden throughout.
  assert.equal(app.document.getElementById("gpuPreset").hidden, true);

  trigger.dispatchEvent(new app.MouseEvent("click", { bubbles: true }));
  assert.equal(panel.hidden, false);
  assert.equal(trigger.getAttribute("aria-expanded"), "true");
  assert.ok(app.document.querySelectorAll("#gpuPresetList [data-gpu-preset-option]").length > 100);

  filter.value = "5090";
  filter.dispatchEvent(new app.Event("input", { bubbles: true }));
  const visible = () => [...app.document.querySelectorAll("#gpuPresetList [data-gpu-preset-option]")].filter((item) => !item.hidden);
  assert.ok(visible().length >= 1 && visible().length < 10);
  assert.equal(app.document.getElementById("gpuPresetListEmpty").hidden, true);

  visible()[0].dispatchEvent(new app.MouseEvent("click", { bubbles: true }));
  assert.equal(panel.hidden, true, "choosing an option closes the list");
  assert.equal(app.document.getElementById("gpuPreset").value, "rtx5090-32");
  assert.equal(app.document.getElementById("gpuPresetTriggerLabel").textContent, "지포스 RTX 5090 32GB");
  assert.equal(app.document.getElementById("gpuPresetOption-rtx5090-32").getAttribute("aria-selected"), "true");

  // Keyboard: Enter on the highlighted (first) filtered option selects it.
  trigger.dispatchEvent(new app.MouseEvent("click", { bubbles: true }));
  filter.value = "rtx 4090";
  filter.dispatchEvent(new app.Event("input", { bubbles: true }));
  filter.dispatchEvent(new app.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  assert.equal(app.document.getElementById("gpuPreset").value, "rtx4090-24");
  assert.equal(panel.hidden, true);

  // Escape closes without changing the current selection.
  trigger.dispatchEvent(new app.MouseEvent("click", { bubbles: true }));
  assert.equal(panel.hidden, false);
  filter.dispatchEvent(new app.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  assert.equal(panel.hidden, true);
  assert.equal(app.document.getElementById("gpuPreset").value, "rtx4090-24");

  // A query with no matches shows the empty state instead of an empty list.
  trigger.dispatchEvent(new app.MouseEvent("click", { bubbles: true }));
  filter.value = "no-such-gpu-zzz";
  filter.dispatchEvent(new app.Event("input", { bubbles: true }));
  assert.equal(visible().length, 0);
  assert.equal(app.document.getElementById("gpuPresetListEmpty").hidden, false);

  // Clicking outside the combo closes it too.
  filter.value = "";
  filter.dispatchEvent(new app.Event("input", { bubbles: true }));
  app.document.body.dispatchEvent(new app.MouseEvent("click", { bubbles: true }));
  assert.equal(panel.hidden, true);

  app.eval('selectPrimaryGpu("rtx3060-12"); coreTaskMode = "finder"; appMode = "simple"; render();');
});

test("quick recommendations keep purpose choices and models inside the selected workload", () => {
  const ttsTab = app.document.querySelector('[data-workload-tab="audioTts"]');
  ttsTab.dispatchEvent(new app.MouseEvent("click", { bubbles: true }));

  const purpose = app.document.getElementById("simplePurpose");
  assert.equal(purpose.dataset.workload, "audioTts");
  assert.deepEqual(
    [...purpose.options].map((option) => option.value),
    ["natural", "realtime", "voiceCloning", "multilingual", "lightweight"],
  );
  assert.doesNotMatch(purpose.textContent, /코딩|추론|긴 문서/);

  const cards = [...app.document.querySelectorAll(".simple-pick-card")];
  assert.ok(cards.length > 0, "expected at least one runnable TTS recommendation");
  assert.ok(cards.every((card) => card.dataset.workload === "audioTts"));
  assert.ok(cards.every((card) => card.dataset.modelType === "audio-tts"));
  assert.doesNotMatch(app.document.getElementById("simpleModeResult").textContent, /Wan2\.1|video/i);

  purpose.value = "voiceCloning";
  purpose.dispatchEvent(new app.Event("change", { bubbles: true }));
  assert.match(app.document.getElementById("simpleModeResult").textContent, /XTTS-v2/);
  assert.match(app.document.getElementById("simpleModeResult").textContent, /목소리 복제 용도 지원/);

  app.document.querySelector("[data-language-toggle] [data-lang='en']")
    .dispatchEvent(new app.MouseEvent("click", { bubbles: true }));
  assert.match(purpose.textContent, /Natural narration|Voice cloning/);
  assert.doesNotMatch(purpose.textContent, /[가-힣]/);
  app.document.querySelector("[data-language-toggle] [data-lang='ko']")
    .dispatchEvent(new app.MouseEvent("click", { bubbles: true }));
  assert.doesNotMatch(
    app.document.getElementById("simpleModeResult").textContent,
    /Calculated estimate|Copy run command|Approx\./,
  );
  app.document.querySelector('[data-workload-tab="generative"]')
    .dispatchEvent(new app.MouseEvent("click", { bubbles: true }));
});

test("English promise and recommendation cards state the evidence level", () => {
  app.eval('setUiLanguage("en"); selectPrimaryGpu("rtx3060-12"); activeWorkload = "generative"; appMode = "simple"; render();');
  assert.equal(app.document.getElementById("onboardingTitle").textContent.trim(), "Can my GPU run this?");
  assert.equal(app.document.title, "Can my GPU run this? — AI Hardware Fit");

  const cards = [...app.document.querySelectorAll("#simpleModeResult .simple-pick-card")];
  const evidence = [...app.document.querySelectorAll("#simpleModeResult .evidence-badge")]
    .map((badge) => badge.textContent.trim());
  assert.ok(cards.length > 0, "expected quick recommendations");
  assert.equal(evidence.length, cards.length, "expected an evidence label on every quick recommendation");
  assert.ok(evidence.every((label) => label.startsWith("VRAM: formula · Speed:")));
  assert.ok(evidence.every((label) => /range ±\d+%$/.test(label)));
  assert.ok(evidence.some((label) => /calibrated|exact-condition|related|public reference|no matching measurements, calculated/.test(label)));

  app.eval('setUiLanguage("ko");');
});

test("community run feedback keeps visible hardware conditions in a privacy-conscious issue link", () => {
  const feedback = app.AIHardwareCommunityFeedback;
  assert.match(feedback.buttons("ko"), /실행됐어요/);
  assert.match(feedback.buttons("ko"), /실행 안 됐어요/);
  const url = feedback.feedbackUrl({
    outcome: "success",
    model: "XTTS-v2",
    gpu: "GeForce RTX 3060 12GB",
    workload: "음성 합성",
    purpose: "목소리 복제",
    runtime: "PyTorch",
    setting: "FP16",
    requiredGb: "4.2 GB",
    estimatedSpeed: "실시간",
  });
  assert.match(url, /github\.com\/jaeseok614\/ai-hardware-fit\/issues\/new/);
  const feedbackBody = new URL(url).searchParams.get("body");
  assert.match(feedbackBody, /XTTS-v2/);
  assert.match(feedbackBody, /RTX 3060/);
  assert.doesNotMatch(feedbackBody, /고객명:|프로젝트명:/);
});

test("full catalog and advisor produce usable results", () => {
  app.eval('setAppMode("expert");');
  assert.ok(app.document.querySelectorAll("#modelResults [data-model-key]").length > 0);
  app.eval(`
    setCoreTaskMode("modelFinder");
    const smokeModel = getAllModels().find((model) => model.name.includes("TinyLlama")) || getAllModels()[0];
    document.getElementById("advisorModel").value = modelKey(smokeModel);
    document.getElementById("advisorBudgetUsd").value = "0";
    document.getElementById("advisorVendor").value = "all";
    document.getElementById("advisorFormFactor").value = "all";
    renderGpuAdvisor();
    const smokeHardware = getHardware();
    const smokeEstimate = estimateAnyModelForHardware(smokeModel, smokeHardware);
    window.__smokeAdvisorDebug = {
      model: smokeModel.name,
      quantization: document.getElementById("quantization").value,
      gpu: smokeHardware.preset?.name,
      grade: smokeEstimate?.grade,
      speed: smokeEstimate?.speed,
      requiredGb: smokeEstimate?.requiredGb,
    };
  `);
  assert.ok(
    app.document.querySelectorAll(".gpu-advisor-card").length > 0,
    `${app.document.getElementById("gpuAdvisorResult").textContent.trim()} ${JSON.stringify(app.__smokeAdvisorDebug)}`,
  );
  app.eval('setUiLanguage("ko"); renderGpuAdvisor();');
  assert.equal(app.document.getElementById("advisorBudgetUsd").dataset.currency, "KRW");
  assert.equal(app.document.querySelectorAll(".gpu-advisor-card").length, 3);

  // Each recommendation card should offer a "이 사양대로 사기" affiliate
  // buy link out to Coupang -- a plain (non-tracked) search link until a
  // real Coupang Partners deep link has been generated for that GPU.
  const buyLinks = [...app.document.querySelectorAll(".gpu-advisor-card .gpu-buy-link")];
  assert.equal(buyLinks.length, 3);
  buyLinks.forEach((link) => {
    assert.match(link.getAttribute("href"), /^https:\/\/www\.coupang\.com\/np\/search\?q=/);
    assert.equal(link.getAttribute("rel"), "noopener noreferrer sponsored");
  });
});

test("advanced placement remains available but outside the beginner choices", () => {
  app.eval('openPlacementPlanner([], { showBuilder: true, seedHardware: true });');
  assert.equal(app.document.body.classList.contains("placement-task-active"), true);
  assert.equal(app.document.getElementById("gpuPlacementPanel").hidden, false);
});

test("the multi-model placement demo chip seeds two GPUs and both models", () => {
  app.document.querySelector('[data-demo-placement="1"]').click();
  assert.equal(app.document.getElementById("gpuPlacementPanel").hidden, false);
  const selected = app.document.getElementById("placementModelSelected").textContent;
  assert.match(selected, /Llama 3\.1 70B Instruct/);
  assert.match(selected, /Qwen3-Embedding-4B/);
  assert.equal(app.document.querySelectorAll("#gpuInventoryList .gpu-inventory-row").length, 1);
  assert.equal(app.document.querySelector("#gpuInventoryList .gpu-inventory-row").textContent.includes("RTX 4090"), true);
  app.eval('placementSelectedKeys = new Set(); gpuInventoryRows = []; placementInventorySeeded = false;');
});

test("the ontology-construction placement demo chip seeds a distinct 1-GPU extraction+embedding pipeline", () => {
  app.document.querySelector('[data-demo-placement="2"]').click();
  assert.equal(app.document.getElementById("gpuPlacementPanel").hidden, false);
  const selected = app.document.getElementById("placementModelSelected").textContent;
  assert.match(selected, /Qwen2\.5 32B Instruct/);
  assert.match(selected, /Qwen3-Embedding-4B/);
  assert.equal(app.document.querySelectorAll("#gpuInventoryList .gpu-inventory-row").length, 1);
  assert.equal(app.document.querySelector("#gpuInventoryList .gpu-inventory-row").textContent.includes("RTX 5090"), true);
  app.eval('placementSelectedKeys = new Set(); gpuInventoryRows = []; placementInventorySeeded = false;');
});

test("API vs Local defaults to tier-matched models with a computed usage summary, and can expand to all 13", () => {
  app.document.querySelector('[data-core-task="apiCost"]').click();
  assert.equal(app.document.body.classList.contains("api-cost-task-active"), true);
  assert.equal(app.document.getElementById("apiCostPanel").hidden, false);
  assert.match(app.document.getElementById("apiCostTitle").textContent, /API vs Local/);

  // Default view: one candidate per provider with a balanced entry,
  // not the full API catalog upfront.
  const compactRows = () => app.document.querySelectorAll("#apiCostTable .api-cost-candidate-card");
  assert.equal(compactRows().length, 4);
  assert.equal(app.document.getElementById("apiCostTier").value, "balanced");
  [...compactRows()].forEach((row) => assert.match(row.querySelector(".api-cost-candidate-rates").textContent, /균형형/));
  const cheapestRow = app.document.querySelector("#apiCostTable .api-cost-candidate-card.is-cheapest");
  assert.ok(cheapestRow, "the cheapest shown candidate should be flagged, even though it isn't the globally cheapest model");
  assert.equal(cheapestRow.classList.contains("is-selected"), true, "before any card is clicked, the cheapest card should be selected by default");
  assert.equal(cheapestRow.getAttribute("aria-selected"), "true");

  // The panel leads with a plain-language "결론" verdict banner (which side
  // is cheaper, the monthly figures for both, and a break-even sentence),
  // computed from the same numbers as the rest of the panel.
  const verdict = app.document.getElementById("apiCostVerdict").textContent;
  assert.match(verdict, /API 사용이 유리|Local 구축이 유리/);
  assert.match(verdict, /API 최저 비용/);
  assert.match(verdict, /Local 환산 비용/);
  assert.match(verdict, /₩[\d,]+/);

  // A small inline SVG chart visualizes the API-vs-Local break-even point.
  const chart = app.document.querySelector("#apiCostBreakeven svg.api-cost-chart");
  assert.ok(chart, "a break-even chart should render once usage is non-zero");
  assert.ok(chart.querySelector(".api-cost-chart-api-line"), "the chart should draw the rising API cost line");
  assert.ok(chart.querySelector(".api-cost-chart-local-line"), "the chart should draw the flat Local cost line");

  // Candidate cards are clickable options in a listbox: clicking a
  // non-cheapest card should make the verdict banner and break-even chart
  // recompute against that card's provider instead of always the cheapest.
  assert.equal(app.document.getElementById("apiCostTable").getAttribute("role"), "listbox");
  const otherCard = [...compactRows()].find((row) => !row.classList.contains("is-cheapest"));
  assert.ok(otherCard, "there should be a non-cheapest candidate card to select");
  assert.equal(otherCard.getAttribute("role"), "option");
  const otherProvider = otherCard.getAttribute("data-provider");
  otherCard.click();
  const reselected = app.document.querySelector(`#apiCostTable .api-cost-candidate-card[data-provider="${otherProvider}"]`);
  assert.equal(reselected.classList.contains("is-selected"), true);
  assert.equal(reselected.getAttribute("aria-selected"), "true");
  const cheapestAfterSelect = app.document.querySelector("#apiCostTable .api-cost-candidate-card.is-cheapest");
  assert.equal(cheapestAfterSelect.classList.contains("is-selected"), false, "selecting a different card should deselect the previously-selected cheapest card");
  const verdictAfterSelect = app.document.getElementById("apiCostVerdict").textContent;
  assert.match(verdictAfterSelect, new RegExp(`${otherProvider}.*비용`));
  const chartAfterSelect = app.document.getElementById("apiCostBreakeven").textContent;
  assert.match(chartAfterSelect, new RegExp(otherProvider));
  // Clicking the same card again deselects it, reverting to the cheapest.
  reselected.click();
  assert.match(app.document.getElementById("apiCostVerdict").textContent, /API 최저 비용/);
  assert.equal(app.document.querySelector("#apiCostTable .api-cost-candidate-card.is-cheapest").classList.contains("is-selected"), true);

  // "비교 조건" (comparison conditions): plain computed numbers, not framed
  // as an AI "해석" of the inputs -- every figure should be a deterministic
  // function of the 3 usage fields plus the selected quality tier.
  const summary = app.document.getElementById("apiCostUsageSummary").textContent;
  assert.match(summary, /100,000/); // monthly requests
  assert.match(summary, /200,000,000/); // monthly input tokens = requests x 2,000
  assert.match(summary, /50,000,000/); // monthly output tokens = requests x 500
  assert.match(summary, /250,000,000/); // total throughput
  assert.match(summary, /균형형/); // selected quality tier

  // Choosing a workload pre-selects (but does not lock) a typical tier for it.
  app.document.getElementById("apiCostWorkload").value = "coding";
  app.document.getElementById("apiCostWorkload").dispatchEvent(new app.Event("change"));
  assert.equal(app.document.getElementById("apiCostTier").value, "flagship");
  assert.equal(compactRows().length, 5);
  [...compactRows()].forEach((row) => assert.match(row.querySelector(".api-cost-candidate-rates").textContent, /플래그십/));
  assert.match(app.document.getElementById("apiCostTierHint").textContent, /코딩.*플래그십/);

  // The full catalog expands with the provider/tier
  // filter and sortable columns; collapsing goes back to the compact view.
  const expandToggle = app.document.getElementById("apiCostExpandToggle");
  assert.match(expandToggle.textContent, /13/);
  assert.equal(app.document.getElementById("apiCostExpanded").hidden, true);
  expandToggle.click();
  assert.equal(app.document.getElementById("apiCostExpanded").hidden, false);
  assert.equal(app.document.querySelectorAll("#apiCostFullTable tbody tr").length, 13);
  expandToggle.click();
  assert.equal(app.document.getElementById("apiCostExpanded").hidden, true);
  assert.equal(compactRows().length, 5, "collapsing back should restore the compact tier-matched view");
  app.document.getElementById("apiCostWorkload").value = "general";
  app.document.getElementById("apiCostWorkload").dispatchEvent(new app.Event("change"));

  // Changing usage inputs should recompute the table (not just relabel it).
  const before = app.document.getElementById("apiCostTable").textContent;
  app.document.getElementById("apiCostMonthlyRequests").value = "1000000";
  app.document.getElementById("apiCostMonthlyRequests").dispatchEvent(new app.Event("input"));
  const after = app.document.getElementById("apiCostTable").textContent;
  assert.notEqual(before, after, "raising monthly requests 10x should change the computed costs");

  // English round trip: no Korean text should leak, and the KRW figures
  // should still render (using the "₩" symbol, not the word "원", so they
  // remain readable without themselves being flagged as untranslated copy).
  app.eval('setUiLanguage("en");');
  assert.doesNotMatch(app.document.getElementById("apiCostPanel").textContent, /[가-힣]/);
  assert.match(app.document.getElementById("apiCostTable").textContent, /₩[\d,]+/);
  assert.match(app.document.getElementById("apiCostPanel").textContent, /Cheapest/);
  app.eval('setUiLanguage("ko");');
});

test("API vs Local shows a real self-hosted Local cost section, not just a link to the infra flow", () => {
  app.document.querySelector('[data-core-task="apiCost"]').click();
  app.document.getElementById("apiCostTier").value = "balanced";
  app.document.getElementById("apiCostTier").dispatchEvent(new app.Event("change"));
  const local = () => app.document.getElementById("apiCostLocal");

  // The default ("balanced") tier should show a real reference model/GPU
  // combo, a purchase price, and a monthly amortized cost -- not an empty
  // placeholder or just a link out to the infra sizing flow.
  assert.match(local().textContent, /Qwen2\.5 32B Instruct/);
  assert.match(local().textContent, /RTX 5090/);
  assert.match(local().textContent, /₩[\d,]+/);

  // Switching the quality tier should swap in that tier's own reference
  // model/GPU (not just relabel the same numbers).
  app.document.getElementById("apiCostTier").value = "economy";
  app.document.getElementById("apiCostTier").dispatchEvent(new app.Event("change"));
  assert.match(local().textContent, /Qwen3 8B/);
  assert.match(local().textContent, /RTX 4060 Ti/);

  app.document.getElementById("apiCostTier").value = "flagship";
  app.document.getElementById("apiCostTier").dispatchEvent(new app.Event("change"));
  assert.match(local().textContent, /Llama 3\.3 70B Instruct/);
  assert.match(local().textContent, /RTX 6000 Ada/);
  app.document.getElementById("apiCostTier").value = "balanced";
  app.document.getElementById("apiCostTier").dispatchEvent(new app.Event("change"));

  // English round trip: no Korean text should leak from this new section.
  app.eval('setUiLanguage("en");');
  assert.doesNotMatch(local().textContent, /[가-힣]/);
  assert.match(local().textContent, /Self-hosted/);
  app.eval('setUiLanguage("ko");');
});

test("API vs Local's ontology-construction 용도 redirects to the Ontology Cost tab instead of pricing it as monthly traffic", () => {
  app.document.querySelector('[data-core-task="apiCost"]').click();
  app.document.getElementById("apiCostWorkload").value = "ontology";
  app.document.getElementById("apiCostWorkload").dispatchEvent(new app.Event("change"));
  const hint = app.document.getElementById("apiCostTierHint");
  assert.match(hint.textContent, /온톨로지 구축/);
  assert.match(hint.textContent, /1회성 배치/);
  const link = hint.querySelector('[data-core-task="ontologyCost"]');
  assert.ok(link, "the redirect note should contain a real button, not just text mentioning the tab");
  link.click();
  assert.equal(app.document.body.classList.contains("ontology-cost-task-active"), true);
  assert.equal(app.document.getElementById("ontologyCostPanel").hidden, false);

  // Reset back to apiCost/general for tests that run after this one.
  app.document.querySelector('[data-core-task="apiCost"]').click();
  app.document.getElementById("apiCostWorkload").value = "general";
  app.document.getElementById("apiCostWorkload").dispatchEvent(new app.Event("change"));
});

test("API vs Local includes a Cloud rental section (RunPod/Vast.ai/Lambda) that feeds the verdict banner and break-even chart", () => {
  app.document.querySelector('[data-core-task="apiCost"]').click();
  const cloud = () => app.document.getElementById("apiCostCloud");

  // Default ("balanced") tier: all 3 providers have a comparable GPU, so
  // all 3 render as priced cards, one of them flagged cheapest.
  const cloudCards = () => cloud().querySelectorAll(".api-cost-cloud-card");
  assert.equal(cloudCards().length, 3);
  const cheapestCloudCard = cloud().querySelector(".api-cost-cloud-card.is-cheapest");
  assert.ok(cheapestCloudCard, "the cheapest cloud provider for this tier should be flagged");
  assert.match(cloud().textContent, /₩[\d,]+/);
  // Every priced card should link out to rent at that provider (referral
  // link when configured, plain link otherwise -- either way a real href).
  cloudCards().forEach((card) => {
    const link = card.querySelector("a");
    if (link) assert.match(link.getAttribute("href"), /^https:\/\//);
  });

  // The verdict banner and break-even chart should incorporate the cloud
  // figure, not just API vs Local.
  const verdict = app.document.getElementById("apiCostVerdict").textContent;
  assert.match(verdict, /클라우드 최저가/);
  const breakevenHtml = app.document.getElementById("apiCostBreakeven").innerHTML;
  assert.ok(breakevenHtml.includes("api-cost-chart-cloud-line"), "the break-even chart should draw a flat line for the cheapest cloud provider");

  // Regression: Local's and the cheapest Cloud provider's monthly costs
  // are often close in value, which used to leave their two "-8px above
  // the line" labels overlapping into unreadable garbled text (reported
  // directly against production). Whatever their actual costs, the two
  // labels' y positions must always be at least one label-height apart.
  const breakevenSvg = app.document.getElementById("apiCostBreakeven").querySelector("svg");
  const localLabelY = Number(breakevenSvg.querySelector(".api-cost-chart-local-label").getAttribute("y"));
  const cloudLabelY = Number(breakevenSvg.querySelector(".api-cost-chart-cloud-label").getAttribute("y"));
  assert.ok(
    Math.abs(localLabelY - cloudLabelY) >= 14,
    `Local and Cloud chart labels should never render close enough to overlap (got ${localLabelY} vs ${cloudLabelY})`,
  );

  // Economy tier: Lambda has no consumer-tier GPU, so its card should be
  // clearly marked unavailable rather than silently omitted or priced at 0.
  app.document.getElementById("apiCostTier").value = "economy";
  app.document.getElementById("apiCostTier").dispatchEvent(new app.Event("change"));
  assert.equal(cloudCards().length, 3, "even an unavailable provider should still render its own card, just marked unavailable");
  const unavailableCard = cloud().querySelector(".api-cost-cloud-card.is-unavailable");
  assert.ok(unavailableCard, "Lambda should be marked unavailable in the economy tier");
  assert.match(unavailableCard.textContent, /Lambda/);
  app.document.getElementById("apiCostTier").value = "balanced";
  app.document.getElementById("apiCostTier").dispatchEvent(new app.Event("change"));

  // English round trip: no Korean text should leak from this new section.
  app.eval('setUiLanguage("en");');
  assert.doesNotMatch(cloud().textContent, /[가-힣]/);
  assert.match(cloud().textContent, /Cloud rental cost/);
  assert.match(app.document.getElementById("apiCostVerdict").textContent, /Cheapest Cloud rental/);
  app.eval('setUiLanguage("ko");');
});

test("Ontology Cost tab estimates a one-time document-processing cost, separate from API vs Local's monthly figures", () => {
  app.eval('setCoreTaskMode("ontologyCost");');
  const panel = () => app.document.getElementById("ontologyCostPanel");
  assert.equal(panel().hidden, false);
  assert.equal(app.document.getElementById("resultsPanel").hidden, true, "GPU results should not leak into the ontology-cost workspace");
  assert.equal(app.document.getElementById("benchmarkSheet").hidden, true, "the full benchmark sheet should not leak into the ontology-cost workspace");
  assert.equal(app.document.body.dataset.workspace, "ontologyCost");

  // Pure math sanity check, independent of the DOM: doubling the pass
  // count should exactly double both total input and total output tokens
  // (and therefore cost), since each pass re-reads the same corpus size.
  const onePass = app.AIHardwareOntologyCost.estimateOntologyCost({ docTokens: 500000, passProfileKey: "single" });
  const threePass = app.AIHardwareOntologyCost.estimateOntologyCost({ docTokens: 500000, passProfileKey: "thorough" });
  assert.equal(threePass[0].totalInputTokens, onePass[0].totalInputTokens * 3);
  assert.ok(threePass[0].costUsd > onePass[0].costUsd);

  // Page count -> token count conversion: a scanned document should cost
  // more tokens than the same page count of plain text (vision processing
  // assumption), by exactly the documented multiplier.
  const textTokens = app.AIHardwareOntologyCost.docTokensFromPages(500, "text");
  const scannedTokens = app.AIHardwareOntologyCost.docTokensFromPages(500, "scanned");
  assert.equal(scannedTokens, textTokens * app.AIHardwareOntologyCost.DOC_TYPE_MULTIPLIER.scanned);

  // Resolution only matters for scanned docs -- a text document ignores it
  // entirely (no "resolution" concept applies), while a scanned document's
  // token count scales with RESOLUTION_MULTIPLIER for whichever level is
  // passed in.
  assert.equal(
    app.AIHardwareOntologyCost.docTokensFromPages(500, "text", "high"),
    app.AIHardwareOntologyCost.docTokensFromPages(500, "text", "low"),
    "resolution should be a no-op for text documents",
  );
  const lowResTokens = app.AIHardwareOntologyCost.docTokensFromPages(500, "scanned", "low");
  const highResTokens = app.AIHardwareOntologyCost.docTokensFromPages(500, "scanned", "high");
  assert.equal(lowResTokens, 500 * 650 * app.AIHardwareOntologyCost.RESOLUTION_MULTIPLIER.low);
  assert.equal(highResTokens, 500 * 650 * app.AIHardwareOntologyCost.RESOLUTION_MULTIPLIER.high);
  assert.ok(highResTokens > scannedTokens && scannedTokens > lowResTokens);

  // Default (balanced tier, thorough/3-pass profile, text document) renders
  // one candidate card per provider for that tier, one of them flagged
  // cheapest, with a real (non-zero) cost shown in both USD and KRW.
  const cards = () => panel().querySelectorAll(".api-cost-candidate-card");
  assert.equal(cards().length, 4);
  const cheapestCard = panel().querySelector(".api-cost-candidate-card.is-cheapest");
  assert.ok(cheapestCard, "the cheapest provider for this tier should be flagged");
  assert.match(panel().textContent, /₩[\d,]+/);

  // Cards are real, selectable options (unlike a static list): clicking one
  // marks it selected and reveals its own input/output cost breakdown,
  // clicking again hides it.
  assert.equal(app.document.getElementById("ontologyCostTable").getAttribute("role"), "listbox");
  assert.equal(cards()[0].tagName, "BUTTON");
  assert.equal(cards()[0].getAttribute("aria-selected"), "false");
  cards()[0].click();
  assert.equal(cards()[0].getAttribute("aria-selected"), "true");
  assert.match(cards()[0].textContent, /입력 비용/);
  cards()[0].click();
  assert.equal(cards()[0].getAttribute("aria-selected"), "false");
  assert.doesNotMatch(cards()[0].textContent, /입력 비용/);

  // Raising the document page count should raise every rendered candidate's cost.
  const docPagesInput = app.document.getElementById("ontologyCostDocPages");
  const costBefore = panel().querySelector(".api-cost-candidate-cost").textContent;
  docPagesInput.value = "5000";
  docPagesInput.dispatchEvent(new app.Event("input"));
  const costAfter = panel().querySelector(".api-cost-candidate-cost").textContent;
  assert.notEqual(costBefore, costAfter);
  docPagesInput.value = "500";
  docPagesInput.dispatchEvent(new app.Event("input"));

  // Switching document type to "scanned image" should raise the cost (same
  // page count, more tokens per page) and add a scan-specific caveat. The
  // resolution selector is meaningless for a text document, so it starts
  // disabled and only becomes usable once "scanned" is chosen.
  const docTypeSelect = app.document.getElementById("ontologyCostDocType");
  const resolutionSelect = app.document.getElementById("ontologyCostResolution");
  assert.equal(resolutionSelect.disabled, true, "resolution should be disabled for a text document");
  const textCost = panel().querySelector(".api-cost-candidate-cost").textContent;
  docTypeSelect.value = "scanned";
  docTypeSelect.dispatchEvent(new app.Event("change"));
  assert.equal(resolutionSelect.disabled, false, "resolution should become usable once docType is scanned");
  const scannedCost = panel().querySelector(".api-cost-candidate-cost").textContent;
  assert.notEqual(textCost, scannedCost);
  assert.match(app.document.getElementById("ontologyCostCaveat").textContent, /비전 처리/);

  // Raising the resolution level (standard -> high) should raise the cost
  // further still, and lowering it (standard -> low) should lower it --
  // resolution scales cost on top of the base scanned-doc multiplier.
  const standardScannedCost = panel().querySelector(".api-cost-candidate-cost").textContent;
  resolutionSelect.value = "high";
  resolutionSelect.dispatchEvent(new app.Event("change"));
  const highResCost = panel().querySelector(".api-cost-candidate-cost").textContent;
  assert.notEqual(standardScannedCost, highResCost);
  resolutionSelect.value = "low";
  resolutionSelect.dispatchEvent(new app.Event("change"));
  const lowResCost = panel().querySelector(".api-cost-candidate-cost").textContent;
  assert.notEqual(standardScannedCost, lowResCost);
  assert.notEqual(highResCost, lowResCost);
  resolutionSelect.value = "standard";
  resolutionSelect.dispatchEvent(new app.Event("change"));

  docTypeSelect.value = "text";
  docTypeSelect.dispatchEvent(new app.Event("change"));
  assert.equal(resolutionSelect.disabled, true, "resolution should go back to disabled once docType is text again");

  // Switching pipeline depth to "extraction only" should lower the cost
  // (fewer passes over the same corpus).
  const passSelect = app.document.getElementById("ontologyCostPassProfile");
  const thoroughCost = panel().querySelector(".api-cost-candidate-cost").textContent;
  passSelect.value = "single";
  passSelect.dispatchEvent(new app.Event("change"));
  const singleCost = panel().querySelector(".api-cost-candidate-cost").textContent;
  assert.notEqual(thoroughCost, singleCost);
  passSelect.value = "thorough";
  passSelect.dispatchEvent(new app.Event("change"));

  // This is a distinct, one-time-batch estimate, not the same monthly
  // "API vs Local" figure -- the caveat text should say so explicitly.
  assert.match(app.document.getElementById("ontologyCostCaveat").textContent, /가정값/);

  // English round trip: no Korean text should leak from this new panel.
  app.eval('setUiLanguage("en");');
  assert.doesNotMatch(panel().textContent, /[가-힣]/);
  assert.match(panel().textContent, /Ontology construction cost/);
  app.eval('setUiLanguage("ko");');
});

test("API vs Local's expanded 13-model table supports provider/tier filtering and column sorting", () => {
  app.document.querySelector('[data-core-task="apiCost"]').click();
  app.document.getElementById("apiCostExpandToggle").click();
  const table = () => app.document.getElementById("apiCostFullTable");
  const providerSelect = app.document.getElementById("apiCostProviderFilter");
  const tierSelect = app.document.getElementById("apiCostTierFilter");
  assert.ok(providerSelect, "a provider filter should exist");
  assert.ok(tierSelect, "a tier filter should exist");
  // "All providers"/"All tiers" plus one option per real value (5 providers,
  // 3 tiers in the current catalog).
  assert.equal(providerSelect.querySelectorAll("option").length, 6);
  assert.equal(tierSelect.querySelectorAll("option").length, 4);

  providerSelect.value = "Anthropic";
  providerSelect.dispatchEvent(new app.Event("change"));
  let rows = [...table().querySelectorAll("tbody tr")];
  assert.equal(rows.length, 4, "filtering to Anthropic should include its three tiers and premium flagship");
  rows.forEach((row) => assert.equal(row.cells[0].textContent, "Anthropic"));

  tierSelect.value = "flagship";
  tierSelect.dispatchEvent(new app.Event("change"));
  rows = [...table().querySelectorAll("tbody tr")];
  assert.equal(rows.length, 2, "the flagship filter should retain both Opus and Fable");
  assert.match(rows.map((row) => row.cells[1].textContent).join(" "), /Opus.*Fable|Fable.*Opus/);

  providerSelect.value = "all";
  providerSelect.dispatchEvent(new app.Event("change"));
  tierSelect.value = "all";
  tierSelect.dispatchEvent(new app.Event("change"));
  assert.equal(table().querySelectorAll("tbody tr").length, 13, "clearing both filters should restore all tracked models");

  // Clicking the "Provider" column header should sort alphabetically by
  // provider instead of the default cost-ascending order. The header
  // <th> is rebuilt (a fresh element replaces it) on every render, so
  // re-query it after each click rather than reusing a stale reference.
  table().querySelector('[data-sort-key="provider"]').click();
  const providersAsc = [...table().querySelectorAll("tbody tr")].map((row) => row.cells[0].textContent);
  const expectedAsc = [...providersAsc].sort((a, b) => a.localeCompare(b));
  assert.deepEqual(providersAsc, expectedAsc);
  assert.equal(table().querySelector('[data-sort-key="provider"]').getAttribute("aria-sort"), "ascending");

  // Clicking the same header again should reverse the sort direction.
  table().querySelector('[data-sort-key="provider"]').click();
  const providersDesc = [...table().querySelectorAll("tbody tr")].map((row) => row.cells[0].textContent);
  assert.deepEqual(providersDesc, [...expectedAsc].reverse());
  assert.equal(table().querySelector('[data-sort-key="provider"]').getAttribute("aria-sort"), "descending");

  // Restore the default cost-ascending sort so later tests (and any state
  // this suite still reads from the API cost panel) see the original order.
  table().querySelector('[data-sort-key="cost"]').click();
  if (table().querySelector('[data-sort-key="cost"]').getAttribute("aria-sort") !== "ascending") {
    table().querySelector('[data-sort-key="cost"]').click();
  }
  assert.equal(table().querySelector('[data-sort-key="cost"]').getAttribute("aria-sort"), "ascending");
});

test("infra sizing shows a build-vs-buy API cost comparison using the same usage assumptions", () => {
  app.eval('setCoreTaskMode("infra");');
  const bridge = app.document.querySelector(".si-api-cost-bridge");
  assert.ok(bridge, "the infra studio should surface a self-host-vs-API comparison");
  assert.match(bridge.textContent, /TCO|월/);
  const bridgeButton = bridge.querySelector('[data-core-task="apiCost"]');
  assert.ok(bridgeButton);
  bridgeButton.click();
  assert.equal(app.document.getElementById("apiCostPanel").hidden, false);
  assert.equal(app.document.getElementById("decisionStudio").hidden, true);
  app.eval('setCoreTaskMode("finder");');
});

test("build-vs-buy comparison shows a breakeven point and a usage-scaling table", () => {
  // Regression test for the "동접에 따라 전체 비용만 움직여서 잘 안 보인다"
  // feedback: the bridge used to show only a single-usage-level snapshot,
  // with no indication of how the comparison changes with volume. Now it
  // also surfaces the breakeven request volume and a 0.25x/1x/4x/16x
  // scaling table -- verify both appear and that the math is actually
  // linear (API cost scales with requests, hardware cost stays flat).
  app.eval('setCoreTaskMode("infra");');
  const bridge = app.document.querySelector(".si-api-cost-bridge");
  assert.ok(bridge);
  const breakeven = bridge.querySelector(".si-api-cost-breakeven");
  assert.ok(breakeven, "a breakeven sentence should be shown");
  assert.match(breakeven.textContent, /배|%/);

  const scaleTable = bridge.querySelector(".si-api-cost-scale");
  assert.ok(scaleTable, "a usage-scaling table should be shown");
  const rows = [...scaleTable.querySelectorAll("tbody tr")];
  assert.equal(rows.length, 4);
  const parseMoney = (text) => Number(text.replace(/[^0-9.]/g, ""));
  const requestCounts = rows.map((row) => Number(row.cells[1].textContent.replace(/[^0-9]/g, "")));
  // 0.25x, 1x, 4x, 16x -- each successive row's request count should scale
  // by 4x, confirming the usage axis itself is set up correctly.
  assert.ok(Math.abs(requestCounts[1] / requestCounts[0] - 4) < 0.05);
  assert.ok(Math.abs(requestCounts[2] / requestCounts[1] - 4) < 0.05);
  assert.ok(Math.abs(requestCounts[3] / requestCounts[2] - 4) < 0.05);
  const apiCosts = rows.map((row) => parseMoney(row.cells[2].textContent));
  // The hosted API has a flat per-request rate (no volume discounts
  // modeled), so its cost must scale linearly with the request count.
  assert.ok(Math.abs(apiCosts[1] / apiCosts[0] - 4) < 0.1);
  assert.ok(Math.abs(apiCosts[2] / apiCosts[1] - 4) < 0.1);
  const hardwareCosts = rows.map((row) => parseMoney(row.cells[3].textContent));
  // Self-hosted cost is a flat monthly TCO -- it must not change across rows.
  assert.equal(hardwareCosts[0], hardwareCosts[1]);
  assert.equal(hardwareCosts[1], hardwareCosts[2]);
  assert.equal(hardwareCosts[2], hardwareCosts[3]);
  app.eval('setCoreTaskMode("finder");');
});

test("build-vs-buy comparison also shows a hardware payback period, year-by-year totals, and a non-cost comparison table", () => {
  app.eval('setCoreTaskMode("infra");');
  const bridge = app.document.querySelector(".si-api-cost-bridge");
  assert.ok(bridge);

  // Payback period: how many months the hardware's upfront cost takes to
  // be recovered via avoided API bills (or an explicit "won't pay for
  // itself here" sentence when the API is cheaper than just running the
  // hardware, ignoring its purchase price).
  const payback = bridge.querySelector(".api-cost-payback");
  assert.ok(payback, "a payback-period sentence should be shown");
  // At the default usage level the cheapest tracked API (economy tier) can
  // cost less than just running the hardware, so payback is "never" here --
  // accept either that sentence or an actual N-month figure, since which one
  // applies depends on today's tracked API prices vs the recommended plan's
  // running cost, not on anything this test controls.
  assert.match(payback.textContent, /개월|month|회수하지 못|not pay for itself/);

  // Year-by-year cumulative cost table (1/2/3 years), complementing the
  // volume-based breakeven with a calendar-time view.
  const yearTables = [...bridge.querySelectorAll(".si-api-cost-scale")];
  const yearTable = yearTables.find((table) => table.textContent.includes("1년차") || table.textContent.includes("Year 1"));
  assert.ok(yearTable, "a year-by-year cumulative cost table should be shown");
  const yearRows = [...yearTable.querySelectorAll("tbody tr")];
  assert.equal(yearRows.length, 3);
  const parseMoney = (text) => Number(text.replace(/[^0-9.]/g, ""));
  const selfHostByYear = yearRows.map((row) => parseMoney(row.cells[1].textContent));
  const apiByYear = yearRows.map((row) => parseMoney(row.cells[2].textContent));
  // Self-hosted cumulative cost grows by a fixed monthly running cost each
  // year (purchase price is a one-time cost in year 0), so successive years
  // must increase by the same amount; the API's cumulative cost must scale
  // linearly (3x by year 3) since its per-request rate never changes.
  assert.ok(selfHostByYear[1] - selfHostByYear[0] > 0);
  assert.ok(Math.abs((selfHostByYear[2] - selfHostByYear[1]) - (selfHostByYear[1] - selfHostByYear[0])) < 1);
  assert.ok(Math.abs(apiByYear[2] / apiByYear[0] - 3) < 0.05);

  // Non-quality-equivalence disclaimer: the comparison above is cost-only
  // and must not read as a claim that the cheapest tracked API model and
  // the recommended local setup perform equivalently.
  const disclaimer = bridge.querySelector(".api-cost-disclaimer");
  assert.ok(disclaimer, "a cost-only / not-quality-equivalent disclaimer should be shown");
  assert.match(disclaimer.textContent, /동일 사용량 기준|비용만|cost-only/);

  // The 3 non-cost comparison dimensions: upfront cost, whether data leaves
  // the premises, and operational burden.
  const dimensionsTable = bridge.querySelector(".si-api-cost-dimensions");
  assert.ok(dimensionsTable, "a non-cost comparison table should be shown");
  assert.match(dimensionsTable.textContent, /초기 비용/);
  assert.match(dimensionsTable.textContent, /데이터 외부 전송/);
  assert.match(dimensionsTable.textContent, /운영 부담/);

  app.eval('setCoreTaskMode("finder");');
});

test("infrastructure sizing uses three steps and three decision cards", () => {
  app.eval(`
    setCoreTaskMode("infra");
    window.dispatchEvent(new CustomEvent("ai-hardware-fit:infra-demo", {
      detail: { scenario: "internal-rag", users: 30 },
    }));
  `);
  assert.equal(app.document.querySelectorAll(".si-wizard-step").length, 3);
  assert.equal(app.document.querySelectorAll(".si-plan-card").length, 3);
  assert.equal(app.document.querySelectorAll(".si-auto-parts > span").length, 6);
  // 9 scenarios: the 8 pre-existing ones plus "온톨로지 구축 배치" (v7.27.0).
  assert.equal(app.document.querySelectorAll(".si-scenario-grid > button").length, 9);
  assert.equal(app.document.querySelectorAll(".si-wizard-progress > li").length, 4);
  assert.ok(app.document.querySelector(".decision-guidance"));
  assert.equal(app.document.querySelectorAll("[data-si-adjust]").length, 3);
  assert.ok(app.document.querySelector(".price-coverage-note"));
  assert.ok(app.document.querySelector(".evidence-coverage-note"));
  assert.equal(app.document.getElementById("decisionStudio").dataset.wizardStep, "4");
  assert.ok(app.document.querySelector(".si-plan-card .si-decision-metrics"));
  assert.equal(app.document.querySelectorAll(".si-workflow-nav [data-si-jump]").length, 3);
  assert.equal(app.document.querySelectorAll(".si-readiness-checks > button").length, 8);
  assert.equal(app.document.querySelectorAll(".si-plan-fit").length, 3);
  assert.equal(app.document.querySelectorAll(".si-plan-tradeoffs > span").length, 4);
  assert.equal(app.document.querySelectorAll(".si-plan-card .si-decision-metrics > span").length, 18);
  assert.match(app.document.querySelector(".si-plan-detail").textContent, /이럴 때는 피하세요/);
  const planSnapshot = app.eval(`calculateSiSizing().plans.map((plan) => ({
    id: plan.id,
    price: plan.purchaseKrw,
    capacity: plan.capacityRps,
    production: plan.productionGpuCount,
    reserve: plan.reserveGpuCount,
  }))`);
  assert.equal(planSnapshot.map((plan) => plan.id).join(","), "economy,recommended,scalable");
  assert.ok(planSnapshot[0].price <= planSnapshot[1].price && planSnapshot[1].price <= planSnapshot[2].price);
  assert.ok(planSnapshot[2].capacity > planSnapshot[1].capacity);
  assert.ok(planSnapshot.every((plan) => plan.production >= 1 && plan.reserve >= 0));
  app.document.querySelector('[data-si-jump="siRequirements"]').click();
  assert.equal(app.document.querySelector(".si-expert-form").open, true);
});

test("easy infrastructure sizing selects recent, benchmark-backed models by size and modality", () => {
  app.eval(`
    setUiLanguage("ko");
    setCoreTaskMode("infra");
    updateStudio("siInputMode", "simple");
    updateStudio("siServiceType", "rag");
    updateStudio("siQualityPreset", "economy");
    applySimpleSizingPreset();
    renderDecisionStudio();
  `);
  assert.equal(app.eval("siSelectedModel().name"), "MiMo-V2.6 Distill Qwen 9B");

  app.eval('updateStudio("siQualityPreset", "balanced"); applySimpleSizingPreset(); renderDecisionStudio();');
  assert.equal(app.eval("siSelectedModel().name"), "Qwen3.8 27B");
  assert.match(app.document.querySelector(".si-model-selection-evidence").textContent, /2026-08-14/);
  assert.match(app.document.querySelector(".si-model-selection-evidence").textContent, /LiveCodeBench v6 90\.3/);
  assert.equal(
    app.document.querySelector(".si-model-selection-evidence a").href,
    "https://huggingface.co/Qwen/Qwen3.8-27B",
  );

  app.eval('updateStudio("siQualityPreset", "quality"); applySimpleSizingPreset(); renderDecisionStudio();');
  assert.equal(app.eval("siSelectedModel().name"), "Qwen3.5 122B A10B");
  assert.match(app.document.querySelector(".si-model-selection-evidence").textContent, /MMLU-Pro 86\.7/);
  assert.match(app.document.querySelector(".si-model-selection-evidence").textContent, /토큰당 10B 활성/);

  app.eval('updateStudio("siQualityPreset", "balanced"); renderDecisionStudio();');
  app.document.querySelector('[data-si-preset="document-vlm"]').click();
  assert.equal(app.eval("siSelectedModel().name"), "Qwen3.5 27B");
  assert.match(app.document.querySelector(".si-model-selection-evidence").textContent, /네이티브 비전 입력/);

  app.eval('setUiLanguage("en"); renderDecisionStudio();');
  assert.doesNotMatch(app.document.querySelector(".si-model-selection-evidence").textContent, /[가-힣]/);
  assert.match(app.document.querySelector(".si-model-selection-evidence").textContent, /Public benchmark|Service fit/);

  app.eval(`
    setUiLanguage("ko");
    updateStudio("siServiceType", "rag");
    updateStudio("siQualityPreset", "balanced");
    applySimpleSizingPreset();
    renderDecisionStudio();
  `);
});

test("easy infrastructure sizing advances one screen at a time", () => {
  app.eval('updateStudio("siInputMode", "simple"); updateStudio("siWizardStep", 1);');
  for (let step = 1; step <= 4; step += 1) {
    const wizard = app.document.querySelector(".si-simple-wizard");
    assert.equal(wizard.dataset.step, String(step));
    assert.equal(app.document.getElementById("decisionStudio").dataset.wizardStep, String(step));
    if (step < 4) app.document.querySelector("[data-si-wizard-next]").click();
  }
  assert.ok(app.document.querySelector(".simple-verdict"));
  assert.ok(app.document.querySelector(".simple-result-actions"));
});

test("detailed sizing explains every field and offers starting baselines", () => {
  app.document.querySelector('[data-si-input-mode="expert"]').click();
  assert.match(app.document.querySelector('[data-si-input-mode="expert"]').textContent, /상세 견적/);
  assert.equal(app.document.querySelector(".si-expert-form").open, true);
  assert.equal(app.document.querySelectorAll("[data-si-baseline]").length, 3);
  const detailedControls = [...app.document.querySelectorAll(".si-expert-form input[id], .si-expert-form select[id], .si-advanced input[id], .si-advanced select[id]")];
  assert.ok(detailedControls.length >= 30);
  for (const control of detailedControls) {
    const label = control.closest("label");
    assert.ok(label.querySelector(".term-help"), `${control.id} should have a help tooltip`);
    assert.ok(label.querySelector(".si-field-baseline"), `${control.id} should show a starting point`);
  }
  assert.match(app.document.querySelector("#siQps").closest("label").querySelector(".term-help").dataset.tooltip, /초당 시작되는 요청/);
  app.document.querySelector('[data-si-baseline="pilot"]').click();
  assert.ok(Number(app.document.getElementById("siTotalUsers").value) <= 10);
  assert.ok(Number(app.document.getElementById("siQps").value) > 0);
  app.document.getElementById("siTotalUsers").value = "5";
  app.document.getElementById("siTotalUsers").dispatchEvent(new app.Event("change", { bubbles: true }));
  app.document.getElementById("siConcurrency").value = "10";
  app.document.getElementById("siConcurrency").dispatchEvent(new app.Event("change", { bubbles: true }));
  assert.equal(app.document.getElementById("siConcurrency").getAttribute("aria-invalid"), "true");
  assert.ok(app.document.getElementById("siConcurrency").closest("label").querySelector(".si-field-warning"));
  app.document.getElementById("siConcurrency").value = "2";
  app.document.getElementById("siConcurrency").dispatchEvent(new app.Event("change", { bubbles: true }));
  assert.equal(app.document.getElementById("siConcurrency").hasAttribute("aria-invalid"), false);
});

test("customer proposal links exclude internal sales fields and render read-only", () => {
  const url = new URL(app.eval("proposalUrl()"));
  const state = JSON.parse(url.searchParams.get("studioState"));
  assert.equal(url.searchParams.get("view"), "proposal");
  for (const key of ["siCompanyName", "siCustomerName", "siContact", "siSupplierName", "siReviewer", "siApprover"]) {
    assert.equal(Object.hasOwn(state, key), false, `${key} must not be shared`);
  }
  app.eval('updateStudio("siReadOnly", true);');
  assert.ok(app.document.querySelector(".customer-proposal"));
  assert.equal(app.document.querySelector(".decision-studio-tabs").hidden, true);
  app.eval('updateStudio("siReadOnly", false);');
});

test("v7.5 snapshots and share links keep a versioned infrastructure state", () => {
  app.eval("syncStudioUrl(); window.__smokeSizingSnapshot = sizingSnapshot(); window.__smokeShareState = shareableStudioState();");
  assert.equal(app.__smokeSizingSnapshot.schemaVersion, 3);
  assert.equal(app.__smokeSizingSnapshot.appVersion, "7.5.0");
  assert.equal(app.__smokeSizingSnapshot.readiness.total, 8);
  assert.equal(new URL(app.location.href).searchParams.get("schema"), "3");
  assert.ok(Object.keys(app.__smokeShareState).every((key) => key === "tab" || key === "modelKey" || key.startsWith("si")));
});

test("price and evidence states avoid presenting estimates as live market prices", () => {
  app.document.querySelector('[data-studio-tab="market"]').click();
  const marketText = app.document.getElementById("decisionStudioBody").textContent;
  assert.match(marketText, /출처 연결 시세/);
  assert.match(read("platform-v3.js"), /공개 국내 시세 없음/);
  assert.match(read("app.js"), /범위 ±/);
});

test("enterprise-only GPUs and studio pick-card prices disclose their basis in the actual DOM", () => {
  // Data-layer assertions elsewhere confirm the *counts* are right (missing +
  // enterpriseOnly + sourced === total). This test instead renders the real
  // views and checks that a person looking at the screen -- not just the
  // underlying JSON -- can see why a GPU has no Korean price, and that a
  // studio pick-card price is disclosed as an estimate rather than presented
  // as a real market price.
  app.eval(`
    setCoreTaskMode("infra");
    window.dispatchEvent(new CustomEvent("ai-hardware-fit:infra-demo", {
      detail: { scenario: "internal-rag", users: 30 },
    }));
  `);
  const coverageNote = app.document.querySelector(".price-coverage-note").textContent;
  assert.match(coverageNote, /기업용 전용 GPU/, "the price-coverage note should explain that some GPUs are excluded because they're enterprise-only");
  assert.match(coverageNote, /H100.*A100.*MI300X/, "the note should name the kind of GPU it means (H100/A100/MI300X-class)");

  app.document.querySelector('[data-studio-tab="recommend"]').click();
  // Clear every recommend-tab filter so at least one GPU can actually match
  // (the infra-demo dispatch above leaves budget/power/speed filters in a
  // state tuned for the infra wizard, not this tab -- without resetting
  // them every pick card silently renders "no GPU meets the conditions").
  app.eval(`
    updateStudio("powerLimitW", 0);
    updateStudio("targetSpeed", 0);
    updateStudio("formFactor", "all");
    updateStudio("category", "all");
    updateStudio("budgetKrw", 999999999);
  `);
  const pickCards = [...app.document.querySelectorAll(".studio-pick-card")];
  assert.ok(pickCards.length > 0, "the recommend tab should render at least one pick card");
  const priceNotes = pickCards
    .map((card) => card.querySelector(".studio-price-note")?.textContent || "")
    .filter(Boolean);
  assert.ok(priceNotes.length > 0, "at least one pick card should show a price-basis disclosure note");
  assert.ok(
    priceNotes.every((note) => /계산|참고/.test(note)),
    "every disclosure note present should describe a calculated/reference basis, matching what studioMarket() actually returns",
  );

  // usedKrw is always a calculated "75% of new" reference value in this
  // dataset (no GPU has a directly-sourced secondhand price), so switching
  // to the used-price condition should unconditionally trigger the
  // disclosure note on every card, regardless of which specific GPUs are
  // recommended.
  app.eval('updateStudio("condition", "used");');
  const usedPickCards = [...app.document.querySelectorAll(".studio-pick-card")];
  const usedPriceNotes = usedPickCards
    .map((card) => card.querySelector(".studio-price-note")?.textContent || "")
    .filter(Boolean);
  assert.ok(usedPickCards.length > 0);
  assert.equal(
    usedPriceNotes.length,
    usedPickCards.length,
    "every pick card should disclose a price-calculation method once condition is set to used",
  );
  app.eval('updateStudio("condition", "either");');
});

test("English mode updates the primary navigation and infrastructure wizard", () => {
  app.document.querySelector('[data-studio-tab="consulting"]').click();
  app.document.querySelector('[data-si-input-mode="simple"]').click();
  app.eval('setUiLanguage("en"); setCoreTaskMode("infra");');
  app.document.querySelector('[data-studio-tab="consulting"]').click();
  assert.match(app.document.querySelector('[data-core-task="modelFinder"]').textContent, /Find a GPU for a model/);
  assert.match(app.document.querySelector('[data-core-task="finder"]').textContent, /Find models for my GPU/);
  assert.match(app.document.querySelector('[data-demo-infra="internal-rag"]').textContent, /30-user internal RAG estimate/);
  assert.match(app.document.querySelector('[data-demo-infra="ontology-batch"]').textContent, /Ontology construction batch estimate/);
  assert.doesNotMatch(app.document.querySelector(".core-task-actions").textContent, /[가-힣]/);
  assert.match(app.document.querySelector(".si-simple-wizard").textContent, /three steps/i);
  assert.doesNotMatch(app.document.querySelector(".si-simple-wizard").textContent, /[가-힣]/);
  assert.match(app.document.querySelector("[data-guide-examples-title]").textContent, /Try examples/);
  assert.match(app.document.querySelector("[data-showcase-feedback]").textContent, /Send workflow feedback/);
  app.document.querySelector('[data-si-input-mode="expert"]').click();
  assert.match(app.document.querySelector('[data-si-input-mode="expert"]').textContent, /Detailed estimate/);
  assert.match(app.document.getElementById("siIndustry").value, /Manufacturing/);
  assert.match(app.document.querySelector("#siQps").closest("label").querySelector(".term-help").dataset.tooltip, /queries per second/i);
  assert.equal(app.document.getElementById("advisorBudgetUsd").dataset.currency, "USD");
  assert.match(app.document.getElementById("siElectricityKrw").closest("label").textContent, /USD\/kWh/);
  assert.equal(app.eval("studioMoney(1400000)"), "$1,000");
  assert.match(app.document.querySelector(".si-plan-card .si-decision-metrics").textContent, /High|Medium|Low/);
  app.eval('updateStudio("siReadOnly", true);');
  assert.match(app.document.querySelector(".customer-proposal").textContent, /Confidence/);
  assert.doesNotMatch(app.document.querySelector(".customer-proposal").textContent, /높음|중간|낮음/);
  app.eval('updateStudio("siReadOnly", false);');
  app.document.querySelector('[data-studio-tab="market"]').click();
  assert.match(app.document.getElementById("decisionStudioBody").textContent, /Planning reference: 75%/);
  app.document.querySelector('[data-studio-tab="consulting"]').click();

  app.document.querySelector('[data-platform-tab="purchase"]').click();
  assert.equal(app.document.getElementById("purchaseCurrency").value, "USD");
  assert.match(app.document.getElementById("purchaseNewPrice").closest("label").textContent, /USD/);
  const purchasePriceUsd = Number(app.document.getElementById("purchaseNewPrice").value);

  app.eval('setUiLanguage("ko"); setCoreTaskMode("infra");');
  app.document.querySelector('[data-studio-tab="consulting"]').click();
  app.document.querySelector('[data-si-input-mode="expert"]').click();
  assert.match(app.document.querySelector('[data-core-task="modelFinder"]').textContent, /모델에 맞는 GPU 찾기/);
  assert.match(app.document.querySelector("[data-guide-examples-title]").textContent, /예시로 보기/);
  assert.match(app.document.querySelector('[data-core-task="finder"]').textContent, /내 GPU로 모델 찾기/);
  assert.doesNotMatch(app.document.querySelector(".core-task-actions").textContent, /Find a GPU|Find models/);
  assert.equal(app.document.getElementById("advisorBudgetUsd").dataset.currency, "KRW");
  assert.match(app.document.getElementById("siElectricityKrw").closest("label").textContent, /원\/kWh/);
  assert.equal(Number(app.document.getElementById("siElectricityKrw").value), 150);
  assert.equal(app.eval("studioMoney(1400000)"), "1,400,000원");

  app.document.querySelector('[data-platform-tab="purchase"]').click();
  assert.equal(app.document.getElementById("purchaseCurrency").value, "KRW");
  assert.match(app.document.getElementById("purchaseNewPrice").closest("label").textContent, /KRW/);
  assert.ok(Math.abs(Number(app.document.getElementById("purchaseNewPrice").value) - purchasePriceUsd * 1400) < 10);
});

test("switching to English re-translates the GPU comparison detail panel", () => {
  // Regression test: renderGpuInsights() (the "Architecture/Memory/Bandwidth/
  // Runtime" + "Data completeness"/"Specification evidence" detail panel)
  // used to only get rebuilt by the main render() pass or the compare-GPU
  // selects -- setUiLanguage() never called it directly. A pure language
  // toggle while the panel was already visible left its longer phrases
  // ("데이터 완성도", "보강 항목", "사양 근거", "검증일") stuck in Korean even
  // though the short single-word labels ("아키텍처", "대역폭", "런타임") got
  // patched by the generic dictionary sweep, since those happened to already
  // have dictionary entries and these longer phrases didn't.
  // Use the real setCoreTaskMode()/selectPrimaryGpu() functions (not bare
  // "coreTaskMode = ..." assignment) -- each app.eval() call is a separate
  // top-level script, and top-level `let` bindings from the original
  // app.js load aren't visible for plain reassignment from a later eval;
  // a bare assignment silently creates an unrelated global instead of
  // updating the real state the render functions close over.
  app.eval('selectPrimaryGpu("rtx4090-24"); setCoreTaskMode("finder"); setUiLanguage("ko");');
  const detailKo = app.document.getElementById("gpuDetailSummary").textContent;
  assert.match(detailKo, /아키텍처/);
  assert.match(detailKo, /데이터 완성도/);

  app.eval('setUiLanguage("en");');
  const detailEn = app.document.getElementById("gpuDetailSummary").textContent;
  assert.match(detailEn, /Architecture/);
  assert.match(detailEn, /Data completeness/);
  assert.match(detailEn, /Specification evidence/);
  assert.doesNotMatch(detailEn, /[가-힣]/, "no Korean text should remain in the detail panel after switching to English");

  app.eval('setUiLanguage("ko");');
});

test("English GPU names and recommendation empty states contain no Korean", () => {
  app.eval('selectPrimaryGpu("m4max-128"); setCoreTaskMode("finder"); setUiLanguage("en");');
  const datalistValues = [...app.document.querySelectorAll("#gpuFixedPresetOptions option")].map((option) => option.value);
  assert.ok(datalistValues.includes("Apple M4 Max 128GB unified memory"));
  assert.ok(datalistValues.every((value) => !/[가-힣]/.test(value)));
  assert.doesNotMatch(app.document.getElementById("gpuPresetList").textContent, /[가-힣]/);
  assert.equal(app.eval('findGpuPresetByName("Apple M4 Max 128GB unified memory").id'), "m4max-128");

  app.eval("renderSimpleMode(getHardware(), []);");
  assert.match(app.document.getElementById("simpleModeResult").textContent, /No models match the current settings/);
  assert.doesNotMatch(app.document.getElementById("simpleModeResult").textContent, /[가-힣]/);

  app.eval("renderResults([], []);");
  assert.match(app.document.getElementById("modelResults").textContent, /Reset filters/);
  assert.doesNotMatch(app.document.getElementById("modelResults").textContent, /[가-힣]/);

  app.eval("renderGpuRuntimeFacts(getHardware()); renderCalculationBasisStrip(getHardware());");
  assert.match(app.document.getElementById("gpuRuntimeFacts").textContent, /Unified memory/);
  assert.doesNotMatch(app.document.getElementById("gpuRuntimeFacts").textContent, /[가-힣]/);
  assert.doesNotMatch(app.document.getElementById("calculationBasisStrip").textContent, /[가-힣]/);

  app.eval('setUiLanguage("ko");');
});

test("accessibility and responsive contracts are present", () => {
  assert.ok(app.document.querySelector(".skip-link"));
  assert.equal(app.document.getElementById("simpleRecommendationPanel").getAttribute("aria-modal"), "true");
  assert.equal(app.document.getElementById("appToast").getAttribute("role"), "status");
  const css = read("styles.css");
  for (const width of ["900", "560"]) assert.match(css, new RegExp(`max-width:\\s*${width}px`));
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /\.si-expert-form \.studio-question-grid \.studio-check\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/s);
  // .studio-check-label was the old wrapper markup used only by the
  // "개발계·운영계 분리" checkbox; it caused a vertical single-character text
  // wrap bug and was removed so that checkbox now shares the same flat
  // <label class="studio-check"> markup (and CSS) as every other checkbox.
  assert.match(css, /\.studio-question-grid \.studio-check > input\[type="checkbox"\]\s*\{[^}]*width:\s*18px;[^}]*height:\s*18px;/s);
  assert.doesNotMatch(css, /\.studio-check-label/);
  assert.match(css, /\.term-help::after\s*\{[^}]*width:\s*var\(--term-tip-width,\s*min\(360px,\s*calc\(100vw - 32px\)\)\)/s);
  assert.match(read("platform-v3.js"), /const tooltipWidth = Math\.min\(360,[\s\S]*--term-tip-offset-x[\s\S]*button\.classList\.add\("is-tip-left"\)/);
});

test("community measurement panel re-translates on language switch without losing typed input", () => {
  // Regression test: renderWorkbench() (features/community-feedback.js)
  // builds the "실측 결과를 안전하게 제보하세요" panel exactly once, guarded by
  // an existence check -- it was never wired into setUiLanguage(), so a
  // pure language toggle left the whole panel frozen in whatever language
  // was active at first paint (the same bug class already fixed for the
  // GPU insights and API cost panels). In this test harness the panel's own
  // DOMContentLoaded listener never fires (the document is already past
  // "loading" by the time app.eval() runs), so call renderWorkbench()
  // directly first to simulate the real page's first paint.
  app.eval('window.AIHardwareCommunityFeedback.renderWorkbench(); setUiLanguage("ko");');
  const panel = () => app.document.getElementById("communityMeasurementPanel");
  assert.match(panel().textContent, /실측 결과를 안전하게 제보하세요/);
  const input = panel().querySelector("[data-community-input]");
  input.value = '{"model":"Qwen3 8B","gpu":"RTX 3060 12GB"}';

  app.eval('setUiLanguage("en");');
  assert.match(panel().textContent, /Contribute an actual run safely/);
  assert.match(panel().textContent, /Same-condition references/);
  assert.match(panel().textContent, /Top 10 measurements needed/);
  assert.doesNotMatch(panel().textContent, /[가-힣]/, "no Korean text should remain in the community panel after switching to English");
  assert.equal(input.value, '{"model":"Qwen3 8B","gpu":"RTX 3060 12GB"}', "the user's in-progress textarea input must survive a language toggle");

  app.eval('setUiLanguage("ko");');
  assert.match(panel().textContent, /실측 결과를 안전하게 제보하세요/);
  assert.doesNotMatch(panel().textContent, /Contribute an actual run safely|Same-condition references|Top 10 measurements needed/, "no leftover English UI copy should remain after switching back to Korean");
});

test("getting-started and quick-recommendation dialog aria-labels translate as full phrases", () => {
  // Regression test: the generic dictionary sweep matches "사용 가이드" and
  // "빠른 추천" as bare substrings inside the longer aria-label values "처음
  // 사용 가이드" and "빠른 추천 상세", translating only the matched fragment
  // and leaving the rest ("처음", "상세") behind in the other language --
  // e.g. "처음 Quick guide" and "Quick recommendations 상세". Longer,
  // full-phrase dictionary entries were added so these translate cleanly.
  app.eval('setUiLanguage("ko");');
  assert.equal(app.document.getElementById("gettingStartedPanel").getAttribute("aria-label"), "처음 사용 가이드");
  assert.equal(app.document.getElementById("simpleRecommendationPanel").getAttribute("aria-label"), "빠른 추천 상세");

  app.eval('setUiLanguage("en");');
  assert.equal(app.document.getElementById("gettingStartedPanel").getAttribute("aria-label"), "Getting started guide");
  assert.equal(app.document.getElementById("simpleRecommendationPanel").getAttribute("aria-label"), "Quick recommendations detail");

  app.eval('setUiLanguage("ko");');
  assert.equal(app.document.getElementById("gettingStartedPanel").getAttribute("aria-label"), "처음 사용 가이드");
  assert.equal(app.document.getElementById("simpleRecommendationPanel").getAttribute("aria-label"), "빠른 추천 상세");
});

test("benchmark-meta placeholder translates cleanly before the lazy benchmark workspace loads", () => {
  // Regression test: in production, features/benchmark-workspace.js (which
  // overwrites #benchmarkMeta with real bilingual text) is lazy-loaded on
  // demand, not part of the eager bundle -- so on first paint, the static
  // Korean placeholder "벤치마크 데이터 준비 중" from index.html is still in
  // the DOM when translateDynamicUi() runs. Its generic dictionary only had
  // a standalone "벤치마크" -> "Benchmarks" entry, so it produced the broken
  // half-translation "Benchmarks 데이터 준비 중". This test harness loads
  // benchmark-workspace.js eagerly, so restore the raw static placeholder
  // first to simulate the real pre-load moment.
  app.document.getElementById("benchmarkMeta").textContent = "벤치마크 데이터 준비 중";
  app.eval('translateDynamicUi("en");');
  assert.equal(app.document.getElementById("benchmarkMeta").textContent, "Benchmark data loading");
  assert.doesNotMatch(app.document.getElementById("benchmarkMeta").textContent, /[가-힣]/);

  app.document.getElementById("benchmarkMeta").textContent = "Benchmark data loading";
  app.eval('translateDynamicUi("ko");');
  assert.equal(app.document.getElementById("benchmarkMeta").textContent, "벤치마크 데이터 준비 중");
});

test("the lazy benchmark workspace's own data (qualityBenchmark.note like \"공식 품질\") gets swept to English on first load, not just the table's own headers", () => {
  // Regression test for a real production bug: features/benchmark-workspace.js
  // is lazy-loaded (via feature-loader.js's IntersectionObserver/timeout/metric
  // filter triggers), and its .then() callback used to call renderDashboard()
  // and renderSheet() WITHOUT a follow-up translateDynamicUi()/
  // AIHardwareLocalization.apply() sweep -- unlike every other path that
  // (re-)renders these tables (setUiLanguage's manual toggle, and the four
  // infra/placement/modelFinder/apiCost core-task render() branches). The
  // table's own headers/labels go through uiLanguage-conditional t()/ternary
  // calls and were always correct, but each row's raw data fields (e.g.
  // model.qualityBenchmark.note, which defaults to the bare Korean string
  // "공식 품질" in data/model-metadata.js's quality() helper) are never
  // wrapped in a language ternary -- they only get translated by the sweep.
  // So a page that loaded already in English and then lazy-loaded this panel
  // for the first time showed "공식 품질" forever, even though "Environment"
  // and every other header was correctly in English.
  app.eval('setUiLanguage("en");');
  // Simulate the lazy-load callback's render step in isolation, exactly as
  // feature-loader.js's loadBenchmarkWorkspace().then() does it, followed by
  // the sweep calls that block now includes.
  app.eval('AIHardwareBenchmark.renderDashboard(); AIHardwareBenchmark.renderSheet();');
  app.eval('translateDynamicUi("en"); window.AIHardwareLocalization?.apply("en");');
  const tableText = app.document.getElementById("benchmarkTable").textContent;
  assert.doesNotMatch(tableText, /[가-힣]/, "benchmark table should have no leftover Korean once English mode's lazy-load sweep has run");
  assert.match(tableText, /Official quality|Official report|Official distillation/, "at least one qualityBenchmark.note value should be visibly translated, not just absent");
});

test("VRAM-quality frontier compares one benchmark at a time and marks Pareto-efficient models", () => {
  app.eval('setUiLanguage("ko"); AIHardwareBenchmark.renderSheet();');
  const select = app.document.getElementById("valueFrontierMetric");
  const chart = app.document.getElementById("valueFrontierChart");
  const budget = app.document.getElementById("valueFrontierBudget");
  assert.ok(select.options.length > 1, "at least two same-metric benchmark families should be selectable");
  assert.equal(select.value, "MMLU-Pro");
  assert.ok(chart.querySelector("svg"), "the frontier should render as an SVG chart");
  assert.ok(chart.querySelectorAll(".frontier-point.is-frontier").length >= 2);
  assert.match(budget.textContent, /8GB/);
  assert.match(app.document.getElementById("valueFrontierMethod").textContent, /Q4_K_M/);

  const frontier = app.AIHardwareBenchmark.computeValueFrontier([
    { name: "small", requiredGb: 4, score: 60 },
    { name: "dominated", requiredGb: 8, score: 55 },
    { name: "better", requiredGb: 8, score: 70 },
  ]);
  assert.equal(frontier.find((row) => row.name === "small").onFrontier, true);
  assert.equal(frontier.find((row) => row.name === "dominated").onFrontier, false);
  assert.equal(frontier.find((row) => row.name === "better").onFrontier, true);

  app.eval('setUiLanguage("en"); AIHardwareBenchmark.renderSheet();');
  assert.match(app.document.getElementById("valueFrontierTitle").textContent, /Best local model/);
  assert.doesNotMatch(app.document.getElementById("valueFrontier").textContent, /[가-힣]/);

  // The real lazy-loader applies the generic localization sweep immediately
  // after the frontier renders. Static nodes in this panel were captured from
  // index.html in Korean, so the sweep must translate those captured sources
  // instead of restoring Korean over the feature's English render.
  app.eval('translateDynamicUi("en"); window.AIHardwareLocalization?.apply("en");');
  assert.match(app.document.getElementById("valueFrontierTitle").textContent, /Best local model/);
  assert.equal(app.document.getElementById("valueFrontierChart").getAttribute("aria-label").includes("프런티어"), false);
  assert.doesNotMatch(app.document.getElementById("valueFrontier").textContent, /[가-힣]/);
});

test("the header logo acts as a home link, resetting to the default beginner mode", () => {
  // The header logo/title (.brand-block) is a <button data-reset-home> that
  // should behave like the conventional "click the logo to go home" pattern
  // most sites use: reset to the default beginner mode and re-show the task
  // chooser, without wiping the user's GPU/model selections (those persist
  // separately via URL state and localStorage).
  app.eval('setCoreTaskMode("infra"); window.AIHardwareGuide.setStarted(true);');
  assert.ok(app.document.body.classList.contains("infra-task-active"));
  assert.ok(app.document.body.classList.contains("guided-workspace-started"));

  const logo = app.document.querySelector("[data-reset-home]");
  assert.ok(logo, "the header logo should be a clickable [data-reset-home] control");
  assert.equal(logo.tagName, "BUTTON");
  logo.click();

  assert.ok(!app.document.body.classList.contains("infra-task-active"));
  assert.ok(app.document.body.classList.contains("finder-task-active"));
  assert.ok(!app.document.body.classList.contains("guided-workspace-started"), "the task chooser should be shown again after clicking the logo");
});

test("the getting-started guide panel actually becomes visible when opened after a GPU is already selected (is-collapsed)", () => {
  // Regression test for a real bug: styles/v6-guided.css had a leftover rule
  // from before the guide button moved into the header --
  // ".core-task-switcher.is-collapsed .getting-started-panel { display: none; }"
  // -- with (0,3,0) specificity, which beats the panel's own
  // ".getting-started-panel[hidden] { display: none; }" rule regardless of
  // source order. #coreTaskSwitcher gets .is-collapsed applied any time a
  // GPU is already selected (the normal state for a returning visitor, via
  // setStarted(true)), so toggleGuide() correctly cleared the panel's
  // [hidden] attribute (which the existing DOM-only assertions below would
  // still show as false) but the panel stayed forced to display:none and
  // never actually appeared -- clicking "가이드"/"Getting started" looked
  // completely broken. jsdom's own <link> tags don't load external
  // stylesheets, so this test injects the real cascade (all 3 files, in
  // their <link> order) into a fresh DOM and checks computed style, the
  // only way to actually catch a cross-file specificity bug like this one
  // (plain DOM/attribute assertions can't see it, since the JS side was
  // always working correctly).
  const css = [read("styles.css"), read("styles/components.css"), read("styles/v6-guided.css")].join("\n");
  const cssDom = new JSDOM(read("index.html"), { pretendToBeVisual: true });
  const doc = cssDom.window.document;
  const styleTag = doc.createElement("style");
  styleTag.textContent = css;
  doc.head.appendChild(styleTag);

  const switcher = doc.getElementById("coreTaskSwitcher");
  switcher.classList.add("is-collapsed"); // simulates a GPU already being selected
  const panel = doc.getElementById("gettingStartedPanel");
  panel.hidden = false; // simulates toggleGuide() opening it

  assert.notEqual(
    cssDom.window.getComputedStyle(panel).display,
    "none",
    "the guide panel should render once opened, even when the tab bar is in its is-collapsed state",
  );

  // The same leftover rule block also forced width: 100% onto the active
  // tab specifically while collapsed, which -- since .core-task-button is
  // flex: 1 1 auto, whose auto flex-basis defers to an explicit width --
  // would make that one tab's flex-basis 100% of the row while its 5
  // siblings kept their content-sized basis: the same "one tab balloons"
  // failure mode fixed in v7.20.1, just still lurking for the collapsed
  // case. Confirm it no longer sets an explicit width.
  const activeButton = doc.querySelector(".core-task-button.is-active");
  assert.notEqual(
    cssDom.window.getComputedStyle(activeButton).width,
    "100%",
    "the active tab should not get an explicit 100% width while the tab bar is collapsed",
  );

  cssDom.window.close();
});
