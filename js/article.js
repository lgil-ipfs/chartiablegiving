/* js/article.js — Article Page */

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
}

/* ── Reading Progress Bar ── */
window.addEventListener('scroll', () => {
  const article = document.getElementById('article-body');
  const bar = document.getElementById('reading-progress');
  if (!article || !bar) return;
  const start = article.offsetTop;
  const end = start + article.offsetHeight - window.innerHeight;
  const progress = Math.max(0, Math.min(1, (window.scrollY - start + 100) / (end - start + 100)));
  bar.style.width = `${progress * 100}%`;
}, { passive: true });

/* ── Generate Table of Contents ── */
function buildTOC(container) {
  // Exclude headings inside embedded interactive tools (e.g. the "Start
  // With the Why" wizard's question text) — those aren't real sections.
  const headings = Array.from(container.querySelectorAll('h2, h3'))
    .filter(h => !h.closest('.wizard'));
  const tocNav = document.getElementById('toc-nav');
  const tocCard = document.getElementById('toc-card');
  if (!tocNav || headings.length === 0) { if (tocCard) tocCard.style.display = 'none'; return; }

  headings.forEach((h, i) => {
    if (!h.id) h.id = `heading-${i}`;
    const link = document.createElement('a');
    link.href = `#${h.id}`;
    link.className = `toc-link${h.tagName === 'H3' ? ' toc-h3' : ''}`;
    link.textContent = h.textContent;
    link.addEventListener('click', e => {
      e.preventDefault();
      h.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    tocNav.appendChild(link);
  });

  // Scroll spy for TOC
  const tocLinks = tocNav.querySelectorAll('.toc-link');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tocLinks.forEach(l => l.classList.remove('active'));
        const activeLink = tocNav.querySelector(`a[href="#${entry.target.id}"]`);
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }, { rootMargin: '-80px 0px -70% 0px' });
  headings.forEach(h => observer.observe(h));
}

/* ── Load and Render Article ── */
async function loadArticle() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug) {
    document.getElementById('article-title').textContent = 'Article Not Found';
    document.getElementById('article-body').innerHTML = '<p>No article slug specified. <a href="learn.html">Browse all articles →</a></p>';
    return;
  }

  try {
    const article = await ArticleService.getBySlug(slug);
    if (!article) {
      document.getElementById('article-title').textContent = 'Article Not Found';
      document.getElementById('article-body').innerHTML = '<p>This article could not be found. <a href="learn.html">Browse all articles →</a></p>';
      return;
    }

    // Update page title
    document.title = `${article.title} — charitablegiving.ca`;

    // Badges
    const badgesEl = document.getElementById('article-badges');
    if (badgesEl) {
      badgesEl.innerHTML = `
        <span class="badge badge-teal">${article.category}</span>
        <span class="badge badge-${article.level}">${capitalize(article.level)}</span>
      `;
    }

    // Title and deck
    const titleEl = document.getElementById('article-title');
    if (titleEl) titleEl.textContent = article.title;

    const deckEl = document.getElementById('article-deck');
    if (deckEl) deckEl.textContent = article.excerpt;

    // Meta
    const metaEl = document.getElementById('article-meta');
    if (metaEl) {
      metaEl.innerHTML = `
        <span>${article.read_time} min read</span>
        <span>${formatDate(article.publish_date)}</span>
      `;
    }

    // Body
    const bodyEl = document.getElementById('article-body');
    if (bodyEl) {
      bodyEl.innerHTML = article.content;
      buildTOC(bodyEl);
      if (typeof initWhyTool === 'function') initWhyTool();
    }

    // Load related articles
    loadRelated(article);

    if (typeof lucide !== 'undefined') lucide.createIcons();

  } catch (err) {
    document.getElementById('article-body').innerHTML = '<p>Error loading article. Please try again. <a href="learn.html">Browse all articles →</a></p>';
  }
}

async function loadRelated(currentArticle) {
  const grid = document.getElementById('related-grid');
  if (!grid) return;

  try {
    const all = await ArticleService.getAll();
    const related = all
      .filter(a => a.slug !== currentArticle.slug)
      .filter(a => a.category === currentArticle.category || a.level === currentArticle.level)
      .slice(0, 3);

    if (related.length === 0) {
      document.getElementById('related-articles').style.display = 'none';
      return;
    }

    grid.innerHTML = related.map(a => `
      <a href="article.html?slug=${a.slug}" class="related-card">
        <span class="badge badge-teal">${a.category}</span>
        <h4>${a.title}</h4>
        <div class="related-card-meta">${a.read_time} min read</div>
      </a>
    `).join('');
  } catch (e) {
    document.getElementById('related-articles').style.display = 'none';
  }
}

/* ── Copy Link Button ── */
document.getElementById('copy-link-btn')?.addEventListener('click', () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const confirm = document.getElementById('copy-confirm');
    if (confirm) {
      confirm.style.display = 'inline';
      setTimeout(() => { confirm.style.display = 'none'; }, 2500);
    }
  });
});

loadArticle();
