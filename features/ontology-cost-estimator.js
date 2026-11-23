/**
 * "Ontology construction cost" -- a standalone core-task mode, separate
 * from every other mode in this app (including "API vs Local", which
 * answers a monthly-serving-traffic question). This one answers a
 * different, one-time-batch question: "if I feed my own document corpus
 * through an LLM to build a structured ontology/knowledge graph (entities,
 * relations, taxonomy) out of it, roughly what would that cost?" It
 * deliberately reuses data/api-models.js (the same per-token hosted-API
 * pricing catalog the "API vs Local" screen reads) rather than inventing a
 * second pricing catalog, since the underlying unit cost (input/output
 * tokens through a hosted model) is identical -- only the WORKLOAD shape
 * differs (a fixed corpus processed a handful of times, not a recurring
 * monthly request volume), which is why this needs its own tab instead of
 * a mode inside the "API vs Local" panel (see features/api-cost-estimator.js).
 *
 * Cost model: ontology construction is rarely a single LLM call over the
 * raw text. A realistic pipeline re-reads the corpus across a few
 * distinct passes -- e.g. (1) extract entities/relations/concepts per
 * chunk, (2) consolidate/deduplicate those extractions into one merged
 * schema, (3) validate/refine the merged result against the source text
 * again -- and each pass both re-reads roughly the full corpus (input)
 * and produces a smaller structured output. Extracted triples/JSON run far
 * more compact than the source prose, so output is modeled as a fixed
 * fraction of input (OUTPUT_RATIO) rather than a second free-form input.
 *
 * The user's own document corpus is described by PAGE COUNT + DOCUMENT
 * TYPE, not a raw token number -- "500,000 tokens" means nothing to
 * someone planning a project, but "500 pages of scanned contracts" does.
 * Document type matters because a scanned image/photo has to be read by
 * a vision-capable model (or OCR'd first) instead of plain extracted
 * text, and vision input is well-documented to cost meaningfully more
 * per page than the equivalent extracted text -- see
 * DOC_TYPE_MULTIPLIER below for the (explicitly rough) assumption used.
 *
 * This is still a rough planning number, not a quote -- see
 * #ontologyCostCaveat in the rendered panel for the caveat surfaced to
 * the user.
 */
(() => {
  const TIER_LABEL = {
    flagship: { ko: "플래그십", en: "Flagship" },
    balanced: { ko: "균형형", en: "Balanced" },
    economy: { ko: "저가형", en: "Economy" },
  };
  const TIER_ORDER = ["economy", "balanced", "flagship"];

  // Extracted structured output (entities/relations/triples as JSON) runs
  // far more compact than the source prose it was drawn from -- 30% of
  // input token count is a rough, documented planning assumption, not a
  // measured constant. Kept as one shared constant (not user-configurable)
  // so every pass profile below scales consistently.
  const OUTPUT_RATIO = 0.3;

  const PASS_PROFILES = {
    single: { passes: 1, label: { ko: "추출만 (1패스)", en: "Extraction only (1 pass)" } },
    standard: { passes: 2, label: { ko: "추출 + 스키마 통합 (2패스)", en: "Extraction + schema merge (2 passes)" } },
    thorough: { passes: 3, label: { ko: "추출 + 통합 + 검증 (3패스)", en: "Extraction + merge + validation (3 passes)" } },
  };
  const PASS_PROFILE_ORDER = ["single", "standard", "thorough"];

  // Rough words-per-page -> tokens-per-page planning constant for a
  // born-digital text document (a Word/HTML/plain-text page of normal
  // density). Scanned/image pages use this same base, scaled by
  // DOC_TYPE_MULTIPLIER below -- never a second independent constant, so
  // the two document types stay comparable per page.
  const TOKENS_PER_PAGE = 650;

  // How much more a page costs to process when it's a scanned image/photo
  // instead of extracted text: the page has to go through a vision-
  // capable model (or a separate OCR step) rather than plain text tokens,
  // and public per-provider docs consistently describe image input as
  // costing several times more "token-equivalent" than the same page's
  // worth of plain text -- exact figures vary a lot by provider,
  // resolution, and tiling strategy, so 3x is a rough planning multiplier,
  // not a measured constant. If you actually run OCR first and feed the
  // model clean extracted text, use "text" instead -- this multiplier is
  // for feeding raw scans/photos directly to a vision-capable model.
  const IMAGE_TOKEN_MULTIPLIER = 3;

  const DOC_TYPE_MULTIPLIER = { text: 1, scanned: IMAGE_TOKEN_MULTIPLIER };
  const DOC_TYPE_LABEL = {
    text: { ko: "텍스트/디지털 문서 (워드·HTML 등)", en: "Text / digital document (Word, HTML, etc.)" },
    scanned: { ko: "스캔 이미지·사진 (비전 처리 필요)", en: "Scanned image / photo (needs vision processing)" },
  };
  const DOC_TYPE_ORDER = ["text", "scanned"];

  // Scanned-document resolution: even within "scanned/photo", how much a
  // page costs to process still varies a lot by resolution/detail level --
  // most vision APIs' own "low detail" vs "high detail" input modes are the
  // real-world analogue (low detail uses a small fixed token budget per
  // image regardless of size; high detail scales with resolution/tiling).
  // "standard" is set to the same 3x-over-text figure this file used before
  // resolution existed as an input, so a default-configuration estimate is
  // unchanged by this addition -- "low"/"high" let a user move off that
  // default once they know their scan quality.
  const RESOLUTION_MULTIPLIER = { low: 1.5, standard: IMAGE_TOKEN_MULTIPLIER, high: 5 };
  const RESOLUTION_LABEL = {
    low: { ko: "저해상도 (저용량 미리보기·썸네일 수준)", en: "Low resolution (thumbnail/preview quality)" },
    standard: { ko: "표준 해상도 (일반적인 스캔본)", en: "Standard resolution (a typical scan)" },
    high: { ko: "고해상도 (작은 글씨·표까지 정밀 인식 필요)", en: "High resolution (needs to resolve fine print and tables)" },
  };
  const RESOLUTION_ORDER = ["low", "standard", "high"];

  let viewState = { docPages: 500, docType: "text", scanResolution: "standard", passProfile: "thorough", tier: "balanced", selectedProvider: null };

  function apiModels() {
    return window.LLM_GPU_CHECKER_DATA?.apiModels || [];
  }

  function apiExchangeRate() {
    return Math.max(1, Number(window.LLM_GPU_CHECKER_DATA?.priceDataMeta?.exchangeRateKrwPerUsd) || 1400);
  }

  function formatUsd(value) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: value < 10 ? 2 : 0 }).format(value);
  }

  function formatKrw(value) {
    // "₩" rather than "원" for the same reason api-cost-estimator.js uses
    // it -- reads correctly in both languages, never trips the "no Korean
    // text left" i18n audit in English mode.
    return `₩${Math.round(value).toLocaleString("ko-KR")}`;
  }

  // Pure math, no DOM -- converts the two inputs a person actually knows
  // (how many pages, what kind of document) into the token count the cost
  // formula below needs. Reused directly by tests.
  function docTokensFromPages(pages, docType, resolution = "standard") {
    const pageCount = Math.max(0, Number(pages) || 0);
    // Resolution only changes anything for scanned pages -- a text/digital
    // document has no "resolution" to speak of, so it always uses the
    // plain per-page rate regardless of what the (irrelevant, in that case)
    // resolution selector happens to be set to.
    const multiplier = docType === "scanned" ? (RESOLUTION_MULTIPLIER[resolution] || RESOLUTION_MULTIPLIER.standard) : 1;
    return Math.round(pageCount * TOKENS_PER_PAGE * multiplier);
  }

  // Pure math, no DOM -- reused directly by tests. Given a total document
  // token count and a pass-profile key, returns every API model's cost for
  // processing that corpus through that many passes, cheapest first, with
  // the input/output split broken out (e.g. for the selected-card
  // breakdown in the panel).
  function estimateOntologyCost({ docTokens, passProfileKey }) {
    const profile = PASS_PROFILES[passProfileKey] || PASS_PROFILES.thorough;
    const tokens = Math.max(0, Number(docTokens) || 0);
    const totalInputTokens = tokens * profile.passes;
    const totalOutputTokens = totalInputTokens * OUTPUT_RATIO;
    const rate = apiExchangeRate();
    return apiModels()
      .map((model) => {
        const inputCostUsd = (totalInputTokens / 1_000_000) * model.inputPerMTokUsd;
        const outputCostUsd = (totalOutputTokens / 1_000_000) * model.outputPerMTokUsd;
        const costUsd = inputCostUsd + outputCostUsd;
        return {
          ...model,
          totalInputTokens,
          totalOutputTokens,
          inputCostUsd,
          outputCostUsd,
          inputCostKrw: inputCostUsd * rate,
          outputCostKrw: outputCostUsd * rate,
          costUsd,
          costKrw: costUsd * rate,
        };
      })
      .sort((a, b) => a.costUsd - b.costUsd);
  }

  function ensureOntologyCostPanel() {
    if (typeof $ !== "function") return null;
    if ($("ontologyCostPanel")) return $("ontologyCostPanel");
    const mount = document.querySelector(".app-shell");
    if (!mount) return null;
    const panel = document.createElement("section");
    // Reuse the "API vs Local" panel's own classes (gpu-advisor-panel,
    // api-cost-panel, api-cost-candidates, api-cost-candidate-card,
    // studio-question-grid, simple-data-coverage, studio-form-note)
    // instead of adding a near-duplicate CSS section -- this panel's
    // visual shape (question grid -> candidate cards -> caveat note) is
    // deliberately the same, and every one of those classes is selector-
    // scoped by class name, not by #apiCostPanel's id, so nothing new
    // needs to be added to styles.css (already close to its size budget)
    // for this to look right.
    panel.className = "gpu-advisor-panel api-cost-panel";
    panel.id = "ontologyCostPanel";
    panel.hidden = true;
    panel.setAttribute("aria-labelledby", "ontologyCostTitle");
    panel.innerHTML = `
      <div class="gpu-insights-head">
        <div>
          <span class="section-kicker" id="ontologyCostKicker"></span>
          <h2 id="ontologyCostTitle"></h2>
          <p id="ontologyCostNote"></p>
        </div>
      </div>
      <div class="studio-question-grid">
        <label class="field"><span id="ontologyCostDocPagesLabel"></span><input id="ontologyCostDocPages" type="number" min="0" step="10" value="500"></label>
        <label class="field"><span id="ontologyCostDocTypeLabel"></span>
          <select id="ontologyCostDocType">
            <option value="text"></option>
            <option value="scanned"></option>
          </select>
        </label>
        <label class="field"><span id="ontologyCostResolutionLabel"></span>
          <select id="ontologyCostResolution">
            <option value="low"></option>
            <option value="standard"></option>
            <option value="high"></option>
          </select>
        </label>
        <label class="field"><span id="ontologyCostPassLabel"></span>
          <select id="ontologyCostPassProfile">
            <option value="single"></option>
            <option value="standard"></option>
            <option value="thorough"></option>
          </select>
        </label>
        <label class="field"><span id="ontologyCostTierLabel"></span>
          <select id="ontologyCostTier">
            <option value="economy"></option>
            <option value="balanced"></option>
            <option value="flagship"></option>
          </select>
        </label>
      </div>
      <div class="simple-data-coverage" id="ontologyCostUsageSummary" aria-label="처리 조건"></div>
      <div class="api-cost-candidates" id="ontologyCostTable" role="listbox" aria-label="제공사별 예상 비용 -- 클릭하면 비용 상세를 볼 수 있음"></div>
      <p class="studio-form-note" id="ontologyCostCaveat"></p>
    `;
    mount.appendChild(panel);
    panel.querySelector("#ontologyCostDocPages").addEventListener("input", (event) => {
      viewState.docPages = event.target.value;
      renderOntologyCostEstimator();
    });
    panel.querySelector("#ontologyCostDocType").addEventListener("change", (event) => {
      viewState.docType = event.target.value;
      renderOntologyCostEstimator();
    });
    panel.querySelector("#ontologyCostResolution").addEventListener("change", (event) => {
      viewState.scanResolution = event.target.value;
      renderOntologyCostEstimator();
    });
    panel.querySelector("#ontologyCostPassProfile").addEventListener("change", (event) => {
      viewState.passProfile = event.target.value;
      renderOntologyCostEstimator();
    });
    panel.querySelector("#ontologyCostTier").addEventListener("change", (event) => {
      viewState.tier = event.target.value;
      renderOntologyCostEstimator();
    });
    // Delegated click handler for candidate-card selection (same pattern
    // as #apiCostTable in features/api-cost-estimator.js): cards are
    // rebuilt from scratch on every render, so the listener is bound once
    // on the stable container instead of on the cards themselves.
    // Selecting a card doesn't change any other figure on this panel (no
    // verdict banner / breakeven chart downstream, unlike "API vs Local")
    // -- it only reveals that provider's own input/output cost split, so
    // clicking the same card again hides the breakdown rather than being
    // a no-op.
    panel.querySelector("#ontologyCostTable").addEventListener("click", (event) => {
      const card = event.target.closest("[data-provider]");
      if (!card) return;
      const provider = card.getAttribute("data-provider");
      viewState.selectedProvider = viewState.selectedProvider === provider ? null : provider;
      renderOntologyCostEstimator();
    });
    return panel;
  }

  // Mirrors apiCostCandidateCard()'s DOM shape (features/api-cost-
  // estimator.js) -- same class names, same <button role="option">
  // element inside a role="listbox" container -- so this reuses that
  // panel's CSS and accessibility pattern with zero new rules. Clicking a
  // card reveals its own input/output cost breakdown underneath (see
  // isSelected below) instead of driving a verdict banner elsewhere, since
  // this panel has no such banner.
  function ontologyCandidateCard(row, language, isCheapest, isSelected) {
    const en = language === "en";
    const tierLabel = TIER_LABEL[row.tier]?.[en ? "en" : "ko"] || row.tier;
    const note = row.note?.[en ? "en" : "ko"] || "";
    const badgeText = isSelected
      ? (isCheapest ? (en ? "Cheapest · Selected" : "최저가·선택됨") : (en ? "Selected" : "선택됨"))
      : (isCheapest ? (en ? "Cheapest" : "최저가") : "");
    const classes = ["api-cost-candidate-card"];
    if (isCheapest) classes.push("is-cheapest");
    if (isSelected) classes.push("is-selected");
    const breakdown = isSelected
      ? `<span class="api-cost-candidate-rates">${en ? "Input cost" : "입력 비용"} ${escapeHtml(formatUsd(row.inputCostUsd))} (${escapeHtml(formatKrw(row.inputCostKrw))}) · ${en ? "Output cost" : "출력 비용"} ${escapeHtml(formatUsd(row.outputCostUsd))} (${escapeHtml(formatKrw(row.outputCostKrw))})</span>`
      : "";
    return `<button type="button" role="option" aria-selected="${isSelected ? "true" : "false"}" class="${classes.join(" ")}" data-provider="${escapeAttr(row.provider)}">
      <span class="api-cost-candidate-provider">${escapeHtml(row.provider)}</span>
      <strong class="api-cost-candidate-cost">${escapeHtml(formatUsd(row.costUsd))}<small>${escapeHtml(formatKrw(row.costKrw))}</small></strong>
      <span class="api-cost-candidate-name">
        <span class="api-cost-candidate-name-text" title="${escapeAttr(note)}">${escapeHtml(row.name)}</span>
        ${badgeText ? `<span class="placement-primary-badge">${escapeHtml(badgeText)}</span>` : ""}
      </span>
      <span class="api-cost-candidate-rates">${en ? "Tier" : "등급"} ${escapeHtml(tierLabel)} · ${en ? "in" : "입력"} $${row.inputPerMTokUsd.toFixed(2)}/1M · ${en ? "out" : "출력"} $${row.outputPerMTokUsd.toFixed(2)}/1M</span>
      ${breakdown}
    </button>`;
  }

  function renderOntologyCostEstimator() {
    const panel = ensureOntologyCostPanel();
    if (!panel) return;
    const en = uiLanguage === "en";
    panel.querySelector("#ontologyCostKicker").textContent = en ? "ONTOLOGY COST" : "온톨로지 구축 비용";
    panel.querySelector("#ontologyCostTitle").textContent = en ? "Ontology construction cost" : "온톨로지 구축 비용";
    panel.querySelector("#ontologyCostNote").textContent = en
      ? "Estimate what it costs to turn your own documents into a structured ontology/knowledge graph via a hosted LLM -- a one-time batch job, not a monthly running cost."
      : "내 문서를 LLM으로 구조화된 온톨로지·지식그래프로 만들 때 드는 비용을 추정합니다. 매달 반복되는 비용이 아니라 1회성 배치 작업 기준입니다.";
    panel.querySelector("#ontologyCostDocPagesLabel").textContent = en ? "Document count (pages)" : "처리할 문서 분량 (페이지 수)";
    panel.querySelector("#ontologyCostDocTypeLabel").textContent = en ? "Document type" : "문서 유형";
    panel.querySelector("#ontologyCostResolutionLabel").textContent = en ? "Scan resolution (scanned docs only)" : "스캔 해상도 (스캔 문서에만 적용)";
    panel.querySelector("#ontologyCostPassLabel").textContent = en ? "Pipeline depth" : "처리 단계";
    panel.querySelector("#ontologyCostTierLabel").textContent = en ? "Model tier" : "모델 등급";

    const docPagesInput = panel.querySelector("#ontologyCostDocPages");
    if (document.activeElement !== docPagesInput) docPagesInput.value = String(viewState.docPages);

    const docTypeSelect = panel.querySelector("#ontologyCostDocType");
    [...docTypeSelect.options].forEach((option) => {
      option.textContent = DOC_TYPE_LABEL[option.value]?.[en ? "en" : "ko"] || option.value;
    });
    docTypeSelect.value = viewState.docType;

    const resolutionSelect = panel.querySelector("#ontologyCostResolution");
    [...resolutionSelect.options].forEach((option) => {
      option.textContent = RESOLUTION_LABEL[option.value]?.[en ? "en" : "ko"] || option.value;
    });
    resolutionSelect.value = viewState.scanResolution;
    // The resolution choice only means anything once a scan is on screen --
    // disabling it for a text document (rather than hiding it) keeps the
    // question grid's layout fixed across both document types, matching
    // every other field in this panel never appearing/disappearing.
    resolutionSelect.disabled = viewState.docType !== "scanned";

    const passSelect = panel.querySelector("#ontologyCostPassProfile");
    [...passSelect.options].forEach((option) => {
      option.textContent = PASS_PROFILES[option.value]?.label[en ? "en" : "ko"] || option.value;
    });
    passSelect.value = viewState.passProfile;

    const tierSelect = panel.querySelector("#ontologyCostTier");
    [...tierSelect.options].forEach((option) => {
      option.textContent = TIER_LABEL[option.value]?.[en ? "en" : "ko"] || option.value;
    });
    tierSelect.value = viewState.tier;

    const docTokens = docTokensFromPages(viewState.docPages, viewState.docType, viewState.scanResolution);
    const rows = estimateOntologyCost({ docTokens, passProfileKey: viewState.passProfile }).filter((row) => row.tier === viewState.tier && !apiModels().some((candidate) => candidate.supersedes === row.id));
    const cheapestUsd = rows.length ? Math.min(...rows.map((row) => row.costUsd)) : 0;
    // A previously-selected provider can disappear from view when the
    // tier changes (each tier only shows its own 3 models) -- clear a
    // stale selection rather than silently keeping a breakdown open for a
    // card that's no longer on screen.
    if (viewState.selectedProvider && !rows.some((row) => row.provider === viewState.selectedProvider)) {
      viewState.selectedProvider = null;
    }

    const totalInputTokens = rows[0]?.totalInputTokens ?? 0;
    const totalOutputTokens = rows[0]?.totalOutputTokens ?? 0;
    const docTypeLabel = DOC_TYPE_LABEL[viewState.docType]?.[en ? "en" : "ko"] || viewState.docType;
    const resolutionLabel = RESOLUTION_LABEL[viewState.scanResolution]?.[en ? "en" : "ko"] || viewState.scanResolution;
    // Only mention resolution in the summary when it actually applied to
    // the calculation above -- for a text document it's a no-op, and
    // showing it anyway would suggest it changed something it didn't.
    const docTypeSummary = viewState.docType === "scanned" ? `${docTypeLabel} · ${resolutionLabel}` : docTypeLabel;
    panel.querySelector("#ontologyCostUsageSummary").textContent = en
      ? `${Math.round(Number(viewState.docPages) || 0).toLocaleString("en-US")} pages (${docTypeSummary}) · total input ${Math.round(totalInputTokens).toLocaleString("en-US")} tokens · total output ${Math.round(totalOutputTokens).toLocaleString("en-US")} tokens`
      : `${Math.round(Number(viewState.docPages) || 0).toLocaleString("ko-KR")}페이지 (${docTypeSummary}) · 총 입력 ${Math.round(totalInputTokens).toLocaleString("ko-KR")} 토큰 · 총 출력 ${Math.round(totalOutputTokens).toLocaleString("ko-KR")} 토큰`;

    panel.querySelector("#ontologyCostTable").innerHTML = rows
      .map((row) => ontologyCandidateCard(row, uiLanguage, row.costUsd === cheapestUsd, row.provider === viewState.selectedProvider))
      .join("");

    const activeMultiplier = RESOLUTION_MULTIPLIER[viewState.scanResolution] || RESOLUTION_MULTIPLIER.standard;
    const scannedCaveat = viewState.docType === "scanned"
      ? (en
        ? ` Scanned/photo pages at ${resolutionLabel.toLowerCase()} are assumed to cost ${activeMultiplier}x the text-page rate to process via vision -- an OCR step beforehand can be cheaper than feeding raw scans directly, and isn't modeled here.`
        : ` 스캔·사진 문서(${resolutionLabel})는 비전 처리 비용이 텍스트 대비 ${activeMultiplier}배라고 가정했습니다 -- 사전에 OCR로 텍스트를 추출하면 더 저렴할 수 있으며, 그 경로는 반영하지 않았습니다.`)
      : "";
    panel.querySelector("#ontologyCostCaveat").textContent = (en
      ? "Planning estimate only: pass count and the 30% output-token ratio are documented assumptions, not measurements -- actual chunking strategy, retries, and validation depth change real cost. No prompt caching or batch discounts are modeled."
      : "참고용 추정치입니다. 패스 횟수와 출력 토큰 비율(입력 대비 30%)은 실측이 아닌 가정값이며, 실제 청킹 전략·재시도·검증 깊이에 따라 비용이 달라질 수 있습니다. 프롬프트 캐싱·배치 할인은 반영하지 않았습니다.")
      + scannedCaveat;
  }

  window.AIHardwareOntologyCost = {
    estimateOntologyCost,
    docTokensFromPages,
    PASS_PROFILES,
    PASS_PROFILE_ORDER,
    TIER_LABEL,
    TIER_ORDER,
    DOC_TYPE_LABEL,
    DOC_TYPE_ORDER,
    DOC_TYPE_MULTIPLIER,
    RESOLUTION_LABEL,
    RESOLUTION_ORDER,
    RESOLUTION_MULTIPLIER,
    ensureOntologyCostPanel,
    renderOntologyCostEstimator,
    formatUsd,
    formatKrw,
  };
})();
