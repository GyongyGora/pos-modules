# RULES.md — pos-module-common-styling

Single consolidated rulebook for CSS, tokens, components, and the documentation site. Component-scoped rules: `COMPONENT-RULES.md`. Review checklists: `REVIEW-PERSONAS.md`. Project setup and file locations: `CLAUDE.md`. Vision / architecture: `PROJECT.md`.

Format: numbered rules, terse, each pointing at one concrete reference-implementation component where useful (button and forms are the deepest reference implementations — use them when unsure how a pattern should look). Re-run the **Self-audit checklist** at the end before reporting any task done — not just at session end.

---

## 1. Naming conventions

1.1 CSS classes: `pos-` prefix, lowercase, hyphenated — `.pos-button`, `.pos-button-primary`, `.pos-dialog-header`.
1.2 Modifier classes: `pos-<component>-<modifier>` — `pos-button-primary`, `pos-button-small`.
1.3 CSS files: `pos-<component>.css` — one component per file, never multiple unrelated components in one file.
1.4 CSS custom properties (tokens): `--pos-<category>-<role>` — `--pos-color-button-primary-background`, `--pos-radius-button`.
1.5 Docs-site spec partials: `partials/style-guide/spec-<component>.liquid`, generated from `tokens/components/<component>.json` (6.4) — never hand-edited.
1.6 JavaScript: `window.pos` namespace, no global pollution. Module pattern: `window.pos.modules.<componentName> = function(container) { ... }` — same as `pos-collapsible`, `pos-dialog`.
1.7 Permissions: `<resource>.<action>` (`user.create`). Commands: `<resource>/<action>`. Queries: `<resource>/search` or `<resource>/find`. Hooks: `hook_<hook-name>` prefix. Events: `<action>_<resource>`, past tense (`user_created`).
1.8 **`pos-*` class names and `--pos-*` token names are frozen — never renamed, ever.** Not as part of any refactor, not later, not with confirmation. Token *values* can be proposed and approved case by case; a name cannot be changed under any circumstance.
1.9 **Old-DS token names stay as aliases.** Names the old design system used (1.x, on `master`) and the new DS renamed — e.g. `--pos-color-{warning,important,confirmation}-disabled` → `-muted` — stay in `style/pos-config.css` as permanent one-line aliases of the new token, in every theme block, listed under `tokens/ds-index.json › deprecated` (`npm run codemod:deprecated` moves app code over). Add one for every further rename found (compare with `style/pos-config.css` on `master`); never delete one. Intermediate names kept for old CSS are aliases too (e.g. `--pos-color-interactive-inverted` now points at the `*-icon-interactive-inverted` mode tokens). **Figma has one variable per color, not one per name**: `tokens/css-to-figma.json` maps every alias name to the same variable. Where a whole rendering mechanism changed (the select dropdown arrow), a CSS-only fallback covers it.

---

## 2. Token architecture

2.1 Three-tier hierarchy: **primitive → semantic → component**. Component CSS references component-level or semantic tokens only, never primitives directly for color.
2.2 **Only `pos-button` and form inputs (`pos-forms`) get dedicated component-scoped CSS tokens** (e.g. `--pos-color-button-primary-background`, `--pos-color-input-frame`) — this matches how Figma is structured. All other components use semantic tokens directly in their CSS; never create a `--pos-color-<component>-*` token that's a 1:1 alias of a semantic token for any component except those two. Customization without a component token: scope-override a semantic token on the component's own class (`.pos-segmented-control { --pos-color-page-background: #x; }`).
  **Exception — disabled filled controls:** the checked + disabled fill of Toggle button, Switch card, Checkbox and Radio uses the primary button's disabled tokens (`--pos-color-button-primary-disabled-background` / `-frame`), so every filled control looks the same when disabled (light: brand 300, dark: gray, HC: disabled gray). No semantic token gives that split. Retheming the primary button's disabled fill changes these four controls too — that is intended.
2.3 **Component composition hierarchy — token cascade rule**, for building complex/composite components:
  1. Embed the full DS component if it fits perfectly (exact markup/classes) — changes propagate automatically.
  2. If it can't be embedded but visually resembles a component, use that component's *own* dedicated tokens (button/forms only, per 2.2).
  3. If conceptually similar but not visually identical, use the closest component's *semantic* tokens (e.g. drag-and-drop zone ≈ form input → `--pos-color-input-frame`). Never fall back to generic semantic tokens when a more specific component token exists.
  4. Otherwise build from semantic DS tokens directly (`--pos-color-*`, `--pos-radius-*`, `--pos-shadow-*`) — never hardcoded values or primitives at any level. Flag as a **component candidate** (`<!-- TODO: component candidate — [name] -->`) if it appears in 2+ places or is complex enough to warrant reuse.
2.4 **Negotiated token names only** — component CSS always references the negotiated `--pos-color-*` name (no mode suffix), never `--pos-color-light-*` / `-dark-*` / `-a11y-*` directly. The mode negotiation happens once, in the theme files — bypassing it renders wrong in at least one mode, silently. No exceptions, including one-off temporary implementations.
2.5 **Primitive token usage**: primitive *color* tokens are never referenced directly in components — always go through semantic/component tokens (strict, no exceptions). Primitive *value* tokens (size, radius, typography) may be referenced directly only as a last resort, when no semantic/component token exists.
2.6 **Frame tokens** (`--pos-color-frame`, `--pos-color-frame-default`, `--pos-color-frame-transparent`) are exclusively for borders/dividers — never as `background`/`background-color` (wrong contrast, breaks theme semantics). Use `--pos-color-highlight-background` (subtle surface, inactive control track), `--pos-color-content-background` (card/white surface), or `--pos-color-page-background` (page-level) instead.
2.7 **Spacing tokens** — use the token matching the actual relationship, never a similarly-sized substitute:

| Relationship | Token |
| --- | --- |
| Page/article title (h1) → subtitle/intro | `--pos-gap-title-content` |
| Section heading → section content | `--pos-gap-section-title-content` |
| Section → next section | `--pos-gap-section-section` |
| Card → next card | `--pos-gap-card-card` |
| Elements within a card/section | `--pos-gap-card-elements` |
| Inline text elements | `--pos-gap-text-text` |
| Tag → tag | `--pos-gap-tag-tag` |

Reset the UA default `margin-block: 0.67em` on headings (`margin-block-end: 0`) before applying the correct token to the following element.

**Spacing follows the hierarchy.** The gap grows with the level of the relationship: inline text < elements inside a card / group < card → card < section title → its content < section → section. Things that belong together sit closer to each other than to anything outside their group, and a heading always sits closer to its own content than to the block above it. Neighboring elements never touch (no 0 gap between a text block and a box, card, field or button) and never overlap.

2.8 **Dark-mode token definitions** always follow the Figma reference chain — never write a hex value or resolve prematurely, even if the final value is known. If Figma's alias points to another semantic token, reference the matching `--pos-color-dark-*` var; if it points to a primitive, reference `var(--pos-primitive-*)`. Same rule for light mode.
2.9 **Token-first, no exceptions** — applies to all visual output (components, Figma, docs, any UI): never hardcode a hex color, px/rem spacing, radius, shadow, border, or font size. If no token covers the case, propose one (Name / Value / Reason / Description) and wait for explicit approval before adding it anywhere — never add it yourself first.
2.10 **Never bypass an existing semantic token by reaching for a sibling token instead.** If a component's color/font/spacing needs to change, update the semantic token itself (e.g. `--pos-font-badge` in `pos-config.css`, plus `token-map.json`) and keep the component CSS referencing that same token — never swap the component to a *different* existing token (e.g. `--pos-font-default`) just because it currently resolves to the desired value. A token name is a contract about *what it means*, not just what it currently equals — bypassing it leaves the original token's own documentation (its row on the tokens page, its Figma binding) silently wrong, and breaks the assumption that every component of a given kind reads from the same token.

---

## 3. Token change risk & confirmation

3.1 Risk levels, lowest to highest:

| Risk | Change type | Why |
| --- | --- | --- |
| ⚫ None | Docs/comments only | No functional or visual change |
| 🟢 Low | Token value change | System designed for this — components pick it up automatically |
| 🟢 Low | New token / new component | Purely additive, nothing breaks |
| 🟢 Low | CSS reference-chain change | Variable name unchanged, consuming code unaffected |
| 🟡 Caution | CSS specificity increased | May override legitimate overrides elsewhere |
| 🔴 High | Class/markup renamed, removed, or restructured | Other modules' Liquid/JS reference these directly — breaks silently |
| 🔴 High | Custom event or `window.pos.modules.*` API changed | Other modules call/listen to these directly |
| 🔴 High | Configuration attribute renamed/removed | Referenced in Liquid templates |

The real compatibility risk is **components** (class names, markup, JS API), not token *values* — values are meant to change, that's the theming system working.

3.2 **Existing token value change**: stop and notify the user before changing a token value. Report current value, proposed value, and likely-affected components (light / dark / HC). Wait for explicit confirmation — a value change the user asked for directly counts as confirmed.
  > ⚠️ Token conflict: `--pos-token-name` — Current: `X` → New: `Y`. Potentially affected: `pos-button.css`, `pos-forms.css`, [modules].
3.3 **New token, new component, CSS reference-chain change**: safe, no confirmation needed — but mention it in the response.
3.4 **Component class/markup change**: class names are frozen (1.8) — never renamed. A structural / markup change to an existing component changes what products build on: never autonomous — flag it, wait for an explicit decision, and record it as breaking in `CHANGELOG.md` + `MIGRATION.md` together with the change.
3.5 **JS API change**: never autonomous. Protected surfaces: custom events (`pos-dialog-opened/closed`, `pos-collapsible-opened/closed`, `pos-popover-opened/closed`, `pos-multiselect-opened/closed/changed/filtered`, `pos-modules-toast-ready`, `pos-frame-loaded`, `pos-markdown-*`, `pos-upload-*`, `pos:dismissed`), `window.pos.modules.*` (`toast`, `dialog`, `collapsible`, `popover`, `multiselect`, `password`, `markdown`, `upload`, `slider`, `segmentedControl`, `breadcrumb`, `codeCopy`, `keyboardNav`, `load`, `debug`), configuration attributes (`data-dialogtarget`, `[popovertarget]`, `[popover]`). Stop, flag, wait for explicit decision.
3.6 **Intentional divergences** (Figma ≠ CSS by design) are tracked in `token-map.json` with `"status": "diverged"` + `name_note` — do not flag these as errors during a sync.
3.7 **Post-sync update checklist** — which files to touch per change type:

| Change type | Files to update |
| --- | --- |
| Token value changed | `pos-primitives.css` and/or `pos-config.css` · `*.tokens.json` · `token-map.json` · `foundations/tokens.liquid` · `workflow.liquid` (stat) |
| New token added | `pos-config.css` · `token-map.json` · `foundations/tokens.liquid` · `workflow.liquid` (stat) |
| New primitive | `pos-primitives.css` · `token-map.json` (matching `figma_group`, update `total`) |
| New semantic color token | `pos-config.css` light + dark + a11y blocks + the negotiated `--pos-color-*` name · `token-map.json` (update `total`) |
| Any `token-map.json` change | update `css-to-figma.json` to match (`map`: every CSS variable → its Figma name; Node script with parse-back validation, never hand-edited JSON) |
| Any component-token change in `pos-config.css` | update `component-tokens.json` the same way |
| Token renamed | *(never — see 1.8)* |

Token values taken from Figma px are written in rem (px ÷ 16) with a `/* Npx at default */` comment. Before reusing an existing token for a Figma value, check that its px value really matches.

`token-map.json` is the single source of truth linking Figma names to CSS variables; the Foundations "Tokens" page fetches it at runtime (not live CSS), so keeping it correct is sufficient for the page to reflect current state.

---

## 4. CSS coding rules

4.1 **General**: wrap all component styles in `@layer common-styling { }`. Use `box-sizing: border-box` consistently. Never use `!important`. Never hardcode px for spacing — use tokens or relative units. Cover `:hover`, `:focus-visible`, `:active`, `:disabled` on every interactive component — never skip `:focus-visible`.
4.2 **Accessibility**:
  - Keyboard navigation on every interactive component; visible `:focus-visible` indicators always (never suppressed).
  - Minimum interactive size: 44×44px touch target for default/large variants (a smaller visual element still needs a 44×44 transparent hit area via `min-height`, padding, or an `::after` overlay). Small variants are desktop-only.
  - WCAG 2.2 AA contrast (4.5:1 text, 3:1 graphics). Never rely on color alone — pair with shape/icon/label/pattern.
  - All form inputs need associated labels. Icon-only buttons need `aria-label`.
  - **Mandatory, no exceptions**: every icon-only button/action needs a tooltip on hover/focus with its `aria-label` text (e.g. a table's "+" button → `aria-label="Add new"`), unless a visible text label sits next to the icon. Use `style/pos-tooltip.css`: `data-tooltip="Same text as aria-label"` on the interactive element itself, no wrapper markup. Always set `aria-label` and `data-tooltip` together, with matching text.
  - Icon-only buttons are always square (`width == height`, flex-centered icon, `padding-inline: 0`) — default 44×44px, small 30×30px.
  - JS components computing layout (`offsetWidth`, `getBoundingClientRect`, etc.) must recalculate on `window`'s `resize` event via a public `module.update()` method — the font-size toggle dispatches a synthetic `resize` after changing `html.style.fontSize`, so listening to `resize` is sufficient without knowing about the toggle.
4.3 **Responsive**: components must work across mobile/tablet/desktop using responsive tokens/layout rules.
4.4 **Consistency**:
  - New components match existing patterns — structure, naming, token usage, state coverage. Before building or restyling a component: read the description of each candidate token (`token-map.json › description`), and follow the token pattern of the closest existing component (`style/pos-<x>.css` + `tokens/components/<x>.json`) instead of starting from scratch.
  - Transitions go on the base state, not `:hover`; keep them short (0.1–0.2s linear).
  - Grouped icon buttons/actions order left-to-right: negative/destructive → neutral → affirmative/confirming. Don't reorder an existing group without a documented reason.
  - **Never change `border-width` on hover/active** (shifts layout size). Use `box-shadow: inset 0 0 0 <width> <color>` for a visually thicker border instead.
4.5 **Elevation**: interactive elements need a *stronger* shadow on hover than default, to signal affordance. Shadow values always reference tokens, never hardcoded.
4.5a **Color steps: ranges, with a recommended step.** Every 10-step scale is used by range, not by one fixed step — each step inside a range passes its contrast requirement: light mode — backgrounds 100–300, icons / graphics / buttons 600–800, text / links 700–800; dark mode — backgrounds 800–1000, icons / graphics / buttons 300–500, text / links 300–400. Interactive ranges stop at 800 / 300 so the hover (4.5b) still has its two steps. The Palettes page marks a **recommended** step on each range (light: icons 600, text 700; dark: icons 500, text 400) — the best-balanced contrast, a recommendation only: themes and components may move freely inside the range (e.g. `graphicStep` 700 / 800 themes; the Default theme's dark-mode buttons and interactive icons sit on 400, the same step as links, because they look brighter there).

4.5b **Hover = two scale steps; the active / selected element gets no hover.** Every interactive element shows hover with a background (or graphic) two scale steps darker in light mode and two steps lighter in dark mode — the existing `*-hover` tokens, as buttons and icons already do (e.g. `--pos-color-interactive` 600 → `--pos-color-interactive-hover` 800 in light, 400 → 200 in dark; in high contrast the hover token turns the fill white, and where the color can't change further a frame — `--pos-color-frame-transparent`, offset like the focus ring — marks it). **The currently active / selected element gets no hover effect** and must not change on hover: the active tab, the selected segment of a segmented control, the selected tile button of a group, the current page in pagination, the current menu item, the selected item of the (docs) sidebar navigation. Exception — elements that are "on" but whose click still does something keep the hover: a checked checkbox, a toggle button in either state, a selected (removable / filter) tag.
4.6 **Color usage**:
  - Headings always use `--pos-color-content-text-prominent` — never default body color or a hardcoded value.
  - Interactive elements (links, functional icons, clickable controls) use interactive tokens (`--pos-color-interactive`, `-interactive-text`, `--pos-color-content-icon-interactive`) — never apply interactive color to non-interactive elements.
  - A slight tone variation between interactive graphics and interactive text is acceptable (graphics need only 3:1 contrast vs. text's 4.5:1).
  - A neutral-by-default, interactive-color-on-hover pattern is acceptable when a subdued resting state is appropriate (toggle buttons, switches, subtle input icons, collapsible chevrons) — as long as at least one of {icon, hover, selected/active state} carries the interaction color.
  - **Pick a color token by two questions**: is the element text or a graphic (icon, button, graphic surface), and what state is it in? Use the token at that intersection — never a hover token on a resting element, a graphic token on text, or a disabled token on an active element.

| State | Text | Graphic / icon |
| --- | --- | --- |
| Normal | `--pos-color-content-text` | `--pos-color-content-icon` |
| Interactive | `--pos-color-interactive-text` | `--pos-color-interactive` |
| Hover | `--pos-color-interactive-text-hover` | `--pos-color-interactive-hover` |
| Active | `--pos-color-interactive-text-active` | `--pos-color-interactive-active` |
| Disabled | `--pos-color-content-text-disabled` | interactive: `--pos-color-interactive-disabled`; decorative: `--pos-color-content-icon-disabled` |
| Inverted surface | `--pos-color-content-inverted-text` | `--pos-color-content-inverted-icon` |

  Prominent text (headings, prices) uses `--pos-color-content-text-prominent`; secondary / meta text uses `--pos-color-content-text-supplementary`.
  - **Interactive text has two categories.** *Subdued* (menu, nav, popover and list items that should look like body text): `--pos-color-content-text-interactive` / `--pos-color-content-text-supplementary-interactive` — body-text color in light and dark mode, the high-contrast interactive-text color in HC. *Branded* (links, button labels): `--pos-color-interactive-text`. Never use `--pos-color-interactive` (the graphic token) for text of either kind.
  - **High contrast values**: a token applied to interactive **text** (including `--pos-color-focused`) resolves to `--pos-primitive-color-a11y-interactive-text`; a token applied to interactive **icons, graphics, button fills or input frames** resolves to `--pos-primitive-color-a11y-interactive-graphic`. On inverted HC surfaces use the matching `-inverted` primitive. Utility colors (warning, error, success) follow their own scale. Read current values from `pos-primitives.css` — never write a remembered hex.
4.7 **Links**: always underlined (never color-alone, WCAG 1.4.1); interactive color; `font-size: inherit` (never a fixed size). A dense list may drop the underline for an icon instead, but underline must still appear on `:hover`. Exception: navigation/sidebar menus don't need underline — position/grouping already signals interactivity.
4.8 **Component preview alignment**: previews on the doc site are always horizontally centered (`.comp-preview-stage { align-items: center }` on all direct children by default) — never override per-component without a documented reason. **When a preview stage is switched to `flex-direction: row`** (multiple instances side by side instead of the default stacked column), `align-items: center` alone only centers the cross-axis (vertical) — horizontal centering in a row layout needs `justify-content: center` added explicitly, or the row left-aligns instead. Add `align-items: flex-start` too if the row's items have unequal heights, so they align to the top rather than stretching.
4.9 **Segmented control (`pos-segmented-control`) — variant selection by surface**: no variant should sit on a background matching its own container background.

| Surface underneath | Recommended variants |
| --- | --- |
| Content background (`--pos-color-content-background`) | `default`, `highlighted` |
| Page background (`--pos-color-page-background`) | `highlighted`, `subtle` |
| Highlighted background (`--pos-color-highlight-background`) | `default`, `subtle` |

`subtle` is acceptable on page-background specifically because its active state still contrasts enough.

4.10 **Trailing/inline icon hover — three categories, not two.** Split every icon inside an interactive component into one of these:
  - **Decorative/non-clickable indicator** — not a separate hit target; hovering it does nothing different from hovering the rest of the field/control (e.g. a text input's calendar icon, a `<select>`'s native chevron, a multiselect's dropdown arrow). Stays a **constant** color across `normal`/`hover`/`focus`, muted only on `:disabled` — the field's own hover/focus state (background/border) already gives feedback; a second, separate color change on the icon is redundant.
  - **Real clickable icon-button, announced at rest** — its own hit target, its own `cursor: pointer`, independently focusable/keyboard-activatable, and *visually* announces its interactivity even before hovering (e.g. a password field's show/hide toggle, a multiselect's filter clear ("X") button, a tag's remove ("X") button). Resting color is `--pos-color-interactive`; gets its own `:hover { color: var(--pos-color-interactive-hover); }` — same resting→hover pattern used everywhere else for interactive elements.
  - **Real clickable icon-button, subdued at rest** — also its own hit target, but the design deliberately wants it to look muted/decorative at rest (Chevron, Close, Choice button, Pagination — token rule in 4.6). Resting color is `--pos-color-content-icon-interactive` (grey in light/dark, cyan in high contrast specifically so a11y-mode users still see it's interactive); **on hover it switches to the same `--pos-color-interactive` a category-2 icon rests at** — not `-hover` — since the whole point is the hover *is* the interactivity signal for light/dark-mode users. Never skip the `:hover` rule here — without it, a light/dark-mode user has no way to tell the icon is clickable at all.
  Never mix these up: giving a purely decorative icon (category 1) a hover color implies a click target that isn't there; leaving a real icon-button (category 2 or 3) without any hover color removes the interactivity cue entirely — the failure is worse for category 3, since its resting state provides no cue either.
  - **Why**: a real icon-button with no hover color gives no interactivity cue, and a hover color on a decorative icon promises a click target that isn't there.

4.11 **Typography tokens in every new component.** New component CSS always sets `font-family` and `font-size` from tokens. Family by text type: body `--pos-font-default`, button labels `--pos-font-buttons`, headings `--pos-font-heading`, sidenotes / meta `--pos-font-sidenotes`, badges `--pos-font-badge`, code `--pos-font-code`. Size: a `--pos-font-size-*` token, paired with its line-height token (`ds-index.json › rules.typography`). Explicit family tokens are what make per-brand font overrides work.

4.12 **Disabled = `cursor: not-allowed` over the whole hit area.** A disabled element shows the not-allowed cursor everywhere a user could point at it — the element, its label, track, thumb, icon and every child — exactly like a disabled button: set it on the element and on its children / labels in the disabled state (`:disabled`, `[aria-disabled="true"]`, `fieldset:has(:disabled) label`, `wrapper:has(input:disabled)`, and the component's existing `.pos-debug-<comp>-disabled` class). **Never `pointer-events: none` on a disabled element** — it hides the cursor (the pointer falls through to the parent); `npm run check:ui` flags it. Activation is blocked by native `disabled` or, for `[aria-disabled="true"]` / `.pos-link--disabled`, by the global click guard in `views/partials/init.liquid`. Hover / active styles exclude disabled: guard them with `:where(:not(:disabled, [aria-disabled="true"], [aria-disabled="true"] *))` (`:where()` keeps the specificity). Exceptions: a vendor widget whose own JS ignores the state (EasyMDE's toolbar in preview) keeps `pointer-events: none` on the button and puts `cursor: not-allowed` on its container; `.pos-button--loading` is busy, not disabled — it keeps `pointer-events: none` and shows no not-allowed cursor.
  - **Why**: `pointer-events: none` let the hit fall through to the parent, so disabled controls showed the plain arrow (or the parent's pointer) instead of telling the user the control is off.

---

## 5. Component rules

5.1 **Always use an existing DS component if one covers the use case** — never write custom markup/styles for something that already exists in `style/`. If one almost fits, extend/configure it — never duplicate to avoid reusing it.
5.2 **If no suitable component exists yet**: build a *temporary* implementation using only standard semantic/primitive-appropriate DS tokens (never hardcoded values or invented tokens), marked `<!-- TODO: refactor to DS component once available -->`. **At the end of the task, proactively ask** (don't wait to be asked):
  > "A new element was built ([name]). If it is useful beyond this page, it can become a reusable DS component (CSS, tokens, spec, docs). Promote it?"
  Only start the full component-addition workflow (§6) after an explicit yes.
5.3 **Build complex components from existing components/primitives** where possible — see the token cascade rule (2.3).
5.4 **One design system per release line.** 2.x (this design system) is developed on the `design-refactor` branch; 1.x (the old design system) is maintained on `master`. Old-DS files are never re-added to 2.x. *Maintainers:* the two lines are never merged; 2.x releases are major versions with `CHANGELOG.md` + `MIGRATION.md` entries.

| | Location |
| --- | --- |
| Component CSS, tokens CSS | `assets/style/pos-*.css` (`pos-primitives.css`, `pos-config.css` = token values) |
| Docs-site shell CSS / JS | `assets/style-guide/` — doc shell only, never component styles |
| Init partial (loads the DS) | `views/partials/init.liquid` |
| Docs layout | `views/layouts/style-guide.liquid` (docs pages: `/style-guide`) |
| Token map, specs, DS index | `assets/tokens/` |

Every component is self-contained in `style/` (Card's base rules included).

5.5 **Modification safety rule**: never modify existing work (Figma, code, docs, token files, specs, command files) beyond what the task explicitly asked. **Consequential modifications require confirmation first**: token values, component structure, Figma variables, class names, markup, or anything affecting shared resources used by other modules.
  > "You're about to modify [name]. This will affect all instances that use it. Are you sure you want to proceed?"
  Not consequential (no confirmation needed): changelog entries, comments, documentation text, new additive files. Read-only operations (inspect/screenshot/audit/parity-check) are always safe.
  Shared with products (changing an existing rule is consequential; adding new selectors is additive): `pos-config.css`, `pos-primitives.css`, `pos-reset.css`, `pos-typography.css`, every `style/pos-*.css`, `assets/js/pos-*.js`. Doc-shell only (free to change): `style-guide/styleguide.css`, `views/pages/style-guide/*`, `nav-left.liquid`, `component-template.liquid`.
5.6 **Icon system**: **Figma ≠ code (intentional):** the Figma file uses the licensed Streamline icon set; Streamline may not be published, so the code uses Tabler Icons instead. Same logical names and purposes, different glyph shapes — when comparing Figma and code, an icon that looks slightly different is expected, not a bug. Icons in code come from **Tabler Icons** (`@tabler/icons`, MIT, ~5,200 outline + ~1,000 filled). `views/partials/icon.liquid` is **generated** from `tokens/icon-registry.json` by `npm run build:icons` — never edit it by hand. Callers use only the logical name: `{% render 'modules/common-styling/icon', icon: 'delete' %}`. Outline icons render with a 1.5px stroke in a cropped 20px viewBox (the size of the Figma set) and an inline `fill:none` (the global `.pos-icon { fill: currentColor }` would fill them otherwise).
  - **Adding an icon**: add an entry to `tokens/icon-registry.json` (logical `name`, `purpose`, `tabler` = the Tabler icon name from https://tabler.io/icons, optional `tablerStyle: "filled"`), run `npm run build:icons`, and use the logical name. One glyph per purpose — check the registry before adding a near-duplicate.
5.7 **Legacy components — appearance-only changes.** Components carried over from the old DS (marked Legacy on the docs site and in `COMPONENTS.md`: Alert card, Avatar, Button, Card, Checkbox, Collapsible list, Dialog, File upload, Input, Link, Markdown editor, Multiselect, Password input, Popover menu, Radio, Select, Table, Tag, Textarea, Toast) keep the structure products already build on. In their CSS only *cosmetic* properties may change freely: colors, shadows, transitions, animations, HC-mode visibility fixes. Layout / structure / sizing changes would break those products — only with an explicit maintainer decision, recorded as breaking (3.4).

---

## 6. Component addition workflow

Two scripts do the mechanical work; the usage content is authored once, in the config file, and copied into both the spec JSON and `COMP_CONFIGS[key].usage` (the Usage tab reads only the latter):

### 6.0 The new 4-step process

1. **Write one config file** describing the component — see `scripts/component.config.example.json` for the full shape (`key`, `label`, `description`, `states`, `controls`, `rootSelector`, and the usage content as arrays: `useWhen`/`avoidWhen`/`do`/`dont`/`accessibility`). This is the *only* place usage content is authored — the script copies it verbatim into both the spec JSON and `COMP_CONFIGS[key].usage`, eliminating the old hidden duplicate-authoring step.
2. **Run `node scripts/generate-component.js --config <path>`** (add `--dry-run` first to review). This creates `style/pos-<key>.css` and `tokens/components/<key>.json` as skeletons, generates `spec-<key>.liquid`, and edits `init.liquid` (CSS `<link>`), `nav-left.liquid` (nav entry), `COMPONENTS.md` (inventory row), `src/js/styleguide-component-page/comp-configs.ts` (`COMP_CONFIGS` entry) and `apply-status.ts` (an `applyStatus()` block simulating hover/focus/disabled, if the component has any states beyond `normal`), and inserts the spec render include and a preview-section skeleton into `component-template.liquid` — all via exact, uniquely-verified anchors (throws rather than guessing if a target file's shape has changed). Run `npm run build` afterwards (the docs-page JS is compiled TypeScript).
3. **Fill in the real content** the script correctly refuses to invent: the actual CSS rules in `pos-<key>.css` (replacing the `TODO` stubs), the actual token data in `<key>.json` (replacing the `TODO` placeholder token — use the lookup rule in 6.4), and the debug-class stubs the script appended to `styleguide.css` (mirror the component's real `:hover`/`:focus-visible` rules exactly). Re-run the generator's regen step (or the standalone snippet in 6.4) after any JSON change.
4. **Replace the preview-section skeleton** in `component-template.liquid` with real markup, and add the control-panel HTML if the component uses the standard `state`/`size` controls (a genuinely custom control — e.g. a new Variant toggle for a multi-sub-variant component — is still written by hand, see §7 and the "Not automated" note below).

Then run the 6.2 verify checklist before removing any "new" badge.

**Not automated, by design** — genuinely component-specific, not boilerplate:
- The component's own CSS values (colors, spacing, real interaction states) — this is the actual design work.
- The component's real token data in the spec JSON — the actual variants/states/tokens, not a shape the script can guess.
- Preview markup — what the component's demo actually shows.
- A bespoke `get<X>VariantSections()` for components whose preview shows multiple visual sub-variants side by side (Chip/Segmented/Tag/Card/Button/Code-style) — see §7. The generic path the script wires up by default only covers the (far more common) single-representative-variant case.
- JS behavior code for a genuinely new interactive module (`assets/js/pos-<component>.js`) — only needed if the component has real runtime behavior beyond CSS + the shared doc-shell simulation.

### 6.1 Manual checklist (reference — what the scripts in 6.0 do)

<details><summary>Kept for debugging an existing component or understanding what the scripts actually do under the hood — do not follow this manually for a new component.</summary>

| # | Deliverable | Location |
| --- | --- | --- |
| 1 | Component CSS | `style/pos-<component>.css` |
| 2 | Component JS (if interactive) | `assets/js/pos-<component>.js` |
| 3 | Tokens in config (light + dark + a11y, only if button/forms — see 2.2) | `style/pos-config.css` |
| 4 | Component spec JSON | `tokens/components/<component>.json` |
| 5 | Spec liquid partial (generated from #4 via Node script — see 6.4) | `partials/style-guide/spec-<component>.liquid` |
| 6 | COMPONENTS.md inventory update | `COMPONENTS.md` |
| 7 | Register CSS `<link>` | `partials/init.liquid` |
| 8 | Add preview HTML | `component-template.liquid` → `<section data-comp-key="<component>">` |
| 9 | Add right-panel control sections | `component-template.liquid` → `data-comp-control="..."` sections. **On/off optional-element toggles must use `pos-switch-card`, never `pos-tile-btn`.** JS: listen for `change` on `input[type=checkbox]`, not `click`+`aria-pressed`. |
| 10 | Register in `COMP_CONFIGS` | `src/js/styleguide-component-page/comp-configs.ts` → `controls: [...]` for every panel control |
| 11 | Add control click handlers | `src/js/styleguide-component-page/controls/*.ts` → one per new control type, calling `tryRefreshInspect()` |
| 12 | Add nav entry | `partials/style-guide/nav-left.liquid` |
| 13 | Register in the generic Tokens-panel path, or write a bespoke `get<X>VariantSections()` if the preview shows multiple visual sub-variants side by side | `src/js/styleguide-component-page/token-panel.ts` — see §7 |
| 14 | Populate `COMP_CONFIGS[key].usage` — the actual source `renderUsageTab()` reads; the spec JSON's own `whenToUse`/etc. were never wired to any renderer | `comp-configs.ts` |

</details>

### 6.2 Verify before marking done

- [ ] Component renders with correct styles (CSS loaded via `init`)
- [ ] Controls switch variants/states visually
- [ ] Tokens panel shows correct, complete data for the current variant/state/size
- [ ] Nav link appears and scrolls to the correct section
- [ ] Preview is horizontally centered (4.8) — no `align-self: flex-start`/`width: 100%` on a direct `.comp-preview-stage` child unless intentional
- [ ] "NEW" label removed only after human review + content finalized
- [ ] `REVIEW-PERSONAS.md`'s "Component Spec / Tokens Panel QA Reviewer" run and passed — mandatory whenever CSS, control-wiring JS, or the spec JSON was touched (see self-audit checklist item 10)
- [ ] `REVIEW-PERSONAS.md`'s "Security & Risk Reviewer" run and passed — mandatory on every change (see self-audit checklist item 11)

### 6.3 Documentation layers — keep both in sync

1. **Human layer** — `/style-guide` Liquid pages, live previews + token tables.
2. **AI-readable layer** — the component's spec JSON (`tokens/components/<name>.json`) plus the embedded `<script type="application/json">` block on its doc page, covering every variant × state × token. Must be present and complete at page load, independent of JS execution — this is not optional.

(Figma Make compatibility is out of scope for this project.)

### 6.4 Token lookup rule — mandatory when writing any spec

Never guess or assume a CSS↔Figma mapping:
1. Read the component's CSS — identify the `--pos-*` variable actually used.
2. Look it up in `tokens/css-to-figma.json` → `map` for the Figma name. **A `--pos-color-*` token is stored only under its per-theme keys** (`--pos-color-light-*` / `-dark-*`), never under the semantic name the CSS uses — so a direct-key miss on a color token is not the end of the lookup. Every other category (`--pos-gap-*`, `--pos-radius-*`, `--pos-size-*` …) has no per-theme variants: a miss there is real.
   **Resolve the per-theme key, don't build it from the name**: read what the semantic token is set to in `pos-config.css`'s light block and look up *that* key. E.g. `--pos-color-interactive` (graphic color) points at `--pos-color-light-icon-interactive*` ("Graphic Interactive …"), while `--pos-color-light-interactive*` is the *text* token reached through `--pos-color-interactive-text`.
3. No entry (including the retried `light-` lookup for color tokens) → the token has no Figma equivalent: set `"figma": null` and **include it anyway** (never omit). Never invent a Figma name.
4. Unsure about any token → ask, don't assume.

Always generate spec JSON and its `spec-<component>.liquid` wrapper via a Node.js script (`JSON.stringify` + write + parse-back validation) — never hand-edit structured JSON. `scripts/generate-component.js` does this for a new component (6.0); after editing an existing component's JSON, regenerate its partial with the snippet below. **The `{% raw %}` wrapper around the JSON is mandatory**: spec strings (`usageExample` above all) can contain Liquid-looking example code, which Liquid would otherwise execute and break the page.

```js
const fs = require('fs');
function regen(name) {
  const j = JSON.parse(fs.readFileSync('modules/common-styling/public/assets/tokens/components/' + name + '.json', 'utf8'));
  const out = '{% comment %}\n  Generated from tokens/components/' + name + '.json — never hand-edit, regenerate via script if the source JSON changes.\n{% endcomment %}\n<script type="application/json" id="comp-spec-' + name + '">\n{% raw %}\n' + JSON.stringify(j, null, 2) + '\n{% endraw %}\n</script>\n';
  const m = out.match(/\{% raw %\}\n([\s\S]*)\n\{% endraw %\}/);
  JSON.parse(m[1]); // parse-back validation — never write an unverified partial
  fs.writeFileSync('modules/common-styling/public/views/partials/style-guide/spec-' + name + '.liquid', out, 'utf8');
}
regen('<component-name>');
```

After every edit to a spec JSON, check that the JSON and its partial are equal:

```js
const fs = require('fs'); const n = '<component-name>';
const j = JSON.parse(fs.readFileSync('modules/common-styling/public/assets/tokens/components/' + n + '.json', 'utf8'));
const m = fs.readFileSync('modules/common-styling/public/views/partials/style-guide/spec-' + n + '.liquid', 'utf8').match(/\{% raw %\}\r?\n([\s\S]*)\r?\n\{% endraw %\}/);
console.log(JSON.stringify(j) === JSON.stringify(JSON.parse(m[1])) ? 'OK' : 'OUT OF SYNC');
```

### 6.5 Icon size

Always `--pos-size-icon-s`/`-m`/`-l` — never hardcode px/rem for icon width/height.

### 6.6 JS conventions

Module pattern per 1.6. Component JS lives in `assets/js/` (no build step there; only the docs page's TypeScript is compiled, see `CLAUDE.md`). `views/partials/init.liquid` loads and initializes it: password, multiselect, slider, upload and markdown always; popovers, dialogs, collapsible lists, code highlighting and `data-load-content` too, unless the page renders the partial with `auto_init_components: false` (the docs site does — it creates its own instances).

### 6.7 Right-panel control group order — canonical

The Variants tab's control-group sections (`data-comp-control="..."` in `component-template.liquid`) must always appear in this order — **only include the groups actually relevant to that component**, never all of them:

1. **Variant** — which variant/alignment/type to show (e.g. `code-variant`, `card-variant`, `button-base`)
2. **State** — the shared `state` grid (Normal / Hover / Focus / Disabled / etc.)
3. **Size** — every size-flavored control comes together right after State (`size`, `icon-size`, `tag-size`, `chip-size`, `card-size`, `switch-size`)
4. **Orientation** — `orientation`
5. **Intent / Scheme** — `intent`, `scheme`, `tag-intent`, `chip-intent`
6. **Options** — on/off optional-element toggles (`card-options`, `switch-icon`) — always `pos-switch-card`, never `pos-tile-btn`

The HTML's physical order in `component-template.liquid` is what determines the on-page display order — `COMP_CONFIGS[key].controls` (in `comp-configs.ts`) only controls which groups are shown/hidden for that component, not their order, so it must list them in this same sequence for consistency even though it doesn't enforce it at runtime.

**If a new kind of control group doesn't fit one of the 6 buckets above**, don't insert it by guessing — flag it and ask where it belongs in the order before adding it.

---

## 7. Component spec rules (Tokens panel data)

The spec JSON drives the Tokens panel and the Code snippet directly (`COMPONENT_SPECS[key]`). The rules below govern its content.

Every DS component, however small (Close, Chevron…), has its own `tokens/components/<name>.json`; a component found without one gets it in the same task. Foundation stylesheets (typography, forms base, page, utility, behaviors) have no spec; Spinner has none yet.

7.1 **Standard sections** — include only when applicable:

| Section | Include when | Notes |
| --- | --- | --- |
| Color | Always, if any color token applies | Background, text, border, icon |
| Layout | Radius/size/spacing tokens applied | `--pos-radius-*`, `--pos-size-icon-*`, `--pos-padding-*` (if it has a Figma name) |
| Typography | Font-family OR font-size applied | **Always as a pair** — never list one without the other |
| Elevation | A shadow token applies, even on one state only | List on the state where it appears; `figma` = the effect style name; always after Typography |
| Focus indicator | Every keyboard-accessible interactive component | `--pos-color-focused` |
| Interactions | A `pos-anim-*` behavior is wired | Behavior name + trigger + description, on the **variant** object (not per-state) |

7.2 **Typography — no partial listing**: if the family token is applied, the matching size token must appear in the same spec entry, and vice versa.
7.3 **Interactions/behaviors** format, on the variant object:
```json
"behaviors": [{"name": "pos-anim-stroke", "description": "2px interactive-color inset outline on hover"}]
```
7.4 **Variant dimensions** — define only the ones that actually exist:

| Dimension | Examples | CSS pattern |
| --- | --- | --- |
| Size | default, small, large | `pos-<component>--small` |
| Intent/scheme | primary, secondary, confirmation, warning, important | `pos-<component>--confirmation` |
| Orientation | horizontal, vertical | `pos-<component>-group--vertical` |
| State | normal, hover, focus, active, disabled, selected, pressed | `:hover`, `:focus-visible`, `--selected`, `[aria-pressed]` |

States are not variants — they live inside each variant's `states` object.

7.5 **Component-level selection, never sub-element**: one spec variant per *visual* variant of the component (primary, secondary, small), never one per internal DOM element. All tokens for all internal elements (links, icons, focus states) are listed together under the one component variant's states.
  **Wrong**: three variants — `toggle`, `link`, `link-active` for one collapsible.
  **Right**: one variant — `collapsible` — with every internal element's tokens inside its states.
7.6 **Full token listing — mandatory, no exceptions.** Every CSS token the component actually uses, across all variants × states, including:
  - Tokens with no Figma equivalent — `"figma": null`, included anyway (rendered as CSS var name + resolved value, Figma column omitted).
  - Tokens from embedded DS components — listed under an `embedded_components` key.
  - Layout tokens (`--pos-radius-*`, `--pos-padding-*`, `--pos-height-*`).
  - Color tokens (background, text, border, icon) and the focus indicator token.
  Omitting a token because it lacks a Figma mapping makes the spec an inaccurate description of the real CSS — never do it. (Known CSS-only tokens that always carry `figma: null`: `--pos-padding-button`, `--pos-height-button`, `--pos-border-button`, `--pos-height-button-small`. Instance-to-instance gap tokens, e.g. `--pos-gap-card-card`, are the one legitimate omission — they describe layout between instances, not the component.)

7.7 **Swatch — on every token that IS a color, and only those**, decided by what the token resolves to, never by the section heading it's filed under. A token is a color if `getComputedStyle(document.documentElement).getPropertyValue(css)` resolves to `#hex` or `rgb()`/`rgba()`/`hsl()`/`hsla()` (`rgb()` matters: `--pos-color-frame-transparent` is `rgb(… / 0%)` in light / dark). `isSwatchEligible()` in `src/js/styleguide-component-page/token-panel.ts` is the one shared implementation every display mapper calls. **Reference: `tokens/components/chip.json` or `avatar.json`** — every color token carries `"swatch": true` explicitly.
  - Explicit `"swatch": true` on a token that resolves to a color, explicit `"swatch": false` on anything else (a shadow, radius, or font-family has no single color to preview) — **always write it explicitly, never rely on a default.** `applySwatchDefaults()`/`isSwatchEligible()` do default a missing field correctly as a safety net, but that net exists to catch mistakes, not to be the intended authoring path — a spec that needs the net has already violated 7.7.
  - **Why**: the rendering paths used to default a missing `swatch` field differently, so a spec without it showed no color previews. `applySwatchDefaults()` now defaults it the same everywhere, but the JSON must still be explicit.
  - **Self-check before shipping any component's spec**: open its Tokens panel for at least one variant × one state with a Color section, and confirm every row actually shows a swatch (not just that the JSON has the field — verify the rendered page). A field can be correct in the JSON and still render wrong if a rendering-path bug like the one above exists; JSON review alone doesn't catch that class of bug.

7.8 **Spec JSON is updated in the same change as the CSS it documents** — whenever a CSS token reference changes or a CSS property is added or changed (e.g. a new `font-family`) — and its partial regenerated. **Why**: otherwise the Tokens panel silently shows the old token. **Check**: after a token-reference edit, `grep tokens/components/` for the old token name — zero hits outside the CHANGELOG.

7.9 **Every state lists its full, self-contained token set — never a diff against the base state.** A state's `sections` array (`normal`, `hover`, `focus`, `active`, `disabled`, `selected`, ...) must list **every token visually applied while that state is showing**, including every token carried over unchanged from `normal` — not only the tokens that changed. The Tokens panel renders whatever state is selected in isolation; a state entry that only lists its *delta* silently drops every unchanged token from the panel the moment that state is selected. **Reference implementation: `tokens/components/button.json`** — every state (`normal`/`hover`/`active`/`focus`/`disabled`) repeats the full Color/Elevation/Layout/Typography section set in every state block, even Layout/Typography tokens that never change across states. Copy that pattern for any new state on any component.
  - **Why**: the panel shows the selected state in isolation; a state listing only its changed tokens hides everything else that is still visible.
  - **Practical check**: before shipping any component with 2+ states, diff each non-base state's token list against `normal`'s — every token that isn't visually overridden in that state's CSS should still appear in that state's spec, carried over verbatim (same `css`/`figma`/`role`/`swatch`), not silently dropped.

7.10 **Button's base × intent matrix must stay complete — a new base needs all 4 intents, not just the default.** Button's `dimensions` are two independent axes: `base` (primary/secondary-filled/secondary/ghost/…) × `intent` (none/error/success/inverted). Every existing base has all 4 intent combinations built in both CSS and `button.json` — adding a new base variant with only its default (`none`-intent) form done is an incomplete addition, not a smaller/acceptable version of the task. Build all 4 combinations in the same pass a new base is added — CSS rules, `button.json` variant entries (`<base>+error`/`<base>+success`/`<base>+inverted`), and the live preview (the Intent toggle already applies its classes to every `.pos-button` in the active stage generically, so no extra preview wiring is needed beyond the base row itself).
  - **CSS cascade trap**: a new base's intent overrides must be positioned in the file *after* the generic `.pos-button-error`/`.pos-button-success` bare rule and its `:not(.pos-button-primary)`/`:not(.pos-button-primary):not(.pos-button-secondary)` catch-all (same specificity as a new `.pos-button-<newbase>.pos-button-<intent>` rule — source order decides the winner at equal specificity). Placing the new base's override earlier in the file, e.g. right next to the base variant's own no-intent rule, means the later catch-all silently wins instead, and the new base+intent combo renders with the *wrong* variant's colors. Follow the same physical placement `.pos-button-secondary.pos-button-error` uses: immediately after the catch-all it's overriding, not clustered with the base's own plain rule.
  - **Why**: a base without its intent combinations falls through to the generic catch-all rules and renders with another variant's look.

7.11 **Combined dimension keys (Intent × State) must be built explicitly — an unbuilt combination shows the wrong state, not an approximation of the right one.** `getGenericVariantSections()`'s generic Intent mechanism looks for a `"<intent>-<status>"` key (e.g. `error-hover`, `success-disabled`) before falling back to the plain intent key, then the plain status key. That fallback exists so components without any combined states keep working — it is not a substitute for building the real combination. A missing combined key does not degrade gracefully to "close enough": it silently swaps in the *wrong* state's full token list (e.g. selecting Error intent + Hover state without an `error-hover` key shows plain `error`'s tokens, dropping the hover-background/hover-text entirely).
  - **Build every combination from the real CSS cascade, never by pattern-matching the Filled case.** Each combined state clones the real base state (hover/focus/disabled/opened/display-only/…) and only overrides the specific token(s) the intent actually changes in the real CSS (usually just the border/box-shadow token) — verify via selector specificity which property the intent's `[aria-invalid]` (or equivalent) rule actually wins for, and which properties still fall through to the base state's own rule.
  - **Why**: without the combined key the panel shows the plain intent state, hiding the state's own background / text tokens.

7.12 **Nested/composed DS components' own tokens are never duplicated into the parent's Tokens panel.** If component A's markup includes an instance of component B (e.g. Multiselect containing Tag, Checkbox, and Control-icons instances), B's own tokens belong on B's own Tokens panel, not copied into A's. Declare the relationship instead via A's spec's `"composedOf": ["b-component-key", ...]` array — the Tokens panel renders these as clickable chips under a "Composed of" heading that scroll/navigate to each listed component's own section. Only list a token directly on A's spec if it's applied to A's *own* markup, not to the embedded B instance.
  - **Practical check when writing or auditing any component's spec**: does this component's real markup instantiate another DS component anywhere in its structure? If yes, `composedOf` must list it — check the component's real HTML/Liquid, not just its most obvious visual appearance, since composition can be structural rather than visual (e.g. Card composing Chip for its dismissible-tag pattern even where the rendered example doesn't show one).

7.13 **If a variant/kind genuinely has fewer states than the component's full state set, the State controls for the missing states must be disabled — never silently fall back to another state's tokens under a wrong label.** Some components have sub-variants that aren't fully interactive (e.g. Tag's non-interactive "Default" kind, which has only a `normal` state in its spec — no hover/focus/disabled/selected exist for it in the real CSS). Clicking a State button that has no corresponding entry for the current variant/kind must not render a different, unrelated state's tokens as if they belonged to the one selected.
  - **How to apply**: gate the relevant State buttons (`disabled = true`, not `hidden`, so the control layout doesn't jump) whenever the active variant/kind lacks that state, and re-enable them the moment the variant/kind changes to one that has the full set — including when switching to a *different* component entirely, since shared control elements (e.g. the shared `#comp-status-grid`) must never carry over another component's disabled-state leftovers.
  - **Why**: otherwise the panel shows `normal`'s tokens under the clicked state's label.

7.14 **The `role` (tooltip) field must survive every token-display mapper function — never assume the generic path is the only one rendering a token.** Several rendering paths transform a spec token object into what actually reaches the DOM (`toGenericDisplayToken`, `toButtonDisplayToken`, `toCodeDisplayToken`, the Control-icons inline mapper, …) — any one of these that copies specific fields (`css`, `figma`, `swatch`) instead of spreading the whole object silently drops `role`, breaking the info-tooltip feature for that component only, with no error anywhere. When adding a new field to the token schema (as `role` was), grep for every function that constructs a display-token object and confirm each one carries the new field through, not just the one you happened to test against.

7.15 **Every token should carry a descriptive `role` so the hover tooltip actually explains something.** `renderTokenPanel()` shows a tooltip on hover for any token whose `role` string is longer than 20 characters (`isDescriptiveRole` in `src/js/styleguide-component-page/token-panel.ts`) — a short structural label like `"background"` or `"frame"` is deliberately excluded (used only for swatch-default logic elsewhere, would be pure noise as a tooltip), but anything genuinely explanatory should be written long enough to qualify and show.
  - **Write the role as what a person looking at the swatch would want to know**: which specific element it applies to, in which state, and — critically — what makes it different when the *same* `css`/`figma` name appears more than once in the same spec meaning different things (e.g. Multiselect's dropdown arrow vs. its filter-clear button both reading `--pos-color-interactive` — without a role, the tooltip can't tell them apart; with one, hovering either row immediately says which element it colors).
  - **Format**: short phrase, not a sentence fragment repeating the token name — `"Menu item text (resting)"`, not `"content-text-interactive token"`. State qualifiers in parentheses when relevant (`(resting)`, `(hover)`, `(disabled)`) are encouraged whenever the same element's token appears across multiple states in one spec.
  - **When writing or auditing any component's spec**: check every token for a `role` field of qualifying length — a missing or too-short role isn't a hard error (the row still renders correctly, just without a tooltip), but it's an easy, low-cost win. Fill it in from the real CSS context (which selector, which property, which state) — never invent a description that doesn't match what the token actually does.

7.16 **A spec JSON and its generated `spec-<name>.liquid` existing on disk is not the same as the component actually having a working Tokens panel — the partial must also be `{% render %}`-ed onto `component-template.liquid`, or `COMPONENT_SPECS[key]` never gets populated.** `COMPONENT_SPECS` is auto-discovered purely from `<script id="comp-spec-*">` tags that are actually present in the rendered page DOM (§7 intro / `styleguide-component-page.js`) — a spec file that exists on disk but is never rendered is invisible to that scan, full stop. Every `renderTokenPanel()`/`buildGenericCodeSnippet()` dispatch branch checks `COMPONENT_SPECS[key]` before using it; when it's missing, execution silently falls through to a defensive legacy fallback (`state.tokenMap`, sourced from `COMP_CONFIGS[key].tokens`) that is empty or stale for every component migrated to the spec-JSON system — producing a blank panel, a wrong/stale token list, or (if that legacy array is genuinely empty) a silent JS exception that aborts the render entirely.
  - **Why**: a spec that isn't rendered on the page leaves `COMPONENT_SPECS[key]` undefined, and the panel falls back to an empty legacy token list.
  - `scripts/generate-component.js` adds this line for a new component; a component built or restored by hand needs it added manually.
  - **Practical check, mandatory before calling any component's spec work done**: `grep "style-guide/spec-<key>'" component-template.liquid` — must return exactly one match. Zero matches means the spec is dead on arrival regardless of how correct its JSON is.

7.17 **The `{% raw %}...{% endraw %}` wrapper around a spec's embedded JSON is mandatory, not stylistic.** A spec's string fields (`usageExample` above all) can legitimately contain literal Liquid-looking text — e.g. `"{% render 'modules/common-styling/content/alert', type: 'info', ... %}"` shown as example code for a human/AI reader. Liquid does not distinguish "this is JSON text inside a `<script>` tag" from "this is real template code" — it parses and executes `{% %}`/`{{ }}` sequences anywhere in the file, per §8.5. Without `{% raw %}`, a spec containing such an example silently breaks the page the moment it's actually rendered (a real HTML output gets spliced into the middle of what should be inert JSON text).
  - **Why**: an example containing Liquid tags breaks the page as soon as the spec is rendered.
  - **How to apply**: both `scripts/generate-component.js`'s `regenSpecPartial()` and the standalone regen snippet in §6.4 wrap the JSON in `{% raw %}`/`{% endraw %}` — always regenerate through one of those two, never hand-build a `<script type="application/json">` block, and this is automatic.
  - **The `{% comment %}` block explaining all this must never itself contain a literal `{%`/`%}` sequence** — even describing the fix in words inside the comment (e.g. writing out `{% raw %}` literally as prose) makes some Liquid parsers report `'comment' tag was never closed` and fail deploy validation for every single spec at once, since the parser starts trying to match a nested tag it finds inside the comment instead of just skipping to `{% endcomment %}`. **Why**: a literal tag inside the comment breaks deploy validation for every spec. Describe the mechanism by name only ("a raw block") in that comment, never with literal curly-percent syntax.

7.18 **A literal `</script>` anywhere inside a spec's JSON string content must be backslash-escaped (`<\/script>`) — the browser's HTML parser closes the outer `<script>` tag on that exact substring, nesting or not.** This is unrelated to Liquid (it's an HTML/browser parsing rule) and easy to hit specifically in `usageExample` fields that show real `<script>...</script>` trigger code (e.g. Toast's `new window.pos.modules.toast(...)` example). Check every spec's string fields for `</script>` before shipping; the fix is always `.split('</script>').join('<\\/script>')` on that one field, not a structural change anywhere else. Run this check for every field, not just `usageExample`, on any spec whose string content might realistically include example code.

7.19 **`parse_json`/`endparse_json` (and any other block tag with a body) cannot be used inside a `{% liquid %}` shorthand block — only single-line, bodyless statements are valid there.** Each line inside `{% liquid %}` is parsed as its own tag, so a multi-line JSON literal after `parse_json` fails with `Unknown tag` — and only `pos-cli deploy`'s validation catches it. Two correct alternatives, pick based on shape:
  - **A simple hash** (e.g. a one-key placeholder object): stay inside `{% liquid %}` using the filter-chain form — `assign my_var = '{}' | parse_json | hash_merge: key: 'value'` — this is a single-line `assign` statement, not a block tag, so it's valid there.
  - **A real array or nested structure**: drop out of `{% liquid %}` entirely and use the standalone tag form — `{% parse_json my_var %} [ ... ] {% endparse_json %}` as its own `{% %}`-delimited block in the template. Never nest this inside a `{% liquid %}` block.
  
  Before marking any task done that added or edited a `{% liquid %}` block, grep the touched file for `parse_json` (or any other tag that can take a body) inside one — a bodyless one-line `assign ... | parse_json | ...` is fine; anything spanning multiple lines with its own `end*` closer is not.

7.20 **Spec entries are written from the real CSS, never from intent or memory.** For each state, trace the cascade: which classes are on the element, which rules match (including `:disabled`, `:active`, variant classes), and which token each property resolves to. Never copy `normal`'s tokens into a non-default state without checking — e.g. a loading button carries `disabled`, so it uses the `:disabled` tokens. A component that has CSS but no spec gets its spec derived from that CSS (document what the CSS does), and the two stay in sync from then on.

---

## 8. Documentation site architecture

8.1 **Modular construction**: elements appearing on multiple pages live in shared partials, never duplicated inline — left nav (`partials/style-guide/nav-left.liquid`, rendered with `active: '/current/url'`), right nav (future), and any other recurring element. Define a **page template** partial once 3+ pages of the same type share identical anatomy (component page / foundation page / text-prose page) — don't extract prematurely, build 2–3 manually first.
8.2 **Two required documentation layers on every component page** — see 6.3.
8.3 **Doc-shell code style**: inline code = `pos-code pos-code--small` (no dark variant); block code = `pos-code pos-code--block pos-code--numbered language-*`.
8.4 **Section structure**: `<article id="<section>">` as root for nav-anchor links to work; section title = `pos-heading-2`, subsection = `pos-heading-4 styleguide-heading-4`; live example in `<div class="styleguide-example">`, copyable snippet in `<div class="styleguide-code"><pre><code>...</code></pre></div>` using `{% capture code %}{% raw %}...{% endraw %}{% endcapture %}` so Liquid tags render as literal text.
8.5 **Escape Liquid tags in HTML content** — never write a literal `{%`/`{{` inside prose/comments/attribute values; Liquid executes it regardless of context (**Why**: Liquid executes tags anywhere; an unescaped tag returns a 500). Escape the opening brace as `&#123;`.
8.6 **Render paths always use forward slashes** — `{% render 'modules\...' %}` with backslashes returns a 500. Always `modules/common-styling/...`.
8.7 **Documentation site is itself a DS showcase** — once a DS component is stable/finalized, every element on `/style-guide` should use it (`pos-*` classes), not a bespoke `styleguide-*` one-off. Don't refactor prematurely; wait until the component is locked down.
8.8 **`.comp-doc-section` / `.comp-preview-stage` CSS is shared and load-bearing** for the scroll-sync nav and preview centering (4.8). When a component-CSS fix doesn't show up on the docs site only, first check `style-guide/styleguide.css` for a stale `.comp-preview-stage`-scoped duplicate that outranks it.
8.9 **Scrolling to a section on `component-template.liquid` — always target `#main-content` via `getBoundingClientRect`, never `scrollIntoView`/`offsetTop`/`window.scrollTo`.** The page has `body { overflow: hidden }`; the actual scroll container is `#main-content`. `scrollIntoView` tries to scroll `window`/`body` (which can't scroll) and silently does nothing to the real container. `offsetTop` is relative to `offsetParent`, which climbs to `<body>` unless an ancestor is positioned — giving a wrong target position whenever that chain doesn't match the scroll container. The correct, permanent pattern (implemented in `scrollToSectionHash()` in `src/js/styleguide-component-page/scroll-nav.ts`, reused by the "Composed of" chip navigation):
```js
var containerTop = mainContent.getBoundingClientRect().top;
var targetTop = target.getBoundingClientRect().top; // the section element itself, not its heading
var newScrollTop = mainContent.scrollTop + (targetTop - containerTop) - 16; // 16px breathing room
mainContent.scrollTo({ top: Math.max(0, newScrollTop), behavior: 'smooth' });
```
8.10 **Nav order and the scrollable component list order must always match exactly.** `nav-left.liquid`'s item order and `component-template.liquid`'s `<section data-comp-key="...">` order are two independently-editable lists describing the same sequence — adding, moving, or regrouping a component in one without the other means clicking a nav link scrolls to the wrong visual position relative to its neighbors. Whenever either list changes, check the other immediately afterward, side by side.
8.11 **`.comp-doc-content`'s `padding-block-end`/`scroll-padding-top` are intentionally `25vh`, not a fixed token — do not "fix" this to a fixed px/token value.** Purpose: without a viewport-relative bottom padding, the *last* section in the scrollable list can't scroll all the way to the top of the viewport (a fixed value would only work for one specific viewport height) — `25vh` guarantees enough scrollable room below the last section regardless of screen size, and `scroll-padding-top: 25vh` keeps that consistent with the scroll-anchor offset used elsewhere on the page.
8.12 **Component doc page layout**: component pages use only the `comp-doc-body` layout — `main.comp-doc-content#main-content` (scrollable sections) + `.comp-doc-resize-handle#comp-resize-handle` + `aside.comp-doc-right#comp-doc-right` (Variants / Usage / Tokens tabs). Each component is `<section class="comp-doc-section" data-comp-key="<name>" id="comp-section-<name>">`; scroll-sync reads `data-comp-key`. Reference: `component-template.liquid`.

---

## 9. Figma MCP — on-demand only, never default

9.1 **Component source rule**: default workflow is code-based (build/extend from this module's existing tokens/CSS/structure). Consult Figma MCP **only** when the user explicitly asks to build/update a specific component "from Figma" or supplies a Figma URL — never as a standing first step. Never silently fall back to copying an existing component when Figma was explicitly requested instead. Reference implementation for wiring patterns in general: **button** (most complex, most controls).
9.2 *(Maintainer tooling — Figma MCP tool names may differ per setup.)* **Required flow, only when Figma-driven work is explicitly requested**: (1) `figma_get_component_for_development` for the exact node(s); (2) if too large/truncated, `figma_get_design_system_summary` then re-fetch the needed node(s); (3) `figma_take_screenshot` for visual reference; (4) only then download assets and implement; (5) translate to this project's conventions (tokens, `pos-` classes, Liquid partials), reusing existing components; (6) validate against the screenshot for 1:1 parity.
9.3 **Visual match vs. token correctness — priority order: correct code (tokens + rules) > visual match > Figma's literal values.** Figma can contain human errors (hardcoded hex, wrong token on a variant). When it does, flag it explicitly (name the component/variant/property, state Figma's value vs. the DS token used and why, note Figma needs review) — never silently replicate a Figma mistake.
9.4 **Never modify Figma automatically** — main components, component sets, variables, styles are all off-limits without an explicit ask. Read-only operations (inspect, screenshot, audit, parity check) are always safe.
9.5 **Assets**: use a localhost source the Figma MCP assets endpoint returns directly — never substitute or fetch elsewhere, never placeholder over it. Icons come only from `tokens/icon-registry.json` → `npm run build:icons` (5.6); never paste SVGs from Figma or from the local `icons/` folder (licensed Streamline sources, Figma only).
9.6 **Two Figma MCP servers may be available — try the other before giving up.** The official Figma MCP (`mcp__figma-native__*`, works whenever Figma Desktop is open) and the Desktop Bridge console MCP (`mcp__figma-console__*`, requires its plugin running inside Figma) are independent. Start with the official one for reading components/variables/metadata; if it errors, try the console equivalent before reporting Figma as unavailable. If the Desktop Bridge specifically isn't responding, tell the user: "Open Plugins → Development → Figma Desktop Bridge → Run in Figma."

---

## 10. Governance & safety

10.1 **Modification safety rule** — see 5.5, applies everywhere (Figma, code, docs, tokens, specs).
10.2 **Accessibility trade-off disclosure**: a design choice that trades density for accessibility (a denser/smaller/tighter layout) must have that tradeoff stated once, plainly, when the choice is made — not repeated on every subsequent touch of the same surface once it's been acknowledged. More spacious layouts and larger touch targets are generally better for accessibility; note the tradeoff, don't block on it.
10.3 **Rule enforcement in review**: flag a DS rule violation by naming the specific rule and giving a concrete correction — e.g. "Links — underline required (4.7): this link has `text-decoration: none`; fix by adding the underline, or an interaction-color icon + underline on `:hover`." Always name the rule number and state the fix, not just the symptom.
10.4 **The old design system is not on this branch.** It lives on `master` (1.x) and is not edited from here. On this branch every DS file is the new DS: changes follow 3.2 (token values), 3.4 (structure / markup) and 5.7 (legacy components); `pos-*` class and `--pos-*` token names are never renamed anywhere (1.8).
10.5 **Risk classification for any code change** — the canonical list (used by changelog entries and `/token-sync` reports) is: 🟢 safe = new token/class/component (purely additive), token *value* change, CSS reference-chain change (name unchanged); 🟡 caution = increased CSS specificity; 🔴 dangerous = renaming/removing a class, changing HTML structure, renaming/removing a custom event, changing a `window.pos.modules.*` API, renaming/removing a configuration attribute (`data-*`, `[popovertarget]`, etc.).
10.6 **A fix with no visible effect may not have been delivered.** `pos-cli sync` can upload a `.js` / `.css` file with the wrong `Content-Type` (`text/html`); with `X-Content-Type-Options: nosniff` the browser then silently ignores it. Check the asset's headers (`curl -I <asset-url>`) before re-diagnosing correct code; `pos-cli deploy` delivers it correctly.
10.7 **A fix or decision that sets a reusable pattern becomes a numbered rule** in `RULES.md` (or `COMPONENT-RULES.md` if it is component-scoped) in the same change, with a one-line **Why**. Test: would someone building a new component without this history repeat the mistake?
10.8 **Versioning**: the module version follows semver and is kept identical in `pos-module.json`, `modules/common-styling/template-values.json` and `package.json` — patch: fixes, token corrections, copy, minor CSS; minor: a new component, variant, state or option; major: breaking changes. Edit it by hand in all three (this module has no `npm run version` script) and add the matching `CHANGELOG.md` heading.

---

## Self-audit checklist — run before reporting any generation/edit as done

1. **Everything traces to the DS?** Every color/spacing/radius/font/shadow is a token; every UI element is an existing component instance or a tokens-only temporary implementation with the promotion question asked (5.2).
2. **New visual pattern without the promotion question?** If a one-off shape/control was written instead of reusing something existing, the promotion question (5.2) must have been asked already.
3. **Any literal value anywhere?** Treat a raw hex/px/rem or ad-hoc color as a bug until proven otherwise.
4. **Accessibility baseline met?** Semantic elements, labels, `:focus-visible`, `aria-label` (+ tooltip where applicable) on icon-only controls, 44×44 hit areas.
5. **Component-specific rule checked?** See `COMPONENT-RULES.md` for fixed per-component behaviors that must never be simplified away.
6. **Component change sync done** (see below) — every layer updated, not just the CSS.
7. **Spec complete and in sync?** (When touching a component's tokens/variants/states) — full token listing (7.6), typography pair (7.2), figma:null included not dropped, every Color/Elevation token has explicit `swatch: true`/`false` (7.7), and **every state lists its full token set, not a diff against `normal`** (7.9). **If a CSS token *reference* changed, `grep tokens/components/` for the old token name — zero remaining hits, not "probably fine" (7.8).** If the component has an Intent (or other second) dimension, every dimension × state combination has its own real entry, not just the base combinations (7.11). Any embedded DS component is declared via `composedOf`, not duplicated (7.12). Any variant/kind with fewer states than the full set has its missing State controls disabled (7.13). **The spec's render include actually exists in `component-template.liquid` — `grep` for it, don't assume (7.16).** Its generated partial wraps the JSON in `{% raw %}` (7.17).
8. **Doc-shell drift check** — if a fix doesn't visually show up specifically on `/style-guide`, check for a stale duplicate override in `styleguide.css` (8.8) before re-diagnosing the component CSS.
9. **Rendered, not just authored, for anything spec/token-panel related.** A correct JSON field can still render wrong if the display path has a bug (see 7.7) — open the actual Tokens panel for at least one affected variant/state before calling a spec change done, don't just re-read the JSON.
10. **Component Spec / Tokens Panel QA Reviewer persona run and passed — mandatory, not optional.** Whenever a component's CSS, control-wiring JS, or spec JSON was touched, run the full checklist in `REVIEW-PERSONAS.md`'s "Component Spec / Tokens Panel QA Reviewer" section against it before reporting the task done. **Why**: items 7 and 9 break silently; this checklist forces the check every time.
11. **Security & Risk Reviewer persona run and passed — mandatory, not optional, on every change.** Run `REVIEW-PERSONAS.md`'s "Security & Risk Reviewer" checklist before reporting any task done: icons come only from the generated registry (no hand-edited or pasted SVG, nothing from the gitignored `icons/` folder copied into a tracked file), no secrets/credentials in anything staged, no old-DS file re-added and nothing outside this module changed (not just assumed), no unsafe dynamic-output pattern introduced, no new external resource/dependency without explicit confirmation.

### Component change sync — mandatory, every time, without being asked

| Layer | File |
| --- | --- |
| Component CSS | `style/pos-<component>.css` |
| Component JS (interactive only) | `assets/js/pos-<component>.js` |
| Component tokens (button / forms only, 2.2) | `style/pos-config.css` |
| Component spec JSON | `tokens/components/<component>.json` |
| Generated spec partial + preview | `partials/style-guide/spec-<component>.liquid` (regenerate, 6.4) + the preview markup in `component-template.liquid` for any new variant or state |
| Inventory | `COMPONENTS.md` (status, files, docs link) |
| Component doc page | `views/pages/style-guide/<component>.liquid` (or its section in `component-template.liquid`) |
| DS index | `tokens/ds-index.json` — when variants or tokens change |
| Overview page | `views/pages/style-guide/overview.liquid` — when a component is added or removed |

Applies to: token value changes, new variants, new states, description/usage updates, shadow/elevation changes, any CSS change. The Overview row only triggers on add/remove — it's a hand-maintained showcase of feature-card tiles linking into `component-template.liquid`'s sections, not auto-generated, so a new component silently doesn't appear there (and a removed one silently keeps a dead link) unless this page is edited in the same pass.
