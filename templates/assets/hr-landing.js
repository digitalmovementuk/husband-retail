/* Husband Retail — service landing page template · hr-landing.js v0.1 (26.11.2026)
   Local preview only: the forms post to this stub and show a success message. Nothing is sent anywhere.
   In WordPress the forms are wired to enquiry@husband-retail.com instead. */
(function () {
  var d = document;
  d.documentElement.classList.add('js');

  // Nav turns white once the page scrolls
  var nav = d.querySelector('.nav');
  function onScroll() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Form stub
  d.querySelectorAll('form.form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }
      f.classList.add('sent');
      var ok = f.querySelector('.form-ok');
      if (ok) { ok.setAttribute('tabindex', '-1'); ok.focus(); }
    });
  });

  // Optional reveal, max 0.6 s, skipped with reduced motion
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = d.querySelectorAll('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach(function (el) { io.observe(el); });
})();
