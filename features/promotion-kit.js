(() => {
  const REPO = "https://github.com/jaeseok614/ai-hardware-fit";
  const COPY = {
    ko: { feedback: "써보고 불편한 점 보내기" },
    en: { feedback: "Send workflow feedback" },
  };

  function feedbackUrl() {
    const params = new URLSearchParams({
      template: "product-feedback.yml",
      title: "[Workflow feedback] ",
    });
    return `${REPO}/issues/new?${params}`;
  }

  function render(locale = document.documentElement.lang) {
    const language = String(locale).startsWith("en") ? "en" : "ko";
    const copy = COPY[language];
    const feedback = document.querySelector("[data-showcase-feedback]");
    if (!feedback) return;
    feedback.textContent = copy.feedback;
    feedback.href = feedbackUrl();
  }

  function bind() {
    queueMicrotask(() => render());
    document.addEventListener("ai-hardware-languagechange", (event) => render(event.detail?.language));
  }

  window.AIHardwarePromotion = { bind, render, feedbackUrl };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind, { once: true });
  else bind();
})();
