// ===== Constants =====
const POPULAR_CURRENCIES = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'EGP', name: 'Egyptian Pound' },
    { code: 'SAR', name: 'Saudi Riyal' },
    { code: 'AED', name: 'UAE Dirham' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'BRL', name: 'Brazilian Real' },
    { code: 'KRW', name: 'South Korean Won' },
    { code: 'MXN', name: 'Mexican Peso' },
    { code: 'SGD', name: 'Singapore Dollar' },
    { code: 'HKD', name: 'Hong Kong Dollar' },
    { code: 'NOK', name: 'Norwegian Krone' },
    { code: 'SEK', name: 'Swedish Krona' },
    { code: 'TRY', name: 'Turkish Lira' },
    { code: 'ZAR', name: 'South African Rand' },
    { code: 'RUB', name: 'Russian Ruble' },
    { code: 'NZD', name: 'New Zealand Dollar' },
    { code: 'THB', name: 'Thai Baht' },
    { code: 'PLN', name: 'Polish Zloty' },
    { code: 'DKK', name: 'Danish Krone' },
    { code: 'MYR', name: 'Malaysian Ringgit' },
    { code: 'QAR', name: 'Qatari Riyal' },
    { code: 'KWD', name: 'Kuwaiti Dinar' },
    { code: 'BHD', name: 'Bahraini Dinar' },
];
// ===== State =====
let conversionHistory = [];
let ratesCache = {};
// ===== DOM Elements =====
const amountInput = document.getElementById('amount');
const fromSelect = document.getElementById('fromCurrency');
const toSelect = document.getElementById('toCurrency');
const swapBtn = document.getElementById('swapBtn');
const convertBtn = document.getElementById('convertBtn');
const resultDiv = document.getElementById('result');
const resultText = document.getElementById('resultText');
const rateInfoDiv = document.getElementById('rateInfo');
const rateText = document.getElementById('rateText');
const lastUpdated = document.getElementById('lastUpdated');
const historyList = document.getElementById('historyList');
// ===== Functions =====
function populateSelects() {
    const fragment = document.createDocumentFragment();
    POPULAR_CURRENCIES.forEach((currency) => {
        const option = document.createElement('option');
        option.value = currency.code;
        option.textContent = `${currency.code} \u2014 ${currency.name}`;
        fragment.appendChild(option);
    });
    fromSelect.appendChild(fragment.cloneNode(true));
    toSelect.appendChild(fragment);
    fromSelect.value = 'USD';
    toSelect.value = 'EGP';
}
async function fetchRates(base) {
    if (ratesCache[base]) {
        return ratesCache[base].rates;
    }
    // Primary API: fawazahmed0 currency-api (Cloudflare Pages CDN, no rate limit)
    try {
        const primaryRes = await fetch('https://latest.currency-api.pages.dev/v1/currencies/' + base.toLowerCase() + '.json');
        if (primaryRes.ok) {
            const primaryData = await primaryRes.json();
            const ratesObj = primaryData[base.toLowerCase()];
            if (ratesObj) {
                const rates = {};
                for (const [key, value] of Object.entries(ratesObj)) {
                    rates[key.toUpperCase()] = value;
                }
                ratesCache[base] = { rates: rates, updated: primaryData.date || new Date().toUTCString() };
                return rates;
            }
        }
    } catch (_e) {
        // Fall through to backup API
    }
    // Fallback API: open.er-api.com
    const response = await fetch('https://open.er-api.com/v6/latest/' + base);
    if (!response.ok) {
        throw new Error('API error: ' + response.status);
    }
    const data = await response.json();
    if (data.result !== 'success') {
        throw new Error('Failed to fetch exchange rates');
    }
    ratesCache[base] = {
        rates: data.conversion_rates,
        updated: data.time_last_update_utc,
    };
    return data.conversion_rates;
}
function formatNumber(num) {
    if (num >= 1000) {
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}
async function convert() {
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
        resultText.textContent = 'Please enter a valid amount';
        resultDiv.classList.remove('hidden');
        rateInfoDiv.classList.add('hidden');
        return;
    }
    const from = fromSelect.value;
    const to = toSelect.value;
    convertBtn.textContent = 'Converting...';
    convertBtn.disabled = true;
    try {
        const rates = await fetchRates(from);
        const rate = rates[to];
        if (rate === undefined) {
            throw new Error('Rate not found for ' + to);
        }
        const result = amount * rate;
        resultText.textContent = formatNumber(amount) + ' ' + from + ' = ' + formatNumber(result) + ' ' + to;
        resultDiv.classList.remove('hidden');
        rateText.textContent = '1 ' + from + ' = ' + formatNumber(rate) + ' ' + to;
        lastUpdated.textContent = 'Last updated: ' + (ratesCache[from] ? ratesCache[from].updated : 'N/A');
        rateInfoDiv.classList.remove('hidden');
        var conversion = {
            from: from,
            to: to,
            amount: amount,
            result: result,
            rate: rate,
            timestamp: new Date(),
        };
        addToHistory(conversion);
    }
    catch (error) {
        resultText.textContent = 'Error fetching rates. Please try again.';
        resultDiv.classList.remove('hidden');
        rateInfoDiv.classList.add('hidden');
    }
    finally {
        convertBtn.textContent = 'Convert';
        convertBtn.disabled = false;
    }
}
function addToHistory(conversion) {
    conversionHistory.unshift(conversion);
    if (conversionHistory.length > 10) {
        conversionHistory.pop();
    }
    renderHistory();
}
function renderHistory() {
    if (conversionHistory.length === 0) {
        historyList.innerHTML = '<li class="empty-state">No conversions yet</li>';
        return;
    }
    historyList.innerHTML = conversionHistory
        .map(function(c) {
        var time = c.timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
        return '<li>' + formatNumber(c.amount) + ' ' + c.from + ' \u2192 ' + formatNumber(c.result) + ' ' + c.to + ' <span style="color:var(--text-muted);float:right">' + time + '</span></li>';
    })
        .join('');
}
function swapCurrencies() {
    var temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
}
// ===== Event Listeners =====
convertBtn.addEventListener('click', convert);
swapBtn.addEventListener('click', function() {
    swapCurrencies();
    convert();
});
amountInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter')
        convert();
});
// ===== Init =====
populateSelects();
