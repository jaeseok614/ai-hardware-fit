import { test } from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

test("Pages deployment builds a cache-stamped artifact", () => {
  assert.ok(fs.existsSync("_site/index.html"), "run npm run build:static before tests");
  const html = fs.readFileSync("_site/index.html", "utf8");
  assert.equal(html.includes("__CACHE_VERSION__"), false);
  assert.match(html, /app\.js\?v=[a-f0-9]{7,}/);
  for (const developmentPath of ["tests", "scripts", "package-lock.json", "lighthouserc.cjs"]) {
    assert.equal(fs.existsSync("_site/" + developmentPath), false, "Development files leaked into the Pages artifact");
  }
  assert.ok(fs.existsSync("_site/sitemap.xml"));
  assert.ok(fs.existsSync("_site/robots.txt"));
  assert.ok(fs.existsSync("_site/gpu/rtx4090-24/index.html"));
  assert.ok(fs.existsSync("_site/model/xtts-v2/index.html"));
  assert.ok(fs.existsSync("_site/workload/audiotts/index.html"));
  assert.ok(fs.existsSync("_site/en/gpu/rtx4090-24/index.html"));
  assert.ok(fs.existsSync("_site/en/model/xtts-v2/index.html"));
  assert.ok(fs.existsSync("_site/en/workload/audiotts/index.html"));
  const sitemap = fs.readFileSync("_site/sitemap.xml", "utf8");
  assert.match(sitemap, /\/gpu\/rtx4090-24\//);
  assert.match(sitemap, /\/model\/xtts-v2\//);
  assert.match(sitemap, /\/en\/model\/xtts-v2\//);
  const modelPage = fs.readFileSync("_site/model/xtts-v2/index.html", "utf8");
  assert.match(modelPage, /<link rel="canonical"/);
  assert.match(modelPage, /application\/ld\+json/);
  assert.match(modelPage, /목소리 복제/);
  const englishModelPage = fs.readFileSync("_site/en/model/xtts-v2/index.html", "utf8");
  assert.match(englishModelPage, /<html lang="en">/);
  assert.match(englishModelPage, /Voice cloning/);
  assert.doesNotMatch(englishModelPage, /계산기에서|공식·등록 출처/);
});

test("GPU request parser accepts a sourced normalized laptop record", () => {
  const body = `### GPU 이름

GeForce RTX Test Laptop 16GB
### 제조사

NVIDIA
### 아키텍처

Test Architecture
### 메모리 유형

전용 VRAM
### 폼팩터

노트북
### VRAM

16GB
### 메모리 대역폭

512 GB/s
### 최소 TGP

60W
### 최대 TGP

150W
### 확인된 실행 환경

- [x] CUDA
### 출처

https://www.nvidia.com/en-us/geforce/`;
  const result = spawnSync(process.execPath, ["scripts/gpu-request-tools.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, GPU_REQUEST_BODY: body },
    encoding: "utf8",
  });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Required specifications/);
  assert.match(result.stdout, /tgpMinW: 60/);
});

test("model request parser validates model and license sources", () => {
  const body = `### 모델 이름

Community Test STT
### 워크로드

음성 인식 STT
### 제공자

Test Provider
### 파라미터 수

0.5B
### 라이선스

MIT
### 주요 용도

실시간 자막, 받아쓰기
### 공식 모델 카드

https://huggingface.co/test-provider/community-test-stt
### 라이선스 출처

https://huggingface.co/test-provider/community-test-stt/blob/main/LICENSE`;
  const result = spawnSync(process.execPath, ["scripts/model-request-tools.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, MODEL_REQUEST_BODY: body },
    encoding: "utf8",
  });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Required metadata and sources are valid/);
  assert.match(result.stdout, /data\/audio-models\.js/);
  assert.match(result.stdout, /realtime, transcription/);
});

test("GPU and benchmark request workflows have guarded approval labels", () => {
  const gpu = fs.readFileSync(".github/workflows/gpu-request.yml", "utf8");
  const benchmark = fs.readFileSync(".github/workflows/benchmark-request.yml", "utf8");
  const model = fs.readFileSync(".github/workflows/model-request.yml", "utf8");
  assert.match(gpu, /gpu-ready/);
  assert.match(gpu, /steps\.gpu\.outputs\.valid == 'true'/);
  assert.match(benchmark, /benchmark-ready/);
  assert.match(benchmark, /steps\.benchmark\.outputs\.valid == 'true'/);
  assert.match(model, /model-ready/);
  assert.match(model, /steps\.model\.outputs\.valid == 'true'/);
});

test("manual benchmark issue forms normalize workload and K-context before validation", () => {
  const eventFile = path.join(os.tmpdir(), `ai-hardware-benchmark-manual-${process.pid}.json`);
  fs.writeFileSync(eventFile, JSON.stringify({ issue: { html_url: "https://github.com/jaeseok614/ai-hardware-fit/issues/99998", body: "" } }));
  const body = [
    ["CLI 측정 결과 (JSON)", "_No response_"],
    ["GPU", "GeForce RTX 3060 12GB"],
    ["사이트 GPU ID", "rtx3060-12"],
    ["모델", "Qwen3 8B"],
    ["워크로드", "Generative LLM (tok/s)"],
    ["런타임", "Ollama"],
    ["운영체제·드라이버", "Windows 11"],
    ["전력 제한·노트북 TGP", "_No response_"],
    ["최대 VRAM 사용량", "10.2 GB"],
    ["실행 설정", "Q4_K_M, 8K context, concurrency 1"],
    ["입력·컨텍스트 토큰", "8192"],
    ["출력 토큰", "256"],
    ["동시 요청", "1"],
    ["실제 결과", "98764.32 tok/s"],
    ["로그 또는 참고 자료", "수동 벤치마크 제보"],
  ].map(([label, value]) => `### ${label}\n\n${value}`).join("\n\n");
  try {
    const result = spawnSync(process.execPath, ["scripts/benchmark-request-tools.mjs"], {
      cwd: process.cwd(),
      env: { ...process.env, GITHUB_EVENT_PATH: eventFile, BENCHMARK_REQUEST_BODY: body },
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /✅ GPU·모델·실행 조건 확인 완료/);
    assert.match(result.stdout, /context:8192/);
  } finally {
    fs.unlinkSync(eventFile);
  }
});

test("catalog requests prevent duplicates and expose a structured price report", () => {
  const gpu = fs.readFileSync(".github/ISSUE_TEMPLATE/gpu-request.yml", "utf8");
  const model = fs.readFileSync(".github/ISSUE_TEMPLATE/model-request.yml", "utf8");
  const price = fs.readFileSync(".github/ISSUE_TEMPLATE/price-report.yml", "utf8");
  const requests = fs.readFileSync("features/catalog-requests.js", "utf8");
  assert.match(gpu, /id: duplicate_check/);
  assert.match(model, /id: duplicate_check/);
  assert.match(price, /labels: \["data", "price"\]/);
  assert.match(price, /id: checked_at/);
  assert.match(price, /id: source_url/);
  assert.match(requests, /function statusUrl/);
  assert.match(requests, /function duplicateSummary/);
});

test("run feedback and visual regression workflows are public and repeatable", () => {
  const feedback = fs.readFileSync(".github/ISSUE_TEMPLATE/run-feedback.yml", "utf8");
  const productFeedback = fs.readFileSync(".github/ISSUE_TEMPLATE/product-feedback.yml", "utf8");
  const workflow = fs.readFileSync(".github/workflows/ci.yml", "utf8");
  const visual = fs.readFileSync("scripts/ui-regression.mjs", "utf8");
  assert.match(feedback, /실행 결과/);
  assert.match(feedback, /민감한 정보/);
  assert.match(productFeedback, /What was confusing or missing/);
  assert.match(productFeedback, /confidential pricing/);
  assert.match(workflow, /batch: \[1, 2, 3, 4, 5\]/);
  assert.match(workflow, /run-tests\.mjs --batch=/);
  assert.match(workflow, /test:visual/);
  assert.match(workflow, /ui-regression-screenshots/);
  assert.match(visual, /1920, 1080/);
  assert.match(visual, /390, 844/);
  assert.match(visual, /horizontal overflow/);
});

test("v2 data health workflow audits translations, schemas, and source links", () => {
  const workflow = fs.readFileSync(".github/workflows/data-health.yml", "utf8");
  const audit = fs.readFileSync("scripts/data-audit.mjs", "utf8");
  assert.match(workflow, /schedule:/);
  assert.match(workflow, /data-audit\.mjs/);
  assert.match(workflow, /lychee-action/);
  assert.match(workflow, /issues:\s*write/);
  assert.match(audit, /Duplicate GPU id/);
  assert.match(audit, /Missing English translation/);
  assert.match(audit, /Benchmark source is not HTTPS/);
});
