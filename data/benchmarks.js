window.LLM_GPU_CHECKER_DATA = window.LLM_GPU_CHECKER_DATA || {};

window.LLM_GPU_CHECKER_DATA.benchmarkMeta = {
  updatedAt: "2026-08-12",
  reportUrl: "https://github.com/jaeseok614/ai-hardware-fit/issues/new?template=benchmark-report.yml",
  reportingPaused: false,
  reportingStatus: "GitHub Issue에서 신규 벤치마크 제보 접수 중",
  note: "User/project measurements require a source-linked run. External public references and estimator outputs are never stored as measurements.",
};

window.LLM_GPU_CHECKER_DATA.benchmarks = [
  { evidenceType: "external", modelName: "Qwen3 8B", gpu: "RTX 3060 12GB", workload: "generative", runtime: "llama.cpp", quantization: "Q4_K_XL", context: 16384, tokensPerSecond: 42, sourceUrl: "https://singhajit.com/llm-inference-speed-comparison/", note: "Hardware Corner 측정값을 인용한 외부 공개 참고값" },
  { evidenceType: "external", modelName: "Llama 3.1 8B Instruct", gpu: "RTX 3060 12GB", workload: "generative", runtime: "llama.cpp", quantization: "Q4_K_XL", context: 16384, tokensPerSecond: 42, sourceUrl: "https://singhajit.com/llm-inference-speed-comparison/", note: "Hardware Corner 측정값을 인용한 외부 공개 참고값" },
  { evidenceType: "external", modelName: "Qwen3 14B", gpu: "RTX 3060 12GB", workload: "generative", runtime: "llama.cpp", quantization: "Q4_K_XL", context: 16384, tokensPerSecond: 22.7, sourceUrl: "https://singhajit.com/llm-inference-speed-comparison/", note: "CUDA 12.8·16K 컨텍스트 외부 참고값" },
  { evidenceType: "external", modelName: "Qwen3 14B", gpu: "RTX 3060 12GB", workload: "generative", runtime: "llama.cpp", quantization: "Q4_K_M", context: 128, tokensPerSecond: 29.4, sourceUrl: "https://singhajit.com/llm-inference-speed-comparison/", note: "Vulkan·tg128 외부 참고값" },
  { evidenceType: "external", modelName: "Llama 3.1 8B Instruct", gpu: "RTX 4090 24GB", workload: "generative", runtime: "llama.cpp", quantization: "Q4_K_XL", context: 16384, tokensPerSecond: 104.3, sourceUrl: "https://singhajit.com/llm-inference-speed-comparison/", note: "Hardware Corner 측정값을 인용한 외부 공개 참고값" },
  { evidenceType: "external", modelName: "Qwen3 14B", gpu: "RTX 4090 24GB", workload: "generative", runtime: "llama.cpp", quantization: "Q4_K_XL", context: 16384, tokensPerSecond: 69.1, sourceUrl: "https://singhajit.com/llm-inference-speed-comparison/", note: "Hardware Corner 측정값을 인용한 외부 공개 참고값" },
  { evidenceType: "external", modelName: "Llama 3.1 8B Instruct", gpu: "RTX 4090 24GB", workload: "generative", runtime: "llama.cpp", quantization: "int4", context: 100, tokensPerSecond: 150, sourceUrl: "https://developer.nvidia.com/blog/?p=89663", note: "NVIDIA 내부 측정·입력 100/출력 100 토큰" },
  { evidenceType: "external", modelName: "Qwen3 32B", gpu: "RTX 5090 32GB", workload: "generative", runtime: "llama.cpp", quantization: "4-bit", context: 8192, tokensPerSecond: 69.45, sourceUrl: "https://llm-speed.com/m/qwen3-32b", note: "기여자 로컬 실행 기록·chat-short" },
  { evidenceType: "external", modelName: "Qwen3 32B", gpu: "RTX 5090 32GB", workload: "generative", runtime: "llama.cpp", quantization: "4-bit", context: 8192, tokensPerSecond: 62.3, sourceUrl: "https://llm-speed.com/m/qwen3-32b", note: "기여자 로컬 실행 기록·chat-long" },
  { evidenceType: "external", modelName: "Qwen3 32B", gpu: "RTX 5090 32GB", workload: "generative", runtime: "llama.cpp", quantization: "4-bit", context: 8192, tokensPerSecond: 66.64, sourceUrl: "https://llm-speed.com/m/qwen3-32b", note: "기여자 로컬 실행 기록·concurrent-decode" },
  { evidenceType: "external", modelName: "GPT-OSS 20B", gpu: "DGX Spark 128GB", workload: "generative", runtime: "Ollama (llama.cpp)", quantization: "Q4_K_M", context: 2048, tokensPerSecond: 60.22, sourceUrl: "https://www.proxpc.com/blogs/nvidia-dgx-spark-gb10-performance-test-vs-5090-llm-image-and-video-generation", note: "ProX PC 실측 리뷰·짧은 프롬프트(Gen 1) 기준" },
  { evidenceType: "external", modelName: "Qwen2.5 72B Instruct", gpu: "DGX Spark 128GB", workload: "generative", runtime: "Ollama (llama.cpp)", quantization: "Q4_K_M", context: 8192, tokensPerSecond: 4.62, sourceUrl: "https://www.proxpc.com/blogs/nvidia-dgx-spark-gb10-performance-test-vs-5090-llm-image-and-video-generation", note: "ProX PC 실측 리뷰·대용량 프롬프트(Gen 2/3) 안정 구간, 통합메모리 대역폭(273GB/s) 병목으로 저속" },
  { evidenceType: "external", modelName: "Llama 3.2 90B Vision Instruct", gpu: "DGX Spark 128GB", workload: "generative", runtime: "Ollama (llama.cpp)", quantization: "Q4_K_M", context: 2048, tokensPerSecond: 4.4, sourceUrl: "https://www.proxpc.com/blogs/nvidia-dgx-spark-gb10-performance-test-vs-5090-llm-image-and-video-generation", note: "ProX PC 실측 리뷰·짧은 프롬프트(Gen 1) 기준, RTX 5090은 VRAM 부족으로 로드 불가했던 모델" },
];
