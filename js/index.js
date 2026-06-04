/* js/index.js — Homepage */

/* ── Hero Canvas Particle Animation ── */
(function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', debounce(resize, 200));

  // Particle types: hearts and leaves
  function drawHeart(ctx, x, y, size, opacity) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#2A9D8F';
    ctx.beginPath();
    ctx.translate(x, y);
    ctx.scale(size / 10, size / 10);
    ctx.moveTo(0, -1);
    ctx.bezierCurveTo(1, -3, 4, -3, 4, -1);
    ctx.bezierCurveTo(4, 1, 0, 4, 0, 5);
    ctx.bezierCurveTo(0, 4, -4, 1, -4, -1);
    ctx.bezierCurveTo(-4, -3, -1, -3, 0, -1);
    ctx.fill();
    ctx.restore();
  }

  function drawLeaf(ctx, x, y, size, rotation, opacity) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#5BAD4E';
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.4, size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function createParticle() {
    return {
      x: Math.random() * W,
      y: H + 20,
      type: Math.random() > 0.5 ? 'heart' : 'leaf',
      size: 5 + Math.random() * 8,
      speedY: 0.4 + Math.random() * 0.6,
      speedX: (Math.random() - 0.5) * 0.4,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      opacity: 0.3 + Math.random() * 0.4,
    };
  }

  // Init particles
  for (let i = 0; i < 30; i++) {
    const p = createParticle();
    p.y = Math.random() * H;
    particles.push(p);
  }

  let lastTime = 0;
  function animate(time) {
    const dt = Math.min(time - lastTime, 32);
    lastTime = time;
    ctx.clearRect(0, 0, W, H);

    particles.forEach((p, i) => {
      p.y -= p.speedY * (dt / 16);
      p.x += p.speedX * (dt / 16);
      p.rotation += p.rotSpeed;

      if (p.y < -30) {
        particles[i] = createParticle();
        return;
      }

      if (p.type === 'heart') {
        drawHeart(ctx, p.x, p.y, p.size, p.opacity);
      } else {
        drawLeaf(ctx, p.x, p.y, p.size, p.rotation, p.opacity);
      }
    });

    // Spawn new particles occasionally
    if (Math.random() < 0.03 && particles.length < 50) {
      particles.push(createParticle());
    }

    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();

/* ── Hero Load Animation ── */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const hero = document.querySelector('.hero');
    if (hero) hero.classList.add('hero-loaded');
  }, 100);
});

/* ── Featured Articles ── */
async function loadFeaturedArticles() {
  const grid = document.getElementById('featured-articles-grid');
  if (!grid) return;

  try {
    const articles = await ArticleService.getFeatured();
    grid.innerHTML = '';
    articles.forEach(article => {
      const card = document.createElement('a');
      card.href = `article.html?slug=${article.slug}`;
      card.className = 'article-card card slide-up';
      card.innerHTML = `
        <div class="article-card-badges">
          <span class="badge badge-teal">${article.category}</span>
          <span class="badge badge-${article.level}">${capitalize(article.level)}</span>
        </div>
        <h3>${article.title}</h3>
        <p>${article.excerpt}</p>
        <div class="article-card-meta">
          <span>${article.read_time} min read</span>
          <span>${formatDate(article.publish_date)}</span>
        </div>
      `;
      grid.appendChild(card);
    });

    // Re-observe new elements
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    grid.querySelectorAll('.slide-up').forEach(el => observer.observe(el));
  } catch (e) {
    grid.innerHTML = '<p style="color:var(--color-muted)">Articles loading...</p>';
  }
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}

loadFeaturedArticles();

/* ── Number Counters (ensure init after DOM ready) ── */
document.querySelectorAll('[data-counter]').forEach(el => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !el.dataset.counted) {
        el.dataset.counted = 'true';
        animateCounter(el, parseFloat(el.dataset.counter));
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  observer.observe(el);
});
