/* AI Hardware Fit v3 decision studio.
 * Guided recommendations, Korean market snapshots, custom models, component
 * compatibility, runtime guidance, and community measurements.
 */
const DECISION_STUDIO_COPY = {
  ko: {
    title: "구매 결정 스튜디오",
    note: "가격·목표 작업·시스템 호환성과 실측 근거를 한 흐름에서 비교합니다.",
    consulting: "인프라 견적",
    recommend: "맞춤 추천",
    market: "국내 시세",
    custom: "직접 모델",
    parts: "부품 호환",
    runtime: "런타임",
    community: "실측 제보",
  },
  en: {
    title: "Purchase decision studio",
    note: "Compare price, workload goals, system compatibility, and measured evidence in one flow.",
    consulting: "Infra sizing",
    recommend: "Guided picks",
    market: "Korean market",
    custom: "Custom model",
    parts: "Parts fit",
    runtime: "Runtime",
    community: "Measurements",
  },
};

const RUNTIME_COMPATIBILITY = {
  NVIDIA: {
    windows: { level: "easy", tools: "CUDA · llama.cpp · Ollama · TensorRT-LLM", noteKo: "대부분의 로컬 실행 도구를 바로 사용할 수 있습니다.", noteEn: "Most local runtimes work with minimal setup." },
    linux: { level: "easy", tools: "CUDA · vLLM · TensorRT-LLM · Docker", noteKo: "vLLM 서버와 다중 GPU 구성이 가장 수월합니다.", noteEn: "Best-supported path for vLLM servers and multi-GPU." },
  },
  AMD: {
    windows: { level: "hard", tools: "Vulkan · DirectML · llama.cpp", noteKo: "실행은 가능하지만 모델·드라이버별 호환 확인이 필요합니다.", noteEn: "Runnable, but model and driver compatibility needs checking." },
    linux: { level: "medium", tools: "ROCm · llama.cpp · 일부 vLLM", noteKo: "ROCm 지원 GPU와 배포판 조합을 먼저 확인하세요.", noteEn: "Confirm the ROCm GPU and distribution support matrix first." },
  },
  Intel: {
    windows: { level: "medium", tools: "OpenVINO · oneAPI · DirectML", noteKo: "OpenVINO 경로가 가장 안정적입니다.", noteEn: "OpenVINO is usually the most dependable path." },
    linux: { level: "medium", tools: "OpenVINO · oneAPI · llama.cpp SYCL", noteKo: "SYCL 빌드와 드라이버 버전을 맞춰야 합니다.", noteEn: "Match the SYCL build with the installed driver." },
  },
  Apple: {
    windows: { level: "blocked", tools: "—", noteKo: "Apple Silicon은 macOS에서 사용합니다.", noteEn: "Apple Silicon workloads run on macOS." },
    linux: { level: "easy", tools: "MLX · Metal · llama.cpp", noteKo: "macOS에서 MLX 또는 Metal 백엔드를 권장합니다.", noteEn: "Use MLX or the Metal backend on macOS." },
  },
};

let studioState = {
  tab: "consulting",
  category: "llm",
  modelKey: "",
  targetSpeed: 30,
  budgetKrw: 2000000,
  condition: "either",
  formFactor: "desktop",
  powerLimitW: 450,
  noise: "normal",
  imageSize: 1024,
  videoFrames: 81,
  customName: "",
  customUrl: "",
  customTotalB: 8,
  customActiveB: 8,
  customLayers: 32,
  customBits: 4,
  customContext: 8192,
  customVision: false,
  cpuId: "r7-9700x",
  motherboardId: "b650-atx",
  gpuId: "rtx5070ti-16",
  psuId: "gold850",
  caseId: "airflow-atx",
  ramGb: 64,
  runtimeOs: "windows",
  siScenario: "internal-rag",
  siProjectName: "사내 문서 RAG 구축",
  siIndustry: "제조·일반기업",
  siContact: "",
  siPurpose: "사내 문서 검색·질의응답",
  siDeployment: "onprem",
  siSecurity: "restricted",
  siExportAllowed: false,
  siServiceType: "rag",
  siTotalUsers: 100,
  siConcurrency: 10,
  siQps: 1.25,
  siInputTokens: 4096,
  siMaxInputTokens: 16384,
  siOutputTokens: 500,
  siTtftP95: 2,
  siTargetSeconds: 8,
  siLatencyP95: 12,
  siOperatingHours: 24,
  siAvailability: "ha",
  siGrowthPct: 30,
  siVectorDataGb: 500,
  siLogGbDay: 10,
  siRetentionDays: 90,
  siDevProd: true,
  siPcieGen: "gen5",
  siNetworkFabric: "ethernet",
  siBackup: "daily",
  siMonitoring: "standard",
  siCooling: "air",
  siUpsMinutes: 15,
  siElectricityKrw: 150,
  siMaintenancePct: 10,
  siMeasuredTtft: 0,
  siMeasuredSpeed: 0,
  siMeasuredErrorRate: 0,
  siMeasuredHours: 0,
  siCompanyName: "AI Infra Partner",
  siCustomerName: "",
  siEstimateVersion: 1,
  siStreaming: true,
  siMaxBatch: 8,
  siMinReplicas: 1,
  siMaxReplicas: 8,
  siAutoscale: true,
  siItlP95: 0.08,
  siFacilityKrwMonth: 350000,
  siSupportPct: 8,
  siUtilizationPct: 50,
  siCloudHourlyUsd: 3.5,
  siReportMode: "customer",
  siBenchmarkRuntime: "vllm",
  siBenchmarkPrompts: "512,4096,8192",
  siBenchmarkOutputs: "128,512",
  siBenchmarkConcurrency: "1,4,8,16",
  siMeasuredItl: 0,
  siMeasuredLatencyP95: 0,
  siBenchmarkSamples: 0,
  siBenchmarkOutliers: 0,
  siInputMode: "simple",
  siWizardStep: 1,
  siReadOnly: false,
  siBaselineProfile: "production",
  siQualityPreset: "balanced",
  siUserPreset: 100,
  siBudgetKrw: 0,
  siSelectedPlan: "recommended",
  siBomCpuId: "",
  siBomCpuQty: 1,
  siBomMotherboardId: "",
  siBomMotherboardQty: 1,
  siBomMemoryId: "",
  siBomMemoryQty: 1,
  siBomStorageId: "",
  siBomStorageQty: 1,
  siBomNicId: "",
  siBomNicQty: 1,
  siBomPsuId: "",
  siBomPsuQty: 1,
  siBomUpsId: "",
  siBomUpsQty: 1,
  siBomCaseId: "",
  siBomCaseQty: 1,
  siBomExtraKrw: 0,
  siSupplierName: "",
  siSupplierQuoteNo: "",
  siPriceBasis: "catalog",
  siPriceDate: new Date().toISOString().slice(0, 10),
  siDiscountPct: 0,
  siMarginPct: 12,
  siVatPct: 10,
  siExchangeRate: Number(window.LLM_GPU_CHECKER_DATA?.priceDataMeta?.exchangeRateKrwPerUsd || 1400),
  siQuoteValidDays: 30,
  siQuoteStatus: "draft",
  siReviewer: "",
  siApprover: "",
  siApprovedAt: "",
  siSeparateNetworks: true,
  siRackCapacityU: 42,
  siPduCircuitKw: 8,
  siCoolingPue: 1.4,
};

// Snapshot of the defaults above, captured once at load. Used to delta-encode
// shared/saved state: a URL or localStorage draft only needs to carry the
// fields a user actually changed, not all ~80 studio fields every time. Most
// real sessions only touch a handful (gpuId, siTotalUsers, siScenario, ...),
// so this keeps share links from ballooning past 2000 characters even though
// restoreStudioState() still merges whatever it finds back over these same
// defaults (so full, pre-existing legacy URLs continue to work unchanged).
const STUDIO_DEFAULT_STATE = Object.freeze({ ...studioState });

function studioCopy(key) {
  return DECISION_STUDIO_COPY[uiLanguage === "en" ? "en" : "ko"][key] || key;
}

function studioMarket(gpuId) {
  const recorded = KOREAN_GPU_MARKET.find((item) => item.gpuId === gpuId);
  if (recorded) return { ...recorded, priceKind: "market", estimated: false };
  const gpu = GPU_PRESETS.find((item) => item.id === gpuId);
  if (!gpu) return null;
  const reference = gpuMarketReference(gpu);
  const planningRate = Number(window.LLM_GPU_CHECKER_DATA?.priceDataMeta?.exchangeRateKrwPerUsd || 1400);
  const newKrw = Math.round(reference.priceUsd * planningRate / 10000) * 10000;
  return {
    gpuId,
    newKrw,
    usedKrw: Math.round(newKrw * 0.68 / 10000) * 10000,
    lowestKrw: newKrw,
    updatedAt: gpu.verifiedAt || DATA_UPDATED_AT,
    sourceName: uiLanguage === "en"
      ? (reference.priceKind === "launch-reference" ? "Launch price / MSRP conversion (reference)" : "VRAM-tier based calculation (reference)")
      : (reference.priceKind === "launch-reference" ? "출시가·MSRP 환산 참고" : "VRAM·등급 기반 계산 참고"),
    sourceUrl: gpu.sourceUrl || "",
    usedPriceMethod: "계산 신품 참고가의 68% 적용",
    priceKind: reference.priceKind,
    estimated: true,
  };
}

function studioExchangeRate() {
  return Math.max(1, Number(studioState.siExchangeRate) || Number(window.AIHardwarePricing?.KRW_PER_USD) || 1400);
}

function studioDisplayFromKrw(value) {
  const amount = Number(value) || 0;
  return uiLanguage === "en" ? Number((amount / studioExchangeRate()).toFixed(2)) : Math.round(amount);
}

function studioKrwFromDisplay(value) {
  const amount = Number(value) || 0;
  return uiLanguage === "en" ? Math.round(amount * studioExchangeRate()) : Math.round(amount);
}

function studioDisplayFromUsd(value) {
  const amount = Number(value) || 0;
  return uiLanguage === "en" ? Number(amount.toFixed(2)) : Math.round(amount * studioExchangeRate());
}

function studioUsdFromDisplay(value) {
  const amount = Number(value) || 0;
  return uiLanguage === "en" ? amount : amount / studioExchangeRate();
}

function studioMoney(value) {
  const amountKrw = Number(value) || 0;
  if (uiLanguage === "en") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amountKrw / studioExchangeRate());
  }
  return `${Math.round(amountKrw).toLocaleString("ko-KR")}원`;
}

function studioWorkloadModels() {
  return getAllModels().filter((model) => {
    const category = typeof getAdvisorModelCategory === "function" ? getAdvisorModelCategory(model) : (model.type || "llm");
    return studioState.category === "all" || category === studioState.category;
  });
}

function studioSelectedModel() {
  const models = studioWorkloadModels();
  return getModelByKey(studioState.modelKey) || currentPlatformModel?.() || models[0] || getAllModels()[0];
}

function studioGpuScore(gpu, model) {
  const rawEstimate = estimateAnyModelForHardware(model, buildHardwareForPreset(gpu));
  const mediaScale = studioState.category === "image"
    ? Math.pow(Math.max(512, studioState.imageSize) / 1024, 2)
    : ["video", "avatar-generation"].includes(studioState.category)
      ? Math.max(1, studioState.videoFrames) / 81
      : 1;
  const estimate = rawEstimate ? {
    ...rawEstimate,
    requiredGb: Number(rawEstimate.requiredGb || 0) * (["video", "avatar-generation"].includes(studioState.category) ? 0.75 + mediaScale * 0.25 : mediaScale),
  } : null;
  const market = studioMarket(gpu.id);
  const speed = Number(estimate?.speed || estimate?.throughput || 0) / Math.max(0.25, mediaScale);
  const memory = Number(gpu.gpuUsableMemoryGb || gpu.vram || 0);
  const power = gpuMarketReference(gpu).powerW;
  const price = studioState.condition === "used" ? market?.usedKrw : market?.newKrw;
  return {
    gpu,
    estimate,
    market,
    speed,
    memory,
    power,
    price: price || market?.lowestKrw || 0,
    fit: Boolean(estimate && estimate.requiredGb <= memory * 0.96),
  };
}

function studioRecommendationSet() {
  const model = studioSelectedModel();
  let rows = GPU_PRESETS
    .filter((gpu) => gpu.id !== "custom")
    .map((gpu) => studioGpuScore(gpu, model))
    .filter((row) => row.fit && row.price <= studioState.budgetKrw)
    .filter((row) => !studioState.targetSpeed || row.speed >= studioState.targetSpeed)
    .filter((row) => studioState.formFactor === "all" || row.gpu.formFactor === studioState.formFactor)
    .filter((row) => !studioState.powerLimitW || row.power <= studioState.powerLimitW)
    .filter((row) => studioState.noise !== "quiet" || row.power <= 320);
  const byValue = [...rows].sort((a, b) => (b.speed / b.price) - (a.speed / a.price));
  const cheapest = [...rows].sort((a, b) => a.price - b.price || b.speed - a.speed)[0];
  const balanced = byValue.find((row) => row.gpu.id !== cheapest?.gpu.id) || byValue[0];
  const fastestRows = [...rows].sort((a, b) => b.speed - a.speed);
  const fastest = fastestRows.find((row) => ![cheapest?.gpu.id, balanced?.gpu.id].includes(row.gpu.id)) || fastestRows[0];
  return { model, rows, picks: [cheapest, balanced, fastest] };
}

function studioReason(row, kind) {
  const en = uiLanguage === "en";
  if (!row) return en ? "No GPU matches every selected condition." : "선택한 조건을 모두 만족하는 GPU가 없습니다.";
  const headroom = row.memory - Number(row.estimate?.requiredGb || 0);
  const labels = en
    ? ["It is the lowest-priced compatible option", "It has the strongest speed-to-price balance", "It is the fastest compatible option"]
    : ["실행 가능한 후보 중 구매 가격이 가장 낮고", "속도 대비 가격의 균형이 가장 좋고", "조건을 만족하는 후보 중 예상 속도가 가장 빠르고"];
  return en
    ? `${labels[kind]}, with ${Math.max(0, headroom).toFixed(1)} GB of estimated VRAM headroom.`
    : `${labels[kind]} 예상 VRAM 여유가 ${Math.max(0, headroom).toFixed(1)}GB라 추천합니다.`;
}

function renderStudioRecommend() {
  const models = studioWorkloadModels();
  const { model, picks } = studioRecommendationSet();
  const en = uiLanguage === "en";
  const currentGpu = currentPlatformGpu?.();
  const currentRow = currentGpu ? studioGpuScore(currentGpu, model) : null;
  const pickTitles = en ? ["Lowest cost", "Balanced", "Highest performance"] : ["최저 비용 추천", "균형 추천", "최고 성능 추천"];
  return `
    <div class="studio-question-grid">
      <label><span>${en ? "Workload" : "모델 종류"}</span><select id="studioCategory">
        ${[
          ["all", en ? "All" : "전체"], ["llm", "LLM"], ["vlm", "VLM"],
          ["image", en ? "Image generation" : "이미지 생성"], ["video", en ? "Video generation" : "비디오 생성"],
          ["embedding", en ? "Embedding" : "임베딩"], ["reranker", en ? "Reranker" : "리랭커"],
          ["ocr", "OCR"], ["avatar-generation", en ? "Avatar / lip sync" : "아바타·립싱크"], ["stt", "STT"], ["tts", "TTS"],
        ].map(([id, label]) => `<option value="${id}" ${studioState.category === id ? "selected" : ""}>${label}</option>`).join("")}
      </select></label>
      <label class="studio-wide"><span>${en ? "Model to run" : "실행할 모델"}</span><select id="studioModel">${models.map((item) => `<option value="${platformEscape(modelKey(item))}" ${modelKey(item) === modelKey(model) ? "selected" : ""}>${platformEscape(item.name)}</option>`).join("")}</select></label>
      <label><span>${en ? "Target speed" : "목표 속도"}</span><input id="studioTargetSpeed" type="number" min="0" value="${studioState.targetSpeed}"></label>
      <label><span>${en ? "Maximum budget (USD)" : "최대 예산 (원)"}</span><input id="studioBudget" type="number" min="0" step="${en ? 100 : 10000}" value="${studioDisplayFromKrw(studioState.budgetKrw)}"></label>
      <label><span>${en ? "Purchase condition" : "구매 조건"}</span><select id="studioCondition"><option value="either" ${studioState.condition === "either" ? "selected" : ""}>${en ? "New or used" : "신품·중고 모두"}</option><option value="new" ${studioState.condition === "new" ? "selected" : ""}>${en ? "New" : "신품"}</option><option value="used" ${studioState.condition === "used" ? "selected" : ""}>${en ? "Used reference" : "중고 참고가"}</option></select></label>
      <label><span>${en ? "System" : "형태"}</span><select id="studioFormFactor"><option value="all" ${studioState.formFactor === "all" ? "selected" : ""}>${en ? "All" : "전체"}</option><option value="desktop" ${studioState.formFactor === "desktop" ? "selected" : ""}>${en ? "Desktop" : "데스크톱"}</option><option value="laptop" ${studioState.formFactor === "laptop" ? "selected" : ""}>${en ? "Laptop" : "노트북"}</option></select></label>
      <label><span>${en ? "Power limit (W)" : "전력 제한 (W)"}</span><input id="studioPower" type="number" min="0" value="${studioState.powerLimitW}"></label>
      <label><span>${en ? "Noise preference" : "소음 선호"}</span><select id="studioNoise"><option value="normal" ${studioState.noise === "normal" ? "selected" : ""}>${en ? "Normal" : "일반"}</option><option value="quiet" ${studioState.noise === "quiet" ? "selected" : ""}>${en ? "Quiet / lower power" : "저소음·저전력"}</option></select></label>
      ${studioState.category === "image" ? `<label><span>${en ? "Image size" : "이미지 해상도"}</span><select id="studioImageSize">${[768, 1024, 1536].map((size) => `<option value="${size}" ${studioState.imageSize === size ? "selected" : ""}>${size}px</option>`).join("")}</select></label>` : ""}
      ${["video", "avatar-generation"].includes(studioState.category) ? `<label><span>${en ? "Video frames" : "비디오 프레임"}</span><input id="studioVideoFrames" type="number" min="1" max="241" value="${studioState.videoFrames}"></label>` : ""}
    </div>
    <div class="studio-pick-grid">
      ${picks.map((row, index) => `<article class="studio-pick-card ${index === 1 ? "is-featured" : ""}">
        <span>${pickTitles[index]}</span>
        <h3>${row ? platformEscape(shortGpuName(row.gpu.name)) : "—"}</h3>
        <p>${studioReason(row, index)}</p>
        ${row ? `<dl>
          <div><dt>${en ? "Price" : "참고 가격"}</dt><dd>${studioMoney(row.price)}</dd>${
            studioState.condition === "used"
              ? `<small class="studio-price-note">${platformEscape(window.AIHardwareLocale?.usedPriceMethod(row.market.usedPriceMethod, en ? "en" : "ko") || row.market.usedPriceMethod)}</small>`
              : row.market?.estimated
                ? `<small class="studio-price-note">${row.market.priceKind === "launch-reference" ? (en ? "Launch-price reference, not a live Korean market price" : "출시가 환산 참고값 · 실제 국내 시세 아님") : (en ? "Calculated estimate, not a live Korean market price" : "계산 추정값 · 실제 국내 시세 아님")}</small>`
                : ""
          }</div>
          <div><dt>${en ? "Estimated speed" : "예상 속도"}</dt><dd>${platformEscape(formatThroughput(row.speed, row.estimate?.unitLabel || "tok/s"))}</dd></div>
          <div><dt>VRAM</dt><dd>${formatGb(row.memory)} · ${row.estimate.grade}</dd></div>
          <div><dt>${en ? "Power" : "소비전력"}</dt><dd>${row.power}W</dd></div>
          <div><dt>${en ? "Setup" : "실행 난이도"}</dt><dd>${row.gpu.vendor === "NVIDIA" ? (en ? "Easy" : "쉬움") : (en ? "Check runtime" : "런타임 확인")}</dd></div>
          <div><dt>${en ? "vs current GPU" : "현재 GPU 대비"}</dt><dd>${currentRow?.speed ? `${(row.speed / currentRow.speed).toFixed(2)}×` : "—"}</dd></div>
        </dl><button type="button" class="ghost-button" data-studio-gpu="${row.gpu.id}">${en ? "Use this GPU" : "이 GPU 선택"}</button>` : ""}
      </article>`).join("")}
    </div>`;
}

function renderStudioMarket() {
  const en = uiLanguage === "en";
  const rows = KOREAN_GPU_MARKET.map((market) => {
    const gpu = GPU_PRESETS.find((item) => item.id === market.gpuId);
    if (!gpu) return null;
    const ageDays = Math.max(0, Math.floor((Date.now() - new Date(`${market.updatedAt}T00:00:00`).valueOf()) / 86400000));
    const model = studioSelectedModel();
    const score = studioGpuScore(gpu, model);
    return { market, gpu, ageDays, score };
  }).filter(Boolean);
  const valueOrder = [...rows].sort((a, b) => (b.score.speed / b.market.lowestKrw) - (a.score.speed / a.market.lowestKrw));
  const vramOrder = [...rows].sort((a, b) => ((b.gpu.vram || 0) / b.market.lowestKrw) - ((a.gpu.vram || 0) / a.market.lowestKrw));
  const quoteRequired = Math.max(0, GPU_PRESETS.filter((gpu) => gpu.id !== "custom").length - rows.length);
  return `
    <div class="studio-market-summary">
      <p>${en ? "Only dated, source-linked Korean prices are ranked. Calculated catalog prices are no longer presented as market prices." : "기준일과 출처가 있는 국내 가격만 순위를 계산합니다. 카탈로그 계산가는 국내 시세처럼 표시하지 않습니다."}</p>
      <span>${en ? `${rows.length} dated prices · ${quoteRequired} GPUs require a supplier quote` : `출처 연결 시세 ${rows.length}개 · 공급사 견적 필요 GPU ${quoteRequired}개`}</span>
      <span>${en ? "Price model" : "가격 기준 모델"}: ${platformEscape(studioSelectedModel().name)}</span>
    </div>
    <div class="studio-table-wrap"><table class="studio-table"><thead><tr>
      <th>GPU</th><th>${en ? "New / lowest" : "신품 / 최저가"}</th><th>${en ? "Used reference" : "중고 참고가"}</th>
      <th>${en ? "Updated" : "갱신일"}</th><th>${en ? "Value rank" : "성능/가격"}</th><th>${en ? "VRAM rank" : "VRAM/가격"}</th><th>${en ? "Source" : "출처"}</th>
    </tr></thead><tbody>${rows.map(({ market, gpu, ageDays, score }) => `<tr>
      <td><strong>${platformEscape(shortGpuName(gpu.name))}</strong></td>
      <td>${studioMoney(market.newKrw)}<small>${studioMoney(market.lowestKrw)}</small></td>
      <td>${studioMoney(market.usedKrw)}<small>${platformEscape(window.AIHardwareLocale?.usedPriceMethod(market.usedPriceMethod, en ? "en" : "ko") || market.usedPriceMethod)}</small></td>
      <td>${market.updatedAt}${ageDays >= 90 ? `<span class="studio-stale">${en ? `${ageDays}+ days old` : `${ageDays}일 이상 경과`}</span>` : ageDays > 30 ? `<span class="studio-aging">${en ? `Checked ${ageDays} days ago` : `${ageDays}일 전 확인`}</span>` : `<span class="studio-fresh">${ageDays === 0 ? (en ? "Checked today" : "오늘 확인") : (en ? `Checked ${ageDays} days ago` : `${ageDays}일 전 확인`)}</span>`}</td>
      <td>#${valueOrder.findIndex((row) => row.market.gpuId === market.gpuId) + 1}<small>${score.speed ? (en ? `${(score.speed / (market.lowestKrw / studioExchangeRate()) * 1000).toFixed(1)} / $1K` : `${(score.speed / market.lowestKrw * 1000000).toFixed(1)} / ₩1M`) : "—"}</small></td>
      <td>#${vramOrder.findIndex((row) => row.market.gpuId === market.gpuId) + 1}<small>${en ? `${((gpu.vram || 0) / (market.lowestKrw / studioExchangeRate()) * 1000).toFixed(1)} GB / $1K` : `${((gpu.vram || 0) / market.lowestKrw * 1000000).toFixed(1)} GB / ₩1M`}</small></td>
      <td>${market.sourceUrl ? `<a href="${platformEscape(market.sourceUrl)}" target="_blank" rel="noopener noreferrer">${platformEscape(market.sourceName)}</a>` : platformEscape(market.sourceName)}</td>
    </tr>`).join("")}</tbody></table></div>`;
}

function calculateCustomModel() {
  const totalB = Math.max(0.01, Number(studioState.customTotalB) || 8);
  const activeB = Math.min(totalB, Math.max(0.01, Number(studioState.customActiveB) || totalB));
  const layers = Math.max(1, Number(studioState.customLayers) || 32);
  const bits = Math.max(2, Number(studioState.customBits) || 4);
  const context = Math.max(512, Number(studioState.customContext) || 8192);
  const weightsGb = totalB * (bits / 8) * 1.08;
  const kvGb = activeB * (context / 8192) * (layers / 32) * 0.085;
  const visionGb = studioState.customVision ? 1.8 : 0;
  const runtimeGb = 2.2 + weightsGb * 0.08;
  const requiredGb = weightsGb + kvGb + visionGb + runtimeGb;
  const candidates = GPU_PRESETS
    .filter((gpu) => gpu.id !== "custom" && (gpu.gpuUsableMemoryGb || gpu.vram) >= requiredGb)
    .sort((a, b) => (a.gpuUsableMemoryGb || a.vram) - (b.gpuUsableMemoryGb || b.vram))
    .slice(0, 6);
  return { totalB, activeB, layers, bits, context, weightsGb, kvGb, visionGb, runtimeGb, requiredGb, candidates };
}

function renderStudioCustom() {
  const en = uiLanguage === "en";
  const result = calculateCustomModel();
  const issueBody = encodeURIComponent([
    `Model: ${studioState.customName || "Custom model"}`,
    `Source: ${studioState.customUrl || "Not provided"}`,
    `Total params: ${result.totalB}B`,
    `Active params: ${result.activeB}B`,
    `Layers: ${result.layers}`,
    `Precision: ${result.bits}-bit`,
    `Context: ${result.context}`,
    `Vision: ${studioState.customVision}`,
    `Estimated VRAM: ${result.requiredGb.toFixed(2)} GB`,
  ].join("\n"));
  return `
    <div class="studio-question-grid">
      <label><span>${en ? "Model name" : "모델명"}</span><input id="customName" value="${platformEscape(studioState.customName)}"></label>
      <label class="studio-wide"><span>Hugging Face URL</span><input id="customUrl" type="url" value="${platformEscape(studioState.customUrl)}" placeholder="https://huggingface.co/organization/model"></label>
      <label><span>${en ? "Total parameters (B)" : "총 파라미터 (B)"}</span><input id="customTotalB" type="number" min="0.01" step="0.1" value="${result.totalB}"></label>
      <label><span>${en ? "Active parameters (B)" : "활성 파라미터 (B)"}</span><input id="customActiveB" type="number" min="0.01" step="0.1" value="${result.activeB}"></label>
      <label><span>${en ? "Transformer layers" : "레이어 수"}</span><input id="customLayers" type="number" min="1" value="${result.layers}"></label>
      <label><span>${en ? "Precision" : "정밀도"}</span><select id="customBits">${[2, 3, 4, 5, 6, 8, 16].map((bits) => `<option value="${bits}" ${result.bits === bits ? "selected" : ""}>${bits}-bit</option>`).join("")}</select></label>
      <label><span>${en ? "Context tokens" : "컨텍스트 토큰"}</span><input id="customContext" type="number" min="512" step="512" value="${result.context}"></label>
      <label class="studio-check"><input id="customVision" type="checkbox" ${studioState.customVision ? "checked" : ""}><span>${en ? "Vision / VLM modules" : "이미지·VLM 모듈 포함"}</span></label>
    </div>
    <div class="custom-model-result">
      <article><span>${en ? "Estimated VRAM" : "예상 VRAM"}</span><strong>${result.requiredGb.toFixed(1)} GB</strong><small>${en ? "Includes 8% weight overhead and runtime headroom" : "가중치 8% 오버헤드와 런타임 여유 포함"}</small></article>
      <dl>
        <div><dt>${en ? "Weights" : "가중치"}</dt><dd>${result.weightsGb.toFixed(1)} GB</dd></div>
        <div><dt>KV cache</dt><dd>${result.kvGb.toFixed(1)} GB</dd></div>
        <div><dt>${en ? "Vision" : "비전"}</dt><dd>${result.visionGb.toFixed(1)} GB</dd></div>
        <div><dt>${en ? "Runtime" : "런타임"}</dt><dd>${result.runtimeGb.toFixed(1)} GB</dd></div>
      </dl>
      <div class="custom-gpu-list">${result.candidates.length ? result.candidates.map((gpu) => `<span>${platformEscape(shortGpuName(gpu.name))}</span>`).join("") : `<span>${en ? "Multi-GPU or CPU offload required" : "멀티 GPU 또는 CPU 오프로딩 필요"}</span>`}</div>
      <a class="primary-button" href="https://github.com/jaeseok614/ai-hardware-fit/issues/new?title=${encodeURIComponent(`[Model] ${studioState.customName || "Custom model"}`)}&body=${issueBody}" target="_blank" rel="noopener noreferrer">${en ? "Submit this model" : "이 계산을 모델 제보로 전환"}</a>
    </div>`;
}

function studioPart(id, type) {
  return SYSTEM_PART_CATALOG[type].find((item) => item.id === id) || SYSTEM_PART_CATALOG[type][0];
}

function renderStudioParts() {
  const en = uiLanguage === "en";
  const cpu = studioPart(studioState.cpuId, "cpu");
  const board = studioPart(studioState.motherboardId, "motherboard");
  const psu = studioPart(studioState.psuId, "psu");
  const pcCase = studioPart(studioState.caseId, "case");
  const gpu = GPU_PRESETS.find((item) => item.id === studioState.gpuId) || GPU_PRESETS.find((item) => item.id === "rtx5070ti-16");
  const physical = GPU_PHYSICAL_REFERENCE[gpu.id] || { lengthMm: 340, slots: 3, connector: "unknown", recommendedPsuW: gpuMarketReference(gpu).powerW + 400 };
  const socketFits = cpu.socket === board.socket;
  const caseFits = physical.lengthMm <= pcCase.clearanceMm && (board.form === "mATX" || pcCase.form === "ATX");
  const psuFits = psu.watts >= physical.recommendedPsuW;
  const model = studioSelectedModel();
  const estimate = estimateAnyModelForHardware(model, buildHardwareForPreset(gpu));
  const cpuBottleneck = Number(estimate?.requiredGb || 0) > (gpu.vram || 0) && cpu.score < 75;
  const gpuPrice = studioMarket(gpu.id)?.lowestKrw || 0;
  const total = cpu.priceKrw + board.priceKrw + psu.priceKrw + pcCase.priceKrw + gpuPrice + Math.max(32, studioState.ramGb) * 2300;
  const checks = [
    [socketFits, en ? "CPU socket matches the motherboard" : "CPU와 메인보드 소켓 호환", `${cpu.socket} / ${board.socket}`],
    [caseFits, en ? "GPU and motherboard fit the case" : "GPU 길이·메인보드 케이스 호환", `${physical.lengthMm} / ${pcCase.clearanceMm} mm · ${physical.slots} slot`],
    [psuFits, en ? "PSU capacity meets the recommendation" : "권장 파워 용량 충족", `${psu.watts} / ${physical.recommendedPsuW} W · ${physical.connector}`],
    [!cpuBottleneck, en ? "CPU has enough offload headroom" : "CPU 오프로딩·전처리 여유", cpuBottleneck ? (en ? "Upgrade CPU" : "CPU 업그레이드 권장") : (en ? "Adequate" : "충분")],
  ];
  return `
    <div class="studio-question-grid">
      ${[
        ["partsCpu", "cpu", studioState.cpuId, en ? "CPU" : "CPU"],
        ["partsBoard", "motherboard", studioState.motherboardId, en ? "Motherboard" : "메인보드"],
        ["partsPsu", "psu", studioState.psuId, en ? "PSU" : "파워"],
        ["partsCase", "case", studioState.caseId, en ? "Case" : "케이스"],
      ].map(([id, type, value, label]) => `<label><span>${label}</span><select id="${id}">${SYSTEM_PART_CATALOG[type].map((item) => `<option value="${item.id}" ${item.id === value ? "selected" : ""}>${platformEscape(item.name)} · ${studioMoney(item.priceKrw)}</option>`).join("")}</select></label>`).join("")}
      <label class="studio-wide"><span>GPU</span><select id="partsGpu">${Object.keys(GPU_PHYSICAL_REFERENCE).map((id) => {
        const item = GPU_PRESETS.find((gpuItem) => gpuItem.id === id);
        return item ? `<option value="${id}" ${id === gpu.id ? "selected" : ""}>${platformEscape(shortGpuName(item.name))}</option>` : "";
      }).join("")}</select></label>
      <label><span>RAM (GB)</span><input id="partsRam" type="number" min="16" step="16" value="${studioState.ramGb}"></label>
    </div>
    <div class="parts-result">
      <div class="parts-check-list">${checks.map(([ok, label, detail]) => `<article class="${ok ? "is-ok" : "is-warning"}"><strong>${ok ? "✓" : "!"} ${label}</strong><span>${detail}</span></article>`).join("")}</div>
      <div class="parts-total"><span>${en ? "Reference system total" : "참고 시스템 합계"}</span><strong>${studioMoney(total)}</strong><small>${gpuPrice ? (en ? "Includes the sourced GPU price" : "출처가 있는 GPU 가격 포함") : (en ? "GPU market price unavailable" : "GPU 시세 미포함")}</small></div>
      <button type="button" class="ghost-button" data-save-build>${en ? "Save build on this device" : "이 기기에 견적 저장"}</button>
      <button type="button" class="ghost-button" data-share-studio>${en ? "Copy share link" : "견적 공유 링크 복사"}</button>
    </div>`;
}

function renderStudioRuntime() {
  const en = uiLanguage === "en";
  const gpu = GPU_PRESETS.find((item) => item.id === studioState.gpuId) || currentPlatformGpu?.() || GPU_PRESETS[0];
  const vendor = gpu.vendor || "NVIDIA";
  const info = RUNTIME_COMPATIBILITY[vendor]?.[studioState.runtimeOs] || RUNTIME_COMPATIBILITY.NVIDIA.windows;
  const model = studioSelectedModel();
  const modelId = model.hfRepo || model.repo || model.name.toLowerCase().replace(/\s+/g, "-");
  const command = vendor === "Apple"
    ? `python -m mlx_lm.generate --model ${modelId} --prompt "Hello"`
    : vendor === "Intel"
      ? `optimum-cli export openvino --model ${modelId} openvino_model`
      : `llama-cli -hf ${modelId} -ngl 999 -c ${Number(studioState.customContext) || 8192}`;
  const levelLabel = {
    easy: en ? "Easy" : "쉬움",
    medium: en ? "Some setup" : "설정 필요",
    hard: en ? "Advanced" : "난이도 높음",
    blocked: en ? "Unsupported" : "지원 안 됨",
  };
  return `
    <div class="studio-question-grid">
      <label class="studio-wide"><span>GPU</span><select id="runtimeGpu">${GPU_PRESETS.filter((item) => item.id !== "custom").map((item) => `<option value="${item.id}" ${item.id === gpu.id ? "selected" : ""}>${platformEscape(shortGpuName(item.name))}</option>`).join("")}</select></label>
      <label><span>${en ? "Operating system" : "운영체제"}</span><select id="runtimeOs"><option value="windows" ${studioState.runtimeOs === "windows" ? "selected" : ""}>Windows</option><option value="linux" ${studioState.runtimeOs === "linux" ? "selected" : ""}>Linux / macOS</option></select></label>
    </div>
    <div class="runtime-compat-card level-${info.level}">
      <div><span>${vendor} · ${studioState.runtimeOs === "windows" ? "Windows" : "Linux / macOS"}</span><strong>${levelLabel[info.level]}</strong></div>
      <h3>${platformEscape(info.tools)}</h3><p>${platformEscape(en ? info.noteEn : info.noteKo)}</p>
      <pre><code>${platformEscape(command)}</code></pre>
      ${info.level === "hard" ? `<strong class="runtime-warning">${en ? "It may fit in VRAM but still require driver or source-build work." : "VRAM에는 들어가도 드라이버 설치나 소스 빌드가 필요할 수 있습니다."}</strong>` : ""}
    </div>`;
}

function communityRows() {
  try {
    const parsed = JSON.parse(localStorage.getItem("ai-hardware-fit-community-benchmarks") || "[]");
    return Array.isArray(parsed) ? parsed.slice(0, 30) : [];
  } catch {
    return [];
  }
}

function renderStudioCommunity() {
  const en = uiLanguage === "en";
  const rows = communityRows();
  return `
    <form id="communityBenchmarkForm" class="studio-question-grid">
      <label><span>${en ? "Contributor" : "기여자 이름"}</span><input name="contributor" required maxlength="60"></label>
      <label><span>${en ? "Model" : "모델"}</span><input name="modelName" required maxlength="120"></label>
      <label><span>GPU</span><select name="gpuId">${GPU_PRESETS.filter((item) => item.id !== "custom").map((item) => `<option value="${item.id}">${platformEscape(shortGpuName(item.name))}</option>`).join("")}</select></label>
      <label><span>${en ? "Runtime" : "런타임"}</span><input name="runtime" required placeholder="llama.cpp / vLLM"></label>
      <label><span>${en ? "Precision" : "정밀도"}</span><input name="precision" required placeholder="Q4_K_M / FP16"></label>
      <label><span>${en ? "Context" : "컨텍스트"}</span><input name="context" type="number" min="1" value="8192"></label>
      <label><span>${en ? "Measured speed" : "실측 속도"}</span><input name="speed" type="number" min="0.001" step="0.001" required></label>
      <label><span>${en ? "Driver / environment" : "드라이버·환경"}</span><input name="environment" required maxlength="160"></label>
      <label class="studio-wide"><span>${en ? "Evidence URL" : "근거 URL"}</span><input name="sourceUrl" type="url" required placeholder="https://..."></label>
      <button class="primary-button" type="submit">${en ? "Validate and save draft" : "검증하고 제보 초안 저장"}</button>
    </form>
    <p class="studio-form-note">${en ? "Drafts stay in this browser. Submit the generated issue to contribute it to the shared dataset." : "초안은 이 브라우저에 저장됩니다. 생성된 GitHub 이슈를 제출하면 공용 데이터 검토가 시작됩니다."}</p>
    <div class="community-row-list">${rows.length ? rows.map((row) => `<article class="${row.outlier ? "is-outlier" : ""}">
      <div><strong>${platformEscape(row.modelName)}</strong><span>${platformEscape(row.gpuName)}</span></div>
      <span>${platformEscape(row.runtime)} · ${platformEscape(row.precision)} · ${row.context}</span>
      <strong>${row.speed.toFixed(2)} tok/s</strong><span>${platformEscape(row.contributor)} · ${platformEscape(row.environment)}</span>
      ${row.outlier ? `<small>${en ? "Outlier: verify before merging" : "이상치 후보: 병합 전 재검증 필요"}</small>` : ""}
      <a href="${platformEscape(row.issueUrl)}" target="_blank" rel="noopener noreferrer">${en ? "Open contribution issue" : "제보 이슈 열기"}</a>
    </article>`).join("") : `<p class="hub-empty">${en ? "No local drafts yet." : "아직 이 브라우저에 저장된 제보 초안이 없습니다."}</p>`}</div>`;
}

const SI_SCENARIOS = {
  "ai-chatbot": {
    ko: "고객 상담 AI 챗봇", en: "Customer service chatbot", purpose: "고객 문의 응답·상담 자동화", purposeEn: "Customer Q&A and support automation",
    users: 100, concurrency: 12, input: 4096, output: 500, seconds: 6,
    availability: "ha", growth: 35, vector: 500, logs: 12, retention: 90, security: "standard", serviceType: "rag",
  },
  "internal-rag": {
    ko: "사내 문서 RAG", en: "Internal document RAG", purpose: "사내 문서 검색·질의응답", purposeEn: "Internal document search and Q&A",
    users: 100, concurrency: 10, input: 4096, output: 500, seconds: 8,
    availability: "ha", growth: 30, vector: 500, logs: 10, retention: 90, security: "restricted", serviceType: "rag",
  },
  "document-vlm": {
    ko: "문서 OCR·VLM", en: "Document OCR + VLM", purpose: "계약서·도면 OCR 및 시각 질의응답", purposeEn: "OCR and visual Q&A for contracts and drawings",
    users: 60, concurrency: 6, input: 8192, output: 350, seconds: 15,
    availability: "ha", growth: 25, vector: 1200, logs: 18, retention: 180, security: "restricted", serviceType: "ocr",
  },
  "private-assistant": {
    ko: "폐쇄망 AI 비서", en: "Air-gapped AI assistant", purpose: "폐쇄망 업무 지원·코드·요약", purposeEn: "Air-gapped work assistant for code and summarization",
    users: 250, concurrency: 20, input: 8192, output: 700, seconds: 10,
    availability: "nplus1", growth: 40, vector: 2000, logs: 30, retention: 365, security: "airgap", serviceType: "rag",
  },
  "image-studio": {
    ko: "AI 이미지 생성", en: "AI image generation", purpose: "마케팅·상품 이미지 생성 서비스", purposeEn: "Marketing and product image generation service",
    users: 50, concurrency: 5, input: 2048, output: 350, seconds: 20,
    availability: "ha", growth: 30, vector: 200, logs: 20, retention: 60, security: "standard", serviceType: "image",
  },
  "video-studio": {
    ko: "AI 영상 생성", en: "AI video generation", purpose: "홍보·교육용 AI 영상 생성", purposeEn: "AI video generation for marketing and training",
    users: 30, concurrency: 3, input: 2048, output: 500, seconds: 60,
    availability: "ha", growth: 30, vector: 300, logs: 40, retention: 60, security: "standard", serviceType: "video",
  },
  "voice-agent": {
    ko: "음성 상담 AI", en: "Voice AI agent", purpose: "STT·LLM·TTS 기반 실시간 음성 상담", purposeEn: "Real-time voice support with STT, LLM, and TTS",
    users: 100, concurrency: 15, input: 2048, output: 250, seconds: 3,
    availability: "ha", growth: 40, vector: 500, logs: 25, retention: 90, security: "restricted", serviceType: "voice",
  },
  "avatar-chat": {
    ko: "AI 아바타 채팅", en: "AI avatar chat", purpose: "STT·LLM·TTS·립싱크 실시간 아바타 대화", purposeEn: "Real-time avatar conversation with STT, LLM, TTS, and lip sync",
    users: 50, concurrency: 8, input: 2048, output: 250, seconds: 3,
    availability: "ha", growth: 40, vector: 500, logs: 35, retention: 90, security: "restricted", serviceType: "avatar",
  },
  // Unlike every other scenario here, this isn't recurring end-user
  // traffic -- it's a one-time (or periodic) batch job that reads a
  // document corpus and writes out a structured ontology/knowledge graph
  // (see features/ontology-cost-estimator.js's own "API vs Local" cousin,
  // the Ontology Cost tab, for the token-cost side of the same question).
  // "users"/"concurrency" here are repurposed as "how many parallel
  // extraction workers run at once" rather than literal people, since the
  // infra-sizing math downstream only cares about concurrent load and
  // per-request token sizes, not whether the requester is a human or a
  // batch worker.
  "ontology-batch": {
    ko: "온톨로지 구축 배치", en: "Ontology construction batch", purpose: "문서 코퍼스를 지식그래프·온톨로지로 일괄 변환", purposeEn: "Batch-converting a document corpus into a knowledge graph or ontology",
    users: 20, concurrency: 20, input: 6000, output: 1500, seconds: 25,
    availability: "single", growth: 15, vector: 100, logs: 5, retention: 90, security: "restricted", serviceType: "rag",
  },
};

const SI_BASELINE_PROFILES = {
  pilot: {
    ko: "소규모 체험", en: "Small pilot",
    noteKo: "10명 안팎이 기능을 확인하는 단계", noteEn: "A functional trial for about 10 people",
    userScale: 0.1, concurrencyScale: 0.2, maxUsers: 10, hours: 8, availability: "single", growth: 20, devProd: false,
  },
  team: {
    ko: "팀 운영", en: "Team use",
    noteKo: "한 부서가 실제 업무에 사용하는 단계", noteEn: "A department using the service in daily work",
    userScale: 0.5, concurrencyScale: 0.5, maxUsers: 50, hours: 12, availability: "single", growth: 25, devProd: true,
  },
  production: {
    ko: "운영 서비스", en: "Production",
    noteKo: "외부 또는 전사 서비스의 시작 기준", noteEn: "A starting point for company-wide or external service",
    userScale: 1, concurrencyScale: 1, maxUsers: Infinity, hours: 24, availability: "", growth: 0, devProd: true,
  },
};

const SI_FIELD_GUIDES = {
  siCompanyName: { ko: "견적서와 제안서에 표시할 공급 또는 제안 회사명입니다.", en: "The supplier or proposal company shown in exports.", baseKo: "개인 검토라면 비워도 됩니다.", baseEn: "Optional for a personal estimate." },
  siCustomerName: { ko: "인프라를 사용할 고객사 또는 조직명입니다.", en: "The customer or organization that will use the infrastructure.", baseKo: "내부 검토라면 비워도 됩니다.", baseEn: "Optional for an internal review." },
  siProjectName: { ko: "저장·공유·견적 버전을 구분할 프로젝트 이름입니다.", en: "A project name used to identify saved and shared estimate versions.", baseKo: "서비스명 + 구축 목적", baseEn: "Service name + purpose" },
  siPurpose: { ko: "AI를 도입해 해결하려는 업무를 짧게 적습니다.", en: "A short description of the business task the AI should solve.", baseKo: "예: 사내 문서 검색·질의응답", baseEn: "Example: internal document search and Q&A" },
  siIndustry: { ko: "보안·규제·운영 조건을 판단할 고객 업종입니다.", en: "The customer industry used to assess security and operating constraints.", baseKo: "일반 기업이면 ‘제조·일반기업’", baseEn: "Use a general-industry label when no special regulation applies." },
  siContact: { ko: "요구사항과 견적 변경을 확인할 담당자 또는 팀입니다.", en: "The person or team responsible for requirements and estimate changes.", baseKo: "이름 또는 조직명", baseEn: "Name or team" },
  siServiceType: { ko: "구축할 AI 서비스 종류이며 필요한 모델과 지연시간 기준에 영향을 줍니다.", en: "The AI service type; it affects model selection and latency targets.", baseKo: "문서 질의응답은 RAG / Chatbot", baseEn: "Use RAG / Chatbot for document Q&A." },
  siExportAllowed: { ko: "업무 데이터나 요청 내용을 외부 클라우드로 보낼 수 있는지 정합니다.", en: "Whether workload data and prompts may leave the organization for a cloud service.", baseKo: "모르면 ‘불가’로 시작", baseEn: "Start with Not allowed when unsure." },
  siModel: { ko: "서비스에서 주로 실행할 AI 모델입니다. 모델 크기가 GPU 메모리와 비용을 크게 좌우합니다.", en: "The primary AI model. Its size strongly affects GPU memory and cost.", baseKo: "간편 견적의 자동 선택 모델", baseEn: "Keep the model selected by the easy estimate." },
  siDeployment: { ko: "장비를 직접 보유할지, 클라우드를 사용할지 정합니다.", en: "Whether to own the hardware, use cloud resources, or compare both.", baseKo: "보안 데이터는 온프레미스, 변동 사용량은 비교", baseEn: "On-premises for restricted data; compare both for variable demand." },
  siSecurity: { ko: "인터넷·외부망 연결 허용 범위를 나타냅니다.", en: "The permitted level of internet and external-network connectivity.", baseKo: "사내 문서는 내부망", baseEn: "Restricted network for internal documents." },
  siTotalUsers: { ko: "서비스를 사용할 전체 인원입니다. 동시에 접속하는 인원과는 다릅니다.", en: "Everyone expected to use the service; this differs from simultaneous requests.", baseKo: "부서 50명, 전사 시작 100명", baseEn: "50 for a department, 100 for an initial company-wide rollout" },
  siConcurrency: { ko: "같은 순간에 AI 답변을 기다리는 사람 또는 요청 수입니다.", en: "People or requests waiting for an AI response at the same moment.", baseKo: "전체 사용자의 10~15%", baseEn: "Start with 10–15% of total users." },
  siQps: { ko: "QPS는 초당 시작되는 요청 수입니다. 동시 요청 수와 응답시간을 함께 반영한 트래픽 값입니다.", en: "QPS means queries per second: how many new requests begin each second.", baseKo: "팀 서비스 0.5~1, 운영 서비스 1~2", baseEn: "0.5–1 for team use, 1–2 for an initial production service" },
  siInputTokens: { ko: "한 요청에서 모델이 평균적으로 읽는 대화·문서 분량입니다.", en: "The average amount of prompt, conversation, or document text read per request.", baseKo: "일반 대화 2,048, 문서 RAG 4,096", baseEn: "2,048 for chat, 4,096 for document RAG" },
  siMaxInputTokens: { ko: "가장 긴 요청에서 모델이 읽어야 하는 최대 분량입니다. 평균값보다 큰 예외 요청을 대비합니다.", en: "The longest prompt or document that must be processed in one request.", baseKo: "평균 입력의 4배, 보통 16,384", baseEn: "About 4× the average input; commonly 16,384" },
  siOutputTokens: { ko: "한 번의 답변에서 생성하는 평균 토큰 수입니다.", en: "The average number of tokens generated in one response.", baseKo: "짧은 답변 250, 일반 답변 500", baseEn: "250 for short answers, 500 for general responses" },
  siTtftP95: { ko: "요청 100건 중 95건에서 답변 첫 글자가 나오기까지 허용할 시간입니다.", en: "The first-token target met by 95 out of 100 requests.", baseKo: "챗봇 2~3초, 배치 업무 5초", baseEn: "2–3 seconds for chat, 5 seconds for batch work" },
  siTargetSeconds: { ko: "평균적인 답변 하나를 끝까지 생성하는 목표 시간입니다.", en: "The target time to finish generating an average response.", baseKo: "일반 챗봇 6~8초", baseEn: "6–8 seconds for a general chatbot" },
  siLatencyP95: { ko: "큐 대기부터 답변 완료까지 전체 시간이 이 값 안에 들어오는 요청의 비율을 95%로 잡습니다.", en: "The end-to-end time, including queueing, met by 95% of requests.", baseKo: "목표 응답시간의 약 1.5배", baseEn: "About 1.5× the target response time" },
  siOperatingHours: { ko: "하루 중 시스템을 실제 서비스 상태로 운영하는 시간입니다.", en: "Hours per day that the system is expected to remain in service.", baseKo: "사내 업무 8~12시간, 외부 서비스 24시간", baseEn: "8–12 hours for internal work, 24 hours for external service" },
  siAvailability: { ko: "장비 한 대가 멈춰도 서비스를 계속할지 정합니다. HA는 이중화, N+1은 필요한 수량에 예비 1대를 더합니다.", en: "Whether service continues after a failure. HA duplicates capacity; N+1 adds one spare.", baseKo: "체험은 단일, 운영 서비스는 HA", baseEn: "Single for a pilot, HA for production" },
  siGrowthPct: { ko: "향후 사용자·트래픽 증가를 위해 미리 확보할 용량입니다.", en: "Capacity reserved for future user and traffic growth.", baseKo: "초기 운영 20~30%", baseEn: "20–30% for an initial production service" },
  siVectorDataGb: { ko: "임베딩된 문서와 벡터 인덱스가 차지할 예상 저장 공간입니다.", en: "Expected storage for embedded documents and vector indexes.", baseKo: "소규모 50GB, 부서 RAG 500GB", baseEn: "50 GB for a pilot, 500 GB for departmental RAG" },
  siLogGbDay: { ko: "요청·응답·감사·모니터링 로그가 하루에 늘어나는 양입니다.", en: "Daily growth of request, response, audit, and monitoring logs.", baseKo: "팀 서비스 2~10GB/일", baseEn: "2–10 GB/day for a team service" },
  siRetentionDays: { ko: "로그와 운영 기록을 보관할 기간입니다.", en: "How long logs and operating records are retained.", baseKo: "일반 90일, 규제·감사 180~365일", baseEn: "90 days normally; 180–365 for audit or regulation" },
  siDevProd: { ko: "개발·검증 환경과 실제 운영 환경의 장비를 분리할지 정합니다.", en: "Whether development and validation resources are separated from production.", baseKo: "체험은 해제, 실제 운영은 선택", baseEn: "Off for a pilot, on for production" },
  siPcieGen: { ko: "CPU와 GPU·스토리지 사이의 연결 규격입니다. 최신 GPU의 대역폭과 확장성에 영향을 줍니다.", en: "The connection generation between CPU, GPU, and storage; it affects bandwidth and expansion.", baseKo: "기존 장비 Gen 4, 신규 서버 Gen 5", baseEn: "Gen 4 for existing systems, Gen 5 for a new server" },
  siNetworkFabric: { ko: "서버와 GPU 노드 사이의 고속 통신 방식입니다.", en: "The high-speed interconnect used between servers and GPU nodes.", baseKo: "단일 서버·일반 RAG는 Ethernet", baseEn: "Ethernet for a single server or general RAG" },
  siBackup: { ko: "모델 설정·벡터DB·운영 데이터를 복구할 백업 주기입니다.", en: "The backup policy for model settings, vector databases, and operating data.", baseKo: "일반 운영은 일 1회", baseEn: "Daily for a general production service" },
  siMonitoring: { ko: "GPU 상태, 지연시간, 오류와 감사 기록을 관찰하는 수준입니다.", en: "The level of GPU, latency, error, and audit monitoring.", baseKo: "일반 운영은 GPU / latency / error", baseEn: "GPU / latency / error for general production" },
  siCooling: { ko: "서버 열을 처리하는 방식입니다. 고밀도 GPU 서버는 수랭 검토가 필요할 수 있습니다.", en: "How server heat is removed; dense GPU servers may require liquid-cooling review.", baseKo: "1~4 GPU는 공랭부터 검토", baseEn: "Start with air cooling for 1–4 GPUs." },
  siUpsMinutes: { ko: "정전 후 안전 종료나 발전기 전환까지 UPS가 버틸 시간입니다.", en: "How long the UPS must sustain the system for shutdown or generator transfer.", baseKo: "일반 서버 15분", baseEn: "15 minutes for a general server" },
  siElectricityKrw: { ko: "전력비 계산에 사용할 1kWh당 원화 단가입니다.", en: "The USD price per kWh used for energy-cost calculations.", baseKo: "초기 계산 150원/kWh, 실제 고지서로 교체", baseEn: "Start at about $0.11/kWh, then replace with the actual bill rate." },
  siMaintenancePct: { ko: "장비 구매가 대비 매년 예상하는 유지보수·지원 비용 비율입니다.", en: "Annual maintenance and support cost as a percentage of purchase price.", baseKo: "초기 계산 8~10%", baseEn: "8–10% for an initial estimate" },
};

function siBaselineSnapshot(scenario, profileId) {
  const profile = SI_BASELINE_PROFILES[profileId] || SI_BASELINE_PROFILES.production;
  const users = Math.max(1, Math.min(profile.maxUsers, Math.round(scenario.users * profile.userScale)));
  const concurrency = Math.max(1, Math.round(scenario.concurrency * profile.concurrencyScale));
  const targetSeconds = Math.max(1, scenario.seconds);
  return {
    siBaselineProfile: profileId,
    siTotalUsers: users,
    siUserPreset: users,
    siConcurrency: concurrency,
    siQps: Math.max(0.1, Number((concurrency / Math.max(4, Math.min(12, targetSeconds))).toFixed(2))),
    siInputTokens: scenario.input,
    siMaxInputTokens: Math.max(8192, scenario.input * 4),
    siOutputTokens: scenario.output,
    siTtftP95: profileId === "pilot" ? 3 : profileId === "team" ? 2.5 : 2,
    siTargetSeconds: targetSeconds,
    siLatencyP95: Math.ceil(targetSeconds * 1.5),
    siOperatingHours: profile.hours,
    siAvailability: profile.availability || scenario.availability,
    siGrowthPct: profile.growth || scenario.growth,
    siVectorDataGb: Math.max(10, Math.round(scenario.vector * profile.userScale)),
    siLogGbDay: Math.max(1, Math.round(scenario.logs * profile.userScale)),
    siRetentionDays: profileId === "pilot" ? 30 : profileId === "team" ? 90 : scenario.retention,
    siDevProd: profile.devProd,
  };
}

function renderSiBaselineGuide(scenario) {
  const en = uiLanguage === "en";
  return `<section class="si-baseline-guide" aria-labelledby="siBaselineTitle">
    <div><span class="section-kicker">${en ? "STARTING BASELINE" : "권장 시작 기준"}</span><h3 id="siBaselineTitle">${en ? "Not sure about the numbers? Start with a baseline." : "수치가 어렵다면 기준값부터 적용하세요"}</h3><p>${en ? "These are planning defaults, not guaranteed capacity. Replace them with measured traffic when available." : "아래 값은 견적을 시작하기 위한 가정값이며 성능 보장값이 아닙니다. 실제 트래픽을 알게 되면 교체하세요."}</p></div>
    <div class="si-baseline-options">${Object.entries(SI_BASELINE_PROFILES).map(([id, profile]) => {
      const values = siBaselineSnapshot(scenario, id);
      return `<button type="button" data-si-baseline="${id}" class="${studioState.siBaselineProfile === id ? "is-active" : ""}"><strong>${en ? profile.en : profile.ko}</strong><small>${en ? profile.noteEn : profile.noteKo}</small><span>${values.siTotalUsers}${en ? " users" : "명"} · ${en ? "concurrent" : "동시"} ${values.siConcurrency} · ${values.siQps} QPS · ${values.siAvailability === "single" ? (en ? "single" : "단일") : values.siAvailability.toUpperCase()}</span></button>`;
    }).join("")}</div>
  </section>`;
}

function decorateSiDetailedFields() {
  const en = uiLanguage === "en";
  Object.entries(SI_FIELD_GUIDES).forEach(([id, guide]) => {
    const control = document.getElementById(id);
    const label = control?.closest("label");
    const heading = label?.querySelector(":scope > span");
    if (!control || !label || !heading) return;
    heading.querySelector(".term-help")?.remove();
    const help = document.createElement("button");
    help.type = "button";
    help.className = "term-help";
    help.textContent = "?";
    help.dataset.tooltip = `${en ? guide.en : guide.ko} ${en ? "Starting point:" : "시작 기준:"} ${en ? guide.baseEn : guide.baseKo}`;
    help.setAttribute("aria-label", `${heading.textContent.trim()} ${en ? "help" : "도움말"}`);
    heading.append(" ", help);
    const baseline = document.createElement("small");
    baseline.className = "si-field-baseline";
    baseline.id = `${id}Baseline`;
    baseline.textContent = `${en ? "Starting point" : "시작 기준"}: ${en ? guide.baseEn : guide.baseKo}`;
    label.append(baseline);
    control.setAttribute("aria-describedby", baseline.id);
  });
}

function siEnterpriseGpus() {
  const ids = ["rtx6000ada-48", "l40s-48", "h100-pcie-80", "rtxpro6000blackwell-96", "h200-141"];
  return ids.map((id) => GPU_PRESETS.find((gpu) => gpu.id === id)).filter(Boolean);
}

// Beginner-mode recommendations are intentionally curated by parameter class,
// release recency, public evaluation evidence, and modality. Raw benchmark
// numbers from different harnesses are never compared as if they were one
// leaderboard; the score is shown as supporting evidence for the chosen model.
const SI_MODEL_RECOMMENDATIONS = {
  text: {
    economy: ["MiMo-V2.6 Distill Qwen 9B", "Granite 4.2 8B", "Qwen3 8B"],
    balanced: ["Qwen3.8 27B", "Granite 4.2 30B", "Qwen3.6 27B", "Qwen3 32B"],
    quality: ["Qwen3.5 122B A10B", "Qwen3-Next 80B A3B Instruct", "Mistral Medium 3.5 128B"],
  },
  vision: {
    economy: ["MiMo-V2.6 Distill Qwen 9B", "Ministral 3 8B", "Gemma 4 E4B IT Thinking"],
    balanced: ["Qwen3.5 27B", "Gemma 4 26B A4B IT Thinking", "Muse Glimmer 30B"],
    quality: ["Qwen3.5 122B A10B", "Mistral Medium 3.5 128B", "Mistral Small 4 119B A6B"],
  },
};

function siRecommendationTrack() {
  return ["ocr", "image", "video", "avatar"].includes(studioState.siServiceType) ? "vision" : "text";
}

function siRecommendedModel() {
  const models = getAllModels();
  const track = SI_MODEL_RECOMMENDATIONS[siRecommendationTrack()] || SI_MODEL_RECOMMENDATIONS.text;
  const candidates = track[studioState.siQualityPreset] || track.balanced;
  return candidates.map((name) => models.find((model) => model.name === name)).find(Boolean)
    || models.find((model) => model.name === "Qwen3.8 27B")
    || studioSelectedModel();
}

function siSelectedModel() {
  return getModelByKey(studioState.modelKey)
    || siRecommendedModel();
}

function siSizingPlan(gpu, model, profile) {
  // Note: window.AIHardwareInfraSizing (features/infrastructure-sizing.js) is always loaded
  // unconditionally in index.html, so this always takes the AIHardwareInfraSizing-backed path.
  const estimate = estimateAnyModelForHardware(model, buildHardwareForPreset(gpu));
  const base = window.AIHardwareInfraSizing.sizeCandidate({
    gpu,
    model,
    estimate,
    state: studioState,
    profile,
    market: gpuMarketReference(gpu),
  });
  const sampleRows = BENCHMARKS.filter((row) =>
    (row.gpuId === gpu.id || row.gpu === gpu.name)
    && String(row.modelName || "").toLowerCase() === String(model.name || "").toLowerCase());
  const sampleCount = sampleRows.length;
  const expectedErrorPct = sampleCount >= 3 ? 15 : sampleCount ? 25 : 40;
  const confidence = sampleCount >= 3 ? "높음" : sampleCount ? "중간" : "낮음";
  const capacity = Math.max(1, Math.floor(base.capacityRps * Math.max(1, Number(studioState.siTargetSeconds || 8))));
  const failoverCapacity = Math.max(0, Math.floor(base.failoverRps * Math.max(1, Number(studioState.siTargetSeconds || 8))));
  return {
    ...profile,
    ...base,
    speed: base.singleStreamSpeed,
    targetTokS: base.tokenDemand,
    capacity,
    failoverCapacity,
    sampleCount,
    confidence,
    expectedErrorPct,
    evidenceKind: sampleCount ? "external" : "estimate",
    confidenceReason: sampleCount
      ? (uiLanguage === "en"
        ? `Used ${sampleCount} source-linked external reference${sampleCount === 1 ? "" : "s"} for the same GPU and model.`
        : `동일 GPU·모델의 출처 연결 외부 참고값 ${sampleCount}건을 사용했습니다.`)
      : (uiLanguage === "en"
        ? "No measurements match the same GPU, model, and runtime; this estimate uses VRAM and memory bandwidth."
        : "동일 GPU·모델·런타임 실측 자료가 없어 VRAM과 메모리 대역폭으로 계산했습니다."),
    speedLow: base.singleStreamSpeed * (1 - expectedErrorPct / 100),
    speedHigh: base.singleStreamSpeed * (1 + expectedErrorPct / 100),
    placement: `${model.name} · ${profile.id === "economy" ? "tensor parallel" : "replica + tensor parallel"}`,
  };
}

function calculateSiSizing() {
  const model = siSelectedModel();
  const gpus = siEnterpriseGpus();
  const profiles = [
    { id: "economy", ko: "경제형", en: "Economy", memoryMargin: 1.1, capacityMargin: 1.0, gpuIndex: 0 },
    { id: "recommended", ko: "권장형", en: "Recommended", memoryMargin: 1.25, capacityMargin: 1.2, gpuIndex: 2 },
    { id: "scalable", ko: "확장형", en: "Scalable", memoryMargin: 1.4, capacityMargin: 1.45, gpuIndex: 4 },
  ];
  const baseCandidates = gpus.map((gpu) => siSizingPlan(gpu, model, profiles[1]));
  const plans = window.AIHardwareInfraSizing.choosePlans(baseCandidates, profiles);
  return { model, plans };
}

function applySimpleSizingModelPreset() {
  const selected = siRecommendedModel();
  if (selected) studioState.modelKey = modelKey(selected);
}

function applySimpleSizingPreset() {
  applySimpleSizingModelPreset();
  const users = Math.max(1, Number(studioState.siUserPreset) || 10);
  studioState.siTotalUsers = users;
  studioState.siConcurrency = Math.max(1, Math.ceil(users * (users <= 10 ? .2 : users <= 50 ? .12 : .1)));
  studioState.siQps = Math.max(.1, Number((studioState.siConcurrency / 8).toFixed(2)));
  studioState.siAvailability = users >= 50 ? "ha" : "single";
  studioState.siGrowthPct = users >= 100 ? 30 : 20;
  studioState.siDevProd = users >= 50;
  studioState.siBaselineProfile = "";
  if (!(Number(studioState.siBudgetKrw) > 0)) {
    studioState.siSelectedPlan = {
      economy: "economy",
      balanced: "recommended",
      quality: "scalable",
    }[studioState.siQualityPreset] || "recommended";
  }
}

function siReadinessChecks(model, plans) {
  const en = uiLanguage === "en";
  const selected = plans.find((plan) => plan.id === studioState.siSelectedPlan) || plans[1] || plans[0];
  const market = selected ? studioMarket(selected.gpu.id) : null;
  const checks = [
    {
      id: "service",
      controlId: "siServiceType",
      ok: Boolean(studioState.siServiceType && model),
      label: en ? "Service and model" : "서비스·모델",
      message: en ? "Choose the AI service and primary model." : "만들 서비스와 주 모델을 선택하세요.",
    },
    {
      id: "users",
      controlId: "siTotalUsers",
      ok: Number(studioState.siTotalUsers) >= 1,
      label: en ? "User scale" : "사용자 규모",
      message: en ? "Enter at least one user." : "전체 사용자를 1명 이상 입력하세요.",
    },
    {
      id: "concurrency",
      controlId: "siConcurrency",
      ok: Number(studioState.siConcurrency) >= 1 && Number(studioState.siConcurrency) <= Number(studioState.siTotalUsers),
      label: en ? "Concurrent requests" : "동시 요청",
      message: en ? "Concurrency must be between 1 and total users." : "동시 요청은 1 이상이며 전체 사용자보다 작아야 합니다.",
    },
    {
      id: "traffic",
      controlId: "siQps",
      ok: Number(studioState.siQps) > 0,
      label: "QPS",
      message: en ? "Enter a positive request rate." : "초당 요청 수를 0보다 크게 입력하세요.",
    },
    {
      id: "context",
      controlId: "siMaxInputTokens",
      ok: Number(studioState.siInputTokens) >= 128 && Number(studioState.siMaxInputTokens) >= Number(studioState.siInputTokens),
      label: en ? "Token lengths" : "토큰 길이",
      message: en ? "Maximum input must be at least the average input." : "최대 입력 토큰은 평균 입력 토큰 이상이어야 합니다.",
    },
    {
      id: "sla",
      controlId: "siLatencyP95",
      ok: Number(studioState.siTtftP95) > 0
        && Number(studioState.siTargetSeconds) >= Number(studioState.siTtftP95)
        && Number(studioState.siLatencyP95) >= Number(studioState.siTargetSeconds),
      label: "SLA",
      message: en ? "Use TTFT ≤ target response ≤ total p95 latency." : "TTFT ≤ 목표 응답시간 ≤ 전체 지연 p95 순서로 입력하세요.",
    },
    {
      id: "price",
      controlId: "siSupplierQuoteNo",
      ok: Boolean(market && !market.estimated) || Boolean(String(studioState.siSupplierQuoteNo || "").trim()),
      label: en ? "Price evidence" : "가격 근거",
      message: en ? "Public Korean pricing is unavailable; add a supplier quote before final approval." : "공개 국내 시세가 없으므로 최종 승인 전 공급사 견적번호를 입력하세요.",
      advisory: true,
    },
    {
      id: "evidence",
      ok: Boolean(model?.sourceUrl && selected?.gpu?.sourceUrl),
      label: en ? "Specification sources" : "사양 출처",
      message: en ? "Link both model and GPU specification sources." : "모델과 GPU 사양 출처를 모두 연결하세요.",
      advisory: true,
    },
  ];
  return checks;
}

function siPlanFit(plan) {
  const en = uiLanguage === "en";
  const physicalVram = Number(plan.gpu.gpuUsableMemoryGb || plan.gpu.vram || 0) * plan.gpuCount;
  const budget = Math.max(0, Number(studioState.siBudgetKrw) || 0);
  const checks = [
    {
      ok: physicalVram >= plan.requiredGb,
      label: en ? "Model memory" : "모델 메모리",
    },
    {
      ok: plan.capacity >= Number(studioState.siConcurrency),
      label: en ? "Normal capacity" : "정상 처리량",
    },
    {
      ok: studioState.siAvailability === "single"
        || plan.failoverCapacity >= Math.max(1, Math.ceil(Number(studioState.siConcurrency) * 0.7)),
      label: en ? "Failover capacity" : "장애 처리량",
    },
    {
      ok: budget <= 0 || plan.purchaseKrw <= budget,
      label: en ? "Hardware budget" : "하드웨어 예산",
    },
  ];
  return {
    checks,
    passed: checks.filter((check) => check.ok).length,
    total: checks.length,
    valid: checks.every((check) => check.ok),
  };
}

function renderV49Readiness(model, plans) {
  const en = uiLanguage === "en";
  const checks = siReadinessChecks(model, plans);
  const passed = checks.filter((check) => check.ok).length;
  const required = checks.filter((check) => !check.advisory);
  const requiredPassed = required.filter((check) => check.ok).length;
  const rawScore = Math.round(passed / Math.max(1, checks.length) * 100);
  const selected = plans.find((plan) => plan.id === studioState.siSelectedPlan) || plans[1] || plans[0];
  const hasPriceEvidence = checks.find((check) => check.id === "price")?.ok;
  const scoreCap = Math.min(
    hasPriceEvidence ? 100 : 60,
    selected?.sampleCount ? 100 : 65,
  );
  const score = Math.min(rawScore, scoreCap);
  const status = requiredPassed === required.length
    ? (en ? "Ready to compare" : "구성안 비교 가능")
    : (en ? "Input review needed" : "입력값 확인 필요");
  return `<section class="si-readiness-panel ${requiredPassed === required.length ? "is-ready" : "is-warning"}" aria-labelledby="siReadinessTitle">
    <div class="si-readiness-head">
      <div><span class="section-kicker">v5.4 ESTIMATE READINESS</span><h3 id="siReadinessTitle">${en ? "Draft readiness" : "초안 준비도"} ${score}%</h3><p>${status} · ${passed}/${checks.length} ${en ? "checks complete" : "개 항목 확인"}${score < rawScore ? ` · ${en ? "capped by missing price or benchmark evidence" : "가격·실측 근거 부족으로 상한 적용"}` : ""}</p></div>
      <div class="si-readiness-progress" role="progressbar" aria-label="${en ? "Estimate readiness" : "견적 준비도"}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${score}"><span style="width:${score}%"></span></div>
    </div>
    <nav class="si-workflow-nav" aria-label="${en ? "Estimate workflow" : "견적 작업 순서"}">
      <button type="button" data-si-jump="siRequirements"><b>1</b>${en ? "Requirements" : "요구사항 입력"}</button>
      <button type="button" data-si-jump="siPlans"><b>2</b>${en ? "Compare options" : "3안 비교"}</button>
      <button type="button" data-si-jump="siDeliverables"><b>3</b>${en ? "Review outputs" : "산출물 확인"}</button>
    </nav>
    <details class="si-readiness-details" ${requiredPassed < required.length ? "open" : ""}><summary>${en ? "Show readiness checks" : "준비도 항목 보기"}</summary>
      <div class="si-readiness-checks">${checks.map((check) => `<button type="button" class="${check.ok ? "is-ok" : check.advisory ? "is-advisory" : "is-warning"}" ${check.controlId ? `data-si-focus="${check.controlId}"` : "disabled"}><span>${check.ok ? "✓" : check.advisory ? "i" : "!"}</span><strong>${platformEscape(check.label)}</strong><small>${check.ok ? (en ? "Checked" : "확인됨") : platformEscape(check.message)}</small></button>`).join("")}</div>
    </details>
    <div class="si-readiness-actions"><button type="button" class="ghost-button" data-si-save-draft>${en ? "Save browser draft" : "브라우저 초안 저장"}</button><button type="button" class="ghost-button" data-si-share>${en ? "Copy estimate link" : "견적 링크 복사"}</button></div>
  </section>`;
}

function applySiInputValidation(model, plans) {
  siReadinessChecks(model, plans).forEach((check) => {
    if (!check.controlId) return;
    const control = document.getElementById(check.controlId);
    const label = control?.closest("label");
    if (!control || !label) return;
    label.classList.toggle("has-input-warning", !check.ok && !check.advisory);
    if (!check.ok && !check.advisory) {
      control.setAttribute("aria-invalid", "true");
      const warning = document.createElement("small");
      warning.className = "si-field-warning";
      warning.textContent = check.message;
      label.append(warning);
    } else {
      control.removeAttribute("aria-invalid");
    }
  });
}

function renderSelectedPlanDetail(model, plans) {
  const en = uiLanguage === "en";
  const plan = plans.find((item) => item.id === studioState.siSelectedPlan)
    || plans.find((item) => item.id === "recommended")
    || plans[0];
  if (!plan) return "";
  const market = studioMarket(plan.gpu.id);
  const unitKrw = Number(market?.lowestKrw || 0);
  // Laptop GPUs and unified-memory systems (Mac Studio, DGX Spark, Ryzen AI
  // Max+ mini-PCs) aren't sold as bare cards -- a recorded market price for
  // one is a full system's retail price. Never scale that by gpuCount: doing
  // so would silently price N systems as if they were N GPU cards.
  const gpuSubtotal = unitKrw * ((plan.gpu.formFactor === "laptop" || plan.gpu.formFactor === "integrated") ? 1 : plan.gpuCount);
  const baseInfra = Math.max(0, plan.purchaseKrw - gpuSubtotal);
  const parts = autoComponentRecommendation(plan);
  const label = en ? plan.en : plan.ko;
  const economy = plans.find((item) => item.id === "economy") || plans[0];
  const fit = siPlanFit(plan);
  const costDelta = economy?.purchaseKrw
    ? Math.round((plan.purchaseKrw - economy.purchaseKrw) / economy.purchaseKrw * 100)
    : 0;
  const capacityHeadroom = Math.max(0, plan.capacity - Number(studioState.siConcurrency));
  const priceState = window.AIHardwareUI?.priceState({
    marketPrice: market?.estimated ? 0 : market?.lowestKrw,
    launchPrice: market?.priceKind === "launch-reference" ? market?.lowestKrw : 0,
    updatedAt: market?.estimated ? "" : market?.updatedAt,
  }) || {
    kind: market?.estimated ? (market?.priceKind === "launch-reference" ? "launch" : "quote") : "market",
    label: market?.estimated
      ? (market?.priceKind === "launch-reference"
        ? (en ? "Launch-price reference" : "출시 가격 참고")
        : (en ? "No public Korean market price" : "공개 국내 시세 없음"))
      : (en ? "Korean market price" : "국내 시세"),
    note: market?.estimated ? (en ? "Enter a supplier quote or your own price" : "공급사 견적 또는 직접 입력으로 계산 가능") : market?.updatedAt,
  };
  const evidenceState = window.AIHardwareEvidence?.sourceStatus(plan.gpu) || {
    id: plan.gpu.sourceUrl ? "external" : "missing",
    ko: plan.gpu.sourceUrl ? "외부 사양 출처" : "모델별 공식 출처 필요",
    en: plan.gpu.sourceUrl ? "External specification source" : "Model-specific source needed",
  };
  const sourceLinks = [
    market?.sourceUrl ? [en ? "GPU price/spec source" : "GPU 가격·사양 출처", market.sourceUrl] : null,
    model.sourceUrl ? [en ? "Model source" : "모델 출처", model.sourceUrl] : null,
    [en ? "AWS calculator" : "AWS 요금 계산기", "https://calculator.aws/"],
    [en ? "Azure calculator" : "Azure 요금 계산기", "https://azure.microsoft.com/pricing/calculator/"],
    [en ? "Google Cloud calculator" : "Google Cloud 요금 계산기", "https://cloud.google.com/products/calculator"],
  ].filter(Boolean);
  return `<section class="si-plan-detail" aria-live="polite">
    <div class="si-plan-detail-head"><div><span class="section-kicker">${en ? "SELECTED OPTION" : "선택한 구성안"}</span><h3>${label} · ${platformEscape(shortGpuName(plan.gpu.name))} × ${plan.gpuCount}</h3><p>${en ? "Click another option above to compare its sizing assumptions and cost evidence." : "위의 다른 구성안을 누르면 산정 조건과 비용 근거가 바로 바뀝니다."}</p></div><strong>${studioMoney(plan.threeYearTcoKrw)}<small>${en ? "3-year TCO estimate" : "3년 TCO 추정"}</small></strong></div>
    <div class="si-plan-tradeoffs">
      <span><small>${en ? "Current-condition fit" : "현재 조건 충족"}</small><strong class="${fit.valid ? "is-good" : "is-risk"}">${fit.passed}/${fit.total}</strong></span>
      <span><small>${en ? "Capacity headroom" : "동시 처리 여유"}</small><strong>+${capacityHeadroom}${en ? " requests" : "명"}</strong></span>
      <span><small>${en ? "Cost vs economy" : "경제형 대비 도입비"}</small><strong>${costDelta >= 0 ? "+" : ""}${costDelta}%</strong></span>
      <span><small>${en ? "Evidence samples" : "동일 조건 표본"}</small><strong>n=${plan.sampleCount}</strong></span>
    </div>
    <div class="si-plan-detail-grid">
      <article><h4>${en ? "Why this option" : "이 구성안의 특징"}</h4><ul>
        <li>${plan.id === "economy" ? (en ? "Minimizes initial cost with a smaller safety margin." : "안전 여유를 줄여 초기 도입비를 우선합니다.") : plan.id === "scalable" ? (en ? "Keeps more capacity for traffic growth and expansion." : "트래픽 증가와 향후 증설을 위한 여유를 크게 확보합니다.") : (en ? "Balances availability, performance, and growth reserve." : "가용성·성능·성장 여유를 균형 있게 반영합니다.")}</li>
        <li>${en ? `${plan.nodes} server(s), ${plan.gpuPerServer} GPU/server, estimated capacity ${plan.capacity}.` : `${plan.nodes}대 서버, 서버당 GPU ${plan.gpuPerServer}개, 예상 동시 응답 ${plan.capacity}명입니다.`}</li>
        <li>${en ? `Failover capacity is ${plan.failoverCapacity}; PoC verification is required.` : `장애 시 잔여 처리량은 ${plan.failoverCapacity}이며 최종 확정 전 PoC가 필요합니다.`}</li>
      </ul></article>
      <article><h4>${en ? "When to avoid it" : "이럴 때는 피하세요"}</h4><ul>
        <li>${plan.id === "economy" ? (en ? "Avoid when failover is mandatory or traffic growth is uncertain." : "무중단 장애 대응이 필수이거나 트래픽 증가폭을 모르면 피하세요.") : plan.id === "scalable" ? (en ? "Avoid when near-term utilization is low and the budget is fixed." : "단기 사용률이 낮고 예산 상한이 확실하면 과투자가 될 수 있습니다.") : (en ? "Review a smaller option when the budget is a hard cap and waiting is acceptable." : "예산 상한이 절대적이고 일부 대기가 가능하면 경제형도 검토하세요.")}</li>
        <li>${en ? `Next action: validate ${plan.batchSize || 1} batch and ${Number(plan.requestedRps || studioState.siQps).toFixed(2)} RPS with a representative PoC.` : `다음 행동: 대표 PoC에서 배치 ${plan.batchSize || 1}와 ${Number(plan.requestedRps || studioState.siQps).toFixed(2)} RPS를 검증하세요.`}</li>
        <li>${en ? "Savings lever: reduce model size, context length, or reserve capacity before removing availability safeguards." : "비용 절감은 가용성 안전장치보다 모델 크기·컨텍스트·증설 여유를 먼저 낮추세요."}</li>
      </ul></article>
      <article><h4>${en ? "Automatically selected infrastructure" : "자동 선택 인프라"}</h4><dl><div><dt>CPU</dt><dd>${parts.cpu} · ${plan.cpuCores}${en ? " cores+" : "코어+"}</dd></div><div><dt>RAM</dt><dd>${parts.memory}</dd></div><div><dt>${en ? "Storage" : "스토리지"}</dt><dd>${parts.storage}</dd></div><div><dt>${en ? "Network" : "네트워크"}</dt><dd>${parts.nic}</dd></div><div><dt>${en ? "Server / power" : "서버·전원"}</dt><dd>${parts.server} · ${parts.power}</dd></div></dl></article>
      <article><h4>${en ? "Operating assumptions" : "상세 운영 가정"}</h4><dl><div><dt>${en ? "Production / reserve / non-prod" : "운영 / 예비 / 비운영"}</dt><dd>${plan.productionGpuCount ?? plan.gpuCount} / ${plan.reserveGpuCount ?? 0} / ${plan.nonProdGpuCount ?? 0}</dd></div><div><dt>${en ? "Demand / safe capacity" : "요청률 / 안전 처리량"}</dt><dd>${Number(plan.requestedRps || studioState.siQps).toFixed(2)} / ${Number(plan.capacityRps || 0).toFixed(2)} RPS</dd></div><div><dt>${en ? "Batch / queue" : "배치 / 대기열"}</dt><dd>${plan.batchSize || 1} · ${en ? (plan.queueState || "healthy") : ({ healthy: "안정", watch: "주의", critical: "위험" }[plan.queueState] || "안정")}</dd></div><div><dt>${en ? "Expected throughput" : "예상 처리 속도"}</dt><dd>${plan.speedLow.toFixed(0)}–${plan.speedHigh.toFixed(0)} tok/s · ±${plan.expectedErrorPct}%</dd></div></dl></article>
      <article><h4>${en ? "Cost and evidence basis" : "비용·근거 산정 기준"}</h4><dl><div><dt>${en ? "GPU specification source" : "GPU 사양 출처"}</dt><dd><span class="evidence-status is-${platformEscape(evidenceState.id)}">${platformEscape(en ? evidenceState.en : evidenceState.ko)}</span></dd></div><div><dt>${en ? "GPU price status" : "GPU 가격 상태"}</dt><dd class="price-state is-${platformEscape(priceState.kind)}">${platformEscape(priceState.label)}<small>${platformEscape(priceState.note || "")}</small></dd></div><div><dt>${en ? "Planning unit assumption" : "계산용 GPU 단가 가정"}</dt><dd>${unitKrw ? studioMoney(unitKrw) : (en ? "Quote required" : "견적 문의 필요")}</dd></div><div><dt>${en ? "GPU subtotal" : "GPU 소계"}</dt><dd>${studioMoney(gpuSubtotal)}</dd></div><div><dt>${en ? "Server/base infrastructure" : "서버·기반 인프라 가정"}</dt><dd>${studioMoney(baseInfra)}</dd></div><div><dt>${en ? "Annual energy" : "연 전력비"}</dt><dd>${studioMoney(plan.annualEnergyKrw)}</dd></div></dl><p>${en ? "A manually entered supplier quote should override this planning assumption." : "사용자가 입력한 공급사 견적이 있으면 이 계획 가정보다 우선 적용해야 합니다."}</p></article>
    </div>
    <div class="si-source-links"><strong>${en ? "Verify prices and evidence" : "가격·근거 확인"}</strong>${sourceLinks.map(([name,url]) => `<a href="${platformEscape(url)}" target="_blank" rel="noopener noreferrer">${platformEscape(name)} ↗</a>`).join("")}</div>
    <p class="si-price-disclaimer">${en ? "These values are planning assumptions, not a vendor quote. Taxes, licenses, installation, support, exchange-rate changes, and volume discounts may change the final price." : "표시 금액은 벤더 확정 견적이 아닌 계획용 참고값입니다. 세금·라이선스·설치·지원·환율·수량 할인에 따라 최종 금액이 달라질 수 있습니다."}</p>
  </section>`;
}

function autoComponentRecommendation(plan) {
  const en = uiLanguage === "en";
  const cpu = plan.cpuCores <= 24 ? "Ryzen 9 / Core Ultra 9" : plan.cpuCores <= 64 ? "Threadripper Pro / Xeon W" : "AMD EPYC / Xeon Scalable";
  const server = plan.gpuCount <= 1 ? (en ? "AI workstation" : "AI 워크스테이션") : plan.gpuPerServer <= 4 ? (en ? "4U GPU server" : "4U GPU 서버") : (en ? "HGX 8-GPU server" : "HGX 8-GPU 서버");
  const memory = `${Math.max(64, plan.ramGb)}GB ${plan.gpuCount > 1 ? "ECC RDIMM" : "DDR5"}`;
  const storage = `Enterprise NVMe ${plan.storageTb}TB+`;
  const nic = plan.nodes > 1 ? plan.network : plan.gpuCount > 1 ? "25/100GbE" : "2.5/10GbE";
  const power = plan.powerW >= 3000 ? (en ? "Redundant PSU + three-phase power review" : "이중화 PSU + 3상 전원 검토") : `${Math.max(850, Math.ceil(plan.powerW / 100) * 100)}W ${en ? "power supply" : "급 전원"}`;
  return { cpu, server, memory, storage, nic, power };
}

const SI_BOM_TYPES = [
  ["cpu", "siBomCpuId", "siBomCpuQty", "CPU"],
  ["motherboard", "siBomMotherboardId", "siBomMotherboardQty", "Motherboard"],
  ["memory", "siBomMemoryId", "siBomMemoryQty", "RAM"],
  ["storage", "siBomStorageId", "siBomStorageQty", "Storage"],
  ["nic", "siBomNicId", "siBomNicQty", "Network"],
  ["psu", "siBomPsuId", "siBomPsuQty", "Power"],
  ["ups", "siBomUpsId", "siBomUpsQty", "UPS"],
  ["case", "siBomCaseId", "siBomCaseQty", "Server / case"],
];

function siBomAutoSelection(plan) {
  const perNodeCores = Math.ceil(plan.cpuCores / Math.max(1, plan.nodes));
  const perNodeRam = Math.ceil(plan.ramGb / Math.max(1, plan.nodes));
  const perNodePower = Math.ceil(plan.powerW / Math.max(1, plan.nodes));
  const cpu = SYSTEM_PART_CATALOG.cpu.find((item) => item.cores >= perNodeCores) || SYSTEM_PART_CATALOG.cpu.at(-1);
  const motherboard = SYSTEM_PART_CATALOG.motherboard.find((item) => item.socket === cpu.socket) || SYSTEM_PART_CATALOG.motherboard.at(-1);
  const memory = SYSTEM_PART_CATALOG.memory.find((item) => item.capacityGb >= perNodeRam) || SYSTEM_PART_CATALOG.memory.at(-1);
  const storage = SYSTEM_PART_CATALOG.storage.find((item) => item.capacityTb >= plan.storageTb) || SYSTEM_PART_CATALOG.storage.at(-1);
  const targetNic = Number.parseInt(plan.network, 10) || 25;
  const nic = SYSTEM_PART_CATALOG.nic.find((item) => item.speedGbps >= targetNic) || SYSTEM_PART_CATALOG.nic.at(-1);
  // validateSiBom() requires psu.watts*qty >= plan.powerW * 1.15 (15% headroom) and
  // ups.capacityVa*qty >= plan.powerW * 1.2 (20% headroom). The item lookup and the
  // quantity formula below both need to target those same padded numbers -- picking
  // (or sizing) to the raw perNodePower left the PSU check red even after "auto-fix",
  // because a single 3200W unit covers a 3000W node but not the 3450W (3000*1.15)
  // the validator actually requires.
  const perNodePsuTarget = perNodePower * 1.15;
  const psu = SYSTEM_PART_CATALOG.psu.find((item) => item.watts >= perNodePsuTarget) || SYSTEM_PART_CATALOG.psu.at(-1);
  const ups = SYSTEM_PART_CATALOG.ups.find((item) => item.capacityVa >= perNodePower * 1.2) || SYSTEM_PART_CATALOG.ups.at(-1);
  const chassis = SYSTEM_PART_CATALOG.case.find((item) => plan.gpuPerServer <= 4 ? item.id === "rack-4u-4gpu" : item.id === "rack-8gpu") || SYSTEM_PART_CATALOG.case.at(-1);
  return {
    siBomCpuId: cpu.id, siBomCpuQty: Math.max(1, plan.nodes * plan.cpuSockets),
    siBomMotherboardId: motherboard.id, siBomMotherboardQty: Math.max(1, plan.nodes),
    siBomMemoryId: memory.id, siBomMemoryQty: Math.max(1, plan.nodes),
    siBomStorageId: storage.id, siBomStorageQty: Math.max(1, Math.ceil(plan.storageTb / storage.capacityTb)),
    siBomNicId: nic.id, siBomNicQty: Math.max(1, plan.nodes),
    siBomPsuId: psu.id, siBomPsuQty: Math.max(1, plan.nodes * Math.ceil(perNodePsuTarget / psu.watts)),
    siBomUpsId: ups.id, siBomUpsQty: Math.max(1, Math.ceil(plan.powerW * 1.2 / ups.capacityVa)),
    siBomCaseId: chassis.id, siBomCaseQty: Math.max(1, plan.nodes),
  };
}

function ensureSiBomSelection(plan) {
  if (!studioState.siBomCpuId) Object.assign(studioState, siBomAutoSelection(plan));
}

function siEditableBom(plan) {
  ensureSiBomSelection(plan);
  const rows = SI_BOM_TYPES.map(([type, idKey, qtyKey, label]) => {
    const item = SYSTEM_PART_CATALOG[type].find((part) => part.id === studioState[idKey]) || SYSTEM_PART_CATALOG[type][0];
    const quantity = Math.max(1, Math.round(Number(studioState[qtyKey]) || 1));
    return { type, idKey, qtyKey, label, item, quantity, subtotal: item.priceKrw * quantity };
  });
  const partsTotal = rows.reduce((sum, row) => sum + row.subtotal, 0);
  const gpuUnitKrw = Number(studioMarket(plan.gpu.id)?.lowestKrw || 0);
  const gpuTotal = gpuUnitKrw * ((plan.gpu.formFactor === "laptop" || plan.gpu.formFactor === "integrated") ? 1 : plan.gpuCount);
  const extra = Math.max(0, Number(studioState.siBomExtraKrw) || 0);
  return { rows, partsTotal, gpuUnitKrw, gpuTotal, extra, total: partsTotal + gpuTotal + extra };
}

function renderEditableSiBom(plan) {
  const en = uiLanguage === "en";
  const bom = siEditableBom(plan);
  return `<section class="si-editable-bom">
    <div class="si-version-head"><div><span class="section-kicker">${en ? "EDITABLE BOM" : "편집용 부품 견적"}</span><h3>${en ? "Select components and quantities" : "CPU·RAM·전원 등을 직접 선택하세요"}</h3><p>${en ? "Reference prices are planning assumptions and can be adjusted with an extra-cost line." : "표시 가격은 계획용 참고값이며 설치·라이선스 등 추가 비용을 별도로 더할 수 있습니다."}</p></div><button type="button" class="ghost-button" data-si-bom-auto>${en ? "Reset to auto selection" : "자동 추천으로 초기화"}</button></div>
    <div class="si-bom-editor">${bom.rows.map((row) => `<label><span>${en ? row.label : ({ Storage: "스토리지", Network: "네트워크", Power: "파워", "Server / case": "서버·케이스" }[row.label] || row.label)}</span><select id="${row.idKey}">${SYSTEM_PART_CATALOG[row.type].map((item) => `<option value="${item.id}" ${item.id === row.item.id ? "selected" : ""}>${platformEscape(item.name)} · ${studioMoney(item.priceKrw)}</option>`).join("")}</select><span class="si-bom-qty"><input id="${row.qtyKey}" type="number" min="1" max="128" value="${row.quantity}" aria-label="${platformEscape(row.label)} ${en ? "quantity" : "수량"}"><b>× ${row.quantity} = ${studioMoney(row.subtotal)}</b></span></label>`).join("")}
      <label class="si-bom-extra"><span>${en ? "Installation · license · support (USD)" : "설치·라이선스·지원 추가 비용 (원)"}</span><input id="siBomExtraKrw" type="number" min="0" step="${en ? 100 : 10000}" value="${studioDisplayFromKrw(bom.extra)}"><small>${en ? "Enter a negotiated or separately quoted amount." : "협의 금액이나 별도 견적 금액을 입력하세요."}</small></label>
    </div>
    <div class="si-bom-summary">
      <span>${en ? "Selected parts" : "선택 부품"}<strong>${studioMoney(bom.partsTotal)}</strong></span>
      <span>GPU ${plan.gpuCount} × ${bom.gpuUnitKrw ? studioMoney(bom.gpuUnitKrw) : (en ? "quote required" : "견적 필요")}<strong>${studioMoney(bom.gpuTotal)}</strong></span>
      <span>${en ? "Extra cost" : "추가 비용"}<strong>${studioMoney(bom.extra)}</strong></span>
      <span class="is-total">${en ? "Editable estimate total" : "편집 견적 합계"}<strong>${studioMoney(bom.total)}</strong></span>
    </div>
    <p class="studio-form-note">${en ? "Component prices are catalog references, not live vendor quotes. Confirm stock, tax, installation, and support before proposal submission." : "부품 가격은 실시간 판매가가 아닌 카탈로그 참고값입니다. 제안 전 재고·세금·설치·지원 비용을 확인하세요."}</p>
  </section>`;
}

function validateSiBom(plan, bom = siEditableBom(plan)) {
  const byType = Object.fromEntries(bom.rows.map((row) => [row.type, row]));
  const cpu = byType.cpu;
  const board = byType.motherboard;
  const memory = byType.memory;
  const storage = byType.storage;
  const nic = byType.nic;
  const psu = byType.psu;
  const ups = byType.ups;
  const chassis = byType.case;
  const requiredNic = Number.parseInt(plan.network, 10) || 25;
  const chassisGpuLimit = chassis.item.id === "rack-8gpu" ? 8 : chassis.item.id === "rack-4u-4gpu" ? 4 : Math.max(1, Number(chassis.item.slots) || 1);
  const checks = [
    { id: "socket", ok: cpu.item.socket === board.item.socket, ko: "CPU·메인보드 소켓", en: "CPU / motherboard socket", detail: `${cpu.item.socket} / ${board.item.socket}` },
    { id: "cpu", ok: cpu.item.cores * cpu.quantity >= plan.cpuCores, ko: "CPU 코어", en: "CPU cores", detail: `${cpu.item.cores * cpu.quantity} / ${plan.cpuCores}+` },
    { id: "memory", ok: memory.item.capacityGb * memory.quantity >= plan.ramGb, ko: "RAM 용량", en: "RAM capacity", detail: `${memory.item.capacityGb * memory.quantity}GB / ${plan.ramGb}GB+` },
    { id: "storage", ok: storage.item.capacityTb * storage.quantity >= plan.storageTb, ko: "스토리지 용량", en: "Storage capacity", detail: `${(storage.item.capacityTb * storage.quantity).toFixed(1)}TB / ${plan.storageTb}TB+` },
    { id: "nic", ok: nic.item.speedGbps >= requiredNic && nic.quantity >= plan.nodes, ko: "NIC 속도·수량", en: "NIC speed / quantity", detail: `${nic.item.speedGbps}GbE × ${nic.quantity} / ${requiredNic}GbE × ${plan.nodes}` },
    { id: "psu", ok: psu.item.watts * psu.quantity >= plan.powerW * 1.15, ko: "파워 15% 여유", en: "PSU 15% headroom", detail: `${psu.item.watts * psu.quantity}W / ${Math.ceil(plan.powerW * 1.15)}W+` },
    { id: "ups", ok: ups.item.capacityVa * ups.quantity >= plan.powerW * 1.2, ko: "UPS 20% 여유", en: "UPS 20% headroom", detail: `${ups.item.capacityVa * ups.quantity}VA / ${Math.ceil(plan.powerW * 1.2)}VA+` },
    { id: "chassis", ok: chassis.quantity >= plan.nodes && chassisGpuLimit >= plan.gpuPerServer, ko: "서버·GPU 장착", en: "Server / GPU fit", detail: `${chassisGpuLimit} GPU × ${chassis.quantity} / ${plan.gpuPerServer} GPU × ${plan.nodes}` },
  ];
  return { checks, passed: checks.filter((item) => item.ok).length, total: checks.length, valid: checks.every((item) => item.ok) };
}

function calculateSiTopology(plan) {
  const switchSpeed = plan.nodes > 1 ? (plan.gpuCount > 8 ? 400 : 200) : 25;
  const switchCount = plan.nodes > 1 ? Math.max(2, Math.ceil(plan.nodes / 32)) : 1;
  const nicLinks = Math.max(plan.nodes, plan.nodes * (studioState.siSeparateNetworks ? 2 : 1));
  const optics = nicLinks * 2;
  const cables = nicLinks;
  const serverU = plan.gpuPerServer > 4 ? 8 : 4;
  const upsU = Math.max(2, Math.ceil(plan.powerW / 5000) * 3);
  const totalU = plan.nodes * serverU + switchCount + upsU + 4;
  const racks = Math.max(1, Math.ceil(totalU / Math.max(12, Number(studioState.siRackCapacityU) || 42)));
  const circuitW = Math.max(1000, Number(studioState.siPduCircuitKw) * 1000 || 8000);
  const pduCircuits = Math.max(2, Math.ceil(plan.powerW * 1.2 / circuitW) * 2);
  const coolingKw = plan.powerW / 1000 * Math.max(1.05, Number(studioState.siCoolingPue) || 1.4);
  const accessoryCost = switchCount * (switchSpeed >= 400 ? 35000000 : switchSpeed >= 200 ? 18000000 : 1800000)
    + optics * (switchSpeed >= 200 ? 1200000 : 180000)
    + cables * 250000 + racks * 4000000 + pduCircuits * 1500000;
  return { switchSpeed, switchCount, nicLinks, optics, cables, serverU, totalU, racks, pduCircuits, coolingKw, accessoryCost };
}

function calculateSiCommercial(plan, bom = siEditableBom(plan)) {
  const topology = calculateSiTopology(plan);
  const listPrice = bom.total + topology.accessoryCost;
  const discount = Math.round(listPrice * Math.max(0, Number(studioState.siDiscountPct) || 0) / 100);
  const netSupply = Math.max(0, listPrice - discount);
  const margin = Math.round(netSupply * Math.max(0, Number(studioState.siMarginPct) || 0) / 100);
  const beforeVat = netSupply + margin;
  const vat = Math.round(beforeVat * Math.max(0, Number(studioState.siVatPct) || 0) / 100);
  const finalPrice = beforeVat + vat;
  const validUntil = new Date(`${studioState.siPriceDate || new Date().toISOString().slice(0, 10)}T00:00:00`);
  validUntil.setDate(validUntil.getDate() + Math.max(1, Number(studioState.siQuoteValidDays) || 30));
  return { bom, topology, listPrice, discount, netSupply, margin, beforeVat, vat, finalPrice, validUntil: validUntil.toISOString().slice(0, 10) };
}

function autoSiBomEstimate(plan) {
  const selection = siBomAutoSelection(plan);
  const rows = SI_BOM_TYPES.map(([type, idKey, qtyKey, label]) => {
    const item = SYSTEM_PART_CATALOG[type].find((part) => part.id === selection[idKey]) || SYSTEM_PART_CATALOG[type][0];
    const quantity = selection[qtyKey];
    return { type, idKey, qtyKey, label, item, quantity, subtotal: item.priceKrw * quantity };
  });
  const partsTotal = rows.reduce((sum, row) => sum + row.subtotal, 0);
  const gpuUnitKrw = Number(studioMarket(plan.gpu.id)?.lowestKrw || 0);
  const gpuTotal = gpuUnitKrw * ((plan.gpu.formFactor === "laptop" || plan.gpu.formFactor === "integrated") ? 1 : plan.gpuCount);
  return { rows, partsTotal, gpuUnitKrw, gpuTotal, extra: 0, total: partsTotal + gpuTotal };
}

function renderV44V48Modules(model, plans) {
  const en = uiLanguage === "en";
  const selected = plans.find((plan) => plan.id === studioState.siSelectedPlan) || plans[1] || plans[0];
  const bom = siEditableBom(selected);
  const validation = validateSiBom(selected, bom);
  const commercial = calculateSiCommercial(selected, bom);
  const topology = commercial.topology;
  const statusLabels = {
    draft: en ? "Draft" : "초안",
    review: en ? "Under review" : "검토 중",
    approved: en ? "Approved" : "승인",
    rejected: en ? "Revision required" : "수정 필요",
  };
  const comparison = plans.map((plan) => {
    const autoBom = autoSiBomEstimate(plan);
    const pricing = calculateSiCommercial(plan, autoBom);
    const sla = calculateRealtimeSla(plan);
    return { plan, autoBom, pricing, sla, validation: validateSiBom(plan, autoBom) };
  });
  return `
    <section class="si-version-section si-v44"><div class="si-version-head"><div><span class="section-kicker">v4.4</span><h3>${en ? "BOM validation engine" : "BOM 호환성·용량 검증"}</h3><p>${en ? "Checks sockets, capacity, power headroom, network links, and server fit." : "소켓·용량·전력 여유·네트워크 링크·서버 장착 가능 여부를 검사합니다."}</p></div><div class="si-validation-score ${validation.valid ? "is-good" : "is-risk"}">${validation.passed}/${validation.total} ${en ? "passed" : "통과"}</div></div>
      <div class="si-validation-grid">${validation.checks.map((check) => `<article class="${check.ok ? "is-ok" : "is-warning"}"><strong>${check.ok ? "✓" : "!"} ${en ? check.en : check.ko}</strong><span>${platformEscape(check.detail)}</span></article>`).join("")}</div>
      <button type="button" class="ghost-button" data-si-bom-auto>${en ? "Auto-fix incompatible parts" : "호환 부품으로 자동 수정"}</button>
    </section>
    <section class="si-version-section si-v45"><div class="si-version-head"><div><span class="section-kicker">v4.5</span><h3>${en ? "Commercial pricing" : "실제 견적 가격 관리"}</h3><p>${en ? "Separates catalog assumptions from supplier quotes and calculates discount, margin, and VAT." : "카탈로그 참고가와 공급사 견적을 구분하고 할인·마진·부가세를 계산합니다."}</p></div><strong>${studioMoney(commercial.finalPrice)}</strong></div>
      <div class="studio-question-grid si-price-grid">
        <label><span>${en ? "Supplier" : "공급사"}</span><input id="siSupplierName" value="${platformEscape(studioState.siSupplierName)}" placeholder="${en ? "Vendor / distributor" : "벤더·총판·협력사"}"></label>
        <label><span>${en ? "Quote number" : "견적 번호"}</span><input id="siSupplierQuoteNo" value="${platformEscape(studioState.siSupplierQuoteNo)}"></label>
        <label><span>${en ? "Price basis" : "가격 기준"}</span><select id="siPriceBasis"><option value="catalog" ${studioState.siPriceBasis === "catalog" ? "selected" : ""}>${en ? "Catalog reference" : "카탈로그 참고가"}</option><option value="vendor" ${studioState.siPriceBasis === "vendor" ? "selected" : ""}>${en ? "Supplier quote" : "공급사 견적"}</option><option value="contract" ${studioState.siPriceBasis === "contract" ? "selected" : ""}>${en ? "Contract price" : "계약 단가"}</option></select></label>
        <label><span>${en ? "Price date" : "가격 확인일"}</span><input id="siPriceDate" type="date" value="${studioState.siPriceDate}"></label>
        <label><span>${en ? "Valid days" : "견적 유효일"}</span><input id="siQuoteValidDays" type="number" min="1" value="${studioState.siQuoteValidDays}"></label>
        <label><span>${en ? "Exchange rate (KRW/USD)" : "환율 (원/USD)"}</span><input id="siExchangeRate" type="number" min="1" value="${studioState.siExchangeRate}"></label>
        <label><span>${en ? "Discount (%)" : "할인율 (%)"}</span><input id="siDiscountPct" type="number" min="0" max="100" step="0.1" value="${studioState.siDiscountPct}"></label>
        <label><span>${en ? "Margin (%)" : "마진율 (%)"}</span><input id="siMarginPct" type="number" min="0" max="100" step="0.1" value="${studioState.siMarginPct}"></label>
        <label><span>${en ? "VAT (%)" : "부가세 (%)"}</span><input id="siVatPct" type="number" min="0" max="100" step="0.1" value="${studioState.siVatPct}"></label>
      </div>
      <div class="si-commercial-flow"><span>${en ? "Catalog + infrastructure" : "부품·기반시설"}<strong>${studioMoney(commercial.listPrice)}</strong></span><b>−</b><span>${en ? "Discount" : "할인"}<strong>${studioMoney(commercial.discount)}</strong></span><b>+</b><span>${en ? "Margin" : "마진"}<strong>${studioMoney(commercial.margin)}</strong></span><b>+</b><span>VAT<strong>${studioMoney(commercial.vat)}</strong></span><b>=</b><span class="is-total">${en ? "Proposal price" : "최종 제안가"}<strong>${studioMoney(commercial.finalPrice)}</strong></span></div>
      <p class="studio-form-note">${en ? "Valid until" : "유효기간"} ${commercial.validUntil} · ${en ? "Price links and supplier documents must be rechecked before approval." : "승인 전 가격 링크와 공급사 견적서를 다시 확인해야 합니다."}</p>
    </section>
    <section class="si-version-section si-v46"><div class="si-version-head"><div><span class="section-kicker">v4.6</span><h3>${en ? "Rack, network, and power topology" : "랙·네트워크·전원 구성"}</h3><p>${en ? "Adds shared infrastructure that is often omitted from GPU-only estimates." : "GPU 단독 견적에서 빠지기 쉬운 공통 기반시설을 계산합니다."}</p></div><strong>${studioMoney(topology.accessoryCost)}</strong></div>
      <div class="studio-question-grid si-compact-grid"><label class="studio-check"><input id="siSeparateNetworks" type="checkbox" ${studioState.siSeparateNetworks ? "checked" : ""}><span>${en ? "Separate service / storage / management" : "서비스·스토리지·관리망 분리"}</span></label><label><span>${en ? "Rack capacity (U)" : "랙 용량 (U)"}</span><input id="siRackCapacityU" type="number" min="12" max="52" value="${studioState.siRackCapacityU}"></label><label><span>${en ? "PDU circuit (kW)" : "PDU 회로 (kW)"}</span><input id="siPduCircuitKw" type="number" min="1" value="${studioState.siPduCircuitKw}"></label><label><span>PUE</span><input id="siCoolingPue" type="number" min="1.05" max="3" step="0.05" value="${studioState.siCoolingPue}"></label></div>
      <div class="si-topology-metrics"><span>${en ? "Racks" : "랙"}<strong>${topology.racks} × ${studioState.siRackCapacityU}U</strong><small>${topology.totalU}U ${en ? "used" : "사용"}</small></span><span>${en ? "Fabric" : "패브릭"}<strong>${topology.switchSpeed}GbE × ${topology.switchCount}</strong><small>${topology.nicLinks} links</small></span><span>${en ? "Optics / cables" : "광모듈·케이블"}<strong>${topology.optics} / ${topology.cables}</strong><small>${en ? "redundancy included" : "이중화 포함"}</small></span><span>PDU<strong>${topology.pduCircuits} ${en ? "circuits" : "회로"}</strong><small>N+1 A/B feed</small></span><span>${en ? "Cooling" : "냉각"}<strong>${topology.coolingKw.toFixed(1)}kW</strong><small>PUE ${studioState.siCoolingPue}</small></span></div>
      <div class="si-architecture"><span>${planLabel(selected, en)}</span><b>→</b><span>${selected.nodes}× GPU Server</span><b>→</b><span>${topology.switchCount}× ${topology.switchSpeed}GbE Switch</span><b>→</b><span>${topology.racks}× Rack · ${topology.pduCircuits} PDU</span><b>→</b><span>${topology.coolingKw.toFixed(1)}kW Cooling</span></div>
    </section>
    <section class="si-version-section si-v47"><div class="si-version-head"><div><span class="section-kicker">v4.7</span><h3>${en ? "Estimate review and approval" : "견적 버전·승인 흐름"}</h3></div><span class="si-quote-status is-${studioState.siQuoteStatus}">${statusLabels[studioState.siQuoteStatus] || studioState.siQuoteStatus}</span></div>
      <div class="studio-question-grid si-compact-grid"><label><span>${en ? "Owner" : "담당자"}</span><input id="siWorkflowOwner" value="${platformEscape(studioState.siContact)}"></label><label><span>${en ? "Reviewer" : "검토자"}</span><input id="siReviewer" value="${platformEscape(studioState.siReviewer)}"></label><label><span>${en ? "Approver" : "승인자"}</span><input id="siApprover" value="${platformEscape(studioState.siApprover)}"></label><label><span>${en ? "Status" : "상태"}</span><select id="siQuoteStatus">${Object.entries(statusLabels).map(([id,label]) => `<option value="${id}" ${studioState.siQuoteStatus === id ? "selected" : ""}>${label}</option>`).join("")}</select></label></div>
      <div class="si-approval-actions"><button type="button" class="ghost-button" data-si-status="draft">${en ? "Back to draft" : "초안으로"}</button><button type="button" class="ghost-button" data-si-status="review">${en ? "Request review" : "검토 요청"}</button><button type="button" class="primary-button" data-si-status="approved">${en ? "Approve estimate" : "견적 승인"}</button><button type="button" class="ghost-button" data-si-status="rejected">${en ? "Request revision" : "수정 요청"}</button></div>
      <p>${en ? "Version" : "버전"} v${studioState.siEstimateVersion} · ${en ? "approved at" : "승인 시각"} ${platformEscape(studioState.siApprovedAt || "—")} · ${en ? "customer and internal reports remain separated." : "고객 전달본과 내부 원가표를 분리해 관리합니다."}</p>
    </section>
    <section class="si-version-section si-v48"><div class="si-version-head"><div><span class="section-kicker">v4.8</span><h3>${en ? "Three-option decision table" : "최저비용·권장·확장 3안 비교"}</h3><p>${en ? "Compares cost, SLA, capacity, infrastructure, resilience, and evidence in one view." : "비용·SLA·용량·기반시설·장애 대응·근거를 한 화면에서 비교합니다."}</p></div></div>
      <div class="studio-table-wrap"><table class="studio-table si-v48-table"><thead><tr><th>${en ? "Metric" : "항목"}</th>${comparison.map(({plan}) => `<th>${en ? plan.en : plan.ko}</th>`).join("")}</tr></thead><tbody>
        <tr><td>${en ? "Proposal price" : "최종 제안가"}</td>${comparison.map(({pricing}) => `<td><strong>${studioMoney(pricing.finalPrice)}</strong></td>`).join("")}</tr>
        <tr><td>GPU / CPU / RAM</td>${comparison.map(({plan}) => `<td>${platformEscape(shortGpuName(plan.gpu.name))} × ${plan.gpuCount}<br>${plan.cpuCores}C · ${plan.ramGb}GB</td>`).join("")}</tr>
        <tr><td>${en ? "Capacity / QPS" : "동시 처리·QPS"}</td>${comparison.map(({plan,sla}) => `<td>${plan.capacity} · ${sla.capacityRps.toFixed(2)} RPS</td>`).join("")}</tr>
        <tr><td>TTFT / p95</td>${comparison.map(({sla}) => `<td>${sla.ttftP95.toFixed(2)}s / ${sla.latencyP95.toFixed(2)}s</td>`).join("")}</tr>
        <tr><td>${en ? "Rack / power / cooling" : "랙·전력·냉각"}</td>${comparison.map(({plan,pricing}) => `<td>${pricing.topology.racks} rack · ${plan.powerW.toLocaleString()}W · ${pricing.topology.coolingKw.toFixed(1)}kW</td>`).join("")}</tr>
        <tr><td>${en ? "Failover" : "장애 시 처리량"}</td>${comparison.map(({plan}) => `<td>${plan.failoverCapacity} / ${plan.capacity}</td>`).join("")}</tr>
        <tr><td>${en ? "BOM validation" : "BOM 검증"}</td>${comparison.map(({validation}) => `<td>${validation.passed}/${validation.total}</td>`).join("")}</tr>
        <tr><td>${en ? "Evidence" : "근거"}</td>${comparison.map(({plan}) => `<td>${en ? ({ 높음: "High", 중간: "Medium", 낮음: "Low" }[plan.confidence]) : plan.confidence} · n=${plan.sampleCount}</td>`).join("")}</tr>
        <tr><td>${en ? "Trade-off" : "선택·제외 이유"}</td><td>${en ? "Lowest initial cost; less reserve." : "초기비용 최소, 여유·확장성은 낮음"}</td><td>${en ? "Best balance for proposal baseline." : "제안 기준안으로 비용·가용성 균형"}</td><td>${en ? "Highest growth and resilience; highest cost." : "성장·장애 대응 우수, 비용은 가장 높음"}</td></tr>
      </tbody></table></div>
    </section>`;
}

function planLabel(plan, en) {
  return en ? plan.en : plan.ko;
}

function siModelSelectionEvidence(model, en) {
  const benchmark = model.qualityBenchmark;
  const params = Number(model.params || 0);
  const active = Number(model.active || params);
  const distilled = /distill/i.test(model.name);
  const isMoe = params > 0 && active > 0 && active < params * .75;
  const architecture = distilled
    ? (en ? `${params}B distilled/SFT checkpoint` : `${params}B 증류·SFT 체크포인트`)
    : isMoe
      ? (en ? `${params}B total · ${active}B active/token` : `총 ${params}B · 토큰당 ${active}B 활성`)
      : (en ? `${params}B dense model` : `${params}B dense 모델`);
  const context = Number(model.context || 0);
  const serviceFit = {
    rag: en
      ? `Primary RAG/chat model · up to ${context}K context in the catalog`
      : `RAG·챗봇 주 모델 · 카탈로그 기준 최대 ${context}K 컨텍스트`,
    ocr: en
      ? `${model.tags?.includes("vision") ? "Native vision input" : "Document reasoning"} for OCR/VLM workflows`
      : `OCR·VLM 워크플로용 ${model.tags?.includes("vision") ? "네이티브 비전 입력" : "문서 추론"}`,
    image: en
      ? "Primary orchestration/vision model; size the image generator separately in detailed settings"
      : "워크플로 조정·비전 주 모델이며 이미지 생성기는 상세 견적에서 별도 산정",
    video: en
      ? "Primary orchestration/vision model; size the video generator separately in detailed settings"
      : "워크플로 조정·비전 주 모델이며 영상 생성기는 상세 견적에서 별도 산정",
    voice: en
      ? "Primary conversation model; STT and TTS capacity require separate validation"
      : "대화 주 모델이며 STT·TTS 용량은 별도 검증 필요",
    avatar: en
      ? "Primary conversation/vision model; STT, TTS, and lip sync require separate validation"
      : "대화·비전 주 모델이며 STT·TTS·립싱크는 별도 검증 필요",
  }[studioState.siServiceType] || (en ? "Primary service model" : "서비스 주 모델");
  return {
    release: model.releaseDate
      ? (en ? `Released ${model.releaseDate} · current shortlist` : `${model.releaseDate} 공개 · 최신 후보군`)
      : (en ? "Release date needs verification" : "공개일 추가 검증 필요"),
    benchmark: benchmark?.label || (en ? "No public benchmark linked" : "연결된 공개 벤치마크 없음"),
    benchmarkUrl: benchmark?.sourceUrl || model.sourceUrl || "",
    architecture,
    serviceFit,
  };
}

function renderSimpleSizingWizard(model, plans) {
  const en = uiLanguage === "en";
  const step = Math.max(1, Math.min(4, Number(studioState.siWizardStep) || 1));
  const budget = Math.max(0, Number(studioState.siBudgetKrw) || 0);
  const budgetMatches = plans.filter((plan) => plan.purchaseKrw <= budget);
  const recommended = budget > 0
    ? budgetMatches[budgetMatches.length - 1] || plans[0]
    : plans.find((plan) => plan.id === "recommended") || plans[0];
  const parts = autoComponentRecommendation(recommended);
  const quality = [
    ["economy", en ? "Cost first" : "비용 우선", en ? "Smaller model and simpler server" : "가벼운 모델과 단순한 서버"],
    ["balanced", en ? "Balanced" : "균형 추천", en ? "Practical quality and response speed" : "품질과 응답 속도의 균형"],
    ["quality", en ? "Quality first" : "고품질", en ? "Larger model and more headroom" : "큰 모델과 넉넉한 확장 여유"],
  ];
  const scenarioNotes = {
    "ai-chatbot": [en ? "Text Q&A and customer support" : "텍스트 문의 응답·고객 상담", "Chat"],
    "internal-rag": [en ? "Search and answer from internal documents" : "사내 문서를 찾아 근거와 함께 답변", "RAG"],
    "document-vlm": [en ? "Read contracts, forms, and drawings" : "계약서·양식·도면을 읽고 분석", "VLM"],
    "private-assistant": [en ? "Private coding and office assistant" : "내부망 코딩·업무 보조", "Private"],
    "image-studio": [en ? "Generate marketing and product images" : "마케팅·상품 이미지 생성", "Image"],
    "video-studio": [en ? "Generate marketing and training video" : "홍보·교육용 영상 생성", "Video"],
    "voice-agent": [en ? "Realtime STT, conversation, and TTS" : "실시간 음성 인식·대화·합성", "Voice"],
    "avatar-chat": [en ? "Voice conversation with a lip-synced avatar" : "음성 대화와 립싱크 아바타", "Avatar"],
    "ontology-batch": [en ? "Batch-convert documents into a knowledge graph" : "문서를 일괄 지식그래프로 변환", "Batch"],
  };
  const priceCoverage = window.AIHardwareDataTrust?.priceCoverage(
    GPU_PRESETS.filter((gpu) => gpu.id !== "custom"),
    KOREAN_GPU_MARKET,
  );
  const evidenceCoverage = window.AIHardwareEvidence?.audit(GPU_PRESETS, KOREAN_GPU_MARKET);
  const nextEvidence = evidenceCoverage?.priority.find((row) => row.source.id !== "official");
  const selectedFit = siPlanFit(recommended);
  const selectedPrice = calculateSiCommercial(recommended).finalPrice;
  const modelEvidence = siModelSelectionEvidence(model, en);
  return `<section class="si-simple-wizard" data-step="${step}">
    <div class="si-wizard-head"><div><span class="section-kicker">${en ? "EASY ESTIMATE" : "간편 견적"}</span><h3>${en ? "Complete the estimate in three steps" : "3단계로 간편 견적을 완성하세요"}</h3><p>${en ? "Choose only a service, users, and priority. The model and every component are selected automatically." : "서비스·사용자 수·우선순위만 고르세요. 모델과 모든 장비는 자동으로 선택합니다."}</p></div><button type="button" class="ghost-button" data-si-input-mode="expert">${en ? "Open detailed settings" : "상세 설정 열기"}</button></div>
    <ol class="si-wizard-progress" aria-label="${en ? "Estimate progress" : "견적 진행 단계"}">${[
      [1, en ? "Service" : "서비스"],
      [2, en ? "Users" : "사용자"],
      [3, en ? "Priority" : "우선순위"],
      [4, en ? "Result" : "결과"],
    ].map(([index, label]) => `<li class="${index === step ? "is-current" : index < step ? "is-done" : ""}" ${index === step ? 'aria-current="step"' : ""} data-si-wizard-goto="${index}" role="button" tabindex="0" aria-label="${label}"><b>${index < 4 ? index : "✓"}</b><span>${label}</span></li>`).join("")}</ol>
    <div class="si-wizard-step" data-si-step-panel="1"><strong>1. ${en ? "What are you building?" : "무엇을 만드나요?"}</strong><small class="si-step-hint">${en ? "Choose the closest example. You can fine-tune it later." : "가장 비슷한 예시를 고르세요. 나중에 상세 조정할 수 있습니다."}</small><div class="si-choice-grid si-scenario-grid">${Object.entries(SI_SCENARIOS).map(([id,row]) => {
      const [note, badge] = scenarioNotes[id];
      return `<button type="button" data-si-preset="${id}" class="${studioState.siScenario === id ? "is-active" : ""}"><span>${badge}</span><b>${en ? row.en : row.ko}</b><small>${note}</small></button>`;
    }).join("")}</div></div>
    <div class="si-wizard-step" data-si-step-panel="2"><strong>2. ${en ? "How many people will use it?" : "몇 명이 사용하나요?"}</strong><small class="si-step-hint">${en ? "Enter everyone who may use the service. Peak concurrency is calculated automatically." : "서비스를 사용할 전체 인원을 입력하세요. 피크 동시 요청은 자동 계산합니다."}</small><div class="si-choice-grid si-user-choice-grid">${[10,50,100,300].map((value) => `<button type="button" data-si-users="${value}" class="${Number(studioState.siUserPreset) === value ? "is-active" : ""}">${value}${en ? " users" : "명"}</button>`).join("")}<label class="si-custom-users"><span>${en ? "Custom" : "직접 입력"}</span><span><input id="siCustomUsers" type="number" min="1" max="100000" step="1" value="${studioState.siUserPreset}" aria-label="${en ? "Custom number of users" : "사용자 수 직접 입력"}">${en ? "users" : "명"}</span></label></div></div>
    <div class="si-wizard-step" data-si-step-panel="3"><strong>3. ${en ? "Set a budget or quality priority" : "예산 또는 품질 우선순위를 정하세요"}</strong><small class="si-step-hint">${en ? "A budget is optional. Choose the most important trade-off." : "예산은 선택 사항입니다. 가장 중요한 기준 하나를 고르세요."}</small><div class="si-simple-budget"><label><span>${en ? "Maximum hardware budget (USD, optional)" : "최대 하드웨어 예산 (원, 선택)"}</span><input id="siBudgetKrw" type="number" min="0" step="${en ? 100 : 1000000}" value="${studioDisplayFromKrw(studioState.siBudgetKrw)}" placeholder="${en ? "0 = no budget limit" : "0 = 예산 제한 없음"}"></label><div class="si-choice-grid">${quality.map(([id,title,note]) => `<button type="button" data-si-quality="${id}" class="${studioState.siQualityPreset === id ? "is-active" : ""}"><b>${title}</b><small>${note}</small></button>`).join("")}</div></div></div>
    <div class="si-wizard-result" data-si-step-panel="4">
      <div class="simple-verdict ${selectedFit.valid ? "is-fit" : "is-review"}"><span>${selectedFit.valid ? (en ? "RECOMMENDED" : "추천 가능") : (en ? "REVIEW NEEDED" : "조건 검토 필요")}</span><strong>${studioMoney(selectedPrice)}</strong><small>${en ? "Estimated total · not a binding supplier quote" : "총 예상 가격 · 공급사 확정 견적 아님"}</small></div>
      <div class="si-auto-result"><div><span>${en ? "Automatically selected model and option" : "자동 선택 모델·구성안"}</span><strong>${platformEscape(model.name)} · ${planLabel(recommended, en)}</strong><small>${budget > 0 && !budgetMatches.length ? (en ? "No option fits the budget exactly; showing the lowest-cost option." : "예산 안에 들어오는 구성이 없어 최저비용안을 표시합니다.") : (en ? "You can change every assumption in detailed settings." : "상세 설정에서 모든 가정을 수정할 수 있습니다.")}${budget > 0 && !budgetMatches.length && studioState.siQualityPreset !== "economy" ? ` <button type="button" class="link-button" data-si-quality="economy">${en ? "Recalculate with a lighter model →" : "더 가벼운 모델로 다시 계산 →"}</button>` : ""}</small></div><div class="si-auto-parts"><span><b>GPU</b>${platformEscape(shortGpuName(recommended.gpu.name))} × ${recommended.gpuCount}</span><span><b>CPU</b>${parts.cpu}</span><span><b>RAM</b>${parts.memory}</span><span><b>Storage</b>${parts.storage}</span><span><b>Network</b>${parts.nic}</span><span><b>${en ? "Server / power" : "서버·전원"}</b>${parts.server} · ${parts.power}</span></div><section class="si-model-selection-evidence"><strong>${en ? "Why this model" : "이 모델을 고른 이유"}</strong><div><span><b>${en ? "Recency" : "최신성"}</b>${platformEscape(modelEvidence.release)}</span><span><b>${en ? "Public benchmark" : "공개 벤치마크"}</b>${modelEvidence.benchmarkUrl ? `<a href="${platformEscape(modelEvidence.benchmarkUrl)}" target="_blank" rel="noopener noreferrer">${platformEscape(modelEvidence.benchmark)} ↗</a>` : platformEscape(modelEvidence.benchmark)}</span><span><b>${en ? "Architecture" : "구조·효율"}</b>${platformEscape(modelEvidence.architecture)}</span><span><b>${en ? "Service fit" : "서비스 적합성"}</b>${platformEscape(modelEvidence.serviceFit)}</span></div><small>${en ? "Benchmark scores are supporting evidence, not a universal ranking. Compare scores only within the same benchmark and evaluation setup." : "벤치마크 점수는 선정 근거 중 하나이며 범용 순위가 아닙니다. 같은 벤치마크·평가 설정 안에서만 비교하세요."}</small></section><p>${en ? "Why this hardware: model memory, expected concurrency, failover, growth reserve, and optional budget determine the parts automatically." : "하드웨어 선정 이유: 모델 메모리, 예상 동시 사용자, 장애 대비, 성장 여유와 선택 예산을 기준으로 부품을 자동 선택했습니다."}</p></div>
      ${priceCoverage ? `<aside class="price-coverage-note"><div><span class="section-kicker">v6.7 PRICE DATA</span><strong>${en ? `${priceCoverage.sourced} of ${priceCoverage.addressable} retail-available GPUs have dated Korean market sources` : `소매 구매 가능한 GPU ${priceCoverage.addressable}개 중 ${priceCoverage.sourced}개에 날짜·출처가 있는 국내 시세`}</strong><small>${en ? `Fresh ${priceCoverage.fresh} · aging ${priceCoverage.aging} · stale ${priceCoverage.stale}. Missing prices require a supplier quote or direct input. ${priceCoverage.enterpriseOnly} enterprise-only GPUs (H100/A100/MI300X-class) are excluded from this figure -- they have no normal consumer retail channel. USD conversion uses an editable planning rate of ₩${studioExchangeRate().toLocaleString()}/USD, not a live FX quote.` : `최근 30일 ${priceCoverage.fresh}개 · 31~90일 ${priceCoverage.aging}개 · 90일 초과 ${priceCoverage.stale}개. 없는 가격은 공급사 견적·직접 입력 대상으로 구분합니다. 기업용 전용 GPU(H100/A100/MI300X급) ${priceCoverage.enterpriseOnly}개는 일반 소매 채널이 없어 이 수치에서 제외했습니다. 달러 환산은 실시간 환율이 아닌 편집 가능한 계획값 ${studioExchangeRate().toLocaleString()}원/USD를 사용합니다.`}</small></div><a class="ghost-button" href="${platformEscape(window.AIHardwareCatalogRequests.issueUrl("price", recommended.gpu.name))}" target="_blank" rel="noopener noreferrer">${en ? "Report a price" : "가격 제보"}</a></aside>` : ""}
      ${evidenceCoverage ? `<aside class="evidence-coverage-note ${nextEvidence ? "is-review" : ""}"><div><span class="section-kicker">v6.3 SOURCE TRUST</span><strong>${en ? `${evidenceCoverage.official} model-specific official sources · ${evidenceCoverage.family} family sources` : `모델별 공식 출처 ${evidenceCoverage.official}개 · 제품군 출처 ${evidenceCoverage.family}개`}</strong><small>${nextEvidence ? (en ? `Next priority: ${nextEvidence.gpu.name}. Family-level and missing sources are clearly marked.` : `다음 우선 검증: ${nextEvidence.gpu.name}. 제품군·누락 출처는 공식 모델 출처와 구분합니다.`) : (en ? "All priority GPUs have model-specific official sources." : "우선 검증 GPU의 모델별 공식 출처가 모두 연결되었습니다.")}</small></div>${nextEvidence ? `<a class="ghost-button" href="${platformEscape(window.AIHardwareEvidence.issueUrl(nextEvidence.gpu))}" target="_blank" rel="noopener noreferrer">${en ? "Improve source" : "출처 보강"}</a>` : ""}</aside>` : ""}
      <div class="simple-result-actions"><a class="primary-button" href="#siPlans">${en ? "Compare the three options" : "경제형·권장형·확장형 비교"}</a><button type="button" class="ghost-button" data-si-proposal>${en ? "Open customer summary" : "고객 공유 요약 열기"}</button><button type="button" class="ghost-button" data-si-input-mode="expert">${en ? "Edit detailed assumptions" : "상세 가정 수정"}</button></div>
    </div>
    <div class="si-wizard-navigation"><button type="button" class="ghost-button" data-si-wizard-back ${step === 1 ? "disabled" : ""}>← ${en ? "Back" : "이전"}</button><span>${step}/4</span>${step < 4 ? `<button type="button" class="primary-button" data-si-wizard-next>${step === 3 ? (en ? "Calculate result" : "결과 계산") : (en ? "Next" : "다음")} →</button>` : `<button type="button" class="ghost-button" data-si-wizard-restart>${en ? "Start over" : "처음부터"}</button>`}</div>
  </section>`;
}

function proposalUrl() {
  const publicKeys = [
    "modelKey", "siScenario", "siProjectName", "siPurpose", "siDeployment", "siServiceType",
    "siTotalUsers", "siConcurrency", "siInputTokens", "siOutputTokens", "siAvailability",
    "siGrowthPct", "siQualityPreset", "siBudgetKrw", "siSelectedPlan",
  ];
  const publicState = Object.fromEntries(publicKeys.map((key) => [key, studioState[key]]));
  const url = new URL(window.location.href);
  url.searchParams.set("mode", "infra");
  url.searchParams.set("view", "proposal");
  url.searchParams.set("studio", "consulting");
  url.searchParams.set("studioState", JSON.stringify(publicState));
  return url.toString();
}

function renderCustomerProposal(model, plans) {
  const en = uiLanguage === "en";
  const selected = plans.find((plan) => plan.id === studioState.siSelectedPlan) || plans[1] || plans[0];
  const commercial = calculateSiCommercial(selected);
  const parts = autoComponentRecommendation(selected);
  return `<article class="customer-proposal" aria-labelledby="customerProposalTitle">
    <header><div><span class="section-kicker">v5.7 READ-ONLY RESULT</span><h3 id="customerProposalTitle">${platformEscape(studioState.siProjectName || (en ? "AI infrastructure estimate" : "AI 인프라 견적"))}</h3><p>${platformEscape(studioState.siPurpose)}</p></div><span class="proposal-readonly-badge">${en ? "Customer view · read only" : "고객 공유용 · 읽기 전용"}</span></header>
    <section class="proposal-hero"><div><small>${en ? "Selected option" : "선택 구성"}</small><strong>${en ? selected.en : selected.ko}</strong><h4>${platformEscape(shortGpuName(selected.gpu.name))} × ${selected.gpuCount}</h4></div><div><small>${en ? "Estimated total" : "총 예상 가격"}</small><strong>${studioMoney(commercial.finalPrice)}</strong><span>${en ? "Planning estimate, not a binding quote" : "계획용 추정치 · 확정 견적 아님"}</span></div></section>
    <div class="proposal-summary-grid"><span><small>${en ? "Model" : "모델"}</small><strong>${platformEscape(model.name)}</strong></span><span><small>${en ? "Concurrent capacity" : "예상 동시 처리"}</small><strong>${selected.capacity}${en ? "" : "명"}</strong></span><span><small>VRAM</small><strong>${selected.requiredGb.toFixed(1)}GB ${en ? "required" : "필요"}</strong></span><span><small>${en ? "Facility power" : "설비 전력"}</small><strong>${selected.powerW.toLocaleString()}W+</strong></span><span><small>${en ? "Confidence" : "신뢰도"}</small><strong>${platformEscape(window.AIHardwareLocale?.confidence(selected.confidence, en ? "en" : "ko") || selected.confidence)}</strong></span><span><small>${en ? "Expected range" : "예상 속도 범위"}</small><strong>${selected.speedLow.toFixed(0)}–${selected.speedHigh.toFixed(0)} tok/s</strong></span></div>
    <section><h4>${en ? "Automatically selected infrastructure" : "자동 선택 인프라"}</h4><div class="proposal-part-grid"><span><b>CPU</b>${parts.cpu}</span><span><b>RAM</b>${parts.memory}</span><span><b>Storage</b>${parts.storage}</span><span><b>Network</b>${parts.nic}</span><span><b>${en ? "Server" : "서버"}</b>${parts.server}</span><span><b>${en ? "Power" : "전원"}</b>${parts.power}</span></div></section>
    <section><h4>${en ? "Why this option" : "이 구성을 선택한 이유"}</h4><p>${en ? "The model memory, concurrent demand, failover requirement, and growth reserve are balanced against the estimated cost." : "모델 메모리, 동시 요청, 장애 대비, 성장 여유를 예상 비용과 균형 있게 반영했습니다."}</p><p class="proposal-caution">${en ? "Validate throughput, latency, networking, and final supplier pricing with a representative PoC." : "처리량·지연·네트워크·최종 공급 가격은 대표 워크로드 PoC와 공급사 검토로 확정해야 합니다."}</p></section>
    <footer><button type="button" class="primary-button" data-si-print>${en ? "Print / save PDF" : "인쇄·PDF 저장"}</button><button type="button" class="ghost-button" data-si-edit-proposal>${en ? "Open editable estimate" : "편집 화면 열기"}</button></footer>
  </article>`;
}

const SIZING_PROJECTS_KEY = "ai-infra-sizing-projects-v1";
const SIZING_DRAFT_KEY = "ai-infra-sizing-draft-v3";

function calculateRealtimeSla(plan) {
  const replicas = Math.max(1, plan.nodes, Number(studioState.siMinReplicas) || 1);
  const outputTokens = Math.max(1, Number(studioState.siOutputTokens) || 1);
  const perReplicaRps = Math.max(0.01, plan.speed / outputTokens);
  const capacityRps = perReplicaRps * replicas * Math.max(1, Number(studioState.siMaxBatch) || 1);
  const utilization = Math.max(0, Number(studioState.siQps) || 0) / capacityRps;
  const serviceSeconds = outputTokens / Math.max(1, plan.speed);
  const queueP95 = utilization >= 1
    ? serviceSeconds * (1 + (utilization - 1) * Math.max(1, studioState.siMaxBatch))
    : serviceSeconds * utilization / Math.max(0.05, 1 - utilization) * 0.35;
  const itlP95 = Math.max(0.005, 1 / Math.max(1, plan.speed) * 1.25);
  const ttftP95 = Math.max(0.15, Number(studioState.siTtftP95) || 0) + queueP95;
  const latencyP95 = ttftP95 + itlP95 * outputTokens;
  const requiredReplicas = Math.ceil((Number(studioState.siQps) || 0) * (1 + studioState.siGrowthPct / 100) / Math.max(0.01, perReplicaRps * Math.max(1, studioState.siMaxBatch) * 0.72));
  const stt = 0.42;
  const llm = ttftP95;
  const tts = 0.28;
  const lipsync = 0.18;
  const avatarFirstResponse = stt + llm + tts + lipsync;
  const avatarFps = Math.max(8, Math.min(60, 30 / Math.max(0.5, utilization)));
  return { replicas, capacityRps, utilization, queueP95, itlP95, ttftP95, latencyP95, requiredReplicas, stt, llm, tts, lipsync, avatarFirstResponse, avatarFps, realtime: avatarFps >= 24 && avatarFirstResponse <= studioState.siLatencyP95 };
}

function calculateTcoComparison(plan) {
  const utilization = Math.max(0.01, Math.min(1, studioState.siUtilizationPct / 100));
  const monthlyOnprem = plan.annualEnergyKrw / 12 + studioState.siFacilityKrwMonth + plan.purchaseKrw * (studioState.siMaintenancePct + studioState.siSupportPct) / 1200;
  const monthlyCloud = studioState.siCloudHourlyUsd * studioExchangeRate() * plan.gpuCount * Math.min(730, studioState.siOperatingHours * 30) * utilization;
  const totals = (years, mode) => {
    if (mode === "onprem") return Math.round(plan.purchaseKrw + monthlyOnprem * 12 * years);
    if (mode === "cloud") return Math.round(monthlyCloud * 12 * years);
    return Math.round(plan.purchaseKrw * 0.6 + (monthlyOnprem * 0.6 + monthlyCloud * 0.4) * 12 * years);
  };
  const margin = monthlyCloud - monthlyOnprem;
  return { monthlyOnprem, monthlyCloud, breakEvenMonths: margin > 0 ? plan.purchaseKrw / margin : 0, onprem: [1, 3, 5].map((y) => totals(y, "onprem")), cloud: [1, 3, 5].map((y) => totals(y, "cloud")), hybrid: [1, 3, 5].map((y) => totals(y, "hybrid")) };
}

function sizingProjects() {
  try { return JSON.parse(localStorage.getItem(SIZING_PROJECTS_KEY) || "[]"); } catch { return []; }
}

function sizingSnapshot() {
  const { model, plans } = calculateSiSizing();
  const selected = plans.find((plan) => plan.id === studioState.siSelectedPlan) || plans[1] || plans[0];
  const commercial = calculateSiCommercial(selected);
  const readiness = siReadinessChecks(model, plans);
  return {
    schemaVersion: 3,
    appVersion: "7.5.0",
    savedAt: new Date().toISOString(),
    state: { ...studioState },
    model: model.name,
    quoteStatus: studioState.siQuoteStatus,
    finalPrice: commercial.finalPrice,
    readiness: {
      passed: readiness.filter((check) => check.ok).length,
      total: readiness.length,
      pending: readiness.filter((check) => !check.ok).map((check) => check.id),
    },
    plans: plans.map((p) => ({
      id: p.id,
      gpu: p.gpu.name,
      gpuCount: p.gpuCount,
      nodes: p.nodes,
      tco: p.threeYearTcoKrw,
      fit: siPlanFit(p),
    })),
  };
}

function saveSizingProject(clone = false) {
  const projects = sizingProjects();
  const same = projects.filter((p) => p.projectName === studioState.siProjectName);
  const version = clone ? 1 : Math.max(0, ...same.map((p) => Number(p.version) || 0)) + 1;
  const snapshot = sizingSnapshot();
  const row = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, projectName: clone ? `${studioState.siProjectName} 복사본` : studioState.siProjectName, customerName: studioState.siCustomerName, version, ...snapshot };
  localStorage.setItem(SIZING_PROJECTS_KEY, JSON.stringify([row, ...projects].slice(0, 30)));
  studioState.siEstimateVersion = version;
  renderDecisionStudio();
  window.AIHardwareUI?.announce(uiLanguage === "en"
    ? (clone ? "Cloned the estimate." : `Saved estimate version ${version}.`)
    : (clone ? "견적을 복제했습니다." : `견적 버전 ${version}을 저장했습니다.`), "success");
}

function downloadJson(filename, value) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function benchmarkCommands(model, plan) {
  const repo = safeModelRepo(model);
  const prompt = studioState.siBenchmarkPrompts.split(",")[0].trim() || "512";
  const output = studioState.siBenchmarkOutputs.split(",")[0].trim() || "128";
  const concurrency = studioState.siBenchmarkConcurrency.split(",")[0].trim() || "1";
  return {
    vllm: `vllm bench serve --model ${repo} --input-len ${prompt} --output-len ${output} --max-concurrency ${concurrency}`,
    llamacpp: `llama-bench -m model.gguf -p ${prompt} -n ${output} -ngl 999`,
    ollama: `OLLAMA_NUM_PARALLEL=${concurrency} ollama run ${repo}`,
    nim: `genai-perf profile -m ${repo} --synthetic-input-tokens-mean ${prompt} --output-tokens-mean ${output} --concurrency ${concurrency}`,
  };
}

function renderV38V42Modules(model, plans) {
  const en = uiLanguage === "en";
  const recommended = plans.find((p) => p.id === "recommended") || plans[0];
  const sla = calculateRealtimeSla(recommended);
  const tco = calculateTcoComparison(recommended);
  const projects = sizingProjects();
  const commands = benchmarkCommands(model, recommended);
  const recent = projects.filter((p) => p.projectName === studioState.siProjectName).slice(0, 3);
  const changed = recent.length > 1 ? Object.keys(recent[0].state || {}).filter((key) => JSON.stringify(recent[0].state[key]) !== JSON.stringify(recent[1].state?.[key])).slice(0, 8) : [];
  const evidence = gpuEvidenceLabel(recommended.gpu, en);
  return `
    <section class="si-version-section"><div class="si-version-head"><div><span class="section-kicker">v3.8</span><h3>${en ? "Real-time service SLA" : "실시간 서비스 SLA"}</h3></div><strong class="${sla.utilization > .8 ? "is-risk" : "is-good"}">${(sla.utilization * 100).toFixed(1)}% ${en ? "load" : "부하"}</strong></div>
      <div class="studio-question-grid si-compact-grid"><label><span>${en ? "Max batch" : "최대 배치"}</span><input id="siMaxBatch" type="number" min="1" value="${studioState.siMaxBatch}"></label><label><span>${en ? "Min replicas" : "최소 복제본"}</span><input id="siMinReplicas" type="number" min="1" value="${studioState.siMinReplicas}"></label><label><span>${en ? "Max replicas" : "최대 복제본"}</span><input id="siMaxReplicas" type="number" min="1" value="${studioState.siMaxReplicas}"></label><label class="studio-check"><input id="siStreaming" type="checkbox" ${studioState.siStreaming ? "checked" : ""}><span>${en ? "Streaming response" : "스트리밍 응답"}</span></label><label class="studio-check"><input id="siAutoscale" type="checkbox" ${studioState.siAutoscale ? "checked" : ""}><span>${en ? "Autoscaling" : "자동 확장"}</span></label></div>
      <div class="si-metric-grid"><span>TTFT p95<strong>${sla.ttftP95.toFixed(2)}s</strong></span><span>ITL p95<strong>${(sla.itlP95 * 1000).toFixed(0)}ms</strong></span><span>${en ? "Queue p95" : "큐 대기 p95"}<strong>${sla.queueP95.toFixed(2)}s</strong></span><span>${en ? "Total p95" : "전체 p95"}<strong>${sla.latencyP95.toFixed(2)}s</strong></span><span>RPS<strong>${studioState.siQps} / ${sla.capacityRps.toFixed(2)}</strong></span><span>${en ? "Required replicas" : "필요 복제본"}<strong>${sla.requiredReplicas}</strong></span></div>
      <div class="si-avatar-latency"><span>STT ${sla.stt.toFixed(2)}s</span><b>→</b><span>LLM ${sla.llm.toFixed(2)}s</span><b>→</b><span>TTS ${sla.tts.toFixed(2)}s</span><b>→</b><span>${en ? "Lip-sync" : "립싱크"} ${sla.lipsync.toFixed(2)}s</span><strong>${en ? "First response" : "첫 응답"} ${sla.avatarFirstResponse.toFixed(2)}s · ${sla.avatarFps.toFixed(0)} FPS · ${sla.realtime ? (en ? "Real-time feasible" : "실시간 가능") : (en ? "Adjustment required" : "조정 필요")}</strong></div>
    </section>
    <section class="si-version-section"><div class="si-version-head"><div><span class="section-kicker">v3.9</span><h3>${en ? "Project and estimate history" : "프로젝트·견적 이력"}</h3></div><span>${en ? "Current version" : "현재 버전"} v${studioState.siEstimateVersion}</span></div>
      <div class="si-project-actions"><button type="button" class="primary-button" data-si-save>${en ? "Save new version" : "새 버전 저장"}</button><button type="button" class="ghost-button" data-si-clone>${en ? "Clone estimate" : "견적 복제"}</button><button type="button" class="ghost-button" data-si-json-export>JSON ${en ? "export" : "내보내기"}</button><button type="button" class="ghost-button" data-si-json-import>JSON ${en ? "import" : "가져오기"}</button><input id="siJsonFile" type="file" aria-label="${en ? "Import project JSON" : "프로젝트 JSON 가져오기"}" accept=".json,application/json" hidden></div>
      ${changed.length ? `<p class="si-change-summary">${en ? "Changes since prior version" : "직전 버전 대비 변경"}: ${changed.map(platformEscape).join(", ")}</p>` : ""}
      <div class="si-project-list">${projects.slice(0, 6).map((p) => `<button type="button" data-si-load="${p.id}"><strong>${platformEscape(p.projectName)}</strong><span>v${p.version} · ${new Date(p.savedAt).toLocaleDateString(en ? "en-US" : "ko-KR")}</span></button>`).join("") || `<p>${en ? "No saved local projects." : "브라우저에 저장된 프로젝트가 없습니다."}</p>`}</div>
    </section>
    <section class="si-version-section"><div class="si-version-head"><div><span class="section-kicker">v4.0</span><h3>${en ? "Proposal package" : "제안서 품질 완성"}</h3></div><div class="si-mode-switch"><button type="button" data-si-report="customer" class="${studioState.siReportMode === "customer" ? "is-active" : ""}">${en ? "Customer summary" : "고객 요약본"}</button><button type="button" data-si-report="technical" class="${studioState.siReportMode === "technical" ? "is-active" : ""}">${en ? "Technical review" : "기술 검토본"}</button></div></div>
      <div class="si-architecture" role="img" aria-label="${en ? "Generated infrastructure architecture" : "자동 생성 인프라 구성도"}"><span>${platformEscape(studioState.siCustomerName || (en ? "Users" : "사용자"))}</span><b>→</b><span>Load Balancer</span><b>→</b><span>${recommended.nodes}× Server<br>${recommended.gpuPerServer} GPU/node</span><b>→</b><span>Vector DB · NVMe</span><b>→</b><span>Monitoring · Backup</span></div>
      <p>${en ? "Selected" : "선정 근거"}: ${platformEscape(recommended.gpu.name)} · ${recommended.requiredGb.toFixed(1)}GB VRAM · ${recommended.capacity} ${en ? "concurrent responses" : "동시 응답"}. ${en ? "Alternatives are excluded when SLA headroom, failover, or five-year cost is weaker." : "SLA 여유·장애 대응·5년 비용이 더 불리한 대안은 제외합니다."}</p>
    </section>
    <section class="si-version-section"><div class="si-version-head"><div><span class="section-kicker">v4.1</span><h3>${en ? "Benchmark runner" : "실제 벤치마크 실행 도우미"}</h3></div><span>n=${studioState.siBenchmarkSamples} · ${en ? "outliers" : "이상치"} ${studioState.siBenchmarkOutliers}</span></div>
      <div class="studio-question-grid si-compact-grid"><label><span>${en ? "Runtime" : "런타임"}</span><select id="siBenchmarkRuntime">${Object.keys(commands).map((r) => `<option value="${r}" ${studioState.siBenchmarkRuntime === r ? "selected" : ""}>${r}</option>`).join("")}</select></label><label><span>${en ? "Prompt lengths" : "입력 길이"}</span><input id="siBenchmarkPrompts" value="${platformEscape(studioState.siBenchmarkPrompts)}"></label><label><span>${en ? "Output lengths" : "출력 길이"}</span><input id="siBenchmarkOutputs" value="${platformEscape(studioState.siBenchmarkOutputs)}"></label><label><span>${en ? "Concurrency sweep" : "동시성 단계"}</span><input id="siBenchmarkConcurrency" value="${platformEscape(studioState.siBenchmarkConcurrency)}"></label></div>
      <pre class="si-command"><code>${platformEscape(commands[studioState.siBenchmarkRuntime] || commands.vllm)}</code></pre><div class="si-project-actions"><button type="button" class="ghost-button" data-si-copy-command>${en ? "Copy command" : "명령 복사"}</button><button type="button" class="ghost-button" data-si-benchmark-plan>${en ? "Export test plan" : "테스트 계획 내보내기"}</button><button type="button" class="ghost-button" data-si-benchmark-import>${en ? "Import result JSON" : "결과 JSON 업로드"}</button><input id="siBenchmarkFile" type="file" aria-label="${en ? "Import benchmark result JSON" : "벤치마크 결과 JSON 가져오기"}" accept=".json,application/json" hidden></div>
      <p class="si-poc-verdict">${studioState.siBenchmarkSamples ? `${en ? "Calibration factor" : "보정계수"} ${(studioState.siMeasuredSpeed / Math.max(1, recommended.speed)).toFixed(2)} · ${studioState.siMeasuredTtft <= studioState.siTtftP95 && studioState.siMeasuredErrorRate <= 1 ? (en ? "PoC passed" : "PoC 합격") : (en ? "Adjustment required" : "조정 필요")}` : (en ? "Run performance and load tests separately, then upload the result JSON." : "성능 테스트와 부하 테스트를 분리 실행한 뒤 결과 JSON을 업로드하세요.")}</p>
    </section>
    <section class="si-version-section"><div class="si-version-head"><div><span class="section-kicker">v4.2</span><h3>${en ? "On-premises vs cloud" : "온프레미스·클라우드 비교"}</h3></div><span>${en ? "Break-even" : "손익분기"} ${tco.breakEvenMonths ? `${tco.breakEvenMonths.toFixed(1)} ${en ? "months" : "개월"}` : (en ? "not reached" : "미도달")}</span></div>
      <div class="studio-question-grid si-compact-grid"><label><span>${en ? "Utilization (%)" : "사용률 (%)"}</span><input id="siUtilizationPct" type="number" min="1" max="100" value="${studioState.siUtilizationPct}"></label><label><span>${en ? "Cloud GPU (USD/hour)" : "클라우드 GPU (원/시간)"}</span><input id="siCloudHourlyUsd" type="number" min="0" step="${en ? 0.1 : 100}" value="${studioDisplayFromUsd(studioState.siCloudHourlyUsd)}"></label><label><span>${en ? "Facility (USD/month)" : "상면비 (원/월)"}</span><input id="siFacilityKrwMonth" type="number" min="0" step="${en ? 10 : 10000}" value="${studioDisplayFromKrw(studioState.siFacilityKrwMonth)}"></label><label><span>${en ? "Support (%)" : "지원 비용 (%)"}</span><input id="siSupportPct" type="number" min="0" value="${studioState.siSupportPct}"></label></div>
      <div class="studio-table-wrap"><table class="studio-table"><thead><tr><th>${en ? "Option" : "구성"}</th><th>1${en ? "y" : "년"}</th><th>3${en ? "y" : "년"}</th><th>5${en ? "y" : "년"}</th></tr></thead><tbody>${[["온프레미스", tco.onprem], ["클라우드", tco.cloud], ["혼합", tco.hybrid]].map(([name, values]) => `<tr><td>${en ? ({ 온프레미스: "On-premises", 클라우드: "Cloud", 혼합: "Hybrid" }[name]) : name}</td>${values.map((v) => `<td>${studioMoney(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
    </section>
    <section class="si-version-section si-evidence-panel"><div class="si-version-head"><div><span class="section-kicker">DATA CONFIDENCE</span><h3>${en ? "Evidence traceability" : "데이터 근거 추적"}</h3></div></div><div class="si-confidence-list"><span>${en ? "GPU specification" : "GPU 사양"}<strong>${platformEscape(evidence)}</strong><small>${recommended.gpu.sourceUrl ? (en ? "Source linked" : "출처 연결") : (en ? "Source contribution needed" : "출처 보강 필요")}</small></span><span>${en ? "Benchmark" : "벤치마크"}<strong>${recommended.sampleCount ? (en ? "External/community measured" : "외부·커뮤니티 실측") : (en ? "Calculated estimate" : "계산 추정")}</strong><small>n=${recommended.sampleCount}</small></span><span>${en ? "Estimated error" : "예상 오차"}<strong>±${recommended.sampleCount >= 3 ? 15 : recommended.sampleCount ? 25 : 40}%</strong><small>${en ? "Validate with PoC" : "PoC로 검증 필요"}</small></span><span>${en ? "Last verified" : "마지막 검증일"}<strong>${recommended.gpu.verifiedAt || DATA_UPDATED_AT}</strong><small>${en ? "Model and runtime changes require recheck" : "모델·런타임 변경 시 재검증"}</small></span></div></section>`;
}

// Build-vs-buy bridge: reuses the exact same usage assumptions the sizing
// wizard already collected (siQps, siOperatingHours, siInputTokens,
// siOutputTokens) to answer a question this studio never used to address at
// all -- "what would the equivalent hosted-API cost be instead of buying
// this hardware?" Deliberately a compact callout, not a full second studio:
// the full breakdown across all 9 tracked API models lives in the standalone
// "API 비용 계산기" mode (features/api-cost-estimator.js), linked from here.
function renderApiCostComparison(plans) {
  if (typeof window.AIHardwareApiCost?.estimate !== "function") return "";
  const en = uiLanguage === "en";
  const recommended = plans.find((plan) => plan.id === "recommended") || plans[0];
  if (!recommended) return "";
  const monthlyHardwareKrw = recommended.threeYearTcoKrw / 36;
  const monthlyRequests = Math.max(0, Number(studioState.siQps) || 0) * 3600 * Math.max(1, Number(studioState.siOperatingHours) || 24) * 30;
  const rows = window.AIHardwareApiCost.estimate({
    monthlyRequests,
    inputTokensPerRequest: studioState.siInputTokens,
    outputTokensPerRequest: studioState.siOutputTokens,
  });
  const cheapest = rows[0];
  if (!cheapest) return "";
  const cheaperThanHardware = cheapest.monthlyCostKrw < monthlyHardwareKrw;
  // Self-hosted cost is a flat monthly TCO regardless of how many requests
  // actually get served, while the hosted API's cost scales linearly with
  // volume (no caching/batch/volume-discount tiers are modeled here -- see
  // apiPricingMeta.basis). That means there is exactly one crossover point:
  // the request volume where the API's linearly-scaling cost line crosses
  // the hardware's flat line. Surfacing that point (rather than only a
  // single-usage-level snapshot) is what actually answers "how sensitive is
  // this to concurrency" -- the recurring feedback on this panel.
  const costPerRequestKrw = monthlyRequests > 0 ? cheapest.monthlyCostKrw / monthlyRequests : 0;
  const breakevenRequests = costPerRequestKrw > 0 ? monthlyHardwareKrw / costPerRequestKrw : null;
  const breakevenMultiplier = breakevenRequests && monthlyRequests > 0 ? breakevenRequests / monthlyRequests : null;
  const breakevenSentence = breakevenMultiplier
    ? (cheaperThanHardware
        ? (en
            ? `If usage grew to about ${Math.round(breakevenRequests).toLocaleString("en-US")} requests/month (~${breakevenMultiplier.toFixed(1)}x today's level), self-hosting would flip to being the cheaper option.`
            : `사용량이 월 약 ${Math.round(breakevenRequests).toLocaleString("ko-KR")}건(지금의 약 ${breakevenMultiplier.toFixed(1)}배)까지 늘어나면 그때부터는 자체 구축이 더 저렴해집니다.`)
        : (en
            ? `Only if usage fell to about ${Math.round(breakevenRequests).toLocaleString("en-US")} requests/month (~${Math.round(breakevenMultiplier * 100)}% of today's level) would the hosted API become the cheaper option instead.`
            : `사용량이 월 약 ${Math.round(breakevenRequests).toLocaleString("ko-KR")}건(지금의 약 ${Math.round(breakevenMultiplier * 100)}%)까지 줄어들어야 API가 더 저렴해집니다.`))
    : "";
  // A compact scaling table (0.25x/1x/4x/16x today's usage) shows the two
  // cost lines actually diverging, instead of leaving the sensitivity
  // implicit in one sentence. Multiples are fixed powers of 4 rather than
  // "the breakeven point itself" so the table reads the same regardless of
  // which side of breakeven the current usage happens to sit on.
  const scaleMultipliers = [0.25, 1, 4, 16];
  const scaleRows = monthlyRequests > 0
    ? scaleMultipliers.map((multiplier) => {
        const requestsAtScale = monthlyRequests * multiplier;
        const apiCostKrw = costPerRequestKrw * requestsAtScale;
        return { multiplier, requestsAtScale, apiCostKrw, apiCheaper: apiCostKrw < monthlyHardwareKrw };
      })
    : [];
  const scaleTable = scaleRows.length
    ? `<div class="studio-table-wrap"><table class="studio-table si-api-cost-scale">
        <thead><tr><th>${en ? "Usage" : "사용량"}</th><th>${en ? "Requests/month" : "월 요청 수"}</th><th>${cheapest.name} (API)</th><th>${en ? "Self-hosted (flat)" : "자체 구축 (고정)"}</th></tr></thead>
        <tbody>${scaleRows.map((row) => `<tr class="${row.multiplier === 1 ? "is-current-usage" : ""}">
          <td>${row.multiplier === 1 ? (en ? "Today (1x)" : "현재 (1배)") : `${row.multiplier < 1 ? row.multiplier : Math.round(row.multiplier)}x`}</td>
          <td>${Math.round(row.requestsAtScale).toLocaleString(en ? "en-US" : "ko-KR")}</td>
          <td class="${row.apiCheaper ? "is-cheapest" : ""}">${studioMoney(row.apiCostKrw)}</td>
          <td class="${!row.apiCheaper ? "is-cheapest" : ""}">${studioMoney(monthlyHardwareKrw)}</td>
        </tr>`).join("")}</tbody>
      </table></div>`
    : "";
  // Payback period: how many months of hosted-API payments the hardware's
  // upfront purchase price would need to "earn back" via monthly savings,
  // ignoring the purchase price itself in the monthly-savings figure (only
  // ongoing running cost -- energy, facility, maintenance/support -- is
  // netted against the API's monthly bill). Reuses the same monthly
  // running-cost formula as calculateTcoComparison()'s on-prem branch, so
  // this stays consistent with the on-prem-vs-cloud comparison elsewhere in
  // the same studio rather than introducing a second, slightly different
  // notion of "monthly hardware cost".
  const monthlyRunningKrw = recommended.annualEnergyKrw / 12
    + studioState.siFacilityKrwMonth
    + recommended.purchaseKrw * (studioState.siMaintenancePct + studioState.siSupportPct) / 1200;
  const monthlySavingsKrw = cheapest.monthlyCostKrw - monthlyRunningKrw;
  const paybackMonths = monthlySavingsKrw > 0 ? recommended.purchaseKrw / monthlySavingsKrw : null;
  const paybackSentence = paybackMonths
    ? (en
        ? `Buying this hardware upfront (${studioMoney(recommended.purchaseKrw)}) would pay for itself in about ${Math.ceil(paybackMonths)} months of avoided ${cheapest.name} bills, after which self-hosting keeps saving roughly ${studioMoney(monthlySavingsKrw)}/month.`
        : `이 하드웨어를 구매하는 비용(${studioMoney(recommended.purchaseKrw)})은 ${cheapest.name} 이용료를 아낀 것으로 약 ${Math.ceil(paybackMonths)}개월이면 회수되고, 그 이후로는 매달 약 ${studioMoney(monthlySavingsKrw)}씩 계속 절약됩니다.`)
    : (en
        ? `At this usage level, ${cheapest.name} alone costs less per month than just running this hardware (before counting its purchase price) -- self-hosting would not pay for itself here.`
        : `이 사용량에서는 ${cheapest.name} 요금이 이 하드웨어를 운영만 하는 비용(구매비 제외)보다도 낮아, 자체 구축이 구매 비용을 회수하지 못합니다.`);
  // Year-by-year cumulative cost, complementing the volume-based breakeven
  // above with a calendar-time view: "if usage stays roughly the same, which
  // option has spent less by the end of year 1/2/3".
  const yearRows = [1, 2, 3].map((year) => {
    const apiCumulativeKrw = cheapest.monthlyCostKrw * 12 * year;
    const selfHostCumulativeKrw = recommended.purchaseKrw + monthlyRunningKrw * 12 * year;
    return { year, apiCumulativeKrw, selfHostCumulativeKrw, selfHostCheaper: selfHostCumulativeKrw < apiCumulativeKrw };
  });
  const yearTable = `
    <div class="studio-table-wrap"><table class="studio-table si-api-cost-scale">
      <thead><tr><th>${en ? "By end of" : "누적 시점"}</th><th>${en ? "Self-hosted (cumulative)" : "자체 구축 (누적)"}</th><th>${cheapest.name} (${en ? "cumulative" : "누적"})</th></tr></thead>
      <tbody>${yearRows.map((row) => `<tr>
        <td>${en ? `Year ${row.year}` : `${row.year}년차`}</td>
        <td class="${row.selfHostCheaper ? "is-cheapest" : ""}">${studioMoney(row.selfHostCumulativeKrw)}</td>
        <td class="${!row.selfHostCheaper ? "is-cheapest" : ""}">${studioMoney(row.apiCumulativeKrw)}</td>
      </tr>`).join("")}</tbody>
    </table></div>`;
  // Exactly the cost side of the comparison so far -- this line exists so
  // the numbers above are never mistaken for a claim that the cheapest
  // tracked API model and the recommended local model perform equivalently;
  // this panel only ever compares what each option costs at the same usage,
  // never what either one is actually capable of.
  const qualityDisclaimer = en
    ? `This is a cost-only comparison at the same usage level -- it does not mean ${cheapest.name} and the recommended local setup produce comparable quality or capability.`
    : `이 비교는 동일 사용량 기준 "비용"만 비교한 것으로, ${cheapest.name}과 추천 로컬 구성의 성능·품질이 동등하다는 의미는 아닙니다.`;
  const dimensionsTable = `
    <div class="studio-table-wrap"><table class="studio-table si-api-cost-dimensions">
      <thead><tr><th>${en ? "" : ""}</th><th>${en ? "Hosted API" : "API"}</th><th>${en ? "Self-hosted" : "자체 구축"}</th></tr></thead>
      <tbody>
        <tr><td>${en ? "Upfront cost" : "초기 비용"}</td><td class="is-favorable">${en ? "None -- pay only for usage" : "없음 (사용한 만큼만 지불)"}</td><td>${en ? `${studioMoney(recommended.purchaseKrw)} upfront` : `${studioMoney(recommended.purchaseKrw)} 선구매 필요`}</td></tr>
        <tr><td>${en ? "Data leaves the premises" : "데이터 외부 전송"}</td><td>${en ? "Every request goes to the provider's servers" : "요청마다 제공사 서버로 전송됨"}</td><td class="is-favorable">${en ? "Stays on-site -- no request leaves the network" : "사내에서만 처리 (외부 전송 없음)"}</td></tr>
        <tr><td>${en ? "Operational burden" : "운영 부담"}</td><td class="is-favorable">${en ? "None -- the provider runs it" : "없음 (제공사가 운영)"}</td><td>${en ? "You install, run, and maintain it" : "직접 설치·운영·유지보수 필요"}</td></tr>
      </tbody>
    </table></div>`;
  return `
    <div class="si-api-cost-bridge">
      <div><span class="section-kicker">${en ? "BUILD VS BUY" : "자체 구축 vs API"}</span><h3>${en ? "Same usage, hosted-API cost" : "같은 사용량 기준 API 이용료"}</h3>
      <p>${en ? `Recommended option's 3-year TCO works out to about ${studioMoney(monthlyHardwareKrw)}/month. At this usage level (~${Math.round(monthlyRequests).toLocaleString("en-US")} requests/month), the cheapest tracked hosted API (${cheapest.name}) would cost about ${studioMoney(cheapest.monthlyCostKrw)}/month.`
        : `추천 구성의 3년 TCO를 월 환산하면 약 ${studioMoney(monthlyHardwareKrw)}입니다. 이 사용량(월 약 ${Math.round(monthlyRequests).toLocaleString("ko-KR")}건) 기준으로, 추적 중인 API 중 가장 저렴한 ${cheapest.name}는 월 약 ${studioMoney(cheapest.monthlyCostKrw)}로 예상됩니다.`}</p>
      <p class="si-api-cost-verdict">${cheaperThanHardware
        ? (en ? "At this usage level, the hosted API looks cheaper on a pure monthly-cost basis -- though self-hosting may still win on data control, latency, or very high sustained volume." : "이 사용량에서는 단순 월 비용만 보면 API가 더 저렴합니다 -- 다만 데이터 통제, 지연시간, 매우 높은 지속 사용량에서는 자체 구축이 더 유리할 수 있습니다.")
        : (en ? "At this usage level, self-hosting looks cheaper on a pure monthly-cost basis over the 3-year horizon." : "이 사용량에서는 3년 기준으로 볼 때 자체 구축이 단순 월 비용 면에서 더 저렴합니다.")}</p>
      ${breakevenSentence ? `<p class="si-api-cost-breakeven">${breakevenSentence}</p>` : ""}
      ${scaleTable}
      <p class="api-cost-payback">${paybackSentence}</p>
      ${yearTable}
      <p class="api-cost-disclaimer">${qualityDisclaimer}</p>
      ${dimensionsTable}
      <button type="button" class="ghost-button" data-core-task="apiCost">${en ? "Compare all tracked API models →" : "추적 중인 API 전체 비교하기 →"}</button>
      </div>
    </div>`;
}

function renderStudioConsulting() {
  const en = uiLanguage === "en";
  const { model, plans } = calculateSiSizing();
  if (studioState.siReadOnly) return renderCustomerProposal(model, plans);
  const activeScenario = SI_SCENARIOS[studioState.siScenario] || SI_SCENARIOS["internal-rag"];
  const projectValue = en && studioState.siProjectName.startsWith(activeScenario.ko) ? activeScenario.en : studioState.siProjectName;
  const purposeValue = en && studioState.siPurpose === activeScenario.purpose ? activeScenario.purposeEn : studioState.siPurpose;
  const industryValue = en
    ? (studioState.siIndustry === "제조·일반기업" ? "Manufacturing / general business" : studioState.siIndustry)
    : (studioState.siIndustry === "Manufacturing / general business" ? "제조·일반기업" : studioState.siIndustry);
  const modelOptions = getAllModels().filter((item) => ["generative", "llm", "vlm", "ocr"].includes(item.type || "generative"));
  return `
    <div class="si-input-mode-switch"><button type="button" data-si-input-mode="simple" class="${studioState.siInputMode === "simple" ? "is-active" : ""}">${en ? "Easy estimate" : "간편 견적"}</button><button type="button" data-si-input-mode="expert" class="${studioState.siInputMode === "expert" ? "is-active" : ""}">${en ? "Detailed estimate" : "상세 견적"}</button></div>
    ${renderV49Readiness(model, plans)}
    ${studioState.siInputMode === "simple" ? renderSimpleSizingWizard(model, plans) : ""}
    <div class="si-intro">
      <div><span class="section-kicker">v3.1 PRE-SALES</span><h3>${en ? "AI infrastructure sizing consultation" : "AI 인프라 사전 견적 상담"}</h3>
      <p>${en ? "Turn customer workload assumptions into three reviewable infrastructure options." : "고객 요구와 트래픽 가정을 검토 가능한 인프라 3안으로 변환합니다."}</p></div>
      <div class="si-presets">${Object.entries(SI_SCENARIOS).map(([id, row]) => `<button type="button" data-si-preset="${id}" class="${studioState.siScenario === id ? "is-active" : ""}">${en ? row.en : row.ko}</button>`).join("")}</div>
    </div>
    ${studioState.siInputMode === "expert" ? renderSiBaselineGuide(activeScenario) : ""}
    <details id="siRequirements" class="si-expert-form" ${studioState.siInputMode === "expert" ? "open" : ""}><summary>${en ? "Customer and workload details" : "고객·워크로드 상세 입력"}</summary><div class="studio-question-grid si-question-grid">
      <label><span>${en ? "Proposal company" : "제안 회사"}</span><input id="siCompanyName" value="${platformEscape(studioState.siCompanyName)}"></label>
      <label><span>${en ? "Customer" : "고객사"}</span><input id="siCustomerName" value="${platformEscape(studioState.siCustomerName)}"></label>
      <label class="studio-wide"><span>${en ? "Project name" : "프로젝트명"}</span><input id="siProjectName" value="${platformEscape(projectValue)}"></label>
      <label class="studio-wide"><span>${en ? "Business purpose" : "구축 목적"}</span><input id="siPurpose" value="${platformEscape(purposeValue)}"></label>
      <label><span>${en ? "Customer industry" : "고객 업종"}</span><input id="siIndustry" value="${platformEscape(industryValue)}"></label>
      <label><span>${en ? "Consultant / owner" : "상담 담당자"}</span><input id="siContact" value="${platformEscape(studioState.siContact)}" placeholder="${en ? "Name or team" : "이름 또는 조직"}"></label>
      <label><span>${en ? "Service type" : "서비스 유형"}</span><select id="siServiceType"><option value="rag" ${studioState.siServiceType === "rag" ? "selected" : ""}>RAG / Chatbot</option><option value="ocr" ${studioState.siServiceType === "ocr" ? "selected" : ""}>OCR / VLM</option><option value="image" ${studioState.siServiceType === "image" ? "selected" : ""}>${en ? "Image generation" : "이미지 생성"}</option><option value="video" ${studioState.siServiceType === "video" ? "selected" : ""}>${en ? "Video generation" : "영상 생성"}</option><option value="voice" ${studioState.siServiceType === "voice" ? "selected" : ""}>${en ? "Voice AI (STT + LLM + TTS)" : "음성 AI (STT + LLM + TTS)"}</option><option value="avatar" ${studioState.siServiceType === "avatar" ? "selected" : ""}>${en ? "Avatar chat" : "AI 아바타 채팅"}</option></select></label>
      <label><span>${en ? "External data transfer" : "데이터 외부 반출"}</span><select id="siExportAllowed"><option value="false" ${!studioState.siExportAllowed ? "selected" : ""}>${en ? "Not allowed" : "불가"}</option><option value="true" ${studioState.siExportAllowed ? "selected" : ""}>${en ? "Allowed" : "허용"}</option></select></label>
      <label class="studio-wide"><span>${en ? "Primary model" : "주 모델"}</span><select id="siModel">${modelOptions.map((item) => `<option value="${platformEscape(modelKey(item))}" ${modelKey(item) === modelKey(model) ? "selected" : ""}>${platformEscape(item.name)}</option>`).join("")}</select></label>
      <label><span>${en ? "Deployment" : "구축 방식"}</span><select id="siDeployment"><option value="onprem" ${studioState.siDeployment === "onprem" ? "selected" : ""}>${en ? "On-premises" : "온프레미스"}</option><option value="cloud" ${studioState.siDeployment === "cloud" ? "selected" : ""}>${en ? "Cloud" : "클라우드"}</option><option value="compare" ${studioState.siDeployment === "compare" ? "selected" : ""}>${en ? "Compare both" : "온프레미스·클라우드 비교"}</option></select></label>
      <label><span>${en ? "Security" : "보안 수준"}</span><select id="siSecurity"><option value="standard" ${studioState.siSecurity === "standard" ? "selected" : ""}>${en ? "Standard" : "일반"}</option><option value="restricted" ${studioState.siSecurity === "restricted" ? "selected" : ""}>${en ? "Restricted network" : "내부망"}</option><option value="airgap" ${studioState.siSecurity === "airgap" ? "selected" : ""}>${en ? "Air-gapped" : "폐쇄망"}</option></select></label>
      <label><span>${en ? "Total users" : "전체 사용자"}</span><input id="siTotalUsers" type="number" min="1" value="${studioState.siTotalUsers}"></label>
      <label><span>${en ? "Concurrent requests" : "동시 요청"} <button type="button" class="term-help" data-tooltip="${en ? "People or requests using the AI at the same moment, not the total registered users." : "전체 가입자가 아니라 같은 순간에 AI를 요청하는 사람 수입니다."}" aria-label="${en ? "Explain concurrent requests" : "동시 사용자 설명"}">?</button></span><input id="siConcurrency" type="number" min="1" value="${studioState.siConcurrency}"></label>
      <label><span>QPS</span><input id="siQps" type="number" min="0.01" step="0.01" value="${studioState.siQps}"></label>
      <label><span>${en ? "Average input tokens" : "평균 입력 토큰"}</span><input id="siInputTokens" type="number" min="128" step="128" value="${studioState.siInputTokens}"></label>
      <label><span>${en ? "Maximum input tokens" : "최대 입력 토큰"} <button type="button" class="term-help" data-tooltip="${en ? "The largest prompt or document length processed in one request." : "한 번의 요청에서 읽는 대화·문서의 최대 분량입니다."}" aria-label="${en ? "Explain context length" : "컨텍스트 설명"}">?</button></span><input id="siMaxInputTokens" type="number" min="128" step="128" value="${studioState.siMaxInputTokens}"></label>
      <label><span>${en ? "Average output tokens" : "평균 출력 토큰"}</span><input id="siOutputTokens" type="number" min="32" step="32" value="${studioState.siOutputTokens}"></label>
      <label><span>${en ? "TTFT p95 (sec)" : "TTFT p95 (초)"} <button type="button" class="term-help" data-tooltip="${en ? "The time until the first answer token appears for 95% of requests." : "요청 95%에서 답변 첫 글자가 나오기까지의 시간입니다."}" aria-label="${en ? "Explain TTFT" : "TTFT 설명"}">?</button></span><input id="siTtftP95" type="number" min="0.1" step="0.1" value="${studioState.siTtftP95}"></label>
      <label><span>${en ? "Target response (sec)" : "목표 응답시간 (초)"}</span><input id="siTargetSeconds" type="number" min="1" value="${studioState.siTargetSeconds}"></label>
      <label><span>${en ? "Total latency p95 (sec)" : "전체 지연 p95 (초)"}</span><input id="siLatencyP95" type="number" min="1" value="${studioState.siLatencyP95}"></label>
      <label><span>${en ? "Operation hours / day" : "일 운영시간"}</span><input id="siOperatingHours" type="number" min="1" max="24" value="${studioState.siOperatingHours}"></label>
      <label><span>${en ? "Availability" : "가용성"} <button type="button" class="term-help" data-tooltip="${en ? "Whether service must continue when one server or GPU fails." : "서버나 GPU 한 대가 멈춰도 서비스를 유지할지 정합니다."}" aria-label="${en ? "Explain availability" : "가용성 설명"}">?</button></span><select id="siAvailability"><option value="single" ${studioState.siAvailability === "single" ? "selected" : ""}>${en ? "Single system" : "단일 구성"}</option><option value="ha" ${studioState.siAvailability === "ha" ? "selected" : ""}>HA</option><option value="nplus1" ${studioState.siAvailability === "nplus1" ? "selected" : ""}>N+1</option></select></label>
      <label><span>${en ? "Growth reserve (%)" : "증가 여유 (%)"}</span><input id="siGrowthPct" type="number" min="0" max="200" value="${studioState.siGrowthPct}"></label>
      <label><span>${en ? "Vector data (GB)" : "벡터 데이터 (GB)"}</span><input id="siVectorDataGb" type="number" min="0" value="${studioState.siVectorDataGb}"></label>
      <label><span>${en ? "Logs per day (GB)" : "일 로그 (GB)"}</span><input id="siLogGbDay" type="number" min="0" value="${studioState.siLogGbDay}"></label>
      <label><span>${en ? "Retention days" : "보관 일수"}</span><input id="siRetentionDays" type="number" min="1" value="${studioState.siRetentionDays}"></label>
      <label class="studio-check"><input id="siDevProd" type="checkbox" ${studioState.siDevProd ? "checked" : ""}><span>${en ? "Separate dev and production" : "개발계·운영계 분리"}</span></label>
    </div></details>
    <details class="si-advanced"><summary>${en ? "Infrastructure and operating assumptions" : "인프라·운영 조건 상세"}</summary><div class="studio-question-grid">
      <label><span>PCIe</span><select id="siPcieGen"><option value="gen4" ${studioState.siPcieGen === "gen4" ? "selected" : ""}>Gen 4</option><option value="gen5" ${studioState.siPcieGen === "gen5" ? "selected" : ""}>Gen 5</option></select></label>
      <label><span>${en ? "Network fabric" : "네트워크 패브릭"}</span><select id="siNetworkFabric"><option value="ethernet" ${studioState.siNetworkFabric === "ethernet" ? "selected" : ""}>Ethernet</option><option value="infiniband" ${studioState.siNetworkFabric === "infiniband" ? "selected" : ""}>InfiniBand</option></select></label>
      <label><span>${en ? "Backup" : "백업"}</span><select id="siBackup"><option value="none" ${studioState.siBackup === "none" ? "selected" : ""}>${en ? "None" : "없음"}</option><option value="daily" ${studioState.siBackup === "daily" ? "selected" : ""}>${en ? "Daily" : "일 1회"}</option><option value="continuous" ${studioState.siBackup === "continuous" ? "selected" : ""}>${en ? "Continuous" : "연속 복제"}</option></select></label>
      <label><span>${en ? "Monitoring" : "모니터링"}</span><select id="siMonitoring"><option value="standard" ${studioState.siMonitoring === "standard" ? "selected" : ""}>GPU / latency / error</option><option value="enterprise" ${studioState.siMonitoring === "enterprise" ? "selected" : ""}>${en ? "Enterprise + audit" : "통합 관제·감사"}</option></select></label>
      <label><span>${en ? "Cooling" : "냉각"}</span><select id="siCooling"><option value="air" ${studioState.siCooling === "air" ? "selected" : ""}>${en ? "Air cooling" : "공랭"}</option><option value="liquid" ${studioState.siCooling === "liquid" ? "selected" : ""}>${en ? "Liquid cooling review" : "수랭 검토"}</option></select></label>
      <label><span>UPS (${en ? "minutes" : "분"})</span><input id="siUpsMinutes" type="number" min="0" value="${studioState.siUpsMinutes}"></label>
      <label><span>${en ? "Electricity (USD/kWh)" : "전력 단가 (원/kWh)"}</span><input id="siElectricityKrw" type="number" min="0" step="${en ? 0.01 : 1}" value="${studioDisplayFromKrw(studioState.siElectricityKrw)}"></label>
      <label><span>${en ? "Annual maintenance (%)" : "연 유지보수율 (%)"}</span><input id="siMaintenancePct" type="number" min="0" max="100" value="${studioState.siMaintenancePct}"></label>
    </div></details>
    ${studioState.siInputMode === "expert" ? `${renderEditableSiBom(plans.find((plan) => plan.id === studioState.siSelectedPlan) || plans[1] || plans[0])}${renderV44V48Modules(model, plans)}` : ""}
    <div id="siPlans" class="si-plan-grid">${plans.map((plan) => {
      const pricing = calculateSiCommercial(plan);
      const physicalVram = Number(plan.gpu.gpuUsableMemoryGb || plan.gpu.vram || 0) * plan.gpuCount;
      const headroomGb = Math.max(0, physicalVram - plan.requiredGb);
      const fit = siPlanFit(plan);
      const confidenceLabel = window.AIHardwareLocale?.confidence(plan.confidence, en ? "en" : "ko") || plan.confidence;
      const reason = plan.id === "economy"
        ? (en ? "Lowest initial cost with a smaller operating reserve." : "운영 여유를 줄여 초기 도입비를 낮춘 구성입니다.")
        : plan.id === "scalable"
          ? (en ? "More capacity for traffic growth and failover." : "트래픽 증가와 장애 대응 여유를 크게 확보한 구성입니다.")
          : (en ? "Balanced cost, availability, and growth reserve." : "비용·가용성·성장 여유를 균형 있게 반영한 구성입니다.");
      return `<article class="si-plan-card ${plan.id === "recommended" ? "is-featured" : ""} ${studioState.siSelectedPlan === plan.id ? "is-selected" : ""}" data-si-plan="${plan.id}" role="button" tabindex="0" aria-pressed="${studioState.siSelectedPlan === plan.id}">
        <div class="si-plan-card-head"><span class="si-plan-kind">${en ? plan.en : plan.ko}</span><span class="si-plan-fit ${fit.valid ? "is-fit" : "is-review"}" title="${platformEscape(fit.checks.filter((check) => !check.ok).map((check) => check.label).join(", "))}">${fit.valid ? (en ? "Fits" : "조건 충족") : (en ? "Review" : "검토 필요")} ${fit.passed}/${fit.total}</span><span class="si-plan-selected">${studioState.siSelectedPlan === plan.id ? (en ? "Selected ✓" : "선택됨 ✓") : (en ? "Select option" : "구성 선택")}</span></div>
        <h3>${platformEscape(shortGpuName(plan.gpu.name))} × ${plan.gpuCount}</h3>
        <div class="si-decision-metrics">
          <span><small>${en ? "Estimated proposal" : "총 예상 가격"}</small><strong>${studioMoney(pricing.finalPrice)}</strong></span>
          <span><small>GPU</small><strong>${platformEscape(shortGpuName(plan.gpu.name))} × ${plan.gpuCount}</strong></span>
          <span><small>${en ? "Concurrent users" : "예상 동시 사용자"}</small><strong>${plan.capacity}${en ? "" : "명"}</strong></span>
          <span><small>${en ? "VRAM headroom" : "VRAM 여유"}</small><strong>${headroomGb.toFixed(1)}GB</strong></span>
          <span><small>${en ? "Facility power" : "소비전력"}</small><strong>${plan.powerW.toLocaleString()}W+</strong></span>
          <span><small>${en ? "Evidence" : "신뢰도"}</small><strong>${plan.evidenceKind === "estimate" ? (en ? "Calculated estimate" : "계산 추정") : (en ? "External reference" : "외부 공개 참고값")} · ${confidenceLabel}</strong></span>
        </div>
        <p class="si-plan-reason">${platformEscape(reason)}</p>
        <small class="si-plan-error-note" title="${platformEscape(en ? "No matching measurements: calculated from VRAM and bandwidth." : plan.confidenceReason)}">${en ? "Expected error" : "예상 오차"} ±${plan.expectedErrorPct}% · ${en ? `${plan.speedLow.toFixed(0)}–${plan.speedHigh.toFixed(0)} tok/s` : `예상 ${plan.speedLow.toFixed(0)}~${plan.speedHigh.toFixed(0)} tok/s`}</small>
        <span class="si-plan-open">${en ? "Open infrastructure, cost, and source details →" : "CPU·RAM·스토리지·가격 근거 상세 보기 →"}</span>
      </article>`;
    }).join("")}</div>
    ${renderApiCostComparison(plans)}
    ${renderSelectedPlanDetail(model, plans)}
    ${window.AIHardwareDecisionGuidance?.render(plans, studioState, en ? "en" : "ko") || ""}
    <div id="siDeliverables" class="si-output-grid">
      <article><h3>${en ? "Proposal rationale" : "제안 근거"}</h3><ul>
        <li>${en ? "Resident model memory, runtime overhead, and KV cache are included." : "모델 상주 메모리·런타임 오버헤드·KV cache를 반영했습니다."}</li>
        <li>${en ? `${studioState.siGrowthPct}% growth reserve and ${studioState.siAvailability.toUpperCase()} availability are applied.` : `트래픽 ${studioState.siGrowthPct}% 증가 여유와 ${studioState.siAvailability.toUpperCase()} 가용성 조건을 적용했습니다.`}</li>
        <li>${en ? "CPU, RAM, NVMe, network, and facility power are preliminary sizing values." : "CPU·RAM·NVMe·네트워크·설비 전력은 사전 산정값입니다."}</li>
      </ul></article>
      <article><h3>${en ? "PoC acceptance checklist" : "PoC 검증 체크리스트"}</h3><ul class="si-checklist">
        <li>□ ${en ? "Confirm model version, quantization, and runtime" : "모델 버전·양자화·런타임 확정"}</li><li>□ ${en ? "Measure TTFT and tokens/s with representative prompts" : "대표 프롬프트로 TTFT·tokens/s 측정"}</li>
        <li>□ ${en ? "Load-test target concurrency and queueing" : "목표 동시 요청·대기열 부하 테스트"}</li><li>□ ${en ? "Validate failover, monitoring, and 30% growth" : "장애 전환·모니터링·30% 성장 검증"}</li>
      </ul></article>
    </div>
    <div class="si-deliverable-grid">
      <article><span class="section-kicker">v3.2</span><h3>${en ? "Server topology and model placement" : "서버 토폴로지·모델 배치"}</h3>
        ${plans.map((plan) => `<div class="si-topology-row"><strong>${en ? plan.en : plan.ko}</strong><span>${plan.nodes} server × ${plan.gpuPerServer} GPU</span><span>${platformEscape(plan.placement)}</span><span>${en ? "Failure" : "장애"}: ${plan.failoverCapacity}/${plan.capacity}</span></div>`).join("")}
      </article>
      <article><span class="section-kicker">v3.3</span><h3>${en ? "BOM and operations" : "인프라 BOM·운영 조건"}</h3>
        <div class="si-bom-grid"><span>PCIe ${studioState.siPcieGen.replace("gen", "Gen ")}</span><span>${studioState.siNetworkFabric === "infiniband" ? "InfiniBand" : "Ethernet"} · 25/100/200/400GbE</span><span>${en ? "NVLink/NVSwitch: vendor topology check" : "NVLink/NVSwitch: 벤더 토폴로지 확인"}</span><span>${en ? `Backup: ${studioState.siBackup}` : `백업: ${studioState.siBackup}`}</span><span>${en ? `Monitoring: ${studioState.siMonitoring}` : `모니터링: ${studioState.siMonitoring}`}</span><span>${en ? `Cooling: ${studioState.siCooling}` : `냉각: ${studioState.siCooling}`}</span><span>UPS ${studioState.siUpsMinutes} min</span><span>${en ? "Dev / validation / production separated" : "개발·검증·운영계 분리 검토"}</span></div>
      </article>
      <article><span class="section-kicker">v3.4</span><h3>${en ? "Cost and proposal outputs" : "비용·제안 산출물"}</h3>
        <div class="studio-table-wrap"><table class="studio-table"><thead><tr><th>${en ? "Option" : "구성안"}</th><th>${en ? "Purchase estimate" : "도입비 추정"}</th><th>${en ? "Annual energy" : "연 전력비"}</th><th>${en ? "3-year TCO" : "3년 TCO"}</th></tr></thead><tbody>${plans.map((plan) => `<tr><td>${en ? plan.en : plan.ko}</td><td>${studioMoney(plan.purchaseKrw)}</td><td>${studioMoney(plan.annualEnergyKrw)}</td><td><strong>${studioMoney(plan.threeYearTcoKrw)}</strong></td></tr>`).join("")}</tbody></table></div>
        <p>${en ? "Pricing is an editable planning assumption, not a vendor quote. Taxes, margin, licensing, installation, and support are excluded." : "가격은 편집 가능한 계획 가정이며 벤더 견적이 아닙니다. 세금·마진·라이선스·설치·지원 비용은 제외됩니다."}</p>
      </article>
      <article><span class="section-kicker">v3.5</span><h3>${en ? "Evidence confidence" : "근거별 신뢰도"}</h3>
        <div class="si-confidence-list"><span>${en ? "Model information" : "모델 정보"}<strong>${model.sourceUrl ? (en ? "Official/source-linked" : "출처 연결") : (en ? "Review" : "검토")}</strong></span><span>${en ? "GPU specification" : "GPU 사양"}<strong>${plans.every((p) => p.gpu.specStatus === "sourced") ? (en ? "Official" : "공식") : (en ? "Catalog/estimated" : "카탈로그·추정")}</strong></span><span>${en ? "VRAM calculation" : "VRAM 계산"}<strong>${en ? "Estimator" : "추정식"}</strong></span><span>${en ? "Throughput" : "처리량"}<strong>${plans.some((p) => p.sampleCount) ? (en ? "External reference" : "외부 참고") : (en ? "Pure estimate" : "순수 추정")}</strong></span><span>${en ? "Final decision" : "최종 판정"}<strong>${en ? "PoC required" : "PoC 필요"}</strong></span></div>
      </article>
    </div>
    <div class="si-poc-mode"><div><span class="section-kicker">POC MODE</span><h3>${en ? "Record validation results" : "실제 검증 결과 기록"}</h3><p>${en ? "Compare measured p95 latency, speed, errors, and stability with the sizing hypothesis." : "실측 p95 지연·속도·오류·장시간 안정성을 산정 가설과 비교합니다."}</p></div>
      <div class="studio-question-grid"><label><span>TTFT p95 (sec)</span><input id="siMeasuredTtft" type="number" min="0" step="0.1" value="${studioState.siMeasuredTtft}"></label><label><span>${en ? "Measured tok/s" : "실측 tok/s"}</span><input id="siMeasuredSpeed" type="number" min="0" step="0.1" value="${studioState.siMeasuredSpeed}"></label><label><span>${en ? "Error rate (%)" : "오류율 (%)"}</span><input id="siMeasuredErrorRate" type="number" min="0" step="0.01" value="${studioState.siMeasuredErrorRate}"></label><label><span>${en ? "Stability test (hours)" : "안정성 시험 (시간)"}</span><input id="siMeasuredHours" type="number" min="0" value="${studioState.siMeasuredHours}"></label></div>
      <p class="si-poc-verdict">${studioState.siMeasuredTtft > 0 ? (studioState.siMeasuredTtft <= studioState.siTtftP95 && studioState.siMeasuredErrorRate <= 1 && studioState.siMeasuredHours >= 24 ? (en ? "PoC hypothesis passed — review remaining operational checks." : "PoC 가설 통과 — 나머지 운영 검증을 확인하세요.") : (en ? "PoC adjustment required — revise model, replicas, or SLA assumptions." : "PoC 조정 필요 — 모델·복제 수·SLA 가정을 수정하세요.")) : (en ? "Enter measured values after the representative workload test." : "대표 워크로드 시험 후 실측값을 입력하세요.")}</p>
    </div>
    ${renderV38V42Modules(model, plans)}
    <div class="si-actions"><button type="button" class="primary-button" data-si-export>${en ? "Excel workbook" : "Excel 기초표"}</button>
      <a class="ghost-button" href="./docs/examples/si-sizing-example.xlsx" download>${en ? "Editable .xlsx template" : "편집용 .xlsx 템플릿"}</a>
      <button type="button" class="ghost-button" data-si-print>${en ? "Print / save PDF" : "제안서 인쇄·PDF"}</button>
      <button type="button" class="ghost-button" data-si-deploy>${en ? "Deployment draft" : "배포 초안"}</button>
      <button type="button" class="ghost-button" data-share-studio>${en ? "Copy case link" : "사례 링크 복사"}</button>
      <button type="button" class="ghost-button" data-si-proposal>${en ? "Open customer result" : "고객용 결과 열기"}</button></div>
    <p class="studio-form-note">${en ? "Pre-sales estimate only. Final quantities require vendor validation and a workload PoC." : "사전 상담용 추정치입니다. 최종 수량은 벤더 검토와 실제 워크로드 PoC 후 확정해야 합니다."}</p>`;
}

function siXmlEscape(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function downloadSiWorkbook() {
  const { model, plans } = calculateSiSizing();
  const en = uiLanguage === "en";
  const t = (ko, english) => en ? english : ko;
  const rows = plans.map((plan) => [en ? plan.en : plan.ko, plan.gpu.name, plan.gpuCount, plan.productionGpuCount || plan.gpuCount, plan.reserveGpuCount || 0, plan.nodes, plan.cpuCores, plan.ramGb, plan.storageTb, plan.network, plan.powerW, en ? ({ 높음: "High", 중간: "Medium", 낮음: "Low" }[plan.confidence] || plan.confidence) : plan.confidence, plan.sampleCount]);
  const selected = plans.find((plan) => plan.id === studioState.siSelectedPlan) || plans[1] || plans[0];
  const bom = siEditableBom(selected);
  const validation = validateSiBom(selected, bom);
  const commercial = calculateSiCommercial(selected, bom);
  const topology = commercial.topology;
  const bomRows = [
    [t("구분", "Type"), t("제품", "Product"), t("단가", "Unit price"), t("수량", "Quantity"), t("소계", "Subtotal")],
    ["GPU", selected.gpu.name, bom.gpuUnitKrw, selected.gpuCount, bom.gpuTotal],
    ...bom.rows.map((row) => [row.label, row.item.name, row.item.priceKrw, row.quantity, row.subtotal]),
    [t("추가 비용", "Additional costs"), t("설치·라이선스·지원", "Installation, licensing, and support"), bom.extra, 1, bom.extra],
    [t("합계", "Total"), "", "", "", bom.total],
  ];
  const worksheet = (name, values) => `<Worksheet ss:Name="${siXmlEscape(name)}"><Table>${values.map((row) => `<Row>${row.map((cell) => `<Cell><Data ss:Type="${typeof cell === "number" ? "Number" : "String"}">${siXmlEscape(cell)}</Data></Cell>`).join("")}</Row>`).join("")}</Table></Worksheet>`;
  const sheets = [
    [t("고객 요구사항", "Requirements"), [[t("항목", "Field"), t("값", "Value")], [t("프로젝트", "Project"), studioState.siProjectName], [t("목적", "Purpose"), studioState.siPurpose], [t("모델", "Model"), model.name], [t("전체 사용자", "Total users"), studioState.siTotalUsers], [t("동시 요청", "Concurrent requests"), studioState.siConcurrency], ["QPS", studioState.siQps], [t("입력 토큰", "Input tokens"), studioState.siInputTokens], [t("출력 토큰", "Output tokens"), studioState.siOutputTokens], [t("가용성", "Availability"), studioState.siAvailability], [t("성장 여유", "Growth reserve"), `${studioState.siGrowthPct}%`]]],
    [t("구성안 비교", "Plan comparison"), [[t("구성안", "Plan"), "GPU", t("총 GPU", "Total GPUs"), t("운영 GPU", "Production GPUs"), t("예비 GPU", "Reserve GPUs"), t("노드", "Nodes"), t("CPU 코어", "CPU cores"), "RAM GB", "NVMe TB", t("네트워크", "Network"), t("전력 W", "Power W"), t("신뢰도", "Confidence"), t("표본 수", "Samples")], ...rows]],
    [t("편집 BOM", "Editable BOM"), bomRows],
    [t("상업 견적", "Commercial quote"), [[t("항목", "Field"), t("값", "Value")], [t("공급사", "Supplier"), studioState.siSupplierName], [t("공급사 견적번호", "Supplier quote number"), studioState.siSupplierQuoteNo], [t("가격 기준", "Price basis"), studioState.siPriceBasis], [t("가격 확인일", "Price date"), studioState.siPriceDate], [t("유효기한", "Valid until"), commercial.validUntil], [t("카탈로그·기반시설", "Catalog and infrastructure"), commercial.listPrice], [t("할인", "Discount"), commercial.discount], [t("마진", "Margin"), commercial.margin], [t("부가세", "VAT"), commercial.vat], [t("최종 제안가", "Final proposal price"), commercial.finalPrice]]],
    [t("랙·전원·네트워크", "Rack power network"), [[t("항목", "Field"), t("값", "Value")], [t("랙", "Racks"), topology.racks], [t("총 사용 U", "Total rack units"), topology.totalU], [t("스위치 속도", "Switch speed"), `${topology.switchSpeed}GbE`], [t("스위치 수", "Switches"), topology.switchCount], [t("NIC 링크", "NIC links"), topology.nicLinks], [t("광모듈", "Optics"), topology.optics], [t("케이블", "Cables"), topology.cables], [t("PDU 회로", "PDU circuits"), topology.pduCircuits], [t("냉각 kW", "Cooling kW"), topology.coolingKw], [t("기반시설 비용", "Infrastructure cost"), topology.accessoryCost]]],
    [t("검증·승인", "Validation and approval"), [[t("항목", "Field"), t("값", "Value")], [t("BOM 통과", "BOM checks"), `${validation.passed}/${validation.total}`], [t("상태", "Status"), studioState.siQuoteStatus], [t("담당자", "Owner"), studioState.siContact], [t("검토자", "Reviewer"), studioState.siReviewer], [t("승인자", "Approver"), studioState.siApprover], [t("승인 시각", "Approved at"), studioState.siApprovedAt], ...validation.checks.map((check) => [en ? check.en : check.ko, check.ok ? t("통과", "Pass") : `${t("경고", "Warning")}: ${check.detail}`])]],
    [t("가정 및 PoC", "Assumptions and PoC"), [[t("구분", "Type"), t("내용", "Details")], [t("가정", "Assumption"), t("모델 메모리·KV cache·런타임 오버헤드와 성장 여유를 포함한 사전 산정", "Preliminary sizing includes model memory, KV cache, runtime overhead, and growth reserve.")], [t("주의", "Caution"), t("최종 수량은 벤더 검토와 실제 워크로드 PoC 후 확정", "Final quantities require vendor review and a representative workload PoC.")], ["PoC 1", t("모델 버전·양자화·런타임 확정", "Confirm model version, quantization, and runtime")], ["PoC 2", t("대표 프롬프트 TTFT·tokens/s 측정", "Measure TTFT and tokens/s with representative prompts")], ["PoC 3", t("동시 요청·대기열 부하 테스트", "Load-test concurrency and queueing")], ["PoC 4", t("장애 전환·모니터링 검증", "Validate failover and monitoring")]]],
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${sheets.map(([name, values]) => worksheet(name, values)).join("")}</Workbook>`;
  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${(studioState.siProjectName || "ai-infra-sizing").replace(/[\\/:*?"<>|]/g, "-")}-${en ? "en" : "ko"}.xls`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function downloadSiDeployment() {
  const { model, plans } = calculateSiSizing();
  const selected = plans.find((plan) => plan.id === "recommended") || plans[0];
  const content = `# AI Infra Sizing deployment draft
# Pre-sales hypothesis only — validate image, model, runtime and topology in a PoC.
services:
  inference:
    image: vllm/vllm-openai:latest
    command: --model "${safeModelRepo(model)}" --tensor-parallel-size ${Math.max(1, selected.gpuPerServer)}
    deploy:
      replicas: ${Math.max(1, selected.nodes)}
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: ${selected.gpuPerServer}
              capabilities: [gpu]
    ports: ["8000:8000"]
    volumes: ["./models:/models", "./logs:/logs"]
  monitoring:
    image: prom/prometheus:latest
    ports: ["9090:9090"]
# Required review: ${studioState.siNetworkFabric}, PCIe ${studioState.siPcieGen}, ${selected.network}, backup=${studioState.siBackup}
`;
  const blob = new Blob([content], { type: "text/yaml;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "docker-compose.sizing-draft.yml";
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function ensureDecisionStudio() {
  if ($("decisionStudio")) return $("decisionStudio");
  const panel = document.createElement("section");
  panel.id = "decisionStudio";
  panel.className = "decision-studio";
  panel.setAttribute("aria-labelledby", "decisionStudioTitle");
  panel.innerHTML = `
    <div class="decision-studio-head">
      <div><span class="section-kicker">v6.6</span><h2 id="decisionStudioTitle"></h2><p id="decisionStudioNote"></p></div>
      <div class="decision-studio-tabs" role="tablist"></div>
    </div>
    <div id="decisionStudioBody" class="decision-studio-body" aria-live="polite"></div>`;
  const hub = $("decisionHub");
  if (hub?.parentNode) hub.parentNode.insertBefore(panel, hub);
  else document.querySelector(".app-shell")?.appendChild(panel);
  return panel;
}

function shareableStudioState() {
  return Object.fromEntries(Object.entries(studioState).filter(([key, value]) =>
    (key === "tab" || key === "modelKey" || key.startsWith("si"))
    && value !== STUDIO_DEFAULT_STATE[key]));
}

function syncStudioUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("studio", studioState.tab);
  url.searchParams.set("schema", "3");
  url.searchParams.set("studioState", JSON.stringify(shareableStudioState()));
  history.replaceState({}, "", url);
  try {
    localStorage.setItem(SIZING_DRAFT_KEY, JSON.stringify({
      schemaVersion: 3,
      savedAt: new Date().toISOString(),
      state: shareableStudioState(),
    }));
  } catch {}
}

function renderDecisionStudio() {
  const panel = ensureDecisionStudio();
  const infraActive = typeof coreTaskMode !== "undefined" && coreTaskMode === "infra";
  panel.hidden = !infraActive;
  panel.classList.toggle("is-infra-workspace", infraActive);
  panel.classList.toggle("is-simple-sizing", infraActive && studioState.siInputMode === "simple");
  panel.classList.toggle("is-readonly-proposal", Boolean(studioState.siReadOnly));
  panel.dataset.wizardStep = String(Math.max(1, Math.min(4, Number(studioState.siWizardStep) || 1)));
  $("decisionStudioTitle").textContent = studioCopy("title");
  $("decisionStudioNote").textContent = studioCopy("note");
  const tabs = ["consulting", "recommend", "market", "custom", "parts", "runtime", "community"];
  panel.querySelector(".decision-studio-tabs").hidden = Boolean(studioState.siReadOnly);
  panel.querySelector(".decision-studio-tabs").innerHTML = tabs.map((id) =>
    `<button type="button" role="tab" data-studio-tab="${id}" aria-selected="${studioState.tab === id}" class="${studioState.tab === id ? "is-active" : ""}">${studioCopy(id)}</button>`
  ).join("");
  const renderers = {
    consulting: renderStudioConsulting,
    recommend: renderStudioRecommend,
    market: renderStudioMarket,
    custom: renderStudioCustom,
    parts: renderStudioParts,
    runtime: renderStudioRuntime,
    community: renderStudioCommunity,
  };
  $("decisionStudioBody").innerHTML = renderers[studioState.tab]();
  decorateSiDetailedFields();
  if (studioState.tab === "consulting") {
    const { model, plans } = calculateSiSizing();
    applySiInputValidation(model, plans);
  }
  bindDecisionStudio();
  if (infraActive && studioState.siInputMode === "simple") {
    window.AIHardwareGuide?.render("infra", Math.max(0, Number(studioState.siWizardStep || 1) - 1));
  }
}

function updateStudio(key, value) {
  studioState[key] = value;
  if (["siTotalUsers", "siConcurrency", "siQps", "siInputTokens", "siMaxInputTokens", "siOutputTokens", "siTtftP95", "siTargetSeconds", "siLatencyP95", "siOperatingHours", "siAvailability", "siGrowthPct", "siVectorDataGb", "siLogGbDay", "siRetentionDays", "siDevProd"].includes(key)) {
    studioState.siBaselineProfile = "";
  }
  if (key === "category" && ["image", "video", "stt", "tts"].includes(value)) studioState.targetSpeed = 0;
  if (key === "siBudgetKrw") {
    const budget = Math.max(0, Number(value) || 0);
    if (budget > 0) {
      const { plans } = calculateSiSizing();
      const matches = plans.filter((plan) => plan.purchaseKrw <= budget);
      studioState.siSelectedPlan = (matches[matches.length - 1] || plans[0]).id;
    }
  }
  syncStudioUrl();
  renderDecisionStudio();
}

function bindDecisionStudio() {
  // renderApiCostComparison()'s bridge button lives inside decisionStudioBody,
  // which is fully rebuilt (innerHTML) on every render -- so it can't rely on
  // the one-time [data-core-task] binding that bindEvents() (app.js) set up
  // at init for the buttons that existed in the DOM at that point. Scope this
  // to #decisionStudioBody specifically so it doesn't double-bind the main
  // nav's own [data-core-task] buttons, which already have their listener.
  document.querySelectorAll("#decisionStudioBody [data-core-task]").forEach((button) => {
    button.addEventListener("click", () => setCoreTaskMode(button.dataset.coreTask));
  });
  const studioTabs = [...document.querySelectorAll("[data-studio-tab]")];
  studioTabs.forEach((button, index) => {
    button.addEventListener("click", () => updateStudio("tab", button.dataset.studioTab));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const offset = event.key === "ArrowRight" ? 1 : -1;
      const next = studioTabs[(index + offset + studioTabs.length) % studioTabs.length];
      next?.focus();
      next?.click();
    });
  });
  const fields = {
    studioCategory: ["category", String], studioModel: ["modelKey", String], studioTargetSpeed: ["targetSpeed", Number],
    studioBudget: ["budgetKrw", Number], siBudgetKrw: ["siBudgetKrw", Number], studioCondition: ["condition", String], studioFormFactor: ["formFactor", String],
    studioPower: ["powerLimitW", Number], studioNoise: ["noise", String], studioImageSize: ["imageSize", Number],
    studioVideoFrames: ["videoFrames", Number], customName: ["customName", String], customUrl: ["customUrl", String],
    customTotalB: ["customTotalB", Number], customActiveB: ["customActiveB", Number], customLayers: ["customLayers", Number],
    customBits: ["customBits", Number], customContext: ["customContext", Number], partsCpu: ["cpuId", String],
    partsBoard: ["motherboardId", String], partsPsu: ["psuId", String], partsCase: ["caseId", String],
    partsGpu: ["gpuId", String], partsRam: ["ramGb", Number], runtimeGpu: ["gpuId", String], runtimeOs: ["runtimeOs", String],
    siCompanyName: ["siCompanyName", String], siCustomerName: ["siCustomerName", String], siProjectName: ["siProjectName", String], siPurpose: ["siPurpose", String], siIndustry: ["siIndustry", String], siContact: ["siContact", String],
    siModel: ["modelKey", String],
    siDeployment: ["siDeployment", String], siSecurity: ["siSecurity", String], siServiceType: ["siServiceType", String], siTotalUsers: ["siTotalUsers", Number],
    siConcurrency: ["siConcurrency", Number], siQps: ["siQps", Number], siInputTokens: ["siInputTokens", Number], siMaxInputTokens: ["siMaxInputTokens", Number], siOutputTokens: ["siOutputTokens", Number],
    siTtftP95: ["siTtftP95", Number], siTargetSeconds: ["siTargetSeconds", Number], siLatencyP95: ["siLatencyP95", Number], siOperatingHours: ["siOperatingHours", Number], siAvailability: ["siAvailability", String], siGrowthPct: ["siGrowthPct", Number],
    siVectorDataGb: ["siVectorDataGb", Number], siLogGbDay: ["siLogGbDay", Number], siRetentionDays: ["siRetentionDays", Number],
    siPcieGen: ["siPcieGen", String], siNetworkFabric: ["siNetworkFabric", String], siBackup: ["siBackup", String],
    siMonitoring: ["siMonitoring", String], siCooling: ["siCooling", String], siUpsMinutes: ["siUpsMinutes", Number],
    siElectricityKrw: ["siElectricityKrw", Number], siMaintenancePct: ["siMaintenancePct", Number],
    siMeasuredTtft: ["siMeasuredTtft", Number], siMeasuredSpeed: ["siMeasuredSpeed", Number],
    siMeasuredErrorRate: ["siMeasuredErrorRate", Number], siMeasuredHours: ["siMeasuredHours", Number],
    siMaxBatch: ["siMaxBatch", Number], siMinReplicas: ["siMinReplicas", Number], siMaxReplicas: ["siMaxReplicas", Number],
    siBenchmarkRuntime: ["siBenchmarkRuntime", String], siBenchmarkPrompts: ["siBenchmarkPrompts", String],
    siBenchmarkOutputs: ["siBenchmarkOutputs", String], siBenchmarkConcurrency: ["siBenchmarkConcurrency", String],
    siUtilizationPct: ["siUtilizationPct", Number], siCloudHourlyUsd: ["siCloudHourlyUsd", Number],
    siFacilityKrwMonth: ["siFacilityKrwMonth", Number], siSupportPct: ["siSupportPct", Number],
    siBomCpuId: ["siBomCpuId", String], siBomCpuQty: ["siBomCpuQty", Number],
    siBomMotherboardId: ["siBomMotherboardId", String], siBomMotherboardQty: ["siBomMotherboardQty", Number],
    siBomMemoryId: ["siBomMemoryId", String], siBomMemoryQty: ["siBomMemoryQty", Number],
    siBomStorageId: ["siBomStorageId", String], siBomStorageQty: ["siBomStorageQty", Number],
    siBomNicId: ["siBomNicId", String], siBomNicQty: ["siBomNicQty", Number],
    siBomPsuId: ["siBomPsuId", String], siBomPsuQty: ["siBomPsuQty", Number],
    siBomUpsId: ["siBomUpsId", String], siBomUpsQty: ["siBomUpsQty", Number],
    siBomCaseId: ["siBomCaseId", String], siBomCaseQty: ["siBomCaseQty", Number],
    siBomExtraKrw: ["siBomExtraKrw", Number],
    siSupplierName: ["siSupplierName", String], siSupplierQuoteNo: ["siSupplierQuoteNo", String],
    siPriceBasis: ["siPriceBasis", String], siPriceDate: ["siPriceDate", String],
    siDiscountPct: ["siDiscountPct", Number], siMarginPct: ["siMarginPct", Number],
    siVatPct: ["siVatPct", Number], siExchangeRate: ["siExchangeRate", Number],
    siQuoteValidDays: ["siQuoteValidDays", Number], siQuoteStatus: ["siQuoteStatus", String],
    siWorkflowOwner: ["siContact", String], siReviewer: ["siReviewer", String], siApprover: ["siApprover", String],
    siRackCapacityU: ["siRackCapacityU", Number], siPduCircuitKw: ["siPduCircuitKw", Number],
    siCoolingPue: ["siCoolingPue", Number],
  };
  const krwDisplayFields = new Set(["studioBudget", "siBudgetKrw", "siElectricityKrw", "siFacilityKrwMonth", "siBomExtraKrw"]);
  const usdDisplayFields = new Set(["siCloudHourlyUsd"]);
  Object.entries(fields).forEach(([id, [key, cast]]) => $(id)?.addEventListener("change", (event) => {
    let value = cast(event.target.value);
    if (krwDisplayFields.has(id)) value = studioKrwFromDisplay(value);
    if (usdDisplayFields.has(id)) value = studioUsdFromDisplay(value);
    updateStudio(key, value);
  }));
  $("customVision")?.addEventListener("change", (event) => updateStudio("customVision", event.target.checked));
  $("siDevProd")?.addEventListener("change", (event) => updateStudio("siDevProd", event.target.checked));
  $("siStreaming")?.addEventListener("change", (event) => updateStudio("siStreaming", event.target.checked));
  $("siAutoscale")?.addEventListener("change", (event) => updateStudio("siAutoscale", event.target.checked));
  $("siSeparateNetworks")?.addEventListener("change", (event) => updateStudio("siSeparateNetworks", event.target.checked));
  document.querySelectorAll("[data-si-input-mode]").forEach((button) => button.addEventListener("click", () => {
    studioState.siInputMode = button.dataset.siInputMode;
    if (studioState.siInputMode === "simple") applySimpleSizingModelPreset();
    syncStudioUrl();
    renderDecisionStudio();
  }));
  document.querySelector("[data-si-wizard-next]")?.addEventListener("click", () => {
    studioState.siWizardStep = Math.min(4, Number(studioState.siWizardStep || 1) + 1);
    syncStudioUrl();
    renderDecisionStudio();
    $("decisionStudio")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  });
  document.querySelector("[data-si-wizard-back]")?.addEventListener("click", () => {
    studioState.siWizardStep = Math.max(1, Number(studioState.siWizardStep || 1) - 1);
    syncStudioUrl();
    renderDecisionStudio();
  });
  document.querySelector("[data-si-wizard-restart]")?.addEventListener("click", () => {
    studioState.siWizardStep = 1;
    syncStudioUrl();
    renderDecisionStudio();
  });
  document.querySelectorAll("[data-si-wizard-goto]").forEach((el) => {
    const goToStep = () => {
      studioState.siWizardStep = Math.max(1, Math.min(4, Number(el.dataset.siWizardGoto) || 1));
      syncStudioUrl();
      renderDecisionStudio();
    };
    el.addEventListener("click", goToStep);
    el.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      goToStep();
    });
  });
  document.querySelectorAll("[data-si-jump]").forEach((button) => button.addEventListener("click", () => {
    const targetId = button.dataset.siJump;
    if (targetId !== "siPlans" && studioState.siInputMode === "simple") {
      studioState.siInputMode = "expert";
      syncStudioUrl();
      renderDecisionStudio();
    }
    queueMicrotask(() => {
      const target = document.getElementById(targetId);
      if (!target) return;
      if (target.tagName === "DETAILS") target.open = true;
      target.scrollIntoView?.({ behavior: "smooth", block: "start" });
      const focusTarget = target.matches("button, input, select, [tabindex]")
        ? target
        : target.querySelector("summary, button, input, select, [tabindex]");
      focusTarget?.focus?.({ preventScroll: true });
    });
  }));
  document.querySelectorAll("[data-si-focus]").forEach((button) => button.addEventListener("click", () => {
    const control = document.getElementById(button.dataset.siFocus);
    if (!control) return;
    const details = control.closest("details");
    if (details) details.open = true;
    control.scrollIntoView?.({ behavior: "smooth", block: "center" });
    control.focus?.({ preventScroll: true });
  }));
  document.querySelector("[data-si-save-draft]")?.addEventListener("click", () => {
    localStorage.setItem(SIZING_DRAFT_KEY, JSON.stringify({
      schemaVersion: 3,
      savedAt: new Date().toISOString(),
      state: shareableStudioState(),
    }));
    window.AIHardwareUI?.announce(uiLanguage === "en" ? "Saved the browser draft." : "브라우저에 견적 초안을 저장했습니다.", "success");
  });
  document.querySelector("[data-si-share]")?.addEventListener("click", (event) => copyTextToClipboard(window.location.href, event.currentTarget));
  document.querySelectorAll(".term-help").forEach((button) => {
    const alignTooltip = () => {
      const rect = button.getBoundingClientRect();
      if (!rect.width) return;
      const panelRect = button.closest(".si-expert-form, .si-advanced, .decision-studio-body")?.getBoundingClientRect();
      const leftBoundary = Math.max(16, panelRect?.left ?? 16);
      const rightBoundary = Math.min(window.innerWidth - 16, panelRect?.right ?? window.innerWidth - 16);
      const tooltipWidth = Math.min(360, Math.max(160, rightBoundary - leftBoundary));
      const centeredLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
      const tooltipLeft = Math.min(Math.max(centeredLeft, leftBoundary), rightBoundary - tooltipWidth);
      button.style.setProperty("--term-tip-width", `${tooltipWidth}px`);
      button.style.setProperty("--term-tip-offset-x", `${tooltipLeft - rect.left}px`);
      button.classList.add("is-tip-positioned");
      button.classList.remove("is-tip-left", "is-tip-right");
      if (tooltipLeft <= leftBoundary + 1) {
        button.classList.add("is-tip-left");
      } else if (tooltipLeft + tooltipWidth >= rightBoundary - 1) {
        button.classList.add("is-tip-right");
      }
    };
    alignTooltip();
    button.addEventListener("mouseenter", alignTooltip);
    button.addEventListener("focus", alignTooltip);
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
  });
  document.querySelectorAll("[data-si-baseline]").forEach((button) => button.addEventListener("click", () => {
    const scenario = SI_SCENARIOS[studioState.siScenario] || SI_SCENARIOS["internal-rag"];
    Object.assign(studioState, siBaselineSnapshot(scenario, button.dataset.siBaseline));
    syncStudioUrl();
    renderDecisionStudio();
    window.AIHardwareUI?.announce(uiLanguage === "en" ? "The starting baseline was applied." : "권장 시작 기준을 적용했습니다.", "success");
  }));
  document.querySelectorAll("[data-si-quality]").forEach((button) => button.addEventListener("click", () => {
    studioState.siQualityPreset = button.dataset.siQuality;
    applySimpleSizingPreset();
    syncStudioUrl();
    renderDecisionStudio();
  }));
  document.querySelectorAll("[data-si-users]").forEach((button) => button.addEventListener("click", () => {
    studioState.siUserPreset = Number(button.dataset.siUsers);
    applySimpleSizingPreset();
    syncStudioUrl();
    renderDecisionStudio();
  }));
  $("siCustomUsers")?.addEventListener("change", (event) => {
    studioState.siUserPreset = Math.max(1, Math.round(Number(event.target.value) || 1));
    applySimpleSizingPreset();
    syncStudioUrl();
    renderDecisionStudio();
  });
  document.querySelectorAll("[data-si-deployment]").forEach((button) => button.addEventListener("click", () => updateStudio("siDeployment", button.dataset.siDeployment)));
  $("siExportAllowed")?.addEventListener("change", (event) => updateStudio("siExportAllowed", event.target.value === "true"));
  document.querySelectorAll("[data-si-preset]").forEach((button) => button.addEventListener("click", () => {
    const preset = SI_SCENARIOS[button.dataset.siPreset];
    studioState = {
      ...studioState, siScenario: button.dataset.siPreset, siProjectName: uiLanguage === "en" ? preset.en : preset.ko,
      siPurpose: uiLanguage === "en" ? preset.purposeEn : preset.purpose,
      siTotalUsers: preset.users, siConcurrency: preset.concurrency, siInputTokens: preset.input,
      siOutputTokens: preset.output, siTargetSeconds: preset.seconds, siAvailability: preset.availability,
      siGrowthPct: preset.growth, siVectorDataGb: preset.vector, siLogGbDay: preset.logs,
      siRetentionDays: preset.retention, siSecurity: preset.security, siServiceType: preset.serviceType || "rag",
      siUserPreset: preset.users, siBaselineProfile: "production",
    };
    applySimpleSizingModelPreset();
    syncStudioUrl();
    renderDecisionStudio();
  }));
  const selectPlan = (id) => {
    studioState.siSelectedPlan = id;
    syncStudioUrl();
    renderDecisionStudio();
  };
  document.querySelectorAll("[data-si-plan]").forEach((card) => {
    card.addEventListener("click", () => selectPlan(card.dataset.siPlan));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectPlan(card.dataset.siPlan);
      }
    });
  });
  document.querySelectorAll("[data-si-adjust]").forEach((button) => button.addEventListener("click", () => {
    const adjustment = button.dataset.siAdjust;
    if (adjustment === "concurrency") {
      studioState.siConcurrency = Math.max(1, Math.round(studioState.siConcurrency * 0.8));
      studioState.siQps = Math.max(0.01, Number((studioState.siQps * 0.8).toFixed(2)));
    } else if (adjustment === "output") {
      studioState.siOutputTokens = Math.max(32, Math.round(studioState.siOutputTokens * 0.8 / 32) * 32);
    } else if (adjustment === "growth") {
      studioState.siGrowthPct = Math.max(0, studioState.siGrowthPct - 10);
    }
    studioState.siBaselineProfile = "";
    syncStudioUrl();
    renderDecisionStudio();
    window.AIHardwareUI?.announce(uiLanguage === "en" ? "Applied the cost-saving assumption and recalculated." : "비용 절감 가정을 적용해 다시 계산했습니다.", "success");
  }));
  document.querySelectorAll("[data-si-bom-auto]").forEach((button) => button.addEventListener("click", () => {
      const { plans } = calculateSiSizing();
      const selected = plans.find((plan) => plan.id === studioState.siSelectedPlan) || plans[1] || plans[0];
      Object.assign(studioState, siBomAutoSelection(selected), { siBomExtraKrw: 0 });
      syncStudioUrl();
      renderDecisionStudio();
    }));
  document.querySelectorAll("[data-si-status]").forEach((button) => button.addEventListener("click", () => {
    studioState.siQuoteStatus = button.dataset.siStatus;
    studioState.siApprovedAt = button.dataset.siStatus === "approved" ? new Date().toISOString() : "";
    syncStudioUrl();
    renderDecisionStudio();
  }));
  document.querySelector("[data-si-export]")?.addEventListener("click", downloadSiWorkbook);
  document.querySelector("[data-si-print]")?.addEventListener("click", () => window.print());
  document.querySelector("[data-si-proposal]")?.addEventListener("click", () => window.open(proposalUrl(), "_blank", "noopener,noreferrer"));
  document.querySelector("[data-si-edit-proposal]")?.addEventListener("click", () => {
    studioState.siReadOnly = false;
    const url = new URL(window.location.href);
    url.searchParams.delete("view");
    history.replaceState({}, "", url);
    syncStudioUrl();
    renderDecisionStudio();
  });
  document.querySelector("[data-si-deploy]")?.addEventListener("click", downloadSiDeployment);
  document.querySelector("[data-si-save]")?.addEventListener("click", () => saveSizingProject(false));
  document.querySelector("[data-si-clone]")?.addEventListener("click", () => saveSizingProject(true));
  document.querySelector("[data-si-json-export]")?.addEventListener("click", () => downloadJson("ai-infra-sizing-project.json", sizingSnapshot()));
  document.querySelector("[data-si-json-import]")?.addEventListener("click", () => $("siJsonFile")?.click());
  $("siJsonFile")?.addEventListener("change", async (event) => {
    try {
      const parsed = JSON.parse(await event.target.files?.[0]?.text());
      if (parsed?.state) studioState = { ...studioState, ...parsed.state };
      syncStudioUrl();
      renderDecisionStudio();
    } catch { alert(uiLanguage === "en" ? "Invalid project JSON." : "올바른 프로젝트 JSON이 아닙니다."); }
  });
  document.querySelectorAll("[data-si-load]").forEach((button) => button.addEventListener("click", () => {
    const row = sizingProjects().find((item) => item.id === button.dataset.siLoad);
    if (row?.state) studioState = { ...studioState, ...row.state, siEstimateVersion: row.version };
    syncStudioUrl();
    renderDecisionStudio();
  }));
  document.querySelectorAll("[data-si-report]").forEach((button) => button.addEventListener("click", () => updateStudio("siReportMode", button.dataset.siReport)));
  document.querySelector("[data-si-copy-command]")?.addEventListener("click", (event) => copyTextToClipboard(document.querySelector(".si-command code")?.textContent || "", event.currentTarget));
  document.querySelector("[data-si-benchmark-plan]")?.addEventListener("click", () => {
    const { model, plans } = calculateSiSizing();
    downloadJson("benchmark-plan.json", { model: model.name, runtime: studioState.siBenchmarkRuntime, prompts: studioState.siBenchmarkPrompts, outputs: studioState.siBenchmarkOutputs, concurrency: studioState.siBenchmarkConcurrency, command: benchmarkCommands(model, plans[1])[studioState.siBenchmarkRuntime] });
  });
  document.querySelector("[data-si-benchmark-import]")?.addEventListener("click", () => $("siBenchmarkFile")?.click());
  $("siBenchmarkFile")?.addEventListener("change", async (event) => {
    try {
      const result = JSON.parse(await event.target.files?.[0]?.text());
      studioState.siMeasuredTtft = Number(result.ttft_p95 ?? result.ttftP95 ?? 0);
      studioState.siMeasuredItl = Number(result.itl_p95 ?? result.itlP95 ?? 0);
      studioState.siMeasuredLatencyP95 = Number(result.request_latency_p95 ?? result.latencyP95 ?? 0);
      studioState.siMeasuredSpeed = Number(result.tokens_per_second ?? result.throughput ?? 0);
      studioState.siMeasuredErrorRate = Number(result.error_rate ?? result.errorRate ?? 0);
      studioState.siBenchmarkSamples = Number(result.sample_count ?? result.sampleCount ?? 1);
      studioState.siBenchmarkOutliers = Number(result.outliers ?? 0);
      syncStudioUrl();
      renderDecisionStudio();
    } catch { alert(uiLanguage === "en" ? "Invalid benchmark JSON." : "올바른 벤치마크 JSON이 아닙니다."); }
  });
  document.querySelectorAll("[data-studio-gpu]").forEach((button) => button.addEventListener("click", () => {
    selectPrimaryGpu(button.dataset.studioGpu, { persist: true });
    studioState.gpuId = button.dataset.studioGpu;
    syncStudioUrl();
    render();
  }));
  document.querySelector("[data-save-build]")?.addEventListener("click", (event) => {
    localStorage.setItem("ai-hardware-fit-saved-build", JSON.stringify(studioState));
    event.currentTarget.textContent = uiLanguage === "en" ? "Saved" : "저장됨";
    window.AIHardwareUI?.announce(uiLanguage === "en" ? "Saved the build locally." : "견적 구성을 브라우저에 저장했습니다.", "success");
  });
  document.querySelector("[data-share-studio]")?.addEventListener("click", (event) => copyTextToClipboard(window.location.href, event.currentTarget));
  $("communityBenchmarkForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const speed = Number(data.get("speed"));
    const gpuId = String(data.get("gpuId"));
    const gpu = GPU_PRESETS.find((item) => item.id === gpuId);
    const comparable = BENCHMARKS.filter((row) => row.modelName.toLowerCase() === String(data.get("modelName")).toLowerCase() && (row.gpuId === gpuId || row.gpu === gpu?.name));
    const values = comparable.map(benchmarkNumericValue).filter((value) => value > 0).sort((a, b) => a - b);
    const median = values.length ? values[Math.floor(values.length / 2)] : 0;
    const outlier = median > 0 && (speed > median * 3 || speed < median / 3);
    const body = [
      `Contributor: ${data.get("contributor")}`, `Model: ${data.get("modelName")}`, `GPU: ${gpu?.name || gpuId}`,
      `Runtime: ${data.get("runtime")}`, `Precision: ${data.get("precision")}`, `Context: ${data.get("context")}`,
      `Speed: ${speed} tok/s`, `Environment: ${data.get("environment")}`, `Evidence: ${data.get("sourceUrl")}`,
      `Outlier check: ${outlier ? "REVIEW REQUIRED" : "pass"}`,
    ].join("\n");
    const issueUrl = `https://github.com/jaeseok614/ai-hardware-fit/issues/new?title=${encodeURIComponent(`[Benchmark] ${data.get("modelName")} on ${gpu?.name || gpuId}`)}&body=${encodeURIComponent(body)}`;
    const row = {
      contributor: String(data.get("contributor")), modelName: String(data.get("modelName")), gpuId,
      gpuName: gpu?.name || gpuId, runtime: String(data.get("runtime")), precision: String(data.get("precision")),
      context: Number(data.get("context")), speed, environment: String(data.get("environment")),
      sourceUrl: String(data.get("sourceUrl")), outlier, issueUrl, createdAt: new Date().toISOString(),
    };
    localStorage.setItem("ai-hardware-fit-community-benchmarks", JSON.stringify([row, ...communityRows()].slice(0, 30)));
    renderDecisionStudio();
  });
}

function restoreStudioState() {
  const params = new URL(window.location.href).searchParams;
  const raw = params.get("studioState");
  const draft = localStorage.getItem(SIZING_DRAFT_KEY);
  const saved = raw || draft || localStorage.getItem("ai-hardware-fit-saved-build");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      const restored = parsed?.state && typeof parsed.state === "object" ? parsed.state : parsed;
      if (restored && typeof restored === "object") studioState = { ...studioState, ...restored };
    } catch {}
  }
  const scenarioId = params.get("scenario");
  const scenario = SI_SCENARIOS[scenarioId];
  if (scenario) {
    studioState = {
      ...studioState,
      tab: "consulting",
      siInputMode: "simple",
      siWizardStep: 4,
      siScenario: scenarioId,
      siProjectName: uiLanguage === "en" ? scenario.en : scenario.ko,
      siPurpose: uiLanguage === "en" ? scenario.purposeEn : scenario.purpose,
      siTotalUsers: scenario.users,
      siUserPreset: scenario.users,
      siConcurrency: scenario.concurrency,
      siInputTokens: scenario.input,
      siOutputTokens: scenario.output,
      siTargetSeconds: scenario.seconds,
      siAvailability: scenario.availability,
      siGrowthPct: scenario.growth,
      siVectorDataGb: scenario.vector,
      siLogGbDay: scenario.logs,
      siRetentionDays: scenario.retention,
      siSecurity: scenario.security,
      siServiceType: scenario.serviceType || "rag",
    };
  }
  const requestedUsers = Number(params.get("users"));
  if (scenario && Number.isFinite(requestedUsers) && requestedUsers >= 1) {
    const users = Math.min(10000, Math.round(requestedUsers));
    studioState.siTotalUsers = users;
    studioState.siUserPreset = users;
    studioState.siConcurrency = Math.max(1, Math.ceil(scenario.concurrency * users / scenario.users));
  }
  if (params.get("studio")) studioState.tab = params.get("studio");
  studioState.siReadOnly = params.get("view") === "proposal";
  if (!["consulting", "recommend", "market", "custom", "parts", "runtime", "community"].includes(studioState.tab)) studioState.tab = "consulting";
}

function setInfrastructureWizardStep(step, { sync = true, render = true, scroll = false } = {}) {
  studioState.siInputMode = "simple";
  studioState.tab = "consulting";
  studioState.siReadOnly = false;
  studioState.siWizardStep = Math.max(1, Math.min(4, Number(step) || 1));
  if (sync) syncStudioUrl();
  if (render) renderDecisionStudio();
  if (scroll) $("decisionStudio")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
}

function startNewInfrastructureEstimate({ sync = false, render = false } = {}) {
  studioState.tab = "consulting";
  studioState.siInputMode = "simple";
  studioState.siWizardStep = 1;
  studioState.siReadOnly = false;
  applySimpleSizingModelPreset();
  const url = new URL(window.location.href);
  ["studio", "studioState", "scenario", "users", "schema"].forEach((key) => url.searchParams.delete(key));
  if (url.searchParams.get("view") === "proposal") url.searchParams.delete("view");
  history.replaceState({}, "", url);
  if (sync) syncStudioUrl();
  if (render) renderDecisionStudio();
}

window.AIHardwareInfrastructure = {
  getWizardStep: () => Math.max(1, Math.min(4, Number(studioState.siWizardStep) || 1)),
  setWizardStep: setInfrastructureWizardStep,
  startNewEstimate: startNewInfrastructureEstimate,
};

function initDecisionStudio() {
  restoreStudioState();
  if (studioState.siInputMode === "simple") applySimpleSizingModelPreset();
  renderDecisionStudio();
  window.addEventListener("ai-hardware-fit:infra-demo", (event) => {
    const scenarioId = event.detail?.scenario;
    const preset = SI_SCENARIOS[scenarioId] || SI_SCENARIOS["internal-rag"];
    const users = Math.max(1, Math.round(Number(event.detail?.users) || preset.users));
    studioState = {
      ...studioState,
      tab: "consulting",
      siInputMode: "simple",
      siWizardStep: 4,
      siScenario: scenarioId || "internal-rag",
      siProjectName: uiLanguage === "en" ? preset.en : preset.ko,
      siPurpose: uiLanguage === "en" ? preset.purposeEn : preset.purpose,
      siTotalUsers: users,
      siUserPreset: users,
      siConcurrency: Math.max(1, Math.ceil(preset.concurrency * users / preset.users)),
      siInputTokens: preset.input,
      siOutputTokens: preset.output,
      siTargetSeconds: preset.seconds,
      siAvailability: users >= 50 ? preset.availability : "single",
      siGrowthPct: preset.growth,
      siVectorDataGb: preset.vector,
      siLogGbDay: preset.logs,
      siRetentionDays: preset.retention,
      siSecurity: preset.security,
      siServiceType: preset.serviceType || "rag",
    };
    applySimpleSizingModelPreset();
    syncStudioUrl();
    renderDecisionStudio();
    window.AIHardwareUI?.announce(uiLanguage === "en"
      ? `Loaded the ${users}-user ${preset.en} example.`
      : `${preset.ko} ${users}명 예시를 불러왔습니다.`);
    document.getElementById("decisionStudio")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  });
  window.addEventListener("languagechange", renderDecisionStudio);
  document.addEventListener("ai-hardware-languagechange", renderDecisionStudio);
  document.querySelector("[data-language-toggle]")?.addEventListener("click", () => queueMicrotask(renderDecisionStudio));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDecisionStudio);
} else {
  initDecisionStudio();
}
