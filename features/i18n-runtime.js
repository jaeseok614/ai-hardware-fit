/** Extracted in v7.1 to keep the core bundle focused. */
const UI_COPY_V15 = {
  "core.finder.title": { ko: "내 GPU로 모델 찾기", en: "Find models for my GPU" },
  "core.finder.note": { ko: "GPU 이름만 고르면 바로 비교", en: "Choose a GPU and compare immediately" },
  "core.modelFinder.title": { ko: "모델에 맞는 GPU 찾기", en: "Find a GPU for a model" },
  "core.modelFinder.note": { ko: "모델·예산 기준 추천 GPU 비교", en: "Compare recommended GPUs by model and budget" },
  "core.infra.title": { ko: "AI 서비스 서버 견적", en: "Size an AI service" },
  "core.infra.note": { ko: "사용자 수로 GPU·비용 산정", en: "Estimate GPUs and cost from user demand" },
  "core.placement.title": { ko: "여러 모델 배치", en: "Place multiple models" },
  "core.placement.note": { ko: "한 대 이상의 GPU에 모델 함께 배치", en: "Share one or more GPUs across models" },
  "core.community.title": { ko: "실측 벤치마크", en: "Measured benchmarks" },
  "core.community.note": { ko: "공개 참고값과 사용자 측정 데이터", en: "Public references and user measurements" },
  "core.apiCost.title": { ko: "API와 자체 구축 비교", en: "API vs self-hosted" },
  "core.apiCost.note": { ko: "월 사용량 기준 비용과 손익분기점", en: "Monthly cost and break-even point" },
  "core.ontologyCost.title": { ko: "온톨로지 구축 비용", en: "Ontology construction cost" },
  "core.ontologyCost.note": { ko: "문서 처리 1회성 API 비용", en: "One-time document processing cost" },
  "core.aria.section": { ko: "주요 작업 선택", en: "Choose a primary task" },
  "core.aria.tabs": { ko: "주요 작업", en: "Primary tasks" },
  "core.demo.gpu": { ko: "RTX 3060 모델 추천", en: "RTX 3060 model picks" },
  "core.demo.examplesTitle": { ko: "예시로 보기", en: "Try examples" },
  "core.demo.model": { ko: "Qwen 32B용 GPU 찾기", en: "Find a GPU for Qwen 32B" },
  "core.demo.infra": { ko: "사내 RAG 30명 견적", en: "30-user internal RAG estimate" },
  "core.demo.infraOntology": { ko: "온톨로지 구축 배치 견적", en: "Ontology construction batch estimate" },
  "core.demo.placement": { ko: "Llama 70B+임베딩 2장 배치", en: "Llama 70B + embedding on 2 GPUs" },
  "core.demo.placementOntology": { ko: "온톨로지 추출+임베딩 배치", en: "Ontology extraction + embedding batch" },
  "workload.audioStt": { ko: "음성 인식", en: "Speech recognition" },
  "workload.audioTts": { ko: "음성 합성", en: "Speech synthesis" },
  "workload.avatarGeneration": { ko: "아바타·립싱크", en: "Avatar · lip sync" },
  "benchmark.dashboard": { ko: "벤치마크 데이터 현황", en: "Benchmark coverage dashboard" },
  "benchmark.submit": { ko: "측정값 제보", en: "Submit a measurement" },
  "advisor.currentPrice": { ko: "현재 GPU 시세 (원)", en: "Current GPU market price (USD)" },
};
function uiText(key) {
  return window.AIHardwareI18n?.t(key, uiLanguage)
    || UI_COPY_V15[key]?.[uiLanguage === "en" ? "en" : "ko"]
    || key;
}
function applyV15Translations() {
  const en = uiLanguage === "en";
  const gpuDemo = document.querySelector("[data-demo-gpu]");
  if (gpuDemo) gpuDemo.textContent = uiText("core.demo.gpu");
  const examplesTitle = document.querySelector("[data-guide-examples-title]");
  if (examplesTitle) examplesTitle.textContent = uiText("core.demo.examplesTitle");
  const infraDemo = document.querySelector("[data-demo-infra='internal-rag']");
  if (infraDemo) infraDemo.textContent = uiText("core.demo.infra");
  const infraDemoOntology = document.querySelector("[data-demo-infra='ontology-batch']");
  if (infraDemoOntology) infraDemoOntology.textContent = uiText("core.demo.infraOntology");
  const modelDemo = document.querySelector("[data-demo-model]");
  if (modelDemo) modelDemo.textContent = uiText("core.demo.model");
  const taskSection = document.querySelector(".core-task-switcher");
  taskSection?.setAttribute("aria-label", uiText("core.aria.section"));
  taskSection?.querySelector(".core-task-actions")?.setAttribute("aria-label", uiText("core.aria.tabs"));
  if ($("advisorCurrentPriceLabel")) $("advisorCurrentPriceLabel").textContent = uiText("advisor.currentPrice");
  Object.assign(WORKLOAD_META.audioStt, {
    label: uiText("workload.audioStt"),
    statusLabel: "STT",
    modelCountLabel: en ? "Speech recognition models" : "음성 인식 모델",
    searchPlaceholder: en ? "Search STT model, provider, or language" : "STT 모델, 제공자, 언어 검색",
    listHeaders: en
      ? ["Status", "Model", "Release / language", "Summary", "Provider · license", "Precision", "Estimated VRAM", "Realtime factor", "Audio", ""]
      : ["상태", "모델", "출시/언어", "요약", "제공자·라이선스", "정밀도", "계산 VRAM", "실시간 배속", "오디오", ""],
  });
  Object.assign(WORKLOAD_META.audioTts, {
    label: uiText("workload.audioTts"),
    statusLabel: "TTS",
    modelCountLabel: en ? "Speech synthesis models" : "음성 합성 모델",
    searchPlaceholder: en ? "Search TTS model, provider, or language" : "TTS 모델, 제공자, 언어 검색",
    listHeaders: en
      ? ["Status", "Model", "Release / language", "Summary", "Provider · license", "Precision", "Estimated VRAM", "Realtime factor", "Audio", ""]
      : ["상태", "모델", "출시/언어", "요약", "제공자·라이선스", "정밀도", "계산 VRAM", "실시간 배속", "오디오", ""],
  });
  Object.assign(WORKLOAD_META.avatarGeneration, {
    label: uiText("workload.avatarGeneration"),
    statusLabel: en ? "Avatar" : "아바타",
    modelCountLabel: en ? "Avatar and lip-sync models" : "아바타·립싱크 모델",
    searchPlaceholder: en ? "Search avatar, lip-sync, or talking-head models" : "아바타, 립싱크, talking-head 모델 검색",
  });
  refreshCoreTaskUi();
  window.AIHardwareI18n?.apply(uiLanguage);
}

const MESSAGES = {
  ko: {
    settings: "고급 설정",
    closeSettings: "고급 설정 닫기",
    changeGpu: "GPU 변경",
    closeChangeGpu: "GPU 변경 닫기",
    allProviders: "전체 공급사",
    allLicenses: "전체 라이선스",
    allTasks: "전체 작업",
    searchModel: "모델명, 제조사, 태그 검색",
    quickRecommendations: "빠른 추천",
    exploreAll: "전체 모델 탐색",
    generative: "생성형 LLM",
    embedding: "임베딩",
    reranker: "리랭커",
    ocrVlm: "OCR·VLM",
    documentVlm: "문서 VLM",
    generalVlm: "범용 VLM",
    imageGeneration: "이미지 생성",
    videoGeneration: "비디오 생성",
    avatarGeneration: "아바타·립싱크",
    currentGpu: "현재 GPU",
    quickTitle: "3단계 빠른 추천",
    quickSubtitle: "GPU에 맞는 모델 3개를 바로 추천합니다",
    quickDescription: "위에서 GPU를 선택하고 용도와 우선순위를 고르면 현재 워크로드의 실행 가능한 모델만 추립니다.",
    currentCondition: "현재 조건에서 실행 가능한 모델을 권장 양자화로 묶었습니다.",
    detailCalculation: "상세 계산 보기",
    gpuRequired: "GPU 선택 필요",
    chooseGpu: "GPU 선택하기",
    benchmarkSheet: "벤치마크 시트",
    benchmarkIntro: "계산 추정, 외부 공개 참고값, 사용자 측정, 자체 측정을 근거별로 분리합니다.",
    updated: "업데이트",
    type: "구분",
    model: "모델",
    gpu: "GPU",
    conditions: "조건",
    environment: "환경",
    scaleRelease: "규모/출시",
    metric: "지표",
    source: "출처",
    view: "보기",
    clearFilters: "선택 해제",
  },
  en: {
    settings: "Advanced settings",
    closeSettings: "Close advanced settings",
    changeGpu: "Change GPU",
    closeChangeGpu: "Close GPU picker",
    allProviders: "All providers",
    allLicenses: "All licenses",
    allTasks: "All tasks",
    searchModel: "Search model, maker, or tag",
    quickRecommendations: "Quick recommendations",
    exploreAll: "Explore all models",
    generative: "Generative LLM",
    embedding: "Embedding",
    reranker: "Reranker",
    ocrVlm: "OCR · VLM",
    documentVlm: "Document VLM",
    generalVlm: "General VLM",
    imageGeneration: "Image generation",
    videoGeneration: "Video generation",
    avatarGeneration: "Avatar · lip sync",
    currentGpu: "Current GPU",
    quickTitle: "3-step quick recommendations",
    quickSubtitle: "Get 3 models recommended for your GPU",
    quickDescription: "Choose a GPU, purpose, and priority above to show only runnable models for this workload.",
    currentCondition: "Runnable models grouped with recommended quantization for the current setup.",
    detailCalculation: "View detailed calculation",
    gpuRequired: "No GPU selected",
    chooseGpu: "Select a GPU",
    benchmarkSheet: "Benchmark sheet",
    benchmarkIntro: "Estimates, external public references, user measurements, and project measurements are shown separately.",
    updated: "Updated",
    type: "Type",
    model: "Model",
    gpu: "GPU",
    conditions: "Conditions",
    environment: "Environment",
    scaleRelease: "Scale/Release",
    metric: "Metric",
    source: "Source",
    view: "View",
    clearFilters: "Clear selection",
  },
};

function t(key) {
  return MESSAGES[uiLanguage]?.[key] || MESSAGES.ko[key] || key;
}

function localizedText(value, fallback = "") {
  if (value && typeof value === "object") {
    return value[uiLanguage] || value.ko || value.en || fallback;
  }
  return value || fallback;
}

function modelSummary(model) {
  const explicit = localizedText(model?.summary, "");
  if (uiLanguage !== "en" || (model?.summary && typeof model.summary === "object")) return explicit;
  const workload = model?.type === "embedding" ? "embedding" : model?.type === "reranker" ? "reranker" : model?.type?.includes("vlm") ? "vision-language" : model?.type === "ocr-pipeline" ? "OCR" : "language";
  const tags = (model?.tags || []).slice(0, 3).map(tagLabel).join(", ");
  return `${workload} model for ${tags || "general local AI workloads"}. The Korean description is available in the Korean interface.`;
}

function licenseCommercialLabel(policy) {
  if (uiLanguage !== "en") return localizedText(policy?.commercialLabel, "");
  const map = {
    "상업 이용 가능": "Commercial use allowed",
    "조건부 상업 이용": "Conditional commercial use",
    "연구·비상업 전용": "Research / non-commercial only",
    "비상업 이용만": "Non-commercial use only",
    "약관 확인 필요": "Review terms",
  };
  return localizedText(policy?.commercialLabel, "") in map ? map[localizedText(policy.commercialLabel)] : localizedText(policy?.commercialLabel, "");
}

function licenseOpennessLabel(policy) {
  if (uiLanguage !== "en") return localizedText(policy?.opennessLabel, "");
  const map = { "오픈소스": "Open source", "공개 가중치": "Open weights", "연구용 공개 가중치": "Research weights", "비상업 공개": "Non-commercial", "라이선스 미표기": "License not stated" };
  const value = localizedText(policy?.opennessLabel, "");
  return map[value] || value;
}

function licenseSummary(policy) {
  const value = localizedText(policy?.summary, "");
  if (uiLanguage !== "en" || (policy?.summary && typeof policy.summary === "object")) return value;
  return "Review the latest license and model-specific terms before commercial distribution.";
}

const UI_TRANSLATIONS = {
  en: {
    "계산 기준": "Methodology",
    "데이터 출처": "Data sources",
    "벤치마크": "Benchmarks",
    "고급 설정": "Advanced settings",
    "고급 설정 닫기": "Close advanced settings",
    "GPU 변경": "Change GPU",
    "GPU 변경 닫기": "Close GPU picker",
    "내 GPU에서 돌아가는 AI 모델 찾기": "Find AI models for your GPU",
    "내 GPU": "My GPU",
    "내 실행 환경": "My setup",
    "GPU를 선택해 주세요": "Select a GPU",
    "결과 링크 복사": "Copy result link",
    "요약 카드 PNG": "Download PNG card",
    "전체 모델에서 비교하기": "Compare all models",
    "RTX 3060 링크": "RTX 3060 link",
    "English": "한국어",
  },
  ko: {
    "Methodology": "계산 기준",
    "Data sources": "데이터 출처",
    "Benchmarks": "벤치마크",
    "Advanced settings": "고급 설정",
    "Close advanced settings": "고급 설정 닫기",
    "Change GPU": "GPU 변경",
    "Close GPU picker": "GPU 변경 닫기",
    "Find AI models for your GPU": "내 GPU에서 돌아가는 AI 모델 찾기",
    "My GPU": "내 GPU",
    "My setup": "내 실행 환경",
    "Select a GPU": "GPU를 선택해 주세요",
    "Copy result link": "결과 링크 복사",
    "Download PNG card": "요약 카드 PNG",
    "Compare all models": "전체 모델에서 비교하기",
    "RTX 3060 link": "RTX 3060 링크",
    "한국어": "English",
  },
};

// Static <option> presets whose entire label is just "숫자+단위" (e.g. "40개",
// "16쌍"). These can't go through the generic dictionary/regex sweep below:
// the exact same "N개" shape is reused across unrelated presets (embedding
// batch, reranker candidates, ...) with different meanings, so one shared
// rule would mislabel one preset using another's wording. Keyed by the
// option's stable `value` attribute (not its text) and written directly on
// every language switch, so unlike the dictionary-cache mechanism above this
// never gets stuck on a stale/partial translation after toggling back and
// forth.
const pluralize = (value, singular, plural) => `${value} ${Number(value) === 1 ? singular : plural}`;

const PRESET_OPTION_LABELS = {
  concurrencyPreset: { ko: (v) => `${v}명`, en: (v) => `${v} concurrent` },
  embeddingBatchSizePreset: { ko: (v) => `${v}개`, en: (v) => pluralize(v, "text", "texts") },
  rerankerCandidatesPreset: { ko: (v) => `${v}개`, en: (v) => pluralize(v, "candidate", "candidates") },
  rerankerBatchSizePreset: { ko: (v) => `${v}쌍`, en: (v) => pluralize(v, "pair", "pairs") },
  ocrBatchSizePreset: { ko: (v) => `${v}페이지`, en: (v) => pluralize(v, "page", "pages") },
  placementTargetConcurrency: { ko: (v) => (v ? `${v}명` : "설정 안 함"), en: (v) => (v ? pluralize(v, "user", "users") : "Not set") },
};

function translatePresetOptionLabels(language) {
  Object.entries(PRESET_OPTION_LABELS).forEach(([selectId, labels]) => {
    const select = $(selectId);
    if (!select) return;
    [...select.options].forEach((option) => {
      if (option.value === "custom") return; // "직접" already handled by the dictionary sweep
      option.textContent = language === "en" ? labels.en(option.value) : labels.ko(option.value);
    });
  });
}

const ENGLISH_UI_REPLACEMENTS = [
  ["추천 모델", "Recommended models"],
  ["· 실행 가능한 모델 3개", "· 3 runnable models"],
  ["찾는 GPU가 아직 목록에 없나요?", "Can't find your GPU yet?"],
  ["직접 사양을 입력해 바로 계산하거나, 이름을 채운 상태로 추가 요청을 보낼 수 있습니다.", "Enter specifications to calculate now, or submit a prefilled GPU request."],
  ["직접 사양 입력", "Enter specifications"],
  ["GPU 추가 요청", "Request a GPU"],
  ["GPU 비교", "Hardware Comparison"],
  ["공유 ▾", "Share ▾"],
  ["GPU 비교 열기", "Open GPU comparison"],
  ["GPU 비교 닫기", "Close GPU comparison"],
  ["비교 GPU 선택", "Select a GPU to compare"],
  ["비교 GPU 1", "Comparison GPU 1"],
  ["비교 GPU 2", "Comparison GPU 2"],
  ["비교 GPU 3", "Comparison GPU 3"],
  ["아키텍처", "Architecture"],
  ["메모리", "Memory"],
  ["대역폭", "Bandwidth"],
  ["런타임", "Runtime"],
  ["데이터 완성도", "Data completeness"],
  ["보강 항목", "Missing"],
  ["사양 근거", "Specification evidence"],
  ["검증일", "Verified"],
  ["출처 보강", "Improve source"],
  ["핵심 사양 항목이 연결되었습니다", "Core specification fields are linked"],
  ["전력 범위", "Power range"],
  ["노트북 TGP", "Laptop TGP"],
  ["GPU 계산 메모리", "GPU-usable memory"],
  ["실행 가능 모델", "Runnable models"],
  ["최대 후보", "Largest candidate"],
  ["추정 속도 중앙값", "Median estimated speed"],
  ["이 GPU로 할 수 있는 작업", "What this GPU can do"],
  ["현재 모델 종류", "Current model type"],
  ["이미지 생성", "Image generation"],
  ["비디오 생성", "Video generation"],
  ["경량 튜닝", "Lightweight fine-tuning"],
  ["생성 스텝", "Generation steps"],
  ["비디오 프레임", "Video frames"],
  ["LoRA 개수", "LoRA count"],
  ["메모리 절약", "Memory strategy"],
  ["GPU 단독", "GPU only"],
  ["순차 CPU 오프로딩", "Sequential CPU offload"],
  ["VAE 타일링", "VAE tiling"],
  ["실측 제보 대기", "Awaiting measurements"],
  ["전용 VRAM", "Dedicated VRAM"],
  ["GPU 계산 기준", "GPU-usable"],
  ["통합 전체", "Unified total"],
  ["선택", "selected"],
  ["내 GPU에서 돌아가는 AI 모델 찾기", "Find AI models for your GPU"],
  ["상태", "Status"],
  ["출시/세대", "Release/Gen"],
  ["대표 공개 평가", "Public benchmark"],
  ["공급사/라이선스", "Provider/License"],
  ["권장 설정", "Recommended settings"],
  ["계산 VRAM", "Calculated VRAM"],
  ["추정 속도", "Estimated throughput"],
  ["추정 처리량", "Estimated throughput"],
  ["이미지", "Image"],
  ["상세 닫기", "Close details"],
  ["이 결과를 공유하세요", "Share this result"],
  ["추천 이유", "Why this model"],
  ["계산값과 근거", "Estimate and evidence"],
  ["판정 근거", "Decision rationale"],
  ["VRAM 여유", "VRAM headroom"],
  ["남음", "Remaining"],
  ["부족", "Shortage"],
  ["신뢰도", "Confidence"],
  ["처리 지연", "Processing latency"],
  ["질의당 지연", "Latency per query"],
  ["정밀도별 비교", "Precision comparison"],
  ["예상 VRAM", "Expected VRAM"],
  ["예상 속도", "Expected speed"],
  ["예상 처리량", "Expected throughput"],
  ["품질", "Quality"],
  ["실행 상태", "Run status"],
  ["실행 방식별 비교", "Runtime comparison"],
  ["기능별 비교", "Feature comparison"],
  ["VRAM 상세 분석", "VRAM breakdown"],
  ["모델 필요 VRAM", "Model required VRAM"],
  ["실행 명령어", "Run command"],
  ["실행 예시", "Example command"],
  ["계산 근거", "Method details"],
  ["모델 정보", "Model information"],
  ["라이선스 및 상업 이용", "License and commercial use"],
  ["라이선스 원문 확인", "View license"],
  ["스펙 오류 신고", "Report a spec issue"],
  ["공식/모델 카드", "Official/model card"],
  ["Hugging Face 검색", "Search Hugging Face"],
  ["측정 상태", "Measurement status"],
  ["데이터 갱신", "Data updated"],
  ["문서 특화 VLM 메모리 분석", "Document-specialized VLM memory analysis"],
  ["문서 특화 VLM", "Document-specialized VLM"],
  ["총 GPU VRAM", "Total GPU VRAM"],
  ["다른 작업 예약", "Reserved for other work"],
  ["실행 후 잔여", "Remaining after run"],
  ["계산 Conditions", "Calculation conditions"],
  ["텍스트 OCR", "Text OCR"],
  ["레이아웃 포함", "With layout"],
  ["표/수식 포함", "With tables/formulas"],
  ["문서 파싱 전체", "Full document parsing"],
  ["가능", "Possible"],
  ["잘 돌아감", "Runs well"],
  ["쾌적", "Comfortable"],
  ["부적합", "Not suitable"],
  ["오프로딩", "Offloading"],
  ["문서", "Document"],
  ["한국어", "Korean"],
  ["표", "Table"],
  ["수식", "Formula"],
  ["필기", "Handwriting"],
  ["레이아웃", "Layout"],
  ["상업 이용·수정·배포", "Commercial use, modification, and distribution"],
  ["오픈소스", "Open source"],
  ["기여하기", "Contribute"],
  ["파라미터", "Parameters"],
  ["처리 유형", "Workload type"],
  ["구조", "Architecture"],
  ["Custom 확인", "verify the custom"],
  ["문서 크기", "Document size"],
  ["이미지 너비", "Image width"],
  ["이미지 높이", "Image height"],
  ["배치 페이지", "Batch pages"],
  ["페이지", "pages"],
  ["정밀도", "Precision"],
  ["처리 기능", "Processing"],
  ["현재 계산 기준", "Current settings"],
  ["조건 변경", "Change settings"],
  ["A4", "A4"],
  ["배치", "batch"],
  ["실행 가능한", "runnable"],
  ["실행 판정", "Run verdict"],
  ["빠른 추천 상세", "Quick recommendations detail"],
  ["빠른 추천", "Quick recommendations"],
  ["전체 모델 탐색", "Explore all models"],
  ["전체 모델에서 비교하기", "Compare all models"],
  ["고급 설정", "Advanced settings"],
  ["기본 하드웨어", "Primary hardware"],
  ["보조 GPU 수", "Secondary GPU count"],
  ["보조 GPU", "Secondary GPU"],
  ["메모리 보정", "Memory adjustments"],
  ["고급 도구", "Advanced tools"],
  ["계산 기준", "Methodology"],
  ["데이터 출처", "Data sources"],
  ["벤치마크 데이터 준비 중", "Benchmark data loading"],
  ["벤치마크", "Benchmarks"],
  ["생성형 LLM", "Generative LLM"],
  ["임베딩", "Embedding"],
  ["리랭커", "Reranker"],
  ["OCR·VLM", "OCR · VLM"],
  ["문서 VLM", "Document VLM"],
  ["범용 VLM", "General VLM"],
  ["내 GPU", "My GPU"],
  ["내 실행 환경", "My setup"],
  ["GPU를 선택해 주세요", "Select a GPU"],
  ["GPU 선택 필요", "No GPU selected"],
  ["GPU 프리셋을 선택하면 추천을 시작합니다.", "Select a GPU preset to start recommendations."],
  ["선택 즉시 현재 환경에 맞는 모델을 계산합니다.", "Results update immediately for your setup."],
  ["결과 링크 복사", "Copy result link"],
  ["요약 카드 PNG", "Download PNG card"],
  ["RTX 3060 링크", "RTX 3060 link"],
  ["VRAM", "VRAM"],
  ["시스템 RAM", "System RAM"],
  ["GPU 수", "GPU count"],
  ["사용 중 VRAM", "Reserved VRAM"],
  ["안전 여유분", "Safety margin"],
  ["대역폭 GB/s", "Bandwidth GB/s"],
  ["실행 방식", "Runtime"],
  ["양자화", "Quantization"],
  ["컨텍스트 토큰", "Context tokens"],
  ["동시 요청 프리셋", "Concurrent requests preset"],
  ["동시 요청 직접 입력", "Custom concurrent requests"],
  ["목표 동시 사용자 직접 입력", "Custom target concurrent users"],
  ["동시 요청", "Concurrent requests"],
  ["평균 출력 프리셋", "Average output preset"],
  ["평균 출력 직접 입력", "Custom average output"],
  ["평균 출력 토큰", "Average output tokens"],
  ["평균 입력 길이 프리셋", "Average input length preset"],
  ["평균 입력 길이 직접 입력", "Custom average input length"],
  ["평균 입력 길이", "Average input length"],
  ["정밀도/런타임", "Precision/Runtime"],
  ["정밀도/기능", "Precision/Features"],
  ["정밀도", "Precision"],
  ["검색해서 선택", "Search to select"],
  ["GPU 모델명 검색", "Search GPU model name"],
  ["모델명, 제조사로 검색", "Search by model name or maker"],
  ["모델명, 제조사, 태그 검색", "Search model, maker, or tag"],
  ["임베딩 모델명, 제조사, 태그 검색", "Search embedding model, maker, or tag"],
  ["리랭커 모델명, 제조사, 태그 검색", "Search reranker model, maker, or tag"],
  ["OCR 파이프라인, 제조사, 태그 검색", "Search OCR pipeline, maker, or tag"],
  ["문서 VLM, 제조사, 태그 검색", "Search document VLM, maker, or tag"],
  ["범용 VLM, 제조사, 태그 검색", "Search general VLM, maker, or tag"],
  ["검색", "Search"],
  ["전체 등급", "All grades"],
  ["전체 작업", "All tasks"],
  ["전체 공급사", "All providers"],
  ["전체 라이선스", "All licenses"],
  ["전체 이용 조건", "All usage terms"],
  ["전체 해제", "Clear all"],
  ["종합 추천", "Overall recommendation"],
  ["최신 모델순", "Newest first"],
  ["파라미터 큰 순", "Largest parameters first"],
  ["속도 우선", "Speed first"],
  ["품질 우선", "Quality first"],
  ["여유 VRAM 우선", "VRAM headroom first"],
  ["균형 잡힌 추천", "Balanced recommendation"],
  ["일반 대화 / 비서", "General chat / assistant"],
  ["긴 문서 / RAG", "Long documents / RAG"],
  ["코딩 모델 우선", "Coding models first"],
  ["한국어 모델 우선", "Korean models first"],
  ["한국어 특화", "Korean-focused"],
  ["이미지 / 문서 인식", "Image / document understanding"],
  ["추론 / 수학", "Reasoning / math"],
  ["문서 파싱 전체", "Full document parsing"],
  ["텍스트 OCR", "Text OCR"],
  ["영수증/라벨", "Receipts / labels"],
  ["웹/스크린샷 1080p", "Web / screenshot 1080p"],
  ["배치 계산", "Calculate placement"],
  ["무엇을 하시나요?", "What would you like to do?"],
  ["원하는 작업부터 선택하세요", "Choose the task you want to start with"],
  ["내 GPU에 맞는 모델 찾기", "Find models for my GPU"],
  ["빠른 추천과 전체 모델 탐색", "Quick recommendations and full catalog"],
  ["여러 모델 함께 돌리기", "Run multiple models together"],
  ["AI 스택 배치 플래너", "AI Stack Placement Planner"],
  ["LLM·임베딩·리랭커·OCR/VLM을 보유 GPU에 나눠 배치합니다.", "Place LLM, embedding, reranker, OCR, and VLM workloads across your GPUs."],
  ["처음 사용 가이드", "Getting started guide"],
  ["사용 가이드", "Quick guide"],
  ["처음에는 균형형으로 시작하세요", "Start with the balanced plan"],
  ["RAG·문서 AI·여러 LLM 중 가까운 구성을 선택합니다.", "Choose the closest starting point: RAG, document AI, or multiple LLMs."],
  ["보유 GPU와 동시에 실행할 모델을 확인합니다.", "Review your GPUs and the models that will run together."],
  ["운영 방식과 목표 동시 사용자를 정합니다.", "Choose a usage pattern and target concurrency."],
  ["배치 계산 후 병목과 세 가지 대안을 비교합니다.", "Calculate placement, then compare the bottleneck and three alternatives."],
  ["한 요청이 여러 모델을 순서대로 사용", "One request passes through multiple models in sequence"],
  ["모델마다 별도 API와 사용자를 운영", "Each model runs as a separate API for its own users"],
  ["설치해 두고 한 번에 하나만 실행", "Keep models installed but run only one at a time"],
  ["결과는 계산 추정치입니다. 실제 운영 전에는 내 환경에서 검증하세요.", "Results are calculated estimates. Validate them in your environment before production."],
  ["파이프라인", "Pipeline"],
  ["독립 서비스", "Independent services"],
  ["순차 실행", "One at a time"],
  ["모델 찾기로 돌아가기", "Back to model finder"],
  ["처음이라면 여기서 시작하세요", "Start here if this is your first time"],
  ["AI 스택을 GPU에 배치해 보세요", "Place an AI stack across your GPUs"],
  ["보유 GPU와 함께 실행할 모델을 선택하면 GPU별 배치, 권장 동시 접속, 예상 처리량, 병목과 개선 방법을 계산합니다.", "Choose your GPUs and models to calculate placement, recommended concurrency, throughput, bottlenecks, and improvements."],
  ["RAG 기본 구성", "Basic RAG stack"],
  ["LLM + 임베딩 + 리랭커", "LLM + embedding + reranker"],
  ["문서 AI 구성", "Document AI stack"],
  ["LLM/VLM + OCR + 임베딩", "LLM/VLM + OCR + embedding"],
  ["여러 LLM 서비스", "Multiple LLM services"],
  ["여러 모델을 독립 API로 운영", "Run multiple models as independent APIs"],
  ["AI 아바타 채팅", "AI avatar chat"],
  ["STT + LLM + TTS + 아바타 영상", "STT + LLM + TTS + avatar video"],
  ["아바타·립싱크 모델", "Avatar · lip-sync models"],
  ["아바타·립싱크", "Avatar · lip sync"],
  ["아바타, 립싱크, talking-head 모델 검색", "Search avatar, lip-sync, or talking-head models"],
  ["직접 선택", "Build manually"],
  ["원하는 GPU와 모델을 직접 구성", "Choose your own GPUs and models"],
  ["하드웨어", "Hardware"],
  ["보유한 GPU와 수량을 입력하세요.", "Enter the GPUs you own and their quantities."],
  ["모델 선택", "Model selection"],
  ["검색하거나 워크로드 종류를 골라 함께 실행할 모델을 추가하세요.", "Search or choose a workload to add models that will run together."],
  ["운영 목표", "Operating goals"],
  ["기본 목표 세 가지만 선택하면 계산할 수 있습니다.", "Choose the three basic goals to calculate a placement."],
  ["세부 조건", "Advanced conditions"],
  ["배치 결과", "Placement result"],
  ["결론과 배치안을 먼저 보고, 필요할 때 계산 상세를 펼치세요.", "Review the conclusion and plans first, then expand calculation details when needed."],
  ["계산 상세 보기", "View calculation details"],
  ["LLM과 RAG 모델 함께 배치", "Place LLM and RAG models together"],
  ["GPU에 함께 배치", "Place together on GPUs"],
  ["아직 선택된 모델이 없습니다.", "No models selected yet."],
  ["선택된 모델", "Selected models"],
  ["보유 GPU 목록", "GPU inventory"],
  ["배치 기준", "Placement strategy"],
  ["운영 방식", "Usage pattern"],
  ["목표 동시 사용자", "Target concurrent users"],
  ["최소 VRAM 여유율", "Minimum VRAM headroom"],
  ["양자화·정밀도 자동 변경 허용", "Allow automatic quantization/precision changes"],
  ["컨텍스트 자동 축소 허용", "Allow automatic context reduction"],
  ["독립 서비스 모델 복제 허용", "Allow independent-service replicas"],
  ["3개 배치안 비교", "Compare 3 plans"],
  ["주 모델(우선 배정)", "Primary model (priority)"],
  ["균형 우선", "Balanced"],
  ["모델 수 우선", "Model count"],
  ["처리량 우선", "Throughput"],
  ["주 모델 우선", "Primary model"],
  ["모델별 성능지표 시트", "Per-model benchmark sheet"],
  ["불러온 모델 지우기", "Clear imported models"],
  ["상세 계산 보기", "View detailed calculation"],
  ["계산 추정, 외부 공개 참고값, 사용자 측정, 자체 측정을 근거별로 분리합니다.", "Estimates, external public references, user measurements, and project measurements are shown separately."],
  ["업데이트", "Updated"],
  ["구분", "Type"],
  ["모델", "Model"],
  ["조건", "Conditions"],
  ["지표", "Metric"],
  ["출처", "Source"],
  ["공식 평가", "Official evaluation"],
  ["공식 발표", "Official report"],
  ["공식 품질", "Official quality"],
  ["보기", "View"],
  ["상업 이용 가능", "Commercial use allowed"],
  ["조건부 상업 이용", "Conditional commercial use"],
  ["비상업·연구용", "Non-commercial / research"],
  ["약관 확인 필요", "Review terms"],
  ["비상업 이용만", "Non-commercial use only"],
  ["연구·비상업 전용", "Research / non-commercial only"],
  ["연구·테스트 전용", "Research / testing only"],
  ["등록 후 상업 이용", "Commercial use after registration"],
  ["모델별 확인 필요", "Check per model"],
  ["수정 조항 확인", "Review modified terms"],
  ["가능 이상", "Good or better"],
  ["쾌적", "Comfortable"],
  ["잘 돌아감", "Runs well"],
  ["빡빡함", "Tight"],
  ["오프로딩 전제", "Requires offloading"],
  ["오프로딩", "Offloading"],
  ["조건부", "Conditional"],
  ["부적합", "Not suitable"],
  ["현재 조건 부적합", "Not suitable under current settings"],
  ["계산 추정치", "Estimated calculation"],
  ["외부 공개 참고값", "External public reference"],
  ["사용자 측정", "User measurement"],
  ["자체 측정", "Project measurement"],
  ["MoE 활성 파라미터 낮음", "Low MoE active params"],
  ["RAG/검색", "RAG / search"],
  ["속도 우수", "Fast"],
  ["용도", "Purpose"],
  ["우선순위", "Priority"],
  ["GPU 설정이나 우선순위를 바꿔 다시 확인해 보세요.", "Try changing your GPU settings or priority and check again."],
  ["출시/세대", "Release/Gen"],
  ["대표 공개 평가", "Public benchmark"],
  ["공급사/라이선스", "Provider/License"],
  ["권장 설정", "Recommended settings"],
  ["계산 VRAM", "Calculated VRAM"],
  ["추정 속도", "Estimated speed"],
  ["추정 처리량", "Estimated throughput"],
  ["상태", "Status"],
  ["직접 입력", "Custom"],
  ["직접", "Custom"],
  ["이미지 너비", "Image width"],
  ["이미지 높이", "Image height"],
  ["이미지", "Image"],
  ["수량", "Count"],
  ["선택", "Select"],
  ["+ GPU 추가", "+ Add GPU"],
  ["비교 보기", "Compare view"],
  ["경량", "Lightweight"],
  ["긴 문서", "Long context"],
  ["대화", "Chat"],
  ["비전", "Vision"],
  ["오디오", "Audio"],
  ["추론", "Reasoning"],
  ["코딩", "Coding"],
  ["Hugging Face 공개 LLM 직접 계산", "Direct Hugging Face LLM calculation"],
  ["모델 주소 또는 ID", "Model URL or ID"],
  ["가중치 정보 가져오기", "Fetch weight info"],
  [
    "Hugging Face 공개 API의 생성형 LLM safetensors 파라미터 수와 config를 사용합니다. 비공개·접근 승인 필요 모델은 불러올 수 없습니다.",
    "Uses the public Hugging Face API's generative LLM safetensors parameter count and config. Private or gated models can't be loaded.",
  ],
  ["여러 GPU에 모델 동시 배치 추천 (베타)", "Multi-GPU model placement recommendation (beta)"],
  [
    "보유한 GPU 여러 대에 LLM·임베딩·리랭커·OCR/VLM 모델을 어떤 GPU에 올리면 좋을지 계산합니다. 각 모델은 기본 부하(동시 1명 또는 기본 배치) 기준 필요 VRAM으로 배치하며, 실제 서빙 프레임워크·스케줄링에 따라 달라질 수 있는 참고용 추정치입니다.",
    "Calculates which GPU each LLM, embedding, reranker, or OCR/VLM model should run on across multiple GPUs you own. Each model is placed based on the VRAM required at its base load (1 concurrent request or default batch); actual results are reference estimates that vary by serving framework and scheduling.",
  ],
  ["동시에 띄울 모델 검색 후 클릭해서 선택 (여러 종류 섞어서 선택 가능)", "Search and click to select models to run together (mixing types is fine)"],
  ["빡빡함: VRAM 여유가 적어 컨텍스트나 동시 요청 제한이 필요합니다. 오프로딩: 일부 연산을 시스템 RAM 또는 CPU에서 처리합니다.", "Tight: limited VRAM headroom requires reducing context or concurrent requests. Offloading: some computation runs on system RAM or CPU."],
  ["상단 메뉴", "Top navigation"],
  ["언어 선택", "Language"],
  ["하드웨어 설정", "Hardware settings"],
  ["기본 GPU", "Primary GPU"],
  ["GPU 종류 검색", "Search GPU type"],
  ["GPU 종류", "GPU type"],
  ["이 GPU 개수", "Number of this GPU"],
  ["GPU 제거", "Remove GPU"],
  ["배치할 모델 종류", "Model types to place"],
  ["사용 모드", "Mode"],
  ["모델 종류", "Model type"],
  ["컨텍스트 프리셋", "Context preset"],
  ["컨텍스트 직접 입력", "Custom context"],
  ["임베딩 배치 프리셋", "Embedding batch preset"],
  ["임베딩 배치 직접 입력", "Custom embedding batch"],
  ["최대 배치 토큰 프리셋", "Max batch tokens preset"],
  ["최대 배치 토큰 직접 입력", "Custom max batch tokens"],
  ["최대 배치 토큰", "Max batch tokens"],
  ["질의 길이 프리셋", "Query length preset"],
  ["질의 길이 직접 입력", "Custom query length"],
  ["질의 길이", "Query length"],
  ["문서 길이 프리셋", "Document length preset"],
  ["문서 길이 직접 입력", "Custom document length"],
  ["문서 길이", "Document length"],
  ["후보 문서 프리셋", "Candidate docs preset"],
  ["후보 문서 직접 입력", "Custom candidate docs"],
  ["후보 문서", "Candidate docs"],
  ["리랭커 배치 프리셋", "Reranker batch preset"],
  ["리랭커 배치 직접 입력", "Custom reranker batch"],
  ["배치 크기", "Batch size"],
  ["OCR 배치 페이지 프리셋", "OCR batch pages preset"],
  ["OCR 배치 페이지 직접 입력", "Custom OCR batch pages"],
  ["배치 페이지", "Batch pages"],
  ["모델 검색 결과", "Model search results"],
  ["데이터 범위", "Data coverage"],
  ["실행 등급", "Run grade"],
  ["작업 유형", "Task type"],
  ["공급사", "Provider"],
  ["라이선스", "License"],
  ["상업 이용 조건", "Commercial use terms"],
  ["정렬", "Sort"],
  ["보기 방식", "View mode"],
  ["목록 보기", "List view"],
  ["카드 보기", "Card view"],
  ["문서 크기", "Document size"],
  ["처리 기능", "Processing"],
  ["레이아웃 포함", "With layout"],
  ["표/수식 포함", "With tables/formulas"],
  ["비교에 추가 (최대 3개)", "Add to compare (max 3)"],
  ["조건 변경", "Change settings"],
  ["현재 계산 기준", "Current settings"],
  ["추천 시작하기", "Get started"],
  ["위에서 사용할 GPU를 먼저 선택해 주세요.", "Select the GPU to use above first."],
  ["GPU 선택", "Select GPU"],
  ["양자화별 추천", "Recommendation by quantization"],
  [
    "현재 조건에서 실행 가능한 모델을 권장 양자화로 묶었습니다.",
    "Runnable models under your current settings, grouped by recommended quantization.",
  ],
  ["모델을 누르면 상세 계산을 엽니다.", "Click a model to see the detailed calculation."],
  ["PyTorch 직접 실행", "PyTorch (direct)"],
  ["최고 품질", "Highest quality"],
  ["가장 빠른 모델", "Fastest model"],
  ["사용 안 함", "Not used"],
  ["GPU를 선택하세요", "Select a GPU"],
  ["GPU 이름으로 검색", "Search by GPU name"],
  ["GPU 목록", "GPU list"],
  ["일치하는 GPU가 없습니다.", "No matching GPU found."],
  ["공식 카드", "Official card"],
  ["공식 카드·thinking", "Official card · thinking mode"],
  ["공식 비교표·thinking", "Official comparison table · thinking mode"],
  ["공식 카드·AA 평가 방법", "Official card · AA methodology"],
  ["공식 공개 평가·조건 확인", "Official evaluation · check conditions"],
  ["공식 카드·조건 확인", "Official card · check conditions"],
  ["공식 BF16 평가", "Official BF16 evaluation"],
  ["추정 · 낮음", "Estimated · Low"],
  ["전체", "All"],
  ["공식 모델 카드", "Official model card"],
  ["공식 벤치마크 논문", "Official benchmark paper"],
  ["공식 기술 보고서 비교", "Official tech report comparison"],
  ["공식 기술 보고서", "Official tech report"],
  ["공식 비교표", "Official comparison table"],
  ["공식 비교", "Official comparison"],
  ["공식 증류", "Official distillation"],
  ["공식 논문", "Official paper"],
  ["공식 그래프", "Official graph"],
  ["공식 파트너", "Official partner"],
  ["공식 한국어", "Official (Korean)"],
  ["공식/미러", "Official/mirror"],
  ["공식", "Official"],
  ["외부 평가", "External eval"],
  ["외부 한국어", "External (Korean)"],
  ["외부 비교", "External comparison"],
  ["공개 평가", "Public evaluation"],
  ["품질 지표", "Quality metric"],
  ["불가", "N/A"],
  ["비교표", "comparison table"],
  ["최대 승률", "max win rate"],
  ["문서 OCR F1", "Document OCR F1"],
  ["필요 VRAM", "Required VRAM"],
  ["남는 VRAM", "Remaining VRAM"],
  ["부족 VRAM", "VRAM shortfall"],
  [
    "계산값은 로컬 추정치입니다. 실제 결과는 ",
    "Calculated values are local estimates. Actual results can vary significantly based on ",
  ],
  ["모델 아키텍처(MoE·attention 구조 등)", "model architecture (MoE, attention structure, etc.)"],
  [
    ", 드라이버, CUDA/ROCm, 프레임워크, 배치 크기, 예약 VRAM, KV cache, OCR 전처리 설정에 따라 크게 달라질 수 있으며, 특히 속도(tok/s)는 실제 측정과 배 단위로 차이가 날 수 있으니 상대 비교·참고용으로만 사용하세요.",
    ", drivers, CUDA/ROCm, framework, batch size, reserved VRAM, KV cache, and OCR preprocessing settings — especially speed (tok/s), which can differ from real measurements by multiples. Use these for relative comparison and reference only.",
  ],
  ["모델 데이터에 등록된 출시일입니다.", "This is the release date recorded in the model data."],
  [
    "공식 릴리스일이 아니라 공개 모델 카드의 createdAt 기준입니다.",
    "Based on the public model card's createdAt date, not the official release date.",
  ],
  [
    "서로 다른 GPU를 함께 쓰는 경우 메모리 분할·통신 손실을 보수적으로 반영합니다.",
    "Conservatively accounts for memory partitioning and communication loss when combining different GPUs.",
  ],
  ["예: Qwen/Qwen2.5-1.5B-Instruct", "e.g. Qwen/Qwen2.5-1.5B-Instruct"],
  [
    "위에서 GPU를 선택하고 용도와 우선순위를 고르면 현재 워크로드의 실행 가능한 모델만 추립니다.",
    "Select a GPU above, then choose a purpose and priority to see only runnable models for this workload.",
  ],
  ["VRAM 여유 우선", "VRAM headroom first"],
  ["벤치마크 시트", "Benchmark sheet"],
  ["내 VRAM에서 가장 성능 좋은 로컬 모델", "Best local model for your VRAM"],
  [
    "같은 공개 벤치마크끼리만 Q4_K_M 예상 VRAM과 성능을 비교합니다.",
    "Compare estimated Q4_K_M VRAM and quality only within the same published benchmark.",
  ],
  ["비교 지표", "Benchmark"],
  [
    "기준: Q4_K_M · 4K context · 동시 요청 1 · llama.cpp. 점수는 각 모델 제작자가 공개한 값이며, 시험 세부 조건은 출처에서 확인하세요.",
    "Baseline: Q4_K_M · 4K context · 1 concurrent request · llama.cpp. Scores are source-reported; check each source for evaluation details.",
  ],
  ["VRAM 대비 모델 벤치마크 성능 차트", "Model benchmark performance by VRAM"],
  ["모델 상세 분석", "Model details"],
  ["모델 비교", "Model comparison"],
  ["자체 평가", "self-reported"],
  ["연동", "integrated"],
  ["평균", "avg"],
  ["통합메모리", "unified memory"],
  ["채굴카드", "mining card"],
  ["구형·개인용", "legacy · personal use"],
  ["구형·저가형 추론용", "legacy · budget inference"],
  ["구형·저전력 추론용", "legacy · low-power inference"],
  ["VRAM 메모리 맵", "VRAM memory map"],
  ["기타 버퍼", "Other buffers"],
  ["모델 가중치", "Model weights"],
  ["상주 모델/모듈", "Resident model/module"],
  ["런타임 오버헤드", "Runtime overhead"],
  ["여유", "Free"],
  ["시작하기: GPU 선택", "Get started: choose a GPU"],
  ["내 GPU를 선택하면 바로 계산을 시작합니다", "Select your GPU to start calculating"],
  [
    "VRAM과 대역폭을 기준으로 실행 가능한 AI 모델과 예상 속도를 바로 계산합니다.",
    "See runnable AI models and estimated speed based on your VRAM and bandwidth.",
  ],
  ["자주 찾는 GPU", "Popular GPUs"],
  ["다른 GPU 검색", "Search other GPUs"],
  ["예: RTX 4070, A100, M3 Max", "e.g. RTX 4070, A100, M3 Max"],
  ["시작하기", "Get started"],
  ["모델명, GPU, 지표로 검색", "Search by model, GPU, or metric"],
  // These entries exist because several short fragment rules above (e.g.
  // "선택" → "selected", "배치" → "batch", "모델" → "Model", "검색" →
  // "Search") are also used inside longer static aria-labels baked into
  // index.html and other one-time-Korean-source template strings. Those
  // labels are captured once at page load (captureStaticTranslationSources)
  // and re-translated from that captured Korean source on every sweep, so
  // without a longer, more specific whole-phrase match here, the fragment
  // rule fires on a sub-string and mangles the label into a mixed Korean/
  // English mess (e.g. "테마 선택" → "테마 selected" instead of "Theme").
  // The array is sorted by source length before compiling, so listing the
  // full phrase anywhere in this array makes it win over the shorter
  // fragment rule automatically.
  ["테마 선택", "Theme"],
  ["현재 작업 진행 단계", "Current task progress"],
  ["주요 작업 선택", "Choose a primary task"],
  ["주요 작업", "Primary tasks"],
  ["가이드 닫기", "Close guide"],
  ["60초 샘플 체험", "60-second sample tour"],
  ["배치 플래너 진행 단계", "Placement planner progress"],
  ["배치할 모델 검색", "Search models to place"],
  ["지표로 비교 모델 선택", "Compare models by metric"],
  ["지표로 비교할 모델 선택", "Compare models by metric"],
  // Footer "local usage summary" panel (features/privacy-analytics.js) —
  // built once from document.documentElement.lang at DOMContentLoaded, so a
  // later language toggle only fixes it via this generic sweep, not by
  // re-running that panel's own render.
  ["개인정보 없는 로컬 사용 요약", "Private local usage summary"],
  ["정해진 행동의 횟수만 이 브라우저에 저장하며 어떤 값도 자동 전송하지 않습니다.", "Only anonymous event counts are kept in this browser. Nothing is transmitted automatically."],
  ["요약 JSON 복사", "Copy summary JSON"],
  ["로컬 요약 삭제", "Clear local summary"],
  // Korean-market price source citations (data/decision-data.js `sourceName`,
  // e.g. "다나와 · GIGABYTE 지포스 RTX 4070 ...") are rendered verbatim and
  // swept by this generic dictionary rather than being hand-translated per
  // row. "다나와" (Danawa, the retailer) is left as-is, same as citing
  // "Amazon" in English copy — only the brand words below are normalized so
  // English-mode readers see "GeForce"/"Radeon" instead of the Korean
  // transliteration.
  ["지포스", "GeForce"],
  ["라데온", "Radeon"],
];

// Hangul syllable + jamo range, used to guard dictionary substring matches
// below so we never translate half of a Korean word. Without this guard,
// replacing a short entry like "모델" ("model") inside "모델을"/"모델별" would
// leave a dangling Korean particle glued onto the English word (e.g.
// "Model을"), which reads as broken text rather than a simple missing
// translation.
const HANGUL_RANGE = "\\uAC00-\\uD7A3\\u3131-\\u318E";
const STATIC_TEXT_SOURCES = new WeakMap();
const STATIC_ATTRIBUTE_SOURCES = new WeakMap();

function captureStaticTranslationSources(root = document.body) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.parentElement?.closest("script,style")) STATIC_TEXT_SOURCES.set(node, node.nodeValue);
  }
  root.querySelectorAll("[placeholder],[aria-label],[title]").forEach((node) => {
    const sources = {};
    ["placeholder", "aria-label", "title"].forEach((attribute) => {
      if (node.hasAttribute(attribute)) sources[attribute] = node.getAttribute(attribute);
    });
    STATIC_ATTRIBUTE_SOURCES.set(node, sources);
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function compileBoundarySafeReplacements(pairs) {
  const hangulStart = new RegExp(`^[${HANGUL_RANGE}]`);
  const hangulEnd = new RegExp(`[${HANGUL_RANGE}]$`);
  // Same idea as the Hangul guard, but for Latin words: without it, a short
  // bare entry like ["임베딩", "Embedding"] reversed for the en→ko direction
  // becomes a plain "Embedding" match with no boundary check, which also
  // matches the "Embedding" prefix inside the longer proper noun "Text
  // Embeddings Inference" -- replacing just the prefix and leaving a
  // dangling "s" behind ("Text 임베딩s Inference"). Guard Latin-letter edges
  // the same way so short entries never eat into a longer English word.
  const latinStart = /^[A-Za-z]/;
  const latinEnd = /[A-Za-z]$/;
  return pairs.map(([from, to]) => {
    const lookbehind = hangulStart.test(from) ? `(?<![${HANGUL_RANGE}])` : latinStart.test(from) ? "(?<![A-Za-z])" : "";
    const lookahead = hangulEnd.test(from) ? `(?![${HANGUL_RANGE}])` : latinEnd.test(from) ? "(?![A-Za-z])" : "";
    return { regex: new RegExp(`${lookbehind}${escapeRegExp(from)}${lookahead}`, "g"), to };
  });
}

function translateDynamicUi(language = "en") {
  const pairs = ENGLISH_UI_REPLACEMENTS.map(([from, to]) => (language === "en" ? [from, to] : [to, from]))
    .sort((a, b) => b[0].length - a[0].length);
  const compiled = compileBoundarySafeReplacements(pairs);
  const replaceText = (value) => {
    // The template/regex rules below run BEFORE the dictionary's boundary-safe
    // substring pass. Several of them embed short Korean words (e.g. "모델",
    // "출처") that also exist as bare dictionary entries; if the dictionary
    // ran first it would consume those words out from under the more
    // specific template match, breaking it. Running templates first avoids
    // that ordering conflict — whatever Korean survives the templates is
    // handled generically by the dictionary afterward.
    let text = value;
    if (language === "en") {
      text = text
        // Full-sentence exact match, run before the generic "AI 모델" → "AI models"
        // rule further down. Without this, that generic rule fires first (templates
        // always run before the dictionary sweep — see comment above), mutating "AI
        // 모델" mid-sentence so the dictionary's full-sentence entry for this exact
        // string no longer matches verbatim. The leftover then gets picked apart by
        // shorter dictionary entries ("실행 가능한" → "runnable") while "예상 속도를"
        // is correctly left alone by the Hangul boundary guard (it doesn't cover the
        // attached "를" particle) — producing a broken half-Korean, half-English
        // sentence: "VRAM과 대역폭을 기준으로 runnable AI models과 예상 속도를 바로
        // 계산합니다." Matching the whole sentence here, first, avoids that entirely.
        .replace(/VRAM과 대역폭을 기준으로 실행 가능한 AI 모델과 예상 속도를 바로 계산합니다\./g, "See runnable AI models and estimated speed based on your VRAM and bandwidth.")
        .replace(/LM Studio·koboldcpp·text\-generation\-webui도 내부적으로 llama\.cpp 엔진을 사용해 위 "llama\.cpp \/ Ollama" 수치와 동일합니다\./g, 'LM Studio, koboldcpp, and text-generation-webui all use the llama.cpp engine internally, so they match the "llama.cpp / Ollama" numbers above.')
        .replace(/가용 VRAM\s+([\d.]+)\s*GB/g, "Available VRAM $1 GB")
        .replace(/RAM\s+([\d.]+)\s*GB/g, "RAM $1 GB")
        .replace(/GPU\s+(\d+)개/g, "GPUs: $1")
        .replace(/(\d+)K\s*·\s*동시\s*(\d+)명\s*·\s*llama\.cpp \/ Ollama\s*·\s*자동 추천/g, "$1K · $2 concurrent · llama.cpp / Ollama · Auto")
        .replace(/질의 (\d+) \+ 문서 (\d+) · 후보 (\d+)개/g, "Query $1 + Document $2 · $3 candidates")
        .replace(/(\d+)단계 빠른 추천/g, "$1-step quick recommendations")
        .replace(/GPU에 맞는 모델 (\d+)개를 바로 추천합니다/g, "Get $1 models recommended for your GPU")
        .replace(/(\d+)순위/g, "Rank $1")
        .replace(/약\s*([\d.]+)~([\d.]+)\s*tok\/s/g, "Approx. $1–$2 tok/s")
        .replace(/VRAM 여유\s*([\d.]+)%/g, "$1% VRAM headroom")
        .replace(/가용 VRAM 안에 들어옴/g, "Fits available VRAM")
        .replace(/한국어 지원/g, "Korean support")
        .replace(/코딩 적합/g, "Good for coding")
        .replace(/추론 태그/g, "Reasoning tag")
        .replace(/모델 (\d+)개/g, "$1 models")
        .replace(/(\d+)개 모델/g, "$1 models")
        .replace(/현재 GPU/g, "Current GPU")
        .replace(/GPU 프리셋/g, "GPU presets")
        .replace(/출처 연결 평가/g, "Cited evaluations")
        .replace(/AI 모델/g, "AI models")
        .replace(/자동 추천/g, "Auto recommendation")
        // Grade label "가능" ("Possible") only when it stands alone as a whole
        // line/value — never mid-sentence, where "가능" usually just means
        // "available/possible" as an ordinary adjective (e.g. "선택 가능").
        .replace(/(^|\n)가능(?=\n|$)/g, "$1Possible")
        .replace(/^(.+) 비교에 추가$/, "Add $1 to compare")
        .replace(/^(.+) 비교에서 제거$/, "Remove $1 from compare")
        .replace(
          /^(.+?) 기준입니다\. 로컬 추론 속도 측정과 분리된 외부 공개 참고값입니다\.(?:\s*출처: (\S+))?$/,
          (_, metric, url) => `Based on ${metric}. External public reference, separate from local speed measurements.${url ? ` Source: ${url}` : ""}`,
        )
        .replace(/속도와 처리량은 오른쪽 추정 처리량 열에서 별도로 표시합니다\./g, "Speed and throughput are shown separately in the estimated throughput column.")
        .replace(/공식 모델 카드나 논문에서 확인되는 (.+?)가 아직 등록되지 않았습니다\./g, "No official $1 has been recorded yet from the model card or paper.")
        .replace(/동일 OCR 정확도 기준의 공개 점수가 아직 등록되지 않았습니다\./g, "No public score using the same OCR accuracy standard has been recorded yet.")
        .replace(/문서 VLM 탭은 OmniDocBench 계열 점수만 같은 열에 표시합니다\./g, "The Document VLM tab only shows OmniDocBench-family scores in this column.")
        .replace(/범용 VLM 탭은 OCRBench v2 계열 점수만 같은 열에 표시합니다\./g, "The General VLM tab only shows OCRBench v2-family scores in this column.")
        .replace(/MTEB 없음/g, "No MTEB")
        .replace(/BEIR\/MIRACL 없음/g, "No BEIR/MIRACL")
        .replace(/공개 점수 없음/g, "No public score")
        .replace(/동일 기준 없음/g, "No matching standard")
        .replace(/(\d+)K 컨텍스트/g, "$1K context")
        .replace(/(\d+K?) 토큰/g, "$1 tokens")
        .replace(/비교 \((\d+)\/(\d+)\)/g, "Compare ($1/$2)")
        .replace(/사용률\s*([\d.]+)%/g, "Utilization $1%")
        .replace(/^현재 (.+·.+) 기준$/gm, "Current: $1")
        .replace(/ · (\d+)개(?![가-힣])/g, " · $1");
    } else {
      text = text
        // 영어 방향 수정과 대칭되는 역방향 규칙. 위 language === "en" 체인에서
        // 이 전체 문장을 TEMPLATE 단계 맨 앞에 매칭시킨 것과 동일한 이유로,
        // 여기서도 맨 앞에서 전체 문장을 먼저 치환해야 짧은 사전 항목들이
        // 부분적으로 끼어들어 문장을 깨뜨리는 일을 막을 수 있다.
        .replace(/See runnable AI models and estimated speed based on your VRAM and bandwidth\./g, "VRAM과 대역폭을 기준으로 실행 가능한 AI 모델과 예상 속도를 바로 계산합니다.")
        .replace(/LM Studio, koboldcpp, and text\-generation\-webui all use the llama\.cpp engine internally, so they match the "llama\.cpp \/ Ollama" numbers above\./g, 'LM Studio·koboldcpp·text-generation-webui도 내부적으로 llama.cpp 엔진을 사용해 위 "llama.cpp / Ollama" 수치와 동일합니다.')
        .replace(/Available VRAM\s+([\d.]+)\s*GB/g, "가용 VRAM $1 GB")
        .replace(/RAM\s+([\d.]+)\s*GB/g, "RAM $1 GB")
        .replace(/GPUs:\s*(\d+)/g, "GPU $1개")
        .replace(/(\d+)K\s*·\s*(\d+) concurrent\s*·\s*llama\.cpp \/ Ollama\s*·\s*Auto/g, "$1K · 동시 $2명 · llama.cpp / Ollama · 자동 추천")
        .replace(/Query (\d+) \+ Document (\d+) · (\d+) candidates/g, "질의 $1 + 문서 $2 · 후보 $3개")
        .replace(/(\d+)-step quick recommendations/g, "$1단계 빠른 추천")
        .replace(/Get (\d+) models recommended for your GPU/g, "GPU에 맞는 모델 $1개를 바로 추천합니다")
        .replace(/Rank (\d+)/g, "$1순위")
        .replace(/Approx\.\s*([\d.]+)–([\d.]+) tok\/s/g, "약 $1~$2 tok/s")
        .replace(/([\d.]+)% VRAM headroom/g, "VRAM 여유 $1%")
        .replace(/Fits available VRAM/g, "가용 VRAM 안에 들어옴")
        .replace(/Korean support/g, "한국어 지원")
        .replace(/Good for coding/g, "코딩 적합")
        .replace(/Reasoning tag/g, "추론 태그")
        .replace(/(\d+) models/g, "모델 $1개")
        .replace(/Current GPU/g, "현재 GPU")
        .replace(/GPU presets/g, "GPU 프리셋")
        .replace(/Cited evaluations/g, "출처 연결 평가")
        .replace(/AI models/g, "AI 모델")
        .replace(/Auto recommendation/g, "자동 추천")
        .replace(/(^|\n)Possible(?=\n|$)/g, "$1가능")
        .replace(/^Add (.+) to compare$/, "$1 비교에 추가")
        .replace(/^Remove (.+) from compare$/, "$1 비교에서 제거")
        .replace(
          /^Based on (.+?)\. External public reference, separate from local speed measurements\.(?:\s*Source: (\S+))?$/,
          (_, metric, url) => `${metric} 기준입니다. 로컬 추론 속도 측정과 분리된 외부 공개 참고값입니다.${url ? ` 출처: ${url}` : ""}`,
        )
        .replace(/Speed and throughput are shown separately in the estimated throughput column\./g, "속도와 처리량은 오른쪽 추정 처리량 열에서 별도로 표시합니다.")
        .replace(/No official (.+?) has been recorded yet from the model card or paper\./g, "공식 모델 카드나 논문에서 확인되는 $1가 아직 등록되지 않았습니다.")
        .replace(/No public score using the same OCR accuracy standard has been recorded yet\./g, "동일 OCR 정확도 기준의 공개 점수가 아직 등록되지 않았습니다.")
        .replace(/The Document VLM tab only shows OmniDocBench-family scores in this column\./g, "문서 VLM 탭은 OmniDocBench 계열 점수만 같은 열에 표시합니다.")
        .replace(/The General VLM tab only shows OCRBench v2-family scores in this column\./g, "범용 VLM 탭은 OCRBench v2 계열 점수만 같은 열에 표시합니다.")
        .replace(/No MTEB/g, "MTEB 없음")
        .replace(/No BEIR\/MIRACL/g, "BEIR/MIRACL 없음")
        .replace(/No public score/g, "공개 점수 없음")
        .replace(/No matching standard/g, "동일 기준 없음")
        .replace(/(\d+)K context/g, "$1K 컨텍스트")
        .replace(/(\d+) tokens/g, "$1 토큰")
        .replace(/Compare \((\d+)\/(\d+)\)/g, "비교 ($1/$2)")
        .replace(/Utilization\s*([\d.]+)%/g, "사용률 $1%")
        .replace(/^Current: (.+)$/gm, "현재 $1 기준");
    }
    text = compiled.reduce((current, { regex, to }) => current.replace(regex, to), text);
    // Cleanup pass: after the dictionary translates the surrounding label to
    // English (e.g. "외부 공개 참고값" → "External public reference"), strip
    // the leftover Korean counter word "개" glued to a trailing count (e.g.
    // "reference 334개" → "reference 334"). Requires a Latin letter right
    // before the number so this never touches standalone Korean option
    // values like "8개" in the settings dropdowns.
    if (language === "en") text = text.replace(/([A-Za-z])\s(\d+)개(?![가-힣])/g, "$1 $2");
    return text;
  };
  // Raw catalog model names (e.g. "Qwen/Qwen3-Embedding-4B") are technical
  // identifiers, not natural-language UI copy -- they must never be run
  // through the word-level dictionary above. The boundary guard in
  // compileBoundarySafeReplacements() only stops a short entry from eating
  // into a longer contiguous Latin word (see its own comment about "Text
  // Embeddings Inference"); it does NOT stop a short entry from matching a
  // token that's merely hyphen/slash-delimited, which is exactly how HF
  // model IDs are built. Concretely: ["임베딩", "Embedding"] reversed for
  // ko-mode matches the standalone "Embedding" inside "Qwen3-Embedding-4B"
  // (bounded by "-" on both sides, which isn't a Latin letter, so the guard
  // allows it), silently corrupting it to "Qwen3-임베딩-4B" on every render
  // of the GPU placement planner / model finder / infra studio (all three
  // call translateDynamicUi() unconditionally, even while already in
  // Korean). Skip any text node whose content is *exactly* a real catalog
  // model name so it always renders verbatim regardless of language.
  const catalogModelNames = typeof getAllModels === "function"
    ? new Set(getAllModels().map((model) => model.name))
    : new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => {
    if (node.parentElement?.closest("script,style")) return;
    const source = STATIC_TEXT_SOURCES.get(node) ?? node.nodeValue;
    if (catalogModelNames.has(source.trim())) return;
    node.nodeValue = replaceText(source);
  });
  document.querySelectorAll("[placeholder],[aria-label],[title]").forEach((node) => {
    const sources = STATIC_ATTRIBUTE_SOURCES.get(node) || {};
    ["placeholder", "aria-label", "title"].forEach((attribute) => {
      if (node.hasAttribute(attribute)) node.setAttribute(attribute, replaceText(sources[attribute] ?? node.getAttribute(attribute)));
    });
  });
}
