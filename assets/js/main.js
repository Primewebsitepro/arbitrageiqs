// ArbitrageIQS — shared scripts
(function () {
  // Transparent header -> solid on scroll
  var header = document.querySelector('.header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 40); }
  if (header) { onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); }

  // Mobile navigation
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  function setNav(open) {
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setNav(!nav.classList.contains('is-open')); });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setNav(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNav(false); });
    // leaving the mobile breakpoint: reset the open menu
    window.matchMedia('(min-width: 901px)').addEventListener('change', function (m) { if (m.matches) setNav(false); });
  }

  // Services mega menu: accordion on mobile, click/keyboard support on desktop
  var mega = document.querySelector('.has-mega');
  if (mega) {
    var mt = mega.querySelector('.mega-toggle');
    function setMega(open) {
      mega.classList.toggle('is-open', open);
      mt.setAttribute('aria-expanded', open ? 'true' : 'false');
      mt.setAttribute('aria-label', open ? 'Hide services' : 'Show services');
    }
    mt.addEventListener('click', function () { setMega(!mega.classList.contains('is-open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMega(false); });
  }

  // Sliders (hero + services). Autoplay is driven by each dot's progress-bar
  // animation: when it finishes, the next slide shows.
  function initSlider(root) {
    var slides = root.querySelectorAll('[data-slide]');
    var dots = root.querySelectorAll('[data-dot]');
    var count = root.querySelector('[data-count]');
    var current = 0;

    function go(i) {
      i = (i + slides.length) % slides.length;
      if (i === current) return;
      slides[current].classList.remove('is-active');
      slides[current].setAttribute('aria-hidden', 'true');
      slides[current].inert = true;
      dots[current].classList.remove('is-active');
      dots[current].setAttribute('aria-selected', 'false');
      current = i;
      slides[current].classList.add('is-active');
      slides[current].removeAttribute('aria-hidden');
      slides[current].inert = false;
      dots[current].classList.add('is-active');
      dots[current].setAttribute('aria-selected', 'true');
      if (count) count.textContent = (current < 9 ? '0' : '') + (current + 1);
      // keep the active tab visible when tabs scroll horizontally (mobile)
      var bar = dots[current].parentElement;
      if (bar.scrollWidth > bar.clientWidth) {
        bar.scrollTo({ left: dots[current].offsetLeft - bar.clientWidth / 2 + dots[current].offsetWidth / 2, behavior: 'smooth' });
      }
    }

    slides.forEach(function (s, i) { if (i !== 0) { s.inert = true; s.setAttribute('aria-hidden', 'true'); } });
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { go(i); });
      d.querySelector('i').addEventListener('animationend', function () { go(current + 1); });
    });
    root.querySelectorAll('[data-prev]').forEach(function (b) { b.addEventListener('click', function () { go(current - 1); }); });
    root.querySelectorAll('[data-next]').forEach(function (b) { b.addEventListener('click', function () { go(current + 1); }); });

    root.addEventListener('mouseenter', function () { root.classList.add('is-paused'); });
    root.addEventListener('mouseleave', function () { root.classList.remove('is-paused'); });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') go(current - 1);
      if (e.key === 'ArrowRight') go(current + 1);
    });

    var startX = null;
    root.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
      startX = null;
    });

    // pause autoplay while the slider is off-screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        root.classList.toggle('is-offscreen', !entries[0].isIntersecting);
      }, { threshold: 0.2 }).observe(root);
    }
  }
  document.querySelectorAll('[data-slider]').forEach(initSlider);

  // FAQ: keep one answer open at a time
  var faqs = document.querySelectorAll('.faq__list details');
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  // Bento tile cursor spotlight
  document.querySelectorAll('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) {
      var r = t.getBoundingClientRect();
      t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      t.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Footer year
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
