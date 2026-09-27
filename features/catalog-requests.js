(() => {
  function normalize(value) {
    return String(value || "").normalize("NFKC").toLocaleLowerCase().replace(/[^a-z0-9가-힣]+/g, "");
  }

  function findDuplicate(query, items = []) {
    const key = normalize(query);
    if (!key) return null;
    return items.find((item) => {
      const names = [item.name, item.id, ...(item.aliases || [])].map(normalize);
      return names.includes(key);
    }) || null;
  }

  function issueUrl(kind, name = "") {
    const title = kind === "model" ? `[Model request] ${name}` : kind === "price" ? `[Price report] ${name}` : `[GPU request] ${name}`;
    const template = kind === "model" ? "model-request.yml" : kind === "price" ? "price-report.yml" : "gpu-request.yml";
    const body = kind === "price"
      ? `GPU: ${name}\nPrice (KRW): \nCondition: new / used\nSource URL: \nChecked date: `
      : `Requested item: ${name}\nOfficial source URL: \nReason / use case: `;
    const params = new URLSearchParams({ template, title });
    if (kind === "price") params.set("body", body);
    return `https://github.com/jaeseok614/ai-hardware-fit/issues/new?${params}`;
  }

  function statusUrl(status = "open") {
    const query = status === "completed"
      ? "repo:jaeseok614/ai-hardware-fit is:issue is:closed label:data"
      : "repo:jaeseok614/ai-hardware-fit is:issue is:open label:data";
    return `https://github.com/jaeseok614/ai-hardware-fit/issues?q=${encodeURIComponent(query)}`;
  }

  function duplicateSummary(query, gpus = [], models = []) {
    const gpu = findDuplicate(query, gpus);
    const model = findDuplicate(query, models);
    return {
      duplicate: gpu || model || null,
      kind: gpu ? "gpu" : model ? "model" : "",
      query: String(query || "").trim(),
    };
  }

  function workflow() {
    return [
      { id: "submitted", ko: "접수", en: "Submitted" },
      { id: "source-check", ko: "출처 확인", en: "Source review" },
      { id: "data-review", ko: "데이터 검토", en: "Data review" },
      { id: "completed", ko: "릴리스 반영", en: "Released" },
    ];
  }

  function coverage(gpus = [], marketRows = []) {
    const verified = new Set(marketRows.filter((row) => row.sourceUrl && row.updatedAt).map((row) => row.gpuId));
    return {
      total: gpus.filter((gpu) => gpu.id !== "custom").length,
      verified: verified.size,
      missing: gpus.filter((gpu) => gpu.id !== "custom" && !verified.has(gpu.id)),
    };
  }

  window.AIHardwareCatalogRequests = {
    normalize,
    findDuplicate,
    duplicateSummary,
    issueUrl,
    statusUrl,
    workflow,
    coverage,
  };
})();
