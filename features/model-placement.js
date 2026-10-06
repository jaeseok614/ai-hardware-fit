/** Extracted in v7.1 to keep the core bundle focused. */
let gpuInventoryRows = [
  { id: "gpu-row-1", presetId: "rtx4090-24", count: 1 },
];
let gpuInventoryIdCounter = 1;
let gpuInventorySearchRows = new Set();
let placementInventorySeeded = false;
let placementBuilderStarted = false;
let placementModelBrowserOpened = false;
let placementActiveType = "generative";
let placementSearchQuery = "";
let placementSelectedKeys = new Set();
let placementStrategy = "balanced";
// "pipeline": one shared request flows through every selected model, so the
// model with the least headroom sets the pace for all of them (the app's
// original, only behavior). "independent": each model is its own service
// called separately — show each model's own concurrency instead of
// collapsing to one shared minimum. "alternate": only one model is ever
// loaded at a time, so models never actually share VRAM — each is
// evaluated against a whole GPU on its own (see computeAlternatePlacement).
let placementUsageMode = "independent";
let placementTargetN = null;
let placementPrimaryKey = "";
let placementMinHeadroomPct = 15;
let placementAllowQuantChange = true;
let placementAllowContextReduction = false;
let placementAllowReplication = false;
const placementModelConfigs = new Map();
let lastPlacementRun = null;
const placementAdjustmentRegistry = new Map();

const PLACEMENT_DEFAULT_WORKLOADS = {
  embedding: { type: "embedding", inputTokens: 384, batchSize: 32, maxBatchTokens: 16384, runtime: "tei" },
  reranker: { type: "reranker", queryTokens: 64, docTokens: 512, candidates: 40, batchSize: 16, runtime: "tei" },
  vision: { width: 1654, height: 2339, batchSize: 1, featureSet: "basic" },
};

const PLACEMENT_STARTER_PRESETS = {
  rag: {
    usage: "pipeline",
    strategy: "balanced",
    target: 4,
    modelNames: ["Qwen3 4B", "Qwen/Qwen3-Embedding-0.6B", "Qwen/Qwen3-Reranker-0.6B"],
  },
  document: {
    usage: "pipeline",
    strategy: "balanced",
    target: 2,
    modelNames: ["Qwen3 4B", "allenai/olmOCR-2-7B-1025", "PP-OCRv6 Medium", "Qwen/Qwen3-Embedding-0.6B"],
  },
  "multi-llm": {
    usage: "independent",
    strategy: "throughput",
    target: 4,
    modelNames: ["Llama 3.2 3B Instruct", "Qwen3 4B", "SmolLM2 1.7B Instruct"],
  },
  "voice-avatar": {
    usage: "pipeline",
    strategy: "throughput",
    target: 2,
    modelNames: ["Whisper small", "Qwen3 4B", "Kokoro-82M", "TMElyralab/MuseTalk 1.5"],
  },
};

function allPlacementModels() {
  return [...GENERATIVE_MODELS, ...EMBEDDING_MODELS, ...RERANKER_MODELS, ...OCR_MODELS, ...AUDIO_MODELS];
}
function clearPlacementResults() {
  lastPlacementRun = null;
  ["gpuPlacementResult", "gpuPlacementPlanCompare", "gpuPlacementDiagnosis", "gpuPlacementExport", "placementResultOverview"].forEach((id) => {
    const element = $(id);
    if (!element) return;
    element.innerHTML = "";
    if (id !== "gpuPlacementResult" && id !== "placementResultOverview") element.hidden = true;
  });
  if ($("gpuPlacementBaseline")) {
    $("gpuPlacementBaseline").innerHTML = "";
    $("gpuPlacementBaseline").hidden = true;
  }
  if ($("placementResultStage")) $("placementResultStage").hidden = true;
}

function applyPlacementStarter(starterId) {
  placementBuilderStarted = true;
  placementModelBrowserOpened = false;
  if (starterId === "custom") {
    renderPlacementWorkspaceUi();
    renderPlacementModelList();
    syncUrlState();
    return;
  }
  const preset = PLACEMENT_STARTER_PRESETS[starterId];
  if (!preset) return;
  const models = allPlacementModels();
  placementSelectedKeys.clear();
  placementModelConfigs.clear();
  preset.modelNames.forEach((name) => {
    const model = models.find((candidate) => candidate.name === name);
    if (!model) return;
    const key = modelKey(model);
    placementSelectedKeys.add(key);
    getPlacementModelConfig(key);
  });
  placementUsageMode = preset.usage;
  placementStrategy = preset.strategy;
  placementTargetN = preset.target;
  placementPrimaryKey = "";
  placementActiveType = "generative";
  clearPlacementResults();
  renderPlacementModelList();
  renderPlacementSelectedChips();
  renderPlacementPrimarySelect();
  setPlacementUsageMode(placementUsageMode);
  setPlacementStrategy(placementStrategy);
  const target = $("placementTargetConcurrency");
  if (target) {
    target.value = String(preset.target);
    $("placementTargetConcurrencyCustom").value = String(preset.target);
  }
  renderPlacementWorkspaceUi();
  syncUrlState();
}

function renderPlacementWorkspaceUi() {
  const welcome = $("placementWelcome");
  const builder = $("placementBuilder");
  if (!welcome || !builder) return;
  const showBuilder = placementBuilderStarted || placementSelectedKeys.size > 0;
  welcome.hidden = showBuilder;
  builder.hidden = !showBuilder;
  const resultReady = Boolean(lastPlacementRun);
  if ($("placementResultStage")) $("placementResultStage").hidden = !resultReady;
  document.querySelectorAll(".placement-stepper li").forEach((item, index) => {
    const step = index + 1;
    const ready = step === 1
      || (step === 2 && gpuInventoryRows.length > 0)
      || (step === 3 && placementSelectedKeys.size > 0)
      || (step === 4 && resultReady);
    item.classList.toggle("is-ready", ready);
  });
}

function renderGpuInventory() {
  const container = $("gpuInventoryList");
  if (!container) return;
  container.innerHTML = gpuInventoryRows
    .map((row) => {
      const isSearch = gpuInventorySearchRows.has(row.id);
      return `
        <div class="gpu-inventory-row">
          <div class="field-control-pair${isSearch ? " is-custom" : ""}">
            <select class="gpu-inventory-preset" data-row-id="${escapeAttr(row.id)}" aria-label="GPU 종류">
              ${GPU_PRESETS.filter((gpu) => gpu.id !== "custom")
                .map(
                  (gpu) => `<option value="${escapeAttr(gpu.id)}" ${!isSearch && gpu.id === row.presetId ? "selected" : ""}>${escapeHtml(gpu.name)}</option>`,
                )
                .join("")}
              <option value="__search__" ${isSearch ? "selected" : ""}>GPU 모델명 검색</option>
            </select>
            <input type="text" class="gpu-inventory-preset-search" list="gpuFixedPresetOptions" data-row-id="${escapeAttr(row.id)}" autocomplete="off" aria-label="GPU 종류 검색" placeholder="GPU 모델명 검색" ${isSearch ? "" : "hidden"} />
          </div>
          <input type="number" class="gpu-inventory-count" data-row-id="${escapeAttr(row.id)}" min="1" max="8" step="1" value="${row.count}" aria-label="이 GPU 개수" />
          <button type="button" class="icon-button gpu-inventory-remove" data-row-id="${escapeAttr(row.id)}" aria-label="GPU 제거" ${gpuInventoryRows.length <= 1 ? "disabled" : ""}>×</button>
        </div>
      `;
    })
    .join("");
}

function addGpuInventoryRow() {
  gpuInventoryIdCounter += 1;
  gpuInventoryRows.push({ id: `gpu-row-${gpuInventoryIdCounter}`, presetId: "rtx4090-24", count: 1 });
  placementInventorySeeded = true;
  clearPlacementResults();
  renderGpuInventory();
  renderPlacementSelectedChips();
  renderPlacementWorkspaceUi();
  syncUrlState();
}

function removeGpuInventoryRow(rowId) {
  if (gpuInventoryRows.length <= 1) return;
  gpuInventorySearchRows.delete(rowId);
  gpuInventoryRows = gpuInventoryRows.filter((row) => row.id !== rowId);
  placementInventorySeeded = true;
  clearPlacementResults();
  for (const config of placementModelConfigs.values()) {
    if (config.pinnedGpu !== "" && Number(config.pinnedGpu) >= gpuInventoryRows.length) config.pinnedGpu = "";
  }
  renderGpuInventory();
  renderPlacementSelectedChips();
  renderPlacementWorkspaceUi();
  syncUrlState();
}

function updateGpuInventoryRow(rowId, field, value) {
  const row = gpuInventoryRows.find((item) => item.id === rowId);
  if (!row) return;
  if (field === "presetId") row.presetId = value;
  if (field === "count") row.count = clampNumber(value, 1, 8, 1);
  placementInventorySeeded = true;
  clearPlacementResults();
  syncUrlState();
}

function getModelsForPlacementType(type) {
  if (type === "embedding") return EMBEDDING_MODELS;
  if (type === "reranker") return RERANKER_MODELS;
  if (type === "vision") return OCR_MODELS;
  if (type === "avatar-generation") return AVATAR_GENERATION_MODELS;
  if (type === "audio-stt") return AUDIO_STT_MODELS;
  if (type === "audio-tts") return AUDIO_TTS_MODELS;
  return GENERATIVE_MODELS;
}

function getPlacementPrecisions(model, precisionOptions) {
  const supportedIds = new Set(model.precisions || []);
  return precisionOptions.filter(
    (precision) => precision.id !== "auto" && (!supportedIds.size || supportedIds.has(precision.id)),
  );
}

function getPlacementWorkload(model) {
  if (model.type === "embedding") {
    return {
      ...PLACEMENT_DEFAULT_WORKLOADS.embedding,
      inputTokens: Math.min(PLACEMENT_DEFAULT_WORKLOADS.embedding.inputTokens, model.maxTokens || Infinity),
    };
  }
  if (model.type === "reranker") {
    const maxPairTokens = Math.max(2, (model.maxTokens || 579) - 3);
    const queryTokens = Math.max(1, Math.min(64, Math.floor(maxPairTokens * 0.12)));
    return {
      ...PLACEMENT_DEFAULT_WORKLOADS.reranker,
      queryTokens,
      docTokens: Math.max(1, maxPairTokens - queryTokens),
    };
  }
  if (isVisionModel(model)) {
    return { type: model.type, ...PLACEMENT_DEFAULT_WORKLOADS.vision };
  }
  if (model.type === "audio-stt" || model.type === "audio-tts") {
    return { type: model.type };
  }
  return null;
}

function renderPlacementModelList() {
  const container = $("placementModelList");
  if (!container) return;
  const query = placementSearchQuery.trim().toLowerCase();
  if (!placementModelBrowserOpened && !query) {
    container.innerHTML = `
      <div class="placement-model-gate">
        <strong>${uiLanguage === "en" ? "The full catalog stays hidden until you need it." : "필요할 때만 전체 모델 목록을 여세요."}</strong>
        <span>${uiLanguage === "en" ? "Search by model name above, or choose a workload category to browse." : "위 검색창에 모델명을 입력하거나 워크로드 종류를 선택해 탐색하세요."}</span>
        <button type="button" class="ghost-button" data-open-placement-browser>${uiLanguage === "en" ? "Browse this category" : "현재 종류 모델 보기"}</button>
      </div>
    `;
    return;
  }
  const pool = getModelsForPlacementType(placementActiveType);
  const filtered = query
    ? pool.filter((model) =>
        `${model.name} ${model.maker || ""} ${(model.tags || []).join(" ")}`.toLowerCase().includes(query),
      )
    : pool;

  if (!filtered.length) {
    container.innerHTML = `<p class="gpu-placement-empty">검색 결과가 없습니다.</p>`;
    return;
  }

  container.innerHTML = sortModelCatalog(filtered)
    .slice(0, 150)
    .map((model) => {
      const key = modelKey(model);
      const checked = placementSelectedKeys.has(key);
      return `
        <label class="placement-model-item ${checked ? "is-checked" : ""}">
          <input type="checkbox" data-model-key="${escapeAttr(key)}" ${checked ? "checked" : ""} />
          <span>${escapeHtml(model.name)}</span>
          <small>${escapeHtml(model.maker || "")}${model.params ? ` · ${model.params}B` : ""}</small>
        </label>
      `;
    })
    .join("");
}

function getPlacementModelConfig(key) {
  if (!placementModelConfigs.has(key)) {
    placementModelConfigs.set(key, {
      requestShare: 100,
      minConcurrency: 1,
      pinnedGpu: "",
      preferredSetting: "auto",
      contextTokens: null,
      allowReplica: true,
    });
  }
  return placementModelConfigs.get(key);
}

function renderPlacementSettingOptions(model, config) {
  const options = getPlacementBaselineOptions(model, { ...getHardware(), concurrency: 1 });
  return [
    `<option value="auto">${uiLanguage === "en" ? "Recommended / auto" : "권장 설정 / 자동"}</option>`,
    ...options.map((option) => (
      `<option value="${escapeAttr(option.setting.id)}" ${config.preferredSetting === option.setting.id ? "selected" : ""}>${escapeHtml(option.label)}</option>`
    )),
  ].join("");
}

function renderPlacementSelectedChips() {
  const container = $("placementModelSelected");
  if (!container) return;
  if (!placementSelectedKeys.size) {
    container.innerHTML = `<p class="gpu-placement-empty">아직 선택된 모델이 없습니다.</p>`;
    return;
  }
  container.innerHTML = [...placementSelectedKeys]
    .map((key) => {
      const model = getModelByKey(key);
      if (!model) return "";
      const config = getPlacementModelConfig(key);
      const isGenerative = !model.type || model.type === "generative";
      const contextValue = config.contextTokens || getHardware().context || 8192;
      return `
        <details class="placement-model-config" data-placement-config-key="${escapeAttr(key)}">
          <summary>
            <span>${escapeHtml(model.name)}</span>
            <small>${escapeHtml(model.maker || "")}</small>
            <button type="button" data-remove-placement-key="${escapeAttr(key)}" aria-label="${uiLanguage === "en" ? "Remove selection" : "선택 해제"}">×</button>
          </summary>
          <div class="placement-model-config-grid">
            <label class="field">
              <span>${uiLanguage === "en" ? "Preferred setting" : "선호 양자화/정밀도"}</span>
              <select data-placement-config-field="preferredSetting">${renderPlacementSettingOptions(model, config)}</select>
            </label>
            <label class="field">
              <span>${uiLanguage === "en" ? "Request share (%)" : "요청 비율 (%)"}</span>
              <input type="number" min="1" max="1000" step="1" value="${config.requestShare}" data-placement-config-field="requestShare" ${placementUsageMode === "independent" ? "" : "disabled"} />
            </label>
            <label class="field">
              <span>${uiLanguage === "en" ? "Minimum concurrency" : "최소 동시 접속"}</span>
              <input type="number" min="0" max="256" step="1" value="${config.minConcurrency}" data-placement-config-field="minConcurrency" />
            </label>
            <label class="field">
              <span>${uiLanguage === "en" ? "Pin to GPU" : "GPU 고정"}</span>
              <select data-placement-config-field="pinnedGpu">
                <option value="">${uiLanguage === "en" ? "No pin" : "고정 안 함"}</option>
                ${gpuInventoryRows.map((row, index) => {
                  const preset = GPU_PRESETS.find((gpu) => gpu.id === row.presetId);
                  return `<option value="${index}" ${String(config.pinnedGpu) === String(index) ? "selected" : ""}>GPU ${index + 1}${preset ? ` · ${escapeHtml(preset.name)}` : ""}</option>`;
                }).join("")}
              </select>
            </label>
            ${isGenerative ? `
              <label class="field">
                <span>${uiLanguage === "en" ? "Preferred context" : "선호 컨텍스트"}</span>
                <input type="number" min="2048" max="${Math.max(2048, model.maxContext || 1048576)}" step="1024" value="${contextValue}" data-placement-config-field="contextTokens" />
              </label>
            ` : ""}
            <label class="placement-model-replica">
              <input type="checkbox" data-placement-config-field="allowReplica" ${config.allowReplica ? "checked" : ""} ${placementUsageMode === "independent" ? "" : "disabled"} />
              <span>${uiLanguage === "en" ? "Allow replicas for this model" : "이 모델 복제 허용"}</span>
            </label>
          </div>
        </details>
      `;
    })
    .join("");
}

function togglePlacementModel(key) {
  if (placementSelectedKeys.has(key)) {
    placementSelectedKeys.delete(key);
    placementModelConfigs.delete(key);
  } else {
    placementSelectedKeys.add(key);
    getPlacementModelConfig(key);
  }
  clearPlacementResults();
  renderPlacementModelList();
  renderPlacementSelectedChips();
  renderPlacementPrimarySelect();
  renderPlacementWorkspaceUi();
  syncUrlState();
}

// Keeps the "주 모델" dropdown in sync with whatever's currently selected
// for placement — options are rebuilt from placementSelectedKeys every call,
// and the previous choice is kept only if that model is still selected.
function renderPlacementPrimarySelect() {
  const select = $("placementPrimaryModel");
  if (!select) return;
  const placeholder = uiLanguage === "en" ? "None" : "지정 안 함";
  const keys = [...placementSelectedKeys];
  if (placementPrimaryKey && !keys.includes(placementPrimaryKey)) placementPrimaryKey = "";
  select.innerHTML = [
    `<option value="">${escapeHtml(placeholder)}</option>`,
    ...keys.map((key) => {
      const model = getModelByKey(key);
      return model ? `<option value="${escapeAttr(key)}">${escapeHtml(model.name)}</option>` : "";
    }),
  ].join("");
  select.value = placementPrimaryKey;
}

function setPlacementStrategy(strategy) {
  placementStrategy = ["compact", "throughput", "primary"].includes(strategy) ? strategy : "balanced";
  if (placementStrategy === "primary" && !placementPrimaryKey && placementSelectedKeys.size) {
    placementPrimaryKey = [...placementSelectedKeys][0];
    renderPlacementPrimarySelect();
  }
  document.querySelectorAll("[data-placement-strategy]").forEach((button) => {
    const isActive = button.dataset.placementStrategy === placementStrategy;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  // Re-run immediately if a result is already showing, so switching the
  // toggle updates the placement without a second click on "배치 계산".
  if ($("gpuPlacementResult")?.innerHTML.trim()) runGpuPlacement();
  else syncUrlState();
}

const PLACEMENT_USAGE_HINTS = {
  pipeline: {
    ko: "선택한 모델들이 하나로 이어져 요청 한 건을 함께 처리한다고 가정합니다. 가장 여유가 적은 모델이 전체 처리 속도를 정합니다.",
    en: "Assumes the selected models form a single pipeline handling one request together — whichever model has the least headroom sets the pace for all of them.",
  },
  independent: {
    ko: "각 모델을 서로 다른 사용자가 독립적으로 호출하는 별도 서비스로 간주합니다. 하나의 공통 기준 대신 모델별 동시 접속 여유를 각각 보여줍니다.",
    en: "Treats each model as a separate service called independently — shows each model's own concurrency headroom instead of one shared number.",
  },
  alternate: {
    ko: "한 번에 모델 하나만 올려서 교체해가며 쓴다고 가정합니다. 모델끼리 VRAM을 나눠 쓰지 않고, 각자 GPU 전체를 기준으로 계산합니다.",
    en: "Assumes only one model is loaded at a time and you swap between them — each model is evaluated against a whole GPU on its own, without sharing VRAM with the others.",
  },
};

function setPlacementUsageMode(mode) {
  placementUsageMode = ["pipeline", "independent", "alternate"].includes(mode) ? mode : "independent";
  document.querySelectorAll("[data-placement-usage]").forEach((button) => {
    const isActive = button.dataset.placementUsage === placementUsageMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  const hintEl = $("gpuPlacementUsageHint");
  if (hintEl) hintEl.textContent = PLACEMENT_USAGE_HINTS[placementUsageMode][uiLanguage === "en" ? "en" : "ko"];
  const replicationControl = $("placementAllowReplication");
  if (replicationControl) {
    replicationControl.disabled = placementUsageMode !== "independent";
    replicationControl.closest("label")?.classList.toggle("is-disabled", replicationControl.disabled);
  }
  renderPlacementSelectedChips();
  if ($("gpuPlacementResult")?.innerHTML.trim()) runGpuPlacement();
  else syncUrlState();
}

function setPlacementActiveType(type) {
  placementActiveType = type;
  placementModelBrowserOpened = true;
  document.querySelectorAll("[data-placement-type]").forEach((button) => {
    const isActive = button.dataset.placementType === type;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  renderPlacementModelList();
}

function getPlacementBaselineOptions(model, hardware) {
  if (model.type === "audio-stt" || model.type === "audio-tts") {
    const estimate = estimateAudioModel(model, { ...hardware, concurrency: 1 });
    return [{
      setting: { id: "fp16", label: "FP16", rank: 4 },
      label: "FP16",
      requiredGb: estimate.requiredGb,
    }];
  }
  if (model.type === "embedding") {
    const workload = getPlacementWorkload(model);
    return getPlacementPrecisions(model, ENCODER_PRECISIONS)
      .map((precision) => ({
        setting: precision,
        label: precision.label,
        requiredGb: estimateEncoderWithPrecision(model, hardware, workload, precision).requiredGb,
      }))
      .sort((a, b) => a.requiredGb - b.requiredGb);
  }
  if (model.type === "reranker") {
    const workload = getPlacementWorkload(model);
    return getPlacementPrecisions(model, ENCODER_PRECISIONS)
      .map((precision) => ({
        setting: precision,
        label: precision.label,
        requiredGb: estimateRerankerWithPrecision(model, hardware, workload, precision).requiredGb,
      }))
      .sort((a, b) => a.requiredGb - b.requiredGb);
  }
  if (isVisionModel(model)) {
    const workload = getPlacementWorkload(model);
    return getPlacementPrecisions(model, OCR_PRECISIONS)
      .map((precision) => ({
        setting: precision,
        label: precision.label,
        requiredGb: estimateVisionWithPrecision(model, hardware, workload, precision).requiredGb,
      }))
      .sort((a, b) => a.requiredGb - b.requiredGb);
  }
  const singleUserHardware = { ...hardware, concurrency: 1 };
  return QUANTS
    .filter((quant) => quant.id !== "auto")
    .map((quant) => ({
      setting: quant,
      label: quant.label,
      requiredGb: estimateWithQuant(model, quant, singleUserHardware).requiredGb,
    }))
    .sort((a, b) => a.requiredGb - b.requiredGb);
}

function getPlacementCapacity(model, setting, hardware, budgetGb) {
  if (!model.type || model.type === "generative") {
    return { kind: "concurrency", ...computeConcurrencyBounds(model, setting, { ...hardware, concurrency: 1 }, budgetGb) };
  }
  const budgetHardware = { ...hardware, availableVram: budgetGb, baseEffectiveVram: budgetGb };
  if (model.type === "audio-stt" || model.type === "audio-tts") {
    const estimate = estimateAudioModel(model, budgetHardware);
    return { kind: "throughput", unit: "× realtime", value: estimate.speed };
  }
  if (model.type === "embedding") {
    const estimate = estimateEncoderWithPrecision(model, budgetHardware, getPlacementWorkload(model), setting);
    return { kind: "throughput", unit: "doc/s", value: estimate.speed, tokenUnit: "tok/s", tokenValue: estimate.throughput };
  }
  if (model.type === "reranker") {
    const estimate = estimateRerankerWithPrecision(model, budgetHardware, getPlacementWorkload(model), setting);
    return { kind: "throughput", unit: "pair/s", value: estimate.speed };
  }
  const workload = getPlacementWorkload(model);
  const estimate = estimateVisionWithPrecision(model, budgetHardware, workload, setting);
  return { kind: "throughput", unit: "page/s", value: estimate.speed };
}

function buildGpuPlacementHardware(baseHardware, gpu, availableVram) {
  const { preset, count, capacityGb } = gpu;
  const compute = estimateHardwareCompute(preset, preset.bandwidth);
  const computeTotal = Object.fromEntries(
    Object.entries(compute).map(([key, value]) => [key, value * count]),
  );

  return {
    ...baseHardware,
    vram: preset.vram,
    primaryCount: count,
    secondaryCount: 0,
    count,
    ram: preset.ram,
    bandwidth: preset.bandwidth,
    reservedVram: 0,
    safetyMarginGb: 0,
    totalVram: preset.vram * count,
    baseEffectiveVram: capacityGb,
    availableVram,
    preset,
    secondaryPreset: null,
    heterogeneous: false,
    crossVendor: false,
    shardingEfficiency: count > 1 ? 0.92 : 1,
    aggregateBandwidth: preset.bandwidth * count,
    compute,
    computeTotal,
  };
}

// strategy "balanced" (default) spreads models across GPUs so remaining VRAM
// stays even (worst-fit: for each model, pick the GPU that has the MOST
// leftover room after placing it) — this avoids the "GPU 1 crammed full,
// GPU 2 sitting mostly empty" outcome that a naive tight-pack produces.
// strategy "compact" keeps the previous best-fit behavior (minimize
// leftover), which packs more models onto fewer GPUs at the cost of one GPU
// running close to its limit while another goes unused ("모델 보존형" — most
// likely to fit every selected model somewhere).
// strategy "throughput" picks, for each model, whichever available GPU
// would actually give IT the highest recommended concurrency/throughput
// right now (a real capacity read via buildGpuPlacementHardware +
// getPlacementCapacity, not just a leftover-VRAM proxy) — favors total
// output over an even spread or a tight pack.
function computeGreedyGpuPlacement(gpuRows, modelKeys, strategy = "balanced", primaryKey = "") {
  const hardwareBase = getHardware();
  const singleUserHardware = { ...hardwareBase, concurrency: 1 };

  const gpus = gpuRows.map((row, index) => {
    const preset = GPU_PRESETS.find((gpu) => gpu.id === row.presetId) || GPU_PRESETS[0];
    const count = clampNumber(row.count, 1, 8, 1);
    const capacityGb = preset.vram * count * 0.92; // 예약분/오버헤드 여유 반영
    return {
      index,
      preset,
      count,
      capacityGb,
      remaining: capacityGb,
      placements: [],
    };
  });

  const models = modelKeys.map((key) => getModelByKey(key)).filter(Boolean);

  const modelOptions = models.map((model) => {
    const options = getPlacementBaselineOptions(model, singleUserHardware);
    return { model, options, bestRequiredGb: options[0]?.requiredGb ?? Infinity };
  });

  // 가장 큰(무거운) 모델부터 배치해야 나중에 자투리 공간 낭비가 줄어듭니다 (Decreasing).
  modelOptions.sort((a, b) => b.bestRequiredGb - a.bestRequiredGb);

  // 주 모델이 지정된 경우, 크기 순서와 무관하게 맨 먼저 배치해 GPU 중 가장
  // 여유가 많은 곳을 우선적으로 차지하도록 합니다 (다른 모델들이 그 뒤를 채움).
  if (primaryKey) {
    const primaryIndex = modelOptions.findIndex((entry) => modelKey(entry.model) === primaryKey);
    if (primaryIndex > 0) {
      const [primaryEntry] = modelOptions.splice(primaryIndex, 1);
      modelOptions.unshift(primaryEntry);
    }
  }

  const unplaced = [];
  for (const { model, options } of modelOptions) {
    const isPrimary = primaryKey && modelKey(model) === primaryKey;
    let bestChoice = null;
    for (const gpu of gpus) {
      const fit = [...options].reverse().find((option) => option.requiredGb <= gpu.remaining);
      if (!fit) continue;
      const leftover = gpu.remaining - fit.requiredGb;
      // The primary model always goes on whichever GPU currently has the
      // most room, regardless of strategy — everyone else still follows the
      // chosen strategy's scoring rule (higher score always wins below).
      let score;
      if (isPrimary) {
        score = leftover;
      } else if (strategy === "compact") {
        score = -leftover;
      } else if (strategy === "throughput") {
        const hw = buildGpuPlacementHardware(singleUserHardware, gpu, gpu.remaining);
        const capacity = getPlacementCapacity(model, fit.setting, hw, gpu.remaining);
        score = capacity.kind === "concurrency" ? capacity.recommendedN : capacity.value;
      } else {
        score = leftover;
      }
      if (!bestChoice || score > bestChoice.score) {
        bestChoice = { gpu, setting: fit.setting, label: fit.label, requiredGb: fit.requiredGb, leftover, score };
      }
    }
    if (bestChoice) {
      bestChoice.gpu.remaining -= bestChoice.requiredGb;
      bestChoice.gpu.placements.push({ model, setting: bestChoice.setting, label: bestChoice.label, requiredGb: bestChoice.requiredGb, isPrimary });
    } else {
      unplaced.push({ model, minRequiredGb: options[0]?.requiredGb ?? 0 });
    }
  }

  // 배치가 끝난 뒤: 같은 GPU를 공유하는 다른 모델은 기본 부하 그대로 두고,
  // 이 모델에게 GPU의 남은 여유를 몰아줬을 때 병목 없이 어디까지 처리할 수 있는지 계산합니다.
  for (const gpu of gpus) {
    for (const placement of gpu.placements) {
      const budgetGb = gpu.remaining + placement.requiredGb;
      const placementHardware = buildGpuPlacementHardware(singleUserHardware, gpu, budgetGb);
      placement.capacity = getPlacementCapacity(placement.model, placement.setting, placementHardware, budgetGb);
    }
  }

  return { gpus, unplaced };
}

function getPlacementContextCandidates(model, config) {
  if (model.type && model.type !== "generative") return [null];
  const modelMax = model.maxContext || 1048576;
  const preferred = Math.min(modelMax, Math.max(2048, config.contextTokens || getHardware().context || 8192));
  if (!placementAllowContextReduction) return [preferred];
  const values = [preferred];
  let next = preferred;
  while (next > 2048 && values.length < 5) {
    next = Math.max(2048, Math.floor(next / 2 / 1024) * 1024);
    if (!values.includes(next)) values.push(next);
  }
  return values;
}

function getPlacementSearchCandidates(model, config, baseHardware, maxCapacityGb) {
  const contexts = getPlacementContextCandidates(model, config);
  const all = [];

  contexts.forEach((contextTokens) => {
    const contextHardware = contextTokens ? { ...baseHardware, context: contextTokens } : baseHardware;
    let options = getPlacementBaselineOptions(model, contextHardware);
    const requested = config.preferredSetting;
    const selected = requested !== "auto"
      ? options.find((option) => option.setting.id === requested)
      : null;
    const preferred = selected || [...options].sort((a, b) => (b.setting.rank || 0) - (a.setting.rank || 0))[0];

    if (!placementAllowQuantChange) {
      options = preferred ? [preferred] : [];
    } else if (selected) {
      options = options.filter((option) => (option.setting.rank || 0) <= (selected.setting.rank || 0));
    }

    for (const option of options) {
      if (!Number.isFinite(option.requiredGb) || option.requiredGb > maxCapacityGb + 0.001) continue;
      const settingDelta = Math.max(0, (preferred?.setting.rank || 0) - (option.setting.rank || 0));
      const preferredContext = contexts[0] || contextTokens;
      const contextDelta = contextTokens && preferredContext
        ? Math.max(0, Math.log2(preferredContext / contextTokens))
        : 0;
      all.push({
        ...option,
        contextTokens,
        qualityRank: option.setting.rank || 0,
        changeCost: settingDelta + contextDelta * 1.5,
        isPreferredSetting: option.setting.id === preferred?.setting.id,
        contextReduced: Boolean(contextTokens && preferredContext && contextTokens < preferredContext),
      });
    }
  });

  const deduped = [...new Map(
    all
      .sort((a, b) => b.qualityRank - a.qualityRank || b.contextTokens - a.contextTokens || a.requiredGb - b.requiredGb)
      .map((candidate) => [`${candidate.setting.id}:${candidate.contextTokens || 0}:${candidate.requiredGb.toFixed(3)}`, candidate]),
  ).values()];

  // Preserve both the highest-quality and smallest-memory ends of the
  // frontier while bounding browser work for very large selections.
  if (deduped.length <= 10) return deduped;
  const sampled = [];
  const indexes = [0, 1, 2, Math.floor(deduped.length * 0.35), Math.floor(deduped.length * 0.55), Math.floor(deduped.length * 0.75), deduped.length - 3, deduped.length - 2, deduped.length - 1];
  indexes.forEach((index) => {
    const candidate = deduped[Math.max(0, Math.min(deduped.length - 1, index))];
    if (candidate && !sampled.includes(candidate)) sampled.push(candidate);
  });
  return sampled;
}

function placementVariance(values) {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
}

function getPlacementPartialScore(state, strategy, primaryKey) {
  const usedGpuCount = state.placements.reduce((set, item) => set.add(item.gpuIndex), new Set()).size;
  const remainingVariance = placementVariance(state.remaining);
  const primaryPlaced = primaryKey && state.placements.some((item) => item.key === primaryKey) ? 1 : 0;
  const quality = state.placements.reduce((sum, item) => sum + item.candidate.qualityRank, 0);
  const changeCost = state.placements.reduce((sum, item) => sum + item.candidate.changeCost, 0);
  const requestWeight = state.placements.reduce((sum, item) => {
    const share = placementUsageMode === "independent" ? item.config.requestShare : 100;
    return sum + share * item.candidate.qualityRank;
  }, 0);
  const placed = state.placements.length;
  const unplaced = state.unplaced.length;

  if (strategy === "throughput") return placed * 1e9 - unplaced * 1e9 + requestWeight * 1e4 - changeCost * 100 - remainingVariance;
  if (strategy === "compact") return placed * 1e9 - unplaced * 1e9 + quality * 1e4 - usedGpuCount * 1000 - changeCost * 100;
  if (strategy === "primary") return primaryPlaced * 1e12 + placed * 1e9 - unplaced * 1e9 + quality * 1e4 - changeCost * 100 - remainingVariance;
  return placed * 1e9 - unplaced * 1e9 + primaryPlaced * 1e7 - changeCost * 1e4 - remainingVariance * 1000 + quality * 100;
}

function buildPlacementGpuRows(gpuRows) {
  const headroomRatio = Math.max(0, Math.min(0.4, placementMinHeadroomPct / 100));
  return gpuRows.map((row, index) => {
    const preset = GPU_PRESETS.find((gpu) => gpu.id === row.presetId) || GPU_PRESETS[0];
    const count = clampNumber(row.count, 1, 8, 1);
    const physicalCapacityGb = preset.vram * count;
    const reservedHeadroomGb = physicalCapacityGb * headroomRatio;
    const capacityGb = physicalCapacityGb - reservedHeadroomGb;
    return {
      index,
      preset,
      count,
      physicalCapacityGb,
      reservedHeadroomGb,
      capacityGb,
      remaining: capacityGb,
      placements: [],
    };
  });
}

function recomputePlacementCapacities(placement) {
  const hardwareBase = { ...getHardware(), concurrency: 1 };
  for (const gpu of placement.gpus) {
    for (const item of gpu.placements) {
      const budgetGb = gpu.remaining + item.requiredGb;
      const placementHardware = buildGpuPlacementHardware(
        item.contextTokens ? { ...hardwareBase, context: item.contextTokens } : hardwareBase,
        gpu,
        budgetGb,
      );
      item.capacity = getPlacementCapacity(item.model, item.setting, placementHardware, budgetGb);
    }
  }
  return placement;
}

function getPlacementServiceGroups(placement) {
  const groups = new Map();
  placement.gpus.forEach((gpu) => {
    gpu.placements.forEach((item) => {
      const key = modelKey(item.model);
      if (!groups.has(key)) groups.set(key, { key, model: item.model, config: item.config, items: [] });
      groups.get(key).items.push({ ...item, gpuIndex: gpu.index });
    });
  });
  return [...groups.values()].map((group) => {
    const concurrency = group.items.filter((item) => item.capacity?.kind === "concurrency");
    const throughput = group.items.filter((item) => item.capacity?.kind === "throughput");
    return {
      ...group,
      recommendedN: concurrency.length ? concurrency.reduce((sum, item) => sum + item.capacity.recommendedN, 0) : null,
      maxN: concurrency.length ? concurrency.reduce((sum, item) => sum + item.capacity.maxN, 0) : null,
      speed: concurrency.reduce((sum, item) => sum + (item.capacity.speedAtRecommended?.total || 0), 0),
      throughput: throughput.reduce((sum, item) => sum + (item.capacity.value || 0), 0),
      unit: throughput[0]?.capacity?.unit || null,
    };
  });
}

function getPlacementStats(placement) {
  const groups = getPlacementServiceGroups(placement);
  const concurrencyGroups = groups.filter((group) => group.recommendedN != null);
  const target = placementTargetN;
  const shortfallCount = concurrencyGroups.filter((group) => {
    const minimum = Math.max(group.config?.minConcurrency || 0, target || 0);
    return group.recommendedN < minimum;
  }).length;
  const minimumViolationCount = concurrencyGroups.filter((group) => (
    group.recommendedN < (group.config?.minConcurrency || 0)
  )).length + placement.unplaced.length;
  const zeroCount = concurrencyGroups.filter((group) => group.recommendedN <= 0).length;
  const serviceFloor = concurrencyGroups.length ? Math.min(...concurrencyGroups.map((group) => group.recommendedN)) : null;
  const weightedCapacity = groups.reduce((sum, group) => {
    const value = group.recommendedN ?? group.throughput ?? 0;
    const requestWeight = placementUsageMode === "independent" ? Math.max(1, group.config?.requestShare || 100) : 100;
    return sum + value * requestWeight;
  }, 0);
  const totalTokThroughput = groups.reduce((sum, group) => sum + group.speed, 0);
  const used = placement.gpus.filter((gpu) => gpu.placements.length);
  const headroomRatios = used.map((gpu) => gpu.capacityGb ? gpu.remaining / gpu.capacityGb : 0);
  const primaryGroup = groups.find((group) => group.key === placementPrimaryKey);
  const configuredFloor = Math.max(1, placementTargetN || 0, ...groups.map((group) => group.config?.minConcurrency || 0));
  return {
    groups,
    placedCount: groups.length,
    unplacedCount: placement.unplaced.length,
    zeroCount,
    shortfallCount,
    minimumViolationCount,
    serviceFloor,
    goalSatisfaction: serviceFloor == null ? 0 : Math.min(serviceFloor, configuredFloor),
    weightedCapacity,
    totalTokThroughput,
    headroomVariance: placementVariance(headroomRatios),
    usedGpuCount: used.length,
    primaryCapacity: primaryGroup ? (primaryGroup.recommendedN ?? primaryGroup.throughput ?? 0) : 0,
    primaryGoalSatisfaction: primaryGroup
      ? Math.min(primaryGroup.recommendedN ?? primaryGroup.throughput ?? 0, Math.max(1, placementTargetN || 0, primaryGroup.config?.minConcurrency || 0))
      : 0,
    changeCost: placement.gpus.flatMap((gpu) => gpu.placements).reduce((sum, item) => sum + (item.changeCost || 0), 0),
  };
}

function comparePlacementStats(a, b, strategy) {
  const tuples = {
    balanced: (value) => [-value.minimumViolationCount, -value.unplacedCount, -value.zeroCount, -value.shortfallCount, value.goalSatisfaction, -value.changeCost, -value.headroomVariance, value.weightedCapacity],
    throughput: (value) => [-value.minimumViolationCount, -value.unplacedCount, value.weightedCapacity, -value.shortfallCount, value.totalTokThroughput, -value.changeCost, -value.headroomVariance],
    compact: (value) => [-value.minimumViolationCount, value.placedCount, -value.unplacedCount, -value.usedGpuCount, -value.changeCost, value.weightedCapacity],
    primary: (value) => [-value.minimumViolationCount, value.primaryGoalSatisfaction, -value.unplacedCount, -value.zeroCount, -value.shortfallCount, value.goalSatisfaction, -value.changeCost, value.primaryCapacity, value.weightedCapacity],
  };
  const getTuple = tuples[strategy] || tuples.balanced;
  const left = getTuple(a);
  const right = getTuple(b);
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return right[index] - left[index];
  }
  return 0;
}

function addPlacementReplicas(placement, strategy) {
  if (!placementAllowReplication || placementUsageMode !== "independent" || !["throughput", "primary"].includes(strategy)) return placement;
  const groupKeys = getPlacementServiceGroups(placement)
    .filter((group) => group.config?.allowReplica)
    .sort((a, b) => (b.config?.requestShare || 100) - (a.config?.requestShare || 100))
    .map((group) => group.key);

  for (const key of groupKeys) {
    const group = getPlacementServiceGroups(placement).find((candidate) => candidate.key === key);
    const original = group?.items[0];
    if (!original) continue;
    const requiredTarget = Math.max(placementTargetN || 0, group.config?.minConcurrency || 0);
    if (strategy !== "throughput" && group.recommendedN >= requiredTarget) continue;
    const targetGpu = placement.gpus
      .filter((gpu) => gpu.remaining >= original.requiredGb && !gpu.placements.some((item) => modelKey(item.model) === group.key))
      .sort((a, b) => b.remaining - a.remaining)[0];
    if (!targetGpu) continue;
    const trial = {
      ...placement,
      gpus: placement.gpus.map((gpu) => ({
        ...gpu,
        placements: gpu.placements.map((item) => ({ ...item })),
      })),
    };
    const trialGpu = trial.gpus.find((gpu) => gpu.index === targetGpu.index);
    trialGpu.remaining -= original.requiredGb;
    trialGpu.placements.push({
      ...original,
      capacity: null,
      isReplica: true,
      replicaIndex: group.items.length + 1,
    });
    recomputePlacementCapacities(trial);
    const beforeStats = getPlacementStats(placement);
    const afterStats = getPlacementStats(trial);
    const improvesCapacity = afterStats.weightedCapacity > beforeStats.weightedCapacity + 0.001;
    const preservesConstraints = afterStats.minimumViolationCount <= beforeStats.minimumViolationCount;
    const preservesPrimary = strategy !== "primary" || afterStats.primaryCapacity >= beforeStats.primaryCapacity;
    if (improvesCapacity && preservesConstraints && preservesPrimary) {
      placement.gpus = trial.gpus;
    }
  }
  return placement;
}

function finalizePlacementState(state, gpuTemplate, entries, strategy, searchMeta) {
  const gpus = gpuTemplate.map((gpu, index) => ({
    ...gpu,
    remaining: state.remaining[index],
    placements: [],
  }));
  state.placements.forEach((assignment) => {
    const { entry, candidate, gpuIndex } = assignment;
    gpus[gpuIndex].placements.push({
      model: entry.model,
      setting: candidate.setting,
      label: candidate.contextReduced
        ? `${candidate.label} · ${formatContext(candidate.contextTokens)}`
        : candidate.label,
      requiredGb: candidate.requiredGb,
      contextTokens: candidate.contextTokens,
      contextReduced: candidate.contextReduced,
      settingChanged: !candidate.isPreferredSetting,
      changeCost: candidate.changeCost,
      config: entry.config,
      isPrimary: entry.key === placementPrimaryKey,
      pinnedGpu: entry.config.pinnedGpu,
    });
  });
  const unplaced = state.unplaced.map((entry) => ({
    model: entry.model,
    minRequiredGb: (() => {
      const minimum = entry.candidates.reduce(
        (value, candidate) => Math.min(value, candidate.requiredGb),
        Infinity,
      );
      return Number.isFinite(minimum) ? minimum : 0;
    })(),
    reason: entry.config.pinnedGpu !== "" ? "pinned-capacity" : "capacity",
  }));
  const placement = recomputePlacementCapacities({
    gpus,
    unplaced,
    searchMeta,
    strategy,
    constraints: {
      minHeadroomPct: placementMinHeadroomPct,
      allowQuantChange: placementAllowQuantChange,
      allowContextReduction: placementAllowContextReduction,
      allowReplication: placementAllowReplication && placementUsageMode === "independent",
    },
  });
  addPlacementReplicas(placement, strategy);
  placement.stats = getPlacementStats(placement);
  return placement;
}

function computeGpuPlacement(gpuRows, modelKeys, strategy = "balanced", primaryKey = "") {
  const baseHardware = { ...getHardware(), concurrency: 1 };
  const gpuTemplate = buildPlacementGpuRows(gpuRows);
  const maxCapacityGb = Math.max(0, ...gpuTemplate.map((gpu) => gpu.capacityGb));
  const entries = modelKeys
    .map((key) => {
      const model = getModelByKey(key);
      if (!model) return null;
      const config = getPlacementModelConfig(key);
      return {
        key,
        model,
        config,
        candidates: getPlacementSearchCandidates(model, config, baseHardware, maxCapacityGb),
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (a.key === primaryKey) return -1;
      if (b.key === primaryKey) return 1;
      const aMin = Math.min(...a.candidates.map((candidate) => candidate.requiredGb), Infinity);
      const bMin = Math.min(...b.candidates.map((candidate) => candidate.requiredGb), Infinity);
      return bMin - aMin;
    });

  let frontier = [{
    remaining: gpuTemplate.map((gpu) => gpu.capacityGb),
    placements: [],
    unplaced: [],
  }];
  let exploredStates = 1;
  let pruned = false;
  const beamWidth = entries.length <= 8 ? 5000 : 1400;

  for (const entry of entries) {
    const next = [];
    const pin = entry.config.pinnedGpu === "" ? null : Number(entry.config.pinnedGpu);
    for (const state of frontier) {
      let foundChoice = false;
      gpuTemplate.forEach((gpu, gpuIndex) => {
        if (pin != null && gpuIndex !== pin) return;
        entry.candidates.forEach((candidate) => {
          if (candidate.requiredGb > state.remaining[gpuIndex] + 0.0001) return;
          foundChoice = true;
          const remaining = [...state.remaining];
          remaining[gpuIndex] -= candidate.requiredGb;
          next.push({
            remaining,
            placements: [...state.placements, { entry, key: entry.key, config: entry.config, candidate, gpuIndex }],
            unplaced: state.unplaced,
          });
        });
      });
      // Keep an explicit unplaced branch so "model count" and target
      // feasibility are evaluated rather than silently forcing a bad fit.
      next.push({
        remaining: state.remaining,
        placements: state.placements,
        unplaced: [...state.unplaced, entry],
      });
      if (!foundChoice && !entry.candidates.length) exploredStates += 1;
    }
    exploredStates += next.length;
    next.sort((a, b) => getPlacementPartialScore(b, strategy, primaryKey) - getPlacementPartialScore(a, strategy, primaryKey));
    if (next.length > beamWidth) pruned = true;
    frontier = next.slice(0, beamWidth);
  }

  const finalists = frontier
    .slice(0, Math.min(frontier.length, 120))
    .map((state) => finalizePlacementState(state, gpuTemplate, entries, strategy, {
      mode: pruned ? "approximate" : "exact",
      exploredStates,
      candidateFrontier: frontier.length,
    }))
    .sort((a, b) => comparePlacementStats(a.stats, b.stats, strategy));

  const hardConstraintMatches = finalists.filter((placement) => placement.stats.minimumViolationCount === 0);
  const best = (hardConstraintMatches.length ? hardConstraintMatches : finalists)[0];
  if (best) return best;
  const fallback = computeGreedyGpuPlacement(gpuRows, modelKeys, strategy, primaryKey);
  fallback.searchMeta = { mode: "fallback", exploredStates, candidateFrontier: 0 };
  fallback.constraints = { minHeadroomPct: placementMinHeadroomPct };
  fallback.stats = getPlacementStats(fallback);
  return fallback;
}

function runGpuPlacement() {
  const modelKeys = [...placementSelectedKeys];
  const result = $("gpuPlacementResult");
  const baselineEl = $("gpuPlacementBaseline");
  const exportEl = $("gpuPlacementExport");
  if (!result) return;

  if (!modelKeys.length) {
    const emptyMessage = uiLanguage === "en"
      ? "Select at least one model to run together."
      : "동시에 띄울 모델을 하나 이상 선택해주세요.";
    result.innerHTML = `<p class="gpu-placement-empty">${escapeHtml(emptyMessage)}</p>`;
    if (baselineEl) {
      baselineEl.hidden = true;
      baselineEl.textContent = "";
    }
    if (exportEl) {
      exportEl.hidden = true;
      exportEl.innerHTML = "";
    }
    const emptyDiagnosisEl = $("gpuPlacementDiagnosis");
    if (emptyDiagnosisEl) {
      emptyDiagnosisEl.hidden = true;
      emptyDiagnosisEl.innerHTML = "";
    }
    if ($("gpuPlacementPlanCompare")) {
      $("gpuPlacementPlanCompare").hidden = true;
      $("gpuPlacementPlanCompare").innerHTML = "";
    }
    if ($("placementResultOverview")) $("placementResultOverview").innerHTML = "";
    if ($("placementResultStage")) $("placementResultStage").hidden = true;
    lastPlacementRun = null;
    renderPlacementWorkspaceUi();
    return;
  }

  const diagnosisEl = $("gpuPlacementDiagnosis");

  // "대체 모델" mode: models never coexist in VRAM, so there's no bin-packing,
  // no shared-GPU imbalance, and no single "공통" baseline to speak of — each
  // model is evaluated on its own against a whole GPU. Render that separate
  // (much simpler) path and skip the baseline/diagnosis/export UI, which all
  // assume the co-resident placement shape.
  if (placementUsageMode === "alternate") {
    const altPlacement = computeAlternatePlacement(gpuInventoryRows, modelKeys);
    result.innerHTML = renderAlternatePlacementResult(altPlacement);
    lastPlacementRun = { alternate: true, ...altPlacement };
    if ($("placementResultOverview")) {
      const placed = altPlacement.items.length;
      const failed = altPlacement.unplaced.length;
      $("placementResultOverview").innerHTML = `
        <span class="placement-overview-kicker">${escapeHtml(uiLanguage === "en" ? "Recommended: alternate use" : "추천: 순차 실행")}</span>
        <strong>${escapeHtml(uiLanguage === "en"
          ? `${placed} model(s) can run one at a time${failed ? `; ${failed} don't fit.` : "."}`
          : `${placed}개 모델을 한 번에 하나씩 실행할 수 있습니다${failed ? ` · ${failed}개는 배치할 수 없습니다.` : "."}`)}</strong>
        <p>${escapeHtml(uiLanguage === "en" ? "Models do not share VRAM in this mode." : "이 방식에서는 모델끼리 VRAM을 나눠 쓰지 않습니다.")}</p>
      `;
    }
    if ($("placementResultStage")) $("placementResultStage").hidden = false;
    if (baselineEl) {
      baselineEl.hidden = true;
      baselineEl.innerHTML = "";
    }
    if (diagnosisEl) {
      diagnosisEl.hidden = true;
      diagnosisEl.innerHTML = "";
    }
    if (exportEl) {
      exportEl.hidden = true;
      exportEl.innerHTML = "";
    }
    if ($("gpuPlacementPlanCompare")) {
      $("gpuPlacementPlanCompare").hidden = true;
      $("gpuPlacementPlanCompare").innerHTML = "";
    }
    renderPlacementWorkspaceUi();
    syncUrlState();
    return;
  }

  const placement = computeGpuPlacement(gpuInventoryRows, modelKeys, placementStrategy, placementPrimaryKey);
  lastPlacementRun = placement;
  result.innerHTML = renderGpuPlacementResult(placement);
  renderPlacementExport(placement);
  if ($("placementResultStage")) $("placementResultStage").hidden = false;

  if (baselineEl) {
    const baseline = computePlacementBaseline(placement);
    const html = placementUsageMode === "independent"
      ? renderPlacementBaselineIndependent(baseline, placement)
      : renderPlacementBaseline(baseline);
    baselineEl.innerHTML = html;
    baselineEl.hidden = !html;
  }

  if (diagnosisEl) {
    const diagnosis = diagnosePlacement(placement, placementStrategy, gpuInventoryRows, modelKeys);
    if ($("placementResultOverview")) $("placementResultOverview").innerHTML = renderPlacementResultOverview(placement, diagnosis);
    const html = renderPlacementDiagnosis(diagnosis);
    diagnosisEl.innerHTML = html;
    diagnosisEl.hidden = !html;
  }
  comparePlacementPlans();
  renderPlacementWorkspaceUi();
  syncUrlState();
}

function renderPlacementResultOverview(placement, diagnosis) {
  const stats = placement.stats || getPlacementStats(placement);
  const groups = stats.groups || [];
  const concurrency = groups.map((group) => group.recommendedN).filter((value) => value != null);
  const minN = concurrency.length ? Math.min(...concurrency) : null;
  const maxN = concurrency.length ? Math.max(...concurrency) : null;
  const failed = placement.unplaced.length;
  const targetMissed = placementTargetN != null && minN != null && minN < placementTargetN;
  const plan = PLACEMENT_PLAN_DEFS.find((item) => item.key === placementStrategy) || PLACEMENT_PLAN_DEFS[0];
  const planName = uiLanguage === "en" ? plan.titleEn : plan.titleKo;
  let conclusion;
  if (failed) {
    conclusion = uiLanguage === "en"
      ? `${failed} of ${placementSelectedKeys.size} selected model(s) could not be placed.`
      : `선택한 ${placementSelectedKeys.size}개 모델 중 ${failed}개를 배치할 수 없습니다.`;
  } else if (targetMissed) {
    conclusion = uiLanguage === "en"
      ? `All models fit, but the target of ${placementTargetN} concurrent users is not met.`
      : `선택한 모델을 모두 배치할 수 있지만 목표 ${placementTargetN}명에는 도달하지 못합니다.`;
  } else {
    conclusion = uiLanguage === "en"
      ? "All selected models fit the current hardware and operating constraints."
      : "선택한 모델을 현재 하드웨어와 운영 조건 안에 모두 배치할 수 있습니다.";
  }
  const capacity = minN != null
    ? (uiLanguage === "en"
        ? `Recommended stable concurrency: ${minN}${maxN !== minN ? `–${maxN}` : ""}`
        : `현재 안전 동시 접속: ${minN}${maxN !== minN ? `~${maxN}` : ""}명`)
    : (uiLanguage === "en"
        ? `Estimated total throughput: ${formatThroughput(stats.totalTokThroughput || 0, "tok/s")}`
        : `예상 총 처리량: ${formatThroughput(stats.totalTokThroughput || 0, "tok/s")}`);
  const bottleneck = diagnosis?.bottleneck
    ? (uiLanguage === "en" ? `Bottleneck: ${diagnosis.bottleneck.model.name}` : `병목 모델: ${diagnosis.bottleneck.model.name}`)
    : "";
  return `
    <span class="placement-overview-kicker">${escapeHtml(uiLanguage === "en" ? `Recommended: ${planName}` : `추천: ${planName}`)}</span>
    <strong>${escapeHtml(conclusion)}</strong>
    <div class="placement-overview-metrics">
      <span>${escapeHtml(capacity)}</span>
      ${bottleneck ? `<span>${escapeHtml(bottleneck)}</span>` : ""}
    </div>
  `;
}

const PLACEMENT_PLAN_DEFS = [
  { key: "balanced", titleKo: "균형형", titleEn: "Balanced", descKo: "GPU 간 여유 VRAM을 고르게 분산", descEn: "Spreads remaining VRAM evenly across GPUs" },
  { key: "throughput", titleKo: "처리량형", titleEn: "Throughput", descKo: "총 예상 처리량이 가장 높은 배치를 우선", descEn: "Prioritizes whichever placement gives the highest total throughput" },
  { key: "compact", titleKo: "모델 보존형", titleEn: "Model-preserving", descKo: "선택한 모델을 최대한 모두 담는 배치", descEn: "Packs in as many of the selected models as possible" },
  { key: "primary", titleKo: "주 모델형", titleEn: "Primary-first", descKo: "주 모델의 목표와 품질을 먼저 확보", descEn: "Reserves capacity and quality for the primary model first" },
];

// Runs the full placement computation once per strategy and boils each down
// to the handful of numbers the comparison cards need (common concurrency,
// total throughput, how many models didn't fit). Reuses computeGpuPlacement/
// computePlacementBaseline exactly as the single-result view does — nothing
// here is a separate, simplified estimate.
function computePlacementPlanSummary(gpuRows, modelKeys, strategy, primaryKey) {
  const placement = computeGpuPlacement(gpuRows, modelKeys, strategy, primaryKey);
  const baseline = computePlacementBaseline(placement);
  const stats = placement.stats || getPlacementStats(placement);
  return {
    placement,
    commonN: stats.serviceFloor ?? baseline?.concurrencyBaseline?.recommendedN ?? null,
    throughputBaseline: baseline?.throughputBaseline ?? null,
    totalTokThroughput: stats.totalTokThroughput,
    unplacedCount: placement.unplaced.length,
    shortfallCount: stats.shortfallCount,
    changeCost: stats.changeCost,
    searchMode: placement.searchMeta?.mode || "fallback",
    remaining: placement.gpus.map((gpu) => gpu.remaining),
    automaticChanges: placement.gpus.flatMap((gpu) => gpu.placements).filter((item) => item.settingChanged || item.contextReduced).length,
  };
}

function comparePlacementPlans() {
  const modelKeys = [...placementSelectedKeys];
  const container = $("gpuPlacementPlanCompare");
  if (!container) return;
  if (!modelKeys.length) {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }
  const defs = PLACEMENT_PLAN_DEFS.filter((def) => ["balanced", "throughput", "primary"].includes(def.key));
  const primaryKeyForPlans = placementPrimaryKey || modelKeys[0] || "";
  const summaries = defs.map((def) => ({
    def,
    summary: computePlacementPlanSummary(gpuInventoryRows, modelKeys, def.key, primaryKeyForPlans),
  }));
  container.hidden = false;
  container.innerHTML = renderPlacementPlanCompare(summaries);
}

function renderPlacementPlanCompare(summaries) {
  const intro = uiLanguage === "en"
    ? "The same selected models, computed under three different placement strategies — apply whichever trade-off fits best."
    : "같은 모델을 세 가지 배치 기준으로 각각 계산한 결과입니다. 원하는 방식을 골라 바로 적용할 수 있습니다.";

  const cards = summaries
    .map(({ def, summary }) => {
      const title = uiLanguage === "en" ? def.titleEn : def.titleKo;
      const desc = uiLanguage === "en" ? def.descEn : def.descKo;
      const isActive = def.key === placementStrategy;

      const commonLine = summary.commonN != null
        ? (uiLanguage === "en" ? `Common concurrency: ${summary.commonN}` : `공통 동시 접속: ${summary.commonN}명`)
        : (uiLanguage === "en" ? "No concurrency-type models selected" : "동시 접속 대상 모델 없음");
      const throughputLine = summary.totalTokThroughput > 0
        ? (uiLanguage === "en" ? `Total throughput: ${formatThroughput(summary.totalTokThroughput, "tok/s")}` : `총 예상 처리량: ${formatThroughput(summary.totalTokThroughput, "tok/s")}`)
        : "";
      const unplacedLine = summary.unplacedCount > 0
        ? (uiLanguage === "en" ? `${summary.unplacedCount} model(s) don't fit anywhere` : `배치 못한 모델 ${summary.unplacedCount}개`)
        : (uiLanguage === "en" ? "All selected models fit" : "선택한 모델 전부 배치됨");
      const targetLine = summary.shortfallCount > 0
        ? (uiLanguage === "en" ? `${summary.shortfallCount} service(s) miss their target` : `목표 미달 서비스 ${summary.shortfallCount}개`)
        : (uiLanguage === "en" ? "Configured targets met" : "설정한 목표 충족");
      const searchLine = summary.searchMode === "exact"
        ? (uiLanguage === "en" ? "Exact candidate search" : "정확 후보 탐색")
        : (uiLanguage === "en" ? "Bounded approximate search" : "제한된 근사 탐색");
      const remainingLine = uiLanguage === "en"
        ? `Free VRAM: ${summary.remaining.map(formatGb).join(" / ")}`
        : `GPU별 여유: ${summary.remaining.map(formatGb).join(" / ")}`;
      const changesLine = uiLanguage === "en"
        ? `Automatic setting changes: ${summary.automaticChanges}`
        : `자동 설정 변경: ${summary.automaticChanges}개`;

      const buttonLabel = isActive
        ? (uiLanguage === "en" ? "Currently applied" : "현재 적용됨")
        : (uiLanguage === "en" ? "Apply this plan" : "이 배치안 적용");

      return `
        <div class="placement-plan-card${isActive ? " is-active" : ""}">
          <div class="placement-plan-card-head">
            <strong>${escapeHtml(title)}</strong>
            <p>${escapeHtml(desc)}</p>
          </div>
          <div class="placement-plan-card-body">
            <p class="${summary.commonN === 0 ? "capacity-warning" : ""}">${escapeHtml(commonLine)}</p>
            ${throughputLine ? `<p>${escapeHtml(throughputLine)}</p>` : ""}
            <p class="${summary.unplacedCount > 0 ? "capacity-warning" : ""}">${escapeHtml(unplacedLine)}</p>
            <p class="${summary.shortfallCount > 0 ? "capacity-warning" : ""}">${escapeHtml(targetLine)}</p>
            <p>${escapeHtml(remainingLine)}</p>
            <p>${escapeHtml(changesLine)}</p>
            <p class="placement-plan-search-mode">${escapeHtml(searchLine)}</p>
          </div>
          <button type="button" class="ghost-button" data-apply-placement-plan="${escapeAttr(def.key)}" ${isActive ? "disabled" : ""}>${escapeHtml(buttonLabel)}</button>
        </div>
      `;
    })
    .join("");

  return `<p class="gpu-placement-plan-compare-intro">${escapeHtml(intro)}</p><div class="placement-plan-cards">${cards}</div>`;
}

// 배치된 모델 전체를 통틀어 "운영 시 병목 없이 공통으로 맞출 기준값"을 찾습니다.
// 생성형(동시 접속자 수)과 임베딩/리랭커/OCR(처리량)은 단위가 달라 하나로 합칠 수 없으므로,
// 각 종류 안에서 가장 낮은(가장 먼저 병목이 걸리는) 값을 기준으로 따로 안내합니다.
function computePlacementBaseline(placement) {
  const placedItems = placement.gpus.flatMap((gpu) => gpu.placements.map((item) => ({ ...item, gpuIndex: gpu.index })));
  if (!placedItems.length) return null;

  const concurrencyItems = placedItems.filter((item) => item.capacity?.kind === "concurrency");
  const throughputItems = placedItems.filter((item) => item.capacity?.kind === "throughput" && item.capacity.value > 0);

  let concurrencyBaseline = null;
  if (concurrencyItems.length) {
    const bottleneck = concurrencyItems.reduce((min, item) => (item.capacity.recommendedN < min.capacity.recommendedN ? item : min));
    concurrencyBaseline = { recommendedN: bottleneck.capacity.recommendedN, modelName: bottleneck.model.name, gpuIndex: bottleneck.gpuIndex };
  }

  let throughputBaseline = null;
  if (throughputItems.length) {
    const bottleneck = throughputItems.reduce((min, item) => (item.capacity.value < min.capacity.value ? item : min));
    throughputBaseline = { value: bottleneck.capacity.value, unit: bottleneck.capacity.unit, modelName: bottleneck.model.name, gpuIndex: bottleneck.gpuIndex };
  }

  return { concurrencyBaseline, throughputBaseline };
}

// True when a target concurrency is set and this value falls short of it —
// shared by the collapsed (pipeline) and per-model (independent) baseline
// renderers so "below target" gets the same warning treatment as "0명".
function isBelowPlacementTarget(recommendedN) {
  return placementTargetN != null && recommendedN != null && recommendedN < placementTargetN;
}

function renderPlacementBaseline(baseline) {
  if (!baseline || (!baseline.concurrencyBaseline && !baseline.throughputBaseline)) return "";
  const parts = [];
  if (baseline.concurrencyBaseline) {
    const b = baseline.concurrencyBaseline;
    const zero = b.recommendedN <= 0;
    const belowTarget = isBelowPlacementTarget(b.recommendedN);
    if (zero || belowTarget) {
      const reason = zero
        ? (uiLanguage === "en" ? "not recommended to run" : "운영 비권장")
        : (uiLanguage === "en" ? `only ${b.recommendedN} (target ${placementTargetN} not met)` : `${b.recommendedN}명(목표 ${placementTargetN}명 미달)`);
      const msg = uiLanguage === "en"
        ? `Common concurrency: ${reason} (bottleneck: GPU${b.gpuIndex + 1} ${b.modelName})${zero ? " — see the diagnosis below" : ""}`
        : `공통 동시 접속: ${reason} (병목: GPU${b.gpuIndex + 1} ${b.modelName})${zero ? " — 아래 진단을 확인하세요" : ""}`;
      parts.push(`<span class="capacity-warning">${escapeHtml(msg)}</span>`);
    } else {
      const msg = uiLanguage === "en"
        ? `Common concurrency baseline ${b.recommendedN} (bottleneck: GPU${b.gpuIndex + 1} ${b.modelName})`
        : `공통 동시 접속 기준 ${b.recommendedN}명 (병목: GPU${b.gpuIndex + 1} ${b.modelName})`;
      parts.push(escapeHtml(msg));
    }
  }
  if (baseline.throughputBaseline) {
    const b = baseline.throughputBaseline;
    const msg = uiLanguage === "en"
      ? `Throughput bottleneck ${formatThroughput(b.value, b.unit)} (GPU${b.gpuIndex + 1} ${b.modelName})`
      : `처리량 병목 ${formatThroughput(b.value, b.unit)} (GPU${b.gpuIndex + 1} ${b.modelName})`;
    parts.push(escapeHtml(msg));
  }
  return parts.join(" · ");
}

// "독립 서비스" usage mode: instead of collapsing every model down to the
// single worst-off one, show each model's own concurrency headroom, since
// they're assumed to be called independently rather than sharing one
// bottleneck.
function renderPlacementBaselineIndependent(baseline, placement) {
  const concurrencyGroups = getPlacementServiceGroups(placement).filter((group) => group.recommendedN != null);
  if (!concurrencyGroups.length) return renderPlacementBaseline(baseline);

  const label = uiLanguage === "en" ? "Per-model concurrency: " : "모델별 동시 접속: ";
  const parts = concurrencyGroups.map((group) => {
    const n = group.recommendedN;
    const minimum = Math.max(placementTargetN || 0, group.config?.minConcurrency || 0);
    const warn = n <= 0 || n < minimum;
    const replicaLabel = group.items.length > 1
      ? (uiLanguage === "en" ? ` · ${group.items.length} replicas` : ` · ${group.items.length}개 복제`)
      : "";
    const text = uiLanguage === "en" ? `${group.model.name} ${n}${replicaLabel}` : `${group.model.name} ${n}명${replicaLabel}`;
    return warn ? `<span class="capacity-warning">${escapeHtml(text)}</span>` : escapeHtml(text);
  });
  let html = escapeHtml(label) + parts.join(" · ");
  if (baseline?.throughputBaseline) {
    const b = baseline.throughputBaseline;
    const msg = uiLanguage === "en"
      ? ` · Throughput bottleneck ${formatThroughput(b.value, b.unit)} (GPU${b.gpuIndex + 1} ${b.modelName})`
      : ` · 처리량 병목 ${formatThroughput(b.value, b.unit)} (GPU${b.gpuIndex + 1} ${b.modelName})`;
    html += escapeHtml(msg);
  }
  return html;
}

function renderPlacementCapacityLine(capacity) {
  if (!capacity) return "";
  if (capacity.kind === "concurrency") {
    if (capacity.recommendedN <= 0) {
      const msg = uiLanguage === "en"
        ? `Fits in VRAM, but not recommended to run — max ${capacity.maxN} at a squeeze with no safety margin`
        : `VRAM에는 올라가지만 운영 비권장 · 억지로 최대 ${capacity.maxN}명(안전 여유 없음)`;
      return `<span class="capacity-warning">${escapeHtml(msg)}</span>`;
    }
    const msg = uiLanguage === "en"
      ? `Concurrency headroom: recommended ${capacity.recommendedN} · max ${capacity.maxN} (${formatThroughput(capacity.speedAtMax.total, "tok/s")} at max)`
      : `동시 처리 여유: 권장 ${capacity.recommendedN}명 · 최대 ${capacity.maxN}명 (최대 시 ${formatThroughput(capacity.speedAtMax.total, "tok/s")})`;
    return escapeHtml(msg);
  }
  const msg = uiLanguage === "en"
    ? `Throughput headroom: about ${formatThroughput(capacity.value, capacity.unit)}${capacity.tokenValue ? ` · ${formatThroughput(capacity.tokenValue, capacity.tokenUnit)}` : ""}`
    : `처리량 여유: 약 ${formatThroughput(capacity.value, capacity.unit)}${capacity.tokenValue ? ` · ${formatThroughput(capacity.tokenValue, capacity.tokenUnit)}` : ""}`;
  return escapeHtml(msg);
}

// Looks for a single-model relocation from the most-loaded GPU to the
// least-loaded GPU that would measurably improve balance without lowering
// the common concurrency baseline. Every number here comes from re-running
// buildGpuPlacementHardware/getPlacementCapacity (the same estimators the
// real placement uses) on the simulated after-state — nothing is hardcoded.
function suggestPlacementMove(placement) {
  if (placement.gpus.length < 2) return null;
  const loadedGpus = placement.gpus.filter((gpu) => gpu.placements.length);
  if (!loadedGpus.length) return null;

  const sourceGpu = [...loadedGpus].sort((a, b) => a.remaining - b.remaining)[0];
  const targetGpu = [...placement.gpus].filter((gpu) => gpu.index !== sourceGpu.index).sort((a, b) => b.remaining - a.remaining)[0];
  if (!targetGpu || targetGpu.remaining - sourceGpu.remaining < 1) return null;

  const beforeBaseline = computePlacementBaseline(placement);
  const beforeN = beforeBaseline?.concurrencyBaseline?.recommendedN ?? null;
  const balanceBefore = Math.abs(sourceGpu.remaining - targetGpu.remaining);

  const hardwareBase = getHardware();
  const singleUserHardware = { ...hardwareBase, concurrency: 1 };

  const recompute = (gpu, remaining, items) =>
    items.map((item) => {
      const budgetGb = remaining + item.requiredGb;
      const hw = buildGpuPlacementHardware(singleUserHardware, gpu, budgetGb);
      return { ...item, capacity: getPlacementCapacity(item.model, item.setting, hw, budgetGb) };
    });

  let best = null;
  for (const candidate of sourceGpu.placements) {
    if (candidate.requiredGb > targetGpu.remaining) continue;
    const newSourceRemaining = sourceGpu.remaining + candidate.requiredGb;
    const newTargetRemaining = targetGpu.remaining - candidate.requiredGb;
    const balanceAfter = Math.abs(newSourceRemaining - newTargetRemaining);
    if (balanceAfter >= balanceBefore) continue;

    const afterSourceItems = recompute(sourceGpu, newSourceRemaining, sourceGpu.placements.filter((item) => item !== candidate));
    const afterTargetItems = recompute(targetGpu, newTargetRemaining, [...targetGpu.placements, candidate]);
    const otherItems = placement.gpus
      .filter((gpu) => gpu.index !== sourceGpu.index && gpu.index !== targetGpu.index)
      .flatMap((gpu) => gpu.placements);
    const concurrencyAfterItems = [...afterSourceItems, ...afterTargetItems, ...otherItems].filter((item) => item.capacity?.kind === "concurrency");
    const afterN = concurrencyAfterItems.length ? Math.min(...concurrencyAfterItems.map((item) => item.capacity.recommendedN)) : null;
    if (afterN != null && beforeN != null && afterN < beforeN) continue; // never suggest a move that makes the bottleneck worse

    if (!best || balanceAfter < best.balanceAfter) {
      best = {
        model: candidate.model,
        fromGpuIndex: sourceGpu.index,
        toGpuIndex: targetGpu.index,
        beforeSourceRemaining: sourceGpu.remaining,
        beforeTargetRemaining: targetGpu.remaining,
        afterSourceRemaining: newSourceRemaining,
        afterTargetRemaining: newTargetRemaining,
        beforeN,
        afterN,
        balanceAfter,
      };
    }
  }
  return best;
}

function summarizePlacementForAdjustment(placement) {
  const stats = placement.stats || getPlacementStats(placement);
  return {
    remaining: placement.gpus.map((gpu) => gpu.remaining),
    serviceFloor: stats.serviceFloor,
    totalTokThroughput: stats.totalTokThroughput,
    weightedCapacity: stats.weightedCapacity,
    unplacedCount: stats.unplacedCount,
    zeroCount: stats.zeroCount,
    shortfallCount: stats.shortfallCount,
    headroomVariance: stats.headroomVariance,
  };
}

function adjustmentImprovement(before, after) {
  return (
    (before.unplacedCount - after.unplacedCount) * 1e8
    + (before.zeroCount - after.zeroCount) * 1e7
    + (before.shortfallCount - after.shortfallCount) * 1e6
    + ((after.serviceFloor || 0) - (before.serviceFloor || 0)) * 1e4
    + (after.weightedCapacity - before.weightedCapacity)
    + (before.headroomVariance - after.headroomVariance) * 100
  );
}

function simulatePlacementAdjustment(gpuRows, modelKeys, strategy, mutate, nextModelKeys = modelKeys) {
  const globals = {
    allowQuant: placementAllowQuantChange,
    allowContext: placementAllowContextReduction,
    allowReplication: placementAllowReplication,
    target: placementTargetN,
  };
  const configs = new Map([...placementModelConfigs].map(([key, config]) => [key, { ...config }]));
  try {
    mutate?.();
    return computeGpuPlacement(gpuRows, nextModelKeys, strategy, placementPrimaryKey);
  } finally {
    placementAllowQuantChange = globals.allowQuant;
    placementAllowContextReduction = globals.allowContext;
    placementAllowReplication = globals.allowReplication;
    placementTargetN = globals.target;
    placementModelConfigs.clear();
    configs.forEach((config, key) => placementModelConfigs.set(key, config));
  }
}

function diagnosePlacement(placement, strategy, gpuRows, modelKeys) {
  const stats = placement.stats || getPlacementStats(placement);
  const loadedGpus = placement.gpus.filter((gpu) => gpu.placements.length);
  if (!loadedGpus.length) return null;
  const before = summarizePlacementForAdjustment(placement);
  const remaining = loadedGpus.map((gpu) => gpu.remaining);
  const imbalanceGb = loadedGpus.length > 1 ? Math.max(...remaining) - Math.min(...remaining) : 0;
  const physicalTotal = loadedGpus.reduce((sum, gpu) => sum + (gpu.physicalCapacityGb || gpu.capacityGb), 0);
  const isImbalanced = loadedGpus.length > 1 && imbalanceGb > physicalTotal * 0.12;
  const status = stats.unplacedCount || stats.zeroCount || stats.shortfallCount
    ? "warning"
    : isImbalanced
      ? "unbalanced"
      : "balanced";
  const adjustments = [];
  if (status === "balanced") {
    placementAdjustmentRegistry.clear();
    return {
      status,
      isImbalanced,
      imbalanceGb,
      stats,
      adjustments,
      bottleneck: [...stats.groups].filter((group) => group.recommendedN != null).sort((a, b) => a.recommendedN - b.recommendedN)[0] || null,
      searchMeta: placement.searchMeta,
    };
  }

  const addAdjustment = (adjustment, afterPlacement) => {
    if (!afterPlacement) return;
    const after = summarizePlacementForAdjustment(afterPlacement);
    const improvement = adjustmentImprovement(before, after);
    if (improvement <= 0 && adjustment.kind !== "target") return;
    adjustments.push({ ...adjustment, before, after, improvement });
  };

  const move = suggestPlacementMove(placement);
  if (move) {
    const key = modelKey(move.model);
    const afterPlacement = simulatePlacementAdjustment(gpuRows, modelKeys, strategy, () => {
      getPlacementModelConfig(key).pinnedGpu = String(move.toGpuIndex);
    });
    addAdjustment({ kind: "pin", modelKey: key, modelName: move.model.name, gpuIndex: move.toGpuIndex }, afterPlacement);
  }

  if (!placementAllowQuantChange) {
    addAdjustment(
      { kind: "allow-quant" },
      simulatePlacementAdjustment(gpuRows, modelKeys, strategy, () => { placementAllowQuantChange = true; }),
    );
  }
  if (!placementAllowContextReduction && stats.shortfallCount + stats.zeroCount + stats.unplacedCount > 0) {
    addAdjustment(
      { kind: "allow-context" },
      simulatePlacementAdjustment(gpuRows, modelKeys, strategy, () => { placementAllowContextReduction = true; }),
    );
  }

  const bottleneck = [...stats.groups]
    .filter((group) => group.recommendedN != null)
    .sort((a, b) => a.recommendedN - b.recommendedN)[0];
  if (bottleneck && modelKeys.length > 1) {
    const reducedKeys = modelKeys.filter((key) => key !== bottleneck.key);
    addAdjustment(
      { kind: "remove", modelKey: bottleneck.key, modelName: bottleneck.model.name },
      simulatePlacementAdjustment(gpuRows, modelKeys, strategy, null, reducedKeys),
    );
  }

  if (placementTargetN != null && stats.serviceFloor != null && stats.serviceFloor < placementTargetN) {
    adjustments.push({
      kind: "target",
      nextTarget: Math.max(1, stats.serviceFloor),
      before,
      after: { ...before, serviceFloor: stats.serviceFloor, shortfallCount: 0 },
      improvement: 1,
    });
  }

  adjustments.sort((a, b) => b.improvement - a.improvement);
  placementAdjustmentRegistry.clear();
  adjustments.slice(0, 4).forEach((adjustment, index) => placementAdjustmentRegistry.set(`adjustment-${index}`, adjustment));

  return {
    status,
    isImbalanced,
    imbalanceGb,
    stats,
    adjustments: [...placementAdjustmentRegistry.entries()].map(([id, adjustment]) => ({ id, ...adjustment })),
    bottleneck,
    searchMeta: placement.searchMeta,
  };
}

function renderPlacementAdjustmentDelta(adjustment) {
  const beforeN = adjustment.before.serviceFloor;
  const afterN = adjustment.after.serviceFloor;
  const remainingBefore = adjustment.before.remaining.map(formatGb).join(" / ");
  const remainingAfter = adjustment.after.remaining.map(formatGb).join(" / ");
  const concurrency = beforeN != null || afterN != null
    ? (uiLanguage === "en" ? `Concurrency ${beforeN ?? "-"} → ${afterN ?? "-"}` : `동시 접속 ${beforeN ?? "-"}명 → ${afterN ?? "-"}명`)
    : "";
  const throughput = adjustment.before.totalTokThroughput || adjustment.after.totalTokThroughput
    ? (uiLanguage === "en"
        ? `Throughput ${formatThroughput(adjustment.before.totalTokThroughput, "tok/s")} → ${formatThroughput(adjustment.after.totalTokThroughput, "tok/s")}`
        : `총 처리량 ${formatThroughput(adjustment.before.totalTokThroughput, "tok/s")} → ${formatThroughput(adjustment.after.totalTokThroughput, "tok/s")}`)
    : "";
  const remaining = uiLanguage === "en"
    ? `Free VRAM by GPU ${remainingBefore} → ${remainingAfter}`
    : `GPU별 여유 VRAM ${remainingBefore} → ${remainingAfter}`;
  return [concurrency, throughput, remaining].filter(Boolean).map((line) => `<span>${escapeHtml(line)}</span>`).join("");
}

function placementAdjustmentLabel(adjustment) {
  if (adjustment.kind === "pin") {
    return uiLanguage === "en"
      ? `Move ${adjustment.modelName} to GPU ${adjustment.gpuIndex + 1}`
      : `${adjustment.modelName}을 GPU ${adjustment.gpuIndex + 1}로 이동`;
  }
  if (adjustment.kind === "allow-quant") return uiLanguage === "en" ? "Allow automatic precision changes" : "양자화·정밀도 자동 변경 허용";
  if (adjustment.kind === "allow-context") return uiLanguage === "en" ? "Allow automatic context reduction" : "컨텍스트 자동 축소 허용";
  if (adjustment.kind === "remove") return uiLanguage === "en" ? `Remove ${adjustment.modelName}` : `${adjustment.modelName} 제외`;
  if (adjustment.kind === "target") return uiLanguage === "en" ? `Adjust target to ${adjustment.nextTarget}` : `목표를 ${adjustment.nextTarget}명으로 조정`;
  return uiLanguage === "en" ? "Apply adjustment" : "조정 적용";
}

function renderPlacementDiagnosis(diagnosis) {
  if (!diagnosis) return "";
  const labels = {
    balanced: { ko: "균형", en: "Balanced" },
    unbalanced: { ko: "불균형", en: "Unbalanced" },
    warning: { ko: "운영 비권장", en: "Not recommended for serving" },
  };
  const statusLabel = labels[diagnosis.status][uiLanguage === "en" ? "en" : "ko"];
  const bottleneckText = diagnosis.bottleneck
    ? (uiLanguage === "en"
        ? `Bottleneck: ${diagnosis.bottleneck.model.name} (${diagnosis.bottleneck.recommendedN} recommended concurrent)`
        : `병목: ${diagnosis.bottleneck.model.name} (권장 동시 ${diagnosis.bottleneck.recommendedN}명)`)
    : "";
  const searchText = diagnosis.searchMeta?.mode === "exact"
    ? (uiLanguage === "en" ? "Exact candidate search" : "정확 후보 탐색")
    : (uiLanguage === "en" ? "Bounded approximate search" : "제한된 근사 탐색");
  const intro = diagnosis.status === "balanced"
    ? (uiLanguage === "en" ? "The selected constraints are met without a large GPU headroom gap." : "큰 GPU 여유 격차 없이 설정한 제약을 충족합니다.")
    : diagnosis.status === "unbalanced"
      ? (uiLanguage === "en" ? `Remaining VRAM differs by ${formatGb(diagnosis.imbalanceGb)} across active GPUs.` : `사용 중인 GPU의 여유 VRAM 차이가 ${formatGb(diagnosis.imbalanceGb)}입니다.`)
      : (uiLanguage === "en" ? "At least one model is unplaced, has zero safe concurrency, or misses its configured target." : "배치 실패, 안전 동시 접속 0명 또는 설정한 목표 미달 모델이 있습니다.");

  const adjustmentHtml = diagnosis.adjustments.length
    ? `
      <div class="placement-adjustment-list">
        ${diagnosis.adjustments.map((adjustment) => `
          <article class="placement-adjustment-card">
            <strong>${escapeHtml(placementAdjustmentLabel(adjustment))}</strong>
            <div class="placement-adjustment-delta">${renderPlacementAdjustmentDelta(adjustment)}</div>
            <button type="button" class="ghost-button" data-apply-placement-adjustment="${escapeAttr(adjustment.id)}">${uiLanguage === "en" ? "Apply" : "적용"}</button>
          </article>
        `).join("")}
      </div>
    `
    : diagnosis.status === "balanced"
      ? `<p class="gpu-placement-diagnosis-note">${uiLanguage === "en" ? "No adjustment is required for the selected objective and constraints." : "선택한 목표와 제약 기준에서 추가 조정이 필요하지 않습니다."}</p>`
    : `<p class="gpu-placement-diagnosis-note">${uiLanguage === "en" ? "No safe automatic adjustment improves this result. Consider adding a GPU or changing the selected models." : "현재 조건에서 안전하게 개선되는 자동 조정이 없습니다. GPU 추가 또는 선택 모델 변경을 검토하세요."}</p>`;

  return `
    <div class="gpu-placement-diagnosis-box is-${escapeAttr(diagnosis.status)}">
      <div class="placement-diagnosis-head">
        <strong>${uiLanguage === "en" ? "Placement diagnosis" : "배치 진단"}: ${escapeHtml(statusLabel)}</strong>
      </div>
      <p>${escapeHtml(intro)}</p>
      ${bottleneckText ? `<p>${escapeHtml(bottleneckText)}</p>` : ""}
      ${adjustmentHtml}
      <details class="placement-calculation-basis">
        <summary>${uiLanguage === "en" ? "Calculation constraints" : "계산 제약 및 근거"}</summary>
        <p>${escapeHtml(uiLanguage === "en"
          ? `Search method: ${searchText}; ${diagnosis.searchMeta?.exploredStates?.toLocaleString() || 0} candidate states checked.`
          : `계산 방식: ${searchText}으로 가능한 배치 ${diagnosis.searchMeta?.exploredStates?.toLocaleString() || 0}개 상태를 확인한 참고 결과입니다.`)}</p>
        <p>${uiLanguage === "en"
          ? `VRAM headroom ${placementMinHeadroomPct}% · precision changes ${placementAllowQuantChange ? "allowed" : "locked"} · context reduction ${placementAllowContextReduction ? "allowed" : "disabled"} · replicas ${placementAllowReplication && placementUsageMode === "independent" ? "allowed" : "disabled"}`
          : `VRAM 여유 ${placementMinHeadroomPct}% · 양자화 변경 ${placementAllowQuantChange ? "허용" : "고정"} · 컨텍스트 축소 ${placementAllowContextReduction ? "허용" : "사용 안 함"} · 복제 ${placementAllowReplication && placementUsageMode === "independent" ? "허용" : "사용 안 함"}`}</p>
      </details>
    </div>
  `;
}

function renderPlacementUnplacedBlock(unplaced) {
  if (!unplaced.length) return "";
  const title = uiLanguage === "en" ? `${unplaced.length} model(s) couldn't be placed` : `배치하지 못한 모델 ${unplaced.length}개`;
  const note = uiLanguage === "en"
    ? "Consider adding a GPU, or run this one on its own instead of alongside the others."
    : "GPU를 추가하거나, 다른 모델과 함께 띄우지 말고 순차 실행하는 것을 고려해보세요.";
  const needLabel = uiLanguage === "en" ? "needs at least" : "최소";
  return `
    <div class="gpu-placement-unplaced">
      <strong>${escapeHtml(title)}</strong>
      ${unplaced
        .map(
          (item) => `<div class="gpu-placement-model-row"><span>${escapeHtml(item.model.name)}</span><span>${escapeHtml(needLabel)} ${escapeHtml(formatGb(item.minRequiredGb))}${uiLanguage === "en" ? "" : " 필요"}</span></div>`,
        )
        .join("")}
      <p>${escapeHtml(note)}</p>
    </div>
  `;
}

function getPlacementItemMemoryParts(item, gpu) {
  const hardware = buildGpuPlacementHardware(
    item.contextTokens ? { ...getHardware(), concurrency: 1, context: item.contextTokens } : { ...getHardware(), concurrency: 1 },
    gpu,
    item.requiredGb,
  );
  let estimate = null;
  if (!item.model.type || item.model.type === "generative") {
    estimate = estimateWithQuant(item.model, item.setting, hardware);
  } else if (item.model.type === "embedding") {
    estimate = estimateEncoderWithPrecision(item.model, hardware, getPlacementWorkload(item.model), item.setting);
  } else if (item.model.type === "reranker") {
    estimate = estimateRerankerWithPrecision(item.model, hardware, getPlacementWorkload(item.model), item.setting);
  } else {
    estimate = estimateVisionWithPrecision(item.model, hardware, getPlacementWorkload(item.model), item.setting);
  }
  const weights = Math.max(0, estimate.weightsGb || estimate.residentGb || item.requiredGb * 0.72);
  const kv = Math.max(0, estimate.kvGb || estimate.decoderKvGb || 0);
  const runtime = Math.max(0, item.requiredGb - weights - kv);
  return { weights, kv, runtime };
}

function renderPlacementMemoryBar(gpu) {
  const totals = gpu.placements.reduce((sum, item) => {
    const parts = getPlacementItemMemoryParts(item, gpu);
    sum.weights += parts.weights;
    sum.kv += parts.kv;
    sum.runtime += parts.runtime;
    return sum;
  }, { weights: 0, kv: 0, runtime: 0 });
  const total = gpu.physicalCapacityGb || (gpu.capacityGb + (gpu.reservedHeadroomGb || 0));
  const segments = [
    { key: "weights", label: uiLanguage === "en" ? "Weights" : "가중치", value: totals.weights },
    { key: "kv", label: "KV", value: totals.kv },
    { key: "runtime", label: uiLanguage === "en" ? "Runtime" : "런타임", value: totals.runtime },
    { key: "safety", label: uiLanguage === "en" ? "Safety" : "안전 여유", value: gpu.reservedHeadroomGb || 0 },
    { key: "free", label: uiLanguage === "en" ? "Free" : "남음", value: gpu.remaining },
  ];
  return `
    <div class="placement-memory-map" role="img" aria-label="${escapeAttr(segments.map((segment) => `${segment.label} ${formatGb(segment.value)}`).join(", "))}">
      <div class="placement-memory-track">
        ${segments.map((segment) => `<span class="placement-memory-${escapeAttr(segment.key)}" style="width:${Math.max(0, Math.min(100, segment.value / Math.max(total, 0.1) * 100))}%"></span>`).join("")}
      </div>
      <div class="placement-memory-legend">
        ${segments.map((segment) => `<span><i class="placement-memory-${escapeAttr(segment.key)}"></i>${escapeHtml(segment.label)} ${escapeHtml(formatGb(segment.value))}</span>`).join("")}
      </div>
    </div>
  `;
}

function renderGpuPlacementResult(placement) {
  const gpuCards = placement.gpus
    .map((gpu) => {
      const rows = gpu.placements.length
        ? gpu.placements
            .map(
              (item) => `
                <div class="gpu-placement-model-row">
                  <span>${escapeHtml(item.model.name)}${item.isPrimary ? ` <span class="placement-primary-badge">${escapeHtml(uiLanguage === "en" ? "Primary" : "주 모델")}</span>` : ""}${item.isReplica ? ` <span class="placement-replica-badge">${escapeHtml(uiLanguage === "en" ? `Replica ${item.replicaIndex}` : `복제 ${item.replicaIndex}`)}</span>` : ""} · ${escapeHtml(item.label)}${item.settingChanged ? ` · ${escapeHtml(uiLanguage === "en" ? "precision adjusted" : "정밀도 자동 조정")}` : ""}${item.contextReduced ? ` · ${escapeHtml(uiLanguage === "en" ? "context reduced" : "컨텍스트 축소")}` : ""}</span>
                  <span>${escapeHtml(formatGb(item.requiredGb))}</span>
                </div>
                <div class="gpu-placement-capacity-line">${renderPlacementCapacityLine(item.capacity)}</div>
              `,
            )
            .join("")
        : `<p class="gpu-placement-empty">${escapeHtml(uiLanguage === "en" ? "No models placed on this GPU." : "이 GPU에는 배치된 모델이 없습니다.")}</p>`;

      return `
        <div class="gpu-placement-card">
          <div class="gpu-placement-card-head">
            <span>GPU ${gpu.index + 1} · ${escapeHtml(gpu.preset.name)}${gpu.count > 1 ? ` × ${gpu.count}` : ""}</span>
            <small>${uiLanguage === "en" ? "free" : "여유"} ${escapeHtml(formatGb(gpu.remaining))} / ${uiLanguage === "en" ? "physical" : "물리"} ${escapeHtml(formatGb(gpu.physicalCapacityGb || gpu.capacityGb))}</small>
          </div>
          ${renderPlacementMemoryBar(gpu)}
          ${rows}
        </div>
      `;
    })
    .join("");
  const searchMeta = placement.searchMeta;
  const searchNote = searchMeta
    ? `<p class="placement-search-note">${escapeHtml(searchMeta.mode === "exact"
        ? (uiLanguage === "en" ? `Exact search · ${searchMeta.exploredStates.toLocaleString()} states` : `정확 탐색 · ${searchMeta.exploredStates.toLocaleString()}개 상태`)
        : (uiLanguage === "en" ? `Bounded approximate search · ${searchMeta.exploredStates.toLocaleString()} states` : `제한된 근사 탐색 · ${searchMeta.exploredStates.toLocaleString()}개 상태`))}</p>`
    : "";

  return searchNote + gpuCards + renderPlacementUnplacedBlock(placement.unplaced);
}

// "대체 모델" mode: models are never simultaneously resident, so each one is
// evaluated independently against a whole GPU's full capacity (no sharing,
// no bin-packing) — the estimator functions are the same ones the co-resident
// path uses, just called with the GPU's full capacityGb as the budget.
function computeAlternatePlacement(gpuRows, modelKeys) {
  const hardwareBase = getHardware();
  const singleUserHardware = { ...hardwareBase, concurrency: 1 };
  const gpus = buildPlacementGpuRows(gpuRows);

  const models = modelKeys.map((key) => getModelByKey(key)).filter(Boolean);
  const items = [];
  const unplaced = [];

  for (const model of models) {
    const key = modelKey(model);
    const config = getPlacementModelConfig(key);
    const options = getPlacementSearchCandidates(model, config, singleUserHardware, Math.max(...gpus.map((gpu) => gpu.capacityGb)));
    let best = null;
    for (const gpu of gpus) {
      if (config.pinnedGpu !== "" && Number(config.pinnedGpu) !== gpu.index) continue;
      for (const fit of options) {
        if (fit.requiredGb > gpu.capacityGb) continue;
        const hw = buildGpuPlacementHardware(
          fit.contextTokens ? { ...singleUserHardware, context: fit.contextTokens } : singleUserHardware,
          gpu,
          gpu.capacityGb,
        );
        const capacity = getPlacementCapacity(model, fit.setting, hw, gpu.capacityGb);
        const score = (capacity.kind === "concurrency" ? capacity.recommendedN : capacity.value) * config.requestShare - fit.changeCost;
        if (!best || score > best.score) {
          best = { gpu, setting: fit.setting, label: fit.label, requiredGb: fit.requiredGb, capacity, score, contextTokens: fit.contextTokens, config };
        }
      }
    }
    if (best) {
      items.push({ model, gpuIndex: best.gpu.index, gpu: best.gpu, setting: best.setting, label: best.label, requiredGb: best.requiredGb, capacity: best.capacity });
    } else {
      const minimum = options.reduce((value, option) => Math.min(value, option.requiredGb), Infinity);
      unplaced.push({ model, minRequiredGb: Number.isFinite(minimum) ? minimum : 0 });
    }
  }

  return { items, unplaced };
}

function renderAlternatePlacementResult(altPlacement) {
  if (!altPlacement.items.length && !altPlacement.unplaced.length) {
    return `<p class="gpu-placement-empty">${escapeHtml(uiLanguage === "en" ? "No models placed." : "배치된 모델이 없습니다.")}</p>`;
  }
  const runsOn = uiLanguage === "en" ? "Runs on" : "실행 GPU";
  const cards = altPlacement.items
    .map(
      (item) => `
        <div class="gpu-placement-card">
          <div class="gpu-placement-card-head">
            <span>${escapeHtml(item.model.name)} · ${escapeHtml(item.label)}</span>
            <small>${escapeHtml(runsOn)}: GPU ${item.gpuIndex + 1} · ${escapeHtml(gpuPlacementPresetLabel(item.gpu))} · ${escapeHtml(formatGb(item.requiredGb))}</small>
          </div>
          <div class="gpu-placement-capacity-line">${renderPlacementCapacityLine(item.capacity)}</div>
        </div>
      `,
    )
    .join("");
  return cards + renderPlacementUnplacedBlock(altPlacement.unplaced);
}

function gpuPlacementPresetLabel(gpu) {
  return `${gpu.preset.name}${gpu.count > 1 ? ` × ${gpu.count}` : ""}`;
}

// 배치 계산 결과를 실제로 복사/붙여넣기 할 수 있는 실행 명령어와 docker-compose 초안으로 만듭니다.
// 모델 상세 화면에서 이미 검증된 커맨드 빌더(buildOllamaCommand 등)를 그대로 재사용해
// 개별 모델 페이지의 실행 예시와 항상 같은 명령어를 보여줍니다.
function buildPlacementDeploymentScript(placement) {
  const hardware = getHardware();
  const lines = [
    "#!/usr/bin/env bash",
    uiLanguage === "en"
      ? "# AI Hardware Fit — draft run commands generated from the placement result"
      : "# AI Hardware Fit — 배치 계산 결과 기반 실행 명령어 초안",
    uiLanguage === "en"
      ? "# This is an estimated placement. Re-check each model's license and the latest run options before deploying."
      : "# 추정 배치입니다. 실제 배포 전 각 모델의 라이선스와 최신 실행 옵션을 다시 확인하세요.",
    "",
  ];

  placement.gpus.forEach((gpu) => {
    if (!gpu.placements.length) return;
    lines.push(`# ===== GPU ${gpu.index + 1} · ${gpu.preset.name}${gpu.count > 1 ? ` × ${gpu.count}` : ""} =====`);
    lines.push(`export CUDA_VISIBLE_DEVICES=${gpu.index}`);
    lines.push("");
    gpu.placements.forEach((item) => {
      lines.push(`# ${item.model.name} (${item.label})`);
      if (!item.model.type || item.model.type === "generative") {
        lines.push(buildOllamaCommand(item.model, item.setting, hardware));
        lines.push(buildLlamaCppCommand(item.model, item.setting, hardware));
      } else {
        const defaultBatchSize = PLACEMENT_DEFAULT_WORKLOADS[item.model.type]?.batchSize
          ?? PLACEMENT_DEFAULT_WORKLOADS.vision.batchSize;
        lines.push(buildNonGenerativeCommand(item.model, { precision: item.setting }, defaultBatchSize));
      }
      lines.push("");
    });
  });

  if (placement.unplaced.length) {
    lines.push(uiLanguage === "en"
      ? "# ===== Models that didn't fit (not enough GPU headroom) ====="
      : "# ===== 배치하지 못한 모델 (GPU 여유 부족) =====");
    placement.unplaced.forEach((item) => {
      lines.push(uiLanguage === "en"
        ? `# ${item.model.name} — needs at least ${formatGb(item.minRequiredGb)}`
        : `# ${item.model.name} — 최소 ${formatGb(item.minRequiredGb)} 필요`);
    });
    lines.push("");
  }

  return lines.join("\n");
}

// Ollama(생성형)와 TEI(임베딩/리랭커)만 표준 docker 서비스 패턴이 일정해서 compose로 생성합니다.
// OCR/VLM은 모델마다 vLLM, Transformers, 전용 CLI 등 실행 방식이 제각각이라 잘못된 서비스 정의를
// 만들지 않도록 compose에는 안내 주석만 남기고, 정확한 명령어는 위 .sh 스크립트를 참고하게 합니다.
function buildPlacementDockerCompose(placement) {
  const services = [];
  const volumeNames = [];
  let hostPort = 8081;

  placement.gpus.forEach((gpu) => {
    if (!gpu.placements.length) return;

    const generativeItems = gpu.placements.filter((item) => !item.model.type || item.model.type === "generative");
    const encoderItems = gpu.placements.filter((item) => item.model.type === "embedding" || item.model.type === "reranker");
    const visionItems = gpu.placements.filter((item) => item.model.type && !["generative", "embedding", "reranker"].includes(item.model.type));

    if (generativeItems.length) {
      const serviceName = `ollama-gpu${gpu.index + 1}`;
      const volumeName = `${serviceName}_data`;
      volumeNames.push(volumeName);
      const pullHint = generativeItems
        .map((item) => `    #   docker exec ${serviceName} ollama pull ${buildOllamaModelName(item.model)}  # ${item.model.name} (${item.label})`)
        .join("\n");
      const pullHintLabel = uiLanguage === "en"
        ? "# After the first startup, pull the model with:"
        : "# 최초 기동 후 아래 명령으로 모델을 내려받으세요:";
      services.push(`  ${serviceName}:
    image: ollama/ollama:latest
    container_name: ${serviceName}
    restart: unless-stopped
    ports:
      - "${hostPort}:11434"
    volumes:
      - ${volumeName}:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              device_ids: ["${gpu.index}"]
              capabilities: [gpu]
    ${pullHintLabel}
${pullHint}`);
      hostPort += 1;
    }

    encoderItems.forEach((item) => {
      const serviceName = `tei-${toSlug(item.model.name)}`;
      services.push(`  ${serviceName}:
    image: ghcr.io/huggingface/text-embeddings-inference:cuda-latest
    container_name: ${serviceName}
    restart: unless-stopped
    ports:
      - "${hostPort}:80"
    environment:
      - MODEL_ID=${item.model.name}
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              device_ids: ["${gpu.index}"]
              capabilities: [gpu]`);
      hostPort += 1;
    });

    if (visionItems.length) {
      const names = visionItems.map((item) => item.model.name).join(", ");
      services.push(uiLanguage === "en"
        ? `  # The ${visionItems.length} OCR/VLM model(s) placed on GPU ${gpu.index + 1} (${names})
  # aren't auto-generated as a standard service since each one runs differently
  # (vLLM, Transformers, a dedicated CLI, etc.).
  # Use the run commands (.sh) or the model detail screen's "run example" to set these up manually.`
        : `  # GPU ${gpu.index + 1}에 배치된 OCR/VLM 모델 ${visionItems.length}개(${names})는
  # 모델마다 실행 방식(vLLM, Transformers, 전용 CLI 등)이 달라 표준 서비스로 자동 생성하지 않습니다.
  # 실행 명령어(.sh) 또는 앱의 모델 상세 화면 "실행 예시"를 참고해 직접 구성하세요.`);
    }
  });

  const volumesBlock = volumeNames.length
    ? `\n\nvolumes:\n${volumeNames.map((name) => `  ${name}:`).join("\n")}`
    : "";

  const header = uiLanguage === "en"
    ? `# AI Hardware Fit — draft docker-compose generated from the placement result (reference only)
# This is an estimated placement and requires nvidia-container-toolkit.
# Re-check resource limits, port conflicts, and each model's license before running this in production.`
    : `# AI Hardware Fit — 배치 계산 결과 기반 docker-compose 초안 (참고용)
# 추정 배치이며 nvidia-container-toolkit 설치가 필요합니다.
# 실제 운영 전 리소스 한도, 포트 충돌, 각 모델 라이선스를 반드시 다시 확인하세요.`;

  return `${header}
services:
${services.join("\n\n")}${volumesBlock}
`;
}

function renderPlacementExport(placement) {
  const target = $("gpuPlacementExport");
  if (!target) return;

  const hasPlacements = placement.gpus.some((gpu) => gpu.placements.length);
  if (!hasPlacements) {
    target.hidden = true;
    target.innerHTML = "";
    return;
  }

  const script = buildPlacementDeploymentScript(placement);
  const compose = buildPlacementDockerCompose(placement);
  const copyLabel = uiLanguage === "en" ? "Copy" : "복사";
  const downloadLabel = uiLanguage === "en" ? "Download" : "다운로드";

  target.hidden = false;
  target.innerHTML = `
    <details class="gpu-placement-export-panel">
      <summary>${escapeHtml(uiLanguage === "en" ? "Export run config (run commands · docker-compose draft)" : "실행 설정 내보내기 (실행 명령어 · docker-compose 초안)")}</summary>
      <div class="gpu-placement-export-body">
        <p>${escapeHtml(uiLanguage === "en"
          ? "A draft based on the current placement result. Re-check each model's license, the latest run options, and GPU resources before deploying."
          : "배치 계산 결과를 기준으로 만든 초안입니다. 실제 배포 전 각 모델의 라이선스, 최신 실행 옵션, GPU 리소스를 다시 확인하세요.")}</p>

        <div class="export-block-head">
          <span>${escapeHtml(uiLanguage === "en" ? "Run commands (.sh)" : "실행 명령어 (.sh)")}</span>
          <div class="export-block-actions">
            <button type="button" class="ghost-button" data-copy-target="placementExportScript">${escapeHtml(copyLabel)}</button>
            <button type="button" class="ghost-button" data-download-target="placementExportScript" data-download-filename="ai-hardware-fit-run.sh">${escapeHtml(downloadLabel)}</button>
          </div>
        </div>
        <pre class="command-block" id="placementExportScript"><code>${escapeHtml(script)}</code></pre>

        <div class="export-block-head">
          <span>${escapeHtml(uiLanguage === "en" ? "docker-compose.yml draft (Ollama · TEI)" : "docker-compose.yml 초안 (Ollama · TEI)")}</span>
          <div class="export-block-actions">
            <button type="button" class="ghost-button" data-copy-target="placementExportCompose">${escapeHtml(copyLabel)}</button>
            <button type="button" class="ghost-button" data-download-target="placementExportCompose" data-download-filename="docker-compose.yml">${escapeHtml(downloadLabel)}</button>
          </div>
        </div>
        <pre class="command-block" id="placementExportCompose"><code>${escapeHtml(compose)}</code></pre>
      </div>
    </details>
  `;
}
