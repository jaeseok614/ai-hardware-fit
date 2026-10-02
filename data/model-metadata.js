window.LLM_GPU_CHECKER_DATA = window.LLM_GPU_CHECKER_DATA || {};

const MODEL_METADATA_SOURCES = {
  qwen25: "https://qwenlm.github.io/blog/qwen2.5/",
  qwen3: "https://qwenlm.github.io/blog/qwen3/",
  qwen3Report: "https://arxiv.org/abs/2505.09388",
  qwen25TechReport: "https://arxiv.org/abs/2412.15115",
  llama2: "https://huggingface.co/meta-llama/Llama-2-70b-chat-hf",
  llama3: "https://huggingface.co/meta-llama/Meta-Llama-3-70B-Instruct",
  llama31: "https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/MODEL_CARD.md",
  llama32: "https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md",
  llama33: "https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct",
  gemma3: "https://deepmind.google/models/gemma/gemma-3/",
  gemmaReleases: "https://ai.google.dev/gemma/docs/releases",
  phi4: "https://huggingface.co/microsoft/phi-4",
  deepseekR1: "https://github.com/deepseek-ai/DeepSeek-R1",
  deepseekR1News: "https://api-docs.deepseek.com/news/news250120",
  deepseekV3News: "https://api-docs.deepseek.com/zh-cn/news/news1226",
  mistralSmall31: "https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503",
  mistralSmall31News: "https://mistral.ai/news/mistral-small-3-1/",
  mistralChangelog: "https://docs.mistral.ai/resources/changelogs",
  mistralNemo: "https://mistral.ai/news/mistral-nemo/",
  mistral7b: "https://mistral.ai/news/announcing-mistral-7b/",
  mistralLarge2: "https://mistral.ai/news/mistral-large-2407/",
  mixtral: "https://mistral.ai/news/mixtral-of-experts/",
  exaone35: "https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct",
  exaone35Small: "https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-2.4B-Instruct",
  exaone40: "https://github.com/LG-AI-EXAONE/EXAONE-4.0",
  kanana15: "https://github.com/kakao/kanana",
  ax40: "https://huggingface.co/skt/A.X-4.0-Light",
  solar: "https://www.upstage.ai/news/solar-10-7b-emerges-as-worlds-top-pre-trained-llm",
  solarNim: "https://build.nvidia.com/upstage/solar-10_7b-instruct/modelcard",
  trillion: "https://huggingface.co/trillionlabs/Trillion-7B-preview",
};

function quality(label, metric, value, sourceUrl, note = "공식 품질") {
  return {
    label,
    metric,
    value,
    note,
    sourceUrl,
  };
}

function meta(releaseDate, sourceUrl, qualityBenchmark) {
  const record = { releaseDate, sourceUrl };
  if (qualityBenchmark) record.qualityBenchmark = qualityBenchmark;
  return record;
}

function same(record, names) {
  return Object.fromEntries(names.map((name) => [name, record]));
}

window.LLM_GPU_CHECKER_DATA.modelMetadata = {
  "Qwen2.5 0.5B Instruct": meta(
    "2024-09-19",
    MODEL_METADATA_SOURCES.qwen25,
    quality("MMLU-Pro 15.0", "MMLU-Pro", 15.0, MODEL_METADATA_SOURCES.qwen25TechReport, "공식 발표"),
  ),
  "Qwen2.5 1.5B Instruct": meta(
    "2024-09-19",
    MODEL_METADATA_SOURCES.qwen25,
    quality("MMLU-Pro 32.4", "MMLU-Pro", 32.4, MODEL_METADATA_SOURCES.qwen25TechReport, "공식 발표"),
  ),
  "Qwen2.5 3B Instruct": meta(
    "2024-09-19",
    MODEL_METADATA_SOURCES.qwen25,
    quality("MMLU-Pro 43.7", "MMLU-Pro", 43.7, MODEL_METADATA_SOURCES.qwen25TechReport, "공식 발표"),
  ),
  "Qwen2.5 14B Instruct": meta(
    "2024-09-19",
    MODEL_METADATA_SOURCES.qwen25,
    quality("MMLU-Pro 63.7", "MMLU-Pro", 63.7, MODEL_METADATA_SOURCES.qwen25TechReport, "공식 발표"),
  ),
  "Qwen2.5 7B Instruct": meta(
    "2024-09-19",
    MODEL_METADATA_SOURCES.qwen25,
    quality("MMLU 77.23", "MMLU (0-shot, CoT)", 77.23, MODEL_METADATA_SOURCES.kanana15, "외부 평가"),
  ),
  "Qwen2.5 32B Instruct": meta(
    "2024-09-19",
    MODEL_METADATA_SOURCES.qwen25,
    quality("MMLU 84.40", "MMLU (0-shot, CoT)", 84.4, MODEL_METADATA_SOURCES.kanana15, "외부 평가"),
  ),
  "Qwen2.5 72B Instruct": meta(
    "2024-09-19",
    MODEL_METADATA_SOURCES.qwen25,
    quality("MMLU 87.14", "MMLU (0-shot, CoT)", 87.14, MODEL_METADATA_SOURCES.kanana15, "외부 평가"),
  ),

  "Qwen3 0.6B": meta(
    "2025-04-29",
    MODEL_METADATA_SOURCES.qwen3,
    quality("MMLU-Pro 24.74", "MMLU-Pro (Base 모델, 5-shot CoT)", 24.74, MODEL_METADATA_SOURCES.qwen3Report),
  ),
  "Qwen3 1.7B": meta(
    "2025-04-29",
    MODEL_METADATA_SOURCES.qwen3,
    quality("MMLU-Pro 36.76", "MMLU-Pro (Base 모델, 5-shot CoT)", 36.76, MODEL_METADATA_SOURCES.qwen3Report),
  ),
  "Qwen3 4B": meta(
    "2025-04-29",
    MODEL_METADATA_SOURCES.qwen3,
    quality("MMLU-Pro 50.58", "MMLU-Pro (Base 모델, 5-shot CoT)", 50.58, MODEL_METADATA_SOURCES.qwen3Report),
  ),
  "Qwen3 8B": meta(
    "2025-04-29",
    MODEL_METADATA_SOURCES.qwen3,
    quality("MMLU-Pro 56.73", "MMLU-Pro (Base 모델, 5-shot CoT)", 56.73, MODEL_METADATA_SOURCES.qwen3Report),
  ),
  "Qwen3 14B": meta(
    "2025-04-29",
    MODEL_METADATA_SOURCES.qwen3,
    quality("MMLU-Pro 61.03", "MMLU-Pro (Base 모델, 5-shot CoT)", 61.03, MODEL_METADATA_SOURCES.qwen3Report),
  ),
  "Qwen3 30B A3B": meta(
    "2025-04-29",
    MODEL_METADATA_SOURCES.qwen3,
    quality("MMLU-Pro 61.49", "MMLU-Pro", 61.49, MODEL_METADATA_SOURCES.qwen3Report),
  ),
  "Qwen3 32B": meta(
    "2025-04-29",
    MODEL_METADATA_SOURCES.qwen3,
    quality("MMLU-Pro 65.54", "MMLU-Pro", 65.54, MODEL_METADATA_SOURCES.qwen3Report),
  ),
  "Qwen3 235B A22B": meta(
    "2025-04-29",
    MODEL_METADATA_SOURCES.qwen3,
    quality("MMLU-Pro 68.18", "MMLU-Pro", 68.18, MODEL_METADATA_SOURCES.qwen3Report),
  ),
  "Qwen3 235B A22B Thinking": meta(
    "2025-04-29",
    MODEL_METADATA_SOURCES.qwen3,
    quality("AIME24 85.7", "AIME 2024", 85.7, MODEL_METADATA_SOURCES.qwen3Report),
  ),

  "Llama 3.2 1B Instruct": meta(
    "2024-10-24",
    MODEL_METADATA_SOURCES.llama32,
    quality("MMLU 49.3", "MMLU (5-shot)", 49.3, MODEL_METADATA_SOURCES.llama32),
  ),
  "Llama 3.2 3B Instruct": meta(
    "2024-10-24",
    MODEL_METADATA_SOURCES.llama32,
    quality("MMLU 63.4", "MMLU (5-shot)", 63.4, MODEL_METADATA_SOURCES.llama32),
  ),
  "Llama 3 8B Instruct": meta(
    "2024-04-18",
    "https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct",
  ),
  "Llama 3 70B Instruct": meta(
    "2024-04-18",
    MODEL_METADATA_SOURCES.llama3,
  ),
  "Llama 2 7B Chat": meta(
    "2023-07-18",
    "https://huggingface.co/meta-llama/Llama-2-7b-chat-hf",
  ),
  "Llama 2 13B Chat": meta(
    "2023-07-18",
    "https://huggingface.co/meta-llama/Llama-2-13b-chat-hf",
  ),
  "Llama 2 70B Chat": meta(
    "2023-07-18",
    MODEL_METADATA_SOURCES.llama2,
  ),
  "Llama 3.1 8B Instruct": meta(
    "2024-07-23",
    MODEL_METADATA_SOURCES.llama31,
    quality("MMLU-Pro 48.3", "MMLU-Pro (CoT, 5-shot)", 48.3, MODEL_METADATA_SOURCES.llama31),
  ),
  "Llama 3.1 70B Instruct": meta(
    "2024-07-23",
    MODEL_METADATA_SOURCES.llama31,
    quality("MMLU-Pro 66.4", "MMLU-Pro (CoT, 5-shot)", 66.4, MODEL_METADATA_SOURCES.llama31),
  ),
  "Llama 3.1 405B Instruct": meta(
    "2024-07-23",
    MODEL_METADATA_SOURCES.llama31,
    quality("MMLU-Pro 73.3", "MMLU-Pro (CoT, 5-shot)", 73.3, MODEL_METADATA_SOURCES.llama31),
  ),
  "Llama 3.3 70B Instruct": meta(
    "2024-12-06",
    MODEL_METADATA_SOURCES.llama33,
    quality("MMLU-Pro 68.9", "MMLU Pro (CoT, 5-shot)", 68.9, MODEL_METADATA_SOURCES.llama33),
  ),

  "Gemma 2 2B IT": meta(
    "2024-07-31",
    MODEL_METADATA_SOURCES.gemmaReleases,
    quality("MMLU-Pro 15.6", "MMLU-Pro", 15.6, MODEL_METADATA_SOURCES.gemma3),
  ),
  "Gemma 2 9B IT": meta(
    "2024-06-27",
    MODEL_METADATA_SOURCES.gemmaReleases,
    quality("MMLU-Pro 46.8", "MMLU-Pro", 46.8, MODEL_METADATA_SOURCES.gemma3),
  ),
  "Gemma 2 27B IT": meta(
    "2024-06-27",
    MODEL_METADATA_SOURCES.gemmaReleases,
    quality("MMLU-Pro 56.9", "MMLU-Pro", 56.9, MODEL_METADATA_SOURCES.gemma3),
  ),
  "Gemma 3 1B IT": meta(
    "2025-03-12",
    MODEL_METADATA_SOURCES.gemma3,
    quality("MMLU-Pro 14.7", "MMLU-Pro", 14.7, MODEL_METADATA_SOURCES.gemma3),
  ),
  "Gemma 3 4B IT": meta(
    "2025-03-12",
    MODEL_METADATA_SOURCES.gemma3,
    quality("MMLU-Pro 43.6", "MMLU-Pro", 43.6, MODEL_METADATA_SOURCES.gemma3),
  ),
  "Gemma 3 12B IT": meta(
    "2025-03-12",
    MODEL_METADATA_SOURCES.gemma3,
    quality("MMLU-Pro 60.6", "MMLU-Pro", 60.6, MODEL_METADATA_SOURCES.gemma3),
  ),
  "Gemma 3 27B IT": meta(
    "2025-03-12",
    MODEL_METADATA_SOURCES.gemma3,
    quality("MMLU-Pro 67.5", "MMLU-Pro", 67.5, MODEL_METADATA_SOURCES.gemma3),
  ),

  "Phi-4 14B": meta(
    "2024-12-12",
    MODEL_METADATA_SOURCES.phi4,
    quality("MMLU 84.8", "MMLU", 84.8, MODEL_METADATA_SOURCES.phi4),
  ),

  "DeepSeek V3": meta(
    "2024-12-26",
    MODEL_METADATA_SOURCES.deepseekV3News,
    quality("MMLU-Pro 75.9", "MMLU-Pro (EM)", 75.9, MODEL_METADATA_SOURCES.deepseekR1),
  ),
  "DeepSeek R1": meta(
    "2025-01-20",
    MODEL_METADATA_SOURCES.deepseekR1News,
    quality("MMLU-Pro 84.0", "MMLU-Pro (EM)", 84, MODEL_METADATA_SOURCES.deepseekR1),
  ),
  "DeepSeek R1 Distill Qwen 7B": meta(
    "2025-01-20",
    MODEL_METADATA_SOURCES.deepseekR1News,
    quality("AIME24 55.5", "AIME 2024 pass@1", 55.5, MODEL_METADATA_SOURCES.deepseekR1, "공식 증류"),
  ),
  "DeepSeek R1 Distill Llama 8B": meta(
    "2025-01-20",
    MODEL_METADATA_SOURCES.deepseekR1News,
    quality("AIME24 50.4", "AIME 2024 pass@1", 50.4, MODEL_METADATA_SOURCES.deepseekR1, "공식 증류"),
  ),
  "DeepSeek R1 Distill Qwen 14B": meta(
    "2025-01-20",
    MODEL_METADATA_SOURCES.deepseekR1News,
    quality("AIME24 69.7", "AIME 2024 pass@1", 69.7, MODEL_METADATA_SOURCES.deepseekR1, "공식 증류"),
  ),
  "DeepSeek R1 Distill Qwen 32B": meta(
    "2025-01-20",
    MODEL_METADATA_SOURCES.deepseekR1News,
    quality("AIME24 72.6", "AIME 2024 pass@1", 72.6, MODEL_METADATA_SOURCES.deepseekR1, "공식 증류"),
  ),
  "DeepSeek R1 Distill Llama 70B": meta(
    "2025-01-20",
    MODEL_METADATA_SOURCES.deepseekR1News,
    quality("AIME24 70.0", "AIME 2024 pass@1", 70, MODEL_METADATA_SOURCES.deepseekR1, "공식 증류"),
  ),

  "Mistral 7B Instruct": meta("2023-09-27", MODEL_METADATA_SOURCES.mistral7b),
  "Mixtral 8x7B Instruct": meta(
    "2023-12-11",
    MODEL_METADATA_SOURCES.mixtral,
    quality("MT-Bench 8.30", "MT-Bench", 8.3, MODEL_METADATA_SOURCES.mixtral, "공식 발표"),
  ),
  "Mistral Nemo 12B Instruct": meta("2024-07-18", MODEL_METADATA_SOURCES.mistralNemo),
  "Mistral Large 2 123B": meta(
    "2024-07-24",
    MODEL_METADATA_SOURCES.mistralLarge2,
    quality("MMLU 84.0", "MMLU (pretrained)", 84, MODEL_METADATA_SOURCES.mistralLarge2, "공식 발표"),
  ),
  "Mistral Small 3.1 24B": meta(
    "2025-03-17",
    MODEL_METADATA_SOURCES.mistralSmall31News,
    quality("MMLU-Pro 66.76", "MMLU Pro (5-shot CoT)", 66.76, MODEL_METADATA_SOURCES.mistralSmall31),
  ),
  "Mistral Small 3.2 24B": meta(
    "2025-06-20",
    MODEL_METADATA_SOURCES.mistralChangelog,
    quality("MMLU 80.50", "MMLU", 80.5, "https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506", "공식 카드"),
  ),
  "Devstral Small 24B": meta(
    "2025-05-21",
    MODEL_METADATA_SOURCES.mistralChangelog,
    quality("SWE-bench 46.8", "SWE-bench Verified", 46.8, "https://huggingface.co/mistralai/Devstral-Small-2505", "공식 카드"),
  ),

  "EXAONE 3.5 2.4B Instruct": meta(
    "2024-12-09",
    MODEL_METADATA_SOURCES.exaone35Small,
    quality("LiveBench 33.0", "LiveBench", 33, MODEL_METADATA_SOURCES.exaone35Small),
  ),
  "EXAONE 3.5 7.8B Instruct": meta(
    "2024-12-09",
    MODEL_METADATA_SOURCES.exaone35,
    quality("LiveBench 39.8", "LiveBench", 39.8, MODEL_METADATA_SOURCES.exaone35),
  ),
  "EXAONE 4.0 1.2B": meta(
    "2025-07-15",
    MODEL_METADATA_SOURCES.exaone40,
    quality("MMLU-Pro 59.3", "MMLU-Pro", 59.3, MODEL_METADATA_SOURCES.exaone40),
  ),
  "EXAONE 4.0 32B": meta(
    "2025-07-15",
    MODEL_METADATA_SOURCES.exaone40,
    quality("MMLU-Pro 81.8", "MMLU-Pro", 81.8, MODEL_METADATA_SOURCES.exaone40),
  ),

  "Kanana 1.5 8B Instruct": meta(
    "2025-05-23",
    MODEL_METADATA_SOURCES.kanana15,
    quality("KMMLU 48.28", "KMMLU (0-shot, CoT)", 48.28, MODEL_METADATA_SOURCES.kanana15, "공식 한국어"),
  ),
  "A.X 4.0 Light 7B": meta(
    "2025-07-03",
    MODEL_METADATA_SOURCES.ax40,
    quality("MMLU 75.43", "MMLU (자체 평가, CoT)", 75.43, MODEL_METADATA_SOURCES.ax40, "공식 발표"),
  ),
  "A.X 4.0 72B": meta(
    "2025-07-03",
    MODEL_METADATA_SOURCES.ax40,
    quality("KMMLU 78.32", "KMMLU", 78.32, MODEL_METADATA_SOURCES.ax40, "공식 한국어"),
  ),
  "SOLAR 10.7B Instruct": meta(
    "2023-12-13",
    MODEL_METADATA_SOURCES.solarNim,
    quality("Avg 74.2", "Open LLM Leaderboard average", 74.2, MODEL_METADATA_SOURCES.solar, "공식 발표"),
  ),
  "Trillion 7B Preview": meta(
    "2025-06",
    MODEL_METADATA_SOURCES.trillion,
    quality("Avg 66.5", "Average performance", 66.5, MODEL_METADATA_SOURCES.trillion, "공식 평가"),
  ),
};

function mergeModelMetadata(records) {
  for (const [name, metadata] of Object.entries(records)) {
    window.LLM_GPU_CHECKER_DATA.modelMetadata[name] = {
      ...(window.LLM_GPU_CHECKER_DATA.modelMetadata[name] || {}),
      ...metadata,
    };
  }
}

function cardDate(releaseDate) {
  return {
    releaseDate,
    releaseNote: "모델 카드",
  };
}

mergeModelMetadata({
  "TinyLlama 1.1B Chat": {
    releaseDate: "2024-01-04",
    sourceUrl: "https://huggingface.co/TinyLlama/TinyLlama_v1.1",
    qualityBenchmark: quality("Avg 53.63", "TinyLlama reported average", 53.63, "https://huggingface.co/TinyLlama/TinyLlama_v1.1", "공식 평가"),
  },
  "SmolLM2 1.7B Instruct": {
    releaseDate: "2025-02-05",
    sourceUrl: "https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B",
    qualityBenchmark: quality("IFEval 56.7", "IFEval 평균(prompt/inst)", 56.7, "https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct", "공식 발표"),
  },
  "Phi-3.5 Mini Instruct": {
    releaseDate: "2024-08-20",
    sourceUrl: "https://huggingface.co/microsoft/Phi-3.5-mini-instruct",
    qualityBenchmark: quality("MMLU 69.0", "MMLU (5-shot)", 69, "https://huggingface.co/microsoft/Phi-3.5-mini-instruct", "공식 발표"),
  },
  "Phi-4 Mini Instruct": {
    releaseDate: "2025-02",
    sourceUrl: "https://huggingface.co/microsoft/Phi-4-mini-instruct",
    qualityBenchmark: quality("MMLU-Pro 52.8", "MMLU-Pro (0-shot, CoT)", 52.8, "https://huggingface.co/microsoft/Phi-4-mini-instruct"),
  },
  "Mistral 7B Instruct": {
    releaseDate: "2023-09-27",
    sourceUrl: MODEL_METADATA_SOURCES.mistral7b,
    qualityBenchmark: quality("MT-Bench 6.84", "MT-Bench (v0.1)", 6.84, "https://arxiv.org/abs/2310.06825", "공식 논문"),
  },
  "Mistral Nemo 12B Instruct": {
    qualityBenchmark: quality("MMLU 68.0", "MMLU (5-shot)", 68, "https://developer.nvidia.com/blog/power-text-generation-applications-with-mistral-nemo-12b-running-on-a-single-gpu/", "공식 파트너"),
  },
  "StarCoder2 15B": {
    releaseDate: "2024-02-28",
    sourceUrl: "https://huggingface.co/bigcode/starcoder2-15b",
    qualityBenchmark: quality("HumanEval 46", "HumanEval pass@1", 46, "https://developer.nvidia.com/blog/unlock-your-llm-coding-potential-with-starcoder2/", "공식 파트너"),
  },
  "Codestral 22B": {
    releaseDate: "2024-05-29",
    sourceUrl: "https://mistral.ai/news/codestral/",
  },
  "Qwen2.5 Coder 1.5B Instruct": {
    releaseDate: "2024-11-12",
    sourceUrl: "https://qwenlm.github.io/blog/qwen2.5-coder-family/",
  },
  "Qwen2.5 Coder 7B Instruct": {
    releaseDate: "2024-11-12",
    sourceUrl: "https://qwenlm.github.io/blog/qwen2.5-coder-family/",
  },
  "Qwen2.5 Coder 14B Instruct": {
    releaseDate: "2024-11-12",
    sourceUrl: "https://qwenlm.github.io/blog/qwen2.5-coder-family/",
  },
  "Qwen2.5 Coder 32B Instruct": {
    releaseDate: "2024-11-12",
    sourceUrl: "https://qwenlm.github.io/blog/qwen2.5-coder-family/",
  },
  "Qwen2.5 Coder 3B Instruct": {
    releaseDate: "2024-11-12",
    sourceUrl: "https://qwenlm.github.io/blog/qwen2.5-coder-family/",
  },
  "Qwen3 Coder 30B A3B": {
    releaseDate: "2025-07",
    sourceUrl: "https://github.com/QwenLM/Qwen3-Coder",
  },
  "Qwen3-Coder 480B A35B Instruct": {
    releaseDate: "2025-07",
    sourceUrl: "https://github.com/QwenLM/Qwen3-Coder",
    qualityBenchmark: quality("SWE-bench Pro 38.7", "SWE-bench Pro", 38.7, "https://huggingface.co/Qwen/Qwen3-Coder-480B-A35B-Instruct", "공식 발표"),
  },
  "CodeLlama 7B Instruct": {
    releaseDate: "2023-08-24",
    sourceUrl: "https://ai.meta.com/blog/code-llama-large-language-model-coding/",
  },
  "CodeLlama 13B Instruct": {
    releaseDate: "2023-08-24",
    sourceUrl: "https://ai.meta.com/blog/code-llama-large-language-model-coding/",
  },
  "CodeLlama 34B Instruct": {
    releaseDate: "2023-08-24",
    sourceUrl: "https://ai.meta.com/blog/code-llama-large-language-model-coding/",
  },
  "DeepSeek Coder V2 Lite 16B": {
    releaseDate: "2024-06-17",
    sourceUrl: "https://github.com/deepseek-ai/DeepSeek-Coder-V2",
    qualityBenchmark: quality("HumanEval 81.1", "HumanEval pass@1", 81.1, "https://github.com/deepseek-ai/DeepSeek-Coder-V2", "공식 발표"),
  },
  "DeepSeek Coder V2 236B": {
    releaseDate: "2024-06-17",
    sourceUrl: "https://github.com/deepseek-ai/DeepSeek-Coder-V2",
    qualityBenchmark: quality("HumanEval 90.2", "HumanEval pass@1", 90.2, "https://github.com/deepseek-ai/DeepSeek-Coder-V2", "공식 발표"),
  },
  "Mixtral 8x22B Instruct": {
    releaseDate: "2024-04-17",
    sourceUrl: "https://mistral.ai/news/mixtral-8x22b/",
    qualityBenchmark: quality("GSM8K 90.8", "GSM8K maj@8", 90.8, "https://mistral.ai/news/mixtral-8x22b/", "공식 발표"),
  },
  "Command R 35B": {
    releaseDate: "2024-03-11",
    sourceUrl: "https://huggingface.co/CohereForAI/c4ai-command-r-v01",
    qualityBenchmark: quality("MMLU 68.2", "MMLU (Open LLM Leaderboard)", 68.2, "https://huggingface.co/CohereLabs/c4ai-command-r-plus", "공식 비교"),
  },
  "Command R+ 104B": {
    releaseDate: "2024-04-04",
    sourceUrl: "https://huggingface.co/CohereForAI/c4ai-command-r-plus",
    qualityBenchmark: quality("MMLU 75.7", "MMLU", 75.7, "https://huggingface.co/CohereLabs/c4ai-command-r-plus", "공식 발표"),
  },
  "Aya Expanse 8B": {
    releaseDate: "2024-10-23",
    sourceUrl: "https://huggingface.co/CohereForAI/aya-expanse-8b",
    qualityBenchmark: quality("MMLU-Pro 33.74", "MMLU-Pro (Open LLM Leaderboard 연동)", 33.74, "https://huggingface.co/CohereLabs/aya-expanse-8b", "공식 카드"),
  },
  "Aya Expanse 32B": {
    releaseDate: "2024-10-23",
    sourceUrl: "https://huggingface.co/CohereForAI/aya-expanse-32b",
    qualityBenchmark: quality("MMLU-Pro 45.41", "MMLU-Pro (Open LLM Leaderboard 연동)", 45.41, "https://huggingface.co/CohereLabs/aya-expanse-32b", "공식 카드"),
  },
  "OLMo 2 7B Instruct": {
    releaseDate: "2024-11-26",
    sourceUrl: "https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct",
    qualityBenchmark: quality("MMLU 61.3", "MMLU", 61.3, "https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct", "공식 발표"),
  },
  "OLMo 2 13B Instruct": {
    releaseDate: "2024-11-26",
    sourceUrl: "https://huggingface.co/allenai/OLMo-2-1124-13B-Instruct",
    qualityBenchmark: quality("Avg 62.0", "10개 벤치마크 평균(AlpacaEval/BBH/GSM8k/MMLU 등)", 62, "https://huggingface.co/allenai/OLMo-2-1124-13B-Instruct", "공식 발표"),
  },
  "OLMoE 1B-7B Instruct": {
    releaseDate: "2024-09-05",
    sourceUrl: "https://huggingface.co/allenai/OLMoE-1B-7B-0924-Instruct",
  },
  "Falcon 7B Instruct": {
    releaseDate: "2023-05-25",
    sourceUrl: "https://huggingface.co/tiiuae/falcon-7b-instruct",
    qualityBenchmark: quality("Open LLM Avg 48.4", "Open LLM Leaderboard 평균(ARC/HellaSwag/MMLU/TruthfulQA)", 48.4, "https://github.com/huggingface/blog/blob/main/falcon.md", "공식 발표"),
  },
  "Falcon 40B Instruct": {
    releaseDate: "2023-05-25",
    sourceUrl: "https://huggingface.co/tiiuae/falcon-40b-instruct",
    qualityBenchmark: quality("Open LLM Avg 63.2", "Open LLM Leaderboard 평균(ARC/HellaSwag/MMLU/TruthfulQA)", 63.2, "https://github.com/huggingface/blog/blob/main/falcon.md", "공식 발표"),
  },
  "Falcon 180B Chat": {
    releaseDate: "2023-09-06",
    sourceUrl: "https://huggingface.co/tiiuae/falcon-180B-chat",
  },
  "Jamba 1.5 Mini": {
    releaseDate: "2024-08-22",
    sourceUrl: "https://huggingface.co/ai21labs/AI21-Jamba-1.5-Mini",
    qualityBenchmark: quality("Arena Hard 46.1", "Arena Hard", 46.1, "https://www.ai21.com/blog/announcing-jamba-model-family/", "공식 발표"),
  },
  "Jamba 1.5 Large": {
    releaseDate: "2024-08-22",
    sourceUrl: "https://huggingface.co/ai21labs/AI21-Jamba-1.5-Large",
    qualityBenchmark: quality("Arena Hard 65.4", "Arena Hard", 65.4, "https://www.ai21.com/blog/announcing-jamba-model-family/", "공식 발표"),
  },
  "NVIDIA Nemotron 4 15B": {
    releaseDate: "2024-06-14",
    sourceUrl: "https://huggingface.co/nvidia/Nemotron-4-15B-Instruct",
    qualityBenchmark: quality("MMLU 64.2", "MMLU (5-shot)", 64.2, "https://arxiv.org/abs/2402.16819", "공식 논문"),
  },
  "Llama 3.1 Nemotron 70B": {
    releaseDate: "2024-10-15",
    sourceUrl: "https://huggingface.co/nvidia/Llama-3.1-Nemotron-70B-Instruct-HF",
    qualityBenchmark: quality("MMLU-Pro 62.78", "MMLU-Pro", 62.78, "https://huggingface.co/nvidia/Llama-3.1-Nemotron-70B-Instruct-HF", "공식 발표"),
  },

  "Llama 3.2 11B Vision Instruct": {
    releaseDate: "2024-09-25",
    sourceUrl: MODEL_METADATA_SOURCES.llama32,
    qualityBenchmark: quality("MMMU 50.7", "MMMU (val, CoT)", 50.7, "https://huggingface.co/meta-llama/Llama-3.2-11B-Vision-Instruct", "공식 발표"),
  },
  "Llama 3.2 90B Vision Instruct": {
    releaseDate: "2024-09-25",
    sourceUrl: MODEL_METADATA_SOURCES.llama32,
    qualityBenchmark: quality("MMMU 60.3", "MMMU (val, CoT)", 60.3, "https://huggingface.co/meta-llama/Llama-3.2-90B-Vision-Instruct", "공식 발표"),
  },
  "Qwen2.5-VL 3B Instruct": {
    releaseDate: "2025-01-26",
    sourceUrl: "https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct",
    qualityBenchmark: quality("MMMU 53.1", "MMMU (val)", 53.1, "https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct", "공식 발표"),
  },
  "Qwen2.5-VL 7B Instruct": {
    releaseDate: "2025-01-26",
    sourceUrl: "https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct",
    qualityBenchmark: quality("MMMU 58.6", "MMMU (val)", 58.6, "https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct", "공식 발표"),
  },
  "Qwen2.5-VL 32B Instruct": {
    releaseDate: "2025-03-21",
    sourceUrl: "https://huggingface.co/Qwen/Qwen2.5-VL-32B-Instruct",
    qualityBenchmark: quality("OCRBench v2 57.2/59.1", "OCRBench v2 en/zh", 58.15, "https://huggingface.co/Qwen/Qwen2.5-VL-32B-Instruct"),
  },
  "Qwen2.5-VL 72B Instruct": {
    releaseDate: "2025-01-27",
    sourceUrl: "https://huggingface.co/Qwen/Qwen2.5-VL-72B-Instruct",
    qualityBenchmark: quality("OCRBench v2 61.5/63.7", "OCRBench v2 en/zh", 62.6, "https://huggingface.co/Qwen/Qwen2.5-VL-72B-Instruct"),
  },
  "Pixtral 12B": {
    releaseDate: "2024-09-17",
    sourceUrl: "https://mistral.ai/news/pixtral-12b/",
    qualityBenchmark: quality("MMMU 52.5", "MMMU reasoning", 52.5, "https://mistral.ai/news/pixtral-12b/"),
  },
  "Pixtral Large 124B": {
    releaseDate: "2024-11-18",
    sourceUrl: "https://huggingface.co/mistralai/Pixtral-Large-Instruct-2411",
    qualityBenchmark: quality("MMMU 64.0", "MMMU (CoT)", 64, "https://huggingface.co/mistralai/Pixtral-Large-Instruct-2411", "공식 발표"),
  },
  "MiniCPM-V 2.6 8B": {
    releaseDate: "2024-08-06",
    sourceUrl: "https://huggingface.co/openbmb/MiniCPM-V-2_6",
    qualityBenchmark: quality("OpenCompass 65.2", "OpenCompass 8개 벤치마크 평균", 65.2, "https://huggingface.co/openbmb/MiniCPM-V-2_6", "공식 발표"),
  },
  "InternVL2.5 8B": {
    releaseDate: "2024-12-10",
    sourceUrl: "https://huggingface.co/OpenGVLab/InternVL2_5-8B",
    qualityBenchmark: quality("MMMU 56.0", "MMMU (val)", 56, "https://internvl.github.io/blog/2024-12-05-InternVL-2.5/", "공식 발표"),
  },
  "InternVL2.5 26B": {
    releaseDate: "2024-12-10",
    sourceUrl: "https://huggingface.co/OpenGVLab/InternVL2_5-26B",
    qualityBenchmark: quality("MMMU 60.0", "MMMU (val)", 60, "https://internvl.github.io/blog/2024-12-05-InternVL-2.5/", "공식 발표"),
  },
  "InternVL2.5 78B": {
    releaseDate: "2024-12-10",
    sourceUrl: "https://huggingface.co/OpenGVLab/InternVL2_5-78B",
    qualityBenchmark: quality("MMMU 70.1", "MMMU (val)", 70.1, "https://internvl.github.io/blog/2024-12-05-InternVL-2.5/", "공식 발표"),
  },
  "Phi-3.5 Vision Instruct": {
    releaseDate: "2024-08-20",
    sourceUrl: "https://huggingface.co/microsoft/Phi-3.5-vision-instruct",
    qualityBenchmark: quality("MMMU 43.0", "MMMU (val)", 43, "https://huggingface.co/microsoft/Phi-3.5-vision-instruct", "공식 발표"),
  },

  "PP-OCRv6 Tiny": {
    releaseDate: "2026-06-11",
    sourceUrl: "https://www.paddleocr.ai/latest/en/version3.x/algorithm/PP-OCRv6/PP-OCRv6.html",
    qualityBenchmark: quality("OCR Acc 73.5", "Text recognition weighted accuracy", 73.5, "https://www.paddleocr.ai/latest/en/version3.x/algorithm/PP-OCRv6/PP-OCRv6.html"),
  },
  "PP-OCRv6 Small": {
    releaseDate: "2026-06-11",
    sourceUrl: "https://www.paddleocr.ai/latest/en/version3.x/algorithm/PP-OCRv6/PP-OCRv6.html",
    qualityBenchmark: quality("OCR Acc 81.3", "Text recognition weighted accuracy", 81.3, "https://www.paddleocr.ai/latest/en/version3.x/algorithm/PP-OCRv6/PP-OCRv6.html"),
  },
  "PP-OCRv6 Medium": {
    releaseDate: "2026-06-11",
    sourceUrl: "https://www.paddleocr.ai/latest/en/version3.x/algorithm/PP-OCRv6/PP-OCRv6.html",
    qualityBenchmark: quality("OCR Acc 83.2", "Text recognition weighted accuracy", 83.2, "https://www.paddleocr.ai/latest/en/version3.x/algorithm/PP-OCRv6/PP-OCRv6.html"),
  },
  "PP-StructureV3 Basic": {
    releaseDate: "2025-06-26",
    sourceUrl: "https://paddlepaddle.github.io/PaddleOCR/v3.0.1/en/version3.x/algorithm/PP-StructureV3/PP-StructureV3.html",
    qualityBenchmark: quality("OmniDocBench Edit 0.145", "OmniDocBench OverallEdit(EN, 낮을수록 우수)", 0.145, "https://github.com/PaddlePaddle/PaddleOCR/blob/main/docs/version3.x/algorithm/PP-StructureV3/PP-StructureV3.md", "공식 발표"),
  },
  "GOT-OCR2.0": {
    releaseDate: "2024-09-03",
    sourceUrl: "https://huggingface.co/docs/transformers/model_doc/got_ocr2",
    qualityBenchmark: quality(
      "문서 OCR F1 98.0",
      "중국어 dense document OCR F1",
      98,
      "https://arxiv.org/abs/2409.01704",
      "공식 논문",
    ),
  },
  "Surya OCR 2": {
    releaseDate: "2025-02",
    sourceUrl: "https://github.com/datalab-to/surya",
    qualityBenchmark: quality("olmOCR-bench 83.3", "olmOCR-bench", 83.3, "https://huggingface.co/datalab-to/surya-ocr-2", "공식 발표"),
  },
  "deepseek-ai/deepseek-vl2": {
    releaseDate: "2024-12-13",
    sourceUrl: "https://github.com/deepseek-ai/DeepSeek-VL2",
    qualityBenchmark: quality("OCRBench 811", "OCRBench", 811, "https://arxiv.org/pdf/2412.10302", "공식 논문"),
  },
  "nreimers/mmarco-mMiniLMv2-L6-H384-v1": {
    ...cardDate("2022-05-20"),
    sourceUrl: "https://huggingface.co/nreimers/mmarco-mMiniLMv2-L6-H384-v1",
  },
});

mergeModelMetadata({
  "Qwen/Qwen3-Embedding-0.6B": {
    ...cardDate("2025-06-03"),
    qualityBenchmark: quality("MTEB Multi 64.33", "MTEB Multilingual Mean(Task)", 64.33, "https://huggingface.co/Qwen/Qwen3-Embedding-8B"),
  },
  "Qwen/Qwen3-Embedding-4B": {
    ...cardDate("2025-06-03"),
    qualityBenchmark: quality("MTEB Multi 69.45", "MTEB Multilingual Mean(Task)", 69.45, "https://huggingface.co/Qwen/Qwen3-Embedding-8B"),
  },
  "Qwen/Qwen3-Embedding-8B": {
    ...cardDate("2025-06-03"),
    qualityBenchmark: quality("MTEB Multi 70.58", "MTEB Multilingual Mean(Task)", 70.58, "https://huggingface.co/Qwen/Qwen3-Embedding-8B"),
  },
  "BAAI/bge-m3": {
    ...cardDate("2024-01-27"),
    qualityBenchmark: quality("MTEB Multi 59.56", "MTEB Multilingual Mean(Task)", 59.56, "https://huggingface.co/Qwen/Qwen3-Embedding-8B", "외부 비교"),
  },
  "intfloat/multilingual-e5-large-instruct": {
    ...cardDate("2024-02-08"),
    qualityBenchmark: quality("MTEB Multi 63.22", "MTEB Multilingual Mean(Task)", 63.22, "https://huggingface.co/Qwen/Qwen3-Embedding-8B", "외부 비교"),
  },
  "Alibaba-NLP/gte-Qwen2-1.5B-instruct": {
    ...cardDate("2024-06-29"),
    qualityBenchmark: quality("MTEB Multi 59.45", "MTEB Multilingual Mean(Task)", 59.45, "https://huggingface.co/Qwen/Qwen3-Embedding-8B", "외부 비교"),
  },
  "Alibaba-NLP/gte-Qwen2-7B-instruct": {
    ...cardDate("2024-06-15"),
    qualityBenchmark: quality("MTEB Multi 62.51", "MTEB Multilingual Mean(Task)", 62.51, "https://huggingface.co/Qwen/Qwen3-Embedding-8B", "외부 비교"),
  },
  "jinaai/jina-embeddings-v3": {
    ...cardDate("2024-09-05"),
    qualityBenchmark: quality("MTEB Eng 65.52", "MTEB English average", 65.52, "https://jina.ai/models/jina-embeddings-v3/"),
  },
  "google/embeddinggemma-300m": {
    ...cardDate("2025-07-17"),
    qualityBenchmark: quality("MTEB Multi ~61", "MTEB Multilingual Mean(Task)", 61, "https://deepmind.google/models/gemma/embeddinggemma/", "공식 그래프"),
  },

  "jinaai/jina-reranker-v2-base-multilingual": {
    ...cardDate("2024-06-19"),
    qualityBenchmark: quality("BEIR 53.17", "BEIR nDCG@10 average", 53.17, "https://huggingface.co/jinaai/jina-reranker-v2-base-multilingual/blob/refs%2Fpr%2F8/README.md"),
  },
  "BAAI/bge-reranker-v2-m3": {
    ...cardDate("2024-03-15"),
    qualityBenchmark: quality("BEIR 53.65", "BEIR nDCG@10 average", 53.65, "https://huggingface.co/jinaai/jina-reranker-v2-base-multilingual/blob/refs%2Fpr%2F8/README.md", "외부 비교"),
  },
  "mixedbread-ai/mxbai-rerank-base-v2": {
    ...cardDate("2025-03-03"),
    qualityBenchmark: quality("BEIR 55.57", "BEIR nDCG@10 average", 55.57, "https://www.mixedbread.com/blog/mxbai-rerank-v2"),
  },
  "mixedbread-ai/mxbai-rerank-large-v2": {
    ...cardDate("2025-03-03"),
    qualityBenchmark: quality("BEIR 57.49", "BEIR nDCG@10 average", 57.49, "https://www.mixedbread.com/blog/mxbai-rerank-v2"),
  },
  "mixedbread-ai/mxbai-rerank-large-v1": {
    ...cardDate("2024-02-29"),
    qualityBenchmark: quality("BEIR 49.32", "BEIR nDCG@10 average", 49.32, "https://www.mixedbread.com/blog/mxbai-rerank-v2"),
  },
  "BAAI/bge-reranker-v2-gemma": {
    ...cardDate("2024-03-16"),
    qualityBenchmark: quality("BEIR 55.38", "BEIR nDCG@10 average", 55.38, "https://www.mixedbread.com/blog/mxbai-rerank-v2", "외부 비교"),
  },

  "PP-OCRv6 Tiny": qualityOnly("OCR Acc 73.5", "Text recognition weighted accuracy", 73.5, "https://www.paddleocr.ai/latest/en/version3.x/algorithm/PP-OCRv6/PP-OCRv6.html"),
  "PP-OCRv6 Small": qualityOnly("OCR Acc 81.3", "Text recognition weighted accuracy", 81.3, "https://www.paddleocr.ai/latest/en/version3.x/algorithm/PP-OCRv6/PP-OCRv6.html"),
  "PP-OCRv6 Medium": qualityOnly("OCR Acc 83.2", "Text recognition weighted accuracy", 83.2, "https://www.paddleocr.ai/latest/en/version3.x/algorithm/PP-OCRv6/PP-OCRv6.html"),

  "PaddlePaddle/PaddleOCR-VL-1.6": {
    ...cardDate("2026-05-27"),
    qualityBenchmark: quality("OmniDocBench v1.6 96.33", "OmniDocBench v1.6", 96.33, "https://www.paddleocr.ai/main/en/version3.x/algorithm/PaddleOCR-VL/PaddleOCR-VL-1.6.html", "OmniDocBench v1.6"),
  },
  "PaddlePaddle/PaddleOCR-VL-0.9B": {
    ...cardDate("2025-10-16"),
    qualityBenchmark: quality("OmniDocBench v1.5 92.56", "OmniDocBench v1.5", 92.56, "https://www.paddleocr.ai/latest/en/version3.x/algorithm/PaddleOCR-VL/PaddleOCR-VL.html", "OmniDocBench v1.5"),
  },
  "opendatalab/MinerU2.5-Pro-2604-1.2B": {
    ...cardDate("2026-04-02"),
    qualityBenchmark: quality("OmniDocBench v1.6 93.04", "OmniDocBench v1.6", 93.04, "https://github.com/opendatalab/OmniDocBench", "OmniDocBench v1.6"),
  },
  "deepseek-ai/DeepSeek-OCR-2": {
    ...cardDate("2026-01-27"),
    qualityBenchmark: quality("OmniDocBench v1.6 90.25", "OmniDocBench v1.6", 90.25, "https://github.com/opendatalab/OmniDocBench", "OmniDocBench v1.6"),
  },
  "rednote-hilab/dots.ocr": {
    ...cardDate("2025-07-30"),
    qualityBenchmark: quality("OmniDocBench v1.6 90.77", "OmniDocBench v1.6", 90.77, "https://github.com/opendatalab/OmniDocBench", "OmniDocBench v1.6"),
  },
  "zai-org/GLM-OCR": {
    ...cardDate("2026-03-11"),
    qualityBenchmark: quality("OmniDocBench v1.5 94.62", "OmniDocBench v1.5", 94.62, "https://huggingface.co/zai-org/GLM-OCR", "공식 카드"),
  },
  "Qwen/Qwen2.5-VL-32B-Instruct": {
    ...cardDate("2025-03-21"),
    qualityBenchmark: quality("OCRBench v2 57.2/59.1", "OCRBench v2 en/zh", 58.15, "https://huggingface.co/Qwen/Qwen2.5-VL-32B-Instruct"),
  },
  "Qwen/Qwen2.5-VL-72B-Instruct": {
    ...cardDate("2025-01-27"),
    qualityBenchmark: quality("OCRBench v2 61.5/63.7", "OCRBench v2 en/zh", 62.6, "https://huggingface.co/Qwen/Qwen2.5-VL-72B-Instruct"),
  },
  "Qwen/Qwen3-VL-4B-Instruct": {
    ...cardDate("2025-10-11"),
    qualityBenchmark: quality("OCRBench v2 60.68/59.13", "OCRBench v2 en/zh", 59.91, "https://huggingface.co/baidu/Qianfan-OCR", "외부 비교"),
  },
});

function qualityOnly(label, metric, value, sourceUrl, note = "공식 품질") {
  return {
    qualityBenchmark: quality(label, metric, value, sourceUrl, note),
  };
}

mergeModelMetadata({
  "BAAI/bge-large-en-v1.5": {
    ...cardDate("2023-09-12"),
    qualityBenchmark: quality("MTEB 64.23", "MTEB English average (56)", 64.23, "https://huggingface.co/BAAI/bge-large-en-v1.5"),
  },
  "BAAI/bge-base-en-v1.5": {
    ...cardDate("2023-09-11"),
    qualityBenchmark: quality("MTEB 63.55", "MTEB English average (56)", 63.55, "https://huggingface.co/BAAI/bge-base-en-v1.5"),
  },
  "BAAI/bge-small-en-v1.5": {
    ...cardDate("2023-09-12"),
    qualityBenchmark: quality("MTEB 62.17", "MTEB English average (56)", 62.17, "https://huggingface.co/BAAI/bge-small-en-v1.5"),
  },
  "intfloat/multilingual-e5-base": {
    ...cardDate("2023-05-19"),
    qualityBenchmark: quality("Mr.TyDi 65.9", "Mr. TyDi MRR@10 average", 65.9, "https://huggingface.co/intfloat/multilingual-e5-base", "공식 발표"),
  },
  "intfloat/multilingual-e5-small": {
    ...cardDate("2023-06-30"),
    qualityBenchmark: quality("Mr.TyDi 64.4", "Mr. TyDi MRR@10 average", 64.4, "https://huggingface.co/intfloat/multilingual-e5-base", "공식 발표"),
  },
  "intfloat/e5-large-v2": {
    ...cardDate("2023-05-19"),
    qualityBenchmark: quality("MTEB 62.25", "MTEB English average (56)", 62.25, "https://huggingface.co/intfloat/e5-large-v2", "공식 발표"),
  },
  "intfloat/e5-base-v2": {
    ...cardDate("2023-05-19"),
    qualityBenchmark: quality("MTEB 61.5", "MTEB English average (56)", 61.5, "https://huggingface.co/intfloat/e5-base-v2", "공식 발표"),
  },
  "intfloat/e5-small-v2": {
    ...cardDate("2023-05-19"),
    qualityBenchmark: quality("MTEB 59.93", "MTEB English average (56)", 59.93, "https://huggingface.co/intfloat/e5-small-v2", "공식 발표"),
  },
  "Alibaba-NLP/gte-multilingual-base": cardDate("2024-07-20"),
  "thenlper/gte-large": {
    ...cardDate("2023-07-27"),
    qualityBenchmark: quality("MTEB 63.13", "MTEB English average (56)", 63.13, "https://huggingface.co/thenlper/gte-large"),
  },
  "thenlper/gte-base": {
    ...cardDate("2023-07-27"),
    qualityBenchmark: quality("MTEB 62.39", "MTEB English average (56)", 62.39, "https://huggingface.co/thenlper/gte-base"),
  },
  "jinaai/jina-embeddings-v5-text-small": {
    ...cardDate("2026-01-22"),
    qualityBenchmark: quality("MTEB(en-v2) 71.7", "MTEB English v2 평균", 71.7, "https://huggingface.co/jinaai/jina-embeddings-v5-text-small", "공식 발표"),
  },
  "jinaai/jina-embeddings-v5-text-nano": {
    ...cardDate("2026-01-22"),
    qualityBenchmark: quality("MTEB(en-v2) 71.0", "MTEB English v2 평균", 71, "https://huggingface.co/jinaai/jina-embeddings-v5-text-nano", "공식 발표"),
  },
  "Snowflake/snowflake-arctic-embed-l-v2.0": {
    ...cardDate("2024-11-08"),
    qualityBenchmark: quality("BEIR 55.6", "BEIR nDCG@10 average (15)", 55.6, "https://huggingface.co/Snowflake/snowflake-arctic-embed-l-v2.0"),
  },
  "Snowflake/snowflake-arctic-embed-m-v2.0": {
    ...cardDate("2024-11-08"),
    qualityBenchmark: quality("BEIR 55.4", "BEIR nDCG@10 average (15)", 55.4, "https://huggingface.co/Snowflake/snowflake-arctic-embed-m-v2.0", "공식 발표"),
  },
  "nomic-ai/nomic-embed-text-v1.5": {
    ...cardDate("2024-02-10"),
    qualityBenchmark: quality("MTEB 62.28", "MTEB English average (768d)", 62.28, "https://huggingface.co/nomic-ai/nomic-embed-text-v1.5"),
  },
  "mixedbread-ai/mxbai-embed-large-v1": {
    ...cardDate("2024-03-07"),
    qualityBenchmark: quality("MTEB 64.68", "MTEB English average (56)", 64.68, "https://huggingface.co/mixedbread-ai/mxbai-embed-large-v1"),
  },
  "sentence-transformers/all-mpnet-base-v2": {
    ...cardDate("2022-03-02"),
    qualityBenchmark: quality("MTEB 57.78", "MTEB English average (56)", 57.78, "https://huggingface.co/BAAI/bge-large-en-v1.5", "외부 비교"),
  },
  "sentence-transformers/all-MiniLM-L6-v2": {
    ...cardDate("2022-03-02"),
    qualityBenchmark: quality("MTEB 56.26", "MTEB English average (56)", 56.26, "https://huggingface.co/thenlper/gte-large", "외부 비교"),
  },
  "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2": {
    ...cardDate("2022-03-02"),
    qualityBenchmark: quality(
      "MTEB 52.44",
      "MTEB 영어 56개 데이터셋 평균",
      52.44,
      "https://aclanthology.org/2023.eacl-main.148/",
      "공식 벤치마크 논문",
    ),
  },
  "sentence-transformers/LaBSE": {
    ...cardDate("2022-03-02"),
    qualityBenchmark: quality(
      "MTEB 45.21",
      "MTEB 영어 56개 데이터셋 평균",
      45.21,
      "https://aclanthology.org/2023.eacl-main.148/",
      "공식 벤치마크 논문",
    ),
  },
  "jinaai/jina-embeddings-v4": {
    ...cardDate("2025-05-07"),
    qualityBenchmark: quality("MMTEB 66.49", "MMTEB 평균", 66.49, "https://jina.ai/news/jina-embeddings-v4-universal-embeddings-for-multimodal-multilingual-retrieval/", "공식 발표"),
  },
  "BAAI/bge-multilingual-gemma2": cardDate("2024-07-25"),
  "BAAI/bge-en-icl": {
    ...cardDate("2024-07-25"),
    qualityBenchmark: quality("AIR-Bench 54.36", "AIR-Bench QA 8개 도메인 평균 nDCG@10 (few-shot)", 54.36, "https://huggingface.co/BAAI/bge-en-icl", "공식 발표"),
  },
  "BAAI/bge-code-v1": {
    ...cardDate("2025-05-15"),
    qualityBenchmark: quality("CoIR 81.77", "CoIR 평균", 81.77, "https://huggingface.co/BAAI/bge-code-v1", "공식 발표"),
  },
  "Alibaba-NLP/gte-large-en-v1.5": {
    ...cardDate("2024-04-20"),
    qualityBenchmark: quality("MTEB-en 65.39", "MTEB English average (56)", 65.39, "https://huggingface.co/Alibaba-NLP/gte-large-en-v1.5"),
  },
  "Alibaba-NLP/gte-base-en-v1.5": {
    ...cardDate("2024-04-20"),
    qualityBenchmark: quality("MTEB-en 64.11", "MTEB English average (56)", 64.11, "https://huggingface.co/Alibaba-NLP/gte-base-en-v1.5"),
  },
  "intfloat/e5-mistral-7b-instruct": {
    ...cardDate("2023-12-20"),
    qualityBenchmark: quality("MTEB 66.6", "MTEB 영어 56개 데이터셋 평균", 66.6, "https://arxiv.org/abs/2401.00368", "공식 논문"),
  },
  "Salesforce/SFR-Embedding-Mistral": {
    ...cardDate("2024-01-24"),
    qualityBenchmark: quality("MTEB 67.6", "MTEB 영어 56개 데이터셋 평균", 67.6, "https://www.salesforce.com/blog/sfr-embedding/", "공식 발표"),
  },
  "Salesforce/SFR-Embedding-2_R": cardDate("2024-06-14"),
  "GritLM/GritLM-7B": {
    ...cardDate("2024-02-11"),
    qualityBenchmark: quality("MTEB 66.8", "MTEB 영어 평균", 66.8, "https://arxiv.org/abs/2402.09906", "공식 논문"),
  },
  "WhereIsAI/UAE-Large-V1": {
    ...cardDate("2023-12-04"),
    qualityBenchmark: quality("MTEB 64.64", "MTEB Leaderboard average", 64.64, "https://huggingface.co/WhereIsAI/UAE-Large-V1", "공식 발표"),
  },
  "NovaSearch/stella_en_1.5B_v5": cardDate("2024-07-12"),
  "NovaSearch/stella_en_400M_v5": cardDate("2024-07-12"),
  "nomic-ai/nomic-embed-text-v2-moe": {
    ...cardDate("2025-04-30"),
    qualityBenchmark: quality("BEIR 52.86", "BEIR 평균", 52.86, "https://huggingface.co/nomic-ai/nomic-embed-text-v2-moe", "공식 발표"),
  },
  "nomic-ai/modernbert-embed-base": {
    ...cardDate("2024-12-29"),
    qualityBenchmark: quality("MTEB 62.62", "MTEB 평균(56개 데이터셋)", 62.62, "https://huggingface.co/nomic-ai/modernbert-embed-base", "공식 발표"),
  },
  "ibm-granite/granite-embedding-311m-multilingual-r2": {
    ...cardDate("2026-04-20"),
    qualityBenchmark: quality("MTEB-Retrieval 65.2", "MTEB 다국어 검색(18개 태스크) 평균", 65.2, "https://huggingface.co/ibm-granite/granite-embedding-311m-multilingual-r2", "공식 발표"),
  },
  "ibm-granite/granite-embedding-97m-multilingual-r2": {
    ...cardDate("2026-04-20"),
    qualityBenchmark: quality("MTEB-Retrieval 60.3", "MTEB 다국어 검색(18개 태스크) 평균", 60.3, "https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2", "공식 발표"),
  },
  "ibm-granite/granite-embedding-english-r2": {
    ...cardDate("2025-07-17"),
    qualityBenchmark: quality("Avg 59.5", "MTEB-v2 Retrieval/CoIR/MLDR/LongEmbed/TableIR/MTRAG average", 59.5, "https://huggingface.co/ibm-granite/granite-embedding-english-r2"),
  },
  "ibm-granite/granite-embedding-small-english-r2": {
    ...cardDate("2025-07-17"),
    qualityBenchmark: quality("MTEB-v2 61.1", "MTEB-v2 영어(41개 태스크) 평균", 61.1, "https://huggingface.co/ibm-granite/granite-embedding-small-english-r2", "공식 발표"),
  },
  "ibm-granite/granite-embedding-278m-multilingual": {
    ...cardDate("2024-12-04"),
    qualityBenchmark: quality("MTEB-Retrieval 52.2", "MTEB 다국어 검색(18개 태스크) 평균", 52.2, "https://huggingface.co/ibm-granite/granite-embedding-311m-multilingual-r2", "공식 비교표"),
  },
  "ibm-granite/granite-embedding-107m-multilingual": {
    ...cardDate("2024-12-04"),
    qualityBenchmark: quality("MTEB-Retrieval 48.1", "MTEB 다국어 검색(18개 태스크) 평균", 48.1, "https://huggingface.co/ibm-granite/granite-embedding-311m-multilingual-r2", "공식 비교표"),
  },
  "nlpai-lab/KURE-v1": {
    ...cardDate("2024-12-18"),
    qualityBenchmark: quality("NDCG@10 69.47", "한국어 검색 벤치마크 평균 NDCG@10 (top-k10)", 69.47, "https://huggingface.co/nlpai-lab/KURE-v1", "공식 발표"),
  },
  "nlpai-lab/KoE5": {
    ...cardDate("2024-09-24"),
    qualityBenchmark: quality("NDCG@10 66.01", "한국어 검색 8개 벤치마크 평균 NDCG@10", 66.01, "https://huggingface.co/nlpai-lab/KoE5", "공식 발표"),
  },
  "dragonkue/BGE-m3-ko": {
    ...cardDate("2024-09-17"),
    qualityBenchmark: quality("NDCG@10 68.33", "MIRACL-ko cosine NDCG@10", 68.33, "https://huggingface.co/dragonkue/BGE-m3-ko", "공식 발표"),
  },
  "dragonkue/snowflake-arctic-embed-l-v2.0-ko": {
    ...cardDate("2025-03-07"),
    qualityBenchmark: quality("NDCG@10 74.04", "한국어 검색 벤치마크(7개) 평균 NDCG@10", 74.04, "https://huggingface.co/dragonkue/snowflake-arctic-embed-l-v2.0-ko", "공식 발표"),
  },
  "dragonkue/multilingual-e5-small-ko-v2": {
    ...cardDate("2025-06-10"),
    qualityBenchmark: quality("NDCG@10 69.25", "한국어 검색 벤치마크 평균 NDCG@10", 69.25, "https://huggingface.co/dragonkue/multilingual-e5-small-ko-v2", "공식 발표"),
  },
  "dragonkue/colbert-ko-0.1b": {
    ...cardDate("2026-01-25"),
    qualityBenchmark: quality("NDCG@10 73.7", "AutoRAG/Ko-StrategyQA/NanoBEIR-Ko 평균 NDCG@10 (dim128)", 73.7, "https://huggingface.co/dragonkue/colbert-ko-0.1b", "공식 발표"),
  },
  "maidalun1020/bce-embedding-base_v1": {
    ...cardDate("2023-12-29"),
    qualityBenchmark: quality("MTEB 59.43", "MTEB 119개 이중/교차언어 데이터셋 평균", 59.43, "https://huggingface.co/maidalun1020/bce-embedding-base_v1", "공식 발표"),
  },
  "sentence-transformers/paraphrase-multilingual-mpnet-base-v2": {
    ...cardDate("2022-03-02"),
    qualityBenchmark: quality(
      "MTEB 54.71",
      "MTEB 영어 56개 데이터셋 평균",
      54.71,
      "https://aclanthology.org/2023.eacl-main.148/",
      "공식 벤치마크 논문",
    ),
  },
  "sentence-transformers/multi-qa-mpnet-base-dot-v1": {
    ...cardDate("2022-03-02"),
    qualityBenchmark: quality("Avg 57.60", "Semantic Search 6개 데이터셋 평균", 57.6, "https://www.sbert.net/docs/sentence_transformer/pretrained_models.html", "공식 발표"),
  },

  "Qwen/Qwen3-Reranker-0.6B": {
    ...cardDate("2025-05-29"),
    qualityBenchmark: quality("MTEB-R 65.80", "MTEB-R (retrieval subset) average", 65.8, "https://huggingface.co/Qwen/Qwen3-Reranker-0.6B", "공식 발표"),
  },
  "Qwen/Qwen3-Reranker-4B": {
    ...cardDate("2025-06-03"),
    qualityBenchmark: quality("MTEB-R 69.76", "MTEB-R (retrieval subset) average", 69.76, "https://huggingface.co/Qwen/Qwen3-Reranker-0.6B", "공식 발표"),
  },
  "Qwen/Qwen3-Reranker-8B": {
    ...cardDate("2025-05-29"),
    qualityBenchmark: quality("MTEB-R 69.02", "MTEB-R (retrieval subset) average", 69.02, "https://huggingface.co/Qwen/Qwen3-Reranker-0.6B", "공식 발표"),
  },
  "BAAI/bge-reranker-v2-minicpm-layerwise": cardDate("2024-03-16"),
  "Alibaba-NLP/gte-multilingual-reranker-base": {
    ...cardDate("2024-07-20"),
    qualityBenchmark: quality("MTEB-R 59.51", "MTEB-R (retrieval subset) average", 59.51, "https://huggingface.co/Qwen/Qwen3-Reranker-0.6B", "외부 비교"),
  },
  "BAAI/bge-reranker-large": {
    ...cardDate("2023-09-12"),
    qualityBenchmark: quality("Avg 66.09", "C-MTEB Reranking 6개 태스크 평균", 66.09, "https://huggingface.co/BAAI/bge-large-en-v1.5", "공식 발표"),
  },
  "BAAI/bge-reranker-base": {
    ...cardDate("2023-09-11"),
    qualityBenchmark: quality("Avg 65.42", "C-MTEB Reranking 6개 태스크 평균", 65.42, "https://huggingface.co/BAAI/bge-large-en-v1.5", "공식 발표"),
  },
  "cross-encoder/ms-marco-MiniLM-L-12-v2": {
    ...cardDate("2022-03-02"),
    qualityBenchmark: quality("NDCG@10 74.31", "TREC DL 2019 NDCG@10", 74.31, "https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2", "공식 발표"),
  },
  "cross-encoder/ms-marco-MiniLM-L-6-v2": {
    ...cardDate("2022-03-02"),
    qualityBenchmark: quality("NDCG@10 74.30", "TREC DL 2019 NDCG@10", 74.3, "https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2", "공식 발표"),
  },
  "cross-encoder/mmarco-mMiniLMv2-L12-H384-v1": cardDate("2022-06-01"),
  "BAAI/bge-reranker-v2.5-gemma2-lightweight": {
    ...cardDate("2024-07-25"),
    qualityBenchmark: quality("BEIR 63.67", "BEIR 15개 데이터셋 nDCG@10 평균", 63.67, "https://huggingface.co/BAAI/bge-reranker-v2.5-gemma2-lightweight", "공식 발표"),
  },
  "Alibaba-NLP/gte-reranker-modernbert-base": {
    ...cardDate("2025-01-20"),
    qualityBenchmark: quality("BEIR 56.73", "BEIR nDCG@10 15개 데이터셋 평균", 56.73, "https://huggingface.co/Alibaba-NLP/gte-reranker-modernbert-base", "공식 발표"),
  },
  "ibm-granite/granite-embedding-reranker-english-r2": {
    ...cardDate("2025-08-04"),
    qualityBenchmark: quality("BEIR 55.8", "BEIR 평균 (granite-embedding-english-r2 retriever)", 55.8, "https://huggingface.co/ibm-granite/granite-embedding-reranker-english-r2", "공식 발표"),
  },
  "jinaai/jina-reranker-v1-tiny-en": {
    ...cardDate("2024-04-15"),
    qualityBenchmark: quality("NDCG@10 48.54", "BEIR 17개 데이터셋 NDCG@10 평균", 48.54, "https://huggingface.co/jinaai/jina-reranker-v1-turbo-en", "공식 발표"),
  },
  "jinaai/jina-reranker-v1-turbo-en": {
    ...cardDate("2024-04-15"),
    qualityBenchmark: quality("NDCG@10 49.60", "BEIR 17개 데이터셋 NDCG@10 평균", 49.6, "https://huggingface.co/jinaai/jina-reranker-v1-turbo-en", "공식 발표"),
  },
  "maidalun1020/bce-reranker-base_v1": {
    ...cardDate("2023-12-29"),
    qualityBenchmark: quality("Avg 61.29", "MTEB Reranking 12개 데이터셋(다국어) 평균", 61.29, "https://huggingface.co/maidalun1020/bce-reranker-base_v1", "공식 발표"),
  },
  "dragonkue/bge-reranker-v2-m3-ko": {
    ...cardDate("2024-10-16"),
    qualityBenchmark: quality("F1 91.23", "한국어 금융 벤치마크 Top-1 F1 (AutoRAG)", 91.23, "https://huggingface.co/dragonkue/bge-reranker-v2-m3-ko", "공식 발표"),
  },
  "upskyy/ko-reranker-8k": {
    ...cardDate("2024-08-16"),
    qualityBenchmark: quality("F1 86.84", "한국어 금융 벤치마크 Top-1 F1 (AutoRAG)", 86.84, "https://huggingface.co/dragonkue/bge-reranker-v2-m3-ko", "외부 비교"),
  },
  "upskyy/ko-reranker": {
    ...cardDate("2024-08-16"),
    qualityBenchmark: quality("F1 83.33", "한국어 금융 벤치마크 Top-1 F1 (AutoRAG)", 83.33, "https://huggingface.co/dragonkue/bge-reranker-v2-m3-ko", "외부 비교"),
  },
  "Dongjin-kr/ko-reranker": {
    ...cardDate("2023-12-22"),
    qualityBenchmark: quality("F1 85.09", "한국어 금융 벤치마크 Top-1 F1 (AutoRAG)", 85.09, "https://huggingface.co/dragonkue/bge-reranker-v2-m3-ko", "외부 비교"),
  },
  "cross-encoder/ms-marco-MiniLM-L-4-v2": {
    ...cardDate("2022-03-02"),
    qualityBenchmark: quality("NDCG@10 73.04", "TREC DL 2019 NDCG@10", 73.04, "https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2", "공식 발표"),
  },
  "cross-encoder/ms-marco-MiniLM-L-2-v2": {
    ...cardDate("2022-03-02"),
    qualityBenchmark: quality("NDCG@10 71.01", "TREC DL 2019 NDCG@10", 71.01, "https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2", "공식 발표"),
  },
  "cross-encoder/ms-marco-electra-base": {
    ...cardDate("2022-03-02"),
    qualityBenchmark: quality("NDCG@10 71.99", "TREC DL 2019 NDCG@10", 71.99, "https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2", "공식 발표"),
  },
  "cross-encoder/stsb-roberta-large": {
    ...cardDate("2022-03-02"),
    qualityBenchmark: quality("STSb 91.47", "STSbenchmark 테스트 성능", 91.47, "https://www.sbert.net/docs/pretrained_cross-encoders.html", "공식 발표"),
  },
  "cross-encoder/nli-deberta-v3-base": {
    ...cardDate("2022-03-02"),
    qualityBenchmark: quality("Acc 90.04", "MNLI mismatched 정확도", 90.04, "https://huggingface.co/cross-encoder/nli-deberta-v3-base", "공식 발표"),
  },
  "cross-encoder/quora-roberta-base": {
    ...cardDate("2022-03-02"),
    qualityBenchmark: quality("AP 87.80", "Quora Duplicate Questions dev set Average Precision", 87.8, "https://www.sbert.net/docs/pretrained_cross-encoders.html", "공식 발표"),
  },
  "cross-encoder/ms-marco-TinyBERT-L-2-v2": {
    ...cardDate("2022-03-02"),
    qualityBenchmark: quality("NDCG@10 69.84", "TREC DL 2019 NDCG@10", 69.84, "https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2", "공식 발표"),
  },

  "rednote-hilab/dots.mocr": {
    ...cardDate("2026-03-19"),
    qualityBenchmark: quality("olmOCR-bench 83.9", "olmOCR-bench Overall", 83.9, "https://huggingface.co/rednote-hilab/dots.mocr", "공식 발표"),
  },
  "allenai/olmOCR-2-7B-1025": {
    ...cardDate("2025-10-06"),
    qualityBenchmark: quality("olmOCR-bench 82.3", "olmOCR-bench Overall", 82.3, "https://huggingface.co/allenai/olmOCR-2-7B-1025", "공식 발표"),
  },
  "Qwen/Qwen3-VL-2B-Instruct": {
    ...cardDate("2025-10-19"),
    qualityBenchmark: quality("DocVQA 93.3", "DocVQA (test)", 93.3, "https://arxiv.org/pdf/2511.21631", "공식 논문"),
  },
  "Qwen/Qwen3-VL-8B-Instruct": {
    ...cardDate("2025-10-11"),
    qualityBenchmark: quality("OCRBench 896", "OCRBench", 896, "https://arxiv.org/pdf/2511.21631", "공식 논문"),
  },
  "deepseek-ai/deepseek-vl2-tiny": {
    ...cardDate("2024-12-13"),
    qualityBenchmark: quality("OCRBench 809", "OCRBench", 809, "https://arxiv.org/pdf/2412.10302", "공식 논문"),
  },
  "deepseek-ai/deepseek-vl2-small": {
    ...cardDate("2024-12-13"),
    qualityBenchmark: quality("OCRBench 834", "OCRBench", 834, "https://arxiv.org/pdf/2412.10302", "공식 논문"),
  },
  "deepseek-ai/deepseek-vl-7b-chat": {
    ...cardDate("2024-03-07"),
    qualityBenchmark: quality("OCRBench 456", "OCRBench", 456, "https://arxiv.org/pdf/2412.10302", "공식 논문(DeepSeek-VL2 비교표)"),
  },
  "Qwen/Qwen2.5-VL-3B-Instruct": {
    ...cardDate("2025-01-26"),
    qualityBenchmark: quality("DocVQA 93.9", "DocVQA (test)", 93.9, "https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct", "공식 발표"),
  },
  "Qwen/Qwen2.5-VL-7B-Instruct": {
    ...cardDate("2025-01-26"),
    qualityBenchmark: quality("OCRBench 864", "OCRBench", 864, "https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct", "공식 발표"),
  },
  "Qwen/Qwen2-VL-2B-Instruct": {
    ...cardDate("2024-08-28"),
    qualityBenchmark: quality("OCRBench 794", "OCRBench", 794, "https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct", "공식 발표"),
  },
  "Qwen/Qwen2-VL-7B-Instruct": {
    ...cardDate("2024-08-28"),
    qualityBenchmark: quality("OCRBench 845", "OCRBench", 845, "https://huggingface.co/Qwen/Qwen2-VL-7B-Instruct", "공식 발표"),
  },
  "meta-llama/Llama-3.2-11B-Vision-Instruct": {
    ...cardDate("2024-09-18"),
    qualityBenchmark: quality("DocVQA(ANLS) 88.4", "DocVQA (test, ANLS)", 88.4, "https://huggingface.co/meta-llama/Llama-3.2-11B-Vision-Instruct", "공식 발표"),
  },
  "meta-llama/Llama-3.2-90B-Vision-Instruct": {
    ...cardDate("2024-09-19"),
    qualityBenchmark: quality("DocVQA(ANLS) 90.1", "DocVQA (test, ANLS)", 90.1, "https://huggingface.co/meta-llama/Llama-3.2-11B-Vision-Instruct", "공식 비교표"),
  },
  "mistralai/Pixtral-12B-Base-2409": {
    ...cardDate("2024-10-17"),
    qualityBenchmark: quality("DocVQA(ANLS) 90.7", "DocVQA (ANLS)", 90.7, "https://mistral.ai/news/pixtral-12b/", "공식 발표"),
  },
  "mistralai/Pixtral-Large-Instruct-2411": {
    ...cardDate("2024-11-14"),
    qualityBenchmark: quality("MathVista 69.4", "MathVista (CoT)", 69.4, "https://mistral.ai/news/pixtral-large/", "공식 발표"),
  },
  "llava-hf/llava-onevision-qwen2-7b-ov-hf": {
    ...cardDate("2024-08-13"),
    qualityBenchmark: quality("MMMU 48.8", "MMMU (val)", 48.8, "https://arxiv.org/abs/2408.03326", "공식 논문"),
  },
  "llava-hf/llava-onevision-qwen2-72b-ov-hf": {
    ...cardDate("2024-08-13"),
    qualityBenchmark: quality("MMMU 56.8", "MMMU (val)", 56.8, "https://arxiv.org/abs/2408.03326", "공식 논문"),
  },
  "allenai/Molmo-7B-D-0924": {
    ...cardDate("2024-09-25"),
    qualityBenchmark: quality("Avg 77.3", "학술 벤치마크 11종 평균", 77.3, "https://huggingface.co/allenai/Molmo-7B-D-0924", "공식 발표"),
  },
  "allenai/Molmo-72B-0924": {
    ...cardDate("2024-09-25"),
    qualityBenchmark: quality("Avg 81.2", "학술 벤치마크 11종 평균", 81.2, "https://huggingface.co/allenai/Molmo-72B-0924", "공식 발표"),
  },
  "HuggingFaceTB/SmolVLM2-2.2B-Instruct": {
    ...cardDate("2025-02-08"),
    qualityBenchmark: quality("DocVQA 79.98", "DocVQA (val)", 79.98, "https://huggingface.co/HuggingFaceTB/SmolVLM2-2.2B-Instruct", "공식 발표"),
  },
  "HuggingFaceTB/SmolVLM2-500M-Video-Instruct": cardDate("2025-02-11"),
  "microsoft/Phi-4-multimodal-instruct": {
    ...cardDate("2025-02-24"),
    qualityBenchmark: quality("DocVQA 93.2", "DocVQA", 93.2, "https://huggingface.co/microsoft/Phi-4-multimodal-instruct", "공식 발표"),
  },
  "CohereLabs/aya-vision-8b": {
    ...cardDate("2025-03-02"),
    qualityBenchmark: quality("mWildVision 최대 승률 81%", "mWildVision 23개 언어 평균 pairwise win-rate (최대)", 81, "https://huggingface.co/blog/aya-vision", "공식 발표"),
  },
  "CohereLabs/aya-vision-32b": {
    ...cardDate("2025-03-02"),
    qualityBenchmark: quality("mWildVision 최대 승률 72%", "mWildVision 23개 언어 평균 pairwise win-rate (최대)", 72, "https://huggingface.co/blog/aya-vision", "공식 발표"),
  },
  "zai-org/GLM-4.1V-9B-Thinking": {
    ...cardDate("2025-06-28"),
    qualityBenchmark: quality("MMMU 68.0", "MMMU (val)", 68, "https://arxiv.org/abs/2507.01006", "공식 기술 보고서"),
  },
  "zai-org/glm-4v-9b": {
    ...cardDate("2024-06-04"),
    qualityBenchmark: quality("OCRBench 786", "OCRBench", 786, "https://huggingface.co/zai-org/glm-4v-9b", "공식 발표"),
  },
  "openbmb/MiniCPM-V-4.6": cardDate("2026-04-13"),
  "OpenGVLab/InternVL3_5-4B": {
    ...cardDate("2025-08-25"),
    qualityBenchmark: quality("Reasoning Avg 57.4", "멀티모달 추론 7개 벤치마크 평균", 57.4, "https://arxiv.org/abs/2508.18265", "공식 논문"),
  },
  "OpenGVLab/InternVL3_5-8B": {
    ...cardDate("2025-08-25"),
    qualityBenchmark: quality("MMMU 73.4", "MMMU", 73.4, "https://arxiv.org/abs/2508.18265", "공식 논문"),
  },
  "moonshotai/Kimi-VL-A3B-Instruct": {
    ...cardDate("2025-04-09"),
    qualityBenchmark: quality("OCRBench 867", "OCRBench", 867, "https://huggingface.co/moonshotai/Kimi-VL-A3B-Instruct", "공식 발표"),
  },
});

mergeModelMetadata({
  "Ministral 3B Instruct": {
    releaseDate: "2024-10-09",
    sourceUrl: "https://docs.mistral.ai/models/model-cards/ministral-3b-24-1",
    qualityBenchmark: quality(
      "HumanEval 77.4",
      "HumanEval pass@1",
      77.4,
      "https://huggingface.co/mistralai/Ministral-8B-Instruct-2410",
      "공식 모델 카드",
    ),
  },
  "GLM-4 9B Chat": {
    releaseDate: "2024-06-05",
    sourceUrl: "https://github.com/zai-org/GLM-4",
    qualityBenchmark: quality("MMLU 72.4", "MMLU", 72.4, "https://huggingface.co/THUDM/glm-4-9b-chat", "공식 발표"),
  },
  "Yi 1.5 9B Chat": {
    releaseDate: "2024-05",
    sourceUrl: "https://huggingface.co/01-ai/Yi-1.5-9B",
    qualityBenchmark: quality("MMLU-Pro 45.95", "MMLU-Pro (Open LLM Leaderboard 연동)", 45.95, "https://huggingface.co/01-ai/Yi-1.5-9B-Chat", "공식 카드"),
  },
  "Yi 1.5 34B Chat": {
    releaseDate: "2024-05",
    sourceUrl: "https://huggingface.co/01-ai/Yi-1.5-9B",
    qualityBenchmark: quality("MMLU-Pro 52.29", "MMLU-Pro (Open LLM Leaderboard 연동)", 52.29, "https://huggingface.co/01-ai/Yi-1.5-34B-Chat", "공식 카드"),
  },
  "EEVE Korean 10.8B": {
    releaseDate: "2024-02-22",
    sourceUrl: "https://huggingface.co/yanolja/EEVE-Korean-10.8B-v1.0",
    qualityBenchmark: quality("LogicKor 5.86", "LogicKor overall", 5.86, "https://lk.instruct.kr/", "외부 한국어"),
  },
  "Llama-3-Korean-Bllossom-8B": {
    releaseDate: "2024-06-18",
    sourceUrl: "https://huggingface.co/MLP-KTLim/llama-3-Korean-Bllossom-8B",
    qualityBenchmark: quality("LogicKor 6.93", "LogicKor overall", 6.93, "https://huggingface.co/MLP-KTLim/llama-3-Korean-Bllossom-8B", "공식 한국어"),
  },
  "Llama-3-Korean-Bllossom-70B": {
    releaseDate: "2024-04-25",
    sourceUrl: "https://huggingface.co/Bllossom/llama-3-Korean-Bllossom-70B",
    qualityBenchmark: quality("LogicKor 5.85", "LogicKor overall", 5.85, "https://lk.instruct.kr/", "외부 한국어"),
  },
  "HyperCLOVAX SEED Think 14B": {
    releaseDate: "2025-07-21",
    sourceUrl: "https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Think-14B",
    qualityBenchmark: quality("Korean Avg 0.7269", "Korean/culture benchmark average", 0.7269, "https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Think-14B", "공식 한국어"),
  },
  "Zephyr 7B Beta": {
    releaseDate: "2023-10-26",
    sourceUrl: "https://huggingface.co/HuggingFaceH4/zephyr-7b-beta",
    qualityBenchmark: quality("MT-Bench 7.34", "MT-Bench score", 7.34, "https://huggingface.co/HuggingFaceH4/zephyr-7b-beta", "공개 평가"),
  },
  "OpenChat 3.5 7B": {
    releaseDate: "2024-01-06",
    sourceUrl: "https://huggingface.co/openchat/openchat-3.5-0106",
    qualityBenchmark: quality("Avg 64.5", "OpenChat benchmark average", 64.5, "https://huggingface.co/openchat/openchat-3.5-0106", "공식 평가"),
  },
  "Nous Hermes 3 Llama 3.1 8B": {
    releaseDate: "2024-08-15",
    sourceUrl: "https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-8B",
    qualityBenchmark: quality("MMLU-Pro 23.77", "Open LLM Leaderboard MMLU-Pro", 23.77, "https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-8B", "공개 평가"),
  },
  "Vicuna 13B v1.5": {
    releaseDate: "2023-07-29",
    sourceUrl: "https://huggingface.co/lmsys/vicuna-13b-v1.5",
  },
  "EXAONE Deep 7.8B": {
    releaseDate: "2025-02-06",
    sourceUrl: "https://huggingface.co/LGAI-EXAONE/EXAONE-Deep-7.8B",
    qualityBenchmark: quality("AIME24 70.0", "AIME 2024 pass@1", 70, "https://huggingface.co/OpenLLM-Korea/EXAONE-Deep-32B", "공식/미러"),
  },
  "EXAONE Deep 32B": {
    releaseDate: "2025-02-06",
    sourceUrl: "https://huggingface.co/LGAI-EXAONE/EXAONE-Deep-32B",
    qualityBenchmark: quality("AIME24 72.1", "AIME 2024 pass@1", 72.1, "https://huggingface.co/OpenLLM-Korea/EXAONE-Deep-32B", "공식/미러"),
  },
  "Devstral 2 123B": {
    releaseDate: "2025-12-09",
    sourceUrl: "https://docs.mistral.ai/resources/changelogs",
    qualityBenchmark: quality("SWE-bench 72.2", "SWE-bench Verified", 72.2, "https://mistral.ai/news/devstral-2-vibe-cli/", "공식 발표"),
  },
  "DeepSeek V3.2": {
    releaseDate: "2025-12-01",
    sourceUrl: "https://api-docs.deepseek.com/news/news251201",
    qualityBenchmark: quality("GPQA-D 82.4", "GPQA Diamond", 82.4, "https://huggingface.co/deepseek-ai/DeepSeek-V3.2", "공식 카드"),
  },
  "Kimi K2": {
    releaseDate: "2025-07-11",
    sourceUrl: "https://huggingface.co/moonshotai/Kimi-K2-Instruct",
    qualityBenchmark: quality("MMLU-Pro 81", "MMLU-Pro", 81, "https://huggingface.co/moonshotai/Kimi-K2-Instruct", "공개 평가"),
  },
  "Kimi K2 Thinking": {
    releaseDate: "2025-11-08",
    sourceUrl: "https://platform.kimi.ai/blog/posts/Kimi_API_Newsletter",
    qualityBenchmark: quality("MMLU-Pro 84.6", "MMLU-Pro (no tools)", 84.6, "https://huggingface.co/moonshotai/Kimi-K2-Thinking", "공식 카드"),
  },
  "Kimi K2.7 Code": {
    releaseDate: "2026-06-12",
    sourceUrl: "https://huggingface.co/moonshotai/Kimi-K2.7-Code",
    qualityBenchmark: quality("SWE-bench Verified 60.4", "SWE-bench Verified (벤더 자체 발표)", 60.4, "https://huggingface.co/moonshotai/Kimi-K2.7-Code", "공식 발표"),
  },
  "Kimi K3": {
    releaseDate: "2026-07-26",
    sourceUrl: "https://huggingface.co/moonshotai/Kimi-K3",
    qualityBenchmark: quality("MMLU-Pro 78.5", "MMLU-Pro", 78.5, "https://huggingface.co/moonshotai/Kimi-K3", "공개 평가"),
  },
  "Ling 3.0 Flash": {
    releaseDate: "2026-08-07",
    sourceUrl: "https://huggingface.co/inclusionAI/Ling-3.0-flash",
    qualityBenchmark: quality("SWE-Bench Multilingual 72.4", "SWE-Bench Multilingual (resolved %)", 72.4, "https://huggingface.co/inclusionAI/Ling-3.0-flash", "공식 카드"),
  },
  "Nemotron 3 Super 120B A12B": {
    releaseDate: "2026-03-11",
    sourceUrl: "https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16",
    qualityBenchmark: quality("MMLU-Pro 83.7", "MMLU-Pro", 83.7, "https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16", "공개 평가"),
  },
  "Laguna XS 2.1 33B A3B": {
    releaseDate: "2026-07-02",
    sourceUrl: "https://poolside.ai/blog/introducing-laguna-xs-2-1",
    qualityBenchmark: quality("SWE-bench Verified 70.9", "SWE-bench Verified", 70.9, "https://poolside.ai/blog/introducing-laguna-xs-2-1", "공식 발표"),
  },
  "GLM-5.2": {
    releaseDate: "2026-06-16",
    sourceUrl: "https://docs.bigmodel.cn/cn/update/new-releases",
    qualityBenchmark: quality("GPQA-D 91.2", "GPQA Diamond", 91.2, "https://z.ai/blog/glm-5.2", "공식 발표"),
  },
  "DeepSeek V4-Pro": {
    releaseDate: "2026-04-24",
    sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro",
    qualityBenchmark: quality("MMLU-Pro 73.5", "MMLU-Pro (EM, 5-shot, base model)", 73.5, "https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro", "공식 카드"),
  },
  "DeepSeek V4-Flash": {
    releaseDate: "2026-04-24",
    sourceUrl: "https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash",
    qualityBenchmark: quality("MMLU-Pro 68.3", "MMLU-Pro (EM, 5-shot, base model)", 68.3, "https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash", "공식 카드"),
  },
  "Solar Open 2 250B A15B": {
    releaseDate: "2026-07-24",
    sourceUrl: "https://huggingface.co/upstage/Solar-Open2-250B",
    qualityBenchmark: quality("KMMLU-Pro 78.4", "KMMLU-Pro", 78.4, "https://huggingface.co/upstage/Solar-Open2-250B", "공식 카드"),
  },
  "GPT-OSS 20B": {
    releaseDate: "2025-08-05",
    sourceUrl: "https://openai.com/index/introducing-gpt-oss/",
    qualityBenchmark: quality("MMLU 85.3", "MMLU (high reasoning effort)", 85.3, "https://arxiv.org/abs/2508.10925", "공식 모델 카드"),
  },
  "GPT-OSS 120B": {
    releaseDate: "2025-08-05",
    sourceUrl: "https://openai.com/index/introducing-gpt-oss/",
    qualityBenchmark: quality("MMLU 90.0", "MMLU (high reasoning effort)", 90, "https://arxiv.org/abs/2508.10925", "공식 모델 카드"),
  },
  "Llama 4 Scout 17B Active": {
    releaseDate: "2025-04-05",
    sourceUrl: "https://huggingface.co/meta-llama/Llama-4-Maverick-17B-128E",
    qualityBenchmark: quality("MMLU-Pro 74.3", "MMLU Pro instruction", 74.3, "https://huggingface.co/meta-llama/Llama-4-Maverick-17B-128E", "공식 평가"),
  },
  "Llama 4 Maverick 17B Active": {
    releaseDate: "2025-04-05",
    sourceUrl: "https://huggingface.co/meta-llama/Llama-4-Maverick-17B-128E",
    qualityBenchmark: quality("MMLU-Pro 80.5", "MMLU Pro instruction", 80.5, "https://huggingface.co/meta-llama/Llama-4-Maverick-17B-128E", "공식 평가"),
  },
  "Gemma 4 E2B IT Thinking": {
    releaseDate: "2026-03-31",
    sourceUrl: "https://ai.google.dev/gemma/docs/releases",
    qualityBenchmark: quality("MMMLU 60.0", "MMMLU multilingual Q&A", 60, "https://deepmind.google/models/gemma/gemma-4/", "공식 평가"),
  },
  "Gemma 4 E4B IT Thinking": {
    releaseDate: "2026-03-31",
    sourceUrl: "https://ai.google.dev/gemma/docs/releases",
    qualityBenchmark: quality("MMMLU 69.4", "MMMLU multilingual Q&A", 69.4, "https://deepmind.google/models/gemma/gemma-4/", "공식 평가"),
  },
  "Gemma 4 12B IT Thinking": {
    releaseDate: "2026-06-03",
    sourceUrl: "https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/",
    qualityBenchmark: quality("MMLU-Pro 77.2", "MMLU-Pro", 77.2, "https://huggingface.co/google/gemma-4-12B-it", "공식 카드"),
  },
  "Gemma 4 26B A4B IT Thinking": {
    releaseDate: "2026-03-31",
    sourceUrl: "https://ai.google.dev/gemma/docs/releases",
    qualityBenchmark: quality("MMMLU 82.6", "MMMLU multilingual Q&A", 82.6, "https://deepmind.google/models/gemma/gemma-4/", "공식 평가"),
  },
  "Gemma 4 31B IT Thinking": {
    releaseDate: "2026-03-31",
    sourceUrl: "https://ai.google.dev/gemma/docs/releases",
    qualityBenchmark: quality("MMMLU 85.2", "MMMLU multilingual Q&A", 85.2, "https://deepmind.google/models/gemma/gemma-4/", "공식 평가"),
  },
  "Qwen3-Next 80B A3B Instruct": {
    releaseDate: "2025-09-10",
    sourceUrl: "https://qwen.ai/blog?from=research.latest-&id=4074cca80393150c248e508aa62983f9cb7d27cd",
    qualityBenchmark: quality("MMLU-Pro 80.6", "MMLU-Pro", 80.6, "https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct"),
  },
  "Qwen3.5 27B": {
    releaseDate: "2026-02-24",
    sourceUrl: "https://github.com/QwenLM/Qwen3.6/blob/main/README.md",
    qualityBenchmark: quality("MMLU-Pro 86.1", "MMLU-Pro", 86.1, "https://huggingface.co/Qwen/Qwen3.5-35B-A3B", "공식 비교표"),
  },
  "Qwen3.5 35B A3B": {
    releaseDate: "2026-02-24",
    sourceUrl: "https://github.com/QwenLM/Qwen3.6/blob/main/README.md",
    qualityBenchmark: quality("MMLU-Pro 85.3", "MMLU-Pro", 85.3, "https://huggingface.co/Qwen/Qwen3.5-35B-A3B", "공식 카드"),
  },
  "Qwen3.5 122B A10B": {
    releaseDate: "2026-02-24",
    sourceUrl: "https://github.com/QwenLM/Qwen3.6/blob/main/README.md",
    qualityBenchmark: quality("MMLU-Pro 86.7", "MMLU-Pro", 86.7, "https://huggingface.co/Qwen/Qwen3.5-35B-A3B", "공식 비교표"),
  },
  "Qwen3.5 397B A17B": {
    releaseDate: "2026-02-16",
    sourceUrl: "https://home.alibabagroup.com/en-US/document-1960233590314762240",
    qualityBenchmark: quality("MMLU-Pro 87.8", "MMLU-Pro", 87.8, "https://huggingface.co/Qwen/Qwen3.6-27B", "공식 비교표"),
  },
  "Qwen3.6 27B": {
    releaseDate: "2026-04-22",
    sourceUrl: "https://github.com/QwenLM/Qwen3.6/blob/main/README.md",
    qualityBenchmark: quality("MMLU-Pro 86.2", "MMLU-Pro", 86.2, "https://huggingface.co/Qwen/Qwen3.6-27B", "공식 카드"),
  },
  "Qwen3.6 35B A3B": {
    releaseDate: "2026-04-16",
    sourceUrl: "https://github.com/QwenLM/Qwen3.6/blob/main/README.md",
    qualityBenchmark: quality("MMLU-Pro 85.2", "MMLU-Pro", 85.2, "https://huggingface.co/Qwen/Qwen3.6-35B-A3B", "공식 카드"),
  },
  "Qwen3.8 27B": {
    releaseDate: "2026-08-14",
    sourceUrl: "https://huggingface.co/Qwen/Qwen3.8-27B",
    qualityBenchmark: quality("LiveCodeBench v6 90.3", "LiveCodeBench v6", 90.3, "https://huggingface.co/Qwen/Qwen3.8-27B", "공식 카드"),
  },
  "GLM-5.3-Flash": {
    releaseDate: "2026-08-25",
    releaseNote: "모델 카드",
    sourceUrl: "https://huggingface.co/zai-org/GLM-5.3-Flash",
    verifiedAt: "2026-09-30",
  },
  "Qwen3.8-Flash-Next": {
    releaseDate: "2026-08-25",
    sourceUrl: "https://huggingface.co/Qwen/Qwen3.8-Flash-Next",
    qualityBenchmark: quality("SWE-bench Pro 62.5", "SWE-bench Pro", 62.5, "https://huggingface.co/Qwen/Qwen3.8-Flash-Next", "공식 카드"),
  },
  "Muse Glimmer 30B": {
    releaseDate: "2026-08-18",
    sourceUrl: "https://huggingface.co/meta-models/Muse-Glimmer-30B",
  },
  "MiMo-V2.6 Distill Qwen 9B": {
    releaseDate: "2026-09-22",
    sourceUrl: "https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B",
    qualityBenchmark: quality("SWE-bench Pro 44.6", "SWE-bench Pro (avg@3)", 44.6, "https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B", "공식 기술 보고서"),
  },
  "Xing4.0 29B A4B": {
    releaseDate: "2026-09-16",
    sourceUrl: "https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B",
  },
  "MiMo-V2.6 Flash-RL": {
    releaseDate: "2026-09-22",
    sourceUrl: "https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL",
  },
  "MiMo-V2.6 Pro-RL": {
    releaseDate: "2026-09-22",
    sourceUrl: "https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL",
  },
  "Mistral Small 4 119B A6B": {
    releaseDate: "2026-03-16",
    sourceUrl: "https://legal.mistral.ai/ai-governance/models",
  },
  "Mistral Medium 3.5 128B": {
    releaseDate: "2026-04-29",
    sourceUrl: "https://legal.mistral.ai/ai-governance/models/mistral-medium-3",
    qualityBenchmark: quality("SWE-bench 77.6", "SWE-bench Verified", 77.6, "https://mistral.ai/news/vibe-remote-agents-mistral-medium-3-5", "공식 발표"),
  },
  "Mistral Large 3 675B A41B": {
    releaseDate: "2025-12-02",
    sourceUrl: "https://mistral.ai/fr/news/mistral-3/",
  },
  "Ministral 3 3B": {
    releaseDate: "2025-12-02",
    sourceUrl: "https://legal.mistral.ai/ai-governance/models/ministral-3-3b",
    qualityBenchmark: quality("MATH 83.0", "MATH maj@1 (Instruct)", 83, "https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512", "공식 카드"),
  },
  "Ministral 3 8B": {
    releaseDate: "2025-12-02",
    sourceUrl: "https://docs.mistral.ai/resources/changelogs",
    qualityBenchmark: quality("MATH 87.6", "MATH maj@1 (Instruct)", 87.6, "https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512", "공식 카드"),
  },
  "Ministral 3 14B": {
    releaseDate: "2025-12-02",
    sourceUrl: "https://docs.mistral.ai/resources/changelogs",
    qualityBenchmark: quality("MATH 90.4", "MATH maj@1 (Instruct)", 90.4, "https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512", "공식 카드"),
  },
  "Magistral Small 1.2 24B": {
    releaseDate: "2025-09-18",
    sourceUrl: "https://docs.mistral.ai/models/model-cards/magistral-small-1-2-25-09",
    qualityBenchmark: quality("AIME24 86.14", "AIME 2024 pass@1", 86.14, "https://huggingface.co/mistralai/Magistral-Small-2509", "공식 카드"),
  },
  "Granite 4.1 3B": {
    releaseDate: "2026-04-29",
    sourceUrl: "https://huggingface.co/ibm-granite/granite-4.1-3b",
    qualityBenchmark: quality("MMLU 67.02", "MMLU (5-shot)", 67.02, "https://huggingface.co/ibm-granite/granite-4.1-3b", "공식 카드"),
  },
  "Granite 4.1 8B": {
    releaseDate: "2026-04-29",
    sourceUrl: "https://research.ibm.com/blog/granite-4-1-ai-foundation-models",
    qualityBenchmark: quality("MMLU 73.84", "MMLU (5-shot)", 73.84, "https://huggingface.co/ibm-granite/granite-4.1-8b", "공식 카드"),
  },
  "Granite 4.2 3B": {
    releaseDate: "2026-08-25",
    sourceUrl: "https://huggingface.co/ibm-granite/granite-4.2-3b",
    qualityBenchmark: quality("MMLU-Pro 67.84", "MMLU-Pro", 67.84, "https://huggingface.co/ibm-granite/granite-4.2-8b", "공식 카드"),
  },
  "Granite 4.2 8B": {
    releaseDate: "2026-08-25",
    sourceUrl: "https://huggingface.co/ibm-granite/granite-4.2-8b",
    qualityBenchmark: quality("MMLU-Pro 74.04", "MMLU-Pro", 74.04, "https://huggingface.co/ibm-granite/granite-4.2-8b", "공식 카드"),
  },
  "Granite 4.2 30B": {
    releaseDate: "2026-08-25",
    sourceUrl: "https://huggingface.co/ibm-granite/granite-4.2-30b",
    qualityBenchmark: quality("MMLU-Pro 77.60", "MMLU-Pro", 77.60, "https://huggingface.co/ibm-granite/granite-4.2-8b", "공식 카드"),
  },
  "GLM-4.5 Air 106B A12B": {
    releaseDate: "2025-07-28",
    sourceUrl: "https://docs.z.ai/release-notes/new-released",
    qualityBenchmark: quality("Avg 59.8", "12-benchmark aggregate", 59.8, "https://huggingface.co/zai-org/GLM-4.5-Air", "공식 평가"),
  },
  "LLaVA 1.6 Mistral 7B": {
    releaseDate: "2024-01-30",
    sourceUrl: "https://huggingface.co/llava-hf/llava-v1.6-mistral-7b-hf",
    qualityBenchmark: quality("MMMU 35.3", "MMMU (val)", 35.3, "https://llava-vl.github.io/blog/2024-01-30-llava-next/", "공식 발표"),
  },
  "LLaVA-NeXT 34B": {
    releaseDate: "2024-01-30",
    sourceUrl: "https://huggingface.co/llava-hf/llava-v1.6-34b-hf",
    qualityBenchmark: quality("MMMU 51.1", "MMMU (val)", 51.1, "https://llava-vl.github.io/blog/2024-01-30-llava-next/", "공식 발표"),
  },
  "Liquid LFM 3B": {
    releaseDate: "2024-09-30",
    sourceUrl: "https://www.liquid.ai/blog/liquid-foundation-models-our-first-series-of-generative-ai-models",
    qualityBenchmark: quality("MMLU 66.16", "MMLU (5-shot)", 66.16, "https://www.liquid.ai/blog/liquid-foundation-models-our-first-series-of-generative-ai-models", "공식 발표"),
  },
  "Liquid LFM 40B": {
    releaseDate: "2024-09-30",
    sourceUrl: "https://www.liquid.ai/blog/liquid-foundation-models-our-first-series-of-generative-ai-models",
    qualityBenchmark: quality("MMLU 78.76", "MMLU (5-shot, MoE)", 78.76, "https://www.liquid.ai/blog/liquid-foundation-models-our-first-series-of-generative-ai-models", "공식 발표"),
  },
});

// 공식 모델 카드나 공식 발표에서 텍스트 수치로 직접 확인 가능한 추가 품질 지표입니다.
// 이미지 차트에만 있는 수치는 전사 과정의 오류를 피하기 위해 포함하지 않습니다.
mergeModelMetadata({
  "Qwen2.5 Coder 1.5B Instruct": {
    qualityBenchmark: quality(
      "HumanEval 70.7",
      "HumanEval pass@1",
      70.7,
      "https://arxiv.org/abs/2409.12186",
      "공식 기술 보고서",
    ),
  },
  "Qwen2.5 Coder 3B Instruct": {
    qualityBenchmark: quality(
      "HumanEval 84.1",
      "HumanEval pass@1",
      84.1,
      "https://arxiv.org/abs/2409.12186",
      "공식 기술 보고서",
    ),
  },
  "Qwen2.5 Coder 7B Instruct": {
    qualityBenchmark: quality(
      "HumanEval 88.4",
      "HumanEval pass@1",
      88.4,
      "https://arxiv.org/abs/2409.12186",
      "공식 기술 보고서",
    ),
  },
  "Qwen2.5 Coder 14B Instruct": {
    qualityBenchmark: quality(
      "HumanEval 89.6",
      "HumanEval pass@1",
      89.6,
      "https://arxiv.org/abs/2409.12186",
      "공식 기술 보고서",
    ),
  },
  "Qwen2.5 Coder 32B Instruct": {
    qualityBenchmark: quality(
      "HumanEval 92.7",
      "HumanEval pass@1",
      92.7,
      "https://arxiv.org/abs/2409.12186",
      "공식 기술 보고서",
    ),
  },
  "Codestral 22B": {
    qualityBenchmark: quality(
      "HumanEval 81.1",
      "HumanEval pass@1",
      81.1,
      "https://arxiv.org/abs/2409.12186",
      "공식 기술 보고서 비교",
    ),
  },
  "CodeLlama 7B Instruct": {
    qualityBenchmark: quality(
      "HumanEval 34.76",
      "HumanEval pass@1",
      34.756,
      "https://arxiv.org/abs/2308.12950",
      "공식 논문",
    ),
  },
  "CodeLlama 13B Instruct": {
    qualityBenchmark: quality(
      "HumanEval 42.68",
      "HumanEval pass@1",
      42.683,
      "https://arxiv.org/abs/2308.12950",
      "공식 논문",
    ),
  },
  "CodeLlama 34B Instruct": {
    qualityBenchmark: quality(
      "HumanEval 41.5",
      "HumanEval pass@1",
      41.5,
      "https://arxiv.org/abs/2308.12950",
      "공식 논문",
    ),
  },
  "OLMoE 1B-7B Instruct": {
    qualityBenchmark: quality(
      "MMLU 51.9",
      "MMLU",
      51.9,
      "https://huggingface.co/allenai/OLMoE-1B-7B-0924-Instruct",
      "공식 카드",
    ),
  },
  "Alibaba-NLP/gte-multilingual-base": {
    qualityBenchmark: quality(
      "MLDR-ko 46.73",
      "MLDR Korean nDCG@10",
      46.733,
      "https://huggingface.co/Alibaba-NLP/gte-multilingual-base",
      "공식 카드",
    ),
  },
  "BAAI/bge-multilingual-gemma2": {
    qualityBenchmark: quality(
      "AskUbuntu MAP 64.59",
      "MTEB AskUbuntu MAP",
      64.5946,
      "https://huggingface.co/BAAI/bge-multilingual-gemma2",
      "공식 카드",
    ),
  },
  "Salesforce/SFR-Embedding-2_R": {
    qualityBenchmark: quality(
      "STSBenchmark 83.60",
      "STSBenchmark cosine Spearman",
      83.6037,
      "https://huggingface.co/Salesforce/SFR-Embedding-2_R",
      "공식 카드",
    ),
  },
  "NovaSearch/stella_en_1.5B_v5": {
    qualityBenchmark: quality(
      "STSBenchmark 88.23",
      "STSBenchmark cosine Spearman",
      88.2303,
      "https://huggingface.co/NovaSearch/stella_en_1.5B_v5",
      "공식 카드",
    ),
  },
  "NovaSearch/stella_en_400M_v5": {
    qualityBenchmark: quality(
      "STSBenchmark 87.74",
      "STSBenchmark cosine Spearman",
      87.736,
      "https://huggingface.co/NovaSearch/stella_en_400M_v5",
      "공식 카드",
    ),
  },
  "HuggingFaceTB/SmolVLM2-500M-Video-Instruct": {
    qualityBenchmark: quality(
      "Video-MME 42.2",
      "Video-MME",
      42.2,
      "https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct",
      "공식 카드",
    ),
  },
  "openbmb/MiniCPM-V-4.6": {
    qualityBenchmark: quality(
      "AA Index 13",
      "Artificial Analysis Intelligence Index",
      13,
      "https://huggingface.co/openbmb/MiniCPM-V-4.6",
      "공식 카드",
    ),
  },
});

// 2026-09-30 source review. Checkpoint counts are in data/models.js and
// data/audio-models.js; these are publisher quality evaluations, NOT GPU
// measurements. Different thinking modes/harnesses must not share a metric.
Object.assign(window.LLM_GPU_CHECKER_DATA.modelMetadata, {
  "Qwen3.5 0.8B": { ...meta("2026-03-02", "https://huggingface.co/Qwen/Qwen3.5-0.8B", quality("MMLU-Pro thinking 42.3", "MMLU-Pro (Qwen3.5 small, thinking)", 42.3, "https://huggingface.co/Qwen/Qwen3.5-0.8B", "공식 카드·thinking")), verifiedAt: "2026-09-30" },
  "Qwen3.5 2B": { ...meta("2026-03-02", "https://huggingface.co/Qwen/Qwen3.5-2B", quality("MMLU-Pro thinking 66.5", "MMLU-Pro (Qwen3.5 small, thinking)", 66.5, "https://huggingface.co/Qwen/Qwen3.5-2B", "공식 카드·thinking")), verifiedAt: "2026-09-30" },
  "Qwen3.5 4B": { ...meta("2026-03-02", "https://huggingface.co/Qwen/Qwen3.5-4B", quality("MMLU-Pro 79.1", "MMLU-Pro", 79.1, "https://huggingface.co/Qwen/Qwen3.5-9B", "공식 비교표·thinking")), verifiedAt: "2026-09-30" },
  "Qwen3.5 9B": { ...meta("2026-03-02", "https://huggingface.co/Qwen/Qwen3.5-9B", quality("MMLU-Pro 82.5", "MMLU-Pro", 82.5, "https://huggingface.co/Qwen/Qwen3.5-9B", "공식 카드·thinking")), verifiedAt: "2026-09-30" },
  "LFM2.5 1.2B Instruct": { ...meta("2026-01-06", "https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct", quality("MMLU-Pro 44.35", "MMLU-Pro (Liquid AA methodology)", 44.35, "https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct", "공식 카드·AA 평가 방법")), verifiedAt: "2026-09-30" },
  "LFM2.5 2.6B": { ...meta("2026-08-04", "https://huggingface.co/LiquidAI/LFM2.5-2.6B", quality("LiveCodeBench v6 59.41", "LiveCodeBench v6 (Liquid harness)", 59.41, "https://www.liquid.ai/blog/lfm2-5-2-6b", "공식 공개 평가·조건 확인")), verifiedAt: "2026-09-30" },
  "LFM2.5 8B A1B": { ...meta("2026-05-28", "https://huggingface.co/LiquidAI/LFM2.5-8B-A1B", quality("IFEval 91.84", "IFEval (Liquid harness)", 91.84, "https://huggingface.co/LiquidAI/LFM2.5-8B-A1B", "공식 카드·조건 확인")), verifiedAt: "2026-09-30" },
  "LFM2.5 VL 3B": { ...meta("2026-08-12", "https://huggingface.co/LiquidAI/LFM2.5-VL-3B"), verifiedAt: "2026-09-30" },
  "Nemotron 3 Nano 30B A3B": { ...meta("2025-12-15", "https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16", quality("MMLU-Pro 78.3", "MMLU-Pro (Nemotron harness)", 78.3, "https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16", "공식 BF16 평가")), verifiedAt: "2026-09-30" },
  "Qwen3-ASR 0.6B": { ...meta("2026-01-29", "https://huggingface.co/Qwen/Qwen3-ASR-0.6B"), verifiedAt: "2026-09-30" },
  "Qwen3-ASR 1.7B": { ...meta("2026-01-29", "https://huggingface.co/Qwen/Qwen3-ASR-1.7B"), verifiedAt: "2026-09-30" },
  "Voxtral Mini 4B Realtime": { ...meta("2026-02-04", "https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602"), verifiedAt: "2026-09-30" },
  "Qwen3-TTS 0.6B CustomVoice": { ...meta("2026-01-22", "https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice"), verifiedAt: "2026-09-30" },
  "Qwen3-TTS 1.7B CustomVoice": { ...meta("2026-01-22", "https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice"), verifiedAt: "2026-09-30" },
  "Fish Audio S2 Pro": { ...meta("2026-03-09", "https://huggingface.co/fishaudio/s2-pro"), verifiedAt: "2026-09-30" },
});
