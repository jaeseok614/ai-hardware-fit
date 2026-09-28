# Can my GPU run this?

<p align="center">
  <img src="./assets/gpu-board.svg" alt="AI Hardware Fit" width="88" />
</p>

<p align="center">
  <strong>Pick a GPU. Get 3 models that fit, the recommended quantization,<br />VRAM and speed ranges, plus a ready-to-run command.</strong>
</p>

<p align="center">
  <a href="https://github.com/jaeseok614/ai-hardware-fit/actions/workflows/ci.yml"><img src="https://github.com/jaeseok614/ai-hardware-fit/actions/workflows/ci.yml/badge.svg" alt="CI status" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/GPU_presets-151-0f766e" alt="151 GPU presets" />
  <img src="https://img.shields.io/badge/AI_models-332-164a7b" alt="332 AI models" />
</p>

<p align="center">
  <a href="https://jaeseok614.github.io/ai-hardware-fit/?lang=en"><strong>Try it now</strong></a>
  · <a href="https://jaeseok614.github.io/ai-hardware-fit/?lang=en&amp;gpu=rtx3060-12">RTX 3060 example</a>
  · <a href="./README.md">한국어</a>
  · <a href="https://github.com/jaeseok614/ai-hardware-fit/issues/new?template=benchmark-report.yml">Share a measurement</a>
</p>

<p align="center">
  <img src="./docs/demo.gif" alt="10-second demo: choose an RTX 3060, see models that fit, and copy a run command" />
</p>

<p align="center">
  <sub>No install · No sign-up · No input leaves your browser · Open formulas and data</sub>
</p>

## How it works

1. Search for your GPU or choose it from the list.
2. Review 3 runnable models with quantization, VRAM, and a speed range.
3. Copy the Ollama or llama.cpp command and start running the model.

| Try an example | What you get |
| --- | --- |
| [RTX 3060 12GB](https://jaeseok614.github.io/ai-hardware-fit/?lang=en&gpu=rtx3060-12) | Local-model shortlist for a common consumer GPU |
| [RTX 5070 Ti 16GB](https://jaeseok614.github.io/ai-hardware-fit/?lang=en&gpu=rtx5070ti-16) | Quality/speed options for 16 GB VRAM |
| [RTX 4090 24GB](https://jaeseok614.github.io/ai-hardware-fit/?lang=en&gpu=rtx4090-24) | Larger-model options for 24 GB VRAM |
| [Start with a model](https://jaeseok614.github.io/ai-hardware-fit/?lang=en&mode=modelFinder) | Compare GPUs by budget, power, and form factor |

## Best local model for your VRAM

The benchmark workspace now includes a **VRAM–quality frontier**. It estimates required memory at `Q4_K_M · 4K context · 1 concurrent request · llama.cpp` and compares models only within the same source-reported benchmark instead of mixing unrelated scores.

- Best score and runner-up for 8, 12, 16, 24, 32, 48, 80, and 128 GB
- Pareto frontier: no lower-VRAM model in the group has an equal or higher score
- Your selected GPU's usable-VRAM line and a source link for every score
- [Open the interactive chart](https://jaeseok614.github.io/ai-hardware-fit/?lang=en#benchmarkSheet) · [Latest weekly change report](./docs/model-value/latest.md)

## Can I trust the numbers?

Every result separates **VRAM math** from **speed evidence**.

- `Exact-condition measurement`: source-linked data for the same GPU, model, runtime, and quantization.
- `Measurement-calibrated`: the range is adjusted with the median of measurements from this GPU.
- `Related measurements`: the same model has measurements under different run conditions.
- `No matching measurements · calculated`: a formula based on parameters, VRAM, memory bandwidth, and runtime assumptions.

Speed is a planning range, not a guarantee. Drivers, runtime, context, batching, and offloading can change the result substantially. Validate production decisions with a representative workload. See [Accuracy and limitations](./docs/accuracy-and-limits.md) and [Calculation methodology](./docs/methodology.md).

## Highlights

- 151 NVIDIA, AMD, Intel, Apple Silicon, data-center, and laptop GPU presets, plus custom specifications
- 332 generative LLM, embedding, reranker, OCR/VLM, image/video, STT, and TTS models
- Ollama, llama.cpp, vLLM, and MLX settings and run commands
- Laptop TGP, mixed GPUs, unified memory, and system-RAM offloading
- Source, verification date, measurement count, and estimate range shown separately
- Korean and English UI, responsive layouts, keyboard navigation, and reduced motion

<details>
<summary><strong>Advanced tools</strong></summary>

- Model-first GPU recommendations by budget, form factor, and power
- Multi-model GPU placement for LLM, RAG, VLM, image, and voice stacks
- AI infrastructure sizing from users, concurrency, and SLA targets
- API, rented-GPU, and self-hosted cost comparison
- Excel, PDF, Docker Compose, and shareable outputs

</details>

## GPU of the week

A GitHub Action refreshes a GPU-specific share card and Korean/English post copy every Monday at 09:00 KST.

- [Latest GPU spotlight](./docs/spotlights/latest.md)
- [Spotlight archive](./docs/spotlights/README.md)
- [Latest VRAM/model value report](./docs/model-value/latest.md)

## Latest updates

- **v7.36.0** — Added a same-benchmark VRAM–quality frontier, VRAM-tier recommendations, and a weekly model-value change report.
- **v7.35.0** — Split model-first GPU recommendations into three real screens and made a fresh AI service sizing entry start at step one.
- **v7.34.0** — Removed remaining Korean copy from the English UI and updated AI service auto-selection to recent models with cited benchmark evidence.

See the full [changelog](./CHANGELOG.md).

## Contribute

- [Request a GPU](https://github.com/jaeseok614/ai-hardware-fit/issues/new?template=gpu-request.yml)
- [Request a model](https://github.com/jaeseok614/ai-hardware-fit/issues/new?template=model-request.yml)
- [Report a benchmark](https://github.com/jaeseok614/ai-hardware-fit/issues/new?template=benchmark-report.yml)
- [Report a calculation or workflow problem](https://github.com/jaeseok614/ai-hardware-fit/issues/new?template=product-feedback.yml)

## Local development

Node.js 20 or newer is required.

```bash
npm install
npm run check
npm run test:visual
```

Key docs: [Data sources](./docs/data-sources.md) · [GPU contribution pipeline](./docs/gpu-contribution-pipeline.md) · [Changelog](./CHANGELOG.md) · [Contributing](./CONTRIBUTING.md)

Repository code is distributed under the [MIT License](./LICENSE); each listed AI model retains its own license.
