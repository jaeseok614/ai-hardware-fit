// These are planning BOMs, not exact retail SKU compatibility guarantees.
// Chip/iGPU reference prices must never be treated as a complete Mac/laptop quote.
function advisorPricePoint(item, pricing, currency) {
  if (item.budgetScope === "system") {
    return {
      value: item.equipment?.complete ? (currency === "KRW" ? item.equipment.totalKrw : pricing.toUsd(item.equipment.totalKrw, "KRW")) : 0,
      label: item.equipment?.complete ? pricing.formatFromKrw(item.equipment.totalKrw, uiLanguage) : (uiLanguage === "en" ? "System quote required" : "전체 장비 견적 필요"),
      kind: item.equipment?.reason === "bundle" ? (item.equipment.priceKind === "launch-reference" ? "launch" : "market") : "estimate",
      evidence: advisorEquipmentPriceEvidence(item),
    };
  }
  if (item.koreanMarket?.lowestKrw > 0) {
    return {
      value: currency === "KRW"
        ? item.koreanMarket.lowestKrw
        : pricing.toUsd(item.koreanMarket.lowestKrw, "KRW"),
      label: pricing.formatFromKrw(item.koreanMarket.lowestKrw, uiLanguage),
      kind: item.koreanMarket.priceKind === "launch-reference" ? "launch" : "market",
      evidence: item.koreanMarket.priceScope === "complete-system" ? advisorEquipmentPriceEvidence(item) : uiLanguage === "en"
        ? `Korean market price · checked ${item.koreanMarket.updatedAt}`
        : `국내 시세 · ${item.koreanMarket.updatedAt} 확인`,
    };
  }
  const priceUsd = Number(item.market?.priceUsd || 0);
  return {
    value: currency === "KRW" ? pricing.toKrw(priceUsd, "USD") : priceUsd,
    label: pricing.formatFromUsd(priceUsd, uiLanguage),
    kind: item.market?.priceKind === "launch-reference" ? "launch" : "estimate",
    evidence: item.market?.priceKind === "launch-reference"
      ? (uiLanguage === "en" ? "Launch-price reference" : "출시 가격 참고")
      : (uiLanguage === "en" ? "Calculated price estimate" : "계산 가격 추정"),
  };
}

function advisorEquipmentPriceEvidence(item) {
  const plan = item.equipment;
  if (plan?.reason !== "bundle") return uiLanguage === "en" ? "GPU reference + component planning assumptions" : "GPU 참고 가격 + 부품 계획 가정값";
  return (uiLanguage === "en" ? "Complete-system reference (not a GPU card price)" : "완제품 참고가 (GPU 단품 가격 아님)")
    + (plan.priceKind === "launch-reference" ? (uiLanguage === "en" ? " · Official starting price" : " · 공식 기본형 시작 가격") : "")
    + ` · ${plan.updatedAt}`;
}

function advisorEquipmentPlan(preset, hardware, estimate, market, gpuPriceKrw) {
  const bundle = window.LLM_GPU_CHECKER_DATA?.systemPriceReference?.[preset.id] || window.LLM_GPU_CHECKER_DATA?.koreanGpuMarket?.find((row) => row.gpuId === preset.id && row.priceScope === "complete-system");
  if (bundle?.lowestKrw > 0) return { rows: [{ type: "system", name: shortGpuName(preset.name), priceKrw: bundle.lowestKrw }], partsKrw: 0, totalKrw: bundle.lowestKrw, complete: true, reason: "bundle", sourceUrl: bundle.sourceUrl, updatedAt: bundle.updatedAt, priceKind: bundle.priceKind };
  const rows = [{ type: "gpu", name: shortGpuName(preset.name), priceKrw: gpuPriceKrw }];
  const standalone = preset.formFactor === "desktop" && preset.vendor !== "Apple" && preset.memoryType !== "unified";
  if (!standalone) return { rows, partsKrw: 0, totalKrw: null, complete: false, reason: "system-quote" };
  const catalog = window.LLM_GPU_CHECKER_DATA?.systemPartCatalog;
  if (!catalog) return { rows, partsKrw: 0, totalKrw: null, complete: false, reason: "parts-missing" };
  const workstation = Number(preset.vram) > 48;
  const cpu = catalog.cpu.find((part) => part.id === (workstation ? "trpro-7975wx" : "r7-9700x"));
  const board = catalog.motherboard.find((part) => part.id === (workstation ? "wrx90-eatx" : "b650-atx"));
  const ramGb = Math.max(32, Number(hardware.ramGb || hardware.ram || preset.ram || 32), Math.ceil(Number(estimate?.requiredGb || 0) * 1.5));
  const memory = catalog.memory.find((part) => part.ecc === workstation && part.capacityGb >= ramGb);
  const physical = window.LLM_GPU_CHECKER_DATA?.gpuPhysicalReference?.[preset.id];
  const watts = Math.max(Number(physical?.recommendedPsuW || 0), Math.ceil((Number(market.powerW || 350) + Number(cpu?.tdpW || 105) + 100) * 1.3));
  const psu = catalog.psu.find((part) => !part.redundant && part.watts >= watts);
  const pcCase = catalog.case.find((part) => part.id === (workstation ? "workstation-eatx" : "large-atx"));
  const storage = catalog.storage.find((part) => part.id === "nvme-2tb");
  const selected = { cpu, motherboard: board, memory, storage, psu, case: pcCase };
  Object.entries(selected).forEach(([type, part]) => { if (part) rows.push({ type, name: part.name, priceKrw: part.priceKrw }); });
  // No cooler catalogue exists yet: keep this planning assumption explicit.
  rows.push({ type: "cooling", name: workstation ? "CPU cooling allowance (sTR5)" : "CPU cooling allowance", priceKrw: workstation ? 200000 : 80000 });
  const partsKrw = rows.slice(1).reduce((total, row) => total + row.priceKrw, 0);
  const complete = gpuPriceKrw > 0 && Object.values(selected).every(Boolean);
  return { rows, partsKrw, totalKrw: complete ? gpuPriceKrw + partsKrw : null, complete, reason: complete ? "planning" : "parts-missing" };
}

function renderAdvisorEquipment(item, en, pricing) {
  const plan = item.equipment;
  const money = (krw) => pricing?.formatFromKrw(krw, uiLanguage) || `${Math.round(krw).toLocaleString()} KRW`;
  const labels = { system: en ? "Complete system" : "완제품", gpu: "GPU", cpu: "CPU", motherboard: en ? "Motherboard" : "메인보드", memory: "RAM", storage: en ? "Storage" : "저장장치", psu: en ? "Power supply" : "파워", case: en ? "Case" : "케이스", cooling: en ? "Cooling allowance" : "CPU 쿨러 예산" };
  const cleanName = (row) => en ? row.name.replace(/\s*\([^)]*[가-힣][^)]*\)/g, "") : row.type === "cooling" ? (item.preset.vram > 48 ? "sTR5 쿨러 계획 예산" : "CPU 쿨러 계획 예산") : row.name;
  return `<details class="advisor-equipment"><summary>${en ? "Equipment & itemized costs" : "부가 장비·부품별 가격"}</summary>
    ${plan.reason === "bundle" ? `<p>${en ? "Complete-system reference: CPU, unified memory, storage, enclosure and power are included, not added again. Verify the exact memory/SSD configuration." : "CPU·통합메모리·저장장치·본체·전원을 포함한 완제품 참고가로, 부품을 중복 합산하지 않습니다. 정확한 메모리·SSD 구성을 확인하세요."} <a href="${escapeAttr(plan.sourceUrl)}" target="_blank" rel="noopener noreferrer">${en ? "Price source" : "가격 출처"}</a> · ${escapeHtml(plan.updatedAt)}${plan.priceKind === "launch-reference" ? (en ? " · Official starting-price reference, not a live quote" : " · 공식 기본형 시작 가격 참고, 실시간 견적 아님") : (en ? " · Dated catalogue reference, not a live quote" : " · 기준일 카탈로그 참고가, 실시간 견적 아님")}</p>` : ""}
    ${plan.complete ? `<dl>${plan.rows.map((row) => `<div><dt>${labels[row.type]}</dt><dd>${escapeHtml(cleanName(row))}<small>${money(row.priceKrw)}</small></dd></div>`).join("")}</dl>` : `<p>${en ? "A complete system quote is required for this configuration. The GPU/chip reference alone does not include a verified host, memory, storage, cooling, or power supply." : "이 구성은 완제품·호스트를 포함한 별도 견적이 필요합니다. GPU·칩 참고 가격만으로 CPU·RAM·저장장치·냉각·전원까지 포함한 가격을 확정할 수 없습니다."}</p>`}
    <p>${en ? "Parts use existing catalogue planning assumptions, not live shop prices. Cooling is an allowance. Excludes monitor, peripherals, OS, assembly, shipping and optional UPS/network upgrades. Confirm exact GPU dimensions, connectors, board BIOS and memory support before buying." : "부품은 기존 카탈로그의 계획 가정값이며 실시간 판매가가 아닙니다. 냉각은 예산 가정입니다. 모니터·주변기기·OS·조립·배송·선택 UPS/네트워크 비용은 제외합니다. 구매 전 정확한 GPU 크기·전원 커넥터·보드 BIOS·메모리 지원을 확인하세요."}</p></details>`;
}

function renderAdvisorQuoteCandidates(items, en) {
  const unknown = items.filter((item) => item.runnable && item.fitsVendor && item.fitsFormFactor && !item.equipment.complete)
    .sort((a, b) => b.preset.bandwidth - a.preset.bandwidth).slice(0, 6);
  if (!unknown.length) return "";
  return `<details class="advisor-equipment"><summary>${en ? "Additional compatible hardware · system quote required" : "추가 실행 후보 · 전체 장비 견적 필요"}</summary><p>${en ? "Memory-fit candidates, not certified within budget. Upgrade configurations do not inherit the base system's price; speed remains an estimate, not a guarantee." : "메모리상 실행 후보이며 예산 충족을 확인한 추천이 아닙니다. 업그레이드 구성에 기본형 가격을 적용하지 않습니다. 속도는 추정이며 보장되지 않습니다."}</p><ul>${unknown.map((item) => `<li>${escapeHtml(shortGpuName(item.preset.name))} · ${escapeHtml(item.estimate?.settingLabel || item.estimate?.quant?.label || "—")} <button type="button" class="ghost-button" data-advisor-select-gpu="${escapeAttr(item.preset.id)}">${en ? "Inspect hardware" : "장비 확인"}</button></li>`).join("")}</ul></details>`;
}
