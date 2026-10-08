/*
  palettes.js — color-scales / palettes view of the docs page /style-guide/foundations/palettes.
  Also the single source of truth for the scale math (the part between "---------- config" and "---------- state").
  Runs only when the page has the #pal-scales mount point. Element ids are prefixed with pal-.
*/
(() => {
'use strict';
if (!document.getElementById('pal-scales')) return;
/* ---------- config ---------- */
const STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
// Current highlight backgrounds (read-only copies of the grey tokens; the grey scale is not being changed).
const HL = { light: '#e7ecf3', dark: '#1a1d21' }; // light: highlight bg · dark: content bg
// kind: 'white' = contrast vs white · 'black' = vs black · 'onLight'/'onDark' = minimum contrast on that mode's reference bg (HL)
const DEFAULT_TARGETS = [
  { kind: 'white', v: 1.06 },
  { kind: 'white', v: 1.15 },
  { kind: 'white', v: 1.35 },
  { kind: 'onDark', v: 6 },
  { kind: 'onDark', v: 4 },
  { kind: 'onLight', v: 4 },
  { kind: 'onLight', v: 6 },
  { kind: 'black', v: 1.35 }, // mirrors 300
  { kind: 'black', v: 1.15 }, // mirrors 200
  { kind: 'black', v: 1.06 }, // mirrors 100
];
const KIND_NOTE = {
  white: 'contrast vs white',
  black: 'contrast vs black',
  onLight: 'min. contrast on the darkest light-mode bg',
  onDark: 'min. contrast on the lightest dark-mode bg',
};
// Middle steps are solved at their exact minimum; if hex rounding drops a color just below it,
// solveMiddle() nudges it by tiny increments until it passes.
// Background steps that must carry their mode's text + graphics colors: [fg step, target index]
// Tints that may carry text: [fg step, contrast target index] — or 'wcag-text' / 'wcag-graphic' for the
// 300 / 800 steps, which are checked against WCAG AA (4.5 text / 3 graphics) since they sit below our own 6 / 4 targets.
const TEXT_SAFE_TINTS = {
  100: [[700, 6], [600, 5]], 200: [[700, 6], [600, 5]], 300: [[700, 'wcag-text'], [600, 'wcag-graphic']],
  800: [[400, 'wcag-text'], [500, 'wcag-graphic']], 900: [[400, 3], [500, 4]], 1000: [[400, 3], [500, 4]],
};
// light grey supplementary text (grey-dark-6) — shown under the 300 swatches to confirm it passes there too
const LIGHT_SUPPLEMENTARY_TEXT = '#5c6270';
// Usage ranges above the 10 steps: [row, mode, role, from–to, recommended] (column numbers 1–10 = steps
// 100–1000). One row per role, the light- and dark-mode ranges side by side as mirror images (they never
// overlap). Text, icon and button ranges stop at 800 (light) / 300 (dark), so the hover's two extra steps
// always fit. The dot marks the recommended default step (text, icon and button ranges only).
const USAGE_RANGES = [
  [1, 'light', 'backgrounds', [1, 3]],
  [1, 'dark', 'backgrounds', [8, 10]],
  [2, 'dark', 'icons, graphics, buttons', [3, 5], 5],
  [2, 'light', 'icons, graphics, buttons', [6, 8], 6],
  [3, 'dark', 'text, links', [3, 4], 4],
  [3, 'light', 'text, links', [7, 8], 7],
];
const USAGE_ROW = USAGE_RANGES.map(([row, mode, role, [from, to], rec]) =>
  `<div class="range range--${mode}" style="--from:${from};--to:${to + 1};--row:${row}"><b>${mode} mode</b> ${role}</div>` +
  (rec ? `<span class="range-dot range--${mode}" style="--at:${rec};--row:${row}" title="recommended: ${rec * 100}"></span>` : '')
).join('') + `<p class="range-legend" style="--row:${Math.max(...USAGE_RANGES.map((r) => r[0])) + 1}">The dot marks the recommended step &mdash; a recommendation only, any step inside a range passes. Text, icon and button ranges end two steps before the scale does, so the hover (two steps further) always has room.</p>`;
// Base colors taken from the current style/pos-primitives.css (read-only reference).
const SCALES = [
  { key: 'brand-primary', name: 'Brand primary', base: '#1d4ed8', src: '--pos-primitive-color-brand-primary-1' },
  { key: 'brand-supplementary', name: 'Brand supplementary', base: '#8326ff', src: '--pos-primitive-color-brand-supplementary-1' },
  // chroma: saturation factor for the whole scale (1 = as saturated as the gamut allows). Red toned
  // down to 0.85 (user, 2026-10-01: dark-mode error buttons looked too loud at full saturation).
  // status scales (keepBase: false): every step is computed — only the brand scales keep their exact base hex
  { key: 'red', name: 'Red', base: '#ca3a31', src: '--pos-primitive-color-red-mid', chroma: 0.85, keepBase: false },
  { key: 'yellow', name: 'Yellow', base: '#ffbe5b', src: '--pos-primitive-color-yellow-mid', keepBase: false },
  { key: 'green', name: 'Green', base: '#098f69', src: '--pos-primitive-color-green-mid', keepBase: false },
];

/* ---------- color math (sRGB <-> OKLab, WCAG luminance) ---------- */
const toLin = c => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
const toGam = c => c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
function hexToLin(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => toLin(v / 255));
}
function linToHex(rgb) {
  return '#' + rgb.map(v => Math.round(Math.min(1, Math.max(0, toGam(v))) * 255).toString(16).padStart(2, '0')).join('');
}
function linToOklab([r, g, b]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
}
function oklabToLin([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}
const lchToLin = (L, C, h) => oklabToLin([L, C * Math.cos(h), C * Math.sin(h)]);
const inGamut = rgb => rgb.every(v => v >= -1e-5 && v <= 1 + 1e-5);
const lum = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const Y = hex => lum(hexToLin(hex));
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const cr = (h1, h2) => ratio(Y(h1), Y(h2));

function maxChroma(L, h) {
  let lo = 0, hi = 0.4;
  for (let i = 0; i < 30; i++) { const mid = (lo + hi) / 2; inGamut(lchToLin(L, mid, h)) ? lo = mid : hi = mid; }
  return lo;
}
// Keep the base hue + chroma, solve OKLCH lightness to hit the target luminance.
// f scales the chroma AFTER the gamut clamp, so it tones down every step, light and dark ends included.
function solveStep(targetY, C, h, f = 1) {
  let lo = 0, hi = 1, rgb = [0, 0, 0];
  for (let i = 0; i < 40; i++) {
    const L = (lo + hi) / 2;
    rgb = lchToLin(L, Math.min(C, maxChroma(L, h)) * f, h);
    lum(rgb) < targetY ? lo = L : hi = L;
  }
  return linToHex(rgb);
}

/* ---------- targets -> luminance per step ---------- */
const yHl = mode => Y(HL[mode]);
// Luminance limit a middle step's minimum implies (dark mode: at least this light; light mode: at most this light).
const yLimit = t => t.kind === 'onDark'
  ? t.v * (yHl('dark') + 0.05) - 0.05
  : (yHl('light') + 0.05) / t.v - 0.05;
const lg = y => Math.log(y + 0.05), unlg = x => Math.exp(x) - 0.05;

function computeTargets() {
  const t = state.targets;
  const ys = t.map(x => x.kind === 'white' ? 1.05 / x.v - 0.05 : x.kind === 'black' ? 0.05 * x.v - 0.05 : null);
  const y400 = yLimit(t[3]), y500min = yLimit(t[4]), y600max = yLimit(t[5]), y700 = yLimit(t[6]);
  const feasible = y400 > y700;
  const a = lg(y400), d = lg(y700);
  ys[3] = y400;
  ys[6] = y700;
  // Exact minimums when they keep the 400 > 500 > 600 > 700 order; otherwise spread 500/600
  // evenly between the text steps (never below their own minimum).
  const ordered = y400 > y500min && y500min > y600max && y600max > y700;
  ys[4] = ordered ? y500min : Math.max(y500min, unlg(d + (a - d) * 2 / 3));
  ys[5] = ordered ? y600max : Math.min(y600max, unlg(d + (a - d) / 3));
  return { ys, feasible, limits: { 3: ['min', y400], 4: ['min', y500min], 5: ['max', y600max], 6: ['max', y700] } };
}

// Does a color satisfy step i's role? (middle steps only; background steps always pass)
function passesRole(i, hex) {
  const t = state.targets[i];
  if (t.kind === 'onDark') return cr(hex, HL.dark) >= t.v;
  if (t.kind === 'onLight') return cr(hex, HL.light) >= t.v;
  return true;
}

// Solve a step; for middle steps, nudge the luminance until the rounded hex meets the minimum.
function solveMiddle(i, y, C, h, f = 1) {
  const t = state.targets[i];
  let hex = solveStep(y, C, h, f);
  for (let k = 1; k <= 20 && !passesRole(i, hex); k++) {
    hex = solveStep(t.kind === 'onDark' ? y * (1 + 0.002 * k) : y * (1 - 0.002 * k), C, h, f);
  }
  return hex;
}

// f < 1 (toned-down scale): the base's exact hex is NOT kept — its step is computed like the
// others, so the whole scale has the same reduced saturation. f = 1 keeps the exact base (decision 2a).
function buildScale(baseHex, ys, f = 1, keepBase = true) {
  const [, a, b] = linToOklab(hexToLin(baseHex));
  const C = Math.hypot(a, b), h = Math.atan2(b, a);
  const by = Y(baseHex);
  // candidate steps: role passes AND the base's luminance stays between its neighbors (keeps light→dark order)
  const order = ys.map((y, i) => i).sort((i, j) => Math.abs(lg(by) - lg(ys[i])) - Math.abs(lg(by) - lg(ys[j])));
  const fits = i => passesRole(i, baseHex) && (i === 0 || by < ys[i - 1]) && (i === ys.length - 1 || by > ys[i + 1]);
  let baseIdx = order.find(fits);
  const baseFlag = baseIdx === undefined;
  if (baseFlag) baseIdx = order[0];
  const scale = ys.map((y, i) => {
    const exactBase = i === baseIdx && f === 1 && keepBase;
    const hex = exactBase ? baseHex.toLowerCase() : solveMiddle(i, y, C, h, f);
    const [l2, a2, b2] = linToOklab(hexToLin(hex));
    return { step: STEPS[i], hex, isBase: exactBase, basePos: i === baseIdx, targetY: y,
             white: cr(hex, '#ffffff'), black: cr(hex, '#000000'),
             lch: [l2, Math.hypot(a2, b2), ((Math.atan2(b2, a2) * 180 / Math.PI) + 360) % 360] };
  });
  return { scale, baseFlag };
}

/* ---------- state ---------- */
// Read-only documentation (2026-10-03): the targets, base colors and saturation are the DS defaults; nothing
// is editable or remembered any more (the old editable tool kept them in localStorage — ignored now).
const state = { targets: DEFAULT_TARGETS.map(t => ({ ...t })) };
const baseOf = s => s.base;
const chromaOf = s => s.chroma ?? 1;

/* ---------- render ---------- */
const $ = id => document.getElementById('pal-' + id);
let calc;
function noteFor(i) {
  const t = state.targets[i], y = calc.ys[i];
  const eq = `≈ ${(1.05 / (y + 0.05)).toFixed(2)} vs white · ${((y + 0.05) / 0.05).toFixed(2)} vs black`;
  if (t.kind === 'onDark') return `used: <b>${ratio(y, yHl('dark')).toFixed(2)}</b> contrast on the lightest dark-mode bg<br>${eq}`;
  if (t.kind === 'onLight') return `used: <b>${ratio(y, yHl('light')).toFixed(2)}</b> contrast on the darkest light-mode bg<br>${eq}`;
  return eq;
}
function renderTargets() {
  $('usage-targets').innerHTML = USAGE_ROW;
  $('targets').innerHTML = STEPS.map((s, i) => `
    <div class="target">
      <span class="step-name">${s}</span>
      <span class="kind">${KIND_NOTE[state.targets[i].kind]}</span>
      <span class="pos-tag value">${state.targets[i].v}:1</span>
      <small id="pal-n${i}"></small>
    </div>`).join('');
}

let built = {};
function renderScales() {
  calc = computeTargets();
  STEPS.forEach((_, i) => { $('n' + i).innerHTML = noteFor(i); });
  built = {};
  $('scales').innerHTML = (calc.feasible ? '' : `<p class="warn">The 400 and 700 text minimums overlap: dark-mode text would have to be darker than light-mode text. Raise one of them.</p>`) +
  SCALES.map(s => {
    const base = baseOf(s);
    const chroma = chromaOf(s);
    const { scale, baseFlag } = buildScale(base, calc.ys, chroma, s.keepBase !== false);
    built[s.key] = scale;
    const at = step => scale.find(x => x.step === step).hex;
    const cells = scale.map(st => {
      const dev = st.isBase ? ((Y(st.hex) + 0.05) / (st.targetY + 0.05) - 1) * 100 : 0;
      return `<div class="sw${st.isBase ? ' is-base' : ''}">
        <div class="chip" style="background:${st.hex}"><span>Aa</span><span>Aa</span></div>
        <div class="meta">
          <b>${st.hex}</b>${st.isBase ? '<span class="badge">base</span>' : st.basePos ? '<span class="badge">base · toned</span>' : ''}<br>
          <span class="name">${s.key} ${st.step}</span><br>
          W ${st.white.toFixed(2)} · B ${st.black.toFixed(2)}<br>
          <span class="step">L ${st.lch[0].toFixed(3)} C ${st.lch[1].toFixed(3)} h ${st.lch[2].toFixed(0)}</span>
          ${st.isBase ? `<br><span class="dev">luminance ${dev >= 0 ? '+' : ''}${dev.toFixed(1)}% vs step target</span>` : ''}
        </div></div>`;
    }).join('');
    const checks = scale.map((st, i) => {
      const t = state.targets[i];
      if (t.kind !== 'onLight' && t.kind !== 'onDark') {
        const tint = TEXT_SAFE_TINTS[st.step];
        if (!tint) return '<div></div>';
        const lines = tint.map(([fgStep, i2]) => {
          const min = i2 === 'wcag-text' ? 4.5 : i2 === 'wcag-graphic' ? 3 : state.targets[i2].v;
          const c = cr(at(fgStep), st.hex), pass = c >= min;
          return `<div class="check ${pass ? 'ok' : 'fail'}">${pass ? '✓' : '✗'} ${fgStep}: ${c.toFixed(2)} (min ${min})</div>`;
        });
        if (st.step === 300) { const c = cr(LIGHT_SUPPLEMENTARY_TEXT, st.hex); lines.push(`<div class="check ${c >= 4.5 ? 'ok' : 'fail'}">${c >= 4.5 ? '✓' : '✗'} grey supplementary: ${c.toFixed(2)}</div>`); }
        return '<div>' + lines.join('') + '</div>';
      }
      const c = cr(st.hex, t.kind === 'onDark' ? HL.dark : HL.light), pass = c >= t.v;
      return `<div class="check ${pass ? 'ok' : 'fail'}">${pass ? '✓' : '✗'} ${c.toFixed(2)} contrast on the ${t.kind === 'onDark' ? 'lightest dark-mode' : 'darkest light-mode'} bg (min ${t.v})</div>`;
    }).join('');
    const demo = `<div class="demo">
      <div class="demo-box" style="background:${HL.light};color:#374151">
        <span class="demo-lbl">light mode · on the darkest light-mode bg ${HL.light}</span>
        <div class="demo-line" style="color:${at(700)}"><b>700 text link</b> — the quick brown fox</div>
        <div class="demo-line"><span class="demo-dot" style="background:${at(600)}"></span><span class="demo-lbl">600 icon / graphic</span></div>
        <div class="demo-line">
          ${[100, 200, 300].map(n => `<span class="demo-tint" style="background:${at(n)};color:${at(700)}">${n} bg · 700 text ${cr(at(700), at(n)).toFixed(2)}</span>`).join('')}
        </div>
      </div>
      <div class="demo-box" style="background:${HL.dark};color:#e5e7eb">
        <span class="demo-lbl">dark mode · on the lightest dark-mode bg ${HL.dark}</span>
        <div class="demo-line" style="color:${at(400)}"><b>400 text link</b> — the quick brown fox</div>
        <div class="demo-line"><span class="demo-dot" style="background:${at(500)}"></span><span class="demo-lbl">500 icon / graphic</span></div>
        <div class="demo-line">
          ${[800, 900, 1000].map(n => `<span class="demo-tint" style="background:${at(n)};color:${at(400)}">${n} bg · 400 text ${cr(at(400), at(n)).toFixed(2)}</span>`).join('')}
        </div>
      </div>
    </div>`;
    return `<section class="panel">
      <div class="scale-head">
        <h2>${s.name}</h2>
        <span class="src"><span class="base-swatch" style="background:${base}"></span>base ${base} (${s.src})${chroma !== 1 ? ` · saturation ${chroma}` : ''}</span>
      </div>
      <div class="scroll">
        <div class="grid">${cells}</div>
        <div class="grid checks">${checks}</div>
        ${demo}
      </div>
      ${baseFlag ? `<p class="warn">The base color doesn't fit any step without breaking a role minimum or the light→dark order — it is shown on its nearest step anyway.</p>` : ''}
    </section>`;
  }).join('');

  renderCompare();
}

function renderCompare() {
  $('compare').innerHTML = `<tr><th></th>${STEPS.map(s => `<th>${s}</th>`).join('')}</tr>
    <tr><td>target</td>${calc.ys.map(y => `<td>${(1.05 / (y + 0.05)).toFixed(2)}</td>`).join('')}</tr>` +
    SCALES.map(s => `<tr><td>${s.key}</td>${built[s.key].map(st => `<td>${st.white.toFixed(2)}${st.isBase ? '*' : ''}</td>`).join('')}</tr>`).join('');
}
renderTargets(); renderScales();

/* ---------- neutral + high-contrast primitives (read live from the loaded DS CSS) ---------- */
// Appended after the scale panels, so both the tool page and the docs page get it without markup changes.
// `preview` = value used when the primitive only exists in the switchable preview CSS so far.
const NEUTRALS = [
  { name: 'white' },
  { name: 'grey-light-3', role: 'light page bg' },
  { name: 'grey-light-2', role: 'light highlight bg' },
  { name: 'grey-light-1', role: 'light subtle frame' },
  { name: 'grey-medium', role: 'disabled · dark supplementary text' },
  { name: 'grey-dark-6', role: 'light supplementary text' },
  { name: 'grey', role: 'frames (light + dark)' },
  { name: 'grey-dark-2', role: 'light icons' },
  { name: 'grey-dark-1', role: 'light body text' },
  { name: 'grey-dark-3', role: 'dark content bg' },
  { name: 'grey-dark-4', role: 'dark highlight bg' },
  { name: 'grey-dark-5', role: 'dark page bg (new)', preview: '#0b0d11' },
  { name: 'black', role: 'dark input bg · labels' },
];
const HC_COLORS = [
  { name: 'a11y-background', role: 'page / surfaces (black)' },
  { name: 'a11y-foreground', role: 'text, frames (white)' },
  { name: 'a11y-interactive-graphic', role: 'icons, buttons (cyan)' },
  { name: 'a11y-interactive-graphic-inverted', role: 'graphics on inverted surface (dark cyan)' },
  { name: 'a11y-interactive-text', role: 'links, focus (yellow)' },
  { name: 'a11y-interactive-text-inverted', role: 'text, focus on inverted surface (dark yellow)' },
  { name: 'a11y-disabled', role: 'disabled' },
];
function primitiveHex(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(`--pos-primitive-color-${name}`).trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(v)) return { hex: v, live: true };
  return fallback ? { hex: fallback, live: false } : null;
}
function primitiveCards(list) {
  return list.map(p => {
    const v = primitiveHex(p.name, p.preview);
    if (!v) return '';
    return `<div class="sw">
      <div class="chip" style="background:${v.hex}"><span>Aa</span><span>Aa</span></div>
      <div class="meta">
        <b>${v.hex}</b>${v.live ? '' : '<span class="badge">preview</span>'}<br>
        <span class="name">${p.name}</span><br>
        W ${cr(v.hex, '#ffffff').toFixed(2)} · B ${cr(v.hex, '#000000').toFixed(2)}
        ${p.role ? `<br><span class="step">${p.role}</span>` : ''}
      </div></div>`;
  }).join('');
}
const mount = $('scales').parentElement;
const extra = document.createElement('div');
extra.innerHTML = `
  <section class="panel">
    <h2>Neutrals</h2>
    <p class="lead" style="margin:4px 0 14px">The grey scale — unchanged by the new palette, shared by every mode except high contrast. Values are read live from the loaded DS CSS.</p>
    <div class="grid grid-auto">${primitiveCards(NEUTRALS)}</div>
  </section>
  <section class="panel">
    <h2>High contrast</h2>
    <p class="lead" style="margin:4px 0 14px">High contrast mode's own colors — kept as they are. HC status colors (important, warning, confirmation, supplementary) come from the scales above.</p>
    <div class="grid grid-auto">${primitiveCards(HC_COLORS)}</div>
  </section>`;
while (extra.firstElementChild) mount.appendChild(extra.firstElementChild);
})();
