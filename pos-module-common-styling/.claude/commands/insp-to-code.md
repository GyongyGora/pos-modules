# Inspiration to Code

Analyze a reference image and implement the UI in code using DS components, tokens, and conventions.

**Argument:** `$ARGUMENTS` — optional file path to the reference image. If omitted, use the most recently shared image in the conversation.

---

## Before starting

1. Read `modules/common-styling/public/assets/tokens/ds-index.json` — full DS overview: available components, tokens, spacing, constraints.
2. Read `modules/common-styling/public/assets/tokens/css-to-figma.json` → `map` — CSS variable → Figma name lookup for any token you need to identify.

---

## Step 1 — Analyze the reference image

Read the image carefully and extract:

- **Layout structure** — sections, columns, stacking, hierarchy
- **Components present** — map each UI element to the nearest existing DS component (`pos-*`). Check `ds-index.json` for what is available.
- **Typography** — heading levels, body, labels, code; map to DS font tokens (`--pos-font-*`, `--pos-font-size-*`)
- **Spacing** — gaps, padding, margins; map to semantic spacing tokens (`--pos-gap-*`, `--pos-padding-*`, `RULES.md` 2.7; primitives only as a last resort)
- **Colors** — map every color to a DS semantic token (`--pos-color-*`); never use hex values
- **Icons** — identify which DS icons match; check `partials/icon.liquid` for available names

---

## Step 2 — Map elements to DS components

For each UI element in the reference, follow this priority order strictly:

1. **Use the existing DS component as-is** — if a `pos-*` component covers the use case, use its exact markup and classes. Do not rebuild it.
2. **Use the DS component from Figma** — if a component exists in the Figma DS file (`7LdPQ5BEpKgFvxqnjvwH5b`, internal use only; access required) but has no code equivalent yet, note it and use the closest code approximation.
3. **Build it from DS tokens** — if no DS component exists, implement the element using only semantic tokens (`--pos-color-*`, `--pos-radius-*`, `--pos-shadow-*`, etc.). Follow the CSS rules: `@layer common-styling`, `box-sizing: border-box`, no `!important`, all interactive states covered.

**Never introduce new tokens, new color values, or new variants** unless no existing token fits — and if so, flag it explicitly before proceeding.

---

## Step 3 — Implement the layout

Write the Liquid/HTML output. Rules:

- Match the reference layout as closely as possible using DS spacing tokens.
- Use the semantic `--pos-gap-*` / `--pos-padding-*` tokens for gap, padding and margin values (`RULES.md` 2.7); `--pos-primitive-size-*` only when no semantic token fits.
- Use DS component classes (`pos-button`, `pos-card`, `pos-tag`, etc.) with correct variant modifiers.
- Render icons via `{% render 'modules/common-styling/icon', icon: '<name>' %}`.
- No inline styles; layout CSS goes in the app's own prefixed stylesheet.
- No hardcoded `px`, `rem`, `em`, hex, or `rgb()` values anywhere.
- Mark any element built from scratch (not a DS component) with `<!-- TODO: replace with DS component once available -->`.

---

## Step 4 — Write scoped CSS (if needed)

If the layout requires structural CSS that cannot be expressed with DS component classes alone (e.g. grid columns, a specific flex layout), add it to the app's own prefixed stylesheet (never an inline `style` attribute or a `<style>` block in the page). Rules:

- Only layout/structure here — no colors, no typography, no spacing that has a token equivalent.
- All values must reference CSS custom properties.
- No new class names that duplicate existing `pos-*` patterns.

---

## Step 5 — Verify

Before reporting done, check:

- [ ] Every color references a `--pos-color-*` semantic token — no hex, no primitive color token used directly
- [ ] Every spacing value references a `--pos-gap-*` / `--pos-padding-*` token (or a primitive size as a last resort) — no hardcoded px
- [ ] Every DS component uses the correct markup and class names from `ds-index.json`
- [ ] No new tokens invented without explicit flagging
- [ ] All interactive elements have `:hover`, `:focus-visible`, `:active`, `:disabled` states (if applicable)
- [ ] Icon names exist in `partials/icon.liquid`
- [ ] visual layout pass (`ui-design-review` step 4: render at desktop and narrow width, screenshot, measure) — nothing overlaps or touches, rows align, spacing follows the hierarchy, no sideways page scroll, compared side by side with the reference image
- [ ] `ui-design-review`, `ux-review`, `a11y-review` applied (or the `ds-guard` agent run); findings reported to the user

---

## Output

When complete, print the generated code, then:

```
DS mapping decisions:
  - <reference element> → <DS component / token approach used>
  - ...

Built from scratch (no DS component available):
  - <element> — styled with: <tokens used>

Flagged for review:
  - <anything that required a deviation, a new token, or an approximation>
```
