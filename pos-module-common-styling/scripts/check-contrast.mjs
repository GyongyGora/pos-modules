#!/usr/bin/env node
// Contrast check — every text / icon / frame color pairing the DS prescribes, measured in light, dark
// and high contrast against WCAG AA (text 4.5:1, icons / graphics / frames 3:1).
//
//   npm run check:contrast            human-readable report, exit 1 on a new failure
//   npm run check:contrast -- --json  machine-readable (used by the review hook)
//
// Every brand theme (style/pos-themes.css, :root.pos-brand-<key>) is checked too: a theme only overrides the
// brand scale primitives, so the same pairs are measured with its scales.
//
// Pairs: the color table of AGENTS.md, every button variant × state (disabled is exempt from WCAG),
// form inputs and the focus ring. Values are resolved through the real theme blocks of
// style/pos-config.css. For a failing pair it proposes the nearest step of the same scale that
// passes — for the foreground and, separately, for the background — and names the mode variable to
// change. It never changes anything itself.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
// POS_STYLE_DIR: point at a copy of style/ to try a change without touching the real files
const styleDir = process.env.POS_STYLE_DIR || path.join(root, 'modules/common-styling/public/assets/style');
const prim = fs.readFileSync(path.join(styleDir, 'pos-primitives.css'), 'utf8');
const cfg = fs.readFileSync(path.join(styleDir, 'pos-config.css'), 'utf8').replace(/\r\n/g, '\n');
const asJson = process.argv.includes('--json');

// Known failures that are already logged and waiting for a decision — reported, not failed.
// (empty since 2026-10-02 — the HC gradient-2 pair was fixed: gradient 2 = the white HC standout surface)
const KNOWN = [];

/* ---- resolution ---- */
const defs = {};
for (const m of (prim + cfg).matchAll(/(--pos-[a-z0-9-]+)\s*:\s*([^;]+);/g)) if (!(m[1] in defs)) defs[m[1]] = m[2].trim();
const blockAt = (i) => {
  const start = cfg.lastIndexOf('{', i);
  const body = cfg.slice(start, cfg.indexOf('\n}', i));
  const d = {};
  for (const m of body.matchAll(/(--pos-color-[a-z0-9-]+)\s*:\s*([^;]+);/g)) d[m[1]] = m[2].trim();
  return d;
};
const block = (opener) => blockAt(cfg.indexOf(opener) + opener.length);
// light-mode values the light theme block doesn't set itself (e.g. gradients) live in a later plain :root block
const lightDefaults = blockAt(cfg.indexOf('--pos-color-gradient1-from: var(--pos-color-light-gradient1-from)'));
const THEMES = {
  light: { ...lightDefaults, ...block(':root,\n:root.pos-theme-light,\n.pos-scheme-light {') },
  dark: block(':root.pos-theme-dark:where(.pos-theme-darkEnabled),\n.pos-scheme-dark {'),
  a11y: block(':root.pos-theme-a11y:where(.pos-theme-a11yEnabled),\n.pos-scheme-a11y {'),
};
// brand themes: the primitives each :root.pos-brand-<key> block overrides (Default = none)
const BRANDS = { default: {} };
{
  const f = path.join(styleDir, 'pos-themes.css');
  if (fs.existsSync(f)) {
    const t = fs.readFileSync(f, 'utf8');
    for (const m of t.matchAll(/:root\.pos-brand-([a-z0-9-]+)\s*\{([^}]*)\}/g)) {
      const o = {};
      // scale primitives, plus the role tokens a graphicStep 700 / 800 theme re-points (they win over the mode blocks)
      for (const d of m[2].replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(--pos-(?:primitive|color)-[a-z0-9-]+)\s*:\s*([^;]+);/g)) o[d[1]] = d[2].trim();
      BRANDS[m[1]] = o;
    }
  }
}
let BRAND = {};
const def = (n) => BRAND[n] ?? defs[n];
function resolve(name, theme) {
  const chain = [name];
  let v = BRAND[name] ?? THEMES[theme][name] ?? def(name);
  for (let g = 0; g < 30 && v; g++) {
    const m = /^var\((--pos-[a-z0-9-]+)\)$/.exec(v);
    if (!m) break;
    chain.push(m[1]);
    v = BRAND[m[1]] ?? THEMES[theme][m[1]] ?? def(m[1]);
  }
  return { value: v, chain };
}

/* ---- color maths ---- */
function parse(v) {
  if (!v) return null;
  v = v.trim().toLowerCase();
  if (v === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  let m = /^#([0-9a-f]{3,8})$/.exec(v);
  if (m) {
    let h = m[1];
    if (h.length <= 4) h = [...h].map((c) => c + c).join('');
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 };
  }
  m = /^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/.exec(v);
  if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : +m[4] };
  return null;
}
const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
const lum = (c) => {
  const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
};
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const hex = (c) => '#' + [c.r, c.g, c.b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('');

/* ---- pairs ---- */
const T = (s) => `--pos-color-${s}`;
const pairs = []; // { bg: [token...], fg: token, min, kind, surface? }
const add = (bgs, fgs, min, kind) => { for (const bg of [].concat(bgs)) for (const fg of [].concat(fgs)) pairs.push({ bg: T(bg), fg: T(fg), min, kind }); };
const SURFACES = ['page-background', 'content-background', 'highlight-background', 'brand-primary-background', 'brand-supplementary-background',
  'important-background', 'warning-background', 'confirmation-background'];
add(SURFACES, ['content-text', 'content-text-prominent', 'content-text-supplementary', 'interactive-text'], 4.5, 'text');
add(SURFACES, ['content-icon', 'interactive', 'content-icon-interactive'], 3, 'icon');
add('highlight-background', 'highlight-text', 4.5, 'text');
add('standout-background', ['standout-text', 'standout-text-supplementary'], 4.5, 'text');
add('inverted-background', 'content-inverted-text', 4.5, 'text');
add('inverted-background', 'content-inverted-icon', 3, 'icon');
for (const s of ['important', 'warning', 'confirmation', 'supplementary']) { add(`${s}-muted`, s, 4.5, 'text'); add(SURFACES, s, 4.5, 'text'); }
add(['gradient1-from', 'gradient1-to'], 'content-text', 4.5, 'text');
add(['gradient1-from', 'gradient1-to'], 'content-icon', 3, 'icon');
add(['gradient2-from', 'gradient2-to'], 'content-inverted-text', 4.5, 'text');
add(['gradient2-from', 'gradient2-to'], 'content-inverted-icon', 3, 'icon');
add('selection-background', 'selection-text', 4.5, 'text');
for (const st of ['', 'hover-', 'active-']) add(`input-${st}background`, `input-${st}text`, 4.5, 'text');
add('input-background', 'input-placeholder', 4.5, 'text');
add('input-background', 'input-frame', 3, 'frame');
add(SURFACES, 'focused', 3, 'focus ring');
// buttons: every <variant>[-<state>]-background / -text pair; a transparent background is measured on the
// surface the button is made for (inverted buttons: --pos-color-inverted-background, as on the docs page)
const buttonTokens = Object.keys(THEMES.light).filter((n) => /^--pos-color-button-.+-text$/.test(n) && !/-disabled-/.test(n));
for (const text of buttonTokens) {
  const bgName = text.replace(/-text$/, '-background');
  if (!(bgName in THEMES.light)) continue;
  const inverted = /button-inverted/.test(text);
  pairs.push({ bg: bgName, fg: text, min: 4.5, kind: 'button text', surfaces: inverted ? [T('inverted-background')] : [T('page-background'), T('content-background')] });
}

/* ---- suggestions ---- */
const SCALE_RE = /^--pos-primitive-color-(brand-primary|brand-supplementary|red|yellow|green)-(\d+)$/;
const NEUTRALS = Object.keys(defs).filter((n) => /^--pos-primitive-color-(grey[a-z0-9-]*|white|black)$/.test(n) && parse(defs[n]));
function suggest(side, chain, otherColor, min) {
  const prim = chain[chain.length - 1];
  const modeVar = chain.find((n) => /^--pos-color-(light|dark|a11y)-/.test(n)) || chain[0];
  let candidates = [];
  const m = SCALE_RE.exec(prim);
  if (m) {
    const step = +m[2];
    candidates = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].filter((s) => s !== step)
      .sort((a, b) => Math.abs(a - step) - Math.abs(b - step))
      .map((s) => `--pos-primitive-color-${m[1]}-${s}`);
  } else if (NEUTRALS.includes(prim)) {
    const own = lum(parse(def(prim)));
    candidates = NEUTRALS.filter((n) => n !== prim).sort((a, b) => Math.abs(lum(parse(def(a))) - own) - Math.abs(lum(parse(def(b))) - own));
  }
  for (const c of candidates) {
    const col = parse(def(c));
    if (!col) continue;
    const r = side === 'fg' ? ratio(col, otherColor) : ratio(otherColor, col);
    if (r >= min) return { side, change: modeVar, to: c, value: def(c), ratio: +r.toFixed(2) };
  }
  return null;
}

/* ---- run ---- */
const results = [];
for (const [brand, overlay] of Object.entries(BRANDS)) {
BRAND = overlay;
for (const theme of Object.keys(THEMES)) {
  for (const p of pairs) {
    const b = resolve(p.bg, theme), f = resolve(p.fg, theme);
    let bg = parse(b.value), fg = parse(f.value);
    if (!bg || !fg) continue;
    let measuredOn = null;
    const surfaces = bg.a < 1 ? (p.surfaces || [T('page-background')]) : [null];
    for (const s of surfaces) {
      let bgc = bg;
      if (s) { const sc = parse(resolve(s, theme).value); if (!sc) continue; bgc = over(bg, sc); measuredOn = s; }
      const fgc = fg.a < 1 ? over(fg, bgc) : fg;
      const r = ratio(fgc, bgc);
      if (r >= p.min) continue;
      const known = KNOWN.find((k) => (!k.brand || k.brand === brand) && k.theme === theme && k.bg.test(p.bg) && k.fg.test(p.fg));
      results.push({
        brand, theme, kind: p.kind, fg: p.fg, bg: p.bg, on: measuredOn, fgValue: hex(fgc), bgValue: hex(bgc),
        ratio: +r.toFixed(2), min: p.min, known: known ? known.note : null,
        suggestions: [suggest('fg', f.chain, bgc, p.min), bg.a === 1 ? suggest('bg', b.chain, fgc, p.min) : null].filter(Boolean),
      });
    }
  }
}
}
BRAND = {};

const fresh = results.filter((r) => !r.known);
if (asJson) {
  console.log(JSON.stringify({ checkedPairs: pairs.length * 3 * Object.keys(BRANDS).length, brands: Object.keys(BRANDS), failures: fresh, known: results.filter((r) => r.known) }, null, 2));
} else {
  const name = { light: 'light', dark: 'dark', a11y: 'high contrast' };
  for (const r of results) {
    console.log(`${r.known ? '•' : '✗'} [${r.brand} · ${name[r.theme]}] ${r.kind}: ${r.fg} (${r.fgValue}) on ${r.bg}${r.on ? ` over ${r.on}` : ''} (${r.bgValue}) = ${r.ratio}:1, needs ${r.min}:1${r.known ? `  — known: ${r.known}` : ''}`);
    for (const s of r.suggestions) console.log(`    → ${s.side === 'fg' ? 'foreground' : 'background'}: set ${s.change} to ${s.to} (${s.value}) = ${s.ratio}:1`);
  }
  console.log(`check:contrast — ${pairs.length * 3 * Object.keys(BRANDS).length} pairs checked (${Object.keys(BRANDS).length} brand theme(s) × light, dark, high contrast): ${fresh.length} failure(s)${results.length - fresh.length ? `, ${results.length - fresh.length} known` : ''}`);
}
process.exit(fresh.length ? 1 : 0);
