(function () {
  if (typeof window.pos !== 'object') { window.pos = {}; }
  if (!window.pos.modules) { window.pos.modules = {}; }

  function enable() {
    document.documentElement.setAttribute('data-keyboard-nav', '');
  }

  function disable() {
    document.documentElement.removeAttribute('data-keyboard-nav');
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') enable();
  });

  document.addEventListener('mousedown', disable);

  window.pos.modules.keyboardNav = { enable: enable, disable: disable };
}());
