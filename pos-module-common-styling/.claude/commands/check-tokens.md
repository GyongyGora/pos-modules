# check-tokens

Audit a DS component's CSS for dark/light mode compatibility. Every color value in a component must reference a theme-neutral `--pos-color-*` token so that the automatic dark/light mode switch works. Values that bypass the token system (hardcoded colors, primitive color tokens, or mode-specific light/dark tokens used directly in a component) will never change when the color scheme switches.

**Read-only — never modify any file.**

---

## Arguments

Usage: `/check-tokens <component-name>`

Examples:
- `/check-tokens segmented-control`
- `/check-tokens button`
- `/check-tokens forms`

The `pos-` prefix is optional — both `segmented-control` and `pos-segmented-control` are accepted.

---

## What counts as a violation

| Value type | Status | Why |
|---|---|---|
| `var(--pos-color-button-*)` / `var(--pos-color-input-*)` | ✅ OK | Component token (button / form fields only, RULES.md 2.2) → resolves via theme-neutral layer |
| `var(--pos-color-*)` | ✅ OK | Theme-neutral token → switches automatically |
| `transparent` | ✅ OK | Intentional, not a color value |
| `currentColor` | ✅ OK | Inherits from text color — covered by token |
| `inherit` / `initial` / `unset` | ✅ OK | Cascades correctly |
| `none` on non-color properties | ✅ OK | Not a color |
| `var(--pos-primitive-color-*)` | ⚠️ Violation | Primitive = raw value, never switches |
| `var(--pos-color-light-*)` | ⚠️ Violation | Light-only token, will not apply in dark mode |
| `var(--pos-color-dark-*)` | ⚠️ Violation | Dark-only token, will not apply in light mode |
| `var(--pos-color-a11y-*)` | ⚠️ Violation | High-contrast-only token, will not apply in light / dark mode |
| Hex value (`#xxx`, `#xxxxxx`) | ⚠️ Violation | Hardcoded, never switches |
| `rgb()` / `rgba()` | ⚠️ Violation | Hardcoded, never switches |
| Named CSS color (`white`, `black`, `red`, etc.) | ⚠️ Violation | Hardcoded, never switches |
| `var(--pos-shadow-*)` or `var(--pos-color-shadow)` in box-shadow | ✅ OK | Shadow token properly chained |
| Raw color in `box-shadow` | ⚠️ Violation | Shadow color must come from a token |

**Note on `none`:** `box-shadow: none` is OK. `background-color: none` does not exist in CSS — flag only if it appears on a color-accepting property.

---

## Step 1 — Locate the component CSS file

Look for the file at:
`modules/common-styling/public/assets/style/pos-<component>.css`

If the file does not exist, check `COMPONENTS.md` for the correct filename. If still not found, report: `❌ Component CSS file not found: style/pos-<component>.css`

---

## Step 2 — Extract all color-bearing CSS declarations

Read the component CSS file. For each CSS declaration, check whether the **value** contains a color. The relevant CSS properties to inspect are:

- `color`
- `background`, `background-color`
- `border-color`, `border-top-color`, `border-right-color`, `border-bottom-color`, `border-left-color`
- `border` (shorthand — check the color part)
- `outline`, `outline-color`
- `box-shadow` (check the color part — the `<color>` argument)
- `text-decoration-color`
- `fill`, `stroke`
- `caret-color`
- `accent-color`
- Any CSS custom property assignment (e.g. `--pos-color-toggle-group-background: ...`) — check the value

For `box-shadow`: the value is a space-separated list. The color is typically the last or second-to-last value before `inset`. Check that value.

Also scan for `var()` calls anywhere in the file that reference color tokens directly (even inside shorthand values).

---

## Step 3 — Classify each value

For every color-bearing declaration found, classify the value:

**✅ OK:**
- `var(--pos-color-*)` where the token name does NOT contain `-light-`, `-dark-` or `-a11y-`
- `transparent`
- `currentColor`
- `inherit`, `initial`, `unset`
- `none` (only valid on `box-shadow` or non-color properties)

**⚠️ VIOLATION:**
- `var(--pos-primitive-color-*)` — primitive color token used directly
- `var(--pos-color-light-*)` — light-only, won't apply in dark mode
- `var(--pos-color-dark-*)` — dark-only, won't apply in light mode
- `var(--pos-color-a11y-*)` — high-contrast-only, won't apply in light / dark mode
- Any hex value: `#rgb`, `#rrggbb`, `#rrggbbaa`
- Any `rgb(...)` or `rgba(...)` call
- Any named CSS color (white, black, red, blue, gray, grey, green, yellow, orange, purple, pink, transparent is OK, all others flag)
- Raw color in `box-shadow` (non-token color argument)

---

## Step 4 — Check component token definitions in pos-config.css

Read `modules/common-styling/public/assets/style/pos-config.css`.

Find all `--pos-color-<component>-*` custom property definitions (i.e. declarations whose name starts with `--pos-color-<component>-`).

For each definition, check the value using the same classification rules as Step 3.

Report these in a separate section: **"Component token definitions (pos-config.css)"**.

---

## Step 5 — Output the report

### Format

```
── pos-<component> — Dark/light mode token audit ────────────────────────
Source: style/pos-<component>.css
Config tokens: pos-config.css (component tokens exist for button / form fields only)

── Component CSS ────────────────────────────────────────────────────────
✅  Line 12   background-color: var(--pos-color-page-background)
✅  Line 18   color: var(--pos-color-content-text)
⚠️  Line 34   box-shadow: 0 2px 4px var(--pos-primitive-color-black)
              → Primitive color used directly. Replace with var(--pos-color-shadow)
⚠️  Line 51   color: #808691
              → Hardcoded hex. Replace with a --pos-color-* token (e.g. var(--pos-color-content-text-supplementary))
⚠️  Line 67   border-color: var(--pos-color-light-frame)
              → Light-mode-only token. Replace with var(--pos-color-frame)

── Component token definitions (pos-config.css) ─────────────────────────
✅  --pos-color-button-primary-background: var(--pos-color-interactive)
⚠️  --pos-color-button-primary-text: var(--pos-primitive-color-white)
    → Primitive color used in token definition. Should chain via a semantic --pos-color-* token

── Summary ──────────────────────────────────────────────────────────────
Component CSS:        Total: N  |  ✅ OK: N  |  ⚠️ Violations: N
Config definitions:   Total: N  |  ✅ OK: N  |  ⚠️ Violations: N

── Action required ──────────────────────────────────────────────────────
```

List each violation again here as a compact actionable list.

If there are no violations, print:
```
✅ All color values are properly tokenized. This component supports automatic dark/light mode switching.
```

---

## Violation message format

Each violation must include:
1. The file, line number, property, and current value
2. A plain-language explanation of why it won't switch
3. A suggested fix — propose the most likely correct `--pos-color-*` token based on the property name and context. Do not guess a primitive — always suggest a semantic or component-level token. If unsure, write: `Fix: replace with an appropriate --pos-color-* token (check pos-config.css or token-map.json for candidates)`

---

## Suggested fix heuristics

Use these to propose a replacement token when the context is clear:

| Current value / property | Suggested token |
|---|---|
| Color text in neutral context | `var(--pos-color-content-text)` |
| Prominent heading color | `var(--pos-color-content-text-prominent)` |
| Supplementary / muted text | `var(--pos-color-content-text-supplementary)` |
| Disabled text or icon | `var(--pos-color-content-text-disabled)` or `var(--pos-color-content-icon-disabled)` |
| Icon color | `var(--pos-color-content-icon)` |
| Page background | `var(--pos-color-page-background)` |
| Card / panel background | `var(--pos-color-content-background)` |
| Highlight / subtle background | `var(--pos-color-highlight-background)` |
| Border / frame | `var(--pos-color-frame)` |
| Link / interactive text | `var(--pos-color-interactive-text)` (hover: `-interactive-text-hover`) |
| Interactive icon / graphic | `var(--pos-color-interactive)` (hover: `-interactive-hover`) |
| Shadow in box-shadow | `var(--pos-color-shadow)` |
| Focus ring | `var(--pos-color-focused)` |
| Error / important | `var(--pos-color-important)` |
| Warning | `var(--pos-color-warning)` |
| Success / confirmation | `var(--pos-color-confirmation)` |
| White on dark backgrounds | `var(--pos-color-content-inverted-text)` |
| Inverted icon | `var(--pos-color-content-inverted-icon)` |

If none of these heuristics apply, read `token-map.json` or `ds-index.json` for the full list of available `--pos-color-*` tokens.
