/** Privacy-conscious community measurement intake without a backend. */
(() => {
  const ISSUE_URL = "https://github.com/jaeseok614/ai-hardware-fit/issues/new";
  const SAFE_KEYS = new Set([
    "outcome", "status", "model", "modelName", "gpu", "runtime", "workload", "setting",
    "quantization", "precision", "context", "contextTokens", "speed", "tokensPerSecond",
    "docsPerSecond", "pairsPerSecond", "pagesPerSecond", "vramGb", "peakVramGb", "unit",
    "os", "driver", "durationSeconds", "batch", "concurrency",
  ]);
  const SENSITIVE = /(prompt|customer|project|company|email|phone|address|auth.?token|access.?token|secret|password|api.?key|path|file|url)/i;

  function cleanScalar(value) {
    if (typeof value === "number" || typeof value === "boolean") return value;
    return String(value ?? "").replace(/[\r\n\t]+/g, " ").trim().slice(0, 240);
  }

  function sanitize(input = {}) {
    const output = {};
    Object.entries(input).forEach(([key, value]) => {
      if (!SAFE_KEYS.has(key) || SENSITIVE.test(key) || value == null || typeof value === "object") return;
      const cleaned = cleanScalar(value);
      if (cleaned !== "") output[key] = cleaned;
    });
    return output;
  }

  function parseTerminalResult(raw = "") {
    const text = String(raw).trim().slice(0, 20000);
    if (!text) return {};
    try { return sanitize(JSON.parse(text)); } catch {}
    const result = {};
    const patterns = [
      ["tokensPerSecond", /(?:tokens?\/?s|tok\/?s|throughput)\s*[:=]\s*([\d.]+)/i],
      ["peakVramGb", /(?:peak\s*)?(?:vram|gpu memory)\s*[:=]\s*([\d.]+)\s*(?:GB|GiB)/i],
      ["contextTokens", /(?:context|input tokens?)\s*[:=]\s*(\d+)/i],
      ["runtime", /\b(vllm|llama\.cpp|ollama|nim|transformers|mlx|openvino)\b/i],
      ["gpu", /(?:GPU|device)\s*[:=]\s*([^\r\n,;]+)/i],
      ["model", /model\s*[:=]\s*([^\r\n,;]+)/i],
    ];
    patterns.forEach(([key, regex]) => {
      const match = text.match(regex);
      if (match) result[key] = /^\d+(?:\.\d+)?$/.test(match[1]) ? Number(match[1]) : match[1];
    });
    return sanitize(result);
  }

  function feedbackUrl({ outcome, model, gpu, workload, purpose, runtime, setting, requiredGb, estimatedSpeed }) {
    const success = outcome === "success";
    const safe = sanitize({ outcome, model, gpu, workload, runtime, setting, vramGb: requiredGb, speed: estimatedSpeed });
    const title = `[실행 ${success ? "성공" : "실패"}] ${safe.model || "모델"} · ${safe.gpu || "GPU"}`;
    const body = [
      "## 자동 입력 환경", "",
      `- 결과: ${success ? "실행 성공" : "실행 실패"}`,
      `- GPU: ${safe.gpu || "미입력"}`, `- 모델: ${safe.model || "미입력"}`,
      `- 워크로드: ${safe.workload || "미입력"}`, `- 선택 용도: ${cleanScalar(purpose) || "미입력"}`,
      `- 런타임: ${safe.runtime || "미입력"}`, `- 정밀도·설정: ${safe.setting || "미입력"}`,
      `- 계산 VRAM: ${safe.vramGb || "미입력"}`, `- 예상 속도: ${safe.speed || "미입력"}`,
      "", "## 직접 확인한 결과", "", "- 실제 속도:", "- 실제 최대 VRAM:", "- 운영체제·드라이버:",
      `- ${success ? "추가 의견" : "실패 메시지·증상"}:`, "",
      "> 고객명·내부 프로젝트명·프롬프트·토큰·경로 등 민감한 정보는 적지 마세요.",
    ].join("\n");
    return `${ISSUE_URL}?${new URLSearchParams({ title, body, labels: success ? "run-feedback,verified-run" : "run-feedback,needs-review" })}`;
  }

  function measurementIssueUrl(measurement) {
    const safe = sanitize(measurement);
    const lines = Object.entries(safe).map(([key, value]) => `- ${key}: ${value}`);
    const body = ["## 개인정보 제거 미리보기", "", ...lines, "", "> 이 내용은 제출 버튼을 누른 경우에만 GitHub로 전달됩니다."].join("\n");
    return `${ISSUE_URL}?${new URLSearchParams({ title: `[측정 제보] ${safe.model || "모델"} · ${safe.gpu || "GPU"}`, body, labels: "benchmark,run-feedback" })}`;
  }

  function buttons(language = "ko") {
    const en = language === "en";
    return `<div class="run-feedback-actions" aria-label="${en ? "Share an actual run result" : "실제 실행 결과 공유"}"><span>${en ? "Did you try it?" : "직접 실행해 보셨나요?"}</span><a class="ghost-button" data-run-feedback="success" target="_blank" rel="noreferrer">${en ? "It worked" : "실행됐어요"}</a><a class="ghost-button" data-run-feedback="failure" target="_blank" rel="noreferrer">${en ? "It failed" : "실행 안 됐어요"}</a><button type="button" class="ghost-button" data-community-open>${en ? "Paste result JSON" : "결과 JSON 붙여넣기"}</button></div>`;
  }

  function benchmarkRows() { return window.LLM_GPU_CHECKER_DATA?.benchmarks || []; }
  function sameCondition(measurement) {
    const safe = sanitize(measurement);
    return benchmarkRows().filter((row) =>
      (!safe.model && !safe.modelName || [row.model, row.modelName].includes(safe.model || safe.modelName))
      && (!safe.gpu || String(row.gpu || row.gpuId).toLowerCase().includes(String(safe.gpu).toLowerCase()))
      && (!safe.runtime || String(row.runtime || "").toLowerCase().includes(String(safe.runtime).toLowerCase()))
    );
  }

  function contributors() {
    return [...new Set(benchmarkRows().map((row) => row.contributor || (() => {
      try { return new URL(row.sourceUrl).hostname.replace(/^www\./, ""); } catch { return ""; }
    })()).filter(Boolean))].sort();
  }

  function neededCombinations() {
    const data = window.LLM_GPU_CHECKER_DATA || {};
    const gpuIds = window.AIHardwareEvidence?.PRIORITY_GPU_IDS?.slice(0, 10) || [];
    const models = (data.models || []).slice(0, 12).map((model) => model.name);
    const rows = benchmarkRows();
    const combinations = [];
    for (const gpuId of gpuIds) {
      const gpu = (data.gpus || []).find((item) => item.id === gpuId);
      for (const model of models) {
        if (!rows.some((row) => (row.model === model || row.modelName === model) && (row.gpuId === gpuId || String(row.gpu || "").includes(gpu?.name || "__")))) {
          combinations.push({ gpu: gpu?.name || gpuId, model });
        }
        if (combinations.length === 10) return combinations;
      }
    }
    return combinations;
  }

  // Re-applies the panel's static (language-only) copy without touching the
  // textarea the user may be mid-way through typing into, or the sanitized
  // preview/comparison output already computed from it. renderWorkbench()
  // itself only runs once (guarded by the existence check below), so without
  // this the panel would otherwise freeze in whichever language was active
  // at first paint -- the same class of bug fixed earlier for the GPU
  // insights and API cost panels, which this one had been missing.
  function relabelWorkbench() {
    const section = document.getElementById("communityMeasurementPanel");
    if (!section) return;
    const en = document.documentElement.lang === "en";
    const heading = section.querySelector("h2");
    if (heading) heading.textContent = en ? "Contribute an actual run safely" : "실측 결과를 안전하게 제보하세요";
    const intro = section.querySelector("h2 + p");
    if (intro) intro.textContent = en
      ? "Paste JSON or terminal output. Sensitive fields are removed before preview; nothing is sent until you open GitHub."
      : "JSON이나 터미널 결과를 붙여넣으세요. 미리보기 전에 민감 항목을 제거하며 GitHub를 열기 전에는 전송하지 않습니다.";
    const previewButton = section.querySelector("[data-community-preview]");
    if (previewButton) previewButton.textContent = en ? "Remove private fields and preview" : "개인정보 제거 후 미리보기";
    const submitLink = section.querySelector("[data-community-submit]");
    if (submitLink) submitLink.textContent = en ? "Open GitHub submission" : "GitHub 제보 열기";
    // The <pre> output only ever shows either the untouched placeholder
    // sentence or real JSON the user generated -- only relabel it while it's
    // still showing the placeholder, never overwrite a real preview result.
    const output = section.querySelector("[data-community-preview-output]");
    if (output && (output.textContent === "정리된 미리보기가 여기에 표시됩니다." || output.textContent === "The sanitized preview appears here.")) {
      output.textContent = en ? "The sanitized preview appears here." : "정리된 미리보기가 여기에 표시됩니다.";
    }
    const headings = section.querySelectorAll(".community-reference-grid h3");
    if (headings[0]) headings[0].textContent = en ? "Same-condition references" : "같은 조건의 기존 측정값";
    if (headings[1]) headings[1].textContent = en ? "Contributors and public sources" : "반영된 기여자·공개 출처";
    const summary = section.querySelector("details summary");
    if (summary) summary.textContent = en ? "Top 10 measurements needed" : "가장 필요한 실측 조합 10개";
  }

  function renderWorkbench() {
    if (document.getElementById("communityMeasurementPanel")) { relabelWorkbench(); return; }
    const benchmark = document.getElementById("benchmarkSheet");
    if (!benchmark) return;
    const en = document.documentElement.lang === "en";
    const section = document.createElement("section");
    section.id = "communityMeasurementPanel";
    section.className = "community-measurement-panel ui-card";
    section.innerHTML = `
      <div><span class="section-kicker">v7.5 COMMUNITY DATA</span><h2>${en ? "Contribute an actual run safely" : "실측 결과를 안전하게 제보하세요"}</h2><p>${en ? "Paste JSON or terminal output. Sensitive fields are removed before preview; nothing is sent until you open GitHub." : "JSON이나 터미널 결과를 붙여넣으세요. 미리보기 전에 민감 항목을 제거하며 GitHub를 열기 전에는 전송하지 않습니다."}</p></div>
      <textarea data-community-input rows="7" placeholder='{"model":"Qwen3 8B","gpu":"RTX 3060 12GB","runtime":"llama.cpp","tokensPerSecond":42}'></textarea>
      <div class="community-measurement-actions"><button type="button" class="primary-button" data-community-preview>${en ? "Remove private fields and preview" : "개인정보 제거 후 미리보기"}</button><a class="ghost-button" data-community-submit hidden target="_blank" rel="noopener noreferrer">${en ? "Open GitHub submission" : "GitHub 제보 열기"}</a></div>
      <pre data-community-preview-output aria-live="polite">${en ? "The sanitized preview appears here." : "정리된 미리보기가 여기에 표시됩니다."}</pre>
      <div class="community-reference-grid"><article><h3>${en ? "Same-condition references" : "같은 조건의 기존 측정값"}</h3><div data-community-comparison>—</div></article><article><h3>${en ? "Contributors and public sources" : "반영된 기여자·공개 출처"}</h3><p>${contributors().join(" · ") || "—"}</p></article></div>
      <details><summary>${en ? "Top 10 measurements needed" : "가장 필요한 실측 조합 10개"}</summary><ol>${neededCombinations().map((row) => `<li>${row.gpu} · ${row.model}</li>`).join("")}</ol></details>`;
    benchmark.insertAdjacentElement("afterend", section);
    const input = section.querySelector("[data-community-input]");
    const output = section.querySelector("[data-community-preview-output]");
    const submit = section.querySelector("[data-community-submit]");
    const comparison = section.querySelector("[data-community-comparison]");
    section.querySelector("[data-community-preview]").addEventListener("click", () => {
      const safe = parseTerminalResult(input.value);
      output.textContent = JSON.stringify(safe, null, 2);
      const matches = sameCondition(safe);
      comparison.textContent = matches.length
        ? matches.slice(0, 5).map((row) => `${row.modelName || row.model} · ${row.gpu || row.gpuId} · ${row.tokensPerSecond || row.docsPerSecond || row.pagesPerSecond || "—"}`).join("\n")
        : (en ? "No measurement with the same model, GPU, and runtime yet." : "같은 모델·GPU·런타임 측정값이 아직 없습니다.");
      submit.href = measurementIssueUrl(safe);
      submit.hidden = Object.keys(safe).length === 0;
    });
    document.addEventListener("click", (event) => {
      const opener = event.target.closest("[data-community-open]");
      if (!opener) return;
      // 이 패널은 community 모드가 아니면 CSS로 숨겨져 있으므로(styles.css의
      // body.community-task-active 참고), 스크롤하기 전에 먼저 모드를 전환한다.
      window.AIHardwareCore?.setCoreTaskMode?.("community");
      // 모델 상세에서 "이 실행 결과 제보"로 들어온 경우, 지금 보고 있던
      // 모델·GPU·런타임을 텍스트영역에 미리 채워 넣는다 — 비어 있는
      // 예시(Qwen3 8B 등)만 보이는 것보다 지금 조건과 연결돼 있다는 게
      // 바로 보이게 하기 위함. 사용자가 이미 뭔가 입력해 둔 상태라면
      // 덮어쓰지 않는다.
      if (!input.value.trim() && (opener.dataset.communityModel || opener.dataset.communityGpu)) {
        const lines = ["{"];
        if (opener.dataset.communityModel) lines.push(`  "model": ${JSON.stringify(opener.dataset.communityModel)},`);
        if (opener.dataset.communityGpu) lines.push(`  "gpu": ${JSON.stringify(opener.dataset.communityGpu)},`);
        if (opener.dataset.communityRuntime) lines.push(`  "runtime": ${JSON.stringify(opener.dataset.communityRuntime)},`);
        lines.push(`  "tokensPerSecond": `);
        lines.push("}");
        input.value = lines.join("\n");
      }
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      input.focus({ preventScroll: true });
    });
  }

  document.addEventListener("DOMContentLoaded", renderWorkbench);
  window.AIHardwareCommunityFeedback = {
    buttons, feedbackUrl, sanitize, parseTerminalResult, measurementIssueUrl,
    sameCondition, contributors, neededCombinations, renderWorkbench, relabelWorkbench,
  };
})();
