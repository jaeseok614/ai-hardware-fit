// Estimation engine — pure VRAM/throughput/quality calculation functions.
// Extracted from app.js (2026-08) to keep app.js focused on UI wiring.
// Loaded as a plain global script alongside app.js (no bundler/ES modules,
// matching the rest of features/*.js) — relies on top-level consts defined
// in app.js (DATA, GENERATIVE_MODELS, QUANTS, etc.), which are already set
// by the time any of these functions actually run (post-DOMContentLoaded).

function getHardware() {
  const vram = clampNumber($("vramGb").value, 2, 640, 24);
  const primaryCount = clampNumber($("gpuCount").value, 1, 16, 1);
  const ram = clampNumber($("ramGb").value, 8, 2048, 64);
  const bandwidth = clampNumber($("bandwidth").value, 100, 12000, 1008);
  const powerLimitW = clampNumber($("powerLimitW")?.value, 20, 600, 115);
  const reservedVram = clampNumber($("reservedVramGb").value, 0, 10240, 0);
  const safetyMarginGb = clampNumber($("safetyMarginGb").value, 0, 256, 2);
  const context = clampNumber($("contextSize").value, 512, 1048576, 8192);
  const concurrency = clampNumber($("concurrency").value, 1, 256, 1);
  const outputTokens = clampNumber($("outputTokens").value, 16, 65536, 512);
  const kvPrecision = $("kvPrecision").value;
  const kvMeta = KV_PRECISION_META[kvPrecision] || KV_PRECISION_META.fp16;
  const runtime = $("runtimeMode").value;
  const preset = GPU_PRESETS.find((gpu) => gpu.id === $("gpuPreset").value) || GPU_PRESETS[0];
  const secondaryPreset = GPU_PRESETS.find((gpu) => gpu.id === $("secondaryGpuPreset").value) || null;
  const secondaryCount = secondaryPreset ? clampNumber($("secondaryGpuCount").value, 1, 16, 1) : 0;
  const count = primaryCount + secondaryCount;
  const heterogeneous = Boolean(secondaryPreset && secondaryPreset.id !== preset?.id);
  const crossVendor = Boolean(secondaryPreset && gpuRuntimeFamily(secondaryPreset) !== gpuRuntimeFamily(preset));

  const compute = estimateHardwareCompute(preset, bandwidth, powerLimitW);
  const secondaryCompute = secondaryPreset ? estimateHardwareCompute(secondaryPreset, secondaryPreset.bandwidth) : null;
  const computeTotal = Object.fromEntries(
    ["fp32Tflops", "fp16Tflops", "bf16Tflops", "int8Tops"].map((key) => [
      key,
      compute[key] * primaryCount + (secondaryCompute?.[key] || 0) * secondaryCount,
    ]),
  );
  const totalVram = vram * primaryCount + (secondaryPreset?.vram || 0) * secondaryCount;
  const shardingEfficiency = count > 1 ? (heterogeneous ? 0.88 : 0.92) : 1;
  const baseEffectiveVram = totalVram * shardingEfficiency;
  const availableVram = Math.max(0, baseEffectiveVram - reservedVram - safetyMarginGb);
  const aggregateBandwidth = bandwidth * primaryCount + (secondaryPreset?.bandwidth || 0) * secondaryCount;

  return {
    vram,
    primaryCount,
    secondaryCount,
    count,
    ram,
    bandwidth,
    powerLimitW,
    reservedVram,
    safetyMarginGb,
    totalVram,
    baseEffectiveVram,
    availableVram,
    context,
    concurrency,
    outputTokens,
    kvPrecision,
    kvMeta,
    runtime,
    preset,
    secondaryPreset,
    heterogeneous,
    crossVendor,
    shardingEfficiency,
    aggregateBandwidth,
    compute,
    computeTotal,
  };
}

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function estimateHardwareCompute(preset, bandwidth, powerLimitW = preset?.tgpReferenceW || preset?.tgpMaxW) {
  if (preset?.fp16Tflops || preset?.bf16Tflops || preset?.int8Tops) {
    const fixed = {
      fp32Tflops: preset.fp32Tflops || Math.max(4, preset.fp16Tflops * 0.5),
      fp16Tflops: preset.fp16Tflops || Math.max(8, bandwidth * 0.12),
      bf16Tflops: preset.bf16Tflops || preset.fp16Tflops || Math.max(8, bandwidth * 0.1),
      int8Tops: preset.int8Tops || Math.max(16, bandwidth * 0.24),
    };
    return applyTgpComputeScale(fixed, preset, powerLimitW);
  }

  const name = `${preset?.id || ""} ${preset?.name || ""}`.toLowerCase();
  let tensorFactor = 0.14;
  if (name.includes("b200") || name.includes("b100")) tensorFactor = 0.55;
  else if (name.includes("h200") || name.includes("h100")) tensorFactor = 0.42;
  else if (name.includes("a100")) tensorFactor = 0.2;
  else if (name.includes("rtx 50") || name.includes("blackwell")) tensorFactor = 0.22;
  else if (name.includes("rtx 40") || name.includes("ada")) tensorFactor = 0.17;
  else if (name.includes("rtx 30")) tensorFactor = 0.12;
  else if (name.includes("t4") || name.includes("v100")) tensorFactor = 0.09;
  else if (name.includes("mi3") || name.includes("mi2")) tensorFactor = 0.22;
  else if (name.includes("apple")) tensorFactor = 0.07;

  const fp16Tflops = Math.max(6, bandwidth * tensorFactor);
  return applyTgpComputeScale({
    fp32Tflops: fp16Tflops * 0.5,
    fp16Tflops,
    bf16Tflops: fp16Tflops * 0.92,
    int8Tops: fp16Tflops * 2,
  }, preset, powerLimitW);
}

function applyTgpComputeScale(compute, preset, powerLimitW) {
  if (preset?.formFactor !== "laptop" || !preset.tgpReferenceW) return compute;
  const bounded = clampNumber(powerLimitW, preset.tgpMinW || 20, preset.tgpMaxW || 600, preset.tgpReferenceW);
  const scale = Math.max(0.45, Math.min(1.12, Math.pow(bounded / preset.tgpReferenceW, 0.72)));
  return Object.fromEntries(Object.entries(compute).map(([key, value]) => [key, value * scale]));
}

function getActiveModels() {
  return MODEL_GROUPS[activeWorkload] || GENERATIVE_MODELS;
}

function getAllModels() {
  return Object.values(MODEL_GROUPS).flat();
}

function isVisionWorkload(workload) {
  return VISION_WORKLOADS.has(workload);
}

function isVisionModel(model) {
  return VISION_MODEL_TYPES.has(model.type);
}

function getWorkloadSettings() {
  if (activeWorkload === "embedding") {
    return {
      type: "embedding",
      inputTokens: clampNumber($("embeddingInputTokens").value, 1, 32768, 384),
      batchSize: clampNumber($("embeddingBatchSize").value, 1, 1024, 32),
      precisionId: $("encoderPrecision").value,
      runtime: $("encoderRuntime").value,
      maxBatchTokens: clampNumber($("embeddingBatchTokens").value, 512, 1048576, 16384),
    };
  }

  if (activeWorkload === "reranker") {
    return {
      type: "reranker",
      queryTokens: clampNumber($("rerankerQueryTokens").value, 1, 8192, 64),
      docTokens: clampNumber($("rerankerDocTokens").value, 1, 32768, 512),
      candidates: clampNumber($("rerankerCandidates").value, 1, 10000, 40),
      batchSize: clampNumber($("rerankerBatchSize").value, 1, 1024, 16),
      precisionId: $("rerankerPrecision").value,
      runtime: $("rerankerRuntime").value,
    };
  }

  if (isVisionWorkload(activeWorkload)) {
    return {
      type: activeWorkload,
      resolutionPreset: $("ocrResolutionPreset").value,
      width: clampNumber($("ocrWidth").value, 320, 10000, 1654),
      height: clampNumber($("ocrHeight").value, 320, 14000, 2339),
      batchSize: clampNumber($("ocrBatchSize").value, 1, 256, 1),
      precisionId: $("ocrPrecision").value,
      featureSet: $("ocrFeatureSet").value,
      steps: clampNumber($("mediaSteps")?.value, 1, 150, 28),
      frames: clampNumber($("mediaFrames")?.value, 1, 241, 81),
      fps: clampNumber($("mediaFps")?.value, 1, 60, 16),
      loraCount: clampNumber($("mediaLoraCount")?.value, 0, 8, 0),
      offload: $("mediaOffload")?.value || "none",
      optimization: $("mediaOptimization")?.value || "standard",
    };
  }

  return {
    type: "generative",
    context: getHardware().context,
    concurrency: getHardware().concurrency,
    outputTokens: getHardware().outputTokens,
    kvPrecision: getHardware().kvPrecision,
    runtime: getHardware().runtime,
    quantization: $("quantization").value,
  };
}

function estimateModel(model, quantId, hardware) {
  const fallbackQuant = QUANTS.find((item) => item.id === "q4") || QUANTS.find((item) => item.id !== "auto");
  const quant = quantId === "auto"
    ? recommendQuant(model, hardware)
    : QUANTS.find((item) => item.id === quantId) || fallbackQuant;
  const runtimeFactor = getRuntimeFactor(hardware.runtime);
  const weightsGb = model.params * quant.bytesPerB * 1.08;
  const contextLimitTokens = model.context * 1024;
  const contextSupported = hardware.context <= contextLimitTokens;
  const kvGb = estimateKvCacheGb(model, hardware);
  const runtimeOverheadGb = runtimeFactor.base
    + Math.min(runtimeFactor.cap, weightsGb * runtimeFactor.weightRatio)
    + Math.max(0, hardware.concurrency - 1) * runtimeFactor.requestOverhead;
  const requiredGb = weightsGb + kvGb + runtimeOverheadGb;
  const effectiveVram = getEffectiveVram(hardware);
  const pressure = getVramPressure(requiredGb, effectiveVram);
  const ramAssist = hardware.ram * 0.45;
  const offloadRoom = effectiveVram + ramAssist;
  const grade = contextSupported ? gradeFromPressure(pressure, requiredGb, offloadRoom) : "F";
  const speedStats = estimateSpeed(model, quant, hardware, grade);
  const latencySeconds = speedStats.perRequest > 0 ? hardware.outputTokens / speedStats.perRequest : 0;
  const firstTokenSeconds = estimateFirstTokenSeconds(model, hardware, grade);
  const reason = buildReason(grade, requiredGb, effectiveVram, model, hardware, contextLimitTokens, contextSupported);

  return {
    model,
    quant,
    weightsGb,
    kvGb,
    runtimeOverheadGb,
    requiredGb,
    effectiveVram,
    pressure,
    grade,
    speed: speedStats.perRequest,
    throughput: speedStats.total,
    latencySeconds,
    firstTokenSeconds,
    contextLimitTokens,
    contextSupported,
    reason,
  };
}

function getRuntimeFactor(runtime) {
  if (runtime === "vllm") return { base: 2.6, cap: 5.5, weightRatio: 0.1, requestOverhead: 0.12, concurrencyEfficiency: 0.78 };
  if (runtime === "transformers") return { base: 2.2, cap: 4.5, weightRatio: 0.09, requestOverhead: 0.18, concurrencyEfficiency: 0.38 };
  // MLX (Apple-only, mlx-lm / mlx-community models): published cross-benchmark
  // data (local-llm.net, M4 Max 64GB / M3 Pro 36GB, llama.cpp Q4_K_M vs MLX
  // 4-bit, checked 2026-08) shows MLX uses roughly 5-10% less total memory for
  // the same quant tier (e.g. Llama 3.1 8B: 5.2GB vs 4.8GB; Qwen2.5 14B: 9.1GB
  // vs 8.5GB) — modeled here as a leaner runtime overhead than llama.cpp
  // rather than changing weightsGb itself, since weightsGb is tied to the
  // user-selected quant tier. concurrencyEfficiency is left conservative
  // (below llama.cpp's) since MLX's concurrent-serving story (mlx_lm.server)
  // is newer and less benchmarked than llama.cpp's for multi-request loads.
  if (runtime === "mlx") return { base: 1.0, cap: 2.5, weightRatio: 0.05, requestOverhead: 0.08, concurrencyEfficiency: 0.5 };
  return { base: 1.2, cap: 3.0, weightRatio: 0.06, requestOverhead: 0.08, concurrencyEfficiency: 0.55 };
}

// MLX speed advantage vs llama.cpp/Metal, tiered by active-parameter count.
// Calibrated from local-llm.net's llama.cpp-vs-MLX benchmark table (M4 Max
// 64GB + M3 Pro 36GB, checked 2026-08): observed gains were ~3-8% for 3-8B
// dense models, ~14-25% for 12-14B dense models. We deliberately use
// conservative, rounded-down tiers rather than the high end of the observed
// range, and cap the bonus for large (17B+) models since the same source's
// FAQ notes the gap narrows for bigger, bandwidth-bound models — the 70B
// case in that table is dominated by MLX avoiding an OOM outright (a fit/grade
// question already handled elsewhere), not a pure speed multiplier, so it is
// intentionally NOT used to inflate this tier.
function mlxSpeedBonus(model) {
  const activeParams = model.active || model.params || 0;
  if (activeParams <= 4) return 1.05;
  if (activeParams <= 8) return 1.08;
  if (activeParams <= 16) return 1.15;
  return 1.12;
}

function estimateKvCacheGb(model, hardware) {
  const contextMultiplier = hardware.context / 4096;
  const concurrencyMultiplier = hardware.concurrency;
  return model.active * 0.09 * contextMultiplier * concurrencyMultiplier * hardware.kvMeta.factor;
}

function recommendQuant(model, hardware) {
  const preferredIds = ["q6", "q5", "q5_k_s", "q5_0", "q4", "q4_k_s", "q4_0", "q3", "q3_k_s", "q2", "iq2_xxs"];
  const qualityFirst = preferredIds
    .map((id) => QUANTS.find((item) => item.id === id))
    .filter(Boolean);
  const effectiveVram = getEffectiveVram(hardware);

  for (const quant of qualityFirst) {
    const provisional = estimateWithQuant(model, quant, hardware);
    if (provisional.requiredGb <= effectiveVram * 0.85) return quant;
  }

  for (const quant of qualityFirst) {
    const provisional = estimateWithQuant(model, quant, hardware);
    if (provisional.requiredGb <= effectiveVram) return quant;
  }

  for (const quant of qualityFirst) {
    const provisional = estimateWithQuant(model, quant, hardware);
    if (provisional.requiredGb <= effectiveVram + hardware.ram * 0.45) return quant;
  }

  return qualityFirst[qualityFirst.length - 1] || QUANTS.find((item) => item.id === "q2");
}

function estimateWithQuant(model, quant, hardware) {
  const runtimeFactor = getRuntimeFactor(hardware.runtime);
  const weightsGb = model.params * quant.bytesPerB * 1.08;
  const kvGb = estimateKvCacheGb(model, hardware);
  const runtimeOverheadGb = runtimeFactor.base
    + Math.min(runtimeFactor.cap, weightsGb * runtimeFactor.weightRatio)
    + Math.max(0, hardware.concurrency - 1) * runtimeFactor.requestOverhead;
  return { requiredGb: weightsGb + kvGb + runtimeOverheadGb };
}

function estimateAnyModel(model, hardware) {
  let estimate;
  if (model.type === "embedding") estimate = estimateEncoderModel(model, hardware, getWorkloadSettings());
  else if (model.type === "reranker") estimate = estimateRerankerModel(model, hardware, getWorkloadSettings());
  else if (model.type === "audio-stt" || model.type === "audio-tts") estimate = estimateAudioModel(model, hardware);
  else if (isVisionModel(model)) estimate = estimateOcrModel(model, hardware, getWorkloadSettings());
  else estimate = normalizeGenerativeEstimate(estimateModel(model, $("quantization").value, hardware));
  return applyMeasuredCalibration(estimate, hardware);
}

function estimateAudioModel(model, hardware) {
  const weightsGb = model.params * 2 * 1.08;
  const runtimeOverheadGb = 1.1 + model.params * 0.35;
  const activationGb = Math.max(0.35, model.params * 0.7);
  const requiredGb = weightsGb + runtimeOverheadGb + activationGb;
  const effectiveVram = getEffectiveVram(hardware);
  const pressure = getVramPressure(requiredGb, effectiveVram);
  const grade = gradeFromPressure(pressure, requiredGb, effectiveVram + hardware.ram * 0.35);
  const computeScale = Math.sqrt(Math.max(0.05, hardware.computeTotal.fp16Tflops / 82));
  const bandwidthScale = Math.sqrt(Math.max(0.05, hardware.aggregateBandwidth / 504));
  const fitScale = grade === "F" ? 0 : grade === "D" ? 0.25 : grade === "C" ? 0.65 : 1;
  const speedUnverified = model.speedStatus === "unverified";
  const speed = speedUnverified ? 0 : model.realtimeBase * computeScale * bandwidthScale * fitScale;
  return {
    model,
    precision: { id: "fp16", label: "FP16" },
    weightsGb,
    runtimeOverheadGb,
    activationGb,
    requiredGb,
    effectiveVram,
    pressure,
    grade,
    speed,
    throughput: speed,
    latencySeconds: speed ? 1 / speed : 0,
    firstTokenSeconds: speed ? 0.2 / speed : 0,
    contextLimitTokens: 0,
    contextSupported: true,
    settingLabel: "FP16 · GPU",
    speedLabel: speedUnverified
      ? (uiLanguage === "en" ? "Speed not calibrated" : "속도 보정 근거 미확인")
      : `${speed.toFixed(speed >= 10 ? 0 : 1)}× realtime`,
    speedUnverified,
    limitLabel: speedUnverified
      ? (uiLanguage === "en" ? "Check model/runtime limits" : "모델·런타임별 한도 확인")
      : model.type === "audio-stt" ? "60 min audio" : "streaming",
    unitLabel: "x realtime",
    reason: grade === "F"
      ? (uiLanguage === "en" ? "The model exceeds available GPU and system memory." : "모델이 사용 가능한 GPU·시스템 메모리를 초과합니다.")
      : speedUnverified
        ? (uiLanguage === "en" ? "VRAM estimate only. A comparable single-stream speed baseline has not been verified; streaming latency and batched throughput are different metrics." : "VRAM만 추정합니다. 비교 가능한 단일 스트림 속도 기준은 미확인이며 스트리밍 지연·배치 처리량과 다른 지표입니다.")
        : (uiLanguage === "en" ? "Estimated real-time factor for one audio stream." : "오디오 1개 스트림 기준 예상 실시간 배속입니다."),
  };
}

function applyMeasuredCalibration(estimate, hardware) {
  const calibration = getMeasuredCalibration(estimate.model, estimate, hardware);
  if (!calibration || !estimate.speed) return { ...estimate, calibration: null };
  const speed = estimate.speed * calibration.factor;
  const throughputRatio = estimate.speed > 0 ? speed / estimate.speed : 1;
  const latencySeconds = estimate.latencySeconds ? estimate.latencySeconds / throughputRatio : estimate.latencySeconds;
  const unitLabel = estimate.unitLabel || "tok/s";
  return {
    ...estimate,
    speed,
    throughput: estimate.throughput ? estimate.throughput * throughputRatio : speed,
    latencySeconds,
    speedLabel: formatThroughput(speed, unitLabel),
    calibration,
  };
}

function getMeasuredCalibration(model, estimate, hardware) {
  const rows = getGpuBenchmarkRows(hardware.preset)
    .filter((row) => benchmarkEvidenceType(row) !== "external")
    .filter((row) => row.modelName === model.name || row.modelKey === modelKey(model));
  const ratios = [];
  for (const row of rows) {
    const measured = getBenchmarkNumericValue(row);
    if (!measured || measured.unit !== (estimate.unitLabel || "tok/s")) continue;
    const preset = GPU_PRESETS.find((gpu) => gpu.id === row.gpuId) || hardware.preset;
    const raw = estimateBenchmarkRow(model, row, preset);
    if (!raw?.speed) continue;
    ratios.push(measured.value / raw.speed);
  }
  if (!ratios.length) return null;
  ratios.sort((a, b) => a - b);
  const median = medianValue(ratios);
  const deviations = ratios.map((value) => Math.abs(value - median)).sort((a, b) => a - b);
  const mad = medianValue(deviations);
  return {
    factor: Math.max(0.35, Math.min(2.5, median)),
    sampleCount: ratios.length,
    relativeMad: median ? mad / median : 0,
  };
}

function medianValue(values) {
  if (!values.length) return 0;
  const middle = Math.floor(values.length / 2);
  return values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2;
}

function normalizeGenerativeEstimate(estimate) {
  return {
    ...estimate,
    settingLabel: estimate.quant.label,
    speedLabel: formatSpeed(estimate.speed),
    limitLabel: formatContext(estimate.contextLimitTokens),
    unitLabel: "tok/s",
    latencyLabel: formatDuration(estimate.latencySeconds),
  };
}

function estimateEncoderModel(model, hardware, workload, precisionId = workload.precisionId) {
  const precision = resolvePrecision(
    model,
    precisionId,
    ENCODER_PRECISIONS,
    (candidate) => estimateEncoderWithPrecision(model, hardware, workload, candidate),
  );
  return estimateEncoderWithPrecision(model, hardware, workload, precision);
}

function estimateEncoderWithPrecision(model, hardware, workload, precision) {
  const runtime = ENCODER_RUNTIME_PROFILES[workload.runtime] || ENCODER_RUNTIME_PROFILES.tei;
  const effectiveVram = getEffectiveVram(hardware);
  const inputTokens = Math.min(workload.inputTokens, model.maxTokens);
  const microBatch = Math.max(1, Math.min(workload.batchSize, Math.floor(workload.maxBatchTokens / Math.max(1, inputTokens))));
  const microBatches = Math.ceil(workload.batchSize / microBatch);
  const weightsGb = model.params * precision.bytesPerParam * 1.08;
  const tokenStateGb = microBatch * inputTokens * model.hiddenSize * precision.activationBytes / 1e9;
  const activationGb = tokenStateGb * runtime.hiddenFactor;
  const attentionGb = model.supportsFlashAttention
    ? tokenStateGb * runtime.attentionFactor
    : microBatch * model.attentionHeads * inputTokens * inputTokens * precision.activationBytes * runtime.attentionFactor / 1e9;
  const outputGb = microBatch * model.embeddingDim * 4 / 1e9;
  const runtimeOverheadGb = runtime.baseOverheadGb + Math.max(0, microBatch - 1) * runtime.batchOverheadGb;
  const requiredGb = weightsGb + activationGb + attentionGb + outputGb + runtimeOverheadGb;
  const pressure = getVramPressure(requiredGb, effectiveVram);
  const grade = workload.inputTokens <= model.maxTokens
    ? gradeFromPressure(pressure, requiredGb, effectiveVram + hardware.ram * 0.35)
    : "F";
  const speed = estimateEncoderThroughput(model, hardware, runtime, precision, inputTokens, microBatch, weightsGb, activationGb, attentionGb, grade);
  const batchLatencySeconds = speed.batchSeconds * microBatches;
  const reason = buildEncoderReason(model, workload, grade, requiredGb, effectiveVram, microBatch);

  return {
    model,
    precision,
    runtime,
    weightsGb,
    activationGb,
    attentionGb,
    outputGb,
    runtimeOverheadGb,
    requiredGb,
    effectiveVram,
    pressure,
    grade,
    speed: speed.docsPerSecond,
    throughput: speed.tokensPerSecond,
    batchLatencySeconds,
    firstTokenSeconds: batchLatencySeconds,
    contextLimitTokens: model.maxTokens,
    contextSupported: workload.inputTokens <= model.maxTokens,
    settingLabel: `${precision.label} · ${runtime.shortLabel || runtime.label}`,
    speedLabel: `${formatThroughput(speed.docsPerSecond, "doc/s")} · ${formatThroughput(speed.tokensPerSecond, "tok/s")}`,
    limitLabel: formatContext(model.maxTokens),
    unitLabel: "doc/s",
    reason,
    microBatch,
    microBatches,
    inputTokens,
  };
}

function estimateRerankerModel(model, hardware, workload, precisionId = workload.precisionId) {
  const precision = resolvePrecision(
    model,
    precisionId,
    ENCODER_PRECISIONS,
    (candidate) => estimateRerankerWithPrecision(model, hardware, workload, candidate),
  );
  return estimateRerankerWithPrecision(model, hardware, workload, precision);
}

function estimateRerankerWithPrecision(model, hardware, workload, precision) {
  const runtime = ENCODER_RUNTIME_PROFILES[workload.runtime] || ENCODER_RUNTIME_PROFILES.tei;
  const effectiveVram = getEffectiveVram(hardware);
  const pairTokens = workload.queryTokens + workload.docTokens + 3;
  const batchSize = workload.batchSize;
  const weightsGb = model.params * precision.bytesPerParam * 1.08;
  const tokenStateGb = batchSize * Math.min(pairTokens, model.maxTokens) * model.hiddenSize * precision.activationBytes / 1e9;
  const activationGb = tokenStateGb * (runtime.hiddenFactor + 1.2);
  const attentionGb = model.supportsFlashAttention
    ? tokenStateGb * runtime.attentionFactor
    : batchSize * model.attentionHeads * pairTokens * pairTokens * precision.activationBytes * runtime.attentionFactor / 1e9;
  const scoreBufferGb = batchSize * 4 / 1e9;
  const runtimeOverheadGb = runtime.baseOverheadGb + Math.max(0, batchSize - 1) * runtime.batchOverheadGb;
  const requiredGb = weightsGb + activationGb + attentionGb + scoreBufferGb + runtimeOverheadGb;
  const pressure = getVramPressure(requiredGb, effectiveVram);
  const contextSupported = pairTokens <= model.maxTokens;
  const grade = contextSupported ? gradeFromPressure(pressure, requiredGb, effectiveVram + hardware.ram * 0.35) : "F";
  const speed = estimateEncoderThroughput(model, hardware, runtime, precision, Math.min(pairTokens, model.maxTokens), batchSize, weightsGb, activationGb, attentionGb, grade);
  const rerankPasses = Math.ceil(workload.candidates / batchSize);
  const queryLatencySeconds = speed.batchSeconds * rerankPasses;
  const pairsPerSecond = speed.docsPerSecond;
  const reason = buildRerankerReason(model, workload, grade, requiredGb, effectiveVram, pairTokens);

  return {
    model,
    precision,
    runtime,
    weightsGb,
    activationGb,
    attentionGb,
    outputGb: scoreBufferGb,
    runtimeOverheadGb,
    requiredGb,
    effectiveVram,
    pressure,
    grade,
    speed: pairsPerSecond,
    throughput: pairsPerSecond * pairTokens,
    batchLatencySeconds: speed.batchSeconds,
    latencySeconds: queryLatencySeconds,
    firstTokenSeconds: queryLatencySeconds,
    contextLimitTokens: model.maxTokens,
    contextSupported,
    settingLabel: `${precision.label} · ${runtime.shortLabel || runtime.label}`,
    speedLabel: `${formatThroughput(pairsPerSecond, "pair/s")} · 질의 ${formatDuration(queryLatencySeconds)}`,
    limitLabel: formatContext(model.recommendedTokens || model.maxTokens),
    unitLabel: "pair/s",
    reason,
    pairTokens,
    rerankPasses,
  };
}

function estimateEncoderThroughput(model, hardware, runtime, precision, tokens, batchSize, weightsGb, activationGb, attentionGb, grade) {
  if (grade === "F") return { docsPerSecond: 0, tokensPerSecond: 0, batchSeconds: 0 };

  const multiGpuPenalty = hardware.count > 1 ? (hardware.heterogeneous ? 0.72 : 0.82) : 1;
  const computeTflops = Math.max(1, hardware.computeTotal[precision.computeKey] || hardware.computeTotal.fp16Tflops) * multiGpuPenalty * precision.speedFactor;
  const flops = model.layers * (
    24 * batchSize * tokens * model.hiddenSize * model.hiddenSize
    + 4 * batchSize * tokens * tokens * model.hiddenSize
  );
  const computeSeconds = flops / (computeTflops * 1e12 * runtime.computeEfficiency);
  const bytesRead = Math.max(0.05, weightsGb + activationGb + attentionGb) * 1e9;
  const memorySeconds = bytesRead / (hardware.aggregateBandwidth * 1e9 * runtime.bandwidthEfficiency * multiGpuPenalty);
  const pressurePenalty = grade === "D" ? 3.8 : grade === "C" ? 1.7 : 1;
  const batchSeconds = (Math.max(computeSeconds, memorySeconds) + runtime.fixedLatencyMs / 1000) * pressurePenalty;
  const docsPerSecond = batchSeconds > 0 ? batchSize / batchSeconds : 0;
  const tokensPerSecond = docsPerSecond * tokens;

  return { docsPerSecond, tokensPerSecond, batchSeconds };
}

function estimateOcrModel(model, hardware, workload, precisionId = workload.precisionId) {
  if (model.type === "image-generation" || model.type === "video-generation" || model.type === "avatar-generation") {
    return estimateMediaModel(model, hardware, workload, precisionId);
  }
  const precision = resolvePrecision(
    model,
    precisionId,
    OCR_PRECISIONS,
    (candidate) => estimateOcrWithPrecision(model, hardware, workload, candidate),
  );
  return estimateOcrWithPrecision(model, hardware, workload, precision);
}

function estimateVisionWithPrecision(model, hardware, workload, precision) {
  return model.type === "image-generation" || model.type === "video-generation" || model.type === "avatar-generation"
    ? estimateMediaWithPrecision(model, hardware, workload, precision)
    : estimateOcrWithPrecision(model, hardware, workload, precision);
}

function estimateMediaModel(model, hardware, workload, precisionId = workload.precisionId) {
  const precision = resolvePrecision(
    model,
    precisionId,
    OCR_PRECISIONS,
    (candidate) => estimateMediaWithPrecision(model, hardware, workload, candidate),
  );
  return estimateMediaWithPrecision(model, hardware, workload, precision);
}

function estimateMediaWithPrecision(model, hardware, workload, precision) {
  const isVideo = model.type === "video-generation" || model.type === "avatar-generation";
  const megapixels = (workload.width * workload.height) / 1e6;
  const frames = isVideo ? workload.frames || 81 : 1;
  const steps = workload.steps || 28;
  const batchSize = workload.batchSize || 1;
  const profile = model.profiles?.[precision.id] || model.profiles?.fp16 || {};
  const effectiveVram = getEffectiveVram(hardware);
  const offloadFactor = workload.offload === "sequential" ? 0.58 : workload.offload === "tiled" ? 0.78 : 1;
  const weightsGb = model.params * precision.bytesPerParam * 1.08 * offloadFactor;
  const textEncoderGb = (model.textEncoderGb || Math.min(5.2, 0.5 + model.params * 0.22)) * offloadFactor;
  const vaeGb = (model.vaeGb || (isVideo ? 1.8 : 0.8)) * (workload.offload === "tiled" ? 0.55 : 1);
  const spatialActivationGb = batchSize * megapixels * (profile.activationGbPerMegapixel || 2.5);
  const temporalActivationGb = isVideo
    ? spatialActivationGb * Math.max(1, Math.sqrt(frames / 16)) * (model.temporalFactor || 1.25)
    : 0;
  const loraMemoryGb = (workload.loraCount || 0) * Math.max(0.18, model.params * 0.035);
  const runtimeOverheadGb = (profile.baseRuntimeGb || 2.5) + Math.max(0, batchSize - 1) * (profile.batchOverheadGb || 0.8);
  const activationGb = (spatialActivationGb + temporalActivationGb) * offloadFactor;
  const optimizationMemoryScale = workload.optimization === "attention" || workload.optimization === "combined" ? 0.82 : 1;
  const optimizedActivationGb = activationGb * optimizationMemoryScale;
  const requiredGb = weightsGb + textEncoderGb + vaeGb + optimizedActivationGb + loraMemoryGb + runtimeOverheadGb;
  const pressure = getVramPressure(requiredGb, effectiveVram);
  const grade = gradeFromPressure(pressure, requiredGb, effectiveVram + hardware.ram * (workload.offload === "none" ? 0.25 : 0.55));

  const reference = model.reference || {};
  const referenceRate = reference.pagesPerSecond || (isVideo ? 0.005 : 0.1);
  const referencePixels = Math.max(0.2, ((reference.width || 1024) * (reference.height || 1024)) / 1e6);
  const computeScale = Math.sqrt(Math.max(0.05, hardware.computeTotal.fp16Tflops / 170));
  const bandwidthScale = Math.sqrt(Math.max(0.05, hardware.aggregateBandwidth / (reference.bandwidth || 1008)));
  const resolutionScale = Math.pow(referencePixels / Math.max(0.2, megapixels), 0.9);
  const stepScale = model.type === "avatar-generation" ? 1 : 28 / Math.max(1, steps);
  const frameScale = isVideo ? 81 / Math.max(1, frames) : 1;
  const fitScale = grade === "F" ? 0 : grade === "D" ? 0.14 : grade === "C" ? 0.48 : 1;
  const offloadSpeedScale = workload.offload === "sequential" ? 0.28 : workload.offload === "tiled" ? 0.7 : 1;
  const optimizationSpeedScale = workload.optimization === "combined" ? 1.72 : workload.optimization === "cache" ? 1.45 : workload.optimization === "attention" ? 1.18 : 1;
  const speed = referenceRate * computeScale * bandwidthScale * resolutionScale * stepScale * frameScale * fitScale * offloadSpeedScale * optimizationSpeedScale;
  const latencySeconds = speed > 0 ? 1 / speed : 0;
  const unitLabel = isVideo ? "clip/s" : "image/s";
  const durationNote = isVideo
    ? `${formatDuration(latencySeconds)} / ${(frames / Math.max(1, workload.fps || 16)).toFixed(1)}s clip`
    : `${formatDuration(latencySeconds)} / image`;

  return {
    model,
    precision,
    weightsGb,
    textEncoderGb,
    vaeGb,
    activationGb: optimizedActivationGb,
    temporalActivationGb,
    loraMemoryGb,
    runtimeOverheadGb,
    requiredGb,
    effectiveVram,
    pressure,
    grade,
    speed,
    throughput: speed,
    latencySeconds,
    firstTokenSeconds: latencySeconds,
    contextLimitTokens: 0,
    contextSupported: true,
    settingLabel: `${precision.label} · ${workload.offload === "none" ? "GPU" : workload.offload}`,
    speedLabel: `${formatThroughput(speed, unitLabel)} · ${durationNote}`,
    limitLabel: isVideo ? `${workload.width}×${workload.height} · ${frames}f` : `${workload.width}×${workload.height}`,
    unitLabel,
    reason: buildMediaReason(model, workload, grade, requiredGb, effectiveVram),
    megapixels,
    frames,
    fps: workload.fps,
    steps,
  };
}

function buildMediaReason(model, workload, grade, requiredGb, effectiveVram) {
  const en = uiLanguage === "en";
  const kind = model.type === "avatar-generation"
    ? (en ? "avatar" : "아바타")
    : model.type === "video-generation" ? (en ? "video" : "비디오") : (en ? "image" : "이미지");
  if (grade === "F") return en
    ? `${kind} generation needs about ${formatGb(requiredGb)}, above the available ${formatGb(effectiveVram)} even with the selected memory strategy.`
    : `${kind} 생성에 약 ${formatGb(requiredGb)}가 필요해 선택한 메모리 전략에서도 가용 ${formatGb(effectiveVram)}를 초과합니다.`;
  if (grade === "D") return en
    ? "CPU offload is required and generation time can increase substantially."
    : "CPU 오프로딩이 필요하며 생성 시간이 크게 늘어날 수 있습니다.";
  if (grade === "C") return en
    ? "VRAM headroom is tight; reduce resolution, frames, steps, batch size, or LoRA count."
    : "VRAM 여유가 작습니다. 해상도·프레임·스텝·배치·LoRA 수를 줄이는 편이 안정적입니다.";
  return en
    ? `Runnable at ${workload.width}×${workload.height}${["video-generation", "avatar-generation"].includes(model.type) ? `, ${workload.frames} frames` : `, ${workload.steps} steps`}.`
    : `${workload.width}×${workload.height}${["video-generation", "avatar-generation"].includes(model.type) ? `, ${workload.frames}프레임` : `, ${workload.steps}스텝`} 기준 실행 가능한 범위입니다.`;
}

function estimateOcrWithPrecision(model, hardware, workload, precision) {
  const effectiveVram = getEffectiveVram(hardware);
  const megapixels = (workload.width * workload.height) / 1e6;
  const profile = model.profiles?.[precision.id] || model.profiles?.fp16 || {};
  const isImageGenerator = model.type === "image-generation";
  const isVideoGenerator = model.type === "video-generation";
  const frameMemoryFactor = isVideoGenerator ? Math.max(1, Math.sqrt(workload.frames || 81) / 3) : 1;
  const loraMemoryGb = (workload.loraCount || 0) * Math.max(0.2, model.params * 0.035);
  const offloadMemoryFactor = workload.offload === "sequential" ? 0.62 : workload.offload === "tiled" ? 0.78 : 1;
  const featureMultiplier = getOcrFeatureMultiplier(workload.featureSet, model);
  const imageBufferGb = workload.batchSize * workload.width * workload.height * 3 * precision.activationBytes * 2 / 1e9;
  let weightsGb = 0;
  let kvGb = 0;

  if (model.type !== "ocr-pipeline") {
    weightsGb = model.params * precision.bytesPerParam * 1.08;
    const imageTokens = estimateImageTokens(model, workload.width, workload.height);
    const totalTokens = imageTokens + 64 + Math.min(2048, model.maxOutputTokens || 1024);
    kvGb = 2 * model.decoderLayers * workload.batchSize * totalTokens * model.kvHeads * model.headDim * precision.activationBytes / 1e9;
  } else {
    weightsGb = (profile.residentWeightsGb || model.params * precision.bytesPerParam * 1.08) * featureMultiplier;
  }

  const activationGb = workload.batchSize * megapixels * (profile.activationGbPerMegapixel || 0.2) * featureMultiplier * frameMemoryFactor * offloadMemoryFactor;
  const runtimeOverheadGb = (profile.baseRuntimeGb || 0.8) * featureMultiplier
    + Math.max(0, workload.batchSize - 1) * (profile.batchOverheadGb || 0.06);
  const requiredGb = weightsGb * offloadMemoryFactor + kvGb + activationGb + imageBufferGb + runtimeOverheadGb + loraMemoryGb;
  const pressure = getVramPressure(requiredGb, effectiveVram);
  const grade = gradeFromPressure(pressure, requiredGb, effectiveVram + hardware.ram * 0.3);
  let pagesPerSecond = estimateOcrThroughput(model, hardware, workload, precision, megapixels, grade, featureMultiplier);
  if (isImageGenerator || isVideoGenerator) {
    const stepPenalty = Math.max(0.08, 28 / Math.max(1, workload.steps || 28));
    const framePenalty = isVideoGenerator ? Math.max(0.03, 81 / Math.max(1, workload.frames || 81)) : 1;
    const offloadPenalty = workload.offload === "sequential" ? 0.32 : workload.offload === "tiled" ? 0.72 : 1;
    pagesPerSecond *= stepPenalty * framePenalty * offloadPenalty;
  }
  const secondsPerPage = pagesPerSecond > 0 ? 1 / pagesPerSecond : 0;
  const reason = buildOcrReason(model, workload, grade, requiredGb, effectiveVram, megapixels);
  const outputUnit = isImageGenerator ? "image/s" : isVideoGenerator ? "clip/s" : "page/s";
  const durationUnit = isImageGenerator ? "image" : isVideoGenerator ? "clip" : "page";
  const settingSuffix = isImageGenerator || isVideoGenerator ? "Diffusers" : ocrFeatureLabel(workload.featureSet);

  return {
    model,
    precision,
    weightsGb,
    kvGb,
    activationGb,
    imageBufferGb,
    runtimeOverheadGb,
    requiredGb,
    effectiveVram,
    pressure,
    grade,
    speed: pagesPerSecond,
    throughput: pagesPerSecond,
    latencySeconds: secondsPerPage,
    firstTokenSeconds: secondsPerPage,
    contextLimitTokens: model.maxImageTokens || 0,
    contextSupported: true,
    settingLabel: `${precision.label} · ${settingSuffix}`,
    speedLabel: `${formatThroughput(pagesPerSecond, outputUnit)} · ${formatDuration(secondsPerPage)}/${durationUnit}`,
    limitLabel: `${formatMegapixels(megapixels)}`,
    unitLabel: outputUnit,
    reason,
    megapixels,
    frames: workload.frames,
    fps: workload.fps,
    steps: workload.steps,
    loraMemoryGb,
  };
}

function estimateOcrThroughput(model, hardware, workload, precision, megapixels, grade, featureMultiplier) {
  if (grade === "F") return 0;

  const reference = model.reference || {};
  const referenceBandwidth = reference.bandwidth || 1008;
  const referenceMegapixels = reference.width && reference.height ? reference.width * reference.height / 1e6 : 3.87;
  const referenceBatch = reference.batch || 1;
  const basePps = reference.pagesPerSecond || 1;
  const multiGpuPenalty = hardware.count > 1 ? (hardware.heterogeneous ? 0.72 : 0.82) : 1;
  const hardwareScale = Math.sqrt((hardware.aggregateBandwidth * multiGpuPenalty) / referenceBandwidth);
  const resolutionScale = Math.pow(referenceMegapixels / Math.max(0.2, megapixels), 0.85);
  const batchScale = referenceBatch > 1
    ? Math.log2(workload.batchSize + 1) / Math.log2(referenceBatch + 1)
    : 1 + Math.log2(workload.batchSize) * 0.32;
  const precisionScale = precision.speedFactor || 1;
  const fitPenalty = grade === "D" ? 0.2 : grade === "C" ? 0.55 : 1;
  return Math.max(0, basePps * hardwareScale * resolutionScale * Math.max(0.12, batchScale) * precisionScale * fitPenalty / featureMultiplier);
}

function resolvePrecision(model, precisionId, precisionOptions, estimateForPrecision) {
  const supported = precisionOptions.filter((precision) => precision.id !== "auto" && model.precisions.includes(precision.id));
  if (precisionId !== "auto") {
    return supported.find((precision) => precision.id === precisionId) || supported[0] || precisionOptions[1];
  }

  const priority = ["fp16", "bf16", "int8", "int4", "fp32"];
  const prioritized = priority
    .map((id) => supported.find((precision) => precision.id === id))
    .filter(Boolean);

  for (const candidate of prioritized) {
    const estimate = estimateForPrecision(candidate);
    if (GRADE_META[estimate.grade].score >= GRADE_META.B.score) return candidate;
  }

  for (const candidate of prioritized) {
    const estimate = estimateForPrecision(candidate);
    if (estimate.grade !== "F") return candidate;
  }

  for (const id of priority) {
    const candidate = supported.find((precision) => precision.id === id);
    if (candidate) return candidate;
  }
  const fallbackOrder = ["int4", "int8", "fp16", "bf16", "fp32"];
  return fallbackOrder.map((id) => supported.find((precision) => precision.id === id)).find(Boolean)
    || supported[0]
    || precisionOptions[1];
}

function getEffectiveVram(hardware) {
  if (Number.isFinite(hardware.availableVram)) return hardware.availableVram;
  return hardware.baseEffectiveVram || hardware.vram * hardware.count * (hardware.count > 1 ? 0.92 : 1);
}

function getVramPressure(requiredGb, effectiveVram) {
  return requiredGb / Math.max(0.1, effectiveVram);
}

function getOcrFeatureMultiplier(featureSet, model) {
  const supportsLayout = model.tags?.includes("layout");
  const supportsTable = model.tags?.includes("table") || model.tags?.includes("math");
  if (featureSet === "full") return supportsLayout || supportsTable ? 1.75 : 1.2;
  if (featureSet === "table") return supportsTable ? 1.45 : 1.15;
  if (featureSet === "layout") return supportsLayout ? 1.25 : 1.08;
  return 1;
}

function estimateImageTokens(model, width, height) {
  const patchSize = model.patchSize || 16;
  const mergeSize = model.mergeSize || 1;
  const rawTokens = Math.ceil(width / patchSize) * Math.ceil(height / patchSize) / (mergeSize * mergeSize);
  return Math.min(model.maxImageTokens || rawTokens, rawTokens);
}

function buildEncoderReason(model, workload, grade, requiredGb, effectiveVram, microBatch) {
  const en = uiLanguage === "en";
  if (workload.inputTokens > model.maxTokens) {
    return en
      ? `The selected ${formatContext(workload.inputTokens)} input length exceeds the model's ${formatContext(model.maxTokens)} limit.`
      : `선택한 ${formatContext(workload.inputTokens)} 입력 길이가 모델 한도 ${formatContext(model.maxTokens)}를 초과합니다.`;
  }
  if (microBatch < workload.batchSize) {
    return en
      ? `Based on TEI-style max batch tokens, ${workload.batchSize} requests were split into micro-batches of ${microBatch}.`
      : `TEI식 최대 배치 토큰 기준으로 ${workload.batchSize}개 요청을 ${microBatch}개 micro-batch로 나누어 계산했습니다.`;
  }
  if (grade === "F") return en
    ? `Peak VRAM of ${formatGb(requiredGb)} exceeds the available VRAM (${formatGb(effectiveVram)}) plus RAM-assist range.`
    : `Peak VRAM ${formatGb(requiredGb)}가 가용 VRAM ${formatGb(effectiveVram)}와 RAM 보조 범위를 초과합니다.`;
  if (grade === "D") return en
    ? "This is beyond GPU-only processing and needs RAM/CPU assistance or a smaller batch."
    : "GPU 단독 처리보다 RAM/CPU 보조나 배치 축소가 필요한 범위입니다.";
  if (grade === "C") return en
    ? "Lowering the batch size or input length a bit would give more stable embedding throughput."
    : "배치 또는 입력 길이를 조금 낮추면 더 안정적인 임베딩 처리량을 기대할 수 있습니다.";
  return en
    ? `An embedding workload that fits in GPU memory at ${workload.inputTokens} tokens, batch ${workload.batchSize}.`
    : `${workload.inputTokens} 토큰, 배치 ${workload.batchSize} 기준으로 GPU 메모리 안에 들어오는 임베딩 워크로드입니다.`;
}

function buildRerankerReason(model, workload, grade, requiredGb, effectiveVram, pairTokens) {
  const en = uiLanguage === "en";
  if (pairTokens > model.maxTokens) {
    return en
      ? `The query+document input of ${formatContext(pairTokens)} exceeds the model's ${formatContext(model.maxTokens)} limit.`
      : `질의+문서 ${formatContext(pairTokens)} 입력이 모델 한도 ${formatContext(model.maxTokens)}를 초과합니다.`;
  }
  if (pairTokens > (model.recommendedTokens || model.maxTokens)) {
    return en
      ? `Within the model limit, but longer than the recommended input of ${formatContext(model.recommendedTokens || model.maxTokens)} — latency may increase.`
      : `모델 한도 안에는 들어가지만 권장 입력 ${formatContext(model.recommendedTokens || model.maxTokens)}보다 길어 지연시간이 커질 수 있습니다.`;
  }
  if (grade === "F") return en
    ? `Reranker peak VRAM of ${formatGb(requiredGb)} greatly exceeds the available VRAM (${formatGb(effectiveVram)}).`
    : `리랭커 peak VRAM ${formatGb(requiredGb)}가 가용 VRAM ${formatGb(effectiveVram)}를 크게 초과합니다.`;
  if (grade === "D") return en
    ? `Processing ${workload.candidates} candidates needs a smaller batch or CPU/RAM assistance.`
    : `후보 ${workload.candidates}개를 처리하려면 배치 축소나 CPU/RAM 보조를 고려해야 합니다.`;
  return en
    ? `${workload.candidates} candidates split into batches of ${workload.batchSize}, run over ${Math.ceil(workload.candidates / workload.batchSize)} inference passes.`
    : `후보 ${workload.candidates}개를 배치 ${workload.batchSize}로 나누어 ${Math.ceil(workload.candidates / workload.batchSize)}회 추론하는 기준입니다.`;
}

function buildOcrReason(model, workload, grade, requiredGb, effectiveVram, megapixels) {
  const en = uiLanguage === "en";
  if (grade === "F") return en
    ? `Peak VRAM of ${formatGb(requiredGb)} for a ${formatMegapixels(megapixels)} image exceeds the available VRAM (${formatGb(effectiveVram)}) plus RAM-assist range.`
    : `${formatMegapixels(megapixels)} 이미지의 peak VRAM ${formatGb(requiredGb)}가 가용 VRAM ${formatGb(effectiveVram)}와 RAM 보조 범위를 초과합니다.`;
  if (grade === "D") return en
    ? "An OCR workload that needs CPU/RAM assistance or a smaller batch page count rather than GPU-only processing."
    : "GPU 단독 처리보다 CPU/RAM 보조 또는 배치 페이지 축소가 필요한 OCR 워크로드입니다.";
  if (grade === "C") return en
    ? "Image resolution or batch size leaves little VRAM headroom. Lowering DPI or batch pages would be more stable."
    : "이미지 해상도나 배치가 높아 VRAM 여유가 작습니다. DPI 또는 배치 페이지를 낮추는 편이 안정적입니다.";
  return en
    ? `A runnable OCR workload at ${formatMegapixels(megapixels)}, batch ${workload.batchSize} pages.`
    : `${formatMegapixels(megapixels)}, 배치 ${workload.batchSize}페이지 기준으로 실행 가능한 OCR 워크로드입니다.`;
}

function gradeFromPressure(pressure, requiredGb, offloadRoom) {
  if (pressure <= 0.7) return "S";
  if (pressure <= 0.85) return "A";
  if (pressure <= 1) return "B";
  if (pressure <= 1.12) return "C";
  if (requiredGb <= offloadRoom) return "D";
  return "F";
}

function estimateSpeed(model, quant, hardware, grade) {
  if (grade === "F") return { perRequest: 0, total: 0 };

  const multiGpuPenalty = hardware.count > 1 ? (hardware.heterogeneous ? 0.64 : 0.76) : 1;
  const runtimePenalty = hardware.runtime === "vllm" ? 1.1
    : hardware.runtime === "transformers" ? 0.78
      : hardware.runtime === "mlx" ? mlxSpeedBonus(model)
        : 1;
  const offloadPenalty = grade === "D" ? 0.22 : grade === "C" ? 0.55 : 1;
  const runtimeFactor = getRuntimeFactor(hardware.runtime);
  const activeBytes = Math.max(model.active * quant.bytesPerB, 1);
  const raw = (hardware.aggregateBandwidth * multiGpuPenalty * runtimePenalty) / (activeBytes * 4);
  const total = raw * (1 + (hardware.concurrency - 1) * runtimeFactor.concurrencyEfficiency) * offloadPenalty;

  return {
    perRequest: total / hardware.concurrency,
    total,
  };
}

function estimateFirstTokenSeconds(model, hardware, grade) {
  if (grade === "F") return 0;

  const runtimeMultiplier = hardware.runtime === "vllm" ? 0.85 : hardware.runtime === "transformers" ? 1.2 : 1;
  const pressureMultiplier = grade === "D" ? 2.4 : grade === "C" ? 1.6 : 1;
  const contextSeconds = (hardware.context / 8192) * 0.08;
  const modelSeconds = Math.min(5, model.active * 0.025);
  const concurrencySeconds = Math.max(0, hardware.concurrency - 1) * 0.025;
  return (0.18 + modelSeconds + contextSeconds + concurrencySeconds) * runtimeMultiplier * pressureMultiplier;
}

function computeConcurrencyBounds(model, quant, hardware, effectiveVramOverride) {
  // requiredGb(N) = A + N * B for N >= 1 (KV cache와 요청당 오버헤드가 선형이라는 전제 하의 역산)
  const runtimeFactor = getRuntimeFactor(hardware.runtime);
  const weightsGb = model.params * quant.bytesPerB * 1.08;
  const contextMultiplier = hardware.context / 4096;
  const kvPerUnit = model.active * 0.09 * contextMultiplier * hardware.kvMeta.factor;
  const fixedOverhead = runtimeFactor.base + Math.min(runtimeFactor.cap, weightsGb * runtimeFactor.weightRatio);
  const requestOverhead = runtimeFactor.requestOverhead;
  const a = weightsGb + fixedOverhead - requestOverhead;
  const b = kvPerUnit + requestOverhead;
  const effectiveVram = effectiveVramOverride ?? getEffectiveVram(hardware);

  const solveN = (pressureThreshold) => {
    if (b <= 0) return 256;
    const n = Math.floor((effectiveVram * pressureThreshold - a) / b);
    return Math.max(0, Math.min(256, n));
  };

  const recommendedN = solveN(0.85);
  const maxN = solveN(1);

  const speedAt = (n) => {
    if (n <= 0) return { perRequest: 0, total: 0 };
    return estimateSpeed(model, quant, { ...hardware, concurrency: n }, "B");
  };

  return {
    recommendedN,
    maxN,
    speedAtRecommended: speedAt(recommendedN),
    speedAtMax: speedAt(maxN),
  };
}

function estimateConcurrencyCapacity(model, quant, hardware) {
  return computeConcurrencyBounds(model, quant, hardware);
}

function renderConcurrencySection(model, quant, hardware) {
  const capacity = estimateConcurrencyCapacity(model, quant, hardware);
  const title = uiLanguage === "en" ? "Concurrency capacity (beta)" : "동시 처리 용량 (베타)";

  if (capacity.maxN <= 0) {
    const note = uiLanguage === "en"
      ? `With the current settings (${quant.label} · ${formatContext(hardware.context)}), this GPU's VRAM alone can't comfortably handle even 1 concurrent user. Try a lower quantization or a shorter context length.`
      : `현재 설정(${quant.label} · ${formatContext(hardware.context)})에서는 이 GPU VRAM 단독으로 1명도 여유 있게 처리하기 어렵습니다. 양자화를 낮추거나 컨텍스트 길이를 줄여보세요.`;
    return `
      <section class="detail-section">
        <h3>${escapeHtml(title)}</h3>
        <p class="detail-note">${escapeHtml(note)}</p>
      </section>
    `;
  }

  const perUser = (speed) => uiLanguage === "en" ? `About ${formatSpeed(speed)} per user` : `1인당 약 ${formatSpeed(speed)}`;
  const footnote = uiLanguage === "en"
    ? "A theoretical estimate based only on KV cache and remaining VRAM. Real-world concurrent throughput can vary widely with the serving framework's continuous-batching efficiency (vLLM, TGI, etc.), request-length distribution, and scheduling policy — use this as a reference only."
    : "KV cache와 VRAM 여유만 반영한 이론치입니다. 실제 동시접속 처리량은 vLLM·TGI 등 서빙 프레임워크의 연속 배칭 효율, 요청 길이 분포, 스케줄링 정책에 따라 크게 달라질 수 있으니 참고용으로만 사용하세요.";

  return `
    <section class="detail-section">
      <h3>${escapeHtml(title)}</h3>
      <div class="detail-summary-grid">
        ${renderDetailMetric(
          uiLanguage === "en" ? "Recommended concurrency" : "권장 동시 인원",
          uiLanguage === "en" ? pluralize(capacity.recommendedN, "user", "users") : `${capacity.recommendedN}명`,
          uiLanguage === "en" ? "Keeps VRAM headroom (within grade A)" : "VRAM 여유 있게(등급 A 이내)",
        )}
        ${renderDetailMetric(
          uiLanguage === "en" ? "Theoretical max users" : "이론적 최대 인원",
          uiLanguage === "en" ? pluralize(capacity.maxN, "user", "users") : `${capacity.maxN}명`,
          uiLanguage === "en" ? "GPU VRAM ceiling (grade B edge)" : "GPU VRAM 한계치(등급 B 경계)",
        )}
        ${renderDetailMetric(
          uiLanguage === "en" ? "Throughput at recommended concurrency" : "권장 인원 기준 처리량",
          formatThroughput(capacity.speedAtRecommended.total, "tok/s"),
          perUser(capacity.speedAtRecommended.perRequest),
        )}
        ${renderDetailMetric(
          uiLanguage === "en" ? "Throughput at max concurrency" : "최대 인원 기준 처리량",
          formatThroughput(capacity.speedAtMax.total, "tok/s"),
          perUser(capacity.speedAtMax.perRequest),
        )}
      </div>
      <p class="detail-note">${escapeHtml(footnote)}</p>
    </section>
  `;
}

function buildReason(grade, requiredGb, effectiveVram, model, hardware, contextLimitTokens, contextSupported) {
  const en = uiLanguage === "en";
  if (!contextSupported) {
    return en
      ? `The selected ${formatContext(hardware.context)} context exceeds the model's ${formatContext(contextLimitTokens)} limit.`
      : `선택한 ${formatContext(hardware.context)} 컨텍스트가 모델 한도 ${formatContext(contextLimitTokens)}를 초과합니다.`;
  }
  if (grade === "F") {
    return en
      ? `At ${hardware.concurrency} concurrent, the estimated required VRAM of ${formatGb(requiredGb)} greatly exceeds the available VRAM of ${formatGb(effectiveVram)}.`
      : `동시 ${hardware.concurrency}명 기준 필요 VRAM 추정치가 ${formatGb(requiredGb)}로 가용 VRAM ${formatGb(effectiveVram)}를 크게 초과합니다.`;
  }
  if (grade === "D") {
    return en
      ? `At ${hardware.concurrency} concurrent, this GPU alone can't hold the model — RAM offloading is required.`
      : `동시 ${hardware.concurrency}명 기준 GPU 단독 적재는 어렵고 RAM 오프로딩 전제가 필요합니다.`;
  }
  if (grade === "C") {
    return en
      ? "This nearly fills the available VRAM. It's more stable to lower concurrent requests, context length, or KV cache precision."
      : "가용 VRAM에 거의 맞습니다. 동시 요청, 컨텍스트 길이, KV cache 정밀도를 낮추는 편이 안정적입니다.";
  }
  if (model.params >= 60 && hardware.count === 1) {
    return en
      ? `A large model, but it's within the runnable range for the selected quantization on the available VRAM of ${formatGb(effectiveVram)} (after reservations/margin).`
      : `대형 모델이지만 예약/여유분 제외 가용 VRAM ${formatGb(effectiveVram)}에서 선택 양자화 기준 실행 가능 범위입니다.`;
  }
  return en
    ? `On the selected GPU, this ${model.params}B-class model is within the runnable range at ${formatContext(hardware.context)} and ${hardware.concurrency} concurrent.`
    : `선택한 GPU에서 ${model.params}B급 모델을 ${formatContext(hardware.context)}, 동시 ${hardware.concurrency}명 기준으로 실행 가능한 범위입니다.`;
}

function getFilteredEstimates() {
  const hardware = getHardware();
  const task = $("taskFilter").value;
  const provider = $("providerFilter").value;
  const license = $("licenseFilter").value;
  const licenseUse = $("licenseUseFilter").value;
  const gradeChoice = $("gradeFilter").value;
  const search = $("searchInput").value.trim().toLowerCase();
  const summaryFilter = SUMMARY_FILTERS.find((item) => item.id === activeSummaryFilter) || SUMMARY_FILTERS[0];

  let estimates = getActiveModels().map((model) => estimateAnyModel(model, hardware));

  if (summaryFilter.id !== "all") {
    estimates = estimates.filter((estimate) => summaryFilter.grades.includes(estimate.grade));
  }

  if (task !== "all") {
    estimates = estimates.filter((estimate) => estimate.model.tags.includes(task));
  }

  if (provider !== "all") {
    estimates = estimates.filter((estimate) => estimate.model.maker === provider);
  }

  if (license !== "all") {
    estimates = estimates.filter((estimate) => estimate.model.license === license);
  }

  if (licenseUse !== "all") {
    estimates = estimates.filter((estimate) => getLicensePolicy(estimate.model).commercialUse === licenseUse);
  }

  if (search) {
    estimates = estimates.filter((estimate) => {
      const confidence = getEstimateConfidence(estimate.model, estimate, hardware);
      const release = getModelReleaseInfo(estimate.model);
      const benchmark = getBenchmarkSummary(estimate.model, estimate, confidence);
      const haystack = [
        estimate.model.name,
        estimate.model.maker,
        estimate.model.license,
        licenseCommercialLabel(getLicensePolicy(estimate.model)),
        licenseOpennessLabel(getLicensePolicy(estimate.model)),
        modelSummary(estimate.model),
        release.label,
        release.note,
        benchmark.label,
        benchmark.note,
        formatParams(estimate.model.params || 0),
        estimate.settingLabel,
        estimate.limitLabel,
        estimate.model.tags.map(tagLabel).join(" "),
        estimate.model.tags.join(" "),
      ].join(" ").toLowerCase();
      return haystack.includes(search);
    });
  }

  if (gradeChoice === "fit") {
    estimates = estimates.filter((estimate) => GRADE_META[estimate.grade].score >= GRADE_META.B.score);
  } else if (GRADE_META[gradeChoice]) {
    estimates = estimates.filter((estimate) => estimate.grade === gradeChoice);
  }

  return sortEstimates(estimates);
}

function sortEstimates(estimates) {
  const sortBy = $("sortBy").value;
  return [...estimates].sort((a, b) => {
    if (sortBy === "speed") return b.speed - a.speed || gradeSort(a, b) || a.requiredGb - b.requiredGb;
    if (sortBy === "quality") return gradeSort(a, b) || b.model.params - a.model.params || b.speed - a.speed;
    if (sortBy === "vramAsc" || sortBy === "vramHeadroom") return (b.effectiveVram - b.requiredGb) - (a.effectiveVram - a.requiredGb) || gradeSort(a, b);
    if (sortBy === "koreanFirst") return tagSort(a, b, "korean") || recommendationScore(b) - recommendationScore(a);
    if (sortBy === "codingFirst") return tagSort(a, b, "coding") || recommendationScore(b) - recommendationScore(a);
    if (sortBy === "sizeDesc") return b.model.params - a.model.params || gradeSort(a, b);
    if (sortBy === "latest") return modelFreshnessScore(b.model) - modelFreshnessScore(a.model) || gradeSort(a, b);

    return recommendationScore(b) - recommendationScore(a) || gradeSort(a, b) || a.pressure - b.pressure;
  });
}

function gradeSort(a, b) {
  return GRADE_META[b.grade].score - GRADE_META[a.grade].score;
}

function tagSort(a, b, tag) {
  const aHas = a.model.tags.includes(tag) ? 1 : 0;
  const bHas = b.model.tags.includes(tag) ? 1 : 0;
  return bHas - aHas || gradeSort(a, b);
}

function modelFreshnessScore(model) {
  // Every model (LLM, embedding, reranker, OCR/VLM alike) carries a real
  // releaseDate merged in via withModelMetadata(), so sort on that directly
  // instead of hand-maintained name-keyword scoring -- the old version only
  // recognized a hardcoded list of LLM/VLM name patterns, silently missing
  // most embedding/reranker/OCR models (and anything added after the list
  // was last updated), so "최신 모델순" wasn't actually chronological for
  // those categories.
  const timestamp = /^\d{4}-\d{2}-\d{2}/.test(model.releaseDate || "") ? Date.parse(model.releaseDate) : 0;
  // Tiny param-size tie-break for same-day releases; timestamps differ by at
  // least a full day (86400000ms) so this never outweighs a real date gap.
  return timestamp + Math.min(model.params || 0, 1000) / 1000;
}

function recommendationScore(estimate) {
  const gradeBonus = {
    S: 34,
    A: 32,
    B: 28,
    C: 14,
    D: 8,
    F: 0,
  }[estimate.grade];
  const usefulSize = Math.min(estimate.model.params, 34) * 1.7;
  const tagBonus = [
    estimate.model.tags.includes("korean") ? 5 : 0,
    estimate.model.tags.includes("coding") ? 4 : 0,
    estimate.model.tags.includes("reasoning") ? 4 : 0,
    estimate.model.tags.includes("long") ? 2 : 0,
    estimate.model.tags.includes("retrieval") ? 3 : 0,
  ].reduce((sum, value) => sum + value, 0);
  const speedBonus = Math.min(estimate.speed, 90) / 6;
  const pressurePenalty = estimate.pressure > 0.95 ? (estimate.pressure - 0.95) * 22 : 0;

  return gradeBonus + usefulSize + tagBonus + speedBonus - pressurePenalty;
}

function buildRecommendationReasons(estimate) {
  const reasons = [];
  const headroomRatio = estimate.effectiveVram > 0
    ? Math.max(0, (estimate.effectiveVram - estimate.requiredGb) / estimate.effectiveVram)
    : 0;

  if (GRADE_META[estimate.grade].score >= GRADE_META.A.score) reasons.push(`VRAM 여유 ${formatPercent(headroomRatio)}`);
  else if (GRADE_META[estimate.grade].score >= GRADE_META.B.score) reasons.push("가용 VRAM 안에 들어옴");
  else if (estimate.grade === "D") reasons.push("오프로딩 전제");
  else if (estimate.grade === "F") reasons.push("현재 조건 부적합");

  if (estimate.model.tags.includes("korean")) reasons.push("한국어 지원");
  if (estimate.model.tags.includes("coding")) reasons.push("코딩 적합");
  if (estimate.model.tags.includes("reasoning")) reasons.push("추론 태그");
  if (estimate.model.tags.includes("retrieval")) reasons.push("RAG/검색");
  if (estimate.model.tags.includes("long")) reasons.push(`${escapeTextLabel(estimate.limitLabel)} 컨텍스트`);
  if (estimate.speed > 0 && estimate.speed >= 80) reasons.push("속도 우수");
  if (estimate.model.active && estimate.model.params && estimate.model.active < estimate.model.params * 0.5) reasons.push("MoE 활성 파라미터 낮음");

  return [...new Set(reasons)].slice(0, 4);
}

function normalizeBenchmarkRuntime(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized.includes("ollama") || normalized.includes("llama.cpp") || normalized === "llamacpp") return "llamacpp";
  if (normalized.includes("vllm")) return "vllm";
  if (normalized.includes("transformers")) return "transformers";
  return normalized;
}

function normalizeBenchmarkSetting(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "");
}

function hasCompleteCalibrationConditions(row, model) {
  if (model.type && model.type !== "generative") return false;
  return Boolean(
    row.gpuId
    && row.runtime
    && row.quantization
    && Number.isFinite(Number(row.context))
    && Number.isFinite(Number(row.concurrency))
    && Number.isFinite(Number(row.inputTokens))
    && Number.isFinite(Number(row.outputTokens))
  );
}

function findExactMatchingBenchmark(benchmarkRows, model, estimate, hardware) {
  return (
    benchmarkRows.find((row) => {
      if (!hasCompleteCalibrationConditions(row, model)) return false;
      const singleGpu = hardware.primaryCount === 1 && !hardware.secondaryPreset;
      const sameGpu = Boolean(row.gpuId) && row.gpuId === hardware.preset.id && singleGpu;
      const sameRuntime = Boolean(row.runtime)
        && normalizeBenchmarkRuntime(row.runtime) === normalizeBenchmarkRuntime(hardware.runtime);
      const estimateSettings = [estimate.settingLabel, estimate.quant?.label]
        .filter(Boolean)
        .map(normalizeBenchmarkSetting);
      const sameSetting = model.type === "generative"
        ? Boolean(row.quantization) && estimateSettings.includes(normalizeBenchmarkSetting(row.quantization))
        : true;
      const sameContext = model.type === "generative"
        ? Number.isFinite(Number(row.context)) && Number(row.context) === hardware.context
        : true;
      const sameConcurrency = model.type === "generative"
        ? Number(row.concurrency ?? 1) === hardware.concurrency
        : true;
      const sameInputLength = model.type === "generative"
        ? Number(row.inputTokens) === hardware.context
        : true;
      const sameOutputLength = model.type === "generative"
        ? Number(row.outputTokens) === hardware.outputTokens
        : true;
      return sameGpu
        && sameRuntime
        && sameSetting
        && sameContext
        && sameConcurrency
        && sameInputLength
        && sameOutputLength;
    }) || null
  );
}

function getBenchmarkNumericValue(row) {
  if (!row) return null;
  if (row.tokensPerSecond) return { value: row.tokensPerSecond, unit: "tok/s" };
  if (row.docsPerSecond) return { value: row.docsPerSecond, unit: "doc/s" };
  if (row.pairsPerSecond) return { value: row.pairsPerSecond, unit: "pair/s" };
  if (row.pagesPerSecond) return { value: row.pagesPerSecond, unit: "page/s" };
  return null;
}

// Lightweight detail helper kept in the core bundle. The full benchmark
// charts remain lazy-loaded, but a directly opened model detail must still
// be able to describe its model-card reference before that workspace loads.
function getReferenceBenchmark(model) {
  const reference = model.reference;
  if (!reference?.pagesPerSecond) return null;
  const gpu = GPU_PRESETS.find((item) => item.id === reference.gpuId);
  const setting = [
    reference.width && reference.height ? `${reference.width}x${reference.height}` : "",
    reference.batch ? `batch ${reference.batch}` : "",
  ].filter(Boolean).join(" · ");
  return {
    gpu: gpu?.name || reference.gpuId || (uiLanguage === "en" ? "GPU not specified" : "GPU 미기재"),
    setting: setting || ocrTypeLabel(model.type),
    metric: `${formatThroughput(reference.pagesPerSecond, "page/s")}${reference.peakVramGb ? ` · ${formatGb(reference.peakVramGb)}` : ""}`,
  };
}

function getEstimateConfidence(model, estimate, hardware) {
  const benchmarkRows = findBenchmarksForModel(model);
  const exactMatch = findExactMatchingBenchmark(benchmarkRows, model, estimate, hardware);
  const en = uiLanguage === "en";
  if (estimate.speedUnverified) {
    return {
      label: en ? "Not calibrated" : "보정 근거 미확인",
      className: "confidence-low", spread: 0, evidenceKind: "unverified", evidenceCount: 0,
      reason: en ? "VRAM is estimated, but no comparable speed baseline is registered." : "VRAM은 추정하지만 비교 가능한 속도 기준은 등록되지 않았습니다.",
    };
  }
  const calibration = estimate.calibration || getMeasuredCalibration(model, estimate, hardware);

  if (calibration?.sampleCount >= 3) {
    const spread = Math.max(0.08, Math.min(0.3, calibration.relativeMad * 1.8 || 0.12));
    return {
      label: en ? "High" : "높음",
      className: "confidence-high",
      spread,
      reason: en
        ? `Calibrated with ${calibration.sampleCount} source-linked measurements on this GPU; the range reflects median absolute deviation.`
        : `이 GPU의 출처 연결 실측 ${calibration.sampleCount}건으로 보정했으며 범위는 중앙절대편차를 반영합니다.`,
      sampleCount: calibration.sampleCount,
    };
  }

  if (calibration?.sampleCount) {
    return {
      label: en ? "Medium" : "보통",
      className: "confidence-medium",
      spread: Math.max(0.16, Math.min(0.35, calibration.relativeMad * 2 || 0.22)),
      reason: en
        ? `Calibrated with ${calibration.sampleCount} source-linked measurement(s) on this GPU; more samples are needed.`
        : `이 GPU의 출처 연결 실측 ${calibration.sampleCount}건으로 보정했지만 표본이 더 필요합니다.`,
      sampleCount: calibration.sampleCount,
    };
  }

  if (exactMatch) {
    return {
      label: en ? "High" : "높음",
      className: "confidence-high",
      spread: 0.08,
      reason: en
        ? `A source-linked ${benchmarkEvidenceLabel(exactMatch)} value exists for the same model/conditions.`
        : `동일 모델/조건의 출처 연결 ${benchmarkEvidenceLabel(exactMatch)}값이 있습니다.`,
      matchedRow: exactMatch,
    };
  }

  if (benchmarkRows.length > 0) {
    return {
      label: en ? "Medium" : "보통",
      className: "confidence-medium",
      spread: 0.18,
      evidenceKind: "related",
      evidenceCount: benchmarkRows.length,
      reason: en
        ? "User/project measurements for this same model under other run conditions can be used as a reference."
        : "같은 모델의 다른 실행 조건 사용자/자체 측정을 참고할 수 있습니다.",
    };
  }

  if (isVisionModel(model) && model.reference?.pagesPerSecond) {
    return {
      label: en ? "Medium" : "보통",
      className: "confidence-medium",
      spread: 0.18,
      evidenceKind: "external",
      evidenceCount: 1,
      reason: en
        ? "Calibrated against this model's external public OCR/VLM reference figures."
        : "모델별 OCR/VLM 외부 공개 참고값을 기준으로 보정합니다.",
    };
  }

  return {
    label: en ? "Low" : "낮음",
    className: "confidence-low",
    spread: 0.32,
    evidenceKind: "formula",
    evidenceCount: 0,
    reason: en
      ? "Estimated from a formula based on parameters, VRAM, and bandwidth, without user/project measurements for this model."
      : "모델별 사용자/자체 측정 없이 파라미터, VRAM, 대역폭 기반 계산식으로 추정합니다.",
  };
}

function getModelReleaseInfo(model) {
  const en = uiLanguage === "en";
  if (model.releaseDate) {
    const isModelCard = model.releaseNote === "모델 카드";
    const note = en ? (isModelCard ? "Model card" : "Official") : (model.releaseNote || "공식");
    return {
      label: model.releaseDate,
      note,
      className: releaseClassName(Number(String(model.releaseDate).slice(0, 4))),
      title: en
        ? (isModelCard ? "Based on the public model card's createdAt, not an official release date." : "The release date registered in this model's data.")
        : (isModelCard ? "공식 릴리스일이 아니라 공개 모델 카드의 createdAt 기준입니다." : "모델 데이터에 등록된 출시일입니다."),
    };
  }

  const year = inferModelYear(model);
  if (!year) {
    return {
      label: en ? "Not stated" : "미기재",
      note: en ? "No release date" : "출시일 없음",
      className: "release-unknown",
      title: en ? "Accurate release-date metadata isn't available yet." : "정확한 출시일 메타데이터가 아직 없습니다.",
    };
  }

  return {
    label: en ? `${year} series` : `${year} 계열`,
    note: en ? "Estimated generation" : "세대 추정",
    className: releaseClassName(year),
    title: en
      ? "A conservative estimate based on the model name and public generation, not an exact release date."
      : "정확한 출시일이 아니라 모델명과 공개 세대 기준의 보수적 표시입니다.",
  };
}

function inferModelYear(model) {
  const text = `${model.name} ${model.maker}`.toLowerCase();
  if (/\b2604\b/.test(text)) return 2026;
  if (text.includes("qwen3.6") || text.includes("qwen3.5") || text.includes("deepseek v3.2")) return 2026;
  if (text.includes("llama 4") || text.includes("gemma 4") || text.includes("exaone 4.0")) return 2026;
  if (text.includes("glm-4.5") || text.includes("glm-4.1v") || text.includes("kimi k2")) return 2026;
  if (text.includes("mistral medium 3.5") || text.includes("mistral large 3") || text.includes("mistral small 4")) return 2026;
  if (text.includes("kanana 1.5") || text.includes("hyperclovax") || text.includes("trillion 7b")) return 2026;
  if (text.includes("paddleocr-vl-1.6") || text.includes("deepseek-ocr-2")) return 2026;
  if (text.includes("internvl3.5") || text.includes("minicpm-v-4.6")) return 2026;

  if (text.includes("qwen3") || text.includes("gemma 3") || text.includes("phi-4")) return 2025;
  if (text.includes("deepseek r1") || text.includes("devstral") || text.includes("gpt-oss")) return 2025;
  if (text.includes("embeddinggemma") || text.includes("jina-embeddings-v5") || text.includes("jina-embeddings-v4")) return 2025;
  if (text.includes("granite") && text.includes("r2")) return 2025;
  if (text.includes("bge-reranker-v2.5") || text.includes("mxbai-rerank") && text.includes("-v2")) return 2025;
  if (text.includes("qwen2.5-vl") || text.includes("olmocr-2") || text.includes("dots.ocr")) return 2025;
  if (text.includes("aya-vision") || text.includes("smolvlm2")) return 2025;

  if (text.includes("llama 3.3") || text.includes("llama 3.2") || text.includes("llama 3.1")) return 2024;
  if (text.includes("qwen2.5") || text.includes("gemma 2") || text.includes("mistral small 3")) return 2024;
  if (text.includes("mistral nemo") || text.includes("deepseek-vl2") || text.includes("qwen2-vl")) return 2024;
  if (text.includes("exaone 3.5") || text.includes("pixtral") || text.includes("llava-onevision")) return 2024;
  if (text.includes("molmo") || text.includes("bge-m3")) return 2024;

  if (text.includes("mistral 7b") || text.includes("codellama") || text.includes("solar")) return 2023;
  return null;
}

function releaseClassName(year) {
  if (year >= 2026) return "release-new";
  if (year >= 2025) return "release-recent";
  if (year >= 2024) return "release-current";
  if (year) return "release-older";
  return "release-unknown";
}

function benchmarkEvidenceType(row) {
  const value = String(row?.evidenceType || row?.measurementType || row?.sourceType || "user").trim().toLowerCase();
  if (["project", "self", "internal"].includes(value)) return "project";
  if (["external", "public", "reference", "public-reference"].includes(value)) return "external";
  return "user";
}

function benchmarkEvidenceLabel(row) {
  const type = benchmarkEvidenceType(row);
  if (type === "project") return "자체 측정";
  if (type === "external") return "외부 공개 참고값";
  return "사용자 측정";
}

function benchmarkEvidenceCode(rowType) {
  if (rowType === "자체 측정") return "SELF";
  if (rowType === "외부 공개 참고값") return "EXT";
  if (rowType === "사용자 측정") return "USER";
  return "EST";
}

function findBenchmarksForModel(model) {
  const key = modelKey(model);
  return BENCHMARKS.filter((row) => (
    benchmarkEvidenceType(row) !== "external"
    && (row.modelKey === key || row.modelName === model.name)
  ));
}

function getBenchmarkSummary(model, estimate, confidence) {
  if (model.qualityBenchmark) {
    return {
      label: model.qualityBenchmark.label,
      note: model.qualityBenchmark.note || "품질 지표",
      className: model.qualityBenchmark.note === "외부 평가" ? "benchmark-external" : "benchmark-quality",
      title: [
        `${model.qualityBenchmark.metric || "대표 공개 평가"} 기준입니다.`,
        "로컬 추론 속도 측정과 분리된 외부 공개 참고값입니다.",
        model.qualityBenchmark.sourceUrl ? `출처: ${model.qualityBenchmark.sourceUrl}` : "",
      ].filter(Boolean).join(" "),
    };
  }

  const fallback = qualityMissingLabel(model);
  return {
    label: "—",
    note: fallback.note,
    className: "benchmark-missing",
    title: `${fallback.title} 속도와 처리량은 오른쪽 추정 처리량 열에서 별도로 표시합니다.`,
  };
}

function qualityMissingLabel(model) {
  if (model.type === "embedding") {
    return {
      note: "MTEB 없음",
      title: "공식 모델 카드나 논문에서 확인되는 MTEB 계열 대표 공개 평가가 아직 등록되지 않았습니다.",
    };
  }
  if (model.type === "reranker") {
    return {
      note: "BEIR/MIRACL 없음",
      title: "공식 모델 카드나 논문에서 확인되는 BEIR 또는 MIRACL 계열 공개 점수가 아직 등록되지 않았습니다.",
    };
  }
  if (model.type === "ocr-pipeline") {
    return {
      note: "공개 점수 없음",
      title: "동일 OCR 정확도 기준의 공개 점수가 아직 등록되지 않았습니다.",
    };
  }
  if (model.type === "document-vlm" || model.type === "ocr-vlm") {
    return {
      note: "동일 기준 없음",
      title: "문서 VLM 탭은 OmniDocBench 계열 점수만 같은 열에 표시합니다.",
    };
  }
  if (model.type === "general-vlm") {
    return {
      note: "OCRBench v2 없음",
      title: "범용 VLM 탭은 OCRBench v2 계열 점수만 같은 열에 표시합니다.",
    };
  }
  return {
    note: "공개 점수 없음",
    title: "공식 모델 카드나 논문에서 확인되는 대표 공개 평가가 아직 등록되지 않았습니다.",
  };
}

function formatSpeedRange(estimate, confidence = getEstimateConfidence(estimate.model, estimate, getHardware())) {
  if (estimate.speedUnverified && estimate.grade !== "F") return uiLanguage === "en" ? "Speed not calibrated" : "속도 보정 근거 미확인";
  if (!estimate.speed) return uiLanguage === "en" ? "N/A" : "불가";
  const spread = confidence.spread ?? 0.32;
  const unit = estimate.unitLabel || "tok/s";
  const low = estimate.speed * (1 - spread);
  const high = estimate.speed * (1 + spread);
  return uiLanguage === "en"
    ? `Approx. ${formatMetricNumber(low, unit, false)}–${formatMetricNumber(high, unit, true)}`
    : `약 ${formatMetricNumber(low, unit, false)}~${formatMetricNumber(high, unit, true)}`;
}

function formatMetricNumber(value, unit, includeUnit) {
  let text;
  if (value >= 1000) text = Math.round(value).toLocaleString("ko-KR");
  else if (value >= 10) text = String(Math.round(value));
  else text = value.toFixed(1);
  return includeUnit ? `${text} ${unit}` : text;
}

const GRADE_LABEL_EN = { S: "Comfortable", A: "Runs well", B: "Possible", C: "Tight", D: "Offloading", F: "Not suitable" };

function buildGradeTooltip(estimate) {
  const meta = GRADE_META[estimate.grade];
  const margin = estimate.effectiveVram - estimate.requiredGb;
  const en = uiLanguage === "en";
  if (en) {
    return [
      GRADE_LABEL_EN[estimate.grade] || meta.label,
      `Required VRAM ${formatGb(estimate.requiredGb)}`,
      `Available VRAM ${formatGb(estimate.effectiveVram)}`,
      `${margin >= 0 ? "Remaining VRAM" : "VRAM shortfall"} ${formatGb(Math.abs(margin))}`,
      `Utilization ${formatPercent(estimate.pressure)}`,
      `Current basis: ${buildHardwareBasis(getHardware())}`,
    ].join("\n");
  }
  return [
    meta.label,
    `필요 VRAM ${formatGb(estimate.requiredGb)}`,
    `가용 VRAM ${formatGb(estimate.effectiveVram)}`,
    `${margin >= 0 ? "남는 VRAM" : "부족 VRAM"} ${formatGb(Math.abs(margin))}`,
    `사용률 ${formatPercent(estimate.pressure)}`,
    `현재 ${buildHardwareBasis(getHardware())} 기준`,
  ].join("\n");
}

function formatPercent(value) {
  return `${Math.round(value * 1000) / 10}%`;
}
