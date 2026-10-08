# Migration guide

What to change in your own code when the design system (`style/`, `tokens/`) changes in a way that can break it. Newest first. Full list of changes: [CHANGELOG.md](CHANGELOG.md). Deprecated names are also listed in `tokens/ds-index.json › deprecated`.

## 1.x → 2.0.0: old design system → this one

The module contains only the new design system now; the old one stays on `master` / the 1.x releases.

| Step | What you do |
|---|---|
| 1. Update the module | to the new major version. Keep `{% render 'modules/common-styling/init' %}` in your layout — the same name now loads the new DS (add `reset: true` if you used it, `pos-app` on the main container). |
| 2. Check your markup | class names are unchanged. Renamed tokens still work as aliases — move off them: `npm run codemod:deprecated -- <app dir>` (dry run, then `--write`). |
| 3. Check your own CSS | `npm run check:ui -- <app dir>` (run from a clone of this repository) lists hardcoded colors, unknown classes and tokens, inline styles. |
| 4. Review visually | light, dark and high contrast — the palette and several components look different on purpose. |
| 5. JS | popovers, dialogs, collapsible lists, code blocks and `data-load-content` initialize automatically, like before. If your page creates these instances itself, render `init` with `auto_init_components: false` (form fields — password, multiselect, slider, upload, markdown editor — always initialize). |
| 6. Themes (opt-in on `<html>`) | `pos-theme-darkEnabled` (follow the OS) · `pos-theme-dark pos-theme-darkEnabled` (dark) · `pos-theme-a11y pos-theme-a11yEnabled` (high contrast). |

Paths changed too, if you referenced files directly: `style-GY/` → `style/`, `tokens-GY/` → `tokens/`, `init-GY` → `init`. The `modules/common-styling/user/card` partial was removed (its styles were already gone). To go back: the old module version from `master`.

### Palette and token details

| Area | Before | After | What you do |
|---|---|---|---|
| semantic + component color tokens (`--pos-color-*`) | old values | new values from the 10-step scales | nothing — names are unchanged; re-check custom color pairings in your own CSS |
| legacy color primitives | `--pos-primitive-color-brand-primary-1…5`, `-brand-supplementary-1…4`, `-red-*`, `-yellow-*`, `-green-*` named steps (`deep`, `dark`, `mid`, `light`, `extra-light`, `dm-*`) | removed | replace with the semantic token for the same role (`token-map.json` descriptions); only if you really need a raw color, the nearest `--pos-primitive-color-<scale>-<100…1000>` step |
| status disabled tokens | `--pos-color-important-disabled`, `-warning-disabled`, `-confirmation-disabled` | still work (aliases of `-muted`) — **deprecated** | switch to `--pos-color-<status>-muted` |
| select arrow hover | `--pos-icon-select-arrow-hover` | still works (alias) — **deprecated** | use `--pos-icon-select-arrow` |
| small form font size | `--pos-font-size-sm`, `--pos-font-size-small` (never defined — had no effect) | — | use `--pos-font-size-body-small` |

To go back: the 1.x release on `master` (1.38.8).

### Updating your app automatically

Run from this repository, pointing at your app (never at the DS itself — it refuses):

```bash
npm run codemod:deprecated -- ../my-app          # dry run: lists every change, writes nothing
npm run codemod:deprecated -- ../my-app --write  # applies them
```

It replaces whole deprecated names from `ds-index.json › deprecated` with their replacement in your code files (CSS, Liquid, HTML, JS / TS, JSON). It skips every `modules/common-styling/` folder (the installed module and your overrides), `node_modules` and markdown. The DS keeps the deprecated aliases working either way.

## Rules that never change

- `pos-` class names and `--pos-` token names are frozen — never renamed. When a semantic token or a class is replaced, the old name stays as a permanent alias and is listed under `deprecated`.
