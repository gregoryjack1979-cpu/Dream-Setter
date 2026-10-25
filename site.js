/* Dream Setter — navigation, contact settings, and contact form.
   Calculator behaviour lives in app.js / model.js. */
(function () {
  'use strict';
  const cfg = Object.assign({ bookingUrl: '', phone: '', email: '', formEndpoint: '' }, window.DreamSetterConfig || {});
  const $ = (id) => document.getElementById(id);

  /* ---- Mobile navigation ---- */
  const toggle = $('nav-toggle'), nav = $('site-nav'), header = document.querySelector('.site-header');
  function setNav(open) {
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  toggle.addEventListener('click', () => setNav(!document.body.classList.contains('nav-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('nav-open')) { setNav(false); toggle.focus(); } });
  matchMedia('(min-width: 900px)').addEventListener('change', (e) => { if (e.matches) setNav(false); });

  /* Header shadow once the page scrolls */
  const onScroll = () => header.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---- Contact details from site-config.js ---- */
  let anyContact = false;
  if (/^https:\/\//i.test(cfg.bookingUrl)) {
    $('booking-link').href = cfg.bookingUrl; $('contact-booking').hidden = false; anyContact = true;
    document.querySelectorAll('a.button[href="#contact"]').forEach((a) => { a.href = cfg.bookingUrl; a.target = '_blank'; a.rel = 'noopener'; });
  }
  if (cfg.phone) {
    const digits = cfg.phone.replace(/[^\d+]/g, '');
    const link = $('phone-link'); link.href = 'tel:' + (digits.startsWith('+') ? digits : '+1' + digits.replace(/^1/, '')); link.textContent = cfg.phone;
    $('contact-phone').hidden = false; anyContact = true;
  }
  if (cfg.email) {
    const link = $('email-link'); link.href = 'mailto:' + cfg.email; link.textContent = cfg.email;
    $('contact-email').hidden = false; anyContact = true;
  }
  const form = $('contact-form');
  if (/^https:\/\//i.test(cfg.formEndpoint)) { form.hidden = false; anyContact = true; }
  $('contact-pending').hidden = anyContact;
  document.querySelector('.contact-grid').classList.toggle('no-form', form.hidden);

  /* ---- Contact form (posts JSON to the configured endpoint) ---- */
  const status = $('cf-status'), submit = $('cf-submit');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = Object.fromEntries(new FormData(form).entries());
    data.source = 'dreamsetter.net contact form';
    data.page = location.href;
    submit.disabled = true; status.textContent = 'Sending…'; status.className = 'form-status';
    try {
      const res = await fetch(cfg.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      form.reset();
      status.textContent = 'Thanks. We’ll reach out shortly to set up your demo.'; status.className = 'form-status ok';
    } catch (err) {
      status.textContent = 'That didn’t go through. Please try again' + (cfg.email ? ' or email ' + cfg.email + '.' : '.');
      status.className = 'form-status error';
    } finally { submit.disabled = false; }
  });

  /* ---- Footer year ---- */
  $('year').textContent = String(new Date().getFullYear());
})();
