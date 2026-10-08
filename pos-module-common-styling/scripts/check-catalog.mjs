#!/usr/bin/env node
// Catalog check — keeps the AI-facing catalog honest (run: npm run check:catalog).
//
// Fails (exit 1) when:
//   1. a component spec (tokens/components/<name>.json) or a component CSS file
//      (style/pos-<name>.css, foundations excluded) has no entry in ds-index.json
//   2. a ds-index.json "detail" points at a spec file that doesn't exist
//   3. ds-index.json, a spec's token lists or a spec's usageExample use a pos- class or a
//      --pos- token that doesn't exist in the DS — a class exists when the DS CSS (style/)
//      styles it or the DS's own markup / JS uses it (views/partials class=""
//      attributes, assets/js selectors and classList calls); a token when the DS CSS defines it.
//      ds-index.json "events" lists are event names, not classes, and are skipped.
//   4. ds-index.json aliases point at a components key that doesn't exist
//   5. AGENTS.md or llms.txt is missing, doesn't list every components key (as `key`), or uses
//      a pos- class / --pos- token that doesn't exist
//
// An entry covers a spec / CSS file when its key matches the name, its "detail" points at the
// spec, or the name is listed in its "specs" / "css" fields.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.join(root, 'modules/common-styling/public/assets');
const tokensDir = path.join(assets, 'tokens');
const specDir = path.join(tokensDir, 'components');
const cssDirs = [path.join(assets, 'style')];

// style files that are foundations / global layers, not components
const FOUNDATION_CSS = new Set(['config', 'primitives', 'themes', 'reset', 'typography', 'utility', 'behaviors', 'page', 'style-wireframe']);
// style files that are not DS components (none at the moment)
const NOT_COMPONENT_CSS = new Set([]);
// classes documented as markup hooks in a component CSS header but intentionally unstyled
// pos-tile-btn-label: pos-tile-btn.css header; pos-anim-dismiss: pos-behaviors.css header (JS adds --out)
const DOCUMENTED_HOOKS = new Set(['pos-tile-btn-label', 'pos-anim-dismiss']);

/* ---- what the CSS defines ---- */
const classes = new Set();
const tokens = new Set();
for (const dir of cssDirs) {
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.css'))) {
    const css = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const m of css.matchAll(/\.(pos-[a-zA-Z0-9_-]+)/g)) classes.add(m[1]);
    for (const m of css.matchAll(/(--pos-[a-zA-Z0-9-]+)\s*:/g)) tokens.add(m[1]);
  }
}

// classes the DS's own Liquid partials and JS put on markup (behavior hooks without CSS rules)
const walkFiles = (dir, ext, skip) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (skip(e.name)) return [];
  return e.isDirectory() ? walkFiles(full, ext, skip) : e.name.endsWith(ext) ? [full] : [];
});
const docsSite = (n) => n === 'style-guide' || n.startsWith('styleguide') || n.startsWith('dependency-');
for (const f of walkFiles(path.join(assets, '../views/partials'), '.liquid', docsSite)) {
  for (const m of fs.readFileSync(f, 'utf8').matchAll(/class="([^"]*)"/g)) for (const c of m[1].split(/\s+/)) if (/^pos-[a-zA-Z0-9_-]+$/.test(c)) classes.add(c);
}
for (const f of walkFiles(path.join(assets, 'js'), '.js', docsSite)) {
  const js = fs.readFileSync(f, 'utf8');
  // selectors inside string literals: '.pos-x', '#id .pos-x > .pos-y'
  for (const lit of js.matchAll(/(['"`])((?:(?!\1)[^\\\n]|\\.)*)\1/g)) for (const m of lit[2].matchAll(/\.(pos-[a-zA-Z0-9_-]+)/g)) classes.add(m[1]);
  for (const m of js.matchAll(/classList\.(?:add|remove|toggle|contains)\(([^)]*)\)/g)) for (const c of m[1].matchAll(/['"](pos-[a-zA-Z0-9_-]+)['"]/g)) classes.add(c[1]);
}

for (const c of DOCUMENTED_HOOKS) classes.add(c);

/* ---- reference extraction ---- */
// pos- class names inside free text: skip file names (pos-x.css), token names (--pos-x),
// paths (/pos-x) and placeholder patterns (pos-x-<name>, pos-x-*, pos-x-{1,2})
function classRefs(text) {
  const out = [];
  for (const m of text.matchAll(/(^|[^a-zA-Z0-9_\-/.])(pos-[a-z0-9]+(?:-[a-z0-9]+)*)(?![a-z0-9<*{-]|\.[a-z])/g)) out.push(m[2]);
  return out;
}
function tokenRefs(text) {
  const out = [];
  for (const m of text.matchAll(/(--pos-[a-z0-9]+(?:-[a-z0-9]+)*)(?![a-z0-9<*{-])/g)) out.push(m[1]);
  return out;
}
const strings = (o, acc = []) => {
  if (typeof o === 'string') acc.push(o);
  else if (Array.isArray(o)) o.forEach((x) => strings(x, acc));
  else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { if (k !== '_about' && k !== 'events') strings(v, acc); }
  return acc;
};

const problems = [];
const add = (where, msg) => problems.push(`${where}: ${msg}`);

/* ---- ds-index.json ---- */
const index = JSON.parse(fs.readFileSync(path.join(tokensDir, 'ds-index.json'), 'utf8'));
const entries = index.components || {};
const covers = (name, kind) =>
  Object.entries(entries).some(([key, e]) =>
    key === name ||
    (kind === 'spec' && typeof e.detail === 'string' && e.detail.split(/\s/)[0] === `components/${name}.json`) ||
    (Array.isArray(e[kind === 'spec' ? 'specs' : 'css']) && e[kind === 'spec' ? 'specs' : 'css'].includes(name)));

const specs = fs.readdirSync(specDir).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''));
for (const s of specs) if (!covers(s, 'spec')) add('ds-index.json', `no entry for spec components/${s}.json`);

const componentCss = fs.readdirSync(path.join(assets, 'style'))
  .filter((f) => /^pos-.+\.css$/.test(f)).map((f) => f.slice(4, -4)).filter((n) => !FOUNDATION_CSS.has(n) && !NOT_COMPONENT_CSS.has(n));
for (const c of componentCss) if (!covers(c, 'css')) add('ds-index.json', `no entry for style/pos-${c}.css`);

for (const [key, e] of Object.entries(entries)) {
  const details = [e.detail, ...(Array.isArray(e.specs) ? e.specs.map((s) => `components/${s}.json`) : [])].filter(Boolean);
  for (const d of details) {
    const file = String(d).split(/\s/)[0];
    if (!file.startsWith('components/')) continue;
    if (!fs.existsSync(path.join(tokensDir, file))) add(`ds-index.json › ${key}`, `detail file ${file} doesn't exist`);
  }
}
// aliases are a lookup table only — every target must be an existing components key
const aliases = index.aliases || {};
for (const [name, targets] of Object.entries(aliases.names || {})) {
  for (const t of [].concat(targets)) if (!entries[t]) add(`ds-index.json › aliases.names.${name}`, `points at "${t}", which is not a components key`);
}
for (const [name, target] of Object.entries(aliases.file_names || {})) {
  if (name !== '_about' && !entries[target]) add(`ds-index.json › aliases.file_names.${name}`, `points at "${target}", which is not a components key`);
}

const indexText = strings(index);
for (const c of new Set(indexText.flatMap(classRefs))) if (!classes.has(c)) add('ds-index.json', `class "${c}" is not defined in the DS CSS`);
for (const t of new Set(indexText.flatMap(tokenRefs))) if (!tokens.has(t)) add('ds-index.json', `token "${t}" is not defined in the DS CSS`);

/* ---- specs ---- */
for (const s of specs) {
  const spec = JSON.parse(fs.readFileSync(path.join(specDir, `${s}.json`), 'utf8'));
  const tokenFields = [];
  const walk = (o) => {
    if (Array.isArray(o)) return o.forEach(walk);
    if (o && typeof o === 'object') { if (typeof o.css === 'string') tokenFields.push(o.css); for (const v of Object.values(o)) walk(v); }
  };
  walk(spec.variants); walk(spec.shared);
  for (const t of new Set(tokenFields.flatMap(tokenRefs))) if (!tokens.has(t)) add(`components/${s}.json`, `token "${t}" is not defined in the DS CSS`);
  const example = strings(spec.usageExample || '').join('\n');
  const exampleClasses = [...example.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)).filter((c) => c.startsWith('pos-'));
  for (const c of new Set(exampleClasses)) if (!classes.has(c)) add(`components/${s}.json › usageExample`, `class "${c}" is not defined in the DS CSS`);
  for (const t of new Set(tokenRefs(example))) if (!tokens.has(t)) add(`components/${s}.json › usageExample`, `token "${t}" is not defined in the DS CSS`);
}

/* ---- agent-facing docs: must list every component and use only real classes / tokens ---- */
for (const doc of ['AGENTS.md', 'llms.txt']) {
  const file = path.join(root, doc);
  if (!fs.existsSync(file)) { add(doc, 'missing'); continue; }
  const text = fs.readFileSync(file, 'utf8');
  for (const key of Object.keys(entries)) if (!text.includes('`' + key + '`')) add(doc, `doesn't list the "${key}" component`);
  for (const c of new Set(classRefs(text))) if (!classes.has(c)) add(doc, `class "${c}" is not defined in the DS`);
  for (const t of new Set(tokenRefs(text))) if (!tokens.has(t)) add(doc, `token "${t}" is not defined in the DS CSS`);
}

if (problems.length) {
  console.error(`check:catalog — ${problems.length} problem(s):\n` + problems.map((p) => `  ✗ ${p}`).join('\n'));
  process.exit(1);
}
console.log(`check:catalog — ok (${Object.keys(entries).length} ds-index entries, ${specs.length} specs, ${componentCss.length} component CSS files, ${classes.size} classes, ${tokens.size} tokens)`);
