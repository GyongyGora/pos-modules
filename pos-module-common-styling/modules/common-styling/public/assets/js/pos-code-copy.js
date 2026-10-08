(function () {
  if (typeof window.pos !== 'object') { window.pos = {}; }
  if (!window.pos.modules) { window.pos.modules = {}; }

  var COPY_ICON = '<svg width="16" height="16" aria-hidden="true" viewBox="2 2 20 20" style="fill:none;overflow:visible" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666" /><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" /></svg>';
  var CHECK_ICON = '<svg width="16" height="16" aria-hidden="true" viewBox="2 2 20 20" style="fill:none;overflow:visible" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5l10 -10" /></svg>';

  function addLineNumbers(pre) {
    if (pre.dataset.lnDone) return;
    var codeEl = pre.querySelector('code');
    if (!codeEl) return;
    pre.dataset.hljsOrigHtml = codeEl.innerHTML; /* save for removal */
    var lines = codeEl.innerHTML.split('\n');
    if (lines[lines.length - 1] === '') lines.pop();
    codeEl.innerHTML = lines.map(function (line) {
      return '<span class="pos-code-ln">' + (line === '' ? ' ' : line) + '</span>';
    }).join('');
    pre.dataset.lnDone = '1';
  }

  function removeLineNumbers(pre) {
    if (!pre.dataset.lnDone) return;
    var codeEl = pre.querySelector('code');
    if (codeEl && pre.dataset.hljsOrigHtml !== undefined) {
      codeEl.innerHTML = pre.dataset.hljsOrigHtml;
    }
    delete pre.dataset.lnDone;
  }

  function highlightBlock(pre) {
    if (pre.dataset.hljsDone) return;
    var codeEl = pre.querySelector('code[class*="language-"]');
    if (!codeEl || typeof hljs === 'undefined') return;
    hljs.highlightElement(codeEl);
    pre.dataset.hljsDone = '1';
    if (pre.classList.contains('pos-code--numbered')) {
      addLineNumbers(pre);
    }
  }

  function initBlock(pre) {
    highlightBlock(pre);
    if (pre.querySelector('.pos-code-copy-btn')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pos-code-copy-btn';
    btn.setAttribute('aria-label', 'Copy code');
    btn.title = 'Copy code';
    btn.innerHTML =
      '<span class="pos-code-copy-icon-copy">'  + COPY_ICON  + '</span>' +
      '<span class="pos-code-copy-icon-check">' + CHECK_ICON + '</span>';

    btn.addEventListener('click', function () {
      var codeEl = pre.querySelector('code');
      var text;
      if (pre.dataset.lnDone && codeEl) {
        /* collect per-line spans; replace the nbsp placeholder back to empty string */
        text = Array.from(codeEl.querySelectorAll('.pos-code-ln')).map(function (span) {
          return span.textContent === ' ' ? '' : span.textContent;
        }).join('\n');
      } else {
        text = codeEl ? codeEl.textContent : pre.textContent;
      }
      navigator.clipboard.writeText(text).then(function () {
        btn.classList.add('pos-code-copy-btn--copied');
        btn.setAttribute('aria-label', 'Copied!');
        btn.title = 'Copied!';
        setTimeout(function () {
          btn.classList.remove('pos-code-copy-btn--copied');
          btn.setAttribute('aria-label', 'Copy code');
          btn.title = 'Copy code';
        }, 2000);
      });
    });

    pre.appendChild(btn);
  }

  window.pos.modules.codeCopy = {
    init: function () {
      document.querySelectorAll('.pos-code--block').forEach(initBlock);
    },
    addLineNumbers: addLineNumbers,
    removeLineNumbers: removeLineNumbers
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.pos.modules.codeCopy.init);
  } else {
    window.pos.modules.codeCopy.init();
  }
}());
