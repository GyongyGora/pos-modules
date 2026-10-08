/**
 * pos-prefs.js — User preference utilities
 *
 * Manages theme (light/dark/auto), accessibility (high contrast) mode, and font size preferences.
 * Persists selections to localStorage and restores them on init.
 *
 * Usage:
 *   pos.prefs.init();                    // call once, as early as possible
 *   pos.prefs.theme.set('dark');         // 'light' | 'dark' | 'auto'
 *   pos.prefs.a11y.set(true);           // enable accessibility (high contrast) mode
 *   pos.prefs.fontSize.set('large');     // 'default' | 'large' | 'xl'
 *   pos.prefs.theme.get();              // returns current value
 *   pos.prefs.a11y.get();               // returns true | false
 *   pos.prefs.fontSize.get();           // returns current value
 */

(function () {
  if (typeof window.pos !== 'object') { window.pos = {}; }

  var THEME_KEY     = 'pos-theme';
  var A11Y_KEY      = 'pos-a11y';
  var FONT_SIZE_KEY = 'pos-font-size';

  var FONT_SIZES = {
    'default': '100%',
    'large':   '112.5%',
    'xl':      '125%'
  };

  /* ── Theme ──────────────────────────────────────────────────────── */

  var theme = {
    /**
     * Apply a theme.
     * @param {'light'|'dark'|'auto'} value
     *   'auto' follows the OS (prefers-color-scheme) via pos-theme-darkEnabled.
     */
    set: function (value) {
      var html = document.documentElement;
      // dark mode applies only with pos-theme-darkEnabled on <html> (pos-config.css)
      if (value === 'dark') {
        html.classList.add('pos-theme-dark', 'pos-theme-darkEnabled');
        html.classList.remove('pos-theme-light');
      } else if (value === 'light') {
        html.classList.add('pos-theme-light');
        html.classList.remove('pos-theme-dark', 'pos-theme-darkEnabled');
      } else {
        // 'auto' — no forced theme, dark mode follows the OS preference
        html.classList.add('pos-theme-darkEnabled');
        html.classList.remove('pos-theme-dark', 'pos-theme-light');
      }
      try { localStorage.setItem(THEME_KEY, value); } catch (e) {}
    },

    /** Returns the stored preference ('light' | 'dark' | 'auto'). */
    get: function () {
      try { return localStorage.getItem(THEME_KEY) || 'auto'; } catch (e) { return 'auto'; }
    },

    /** Toggle between light and dark. Clears 'auto'. */
    toggle: function () {
      this.set(this.get() === 'dark' ? 'light' : 'dark');
    },

    /** Restore from localStorage (call during init). */
    init: function () {
      this.set(this.get());
    }
  };

  /* ── Accessibility (high contrast) ─────────────────────────────── */

  var a11y = {
    /**
     * Enable or disable accessibility (high contrast) mode.
     * Independent of light/dark — it can be combined with either.
     * @param {boolean} value
     */
    set: function (value) {
      // high contrast applies only with pos-theme-a11yEnabled on <html> (pos-config.css)
      if (value) {
        document.documentElement.classList.add('pos-theme-a11y', 'pos-theme-a11yEnabled');
      } else {
        document.documentElement.classList.remove('pos-theme-a11y', 'pos-theme-a11yEnabled');
      }
      try { localStorage.setItem(A11Y_KEY, value ? '1' : '0'); } catch (e) {}
    },

    /** Returns true if accessibility (high contrast) mode is active. */
    get: function () {
      try { return localStorage.getItem(A11Y_KEY) === '1'; } catch (e) { return false; }
    },

    /** Toggle accessibility (high contrast) mode on/off. */
    toggle: function () {
      this.set(!this.get());
    },

    /** Restore from localStorage (call during init). */
    init: function () {
      this.set(this.get());
    }
  };

  /* ── Font size ──────────────────────────────────────────────────── */

  var fontSize = {
    /**
     * Apply a font size step.
     * @param {'default'|'large'|'xl'} value
     */
    set: function (value) {
      var size = FONT_SIZES[value] || FONT_SIZES['default'];
      document.documentElement.style.fontSize = size;
      try { localStorage.setItem(FONT_SIZE_KEY, value); } catch (e) {}
      // Notify layout-dependent components to recalculate
      requestAnimationFrame(function () {
        window.dispatchEvent(new Event('resize'));
      });
    },

    /** Returns the stored preference ('default' | 'large' | 'xl'). */
    get: function () {
      try { return localStorage.getItem(FONT_SIZE_KEY) || 'default'; } catch (e) { return 'default'; }
    },

    /** Restore from localStorage (call during init). */
    init: function () {
      this.set(this.get());
    }
  };

  /* ── Public API ─────────────────────────────────────────────────── */

  window.pos.prefs = {
    theme:    theme,
    a11y:     a11y,
    fontSize: fontSize,

    /**
     * Initialize all preferences from localStorage.
     * Call this as early as possible (before first paint) to avoid flash.
     */
    init: function () {
      theme.init();
      a11y.init();
      fontSize.init();
    }
  };
}());
