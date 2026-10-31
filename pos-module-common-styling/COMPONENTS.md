# Component inventory

Every component of the design system with its files and docs link. Paths are relative to `modules/common-styling/public/assets/`; docs links are sections of `/style-guide/component-template`. For classes, tokens and usage, read `tokens/ds-index.json` and the component's spec JSON — this file is navigation only.

**Status:** `done` — documented and reviewed · `new` — carries the docs nav's `new` badge (recently added or reworked).
**Legacy:** existed in the old design system and keeps its structure; products already build on it, so only appearance may change (`RULES.md` 5.7). Same set as the Legacy tags on the docs site.

## Components with a spec

| Component | Spec / docs key | Description | Status | CSS | Spec JSON | Docs |
|---|---|---|---|---|---|---|
| Alert card (legacy) | `alert-card` | Inline info / warning / error / success message with optional title, icon and actions. | done | `style/pos-card.css` | `tokens/components/alert-card.json` | `#comp-section-alert-card` |
| Avatar (legacy) | `avatar` | User or entity image, initials fallback. | done | `style/pos-avatar.css` | `tokens/components/avatar.json` | `#comp-section-avatar` |
| Badge | `badge` | Dot or count indicator (up to 99+) on another element; intent: important, confirmation, brand, neutral. | new | `style/pos-badge.css` | `tokens/components/badge.json` | `#comp-section-badge` |
| Breadcrumb | `breadcrumb` | Trail of links to the current page; collapses long trails into a flyout. | done | `style/pos-breadcrumb.css` | `tokens/components/breadcrumb.json` | `#comp-section-breadcrumb` |
| Button (legacy) | `button` | Action trigger — base × intent × size × state. | done | `style/pos-button.css` | `tokens/components/button.json` | `#comp-section-button` |
| Card (legacy) | `card` | Basic / highlighted / brand / content card. | done | `style/pos-card.css` | `tokens/components/card.json` | `#comp-section-card` |
| Checkbox (legacy) | `checkbox` | Checkbox input. | done | `style/pos-forms.css` | `tokens/components/checkbox.json` | `#comp-section-checkbox` |
| Chip | `chip` | Non-interactive status / category label. | new | `style/pos-chip.css` | `tokens/components/chip.json` | `#comp-section-chip` |
| Choice button | `tile-btn` | Icon + label toggle button, horizontal or vertical. | new | `style/pos-tile-btn.css` | `tokens/components/tile-btn.json` | `#comp-section-tile-btn` |
| Code | `code` | Inline code and code block. | new | `style/pos-code.css` | `tokens/components/code.json` | `#comp-section-code` |
| Collapsible list (legacy) | `collapsible-list` | Expandable tree list. | done | `style/pos-collapsible.css` | `tokens/components/collapsible-list.json` | `#comp-section-collapsible-list` |
| Control icons | `control-icons` | Close and chevron controls. | new | `style/pos-close.css`, `style/pos-chevron.css` | `tokens/components/control-icons.json` | `#comp-section-control-icons` |
| Dialog (legacy) | `dialog` | Native modal `<dialog>`, default or simple header. | done | `style/pos-dialog.css` | `tokens/components/dialog.json` | `#comp-section-dialog` |
| Dropdown button | `dropdown-button` | Primary button that opens a short list of related actions. | new | `style/pos-dropdown-button.css` | `tokens/components/dropdown-button.json` | `#comp-section-dropdown-button` |
| Feature card | `feature-card` | Icon + title + text showcase card. | done | `style/pos-feature-card.css` | `tokens/components/feature-card.json` | `#comp-section-feature-card` |
| File upload (legacy) | `file-upload` | Drag-and-drop upload dashboard (Uppy). | done | `style/pos-upload.css` | `tokens/components/file-upload.json` | `#comp-section-file-upload` |
| Input (legacy) | `text-input` | Text-type inputs with error / success intent. | done | `style/pos-forms.css` | `tokens/components/text-input.json` | `#comp-section-text-input` |
| Link (legacy) | `link` | Inline text link — text, text + icon, external. | done | `style/pos-typography.css` | `tokens/components/link.json` | `#comp-section-link` |
| Markdown editor (legacy) | `markdown` | Markdown editor (EasyMDE). | done | `style/pos-markdown.css` | `tokens/components/markdown.json` | `#comp-section-markdown` |
| Multiselect (legacy) | `multiselect` | Multi-select dropdown with removable tags. | done | `style/pos-forms.css` | `tokens/components/multiselect.json` | `#comp-section-multiselect` |
| Pagination | `pagination` | Page navigation. | done | `style/pos-pagination.css` | `tokens/components/pagination.json` | `#comp-section-pagination` |
| Password input (legacy) | `password` | Password field with show / hide toggle and strength meter. | done | `style/pos-forms.css` | `tokens/components/password.json` | `#comp-section-password` |
| Popover | `popover-content` | Floating contextual overlay content. | new | `style/pos-popover.css` | `tokens/components/popover-content.json` | `#comp-section-popover-content` |
| Popover menu (legacy) | `popover` | Floating menu panel, normal / important items. | done | `style/pos-popover.css` | `tokens/components/popover.json` | `#comp-section-popover` |
| Radio (legacy) | `radio` | Radio input. | done | `style/pos-forms.css` | `tokens/components/radio.json` | `#comp-section-radio` |
| Segmented button | `segmented` | Mutually exclusive options — default / highlighted / subtle. | new | `style/pos-segmented-control.css` | `tokens/components/segmented.json` | `#comp-section-segmented` |
| Select (legacy) | `select` | Native `<select>`. | done | `style/pos-forms.css` | `tokens/components/select.json` | `#comp-section-select` |
| Slider | `slider` | Range input with fill and value tooltip. | new | `style/pos-slider.css` (+ `js/pos-slider.js`) | `tokens/components/slider.json` | `#comp-section-slider` |
| Switch button | `switch-card` | Full-width label + switch row. | new | `style/pos-switch-card.css` | `tokens/components/switch-card.json` | `#comp-section-switch-card` |
| Tab | `tab` | Normal (underlined) or detailed tabs. | done | `style/pos-tab.css` | `tokens/components/tab.json` | `#comp-section-tab` |
| Table (legacy) | `table` | Semantic list styled as a table on desktop, stacked cards on mobile. | done | `style/pos-table.css` | `tokens/components/table.json` | `#comp-section-table` |
| Tag (legacy) | `tag` | Static, interactive or removable label. | done | `style/pos-tag.css` | `tokens/components/tag.json` | `#comp-section-tag` |
| Textarea (legacy) | `textarea` | Multi-line input with error / success intent. | done | `style/pos-forms.css` | `tokens/components/textarea.json` | `#comp-section-textarea` |
| Toast (legacy) | `toast` | Auto-dismissing notification (`window.pos.modules.toast`). | done | `style/pos-toast.css` (+ `js/pos-toast.js`) | `tokens/components/toast.json` | `#comp-section-toast` |
| Toggle button | `toggle-btn` | Standalone on / off switch. | done | `style/pos-toggle-btn.css` | `tokens/components/toggle-btn.json` | `#comp-section-toggle-btn` |
| Tooltip | `tooltip` | Text (`data-tooltip`) or icon-text tooltip. | done | `style/pos-tooltip.css` | `tokens/components/tooltip.json` | `#comp-section-tooltip` |
| Number selector | `number-selector` | Number field with minus / plus stepper buttons, on the input field tokens. | new | `style/pos-number-selector.css` (+ `js/pos-number-selector.js`, partial `forms/number-selector`) | `tokens/components/number-selector.json` | `#comp-section-number-selector` |

## Foundation stylesheets (no spec)

| Stylesheet | What it covers |
|---|---|
| `style/pos-forms.css` | Shared form base (`.pos-form`, labels, fields) used by the input components above. |
| `style/pos-typography.css` | Headings, body text, links. |
| `style/pos-page.css` | Page-level layout helpers. |
| `style/pos-utility.css` | Utility classes. |
| `style/pos-behaviors.css` | `pos-anim-*` interaction behaviors (Interactions foundation page). |
| `style/pos-spinner.css` | Loading spinner (listed in `ds-index.json`, no spec yet). |
| `style/pos-reset.css` | Optional CSS reset (`init` with `reset: true`). |
