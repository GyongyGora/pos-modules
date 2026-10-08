import { COMPONENT_SPECS } from './token-panel.js';
import { COMP_CONFIGS } from './comp-configs.js';
import { usageContainer } from './core/dom-refs.js';

  /* set by switchComponent */

  /* SVG icons reused in renderUsageTab */
  export var SVG_CHECK  = '<svg width="14" height="14" viewBox="2 2 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="fill:none;overflow:visible" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 12l2 2l4 -4" /></svg>';
  export var SVG_CROSS  = '<svg width="14" height="14" viewBox="2 2 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="fill:none;overflow:visible" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M10 10l4 4m0 -4l-4 4" /></svg>';

  export function renderUsageList(items: string[] | null | undefined): string {
    if (Array.isArray(items)) {
      return '<ul class="comp-usage-list">' + items.map(function(i) { return '<li>' + i + '</li>'; }).join('') + '</ul>';
    }
    return '<p>' + items + '</p>';
  }

  export function renderSurfaceTable(surfaces: any[] | null | undefined): string {
    var rows = surfaces.map(function(s: any) {
      return '<tr>' +
        '<td><span class="comp-usage-swatch" style="background:' + s.hex + '"></span>' + s.surface + '</td>' +
        '<td>' + s.variants.map(function(v: string) { return '<code>' + v + '</code>'; }).join(', ') + '</td>' +
      '</tr>';
    }).join('');
    return '<table class="comp-usage-surface-table"><thead><tr><th>Surface</th><th>Variants</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }

  /* Usage content is authored once in the component's spec JSON (whenToUse/
     whenNotToUse/do/dont/accessibility/surfaces) since 2026-09-01 — migrated
     from the previously separate, duplicate-authored COMP_CONFIGS[key].usage
     (which is what this function actually read before; the spec JSON's own
     fields were never wired to any renderer). Field names differ by
     convention (spec: whenToUse/whenNotToUse; COMP_CONFIGS: useWhen/
     avoidWhen) — map them here. Falls back to COMP_CONFIGS[key].usage when a
     component has no spec entry yet (e.g. a config-only leftover with no
     spec.json), so nothing regresses for anything not yet migrated. */
  export function getUsageData(key: string): any {
    var spec = COMPONENT_SPECS[key];
    if (spec && spec.whenToUse) {
      return {
        useWhen: spec.whenToUse,
        avoidWhen: spec.whenNotToUse,
        do: spec.do,
        dont: spec.dont,
        accessibility: spec.accessibility,
        surfaces: spec.surfaces,
      };
    }
    var cfg = COMP_CONFIGS[key];
    return cfg ? cfg.usage : null;
  }

  export function renderUsageTab(key: string): void {
    if (!usageContainer) return;
    var u = getUsageData(key);
    if (!u) return;
    var html = '';
    if (u.surfaces) {
      html += '<div class="comp-usage-section"><h3 class="comp-usage-heading comp-usage-heading--surface">Variant by surface</h3>' + renderSurfaceTable(u.surfaces) + '</div>';
    }
    html +=
      '<div class="comp-usage-section"><h3 class="comp-usage-heading comp-usage-heading--use">' + SVG_CHECK + ' Use when</h3>' + renderUsageList(u.useWhen) + '</div>' +
      '<div class="comp-usage-section"><h3 class="comp-usage-heading comp-usage-heading--avoid">' + SVG_CROSS + ' Avoid when</h3>' + renderUsageList(u.avoidWhen) + '</div>' +
      '<div class="comp-usage-section"><h3 class="comp-usage-heading comp-usage-heading--do">' + SVG_CHECK + ' Do</h3>' + renderUsageList(u.do || u.doText) + '</div>' +
      '<div class="comp-usage-section"><h3 class="comp-usage-heading comp-usage-heading--dont">' + SVG_CROSS + " Don't" + '</h3>' + renderUsageList(u.dont || u.dontText) + '</div>';
    if (u.accessibility) {
      html += '<div class="comp-usage-section"><h3 class="comp-usage-heading comp-usage-heading--a11y">Accessibility</h3>' + renderUsageList(u.accessibility) + '</div>';
    }
    usageContainer.innerHTML = html;
  }