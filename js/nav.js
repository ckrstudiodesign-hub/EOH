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
  /* hide the navbar while scrolling down, show it again when scrolling up or near the top */
  var lastY = scrollY, hidden = false, ticking = false;
  function hide(h) { if (h !== hidden) { hidden = h; nav.classList.toggle('nav-hidden', h); } }
  function onScroll() {
    var y = scrollY, d = y - lastY;
    if (y < 80 || nav.hasAttribute('data-open') || nav.contains(document.activeElement)) hide(false);
    else if (d > 4) hide(true);
    else if (d < -4) hide(false);
    lastY = y; ticking = false;
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  nav.addEventListener('focusin', function () { hide(false); });
  document.querySelectorAll('.cmd[data-copy]').forEach(function (c) {
    c.querySelector('button').addEventListener('click', function () {
      var done = function () { c.classList.add('done'); c.querySelector('.copied').textContent = 'Copied'; setTimeout(function () { c.classList.remove('done'); }, 1600); };
      try { navigator.clipboard.writeText('+971541615066').then(done, done); } catch (e) { done(); }
    });
  });

  /* Floating WhatsApp widget */
  if (!document.querySelector('.wa-float')) {
    var wa = document.createElement('a');
    wa.className = 'wa-float';
    wa.href = 'https://wa.me/971541615066?text=Hi%20EOH%2C%20I%20need%20help%20and%20would%20like%20to%20chat.';
    wa.target = '_blank';
    wa.rel = 'noopener';
    wa.setAttribute('aria-label', 'Need Help? Chat with us on WhatsApp');
    wa.innerHTML =
      '<span class="wa-float-lbl">Need Help? Chat with us</span>' +
      '<span class="wa-float-btn" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.79 14.12c-.24.68-1.42 1.3-1.96 1.38-.5.07-1.14.1-1.84-.12-.43-.14-.98-.32-1.69-.63-2.97-1.28-4.91-4.27-5.06-4.47-.15-.2-1.21-1.61-1.21-3.07 0-1.46.76-2.18 1.03-2.48.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.24.59.83 2.02.9 2.17.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.18-.31.4-.45.53-.15.15-.3.31-.13.61.18.3.78 1.29 1.68 2.09 1.15 1.03 2.13 1.35 2.43 1.5.3.15.47.12.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.72.81 2.01.96.3.15.49.22.56.34.07.12.07.7-.17 1.38z"/></svg>' +
      '</span>';
    document.body.appendChild(wa);
  }
})();
