(function () {
  /* --- Dropdown navigation: hover on pointer devices, click and keyboard everywhere --- */
  var groups = Array.prototype.slice.call(document.querySelectorAll('.nav__group'));

  function close(group) {
    group.querySelector('.nav__btn').setAttribute('aria-expanded', 'false');
    group.querySelector('.nav__menu').hidden = true;
  }
  function open(group) {
    groups.forEach(function (g) { if (g !== group) close(g); });
    group.querySelector('.nav__btn').setAttribute('aria-expanded', 'true');
    group.querySelector('.nav__menu').hidden = false;
  }

  /* A short close delay makes diagonal travel from the button to an option
     forgiving; re-entering the group cancels it. */
  var closeTimer;
  function cancelClose() { clearTimeout(closeTimer); }
  function closeSoon(group) {
    cancelClose();
    closeTimer = setTimeout(function () { close(group); }, 140);
  }

  groups.forEach(function (group) {
    var btn = group.querySelector('.nav__btn');
    var canHover = function () { return matchMedia('(hover: hover)').matches; };

    btn.addEventListener('click', function () {
      cancelClose();
      btn.getAttribute('aria-expanded') === 'true' ? close(group) : open(group);
    });
    group.addEventListener('mouseenter', function () { if (canHover()) { cancelClose(); open(group); } });
    group.addEventListener('mouseleave', function () { if (canHover()) closeSoon(group); });
    group.addEventListener('focusout', function (e) { if (!group.contains(e.relatedTarget)) close(group); });

    /* Close once an option is chosen, so an in-page anchor does not leave the
       menu hanging open over the destination. */
    group.querySelector('.nav__menu').addEventListener('click', function (e) {
      if (e.target.closest('a')) close(group);
    });
  });

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') groups.forEach(close); });
  document.addEventListener('click', function (e) {
    groups.forEach(function (g) { if (!g.contains(e.target)) close(g); });
  });

  /* --- Mobile menu --- */
  var toggle = document.getElementById('menuToggle');
  var panel = document.getElementById('mobileNav');
  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
    panel.hidden = open;
  });
  panel.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      panel.hidden = true;
    }
  });

  /* --- Theme: auto (follows the system), light, dark ---
     Auto stores nothing and leaves the root unstamped, so the CSS falls back
     to prefers-color-scheme. Light and dark stamp data-theme, which the token
     stylesheet honours over the media query in both directions. --- */
  var THEME_KEY = 'nedc-theme';
  var MODES = ['auto', 'light', 'dark'];
  var LABELS = {
    auto:  'Theme follows your system. Switch to light theme.',
    light: 'Light theme. Switch to dark theme.',
    dark:  'Dark theme. Switch to following your system.'
  };
  var themeBtn = document.getElementById('themeToggle');

  function readMode() {
    try {
      var stored = localStorage.getItem(THEME_KEY);
      return MODES.indexOf(stored) > 0 ? stored : 'auto';
    } catch (e) { return 'auto'; }
  }

  function applyMode(mode) {
    var root = document.documentElement;
    if (mode === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', mode);

    try {
      if (mode === 'auto') localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, mode);
    } catch (e) {}

    if (!themeBtn) return;
    Array.prototype.forEach.call(themeBtn.querySelectorAll('[data-theme-icon]'), function (icon) {
      icon.hidden = icon.getAttribute('data-theme-icon') !== mode;
    });
    themeBtn.setAttribute('aria-label', LABELS[mode]);
    themeBtn.setAttribute('title', LABELS[mode]);
  }

  if (themeBtn) {
    applyMode(readMode());
    themeBtn.addEventListener('click', function () {
      applyMode(MODES[(MODES.indexOf(readMode()) + 1) % MODES.length]);
    });
  }

  /* --- Header gains a rule once the page scrolls --- */
  var header = document.getElementById('siteHeader');
  var onScroll = function () { header.setAttribute('data-stuck', String(window.scrollY > 8)); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();
