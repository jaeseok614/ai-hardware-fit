/** Key-based translations for persistent shell and primary workspaces. */
(() => {
  const catalog = {
    "brand.name": { ko: "AI Hardware Fit", en: "AI Hardware Fit" },
    "brand.subtitle": { ko: "GPU·모델 적합성 계산기", en: "Can my GPU run this?" },
    "nav.methodology": { ko: "계산 기준", en: "Methodology" },
    "nav.sources": { ko: "데이터 출처", en: "Data sources" },
    "nav.benchmarks": { ko: "벤치마크", en: "Benchmarks" },
    "nav.language": { ko: "언어 선택", en: "Language" },
    "nav.theme": { ko: "테마 선택", en: "Theme" },
    "nav.light": { ko: "라이트", en: "Light" },
    "nav.dark": { ko: "다크", en: "Dark" },
    "core.guide": { ko: "처음 사용", en: "Start here" },
    "nav.resources": { ko: "자료", en: "Resources" },
    "nav.github": { ko: "GitHub에서 보기", en: "View on GitHub" },
    "core.finder.title": { ko: "내 GPU로 모델 찾기", en: "Find models for my GPU" },
    "core.finder.note": { ko: "GPU 이름만 고르면 바로 비교", en: "Choose a GPU and compare immediately" },
    "core.model.title": { ko: "모델에 맞는 GPU 찾기", en: "Find a GPU for a model" },
    "core.model.note": { ko: "모델·예산 기준 추천 GPU 비교", en: "Compare recommended GPUs by model and budget" },
    "core.infra.title": { ko: "AI 서비스 서버 견적", en: "Size an AI service" },
    "core.infra.note": { ko: "사용자 수로 GPU·비용 산정", en: "Estimate GPUs and cost from user demand" },
    "core.community.title": { ko: "실측 벤치마크", en: "Measured benchmarks" },
    "core.community.note": { ko: "공개 참고값과 사용자 측정 데이터", en: "Public references and user measurements" },
    "core.placement.title": { ko: "여러 모델 배치", en: "Place multiple models" },
    "core.placement.note": { ko: "한 대 이상의 GPU에 모델 함께 배치", en: "Share one or more GPUs across models" },
    "core.apiCost.title": { ko: "API와 자체 구축 비교", en: "API vs self-hosted" },
    "core.apiCost.note": { ko: "월 사용량 기준 비용과 손익분기점", en: "Monthly cost and break-even point" },
    "core.ontologyCost.title": { ko: "온톨로지 구축 비용", en: "Ontology construction cost" },
    "core.ontologyCost.note": { ko: "문서 처리 1회성 API 비용", en: "One-time document processing cost" },
    "core.group.model": { ko: "모델 찾기", en: "Find a model" },
    "core.group.infra": { ko: "인프라 설계", en: "Infra design" },
    "core.group.cost": { ko: "비용 비교", en: "Cost compare" },
    "core.group.data": { ko: "데이터", en: "Data" },
    "core.heading.kicker": { ko: "무료 · 브라우저에서 계산", en: "Free · calculated in your browser" },
    "core.heading.title": { ko: "무엇을 확인하고 싶으세요?", en: "What do you want to check?" },
    "core.heading.note": { ko: "가장 자주 쓰는 계산만 먼저 보여드립니다.", en: "The most common calculations come first." },
    "core.more.title": { ko: "고급 도구", en: "Advanced tools" },
    "core.more.note": { ko: "배치·비용·벤치마크", en: "Placement, cost, benchmarks" },
    "onboarding.kicker": { ko: "내 GPU 기준으로 확인", en: "Check against your GPU" },
    "onboarding.title": { ko: "GPU 이름 하나로 실행 가능한 AI 모델을 확인하세요", en: "Can my GPU run this?" },
    "onboarding.note": { ko: "VRAM 적합성, 권장 양자화, 예상 속도를 한 화면에서 비교합니다.", en: "Pick a GPU to see 3 models that fit, their quantization, VRAM, speed range, and run command." },
    "onboarding.trust": { ko: "서비스 특징", en: "Service characteristics" },
    "onboarding.account": { ko: "회원가입 없이", en: "No account required" },
    "onboarding.local": { ko: "입력값은 브라우저 안에", en: "Inputs stay in your browser" },
    "onboarding.open": { ko: "계산식·데이터 공개", en: "Open formulas and data" },
    "onboarding.search": { ko: "GPU 이름", en: "GPU name" },
    "onboarding.quick": { ko: "목록에서 바로 선택", en: "Choose from the list" },
    "onboarding.catalogNote": { ko: "공식·공개 출처를 바탕으로 매주 갱신합니다.", en: "Updated weekly from official and public sources." },
    "onboarding.pickerKicker": { ko: "GPU 선택", en: "Choose a GPU" },
    "onboarding.pickerTitle": { ko: "사용 중인 GPU를 찾아보세요", en: "Find the GPU you use" },
    "onboarding.searchPlaceholder": { ko: "예: RTX 4070, A100, M3 Max", en: "e.g. RTX 4070, A100, M3 Max" },
    "core.demo.examplesTitle": { ko: "예시로 보기", en: "Try examples" },
    "core.demo.gpu": { ko: "RTX 3060 모델 추천", en: "RTX 3060 model picks" },
    "core.demo.model": { ko: "Qwen 32B용 GPU 찾기", en: "Find a GPU for Qwen 32B" },
    "core.demo.infra": { ko: "사내 RAG 30명 견적", en: "30-user internal RAG estimate" },
    "core.demo.infraOntology": { ko: "온톨로지 구축 배치 견적", en: "Ontology construction batch estimate" },
    "core.demo.placement": { ko: "Llama 70B+임베딩 2장 배치", en: "Llama 70B + embedding on 2 GPUs" },
    "core.demo.placementOntology": { ko: "온톨로지 추출+임베딩 배치", en: "Ontology extraction + embedding batch" },
    "benchmark.title": { ko: "모델별 성능지표 시트", en: "Model benchmark sheet" },
    "benchmark.note": { ko: "계산 추정, 외부 공개 참고값, 사용자 측정을 근거별로 분리합니다.", en: "Calculated estimates, public references, and user measurements are separated by evidence type." },
    "benchmark.search": { ko: "모델명, GPU, 지표로 검색", en: "Search model, GPU, or metric" },
  };

  const bindings = [
    [".brand-text h1", "brand.name"],
    ["#brandSubtitle", "brand.subtitle"],
    [".header-nav a[href='#calculationBasis']", "nav.methodology"],
    [".header-nav a[href*='#참고한']", "nav.sources"],
    [".header-nav a[href='#benchmarkSheet']", "nav.benchmarks"],
    ["[data-language-toggle]", "nav.language", "aria-label"],
    ["[data-theme-toggle]", "nav.theme", "aria-label"],
    ["[data-theme-toggle] [data-theme='light']", "nav.light", "aria-label"],
    ["[data-theme-toggle] [data-theme='dark']", "nav.dark", "aria-label"],
    ["[data-open-start-guide]", "core.guide"],
    ["[data-header-resources] > summary", "nav.resources"],
    [".github-link-text", "nav.github"],
    ["[data-core-heading-kicker]", "core.heading.kicker"],
    ["[data-core-heading-title]", "core.heading.title"],
    ["[data-core-heading-note]", "core.heading.note"],
    ["[data-core-more-title]", "core.more.title"],
    ["[data-core-more-note]", "core.more.note"],
    ["[data-onboarding-kicker]", "onboarding.kicker"],
    ["#onboardingTitle", "onboarding.title"],
    ["[data-onboarding-note]", "onboarding.note"],
    ["[data-onboarding-trust]", "onboarding.trust", "aria-label"],
    ["[data-onboarding-trust-account]", "onboarding.account"],
    ["[data-onboarding-trust-local]", "onboarding.local"],
    ["[data-onboarding-trust-open]", "onboarding.open"],
    ["[data-onboarding-search-label]", "onboarding.search"],
    ["#onboardingGpuSearch", "onboarding.search", "aria-label"],
    ["[data-onboarding-quick-title]", "onboarding.quick"],
    ["[data-onboarding-catalog-note]", "onboarding.catalogNote"],
    ["[data-onboarding-picker-kicker]", "onboarding.pickerKicker"],
    ["[data-onboarding-picker-title]", "onboarding.pickerTitle"],
    ["#onboardingGpuSearch", "onboarding.searchPlaceholder", "placeholder"],
    ["[data-core-task='finder'] > span", "core.finder.title"],
    ["[data-core-task='finder'] > small", "core.finder.note"],
    ["[data-core-task='modelFinder'] > span", "core.model.title"],
    ["[data-core-task='modelFinder'] > small", "core.model.note"],
    ["[data-core-task='infra'] > span", "core.infra.title"],
    ["[data-core-task='infra'] > small", "core.infra.note"],
    ["[data-core-task='community'] > span", "core.community.title"],
    ["[data-core-task='community'] > small", "core.community.note"],
    ["[data-core-task='placement'] > span", "core.placement.title"],
    ["[data-core-task='placement'] > small", "core.placement.note"],
    ["[data-core-task='apiCost'] > span", "core.apiCost.title"],
    ["[data-core-task='apiCost'] > small", "core.apiCost.note"],
    ["[data-core-task='ontologyCost'] > span", "core.ontologyCost.title"],
    ["[data-core-task='ontologyCost'] > small", "core.ontologyCost.note"],
    ["[data-core-group='model'] > .core-task-group-label", "core.group.model"],
    ["[data-core-group='infra'] > .core-task-group-label", "core.group.infra"],
    ["[data-core-group='cost'] > .core-task-group-label", "core.group.cost"],
    ["[data-core-group='data'] > .core-task-group-label", "core.group.data"],
    ["[data-guide-examples-title]", "core.demo.examplesTitle"],
    ["[data-demo-gpu]", "core.demo.gpu"],
    ["[data-demo-model]", "core.demo.model"],
    ["[data-demo-infra='internal-rag']", "core.demo.infra"],
    ["[data-demo-infra='ontology-batch']", "core.demo.infraOntology"],
    ["[data-demo-placement='1']", "core.demo.placement"],
    ["[data-demo-placement='2']", "core.demo.placementOntology"],
    ["#benchmarkSheet .benchmark-head h2", "benchmark.title"],
    ["#benchmarkSheet .benchmark-head p", "benchmark.note"],
    ["#benchmarkSearch", "benchmark.search", "placeholder"],
    ["#benchmarkSearch", "benchmark.search", "aria-label"],
  ];

  function t(key, language = document.documentElement.lang) {
    const entry = catalog[key];
    return entry?.[language === "en" ? "en" : "ko"] || "";
  }

  function apply(language = document.documentElement.lang, root = document) {
    bindings.forEach(([selector, key, attribute]) => {
      root.querySelectorAll(selector).forEach((node) => {
        node.dataset.i18nKey = key;
        const value = t(key, language);
        if (attribute) node.setAttribute(attribute, value);
        else node.textContent = value;
      });
    });
    root.querySelectorAll("[role='tablist']").forEach((tablist) => {
      tablist.querySelectorAll("button").forEach((node) => node.setAttribute("role", "tab"));
    });
    root.querySelectorAll(".command-block").forEach((node) => node.setAttribute("tabindex", "0"));
  }

  function audit(root = document) {
    const missing = [];
    root.querySelectorAll("[data-i18n-key]").forEach((node) => {
      if (!catalog[node.dataset.i18nKey]) missing.push(node.dataset.i18nKey);
    });
    return { keyedNodes: root.querySelectorAll("[data-i18n-key]").length, missing: [...new Set(missing)] };
  }

  window.AIHardwareI18n = { catalog, t, apply, audit };
})();
