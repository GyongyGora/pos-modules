#!/usr/bin/env node
// Claude Code PostToolUse hook (.claude/settings.json) — runs after every Edit / Write.
// When the edited file belongs to the new DS (style/, tokens/, the new docs pages / partials, the
// agent docs), it runs check:contrast, check:catalog and check:ui and hands the findings to the agent, together
// with the review skills that apply to that kind of file. It never changes a file and never blocks:
// the agent reports the findings to the user and asks how to fix them (see .claude/skills/*-review).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { markPending, DS_FILE } from './ds-guard-hook.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let input = {};
try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { process.exit(0); }
const file = input.tool_input?.file_path || input.tool_input?.path;
if (!file) process.exit(0);
const rel = path.relative(root, path.resolve(file)).split(path.sep).join('/');
if (rel.startsWith('..')) process.exit(0);
// remember the change for the ds-guard Stop hook (ds-guard-hook.mjs)
if (DS_FILE.test(rel)) markPending(rel);

// which review lenses apply to which part of the DS
const LENSES = [
  { re: /^modules\/common-styling\/public\/assets\/style\/pos-(primitives|config|themes)\.css$/, skills: ['a11y-review', 'ui-design-review'], contrast: true },
  { re: /^modules\/common-styling\/public\/assets\/style\/.+\.css$/, skills: ['ui-design-review', 'a11y-review', 'frontend-review'], contrast: true },
  { re: /^modules\/common-styling\/public\/assets\/tokens\/.+\.json$/, skills: ['frontend-review'], catalog: true },
  { re: /^modules\/common-styling\/public\/views\/(pages\/style-guide|partials\/(content|forms|navigation)|layouts\/style-guide)\/?.*\.liquid$|^modules\/common-styling\/public\/views\/partials\/(pagination|toasts|icon)\.liquid$/, skills: ['ux-review', 'a11y-review', 'frontend-review'] },
  { re: /^modules\/common-styling\/public\/assets\/(js\/pos-.+\.js|style-guide\/.+)$|^src\/js\/.+\.ts$/, skills: ['frontend-review', 'a11y-review'] },
  { re: /^(AGENTS\.md|llms\.txt)$/, skills: [], catalog: true },
  // the example app (and any app code): built WITH the DS
  { re: /^app\/.+\.(liquid|html|css|scss|js)$/, skills: ['ui-design-review', 'ux-review', 'a11y-review', 'frontend-review'] },
];
const lens = LENSES.find((l) => l.re.test(rel));
if (!lens) process.exit(0);

const run = (script, args = []) => spawnSync(process.execPath, [path.join(root, 'scripts', script), ...args], { cwd: root, encoding: 'utf8' });
const lines = [];

if (lens.contrast) {
  const r = run('check-contrast.mjs', ['--json']);
  try {
    const out = JSON.parse(r.stdout);
    for (const f of out.failures) {
      const theme = { light: 'light', dark: 'dark', a11y: 'high contrast' }[f.theme];
      lines.push(`CONTRAST [${theme}] ${f.kind}: ${f.fg} (${f.fgValue}) on ${f.bg}${f.on ? ` over ${f.on}` : ''} (${f.bgValue}) = ${f.ratio}:1, WCAG AA needs ${f.min}:1`);
      for (const s of f.suggestions) lines.push(`  option (${s.side === 'fg' ? 'change the foreground' : 'change the background'}): ${s.change} → ${s.to} (${s.value}) = ${s.ratio}:1`);
    }
  } catch { lines.push('check:contrast could not run: ' + (r.stderr || r.stdout).slice(0, 300)); }
}
// per-file code check: hardcoded colors, invented classes, unknown / primitive / deprecated tokens, inline styles
if (/\.(css|scss|liquid|html)$/.test(rel) && !/pos-(primitives|config|themes)\.css$/.test(rel)) {
  const args = [path.resolve(file), '--json'];
  if (/(^|\/)style-guide\/|layouts\/style-guide\.liquid$/.test(rel)) args.push('--docs');
  const r = run('check-ui.mjs', args);
  try {
    for (const f of JSON.parse(r.stdout).findings.slice(0, 15)) lines.push(`UI CODE line ${f.line}: ${f.rule} — ${f.msg}`);
  } catch { /* unreadable output: skip, the other checks still report */ }
}
if (lens.catalog || lens.contrast) {
  const r = run('check-catalog.mjs');
  if (r.status !== 0) lines.push('CATALOG ' + (r.stderr || r.stdout).trim().split('\n').slice(0, 12).join('\n  '));
}

const skills = lens.skills.length ? `Review lenses for this change: ${lens.skills.join(', ')} (.claude/skills/<name>/SKILL.md) — apply them to what you just changed before reporting it done; for anything visible this includes the visual layout pass of ui-design-review (render, screenshot, check gaps / alignment / wrapping / overflow).` : '';
if (!lines.length && !skills) process.exit(0);

const context = [
  `Design-system review hook — ${rel}`,
  ...(lines.length
    ? ['Automatic checks found problems. Tell the user now, in their language and in plain words: what broke, the measured value vs the requirement, and ask which fix they want (offer the options below, or offer to propose another). Do not apply a fix without their answer.', ...lines]
    : ['Automatic checks (contrast, catalog, UI code): no new problems.']),
  skills,
].filter(Boolean).join('\n');

console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: context } }));
