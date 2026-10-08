#!/usr/bin/env node
// Claude Code hooks (.claude/settings.json) that make the ds-guard review run before work is reported done.
//   node scripts/ds-guard-hook.mjs stop  — Stop hook: if design-system files changed since the last
//                                         ds-guard run, block the stop and ask for the review
//   node scripts/ds-guard-hook.mjs done  — PostToolUse (Agent / Task): a finished ds-guard run clears the list
// Changed files come from review-hook.mjs (every Edit / Write) and from `git status` (edits made by scripts).
// State lives in .claude/ds-guard-state.json (local, gitignored). Never edits project files, never blocks twice
// in a row (stop_hook_active), so a session can always end.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const stateFile = path.join(root, '.claude', 'ds-guard-state.json');
export const DS_FILE = /^(modules\/common-styling\/public\/|app\/|src\/js\/|AGENTS\.md$|llms\.txt$)/;

const readState = () => { try { return JSON.parse(fs.readFileSync(stateFile, 'utf8')); } catch { return { pending: [], lastRun: 0 }; } };
const writeState = (s) => { try { fs.mkdirSync(path.dirname(stateFile), { recursive: true }); fs.writeFileSync(stateFile, JSON.stringify(s, null, 2)); } catch { /* never fail the hook */ } };

export function markPending(rel) {
  const s = readState();
  if (!s.pending.includes(rel)) s.pending.push(rel);
  writeState(s);
}

function changedSinceLastRun(lastRun) {
  const r = spawnSync('git', ['status', '--porcelain', '--', '.'], { cwd: root, encoding: 'utf8' });
  if (r.status !== 0) return [];
  const prefix = spawnSync('git', ['rev-parse', '--show-prefix'], { cwd: root, encoding: 'utf8' }).stdout.trim();
  return r.stdout.split('\n').filter(Boolean).map((l) => l.slice(3).replace(/^"|"$/g, '').split(' -> ').pop())
    .map((p) => (prefix && p.startsWith(prefix) ? p.slice(prefix.length) : p))
    .filter((rel) => DS_FILE.test(rel))
    .filter((rel) => { try { return fs.statSync(path.join(root, rel)).mtimeMs > lastRun; } catch { return true; } });
}

const mode = process.argv[2];
if (mode === 'stop' || mode === 'done') {
  let input = {};
  try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { /* empty input */ }

  if (mode === 'done') {
    const type = input.tool_input?.subagent_type || '';
    if (type === 'ds-guard') writeState({ pending: [], lastRun: Date.now() });
    process.exit(0);
  }

  if (input.stop_hook_active) process.exit(0); // already asked once in this turn
  const s = readState();
  const files = [...new Set([...s.pending, ...changedSinceLastRun(s.lastRun || 0)])];
  if (!files.length) process.exit(0);
  const list = files.slice(0, 20).join(', ') + (files.length > 20 ? ` (+${files.length - 20} more)` : '');
  console.log(JSON.stringify({
    decision: 'block',
    reason: `Design-system files changed since the last ds-guard review: ${list}. Run the ds-guard agent (subagent_type "ds-guard") on these changes before reporting the work done, then tell the user its findings in their language and ask before any design or token fix.`,
  }));
}
