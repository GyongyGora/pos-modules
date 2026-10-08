#!/usr/bin/env node
/**
 * Component scaffolding generator — pos-module-common-styling
 *
 * Implements RULES.md §6's reduced-touchpoint new-component workflow (cut
 * ~15 manual registration steps down to ~5). Run once per new "simple"
 * component (single
 * representative variant — the common case, ~18 of 23 existing components).
 * Bespoke multi-variant components (Chip/Segmented/Tag/Card/Button/Code
 * style, with a Variant toggle filtering multiple preview rows) still need a
 * hand-written getXVariantSections() — this script does not attempt that,
 * it only removes the mechanical/boilerplate touchpoints every component
 * shares.
 *
 * Usage:
 *   node scripts/generate-component.js --config path/to/component.config.json
 *   node scripts/generate-component.js --config path/to/component.config.json --dry-run
 *   node scripts/generate-component.js --status <key>
 *
 * --status <key> scans every file this script and the manual steps touch for an
 * already-scaffolded component and prints exactly what's left, with file:line precision,
 * grounded in the real current file contents (not a static checklist) — see runStatusCheck()
 * below. Covers the same ground as .claude/commands/create-component.md's Step 8 checklist;
 * run this instead of manually walking that list.
 *
 * See scripts/component.config.example.json for the full config shape.
 *
 * What it writes (idempotent — re-running with the same key skips any file
 * that already exists, except the always-regenerated spec-<key>.liquid):
 *   1. style/pos-<key>.css                          (new file, skeleton)
 *   2. tokens/components/<key>.json                 (new file, full schema)
 *   3. partials/style-guide/spec-<key>.liquid           (always regenerated from #2)
 *   4. partials/init.liquid                          (+1 <link> line, appended)
 *   5. pages/style-guide/component-template.liquid  (+1 spec render include —
 *                                                         RULES.md §7.16, load-bearing:
 *                                                         without it COMPONENT_SPECS[key]
 *                                                         never populates)
 *   6. partials/style-guide/nav-left.liquid             (+1 nav entry, appended to its group)
 *   7. COMPONENTS.md                                    (+1 inventory row, appended)
 *   8a. src/js/styleguide-component-page/comp-configs.ts  (+1 COMP_CONFIGS entry)
 *   8b. src/js/styleguide-component-page/apply-status.ts  (+1 applyStatus_<Key> handler
 *                                                          +1 STATUS_HANDLERS entry, if
 *                                                          the component has
 *                                                          hover/focus/disabled states)
 *                                                          NOTE: these two are real TypeScript
 *                                                          source, compiled by Rollup into
 *                                                          modules/common-styling/public/assets/js/
 *                                                          styleguide-component-page.js — that
 *                                                          output file is a build artifact, never
 *                                                          edited directly. Run `npm run build`
 *                                                          (or `npm run deploy`/`deploy:dev`) after
 *                                                          this script for the change to actually
 *                                                          ship (2026-09-19, after the docs-site JS
 *                                                          moved from one hand-edited monolith to
 *                                                          compiled TypeScript).
 *   9. style-guide/styleguide.css                    (+debug-class stubs for
 *                                                         simulated hover/focus,
 *                                                         commented TODO — fill
 *                                                         in real values to match
 *                                                         the component's own
 *                                                         :hover/:focus-visible CSS)
 *
 * 10. pages/style-guide/component-template.liquid  (+1 preview-section skeleton,
 *                                                         auto-inserted right after the
 *                                                         last existing section in the
 *                                                         same navGroup — same "append to
 *                                                         end of group" placement nav-left.liquid
 *                                                         already uses, so nav order and
 *                                                         section order stay in sync by
 *                                                         construction. Content inside is
 *                                                         still a TODO placeholder — this
 *                                                         only automates the insertion, not
 *                                                         the real markup.)
 * 11. src/js/styleguide-component-page/token-panel.ts  (only if the config sets
 *                                                         "multiVariant": true — a boilerplate
 *                                                         get<Key>VariantSections() stub +
 *                                                         its renderTokenPanel() dispatch
 *                                                         branch, correct shape/signature but
 *                                                         no real variant-resolution logic)
 *
 * What it still prints but does NOT write (genuinely component-specific content):
 *   - A note confirming whether the shared "State" control panel already covers every
 *     state this config lists (it almost always does — states are a shared, global
 *     button grid, not per-component markup) — or which states are missing from it.
 *
 * Usage/do/dont/accessibility content is authored ONCE, as arrays, in the
 * config — the script writes the identical arrays into both the spec JSON
 * (whenToUse/whenNotToUse/do/dont/accessibility) and the COMP_CONFIGS.usage
 * block (useWhen/avoidWhen/do/dont/accessibility). This eliminates what was
 * previously an undocumented, easy-to-miss duplicate-authoring step (the
 * spec JSON's prose fields were never actually read by any renderer —
 * COMP_CONFIGS[key].usage was — so today's checklist silently required
 * writing the same content twice in two different shapes without saying so).
 *
 * Safety: every insertion into a shared file uses an exact, uniquely-
 * verified anchor string (throws if the anchor is missing or not unique —
 * never a fuzzy/regex match that could silently hit the wrong spot). Line
 * endings are auto-detected per file and preserved. Run with --dry-run
 * first to review every planned change before it's written.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MOD = path.join(ROOT, 'modules', 'common-styling', 'public');

function fail(msg) {
  console.error('ERROR: ' + msg);
  process.exit(1);
}

function parseArgs(argv) {
  const out = { dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--dry-run') out.dryRun = true;
    else if (argv[i] === '--config') out.config = argv[++i];
    else if (argv[i] === '--status') out.status = argv[++i];
  }
  return out;
}

function detectEOL(content) {
  return content.indexOf('\r\n') !== -1 ? '\r\n' : '\n';
}

function findUnique(content, marker, label) {
  const first = content.indexOf(marker);
  if (first === -1) fail('Anchor not found for ' + label + '. File may have changed shape — update the script.\nMarker: ' + JSON.stringify(marker));
  const second = content.indexOf(marker, first + 1);
  if (second !== -1) fail('Anchor for ' + label + ' is not unique (found more than once) — refusing to guess. Marker: ' + JSON.stringify(marker));
  return first;
}

function readJSONConfig(configPath) {
  const raw = fs.readFileSync(configPath, 'utf8');
  let cfg;
  try {
    cfg = JSON.parse(raw);
  } catch (e) {
    fail('Config is not valid JSON: ' + e.message);
  }
  const required = ['key', 'label', 'description'];
  required.forEach(function (f) {
    if (!cfg[f]) fail('Config missing required field: ' + f);
  });
  cfg.states = cfg.states || ['normal'];
  cfg.controls = cfg.controls || ['state'];
  cfg.navGroup = cfg.navGroup || 'Components';
  cfg.badge = cfg.badge || 'new';
  cfg.composedOf = cfg.composedOf || [];
  cfg.props = cfg.props || [];
  cfg.useWhen = cfg.useWhen || [];
  cfg.avoidWhen = cfg.avoidWhen || [];
  cfg.do = cfg.do || [];
  cfg.dont = cfg.dont || [];
  cfg.accessibility = cfg.accessibility || [];
  cfg.rootSelector = cfg.rootSelector || ('.pos-' + cfg.key);
  cfg.usageExample = cfg.usageExample || ('<div class="pos-' + cfg.key + '"></div>');
  // Set this when the preview shows multiple visual sub-variants side by side (Chip/Segmented/
  // Tag/Card/Button/Code-style, per RULES.md §7) rather than one single representative instance —
  // the generic COMP_CONFIGS/token-panel wiring only covers the single-variant case, and this
  // scaffolds (not implements) the bespoke get<Key>VariantSections() such a component needs.
  cfg.multiVariant = !!cfg.multiVariant;
  return cfg;
}

/* ---------------------------------------------------------------------- */
/* 1. Component CSS skeleton                                              */
/* ---------------------------------------------------------------------- */

function buildCssSkeleton(cfg) {
  const stateRules = cfg.states
    .filter(function (s) { return s !== 'normal'; })
    .map(function (s) {
      if (s === 'disabled') {
        return '\n.' + cfg.key.replace(/^\./, '') + '[disabled],\n.pos-' + cfg.key + '[aria-disabled="true"] {\n  /* TODO: disabled colors — real tokens, never a bare opacity */\n}\n';
      }
      const pseudo = s === 'hover' ? ':hover' : s === 'focus' ? ':focus-visible' : ':' + s;
      return '\n.pos-' + cfg.key + pseudo + ' {\n  /* TODO: ' + s + ' state — real tokens only */\n}\n';
    })
    .join('');

  return [
    '/*',
    '  ' + cfg.key + ' component',
    '',
    '  ' + cfg.description,
    '*/',
    '',
    '',
    '.pos-' + cfg.key + ' {',
    '  all: unset;',
    '  display: revert;',
    '',
    '  /* TODO: base styles — every value a token, see RULES.md §5 */',
    '}',
    stateRules,
  ].join('\n') + '\n';
}

/* ---------------------------------------------------------------------- */
/* 2. Component spec JSON skeleton                                        */
/* ---------------------------------------------------------------------- */

function buildSpecJson(cfg) {
  const statesObj = {};
  cfg.states.forEach(function (s) {
    statesObj[s] = {
      sections: [
        {
          heading: 'Color',
          tokens: [
            {
              css: '--pos-color-TODO',
              figma: null,
              role: 'TODO — look up via tokens/css-to-figma.json (RULES.md §6.5), never guess',
              swatch: true,
            },
          ],
        },
      ],
    };
  });

  return {
    _about:
      'Component spec for pos-' + cfg.key + ' — generated by scripts/generate-component.js on ' +
      '(fill in date). Single source of truth for the Variants/Usage/Tokens tabs on ' +
      '/style-guide. TODO tokens below are placeholders — replace every one using the ' +
      'real CSS cascade (RULES.md §6.5), never guess a value or a Figma name. Regenerate ' +
      'spec-' + cfg.key + '.liquid via this same script (or the inline regen snippet in ' +
      'RULES.md §6) after any change here — never hand-edit the .liquid partial.',
    component: cfg.key,
    name: cfg.label,
    description: cfg.description,
    whenToUse: cfg.useWhen,
    whenNotToUse: cfg.avoidWhen,
    do: cfg.do,
    dont: cfg.dont,
    accessibility: cfg.accessibility,
    composedOf: cfg.composedOf,
    props: cfg.props,
    dimensions: { state: cfg.states },
    shared: {},
    variants: {
      [cfg.key]: {
        label: cfg.label,
        classes: [],
        states: statesObj,
      },
    },
    usageExample: cfg.usageExample,
  };
}

function regenSpecPartial(key) {
  const jsonPath = path.join(MOD, 'assets', 'tokens', 'components', key + '.json');
  const specPath = path.join(MOD, 'views', 'partials', 'style-guide', 'spec-' + key + '.liquid');
  const j = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const jsonStr = JSON.stringify(j, null, 2);
  // A raw block is mandatory: spec JSON string fields (usageExample especially) can legitimately
  // contain literal Liquid-looking example code — without it, Liquid parses and executes that
  // text as real template code instead of treating it as inert JSON, breaking the page (found in
  // alert-card.json, 2026-09-03, after it finally got rendered for the first time). IMPORTANT: the
  // {% comment %} text below must never itself contain a literal "{%"/"%}" sequence, even to
  // describe this fix in words — a nested tag-like sequence inside a comment makes some Liquid
  // parsers report "'comment' tag was never closed" and fail deploy validation for every spec at
  // once (hit immediately after first writing this comment with literal raw/endraw text in it).
  const out =
    '{% comment %}\n' +
    '  Generated from tokens/components/' + key + '.json — never hand-edit, regenerate via ' +
    'scripts/generate-component.js (or the inline regen snippet in RULES.md §6) if the source JSON changes.\n' +
    '  The JSON below is wrapped in a raw block because spec string fields can legitimately contain\n' +
    '  literal Liquid-looking example code, which must stay inert text, not executable template code.\n' +
    '{% endcomment %}\n' +
    '<script type="application/json" id="comp-spec-' + key + '">\n{% raw %}\n' + jsonStr + '\n{% endraw %}\n</script>\n';
  const m = out.match(/\{% raw %\}\n([\s\S]*)\n\{% endraw %\}/);
  JSON.parse(m[1]); // parse-back validation — never write an unverified partial
  return { specPath, out };
}

/* ---------------------------------------------------------------------- */
/* 3. init.liquid — CSS <link> registration                           */
/* ---------------------------------------------------------------------- */

function planCssLink(cfg, plan) {
  const file = path.join(MOD, 'views', 'partials', 'init.liquid');
  const content = fs.readFileSync(file, 'utf8');
  const eol = detectEOL(content);
  const anchor = '<link rel="stylesheet" href="{{ \'modules/common-styling/style/pos-card.css\' | asset_url }}">';
  const idx = findUnique(content, anchor, 'init.liquid CSS link anchor');
  const insertAt = idx + anchor.length;
  const newLine = eol + '<link rel="stylesheet" href="{{ \'modules/common-styling/style/pos-' + cfg.key + '.css\' | asset_url }}">';
  const next = content.slice(0, insertAt) + newLine + content.slice(insertAt);
  plan.push({ file, content: next, label: 'init.liquid (+CSS link)' });
}

/* ---------------------------------------------------------------------- */
/* 3b. component-template.liquid — spec render include                   */
/* ---------------------------------------------------------------------- */

/* Finds the last component key already registered in a given nav-left.liquid group, so the
   new preview section can be inserted "after the last member of the same group" — the exact
   same placement rule planNavEntry already uses for the nav entry itself (append to the end
   of the group's children array), so nav order and section order can never drift apart for a
   component this script creates. Returns null if the group has no existing children (fail
   loudly in the caller rather than guessing where a brand-new group's first section should go). */
function getLastKeyInNavGroup(cfg) {
  const file = path.join(MOD, 'views', 'partials', 'style-guide', 'nav-left.liquid');
  const content = fs.readFileSync(file, 'utf8');
  const groupAnchor = '"label": "' + cfg.navGroup + '",';
  const groupIdx = findUnique(content, groupAnchor, 'nav-left.liquid group "' + cfg.navGroup + '" (preview-section placement lookup)');
  const closeIdx = content.indexOf(']', groupIdx);
  if (closeIdx === -1) fail('Could not find closing "]" for nav group ' + cfg.navGroup);
  const segment = content.slice(groupIdx, closeIdx);
  const matches = segment.match(/#comp-section-([a-z0-9-]+)"/g) || [];
  if (!matches.length) return null;
  const last = matches[matches.length - 1];
  return last.slice('#comp-section-'.length, -1);
}

function buildPreviewSectionSkeleton(cfg, eol) {
  return [
    '        <section class="comp-doc-section" data-comp-key="' + cfg.key + '" id="comp-section-' + cfg.key + '">',
    '',
    '          <header class="comp-doc-section-header">',
    '            <h4 class="pos-heading-4">' + cfg.label + '</h4>',
    '          </header>',
    '',
    '          <div class="comp-preview-stage" id="comp-' + cfg.key + '-preview" data-status="normal">',
    '            <!-- TODO(generate-component.js): real ' + cfg.label + ' markup here — replace before review -->',
    '          </div>',
    '',
    '          <pre class="pos-code pos-code--block pos-code--light pos-code--small comp-preview-code" id="comp-preview-code-' + cfg.key + '"><code class="language-html"></code></pre>',
    '',
    '        </section><!-- /#comp-section-' + cfg.key + ' -->',
  ].join(eol);
}

/* Both edits below land in component-template.liquid — done in one function, one read, one
   plan entry (not two independent planXxx() calls each reading the file fresh from disk),
   because two plan entries for the same file would silently discard whichever was written
   first when the plan is applied (each planXxx() reads the pre-edit file from disk; the plan
   array holds full-file replacements, not diffs — a second entry for the same path clobbers
   the first, it does not merge with it). */
function planComponentTemplateEdits(cfg, plan) {
  const file = path.join(MOD, 'views', 'pages', 'style-guide', 'component-template.liquid');
  let content = fs.readFileSync(file, 'utf8');
  const eol = detectEOL(content);

  // 1. Spec render include — RULES.md §7.16: a spec JSON + spec-<key>.liquid existing on disk
  // does NOT mean the Tokens panel works — COMPONENT_SPECS[key] is only populated from
  // <script id="comp-spec-*"> tags actually present in the rendered page, so this render
  // include is load-bearing, not boilerplate. Found missing for alert-card (hand-restored
  // outside this script) 2026-09-03 — automating it here closes that gap for every component
  // this script creates from now on.
  const specAnchor = "{% render 'modules/common-styling/style-guide/spec-pagination' %}";
  const specIdx = findUnique(content, specAnchor, 'component-template.liquid spec-render anchor');
  const specInsertAt = specIdx + specAnchor.length;
  const specLine = eol + "{% render 'modules/common-styling/style-guide/spec-" + cfg.key + "' %}";
  content = content.slice(0, specInsertAt) + specLine + content.slice(specInsertAt);

  // 2. Preview-section skeleton — inserted right after the last section belonging to the same
  // nav group (see getLastKeyInNavGroup above). Content is still a TODO placeholder; only the
  // insertion/wiring is automatic.
  const lastKey = getLastKeyInNavGroup(cfg);
  if (lastKey === null) {
    fail('Nav group "' + cfg.navGroup + '" has no existing entries to anchor the new preview section after — this script only knows how to append to an existing group. Insert the preview section into component-template.liquid by hand this one time (see the printed skeleton below), or add at least one entry to this group first.');
  }
  const sectionCloseAnchor = '</section><!-- /#comp-section-' + lastKey + ' -->';
  const sectionIdx = findUnique(content, sectionCloseAnchor, 'component-template.liquid closing anchor for last group member "' + lastKey + '"');
  const sectionInsertAt = sectionIdx + sectionCloseAnchor.length;
  const sectionBlock = eol + eol + eol + buildPreviewSectionSkeleton(cfg, eol);
  content = content.slice(0, sectionInsertAt) + sectionBlock + content.slice(sectionInsertAt);

  plan.push({ file, content, label: 'component-template.liquid (+spec render include, +preview section after "' + lastKey + '")' });
}

/* ---------------------------------------------------------------------- */
/* 4. nav-left.liquid — nav entry                                         */
/* ---------------------------------------------------------------------- */

function planNavEntry(cfg, plan) {
  const file = path.join(MOD, 'views', 'partials', 'style-guide', 'nav-left.liquid');
  const content = fs.readFileSync(file, 'utf8');
  const eol = detectEOL(content);
  const groupAnchor = '"label": "' + cfg.navGroup + '",';
  const groupIdx = findUnique(content, groupAnchor, 'nav-left.liquid group "' + cfg.navGroup + '"');
  // find this group's closing "]" (end of its children array) — the first "]" after the group anchor
  const closeIdx = content.indexOf(']', groupIdx);
  if (closeIdx === -1) fail('Could not find closing "]" for nav group ' + cfg.navGroup);
  // back up to the end of the previous entry's line (last "}" before the "]")
  const lastBrace = content.lastIndexOf('}', closeIdx);
  if (lastBrace === -1 || lastBrace < groupIdx) fail('Could not find last nav entry in group ' + cfg.navGroup);
  const badgeField = cfg.badge ? ', "badge": "' + cfg.badge + '"' : '';
  const newEntry =
    ',' + eol + '      { "label": "' + cfg.label + '", "url": "/style-guide/component-template#comp-section-' + cfg.key + '"' + badgeField + ' }';
  const insertAt = lastBrace + 1;
  const next = content.slice(0, insertAt) + newEntry + content.slice(insertAt);
  plan.push({ file, content: next, label: 'nav-left.liquid (+nav entry in "' + cfg.navGroup + '")' });
}

/* ---------------------------------------------------------------------- */
/* 5. COMPONENTS.md — inventory row                                       */
/* ---------------------------------------------------------------------- */

function planComponentsMd(cfg, plan) {
  const file = path.join(ROOT, 'COMPONENTS.md');
  const content = fs.readFileSync(file, 'utf8');
  const eol = detectEOL(content);
  const headerAnchor = '| Component | Spec / docs key | Description | Status | CSS | Spec JSON | Docs |' + eol + '|---|---|---|---|---|---|---|';
  const headerIdx = findUnique(content, headerAnchor, 'COMPONENTS.md table header');
  const tableStart = headerIdx + headerAnchor.length;
  // find the end of the table: the first line after tableStart that does NOT start with "|"
  const lines = content.slice(tableStart).split(eol);
  let lastRowEnd = tableStart; // offset within content, running total
  let cursor = tableStart;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0 && line === '') { cursor += eol.length; continue; } // blank line right after header separator, skip
    if (line.indexOf('|') !== 0) break;
    cursor += line.length + eol.length;
    lastRowEnd = cursor;
  }
  const row =
    '| ' + cfg.label + ' | `' + cfg.key + '` | ' + cfg.description + ' | new | `style/pos-' + cfg.key +
    '.css` | `tokens/components/' + cfg.key + '.json` | `#comp-section-' + cfg.key + '` |' + eol;
  const next = content.slice(0, lastRowEnd) + row + content.slice(lastRowEnd);
  plan.push({ file, content: next, label: 'COMPONENTS.md (+inventory row, appended at end of table)' });
}

/* ---------------------------------------------------------------------- */
/* 6. comp-configs.ts (COMP_CONFIGS entry) + apply-status.ts (handler)    */
/*                                                                        */
/* Rewritten 2026-09-19: the docs-site JS moved from one hand-edited      */
/* monolith to real TypeScript, compiled by Rollup. COMP_CONFIGS now      */
/* lives in comp-configs.ts, and per-component status simulation is a     */
/* named `applyStatus_<Key>` function registered in apply-status.ts's     */
/* STATUS_HANDLERS dispatch table (not an if/return ladder any more) —    */
/* Run `npm run build`                                                   */
/* after this script for either edit to actually reach the shipped file.  */
/* ---------------------------------------------------------------------- */

function jsStringArray(arr, indent, eol) {
  if (!arr.length) return '[]';
  const pad = ' '.repeat(indent);
  return '[' + eol + arr.map(function (s) { return pad + '  ' + JSON.stringify(s) + ','; }).join(eol) + eol + pad + ']';
}

function buildCompConfigEntry(cfg, eol) {
  const ind = '    ';
  const lines = [];
  // always quote the key — cfg.key routinely contains hyphens (e.g. 'control-icons',
  // 'text-input'), which is invalid as a bare object-literal key; quoting is always valid
  // whether or not it's strictly required, so there's no reason to special-case unhyphenated
  // keys (a pre-existing bug, found 2026-09-19 while testing this script after the TS move —
  // never previously hit because no hyphenated key had actually been run through it for real).
  lines.push(ind + JSON.stringify(cfg.key) + ': {');
  lines.push(ind + '  name: ' + JSON.stringify(cfg.label) + ',');
  lines.push(ind + '  controls: ' + JSON.stringify(cfg.controls) + ',');
  lines.push(ind + '  states: ' + JSON.stringify(cfg.states) + ',');
  lines.push(ind + '  tokens: [],');
  lines.push(ind + '  usage: {');
  lines.push(ind + '    useWhen: ' + jsStringArray(cfg.useWhen, 8, eol) + ',');
  lines.push(ind + '    avoidWhen: ' + jsStringArray(cfg.avoidWhen, 8, eol) + ',');
  lines.push(ind + '    do: ' + jsStringArray(cfg.do, 8, eol) + ',');
  lines.push(ind + '    dont: ' + jsStringArray(cfg.dont, 8, eol) + ',');
  if (cfg.accessibility.length) {
    lines.push(ind + '    accessibility: ' + jsStringArray(cfg.accessibility, 8, eol) + ',');
  }
  lines.push(ind + '  },');
  lines.push(ind + '},');
  return lines.join(eol);
}

/* comp-configs.ts's `export var COMP_CONFIGS: Record<string, any> = { ... };` is the last
   thing in the file — this exact tail (last variant's closing `},` immediately followed by
   the object's own closing `};`) is unique and anchors the insertion point regardless of
   which component happens to be last today. */
function planCompConfigsTs(cfg, plan) {
  const file = path.join(ROOT, 'src', 'js', 'styleguide-component-page', 'comp-configs.ts');
  const content = fs.readFileSync(file, 'utf8');
  const eol = detectEOL(content);
  const anchor = eol + '    },' + eol + '  };';
  const idx = findUnique(content, anchor, 'comp-configs.ts COMP_CONFIGS closing brace');
  const insertAt = idx + (eol + '    },').length;
  const entry = eol + buildCompConfigEntry(cfg, eol);
  const next = content.slice(0, insertAt) + entry + content.slice(insertAt);
  plan.push({ file, content: next, label: 'comp-configs.ts (+COMP_CONFIGS entry)' });
}

function toCamelKey(key) {
  return key.replace(/-([a-z0-9])/g, function (_, c) { return c.toUpperCase(); });
}

function buildApplyStatusHandler(cfg, eol) {
  const interactiveStates = cfg.states.filter(function (s) { return s !== 'normal'; });
  if (!interactiveStates.length) return null; // no interactive states — nothing to simulate
  const sel = cfg.rootSelector;
  const funcName = 'applyStatus_' + toCamelKey(cfg.key);
  const varName = cfg.key.replace(/-/g, '_');
  const debugRemovals = interactiveStates
    .filter(function (s) { return s !== 'disabled'; })
    .map(function (s) { return "'pos-debug-" + cfg.key + '-' + s + "'"; })
    .join(', ');
  const caseLines = interactiveStates
    .map(function (s) {
      if (s === 'disabled') return "          case 'disabled': el.setAttribute('disabled', ''); break;";
      return "          case '" + s + "': el.classList.add('pos-debug-" + cfg.key + '-' + s + "'); break;";
    })
    .join(eol);
  const functionCode = [
    '  /* ' + cfg.key + ' — generated by scripts/generate-component.js */',
    '  export function ' + funcName + '(status: string): void {',
    '    var ' + varName + 'Stage = getActivePreviewStage();',
    '    if (' + varName + 'Stage) {',
    '      ' + varName + "Stage.querySelectorAll<HTMLElement>('" + sel + "').forEach(function (el) {",
    debugRemovals ? '        el.classList.remove(' + debugRemovals + ');' : '',
    "        el.removeAttribute('disabled');",
    '        switch (status) {',
    caseLines,
    '        }',
    '      });',
    '      ' + varName + 'Stage.dataset.status = status;',
    '    }',
    '  }',
  ].filter(Boolean).join(eol);
  const registryLine = "    '" + cfg.key + "': " + funcName + ',';
  return { funcName, functionCode, registryLine };
}

/* apply-status.ts's `export var STATUS_HANDLERS: Record<...> = { ... };` is the last thing in
   the file — its closing `\n  };` is unique (confirmed empirically, not assumed) regardless of
   which component is currently registered last. The new handler function is inserted right
   before the `export var STATUS_HANDLERS` declaration itself (also a unique anchor), and its
   registry line right before that same closing brace. */
function planApplyStatusTs(cfg, plan) {
  const interactiveStates = cfg.states.filter(function (s) { return s !== 'normal'; });
  if (!interactiveStates.length) return null; // no interactive states — nothing to register

  const file = path.join(ROOT, 'src', 'js', 'styleguide-component-page', 'apply-status.ts');
  let content = fs.readFileSync(file, 'utf8');
  const eol = detectEOL(content);
  const built = buildApplyStatusHandler(cfg, eol);

  const handlersAnchor = eol + '  export var STATUS_HANDLERS: Record<string, (status: string) => void> = {';
  const hIdx = findUnique(content, handlersAnchor, 'apply-status.ts STATUS_HANDLERS declaration');
  content = content.slice(0, hIdx) + eol + built.functionCode + content.slice(hIdx);

  const closeAnchor = eol + '  };';
  // re-find after the insertion above shifted offsets — still expected to be unique (the
  // function body just inserted uses `if (...) { ... }`/`switch` blocks indented deeper than
  // 2 spaces, so it cannot introduce a second top-level `\n  };`).
  const cIdx = content.lastIndexOf(closeAnchor);
  if (cIdx === -1 || content.indexOf(closeAnchor) !== cIdx) {
    fail('apply-status.ts STATUS_HANDLERS closing brace anchor is missing or not unique after inserting the new handler function — refusing to guess.');
  }
  content = content.slice(0, cIdx) + eol + built.registryLine + content.slice(cIdx);

  plan.push({ file, content, label: 'apply-status.ts (+' + built.funcName + ' handler, +STATUS_HANDLERS entry)' });
  return built;
}

/* ---------------------------------------------------------------------- */
/* 7. styleguide.css — debug-class stubs for simulated hover/focus        */
/* ---------------------------------------------------------------------- */

function planDebugCss(cfg, plan) {
  const interactive = cfg.states.filter(function (s) { return s !== 'normal' && s !== 'disabled'; });
  if (!interactive.length) return;
  const file = path.join(MOD, 'assets', 'style-guide', 'styleguide.css');
  const content = fs.readFileSync(file, 'utf8');
  const eol = detectEOL(content);
  const stub = interactive
    .map(function (s) {
      return (
        '.pos-' + cfg.key + '.pos-debug-' + cfg.key + '-' + s + ' {' + eol +
        '  /* TODO: mirror the real :' + (s === 'hover' ? 'hover' : 'focus-visible') + ' rule in pos-' + cfg.key + '.css exactly */' + eol +
        '}'
      );
    })
    .join(eol + eol);
  const appended =
    content.replace(/\s*$/, '') + eol + eol +
    '/* ' + cfg.key + ' — debug classes for simulated interaction states (generate-component.js) */' + eol +
    stub + eol;
  plan.push({ file, content: appended, label: 'styleguide.css (+debug-class stubs)' });
}

/* ---------------------------------------------------------------------- */
/* 8. token-panel.ts — get<Key>VariantSections() stub (multiVariant only) */
/*                                                                        */
/* Scaffolds the SHAPE only — reading the real active variant off the     */
/* live preview DOM is genuinely component-specific (see the real         */
/* getTagVariantSections/getButtonVariantSections for how varied that     */
/* logic is) and stays a manual fill-in, marked with a TODO.              */
/* ---------------------------------------------------------------------- */

function toPascalKey(key) {
  const camel = toCamelKey(key);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function buildVariantSectionsStub(cfg, eol) {
  const funcName = 'get' + toPascalKey(cfg.key) + 'VariantSections';
  return [
    '  /* ' + cfg.key + ' — scaffolded by scripts/generate-component.js (--multiVariant). TODO: resolve',
    '     the real active variant from the live preview DOM (see getTagVariantSections or',
    '     getButtonVariantSections above for the pattern) instead of the hardcoded \'default\' key. */',
    '  export function ' + funcName + '(status: string): DisplaySection[] | null {',
    "    var spec = COMPONENT_SPECS['" + cfg.key + "'];",
    '    if (!spec) return null;',
    "    var stage = document.getElementById('comp-" + cfg.key + "-preview') || getActivePreviewStage();",
    '    if (!stage) return null;',
    '    // TODO: derive the real variant key from the live DOM (a class/data-attribute on the',
    "    //   visible preview element), not this hardcoded 'default'.",
    "    var key = 'default';",
    '    var variant = spec.variants[key];',
    '    if (!variant) return null;',
    '    var stateData = variant.states[status] || variant.states.normal;',
    '    if (!stateData) return null;',
    '    return resolveSections(stateData.sections, spec.shared, false);',
    '  }',
  ].join(eol);
}

/* renderTokenPanel()'s final `else if (COMPONENT_SPECS[state.comp])` is the generic-path
   fallback every component eventually reaches if it has no bespoke branch above it — a
   unique, stable anchor to insert a new bespoke branch immediately before, so it's tried
   before the generic path can shadow it. */
function planTokenPanelStub(cfg, plan) {
  const file = path.join(ROOT, 'src', 'js', 'styleguide-component-page', 'token-panel.ts');
  let content = fs.readFileSync(file, 'utf8');
  const eol = detectEOL(content);
  const funcName = 'get' + toPascalKey(cfg.key) + 'VariantSections';

  const funcAnchor = eol + '  export function renderTokenPanel(status: string, size: string): void {';
  const fIdx = findUnique(content, funcAnchor, 'token-panel.ts renderTokenPanel() declaration (stub-insertion point)');
  const stub = buildVariantSectionsStub(cfg, eol);
  content = content.slice(0, fIdx) + eol + stub + eol + content.slice(fIdx);

  const dispatchAnchor = eol + "    } else if (COMPONENT_SPECS[state.comp]) {";
  const dIdx = findUnique(content, dispatchAnchor, 'token-panel.ts renderTokenPanel() generic-path fallback branch');
  const branch =
    eol + "    } else if (state.comp === '" + cfg.key + "' && COMPONENT_SPECS['" + cfg.key + "']) {" +
    eol + '      sections = ' + funcName + '(status);' +
    eol + '      if (!sections) return;';
  content = content.slice(0, dIdx) + branch + content.slice(dIdx);

  plan.push({ file, content, label: 'token-panel.ts (+' + funcName + '() stub, +renderTokenPanel() dispatch branch)' });
}

/* ---------------------------------------------------------------------- */
/* Preview / control-panel HTML — printed, not written (genuine content)  */
/* ---------------------------------------------------------------------- */

/* The shared "State" control panel (one global grid of data-status-btn buttons, reused by
   every component via applyStatus()'s dispatch table) already covers every state name any
   component has ever needed — normal/hover/focus/active/visited/disabled/selected/
   selected-disabled/loading/filled/display-only, confirmed by reading component-template.liquid
   directly rather than assumed. A brand-new state name is the rare case, not the common one, so
   this checks reality instead of always printing a "paste a control panel" instruction that in
   practice is almost never needed. */
function checkSharedStateControlCoverage(cfg) {
  if (cfg.controls.indexOf('state') === -1) return null;
  const file = path.join(MOD, 'views', 'pages', 'style-guide', 'component-template.liquid');
  const content = fs.readFileSync(file, 'utf8');
  const existing = new Set((content.match(/data-status-btn="([a-z0-9-]+)"/g) || [])
    .map(function (m) { return m.slice('data-status-btn="'.length, -1); }));
  const missing = cfg.states.filter(function (s) { return !existing.has(s); });
  return missing;
}

function printManualSteps(cfg) {
  const missingStates = checkSharedStateControlCoverage(cfg);
  if (missingStates && missingStates.length) {
    console.log('\n--- Shared "State" control panel is missing button(s) for: ' + missingStates.join(', ') + ' ---');
    console.log('Add a <button type="button" class="pos-tile-btn" data-status-btn="' + missingStates[0] + '">' + missingStates[0] + '</button> (one per missing state) to the single shared control panel in component-template.liquid — do not create a second, per-component one.');
  } else if (missingStates) {
    console.log('\n--- Shared "State" control panel already covers every state this config lists — nothing to add. ---');
  }

  console.log('\n--- Remaining manual work (genuinely component-specific, not automatable) ---');
  console.log('1. Write the real CSS in style/pos-' + cfg.key + '.css (replace every TODO with real tokens).');
  console.log('2. Fill in the real token data in tokens/components/' + cfg.key + '.json (replace every TODO token), then re-run this script (or RULES.md §6\'s regen snippet) to refresh spec-' + cfg.key + '.liquid.');
  console.log('3. Fill in the debug-class stubs in styleguide.css to mirror the real :hover/:focus-visible rules.');
  console.log('4. Replace the TODO placeholder markup in the preview section this script already inserted into component-template.liquid.');
  if (cfg.multiVariant) {
    console.log('5. Fill in the real variant-resolution logic in get' + toPascalKey(cfg.key) + 'VariantSections() (token-panel.ts) — the stub this script wrote always resolves to \'default\'.');
  }
  console.log((cfg.multiVariant ? '6' : '5') + '. Run `node scripts/generate-component.js --status ' + cfg.key + '` to see everything still outstanding, then verify live (RULES.md §6.3 checklist) before removing the "new"/"review" badge.');
}

/* ---------------------------------------------------------------------- */
/* --status <key> — consolidated "what's left" scan                       */
/*                                                                        */
/* Grounded in actually reading each file's current content, not a static */
/* template — reflects real progress (e.g. stops listing "fill in the     */
/* CSS" the moment that file's TODOs are actually gone). Covers the same  */
/* ground as .claude/commands/create-component.md's Step 8 checklist.     */
/* ---------------------------------------------------------------------- */

function lineOf(content, index) {
  return content.slice(0, index).split(/\r\n|\n/).length;
}

function findTodoLines(content, pattern) {
  const lines = [];
  let m;
  const re = new RegExp(pattern, 'g');
  while ((m = re.exec(content)) !== null) {
    lines.push(lineOf(content, m.index));
  }
  return lines;
}

function runStatusCheck(key) {
  const items = []; // { done: bool, text: string }

  function check(label, filePathAbs, testFn) {
    if (!fs.existsSync(filePathAbs)) {
      items.push({ done: false, text: label + ' — file does not exist: ' + path.relative(ROOT, filePathAbs) });
      return;
    }
    const content = fs.readFileSync(filePathAbs, 'utf8');
    const rel = path.relative(ROOT, filePathAbs);
    testFn(content, rel);
  }

  const cssPath = path.join(MOD, 'assets', 'style', 'pos-' + key + '.css');
  check('CSS', cssPath, function (content, rel) {
    const lines = findTodoLines(content, 'TODO');
    if (lines.length) items.push({ done: false, text: 'Real CSS values — ' + lines.length + ' TODO marker(s) left in ' + rel + ':' + lines.join(',') });
    else items.push({ done: true, text: 'Real CSS values — no TODO markers left in ' + rel });
  });

  const jsonPath = path.join(MOD, 'assets', 'tokens', 'components', key + '.json');
  check('Token data', jsonPath, function (content, rel) {
    // Search only from the "component" field onward — the "_about" field's own prose
    // legitimately contains the word "TODO" (describing what to do with the placeholders
    // below), which is not itself a placeholder and must not be flagged as one.
    const bodyStart = content.indexOf('"component":');
    const body = bodyStart === -1 ? content : content.slice(bodyStart);
    const offset = bodyStart === -1 ? 0 : lineOf(content, bodyStart) - 1;
    const lines = findTodoLines(body, 'TODO').map(function (l) { return l + offset; });
    if (lines.length) items.push({ done: false, text: 'Real token data — ' + lines.length + ' TODO marker(s) left in ' + rel + ':' + lines.join(',') });
    else items.push({ done: true, text: 'Real token data — no TODO markers left in ' + rel });
  });

  const specPath = path.join(MOD, 'views', 'partials', 'style-guide', 'spec-' + key + '.liquid');
  if (fs.existsSync(jsonPath) && fs.existsSync(specPath)) {
    const j = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const specContent = fs.readFileSync(specPath, 'utf8');
    const m = specContent.match(/\{% raw %\}\r?\n([\s\S]*)\r?\n\{% endraw %\}/);
    const inSync = m && JSON.stringify(JSON.parse(m[1])) === JSON.stringify(j);
    items.push(inSync
      ? { done: true, text: 'spec-' + key + '.liquid is in sync with ' + key + '.json' }
      : { done: false, text: 'spec-' + key + '.liquid is STALE — re-run this script or RULES.md §6.4\'s regen snippet' });
  }

  const cssGuidePath = path.join(MOD, 'assets', 'style-guide', 'styleguide.css');
  check('Debug-class stubs', cssGuidePath, function (content, rel) {
    const marker = '/* ' + key + ' — debug classes for simulated interaction states (generate-component.js) */';
    const blockIdx = content.indexOf(marker);
    if (blockIdx === -1) {
      items.push({ done: true, text: 'Debug-class stubs — none generated (component has no hover/focus states)' });
      return;
    }
    const nextBlock = content.indexOf('/*', blockIdx + marker.length);
    const block = content.slice(blockIdx, nextBlock === -1 ? undefined : nextBlock);
    const lines = findTodoLines(content, 'TODO').filter(function (l) { return l >= lineOf(content, blockIdx) && l <= lineOf(content, blockIdx + block.length); });
    if (lines.length) items.push({ done: false, text: 'Debug-class stubs — ' + lines.length + ' TODO marker(s) left in ' + rel + ':' + lines.join(',') });
    else items.push({ done: true, text: 'Debug-class stubs — filled in, ' + rel });
  });

  const templatePath = path.join(MOD, 'views', 'pages', 'style-guide', 'component-template.liquid');
  check('Preview markup', templatePath, function (content, rel) {
    // Scope the TODO search to THIS component's own section only — a global first-match
    // search would find a different, still-unfinished component's placeholder instead (or
    // miss this one entirely if a different placeholder happens to appear first in the file).
    const sectionStart = content.indexOf('data-comp-key="' + key + '"');
    if (sectionStart === -1) {
      items.push({ done: false, text: 'Preview markup — no <section data-comp-key="' + key + '"> found in ' + rel + ' at all' });
      return;
    }
    const sectionCloseMarker = '</section><!-- /#comp-section-' + key + ' -->';
    const sectionEnd = content.indexOf(sectionCloseMarker, sectionStart);
    const section = sectionEnd === -1 ? content.slice(sectionStart, sectionStart + 2000) : content.slice(sectionStart, sectionEnd);
    if (section.indexOf('TODO(generate-component.js)') !== -1) {
      items.push({ done: false, text: 'Preview markup — still the generator\'s placeholder, ' + rel + ':' + lineOf(content, sectionStart) });
    } else {
      items.push({ done: true, text: 'Preview markup — real markup present in ' + rel });
    }
  });

  const overviewPath = path.join(MOD, 'views', 'pages', 'style-guide', 'overview.liquid');
  check('Overview tile', overviewPath, function (content, rel) {
    const idx = content.indexOf('#comp-section-' + key + '"');
    if (idx === -1) items.push({ done: false, text: 'Overview tile — no feature-card tile links to #comp-section-' + key + ' in ' + rel + ' (this script does not add it, RULES.md §6 Step 5)' });
    else items.push({ done: true, text: 'Overview tile — present, ' + rel + ':' + lineOf(content, idx) });
  });

  const dsIndexPath = path.join(MOD, 'assets', 'tokens', 'ds-index.json');
  check('ds-index.json entry', dsIndexPath, function (content, rel) {
    const idx = content.indexOf('"' + key + '": {');
    if (idx === -1) items.push({ done: false, text: 'ds-index.json — no "' + key + '" entry (RULES.md §6 Step 7)' });
    else items.push({ done: true, text: 'ds-index.json — entry present, ' + rel + ':' + lineOf(content, idx) });
  });

  const navPath = path.join(MOD, 'views', 'partials', 'style-guide', 'nav-left.liquid');
  check('Nav badge', navPath, function (content, rel) {
    const re = new RegExp('#comp-section-' + key + '"[^}]*"badge":\\s*"([a-z]+)"');
    const m = content.match(re);
    if (!m) items.push({ done: null, text: 'Nav badge — no "badge" field (treated as fully published, no badge shown)' });
    else items.push({ done: null, text: 'Nav badge — currently "' + m[1] + '" (' + (m[1] === 'review' ? 'still pending human review' : m[1] === 'new' ? 'published as new' : 'check RULES.md §6.2 for the intended badge lifecycle') + ')' });
  });

  check('COMPONENTS.md status', path.join(ROOT, 'COMPONENTS.md'), function (content, rel) {
    const re = new RegExp('\\| ([a-z]+) \\| `style/pos-' + key + '\\.css`');
    const m = content.match(re);
    if (!m) items.push({ done: null, text: 'COMPONENTS.md — no row found for pos-' + key + '.css' });
    else items.push({ done: null, text: 'COMPONENTS.md status — currently `' + m[1] + '`' });
  });

  console.log('=== --status ' + key + ' ===\n');
  const outstanding = items.filter(function (i) { return i.done === false; });
  const info = items.filter(function (i) { return i.done === null; });
  const complete = items.filter(function (i) { return i.done === true; });
  if (outstanding.length) {
    console.log('OUTSTANDING (' + outstanding.length + '):');
    outstanding.forEach(function (i) { console.log('  [ ] ' + i.text); });
    console.log('');
  } else {
    console.log('Nothing outstanding in the automatically-checkable items below.\n');
  }
  console.log('DONE:');
  complete.forEach(function (i) { console.log('  [x] ' + i.text); });
  console.log('\nINFO (not a pass/fail — human judgment, e.g. review status):');
  info.forEach(function (i) { console.log('  · ' + i.text); });
  console.log('\nNot checked here — no reliable file signal (see RULES.md §6.2/.claude/commands/create-component.md Step 8):');
  console.log('  · REVIEW-PERSONAS.md "Component Spec / Tokens Panel QA Reviewer" run + passed');
  console.log('  · Icon registry / foundations gallery updated, if this component introduces any new icon');
  console.log('  · Visual/manual verification (renders correctly, controls switch variants, nav scrolls correctly)');
}

/* ---------------------------------------------------------------------- */
/* Main                                                                    */
/* ---------------------------------------------------------------------- */

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.status) {
    runStatusCheck(args.status);
    return;
  }
  if (!args.config) fail('Usage: node scripts/generate-component.js --config path/to/component.config.json [--dry-run]\n   or: node scripts/generate-component.js --status <key>');
  const cfg = readJSONConfig(path.resolve(args.config));

  const cssPath = path.join(MOD, 'assets', 'style', 'pos-' + cfg.key + '.css');
  const jsonPath = path.join(MOD, 'assets', 'tokens', 'components', cfg.key + '.json');

  if (fs.existsSync(jsonPath)) {
    fail('tokens/components/' + cfg.key + '.json already exists — this component may already be scaffolded. Refusing to overwrite; delete it first if you really want to re-scaffold.');
  }

  const plan = [];

  // New files (only if they don't already exist)
  const newFiles = [];
  if (!fs.existsSync(cssPath)) {
    newFiles.push({ file: cssPath, content: buildCssSkeleton(cfg), label: 'pos-' + cfg.key + '.css (new)' });
  }
  newFiles.push({ file: jsonPath, content: JSON.stringify(buildSpecJson(cfg), null, 2) + '\n', label: cfg.key + '.json (new)' });

  // Edits to shared files
  planCssLink(cfg, plan);
  planComponentTemplateEdits(cfg, plan);
  planNavEntry(cfg, plan);
  planComponentsMd(cfg, plan);
  planCompConfigsTs(cfg, plan);
  planApplyStatusTs(cfg, plan);
  planDebugCss(cfg, plan);
  if (cfg.multiVariant) planTokenPanelStub(cfg, plan);

  console.log('=== generate-component.js: ' + cfg.key + ' ===\n');
  newFiles.forEach(function (f) { console.log('CREATE  ' + path.relative(ROOT, f.file)); });
  plan.forEach(function (f) { console.log('EDIT    ' + f.label); });

  if (args.dryRun) {
    console.log('\n--dry-run: no files written.');
    printManualSteps(cfg);
    return;
  }

  newFiles.forEach(function (f) {
    fs.mkdirSync(path.dirname(f.file), { recursive: true });
    fs.writeFileSync(f.file, f.content, 'utf8');
  });
  plan.forEach(function (f) { fs.writeFileSync(f.file, f.content, 'utf8'); });

  // Always (re)generate the spec partial last, from the JSON just written.
  const spec = regenSpecPartial(cfg.key);
  fs.mkdirSync(path.dirname(spec.specPath), { recursive: true });
  fs.writeFileSync(spec.specPath, spec.out, 'utf8');
  console.log('CREATE  ' + path.relative(ROOT, spec.specPath));

  console.log('\nDone. ' + (newFiles.length + plan.length + 1) + ' files created/edited.');
  printManualSteps(cfg);
}

main();
