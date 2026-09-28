# Weekly local-model value report — 2026-09-28

같은 공개 벤치마크 안에서만 모델을 비교한 AI Hardware Fit 주간 요약입니다.

- 비교 지표: **MMLU-Pro** (31개 모델)
- 메모리 기준: **Q4_K_M · 4K context · concurrency 1 · llama.cpp**
- 주의: 공개 점수의 세부 평가 조건은 모델마다 다를 수 있으므로 각 출처를 함께 확인하세요.

## 이번 주 변경

- 첫 기준 스냅샷을 생성했습니다. 다음 주부터 모델·점수·VRAM 추천 변화를 비교합니다.

## VRAM별 최고 점수

| VRAM | 1순위 | 2순위 |
| ---: | --- | --- |
| 8GB | Granite 4.2 8B | Granite 4.2 3B |
| 12GB | Gemma 4 12B IT Thinking | Granite 4.2 8B |
| 16GB | Gemma 4 12B IT Thinking | Granite 4.2 8B |
| 24GB | Qwen3.6 27B | Qwen3.5 27B |
| 32GB | Qwen3.6 27B | Qwen3.5 27B |
| 48GB | Qwen3.6 27B | Qwen3.5 27B |
| 80GB | Qwen3.6 27B | Qwen3.5 27B |
| 128GB | Qwen3.5 122B A10B | Qwen3.6 27B |

## VRAM–성능 프런티어

- [Qwen2.5 0.5B Instruct](https://arxiv.org/abs/2412.15115) — 1.6GB · MMLU-Pro 15
- [EXAONE 4.0 1.2B](https://github.com/LG-AI-EXAONE/EXAONE-4.0) — 2.0GB · MMLU-Pro 59.3
- [Granite 4.2 3B](https://huggingface.co/ibm-granite/granite-4.2-8b) — 3.5GB · MMLU-Pro 67.84
- [Granite 4.2 8B](https://huggingface.co/ibm-granite/granite-4.2-8b) — 7.4GB · MMLU-Pro 74.04
- [Gemma 4 12B IT Thinking](https://huggingface.co/google/gemma-4-12B-it) — 10.5GB · MMLU-Pro 77.2
- [Qwen3.6 27B](https://huggingface.co/Qwen/Qwen3.6-27B) — 22.2GB · MMLU-Pro 86.2
- [Qwen3.5 122B A10B](https://huggingface.co/Qwen/Qwen3.5-35B-A3B) — 84.2GB · MMLU-Pro 86.7
- [Qwen3.5 397B A17B](https://huggingface.co/Qwen/Qwen3.6-27B) — 263.0GB · MMLU-Pro 87.8

프런티어는 같은 그룹에서 더 적은 VRAM을 쓰면서 같거나 높은 점수를 내는 다른 모델이 없는 경우입니다. [대화형 차트 열기](https://jaeseok614.github.io/ai-hardware-fit/?lang=ko#benchmarkSheet) · [Open in English](https://jaeseok614.github.io/ai-hardware-fit/?lang=en#benchmarkSheet)
