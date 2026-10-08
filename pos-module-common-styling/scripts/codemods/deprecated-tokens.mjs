#!/usr/bin/env node
// Codemod for apps that use the DS: rewrites references to deprecated DS names in YOUR app's files.
//
//   npm run codemod:deprecated -- <app dir>           dry run — lists every change, writes nothing
//   npm run codemod:deprecated -- <app dir> --write   applies the changes
//
// Source of truth: tokens/ds-index.json › deprecated (name → use). Only whole names are replaced
// (--pos-color-warning-disabled, never part of a longer name).
//
// It never touches the DS itself: any modules/common-styling/ folder is skipped — the installed module
// and your app/modules/common-styling/ overrides alike — and so are node_modules, .git and build output.
// The deprecated names keep working in the DS (they are aliases); this only moves your code to the
// replacements before the aliases are removed one day.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const index = JSON.parse(fs.readFileSync(path.join(here, '../../modules/common-styling/public/assets/tokens/ds-index.json'), 'utf8'));
const deprecated = { ...(index.deprecated?.tokens || {}), ...(index.deprecated?.classes || {}) };

const args = process.argv.slice(2);
const write = args.includes('--write');
const target = args.find((a) => !a.startsWith('--'));
if (!target) {
  console.error('usage: npm run codemod:deprecated -- <app dir> [--write]');
  process.exit(2);
}
const rootDir = path.resolve(target);
if (!fs.existsSync(rootDir) || !fs.statSync(rootDir).isDirectory()) {
  console.error(`not a directory: ${rootDir}`);
  process.exit(2);
}
const dsRepo = path.resolve(here, '../..');
const inside = (child, parent) => child === parent || child.startsWith(parent + path.sep);
if (inside(rootDir, dsRepo) || inside(dsRepo, rootDir)) {
  console.error('refusing to run on the design system repository itself — point it at your app directory.');
  process.exit(2);
}

// code only — markdown is left alone (docs may quote the old names on purpose)
const EXTENSIONS = new Set(['.css', '.scss', '.liquid', '.html', '.js', '.mjs', '.ts', '.tsx', '.jsx', '.json']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.cache']);
const isDsFolder = (full) => full.split(path.sep).join('/').endsWith('/modules/common-styling');

function* files(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name) || isDsFolder(full)) continue;
      yield* files(full);
    } else if (EXTENSIONS.has(path.extname(e.name))) {
      yield full;
    }
  }
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rules = Object.entries(deprecated)
  .filter(([name, v]) => name !== '_about' && v && v.use)
  .sort(([a], [b]) => b.length - a.length)
  .map(([name, v]) => ({ name, use: v.use, re: new RegExp(`(?<![a-zA-Z0-9_-])${escape(name)}(?![a-zA-Z0-9_-])`, 'g') }));

let changedFiles = 0;
let total = 0;
for (const file of files(rootDir)) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  const hits = [];
  for (const r of rules) {
    after = after.replace(r.re, () => { hits.push(r); return r.use; });
  }
  if (!hits.length) continue;
  changedFiles++;
  total += hits.length;
  const rel = path.relative(rootDir, file);
  const counts = {};
  for (const h of hits) counts[`${h.name} → ${h.use}`] = (counts[`${h.name} → ${h.use}`] || 0) + 1;
  console.log(`${rel}`);
  for (const [k, n] of Object.entries(counts)) console.log(`  ${k}${n > 1 ? `  ×${n}` : ''}`);
  if (write) fs.writeFileSync(file, after);
}

console.log(total
  ? `${write ? 'updated' : 'would update'} ${total} reference(s) in ${changedFiles} file(s)${write ? '' : ' — run again with --write to apply'}`
  : 'no deprecated DS names found');
