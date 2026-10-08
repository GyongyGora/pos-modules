# pOS Common Styling — Design System Project

## Overview

This project has two complementary layers:

**Layer 1 — HTML/CSS implementation**
The current `pos-module-common-styling` module provides a concrete HTML + CSS implementation of the design system for platformOS web apps. It consists of `pos-` prefixed CSS classes, CSS custom property tokens, Liquid partials, and the documentation site at `/style-guide`. It is the reference implementation and the delivery vehicle for platformOS modules.

**Layer 2 — Headless design system documentation** (new, broader)
A framework-agnostic, headless DS layer that documents the design system at the level of tokens, component anatomy, behavior, and usage rules — independently of any rendering technology. This layer is the source of truth that can drive implementations in any stack: HTML/CSS web apps, React, Vue, native mobile (iOS/Android), desktop apps, or AI-generated UIs. The headless layer does not prescribe markup or class names — it defines *what* a component is, *how* it behaves, and *which tokens* it uses.

The two layers are connected: the HTML/CSS implementation is one concrete expression of the headless DS.

- **Module**: `common-styling` (version tracked in `modules/common-styling/template-values.json` — don't hardcode it here, it drifts)
- **Docs site (preview instance)**: https://gyongy-design-system.staging.oregon.platform-os.com/style-guide
- **Figma source of truth** (internal use only; access required): https://www.figma.com/design/7LdPQ5BEpKgFvxqnjvwH5b/pOS-Core---components

---

## Current State

The module contains only the new design system (the old one, 1.x, stays on `master`). Component inventory: [COMPONENTS.md](COMPONENTS.md). Changes: [CHANGELOG.md](CHANGELOG.md).

---

## Figma Design System Structure

The Figma file is organized in these categories:

| Category | Components | Component Sets |
|---|---|---|
| Mobile | 168 | 0 |
| Desktop | 134 | 0 |
| Icons | 109 | 1 |
| Tools | 16 | 0 |
| Form | 5 | 9 |
| Page Elements | 6 | 5 |
| Step by step | 4 | 4 |
| Segmentation | 6 | 2 |
| Complex cards | 8 | 0 |
| Sort-filter | 7 | 0 |
| Footer | 7 | 0 |
| Badge | 3 | 3 |
| Buttons | 3 | 3 |
| Messages | 2 | 3 |
| Graphics | 3 | 2 |

---

## Project Goals

**Status note**: Phases 1 and 2 below are largely complete — all documented components have Figma-aligned tokens, a per-component JSON spec (`tokens/components/*.json`), and both a human and AI-readable documentation view (see `RULES.md` §6 and `COMPONENTS.md`). Phase 4 (multi-brand theming) has shipped: 15 brand themes and a theme export on the Themes page. Phase 3 (AI-assisted generation) is in place for coding agents (`AGENTS.md`, `llms.txt`, the review skills and the ds-guard agent); generation at scale is still open.

### Phase 1 — Foundation: DS documentation and Figma alignment

1. **Audit** — Compare existing CSS components and style guide sections against the Figma design system. Identify gaps, outdated tokens, and missing components.
2. **Token alignment** — Ensure CSS custom properties (colors, spacing, typography, shadows) match the design tokens defined in Figma.
3. **Component parity** — Implement missing or incomplete components from Figma into the module (CSS + Liquid partials + style guide section).
4. **Style guide expansion** — Add missing sections to the style guide for any new components added.
5. **Ongoing sync** — Establish a workflow for keeping code and Figma in sync as the design system evolves.

### Phase 2 — Headless DS documentation

Document the design system in a framework-agnostic, technology-independent way. The headless layer sits above any specific implementation and describes:

#### Token architecture

Tokens are organized in three tiers. Each tier references the one below it — the chain is always resolvable to a raw value.

```
Component token  →  Semantic token  →  Primitive token  →  Value
Button/Button bg → Graphics/Interactive → Brand/600      → #1d4ed8
```

| Tier | Description | Example |
|---|---|---|
| **Primitive** | Raw, unnamed values. The palette. Never used directly in components. | `Brand/600`, `Neutral/100`, `radius/full` |
| **Semantic** | Named by purpose, not appearance. Portable across components. | `Graphics/Interactive`, `Text/Text inverse` |
| **Component** | Scoped to one component and one role within it. References a semantic token. | `Button/Button bg`, `Button/Button content` |

Each component is documented with a token table:

| Role | Token | References | Value |
|---|---|---|---|
| Background | `Button/Button bg` | `→ Graphics/Interactive → Brand/600` | `#1d4ed8` |
| Text / Icon | `Button/Button content` | `→ Text/Text inverse → Neutral/100` | `#eef1f8` |
| Corner radius | `Button/Button radius` | `→ radius/full` | `100px` |

This format is language- and platform-independent. The same token table applies whether the component is rendered as HTML/CSS, React, SwiftUI, or Jetpack Compose. Platform-specific mappings (e.g., CSS custom property names) are a separate, derived artifact.

#### Other headless documentation per component

- **Component anatomy** — The structural parts of each component (e.g., a Button has a container, a label, an optional leading icon, an optional trailing icon) without prescribing HTML tags or class names.
- **States and variants** — Every supported state (default, hover, focus, active, disabled, loading) and variant (primary, secondary, destructive, small, etc.), each with its own token table.
- **Behavior rules** — Interaction patterns, keyboard navigation, accessibility requirements (ARIA roles, focus management).
- **Usage rules and guardrails** — What is allowed, what is forbidden, when to use which variant, and common misuse patterns to avoid.

This layer is the foundation for AI-assisted UI generation and cross-platform implementation.

### Phase 3 — AI-assisted UI generation

Use the headless DS as the single source of truth for generating consistent UIs through AI-assisted workflows, across any target platform or framework.

- **Component-driven generation** — UIs are built exclusively from DS components. No ad-hoc markup, one-off styles, or custom solutions are introduced.
- **Token enforcement** — All generated interfaces apply DS tokens rather than hardcoded values. Customization happens at the token level only.
- **Rule-based guardrails** — Usage rules and forbidden patterns from the headless DS documentation are applied during generation to validate output.
- **Cross-module consistency** — Apps composed from multiple platformOS modules (e.g., e-commerce + chat + user profile) produce visually and structurally consistent UIs, because every module builds on the same shared DS.
- **Multi-platform output** — The same component definitions and token set can drive generation for web (HTML/CSS/Liquid), React, Vue, native mobile (iOS/Android), or desktop — the target implementation is a parameter, the DS foundation is constant.

### Phase 4 — Customization and branding

The DS must be customizable so that different products, brands, or clients can apply their own visual identity without breaking DS consistency.

- **Token-based theming** — All visual properties (brand colors, typography, spacing scale, border radius, motion, etc.) are exposed as tokens. Customization happens by overriding tokens only — no component structure or behavior changes.
- **Brand profiles** — A brand configuration defines the set of token overrides for a given product or client. Switching brands applies a different token layer, leaving all components, rules, and generation behavior intact.
- **Consistency guarantee** — Customized DS instances must still produce consistent UIs across all modules and generated surfaces. Component anatomy, behavior rules, and guardrails apply equally regardless of which brand/theme is active.

---

## Documentation architecture

### Data-first: one source, two views

*Illustrative — the schema below was the original plan; the real spec schema is in `tokens/components/button.json` (see `RULES.md` §7).*

Every component documentation page is built from a **single structured JSON data file** that contains the complete definition of the component: every variant, every size, every role, every state, and every token mapping for every combination.

```
/tokens/components/button.json
├── component name + description
├── anatomy (structural parts, no HTML tags)
├── tokens per state × variant × size combination  ← most critical
├── usage constraints (when not to use, forbidden combinations)
└── keyboard behavior
```

### Component JSON schema

Only data that cannot be derived from elsewhere is stored. Variant/size/role lists are useful but lower priority — the token mapping completeness is what makes this worthwhile.

| Priority | Field | Why |
|---|---|---|
| **Critical** | Token mapping (state × variant) | Not visible from the demo — this is the core |
| **Critical** | Usage constraints | "Don't use on X" — not in code anywhere |
| **Important** | Anatomy (component parts) | What builds up the component |
| **Important** | Keyboard behavior | A11y, non-trivial |
| **Useful** | Variants / sizes / roles list | Derivable from controls, but useful context |
| **Skip** | General a11y rules | Already in RULES.md (4.2) |

```json
{
  "component": "Button",
  "description": "Triggers an action. Does not navigate — use a link for navigation.",
  "anatomy": ["container", "icon-left", "label", "icon-right", "spinner"],
  "tokens": {
    "Primary / Default": {
      "background": {
        "token": "Button/Button bg",
        "references": "Graphics/Interactive → Brand/600",
        "value": "#1d4ed8",
        "css": "--pos-color-button-primary-background"
      },
      "text": {
        "token": "Button/Button content",
        "references": "Text/Text inverse → Neutral/100",
        "value": "#eef1f8",
        "css": "--pos-color-button-primary-text"
      }
    },
    "Primary / Hover": {
      "background": {
        "token": "Button/Button bg hover",
        "references": "Graphics/Interactive hover → Brand/700",
        "value": "#1949d3",
        "css": "--pos-color-button-primary-hover-background"
      }
    }
  },
  "constraints": {
    "when_to_use": [
      "To trigger an action (submit, save, delete, open dialog)"
    ],
    "when_not_to_use": [
      "For navigation — use <a> instead",
      "As a decorative element"
    ],
    "dos": [
      "Use Primary for the single most important action on a page",
      "Pair with a Secondary for a primary/cancel pattern"
    ],
    "donts": [
      "Do not place two Primary buttons side by side",
      "Do not use Ghost on dark backgrounds"
    ]
  },
  "keyboard": {
    "Enter": "activate",
    "Space": "activate"
  }
}
```

This JSON is the single source of truth. From it, two views are rendered:

| | Human view | AI view |
|---|---|---|
| **What** | Interactive preview with controls (variant picker, state switcher) and a filtered token table for the currently selected combination | The complete JSON embedded in the page, or a fully rendered static table listing every variant × state × token |
| **How** | JS reads the JSON and renders the current selection | AI reads the JSON or the static HTML directly — no JS execution required |
| **Also used for** | Live component preview | Token transformation pipeline (CSS, Swift, Compose export) |

### Documentation consumers — format by tool type

Different tools consume documentation in fundamentally different ways. The same content must be present in multiple formats to serve all consumers.

| Consumer | Format needed | What it reads |
|---|---|---|
| Claude, Cursor, code-gen AI | `<script type="application/json">` | Structured token mappings, variants, states, constraints |
| Visual-generation tools (v0 etc.) | Natural language | Usage rules, do/dont, descriptions — in plain text |
| Human developers | Interactive UI + natural language | Usage guidelines, live examples, token table |

**Key insight:** JSON and natural language documentation are not interchangeable — they serve different toolchains. Neither replaces the other.

Figma Make compatibility is out of scope for this project (`RULES.md` 6.3).

### Documentation platform decision

**Decision: custom Liquid-native documentation — no Storybook, no ZeroHeight, no Supernova.**

The DS documentation is built as a custom platformOS page in the existing Liquid + HTML/CSS stack. Reasons:

- Storybook is designed for component frameworks (React, Vue, etc.) — not compatible with Liquid server-side rendering
- ZeroHeight and Supernova are paid tools and don't support the Liquid/platformOS context
- A custom doc page is Liquid-native: components render exactly as they would in a real platformOS app — no simulation, no wrapper
- The JSON AI-readable layer can be embedded directly in the same page
- The documentation UI itself is built from DS tokens and components — it is both documentation and a live example

The component documentation page layout was built in Liquid directly (`/style-guide`, `component-template.liquid`) rather than pre-designed in Figma first — see `RULES.md` §9.1 for the current component-source workflow (code-based by default). All components are documented; see `COMPONENTS.md` for the current inventory and status of each.

### Rule: every documentation page must have both layers

Every component documentation page — without exception — must include:

1. **Human layer** — interactive preview with controls and a live token table for the selected variant/state.
2. **AI-readable layer** — the complete component data embedded in the page as a `<script type="application/json">` block, containing all variants, states, and token mappings. This must be present and complete at page load, regardless of what is shown in the interactive UI.

The AI layer is not optional and is not a "nice to have". It is what enables consistent AI-assisted UI generation, token validation, and cross-platform implementation.

---

## Conventions

- All CSS classes use the `pos-` prefix (e.g., `.pos-button`, `.pos-card`).
- Each new-DS component has its own CSS file under `modules/common-styling/public/assets/style/` (see `RULES.md` §5.4).
- New-DS documentation lives under `modules/common-styling/public/views/pages/style-guide/`, with per-component spec-driven partials under `views/partials/style-guide/spec-<component>.liquid` (generated, never hand-edited — see `RULES.md` §6.4).
- The docs site entry point is `/style-guide` (→ `overview.liquid`); components are at `/style-guide/component-template`, driven by `nav-left.liquid`'s nav structure.
- JavaScript uses the `window.pos` namespace.

---

## Reference files

| File | Purpose |
|---|---|
| `modules/common-styling/public/assets/tokens/token-map.json` | Maps every Figma token name → CSS variable name + light/dark chain + direct ref. Kept in sync with the token CSS (update it in the same change, via a Node script with parse-back validation). |
| `modules/common-styling/public/assets/tokens/token-sync-snapshot.json` | Snapshot of Figma variable values at last sync. Used by `/token-sync` to detect changes. |
| `modules/common-styling/public/assets/tokens/figma-color-reference.md` | **Helper only — not source of truth.** Quick-reference table of Figma semantic color token names and their light/dark primitive mappings, manually exported. Source of truth is the token CSS (`pos-primitives.css`, `pos-config.css`); these helpers may lag behind. |
| `modules/common-styling/public/assets/tokens/figma-primitives-reference.md` | **Helper only — not source of truth.** Quick-reference table of Figma primitive token names and raw values, manually exported. Source of truth is the token CSS (`pos-primitives.css`, `pos-config.css`); these helpers may lag behind. |
| `modules/common-styling/public/assets/tokens/css-to-figma.json` | Flat reverse lookup: CSS variable name → Figma variable name. Derived from token-map.json. Use for instant CSS→Figma resolution without scanning token-map.json. Update it whenever token-map.json changes. |
| `modules/common-styling/public/assets/tokens/component-tokens.json` | Component token index: all theme-neutral `--pos-color-<comp>-*` tokens grouped by component, plus shared `_radius`, `_gap`, `_padding`, `_font-*` groups. Extracted from pos-config.css. Use to find all tokens for a component without grepping. Regenerate after pos-config.css changes. |
| `modules/common-styling/public/assets/tokens/ds-index.json` | Single-file DS overview — all components, classes, spacing tokens, constraints. Read first when building any multi-component surface. |
| `modules/common-styling/public/assets/tokens/components/<component>.json` | Full per-component spec — all tokens, states, markup, a11y. |

---

## Working Notes

- All documentation and code is in English.
- Figma file key: `7LdPQ5BEpKgFvxqnjvwH5b` (internal use only; access required)
- Preview instance: `gyongy-design-system.staging.oregon.platform-os.com`
