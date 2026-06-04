/* js/contact.js — Contact Page */

/* ── Contact Form ── */
document.getElementById('contact-form-el')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const successEl = document.getElementById('contact-success');
  if (successEl) successEl.classList.add('visible');
  this.reset();
  setTimeout(() => { if (successEl) successEl.classList.remove('visible'); }, 6000);
});
