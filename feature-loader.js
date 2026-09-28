/**
 * Loads the larger infrastructure workspace only when the user opens it.
 * Core GPU/model recommendations remain available without this extra file.
 */
(() => {
  const ownUrl = new URL(document.currentScript?.src || window.location.href);
  const cacheVersion = ownUrl.searchParams.get("v") || "";
  let infrastructurePromise = null;
  let decisionToolsPromise = null;
  let valueFrontierPromise = null;
  let benchmarkPromise = null;
  let apiCostPromise = null;
  let ontologyCostPromise = null;

  function loadScript(path) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-feature="${path}"]`);
      if (existing?.dataset.loaded === "true") {
        resolve();
        return;
      }
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = `./${path}${cacheVersion ? `?v=${encodeURIComponent(cacheVersion)}` : ""}`;
      script.defer = true;
      script.dataset.feature = path;
      script.addEventListener("load", () => {
        script.dataset.loaded = "true";
        resolve();
      }, { once: true });
      script.addEventListener("error", (error) => {
        // Remove the failed element so a subsequent user action can retry.
        script.remove();
        reject(error);
      }, { once: true });
      document.head.appendChild(script);
    });
  }

  window.loadInfrastructureStudio = () => {
    if (!infrastructurePromise) {
      infrastructurePromise = window.loadDecisionTools()
        .then(() => loadScript("platform-v3.js"))
        .catch((error) => {
        infrastructurePromise = null;
        window.AIHardwareUI?.announce(
          document.documentElement.lang === "en"
            ? "Could not load the infrastructure workspace."
            : "인프라 견적 화면을 불러오지 못했습니다.",
          "error",
        );
        throw error;
        });
    }
    return infrastructurePromise;
  };

  window.loadDecisionTools = () => {
    if (!decisionToolsPromise) {
      decisionToolsPromise = loadScript("platform-v2.js").catch((error) => {
        decisionToolsPromise = null;
        throw error;
      });
    }
    return decisionToolsPromise;
  };

  window.loadApiCostEstimator = () => {
    if (!apiCostPromise) {
      apiCostPromise = loadScript("features/api-cost-estimator.js").catch((error) => {
        apiCostPromise = null;
        throw error;
      });
    }
    return apiCostPromise;
  };

  window.loadOntologyCostEstimator = () => {
    if (!ontologyCostPromise) {
      ontologyCostPromise = loadScript("features/ontology-cost-estimator.js").catch((error) => {
        ontologyCostPromise = null;
        throw error;
      });
    }
    return ontologyCostPromise;
  };

  window.loadValueFrontier = () => {
    if (!valueFrontierPromise) {
      valueFrontierPromise = loadScript("features/value-frontier.js").catch((error) => {
        valueFrontierPromise = null;
        throw error;
      });
    }
    return valueFrontierPromise;
  };

  window.loadBenchmarkWorkspace = () => {
    if (!benchmarkPromise) {
      benchmarkPromise = window.loadValueFrontier()
        .then(() => loadScript("features/benchmark-workspace.js"))
        .then(() => {
          window.AIHardwareBenchmark?.renderDashboard();
          window.AIHardwareBenchmark?.renderSheet();
          // These two renders bake each row's raw Korean fields (e.g.
          // qualityBenchmark.note like "공식 품질") straight from data --
          // unlike the table's own headers/labels, they're not wrapped in a
          // uiLanguage ternary, so they only ever get translated by the
          // dictionary sweep below. Every OTHER path that (re-)renders the
          // benchmark tables (setUiLanguage's manual toggle, and the four
          // infra/placement/modelFinder/apiCost core-task branches in
          // render()) already follows up with this same sweep; this lazy-
          // load entry point (triggered by scrolling the panel into view, a
          // 2.5s fallback timer, or opening a metric filter) was the one
          // place that didn't, so a page that loaded already in English and
          // then lazy-loaded this panel for the first time kept showing
          // untranslated Korean condition/environment text forever (until
          // the user happened to toggle the language switch, which forces a
          // full re-render + sweep).
          const currentLanguage = document.documentElement.lang === "en" ? "en" : "ko";
          window.translateDynamicUi?.(currentLanguage);
          window.AIHardwareLocalization?.apply(currentLanguage);
        })
        .catch((error) => {
          benchmarkPromise = null;
          window.AIHardwareUI?.announce(
            document.documentElement.lang === "en"
              ? "Could not load the benchmark workspace."
              : "벤치마크 화면을 불러오지 못했습니다.",
            "error",
          );
          throw error;
        });
    }
    return benchmarkPromise;
  };

  document.addEventListener("DOMContentLoaded", () => {
    const params = new URL(window.location.href).searchParams;
    const mode = params.get("mode");
    if (mode === "infra" || params.get("studio") === "consulting" || params.has("scenario")) {
      window.loadInfrastructureStudio();
    }
    if (mode === "apiCost") {
      window.loadApiCostEstimator().then(() => window.AIHardwareCore?.setCoreTaskMode("apiCost"));
    }
    if (mode === "ontologyCost") {
      window.loadOntologyCostEstimator().then(() => window.AIHardwareCore?.setCoreTaskMode("ontologyCost"));
    }
    if (params.get("ui") === "expert" || params.has("model") || params.has("hub") || params.has("detail") || params.has("build")) {
      window.loadDecisionTools();
    }
    const frontierTarget = document.getElementById("valueFrontier");
    const benchmarkTarget = document.getElementById("benchmarkSheet");
    const targets = [frontierTarget, benchmarkTarget].filter(Boolean);
    if ("IntersectionObserver" in window && targets.length) {
      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        entries.filter((entry) => entry.isIntersecting).forEach((entry) => observer.unobserve(entry.target));
        window.loadBenchmarkWorkspace();
      }, { rootMargin: "500px" });
      targets.forEach((target) => observer.observe(target));
    } else {
      window.setTimeout(() => {
        const frontierVisible = frontierTarget && !frontierTarget.closest("[hidden]");
        const benchmarkVisible = benchmarkTarget && !benchmarkTarget.closest("[hidden]");
        if (frontierVisible || benchmarkVisible) window.loadBenchmarkWorkspace();
      }, 2500);
    }
  });
})();
