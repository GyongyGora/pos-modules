# COMMANDS.md — pos-module-common-styling

All available slash commands for this project. Commands live in `.claude/commands/` as `.md` files. Review skills and the ds-guard agent: see `CLAUDE.md` › Automatic review.

---

| Command | File | What it does |
|---|---|---|
| `/token-sync` | `token-sync.md` | Compare Figma variables against CSS tokens. Uses a snapshot cache for fast incremental runs. Produces a full match / mismatch / missing report grouped by collection. Read-only — never modifies CSS. |
| `/check-tokens <component>` | `check-tokens.md` | Audit a component's CSS for dark/light mode compatibility. Flags hardcoded colors, primitive color tokens used directly, and light- or dark-only tokens that won't switch automatically. Covers both the component CSS file and its token definitions in `pos-config.css`. Read-only. |
| `/create-component <name>` | `create-component.md` | Create a new DS component end-to-end: CSS file (semantic tokens; component tokens in `pos-config.css` only for button / forms, RULES.md 2.2), documentation page, AI-readable JSON spec, `COMPONENTS.md` entry. Runs `/check-tokens` as a mandatory validation step before completion. |
| `/insp-to-code` | `insp-to-code.md` | Reference image → DS-based code. Analyzes a reference image and implements the UI as Liquid/HTML using DS components, semantic tokens, and DS conventions. No hardcoded values. |

---

## When to use each

- **Starting a new component** → `/create-component`
- **Checking if an existing component supports dark mode** → `/check-tokens`
- **Figma tokens changed** → `/token-sync`
- **Have a reference image, want it in code** → `/insp-to-code`
