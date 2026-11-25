/* Programmes hub + programme pages: smooth scroll, reveals, hover video, jump bar, gallery viewer, video testimonials */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (!reduce && window.Lenis && window.gsap) {
    var lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    if (window.ScrollTrigger) { gsap.registerPlugin(ScrollTrigger); lenis.on('scroll', ScrollTrigger.update); }
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) { var t = document.querySelector(a.getAttribute('href')); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -70 }); } });
    });
  }

  /* reveal */
  var rv = [].slice.call(document.querySelectorAll('.pr .rv'));
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  /* programme cards: the programme's video plays on hover (desktop) */
  if (fine && !reduce) {
    document.querySelectorAll('.pr-card').forEach(function (c) {
      var v = c.querySelector('video'); if (!v) return;
      var hov=false; v.addEventListener('playing', function () { if (hov) c.classList.add('vplay'); });
      c.addEventListener('pointerenter', function () { hov=true; if (!v.src) v.src = v.dataset.src; var p = v.play(); if (p && p.catch) p.catch(function () {}); if (v.readyState > 2 && !v.paused) c.classList.add('vplay'); });
      c.addEventListener('pointerleave', function () { hov=false; v.pause(); c.classList.remove('vplay'); });
    });
  }

  /* jump bar highlights the category in view */
  var links = [].slice.call(document.querySelectorAll('.pr-jump a'));
  if (links.length && 'IntersectionObserver' in window) {
    var map = {}; links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var jio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { links.forEach(function (a) { a.classList.remove('on'); }); if (map[e.target.id]) map[e.target.id].classList.add('on'); } });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('.pr-cat').forEach(function (s) { jio.observe(s); });
  }

  /* gallery viewer */
  var lb = document.querySelector('.pr-lb');
  if (lb) {
    var items = [].slice.call(document.querySelectorAll('.pr-g button')), img = lb.querySelector('img'), cap = lb.querySelector('figcaption'), cur = 0, last = null;
    var show = function (k) { cur = (k + items.length) % items.length; var im = items[cur].querySelector('img'); img.src = im.src; img.alt = im.alt; cap.textContent = (cur + 1) + ' / ' + items.length + '  ·  ' + im.alt; };
    var close = function () { lb.hidden = true; document.documentElement.style.overflow = ''; if (last) last.focus(); };
    items.forEach(function (b, k) { b.addEventListener('click', function () { last = b; show(k); lb.hidden = false; document.documentElement.style.overflow = 'hidden'; lb.querySelector('.x').focus(); }); });
    lb.querySelector('.x').addEventListener('click', close);
    lb.querySelector('.pv').addEventListener('click', function () { show(cur - 1); });
    lb.querySelector('.nx').addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) { if (lb.hidden) return; if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') show(cur + 1); else if (e.key === 'ArrowLeft') show(cur - 1); });
  }

  /* video testimonials load only when played */
  document.querySelectorAll('.pr-v-frame').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.querySelector('iframe')) return;
      var f = document.createElement('iframe'); f.title = b.getAttribute('aria-label');
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
      f.src = 'https://www.youtube-nocookie.com/embed/' + b.dataset.yt + '?autoplay=1&rel=0&modestbranding=1';
      b.appendChild(f);
    });
  });

  /* programme page: hero video pauses when off screen */
  var hv = document.querySelector('video.pp-vid');
  if (hv) {
    if (reduce) { hv.removeAttribute('autoplay'); hv.pause(); }
    else if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { var p = hv.play(); if (p && p.catch) p.catch(function () {}); } else hv.pause(); }); }).observe(hv);
  }
})();
