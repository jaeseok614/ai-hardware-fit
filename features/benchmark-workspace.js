(() => {
function renderBenchmarkDashboardWorkspace() {
  const target = $("benchmarkDashboard");
  if (!target) return;
  target.hidden = false;
  const en = uiLanguage === "en";
  const measured = BENCHMARKS.filter((row) => benchmarkEvidenceType(row) !== "external");
  const external = BENCHMARKS.filter((row) => benchmarkEvidenceType(row) === "external");
  const gpuIds = new Set(measured.map((row) => row.gpuId).filter(Boolean));
  const modelNames = new Set(measured.map((row) => row.modelName || row.modelKey).filter(Boolean));
  const errors = computeBenchmarkErrorStats();
  const targets = ["rtx3060-12", "rtx4090-24", "rtx5090-32", "rx7900xtx-24", "ryzen-ai-max-plus-395-128", "arcb580-12", "m4max-128"]
    .filter((id) => !gpuIds.has(id))
    .map((id) => GPU_PRESETS.find((gpu) => gpu.id === id)?.name)
    .filter(Boolean);
  target.innerHTML = `
    <div class="gpu-insights-head">
      <div><span class="section-kicker">MEASURED DATA</span><h2 id="benchmarkDashboardTitle">${uiText("benchmark.dashboard")}</h2></div>
      <a class="ghost-button" href="https://github.com/jaeseok614/ai-hardware-fit/issues/new?template=benchmark-report.yml" target="_blank" rel="noreferrer">${uiText("benchmark.submit")}</a>
    </div>
    <div class="benchmark-dashboard-grid">
      <div><span>${en ? "Measured rows" : "실측 데이터"}</span><strong>${measured.length}</strong></div>
      <div><span>${en ? "GPU coverage" : "측정 GPU"}</span><strong>${gpuIds.size}</strong></div>
      <div><span>${en ? "Model coverage" : "측정 모델"}</span><strong>${modelNames.size}</strong></div>
      <div><span>${en ? "External references" : "외부 참고값"}</span><strong>${external.length}</strong></div>
      <div><span>${en ? "Average estimate error" : "평균 추정 오차"}</span><strong>${errors ? `${errors.avgAbsErrorPct.toFixed(1)}%` : "—"}</strong></div>
    </div>
    <p>${targets.length ? `${en ? "Priority measurements needed" : "우선 측정 필요"}: ${escapeHtml(targets.slice(0, 5).join(", "))}` : (en ? "Priority GPU coverage is complete." : "우선 GPU 측정 범위가 충족되었습니다.")}</p>
  `;
}


const BENCHMARK_THROUGHPUT_FAMILIES = new Set(["tok/s", "doc/s", "pair/s", "page/s"]);
const BENCHMARK_DEFAULT_FAMILY_COUNT = 3;
const BENCHMARK_DEFAULT_ROWS_PER_FAMILY = 5;

// Most quality benchmarks in this dataset report a 0-100 score, but a few
// well-known ones use a different native scale — bars should fill against
// the metric's real ceiling, not just the highest value currently on
// screen, so the bar length is an honest read of "how good is this."
const BENCHMARK_SCORE_SCALE_OVERRIDES = {
  "MT-Bench": 10,
  LogicKor: 10,
  OCRBench: 1000,
  "Korean Avg": 1,
};
const BENCHMARK_DEFAULT_SCORE_SCALE = 100;

// Short, plain-language explanations shown under a chart group's title so
// unfamiliar benchmark names (MMLU-Pro, BEIR, ...) are legible at a glance.
const BENCHMARK_METRIC_DESCRIPTIONS = {
  ko: {
    "MMLU-Pro": "다양한 학문 분야 객관식 문제로 지식·추론 능력을 측정 (0~100점, 높을수록 좋음)",
    MMLU: "57개 과목 객관식 문제로 일반 지식을 측정하는 대표적 벤치마크 (0~100점, 높을수록 좋음)",
    MMMLU: "MMLU를 여러 언어로 번역해 다국어 지식을 측정 (0~100점, 높을수록 좋음)",
    KMMLU: "한국 현지 시험 문제 기반으로 한국어 지식을 측정하는 벤치마크 (0~100점, 높을수록 좋음)",
    "GPQA-D": "대학원 수준 과학 문제로 고난도 추론력을 측정 (0~100점, 높을수록 좋음)",
    GPQA: "대학원 수준 과학 문제로 고난도 추론력을 측정 (0~100점, 높을수록 좋음)",
    HumanEval: "코드 생성 정답률을 측정하는 프로그래밍 벤치마크 (0~100%, 높을수록 좋음)",
    MBPP: "짧은 파이썬 문제 풀이 정답률을 측정하는 프로그래밍 벤치마크 (0~100%, 높을수록 좋음)",
    "AIME24": "고난도 수학 경시대회 문제 정답률 (0~100%, 높을수록 좋음)",
    "AIME25": "고난도 수학 경시대회 문제 정답률 (0~100%, 높을수록 좋음)",
    MATH: "수학 문제 풀이 정답률을 측정하는 벤치마크 (0~100%, 높을수록 좋음)",
    GSM8K: "초중등 수준 산술 문장제 정답률을 측정 (0~100%, 높을수록 좋음)",
    BEIR: "여러 검색 과제를 모은 임베딩 검색 품질 벤치마크 (0~100, 높을수록 좋음)",
    "NDCG@10": "검색 결과 상위 10개의 순위 품질을 측정하는 지표 (0~100, 높을수록 좋음)",
    MTEB: "다양한 임베딩 과제를 모은 종합 벤치마크 (0~100, 높을수록 좋음)",
    IFEval: "복잡한 지시사항을 얼마나 정확히 따르는지 측정 (0~100%, 높을수록 좋음)",
    "MT-Bench": "여러 턴 대화 품질을 GPT가 채점하는 벤치마크 (0~10점, 높을수록 좋음)",
    LogicKor: "한국어 논리·추론 능력을 채점하는 벤치마크 (0~10점, 높을수록 좋음)",
    "Arena Hard": "어려운 실사용 질문에 대한 응답 품질을 비교 평가 (0~100, 높을수록 좋음)",
    OCRBench: "문서·장면 텍스트 인식 정확도를 종합 평가 (0~1000점, 높을수록 좋음)",
    "OCRBench v2": "OCRBench의 확장판으로 문서 인식 정확도를 평가 (0~100, 높을수록 좋음)",
    "OmniDocBench v1.5": "문서 파싱(텍스트·표·수식·레이아웃) 정확도를 종합 평가하는 벤치마크 (0~100, 높을수록 좋음)",
    "OmniDocBench v1.6": "문서 파싱(텍스트·표·수식·레이아웃) 정확도를 종합 평가하는 벤치마크 v1.6판 (0~100, 높을수록 좋음)",
    "OCR Acc": "텍스트 인식 가중 정확도 (0~100%, 높을수록 좋음)",
    "olmOCR-bench": "문서를 마크다운으로 변환하는 정확도를 종합 평가하는 벤치마크 (0~100, 높을수록 좋음)",
    DocVQA: "문서 이미지에 대한 질의응답 정확도를 측정 (0~100, 높을수록 좋음)",
    MMMU: "이미지가 포함된 대학 수준 문제로 멀티모달 이해력을 측정 (0~100, 높을수록 좋음)",
    "Korean Avg": "한국어 벤치마크 여러 개의 평균 점수 (0~1, 높을수록 좋음)",
    Avg: "여러 벤치마크의 평균 점수 (높을수록 좋음)",
    "tok/s": "초당 생성 토큰 수 (텍스트 생성 속도, 높을수록 빠름)",
    "doc/s": "초당 처리 문서 수 (임베딩 처리 속도, 높을수록 빠름)",
    "pair/s": "초당 처리 문서쌍 수 (리랭킹 처리 속도, 높을수록 빠름)",
    "page/s": "초당 처리 페이지 수 (OCR 처리 속도, 높을수록 빠름)",
  },
  en: {
    "MMLU-Pro": "Multiple-choice knowledge/reasoning test across academic subjects (0-100, higher is better)",
    MMLU: "The classic 57-subject multiple-choice knowledge benchmark (0-100, higher is better)",
    MMMLU: "MMLU translated into multiple languages to test multilingual knowledge (0-100, higher is better)",
    KMMLU: "Knowledge benchmark built from real Korean exam questions (0-100, higher is better)",
    "GPQA-D": "Graduate-level science questions testing hard reasoning (0-100, higher is better)",
    GPQA: "Graduate-level science questions testing hard reasoning (0-100, higher is better)",
    HumanEval: "Code-generation accuracy benchmark (0-100%, higher is better)",
    MBPP: "Short Python problem-solving accuracy benchmark (0-100%, higher is better)",
    AIME24: "Accuracy on hard math-competition problems (0-100%, higher is better)",
    AIME25: "Accuracy on hard math-competition problems (0-100%, higher is better)",
    MATH: "Math problem-solving accuracy benchmark (0-100%, higher is better)",
    GSM8K: "Grade-school arithmetic word-problem accuracy (0-100%, higher is better)",
    BEIR: "A collection of retrieval tasks used to grade embedding search quality (0-100, higher is better)",
    "NDCG@10": "Ranking quality of the top 10 search results (0-100, higher is better)",
    MTEB: "A broad suite of embedding tasks combined into one benchmark (0-100, higher is better)",
    IFEval: "How precisely a model follows complex instructions (0-100%, higher is better)",
    "MT-Bench": "Multi-turn conversation quality, graded by GPT (0-10, higher is better)",
    LogicKor: "Korean logic/reasoning ability benchmark (0-10, higher is better)",
    "Arena Hard": "Response quality on hard real-world questions, compared head-to-head (0-100, higher is better)",
    OCRBench: "Aggregate document/scene text-recognition accuracy (0-1000, higher is better)",
    "OCRBench v2": "An expanded version of OCRBench for document recognition accuracy (0-100, higher is better)",
    "OmniDocBench v1.5": "Aggregate document-parsing accuracy (text/tables/formulas/layout) (0-100, higher is better)",
    "OmniDocBench v1.6": "Aggregate document-parsing accuracy, v1.6 revision (0-100, higher is better)",
    "OCR Acc": "Weighted text-recognition accuracy (0-100%, higher is better)",
    "olmOCR-bench": "Aggregate accuracy for converting documents to markdown (0-100, higher is better)",
    DocVQA: "Question-answering accuracy over document images (0-100, higher is better)",
    MMMU: "College-level multimodal understanding with images (0-100, higher is better)",
    "Korean Avg": "Average score across several Korean-language benchmarks (0-1, higher is better)",
    Avg: "Average score across several benchmarks (higher is better)",
    "tok/s": "Tokens generated per second (text generation speed, higher is faster)",
    "doc/s": "Documents processed per second (embedding throughput, higher is faster)",
    "pair/s": "Document pairs processed per second (reranking throughput, higher is faster)",
    "page/s": "Pages processed per second (OCR throughput, higher is faster)",
  },
};

function benchmarkMetricDescription(family) {
  const dict = BENCHMARK_METRIC_DESCRIPTIONS[uiLanguage] || BENCHMARK_METRIC_DESCRIPTIONS.ko;
  return dict[family] || null;
}

function benchmarkScoreScaleMax(family, entries) {
  const assumed = BENCHMARK_SCORE_SCALE_OVERRIDES[family] ?? BENCHMARK_DEFAULT_SCORE_SCALE;
  const observedMax = Math.max(...entries.map((entry) => entry.value));
  // Safety net: if an unrecognized metric's real values exceed our assumed
  // ceiling, the assumption is wrong for this group — fall back to scaling
  // against the observed max rather than clamping everything to 100%.
  return { scaleMax: Math.max(assumed, observedMax), isAssumedScale: observedMax <= assumed };
}

function benchmarkGroupAnalysisText(family, sortedDesc) {
  if (sortedDesc.length < 2) return null;
  const best = sortedDesc[0];
  const worst = sortedDesc[sortedDesc.length - 1];
  if (best.value === worst.value) return null;
  const isThroughput = BENCHMARK_THROUGHPUT_FAMILIES.has(family);
  const diffPct = worst.value !== 0 ? Math.round(((best.value - worst.value) / Math.abs(worst.value)) * 100) : null;

  if (uiLanguage === "en") {
    const verb = isThroughput ? "fastest" : "highest";
    const tail = diffPct !== null && diffPct > 0 ? ` — ${diffPct}% ahead of ${worst.row.modelName}` : "";
    return `On ${family}, ${best.row.modelName} is ${verb} at ${best.value.toLocaleString()}${tail}.`;
  }
  const verb = isThroughput ? "가장 빠릅니다" : "가장 높습니다";
  const tail = diffPct !== null && diffPct > 0 ? ` (${worst.row.modelName} 대비 +${diffPct}%)` : "";
  return `${family} 기준 ${best.row.modelName}이(가) ${best.value.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}로 ${verb}${tail}.`;
}

function renderBenchmarkChart(allRows, selectedRows) {
  const target = $("benchmarkChart");
  if (!target) return;
  const isDefault = !selectedRows;
  const sourceRows = isDefault ? allRows : selectedRows;
  const chartable = sourceRows
    .map((row) => ({ row, family: benchmarkMetricFamily(row), value: benchmarkMetricValue(row) }))
    .filter((entry) => entry.family && typeof entry.value === "number");

  if (!chartable.length) {
    target.hidden = true;
    target.innerHTML = "";
    return;
  }

  const groups = new Map();
  chartable.forEach((entry) => {
    const group = groups.get(entry.family) || [];
    group.push(entry);
    groups.set(entry.family, group);
  });

  let groupEntries = [...groups.entries()];
  if (isDefault) {
    // Nothing checked yet: surface the most-populated metric families so the
    // chart isn't empty, rather than requiring a selection first.
    groupEntries = groupEntries
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, BENCHMARK_DEFAULT_FAMILY_COUNT)
      .map(([family, entries]) => [
        family,
        [...entries].sort((a, b) => b.value - a.value).slice(0, BENCHMARK_DEFAULT_ROWS_PER_FAMILY),
      ]);
  }

  target.hidden = false;
  const intro = isDefault
    ? (uiLanguage === "en"
        ? "No rows selected yet — showing the top entries for the most common metrics below. Check rows in the table to compare specific models instead."
        : "아직 선택한 행이 없어 가장 많이 등장하는 지표의 상위 항목을 보여주고 있습니다. 표에서 체크하면 원하는 모델로 바뀝니다.")
    : (uiLanguage === "en"
        ? "Only rows sharing the exact same metric are grouped into one bar chart — different metrics are never compared directly."
        : "정확히 같은 지표를 가진 행끼리만 하나의 막대 그래프로 묶습니다. 서로 다른 지표는 직접 비교하지 않습니다.");

  target.innerHTML = `
    <p class="benchmark-chart-intro">${escapeHtml(intro)}</p>
    ${groupEntries.map(([family, entries]) => {
      const isThroughput = BENCHMARK_THROUGHPUT_FAMILIES.has(family);
      const sorted = [...entries].sort((a, b) => b.value - a.value);
      const analysis = benchmarkGroupAnalysisText(family, sorted);
      const description = benchmarkMetricDescription(family);
      // Throughput metrics (tok/s, ...) have no fixed ceiling, so bars stay
      // relative to whatever's on screen. Score-style metrics fill against
      // their real scale (100 for most, 10 for MT-Bench, etc.) so the bar
      // length honestly reflects the value instead of every close-together
      // score stretching to look ~100% full.
      const { scaleMax, isAssumedScale } = isThroughput
        ? { scaleMax: Math.max(...entries.map((entry) => entry.value)), isAssumedScale: false }
        : benchmarkScoreScaleMax(family, entries);
      return `
        <div class="benchmark-chart-group">
          <span class="benchmark-chart-group-title">${escapeHtml(family)}</span>
          ${description ? `<p class="benchmark-chart-group-description">${escapeHtml(description)}</p>` : ""}
          ${sorted.map(({ row, value }) => `
            <div class="benchmark-chart-bar-row">
              <span class="benchmark-chart-bar-label" title="${escapeAttr(`${row.modelName} · ${row.gpu || row.gpuId || ""}`)}">${escapeHtml(row.modelName)}</span>
              <span class="benchmark-chart-bar-track"><span class="benchmark-chart-bar-fill" style="width:${Math.max(2, Math.round((value / scaleMax) * 100))}%"></span></span>
              <span class="benchmark-chart-bar-value">${value.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}${!isThroughput && isAssumedScale ? `<span class="benchmark-chart-bar-scale">/${scaleMax}</span>` : ""}</span>
            </div>
          `).join("")}
          ${analysis ? `<p class="benchmark-chart-group-analysis">${escapeHtml(analysis)}</p>` : ""}
        </div>
      `;
    }).join("")}
  `;
}

// Shared row-building logic for the benchmark sheet: assembles the same
// concatenated, rowKey-tagged row list every caller needs (the table/chart
// render below, and selectBenchmarkMetricFamily's quick-compare action) so
// rowKey values always line up regardless of who builds the list.
function buildBenchmarkSheetRows() {
  const benchmarkRows = BENCHMARKS.map((row) => ({ ...row, rowType: benchmarkEvidenceLabel(row) }));
  const userMeasurementRows = benchmarkRows.filter((row) => row.rowType === "사용자 측정");
  const projectMeasurementRows = benchmarkRows.filter((row) => row.rowType === "자체 측정");
  const externalBenchmarkRows = benchmarkRows.filter((row) => row.rowType === "외부 공개 참고값");
  const qualityRows = collectQualityBenchmarks();
  const referenceRows = collectReferenceBenchmarks();
  const rows = [...qualityRows, ...externalBenchmarkRows, ...referenceRows, ...userMeasurementRows, ...projectMeasurementRows];
  rows.forEach((row, index) => {
    row.rowKey = String(index);
    // qualityRows/referenceRows already carry params/active/releaseDate from
    // their source model; the raw BENCHMARKS-derived rows (external/user/
    // project measurements) only have modelName, so look the model up once
    // to fill in the same fields for the 규모/출시 column.
    if (row.params == null && row.releaseDate == null) {
      const model = getAllModels().find((item) => item.name === row.modelName);
      if (model) {
        row.params = model.params;
        row.active = model.active;
        row.releaseDate = model.releaseDate;
      }
    }
  });
  const externalReferenceCount = qualityRows.length + externalBenchmarkRows.length + referenceRows.length;
  return { rows, userMeasurementRows, projectMeasurementRows, externalReferenceCount };
}

// Populates the "지표로 비교할 모델 선택" dropdown with every metric family that
// has 2+ rows (families with a single row can never produce a real
// comparison, so they're left out). Picking one is a shortcut for manually
// hunting through checkboxes for rows that happen to share a metric.
function renderBenchmarkMetricFilterOptions(rows) {
  const select = $("benchmarkMetricFilter");
  if (!select) return;
  const counts = new Map();
  rows.forEach((row) => {
    const family = benchmarkMetricFamily(row);
    if (!family || typeof benchmarkMetricValue(row) !== "number") return;
    counts.set(family, (counts.get(family) || 0) + 1);
  });
  const families = [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const placeholder = uiLanguage === "en" ? "Compare models by metric" : "지표로 비교할 모델 선택";
  const previousValue = select.value;
  select.innerHTML = [
    `<option value="">${escapeHtml(placeholder)}</option>`,
    ...families.map(
      ([family, count]) =>
        `<option value="${escapeAttr(family)}">${escapeHtml(family)} (${count}${uiLanguage === "en" ? "" : "개"})</option>`,
    ),
  ].join("");
  if (families.some(([family]) => family === previousValue)) select.value = previousValue;
}

// Selecting a metric from the dropdown checks every row that shares that
// exact metric family (capped at MAX_BENCHMARK_COMPARE, keeping the
// highest-value entries when there are more rows than the cap), so the
// chart below always renders a real multi-model comparison instead of the
// single-member groups that manual checkbox-picking often produces.
function selectBenchmarkMetricFamilyWorkspace(family) {
  if (!family) return;
  const { rows } = buildBenchmarkSheetRows();
  const matching = rows
    .map((row) => ({ row, value: benchmarkMetricValue(row) }))
    .filter((entry) => benchmarkMetricFamily(entry.row) === family && typeof entry.value === "number")
    .sort((a, b) => b.value - a.value)
    .slice(0, MAX_BENCHMARK_COMPARE);
  benchmarkCompareKeys = matching.map((entry) => entry.row.rowKey);
  renderBenchmarkSheetWorkspace();
}

function renderBenchmarkSheetWorkspace() {
  const table = $("benchmarkTable");
  if (!table) return;
  const { rows, userMeasurementRows, projectMeasurementRows, externalReferenceCount } = buildBenchmarkSheetRows();
  const errorStats = computeBenchmarkErrorStats();

  const benchmarkTypeLabel = uiLanguage === "en" ? "External public reference" : "외부 공개 참고값";
  const userTypeLabel = uiLanguage === "en" ? "User measurement" : "사용자 측정";
  const projectTypeLabel = uiLanguage === "en" ? "Project measurement" : "자체 측정";
  $("benchmarkMeta").textContent = `${t("updated")} ${DATA_UPDATED_AT} · ${benchmarkTypeLabel} ${externalReferenceCount}${uiLanguage === "en" ? "" : "개"} · ${userTypeLabel} ${userMeasurementRows.length}${uiLanguage === "en" ? "" : "개"} · ${projectTypeLabel} ${projectMeasurementRows.length}${uiLanguage === "en" ? "" : "개"}${errorStats ? ` · ${uiLanguage === "en" ? "Average estimate error" : "평균 추정 오차"} ${errorStats.avgAbsErrorPct.toFixed(1)}%` : ""}`;

  renderBenchmarkMetricFilterOptions(rows);

  // Drop selections for rows that no longer exist (defensive; row set only
  // changes with the underlying data, not with search/filtering).
  const validKeys = new Set(rows.map((row) => row.rowKey));
  benchmarkCompareKeys = benchmarkCompareKeys.filter((key) => validKeys.has(key));

  const compareBar = $("benchmarkCompareBar");
  if (compareBar) {
    if (!benchmarkCompareKeys.length) {
      compareBar.hidden = true;
      compareBar.innerHTML = "";
    } else {
      compareBar.hidden = false;
      const label = uiLanguage === "en"
        ? `${benchmarkCompareKeys.length} / ${MAX_BENCHMARK_COMPARE} selected for the chart below`
        : `아래 그래프에 ${benchmarkCompareKeys.length} / ${MAX_BENCHMARK_COMPARE}개 선택됨`;
      compareBar.innerHTML = `
        <span>${escapeHtml(label)}</span>
        <button type="button" class="ghost-button" data-clear-benchmark-compare>${t("clearFilters")}</button>
      `;
    }
  }
  renderBenchmarkChart(rows, benchmarkCompareKeys.length ? rows.filter((row) => benchmarkCompareKeys.includes(row.rowKey)) : null);

  const query = benchmarkSearchQuery.trim().toLowerCase();
  const visibleRows = query
    ? rows.filter((row) => [row.modelName, row.gpu, row.gpuId, row.metric, row.setting, row.runtime, row.workload]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(query)))
    : rows;

  if (!rows.length) {
    table.innerHTML = `
      <div class="empty-state">
        ${uiLanguage === "en" ? "No external references or user/project measurements are registered. Estimates are shown separately in each detail panel." : "등록된 외부 공개 참고값과 사용자/자체 측정값이 없습니다. 계산 추정값은 상세 패널에서 별도로 표시됩니다."}
      </div>
    `;
    return;
  }

  if (!visibleRows.length) {
    table.innerHTML = `
      <div class="empty-state">
        ${uiLanguage === "en" ? "No benchmark rows match this search." : "검색 조건에 맞는 벤치마크 행이 없습니다."}
      </div>
    `;
    return;
  }

  table.innerHTML = `
    <div class="benchmark-table">
      <div class="benchmark-row benchmark-table-head">
        <span></span>
        <span>${t("type")}</span>
        <span>${t("model")}</span>
        <span>${t("environment")}</span>
        <span>${t("scaleRelease")}</span>
        <span>${t("metric")}</span>
        <span>${t("source")}</span>
      </div>
      ${visibleRows.map((row) => {
        const checked = benchmarkCompareKeys.includes(row.rowKey);
        const disabled = !checked && benchmarkCompareKeys.length >= MAX_BENCHMARK_COMPARE;
        const chartable = benchmarkMetricFamily(row) && typeof benchmarkMetricValue(row) === "number";
        return `
        <div class="benchmark-row">
          <span class="benchmark-row-select">
            ${chartable ? `<input type="checkbox" data-benchmark-key="${escapeAttr(row.rowKey)}" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""} title="${escapeAttr(uiLanguage === "en" ? "Add to chart (max 6)" : "그래프에 추가 (최대 6개)")}" aria-label="${escapeAttr(row.modelName)}" />` : ""}
          </span>
          <span><span class="data-kind ${row.rowType === "사용자 측정" || row.rowType === "자체 측정" ? "is-measured" : "is-reference"}"><span class="evidence-code">${benchmarkEvidenceCode(row.rowType)}</span>${escapeHtml(row.rowType === "외부 공개 참고값" ? benchmarkTypeLabel : row.rowType === "사용자 측정" ? userTypeLabel : projectTypeLabel)}</span></span>
          <span>${escapeHtml(row.modelName)}</span>
          <span>${escapeHtml(formatBenchmarkEnvironment(row))}</span>
          <span>${escapeHtml(formatBenchmarkScaleRelease(row))}</span>
          <span>${escapeHtml(formatBenchmarkMetric(row))}</span>
          <span>${row.sourceUrl ? renderExternalLink(t("view"), row.sourceUrl) : "-"}</span>
        </div>
      `;
      }).join("")}
    </div>
  `;
}

function collectQualityBenchmarks() {
  const seen = new Set();
  return Object.values(MODEL_GROUPS)
    .flat()
    .filter((model) => model.qualityBenchmark)
    .filter((model) => {
      const key = modelKey(model);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((model) => ({
      rowType: "외부 공개 참고값",
      modelName: model.name,
      gpu: "-",
      workload: model.type === "generative" ? WORKLOAD_META.generative.label : model.type || "-",
      setting: model.qualityBenchmark.note || "대표 공개 평가",
      metric: model.qualityBenchmark.label,
      sourceUrl: model.qualityBenchmark.sourceUrl,
      qualityValue: typeof model.qualityBenchmark.value === "number" ? model.qualityBenchmark.value : null,
      qualityMetricName: model.qualityBenchmark.metric || model.qualityBenchmark.label,
      params: model.params,
      active: model.active,
      releaseDate: model.releaseDate,
    }));
}

function collectReferenceBenchmarks() {
  return OCR_MODELS
    .filter((model) => model.reference?.pagesPerSecond)
    .map((model) => {
      const reference = getReferenceBenchmark(model);
      return {
        rowType: "외부 공개 참고값",
        modelName: model.name,
        gpuId: model.reference.gpuId,
        gpu: reference.gpu,
        workload: ocrTypeLabel(model.type),
        setting: reference.setting,
        pagesPerSecond: model.reference.pagesPerSecond,
        peakVramGb: model.reference.peakVramGb,
        sourceUrl: model.sourceUrl,
        params: model.params,
        active: model.active,
        releaseDate: model.releaseDate,
      };
    });
}

function getReferenceBenchmark(model) {
  const reference = model.reference;
  if (!reference?.pagesPerSecond) return null;
  const gpu = GPU_PRESETS.find((item) => item.id === reference.gpuId);
  const setting = [
    reference.width && reference.height ? `${reference.width}x${reference.height}` : "",
    reference.batch ? `batch ${reference.batch}` : "",
  ].filter(Boolean).join(" · ");
  return {
    gpu: gpu?.name || reference.gpuId || "GPU 미기재",
    setting: setting || ocrTypeLabel(model.type),
    metric: `${formatThroughput(reference.pagesPerSecond, "page/s")}${reference.peakVramGb ? ` · ${formatGb(reference.peakVramGb)}` : ""}`,
  };
}

function formatBenchmarkMetric(row) {
  if (row.tokensPerSecond) return `${formatThroughput(row.tokensPerSecond, "tok/s")}${row.peakVramGb ? ` · ${formatGb(row.peakVramGb)}` : ""}`;
  if (row.docsPerSecond) return `${formatThroughput(row.docsPerSecond, "doc/s")}${row.peakVramGb ? ` · ${formatGb(row.peakVramGb)}` : ""}`;
  if (row.pairsPerSecond) return `${formatThroughput(row.pairsPerSecond, "pair/s")}${row.peakVramGb ? ` · ${formatGb(row.peakVramGb)}` : ""}`;
  if (row.pagesPerSecond) return `${formatThroughput(row.pagesPerSecond, "page/s")}${row.peakVramGb ? ` · ${formatGb(row.peakVramGb)}` : ""}`;
  if (row.metric) return row.metric;
  return "-";
}

// GPU and condition used to be two separate columns, but for the large
// majority of rows (published quality benchmarks like MMLU) neither field is
// hardware-specific, so both sat empty/generic side by side. Merge them into
// one "환경" column and only show what's actually meaningful for the row.
function formatBenchmarkEnvironment(row) {
  const gpu = row.gpu && row.gpu !== "-" ? row.gpu : row.gpuId;
  const condition = row.setting || row.runtime || row.workload;
  if (gpu && condition) return `${gpu} · ${condition}`;
  return gpu || condition || "-";
}

// Frees up the space the empty GPU column used to take with something that's
// actually useful for every row: model scale (and active/MoE params, if
// smaller) plus release date, so the table can be scanned for recency/size
// without opening each model's detail panel.
function formatBenchmarkScaleRelease(row) {
  const parts = [];
  if (row.params) {
    parts.push(row.active && row.active < row.params
      ? `${formatParams(row.params)} A${formatParams(row.active)}`
      : formatParams(row.params));
  }
  if (row.releaseDate) parts.push(row.releaseDate);
  return parts.length ? parts.join(" · ") : "-";
}


window.AIHardwareBenchmark = {
  renderDashboard: renderBenchmarkDashboardWorkspace,
  renderSheet: renderBenchmarkSheetWorkspace,
  selectMetricFamily: selectBenchmarkMetricFamilyWorkspace,
};
window.dispatchEvent(new CustomEvent("ai-hardware-benchmark-ready"));
})();
