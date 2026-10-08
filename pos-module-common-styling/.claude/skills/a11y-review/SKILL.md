---
name: a11y-review
description: Accessibility review (WCAG 2.2 AA) of the pOS design system and anything built with it — contrast in light / dark / high contrast, keyboard, focus, labels and ARIA, non-color cues, touch targets, motion. Use automatically after every change to colors, tokens, component CSS, markup or JS behavior, and whenever the review hook lists it; report problems with measured values and fix options to the user.
---

# Accessibility review

Lens of an accessibility specialist. Builds on `REVIEW-PERSONAS.md` › Accessibility Auditor.

## Run

1. `npm run check:contrast` — measured, all three themes. A failure lists fix options (nearest passing scale step for the foreground, and for the background).
2. `npm run check:ui -- <changed files>` — inline styles and hardcoded colors often hide contrast problems.
3. For interactive changes: keyboard-walk the rendered page (Tab / Shift+Tab / Enter / Space / Esc / arrows) in headless Chrome or ask the user to check if it can't be automated.

## Checklist

| Area | Pass when |
|---|---|
| contrast | text 4.5:1, icons / graphics / frames / focus ring 3:1 — in light, dark **and** high contrast; disabled is exempt |
| keyboard | every action reachable and operable; logical order; no trap except inside an open dialog; Esc closes overlays |
| focus | visible `:focus-visible` ring with `--pos-color-focused` (`-inverse` on inverted surfaces); focus returns to the trigger after a dialog / popover closes |
| names | every input has a `<label>`; icon-only buttons `aria-label` (+ matching `data-tooltip`); toggles expose state (`aria-pressed` / `aria-expanded` / `aria-checked`) and a state-aware name |
| feedback | errors linked to their field (`aria-invalid`, `aria-describedby`); toasts / status announced (`role="status"` / `aria-live`) |
| color | never the only cue — status has icon + text; links distinguishable without color |
| targets | 44 × 44 px default; small variants desktop-only |
| motion | animations respect `prefers-reduced-motion` |
| high contrast | no elevation; containers framed with `--pos-color-frame-transparent`; HC keeps its own black / white / cyan / yellow |

## Reporting

Same format as `ui-design-review` › Reporting, in the user's language: the affected element and theme, measured value vs the WCAG requirement (criterion number), and a question with the fix options. Never change a color or token before the user answers.
