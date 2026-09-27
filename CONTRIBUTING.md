# Contributing

이 프로젝트는 GPU/LLM 실행 가능성 추정 데이터를 함께 개선하는 것을 목표로 합니다.

## 제보 방식

- 새 모델 추가: GitHub Issue의 [`Model request`](https://github.com/jaeseok614/ai-hardware-fit/issues/new?template=model-request.yml)
- 새 GPU 추가: GitHub Issue의 [`GPU request`](https://github.com/jaeseok614/ai-hardware-fit/issues/new?template=gpu-request.yml)
- 실제 실행 결과: `scripts/benchmark-cli.mjs`로 측정한 JSON을 [`Benchmark report`](https://github.com/jaeseok614/ai-hardware-fit/issues/new?template=benchmark-report.yml)에 붙여넣기

## 모델 데이터 기준

`data/models.js`에 아래 필드를 추가합니다.

```js
{
  name: "Model name",
  maker: "Provider",
  params: 14,
  active: 14,
  context: 32,
  license: "Apache 2.0",
  tags: ["general", "korean"],
  summary: "한국어 설명",
}
```

- `params`: 전체 파라미터 수, B 단위
- `active`: MoE 모델의 토큰당 활성 파라미터 수, dense 모델은 `params`와 동일
- `context`: 최대 컨텍스트 길이, K 단위
- `tags`: 아래 지원 태그 중 선택

지원 태그:

```text
general, korean, coding, reasoning, long, edge, vision,
embedding, reranker, retrieval, sparse, dense, multilingual,
matryoshka, ocr, document, document-vlm, general-vlm, vlm,
layout, table, math, handwriting, pdf, markdown, chart, video,
grounding, audio, gui, seal, spotting, coordinate, screen, mobile, agent, legacy,
classification, clustering, matching, codeRetrieval
```

## 임베딩 모델 데이터 기준

`data/embedding-models.js`에 아래 형식으로 추가합니다.

```js
{
  type: "embedding",
  name: "Example embedding model",
  maker: "Example",
  params: 0.3,
  hiddenSize: 768,
  layers: 12,
  attentionHeads: 12,
  maxTokens: 8192,
  embeddingDim: 768,
  pooling: "CLS",
  license: "Apache 2.0",
  tags: ["embedding", "retrieval", "korean"],
  precisions: ["fp32", "fp16", "bf16", "int8"],
  supportsFlashAttention: true,
  summary: "모델 카드에 표시될 한국어 설명입니다.",
}
```

## OCR/VLM 모델 데이터 기준

`data/ocr-models.js`에 아래 타입으로 추가합니다.

| 타입 | 표시 탭 | 용도 |
| --- | --- | --- |
| `ocr-pipeline` | OCR | PP-OCR처럼 검출/인식/좌표 추출 중심 |
| `document-vlm` | 문서 VLM | PDF→Markdown, 표·수식·레이아웃 복원 |
| `general-vlm` | 범용 VLM | OCR-like 추출, 문서 질의응답, 화면 이해 |

OCR/VLM은 모델별 activation 계수와 reference benchmark가 중요합니다. 출처가 있는 실제 측정값은 `data/benchmarks.js`에 추가하고, 모델 카드나 파이프라인 기준값은 `reference`로 분리해 둡니다.

## GPU 데이터 기준

`data/gpus.js`에 아래 필드를 추가합니다.

```js
{ id: "gpu-id", name: "GPU name", vram: 24, ram: 64, bandwidth: 1008 }
```

- `vram`: GPU VRAM 또는 통합메모리, GB 단위
- `ram`: 권장 시스템 RAM, GB 단위
- `bandwidth`: 메모리 대역폭, GB/s 단위

## 검증

변경 후 아래 명령을 실행합니다.

```bash
npm run check
```

## Pull Request 기준

- 데이터 출처를 PR 설명이나 Issue에 남겨 주세요.
- 특정 벤더 홍보 문구보다 수치와 재현 가능한 설정을 우선합니다.
- 계산식 변경은 README의 `계산 기준`도 함께 수정해 주세요.
