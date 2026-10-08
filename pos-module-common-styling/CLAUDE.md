# CLAUDE.md — pos-module-common-styling

Project setup and file locations for maintainers and coding agents working on this module (for building UI *with* the DS, start at [AGENTS.md](./AGENTS.md)). **All rules — CSS, tokens, components, workflow, Figma, documentation site — live in [RULES.md](./RULES.md).** This file covers where things are, not how to build them. See `PROJECT.md` for project goals and vision.

**Language:** All documentation, code comments, commit messages, changelog entries, and project files must be written in English.

## Before you start

1. **Always read before generating components or UI:**
  - `RULES.md` — the single consolidated rulebook (naming, tokens, CSS, components, workflow, specs, docs site, Figma, governance)
  - `COMPONENT-RULES.md` — component-specific consistency rules (fixed behaviors scoped to one component, e.g. form input interaction states) — check whether the component you're touching has an entry here
  - `REVIEW-PERSONAS.md`'s "Component Spec / Tokens Panel QA Reviewer" — mandatory self-check, not optional, whenever a component's CSS, control-wiring JS, or `tokens/components/<name>.json` spec is touched; run it before reporting the task done (see `RULES.md`'s self-audit checklist, item 10)
  - `REVIEW-PERSONAS.md`'s "Security & Risk Reviewer" — mandatory self-check, not optional, on every change to this repo (licensed assets, secrets, frozen files, unsafe dynamic output, new external dependencies); run it before reporting the task done (see `RULES.md`'s self-audit checklist, item 11)
2. **Read when adding a new component:** `RULES.md` §6 (workflow checklist) and §7 (component spec rules).
3. **Look up when needed** — reference files (token lookups, Figma references) only when you need a specific value.

---

## File structure rules

### 1. Token definitions

Two completely different kinds of JSON exist under `tokens/` — easy to confuse, easy to mix up:

- **The token CSS** (`style/pos-primitives.css` + `pos-config.css`, below) is the single **value** source of truth — what a token *is worth*, kept in sync with Figma. `tokens/token-map.json` is the resolved, machine-readable list of every token (CSS name, Figma name, light/dark/HC value), generated from that CSS. There is no `pos-tokens.json` (it was planned, never created).
- **`components/<name>.json`** (also below, and see `RULES.md` §7) is per-component **usage** documentation — which tokens a given component *applies*, and where (variant/state/section). It stores no token values of its own; it only references token names already defined in the token CSS / `token-map.json`. This is what drives the docs site's Tokens panel and AI-assisted component generation.

| What | Description | Location |
| --- | --- | --- |
| Token value source + resolved list | Values live in the primitive + semantic CSS files below — the single source of truth, kept in sync with Figma. `token-map.json` lists every token resolved (CSS name ↔ Figma name, light/dark/HC values) for the docs Tokens page and AI lookups; refresh it whenever the token CSS changes. **Never create new tokens or change token values without explicit user confirmation.** | `modules/common-styling/public/assets/tokens/token-map.json` (no `pos-tokens.json` exists — the planned split into separate primitives/semantics/theme files has not happened yet) |
| Primitive tokens CSS | Raw, unnamed values. The palette. | `modules/common-styling/public/assets/style/pos-primitives.css` |
| Semantic + theme tokens CSS | Purpose-based tokens referencing primitives, plus all theme overrides (light/dark/HC) in the same file — not yet split into separate `pos-semantics.css`/`pos-theme-<name>.css` files, despite that being the eventual goal. | `modules/common-styling/public/assets/style/pos-config.css` |
| Component tokens CSS | Component-scoped tokens referencing semantic tokens (button/forms only — see RULES.md §2.2; every other component uses semantic tokens directly, no dedicated layer). | `modules/common-styling/public/assets/style/pos-config.css` (the `--pos-color-button-*` / `--pos-color-input-*` groups) |
| Per-component token **usage** spec (JSON, not CSS) | Documents which tokens a specific component applies, per variant × state × section (Color/Layout/Typography/Elevation/…) — the source for the docs site's Tokens panel and AI-assisted generation. Does not define token values. | `modules/common-styling/public/assets/tokens/components/<name>.json` — one file per component; see `RULES.md` §7 for the full spec-writing rules. |
| Token transformation | Pipeline to export tokens to other formats (JSON, Swift, Compose, etc.) | *to be defined* |

### 2. Component library

> This branch holds only the 2.x design system. The old one (1.x) ships on `master`. Never re-add it here, never change `master` from this work.

> Full component inventory with status, file locations and doc links: [COMPONENTS.md](./COMPONENTS.md)

| What | Description | Location |
| --- | --- | --- |
| Component CSS | One file per component. | `modules/common-styling/public/assets/style/pos-<component>.css` |
| Liquid partials | Reusable server-side component templates. | `modules/common-styling/public/views/partials/` |
| Component documentation pages | New DS documentation, one section per component. | `modules/common-styling/public/views/pages/style-guide/component-template.liquid` |
| DS documentation | Headless, framework-agnostic DS documentation (preview instance). | https://gyongy-design-system.staging.oregon.platform-os.com/style-guide |
| Figma DS source | Connected Figma design system — source of truth for components, tokens, and visual design (internal use only; access required). | https://www.figma.com/design/7LdPQ5BEpKgFvxqnjvwH5b/pOS-Core---components?node-id=442-3397 |

Other frequently-needed deep links into the same Figma file (all `7LdPQ5BEpKgFvxqnjvwH5b`; internal use only, access required):
- Elevation (effect styles) — `?node-id=13390-131213`
- Avatar components — `?node-id=9538-138979`
- Pagination — `?node-id=16933-117507`
- Checkbox / Radio — `?node-id=4377-43547`
- Popover menu items — `?node-id=4743-47864`

One CSS file per component, never multiple unrelated components in one file. See `RULES.md` §9.1 for the component-source rule (code-based by default, Figma only on explicit request) and §6 for the full new-component workflow.

### 3. Frameworks & libraries

| What | Value |
| --- | --- |
| UI framework | None — vanilla JS only. No React, Vue, or other component frameworks. |
| Styling approach | Native CSS with CSS custom properties and `@layer`. No Tailwind, no CSS-in-JS. |
| Server-side templating | Liquid (platformOS) |
| Build system | Rollup (`npm run build`) — used for JS and CSS asset bundling. |
| Package manager | npm |
| Testing | Playwright for E2E (`npm run pw-tests`) |

### 4. Asset management

| What | Description | Location |
| --- | --- | --- |
| CSS assets | Stylesheets served via platformOS CDN. Referenced with `asset_url` filter in Liquid. | `modules/common-styling/public/assets/style/` |
| JS assets | Compiled scripts served via platformOS CDN. | `modules/common-styling/public/assets/` |
| CDN | Served automatically by platformOS infrastructure via the `asset_url` Liquid filter. No manual CDN config required. | — |

### 5. Icon system

See `RULES.md` §5.6 for the icon rules (Tabler, `tokens/icon-registry.json`, `npm run build:icons`, inline `fill:none`).

| What | Description |
| --- | --- |
| Icon rendering | `{% render 'modules/common-styling/icon', icon: 'icon-name' %}` Liquid partial. |
| Icon storage | `modules/common-styling/public/views/partials/icon.liquid` — generated by `npm run build:icons` from `tokens/icon-registry.json`; never hand-edited. |

### 6. Styling approach

| What | Value |
| --- | --- |
| CSS methodology | Native CSS with `@layer common-styling { }` for low specificity and easy overrides. |
| Global styles | `pos-reset.css` (base reset), `pos-config.css` (all token definitions). |
| Theming | Color modes (light / dark / HC) are token overrides in `pos-config.css`, switched by classes on `<html>` (`pos-theme-dark pos-theme-darkEnabled`, `pos-theme-a11y pos-theme-a11yEnabled`) or per section (`pos-scheme-*`). Brand themes: `pos-themes.css` (`pos-brand-<key>`, generated from `tokens/themes.json` by `npm run build:themes`). No `prefers-color-scheme` media queries in component files. |
| Inline styles | Not allowed unless absolutely necessary and no DS token or component covers the case. |

### 7. Project structure

| What | Location |
| --- | --- |
| Module root | `modules/common-styling/` |
| Public assets (CSS, JS) | `modules/common-styling/public/assets/` |
| DS styles (components + tokens CSS) | `modules/common-styling/public/assets/style/` |
| Token files | `modules/common-styling/public/assets/tokens/` |
| Liquid pages (routes) | `modules/common-styling/public/views/pages/` |
| Liquid partials | `modules/common-styling/public/views/partials/` |
| Layouts | `modules/common-styling/public/views/layouts/` |
| Style guide JS + CSS | `modules/common-styling/public/assets/style-guide/` |
| Style guide **page** JS source (TypeScript, compiled) | `src/js/styleguide-component-page.ts` + `src/js/styleguide-component-page/` — the one exception to "public/assets/js is the source": `modules/common-styling/public/assets/js/styleguide-component-page.js` is a **build artifact**, not hand-edited. Run `npm run build` (or `npm run deploy`/`deploy:dev`, which include it) after editing the `.ts` source, or the deployed file goes stale. Two more generated files: `js/dependency-uppy.js` (Rollup, from `src/js/`) and `style/pos-themes.css` (`npm run build:themes`). Every other file under `public/assets/` is edited directly, no build step. |
| Example app (not distributed) | `app/` |
| Build config | `rollup.config.mjs` (root) |

---

## File roles — what to use and when

| File | Purpose | Used for UI generation |
| --- | --- | --- |
| `RULES.md` | The rulebook — CSS, tokens, components, workflow, docs site, Figma, governance | ✅ Always active |
| `tokens/ds-index.json` | Single-file DS overview — all components, classes, spacing tokens, constraints. **Read this first** when building any multi-component surface. | ✅ Start here |
| `tokens/css-to-figma.json` → `map` | Direct `--pos-*` CSS variable → Figma name lookup. | ✅ Token lookup |
| `tokens/components/<name>.json` | Per-component spec — variants, states, tokens, props, composedOf, usageExample. | ✅ Component data |
| `COMPONENTS.md` | Inventory — status, file locations, doc links | Navigation only — finding where things are |
| `CLAUDE.md` | This file — project setup and file locations | ✅ Always active |
| `PROJECT.md` | Vision, architecture, decisions | Context only — not for generation |

### JSON file header rule

Every JSON file in `tokens/` must begin with a `_about` field explaining: what the file is, why it was created, what it contains, who its primary audience is (human/AI/both), and how/when to update it.

**Exception**: Figma export files (`BT Corner variables/`, `BT Space variables/`, `BT Typography variables/`, `BT Color Variables/`, `--- BT Primitives/`) don't need `_about` — they're generated exports overwritten on each re-export.

```json
{
  "_about": "...",
  ...
}
```

Applies to all AI-readable spec files: `token-map.json`, `ds-index.json`, `css-to-figma.json`, `tokens/components/*.json`, and any future files. The description must be self-contained.

### AI documentation philosophy

AI-readable files (`ds-index.json`, `tokens/components/*.json`) follow a strict format: **terse, structured, no prose**. Every rule is a key-value pair, no long guidelines.

**Wrong:** `"Do not use more than one primary button per screen because it confuses users."`
**Right:** `"usage_constraints": { "max_per_screen": 1, "role": "primary_action" }`

When generating UI: read `tokens/ds-index.json` first, then the specific component's spec JSON for token lookups. Never guess token values — always read from the files. Don't use `COMPONENTS.md` as a source of DS knowledge (no token data) or guess token values from `CLAUDE.md`/`PROJECT.md`.

---

## Review Personas

See [REVIEW-PERSONAS.md](./REVIEW-PERSONAS.md) for all review frameworks (Accessibility Auditor, Token Architect, Design System Expert, Figma–Code Parity Reviewer, AI Readiness Reviewer, and the two mandatory ones: Component Spec / Tokens Panel QA Reviewer, Security & Risk Reviewer).

### Automatic review (hook + skills + guard agent)

| What | Where | When |
| --- | --- | --- |
| Review hook | `.claude/settings.json` → `scripts/review-hook.mjs` | after every Edit / Write of a new-DS file (style, tokens, new docs pages / partials, `app/`, AGENTS.md / llms.txt): runs `check:contrast`, `check:catalog`, `check:ui` and names the review skills for that file |
| Review skills | `.claude/skills/ui-design-review`, `ux-review`, `frontend-review`, `a11y-review` | apply the ones the hook names before reporting work done |
| Guard agent | `.claude/agents/ds-guard.md` | before reporting any UI / DS work done — reviews every changed file, read-only |
| ds-guard hook | `.claude/settings.json` → `scripts/ds-guard-hook.mjs` (Stop + PostToolUse on Agent) | when a turn ends with DS files changed since the last ds-guard run, it blocks the stop once and asks for the ds-guard review; a finished ds-guard run clears the list |
| Consumer skill | `.claude/skills/build-ui-with-pos-ds` | building UI with the DS (app / other modules) |

When the hook or a review finds a problem: tell the user right away, in plain words, with the measured value vs the requirement and the fix options, and **ask before applying any design or token fix** (format: `ui-design-review` › Reporting). All checks at once: `npm run check`.
