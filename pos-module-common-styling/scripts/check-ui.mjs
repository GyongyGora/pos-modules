#!/usr/bin/env node
// UI code check — does generated / hand-written UI code use the DS the way it must?
//
//   npm run check:ui -- <file or dir> [...]   check those (e.g. an app's app/ folder)
//   npm run check:ui                          check the new DS's own component CSS
//   npm run check:ui -- --docs                also the /style-guide docs pages (only unknown classes /
//                                             tokens and deprecated names there: docs print color values
//                                             as content and use inline demo styles on purpose)
//   add --json for machine-readable output (used by the review hook)
//
// Flags, per line:
//   hardcoded-color   hex / rgb() / hsl() color outside the token files (pos-primitives.css, pos-config.css)
//   unknown-class     a pos- class the DS doesn't have (invented)
//   unknown-token     var(--pos-…) that isn't defined
//   primitive-token   --pos-primitive-* used directly (use the semantic token for the role)
//   deprecated-token  a name from ds-index.json › deprecated (npm run codemod:deprecated fixes it)
//   inline-style      style="…" in markup
//   render-path       render path with a backslash (500 error on platformOS)
//   disabled-pointer-events  pointer-events: none in a rule for a disabled state (:disabled,
//                     aria-disabled, a *-disabled class) — it hides the not-allowed cursor (RULES.md 4.12)
//
// Never changes a file.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'modules/common-styling/public/assets');
const styleDir = path.join(assets, 'style');
const asJson = process.argv.includes('--json');
const withDocs = process.argv.includes('--docs');
const DOCS_RULES = new Set(['unknown-class', 'unknown-token', 'deprecated-token', 'render-path']);
const targets = process.argv.slice(2).filter((a) => !a.startsWith('--'));

/* ---- what the DS has ---- */
const classes = new Set();
const tokens = new Set();
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
for (const f of fs.readdirSync(styleDir).filter((f) => f.endsWith('.css'))) {
  const css = stripComments(fs.readFileSync(path.join(styleDir, f), 'utf8'));
  for (const m of css.matchAll(/\.(pos-[a-zA-Z0-9_-]+)/g)) classes.add(m[1]);
  for (const m of css.matchAll(/(--pos-[a-zA-Z0-9-]+)\s*:/g)) tokens.add(m[1]);
}
const walk = (dir, exts, skip = () => false) => !fs.existsSync(dir) ? [] : fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (skip(e.name, full)) return [];
  return e.isDirectory() ? walk(full, exts, skip) : exts.includes(path.extname(e.name)) ? [full] : [];
});
const docsOnly = (n) => n === 'style-guide' || n.startsWith('styleguide') || n.startsWith('dependency-');
for (const f of walk(path.join(assets, '../views/partials'), ['.liquid'], docsOnly)) {
  for (const m of fs.readFileSync(f, 'utf8').matchAll(/class="([^"]*)"/g)) for (const c of m[1].split(/\s+/)) if (/^pos-[a-zA-Z0-9_-]+$/.test(c)) classes.add(c);
}
for (const f of walk(path.join(assets, 'js'), ['.js'], docsOnly)) {
  const js = fs.readFileSync(f, 'utf8');
  for (const lit of js.matchAll(/(['"`])((?:(?!\1)[^\\\n]|\\.)*)\1/g)) for (const m of lit[2].matchAll(/\.(pos-[a-zA-Z0-9_-]+)/g)) classes.add(m[1]);
  for (const m of js.matchAll(/classList\.(?:add|remove|toggle|contains)\(([^)]*)\)/g)) for (const c of m[1].matchAll(/['"](pos-[a-zA-Z0-9_-]+)['"]/g)) classes.add(c[1]);
}
const index = JSON.parse(fs.readFileSync(path.join(assets, 'tokens/ds-index.json'), 'utf8'));
const deprecated = new Map(Object.entries(index.deprecated?.tokens || {}).filter(([k]) => k !== '_about').map(([k, v]) => [k, v.use]));
// documented markup hooks without a CSS rule (see check-catalog.mjs)
for (const c of ['pos-tile-btn-label', 'pos-anim-dismiss']) classes.add(c);
// classes the docs site defines in its own CSS (assets/style-guide/) — known on docs pages only
const docsClasses = new Set();
for (const f of fs.readdirSync(path.join(assets, 'style-guide')).filter((f) => f.endsWith('.css'))) {
  for (const m of stripComments(fs.readFileSync(path.join(assets, 'style-guide', f), 'utf8')).matchAll(/\.(pos-[a-zA-Z0-9_-]+)/g)) docsClasses.add(m[1]);
}
// state / theme classes set on <html> or by JS that only appear in compound selectors
for (const c of ['pos-theme-light', 'pos-theme-dark', 'pos-theme-darkEnabled', 'pos-theme-a11y', 'pos-theme-a11yEnabled', 'pos-app']) classes.add(c);

/* ---- files to check ---- */
const EXT = ['.css', '.scss', '.liquid', '.html', '.js', '.mjs', '.ts'];
const outOfScope = (n, full) => ['node_modules', '.git', 'dist', 'build'].includes(n) ||
  /dependency-|\.min\./.test(n) || ['pos-primitives.css', 'pos-config.css', 'pos-themes.css'].includes(n);
let files;
if (targets.length) {
  files = targets.flatMap((t) => { const p = path.resolve(t); return fs.statSync(p).isDirectory() ? walk(p, EXT, outOfScope) : [p]; });
} else {
  files = [
    ...walk(styleDir, ['.css'], outOfScope).filter((f) => !/pos-(reset|toggle)\.css$/.test(f)),
    ...(withDocs ? walk(path.join(assets, '../views/pages/style-guide'), ['.liquid']) : []),
  ];
}

/* ---- checks ---- */
const findings = [];
const isTokenFile = (f) => /pos-(primitives|config|themes)\.css$/.test(f);
for (const file of files) {
  const ext = path.extname(file);
  const isMarkup = ['.liquid', '.html'].includes(ext);
  const isStyle = ['.css', '.scss'].includes(ext);
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  let inComment = false;
  lines.forEach((raw, i) => {
    // drop CSS / HTML / Liquid comments from the line (multi-line CSS comments tracked across lines)
    let line = raw;
    if (isStyle || isMarkup) {
      if (inComment) { const e = line.indexOf('*/'); if (e < 0) return; line = line.slice(e + 2); inComment = false; }
      line = line.replace(/\/\*.*?\*\//g, '').replace(/<!--.*?-->/g, '');
      const s = line.indexOf('/*'); if (s >= 0 && isStyle) { line = line.slice(0, s); inComment = true; }
    }
    const at = { file: path.relative(process.cwd(), file), line: i + 1 };
    // docs site (pages + its own style-guide CSS / JS): only unknown / deprecated names count there
    const isDocsPage = /[\\/](style-guide|style-guide)[\\/]|[\\/]layouts[\\/]style-guide\.liquid$/.test(file);
    const hit = (rule, msg) => { if (!isDocsPage || DOCS_RULES.has(rule)) findings.push({ ...at, rule, msg }); };
    if (!isTokenFile(file) && (isStyle || isMarkup)) {
      // hex colors: only in a property value or style attribute, not in ids / urls / entities
      for (const m of line.matchAll(/(?<![&\w/#-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b(?![\w-])/g)) {
        if (isMarkup && !/style=|<style|fill=|stroke=|color=/.test(line)) continue;
        hit('hardcoded-color', `${m[0]} — use a --pos-color-* token`);
      }
      for (const m of line.matchAll(/\b(rgba?|hsla?)\(\s*\d/g)) hit('hardcoded-color', `${m[1]}(…) — use a --pos-color-* token`);
    }
    for (const m of line.matchAll(/var\(\s*(--pos-[a-zA-Z0-9-]+)/g)) {
      const t = m[1];
      if (deprecated.has(t)) hit('deprecated-token', `${t} is deprecated — use ${deprecated.get(t)}`);
      else if (!tokens.has(t)) hit('unknown-token', `${t} is not a DS token`);
      else if (/^--pos-primitive-/.test(t) && !/^--pos-primitive-(size|radius|shadow|font|line-height|letter)/.test(t)) hit('primitive-token', `${t} — use the semantic token for this role`);
    }
    if (isMarkup) {
      // escaped markup (&lt;…&gt;) is code shown as text — its example classes aren't used
      for (const m of line.replace(/&lt;.*?&gt;/g, '').matchAll(/class="([^"]*)"/g)) {
        for (const c of m[1].split(/\s+/)) {
          if (!/^pos-[a-zA-Z0-9_-]+$/.test(c) || /\{\{|\{%/.test(c)) continue;
          if (!classes.has(c) && !(isDocsPage && docsClasses.has(c))) hit('unknown-class', `${c} is not a DS class`);
        }
      }
      if (/\sstyle="/.test(line)) hit('inline-style', 'inline style — use DS classes / tokens');
      if (/render\s+'[^']*\\[^']*'/.test(line)) hit('render-path', 'render path with a backslash — use forward slashes');
    }
    if (isStyle && !/[\\/]common-styling[\\/]public[\\/]assets[\\/](style|style-guide)[\\/]/.test(file)) {
      // app CSS: a selector using a pos- class the DS doesn't have is an invented DS class
      for (const m of line.matchAll(/\.(pos-[a-zA-Z0-9_-]+)/g)) if (!classes.has(m[1])) hit('unknown-class', `.${m[1]} is not a DS class — use your own prefix for your own classes`);
    }
  });
}

/* ---- disabled rules must keep pointer events (RULES.md 4.12) ---- */
// rule level, not line level: the selector and the declaration sit on different lines. :not(…)
// parts are dropped first, so a hover guard like :not(:disabled) is not read as a disabled rule.
for (const file of files.filter((f) => ['.css', '.scss'].includes(path.extname(f)))) {
  const css = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = m[1].replace(/:not\((?:[^()]|\([^()]*\))*\)/g, '');
    if (!/:disabled|aria-disabled|-disabled(?![\w-])/.test(selector) || !/pointer-events\s*:\s*none/.test(m[2])) continue;
    const line = css.slice(0, m.index + m[0].indexOf('pointer-events')).split('\n').length;
    findings.push({ file: path.relative(process.cwd(), file), line, rule: 'disabled-pointer-events', msg: 'pointer-events: none on a disabled state hides the not-allowed cursor — keep pointer events, block activation with [disabled] or aria-disabled (RULES.md 4.12)' });
  }
}

if (asJson) {
  console.log(JSON.stringify({ files: files.length, findings }, null, 2));
} else {
  for (const f of findings) console.log(`✗ ${f.file}:${f.line}  ${f.rule}  ${f.msg}`);
  const by = {};
  for (const f of findings) by[f.rule] = (by[f.rule] || 0) + 1;
  console.log(`check:ui — ${files.length} file(s): ${findings.length} finding(s)${findings.length ? ' (' + Object.entries(by).map(([k, v]) => `${k} ${v}`).join(', ') + ')' : ''}`);
}
process.exit(findings.length ? 1 : 0);
