(() => {
  const PRIORITY_GPU_IDS = [
    "rtx5090-32", "rtx5080-16", "rtx5070ti-16", "rtx5070-12", "rtx5060ti-16",
    "rtx5060ti-8", "rtx5060-8", "rtx4090-24", "rtx4080super-16", "rtx4080-16",
    "rtx4070tisuper-16", "rtx4070ti-12", "rtx4070super-12", "rtx4070-12", "rtx4060ti-16",
    "rtx4060ti-8", "rtx4060-8", "rtx3090-24", "rtx3080-12", "rtx3060-12",
    "rx9070xt-16", "rx7900xtx-24", "ryzen-ai-max-plus-395-128", "ryzen-ai-max-plus-395-64",
    "rtx6000ada-48", "rtxpro6000blackwell-96", "h200-141", "h100-sxm-80", "l40s-48", "arcprob60-24",
  ];

  const OFFICIAL_SOURCE_OVERRIDES = {
    "rtx5090-32": "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/",
    "rtx5080-16": "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5080/",
    "rtx5070ti-16": "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5070-family/",
    "rtx5070-12": "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5070-family/",
    "rtx5060ti-16": "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/",
    "rtx5060ti-8": "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/",
    "rtx5060-8": "https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5060-family/",
    "rtx4090-24": "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/",
    "rtx4080super-16": "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4080/",
    "rtx4080-16": "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4080/",
    "rtx4070tisuper-16": "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4070-family/",
    "rtx4070ti-12": "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4070-family/",
    "rtx4070super-12": "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4070-family/",
    "rtx4070-12": "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4070-family/",
    "rtx4060ti-16": "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4060-4060ti/",
    "rtx4060ti-8": "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4060-4060ti/",
    "rtx4060-8": "https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4060-4060ti/",
    "rtx3090-24": "https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3090-3090ti/",
    "rtx3080-12": "https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3080-3080ti/",
    "rtx3060-12": "https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3060-3060ti/",
    "rx9070xt-16": "https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/amd-radeon-rx-9070xt.html",
    "rx7900xtx-24": "https://www.amd.com/en/products/graphics/desktops/radeon/7000-series/amd-radeon-rx-7900xtx.html",
    "rtxpro6000blackwell-96": "https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-6000/",
    "rtx6000ada-48": "https://www.nvidia.com/en-us/design-visualization/rtx-6000/",
    "h200-141": "https://www.nvidia.com/en-us/data-center/h200/",
    "h100-sxm-80": "https://www.nvidia.com/en-us/data-center/h100/",
    "l40s-48": "https://www.nvidia.com/en-us/data-center/l40s/",
    "arcprob60-24": "https://www.intel.com/content/www/us/en/products/sku/243916/intel-arc-pro-b60-graphics/specifications.html",
  };

  (window.LLM_GPU_CHECKER_DATA?.gpus || []).forEach((gpu) => {
    const sourceUrl = OFFICIAL_SOURCE_OVERRIDES[gpu.id];
    if (!sourceUrl) return;
    gpu.sourceUrl = sourceUrl;
    gpu.sourceScope = "model";
    gpu.specStatus = "sourced";
    gpu.verifiedAt ||= "2026-08-03";
  });
  (window.LLM_GPU_CHECKER_DATA?.gpus || []).forEach((gpu) => {
    if (PRIORITY_GPU_IDS.includes(gpu.id) && gpu.sourceUrl) gpu.verifiedAt ||= "2026-08-03";
  });
  const FAMILY_PATTERNS = [
    /\/laptops\/(?:40|50)-series\/?$/i,
    /\/graphics-cards\/(?:geforce|radeon)[^/]*\/?$/i,
    /\/products\/graphics\/[^/]+\/?$/i,
  ];

  function sourceStatus(gpu) {
    const url = String(gpu?.sourceUrl || "");
    if (!url) return { id: "missing", level: 0, ko: "모델별 공식 출처 필요", en: "Model-specific source needed" };
    if (FAMILY_PATTERNS.some((pattern) => pattern.test(url))) {
      return { id: "family", level: 1, ko: "제품군 공식 출처", en: "Official family source" };
    }
    if (/nvidia\.com|amd\.com|intel\.com|apple\.com/i.test(url)) {
      return { id: "official", level: 3, ko: "모델별 공식 출처", en: "Official model source" };
    }
    return { id: "external", level: 2, ko: "외부 사양 출처", en: "External specification source" };
  }

  function audit(gpus = [], marketRows = []) {
    const rows = gpus.filter((gpu) => gpu.id !== "custom").map((gpu) => ({
      gpu,
      source: sourceStatus(gpu),
      priority: PRIORITY_GPU_IDS.indexOf(gpu.id),
      hasMarket: marketRows.some((row) => row.gpuId === gpu.id && row.sourceUrl && row.updatedAt),
    }));
    return {
      total: rows.length,
      official: rows.filter((row) => row.source.id === "official").length,
      external: rows.filter((row) => row.source.id === "external").length,
      family: rows.filter((row) => row.source.id === "family").length,
      missing: rows.filter((row) => row.source.id === "missing").length,
      market: rows.filter((row) => row.hasMarket).length,
      priority: rows
        .filter((row) => row.priority >= 0)
        .sort((a, b) => a.priority - b.priority),
    };
  }

  function issueUrl(gpu) {
    const params = new URLSearchParams({
      template: "gpu-request.yml",
      title: `[GPU source] ${gpu?.name || ""}`,
    });
    return `https://github.com/jaeseok614/ai-hardware-fit/issues/new?${params}`;
  }

  window.AIHardwareEvidence = { PRIORITY_GPU_IDS, OFFICIAL_SOURCE_OVERRIDES, sourceStatus, audit, issueUrl };
})();
