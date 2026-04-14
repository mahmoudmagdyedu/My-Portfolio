// === Pricing Table Component (TypeScript) ===

interface Plan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    name: 'Starter',
    monthlyPrice: 9,
    yearlyPrice: 86,
    description: 'Perfect for individuals and small projects.',
    features: ['1 Project', '5 GB Storage', 'Basic Analytics', 'Email Support'],
  },
  {
    name: 'Pro',
    monthlyPrice: 29,
    yearlyPrice: 278,
    description: 'Great for growing teams and businesses.',
    features: ['10 Projects', '50 GB Storage', 'Advanced Analytics', 'Priority Support', 'Custom Domain'],
    popular: true,
  },
  {
    name: 'Enterprise',
    monthlyPrice: 79,
    yearlyPrice: 758,
    description: 'For large organizations with advanced needs.',
    features: ['Unlimited Projects', '500 GB Storage', 'Full Analytics Suite', '24/7 Phone Support', 'SSO & SAML', 'Dedicated Manager'],
  },
];

let isYearly = false;

function renderCards(): void {
  const grid = document.getElementById('pricing-grid');
  if (!grid) return;

  grid.innerHTML = plans
    .map(
      (plan) => `
    <div class="pricing-card${plan.popular ? ' popular' : ''}">
      ${plan.popular ? '<span class="popular-badge">Most Popular</span>' : ''}
      <h2 class="plan-name">${plan.name}</h2>
      <p class="plan-price">$${isYearly ? plan.yearlyPrice : plan.monthlyPrice}<span>/${isYearly ? 'yr' : 'mo'}</span></p>
      <p class="plan-desc">${plan.description}</p>
      <ul class="features-list">
        ${plan.features.map((f) => `<li>${f}</li>`).join('')}
      </ul>
      <button class="cta-btn">Get Started</button>
    </div>
  `
    )
    .join('');
}

function setupToggle(): void {
  const btnMonthly = document.getElementById('btn-monthly');
  const btnYearly = document.getElementById('btn-yearly');

  btnMonthly?.addEventListener('click', () => {
    isYearly = false;
    btnMonthly.classList.add('active');
    btnMonthly.setAttribute('aria-pressed', 'true');
    btnYearly?.classList.remove('active');
    btnYearly?.setAttribute('aria-pressed', 'false');
    renderCards();
  });

  btnYearly?.addEventListener('click', () => {
    isYearly = true;
    btnYearly.classList.add('active');
    btnYearly.setAttribute('aria-pressed', 'true');
    btnMonthly?.classList.remove('active');
    btnMonthly?.setAttribute('aria-pressed', 'false');
    renderCards();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderCards();
  setupToggle();
});
