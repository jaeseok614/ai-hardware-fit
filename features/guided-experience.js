(() => {
  const COPY = {
    ko: {
      finder: ["GPU 선택", "추천 3개 확인", "전체 모델 탐색"],
      modelFinder: ["모델 선택", "예산 입력", "GPU 3안 비교"],
      placement: ["GPU 구성", "모델 추가", "배치안 확인"],
      infra: ["서비스 선택", "사용자 수", "예산·우선순위", "3가지 견적 비교"],
      next: "현재 단계",
      guide: "처음 사용",
      close: "가이드 닫기",
      panelTitle: "내 상황에 맞는 시작점",
      guideViewToggle: { list: "질문으로 찾기", wizard: "목록으로 보기" },
      guideWizardBack: "← 다시 선택",
      panelSteps: [
        ["GPU는 있는데 뭘 돌릴 수 있는지 궁금하다면", "GPU 이름만 선택하면 바로 실행할 수 있는 모델 3개를 보여줍니다.", "finder"],
        ["실행할 모델은 정했는데 어떤 GPU가 필요한지 모른다면", "실행할 모델과 예산을 고르면 적합한 GPU를 비교합니다.", "modelFinder"],
        ["여러 사람이 함께 쓸 AI 서비스를 만들 계획이라면", "챗봇, RAG, 이미지, 음성 등 서비스와 사용자 수만 입력합니다.", "infra"],
        ["직접 계산은 필요 없고 다른 사람이 측정한 데이터만 보고 싶다면", "실행 결과를 공유하거나 벤치마크 데이터 현황을 확인합니다.", "community"],
      ],
      panelNote: "모르는 전문 용어는 고급 설정을 열기 전에는 입력하지 않아도 됩니다.",
      wizard: {
        start: {
          question: "지금 실행 환경이 어느 쪽에 가까운가요?",
          options: [
            { label: "GPU를 이미 갖고 있어요", next: "hasGpu" },
            { label: "아직 GPU가 없어요", next: "noGpu" },
            { label: "그냥 다른 사람이 측정한 데이터가 보고 싶어요", mode: "community" },
          ],
        },
        hasGpu: {
          question: "이 GPU로 뭘 하고 싶으세요?",
          options: [
            { label: "이 GPU로 뭘 돌릴 수 있는지 보고 싶어요", mode: "finder" },
            { label: "실행할 모델은 정했고, 예산에 맞는 GPU를 비교하고 싶어요", mode: "modelFinder" },
            { label: "여러 명이 쓰는 서비스를 만들 거예요", mode: "infra" },
          ],
        },
        noGpu: {
          question: "그럼 다음 중 어디에 더 가까운가요?",
          options: [
            { label: "실행할 모델은 정했어요", mode: "modelFinder" },
            { label: "여러 명이 쓰는 서비스를 만들 거예요", mode: "infra" },
          ],
        },
      },
      requestSummary: "찾는 GPU나 모델이 없나요?",
      requestSteps: ["이름 중복 확인", "공식 출처 확인", "데이터 검토", "다음 릴리스 반영"],
      requestNote: "요청 전에 검색창에서 별칭까지 확인합니다. 공식 제품·모델 링크가 있으면 더 빠르게 검토할 수 있습니다.",
      requestLinks: ["GPU 추가 요청", "모델 추가 요청", "국내 가격 제보", "처리 중 요청 보기", "반영 완료 보기"],
    },
    en: {
      finder: ["Choose a GPU", "Review 3 picks", "Explore all models"],
      modelFinder: ["Choose a model", "Set a budget", "Compare 3 GPUs"],
      placement: ["Add GPUs", "Add models", "Review placement"],
      infra: ["Choose a service", "Set users", "Budget and priority", "Compare 3 plans"],
      next: "Current path",
      guide: "Start here",
      close: "Close guide",
      panelTitle: "Choose the path that matches your situation",
      guideViewToggle: { list: "Find by answering questions", wizard: "Show the list" },
      guideWizardBack: "← Start over",
      panelSteps: [
        ["If you have a GPU and want to know what it can run", "Choose its name to see three models that can run immediately.", "finder"],
        ["If you know which model to run but not which GPU to buy", "Choose a model and budget to compare suitable GPUs.", "modelFinder"],
        ["If you are planning a service multiple people will use", "Enter only the service type and number of users.", "infra"],
        ["If you just want to browse data others have measured", "Submit a run result or check benchmark coverage.", "community"],
      ],
      panelNote: "You do not need to enter unfamiliar technical terms unless you open advanced settings.",
      wizard: {
        start: {
          question: "Which is closer to your current setup?",
          options: [
            { label: "I already have a GPU", next: "hasGpu" },
            { label: "I do not have a GPU yet", next: "noGpu" },
            { label: "I just want to browse data others measured", mode: "community" },
          ],
        },
        hasGpu: {
          question: "What do you want to do with this GPU?",
          options: [
            { label: "See what it can run", mode: "finder" },
            { label: "I know the model — compare GPUs within a budget", mode: "modelFinder" },
            { label: "I am building a service for multiple people", mode: "infra" },
          ],
        },
        noGpu: {
          question: "Which of these is closer?",
          options: [
            { label: "I already know which model to run", mode: "modelFinder" },
            { label: "I am building a service for multiple people", mode: "infra" },
          ],
        },
      },
      requestSummary: "Cannot find a GPU or model?",
      requestSteps: ["Check duplicates", "Verify official source", "Review data", "Add in a release"],
      requestNote: "Search aliases before filing a request. An official product or model URL helps us review it faster.",
      requestLinks: ["Request a GPU", "Request a model", "Report Korean pricing", "View open requests", "View completed requests"],
    },
  };

  let language = document.documentElement.lang === "en" ? "en" : "ko";
  let currentMode = "finder";
  let started = false;

  // Finder, modelFinder, and infra all expose real step controls. Keep the
  // shared journey bar wired to those controls so its highlighted step never
  // drifts away from the content shown below it.
  function goToJourneyStep(index) {
    if (currentMode === "modelFinder") {
      window.AIHardwareGpuAdvisor?.setStep(index + 1, { sync: true, scroll: true });
      return;
    }
    if (currentMode === "infra") {
      window.AIHardwareInfrastructure?.setWizardStep(index + 1, { sync: true, render: true, scroll: true });
      return;
    }
    if (currentMode !== "finder") return;
    if (index === 0) {
      const panel = document.getElementById("gpuChangePanel");
      const button = document.getElementById("changeGpuButton");
      if (panel?.hidden && button) button.click();
      document.getElementById("gpuPresetTrigger")?.focus();
      document.getElementById("hardwarePanel")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    } else if (index === 1) {
      window.setAppMode?.("simple");
    } else if (index === 2) {
      window.setAppMode?.("expert");
    }
  }

  function render(mode = currentMode, nextIndex = 0) {
    currentMode = ["finder", "modelFinder", "placement", "infra"].includes(mode) ? mode : "finder";
    const target = document.getElementById("workspaceJourney");
    if (!target) return;
    const copy = COPY[language];
    const steps = copy[currentMode];
    const clickable = ["finder", "modelFinder", "infra"].includes(currentMode);
    // The <li> itself must keep its implicit "listitem" role -- axe's `list`
    // rule flags the parent <ol> as broken if role="button" overrides that
    // (a role="button" child no longer counts as a listitem, so the <ol>
    // ends up owning no listitem children). So the button semantics/handler
    // target go on an inner wrapper instead, and the <li> only carries the
    // is-current/is-done/is-clickable *styling* classes.
    target.innerHTML = `
      <strong>${copy.next}</strong>
      <ol>${steps.map((step, index) => {
        const inner = `<b>${index + 1}</b><span>${step}</span>`;
        const body = clickable
          ? `<span class="journey-step-trigger" data-journey-step="${index}" role="button" tabindex="0">${inner}</span>`
          : inner;
        return `<li class="${index === nextIndex ? "is-current" : index < nextIndex ? "is-done" : ""}${clickable ? " is-clickable" : ""}" ${index === nextIndex ? 'aria-current="step"' : ""}>${body}</li>`;
      }).join("")}</ol>`;
  }

  function setStarted(nextStarted, focus = false) {
    started = Boolean(nextStarted);
    const chooser = document.getElementById("coreTaskSwitcher");
    chooser?.classList.toggle("is-collapsed", started);
    document.body.classList.toggle("guided-workspace-started", started);
    if (!started && focus) {
      chooser?.scrollIntoView?.({ behavior: "smooth", block: "start" });
      chooser?.querySelector(".core-task-button")?.focus?.({ preventScroll: true });
    }
  }

  let guideView = "list";
  let wizardNode = "start";

  function guideStepMarkup([heading, detail, mode]) {
    return `<li><button type="button" class="guide-step-button" data-guide-select="${mode}"><b>${heading}</b><span>${detail}</span></button></li>`;
  }

  function renderGuideList() {
    const list = document.querySelector("[data-guide-list-view] ol");
    if (!list) return;
    list.innerHTML = COPY[language].panelSteps.map(guideStepMarkup).join("");
  }

  function renderGuideWizard() {
    const host = document.querySelector("[data-guide-wizard-view]");
    if (!host) return;
    const copy = COPY[language];
    const node = copy.wizard[wizardNode] || copy.wizard.start;
    const backButton = wizardNode !== "start"
      ? `<button type="button" class="ghost-button guide-wizard-back" data-guide-wizard-back>${copy.guideWizardBack}</button>`
      : "";
    host.innerHTML = `
      ${backButton}
      <p class="guide-wizard-question">${node.question}</p>
      <div class="guide-wizard-options">${node.options.map((option) => `<button type="button" class="ghost-button guide-wizard-option" ${option.mode ? `data-guide-select="${option.mode}"` : `data-guide-wizard-next="${option.next}"`}>${option.label}</button>`).join("")}</div>`;
  }

  function applyGuideView() {
    const copy = COPY[language];
    const toggle = document.querySelector("[data-guide-view-toggle]");
    const listView = document.querySelector("[data-guide-list-view]");
    const wizardView = document.querySelector("[data-guide-wizard-view]");
    const isWizard = guideView === "wizard";
    if (listView) listView.hidden = isWizard;
    if (wizardView) wizardView.hidden = !isWizard;
    if (toggle) {
      toggle.textContent = isWizard ? copy.guideViewToggle.wizard : copy.guideViewToggle.list;
      toggle.setAttribute("aria-pressed", String(isWizard));
    }
    if (isWizard) renderGuideWizard();
  }

  function pulseHighlight(el) {
    if (!el) return;
    el.classList.remove("is-guide-highlight");
    // Force a reflow so re-adding the class restarts the highlight animation
    // even if the same element was just highlighted a moment ago.
    void el.offsetWidth;
    el.classList.add("is-guide-highlight");
    el.addEventListener("animationend", () => el.classList.remove("is-guide-highlight"), { once: true });
  }

  function highlightCoreTaskButton(mode) {
    pulseHighlight(document.querySelector(`.core-task-actions [data-core-task="${mode}"]`));
  }

  // Where the guide should point the person after they choose a path — the
  // actual field they need to fill in next, not just the top mode switcher.
  // Inputs on this page are spread across several panels, so a plain mode
  // switch alone can leave someone unsure where to look next.
  function firstInputSelector(mode) {
    if (mode === "finder") return document.getElementById("onboardingScreen")?.hidden ? "#gpuPreset" : "#onboardingQuickpicks";
    if (mode === "modelFinder") return "#advisorModelSearch";
    if (mode === "infra") return "#decisionStudio [data-si-preset]";
    return null;
  }

  function highlightFirstInput(mode) {
    const selector = firstInputSelector(mode);
    const target = selector && document.querySelector(selector);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    pulseHighlight(target);
    // Give the smooth scroll a moment to land before moving focus, so the
    // browser does not jump the page a second time to reveal the focused
    // element.
    window.setTimeout(() => {
      if (typeof target.focus === "function") { try { target.focus({ preventScroll: true }); } catch {} }
    }, 350);
  }

  function selectGuideMode(mode) {
    const button = document.querySelector(`.core-task-actions [data-core-task="${mode}"]`);
    if (!button) return;
    button.click();
    highlightCoreTaskButton(mode);
    toggleGuide(false);
    // Wait for the modal-close/scroll from setCoreTaskMode to settle, then
    // point at the specific field to fill in next.
    window.setTimeout(() => highlightFirstInput(mode), 250);
    wizardNode = "start";
  }

  function setLanguage(nextLanguage) {
    language = nextLanguage === "en" ? "en" : "ko";
    const copy = COPY[language];
    const open = document.querySelector("[data-open-start-guide]");
    const close = document.querySelector("[data-close-start-guide]");
    if (open) open.textContent = copy.guide;
    if (close) close.setAttribute("aria-label", copy.close);
    const panel = document.getElementById("gettingStartedPanel");
    if (panel) {
      const title = panel.querySelector(":scope > div > strong");
      const note = panel.querySelector(":scope > p");
      if (title) title.textContent = copy.panelTitle;
      if (note) note.textContent = copy.panelNote;
      renderGuideList();
      applyGuideView();
    }
    const request = document.querySelector(".catalog-request-center");
    if (request) {
      request.querySelector("summary").textContent = copy.requestSummary;
      request.querySelector(":scope > div").innerHTML = copy.requestSteps.map((step, index) => `<span><b>${index + 1}</b> ${step}</span>`).join("");
      request.querySelector(":scope > p").textContent = copy.requestNote;
      request.querySelectorAll(":scope > nav > a").forEach((link, index) => { link.textContent = copy.requestLinks[index]; });
    }
    render();
  }

  function toggleGuide(force) {
    const panel = document.getElementById("gettingStartedPanel");
    const backdrop = document.getElementById("guideModalBackdrop");
    const trigger = document.querySelector("[data-open-start-guide]");
    if (!panel || !trigger) return;
    const shouldOpen = typeof force === "boolean" ? force : panel.hidden;
    panel.hidden = !shouldOpen;
    if (backdrop) backdrop.hidden = !shouldOpen;
    document.body.classList.toggle("guide-modal-open", shouldOpen);
    trigger.setAttribute("aria-expanded", String(shouldOpen));
    if (shouldOpen) {
      guideView = "list";
      wizardNode = "start";
      applyGuideView();
      panel.querySelector("button")?.focus();
    } else {
      trigger.focus();
    }
  }

  function bind() {
    renderGuideList();
    document.querySelector("[data-open-start-guide]")?.addEventListener("click", () => toggleGuide());
    document.querySelector("[data-close-start-guide]")?.addEventListener("click", () => toggleGuide(false));
    document.getElementById("guideModalBackdrop")?.addEventListener("click", () => toggleGuide(false));
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      const panel = document.getElementById("gettingStartedPanel");
      if (panel && !panel.hidden) toggleGuide(false);
    });
    document.querySelector("[data-guide-view-toggle]")?.addEventListener("click", () => {
      guideView = guideView === "list" ? "wizard" : "list";
      wizardNode = "start";
      applyGuideView();
    });
    document.getElementById("gettingStartedPanel")?.addEventListener("click", (event) => {
      const select = event.target.closest("[data-guide-select]");
      if (select) { selectGuideMode(select.dataset.guideSelect); return; }
      const next = event.target.closest("[data-guide-wizard-next]");
      if (next) { wizardNode = next.dataset.guideWizardNext; renderGuideWizard(); return; }
      if (event.target.closest("[data-guide-wizard-back]")) { wizardNode = "start"; renderGuideWizard(); }
    });
    document.querySelectorAll("[data-core-task], [data-demo-gpu], [data-demo-model], [data-demo-infra]").forEach((control) => {
      control.addEventListener("click", () => setStarted(true));
    });
    // #workspaceJourney's <li>s are rewritten wholesale on every render() call
    // (language switch, step change, mode change), so -- same reasoning as
    // the #apiCostBridge/#apiCostFullTable delegated listeners -- bind one
    // listener on the stable <nav> here rather than re-binding per <li> each
    // render, which would only ever catch the first render's elements.
    const journey = document.getElementById("workspaceJourney");
    journey?.addEventListener("click", (event) => {
      const step = event.target.closest("[data-journey-step]");
      if (step) goToJourneyStep(Number(step.dataset.journeyStep));
    });
    journey?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const step = event.target.closest("[data-journey-step]");
      if (!step) return;
      event.preventDefault();
      goToJourneyStep(Number(step.dataset.journeyStep));
    });
    window.addEventListener("ai-hardware-workspacechange", (event) => {
      render(event.detail?.mode);
      if (event.detail?.previous) setStarted(true);
    });
    document.addEventListener("ai-hardware-languagechange", (event) => setLanguage(event.detail?.language));
    const params = new URL(window.location.href).searchParams;
    setStarted(params.has("gpu") || params.has("scenario") || ["modelFinder", "infra", "placement"].includes(params.get("mode")));
    render(document.body.dataset.workspace || "finder");
    document.querySelectorAll("[data-catalog-request]").forEach((link) => {
      link.href = window.AIHardwareCatalogRequests?.issueUrl(link.dataset.catalogRequest) || "https://github.com/jaeseok614/ai-hardware-fit/issues/new";
    });
    document.querySelectorAll("[data-catalog-status]").forEach((link) => {
      link.href = window.AIHardwareCatalogRequests?.statusUrl(link.dataset.catalogStatus) || "https://github.com/jaeseok614/ai-hardware-fit/issues";
    });
  }

  window.AIHardwareGuide = { bind, render, setLanguage, toggleGuide, setStarted };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind, { once: true });
  else bind();
})();
