/* js/learn.js — Learn Page */

let allArticles = [];
let activeFilter = 'all';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function filterArticles() {
  if (activeFilter === 'all') return allArticles;
  return allArticles.filter(a =>
    a.level === activeFilter ||
    a.category === activeFilter ||
    a.tags.includes(activeFilter)
  );
}

function renderArticles() {
  const grid = document.getElementById('articles-grid');
  const noEl = document.getElementById('no-articles');
  if (!grid) return;

  const filtered = filterArticles();
  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (noEl) { noEl.style.display = ''; if (typeof lucide !== 'undefined') lucide.createIcons(); }
    return;
  }
  if (noEl) noEl.style.display = 'none';

  grid.innerHTML = filtered.map(a => `
    <a href="article.html?slug=${a.slug}" class="learn-article-card slide-up">
      <div class="learn-card-accent"></div>
      <div class="learn-card-body">
        <div class="learn-card-badges">
          <span class="badge badge-teal">${a.category}</span>
          <span class="badge badge-${a.level}">${capitalize(a.level)}</span>
        </div>
        <h3 class="learn-card-title">${a.title}</h3>
        <p class="learn-card-excerpt">${a.excerpt}</p>
        <div class="learn-card-meta">
          <span>${a.read_time} min read</span>
          <span>${formatDate(a.publish_date)}</span>
        </div>
      </div>
    </a>
  `).join('');

  // Animate
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  grid.querySelectorAll('.slide-up').forEach(el => observer.observe(el));
}

async function initLearn() {
  allArticles = await ArticleService.getAll();

  // Check URL filter param
  const params = new URLSearchParams(window.location.search);
  const filterParam = params.get('filter');
  if (filterParam) {
    const map = { beginner: 'beginner', intermediate: 'intermediate', advanced: 'advanced', tax: 'Tax & Planning' };
    activeFilter = map[filterParam] || 'all';
    document.querySelectorAll('.learn-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === activeFilter);
    });
  }

  renderArticles();
}

/* ── Filter Buttons ── */
document.querySelectorAll('.learn-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    activeFilter = btn.dataset.filter;
    document.querySelectorAll('.learn-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderArticles();
  });
});

/* ── Newsletter Form ── */
document.getElementById('newsletter-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const successEl = document.getElementById('newsletter-success');
  if (successEl) {
    successEl.style.display = 'block';
    successEl.style.background = 'rgba(91,173,78,0.2)';
    successEl.style.border = '1px solid var(--color-green)';
    successEl.style.color = '#82C977';
    successEl.style.padding = '12px 16px';
    successEl.style.borderRadius = 'var(--radius-md)';
    successEl.style.marginTop = '12px';
    successEl.style.fontSize = '0.9rem';
  }
  this.reset();
});

initLearn();
