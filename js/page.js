/* Inner pages: smooth scroll, hero entrance, scroll reveals, glow-follow cards, drag gallery, counters. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasG = !!window.gsap;
  if (hasG && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* smooth scroll */
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    if (hasG) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0); }
    else { (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(); }
  }

  /* mark things that reveal on scroll */
  var sel = '.offer,.scard,.vcard,.ocard,.steps3 li,.person-row .ptext,.person-row .pphoto,.mgrid>*,.center-head,.bigquote,.readybox,.gal-head';
  var items = [].slice.call(document.querySelectorAll(sel));
  if (!reduce && hasG) items.forEach(function (el) { el.classList.add('rv'); });

  if (!hasG || reduce) return;

  /* hero: photo settles, headline rises, floating pieces drift in */
  var tl = gsap.timeline({ delay: .05 });
  tl.from('.phbg', { scale: 1.18, duration: 2.6, ease: 'expo.out' }, 0)
    .from('.phcopy h1 .ln>span', { yPercent: 115, duration: 1.2, ease: 'expo.out', stagger: .12 }, .2)
    .from('.nav', { y: -24, opacity: 0, duration: 1, ease: 'expo.out' }, .2)
    .from('.phcopy .eyebrow,.phcopy .lede,.phcta', { y: 24, opacity: 0, filter: 'blur(8px)', duration: 1.1, ease: 'expo.out', stagger: .09 }, .5)
    .from('.phchip,.phcard', { y: 34, opacity: 0, filter: 'blur(10px)', duration: 1.2, ease: 'expo.out', stagger: .1 }, .7);
  gsap.to('.phbg', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.phero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.phcopy', { y: -60, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.phero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.utils.toArray('.phchip').forEach(function (c, i) { gsap.to(c, { y: -80 - i * 50, ease: 'none', scrollTrigger: { trigger: '.phero', start: 'top top', end: 'bottom top', scrub: true } }); });

  /* reveals, staggered per group */
  ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: .08, overwrite: true }); } });

  /* the glow follows the pointer inside each card */
  document.querySelectorAll('.offer').forEach(function (c) {
    c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });

  /* gallery: drag sideways, wheel scrolls it sideways while over it, gentle parallax on images */
  document.querySelectorAll('.gtrack').forEach(function (t) {
    var down = false, sx = 0, sl = 0, moved = 0, vel = 0, last = 0, raf;
    t.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = t.scrollLeft; last = e.clientX; cancelAnimationFrame(raf); });
    addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); if (moved > 4) t.classList.add('drag'); t.scrollLeft = sl - dx; vel = e.clientX - last; last = e.clientX; });
    addEventListener('pointerup', function () { if (!down) return; down = false; t.classList.remove('drag'); (function glide() { vel *= .94; t.scrollLeft -= vel; if (Math.abs(vel) > .5) raf = requestAnimationFrame(glide); })(); });
    gsap.from(t.querySelectorAll('.gitem'), { x: 120, opacity: 0, duration: 1.3, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: t, start: 'top 85%', once: true } });
  });

  /* counters */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var end = +el.getAttribute('data-count'), o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () {
      gsap.to(o, { v: end, duration: 2, ease: 'power3.out', onUpdate: function () { el.textContent = Math.round(o.v).toLocaleString('en-US'); } });
    } });
    el.textContent = '0';
  });

  /* footer wordmark lifts into place */
  gsap.from('.giant span', { yPercent: 30, opacity: .4, ease: 'none', scrollTrigger: { trigger: '.giant', start: 'top bottom', end: 'bottom bottom', scrub: true } });
})();
