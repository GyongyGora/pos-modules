# Token Sync

This command fetches live Figma variables, compares them against the current CSS implementation, and produces a mismatch report — on demand, every time.

Compare Figma design tokens against the CSS implementation and produce a mismatch report.

**Never modifies Figma or CSS.**
**Snapshot file (`tokens/token-sync-snapshot.json`) is the only file this command writes.**

### Full workflow

```
1. Fetch tokens — Figma MCP (preferred) or manually exported token JSONs (fallback)
2. Run sync — compare Figma tokens against CSS: value, reference chain, name mapping
3. Terminal report — ✅ match / ⚠️ mismatch / ❓ missing / ~ documented divergence
4. Human reviews the report
5. Human decides and instructs: fix in Figma, or fix in code
6. Manual updates applied (see RULES.md 3.7 — post-sync checklist)
```

**Known divergences** (documented in `token-map.json` with `status: "diverged"`) are shown as `~` — not errors, not actionable unless the human decides to resolve them.

---

## Step 1 — Check for existing snapshot

Read `modules/common-styling/public/assets/tokens/token-sync-snapshot.json`.

- If the file **does not exist**: run a full sync (Step 2a).
- If the file **exists**: check what changed since the snapshot was taken (Step 2b).

---

## Step 2a — Full sync (first run or forced refresh)

### Primary source: Figma MCP (preferred)

1. Call `figma_get_variables` on file `7LdPQ5BEpKgFvxqnjvwH5b` (the internal DS file; access required) to fetch all variable collections and their values for the active modes:
   - `--- BT Primitives` → default mode (all primitive color and size values)
   - BT Corner variables → High fidelity mode
   - BT Space variables → Desktop M-S (def)
   - BT Typography variables → Desktop
   - BT Color Variables → Light Mode (default)

2. Store the result in memory as `figmaTokens` (flat map: `"Collection/Group/Token" → value`).

3. Save a new snapshot and continue to Step 3.

### Fallback source: manually exported token JSON files

If the Figma MCP is unavailable (connection error, no desktop app open, API failure), fall back to the exported token JSON files in `tokens/`:

| Collection | File | Mode to use |
|---|---|---|
| --- BT Primitives | `tokens/--- BT Primitives/Primitives.tokens.json` | root values |
| BT Corner variables | `tokens/BT Corner variables/High fidelity mode.tokens.json` | root values |
| BT Space variables | `tokens/BT Space variables/Desktop M-S (def).tokens.json` | root values |
| BT Typography variables | `tokens/BT Typography variables/Desktop.tokens.json` | root values |
| BT Color Variables | `tokens/BT Color Variables/Light Mode (default).tokens.json` | root values |

Read each file, extract token names and `$value` fields, flatten into the same `"Group/Token" → value` map as the MCP source.

Print a warning when using the fallback:
```
⚠️  Figma MCP unavailable — using local token JSON exports.
    These files may be outdated. Export fresh copies from Figma if in doubt.
    Last JSON export: <file modification date>
```

Do **not** update the snapshot when using the fallback source — the snapshot should only ever reflect a confirmed live Figma fetch.

4. Continue to Step 3.

---

## Step 2b — Incremental sync (snapshot exists)

1. Call `figma_get_design_changes` on file `7LdPQ5BEpKgFvxqnjvwH5b` to get changes since the snapshot's `generatedAt` timestamp.

2. If **no changes** are reported:
   - Print: `No Figma changes since <snapshot timestamp>. Showing cached report.`
   - Load `figmaTokens` from the snapshot file.
   - Skip to Step 3 (CSS read + compare only).

3. If **changes exist**:
   - Identify which collections were affected.
   - Call `figma_get_variables` only for the affected collections.
   - Merge updated values into the snapshot's token map.
   - Update `generatedAt` and save the snapshot.
   - Load the merged result as `figmaTokens`.
   - Continue to Step 3.

---

## Step 3 — Read CSS

Read both CSS files and extract all `--pos-*` custom properties (first occurrence of each wins):

- `modules/common-styling/public/assets/style/pos-primitives.css` — primitive token definitions
- `modules/common-styling/public/assets/style/pos-config.css` — semantic and component token definitions

Build a flat map: `"--pos-variable-name" → value` (raw CSS value, may be a `var()` reference or a resolved value).

---

## Step 4 — Compare

**Read `modules/common-styling/public/assets/tokens/token-map.json`** as the authoritative mapping source.

Iterate every entry in `tokens`. For each token:

| Field | Use |
|---|---|
| `figma_name` | Look up the token in `figmaTokens` (from Step 2) |
| `css` | Look up the CSS variable in the CSS map (from Step 3) |
| `light_chain` | Verify the CSS reference chain matches |
| `light_resolved` | Verify the final resolved value matches |
| `status` | `"diverged"` → show as `~`, skip as error |

### Comparison rules

**1. Token value** — does the Figma resolved value match the CSS resolved value?
- Number tokens: Figma `24` → compare as `24px` against CSS primitive value.
- Color tokens: use Figma `hex` field (normalize to lowercase). Resolve the full CSS `var()` chain to a final hex value before comparing. Use `light_resolved` from `token-map.json` as the expected value.
- String tokens (font family): match if Figma value is contained in the CSS value (e.g. `"Inter"` matches `'Inter', system-ui, sans-serif`).
- Figma alias tokens (value is `{...}` reference): mark as **alias**, skip value comparison.

**2. Reference chain** — does the CSS reference match the expected chain?
- Check the `light_chain` field in `token-map.json` — the CSS variable must resolve through the listed chain.
- Primitive tokens: chain has one entry (the variable itself) — no indirection.
- Semantic tokens: must go through `--pos-primitive-*` — never reference a raw value directly.
- Component tokens: must go through a semantic token — never reference a primitive directly.
- If the chain skips a layer or references a primitive directly where it shouldn't → flag as ⚠️.

**3. Token name mapping** — is this token in `token-map.json`?
- Every token is in `token-map.json` (291 at the time of writing — read its `total`). If a token exists in `figmaTokens` but has no entry in `token-map.json` → flag as ❓ (not mapped).
- If found with `"status": "diverged"` → show as `~` (documented divergence), do not flag as error.
- If found with `"status": "match"` but values differ → flag as ⚠️ mismatch.

---

## Step 5 — Output

Print the full report to the terminal; the only file written is the snapshot (`tokens/token-sync-snapshot.json`).

### Format

Group results by `figma_group` from `token-map.json`. Print all tokens — matches and mismatches alike. Use these icons:

| Icon | Meaning |
|---|---|
| ✅ | Match — Figma and CSS values agree |
| ⚠️ | Mismatch — values differ |
| ❓ | Missing in CSS — Figma token has no CSS variable |
| — | No CSS token defined (expected, skip in count) |
| → | Alias / var() — CSS value is a variable reference, not resolved |

```
── --- BT Primitives / Colors / Brand ───────────────────────────────────────
✅  Brand primary/600       Figma: #1d4ed8   →  --pos-primitive-color-brand-primary-600 CSS: #1d4ed8
✅  Brand primary/700       Figma: #1949d3   →  --pos-primitive-color-brand-primary-700 CSS: #1949d3

── BT Corner variables ─────────────────────────────────────────────────────
✅  Panel corner            Figma: 8px       →  --pos-radius-panel          CSS: 8px
⚠️  Card corner             Figma: 12px      →  --pos-radius-card           CSS: 8px

── BT Typography variables ─────────────────────────────────────────────────
✅  Family/headlines        Figma: Google Sans →  --pos-font-heading        CSS: 'Google Sans', system-ui, sans-serif

── Summary ──────────────────────────────────────────────────────────────────
Total mapped: N  |  ✅ Match: N  |  ⚠️ Mismatch: N  |  ❓ Missing: N  |  ~ Alias: N
```

Only the ⚠️ mismatches require action. Print them again as a grouped action list at the end:

```
── Action required ──────────────────────────────────────────────────────────
⚠️  BT Corner variables / Card corner
    Figma: 12px  →  --pos-radius-card  CSS: 8px
    Fix: update --pos-radius-card in pos-config.css (or confirm intentional)
```

If there are no mismatches, print:

```
✅ All mapped tokens match. No action required.
```

---

## Snapshot format reference

```json
{
  "_about": "...",
  "generatedAt": "2026-03-31T10:00:00.000Z",
  "figmaFileId": "7LdPQ5BEpKgFvxqnjvwH5b",
  "tokens": {
    "Brand Primary 1": "#1d4ed8",
    "Panel corner": 8,
    "Popup corner": 4,
    "Paddings/cards, boxes": 24,
    "General elements/Normal - text": "#374151",
    "..."
  }
}
```
