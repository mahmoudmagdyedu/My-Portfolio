// === Pricing Table Component (Compiled JS) ===
"use strict";
var plans = [
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
var isYearly = false;
function renderCards() {
    var grid = document.getElementById('pricing-grid');
    if (!grid) return;
    grid.innerHTML = plans
        .map(function (plan) {
        return "\n    <div class=\"pricing-card" + (plan.popular ? ' popular' : '') + "\">\n      " + (plan.popular ? '<span class="popular-badge">Most Popular</span>' : '') + "\n      <h2 class=\"plan-name\">" + plan.name + "</h2>\n      <p class=\"plan-price\">$" + (isYearly ? plan.yearlyPrice : plan.monthlyPrice) + "<span>/" + (isYearly ? 'yr' : 'mo') + "</span></p>\n      <p class=\"plan-desc\">" + plan.description + "</p>\n      <ul class=\"features-list\">\n        " + plan.features.map(function (f) { return '<li>' + f + '</li>'; }).join('') + "\n      </ul>\n      <button class=\"cta-btn\">Get Started</button>\n    </div>\n  ";
    })
        .join('');
}
function setupToggle() {
    var btnMonthly = document.getElementById('btn-monthly');
    var btnYearly = document.getElementById('btn-yearly');
    if (btnMonthly) {
        btnMonthly.addEventListener('click', function () {
            isYearly = false;
            btnMonthly.classList.add('active');
            btnMonthly.setAttribute('aria-pressed', 'true');
            if (btnYearly) { btnYearly.classList.remove('active'); btnYearly.setAttribute('aria-pressed', 'false'); }
            renderCards();
        });
    }
    if (btnYearly) {
        btnYearly.addEventListener('click', function () {
            isYearly = true;
            btnYearly.classList.add('active');
            btnYearly.setAttribute('aria-pressed', 'true');
            if (btnMonthly) { btnMonthly.classList.remove('active'); btnMonthly.setAttribute('aria-pressed', 'false'); }
            renderCards();
        });
    }
}
document.addEventListener('DOMContentLoaded', function () {
    renderCards();
    setupToggle();
});
