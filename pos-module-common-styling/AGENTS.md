# AGENTS.md — building UI with pOS common-styling

For agents that **build pages and partials in a platformOS app** with this design system. Developing the DS itself (new components, tokens, docs site) → read `CLAUDE.md` and `RULES.md` instead.

Paths below are relative to the module: `modules/common-styling/public/…` (the same path in this repo and in an app that installed the module).

## 1. Read in this order

| Step | File | Use it for |
|---|---|---|
| 1 | `assets/tokens/ds-index.json` | every component, its classes, `render` call, constraints, `aliases`, layout + color `rules` — pick components here |
| 2 | `assets/tokens/components/<name>.json` | only for the components you use: `usageExample` (copy it), `props`, `do` / `dont`, `accessibility`, tokens per state |
| 3 | `assets/tokens/token-map.json` | token lookup: CSS name, Figma name, light / dark / HC value, description |
| — | `/style-guide` on the instance | live docs with every variant |

A name you know from another library (Switch, Modal, TextField, Badge, …) → `ds-index.json › aliases.names`. Something with no component here (Box, Flex, Stack, Grid, Heading, Icon) → `aliases.not_in_ds`.

## 2. Setup (layout)

```liquid
<head>
  {% render 'modules/common-styling/init', reset: true %}
  <!-- your own CSS after the init, so it can override -->
</head>
<body>
  <main class="pos-app"> … </main>
</body>
```

| Need | Do |
|---|---|
| theme | on `<html>`: nothing = light · `pos-theme-darkEnabled` = follow the OS · `pos-theme-dark pos-theme-darkEnabled` = dark · `pos-theme-a11y pos-theme-a11yEnabled` = high contrast |
| one part of the page in another mode | `pos-scheme-light` / `pos-scheme-dark` / `pos-scheme-a11y` on any element — everything inside uses that mode (brand theme kept); give the element a background |
| brand theme | `pos-brand-<key>` on `<html>` (keys: `ds-index.json › themes`, preview: `/style-guide/foundations/themes`) — swaps the brand color scales, everything else follows; no class = Default |
| icon | `{% render 'modules/common-styling/icon', icon: 'name' %}` — inline SVG, color = `currentColor`; names (logical name + purpose) in `tokens/icon-registry.json` (`icon.liquid` is generated from it) |
| toasts | `{% render 'modules/common-styling/toasts', params: flash %}` once in the layout; from JS `new pos.modules.toast('<severity>', '<message>')` |
| change a module file | never edit it — copy it to `app/modules/common-styling/public/…` and change the copy |

## 3. Hard rules

| Rule | Value |
|---|---|
| colors | only semantic tokens `--pos-color-*` — never hex / rgb / named colors, never `--pos-primitive-*` |
| spacing, radius, sizes | tokens only: `layout.spacing` in `ds-index.json`, `--pos-padding-*`, `--pos-radius-*`, `--pos-size-icon-*` — no raw px / rem |
| classes | only classes listed in `ds-index.json` or a spec — never invent a `pos-` class; your own classes use your own prefix |
| tokens | never create, rename or redefine a `--pos-*` token |
| inline `style` | no |
| `render` paths | forward slashes: `'modules/common-styling/…'` (a backslash is a 500 error) |
| primary button | max 1 per screen (`pos-button pos-button-primary`) |
| form fields | every input has a visible `<label>`; errors via `pos-form-error` + `aria-invalid="true"` |
| icon-only button | `aria-label` + `data-tooltip` with the same text |
| status | never color alone — icon + text |
| dark / HC | no `prefers-color-scheme` in your CSS; themes are token overrides. HC has no shadows — a container needs a frame: `border: 1px solid var(--pos-color-frame-transparent)` (invisible in light / dark) |

## 4. Colors — what goes on what

All pairs below meet WCAG AA (text 4.5:1, icons / graphics 3:1) in light, dark and high contrast.

| Background | Text | Icons / graphics |
|---|---|---|
| `--pos-color-page-background`, `--pos-color-content-background`, `--pos-color-highlight-background`, brand-tinted cards / sections `--pos-color-brand-primary-background`, `--pos-color-brand-supplementary-background` (frame: `--pos-color-brand-primary-frame` / `-supplementary-frame`), status boxes / sections `--pos-color-important-background`, `--pos-color-warning-background`, `--pos-color-confirmation-background` (with icon + text) | `--pos-color-content-text`, headings `--pos-color-content-text-prominent`, secondary `--pos-color-content-text-supplementary`, links `--pos-color-interactive-text` | `--pos-color-content-icon`, interactive `--pos-color-interactive`, subdued interactive `--pos-color-content-icon-interactive` |
| `--pos-color-standout-background` | `--pos-color-standout-text`, `--pos-color-standout-text-supplementary` | `--pos-color-standout-text` |
| `--pos-color-inverted-background` | `--pos-color-content-inverted-text` | `--pos-color-content-inverted-icon` |
| `--pos-color-<status>-muted` (`important`, `warning`, `confirmation`, `supplementary`) | `--pos-color-<status>` | `--pos-color-<status>` |
| gradient 1 (`--pos-color-gradient1-from` → `-to`) | `--pos-color-content-text` | `--pos-color-content-icon` |
| gradient 2 (`--pos-color-gradient2-from` → `-to`) | `--pos-color-content-inverted-text` | `--pos-color-content-inverted-icon` |

In high contrast the gradients are flat: gradient 1 = the black page background (white normal text), gradient 2 = the white standout surface (black inverted text).

| Token pair | Meaning |
|---|---|
| `--pos-color-interactive-text` / `--pos-color-interactive` | link and interactive **text** / interactive **icons and graphics** — not interchangeable |
| `--pos-color-important` · `-warning` · `-confirmation` · `-supplementary` | status color, for text and icons alike; `-muted` = its background |
| `--pos-color-frame` / `--pos-color-frame-transparent` | visible divider / frame that only shows in high contrast |

## 5. Components

`use via`: **partial** = call the `render` in its `ds-index.json` entry; **markup** = copy the spec's `usageExample`.

| ds-index key | Also known as | Main class | Use via | Spec (`components/`) |
|---|---|---|---|---|
| `alert-card` | AlertCard, Alert, Banner, Callout, InlineMessage | `pos-card pos-card-alert pos-card-alert-<type>` | partial | `alert-card.json` |
| `avatar` | Avatar | `pos-avatar` | markup | `avatar.json` |
| `badge` | Badge, Counter, NotificationBadge | `pos-badge` | markup | `badge.json` |
| `breadcrumb` | Breadcrumb, Breadcrumbs | `pos-breadcrumb` | markup | `breadcrumb.json` |
| `button` | Button, IconButton | `pos-button` | markup | `button.json` |
| `card` | Card | `pos-card` | partial | `card.json` |
| `checkbox` | Checkbox | `pos-form-checkbox` | markup | `checkbox.json` |
| `chip` | Chip, StatusBadge, Pill | `pos-chip` | markup | `chip.json` |
| `code` | Code, CodeBlock | `pos-code / pos-code--block` | markup | `code.json` |
| `collapsible` | Collapsible, CollapsibleList, Accordion, Disclosure, TreeView | `pos-collapsible` | markup | `collapsible-list.json` |
| `control-icons` | ControlIcons, CloseButton, Chevron | `pos-close / pos-chevron` | markup | `control-icons.json` |
| `dropdown-button` | DropdownButton, MenuButton | `pos-dropdown-button` | markup | `dropdown-button.json` |
| `dialog` | Dialog, Modal, AlertDialog, ConfirmDialog | `pos-dialog` | partial | `dialog.json` |
| `feature-card` | FeatureCard, Card | `pos-feature-card` | markup | `feature-card.json` |
| `forms` | Forms, FormControl, Field, FormHelperText, FormErrorMessage, Label | `pos-form / pos-form-simple` | markup | — (one spec per control) |
| `link` | Link, Anchor | `pos-link` | markup | `link.json` |
| `markdown` | Markdown, MarkdownEditor, RichTextEditor | `pos-markdown` | partial | `markdown.json` |
| `multiselect` | Multiselect, Combobox, MultiSelect | `pos-form-multiselect` | partial | `multiselect.json` |
| `pagination` | Pagination | `pos-pagination` | partial | `pagination.json` |
| `password` | Password, PasswordInput | `pos-form-password` | partial | `password.json` |
| `popover` | Popover, PopoverContent, Dropdown, Menu, MenuItem, ContextMenu | `pos-popover` | markup | `popover.json`, `popover-content.json` |
| `radio` | Radio, RadioGroup | `pos-form-radio` | markup | `radio.json` |
| `segmented-control` | SegmentedControl, Segmented, ButtonGroup, ToggleGroup | `pos-segmented-control` | markup | `segmented.json` |
| `select` | Select, Dropdown | `pos-form-select` | markup | `select.json` |
| `slider` | Slider, Range | `pos-slider-field` + `pos-slider` | markup + js | `slider.json` |
| `spinner` | Spinner, Loader | `pos-spinner` | markup | — |
| `switch-card` | SwitchCard, Switch, Toggle | `pos-switch-card` | markup | `switch-card.json` |
| `tab` | Tab, Tabs | `pos-tab / pos-tab-detailed` | markup | `tab.json` |
| `table` | Table, DataTable, TableRow, TableCell | `pos-table` | markup | `table.json` |
| `tag` | Tag, Pill | `pos-tag` | markup | `tag.json` |
| `text-input` | TextInput, TextField, Input | `pos-form-input` | markup | `text-input.json` |
| `textarea` | Textarea, TextArea | `pos-form-input` | markup | `textarea.json` |
| `tile-btn` | TileBtn, ButtonGroup, ToggleGroup, RadioCards | `pos-tile-btn` | markup | `tile-btn.json` |
| `toast` | Toast, Toaster, Snackbar, Notification | `pos-toast` | partial | `toast.json` |
| `toggle-btn` | ToggleBtn, Switch, Toggle | `pos-toggle-btn` | markup | `toggle-btn.json` |
| `tooltip` | Tooltip | `[data-tooltip]` (text), `pos-tooltip-anchor` + `pos-tooltip` (icon-text) | markup | `tooltip.json` |
| `upload` | Upload, FileUpload, Dropzone | `pos-upload` | partial | `file-upload.json` |

## 6. Patterns

```html
<!-- primary + secondary action -->
<button type="button" class="pos-button pos-button-primary">Save</button>
<button type="button" class="pos-button">Cancel</button>

<!-- icon-only button -->
<button type="button" class="pos-button pos-button--icon-only" aria-label="Add new" data-tooltip="Add new">…icon…</button>

<!-- form field -->
<form class="pos-form pos-form-simple" action="#" novalidate>
  <fieldset>
    <label for="email"><strong>E-mail</strong></label>
    <input type="email" id="email" class="pos-form-input" required>
    <p class="pos-form-error" hidden>Wrong email address</p>
  </fieldset>
</form>
```

```liquid
{% render 'modules/common-styling/content/alert', type: 'success', title: 'Saved', content: 'Your changes are live.' %}
{% render 'modules/common-styling/forms/password', name: 'password', id: 'password' %}
```

## 7. Keeping this file true

`npm run check:catalog` fails when this file, `ds-index.json` or a spec drifts from the real DS (missing component, unknown class or token). Check your own UI code with `npm run check:ui -- <files or dir>` (hardcoded colors, invented classes, unknown / primitive / deprecated tokens, inline styles) and color changes with `npm run check:contrast`. Claude Code users: the `build-ui-with-pos-ds` skill and the `ds-guard` agent (`.claude/`) do this for you. Changes to the DS itself are tracked in `CHANGELOG.md`; what to update after a breaking change in `MIGRATION.md`.
