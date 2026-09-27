#!/usr/bin/env node

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";

const root = process.cwd();
const siteRoot = fs.existsSync(path.join(root, "_site", "index.html")) ? path.join(root, "_site") : root;
const outputDir = path.join(root, "outputs", "ui-regression");
fs.mkdirSync(outputDir, { recursive: true });

function loadPlaywright() {
  try {
    return createRequire(import.meta.url)("playwright");
  } catch (error) {
    const moduleDir = process.env.PLAYWRIGHT_MODULE_DIR;
    if (moduleDir) {
      return createRequire(path.join(moduleDir, "package.json"))("playwright");
    }
    throw new Error("Playwright is required. Run `npm install --no-save playwright` before `npm run test:visual`.", { cause: error });
  }
}

function resolveOptionalModule(modulePath) {
  try {
    return createRequire(import.meta.url).resolve(modulePath);
  } catch {
    const moduleDir = process.env.PLAYWRIGHT_MODULE_DIR;
    if (!moduleDir) return "";
    try { return createRequire(path.join(moduleDir, "package.json")).resolve(modulePath); } catch { return ""; }
  }
}

function contentType(file) {
  return {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".gif": "image/gif",
    ".xml": "application/xml",
    ".txt": "text/plain; charset=utf-8",
  }[path.extname(file)] || "application/octet-stream";
}

const server = http.createServer((request, response) => {
  try {
    const url = new URL(request.url, "http://127.0.0.1");
    let relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    if (!relative || relative.endsWith("/")) relative += "index.html";
    const file = path.resolve(siteRoot, relative);
    if (!file.startsWith(path.resolve(siteRoot))) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    const body = fs.readFileSync(file);
    response.writeHead(200, { "Content-Type": contentType(file), "Cache-Control": "no-store" });
    response.end(body);
  } catch {
    response.writeHead(404).end("Not found");
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
const baseUrl = `http://127.0.0.1:${port}`;
const { chromium } = loadPlaywright();
const launchOptions = { headless: true };
if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE) {
  launchOptions.executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
}

const browser = await chromium.launch(launchOptions);
const viewports = [
  [1920, 1080],
  [1440, 900],
  [1280, 720],
  [768, 1024],
  [430, 932],
  [390, 844],
];
const report = { generatedAt: new Date().toISOString(), viewports: [], flows: {}, accessibility: {} };
const axePath = resolveOptionalModule("axe-core/axe.min.js");

function check(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  for (const [width, height] of viewports) {
    const context = await browser.newContext({ viewport: { width, height }, colorScheme: "light" });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/?gpu=rtx3060-12&lang=ko`, { waitUntil: "networkidle" });
    await page.locator('[data-workload-tab="audioTts"]').click();
    await page.locator("#simpleModePanel").scrollIntoViewIfNeeded();

    const state = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      purposeWorkload: document.querySelector("#simplePurpose")?.dataset.workload,
      purposeValues: [...document.querySelectorAll("#simplePurpose option")].map((option) => option.value),
      cardTypes: [...document.querySelectorAll(".simple-pick-card")].map((card) => card.dataset.modelType),
      taskButtons: document.querySelectorAll(".core-task-actions [data-core-task]").length,
      primaryTaskButtons: document.querySelectorAll(".core-task-primary [data-core-task]").length,
      mainWidth: Math.round(document.querySelector("main")?.getBoundingClientRect().width || 0),
      githubTextNode: Boolean(document.querySelector(".github-link-text")),
      githubLinkDisplay: getComputedStyle(document.querySelector(".github-link")).display,
      bodyAriaSelected: document.body.hasAttribute("aria-selected"),
    }));
    check(state.overflow <= 0, `${width}x${height}: horizontal overflow ${state.overflow}px`);
    check(state.githubTextNode, `${width}x${height}: language sweep flattened the GitHub link markup`);
    check(!state.bodyAriaSelected, width + "x" + height + ": body must not receive tab-only aria-selected");
    if (width <= 520) check(state.githubLinkDisplay === "none", `${width}x${height}: mobile GitHub link should be hidden to preserve the brand`);
    check(state.purposeWorkload === "audioTts", `${width}x${height}: TTS purpose state was not restored`);
    check(state.purposeValues.includes("voiceCloning"), `${width}x${height}: voice-cloning purpose is missing`);
    check(state.cardTypes.length > 0 && state.cardTypes.every((type) => type === "audio-tts"), `${width}x${height}: recommendation crossed workload boundaries`);
    check(state.taskButtons === 7, width + "x" + height + ": task capability count changed");
    check(state.primaryTaskButtons === 3, width + "x" + height + ": first screen should expose exactly 3 primary tasks");

    if (width === 1280 && axePath) {
      await page.addScriptTag({ path: axePath });
      const axeResult = await page.evaluate(async () => window.axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      }));
      const blocking = axeResult.violations.filter((violation) => ["critical", "serious"].includes(violation.impact));
      check(blocking.length === 0, `axe found blocking issues: ${blocking.map((item) => `${item.id} [${item.nodes.slice(0, 3).map((node) => node.target.join(" ")).join(" | ")}]`).join(", ")}`);
      report.accessibility.ko = { violations: axeResult.violations.length, passes: axeResult.passes.length };
    }

    await page.screenshot({
      path: path.join(outputDir, `finder-tts-${width}x${height}.png`),
      fullPage: true,
    });
    report.viewports.push({ width, height, ...state });
    await context.close();
  }

  const lazyContext = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: "light" });
  const lazyPage = await lazyContext.newPage();
  await lazyPage.addInitScript(() => localStorage.setItem("ai-hardware-fit-primary-gpu-v1", "rtx3060-12"));
  await lazyPage.goto(`${baseUrl}/?lang=ko`, { waitUntil: "networkidle" });
  check(await lazyPage.locator("#onboardingScreen").isVisible(), "Saved GPU bypassed the homepage chooser");
  check((await lazyPage.locator("[data-quick-gpu]").first().textContent()).includes("최근 선택"), "Last-used GPU shortcut is missing");
  const landingParams = await lazyPage.evaluate(() => [...new URL(window.location.href).searchParams.keys()]);
  check(landingParams.length === 1 && landingParams[0] === "lang", "Untouched landing URL expanded with default controls");
  check(await lazyPage.locator("#decisionHub").count() === 0, "Decision tools loaded before a GPU was selected");
  let loadedScripts = await lazyPage.evaluate(() => performance.getEntriesByType("resource").map((entry) => entry.name));
  check(!loadedScripts.some((url) => /api-cost-estimator\.js/.test(url)), "API cost estimator loaded eagerly");
  check(!loadedScripts.some((url) => /ontology-cost-estimator\.js/.test(url)), "Ontology cost estimator loaded eagerly");

  await lazyPage.locator(".core-task-more > summary").click();
  await lazyPage.locator('[data-core-task="apiCost"]').click();
  await lazyPage.locator("#apiCostPanel").waitFor({ state: "visible" });
  loadedScripts = await lazyPage.evaluate(() => performance.getEntriesByType("resource").map((entry) => entry.name));
  check(loadedScripts.some((url) => /api-cost-estimator\.js/.test(url)), "API cost estimator did not lazy-load");

  await lazyPage.locator('[data-core-task="ontologyCost"]').click();
  await lazyPage.locator("#ontologyCostPanel").waitFor({ state: "visible" });
  loadedScripts = await lazyPage.evaluate(() => performance.getEntriesByType("resource").map((entry) => entry.name));
  check(loadedScripts.some((url) => /ontology-cost-estimator\.js/.test(url)), "Ontology cost estimator did not lazy-load");

  await lazyPage.locator('[data-core-task="finder"]').first().click();
  await lazyPage.locator("[data-quick-gpu]").first().click();
  await lazyPage.locator("#simpleModePanel").waitFor({ state: "visible" });
  check(await lazyPage.locator("#decisionHub").count() === 0, "Decision tools loaded for the simple GPU result");
  check(await lazyPage.locator("#benchmarkSheet").isHidden(), "Benchmark sheet is visible in simple mode");
  check(await lazyPage.locator(".mobile-decision-summary").count() === 0, "Duplicate mobile recommendation summary is still rendered");
  const compactResultUrl = await lazyPage.evaluate(() => window.location.search);
  check(/^\?lang=ko&gpu=[a-z0-9-]+$/.test(compactResultUrl), "GPU result URL is not compact: " + compactResultUrl);
  loadedScripts = await lazyPage.evaluate(() => performance.getEntriesByType("resource").map((entry) => entry.name));
  check(!loadedScripts.some((url) => /platform-v2\.js/.test(url)), "Decision tools loaded before expert mode");
  check(!loadedScripts.some((url) => /benchmark-workspace\.js/.test(url)), "Benchmark workspace loaded before expert mode");

  await lazyPage.locator('[data-app-mode="expert"]').click();
  await lazyPage.locator("#decisionHub").waitFor({ state: "attached" });
  loadedScripts = await lazyPage.evaluate(() => performance.getEntriesByType("resource").map((entry) => entry.name));
  check(loadedScripts.some((url) => /platform-v2\.js/.test(url)), "Decision tools did not lazy-load in expert mode");
  check(loadedScripts.some((url) => /benchmark-workspace\.js/.test(url)), "Benchmark workspace did not lazy-load in expert mode");
  report.flows.lazyAdvancedTools = true;
  await lazyContext.close();

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/?gpu=rtx3060-12&lang=ko`, { waitUntil: "networkidle" });
  await page.locator('[data-workload-tab="audioTts"]').click();
  await page.locator("#simplePurpose").selectOption("voiceCloning");
  const names = await page.locator(".simple-pick-head strong").allTextContents();
  check(names.includes("XTTS-v2"), "Voice cloning did not recommend XTTS-v2");
  await page.locator(".simple-pick-card-toggle").first().click();
  const feedbackLinks = await page.locator("[data-run-feedback]").evaluateAll((links) => links.map((link) => link.href));
  check(feedbackLinks.length === 2, "Success/failure feedback links are missing");
  check(feedbackLinks.every((url) => url.includes("github.com/jaeseok614/ai-hardware-fit/issues/new")), "Feedback does not open the repository issue form");
  const feedbackBodies = feedbackLinks.map((url) => new URL(url).searchParams.get("body") || "");
  check(feedbackBodies.every((body) => /런타임: PyTorch/.test(body) && !/llama\.?cpp/i.test(body)), "TTS feedback contains an unrelated LLM runtime");

  await page.locator('[data-language-toggle] [data-lang="en"]').click();
  const englishOptions = await page.locator("#simplePurpose option").allTextContents();
  check(englishOptions.every((label) => !/[가-힣]/.test(label)), "Korean text remained in English purpose options");
  if (axePath) {
    await page.addScriptTag({ path: axePath });
    const englishAxe = await page.evaluate(async () => window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] } }));
    const blocking = englishAxe.violations.filter((violation) => ["critical", "serious"].includes(violation.impact));
    check(blocking.length === 0, `English axe audit found: ${blocking.map((item) => `${item.id} [${item.nodes.slice(0, 3).map((node) => node.target.join(" ")).join(" | ")}]`).join(", ")}`);
    report.accessibility.en = { violations: englishAxe.violations.length, passes: englishAxe.passes.length };
  }
  await page.locator('[data-language-toggle] [data-lang="ko"]').click();
  const koreanCard = await page.locator(".simple-pick-card").first().innerText();
  check(!/Calculated estimate|Copy run command|Approx\./.test(koreanCard), "English fragments remained after returning to Korean");

  const staticResponse = await page.request.get(`${baseUrl}/model/xtts-v2/`);
  check(staticResponse.ok(), "XTTS-v2 static model page is missing");
  const sitemapResponse = await page.request.get(`${baseUrl}/sitemap.xml`);
  check(sitemapResponse.ok() && (await sitemapResponse.text()).includes("/model/xtts-v2/"), "sitemap.xml does not include model pages");
  const changePath = page.locator("[data-change-path]");
  if (await changePath.count() && await changePath.isVisible()) await changePath.click();
  await page.locator('[data-core-task="modelFinder"]').first().click();
  await page.locator("#advisorModelSearch").fill("model-that-does-not-exist-xyz");
  await page.locator("#advisorModelSearch").dispatchEvent("input");
  check(await page.locator("[data-advisor-reset]").count() === 1, "Advisor empty state has no reset button");

  const longNameOverflow = await page.evaluate(() => {
    const node = document.querySelector(".simple-pick-head strong");
    if (!node) return 0;
    node.textContent = "Very-Long-Model-Identifier-With-Architecture-And-Quantization-That-Must-Wrap-Without-Overflow-1234567890";
    return document.documentElement.scrollWidth - document.documentElement.clientWidth;
  });
  check(longNameOverflow <= 0, `Long model names overflow by ${longNameOverflow}px`);

  await page.emulateMedia({ media: "print" });
  const printOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(printOverflow <= 0, `Print layout overflows by ${printOverflow}px`);
  await page.pdf({ path: path.join(outputDir, "print-layout.pdf"), format: "A4", printBackground: true });

  await page.emulateMedia({ media: "screen" });
  await page.goto(`${baseUrl}/?gpu=rtx3060-12&lang=ko`, { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  const firstFocus = await page.evaluate(() => ({ tag: document.activeElement?.tagName, href: document.activeElement?.getAttribute("href") }));
  check(firstFocus.tag === "A" && firstFocus.href === "#mainContent", "Keyboard flow does not start at the skip link");

  await page.goto(`${baseUrl}/?mode=infra&studio=consulting&lang=ko`, { waitUntil: "networkidle" });
  await page.locator(".si-simple-wizard").waitFor();
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const step = Number(await page.locator(".si-simple-wizard").getAttribute("data-step"));
    if (step >= 4) break;
    await page.locator("[data-si-wizard-next]").click();
  }
  check(await page.locator('.si-simple-wizard[data-step="4"]').count() === 1, "Infrastructure wizard did not reach its result");
  const infrastructureLayout = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll(".simple-verdict > span, .simple-verdict > strong, .simple-verdict > small")];
    const rects = nodes.map((node) => node.getBoundingClientRect());
    const overlaps = rects.some((rect, index) => rects.slice(index + 1).some((other) => (
      rect.left < other.right && rect.right > other.left && rect.top < other.bottom && rect.bottom > other.top
    )));
    const lineCrossesLabel = [...document.querySelectorAll(".si-wizard-progress li:not(:last-child)")].some((item) => {
      const label = item.querySelector("span")?.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      const lineTop = itemRect.top + Number.parseFloat(getComputedStyle(item, "::after").top || "0");
      return label && lineTop >= label.top && lineTop <= label.bottom;
    });
    return {
      overlaps,
      lineCrossesLabel,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  check(!infrastructureLayout.overlaps, "Infrastructure verdict labels overlap");
  check(!infrastructureLayout.lineCrossesLabel, "Infrastructure progress line crosses a step label");
  check(infrastructureLayout.overflow <= 0, `Infrastructure result overflows by ${infrastructureLayout.overflow}px`);
  await page.screenshot({ path: path.join(outputDir, "infra-result-1280x900.png"), fullPage: true });

  report.flows = {
    voiceCloningModels: names,
    feedbackLinks: feedbackLinks.length,
    languageRoundTrip: true,
    staticSeo: true,
    emptyStateReset: true,
    longNameOverflow: true,
    keyboardSkipLink: true,
    printLayout: true,
    infrastructureResultLayout: true,
  };
  await context.close();
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

fs.writeFileSync(path.join(outputDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`visual regression passed for ${viewports.length} viewports; artifacts: ${path.relative(root, outputDir)}`);
