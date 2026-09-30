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
        <div class="empty-state advisor-model-empty" id="advisorModelEmpty" hidden>
          <p id="advisorModelEmptyText"></p>
          <button type="button" class="ghost-button" data-advisor-reset>조건 초기화</button>
        </div>
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
  $("advisorModelEmpty")?.querySelector("[data-advisor-reset]")?.addEventListener("click", () => {
    $("advisorModelCategory").value = "all";
    $("advisorModelSearch").value = "";
    refreshAdvisorModelOptions();
    renderGpuAdvisor();
  });
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

function advisorPricePoint(item, pricing, currency) {
  if (item.koreanMarket?.lowestKrw > 0) {
    return {
      value: currency === "KRW"
        ? item.koreanMarket.lowestKrw
        : pricing.toUsd(item.koreanMarket.lowestKrw, "KRW"),
      label: pricing.formatFromKrw(item.koreanMarket.lowestKrw, uiLanguage),
      kind: "market",
      evidence: uiLanguage === "en"
        ? `Korean market price · checked ${item.koreanMarket.updatedAt}`
        : `국내 시세 · ${item.koreanMarket.updatedAt} 확인`,
    };
  }
  const priceUsd = Number(item.market?.priceUsd || 0);
  return {
    value: currency === "KRW" ? pricing.toKrw(priceUsd, "USD") : priceUsd,
    label: pricing.formatFromUsd(priceUsd, uiLanguage),
    kind: item.market?.priceKind === "launch-reference" ? "launch" : "estimate",
    evidence: item.market?.priceKind === "launch-reference"
      ? (uiLanguage === "en" ? "Launch-price reference" : "출시 가격 참고")
      : (uiLanguage === "en" ? "Calculated price estimate" : "계산 가격 추정"),
  };
}

function advisorSpeedEvidence(confidence, en) {
  if (confidence?.sampleCount) {
    return {
      kind: "measured",
      label: en ? `Measurement-calibrated (${confidence.sampleCount})` : `실측 보정 ${confidence.sampleCount}건`,
      detail: confidence.reason,
    };
  }
  if (confidence?.matchedRow) {
    const kind = benchmarkEvidenceType(confidence.matchedRow);
    return {
      kind: kind === "external" ? "external" : "measured",
      label: kind === "project"
        ? (en ? "Project measurement" : "자체 측정")
        : kind === "external"
          ? (en ? "External benchmark" : "외부 공개 벤치마크")
          : (en ? "User measurement" : "사용자 측정"),
      detail: confidence.reason,
    };
  }
  if (confidence?.evidenceKind === "related") {
    return {
      kind: "related",
      label: en ? `Related measurements (${confidence.evidenceCount || 0})` : `관련 실측 ${confidence.evidenceCount || 0}건`,
      detail: confidence.reason,
    };
  }
  if (confidence?.evidenceKind === "external") {
    return { kind: "external", label: en ? "External benchmark reference" : "외부 공개 벤치마크 참고", detail: confidence.reason };
  }
  return { kind: "estimate", label: en ? "Calculated speed estimate" : "계산 속도 추정", detail: confidence?.reason || "" };
}

function bindAdvisorFrontierInteractions(panel, en) {
  const chart = panel?.querySelector(".advisor-frontier-chart");
  const tooltip = chart?.querySelector("[data-advisor-frontier-tooltip]");
  const detail = panel?.querySelector("[data-advisor-frontier-detail]");
  if (!chart || !tooltip || !detail) return;
  let pinnedPoint = null;

  const detailMarkup = (point) => `
    <strong>${escapeHtml(point.dataset.frontierName || "GPU")}</strong>
    <span>${escapeHtml(point.dataset.frontierPrice || "—")} · ${escapeHtml(point.dataset.frontierSpeed || "—")}</span>
    <small>${escapeHtml(point.dataset.frontierSetting || "—")} · ${escapeHtml(point.dataset.frontierEvidence || "—")}</small>
  `;
  const positionTooltip = (point) => {
    const pointRect = point.getBoundingClientRect();
    const chartRect = chart.getBoundingClientRect();
    const rawLeft = pointRect.left + pointRect.width / 2 - chartRect.left + chart.scrollLeft;
    const minLeft = Math.min(145, chart.scrollWidth / 2);
    const maxLeft = Math.max(minLeft, chart.scrollWidth - minLeft);
    tooltip.style.left = `${Math.max(minLeft, Math.min(maxLeft, rawLeft))}px`;
    tooltip.style.top = `${Math.max(18, pointRect.top - chartRect.top + chart.scrollTop - 10)}px`;
    tooltip.classList.toggle("is-below", pointRect.top - chartRect.top < 105);
  };
  const showPoint = (point, { pin = false } = {}) => {
    if (pin) {
      pinnedPoint = point;
      panel.querySelectorAll("[data-advisor-frontier-point]").forEach((candidate) => {
        candidate.setAttribute("aria-pressed", String(candidate === point));
      });
    }
    tooltip.innerHTML = detailMarkup(point);
    tooltip.hidden = false;
    positionTooltip(point);
    detail.innerHTML = detailMarkup(point);
    detail.hidden = false;
  };
  const hideTransientTooltip = (point) => {
    if (pinnedPoint !== point) tooltip.hidden = true;
  };

  panel.querySelectorAll("[data-advisor-frontier-point]").forEach((point) => {
    point.addEventListener("pointerenter", () => showPoint(point));
    point.addEventListener("pointerleave", () => hideTransientTooltip(point));
    point.addEventListener("focus", () => showPoint(point));
    point.addEventListener("blur", () => hideTransientTooltip(point));
    point.addEventListener("click", () => showPoint(point, { pin: true }));
    point.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      showPoint(point, { pin: true });
    });
  });

  detail.innerHTML = `<span>${en ? "Select any point to inspect that GPU candidate." : "점을 선택하면 해당 GPU 후보의 이름과 근거를 확인할 수 있습니다."}</span>`;
  detail.hidden = false;
}

function renderAdvisorPriceSpeedFrontier(items, model, pricing, currency, roleCandidates, en) {
  if (!pricing || items.length < 2) return "";
  const roleIds = new Set(roleCandidates.map(({ item }) => item.preset.id));
  const entries = items
    .map((item) => ({
      ...item,
      pricePoint: advisorPricePoint(item, pricing, currency),
      speedEvidence: advisorSpeedEvidence(item.confidence, en),
    }))
    .filter((item) => item.pricePoint.value > 0 && item.speed > 0);
  if (entries.length < 2) return "";

  entries.forEach((entry) => {
    entry.onFrontier = !entries.some((other) => (
      other !== entry
      && other.pricePoint.value <= entry.pricePoint.value
      && other.speed >= entry.speed
      && (other.pricePoint.value < entry.pricePoint.value || other.speed > entry.speed)
    ));
  });
  const frontier = entries.filter((entry) => entry.onFrontier).sort((a, b) => a.pricePoint.value - b.pricePoint.value);
  const width = 760;
  const height = 340;
  const margin = { top: 28, right: 28, bottom: 62, left: 76 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const maxPrice = Math.max(...entries.map((entry) => entry.pricePoint.value)) * 1.08;
  const maxSpeed = Math.max(...entries.map((entry) => entry.speed)) * 1.12;
  const x = (value) => margin.left + (value / maxPrice) * plotWidth;
  const y = (value) => margin.top + plotHeight - (value / maxSpeed) * plotHeight;
  const priceTicks = [0, .25, .5, .75, 1].map((ratio) => maxPrice * ratio);
  const speedTicks = [0, .25, .5, .75, 1].map((ratio) => maxSpeed * ratio);
  const unit = entries[0].estimate?.unitLabel || "tok/s";
  const labeledFrontier = frontier.filter((entry, index) => (
    roleIds.has(entry.preset.id) || index === 0 || index === frontier.length - 1
  ));
  const labelBoxes = [];
  const labelPlacements = labeledFrontier.map((entry) => {
    const pointX = x(entry.pricePoint.value);
    const pointY = y(entry.speed);
    const label = shortGpuName(entry.preset.name).replace(/\s*\([^)]*\)\s*$/, "").trim();
    const displayLabel = label.length > 26 ? `${label.slice(0, 25)}…` : label;
    const estimatedWidth = Math.min(170, Math.max(76, displayLabel.length * 6.4));
    const candidates = [
      { x: pointX + 10, y: pointY - 11, anchor: "start" },
      { x: pointX + 10, y: pointY + 20, anchor: "start" },
      { x: pointX - 10, y: pointY - 11, anchor: "end" },
      { x: pointX - 10, y: pointY + 20, anchor: "end" },
      { x: pointX + 10, y: pointY + 38, anchor: "start" },
      { x: pointX - 10, y: pointY + 38, anchor: "end" },
    ];
    const fits = (candidate) => {
      const left = candidate.anchor === "end" ? candidate.x - estimatedWidth : candidate.x;
      const box = { left, right: left + estimatedWidth, top: candidate.y - 13, bottom: candidate.y + 4 };
      const inside = box.left >= margin.left && box.right <= width - margin.right && box.top >= margin.top && box.bottom <= height - margin.bottom;
      const clear = labelBoxes.every((placed) => box.right + 6 < placed.left || box.left - 6 > placed.right || box.bottom + 5 < placed.top || box.top - 5 > placed.bottom);
      return inside && clear ? box : null;
    };
    let placement = candidates.map((candidate) => ({ candidate, box: fits(candidate) })).find(({ box }) => box);
    if (!placement) {
      const fallback = {
        x: Math.max(margin.left + estimatedWidth, Math.min(width - margin.right, pointX - 10)),
        y: Math.max(margin.top + 13, Math.min(height - margin.bottom - 4, pointY - 11)),
        anchor: "end",
      };
      const left = fallback.x - estimatedWidth;
      placement = { candidate: fallback, box: { left, right: fallback.x, top: fallback.y - 13, bottom: fallback.y + 4 } };
    }
    labelBoxes.push(placement.box);
    return { entry, label: displayLabel, ...placement.candidate };
  });
  const compactPrice = (value) => currency === "KRW"
    ? `${Math.round(value / 10000).toLocaleString("ko-KR")}만`
    : `$${Math.round(value).toLocaleString("en-US")}`;
  const frontierLine = frontier.map((entry) => `${x(entry.pricePoint.value).toFixed(1)},${y(entry.speed).toFixed(1)}`).join(" ");
  const setting = (entry) => entry.estimate?.settingLabel || entry.estimate?.quant?.label || entry.estimate?.precision?.label || "—";
  const chartDescription = entries.map((entry) => (
    `${shortGpuName(entry.preset.name)}: ${entry.pricePoint.label}, ${formatThroughput(entry.speed, unit)}, ${setting(entry)}${entry.onFrontier ? (en ? ", on frontier" : ", 프런티어") : ""}`
  )).join("; ");

  return `
    <section class="advisor-frontier" aria-labelledby="advisorFrontierTitle">
      <div class="advisor-frontier-head">
        <div>
          <span class="section-kicker">PRICE × SPEED</span>
          <h3 id="advisorFrontierTitle">${en ? "GPU price–speed frontier" : "GPU별 가격·속도 프런티어"}</h3>
          <p>${en
            ? `For ${escapeHtml(model.name)}, compare every compatible candidate behind the three highlighted recommendations.`
            : `${escapeHtml(model.name)} 실행이 가능한 후보 전체에서 추천 3안이 선택된 위치를 비교합니다.`}</p>
        </div>
        <div class="advisor-frontier-legend" aria-label="${en ? "Chart legend" : "차트 범례"}">
          <span><i class="is-frontier"></i>${en ? "Pareto frontier" : "파레토 프런티어"}</span>
          <span><i class="is-pick"></i>${en ? "Highlighted pick" : "추천 3안"}</span>
          <span><i></i>${en ? "Other candidate" : "그 외 후보"}</span>
        </div>
      </div>
      <p class="advisor-frontier-method">${en
        ? "Lower price and higher estimated speed are better. Every point is a compatible GPU candidate; hover, focus, or tap a point for its name, run setting, and evidence."
        : "가격은 낮을수록, 예상 속도는 높을수록 유리합니다. 모든 점은 선택한 모델을 실행할 GPU 후보이며, 점에 마우스를 올리거나 선택하면 이름·실행 설정·근거가 표시됩니다."}</p>
      <div class="advisor-frontier-chart" role="group" aria-label="${escapeAttr(`${en ? "GPU price-speed frontier" : "GPU 가격·속도 프런티어"}. ${chartDescription}`)}">
        <svg viewBox="0 0 ${width} ${height}" focusable="false">
          ${priceTicks.map((tick) => `<line class="advisor-frontier-grid" x1="${x(tick)}" y1="${margin.top}" x2="${x(tick)}" y2="${height - margin.bottom}"></line><text class="advisor-frontier-axis-label" x="${x(tick)}" y="${height - 35}" text-anchor="middle">${escapeHtml(compactPrice(tick))}</text>`).join("")}
          ${speedTicks.map((tick) => `<line class="advisor-frontier-grid" x1="${margin.left}" y1="${y(tick)}" x2="${width - margin.right}" y2="${y(tick)}"></line><text class="advisor-frontier-axis-label" x="${margin.left - 10}" y="${y(tick) + 4}" text-anchor="end">${escapeHtml(tick ? formatThroughput(tick, unit) : "0")}</text>`).join("")}
          ${frontier.length > 1 ? `<polyline class="advisor-frontier-line" points="${frontierLine}"></polyline>` : ""}
          ${entries.map((entry) => {
            const pointLabel = `${shortGpuName(entry.preset.name)} · ${entry.pricePoint.label} · ${formatThroughput(entry.speed, unit)} · ${setting(entry)} · ${entry.pricePoint.evidence} · ${entry.speedEvidence.label}`;
            return `<g data-advisor-frontier-point="${escapeAttr(entry.preset.id)}" data-frontier-name="${escapeAttr(shortGpuName(entry.preset.name))}" data-frontier-price="${escapeAttr(entry.pricePoint.label)}" data-frontier-speed="${escapeAttr(formatThroughput(entry.speed, unit))}" data-frontier-setting="${escapeAttr(setting(entry))}" data-frontier-evidence="${escapeAttr(`${entry.pricePoint.evidence} · ${entry.speedEvidence.label}`)}" class="advisor-frontier-hit-target ${entry.onFrontier ? "is-frontier" : ""} ${roleIds.has(entry.preset.id) ? "is-pick" : ""}" role="button" tabindex="0" aria-pressed="false" aria-label="${escapeAttr(pointLabel)}"><circle class="advisor-frontier-hit-area" cx="${x(entry.pricePoint.value)}" cy="${y(entry.speed)}" r="12"></circle><circle class="advisor-frontier-point ${entry.onFrontier ? "is-frontier" : ""} ${roleIds.has(entry.preset.id) ? "is-pick" : ""}" cx="${x(entry.pricePoint.value)}" cy="${y(entry.speed)}" r="${roleIds.has(entry.preset.id) ? 8 : entry.onFrontier ? 6 : 4}"><title>${escapeHtml(pointLabel)}</title></circle></g>`;
          }).join("")}
          ${labelPlacements.map(({ label, x: labelX, y: labelY, anchor }) => `<text class="advisor-frontier-model-label" x="${labelX}" y="${labelY}" text-anchor="${anchor}">${escapeHtml(label)}</text>`).join("")}
          <text class="advisor-frontier-axis-title" x="${margin.left + plotWidth / 2}" y="${height - 5}" text-anchor="middle">${en ? `Reference price (${currency})` : "참고 가격 (원)"}</text>
          <text class="advisor-frontier-axis-title" transform="translate(17 ${margin.top + plotHeight / 2}) rotate(-90)" text-anchor="middle">${escapeHtml(en ? `Estimated speed (${unit})` : `예상 속도 (${unit})`)}</text>
        </svg>
        <div class="advisor-frontier-tooltip" data-advisor-frontier-tooltip role="tooltip" hidden></div>
      </div>
      <div class="advisor-frontier-detail" data-advisor-frontier-detail role="status" aria-live="polite"></div>
      <div class="advisor-frontier-table" role="table" aria-label="${en ? "Frontier GPU evidence" : "프런티어 GPU 근거"}">
        <div class="advisor-frontier-row is-head" role="row"><span role="columnheader">GPU</span><span role="columnheader">${en ? "Price" : "가격"}</span><span role="columnheader">${en ? "Speed / setting" : "속도·설정"}</span><span role="columnheader">${en ? "Evidence" : "근거"}</span></div>
        ${frontier.map((entry) => `<div class="advisor-frontier-row" role="row">
          <strong role="cell">${escapeHtml(shortGpuName(entry.preset.name))}${roleIds.has(entry.preset.id) ? `<small>${en ? "Highlighted pick" : "추천 3안"}</small>` : ""}</strong>
          <span role="cell">${escapeHtml(entry.pricePoint.label)}<small class="evidence-badge is-${escapeAttr(entry.pricePoint.kind)}">${escapeHtml(entry.pricePoint.evidence)}</small></span>
          <span role="cell">${escapeHtml(formatThroughput(entry.speed, unit))}<small>${escapeHtml(setting(entry))}</small></span>
          <span role="cell"><small class="evidence-badge is-${escapeAttr(entry.speedEvidence.kind)}" title="${escapeAttr(entry.speedEvidence.detail)}">${escapeHtml(entry.speedEvidence.label)}</small></span>
        </div>`).join("")}
      </div>
      <p class="advisor-frontier-note">${en
        ? "This is a relative planning view, not a guaranteed quote or benchmark. Drivers, runtime, context, batch size, thermals, and regional prices can change the result."
        : "상대 비교용 계획 화면이며 확정 견적이나 보장된 벤치마크가 아닙니다. 드라이버·런타임·컨텍스트·배치·발열·지역별 시세에 따라 실제 결과가 달라질 수 있습니다."}</p>
    </section>`;
}


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
  if ($("advisorModelEmptyText")) $("advisorModelEmptyText").textContent = en
    ? "No matching model. Try another category or search term."
    : "일치하는 모델이 없습니다. 종류나 검색어를 바꿔보세요.";
  const modelEmptyReset = $("advisorModelEmpty")?.querySelector("[data-advisor-reset]");
  if (modelEmptyReset) modelEmptyReset.textContent = en ? "Reset conditions" : "조건 초기화";
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
    if ($("advisorModelEmpty")) $("advisorModelEmpty").hidden = false;
    $("gpuAdvisorResult").innerHTML = `<div class="empty-state"><p>${en ? "No matching model. Try another category or search term." : "일치하는 모델이 없습니다. 종류나 검색어를 바꿔보세요."}</p></div>`;
    return;
  }
  if ($("advisorModelEmpty")) $("advisorModelEmpty").hidden = true;
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
    // Quote-only rack accelerators remain selectable for memory-fit checks,
    // but are not priced/ranked as if they were retail GPU purchases.
    .filter((gpu) => gpu.id !== "custom" && !gpu.requiresSystemQuote)
    .map((preset) => {
      const hardware = buildHardwareForPreset(preset);
      const estimate = applyMeasuredCalibration(estimateAnyModelForHardware(model, hardware), hardware);
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
      const referencePriceUsd = koreanMarket?.lowestKrw
        ? (pricing?.toUsd(koreanMarket.lowestKrw, "KRW") || koreanMarket.lowestKrw / 1400)
        : market.priceUsd;
      const fitsBudget = !referencePriceUsd || referencePriceUsd <= budget;
      const runnable = estimate && GRADE_META[estimate.grade]?.score >= GRADE_META.B.score;
      const speed = Number(estimate?.speed || estimate?.throughput || 0);
      const valueScore = runnable ? speed / Math.max(200, referencePriceUsd || budget || 1000) : 0;
      const fitsVendor = vendor === "all" || preset.vendor === vendor;
      const fitsFormFactor = formFactor === "all" || preset.formFactor === formFactor;
      const confidence = getEstimateConfidence(model, estimate, hardware);
      return { preset, hardware, estimate, confidence, market, koreanMarket, priceState, referencePriceUsd, monthlyEnergy, fitsBudget, fitsVendor, fitsFormFactor, runnable, speed, valueScore };
    });
  const strictCandidates = evaluatedCandidates
    .filter((item) => item.runnable && item.fitsBudget && item.fitsVendor && item.fitsFormFactor)
    .sort((a, b) => b.valueScore - a.valueScore || b.speed - a.speed);
  const showingAlternatives = strictCandidates.length === 0;
  const candidates = showingAlternatives
    ? evaluatedCandidates
      .filter((item) => item.runnable)
      .sort((a, b) => {
        const penalty = (item) => (item.fitsBudget ? 0 : 4) + (item.fitsVendor ? 0 : 2) + (item.fitsFormFactor ? 0 : 2);
        return penalty(a) - penalty(b) || b.valueScore - a.valueScore || b.speed - a.speed;
      })
      .slice(0, 12)
    : strictCandidates.slice(0, 12);
  const comparisonPool = showingAlternatives ? candidates : strictCandidates;
  const roleCandidates = [];
  if (comparisonPool.length) {
    const priced = comparisonPool.filter((item) => item.referencePriceUsd > 0);
    const roleRows = [
      { role: en ? "Lowest cost" : "최저 비용", item: [...(priced.length ? priced : comparisonPool)].sort((a, b) => (a.referencePriceUsd || Infinity) - (b.referencePriceUsd || Infinity))[0] },
      { role: en ? "Balanced" : "균형 추천", item: candidates[0] },
      { role: en ? "Highest performance" : "최고 성능", item: [...comparisonPool].sort((a, b) => b.speed - a.speed)[0] },
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
            <div><dt>${en ? "Run setting" : "실행 설정"}</dt><dd>${escapeHtml(item.estimate?.settingLabel || item.estimate?.quant?.label || item.estimate?.precision?.label || "—")}</dd></div>
            <div><dt>${en ? "Reference price" : "참고 가격"}</dt><dd class="price-state is-${escapeAttr(item.priceState.kind)}">${item.koreanMarket?.lowestKrw
              ? (pricing?.formatFromKrw(item.koreanMarket.lowestKrw, uiLanguage) || `${Math.round(item.koreanMarket.lowestKrw).toLocaleString("ko-KR")}원`)
              : item.priceState.kind === "launch"
                ? (pricing?.formatFromUsd(item.market.priceUsd, uiLanguage) || `$${item.market.priceUsd.toLocaleString("en-US")}`)
                : item.priceState.label}<small>${escapeHtml(item.priceState.label)}${item.priceState.note ? ` · ${escapeHtml(item.priceState.note)}` : ""}</small></dd></div>
            <div><dt>${en ? "Monthly energy" : "월 전력비"}</dt><dd>${pricing ? pricing.formatMoney(advisorCurrency === "KRW" ? pricing.toKrw(item.monthlyEnergy, "USD") : item.monthlyEnergy, advisorCurrency, uiLanguage) : `$${item.monthlyEnergy.toFixed(2)}`}</dd></div>
            <div><dt>${en ? "Evidence" : "근거"}</dt><dd>${escapeHtml(gpuEvidenceLabel(item.preset, en))}</dd></div>
            <div><dt>${en ? "vs current GPU" : "현재 GPU 대비"}</dt><dd>${currentSpeed ? `${(item.speed / currentSpeed).toFixed(2)}×` : "—"}</dd></div>
            <div><dt>${en ? "Speed / $1K" : "속도 / 100만원"}</dt><dd>${(item.speed / Math.max(0.2, en
              ? (item.referencePriceUsd || currentPrice || budget) / 1000
              : (pricing?.toKrw(item.referencePriceUsd || currentPrice || budget, "USD") || 0) / 1000000)).toFixed(1)}</dd></div>
          </dl>
          <button type="button" class="ghost-button" data-advisor-select-gpu="${escapeAttr(item.preset.id)}">${en ? "Use this GPU" : "이 GPU 선택"}</button>
          <a class="ghost-button gpu-buy-link" href="${escapeAttr(window.AIHardwareAffiliate ? window.AIHardwareAffiliate.buildCoupangLink(shortGpuName(item.preset.name)) : `https://www.coupang.com/np/search?q=${encodeURIComponent(shortGpuName(item.preset.name))}`)}" target="_blank" rel="noopener noreferrer sponsored">${en ? "Buy this spec \u2197" : "이 사양대로 사기 \u2197"}</a>
        </article>
      `).join("")}
    </div>
    ${renderAdvisorPriceSpeedFrontier(comparisonPool, model, pricing, advisorCurrency, roleCandidates, en)}
    <p class="advisor-disclaimer">${en ? "A dated Korean market price is shown when available. Otherwise the UI clearly separates launch-price references from supplier-quote-required items. Energy cost uses the selected hours and rate." : "기준일이 있는 국내 시세만 시세로 표시하며, 나머지는 출시 가격 참고와 공급사 견적 필요 상태를 구분합니다. 전력비는 입력한 시간과 요금으로 계산합니다."}</p>
  ` : `<div class="empty-state"><p>${en ? "No GPU with known specifications fits these conditions. Raise the budget or change a filter." : "현재 조건에 맞는 GPU가 없습니다. 예산을 높이거나 필터를 바꿔보세요."}</p><button type="button" class="ghost-button" data-advisor-reset>${en ? "Reset conditions" : "조건 초기화"}</button></div>`;
  panel.querySelector("[data-advisor-relax]")?.addEventListener("click", () => {
    $("advisorVendor").value = "all";
    $("advisorFormFactor").value = "all";
    renderGpuAdvisor();
  });
  bindAdvisorFrontierInteractions(panel, en);
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
