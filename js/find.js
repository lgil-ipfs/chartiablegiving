/* js/find.js — Charity Finder */

/* ── Wizard Data ── */
const causes = [
  { value: 'health', label: 'Health & Medical', icon: 'heart-pulse' },
  { value: 'children', label: 'Children & Youth', icon: 'baby' },
  { value: 'mental health', label: 'Mental Health', icon: 'brain' },
  { value: 'environment', label: 'Environment', icon: 'leaf' },
  { value: 'animals', label: 'Animal Welfare', icon: 'paw-print' },
  { value: 'education', label: 'Education', icon: 'graduation-cap' },
  { value: 'Indigenous', label: 'Indigenous', icon: 'mountain' },
  { value: 'poverty', label: 'Poverty Relief', icon: 'home' },
  { value: 'food security', label: 'Food Security', icon: 'utensils' },
  { value: 'humanitarian', label: 'International Aid', icon: 'globe' },
  { value: 'arts', label: 'Arts & Culture', icon: 'palette' },
  { value: 'veterans', label: 'Veterans', icon: 'shield' },
  { value: 'seniors', label: 'Seniors', icon: 'user' },
  { value: 'disability', label: 'Disability', icon: 'accessibility' },
  { value: 'faith', label: 'Faith & Community', icon: 'sun' },
  { value: 'cancer', label: 'Cancer Research', icon: 'microscope' },
];

const sliderLabels = {
  1: '1 — Not a priority',
  2: '2 — Slightly important',
  3: '3 — Moderately important',
  4: '4 — Very important',
  5: '5 — Essential',
};

/* ── Wizard State ── */
let wizardState = {
  step: 1,
  selectedCauses: [],
  province: null,
  size: null,
  transparency: 3,
  howToGive: [],
};

/* ── Render Cause Grid ── */
function renderCauseGrid() {
  const grid = document.getElementById('cause-grid');
  if (!grid) return;
  grid.innerHTML = causes.map(c => `
    <button class="cause-btn${wizardState.selectedCauses.includes(c.value) ? ' selected' : ''}"
      data-value="${c.value}">
      <i data-lucide="${c.icon}"></i>
      ${c.label}
    </button>
  `).join('');
  grid.querySelectorAll('.cause-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.value;
      if (wizardState.selectedCauses.includes(val)) {
        wizardState.selectedCauses = wizardState.selectedCauses.filter(v => v !== val);
        btn.classList.remove('selected');
      } else {
        wizardState.selectedCauses.push(val);
        btn.classList.add('selected');
      }
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

/* ── Wizard Step Rendering ── */
function updateWizardProgress() {
  const bar = document.getElementById('wizard-progress-bar');
  const label = document.getElementById('wizard-step-label');
  if (bar) bar.style.width = `${((wizardState.step - 1) / 5) * 100}%`;
  if (label) label.textContent = `Step ${wizardState.step} of 6`;
}

function showStep(n) {
  document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
  const target = document.querySelector(`.wizard-step[data-step="${n}"]`);
  if (target) target.classList.add('active');

  const backBtn = document.getElementById('wizard-back');
  const nextBtn = document.getElementById('wizard-next');
  if (backBtn) backBtn.style.display = n > 1 ? '' : 'none';
  if (nextBtn) {
    if (n === 6) {
      nextBtn.textContent = 'Start Over';
    } else {
      nextBtn.textContent = n === 5 ? 'See Results' : 'Next';
    }
  }
  updateWizardProgress();
}

/* ── Wizard Navigation ── */
document.getElementById('wizard-next')?.addEventListener('click', async () => {
  if (wizardState.step === 5) {
    wizardState.step = 6;
    await renderWizardResults();
    showStep(6);
  } else if (wizardState.step === 6) {
    // Reset
    wizardState = { step: 1, selectedCauses: [], province: null, size: null, transparency: 3, howToGive: [] };
    renderCauseGrid();
    showStep(1);
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
  } else {
    wizardState.step++;
    showStep(wizardState.step);
  }
});
document.getElementById('wizard-back')?.addEventListener('click', () => {
  if (wizardState.step > 1) {
    wizardState.step--;
    showStep(wizardState.step);
  }
});

/* ── Option Buttons ── */
document.querySelectorAll('.option-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const isMulti = btn.classList.contains('multi');
    const parent = btn.closest('.option-grid');
    if (!isMulti) {
      parent.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      // Map to state
      const step = wizardState.step;
      if (step === 2) wizardState.province = btn.dataset.value;
      if (step === 3) wizardState.size = btn.dataset.value;
    } else {
      btn.classList.toggle('selected');
      const val = btn.dataset.value;
      if (wizardState.howToGive.includes(val)) {
        wizardState.howToGive = wizardState.howToGive.filter(v => v !== val);
      } else {
        wizardState.howToGive.push(val);
      }
    }
  });
});

/* ── Transparency Slider ── */
const transparencySlider = document.getElementById('transparency-slider');
const sliderValueEl = document.getElementById('slider-value');
if (transparencySlider) {
  transparencySlider.addEventListener('input', () => {
    wizardState.transparency = parseInt(transparencySlider.value);
    if (sliderValueEl) sliderValueEl.textContent = sliderLabels[wizardState.transparency];
    const pct = ((wizardState.transparency - 1) / 4) * 100;
    transparencySlider.style.background = `linear-gradient(90deg, var(--color-teal) ${pct}%, var(--color-linen) ${pct}%)`;
  });
}

/* ── Render Wizard Results ── */
async function renderWizardResults() {
  const container = document.getElementById('wizard-results');
  if (!container) return;
  container.innerHTML = '<p style="color:var(--color-muted)">Finding matches...</p>';

  const province = wizardState.province === 'international' ? null : wizardState.province;
  let results = await CharityService.getByTags(wizardState.selectedCauses, province);
  if (wizardState.size && wizardState.size !== 'any') {
    results = results.filter(c => c.size === wizardState.size);
  }
  // Prioritize featured
  results.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  results = results.slice(0, 8);

  if (results.length === 0) {
    container.innerHTML = '<div class="no-results"><p>No exact matches found. Try broadening your selections, or <a href="#directory">browse the full directory</a>.</p></div>';
    return;
  }

  container.innerHTML = results.map(c => `
    <div class="wizard-result-card">
      <h4>${c.name}</h4>
      <span class="badge badge-teal">${c.category}</span>
      <span class="cra-number">BN: ${c.cra_number}</span>
      <p>${c.description.substring(0, 100)}...</p>
      <div class="card-actions">
        <a href="${c.website}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">Visit</a>
        <button class="btn-heart${isInList(c.id) ? ' saved' : ''}" data-charity-id="${c.id}" onclick="toggleList('${c.id}', this)" aria-label="Save">
          <i data-lucide="heart"></i>
        </button>
      </div>
    </div>
  `).join('');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

/* ── Directory ── */
const PER_PAGE = 12;
let allCharities = [];
let filteredCharities = [];
let currentPage = 1;

async function initDirectory() {
  allCharities = await CharityService.getAll();
  filteredCharities = allCharities;
  renderDirectory();
}

function renderDirectory() {
  const grid = document.getElementById('charity-grid');
  const countEl = document.getElementById('results-count');
  if (!grid) return;

  const start = (currentPage - 1) * PER_PAGE;
  const pageData = filteredCharities.slice(start, start + PER_PAGE);

  if (countEl) countEl.textContent = `${filteredCharities.length} charities`;

  if (filteredCharities.length === 0) {
    grid.innerHTML = '<div class="no-results" style="grid-column:1/-1;text-align:center;padding:40px;color:var(--color-muted)">No charities match your filters. Try clearing some filters.</div>';
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  grid.innerHTML = pageData.map(c => `
    <div class="charity-card slide-up">
      <div class="charity-card-header">
        <h4>${c.name}</h4>
        <button class="btn-heart${isInList(c.id) ? ' saved' : ''}" data-charity-id="${c.id}"
          onclick="toggleList('${c.id}', this)" aria-label="Save ${c.name}">
          <i data-lucide="heart"></i>
        </button>
      </div>
      <span class="charity-category">${c.category}</span>
      <p class="charity-desc">${c.description}</p>
      <span class="cra-number">BN: ${c.cra_number}</span>
      <div class="charity-footer">
        <span class="charity-size-badge">${c.size}</span>
        <a href="${c.website}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">
          Visit site <i data-lucide="external-link" style="width:12px;height:12px;"></i>
        </a>
      </div>
    </div>
  `).join('');

  renderPagination();
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Animate new items
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  grid.querySelectorAll('.slide-up').forEach(el => observer.observe(el));
}

function renderPagination() {
  const totalPages = Math.ceil(filteredCharities.length / PER_PAGE);
  const pagination = document.getElementById('pagination');
  if (!pagination || totalPages <= 1) { if (pagination) pagination.innerHTML = ''; return; }

  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn${i === currentPage ? ' active' : ''}" data-page="${i}">${i}</button>`;
  }
  pagination.innerHTML = html;
  pagination.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page);
      renderDirectory();
      document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ── Filter Handlers ── */
async function applyFilters() {
  const query = document.getElementById('dir-search')?.value || '';
  const category = document.getElementById('filter-category')?.value || '';
  const province = document.getElementById('filter-province')?.value || '';
  const size = document.getElementById('filter-size')?.value || '';
  const sort = document.getElementById('filter-sort')?.value || '';

  const filters = {};
  if (category) filters.category = category;
  if (province) filters.province = province;
  if (size) filters.size = size;
  if (sort) filters.sort = sort;

  filteredCharities = await CharityService.search(query, filters);
  currentPage = 1;
  renderDirectory();
}

const debouncedFilter = debounce(applyFilters, 250);
document.getElementById('dir-search')?.addEventListener('input', debouncedFilter);
document.getElementById('filter-category')?.addEventListener('change', applyFilters);
document.getElementById('filter-province')?.addEventListener('change', applyFilters);
document.getElementById('filter-size')?.addEventListener('change', applyFilters);
document.getElementById('filter-sort')?.addEventListener('change', applyFilters);
document.getElementById('clear-filters')?.addEventListener('click', () => {
  document.getElementById('dir-search').value = '';
  document.getElementById('filter-category').value = '';
  document.getElementById('filter-province').value = '';
  document.getElementById('filter-size').value = '';
  document.getElementById('filter-sort').value = '';
  applyFilters();
});

/* ── Toggle Saved List ── */
function toggleList(id, btn) {
  if (isInList(id)) {
    removeFromList(id);
    if (btn) btn.classList.remove('saved');
  } else {
    addToList(id);
    if (btn) btn.classList.add('saved');
  }
  renderMyList();
}

/* ── My List Panel ── */
document.getElementById('mylist-toggle')?.addEventListener('click', () => {
  const content = document.getElementById('mylist-content');
  const btn = document.getElementById('mylist-toggle');
  if (content.style.display === 'none') {
    content.style.display = 'block';
    btn.textContent = 'Hide';
    renderMyList();
  } else {
    content.style.display = 'none';
    btn.textContent = 'View';
  }
});

function renderMyList() {
  const list = getList();
  const container = document.getElementById('mylist-items');
  if (!container) return;
  if (list.length === 0) {
    container.innerHTML = '<p style="font-size:0.82rem;color:rgba(255,255,255,0.6)">No charities saved yet. Click the heart icon on any charity card.</p>';
    return;
  }
  container.innerHTML = list.map(id => {
    const c = charities.find(ch => ch.id === id);
    if (!c) return '';
    return `<div class="mylist-item">
      <span>${c.name}</span>
      <button onclick="toggleList('${c.id}')">Remove</button>
    </div>`;
  }).join('');
}

/* ── Init ── */
renderCauseGrid();
showStep(1);
initDirectory();
updateListUI();
