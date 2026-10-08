# Component Rules — pos-module-common-styling

Component-specific consistency rules: a fixed, deliberate behavior for one component (or one small family of components) that must never be simplified away or reinvented differently later. General cross-component rules (naming, accessibility, tokens) belong in `RULES.md` instead — this file is only for rules scoped to a specific component's own established behavior.

**When to add an entry here:** whenever a component-level rule is explained that must be kept consistent going forward (e.g. "this component's hover state always works like X, don't change it"), record it here in the same change.

**Format for each entry:** component name as heading, the rule itself, and — where possible — the exact selector/file that is the reference implementation, so a future edit can be checked against it directly.

---

## Form inputs (`pos-forms.css`) — 3-orthogonal-states interaction model

Applies to Input / Textarea / Select (`pos-forms.css`). Three independent state signals apply on top of each other — never collapse them into a simpler model:

1. **Hover / focus** — change `border-color` and `background-color` via `--pos-color-input-hover-*` / `--pos-color-input-active-*` tokens, and (unlike a plain border-only model) also update text color via the matching `-hover-text` / `-active-text` token. Reference: `.pos-form-input:not(:disabled):not([readonly]):not(:focus-visible):hover` and `:focus-visible` blocks in `pos-forms.css`.
2. **Has a typed value** — independent of focus/hover, a field with a real value bolds to `--pos-color-content-text-prominent` via the `:not(:placeholder-shown)` selector. Reference: `pos-forms.css` around the `:not(:placeholder-shown)` rule block (excludes `select` and `.pos-form-multiselect-input`, which are vacuously `:not(:placeholder-shown)` as non-text elements).
3. **Validity** — driven entirely by the `aria-invalid="true"|"false"` attribute (not a custom boolean prop/class). Reference: `[aria-invalid="true"]` / `[aria-invalid="false"]` rule blocks in `pos-forms.css`.

When building a new form-like component (or editing an existing one), reuse this exact 3-signal model rather than inventing a simpler one — e.g. don't make hover change only the border color and skip the text-color token dedicated for that state, and don't add a custom `invalid`/`error` boolean prop instead of relying on `aria-invalid`.

**Focus outline ring — keyboard-Tab navigation only, never on a plain click.** The 2px `outline: solid var(--pos-color-focused)` ring on a focused field only appears when `html[data-keyboard-nav]` is present (set by `pos-keyboard-nav.js`, which toggles it on `Tab` keydown and clears it on `mousedown`) — not on every `:focus-visible` match. This exists because Chrome/Firefox treat text-editing controls as `:focus-visible` even on a plain mouse click, so without this gate every click would show the ring too. A plain click still gets the border/background/text-color change from the hover/focus signal above — only the extra outline ring is Tab-gated. Reference: the `html[data-keyboard-nav] .pos-form-input:focus-visible` block in `pos-forms.css`. Any new interactive component that wants a focus ring beyond the standard border/background change should reuse this same gating pattern, not a bare `:focus-visible` selector.

---

## Cards — hover only on interactive cards

A card shows hover feedback **only when it is interactive**. Applies to every card component (`pos-card-content`, `pos-feature-card`, and any future card-like component).

| Card | Hover elevation (blurred shadow) | Title: interactive color + underline | Pointer (hand) cursor |
|---|---|---|---|
| static — no link or button inside, not a link itself | none | none | none (default arrow) |
| holds a link or button (e.g. a feature card with action buttons) | yes | no — the title isn't the link | yes, on the whole card |
| the card itself is the link (`a.pos-feature-card`, or a content card whose title sits in `.pos-card-content-permalink`) | yes | yes | yes, on the whole card |

Implementation: `a.pos-feature-card:hover, .pos-feature-card:has(a, button):hover` / `.pos-card-content:has(a, button):hover` — never a bare `.pos-…-card:hover`. A linked card also needs a keyboard focus ring (`a.pos-feature-card:focus-visible`).

## Card / Feature card — interactive title: prominent at rest, interactive color + underline on hover

Verified consistent across both `pos-card.css` (`.pos-card-content-title`) and `pos-feature-card.css` (`.pos-feature-card-title`): `--pos-color-content-text-prominent` at rest (looks like a plain heading, not a link), switching to `--pos-color-interactive-text` specifically when the card's wrapping link is hovered (`.pos-card-content-permalink:hover .pos-card-content-title` / `.pos-feature-card:hover .pos-feature-card-title`) — paired with an animated underline reveal (`background-size` transition on a `<span>` pseudo-underline), never a static `text-decoration`. This is the same subdued-until-hover pattern as icon category 3 and the text-interactive token (`RULES.md` §4.6, §4.10) — a card title should not look like a link at rest, but must unambiguously become one on hover. Reuse this exact pattern (prominent-text rest color + wrapper-hover-scoped interactive-text + animated underline span) for any future card-like component with a clickable title, rather than making the title permanently `--pos-color-interactive-text` or adding a static underline.

**Not yet built anywhere in this DS**: a "restrained interactive link" variant of `pos-link` (e.g. for a footer link list) — grey/subdued at rest using `--pos-color-content-text-interactive`, switching to `--pos-color-interactive-text`/`-hover` on hover, following the exact same category-3 pattern as the icon and card cases above. The token-level rule already exists and supports this; the component variant itself doesn't exist yet. If asked to build one, follow this same rest-subdued/hover-bold structure rather than inventing a different treatment.

## Legacy components — CSS changes are appearance-only, never structural

Applies to the components carried over from the old DS: those marked Legacy on the docs site and in `COMPONENTS.md` (Alert card, Avatar, Button, Card, Checkbox, Collapsible list, Dialog, File upload, Input, Link, Markdown editor, Multiselect, Password input, Popover menu, Radio, Select, Table, Tag, Textarea, Toast). Their structure is what products already build on. Their CSS may freely add or change **visual / appearance** properties: `color`, `background-color`/`background-image`, `box-shadow`, `border-color`/`outline-color`, `transition`/`animation`, `opacity`, and `@media (forced-colors: active)` overrides.

**Never change in these components' CSS without an explicit maintainer decision** (and a breaking entry in `CHANGELOG.md` / `MIGRATION.md`, `RULES.md` 3.4): `display`, `flex-direction`/`grid-*`, `overflow`, `width`/`height`/`min-*`/`max-*`, `margin`/`padding`/`gap`, `position`/`top`/`left`/`inset`, or layout-affecting `transform`/`scale`.

**Why:** products already use these components with their current structure. A structural change reaches every one of them and can break their layout — appearance-only changes never affect box dimensions or element flow, so they're safe.

**If a documentation preview looks broken because structural CSS the doc site doesn't provide is missing**, fix it in the doc-site wrapper (`component-template.liquid`'s surrounding markup) — never by adding structural rules to the component's own CSS file.

## Link (`pos-link`) — variants and external links

Variants: text only (any context); text + leading icon (inline, single-line, same-tab navigation); external (inline, single-line, trailing `external-link` icon). The icon variants are never used multi-line or as block-level links.

Every `target="_blank"` or off-site link uses the external variant with `rel="noopener noreferrer"`, the icon `aria-hidden="true" focusable="false"`, and `<span class="pos-label">(opens in new tab)</span>` inside the anchor. Reference: `tokens/components/link.json › usageExample`.

## Every interactive component — disabled cursor and activation

- Disabled = `cursor: not-allowed` over the whole hit area (element, label, track, thumb, icon, children), like a disabled button. Never `pointer-events: none` on a disabled element — it hides the cursor (`npm run check:ui` › `disabled-pointer-events`).
- Activation is blocked by native `disabled`, or for `[aria-disabled="true"]` / `.pos-link--disabled` by the global capture-phase click guard in `views/partials/init.liquid`; JS that acts on a click of a non-disabled child of a disabled field checks the field itself (`pos-forms-password.js` toggle, `pos-slider.js` drag).
- Hover / active styles exclude disabled: `:where(:not(:disabled, [aria-disabled="true"], [aria-disabled="true"] *))` on the hover selector (same specificity). Reference: `.pos-tile-btn:hover` in `pos-tile-btn.css`, `.pos-tag[aria-disabled="true"] *` in `pos-tag.css`.
- **Why:** `pointer-events: none` sent the pointer to the parent, so disabled chips, tiles, switch cards and links showed an arrow or a hand instead of the not-allowed cursor (RULES.md 4.12).

## Toggle button, Switch card, Checkbox, Radio — disabled checked fill

- The checked + disabled fill (and frame) uses the primary button's disabled tokens: `--pos-color-button-primary-disabled-background` / `--pos-color-button-primary-disabled-frame`. This is a documented exception to `RULES.md` §2.2 (only button / forms get component tokens).
- **Why:** every filled control should look the same when disabled; no semantic token gives the light / dark / HC split (brand 300 / gray / disabled gray).
- **How to apply:** don't introduce a separate disabled fill for these four controls. Retheming the primary button's disabled tokens changes them too — that is intended. Thin disabled elements (icons, text, unchecked frames) keep `--pos-color-interactive-disabled` / `--pos-color-icon-interactive-disabled`.
