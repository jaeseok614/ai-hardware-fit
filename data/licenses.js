window.LLM_GPU_CHECKER_DATA = window.LLM_GPU_CHECKER_DATA || {};

const licensePolicy = (commercialUse, commercialLabel, opennessLabel, summary, sourceUrl) => ({
  commercialUse,
  commercialLabel,
  opennessLabel,
  summary,
  sourceUrl,
});

const apache20 = licensePolicy(
  "allowed",
  "상업 이용 가능",
  "오픈소스",
  {
    ko: "상업 이용·수정·배포가 가능하며 라이선스 사본, 저작권 및 NOTICE 고지를 유지해야 합니다.",
    en: "Commercial use, modification, and redistribution are allowed; you must retain a copy of the license and the copyright and NOTICE attributions.",
  },
  "https://www.apache.org/licenses/LICENSE-2.0",
);

const mit = licensePolicy(
  "allowed",
  "상업 이용 가능",
  "오픈소스",
  {
    ko: "상업 이용·수정·배포가 가능하며 저작권 및 허가 고지를 포함해야 합니다.",
    en: "Commercial use, modification, and redistribution are allowed; you must include the copyright and permission notice.",
  },
  "https://opensource.org/license/mit",
);

const ccByNc = licensePolicy(
  "noncommercial",
  "비상업 이용만",
  "비상업 공개",
  {
    ko: "저작자 표시가 필요하고 상업적 이용은 허용되지 않습니다. 상업 서비스에는 별도 허가가 필요합니다.",
    en: "Attribution is required and commercial use is not allowed. Commercial services need separate permission.",
  },
  "https://creativecommons.org/licenses/by-nc/4.0/",
);

const llamaCommunity = licensePolicy(
  "conditional",
  "조건부 상업 이용",
  "공개 가중치",
  {
    ko: "상업 이용은 가능하지만 버전별 사용 정책·표시·재배포 조건과 대규모 서비스 기준을 확인해야 합니다.",
    en: "Commercial use is allowed, but check the version-specific acceptable-use policy, attribution/redistribution terms, and large-scale-service thresholds.",
  },
  "https://github.com/meta-llama/llama-models/tree/main/models",
);

const exaoneNc = licensePolicy(
  "noncommercial",
  "연구·비상업 전용",
  "연구용 공개 가중치",
  {
    ko: "연구 목적만 허용되며 모델·파생물·출력의 상업 이용에는 LG AI Research와 별도 계약이 필요합니다.",
    en: "Only research use is allowed; commercial use of the model, derivatives, or outputs requires a separate agreement with LG AI Research.",
  },
  "https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct/blob/main/LICENSE",
);

window.LLM_GPU_CHECKER_DATA.licensePolicies = {
  "원문 확인 필요": licensePolicy(
    "review",
    "약관 확인 필요",
    "라이선스 미표기",
    {
      ko: "원 저장소에 라이선스가 명시되지 않았습니다. 상업·재배포에 사용하기 전에 저작권자에게 이용 조건을 확인하세요.",
      en: "No license is stated in the original repository. Confirm the terms with the copyright holder before commercial use or redistribution.",
    },
    "https://huggingface.co/nreimers/mmarco-mMiniLMv2-L6-H384-v1",
  ),
  "Apache 2.0": apache20,
  "Apache-2.0": apache20,
  MIT: mit,
  "Research-only": licensePolicy(
    "noncommercial",
    "연구·비상업 전용",
    "연구용 공개 모델",
    {
      ko: "공개 체크포인트는 연구·개인·비상업 용도로 제한됩니다. 상업 서비스에는 권리자의 별도 허가나 상업 라이선스가 필요합니다.",
      en: "The public checkpoint is restricted to research, personal, and non-commercial use. Commercial services require separate permission or a commercial license.",
    },
    "https://github.com/Rudrabha/Wav2Lip",
  ),
  "GPL-3.0": licensePolicy(
    "allowed",
    "상업 이용 가능",
    "오픈소스·카피레프트",
    {
      ko: "상업 이용은 가능하지만 배포하는 파생 저작물에는 GPLv3의 소스 공개·동일 라이선스 조건이 적용될 수 있습니다.",
      en: "Commercial use is allowed, but derivative works you distribute may be subject to GPLv3's source-disclosure and same-license requirements.",
    },
    "https://www.gnu.org/licenses/gpl-3.0.html",
  ),
  Gemma: licensePolicy(
    "conditional",
    "조건부 상업 이용",
    "공개 가중치",
    {
      ko: "상업 이용을 금지하지 않지만 Gemma 이용약관, 금지 사용 정책, 재배포 고지 조건을 따라야 합니다.",
      en: "Commercial use isn't prohibited, but you must follow the Gemma Terms of Use, prohibited-use policy, and redistribution-notice requirements.",
    },
    "https://ai.google.dev/gemma/terms",
  ),
  MRL: licensePolicy(
    "noncommercial",
    "연구·비상업 전용",
    "연구용 공개 가중치",
    {
      ko: "Mistral Research License는 비영리 연구만 허용합니다. 업무·제품·서비스에는 Mistral의 별도 상업 라이선스가 필요합니다.",
      en: "The Mistral Research License allows only non-commercial research. Business, product, or service use requires a separate commercial license from Mistral.",
    },
    "https://mistral.ai/licenses/MRL-0.1.md",
  ),
  MNPL: licensePolicy(
    "noncommercial",
    "연구·테스트 전용",
    "비상업 공개 가중치",
    {
      ko: "Mistral AI Non-Production License는 연구·평가 같은 비생산 용도만 허용합니다. 상업·운영 환경에는 별도 라이선스가 필요합니다.",
      en: "The Mistral AI Non-Production License allows only non-production uses like research and evaluation. Commercial or production use requires a separate license.",
    },
    "https://mistral.ai/licenses/MNPL-0.1.md",
  ),
  "CC BY-NC": ccByNc,
  "CC BY-NC 4.0": ccByNc,
  "CC-BY-NC-4.0": ccByNc,
  Qwen: licensePolicy(
    "conditional",
    "조건부 상업 이용",
    "공개 가중치",
    {
      ko: "상업 이용은 가능하지만 월간 활성 사용자 1억 명 초과 시 별도 허가가 필요하며 표시·재배포 조건을 따라야 합니다.",
      en: "Commercial use is allowed, but exceeding 100 million monthly active users requires separate permission, and attribution/redistribution terms apply.",
    },
    "https://huggingface.co/Qwen/Qwen2.5-72B-Instruct/blob/main/LICENSE",
  ),
  "Qwen Community License 1.0": licensePolicy(
    "conditional",
    "조건부 상업 이용",
    "공개 가중치 프리뷰",
    {
      ko: "Qwen Community License 1.0은 상업 이용을 허용하지만 월간 활성 사용자 1억 명 초과 시 별도 허가가 필요하며, 실험적 프리뷰 성격상 표시·재배포 조건을 모델 카드에서 다시 확인해야 합니다.",
      en: "The Qwen Community License 1.0 allows commercial use, but exceeding 100 million monthly active users requires separate permission; as an experimental preview release, re-check the attribution/redistribution terms on the model card.",
    },
    "https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE",
  ),
  "Qwen Research": licensePolicy(
    "noncommercial",
    "연구·비상업 전용",
    "연구용 공개 가중치",
    {
      ko: "Qwen Research License 기반 모델로 상업 이용 전 해당 모델 카드와 원 라이선스의 별도 허가 조건을 확인해야 합니다.",
      en: "A model under the Qwen Research License; check the model card and the original license's separate-permission terms before commercial use.",
    },
    "https://huggingface.co/jinaai/jina-embeddings-v4",
  ),
  Llama: llamaCommunity,
  "Llama 3": llamaCommunity,
  "Llama 3.1 Community": llamaCommunity,
  "Llama 3.2": llamaCommunity,
  "Llama 3.2 Community": llamaCommunity,
  "Llama 3.3 Community": llamaCommunity,
  "Llama 4 Community": llamaCommunity,
  "EXAONE AI": exaoneNc,
  "EXAONE AI 1.2 NC": exaoneNc,
  DeepSeek: licensePolicy(
    "conditional",
    "조건부 상업 이용",
    "공개 가중치",
    {
      ko: "상업·호스팅 이용은 가능하지만 군사·불법 등 금지 용도와 재배포 시 사용 제한 승계 조건을 따라야 합니다.",
      en: "Commercial and hosted use are allowed, but prohibited uses (military, illegal, etc.) and use-restriction pass-through terms on redistribution apply.",
    },
    "https://github.com/deepseek-ai/DeepSeek-VL2/blob/main/LICENSE-MODEL",
  ),
  "GLM-4": licensePolicy(
    "conditional",
    "등록 후 상업 이용",
    "공개 가중치",
    {
      ko: "학술 연구는 무료이며 상업 이용은 Zhipu AI 등록 후 가능하고 표시·재배포·금지 용도 조건을 따라야 합니다.",
      en: "Academic research is free; commercial use requires registering with Zhipu AI, and attribution, redistribution, and prohibited-use terms apply.",
    },
    "https://huggingface.co/THUDM/glm-4-9b-chat/blob/main/LICENSE",
  ),
  "Modified MIT": licensePolicy(
    "review",
    "수정 조항 확인",
    "모델별 공개 가중치",
    {
      ko: "MIT에 추가된 조항이 모델마다 다릅니다. 매출·사용자 수·경쟁 서비스 제한 등 해당 모델의 LICENSE를 직접 확인하세요.",
      en: "The added terms on top of MIT vary by model. Check that model's LICENSE directly for revenue, user-count, or competing-service restrictions.",
    },
    "https://opensource.org/license/mit",
  ),
  Kimi: licensePolicy(
    "conditional",
    "조건부 상업 이용",
    "공개 가중치",
    {
      ko: "상업 이용은 가능하지만 월간 활성 사용자 1억 명 또는 월매출 2천만 달러 초과 시 제품 화면에 Kimi K2 표시가 필요합니다.",
      en: "Commercial use is allowed, but exceeding 100 million monthly active users or $20M in monthly revenue requires displaying \"Kimi K2\" in the product UI.",
    },
    "https://huggingface.co/moonshotai/Kimi-K2-Instruct/blob/main/LICENSE",
  ),
  "Upstage Solar License": licensePolicy(
    "conditional",
    "조건부 상업 이용",
    "공개 가중치",
    {
      ko: "가중치를 그대로 쓰는 상업 이용은 가능하지만, 파생 모델을 만들 경우 이름에 'Solar' 접두사를 붙이고 'Built with Solar' 문구를 표시하는 등 별도 조건을 따라야 합니다.",
      en: "Commercial use of the weights as-is is allowed, but creating a derivative model requires prefixing the name with \"Solar\" and displaying \"Built with Solar,\" among other conditions.",
    },
    "https://huggingface.co/upstage/Solar-Open2-250B/blob/main/LICENSE",
  ),
  Jamba: licensePolicy(
    "conditional",
    "조건부 상업 이용",
    "공개 가중치",
    {
      ko: "연매출 5천만 달러 이하에서 조건부 상업 이용이 가능하며 이를 초과하면 AI21의 별도 라이선스가 필요합니다.",
      en: "Conditional commercial use is allowed under $50M in annual revenue; exceeding that requires a separate license from AI21.",
    },
    "https://huggingface.co/ai21labs/AI21-Jamba-1.5-Mini/blob/main/LICENSE.txt",
  ),
  "Kimi K3 License": licensePolicy(
    "review",
    "약관 확인 필요",
    "공개 가중치",
    {
      ko: "Kimi K2와는 다른 자체 라이선스 문서로, 상업적 복제·수정·재배포·판매를 폭넓게 허용하지만 별도의 매출·사용자 규모 기준이 있어 해당 모델의 LICENSE를 직접 확인해야 합니다.",
      en: "A separate license document from Kimi K2's; it broadly allows commercial copying, modification, redistribution, and resale, but has its own revenue/user-scale thresholds, so check that model's LICENSE directly.",
    },
    "https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE",
  ),
  "OpenMDW-1.1": licensePolicy(
    "allowed",
    "상업 이용 가능",
    "오픈소스",
    {
      ko: "MIT와 유사한 permissive 라이선스로 상업 이용, 파인튜닝, 재배포가 허용됩니다.",
      en: "An MIT-like permissive license allowing commercial use, fine-tuning, and redistribution.",
    },
    "https://huggingface.co/poolsideai/Laguna-XS-2.1",
  ),
  "NVIDIA Open": licensePolicy(
    "conditional",
    "조건부 상업 이용",
    "공개 가중치",
    {
      ko: "상업 이용을 포함한 사용·수정·배포가 가능하지만 NVIDIA Open Model License와 모델별 사용 제한을 따라야 합니다.",
      en: "Use, modification, and redistribution — including commercial use — are allowed, but you must follow the NVIDIA Open Model License and any model-specific use restrictions.",
    },
    "https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/",
  ),
  "Liquid AI": licensePolicy(
    "review",
    "모델별 확인 필요",
    "공개 범위 모델별 상이",
    {
      ko: "LFM 세대와 배포 채널에 따라 약관이 다를 수 있어 사용하려는 체크포인트의 모델 카드와 LICENSE를 확인해야 합니다.",
      en: "Terms can differ by LFM generation and distribution channel, so check the model card and LICENSE for the specific checkpoint you intend to use.",
    },
    "https://www.liquid.ai/",
  ),
  "HyperCLOVAX SEED": licensePolicy(
    "conditional",
    "조건부 상업 이용",
    "공개 가중치",
    {
      ko: "상업 이용은 가능하지만 월간 활성 사용자 1천만 명 초과 또는 NAVER와 직접 경쟁하는 서비스는 별도 허가가 필요합니다.",
      en: "Commercial use is allowed, but exceeding 10 million monthly active users, or services directly competing with NAVER, require separate permission.",
    },
    "https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Think-14B/blob/main/LICENSE",
  ),
  "OpenRAIL-M": licensePolicy(
    "conditional",
    "조건부 상업 이용",
    "공개 가중치",
    {
      ko: "상업 이용을 일괄 금지하지 않지만 책임 있는 AI 사용 제한과 파생 모델 재배포 조건을 승계해야 합니다.",
      en: "Commercial use isn't blanket-prohibited, but responsible-AI use restrictions and derivative-redistribution terms carry forward.",
    },
    "https://www.licenses.ai/ai-licenses",
  ),
  "CreativeML Open RAIL++-M": licensePolicy(
    "conditional",
    "조건부 상업 이용",
    "공개 가중치",
    {
      ko: "상업 이용을 일괄 금지하지 않지만 책임 있는 AI 사용 제한과 파생 모델 재배포 조건을 확인해야 합니다.",
      en: "Commercial use is not blanket-prohibited, but responsible-AI restrictions and derivative redistribution terms must be reviewed.",
    },
    "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/blob/main/LICENSE.md",
  ),
  "Stability AI Community": licensePolicy(
    "conditional",
    "조건부 상업 이용",
    "공개 가중치·매출 조건",
    {
      ko: "연 매출 100만 달러 미만 개인·조직은 커뮤니티 라이선스 범위에서 이용할 수 있으며, 그 이상은 Stability AI의 별도 기업 라이선스가 필요합니다.",
      en: "Individuals and organizations under USD 1 million in annual revenue may use the model under the Community License; larger organizations need a separate enterprise license.",
    },
    "https://huggingface.co/stabilityai/stable-diffusion-3.5-medium/blob/main/LICENSE.md",
  ),
  Falcon: licensePolicy(
    "conditional",
    "조건부 상업 이용",
    "공개 가중치",
    {
      ko: "일반 상업 제품 사용은 가능하지만 공유 인스턴스·추론 API 같은 호스팅 서비스에는 TII의 별도 허가가 필요합니다.",
      en: "General commercial product use is allowed, but hosted services like shared instances or inference APIs require separate permission from TII.",
    },
    "https://huggingface.co/tiiuae/falcon-180B-chat/blob/main/LICENSE.txt",
  ),
};

window.LLM_GPU_CHECKER_DATA.modelLicensePolicies = {
  "Fish Audio S2 Pro": licensePolicy(
    "noncommercial",
    "비상업 연구용",
    "공개 가중치·상업 사용 제한",
    {
      ko: "S2 Pro 공개 체크포인트는 Fish Audio Research License의 비상업 사용 조건입니다. 코드 라이선스와 가중치 라이선스는 다르며 상용 서비스에는 별도 허가를 확인하세요.",
      en: "The public S2 Pro checkpoint is limited to non-commercial use under the Fish Audio Research License. Code and weight licenses differ; obtain separate permission for commercial services.",
    },
    "https://huggingface.co/fishaudio/s2-pro/blob/main/LICENSE.md",
  ),
  "Kimi K2 Thinking": window.LLM_GPU_CHECKER_DATA.licensePolicies.Kimi,
  "KlingAIResearch/LivePortrait": licensePolicy(
    "review",
    "의존 모델 조건 확인",
    "MIT 코드·제한 가능 가중치",
    {
      ko: "LivePortrait 코드는 MIT이지만 기본 얼굴 검출에 쓰이는 InsightFace 모델은 비상업 연구 조건입니다. 상업 배포 시 해당 검출 모델을 교체해야 합니다.",
      en: "LivePortrait code is MIT, but its default InsightFace detector weights are for non-commercial research. Replace that detector for commercial deployment.",
    },
    "https://github.com/KlingAIResearch/LivePortrait/blob/main/LICENSE",
  ),
};

window.LLM_GPU_CHECKER_DATA.licenseMeta = {
  updatedAt: "2026-07-23",
  disclaimer: "간단한 참고용 요약이며 법률 자문이 아닙니다. 상업 배포 전에는 해당 체크포인트의 최신 LICENSE와 이용 정책을 직접 확인하세요.",
};
