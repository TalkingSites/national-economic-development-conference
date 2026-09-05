(function () {
  var bar = document.getElementById('schedDays');
  if (!bar || !('IntersectionObserver' in window)) return;

  var links = {};
  Array.prototype.forEach.call(bar.querySelectorAll('.sched-days__link'), function (a) {
    links[a.getAttribute('href').slice(1)] = a;
  });

  var days = Array.prototype.slice.call(document.querySelectorAll('.sday'));
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      Object.keys(links).forEach(function (k) { links[k].removeAttribute('aria-current'); });
      var a = links[e.target.id];
      if (a) a.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  days.forEach(function (d) { observer.observe(d); });
})();
