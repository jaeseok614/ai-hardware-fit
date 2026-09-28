(() => {
  const WORKSPACES = new Set(["finder", "modelFinder", "placement", "infra", "community", "apiCost", "ontologyCost"]);

  function apply(mode) {
    const active = WORKSPACES.has(mode) ? mode : "finder";
    const previous = document.body.dataset.workspace;
    document.body.dataset.workspace = active;
    for (const name of WORKSPACES) {
      const className = name === "modelFinder"
        ? "model-finder"
        : name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
      document.body.classList.toggle(`${className}-task-active`, name === active);
    }
    const visibility = {
      gpuPlacementPanel: active === "placement",
      gpuAdvisorPanel: active === "modelFinder",
      decisionStudio: active === "infra",
      benchmarkSheet: active === "finder",
      benchmarkDashboard: active === "finder",
      gpuInsightsPanel: active === "finder",
    };
    Object.entries(visibility).forEach(([id, visible]) => {
      const node = document.getElementById(id);
      if (node) node.hidden = !visible;
    });
    if (previous !== active) {
      window.dispatchEvent(new CustomEvent("ai-hardware-workspacechange", { detail: { mode: active, previous } }));
    }
    return active;
  }

  window.AIHardwareWorkspace = { apply };
})();
