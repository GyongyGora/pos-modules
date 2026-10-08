# Changelog

All notable changes to the common-styling design system (`style/`, `tokens/`, `/style-guide`). Newest first. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). What to update in your own code after a breaking change: [MIGRATION.md](MIGRATION.md).

## [2.0.0] - 2026-10-14

**Breaking — next major version.** The module now contains only the new design system: the old one is removed (it stays on `master` / the 1.x releases). See MIGRATION.md › "1.x → 2.0.0". Everything below is relative to 1.38.8.

### Removed (breaking)

- The old design system: its CSS (old `style/`), the old `init` partial, the old `/style-guide` docs pages, docs partials, assets and Playwright tests (the new docs use the same route).
- Unused files: `views/partials/user/card.liquid` (its `pos-card-user*` classes had no CSS left), `js/dependency-proseMirror.js`, `js/pos-position-popover-polyfill.js`.

### Added

- Token layers: `style/pos-primitives.css` (raw palette) → `style/pos-config.css` (semantic tokens, light / dark / high contrast) → component CSS. New palette: auto-generated 10-step OKLCH scales `--pos-primitive-color-{brand-primary,brand-supplementary,red,yellow,green}-{100…1000}` — every step has the same contrast target on every scale.
- `tokens/`: `ds-index.json` (complete catalog — every component spec and component CSS has an entry, `when` + `render` per entry, `aliases`, `deprecated` list), `token-map.json`, `css-to-figma.json`, `icon-registry.json`, `themes.json` and one usage spec per component in `tokens/components/*.json`.
- New components (one CSS file each in `style/`):
  - Chip (`pos-chip.css`) — compact status label, intents neutral / success / warning / error, `--prominent` and `--tiny` variants.
  - Code (`pos-code.css`, `js/pos-code-copy.js`) — inline code and code blocks with `pos-code--numbered` line numbers, `pos-code--light` scheme and a copy button.
  - Control icons (`pos-close.css`, `pos-chevron.css`) — shared close (×) and chevron buttons.
  - Feature card (`pos-feature-card.css`) — default, small, highlighted and brand variants.
  - Segmented control (`pos-segmented-control.css`, `js/pos-segmented-control.js`) — sliding indicator, small / subtle / highlighted / disabled variants.
  - Switch card (`pos-switch-card.css`) — an on/off option with a name, an icon and a toggle.
  - Choice button (`pos-tile-btn.css`) — selectable tiles in horizontal or vertical groups.
  - Toggle button (`pos-toggle-btn.css`) — standalone on/off switch (`role="switch"`).
  - Tab (`pos-tab.css`) — underline tabs with an overflow menu, and detailed card-style tabs.
  - Tooltip (`pos-tooltip.css`) — text and icon-text types (`pos-tooltip-anchor` + `pos-tooltip` + `pos-tooltip-text`, `role="tooltip"` + `aria-describedby`).
  - Spinner (`pos-spinner.css`).
  - Dropdown button (`pos-dropdown-button.css`) — a primary button that opens a short native-popover list of related actions; init runs the Popover module on it for keyboard navigation.
  - Slider (`pos-slider.css`, `js/pos-slider.js`) — range input with inset fill, grip handle and a value tooltip while dragging.
  - Badge (`pos-badge.css`) — dot / number / max count × small / big × intent: important (default) / confirmation / brand / neutral.
  - Breadcrumb (`pos-breadcrumb.css`, `js/pos-breadcrumb.js`) — collapses to a back button with a popover of parent pages when it doesn't fit.
- `style/pos-behaviors.css` — composable interaction behaviors (`pos-anim-underline`, `-elevate`, `-colorize`, `-grow`, `-shrink`, `-stroke`, `-dismiss`) and the matching `js/pos-behavior-*.js` helpers (dismiss, expand / collapse, resize, sliding indicator, smooth scroll).
- `js/pos-prefs.js` (theme, high contrast and font size preferences with `localStorage` persistence) and `js/pos-keyboard-nav.js` (marks keyboard navigation on `<html>`).
- 15 brand themes — Default (no class) plus 14 `pos-brand-<key>` classes (`tokens/themes.json` → `npm run build:themes` → `style/pos-themes.css`, loaded by `init`): swap the brand-primary / brand-supplementary scales; light, dark and high contrast follow. `check:contrast` checks every theme.
- Wireframe theme + style (`<html class="pos-brand-wireframe pos-style-wireframe">`, `style/pos-style-wireframe.css`): black and white, hand-drawn doodle frames on cards / buttons / fields / tags / toggles, Monda headlines (bold) and button labels, no shadows; high contrast keeps plain frames.
- Scoped color modes: `pos-scheme-light` / `pos-scheme-dark` / `pos-scheme-a11y` on any element put that part of the page in another mode (tokens re-declared on the element, brand theme kept).
- New tokens: `supplementary` status family (`--pos-color-supplementary`, `-hover`, `-active`, `-muted`); `--pos-color-brand-primary-background` / `--pos-color-brand-supplementary-background` (quiet brand-tinted backgrounds); `--pos-color-important-background` / `--pos-color-warning-background` / `--pos-color-confirmation-background` (quiet status backgrounds); `--pos-color-brand-primary-frame` / `--pos-color-brand-supplementary-frame`; neutral primitives `grey-dark-5` (#0b0d11, dark page background) and `grey-dark-6` (#5c6270, light supplementary text).
- Card and feature card: four background variants — default, highlighted, brand primary (`pos-card-brand-primary` / `pos-feature-card--brand-primary`) and brand supplementary (`pos-card-brand-supplementary` / `pos-feature-card--brand-supplementary`).
- `icon` partial: optional `aria_hidden: true` for decorative icons next to text.
- Docs site (`/style-guide`): every component with Variants / Usage / Tokens tabs; Foundations (Tokens, Palettes, Typography, Icons, Elevation, Interactions); Themes page with a live preview and an Export CSS button (`pos-theme-<key>.css` with brand scales, headline font and radii as `:root` overrides); Popover content section; migration plan.
- `AGENTS.md` and `llms.txt` — entry points for agents that build UI with the DS.
- `npm run check:catalog` (fails when `ds-index.json`, a spec, `AGENTS.md` or `llms.txt` lists a component, class or token that doesn't exist), `npm run check:contrast`, `npm run check:ui`.
- `npm run codemod:deprecated -- <app dir> [--write]` — opt-in codemod that moves an app's own code off deprecated DS names (dry run by default; never touches the DS).

### Changed

- Every semantic and component color token now points at the new scales (token names unchanged, values changed) — see MIGRATION.md.
- Disabled filled controls (checked toggle button, switch card, checkbox, radio, primary button) use `--pos-color-button-primary-disabled-background` / `--pos-color-button-primary-disabled-frame`. In dark mode, disabled filled controls are gray; thin elements (lines, icons, text) use brand 700.
- `init` also loads the Google Sans (headings), Roboto Mono (code) and Monda (Wireframe theme) web fonts — before, only the docs layout loaded them, so apps fell back to system fonts.
- `init`: new `auto_init_components: false` parameter turns off the automatic initialization of popovers, dialogs, collapsible lists, code highlighting and `data-load-content` (on by default, as in 1.x); form fields (password, multiselect, slider, upload, markdown editor) always initialize.
- Icons: the icon set is now **Tabler Icons** (open source, MIT) instead of Streamline. Same logical names (`icon: 'delete'` etc.), so no markup changes; outline icons use a 1.5px stroke. Intentional difference from Figma, which keeps the licensed Streamline set. `icon.liquid` is generated from `tokens/icon-registry.json` by `npm run build:icons`.
- `--pos-color-interactive-inverted` is the graphic token in light and dark mode too (`icon-interactive-inverted`: brand-primary 500 light / 600 dark), as it already was in high contrast.
- Status muted backgrounds one step stronger (light 300, dark + high contrast 800).
- Standout background / supplementary text and dark interactive icon hover / active follow the brand scale.
- `grey-dark-4` (dark highlight background) #121418 → #15171b; `grey` #6b7280 → #646b79.
- High contrast: frames on tables (card variant included) and other containers via `--pos-color-frame-transparent`; no elevation; dark cyan darkened to 4.5:1; inverted-button frames, focus ring on inverted surfaces and button hover backgrounds adjusted.
- High contrast: gradient 2 is the white standout surface (black inverted text on it, 17:1); gradient 1 stays the black page background.
- Cards: `pos-card` (default, highlighted, content) has the subtle frame of the feature card (`--pos-color-frame`); brand-tinted cards and feature cards get a colored frame. Hover (elevation; title color + underline; pointer) only on interactive cards — a static card stays still (COMPONENT-RULES.md › Cards).
- Alert card: optional title, icon and actions row; flat elevation.
- Toast: warning type, optional severity icon (`icon` setting), shared close button and dismiss animation.
- Tag: only the neutral tag keeps a visible stroke. Tag + chip warning text uses `--pos-color-warning`.
- Form controls use `--pos-font-size-body-small`.
- Disabled elements show the `not-allowed` cursor over their whole area — label, track, icon, remove button and other children included — like disabled buttons (switch card, tile button, segmented control, chevron, close, tag, link, multiselect, password toggle, slider, popover / dropdown items). They no longer use `pointer-events: none`; hover and press styles skip disabled elements, and `init` blocks clicks on `[aria-disabled="true"]` elements and `.pos-link--disabled` links with one capture-phase listener. `npm run check:ui` flags `pointer-events: none` on a disabled state (RULES.md 4.12).

### Fixed

- Hover feedback on checked / on / selected elements whose click still acts: checkbox (checked), toggle button and the switch card's toggle (both states, HC frame), selected tag (no stray underline). The active tab no longer turns gray on hover. Rule: RULES.md 4.5b.
- Checkbox / radio losing their checked look on hover.
- Table card variant had no high-contrast frame on desktop.
- A linked feature card (`a.pos-feature-card`) has a keyboard focus ring (it had none — the reset removes the browser one).
- A select with a chosen option (not the empty placeholder option) shows prominent bold text like every other filled field; the open option list stays regular.
- In `.pos-form-simple`, select, password, input-wrapper and multiselect fields get the same label spacing as text inputs.
- `<select>` in `.pos-form` / `.pos-form-select` inherits the page font like the text inputs (it showed the browser's small system font).

### Deprecated

- `--pos-color-important-disabled`, `--pos-color-warning-disabled`, `--pos-color-confirmation-disabled` (and their light / dark / HC mode variables) → use `-muted`.
- `--pos-icon-select-arrow-hover` → use `--pos-icon-select-arrow`.

## [1.38.8]

The last release with the old design system (it stays on `master`). Changes before the new design system are not listed here.
