// Editable text-inference planning baselines, not measured service capacity.
const ADVISOR_USE_PROFILES = {
  personal: { ko: "개인용 채팅·코딩", en: "Personal chat / coding", context: 4096, concurrency: 1, minSpeed: 20 },
  documents: { ko: "개인용 긴 문서·RAG", en: "Personal long documents / RAG", context: 16384, concurrency: 1, minSpeed: 15 },
  shared: { ko: "소규모 공유·실험", en: "Small shared deployment", context: 8192, concurrency: 4, minSpeed: 10 },
};
const ADVISOR_USE_URL = { advisorUse: "advisorUseProfile", advisorCtx: "advisorUseContext", advisorConcurrent: "advisorUseConcurrency", advisorQuant: "advisorUseQuant", advisorMinSpeed: "advisorUseMinSpeed" };

function ensureAdvisorUseProfiles(panel) {
  const box = document.createElement("fieldset");
  box.className = "advisor-use-profile";
  box.innerHTML = `<legend id="advisorUseLegend"></legend><div class="advisor-detail-grid">
    <label class="field"><span id="advisorUseLabel"></span><select id="advisorUseProfile"><option value="personal"></option><option value="documents"></option><option value="shared"></option><option value="custom"></option></select></label>
    <label class="field"><span id="advisorContextLabel"></span><input id="advisorUseContext" type="number" min="512" max="1048576" step="512" value="4096"></label>
    <label class="field"><span id="advisorConcurrencyLabel"></span><input id="advisorUseConcurrency" type="number" min="1" max="256" step="1" value="1"></label>
    <label class="field"><span id="advisorQuantLabel"></span><select id="advisorUseQuant"></select></label>
    <label class="field"><span id="advisorMinSpeedLabel"></span><input id="advisorUseMinSpeed" type="number" min="0" max="100000" step="1" value="20"></label>
  </div><p id="advisorUseNote"></p>`;
  panel.querySelector('[data-advisor-step-panel="2"]').prepend(box);
  $("advisorUseQuant").innerHTML = QUANTS.map((q) => `<option value="${escapeAttr(q.id)}">${escapeHtml(q.label)}</option>`).join("");
  $("advisorUseQuant").value = "q4";
  $("advisorUseProfile").addEventListener("change", () => {
    const profile = ADVISOR_USE_PROFILES[$("advisorUseProfile").value];
    if (profile) {
      $("advisorUseContext").value = profile.context;
      $("advisorUseConcurrency").value = profile.concurrency;
      $("advisorUseMinSpeed").value = profile.minSpeed;
      $("advisorUseQuant").value = "q4";
    }
    renderGpuAdvisor(); syncUrlState();
  });
  ["advisorUseContext", "advisorUseConcurrency", "advisorUseQuant", "advisorUseMinSpeed"].forEach((id) => {
    $(id).addEventListener("change", () => { $("advisorUseProfile").value = "custom"; renderGpuAdvisor(); syncUrlState(); });
  });
}

function advisorUseSettings(model) {
  const requestedContext = clampNumber($("advisorUseContext")?.value, 512, 1048576, 4096);
  return { requestedContext, context: Math.min(requestedContext, Math.max(512, Number(model?.context || 0) * 1024 || requestedContext)), concurrency: clampNumber($("advisorUseConcurrency")?.value, 1, 256, 1), quant: $("advisorUseQuant")?.value || "q4", minSpeed: clampNumber($("advisorUseMinSpeed")?.value, 0, 100000, 20) };
}

function renderAdvisorUseProfiles(model, en) {
  const enabled = Boolean(model && getAdvisorModelCategory(model) === "llm");
  const labels = { advisorUseLegend: en ? "Local LLM planning baseline" : "로컬 LLM 추천 기준", advisorUseLabel: en ? "Usage preset" : "사용 목적 기본값", advisorContextLabel: en ? "Context tokens" : "컨텍스트 토큰", advisorConcurrencyLabel: en ? "Simultaneous requests" : "동시 요청 수", advisorQuantLabel: en ? "Weight quantization" : "가중치 양자화" };
  Object.entries(labels).forEach(([id, text]) => { $(id).textContent = text; });
  $("advisorMinSpeedLabel").textContent = en ? "Target per-request speed (tok/s; 0 = any)" : "요청별 목표 속도 (tok/s, 0은 제한 없음)";
  [...$("advisorUseProfile").options].forEach((option) => { option.textContent = ADVISOR_USE_PROFILES[option.value]?.[en ? "en" : "ko"] || (en ? "Custom" : "직접 설정"); });
  $("advisorUseQuant").querySelector('[value="auto"]').textContent = en ? "Auto · may differ by hardware" : "자동 · 장비별 설정 다를 수 있음";
  Object.values(ADVISOR_USE_URL).forEach((id) => { $(id).disabled = !enabled; });
  const s = advisorUseSettings(model);
  $("advisorUseNote").textContent = enabled
    ? (en ? `Applied: ${s.context.toLocaleString()} context tokens, ${s.concurrency} simultaneous request(s), FP16 KV cache, 512 output tokens, llama.cpp, 2GB memory reserve. Text inference only; RAG embedding/index costs are separate. Speeds are per-request estimates, not measured service capacity. ` : `적용 기준: 실제 컨텍스트 ${s.context.toLocaleString()}토큰 · 동시 요청 ${s.concurrency}개 · FP16 KV 캐시 · 출력 512토큰 · llama.cpp · 메모리 여유 2GB. 텍스트 추론 기준이며 RAG 임베딩·색인 비용은 별도입니다. 속도는 요청 1개당 추정값이며 실측 서비스 용량이 아닙니다. `)
      + (s.context < s.requestedContext ? (en ? "Capped at the model's context limit; choose a longer-context model if needed." : "모델의 컨텍스트 한도로 제한했습니다. 더 긴 입력이 필요하면 장문 지원 모델을 선택하세요.") : "")
    : (en ? "These presets apply only to text LLMs. Other workloads retain their workload-specific settings." : "이 기본값은 텍스트 LLM에만 적용됩니다. 다른 작업은 기존 작업별 설정으로 계산합니다.");
  let summary = $("advisorUseResultSummary");
  if (!summary) {
    summary = document.createElement("p"); summary.id = "advisorUseResultSummary";
    $("gpuAdvisorPanel").querySelector('[data-advisor-step-panel="3"]').prepend(summary);
  }
  summary.textContent = $("advisorUseNote").textContent;
  if (enabled) summary.textContent += en ? ` Target: ${s.minSpeed} tok/s per request; an editable planning preference, not a universal usability threshold.` : ` 요청별 목표 ${s.minSpeed} tok/s는 수정 가능한 계획 기준이지 보편적인 사용성 기준은 아닙니다.`;
}

function advisorHardwareForPreset(preset, model) {
  const hardware = buildHardwareForPreset(preset);
  if (getAdvisorModelCategory(model) !== "llm") return hardware;
  return { ...hardware, ...advisorUseSettings(model), outputTokens: 512, kvPrecision: "fp16", kvMeta: KV_PRECISION_META.fp16, runtime: "llamacpp", reservedVram: 0, safetyMarginGb: 2, availableVram: Math.max(0, hardware.vram - 2) };
}

function estimateAdvisorModel(model, hardware) {
  return getAdvisorModelCategory(model) === "llm"
    ? normalizeGenerativeEstimate(estimateModel(model, advisorUseSettings(model).quant, hardware))
    : estimateAnyModelForHardware(model, hardware);
}

function syncAdvisorUseUrl(params, mode) {
  Object.entries(ADVISOR_USE_URL).forEach(([key, id]) => { if (mode === "modelFinder" && $(id)) params.set(key, $(id).value); else params.delete(key); });
}

function restoreAdvisorUseUrl(params) {
  setSelectIfValid("advisorUseProfile", params.get("advisorUse"));
  setValueIfPresent("advisorUseContext", params.get("advisorCtx"));
  setValueIfPresent("advisorUseConcurrency", params.get("advisorConcurrent"));
  setSelectIfValid("advisorUseQuant", params.get("advisorQuant"));
  setValueIfPresent("advisorUseMinSpeed", params.get("advisorMinSpeed"));
  if (!params.has("advisorUse") && (params.has("ctx") || params.has("quant") || params.has("con"))) {
    $("advisorUseProfile").value = "custom";
    $("advisorUseContext").value = $("contextSize").value;
    $("advisorUseConcurrency").value = $("concurrency").value;
    setSelectIfValid("advisorUseQuant", $("quantization").value);
    $("advisorUseMinSpeed").value = "0";
  }
}
