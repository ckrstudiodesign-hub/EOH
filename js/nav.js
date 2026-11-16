/* Shared navbar: mobile menu, Services dropdown (hover, click, keyboard), scrolled state, copy-number buttons. */
(function () {
  var nav = document.getElementById('nav'); if (!nav) return;
  var menu = nav.querySelector('.menu'), sub = nav.querySelector('.has-sub'), tog = sub && sub.querySelector('.sub-toggle');
  var fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  function closeAll() { nav.removeAttribute('data-open'); menu && menu.setAttribute('aria-expanded', 'false'); setSub(false); }
  function setSub(o) { if (!sub) return; sub.classList.toggle('open', o); tog.setAttribute('aria-expanded', o); }
  menu && menu.addEventListener('click', function () { var o = !nav.hasAttribute('data-open'); nav.toggleAttribute('data-open', o); menu.setAttribute('aria-expanded', o); if (!o) setSub(false); });
  if (sub) {
    tog.addEventListener('click', function (e) { e.stopPropagation(); setSub(!sub.classList.contains('open')); });
    if (fine) {
      var t; sub.addEventListener('pointerenter', function () { if (innerWidth > 980) { clearTimeout(t); setSub(true); } });
      sub.addEventListener('pointerleave', function () { if (innerWidth > 980) { t = setTimeout(function () { setSub(false); }, 160); } });
    }
    document.addEventListener('click', function (e) { if (!sub.contains(e.target) && innerWidth > 980) setSub(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setSub(false); tog.focus(); } });
  }
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { if (a.getAttribute('href').charAt(0) === '#') closeAll(); }); });
  var on = false; function sc() { var s = scrollY > 40; if (s !== on) { on = s; nav.classList.toggle('scrolled', s); } }
  addEventListener('scroll', sc, { passive: true }); sc();
  document.querySelectorAll('.cmd[data-copy]').forEach(function (c) {
    c.querySelector('button').addEventListener('click', function () {
      var done = function () { c.classList.add('done'); c.querySelector('.copied').textContent = 'Copied'; setTimeout(function () { c.classList.remove('done'); }, 1600); };
      try { navigator.clipboard.writeText('+971541615066').then(done, done); } catch (e) { done(); }
    });
  });
})();
