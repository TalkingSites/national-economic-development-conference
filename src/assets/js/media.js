(function () {
  /* ------------------------------------------------------------------ *
   * Lightbox. One overlay serves every gallery on the page.
   * ------------------------------------------------------------------ */
  var galleries = Array.prototype.slice.call(document.querySelectorAll('[data-gallery]'));

  if (galleries.length) {
    var box = document.createElement('div');
    box.className = 'lb';
    box.hidden = true;
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Image viewer');
    box.innerHTML =
      '<button class="lb__close" type="button" aria-label="Close viewer">' +
        '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>' +
      '</button>' +
      '<button class="lb__nav lb__nav--prev" type="button" aria-label="Previous image">' +
        '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 4L7 12l8 8" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>' +
      '<figure class="lb__stage"><img class="lb__img" alt=""><figcaption class="lb__cap"></figcaption></figure>' +
      '<button class="lb__nav lb__nav--next" type="button" aria-label="Next image">' +
        '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 4l8 8-8 8" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>' +
      '<p class="lb__count util num" aria-live="polite"></p>';
    document.body.appendChild(box);

    var img    = box.querySelector('.lb__img');
    var cap    = box.querySelector('.lb__cap');
    var count  = box.querySelector('.lb__count');
    var prevBtn= box.querySelector('.lb__nav--prev');
    var nextBtn= box.querySelector('.lb__nav--next');
    var items  = [];
    var at     = 0;
    var opener = null;

    function show(i) {
      at = (i + items.length) % items.length;
      var item = items[at];
      img.src = item.src;
      img.alt = item.alt;
      cap.textContent = item.alt;
      cap.hidden = !item.alt;
      count.textContent = (at + 1) + ' / ' + items.length;
      var solo = items.length < 2;
      prevBtn.hidden = solo;
      nextBtn.hidden = solo;
    }

    function open(list, i, from) {
      items = list; opener = from;
      box.hidden = false;
      document.documentElement.style.overflow = 'hidden';
      show(i);
      box.querySelector('.lb__close').focus();
    }

    function close() {
      box.hidden = true;
      document.documentElement.style.overflow = '';
      img.removeAttribute('src');
      if (opener) opener.focus();
    }

    galleries.forEach(function (g) {
      var links = Array.prototype.slice.call(g.querySelectorAll('.shots__link'));
      var list = links.map(function (a) {
        var im = a.querySelector('img');
        return { src: a.getAttribute('href'), alt: im ? im.alt : '' };
      });
      links.forEach(function (a, i) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          open(list, i, a);
        });
      });
    });

    prevBtn.addEventListener('click', function () { show(at - 1); });
    nextBtn.addEventListener('click', function () { show(at + 1); });
    box.querySelector('.lb__close').addEventListener('click', close);
    box.addEventListener('click', function (e) { if (e.target === box) close(); });

    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(at - 1);
      else if (e.key === 'ArrowRight') show(at + 1);
      else if (e.key === 'Tab') {
        /* Keep focus inside the viewer while it is open. */
        var focusable = Array.prototype.filter.call(
          box.querySelectorAll('button'), function (b) { return !b.hidden; });
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    /* Swipe on touch devices. */
    var x0 = null;
    box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) show(at + (dx < 0 ? 1 : -1));
      x0 = null;
    }, { passive: true });
  }

  /* ------------------------------------------------------------------ *
   * Video. The player is only loaded when someone asks for it.
   * ------------------------------------------------------------------ */
  Array.prototype.forEach.call(document.querySelectorAll('.video__play'), function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-video');
      var frame = document.createElement('iframe');
      frame.className = 'video__frame';
      frame.src = 'https://www.youtube-nocookie.com/embed/' + id +
                  '?autoplay=1&rel=0&modestbranding=1&playsinline=1&color=white';
      frame.title = btn.getAttribute('aria-label') || 'Video';
      frame.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; web-share';
      frame.allowFullscreen = true;
      frame.setAttribute('frameborder', '0');
      btn.parentNode.replaceChild(frame, btn);
      frame.focus();
    });
  });
})();
