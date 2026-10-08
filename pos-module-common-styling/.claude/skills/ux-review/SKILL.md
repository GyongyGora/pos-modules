---
name: ux-review
description: UX designer review of pages, flows and component usage built with the pOS design system — right component for the job, action hierarchy, feedback, empty / error / loading states, labels and copy, destructive actions. Use automatically after creating or changing a page, partial, form or docs-page interaction, and whenever the review hook lists it; report problems and proposals to the user.
---

# UX review

Lens of a UX designer. Component intent comes from `ds-index.json` (`when`) and each spec's `whenToUse` / `whenNotToUse` / `do` / `dont` — check against those, not taste.

## Checklist

| Area | Pass when |
|---|---|
| reuse first | **use what the DS already offers, never invent** — before building or adding anything, look up the component and its documented options: `ds-index.json`, `components/<name>.json` (`variants`, `props`, `usageExample`) and the component page's Variant / Options controls (e.g. feature card: optional icon, subtitle, lead, Read more link, buttons, badge; content card: image, category, read time, date). Use an existing component, variant or optional element whenever one fits, with its documented markup; never add to a component an element it doesn't offer (e.g. a button or an inline link inside a content card). Missing option → if a **similar component** documents it, build on that pattern (its markup, classes, tokens and spacing — e.g. a content card that needs a link or buttons takes the feature card's Read more link / action buttons); only if no component has it, say so and propose adding it, don't improvise it in one place |
| right component | each choice matches its spec's `whenToUse`, none hits a `whenNotToUse` (e.g. select for 5+ options, radio below; segmented control for 2–4 views; toast for a done action, alert card for an inline persistent message, dialog for a decision) |
| action hierarchy | max one primary button per screen; destructive actions use the error intent and a confirmation (dialog) when irreversible |
| feedback | every action has a visible result (toast / alert / inline state); loading uses the spinner / button loading state |
| states | empty, error, loading and success states exist for data views and forms |
| forms | visible labels, helpful error text next to the field, required fields marked, sensible field order |
| copy | labels say what happens ("Save changes", not "OK"); consistent terms across the page |
| navigation | user knows where they are (breadcrumb / tab state / active nav item); back / cancel always possible |
| density | related things grouped (cards / fieldsets), section spacing from `layout.spacing` |

## Reporting

Same format as `ui-design-review` › Reporting: in the user's language — what is wrong for the user and why (cite the spec rule), and a question with concrete options. Proposals start with "Proposal:" (in the user's language). Don't restructure a page or swap components without the user's answer.
