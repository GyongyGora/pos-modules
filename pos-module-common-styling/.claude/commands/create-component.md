# Create Component

Create a new design system component end-to-end, following `RULES.md` §6's current 4-step, script-based workflow.

**Argument:** `$ARGUMENTS` — component name (e.g. `button`, `tag`, `collapsible`)

**This command wraps `RULES.md` §6.0 — read that section first if anything here seems to conflict with it; `RULES.md` is the authority, this file is the runnable checklist.** §6.1 in the same file is the manual checklist (what the scripts do), kept for debugging an existing component — do not follow it for a new one.

**"Not automated" (Step 2/3's lists below) means the *generator script* doesn't write it — it does not mean leave it for the human.** The assistant completes every one of those items itself, for real, before handing the component back for review: real CSS using real DS tokens (never a hardcoded value, never a guessed Figma mapping — `RULES.md` §6.4), real Usage-tab content, real per-variant/per-state token data, real preview markup, variant toggles wired if the component has more than one variant. `"badge": "new"` means "complete, awaiting human sign-off," not "half-done, human finishes it." The human reviews the result and gives *feedback* (add a variant, fix a token, expand the usage text) — they do not do the first pass.

**Variant scope, when not specified by the user:** build exactly **one** variant, unless the component has an unavoidable, obvious state need (e.g. a toggle control needs both "on" and "off" to mean anything) — in that case include that minimal set, nothing speculative beyond it. If the user's request names specific variants up front, build all of them in the same pass: real CSS per variant, the variant's toggle button wired into the control panel, and its token data in the spec JSON — not a subset with the rest left as TODO.

---

## Before starting

1. Read `modules/common-styling/public/assets/tokens/ds-index.json` — full DS overview: existing components, tokens, spacing, constraints.
2. Check `COMPONENTS.md` — if the component already exists with status `new` or `done`, stop and notify the user.
3. Check `modules/common-styling/public/assets/style/` — if `pos-<component>.css` already exists, stop and notify the user.

---

## Step 1 — Gather design intent

The input can be any of three forms — determine which was given and follow the matching path. Whichever path, the *output* requirement is the same: a fully complete component (see the completeness note above), not a partial draft.

**A. Figma URL provided, or the component exists in the DS file (`7LdPQ5BEpKgFvxqnjvwH5b`, internal use only; access required):**
1. Call `figma_get_component_for_development` for the component node.
2. If the response is too large, call `figma_get_design_system_summary` first, then re-fetch only the required node(s).
3. Call `figma_take_screenshot` for each variant being implemented.
4. Download any required SVG/image assets from the Figma assets endpoint. Use localhost sources directly.
5. Token values come directly from Figma's own variables/styles where present — this is priority 2 in the token-selection order (Step 3 below), below only an explicit instruction in the user's request.

**B. Inspiration image (a screenshot or reference image of the component, not a whole page):**
1. Read the image carefully — shape, layout, spacing, apparent states shown (if the image shows e.g. a hovered/disabled look, treat that as a requested variant per the scope rule above, not something to ignore).
2. Do **not** treat this as a whole-page composition task (that's `/insp-to-code`, a different, page-level workflow — don't reuse its "assemble from existing components" framing here). The image describes what *this one new component* should look like.
3. Map every visual detail (color, spacing, radius, shadow, typography) to a real DS token using the priority order in Step 3 below — an inspiration image never justifies a hardcoded value or an invented token; if something in the image doesn't cleanly match any existing token, flag it explicitly rather than guessing.

**C. Text/prompt description only (no Figma, no image):**
1. Design the component directly from the description, following existing DS patterns for similar components (check `ds-index.json` and a couple of comparable existing components' CSS/spec JSON for conventions to match — spacing scale, state coverage, naming) so the result feels consistent with the rest of the system, not bespoke.
2. Anything the description leaves ambiguous (e.g. it doesn't say whether the component needs a disabled state): apply the variant-scope default above (minimal, obvious-only) rather than asking, unless the ambiguity is about something structural/irreversible (see the general "ask when genuinely blocked" guidance) rather than a normal design judgment call.

If none of the three applies (no Figma, no image, no real description to work from): ask the user rather than silently modeling the new component after an unrelated existing one. (See `RULES.md` §9.1 — code-based is the default; Figma is only used on explicit request or when a Figma URL is actually given.)

---

## Step 2 — Write the component config and run the generator

1. Write one config file describing the component — see `scripts/component.config.example.json` for the full shape (`key`, `label`, `description`, `navGroup`, `badge`, `rootSelector`, `states`, `controls`, and the usage content as arrays: `useWhen`/`avoidWhen`/`do`/`dont`/`accessibility`, plus `composedOf`, `props`, `usageExample`). This is the **only** place usage content is authored — the script copies it verbatim into both the spec JSON and `COMP_CONFIGS[key].usage`.
2. Run `node scripts/generate-component.js --config <path> --dry-run` first and review the planned changes.
3. Run `node scripts/generate-component.js --config <path>` for real.

This single run creates/edits (idempotent — skips any file that already exists, except `spec-<key>.liquid`, which is always regenerated):
- `style/pos-<key>.css` (new skeleton, `TODO` stubs)
- `tokens/components/<key>.json` (new skeleton, full schema, `TODO` placeholder token)
- `partials/style-guide/spec-<key>.liquid` (generated from the JSON above)
- `partials/init.liquid` (+1 CSS `<link>`)
- `pages/style-guide/component-template.liquid` (+1 spec render include, **+1 preview-section skeleton** auto-inserted right after the last existing section in the same nav group — same placement rule as the nav entry below, so nav order and section order can't drift apart)
- `partials/style-guide/nav-left.liquid` (+1 nav entry)
- `COMPONENTS.md` (+1 inventory row)
- `src/js/styleguide-component-page/comp-configs.ts` (+1 `COMP_CONFIGS` entry) and `src/js/styleguide-component-page/apply-status.ts` (+1 `applyStatus_<Key>` handler + `STATUS_HANDLERS` entry, if the config lists any state beyond `normal`) — **real TypeScript source, compiled by Rollup**; run `npm run build` (or `npm run deploy`/`deploy:dev`) after this script for the change to ship. Never hand-edit `assets/js/styleguide-component-page.js` directly — it's a build artifact.
- `style-guide/styleguide.css` (+debug-class stubs for simulated hover/focus — commented `TODO`, fill in real values matching the component's actual `:hover`/`:focus-visible` CSS)
- `src/js/styleguide-component-page/token-panel.ts` — **only if the config sets `"multiVariant": true`** (see below): a boilerplate `get<Key>VariantSections()` stub + its `renderTokenPanel()` dispatch branch, correct shape but no real variant-resolution logic.

It also **prints** a check of whether the shared "State" control panel already covers every state the config lists (it almost always does — states are one shared, global button grid, not per-component markup) — only prints something to paste if a state name is genuinely missing from it.

**Not automated, by design — genuinely component-specific, not boilerplate:**
- The component's own CSS values (colors, spacing, real interaction states) — the actual design work.
- The component's real token data in the spec JSON.
- Preview markup — the generator inserts the *section*, but its content is still a `TODO(generate-component.js)` placeholder; what the component's demo actually shows is manual.
- The real variant-resolution logic inside a scaffolded `get<X>VariantSections()` for a component whose preview shows multiple visual sub-variants side by side (Chip/Segmented/Tag/Card/Button/Code-style — see `RULES.md` §7). Set `"multiVariant": true` in the config to get the stub scaffolded; filling in how to read the real active variant off the live preview DOM is still manual (see `getTagVariantSections`/`getButtonVariantSections` in `token-panel.ts` for the pattern).
- JS behavior code for a genuinely new interactive module.

**Run `node scripts/generate-component.js --status <key>` any time after scaffolding** to get a single, file:line-precise list of what's still outstanding, grounded in the real current file contents (not a static list) — recommended over manually walking Step 8's checklist below.

---

## Step 3 — Fill in the real CSS and token content

1. Replace the `TODO` stubs in `style/pos-<key>.css` with the real rules:
   - Wrap all styles in `@layer common-styling { }`.
   - `box-sizing: border-box` where needed. No `!important`.
   - Cover every real state: `:hover`, `:focus-visible`, `:active`, `:disabled` as applicable — never skip `:focus-visible`.
   - Never change `border-width` on hover/active — use `box-shadow: inset 0 0 0 <width> <color>` instead.
   - Icon sizes via `--pos-size-icon-s/m/l` only — never hardcode px/rem.
   - Minimum interactive height: 44px (default/large); small variants are desktop-only.
   - Component CSS references semantic tokens directly — **never** create a new `--pos-color-<component>-*` alias layer unless the component is `pos-button` or a form input (`RULES.md` §2.2), or the user has explicitly confirmed a new component-token layer is warranted.
2. Replace the `TODO` placeholder token in `tokens/components/<key>.json` with the real token data — every variant × state's actual sections/tokens, matching the CSS you just wrote. **Never guess a CSS↔Figma mapping** (`RULES.md` §6.4): read the CSS, look up each `--pos-*` name in `tokens/css-to-figma.json` → `map`, and set `"figma": null` (never omit the token, never invent a name) when there's no entry.
   - **Deciding which token a given part of the component should use, in priority order**: (1) an explicit instruction in the user's request (e.g. "the text should use the interactive-text token") always wins; (2) a concrete value already specified in Figma; (3) otherwise, infer from how existing components use tokens (pattern-match similar components, token names/descriptions in `token-map.json`/`css-to-figma.json`) — never invent a plausible-sounding token without going through this order.
3. **Regenerate `spec-<key>.liquid` after every JSON edit** — never hand-edit the `.liquid` file. Use the standalone snippet in `RULES.md` §6.4 (parse-back-validates before writing).
4. Fill in the debug-class stubs the generator appended to `style-guide/styleguide.css`, mirroring the component's real `:hover`/`:focus-visible` CSS exactly (these drive the docs site's manual state-preview toggles).
5. If the component has real runtime behavior beyond CSS, create `assets/js/pos-<key>.js` (module pattern, `RULES.md` §1.6/§6.6) — if it must initialize automatically, add its loader to `init.liquid` (`RULES.md` §6.6), inside the `auto_init_components` block if apps may opt out.

---

## Step 4 — Fill in the real preview markup (and variant-resolution logic, if any)

The generator already inserted the preview-section skeleton into `component-template.liquid` (Step 2) — replace its `<!-- TODO(generate-component.js): real ... markup here -->` placeholder with the real component markup. If the generator reported a state missing from the shared "State" control panel, add that one button there too (never create a second, per-component control panel for it).

**Any control-group section you add (Variant/Size/Orientation/Intent/Options) must follow the canonical order in `RULES.md` §6.7** — only the groups this component actually needs, in that fixed sequence, both in the HTML and in `COMP_CONFIGS[key].controls`. If a control doesn't fit one of §6.7's buckets, flag it and ask rather than guessing where it goes.

If the component's preview shows multiple visual sub-variants side by side (Chip/Segmented/Tag/Card/Button/Code-style, per `RULES.md` §7) rather than one single representative instance, set `"multiVariant": true` in the config (Step 2) so the generator scaffolds a `get<Key>VariantSections()` stub in `src/js/styleguide-component-page/token-panel.ts` — fill in its real variant-resolution logic (resolving the real active variant from the live preview DOM; see `getTagVariantSections`/`getButtonVariantSections` in the same file for the pattern). Remember to `npm run build` afterward — this is compiled TypeScript, not the deployed file directly.

---

## Step 5 — Add to the Overview page (not handled by the generator)

In `modules/common-styling/public/views/pages/style-guide/overview.liquid`, add a feature-card tile for the new component (in the relevant Components/Complex Components section), linking to `/style-guide/component-template#comp-section-<key>` — same pattern as the existing tiles there. This page is hand-maintained, not generated — a new component silently won't appear here otherwise. (Removing a component means removing its tile here too, not just its nav entry.)

---

## Step 6 — New icons (only if this component introduces any)

If the component uses any icon not already in `icon.liquid`, both of these are mandatory in the same pass (`RULES.md` §5.6):
1. `tokens/icon-registry.json` — add the new icon's entry (logical `name`, `purpose`, `tabler` icon name).
2. Run `npm run build:icons` — it regenerates `icon.liquid`.

---

## Step 7 — Update ds-index.json (not handled by the generator)

Add the component entry to `modules/common-styling/public/assets/tokens/ds-index.json`: name, class, element, variants, states, status, file paths, Figma URL.

---

## Step 8 — Validate

**Run `node scripts/generate-component.js --status <key>` first** — a single, file:line-precise list of what's still outstanding across every file this workflow touches, grounded in real file contents. Clear its OUTSTANDING list before moving on to the checks below (it doesn't cover everything — REVIEW-PERSONAS and live/visual verification still need the manual steps further down).

**Run `/check-tokens <component>` before marking done.** Fix all violations first.

**Then run `REVIEW-PERSONAS.md`'s "Component Spec / Tokens Panel QA Reviewer" — mandatory, not optional** (`RULES.md` self-audit checklist item 10). This is the forcing function that catches exactly the class of bug that used to slip through: swatches decided wrong, a missing Intent×State combination silently showing another state's tokens, a nested component's tokens duplicated instead of declared via `composedOf`, a `role` field dropped by a display mapper, State controls left clickable for a variant with no such state. A `Pass` verdict from that persona is a precondition for reporting this task done.

Then confirm the full checklist:
- [ ] `/check-tokens` — zero violations (or each deviation documented)
- [ ] `REVIEW-PERSONAS.md`'s "Component Spec / Tokens Panel QA Reviewer" run and passed
- [ ] visual layout pass (`ui-design-review` step 4: render at desktop and narrow width, screenshot, measure) — nothing overlaps or touches, rows align, spacing follows the hierarchy, no sideways page scroll — on the docs preview, every variant and state
- [ ] `ui-design-review`, `a11y-review` and `frontend-review` applied (or the `ds-guard` agent run); findings reported to the user before calling it done
- [ ] Every color, spacing, radius, shadow references a CSS custom property — no hardcoded values
- [ ] All interactive states covered (`:hover`, `:focus-visible`, `:active`, `:disabled`, as applicable)
- [ ] Spec JSON (`tokens/components/<key>.json`) and `spec-<key>.liquid` are byte-identical (parse-back check, `RULES.md` §6.4)
- [ ] Only tokens with a real Figma name have a non-null `figma` field; everything else explicitly `"figma": null`, never omitted
- [ ] `COMP_CONFIGS` entry present with the correct controls list; bespoke `get<X>VariantSections()` written if the component has multiple visual sub-variants (§7)
- [ ] **Toggles verified functionally correct, not just visually present** — clicking each Variant/State toggle actually updates the Tokens panel to that variant/state's real, correct token data (test it live, don't assume the resolver logic is right because it compiles)
- [ ] **Page doesn't overflow at the top** — scroll to the new section and confirm content starts where expected, nothing is clipped by a sticky header or an `overflow: hidden` ancestor
- [ ] **Tile-button group order matches logical intent, left→right** — for any group of tile buttons (variant/option selection), the visual order must match the options' logical order (e.g. left = off/none, right = on/active), not just alphabetical or insertion order
- [ ] CSS `<link>` added to `init.liquid`
- [ ] Preview section + control panel added to `component-template.liquid`
- [ ] Nav entry added to `nav-left.liquid`
- [ ] Feature-card tile added to `overview.liquid`
- [ ] New icons (if any) added to `icon-registry.json` and `npm run build:icons` run
- [ ] `ds-index.json` updated
- [ ] `COMPONENTS.md` entry shows `new`; nav entry has `"badge": "new"` (after human review → status `done`, nav badge removed)

---

## Output

When complete, print:

```
✓ Component created: pos-<name>

Files written by scripts/generate-component.js:
  modules/common-styling/public/assets/style/pos-<name>.css
  modules/common-styling/public/assets/tokens/components/<name>.json
  modules/common-styling/public/views/partials/style-guide/spec-<name>.liquid
  modules/common-styling/public/views/partials/init.liquid (updated)
  modules/common-styling/public/views/pages/style-guide/component-template.liquid (updated — spec include + preview-section skeleton)
  modules/common-styling/public/views/partials/style-guide/nav-left.liquid (updated)
  COMPONENTS.md (updated)
  src/js/styleguide-component-page/comp-configs.ts (updated)
  src/js/styleguide-component-page/apply-status.ts (updated)
  modules/common-styling/public/assets/style-guide/styleguide.css (updated)
  src/js/styleguide-component-page/token-panel.ts (updated, only if "multiVariant": true)

Filled in / written by hand:
  Real CSS content in pos-<name>.css
  Real token data in <name>.json (+ regenerated spec-<name>.liquid)
  modules/common-styling/public/assets/js/pos-<name>.js        (if interactive)
  Real preview markup replacing the TODO placeholder in component-template.liquid
  Real variant-resolution logic in get<Key>VariantSections() (token-panel.ts, if "multiVariant": true)
  modules/common-styling/public/views/pages/style-guide/overview.liquid (updated)
  modules/common-styling/public/assets/tokens/icon-registry.json (if new icons)
  modules/common-styling/public/views/pages/style-guide/foundations/icons.liquid (if new icons)
  modules/common-styling/public/assets/tokens/ds-index.json (updated)

Run `npm run build` (or `npm run deploy`/`deploy:dev`) so the compiled .ts changes actually ship.

Next step: run `node scripts/generate-component.js --status <name>` to confirm nothing's outstanding,
then human review → set COMPONENTS.md status to "done", remove the nav "new" badge
```
