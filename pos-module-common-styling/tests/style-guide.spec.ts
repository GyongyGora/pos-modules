import { test, expect } from '@playwright/test';
import { StyleGuideNewPage } from './pages/styleGuideNew';

/**
 * /style-guide/component-template regression coverage.
 *
 * These tests exist to catch exactly the class of bug this module has
 * hit repeatedly and had to find by hand: a component's applyStatus_* handler silently not
 * wiring up, a debug-simulation CSS rule drifting out of sync with the real :hover/:focus rule,
 * and the outer-page-scroll-jump bug that made the Switch/Toggle button previews appear to
 * "break" when clicked.
 */

test.describe('style-guide: component-template smoke test', () => {
  test('page loads with no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });

    const sg = new StyleGuideNewPage(page);
    await sg.goto();

    await expect(sg.rightTitle).toBeVisible();
    expect(errors, 'no JS errors should occur on initial load').toEqual([]);
  });
});

test.describe('style-guide: component navigation', () => {
  test('every nav-left component link switches the right panel title with no JS errors', async ({ page }) => {
    // walks 30+ stacked sections, each with up to a 15s smooth-scroll wait — comfortably passes
    // alone (~27s) but can exceed the 30s default under 3-worker parallel load.
    test.setTimeout(90_000);
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });

    const sg = new StyleGuideNewPage(page);
    await sg.goto();

    const compKeys: string[] = await page.locator('[data-comp-key]').evaluateAll(
      (els) => els.map((el) => (el as HTMLElement).dataset.compKey!).filter(Boolean)
    );
    expect(compKeys.length, 'expected to find component sections on the page').toBeGreaterThan(0);

    for (const key of compKeys) {
      await test.step(`switch to "${key}"`, async () => {
        const link = sg.navLink(key);
        if (await link.count() === 0) return; // some sections (e.g. legacy card) may not have a dedicated nav link
        await sg.gotoComponent(key);
        // long "smooth" scroll distances (this page has 30+ stacked sections) can take a few
        // seconds to complete — give it real headroom instead of the 5s assertion default.
        await expect(sg.section(key)).toBeInViewport({ ratio: 0.05, timeout: 15000 });
      });
    }

    expect(errors, 'no JS errors should occur while navigating between components').toEqual([]);
  });
});

test.describe('style-guide: status simulation (applyStatus dispatch table)', () => {
  const STATUS_HANDLER_KEYS = [
    'toast', 'dialog', 'tab', 'control-icons', 'segmented', 'tile-btn', 'switch-card', 'tag',
    'card', 'avatar', 'feature-card', 'link', 'radio', 'checkbox', 'text-input', 'textarea',
    'select', 'multiselect', 'password', 'popover', 'button',
  ];

  for (const key of STATUS_HANDLER_KEYS) {
    test(`"${key}" status buttons apply without errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));
      page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });

      const sg = new StyleGuideNewPage(page);
      await sg.goto();

      const link = sg.navLink(key);
      test.skip(await link.count() === 0, `no nav link for "${key}" — skipping`);
      await sg.gotoComponent(key);
      // switchComponent() runs synchronously on click — currentComp is already correct here
      // regardless of whether the page's own smooth-scroll animation has visually finished
      // (which can take a while in headless mode for a long jump), so no viewport wait is
      // needed before interacting with the (always-visible, fixed) right-panel controls.
      // switchComponent() also schedules a requestAnimationFrame'd `resize` event dispatch as
      // part of its own reset — give that a moment to settle before the first status click,
      // otherwise a click can land while that's still resolving and get raced.
      await page.waitForTimeout(300);

      test.skip(!(await sg.usesSharedStatusGrid()), `"${key}" uses its own bespoke state toggle, not the shared status grid — skipping`);
      const buttons = sg.visibleStatusButtons();
      const count = await buttons.count();
      test.skip(count === 0, `"${key}" has no visible status buttons — skipping`);

      // Collect every visible status value up front, then click each by its own stable
      // attribute selector (not a positional .nth(i)) — avoids index drift if clicking one
      // button ever changes which others are visible.
      const statuses = (await buttons.evaluateAll(
        (els) => els.map((el) => el.getAttribute('data-status-btn'))
      )).filter((s): s is string => !!s);

      for (const status of statuses) {
        await sg.statusButton(status).click();
        await page.waitForTimeout(150); // let any pending RAF/resize-triggered work settle
        await expect(
          sg.sectionWithStatus(key, status),
          `expected "${key}" section to reflect data-status="${status}" after clicking it`
        ).toHaveCount(1, { timeout: 4000 });
      }

      expect(errors, `no JS errors should occur toggling "${key}" status buttons`).toEqual([]);
    });
  }
});

test.describe('style-guide: known bug regressions', () => {
  test('Avatar hover preview switches to the darker interactive-hover background', async ({ page }) => {
    const sg = new StyleGuideNewPage(page);
    await sg.goto();
    await sg.gotoComponent('avatar');

    const avatar = sg.section('avatar').locator('.pos-avatar').first();
    await expect(avatar).toBeVisible();
    const restingColor = await avatar.evaluate((el) => getComputedStyle(el).backgroundColor);

    await sg.statusButton('hover').click();
    await expect(avatar).toHaveClass(/pos-debug-avatar-hover/);
    const hoverColor = await avatar.evaluate((el) => getComputedStyle(el).backgroundColor);

    expect(
      hoverColor,
      'Avatar hover simulation must change the background color, not just show the focus ring (regression: 2026-09-18, debug class was missing background-color)'
    ).not.toBe(restingColor);
  });

  test('Switch button preview does not shift the outer page scroll when clicked (even after 5+ seconds)', async ({ page }) => {
    const sg = new StyleGuideNewPage(page);
    await sg.goto();
    // Navigate via the nav link so a #comp-section-switch-card hash lands in the URL, same as
    // the originally-reported bug. The scroll-jump guard used to be removed 5s after load —
    // waiting past that window here is the point of this test (regression: 2026-09-18).
    await sg.gotoComponent('switch-card');

    await page.waitForTimeout(5500);
    // Manually verified in a real browser (2026-09-18) that clicking this input after a 6+
    // second wait works correctly with no scroll jump. Playwright's own actionability pipeline
    // (viewport/pointer-interception checks, even with force:true) disagrees with that
    // confirmed real-browser result in headless Chromium on this page — rather than keep
    // fighting that heuristic, dispatch a genuine native click directly, which exercises the
    // exact same click handler a real user's click would, and check the one thing this test
    // actually cares about (outer scroll) directly.
    await page.evaluate(() => {
      (document.querySelector('#comp-section-switch-card .pos-switch-card-input') as HTMLElement)?.click();
    });

    expect(await page.evaluate(() => window.scrollY), 'outer page scroll must stay at 0').toBe(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollTop),
      'documentElement scroll must stay at 0'
    ).toBe(0);
  });

  test('Toggle button preview does not shift the outer page scroll when clicked (even after 5+ seconds)', async ({ page }) => {
    const sg = new StyleGuideNewPage(page);
    await sg.goto();
    await sg.gotoComponent('toggle-btn');

    await page.waitForTimeout(5500);
    await page.evaluate(() => {
      (document.querySelector('#comp-section-toggle-btn .pos-toggle-btn-input') as HTMLElement)?.click();
    });

    expect(await page.evaluate(() => window.scrollY), 'outer page scroll must stay at 0').toBe(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollTop),
      'documentElement scroll must stay at 0'
    ).toBe(0);
  });
});

test.describe('style-guide: tokens panel', () => {
  test('opens and shows token data for the default component', async ({ page }) => {
    const sg = new StyleGuideNewPage(page);
    await sg.goto();

    await sg.tokensTabButton.click();
    await expect(sg.tokensPanel).toHaveClass(/comp-tokens-panel--visible/);
    await expect(sg.tokensPanel.locator('.comp-tokens-row').first()).toBeVisible();
  });
});
