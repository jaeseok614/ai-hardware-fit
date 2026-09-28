/** Extracted in v7.1 to keep the core bundle focused. */
let advisorWizardStep = 1;

function ensureGpuAdvisorPanel() {
  if (!$("benchmarkDashboard") && $("benchmarkSheet")) {
    const dashboard = document.createElement("section");
    dashboard.id = "benchmarkDashboard";
    dashboard.className = "benchmark-dashboard";
    dashboard.hidden = true;
    dashboard.setAttribute("aria-labelledby", "benchmarkDashboardTitle");
    document.querySelector(".app-shell")?.appendChild(dashboard);
  }
  if (!$("mediaOptimization") && $("mediaOffload")) {
    const field = document.createElement("label");
    field.className = "field media-generation-field";
    field.innerHTML = `<span id="mediaOptimizationLabel">생성 최적화</span><select id="mediaOptimization"><option value="standard">기본</option><option value="attention">Sage/Flash Attention</option><option value="cache">TeaCache</option><option value="combined">Attention + TeaCache</option></select>`;
    $("mediaOffload").closest(".field")?.insertAdjacentElement("afterend", field);
  }
  if ($("gpuAdvisorPanel")) return;
  const results = $("resultsPanel");
  if (!results) return;
  const panel = document.createElement("section");
  panel.className = "gpu-advisor-panel";
  panel.id = "gpuAdvisorPanel";
  panel.hidden = true;
  panel.setAttribute("aria-labelledby", "gpuAdvisorTitle");
  panel.innerHTML = `
    <div class="gpu-insights-head">
      <div>
        <span class="section-kicker">GPU ADVISOR</span>
        <h2 id="gpuAdvisorTitle"></h2>
        <p id="gpuAdvisorDescription"></p>
      </div>
    </div>
    <div class="advisor-wizard" data-advisor-step="1">
      <div class="gpu-advisor-controls advisor-wizard-panel" data-advisor-step-panel="1">
        <label class="field"><span id="advisorModelCategoryLabel"></span><select id="advisorModelCategory"></select></label>
        <label class="field advisor-model-search-field"><span id="advisorModelSearchLabel"></span><input id="advisorModelSearch" type="search" autocomplete="off"></label>
        <label class="field advisor-model-select-field"><span id="advisorModelLabel"></span><select id="advisorModel"></select><small id="advisorModelCount" aria-live="polite"></small></label>
      </div>
      <div class="gpu-advisor-controls advisor-wizard-panel" data-advisor-step-panel="2" hidden>
        <label class="field advisor-budget-field"><span id="advisorBudgetLabel"></span><input id="advisorBudgetUsd" data-currency="KRW" type="number" min="0" max="200000000" step="100000" value="2800000"></label>
        <details class="advisor-detailed-settings">
          <summary><span class="advisor-detail-summary"></span></summary>
          <div class="advisor-detail-grid">
            <label class="field"><span id="advisorCurrentPriceLabel"></span><input id="advisorCurrentPriceUsd" data-currency="KRW" type="number" min="0" max="200000000" step="100000" value="0"></label>
            <label class="field"><span id="advisorElectricityLabel"></span><input id="advisorElectricityRate" data-currency="KRW" type="number" min="0" max="2000" step="10" value="150"></label>
            <label class="field"><span id="advisorHoursLabel"></span><input id="advisorHoursMonth" type="number" min="1" max="744" step="1" value="120"></label>
            <label class="field"><span id="advisorVendorLabel"></span><select id="advisorVendor"><option value="all">All</option><option>NVIDIA</option><option>AMD</option><option>Intel</option><option>Apple</option></select></label>
            <label class="field"><span id="advisorFormFactorLabel"></span><select id="advisorFormFactor"><option value="all">All</option><option value="desktop">Desktop</option><option value="laptop">Laptop</option><option value="datacenter">Data center</option><option value="integrated">Unified memory</option></select></label>
          </div>
        </details>
      </div>
      <div class="advisor-wizard-panel" data-advisor-step-panel="3" hidden>
        <div class="gpu-advisor-result" id="gpuAdvisorResult" role="region" aria-live="polite"></div>
      </div>
      <div class="advisor-wizard-navigation">
        <button type="button" class="ghost-button" data-advisor-back>← 이전</button>
        <span id="advisorWizardPosition" aria-live="polite"></span>
        <button type="button" class="primary-button" data-advisor-next>예산 입력 →</button>
        <button type="button" class="ghost-button" data-advisor-restart hidden>처음부터</button>
      </div>
    </div>
  `;
  results.parentNode.insertBefore(panel, results);
  // Model results belong directly below the workload tabs. GPU details are
  // supporting information, and Advisor is exposed as its own top-level task.
  const hardwarePanel = $("hardwarePanel");
  if (hardwarePanel?.parentNode === results.parentNode) {
    hardwarePanel.insertAdjacentElement("afterend", results);
  }
  $("advisorModelCategory").innerHTML = ADVISOR_MODEL_CATEGORIES
    .map((category) => `<option value="${category.id}">${escapeHtml(category.en)}</option>`)
    .join("");
  refreshAdvisorModelOptions();
  panel.querySelector("[data-advisor-back]")?.addEventListener("click", () => setAdvisorWizardStep(advisorWizardStep - 1, { scroll: true }));
  panel.querySelector("[data-advisor-next]")?.addEventListener("click", () => setAdvisorWizardStep(advisorWizardStep + 1, { scroll: true }));
  panel.querySelector("[data-advisor-restart]")?.addEventListener("click", () => setAdvisorWizardStep(1, { scroll: true }));
}

function syncAdvisorCurrencyInputs() {
  const pricing = window.AIHardwarePricing;
  if (!pricing) return;
  const targetCurrency = uiLanguage === "en" ? "USD" : "KRW";
  [["advisorBudgetUsd", 2000], ["advisorCurrentPriceUsd", 0], ["advisorElectricityRate", .15]].forEach(([id, fallback]) => {
    const input = $(id);
    if (!input) return;
    const sourceCurrency = input.dataset.currency || "USD";
    if (sourceCurrency !== targetCurrency) {
      const numeric = Number(input.value || fallback);
      input.value = targetCurrency === "KRW"
        ? Math.round(pricing.toKrw(numeric, sourceCurrency))
        : Number(pricing.toUsd(numeric, sourceCurrency).toFixed(id === "advisorElectricityRate" ? 2 : 0));
    }
    input.dataset.currency = targetCurrency;
    input.max = targetCurrency === "KRW" ? (id === "advisorElectricityRate" ? "2000" : "200000000") : (id === "advisorElectricityRate" ? "5" : "100000");
    input.step = targetCurrency === "KRW" ? (id === "advisorElectricityRate" ? "10" : "100000") : (id === "advisorElectricityRate" ? "0.01" : "50");
  });
}

const ADVISOR_MODEL_CATEGORIES = [
  { id: "all", ko: "전체", en: "All" },
  { id: "llm", ko: "LLM", en: "LLM" },
  { id: "vlm", ko: "VLM", en: "VLM" },
  { id: "image", ko: "이미지 생성", en: "Image generation" },
  { id: "video", ko: "비디오 생성", en: "Video generation" },
  { id: "avatar-generation", ko: "아바타·립싱크", en: "Avatar / lip sync" },
  { id: "embedding", ko: "임베딩", en: "Embedding" },
  { id: "reranker", ko: "리랭커", en: "Reranker" },
  { id: "ocr", ko: "OCR", en: "OCR" },
  { id: "stt", ko: "음성 인식", en: "Speech to text" },
  { id: "tts", ko: "음성 합성", en: "Text to speech" },
];

function getAdvisorModelCategory(model) {
  if (!model.type || model.type === "generative") return "llm";
  if (model.type === "document-vlm" || model.type === "general-vlm") return "vlm";
  if (model.type === "image-generation") return "image";
  if (model.type === "video-generation") return "video";
  if (model.type === "avatar-generation") return "avatar-generation";
  if (model.type === "ocr-pipeline") return "ocr";
  if (model.type === "audio-stt") return "stt";
  if (model.type === "audio-tts") return "tts";
  return model.type;
}

function getAdvisorModelSearchText(model) {
  return [
    model.name,
    model.provider,
    model.publisher,
    model.family,
    model.type,
    ...(Array.isArray(model.tags) ? model.tags : []),
  ].filter(Boolean).join(" ").normalize("NFKC").toLocaleLowerCase();
}

function refreshAdvisorModelOptions(preferredKey = $("advisorModel")?.value) {
  const select = $("advisorModel");
  if (!select) return [];
  const category = $("advisorModelCategory")?.value || "all";
  const query = $("advisorModelSearch")?.value || "";
  const candidates = getAllModels().filter((model) => category === "all" || getAdvisorModelCategory(model) === category);
  const models = query.trim()
    ? (window.AIHardwareCatalogSearch?.search(query, candidates, { limit: candidates.length }) || candidates.filter((model) => {
      const searchText = getAdvisorModelSearchText(model);
      return query.normalize("NFKC").toLocaleLowerCase().trim().split(/\s+/).filter(Boolean).every((token) => searchText.includes(token));
    }))
    : candidates;
  select.innerHTML = models
    .map((model) => `<option value="${escapeAttr(modelKey(model))}">${escapeHtml(model.name)}</option>`)
    .join("");
  if (preferredKey && models.some((model) => modelKey(model) === preferredKey)) select.value = preferredKey;
  select.disabled = models.length === 0;
  const count = $("advisorModelCount");
  if (count) count.textContent = uiLanguage === "en" ? `${models.length} models` : `${models.length}개 모델`;
  return models;
}

function normalizeAdvisorWizardStep(step) {
  return Math.max(1, Math.min(3, Number(step) || 1));
}

function applyAdvisorWizardUi({ scroll = false } = {}) {
  const panel = $("gpuAdvisorPanel");
  if (!panel) return;
  advisorWizardStep = normalizeAdvisorWizardStep(advisorWizardStep);
  const en = uiLanguage === "en";
  const wizard = panel.querySelector("[data-advisor-step]");
  if (wizard) wizard.dataset.advisorStep = String(advisorWizardStep);
  panel.dataset.advisorStep = String(advisorWizardStep);
  panel.querySelectorAll("[data-advisor-step-panel]").forEach((section) => {
    section.hidden = Number(section.dataset.advisorStepPanel) !== advisorWizardStep;
  });
  const back = panel.querySelector("[data-advisor-back]");
  const next = panel.querySelector("[data-advisor-next]");
  const restart = panel.querySelector("[data-advisor-restart]");
  if (back) {
    back.textContent = en ? "← Back" : "← 이전";
    back.disabled = advisorWizardStep === 1;
  }
  if (next) {
    next.hidden = advisorWizardStep === 3;
    next.textContent = advisorWizardStep === 1
      ? (en ? "Set budget →" : "예산 입력 →")
      : (en ? "Compare GPUs →" : "GPU 3안 비교 →");
    next.disabled = advisorWizardStep === 1 && !getModelByKey($("advisorModel")?.value);
  }
  if (restart) {
    restart.hidden = advisorWizardStep !== 3;
    restart.textContent = en ? "Start over" : "처음부터";
  }
  if ($("advisorWizardPosition")) {
    $("advisorWizardPosition").textContent = en ? `Step ${advisorWizardStep} of 3` : `${advisorWizardStep}/3 단계`;
  }
  window.AIHardwareGuide?.render("modelFinder", advisorWizardStep - 1);
  if (scroll) panel.scrollIntoView?.({ behavior: "smooth", block: "start" });
}

function setAdvisorWizardStep(step, { sync = true, scroll = false, render = true } = {}) {
  advisorWizardStep = normalizeAdvisorWizardStep(step);
  if (render) renderGpuAdvisor();
  else applyAdvisorWizardUi({ scroll });
  if (sync && typeof syncUrlState === "function") syncUrlState();
  if (scroll && render) $("gpuAdvisorPanel")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
}

function startNewAdvisorSearch({ sync = false, render = false } = {}) {
  advisorWizardStep = 1;
  if (render) renderGpuAdvisor();
  else applyAdvisorWizardUi();
  if (sync && typeof syncUrlState === "function") syncUrlState();
}

window.AIHardwareGpuAdvisor = {
  getStep: () => advisorWizardStep,
  restoreStep: (step) => { advisorWizardStep = normalizeAdvisorWizardStep(step); },
  setStep: setAdvisorWizardStep,
  startNewSearch: startNewAdvisorSearch,
};


function renderGpuAdvisor() {
  const panel = $("gpuAdvisorPanel");
  if (!panel) return;
  panel.hidden = coreTaskMode !== "modelFinder";
  if (panel.hidden) return;
  const en = uiLanguage === "en";
  $("gpuAdvisorTitle").textContent = en ? "GPU recommendations by model, budget, and power" : "예산·전력·모델 기준 GPU 추천";
  $("gpuAdvisorDescription").textContent = en
    ? "Choose a model and cost constraints to rank compatible GPUs by value, speed, and energy."
    : "원하는 모델과 비용 조건을 넣으면 적합한 GPU를 가격·속도·전력 기준으로 정렬합니다.";
  const labels = {
    advisorModelCategoryLabel: en ? "Model category" : "모델 종류",
    advisorModelSearchLabel: en ? "Search models" : "모델 검색",
    advisorModelLabel: en ? "Model to run" : "실행할 모델",
    advisorBudgetLabel: en ? "GPU budget (USD)" : "GPU 예산 (원)",
    advisorCurrentPriceLabel: en ? "Current GPU price (USD)" : "현재 GPU 견적가 (원)",
    advisorElectricityLabel: en ? "Electricity (USD/kWh)" : "전기요금 (원/kWh)",
    advisorHoursLabel: en ? "Hours per month" : "월 사용 시간",
    advisorVendorLabel: en ? "Vendor" : "제조사",
    advisorFormFactorLabel: en ? "Form factor" : "형태",
  };
  Object.entries(labels).forEach(([id, text]) => { if ($(id)) $(id).textContent = text; });
  document.querySelectorAll(".advisor-detail-summary").forEach((node) => {
    node.textContent = en ? "Detailed constraints" : "상세 조건";
  });
  if ($("advisorModelSearch")) $("advisorModelSearch").placeholder = en ? "Name, provider, or tag" : "이름·제공사·태그 부분검색";
  [...($("advisorModelCategory")?.options || [])].forEach((option) => {
    const category = ADVISOR_MODEL_CATEGORIES.find((item) => item.id === option.value);
    if (category) option.textContent = en ? category.en : category.ko;
  });
  if ($("advisorModelCount")) {
    const count = $("advisorModel").options.length;
    $("advisorModelCount").textContent = en ? `${count} models` : `${count}개 모델`;
  }
  const vendorOptions = en ? ["All", "NVIDIA", "AMD", "Intel", "Apple"] : ["전체", "NVIDIA", "AMD", "Intel", "Apple"];
  [...$("advisorVendor").options].forEach((option, index) => { option.textContent = vendorOptions[index]; });
  const formOptions = en ? ["All", "Desktop", "Laptop", "Data center", "Unified memory"] : ["전체", "데스크톱", "노트북", "데이터센터", "통합 메모리"];
  [...$("advisorFormFactor").options].forEach((option, index) => { option.textContent = formOptions[index]; });
  if ($("mediaOptimizationLabel")) $("mediaOptimizationLabel").textContent = en ? "Generation optimization" : "생성 최적화";
  if ($("mediaOptimization")) {
    const optionLabels = en
      ? ["Standard", "Sage/Flash Attention", "TeaCache", "Attention + TeaCache"]
      : ["기본", "Sage/Flash Attention", "TeaCache", "Attention + TeaCache"];
    [...$("mediaOptimization").options].forEach((option, index) => { option.textContent = optionLabels[index]; });
  }
  applyAdvisorWizardUi();

  const model = getModelByKey($("advisorModel").value);
  if (!model) {
    $("gpuAdvisorResult").innerHTML = `<div class="empty-state"><p>${en ? "No matching model. Try another category or search term." : "일치하는 모델이 없습니다. 종류나 검색어를 바꿔보세요."}</p><button type="button" class="ghost-button" data-advisor-reset>${en ? "Reset conditions" : "조건 초기화"}</button></div>`;
    $("gpuAdvisorResult").querySelector("[data-advisor-reset]")?.addEventListener("click", () => {
      $("advisorModelCategory").value = "all";
      $("advisorModelSearch").value = "";
      refreshAdvisorModelOptions();
      renderGpuAdvisor();
    });
    return;
  }
  syncAdvisorCurrencyInputs();
  const pricing = window.AIHardwarePricing;
  const advisorCurrency = $("advisorBudgetUsd").dataset.currency || "USD";
  const budget = pricing ? pricing.toUsd($("advisorBudgetUsd").value, advisorCurrency) : clampNumber($("advisorBudgetUsd").value, 0, 100000, 2000);
  const rate = pricing ? pricing.toUsd($("advisorElectricityRate").value, advisorCurrency) : clampNumber($("advisorElectricityRate").value, 0, 5, .15);
  const hours = clampNumber($("advisorHoursMonth").value, 1, 744, 120);
  const vendor = $("advisorVendor").value;
  const formFactor = $("advisorFormFactor").value;
  const currentHardware = hasPrimaryGpuSelection ? getHardware() : null;
  const currentEstimate = currentHardware ? estimateAnyModelForHardware(model, currentHardware) : null;
  const currentSpeed = Number(currentEstimate?.speed || currentEstimate?.throughput || 0);
  const currentPrice = pricing ? pricing.toUsd($("advisorCurrentPriceUsd")?.value, advisorCurrency) : clampNumber($("advisorCurrentPriceUsd")?.value, 0, 100000, 0);
  const evaluatedCandidates = GPU_PRESETS
    .filter((gpu) => gpu.id !== "custom")
    .map((preset) => {
      const hardware = buildHardwareForPreset(preset);
      const estimate = estimateAnyModelForHardware(model, hardware);
      const market = gpuMarketReference(preset);
      const koreanMarket = KOREAN_GPU_MARKET.find((row) => row.gpuId === preset.id);
      const priceState = window.AIHardwareUI?.priceState({
        marketPrice: koreanMarket?.lowestKrw || 0,
        launchPrice: market.priceKind === "launch-reference" ? market.priceUsd : 0,
        updatedAt: koreanMarket?.updatedAt || "",
      }) || {
        kind: market.priceKind === "launch-reference" ? "launch" : "quote",
        label: market.priceKind === "launch-reference"
          ? (en ? "Launch-price reference" : "출시 가격 참고")
          : (en ? "No public Korean market price" : "공개 국내 시세 없음"),
        note: en ? "Enter a supplier quote or your own price" : "공급사 견적 또는 직접 입력으로 계산 가능",
      };
      const monthlyEnergy = market.powerW / 1000 * hours * rate;
      const fitsBudget = !market.priceUsd || market.priceUsd <= budget;
      const runnable = estimate && GRADE_META[estimate.grade]?.score >= GRADE_META.B.score;
      const speed = Number(estimate?.speed || estimate?.throughput || 0);
      const valueScore = runnable ? speed / Math.max(200, market.priceUsd || budget || 1000) : 0;
      const fitsVendor = vendor === "all" || preset.vendor === vendor;
      const fitsFormFactor = formFactor === "all" || preset.formFactor === formFactor;
      return { preset, estimate, market, koreanMarket, priceState, monthlyEnergy, fitsBudget, fitsVendor, fitsFormFactor, runnable, speed, valueScore };
    });
  const strictCandidates = evaluatedCandidates
    .filter((item) => item.runnable && item.fitsBudget && item.fitsVendor && item.fitsFormFactor)
    .sort((a, b) => b.valueScore - a.valueScore || b.speed - a.speed)
    .slice(0, 12);
  const showingAlternatives = strictCandidates.length === 0;
  const candidates = showingAlternatives
    ? evaluatedCandidates
      .filter((item) => item.runnable)
      .sort((a, b) => {
        const penalty = (item) => (item.fitsBudget ? 0 : 4) + (item.fitsVendor ? 0 : 2) + (item.fitsFormFactor ? 0 : 2);
        return penalty(a) - penalty(b) || b.valueScore - a.valueScore || b.speed - a.speed;
      })
      .slice(0, 12)
    : strictCandidates;
  const roleCandidates = [];
  if (candidates.length) {
    const priced = candidates.filter((item) => item.market.priceUsd > 0);
    const roleRows = [
      { role: en ? "Lowest cost" : "최저 비용", item: [...(priced.length ? priced : candidates)].sort((a, b) => (a.market.priceUsd || Infinity) - (b.market.priceUsd || Infinity))[0] },
      { role: en ? "Balanced" : "균형 추천", item: candidates[0] },
      { role: en ? "Highest performance" : "최고 성능", item: [...candidates].sort((a, b) => b.speed - a.speed)[0] },
    ];
    roleRows.forEach((row) => {
      if (!row.item) return;
      const existing = roleCandidates.find((entry) => entry.item.preset.id === row.item.preset.id);
      if (existing) existing.role = `${existing.role} · ${row.role}`;
      else roleCandidates.push(row);
    });
  }

  $("gpuAdvisorResult").innerHTML = roleCandidates.length ? `
    ${showingAlternatives ? `<div class="advisor-alternative-notice"><span>${en ? "No exact match. Showing the closest runnable alternatives." : "조건에 정확히 맞는 GPU가 없어 실행 가능한 가까운 대안을 보여드립니다."}</span><button type="button" class="ghost-button" data-advisor-relax>${en ? "Clear vendor and form filters" : "제조사·형태 필터 해제"}</button></div>` : ""}
    <div class="gpu-advisor-list">
      ${roleCandidates.map(({ item, role }, index) => `
        <article class="gpu-advisor-card">
          <div><span class="advisor-rank">${escapeHtml(role)}</span><strong>${escapeHtml(shortGpuName(item.preset.name))}</strong></div>
          <p>${escapeHtml(formatGb(item.preset.gpuUsableMemoryGb || item.preset.vram))} · ${escapeHtml(item.preset.vendor)} · ${escapeHtml(item.preset.formFactor)}</p>
          ${showingAlternatives ? `<p class="advisor-difference">${[
            !item.fitsVendor ? (en ? `Vendor alternative: ${item.preset.vendor}` : `제조사 대안: ${item.preset.vendor}`) : "",
            !item.fitsFormFactor ? (en ? `Form alternative: ${item.preset.formFactor}` : `형태 대안: ${item.preset.formFactor}`) : "",
            !item.fitsBudget ? (en ? "Above the selected budget" : "선택 예산 초과") : "",
          ].filter(Boolean).map((text) => `<span>${escapeHtml(text)}</span>`).join("")}</p>` : ""}
          <dl>
            <div><dt>${en ? "Estimated speed" : "예상 속도"}</dt><dd>${escapeHtml(formatThroughput(item.speed, item.estimate?.unitLabel || "tok/s"))}</dd></div>
            <div><dt>${en ? "Reference price" : "참고 가격"}</dt><dd class="price-state is-${escapeAttr(item.priceState.kind)}">${item.koreanMarket?.lowestKrw
              ? (pricing?.formatFromKrw(item.koreanMarket.lowestKrw, uiLanguage) || `${Math.round(item.koreanMarket.lowestKrw).toLocaleString("ko-KR")}원`)
              : item.priceState.kind === "launch"
                ? (pricing?.formatFromUsd(item.market.priceUsd, uiLanguage) || `$${item.market.priceUsd.toLocaleString("en-US")}`)
                : item.priceState.label}<small>${escapeHtml(item.priceState.label)}${item.priceState.note ? ` · ${escapeHtml(item.priceState.note)}` : ""}</small></dd></div>
            <div><dt>${en ? "Monthly energy" : "월 전력비"}</dt><dd>${pricing ? pricing.formatMoney(advisorCurrency === "KRW" ? pricing.toKrw(item.monthlyEnergy, "USD") : item.monthlyEnergy, advisorCurrency, uiLanguage) : `$${item.monthlyEnergy.toFixed(2)}`}</dd></div>
            <div><dt>${en ? "Evidence" : "근거"}</dt><dd>${escapeHtml(gpuEvidenceLabel(item.preset, en))}</dd></div>
            <div><dt>${en ? "vs current GPU" : "현재 GPU 대비"}</dt><dd>${currentSpeed ? `${(item.speed / currentSpeed).toFixed(2)}×` : "—"}</dd></div>
            <div><dt>${en ? "Speed / $1K" : "속도 / 100만원"}</dt><dd>${(item.speed / Math.max(0.2, en
              ? (item.market.priceUsd || currentPrice || budget) / 1000
              : (pricing?.toKrw(item.market.priceUsd || currentPrice || budget, "USD") || 0) / 1000000)).toFixed(1)}</dd></div>
          </dl>
          <button type="button" class="ghost-button" data-advisor-select-gpu="${escapeAttr(item.preset.id)}">${en ? "Use this GPU" : "이 GPU 선택"}</button>
          <a class="ghost-button gpu-buy-link" href="${escapeAttr(window.AIHardwareAffiliate ? window.AIHardwareAffiliate.buildCoupangLink(shortGpuName(item.preset.name)) : `https://www.coupang.com/np/search?q=${encodeURIComponent(shortGpuName(item.preset.name))}`)}" target="_blank" rel="noopener noreferrer sponsored">${en ? "Buy this spec \u2197" : "이 사양대로 사기 \u2197"}</a>
        </article>
      `).join("")}
    </div>
    <p class="advisor-disclaimer">${en ? "A dated Korean market price is shown when available. Otherwise the UI clearly separates launch-price references from supplier-quote-required items. Energy cost uses the selected hours and rate." : "기준일이 있는 국내 시세만 시세로 표시하며, 나머지는 출시 가격 참고와 공급사 견적 필요 상태를 구분합니다. 전력비는 입력한 시간과 요금으로 계산합니다."}</p>
  ` : `<div class="empty-state"><p>${en ? "No GPU with known specifications fits these conditions. Raise the budget or change a filter." : "현재 조건에 맞는 GPU가 없습니다. 예산을 높이거나 필터를 바꿔보세요."}</p><button type="button" class="ghost-button" data-advisor-reset>${en ? "Reset conditions" : "조건 초기화"}</button></div>`;
  panel.querySelector("[data-advisor-relax]")?.addEventListener("click", () => {
    $("advisorVendor").value = "all";
    $("advisorFormFactor").value = "all";
    renderGpuAdvisor();
  });
  panel.querySelector("[data-advisor-reset]")?.addEventListener("click", () => {
    $("advisorVendor").value = "all";
    $("advisorFormFactor").value = "all";
    $("advisorModelCategory").value = "all";
    $("advisorModelSearch").value = "";
    refreshAdvisorModelOptions();
    renderGpuAdvisor();
  });
  panel.querySelectorAll("[data-advisor-select-gpu]").forEach((button) => {
    button.addEventListener("click", () => {
      selectPrimaryGpu(button.dataset.advisorSelectGpu, { persist: true });
      // render()'s modelFinder branch keeps hardwarePanel/resultsPanel
      // hidden no matter what hasPrimaryGpuSelection is (see render() in
      // app.js), so calling plain render() here updated state but left the
      // advisor screen looking untouched — the click appeared to do
      // nothing. Selecting a GPU here means "show me what this GPU can
      // run," which is the GPU finder screen, so switch there.
      if (window.AIHardwareCore?.setCoreTaskMode) window.AIHardwareCore.setCoreTaskMode("finder");
      else render();
      $("hardwarePanel")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    });
  });
}
