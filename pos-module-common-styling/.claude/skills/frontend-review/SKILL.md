---
name: frontend-review
description: Frontend developer review of code in or built with the pOS design system — semantic HTML, DS classes and tokens only, Liquid correctness, vanilla JS conventions, spec / partial sync, build steps, no new dependencies. Use automatically after every change to CSS, Liquid, JS / TS or component spec JSON, and whenever the review hook lists it; report problems to the user before calling the work done.
---

# Frontend review

Lens of a frontend developer. Builds on `REVIEW-PERSONAS.md` › Component Spec / Tokens Panel QA Reviewer and Security & Risk Reviewer — both **mandatory** for changes in this repo — and `RULES.md`.

## Run

1. `npm run check` — catalog + contrast + UI code (or the single ones: `check:catalog`, `check:contrast`, `check:ui -- <files>`).
2. Changed `src/js/*.ts` → `npm run build` (the deployed `assets/js/styleguide-component-page.js` is its build output).
3. Changed a spec `tokens/components/<name>.json` → its `views/partials/style-guide/spec-<name>.liquid` regenerated (Node, `{% raw %}` wrapper, parse-back validation) and still rendered by `component-template.liquid`.

## Checklist

| Area | Pass when |
|---|---|
| markup | semantic elements (`button` for actions, `a href` for navigation, `fieldset` / `label` in forms); markup copied from the spec's `usageExample`; only the elements / options the component documents (no invented additions — see `ux-review` › reuse first) |
| DS usage | only existing `pos-` classes and `--pos-` tokens (`check:ui` clean); own classes use their own prefix; no `style="…"` |
| Liquid | forward-slash `render` paths; literal `{% %}` / `{{ }}` in content escaped (`&#123;`); no Liquid inside HTML comments; output escaped unless known-safe |
| CSS | inside `@layer common-styling`; no `prefers-color-scheme` in component CSS; legacy components: appearance-only changes |
| JS | vanilla, `window.pos` namespace; no `innerHTML` with outside data; no new npm dependency or external URL without the user's OK |
| scope | nothing outside `pos-module-common-styling/` changed unless asked; the old DS (on `master`) never re-added; token / class names never renamed |

## Reporting

Same format as `ui-design-review` › Reporting, in the user's language: file + line, what's wrong, the rule it breaks, and the fix options. Mechanical fixes that only follow an existing rule (escaping, slash direction, regenerating a partial) can be applied directly and then reported; anything that changes the design or a token waits for the user.
