/*
  New DS documentation — styleguide.js

  Handles interactive behavior for the new design system documentation at /style-guide.

  Contents:
    - Nav: initialize pos-collapsible for the sidebar navigation
*/



document.addEventListener('DOMContentLoaded', () => {

  // collapsible sidebar nav
  const nav = document.querySelector('.styleguide-ds-sidebar .pos-collapsible');
  if (nav) {
    new pos.modules.collapsible({ container: nav, id: 'docs-nav' });

    // sync aria-expanded to match server-rendered inert state (pos-collapsible only
    // sets aria-expanded on user interaction, not on init)
    nav.querySelectorAll(':scope > li').forEach(function(li) {
      var children = li.querySelector('.pos-collapsible-children');
      var toggle = li.querySelector('.pos-collapsible-toggle');
      if (children && toggle && !children.inert) {
        toggle.setAttribute('aria-expanded', 'true');
      }
    });

    // clicking section header text also toggles the submenu
    nav.querySelectorAll(':scope > li:not(:has(> a))').forEach(function(li) {
      li.addEventListener('click', function(e) {
        if (e.target.closest('.pos-collapsible-toggle')) return;
        if (e.target.closest('a')) return; // ignore clicks on submenu links
        const toggle = li.querySelector('.pos-collapsible-toggle');
        if (toggle) toggle.click();
      });
    });
  }

  // animated details — delegated to pos-behavior-expand-collapse.js
  document.querySelectorAll('.styleguide-ds-details').forEach(details => {
    window.pos.behaviors.expandCollapse(details);
  });

  // before/after sync view tabs
  const tabsContainer = document.querySelector('.sync-panel-tabs');

  if (tabsContainer) {
    tabsContainer.querySelectorAll('.pos-segmented-control-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const panelId = btn.dataset.panel;
        document.querySelectorAll('.sync-view-panel').forEach(panel => {
          panel.hidden = panel.id !== panelId;
        });
      });
    });
  }

});
