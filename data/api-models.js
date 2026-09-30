window.LLM_GPU_CHECKER_DATA = window.LLM_GPU_CHECKER_DATA || {};

// Hosted API model pricing, for the "API 비용 계산기" (API cost
// calculator) and the self-host-vs-API comparison inside the infra sizing
// studio. This is a DIFFERENT kind of catalog from every other data file in
// this repo: these records describe provider-hosted inference, so there is no
// VRAM/bandwidth sizing question for them at all -- the only thing that
// matters is per-token price. Keep this file's schema deliberately separate
// from data/models.js (the local-inference catalog) rather than merging them,
// since mixing "needs a GPU" and "needs no GPU" rows into one list would
// break every VRAM-fit calculation in the app that assumes every row in that
// catalog is something you host yourself.
//
// Pricing basis for every row below: the STANDARD (non-batch, non-priority,
// non-cached, non-data-residency) per-token rate from each provider's own
// pricing page, fetched directly on the verifiedAt date. None of this
// reflects prompt caching, batch discounts, long-context surcharges past
// each provider's stated threshold, or regional pricing multipliers -- the
// API cost estimator surfaces this as a "표준가 기준, 캐싱/배치 미반영" caveat
// rather than claiming false precision. Current general-purpose text tiers
// from five providers; an extra premium flagship is shown separately.
// Tier labels describe positioning, NOT a benchmark-equivalent quality level.
window.LLM_GPU_CHECKER_DATA.apiModels = [
  {
    id: "openai-gpt-6-astra",
    provider: "OpenAI",
    name: "GPT-6 Astra",
    tier: "flagship",
    inputPerMTokUsd: 10.0,
    cachedInputPerMTokUsd: 1.0,
    outputPerMTokUsd: 50.0,
    note: {
      ko: "OpenAI 추론·에이전트 플래그십. 272K 입력 토큰 이하 표준가이며 초과 시 입력·캐시 2배, 출력 1.5배. 캐시 쓰기 비용은 별도",
      en: "OpenAI reasoning/agentic flagship. Standard rate up to 272K input tokens; above that, input/cache cost doubles and output costs 1.5x. Cache writes cost extra",
    },
    sourceUrl: "https://developers.openai.com/api/docs/pricing",
    verifiedAt: "2026-09-30",
  },
  {
    id: "openai-gpt-6.1-sol",
    provider: "OpenAI",
    name: "GPT-6.1 Sol",
    tier: "balanced",
    inputPerMTokUsd: 2.0,
    cachedInputPerMTokUsd: 0.1,
    outputPerMTokUsd: 10.0,
    note: {
      ko: "코딩·일반 에이전트용 균형형. 272K 입력 토큰 이하 표준가이며 초과 시 입력·캐시 2배, 출력 1.5배. 캐시 쓰기 $2.50/MTok은 별도",
      en: "Balanced coding/general agentic model. Standard rate up to 272K input tokens; above that, input/cache cost doubles and output costs 1.5x. $2.50/MTok cache writes are extra",
    },
    sourceUrl: "https://developers.openai.com/api/docs/pricing",
    verifiedAt: "2026-09-30",
  },
  {
    id: "openai-gpt-6-luna",
    provider: "OpenAI",
    name: "GPT-6 Luna",
    tier: "economy",
    inputPerMTokUsd: 0.1,
    cachedInputPerMTokUsd: 0.01,
    outputPerMTokUsd: 0.5,
    note: {
      ko: "경량·대량 처리용. 272K 입력 토큰 이하 표준가이며 초과 시 입력·캐시 2배, 출력 1.5배. 캐시 쓰기 비용은 별도",
      en: "Lightweight high-volume model. Standard rate up to 272K input tokens; above that, input/cache cost doubles and output costs 1.5x. Cache writes cost extra",
    },
    sourceUrl: "https://developers.openai.com/api/docs/pricing",
    verifiedAt: "2026-09-30",
  },
  {
    id: "anthropic-claude-opus-5.5",
    provider: "Anthropic",
    name: "Claude Opus 5.5",
    tier: "flagship",
    inputPerMTokUsd: 4.0,
    cachedInputPerMTokUsd: 0.2,
    outputPerMTokUsd: 20.0,
    note: {
      ko: "장시간 에이전트 코딩·지식 작업용. 캐시 적중 가격은 $0.20/MTok이며 캐시 쓰기·도구 비용은 별도",
      en: "For long-running agentic coding and knowledge work. Cache hits cost $0.20/MTok; cache writes and tools cost extra",
    },
    sourceUrl: "https://platform.claude.com/docs/en/about-claude/pricing",
    verifiedAt: "2026-09-30",
  },
  {
    id: "anthropic-claude-sonnet-5.5",
    provider: "Anthropic",
    name: "Claude Sonnet 5.5",
    tier: "balanced",
    inputPerMTokUsd: 2.0,
    cachedInputPerMTokUsd: 0.2,
    outputPerMTokUsd: 10.0,
    note: {
      ko: "속도·품질 균형형 Sonnet 5.5의 표준가. 캐시 쓰기·도구 비용은 별도이며 제공사 간 토크나이저 차이도 고려하세요",
      en: "Standard rate for the speed/intelligence-balanced Sonnet 5.5. Cache writes and tools cost extra; consider tokenizer differences between providers",
    },
    sourceUrl: "https://platform.claude.com/docs/en/about-claude/pricing",
    verifiedAt: "2026-09-30",
  },
  {
    id: "anthropic-claude-haiku-4.5",
    provider: "Anthropic",
    name: "Claude Haiku 4.5",
    tier: "economy",
    inputPerMTokUsd: 1.0,
    cachedInputPerMTokUsd: 0.1,
    outputPerMTokUsd: 5.0,
    note: {
      ko: "가장 저렴한 Anthropic 상시 처리용 모델",
      en: "Anthropic's cheapest everyday-use model",
    },
    sourceUrl: "https://platform.claude.com/docs/en/about-claude/pricing",
    verifiedAt: "2026-09-30",
  },
  {
    id: "google-gemini-3.1-pro-preview",
    provider: "Google",
    name: "Gemini 3.1 Pro Preview",
    tier: "flagship",
    inputPerMTokUsd: 2.0,
    cachedInputPerMTokUsd: 0.2,
    outputPerMTokUsd: 12.0,
    note: {
      ko: "Google 플래그십 모델. 프롬프트 200K 토큰 이하 표준가 기준(200K 초과 시 입력 $4.00/출력 $18.00로 인상)",
      en: "Google's flagship model. Standard rate for prompts up to 200K tokens (rises to $4.00 input / $18.00 output above 200K)",
    },
    sourceUrl: "https://ai.google.dev/gemini-api/docs/pricing",
    verifiedAt: "2026-09-30",
  },
  {
    id: "google-gemini-3.8-flash",
    provider: "Google",
    name: "Gemini 3.8 Flash",
    tier: "balanced",
    inputPerMTokUsd: 0.75,
    cachedInputPerMTokUsd: 0.075,
    outputPerMTokUsd: 3.75,
    note: {
      ko: "에이전트/멀티모달 작업용 균형형 모델. 이 요금은 2026-12-31까지이며 2027-01-01부터 입력 $1.50/출력 $7.50로 인상 예정(공지된 가격)",
      en: "Balanced model for agentic/multimodal work. This rate applies through 2026-12-31; a scheduled increase to $1.50 input / $7.50 output takes effect 2027-01-01",
    },
    sourceUrl: "https://ai.google.dev/gemini-api/docs/pricing",
    verifiedAt: "2026-09-30",
  },
  {
    id: "google-gemini-3.5-flash-lite",
    provider: "Google",
    name: "Gemini 3.5 Flash-Lite",
    tier: "economy",
    inputPerMTokUsd: 0.3,
    cachedInputPerMTokUsd: 0.03,
    outputPerMTokUsd: 2.5,
    note: {
      ko: "대량 처리·번역·단순 작업에 맞춘 가장 저렴한 Google 모델",
      en: "Google's cheapest model, optimized for high-volume, translation, and simple tasks",
    },
    sourceUrl: "https://ai.google.dev/gemini-api/docs/pricing",
    verifiedAt: "2026-09-30",
  },
  {
    id: "anthropic-claude-fable-5.1",
    provider: "Anthropic",
    name: "Claude Fable 5.1",
    tier: "flagship",
    inputPerMTokUsd: 10.0,
    cachedInputPerMTokUsd: 0.25,
    outputPerMTokUsd: 50.0,
    note: {
      ko: "고난도 추론·장기 에이전트 작업용 프리미엄 플래그십. 캐시 적중은 $0.25/MTok이며 캐시 쓰기·도구 비용은 별도. 같은 티어가 같은 품질을 뜻하지는 않습니다",
      en: "Premium flagship for demanding reasoning and long-horizon agentic work. Cache hits cost $0.25/MTok; cache writes and tools cost extra. A shared tier does not imply equal quality",
    },
    sourceUrl: "https://platform.claude.com/docs/en/about-claude/pricing",
    verifiedAt: "2026-09-30",
  },
  {
    id: "deepseek-v4.1-flash",
    provider: "DeepSeek",
    name: "DeepSeek V4.1 Flash",
    tier: "balanced",
    inputPerMTokUsd: 0.3,
    cachedInputPerMTokUsd: 0.006,
    outputPerMTokUsd: 1.2,
    note: {
      ko: "API 이름 deepseek-flash. 기본 계산은 피크 요금이며 오프피크는 입력 $0.15·출력 $0.60·캐시 $0.003/MTok. 피크는 평일 UTC 01–04시·06–10시(중국 공휴일 제외). 할인 시간대는 자동 반영하지 않습니다",
      en: "API name: deepseek-flash. Peak rates are used; off-peak input/output/cache rates are $0.15/$0.60/$0.003 per MTok. Peak hours are weekdays 01–04 and 06–10 UTC, excluding Chinese public holidays. Time-based discounts are not applied automatically",
    },
    sourceUrl: "https://api-docs.deepseek.com/quick_start/pricing/",
    verifiedAt: "2026-09-30",
  },
  {
    id: "mistral-medium-3.5",
    provider: "Mistral AI",
    name: "Mistral Medium 3.5",
    tier: "flagship",
    inputPerMTokUsd: 1.5,
    cachedInputPerMTokUsd: 0.15,
    outputPerMTokUsd: 7.5,
    note: {
      ko: "에이전트·코딩·멀티모달용 Mistral 표준 API 요금. 지역 지정·우선 처리·배치 조건은 별도이며 로컬 가중치 적재 비용과 구분합니다",
      en: "Standard Mistral API rate for agentic, coding, and multimodal work. Regional inference, priority, and batch rates are separate from local weight deployment costs",
    },
    sourceUrl: "https://docs.mistral.ai/inference/pricing",
    verifiedAt: "2026-09-30",
  },
  {
    id: "mistral-small-4",
    provider: "Mistral AI",
    name: "Mistral Small 4",
    tier: "economy",
    inputPerMTokUsd: 0.15,
    cachedInputPerMTokUsd: 0.015,
    outputPerMTokUsd: 0.6,
    note: {
      ko: "지시·추론·코딩을 통합한 Small 4의 표준 API 요금. 지역 지정·우선 처리·배치 조건은 별도이며 저렴한 요금이 동등한 작업 품질을 보장하지는 않습니다",
      en: "Standard API rate for Small 4's unified instruction, reasoning, and coding model. Regional, priority, and batch rates are separate; lower prices do not guarantee equivalent task quality",
    },
    sourceUrl: "https://docs.mistral.ai/inference/pricing",
    verifiedAt: "2026-09-30",
  },
];

// Shared caveats surfaced once in the UI rather than repeated per row.
window.LLM_GPU_CHECKER_DATA.apiPricingMeta = {
  basis: {
    ko: "각 제공사 공식 가격 페이지의 표준(비배치·비캐싱·기본 리전) 텍스트 요금 기준. DeepSeek은 피크 요금을 사용합니다. 캐시 읽기·쓰기, 시간대/배치 할인, 장문 할증, 리전 가산, 도구·검색·이미지·음성 과금은 미반영한 참고 추정입니다. 같은 입력 문장도 토크나이저에 따라 토큰 수가 다릅니다.",
    en: "Official standard (non-batch, non-cached, default-region) text-token rates, using peak rates for DeepSeek. Cache reads/writes, time-based/batch discounts, long-context surcharges, regional premiums, tools/search, image and audio charges are excluded. The same text can have different token counts across tokenizers.",
  },
  verifiedAt: "2026-09-30",
};
