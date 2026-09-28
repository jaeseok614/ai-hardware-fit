#!/usr/bin/env node

import fs from "node:fs";

// Budgets are sized with ~20-30% headroom over current usage, not just
// current usage itself, so a normal small PR doesn't trip CI. Files that
// climb back above ~85% should get a real trim (dead rules/dupes) rather
// than another bump; see docs/ for the last size-budget review notes.
const budgets = [
  ["app.js", 350 * 1024],
  ["features/estimation-engine.js", 100 * 1024],
  ["features/hf-import.js", 20 * 1024],
  ["features/i18n-runtime.js", 75 * 1024],
  ["features/gpu-advisor.js", 48 * 1024],
  ["features/model-placement.js", 130 * 1024],
  ["features/benchmark-workspace.js", 40 * 1024],
  ["platform-v2.js", 60 * 1024],
  ["platform-v3.js", 230 * 1024],
  ["styles.css", 240 * 1024],
  ["styles/home.css", 16 * 1024],
  ["styles/v6-guided.css", 12 * 1024],
];

const failures = [];
for (const [file, limit] of budgets) {
  const bytes = fs.statSync(file).size;
  const pct = Math.round(bytes / limit * 100);
  console.log(`${file}: ${(bytes / 1024).toFixed(1)} KiB / ${(limit / 1024).toFixed(0)} KiB (${pct}%)`);
  if (bytes > limit) failures.push(`${file} exceeds its ${(limit / 1024).toFixed(0)} KiB budget`);
}

if (failures.length) {
  failures.forEach((failure) => console.error(failure));
  process.exit(1);
}
