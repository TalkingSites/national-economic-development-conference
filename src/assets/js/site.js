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

  /* --- Theme ---
     Two states. The page follows the operating system until someone chooses,
     and the choice is stored. A three way cycle was wrong here: its "auto"
     state looks identical to whichever mode the system is already in, so one
     press in three appeared to do nothing. --- */
  var THEME_KEY = 'nedc-theme';
  var themeBtn = document.getElementById('themeToggle');
  var darkQuery = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;

  function storedTheme() {
    try {
      var v = localStorage.getItem(THEME_KEY);
      return v === 'light' || v === 'dark' ? v : null;
    } catch (e) { return null; }
  }

  function activeTheme() {
    return storedTheme() || (darkQuery && darkQuery.matches ? 'dark' : 'light');
  }

  function paintToggle() {
    if (!themeBtn) return;
    var next = activeTheme() === 'dark' ? 'light' : 'dark';
    Array.prototype.forEach.call(themeBtn.querySelectorAll('[data-theme-icon]'), function (icon) {
      /* Attribute, not the .hidden property: these are SVG elements, and
         .hidden is only defined on HTMLElement, so assigning it would set a
         harmless expando and leave the icon hidden. */
      if (icon.getAttribute('data-theme-icon') === next) icon.removeAttribute('hidden');
      else icon.setAttribute('hidden', '');
    });
    var label = next === 'dark' ? 'Switch to dark theme' : 'Switch to light theme';
    themeBtn.setAttribute('aria-label', label);
    themeBtn.setAttribute('title', label);
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    paintToggle();
  }

  if (themeBtn) {
    paintToggle();
    themeBtn.addEventListener('click', function () {
      setTheme(activeTheme() === 'dark' ? 'light' : 'dark');
    });
  }

  /* While no choice is stored, follow the system if it changes. */
  if (darkQuery) {
    var onSystemChange = function () { if (!storedTheme()) paintToggle(); };
    if (darkQuery.addEventListener) darkQuery.addEventListener('change', onSystemChange);
    else if (darkQuery.addListener) darkQuery.addListener(onSystemChange);
  }

  /* --- Header gains a rule once the page scrolls --- */
  var header = document.getElementById('siteHeader');
  var onScroll = function () { header.setAttribute('data-stuck', String(window.scrollY > 8)); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();
