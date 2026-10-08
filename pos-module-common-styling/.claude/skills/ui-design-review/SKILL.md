---
name: ui-design-review
description: UI designer review of anything visual in the pOS design system or built with it — colors, token choice, typography, spacing, elevation, states, light / dark / high-contrast parity, and a visual layout pass (gaps, touching or misaligned elements, wrapping, overflow) on a rendered screenshot. Use automatically after every change to style CSS, tokens (pos-config / pos-primitives), component markup or app UI, and whenever the review hook lists it; report problems and proposals to the user before calling the work done.
---

# UI design review

Lens of a UI designer who owns this design system. Builds on `REVIEW-PERSONAS.md` › Design System Expert + Token Architect, and `RULES.md`.

## Run

1. `npm run check:contrast` — every prescribed text / icon / frame pair in light, dark, high contrast.
2. `npm run check:ui -- <changed files>` (no argument = the whole new DS).
3. Read the changed CSS / markup against the checklist. When it renders, look at it (headless Chrome screenshot of the docs page in all three themes) — never judge colors from the code alone.
4. **Visual layout pass — mandatory for every visible change, small ones included.** Render the page (Playwright: `chromium.launch({channel:'chrome'})`) at a desktop (1600px) and a narrow (≈900px) width, screenshot the changed area *and its surroundings*, and check it against the **Layout & UI basics** table below. Measure suspicious gaps / offsets with `getBoundingClientRect` instead of eyeballing. Removing or moving an element counts as a change too: check what was next to it (e.g. the gap it used to provide).

## Checklist

| Area | Pass when |
|---|---|
| contrast | `check:contrast` has no new failure; any color you changed was measured |
| tokens | semantic tokens for the role (text vs icon tokens are different: `--pos-color-interactive-text` / `--pos-color-interactive`); no hex, no primitives in component / app CSS |
| typography | font-size + matching line-height pair; headings `--pos-color-content-text-prominent` |
| spacing | `layout.spacing` tokens; rhythm consistent with neighboring components |
| states | hover / active / focus / disabled all defined and visibly different; hover never changes border width (use inset box-shadow) |
| disabled | `cursor: not-allowed` over the whole hit area (label, track, icon, children included); no `pointer-events: none` on the disabled element; no hover / active look — RULES.md 4.12 |
| hover | two scale steps darker (light) / lighter (dark) — the `*-hover` tokens; HC: white fill or a frame |
| hover on active / selected | none: active tab, selected segment / tile button, current page, current menu or sidebar item keep their look; exception: checked checkbox, toggle button, selected filter tag still get hover — RULES.md 4.5b |
| elevation | hover elevation stronger than rest; **none in high contrast** — containers get `--pos-color-frame-transparent` instead |
| themes | light, dark and high contrast each look intentional (HC: black / white / cyan / yellow only for its own colors) |
| consistency | matches how the same thing looks in existing components; no near-duplicate variant of an existing one |

### Layout & UI basics (visual pass, step 4)

| Area | Pass when |
|---|---|
| breathing room | text never touches a box, card, field or another block: a heading / intro paragraph and the box below it are separated by a gap token (`--pos-gap-section-title-content` or similar), never 0 |
| no touching / overlapping | neighboring elements (cards in a grid, buttons in a row, fields side by side) have the gap of their group; nothing overlaps, nothing is clipped |
| alignment | items in a row share their top / baseline: fields next to each other start at the same y (measure — 1–2px offsets count), labels line up, icons are vertically centered with their text |
| spacing hierarchy | the gap grows with the level (`RULES.md` 2.7): inside a group < between groups; element in a card < card → card < section title → content < section → section. A heading is closer to its own content than to the block above it; related controls are visibly grouped. Measure the gaps (`getBoundingClientRect`) — an inner gap equal to or larger than the outer one is a finding |
| consistent rhythm | equal things have equal spacing (all cards in a row the same gap, all sections the same section gap); stacked elements don't inherit a stacking margin inside a grid / flex row |
| wrapping | short labels and titles don't break onto a second line in their container (panel headers, buttons, tags); long text wraps cleanly, no orphan single words in headings where avoidable |
| overflow | the **page itself** never scrolls sideways (at desktop or narrow width). Wide content — a wide table, a code block, a 10-step palette grid — may and should scroll horizontally **inside its own scroll container**, with the scrollbar on that container; the problem is only when such content pushes the whole page wider, or gets cut off without a way to scroll to it |
| hierarchy | one clear primary action per area; heading levels and sizes follow the content structure; related controls are grouped, unrelated ones separated |
| controls | clickable things look clickable and have a hover; icon-only controls have a visible icon (non-zero size) and an accessible name; hit targets 44×44px by default (small variants are desktop-only, RULES.md 4.2) |
| states in context | hover / focus / selected look right *in place* (not only in isolation): no clipped focus ring, no shadow cut by overflow |
| empty / edge content | a missing optional element (icon, badge, second line) doesn't leave a hole or collapse the layout |

For every finding: say what you saw, the measured value, the expected value and a proposal (best practice), in the reporting format below.

## Reporting (shared by all review skills)

Say it to the user in **their language**, plain words, one finding per item, worst first:

1. **What changed and what broke** — the concrete element and state.
2. **Measured value vs the requirement** — e.g. `1.35:1, WCAG AA needs 4.5:1`.
3. **A question with options** — the fixes from `check:contrast` / your own, each with its result; offer to propose another.

Example:
> Recoloring the button broke its contrast: the background became light (`brand-primary-300`) while the text stayed white — 1.35:1, WCAG AA needs 4.5:1. Should the text color follow (`grey-dark-6` → 4.52:1), or should the background go back to a suitable step (`brand-primary-600` → 6.7:1)? I can propose another option too.

Proposals (not errors) use the same shape, starting with "Proposal:" (in the user's language). **Never apply a design or token fix before the user answers.**
