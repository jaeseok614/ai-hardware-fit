import fs from "node:fs";
import vm from "node:vm";

const context = {
  window: {},
};
vm.createContext(context);

for (const file of [
  "data/gpus.js",
  "data/quantizations.js",
  "data/precision-profiles.js",
  "data/models.js",
  "data/embedding-models.js",
  "data/reranker-models.js",
  "data/ocr-models.js",
  "data/audio-models.js",
  "data/benchmarks.js",
  "data/model-metadata.js",
  "data/model-capabilities.js",
  "data/licenses.js",
  "data/decision-data.js",
  "data/api-models.js",
]) {
  const source = fs.readFileSync(file, "utf8");
  vm.runInContext(source, context, { filename: file });
}

const data = context.window.LLM_GPU_CHECKER_DATA;
assertArray(data.gpus, "gpus");
assertArray(data.quantizations, "quantizations");
assertArray(data.models, "models");
assertArray(data.precisions.encoder, "encoder precisions");
assertArray(data.precisions.ocr, "ocr precisions");
assertArray(data.embeddingModels, "embeddingModels");
assertArray(data.rerankerModels, "rerankerModels");
assertArray(data.ocrModels, "ocrModels");
assertArray(data.audioModels, "audioModels");
for (const model of data.audioModels) {
  requireFields(model, ["type", "name", "provider", "params", "license", "realtimeBase", "sourceUrl"], "audio model");
  if (!["audio-stt", "audio-tts"].includes(model.type)) throw new Error(`invalid audio model type: ${model.type}`);
  if (!Number.isFinite(model.params) || model.params <= 0) throw new Error(`audio model ${model.name} needs positive params`);
  if (!Number.isFinite(model.realtimeBase) || model.realtimeBase < 0) throw new Error(`audio model ${model.name} has an invalid realtimeBase`);
  if (model.speedStatus === "unverified" ? model.realtimeBase !== 0 : model.realtimeBase === 0) {
    throw new Error(`audio model ${model.name} must explicitly distinguish unknown speed from a positive baseline`);
  }
}
if (!Array.isArray(data.benchmarks)) throw new Error("benchmarks must be an array");
if (!data.modelMetadata || typeof data.modelMetadata !== "object" || Array.isArray(data.modelMetadata)) {
  throw new Error("modelMetadata must be an object");
}
if (!data.modelCapabilities || typeof data.modelCapabilities !== "object" || Array.isArray(data.modelCapabilities)) {
  throw new Error("modelCapabilities must be an object");
}
if (!data.useCaseDefinitions || typeof data.useCaseDefinitions !== "object" || Array.isArray(data.useCaseDefinitions)) {
  throw new Error("useCaseDefinitions must be an object");
}
if (!data.licensePolicies || typeof data.licensePolicies !== "object" || Array.isArray(data.licensePolicies)) {
  throw new Error("licensePolicies must be an object");
}
assertArray(data.koreanGpuMarket, "koreanGpuMarket");
if (!data.priceDataMeta || data.priceDataMeta.currency !== "KRW") {
  throw new Error("priceDataMeta must define the KRW planning currency");
}

// apiModels is a deliberately different kind of catalog (see the comment at
// the top of data/api-models.js): hosted API pricing, not local-GPU sizing
// data, so it validates against its own schema rather than the local model
// schema used above.
assertArray(data.apiModels, "apiModels");
const apiModelIds = new Set();
for (const apiModel of data.apiModels) {
  requireFields(apiModel, ["id", "provider", "name", "tier", "inputPerMTokUsd", "outputPerMTokUsd", "sourceUrl", "verifiedAt"], "api model");
  if (apiModelIds.has(apiModel.id)) throw new Error(`duplicate apiModel id: ${apiModel.id}`);
  apiModelIds.add(apiModel.id);
  if (!["flagship", "balanced", "economy"].includes(apiModel.tier)) {
    throw new Error(`apiModel ${apiModel.id} has an unknown tier: ${apiModel.tier}`);
  }
  if (!/^https:\/\//.test(apiModel.sourceUrl)) throw new Error(`apiModel ${apiModel.id} source is not HTTPS`);
  if (!Number.isFinite(apiModel.inputPerMTokUsd) || !Number.isFinite(apiModel.outputPerMTokUsd)) {
    throw new Error(`apiModel ${apiModel.id} has non-numeric pricing`);
  }
}
if (!data.apiPricingMeta || !data.apiPricingMeta.verifiedAt) {
  throw new Error("apiPricingMeta must define verifiedAt");
}

const gpuIds = new Set();
for (const gpu of data.gpus) {
  requireFields(gpu, ["id", "name", "vram", "ram", "bandwidth", "vendor", "architecture", "memoryType", "gpuUsableMemoryGb", "runtimes", "aliases", "formFactor", "specStatus"], "gpu");
  if (gpuIds.has(gpu.id)) throw new Error(`duplicate gpu id: ${gpu.id}`);
  gpuIds.add(gpu.id);
  if (gpu.aliases && !Array.isArray(gpu.aliases)) throw new Error(`GPU ${gpu.id} aliases must be an array`);
  if (gpu.runtimes && !Array.isArray(gpu.runtimes)) throw new Error(`GPU ${gpu.id} runtimes must be an array`);
  if (gpu.gpuUsableMemoryGb && gpu.gpuUsableMemoryGb > gpu.ram) {
    throw new Error(`GPU ${gpu.id} usable GPU memory cannot exceed system/unified RAM`);
  }
  if (!["dedicated", "unified"].includes(gpu.memoryType)) throw new Error(`GPU ${gpu.id} has invalid memoryType`);
  if (gpu.formFactor === "laptop" && (!gpu.tgpMinW || !gpu.tgpMaxW || gpu.tgpMinW > gpu.tgpMaxW)) {
    throw new Error(`Laptop GPU ${gpu.id} needs a valid TGP range`);
  }
}

const marketGpuIds = new Set();
for (const row of data.koreanGpuMarket) {
  requireFields(row, ["gpuId", "newKrw", "usedKrw", "lowestKrw", "updatedAt", "sourceName", "sourceUrl", "usedPriceMethod"], "Korean GPU market row");
  if (!gpuIds.has(row.gpuId)) throw new Error(`market row references unknown GPU: ${row.gpuId}`);
  if (marketGpuIds.has(row.gpuId)) throw new Error(`duplicate market GPU id: ${row.gpuId}`);
  marketGpuIds.add(row.gpuId);
  if (!/^https:\/\//.test(row.sourceUrl)) throw new Error(`market row ${row.gpuId} needs an HTTPS sourceUrl`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(row.updatedAt) || !Number.isFinite(Date.parse(row.updatedAt))) {
    throw new Error(`market row ${row.gpuId} has invalid updatedAt`);
  }
  for (const field of ["newKrw", "usedKrw", "lowestKrw"]) {
    if (!Number.isFinite(row[field]) || row[field] <= 0) throw new Error(`market row ${row.gpuId}.${field} must be positive`);
  }
}

const quantIds = new Set();
for (const quant of data.quantizations) {
  requireFields(quant, ["id", "label", "rank"], "quantization");
  if (quant.id !== "auto" && typeof quant.bytesPerB !== "number") {
    throw new Error(`quantization ${quant.id} needs bytesPerB`);
  }
  if (quantIds.has(quant.id)) throw new Error(`duplicate quantization id: ${quant.id}`);
  quantIds.add(quant.id);
}

const modelNames = new Set();
const allowedTags = new Set([
  "general",
  "korean",
  "coding",
  "reasoning",
  "long",
  "edge",
  "vision",
  "embedding",
  "reranker",
  "retrieval",
  "sparse",
  "dense",
  "multilingual",
  "matryoshka",
  "ocr",
  "document",
  "document-vlm",
  "general-vlm",
  "vlm",
  "layout",
  "table",
  "math",
  "handwriting",
  "pdf",
  "markdown",
  "chart",
  "video",
  "image",
  "image-generation",
  "video-generation",
  "avatar",
  "lip-sync",
  "talking-head",
  "audio-driven",
  "portrait-animation",
  "motion-transfer",
  "single-image",
  "realtime",
  "face",
  "non-commercial",
  "diffusion",
  "grounding",
  "audio",
  "gui",
  "seal",
  "spotting",
  "coordinate",
  "screen",
  "mobile",
  "agent",
  "legacy",
  "classification",
  "clustering",
  "matching",
  "codeRetrieval",
]);
for (const model of data.models) {
  requireFields(model, ["name", "maker", "params", "active", "context", "license", "tags", "summary"], "model");
  validateTagsAndName(model, "generative model");
}

for (const model of data.embeddingModels) {
  requireFields(model, ["type", "name", "maker", "params", "hiddenSize", "layers", "attentionHeads", "maxTokens", "embeddingDim", "pooling", "license", "tags", "precisions", "supportsFlashAttention", "summary"], "embedding model");
  validatePrecisionRefs(model, data.precisions.encoder);
  validateTagsAndName(model, "embedding model");
}

for (const model of data.rerankerModels) {
  requireFields(model, ["type", "name", "maker", "params", "hiddenSize", "layers", "attentionHeads", "maxTokens", "recommendedTokens", "license", "tags", "precisions", "supportsFlashAttention", "summary"], "reranker model");
  validatePrecisionRefs(model, data.precisions.encoder);
  validateTagsAndName(model, "reranker model");
}

for (const model of data.ocrModels) {
  requireFields(model, ["type", "name", "maker", "params", "license", "tags", "precisions", "profiles", "summary"], "ocr model");
  validatePrecisionRefs(model, data.precisions.ocr);
  validateTagsAndName(model, "ocr model");
}

const capabilityModels = [
  ...data.models.map((model) => [model.type || "generative", model]),
  ...data.embeddingModels.map((model) => [model.type || "embedding", model]),
  ...data.rerankerModels.map((model) => [model.type || "reranker", model]),
  ...data.ocrModels.map((model) => [model.type || "ocr-pipeline", model]),
  ...data.audioModels.map((model) => [model.type, model]),
];
const allowedQualityTiers = new Set(["light", "balanced", "high"]);
const allowedLatencyTiers = new Set(["realtime", "interactive", "standard", "batch"]);
for (const [type, model] of capabilityModels) {
  const key = `${type}:${model.name}`;
  const capabilities = data.modelCapabilities[key];
  if (!capabilities) throw new Error(`model ${key} has no normalized capabilities`);
  requireFields(
    capabilities,
    ["useCases", "useCaseEvidence", "capabilityConfidence", "languages", "inputModality", "outputModality", "qualityTier", "latencyTier", "supports"],
    `model capabilities ${key}`,
  );
  if (!["high", "medium", "low"].includes(capabilities.capabilityConfidence)) {
    throw new Error(`model capabilities ${key} has invalid capabilityConfidence`);
  }
  for (const useCase of capabilities.useCases) {
    if (!data.useCaseDefinitions[useCase]) throw new Error(`model capabilities ${key} has unknown use case ${useCase}`);
    if (!["type", "metadata", "tag", "inferred"].includes(capabilities.useCaseEvidence[useCase])) {
      throw new Error(`model capabilities ${key} has no evidence for ${useCase}`);
    }
  }
  for (const field of ["useCases", "languages", "inputModality", "outputModality", "supports"]) {
    if (!Array.isArray(capabilities[field])) throw new Error(`model capabilities ${key}.${field} must be an array`);
  }
  if (!capabilities.useCases.length) throw new Error(`model capabilities ${key} needs at least one use case`);
  if (!capabilities.inputModality.length || !capabilities.outputModality.length) {
    throw new Error(`model capabilities ${key} needs input and output modalities`);
  }
  capabilities.useCases.forEach((useCase) => {
    if (!data.useCaseDefinitions[useCase]) throw new Error(`model capabilities ${key} uses unknown use case: ${useCase}`);
  });
  if (!allowedQualityTiers.has(capabilities.qualityTier)) throw new Error(`model capabilities ${key} has invalid qualityTier`);
  if (!allowedLatencyTiers.has(capabilities.latencyTier)) throw new Error(`model capabilities ${key} has invalid latencyTier`);
}

for (const row of data.benchmarks) {
  requireFields(row, ["modelName", "gpu", "workload", "sourceUrl"], "benchmark");
  if (!row.tokensPerSecond && !row.docsPerSecond && !row.pairsPerSecond && !row.pagesPerSecond && !row.metric) {
    throw new Error(`benchmark ${row.modelName} needs a measured metric`);
  }
}

const allModelNames = new Set([
  ...data.models,
  ...data.embeddingModels,
  ...data.rerankerModels,
  ...data.ocrModels,
  ...data.audioModels,
].map((model) => model.name));
const allModelsByName = new Map([
  ...data.models,
  ...data.embeddingModels,
  ...data.rerankerModels,
  ...data.ocrModels,
].map((model) => [model.name, model]));

for (const model of allModelsByName.values()) {
  const policy = data.modelLicensePolicies?.[model.name] || data.licensePolicies[model.license];
  if (!policy) throw new Error(`model ${model.name} has no license policy for ${model.license}`);
  requireFields(policy, ["commercialUse", "commercialLabel", "opennessLabel", "summary", "sourceUrl"], `license policy ${model.license}`);
  if (!["allowed", "conditional", "noncommercial", "review"].includes(policy.commercialUse)) {
    throw new Error(`license policy ${model.license} has invalid commercialUse: ${policy.commercialUse}`);
  }
}

for (const [name, metadata] of Object.entries(data.modelMetadata)) {
  if (!name.includes(":") && !allModelNames.has(name)) {
    throw new Error(`model metadata ${name} does not match a known model name`);
  }
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new Error(`model metadata ${name} must be an object`);
  }
  if (metadata.releaseDate && !/^\d{4}(-\d{2}(-\d{2})?)?$/.test(metadata.releaseDate)) {
    throw new Error(`model metadata ${name} has invalid releaseDate: ${metadata.releaseDate}`);
  }
  const existingModel = allModelsByName.get(name);
  if (metadata.releaseDate && !(metadata.sourceUrl || existingModel?.sourceUrl)) {
    throw new Error(`model metadata ${name} with releaseDate needs sourceUrl`);
  }
  if (metadata.qualityBenchmark) {
    requireFields(metadata.qualityBenchmark, ["label", "metric", "sourceUrl"], `quality benchmark metadata ${name}`);
  }
}

const metadataRows = Object.values(data.modelMetadata);
const releaseDateCount = metadataRows.filter((metadata) => metadata.releaseDate).length;
const qualityBenchmarkCount = metadataRows.filter((metadata) => metadata.qualityBenchmark).length;

console.log(
  `validated ${data.gpus.length} GPUs, ${data.quantizations.length} quantizations, ${data.models.length} LLMs, `
  + `${data.embeddingModels.length} embeddings, ${data.rerankerModels.length} rerankers, ${data.ocrModels.length} OCR models, ${data.audioModels.length} audio models, `
  + `${data.benchmarks.length} measured benchmarks, ${capabilityModels.length} capability rows, ${metadataRows.length} metadata rows `
  + `(${releaseDateCount} release dates, ${qualityBenchmarkCount} quality benchmarks), `
  + `${allModelsByName.size} license policies`,
);

function assertArray(value, name) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${name} must be a non-empty array`);
  }
}

function requireFields(record, fields, type) {
  for (const field of fields) {
    if (!(field in record)) {
      throw new Error(`${type} record is missing ${field}`);
    }
  }
}

function validateTagsAndName(model, type) {
  const key = `${model.type || "generative"}:${model.name}`;
  if (modelNames.has(key)) throw new Error(`duplicate ${type}: ${model.name}`);
  if (!Array.isArray(model.tags) || model.tags.length === 0) {
    throw new Error(`${type} ${model.name} needs at least one tag`);
  }
  for (const tag of model.tags) {
    if (!allowedTags.has(tag)) throw new Error(`${type} ${model.name} has unsupported tag: ${tag}`);
  }
  modelNames.add(key);
}

function validatePrecisionRefs(model, precisionOptions) {
  const validPrecisionIds = new Set(precisionOptions.map((precision) => precision.id));
  for (const precision of model.precisions) {
    if (!validPrecisionIds.has(precision)) {
      throw new Error(`${model.name} references unknown precision: ${precision}`);
    }
  }
}
