---
name: build-ui-with-pos-ds
description: Build pages, partials or forms in a platformOS app with the pOS common-styling design system (pos- classes, --pos- tokens, Liquid partials). Use whenever UI is generated or edited with this DS — in the example app/, in another module, or in a consuming app.
---

# Build UI with pOS common-styling

Source of truth: `AGENTS.md` (repo root). This skill is the working procedure on top of it.

## Procedure

1. **Pick components** — `modules/common-styling/public/assets/tokens/ds-index.json`. A name from another library (Switch, Modal, TextField, Badge…) → `aliases.names`. Nothing fits (Box, Flex, Grid, Heading, Icon) → `aliases.not_in_ds`. Never invent a `pos-` class.
2. **Copy the real markup** — the component's `components/<name>.json` › `usageExample`, or the `render` call in its ds-index entry. Keep its classes, structure and `aria-*` attributes. Use only the variants and optional elements the component documents (its `variants` / `props` and the Options of its docs page); never add an element it doesn't offer. If one is missing, take the documented pattern of a similar component that has it (e.g. the feature card's Read more link or action buttons for a content card); only if none has it, say so instead of improvising.
3. **Colors** — semantic `--pos-color-*` tokens only, paired as in `AGENTS.md` § 4 (background → allowed text / icon tokens). No hex / rgb, no `--pos-primitive-color-*`.
4. **Spacing / sizes** — `ds-index.json › layout.spacing`, `--pos-padding-*`, `--pos-radius-*`, `--pos-size-icon-*`. No raw px / rem for spacing. Pick the gap by the relationship, so spacing follows the hierarchy (`RULES.md` 2.7): elements of one group closer together than groups, a heading closer to its content than to the block above; nothing touches or overlaps.
5. **Accessibility** — visible `<label>` per input, `aria-label` + `data-tooltip` on icon-only buttons, status = icon + text, max one primary button per screen.
6. **Check before reporting done**:
   - `npm run check:ui -- <changed files or dir>` — hardcoded colors, invented classes, unknown / primitive / deprecated tokens, inline styles, backslash render paths
   - `npm run check:contrast` when you touched colors or tokens
   - **visual layout pass (`ui-design-review` step 4: render at desktop and narrow width, screenshot, measure) — nothing overlaps or touches, rows align, spacing follows the hierarchy, no sideways page scroll** — mandatory for every generated or changed page / partial, small ones included
   - apply the review skills that fit: `ui-design-review`, `ux-review`, `frontend-review`, `a11y-review` (or run the `ds-guard` agent for the whole change)
7. **Report** findings to the user in their language (format: `ui-design-review` › Reporting). Never apply a design / token fix without their answer.

## Hard don'ts

| Don't | Instead |
|---|---|
| edit files in `modules/common-styling/` from an app | copy to `app/modules/common-styling/public/…` and change the copy |
| `style="…"` | DS classes, or your own prefixed class using tokens |
| `render 'modules\common-styling\…'` | forward slashes |
| create / rename / redefine `--pos-*` tokens | ask the user — token changes are their decision |
| deprecated names (`ds-index.json › deprecated`) | the `use` replacement; `npm run codemod:deprecated -- <app dir>` |
