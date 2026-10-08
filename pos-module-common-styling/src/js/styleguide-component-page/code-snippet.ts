import { getActivePreviewStage } from './preview-stage.js';
import { state } from './core/state.js';
import { COMPONENT_SPECS } from './token-panel.js';



  /* ── Code panel ── sibling render function to renderTokenPanel above, same data source
     (COMPONENT_SPECS), same trigger (tryRefreshInspect). Human-only convenience — generates a
     generic code snippet via buildGenericCodeSnippet() for every spec-driven component. */
  export function escapeHtmlForDisplay(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  export function buildButtonCodeSnippet(base: string, intent: string, status: string, size: string): string {
    var classes = ['pos-button'];
    if (base === 'primary') classes.push('pos-button-primary');
    if (base === 'secondary') classes.push('pos-button-secondary');
    if (base === 'ghost') classes.push('pos-button-ghost');
    if (intent === 'error') classes.push('pos-button-error');
    if (intent === 'success') classes.push('pos-button-success');
    if (intent === 'inverted') classes.push('pos-button-inverted');
    if (size === 'small') classes.push('pos-button-small');
    if (status === 'loading') classes.push('pos-button--loading');
    var attrs = ' type="button" class="' + classes.join(' ') + '"';
    if (status === 'disabled') attrs += ' disabled';
    return '<button' + attrs + '>Save changes</button>';
  }

  /* ── Generic code snippet (component migration batch, 2026-08-26) ── for every migrated component
     except Button/Code (which have hand-built snippet functions above, since their markup varies too
     much — attributes, disabled state — to safely derive from a DOM clone). Reads the CURRENTLY
     VISIBLE preview markup directly and cleans it up for display: strips demo-only ids/inline
     styles/debug classes, replaces rendered icon <svg> with an "<!-- icon -->" comment (matching the
     convention every hand-written snippet on this site already uses), removes the row label. This is
     genuinely reactive to every toggle for free — it shows whatever is actually on screen — without
     a bespoke builder function per component. */
  export var CODE_CLEAN_STRIP_ATTRS = ['id', 'style', 'onclick', 'data-status', 'data-size', 'data-anim-dismiss', 'data-anim-no-remove', 'open'];
  /* Popover / Popover menu — the doc preview's DOM is a purely-visual always-open stand-in
     (.comp-popover-demo-trigger/-caret/-panel), not the real [popover]/popovertarget markup (real
     usage needs the native Popover API to actually open/close; the demo can't use it and stay
     visible for browsing). Cloning that DOM would produce misleading example code, so these two
     keep a small static snippet instead — same as Button/Code's bespoke functions, just not
     variant-reactive since neither has a toggle that changes their real markup. */
  export var STATIC_CODE_SNIPPETS: Record<string, string> = {
    'popover-content':
      '<div class="pos-popover">\n' +
      '  <button type="button" class="pos-button" popovertarget="my-popover">Open popover</button>\n' +
      '  <div id="my-popover" popover>\n' +
      '    Any content here…\n' +
      '  </div>\n' +
      '</div>',
    popover:
      '<div class="pos-popover">\n' +
      '  <button type="button" class="pos-button" aria-label="More actions" popovertarget="my-popover">\n' +
      '    <!-- icon -->\n' +
      '  </button>\n' +
      '  <menu id="my-popover" popover>\n' +
      '    <li><a href="/edit">Edit</a></li>\n' +
      '    <li><a href="/duplicate">Duplicate</a></li>\n' +
      '    <li class="pos-popover-menu-item-important"><button type="button">Delete</button></li>\n' +
      '  </menu>\n' +
      '</div>',
    /* File upload — Uppy generates the Dashboard's internal DOM entirely at runtime; the docs
       preview mounts a real live instance for accuracy, but cloning that generated DOM would show
       misleading "example code" no developer would ever hand-write. The real usage is this simple
       wrapper markup plus the JS init call, matching forms/upload.liquid + pos-upload.js exactly. */
    'file-upload':
      '<div class="pos-upload" id="my-upload" data-upload-url="{{ presigned_upload.upload_url }}">\n' +
      '  <div class="pos-upload-dashboard"></div>\n' +
      '  <template class="pos-upload-added-file-input">\n' +
      '    <input type="hidden" name="my_field[added][]" data-id="">\n' +
      '  </template>\n' +
      '  <template class="pos-upload-removed-file-input">\n' +
      '    <input type="hidden" name="my_field[removed][]" data-id="">\n' +
      '  </template>\n' +
      '</div>\n\n' +
      '<script>\n' +
      '  new window.pos.modules.upload({\n' +
      '    container: document.getElementById(\'my-upload\'),\n' +
      '  });\n' +
      '</script>',
    /* Markdown editor — EasyMDE generates its own internal toolbar/editor/preview DOM entirely at
       runtime; the docs preview mounts a real live instance for accuracy, but cloning that
       generated DOM would show misleading "example code" no developer would ever hand-write. The
       real usage is this simple wrapper markup plus the JS init call, matching
       forms/markdown.liquid + pos-markdown.js exactly. */
    'markdown':
      '<div class="pos-markdown" id="my-editor">\n' +
      '  <textarea class="pos-forms-text" rows="2" name="my_field" data-upload-url="{{ presigned_upload.upload_url }}"></textarea>\n' +
      '  <ul class="pos-form-errors">\n' +
      '    <li class="pos-form-error pos-markdown-error-disabled" data-pos-markdown-error-minlength>Too short</li>\n' +
      '    <li class="pos-form-error pos-markdown-error-disabled" data-pos-markdown-error-maxlength>Too long</li>\n' +
      '  </ul>\n' +
      '</div>\n\n' +
      '<script>\n' +
      '  new window.pos.modules.markdown({\n' +
      '    container: document.getElementById(\'my-editor\'),\n' +
      '  });\n' +
      '</script>',
  };
  /* Unwrap bare doc-site-only centering <div>s (e.g. `<div style="display:flex;
     justify-content:center">` around Avatar/Card/Pagination's real markup) —
     once CODE_CLEAN_STRIP_ATTRS removes their `style`, they're empty,
     attribute-less <div>s with a single element child and nothing else,
     which would otherwise sit in the copyable snippet as meaningless
     wrapper noise. Repeats until none remain (handles nested wrappers). */
  export function unwrapBareCenteringDivs(root: HTMLElement): void {
    var changed = true;
    while (changed) {
      changed = false;
      var divs = root.querySelectorAll<HTMLElement>('div');
      for (var i = 0; i < divs.length; i++) {
        var div = divs[i];
        if (div.attributes.length > 0) continue;
        if (div.children.length !== 1) continue;
        if (div.textContent.trim() !== div.children[0].textContent.trim()) continue; // has its own text, not just the child
        div.replaceWith(div.children[0]);
        changed = true;
        break; // querySelectorAll result is now stale — restart
      }
    }
  }
  export function cleanNodeForCodeDisplay(root: HTMLElement): HTMLElement {
    root.querySelectorAll<HTMLElement>('.comp-preview-variant-label, .comp-preview-reset-btn').forEach(function (n: HTMLElement) {
      var li = n.closest('li');
      (li || n).remove();
    });
    root.querySelectorAll<HTMLElement>('svg').forEach(function (svg: HTMLElement) {
      var parent = svg.parentElement;
      /* an icon-only wrapper (e.g. <span class="…-icon"><svg></span>) becomes a one-liner */
      if (parent && parent.children.length === 1 && parent.textContent.trim() === '') {
        parent.textContent = '';
        parent.appendChild(document.createComment(' icon '));
        return;
      }
      svg.replaceWith(document.createComment(' icon '));
    });
    var all = root.querySelectorAll<HTMLElement>('*');
    /* ids the markup itself points at with aria-describedby / aria-labelledby / popovertarget
       (e.g. the icon tooltip, the dropdown button's menu) are part of the real usage, not
       demo-only — keep those */
    var referencedIds: string[] = [];
    for (var r = 0; r < all.length; r++) {
      ['aria-describedby', 'aria-labelledby', 'popovertarget'].forEach(function (attr) {
        var v = all[r].getAttribute(attr);
        if (v) referencedIds = referencedIds.concat(v.split(/\s+/));
      });
    }
    for (var i = 0; i < all.length; i++) {
      var keepId = referencedIds.indexOf(all[i].id) !== -1;
      CODE_CLEAN_STRIP_ATTRS.forEach(function (attr) {
        if (attr === 'id' && keepId) return;
        all[i].removeAttribute(attr);
      });
    }
    CODE_CLEAN_STRIP_ATTRS.forEach(function (attr) { root.removeAttribute(attr); });
    /* the doc preview's simulated-state classes (pos-debug-*) are not part of real usage */
    [root].concat(Array.prototype.slice.call(root.querySelectorAll('[class]'))).forEach(function (el: Element) {
      var debug = Array.prototype.filter.call(el.classList, function (c: string) { return c.indexOf('pos-debug-') === 0; });
      debug.forEach(function (c: string) { el.classList.remove(c); });
      if (el.hasAttribute('class') && !el.getAttribute('class').trim()) el.removeAttribute('class');
    });
    unwrapBareCenteringDivs(root);
    return root;
  }
  /* drop the blank lines Liquid leaves around rendered partials and the template's own
     indentation, so the snippet starts at column 0 */
  export function tidySnippetWhitespace(html: string): string {
    var lines = html.split('\n').filter(function (l) { return l.trim() !== ''; });
    /* a rendered icon's "<!-- icon -->" stand-in keeps the icon partial's indentation, not the
       template's — give it the indentation of the line after it */
    for (var k = lines.length - 2; k >= 1; k--) {
      if (/^\s*<!-- icon -->$/.test(lines[k])) lines[k] = lines[k + 1].match(/^ */)[0] + lines[k].trim();
    }
    /* the first line was trimmed already — the rest share the template's indentation */
    var indents = lines.slice(1).map(function (l) { return l.match(/^ */)[0].length; });
    var base = indents.length ? Math.min.apply(null, indents) : 0;
    return lines.map(function (l, i) { return i === 0 ? l : l.slice(base); }).join('\n');
  }
  export function buildGenericCodeSnippet(compKey: string): string | null {
    if (STATIC_CODE_SNIPPETS[compKey]) return STATIC_CODE_SNIPPETS[compKey];
    var stage = document.getElementById('comp-' + compKey + '-preview') || getActivePreviewStage();
    if (!stage) return null;
    var visibleRow = stage.querySelector<HTMLElement>('.comp-preview-variant-row:not([hidden])');
    var source = visibleRow ? (visibleRow.querySelector<HTMLElement>('.comp-preview-variant-items') || visibleRow) : stage;
    var clone = cleanNodeForCodeDisplay(source.cloneNode(true) as HTMLElement);
    var html = tidySnippetWhitespace(clone.innerHTML.trim());
    return html || null;
  }

  export function renderCodePanel() {
    var pre = document.getElementById('comp-preview-code-' + state.comp);
    if (!pre) return;
    var snippet;
    if (state.comp === 'button' && COMPONENT_SPECS['button']) {
      snippet = buildButtonCodeSnippet(state.buttonBase, state.buttonIntent, state.status, state.size);
    } else if (COMPONENT_SPECS[state.comp]) {
      snippet = buildGenericCodeSnippet(state.comp);
    } else {
      return;
    }
    if (!snippet) return;
    pre.innerHTML = '<code class="language-html">' + escapeHtmlForDisplay(snippet) + '</code>';
    /* pos.modules.codeCopy (pos-code-copy.js) scans every .pos-code--block on the page once, at
       DOMContentLoaded, to apply highlight.js AND append the real DS copy button (.pos-code-copy-btn,
       matching every other code block on the site) — it never sees this dynamically-updated block
       on its own. Re-running .init() here is safe/idempotent (it skips blocks already marked done)
       — but since this <pre> is reused (only its <code> child is replaced, not the <pre> itself,
       so the copy button placed directly inside <pre> would otherwise be wiped every re-render),
       clear its "done" markers first so highlight + the copy button both get freshly reapplied. */
    delete pre.dataset.hljsDone;
    delete pre.dataset.lnDone;
    if (window.pos && window.pos.modules && window.pos.modules.codeCopy) {
      window.pos.modules.codeCopy.init();
    }
  }