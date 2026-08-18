/* js/why-tool.js — "Start With the Why" interactive reflection
   Lives inside an article's content (see data/articles.json,
   slug "why-do-we-give"), which is injected via innerHTML after
   the page loads — so this only initializes once article.js calls
   initWhyTool() following that injection. */

function initWhyTool() {
  const root = document.getElementById('why-tool');
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = 'true';

  const results = {
    connection: {
      title: 'You give through connection.',
      description: "Your generosity is personal — tied to someone or something specific in your life, not an abstract cause. That's one of the most durable reasons to give, because it's rooted in something real.",
      tip: "Look for charities where you can see who your gift reaches: organizations tied to a condition or community you know personally, or ones that share direct stories from the people they serve."
    },
    impact: {
      title: 'You give for impact.',
      description: "You want your dollars to do measurable work. You're drawn to evidence, outcomes, and organizations that can show — not just tell — what your gift accomplished.",
      tip: "Prioritize charities that publish clear outcomes and financials, and check their T3010 filings on the CRA registry before giving. A donor-advised fund can also give you time to research before committing."
    },
    values: {
      title: 'You give from your values.',
      description: "For you, giving isn't a once-a-year decision — it's an extension of what you believe. Faith, ethics, or a cause central to your identity shapes where your generosity goes.",
      tip: "Recurring, planned giving tends to fit you well — it turns a value into a habit. It's also worth exploring legacy giving, since your reasons for giving aren't likely to change with time."
    },
    community: {
      title: 'You give for community.',
      description: "You give to be part of something bigger, close to home. Local, visible impact matters to you more than scale.",
      tip: "Small and local charities are usually the best fit — food banks, community foundations, and grassroots organizations where your gift has an outsized, visible effect nearby."
    }
  };

  const totalSteps = 6;
  let step = 1;
  const answers = {};

  const progressBar = root.querySelector('#why-progress-bar');
  const stepLabel = root.querySelector('#why-step-label');
  const backBtn = root.querySelector('#why-back');
  const nextBtn = root.querySelector('#why-next');

  function updateProgress() {
    if (progressBar) progressBar.style.width = `${((step - 1) / (totalSteps - 1)) * 100}%`;
    if (stepLabel) stepLabel.textContent = step <= 5 ? `Question ${step} of 5` : 'Your Result';
  }

  function showStep(n) {
    root.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
    const target = root.querySelector(`.wizard-step[data-step="${n}"]`);
    if (target) target.classList.add('active');
    if (backBtn) backBtn.style.display = (n > 1 && n < 6) ? '' : 'none';
    if (nextBtn) nextBtn.textContent = n === 5 ? 'See My Result' : (n === 6 ? 'Retake the Reflection' : 'Next');
    updateProgress();
  }

  function renderResult() {
    const tally = {};
    Object.values(answers).forEach(t => { tally[t] = (tally[t] || 0) + 1; });
    let topType = 'connection';
    let topCount = -1;
    Object.keys(results).forEach(type => {
      const count = tally[type] || 0;
      if (count > topCount) { topCount = count; topType = type; }
    });
    const r = results[topType];
    const resultEl = root.querySelector('#why-result');
    if (!resultEl) return;
    resultEl.innerHTML = `
      <div class="why-result-card">
        <span class="badge badge-teal">Your Giving Why</span>
        <h3>${r.title}</h3>
        <p>${r.description}</p>
        <div class="why-result-tip"><strong>Where to go from here:</strong> ${r.tip}</div>
        <div class="why-result-actions">
          <a href="find.html" class="btn btn-primary">Find a Matching Charity</a>
          <a href="give.html#getting-started" class="btn btn-outline">See Giving Strategies</a>
        </div>
      </div>
    `;
  }

  root.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const grid = btn.closest('.option-grid');
      grid.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      answers[step] = btn.dataset.type;
    });
  });

  nextBtn?.addEventListener('click', () => {
    if (step === 5) {
      step = 6;
      renderResult();
      showStep(6);
    } else if (step === 6) {
      step = 1;
      Object.keys(answers).forEach(k => delete answers[k]);
      root.querySelectorAll('.option-btn.selected').forEach(b => b.classList.remove('selected'));
      showStep(1);
    } else {
      step++;
      showStep(step);
    }
  });

  backBtn?.addEventListener('click', () => {
    if (step > 1) { step--; showStep(step); }
  });

  showStep(1);
}
