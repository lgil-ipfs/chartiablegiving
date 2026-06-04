/* ============================================================
   js/global.js — charitablegiving.ca
   Global services and utilities.

   SUPABASE SCHEMA (ready to activate):
   Table: charities
   - id: uuid primary key
   - name: text
   - category: text
   - province: text
   - city: text
   - cra_number: text
   - description: text
   - website: text
   - size: text (small|medium|large)
   - tags: text[]
   - featured: boolean
   - ci_rating: numeric
   - ci_overhead: numeric
   - ci_grade: text
   - created_at: timestamp

   Table: articles
   - id: uuid primary key
   - title: text
   - slug: text unique
   - category: text
   - level: text (beginner|intermediate|advanced)
   - excerpt: text
   - content: text
   - read_time: integer
   - publish_date: date
   - tags: text[]
   - featured: boolean

   TO ACTIVATE: Replace service method bodies with Supabase queries.
   ============================================================ */

/* ── Data Services ── */

const CharityService = {
  async getAll() {
    return charities;
  },
  async search(query = '', filters = {}) {
    let results = charities;
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q)) ||
        c.city.toLowerCase().includes(q)
      );
    }
    if (filters.category) results = results.filter(c => c.category === filters.category);
    if (filters.province) results = results.filter(c => c.province === filters.province);
    if (filters.size) results = results.filter(c => c.size === filters.size);
    if (filters.sort === 'name') results = [...results].sort((a, b) => a.name.localeCompare(b.name));
    if (filters.sort === 'featured') results = [...results].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return results;
  },
  async getById(id) {
    return charities.find(c => c.id === id) || null;
  },
  async getByTags(tags = [], province = null) {
    return charities.filter(c => {
      const tagMatch = tags.length === 0 || tags.some(t => c.tags.includes(t));
      const provMatch = !province || province === 'any' || c.province === province;
      return tagMatch && provMatch;
    });
  },
  async getFeatured() {
    return charities.filter(c => c.featured === true).slice(0, 6);
  }
};

const ArticleService = {
  async getAll() {
    const res = await fetch('data/articles.json');
    return res.json();
  },
  async getFeatured() {
    const all = await this.getAll();
    return all.filter(a => a.featured).slice(0, 3);
  },
  async getByCategory(category) {
    const all = await this.getAll();
    return all.filter(a => a.category === category);
  },
  async getBySlug(slug) {
    const all = await this.getAll();
    return all.find(a => a.slug === slug) || null;
  },
  async getByLevel(level) {
    const all = await this.getAll();
    return all.filter(a => a.level === level);
  },
  async getByTag(tag) {
    const all = await this.getAll();
    return all.filter(a => a.tags.includes(tag));
  }
};

/* ── Mobile Navigation ── */
(function initNav() {
  const hamburger = document.getElementById('nav-hamburger');
  const mobileNav = document.getElementById('nav-mobile');
  const closeBtn = document.getElementById('nav-mobile-close');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      mobileNav.classList.add('open');
      document.body.classList.add('menu-open');
    });
  }
  if (closeBtn && mobileNav) {
    closeBtn.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      document.body.classList.remove('menu-open');
    });
  }
  // Close on overlay click
  if (mobileNav) {
    mobileNav.addEventListener('click', (e) => {
      if (e.target === mobileNav) {
        mobileNav.classList.remove('open');
        document.body.classList.remove('menu-open');
      }
    });
  }
})();

/* ── Active Nav Link ── */
(function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.split('#')[0] === path) {
      a.classList.add('active');
    }
  });
})();

/* ── Sticky Nav on Scroll ── */
(function initStickyNav() {
  const nav = document.getElementById('site-nav');
  if (!nav) return;
  function onScroll() {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── IntersectionObserver for Animations ── */
(function initAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-in, .slide-up').forEach(el => observer.observe(el));
})();

/* ── Smooth Scroll for Anchor Links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── Accordion ── */
document.querySelectorAll('.accordion-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const item = trigger.closest('.accordion-item');
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.accordion-item.open').forEach(i => i.classList.remove('open'));
    // Toggle clicked
    if (!isOpen) item.classList.add('open');
  });
});

/* ── Form Utilities ── */
function showFormSuccess(formEl, message) {
  const success = formEl.querySelector('.form-success');
  if (success) {
    success.textContent = message;
    success.classList.add('visible');
    formEl.reset();
    setTimeout(() => success.classList.remove('visible'), 6000);
  }
}

/* ── Saved List (localStorage) ── */
function addToList(id) {
  const list = getList();
  if (!list.includes(id)) {
    list.push(id);
    localStorage.setItem('charity_list', JSON.stringify(list));
  }
  updateListUI();
}
function removeFromList(id) {
  const list = getList().filter(i => i !== id);
  localStorage.setItem('charity_list', JSON.stringify(list));
  updateListUI();
}
function getList() {
  try {
    return JSON.parse(localStorage.getItem('charity_list') || '[]');
  } catch (e) {
    return [];
  }
}
function isInList(id) {
  return getList().includes(id);
}
function updateListUI() {
  const count = getList().length;
  const countEls = document.querySelectorAll('.list-count');
  countEls.forEach(el => el.textContent = count);
  // Update heart buttons
  document.querySelectorAll('[data-charity-id]').forEach(btn => {
    const id = btn.dataset.charityId;
    btn.classList.toggle('saved', isInList(id));
  });
}

/* ── Counter Animation ── */
function animateCounter(el, target, duration = 1500) {
  const start = performance.now();
  const isDecimal = target % 1 !== 0;
  function step(timestamp) {
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = isDecimal
      ? (target * eased).toFixed(1)
      : Math.floor(target * eased).toLocaleString();
    el.textContent = current;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString();
  }
  requestAnimationFrame(step);
}

/* ── Debounce ── */
function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/* ── Format CRA Number ── */
function formatCRANumber(bn) {
  if (!bn) return '';
  return bn.replace(/(\d{9})\s*(RR)\s*(\d{4})/, '$1 $2 $3');
}

/* ── Init counter animations when visible ── */
document.querySelectorAll('[data-counter]').forEach(el => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !el.dataset.counted) {
        el.dataset.counted = 'true';
        const target = parseFloat(el.dataset.counter);
        animateCounter(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  observer.observe(el);
});
