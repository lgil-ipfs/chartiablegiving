/* js/advisors.js — Advisors Page */

/* ── Advisor Inquiry Form ── */
document.getElementById('advisor-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const successEl = document.getElementById('advisor-form-success');
  if (successEl) successEl.classList.add('visible');
  this.reset();
  setTimeout(() => { if (successEl) successEl.classList.remove('visible'); }, 6000);
});
