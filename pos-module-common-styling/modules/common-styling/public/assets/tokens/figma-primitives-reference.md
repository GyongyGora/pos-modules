# Figma Primitive Token Reference

Raw primitive token names and their values.
Source: Figma variable panel, manually exported by user.

Format: **Token name** — Value

---

## Radius

| Token | Value |
|---|---|
| radius Sharp | 0 |
| radius Slightly Rounded | 4 |
| radius Slightly Rounded +2 | 6 |
| radius Mid Rounded | 8 |
| radius Rounded | 16 |
| radius Pill | 40 |
| radius Full | 999 |

---

## Size (1 unit = 8px)

| Token | Value (px) |
|---|---|
| -0,5 unit | -4 |
| 0 unit | 0 |
| 0,5 unit | 4 |
| 1 unit | 8 |
| 1,25 unit | 10 |
| 1,5 unit | 12 |
| 1,75 unit | 14 |
| 2 unit | 16 |
| 2,5 unit | 20 |
| 3 unit | 24 |
| 3,5 unit | 28 |
| 4 unit | 32 |
| 5 unit | 40 |
| 6 unit | 48 |
| 7 unit | 56 |
| 8 unit | 64 |
| 9 unit | 72 |
| 10 unit | 80 |

---

## Space / Icon sizes (no CSS tokens — reference only)

| Token | References | Value (px) |
|---|---|---|
| icon-xs | Size/1,5 unit | 12 |
| icon-s | Size/2 unit | 16 |
| icon-m | Size/2,5 unit | 20 |
| icon-l | Size/3 unit | 24 |
| icon-xl | Size/4 unit | 32 |
| icon-xxl | Size/8 unit | 64 |

---

## Space / Paddings → CSS tokens

| Figma token | References | Value (px) | CSS token |
|---|---|---|---|
| cards, boxes | Size/3 unit | 24 | `--pos-padding-card` |
| table cells | Size/2 unit | 16 | `--pos-padding-cell` |
| page content | Size/2 unit | 16 | `--pos-padding-page` |

---

## Space / Gaps → CSS tokens

| Figma token | References | Value (px) | CSS token |
|---|---|---|---|
| header-content | Size/5 unit | 40 | `--pos-gap-title-content` |
| section title-content | Size/2 unit | 16 | `--pos-gap-section-title-content` |
| section-section | Size/4 unit | 32 | `--pos-gap-section-section` |
| card-card | Size/3 unit | 24 | `--pos-gap-card-card` |
| text-text | Size/2 unit | 16 | `--pos-gap-text-text` |
| card content | Size/2 unit | 16 | `--pos-gap-card-elements` |
| content-footer | Size/5 unit | 40 | `--pos-gap-content-footer` |
| button N-button N | Size/2 unit | 16 | `--pos-gap-button-button` |
| button S-button S | Size/1 unit | 8 | `--pos-gap-button-button-small` |
| tag-tag | Size/1,5 unit | 12 | `--pos-gap-tag-tag` |
| step-step | Size/3 unit | 24 | `--pos-gap-step-step` |
| step-button | Size/3 unit | 24 | `--pos-gap-step-button` |
| input-input | Size/2 unit | 16 | `--pos-gap-input-input` |
| input-button | Size/-0,5 unit | -4 | — (intentionally unmapped) |

---

## Typography / Font sizes → CSS tokens

Note: CSS uses rem (scales with html font-size). Values below are at 16px base.
"Big button text" and "Small button text" are not separate CSS tokens — they reference the existing size scale (font-s = 16px, font-xs = 12px).

| Figma token | References | Value (px) | CSS token |
|---|---|---|---|
| font XXXS | Size/1 unit | 8 | `--pos-font-size-xxxs` |
| font XXS | Size/1,25 unit | 10 | `--pos-font-size-xxs` |
| font XS | Size/1,5 unit | 12 | `--pos-font-size-xs` |
| font SS | Size/1,75 unit | 14 | `--pos-font-size-ss` |
| font S | Size/2 unit | 16 | `--pos-font-size-s` |
| font M | Size/2,5 unit | 20 | `--pos-font-size-m` |
| font L | Size/3 unit | 24 | `--pos-font-size-l` |
| font XL | Size/4 unit | 32 | `--pos-font-size-xl` |
| font XXL | Size/6 unit | 48 | `--pos-font-size-xxl` |
| Big button text | Size/2 unit | 16 | → `--pos-font-size-s` |
| Small button text | Size/1,5 unit | 12 | → `--pos-font-size-xs` |

---

## Typography / Line heights → CSS tokens

| Figma token | References | Value (px) | CSS token |
|---|---|---|---|
| lineH XS | Size/1,25 unit | 10 | `--pos-line-height-xs` |
| lineH S | Size/2 unit | 16 | `--pos-line-height-s` |
| lineH M | Size/2,5 unit | 20 | `--pos-line-height-m` |
| lineH L | Size/3,5 unit | 28 | `--pos-line-height-l` |
| lineH XL | Size/4 unit | 32 | `--pos-line-height-xl` |
| lineH XXL | Size/6 unit | 48 | `--pos-line-height-xxl` |

---

## Typography / Font families → CSS tokens

| Figma token | Value | CSS token |
|---|---|---|
| headlines | Google Sans | `--pos-font-heading` |
| body | Inter | `--pos-font-default` |
| buttons | Inter | `--pos-font-buttons` |
| sidenotes | Inter | `--pos-font-sidenotes` |
| code | Roboto Mono | `--pos-font-code` |
| badge | Roboto Mono | `--pos-font-badge` |

---

## Typography / Font weights → CSS tokens

| Figma token | Value | CSS token |
|---|---|---|
| extralight | 200 | `--pos-font-weight-extralight` |
| light | 300 | `--pos-font-weight-light` |
| normal (regular) | 400 | `--pos-font-weight-normal` |
| medium | 500 | `--pos-font-weight-medium` |
| bold | 700 | `--pos-font-weight-bold` |
| extrabold | 800 | `--pos-font-weight-extrabold` |

---

## Graphics / Colors (Figma alias group → Brand primitives)

These are Figma alias tokens — they reference Colors/Brand primitives directly.
No separate CSS entry needed; the Brand values below cover them.

| Token | References |
|---|---|
| Brand 1 | Colors/Brand/Brand Primary 1 |
| Brand 1 0% | Colors/Brand/Brand Primary 1 0% |
| Brand 1 Light | Colors/Brand/Brand Primary 3 |
| Brand 3 | Colors/Brand/Brand Supplementary 1 |
| Color 3 | Colors/Brand/Brand Supplementary 2 |
| Color 4 | Colors/Brand/Brand Supplementary 3 |
| Color 6 | Colors/Brand/Brand Supplementary 4 |

---

## Colors / Utility

| Token | Value |
|---|---|
| Red Deep | #520E0E |
| Red Dark | #B91C1C |
| Red Mid | #CA3A31 |
| Red Light | #FFD9D9 |
| Red Extra Light | #FFF2F2 |
| Yellow Deep | #593E15 |
| Yellow Dark | #F3B14E |
| Yellow Mid | #FFBE5B |
| Yellow Light | #FFE9C8 |
| Yellow Extra Light | #FFF8ED |
| Green Deep | #02371F |
| Green Dark | #027655 |
| Green Mid | #098F69 |
| Green Light | #CEF4DF |
| Green Extra Light | #EBF6F2 |

---

## Colors / Greyscale

| Token | Value |
|---|---|
| Black | #000000 |
| Black 50% | #000000 (50%) |
| Black 20% | #000000 (20%) |
| Grey Dark 1 | #374151 |
| Grey Dark 2 | #405568 |
| Grey Dark 3 | #1A1D21 |
| Grey Dark 3 50% | #1A1D21 (50%) |
| Grey Dark 4 | #121418 |
| Grey | #6B7280 |
| Grey Medium | #A8B6CD |
| Grey Light 1 | #E2E8F0 |
| Grey Light 2 | #E7ECF3 |
| Grey Light 3 | #F3F5F8 |
| White | #FFFFFF |
| White 50% | #FFFFFF (50%) |
| White 20% | #FFFFFF (20%) |
| Transparent | #FFFFFF (0%) |

---

## Colors / Brand

| Token | Value |
|---|---|
| Brand Primary 1 | #1D4ED8 |
| Brand Primary 1 0% | #1D4ED8 (0%) |
| Brand Primary 1 70% | #1D4ED8 (70%) |
| Brand Primary 2 | #3466E3 |
| Brand Primary 3 | #83BCFF |
| Brand Primary 4 | #BFDBFE |
| Brand Primary 5 | #344785 |
| Brand Supplementary 1 | #8326FF |
| Brand Supplementary 2 | #C1A4FF |
| Brand Supplementary 3 | #8369FF |
| Brand Supplementary 4 | #22F2FF |
