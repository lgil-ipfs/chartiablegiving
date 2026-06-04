/* js/give.js — Giving Guide */

/* ── Provincial Tax Rates (on amounts above $200) ── */
const provincialRates = {
  BC: 0.205,
  ON: 0.1741,
  AB: 0.21,
  QC: 0.24,
  MB: 0.174,
  SK: 0.175,
  NS: 0.21,
  NB: 0.195,
  PE: 0.1837,
  NL: 0.213,
};

const provinceNames = {
  BC: 'British Columbia',
  ON: 'Ontario',
  AB: 'Alberta',
  QC: 'Quebec',
  MB: 'Manitoba',
  SK: 'Saskatchewan',
  NS: 'Nova Scotia',
  NB: 'New Brunswick',
  PE: 'Prince Edward Island',
  NL: 'Newfoundland & Labrador',
};

/* ── Calculate Tax Credits ── */
function calculateCredits(amount, province) {
  const provRate = provincialRates[province] || 0.1741;

  // Federal
  const fedFirst = Math.min(amount, 200) * 0.15;
  const fedAbove = Math.max(0, amount - 200) * 0.29;
  const federal = fedFirst + fedAbove;

  // Provincial
  const provFirst = Math.min(amount, 200) * (provRate * 0.5); // approx first $200 provincial rate
  const provAbove = Math.max(0, amount - 200) * provRate;
  const provincial = provFirst + provAbove;

  const total = federal + provincial;
  const afterTax = amount - total;
  const pct = (total / amount) * 100;

  return { federal, provincial, total, afterTax, pct };
}

/* ── Tax Estimator ── */
let taxChart = null;

function updateEstimator() {
  const province = document.getElementById('est-province')?.value || 'ON';
  const amount = parseInt(document.getElementById('est-amount')?.value || '500');
  const displayEl = document.getElementById('donation-display');
  if (displayEl) displayEl.textContent = `$${amount.toLocaleString()}`;

  // Update slider track
  const slider = document.getElementById('est-amount');
  if (slider) {
    const pct = ((amount - 100) / (10000 - 100)) * 100;
    slider.style.background = `linear-gradient(90deg, var(--color-teal) ${pct}%, var(--color-linen) ${pct}%)`;
  }

  const { federal, provincial, total, afterTax, pct } = calculateCredits(amount, province);

  const resultsEl = document.getElementById('estimator-results');
  if (resultsEl) {
    resultsEl.innerHTML = `
      <div class="est-stat">
        <strong>$${Math.round(total).toLocaleString()}</strong>
        <p>Total estimated tax credit</p>
      </div>
      <div class="est-stat">
        <strong>${Math.round(pct)}%</strong>
        <p>Credit as % of donation</p>
      </div>
      <div class="est-stat">
        <strong>$${Math.round(afterTax).toLocaleString()}</strong>
        <p>After-tax cost to you</p>
      </div>
    `;
  }

  updateTaxChart(amount, federal, provincial, afterTax, province);
}

function updateTaxChart(amount, federal, provincial, afterTax, province) {
  const ctx = document.getElementById('tax-chart');
  if (!ctx) return;

  const data = {
    labels: ['Federal Credit', `${provinceNames[province]} Credit`, 'Your After-Tax Cost'],
    datasets: [{
      data: [Math.round(federal), Math.round(provincial), Math.round(afterTax)],
      backgroundColor: ['#2A9D8F', '#4DC4B8', '#E6F5F4'],
      borderRadius: 8,
      borderWidth: 0,
    }]
  };

  if (taxChart) {
    taxChart.data = data;
    taxChart.update();
  } else {
    taxChart = new Chart(ctx, {
      type: 'bar',
      data,
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` $${ctx.parsed.y.toLocaleString()}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: val => `$${val.toLocaleString()}`,
              font: { family: 'DM Mono, monospace', size: 11 }
            },
            grid: { color: '#E6F5F4' }
          },
          x: {
            ticks: { font: { family: 'DM Sans, sans-serif', size: 12 } },
            grid: { display: false }
          }
        }
      }
    });
  }
}

document.getElementById('est-province')?.addEventListener('change', updateEstimator);
document.getElementById('est-amount')?.addEventListener('input', updateEstimator);
updateEstimator();

/* ── Tab Scroll Spy ── */
(function initScrollSpy() {
  const sections = ['getting-started', 'strategies', 'tax', 'legacy'];
  const tabs = document.querySelectorAll('.give-tab');

  function getActiveSection() {
    const tabsEl = document.getElementById('give-tabs');
    const offset = tabsEl ? tabsEl.offsetHeight + 80 : 120;
    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i]);
      if (el && window.scrollY >= el.offsetTop - offset) {
        return sections[i];
      }
    }
    return sections[0];
  }

  window.addEventListener('scroll', debounce(() => {
    const active = getActiveSection();
    tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.section === active);
    });
  }, 100), { passive: true });
})();
