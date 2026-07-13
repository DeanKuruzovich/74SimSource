#!/usr/bin/env node
// Run every scenario in scenarios/ as a regression suite. Each scenario is a
// standalone .mjs that prints its own checks and exits non-zero on failure.
// This runner spawns them as child processes and tallies the results.
//
// Usage:  node js/debug/run-scenarios.mjs

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(here, 'scenarios');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.mjs')).sort();

let failed = 0;
for (const f of files) {
  const full = path.join(dir, f);
  process.stdout.write(`\n──────── ${f} ────────\n`);
  const res = spawnSync(process.execPath, [full], { stdio: 'inherit' });
  if (res.status !== 0) failed++;
}

console.log(`\n════════ ${files.length - failed}/${files.length} scenarios passed ════════`);
process.exit(failed === 0 ? 0 : 1);
