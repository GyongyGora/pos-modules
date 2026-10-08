import { type Locator, type Page } from '@playwright/test';

/**
 * Page object for /style-guide/component-template — the spec-driven
 * design system docs site.
 */
export class StyleGuideNewPage {
  path: string;
  readonly page: Page;
  readonly mainContent: Locator;
  readonly rightTitle: Locator;
  readonly statusGrid: Locator;
  readonly tokensTabButton: Locator;
  readonly tokensPanel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.path = '/style-guide/component-template';
    this.mainContent = page.locator('#main-content');
    this.rightTitle = page.locator('#comp-right-title');
    this.statusGrid = page.locator('#comp-status-grid');
    this.tokensTabButton = page.locator('#comp-tab-btn-tokens');
    this.tokensPanel = page.locator('#comp-tokens-panel');
  }

  async goto() {
    await this.page.goto(this.path);
    await this.rightTitle.waitFor();
  }

  /** The <section data-comp-key="..."> for a given component key. */
  section(compKey: string): Locator {
    return this.page.locator(`#comp-section-${compKey}`);
  }

  /** The left-nav sidebar link that jumps to a component's section. Uses an exact
   *  end-of-string match (href$=), not a substring match — "popover" would otherwise
   *  also match the "popover-content" link, which is a different component. */
  navLink(compKey: string): Locator {
    return this.page.locator(`.styleguide-ds-sidebar a[href$="#comp-section-${compKey}"]`);
  }

  /** Clicks a nav-left link, first expanding its parent sidebar group if it's currently
   *  collapsed (nav-left.liquid marks a non-active group's children `inert` by default —
   *  clicking a link inside an inert container is a silent no-op, not an error), then waits
   *  for #main-content's own "smooth" scroll to genuinely settle.
   *
   *  This wait matters for more than just visual completeness: the page runs a scroll-sync
   *  observer that re-derives the "active" component on every scroll tick and re-runs
   *  switchComponent() for it — which resets the State selector back to Normal as part of its
   *  own bookkeeping. Interacting with the right-panel controls *before* the scroll animation
   *  has fully stopped races that observer: a click can land, then get silently reverted by
   *  the very next scroll-triggered reset. Waiting for scrollTop to stop changing (not just
   *  for the target to be "close enough" to visible) avoids that race entirely. */
  async gotoComponent(compKey: string) {
    const link = this.navLink(compKey).first();
    const li = link.locator('xpath=ancestor::li[1]');
    const children = li.locator('.pos-collapsible-children');
    if (await children.count() > 0) {
      const isInert = await children.first().evaluate((el) => el.hasAttribute('inert'));
      if (isInert) {
        await li.locator('.pos-collapsible-toggle').first().click();
      }
    }
    await link.click();
    await this.waitForScrollSettled();
  }

  /** Polls #main-content's scrollTop until it reports the same value on two consecutive
   *  checks 150ms apart — a genuinely stopped scroll, not just "temporarily paused mid-frame"
   *  (native smooth-scroll updates every animation frame, ~16ms, so a real 150ms plateau is a
   *  reliable stop signal). Falls back to resolving after `timeout` regardless, so a page with
   *  no #main-content or an unexpectedly long scroll can't hang the caller forever. */
  async waitForScrollSettled(timeout = 20000) {
    // reset the sentinel first — otherwise a stale value left over from a *previous* call
    // could coincidentally match the current (not-yet-moved) scrollTop and report "settled"
    // on the very first poll, before the new scroll has even started.
    await this.page.evaluate(() => { delete (window as unknown as { __lastScrollTop?: number }).__lastScrollTop; });
    await this.page.waitForFunction(
      () => {
        const el = document.querySelector('#main-content');
        if (!el) return true;
        const w = window as unknown as { __lastScrollTop?: number };
        const current = el.scrollTop;
        const settled = w.__lastScrollTop === current;
        w.__lastScrollTop = current;
        return settled;
      },
      undefined,
      { timeout, polling: 150 }
    ).catch(() => {}); // best-effort — never fail the test just because scroll never fully "settles"
  }

  /** Every currently-visible AND enabled status button in the shared status grid. Some
   *  components legitimately disable specific states for specific variants (e.g. Tag's
   *  "Default" kind has no hover/focus/disabled/selected state — see
   *  setTagStateButtonsForKind() in styleguide-component-page.js) — :visible alone isn't
   *  enough, a real user can't click a disabled button either. */
  visibleStatusButtons(): Locator {
    return this.statusGrid.locator('[data-status-btn]:visible:enabled');
  }

  /** True if the shared status grid's own control-section wrapper is currently JS-hidden
   *  (`data-comp-control="state"` not in the active component's `controls` array —
   *  switchComponent() sets `.hidden` on it directly). Some components (Select, Multiselect,
   *  Toggle button, Popover, Tooltip) have their own bespoke state toggle instead — checking
   *  the `.hidden` property (not rendered visibility) reflects the app's actual gating intent,
   *  not whatever CSS happens to render. */
  async usesSharedStatusGrid(): Promise<boolean> {
    const wrapper = this.statusGrid.locator('xpath=..');
    const isHidden = await wrapper.evaluate((el) => (el as HTMLElement).hidden);
    return !isHidden;
  }

  statusButton(status: string): Locator {
    return this.statusGrid.locator(`[data-status-btn="${status}"]`);
  }

  /** Any element within a component's section carrying the given data-status value — every
   *  applyStatus_* handler sets this on its own preview stage, so this is a component-agnostic
   *  way to confirm a status change actually applied. */
  sectionWithStatus(compKey: string, status: string): Locator {
    return this.page.locator(`#comp-section-${compKey} [data-status="${status}"]`);
  }
}
