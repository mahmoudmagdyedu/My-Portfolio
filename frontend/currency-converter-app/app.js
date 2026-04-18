// ===== Constants =====
var POPULAR_CURRENCIES = [
    { code: 'USD', name: 'دولار أمريكي' },
    { code: 'EUR', name: 'يورو' },
    { code: 'GBP', name: 'جنيه إسترليني' },
    { code: 'JPY', name: 'ين ياباني' },
    { code: 'AUD', name: 'دولار أسترالي' },
    { code: 'CAD', name: 'دولار كندي' },
    { code: 'CHF', name: 'فرنك سويسري' },
    { code: 'CNY', name: 'يوان صيني' },
    { code: 'EGP', name: 'جنيه مصري' },
    { code: 'SAR', name: 'ريال سعودي' },
    { code: 'AED', name: 'درهم إماراتي' },
    { code: 'INR', name: 'روبية هندية' },
    { code: 'BRL', name: 'ريال برازيلي' },
    { code: 'KRW', name: 'وون كوري' },
    { code: 'MXN', name: 'بيزو مكسيكي' },
    { code: 'SGD', name: 'دولار سنغافوري' },
    { code: 'HKD', name: 'دولار هونغ كونغ' },
    { code: 'NOK', name: 'كرونة نرويجية' },
    { code: 'SEK', name: 'كرونة سويدية' },
    { code: 'TRY', name: 'ليرة تركية' },
    { code: 'ZAR', name: 'راند جنوب أفريقي' },
    { code: 'RUB', name: 'روبل روسي' },
    { code: 'NZD', name: 'دولار نيوزيلندي' },
    { code: 'THB', name: 'بات تايلندي' },
    { code: 'PLN', name: 'زلوتي بولندي' },
    { code: 'DKK', name: 'كرونة دنماركية' },
    { code: 'MYR', name: 'رينغيت ماليزي' },
    { code: 'QAR', name: 'ريال قطري' },
    { code: 'KWD', name: 'دينار كويتي' },
    { code: 'BHD', name: 'دينار بحريني' },
];
// ===== State =====
var conversionHistory = [];
var ratesCache = {};
// ===== DOM Elements =====
var amountInput = document.getElementById('amount');
var fromSelect = document.getElementById('fromCurrency');
var toSelect = document.getElementById('toCurrency');
var swapBtn = document.getElementById('swapBtn');
var convertBtn = document.getElementById('convertBtn');
var resultDiv = document.getElementById('result');
var resultText = document.getElementById('resultText');
var rateInfoDiv = document.getElementById('rateInfo');
var rateText = document.getElementById('rateText');
var lastUpdated = document.getElementById('lastUpdated');
var historyList = document.getElementById('historyList');
// ===== Functions =====
function populateSelects() {
    var fragment = document.createDocumentFragment();
    POPULAR_CURRENCIES.forEach(function(currency) {
        var option = document.createElement('option');
        option.value = currency.code;
        option.textContent = currency.code + ' \u2014 ' + currency.name;
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
        var primaryRes = await fetch('https://latest.currency-api.pages.dev/v1/currencies/' + base.toLowerCase() + '.json');
        if (primaryRes.ok) {
            var primaryData = await primaryRes.json();
            var ratesObj = primaryData[base.toLowerCase()];
            if (ratesObj) {
                var rates = {};
                for (var key in ratesObj) {
                    if (ratesObj.hasOwnProperty(key)) {
                        rates[key.toUpperCase()] = ratesObj[key];
                    }
                }
                ratesCache[base] = { rates: rates, updated: primaryData.date || new Date().toLocaleDateString('ar-EG') };
                return rates;
            }
        }
    } catch (_e) {
        // Fall through to backup API
    }
    // Fallback API: open.er-api.com
    var response = await fetch('https://open.er-api.com/v6/latest/' + base);
    if (!response.ok) {
        throw new Error('API error: ' + response.status);
    }
    var data = await response.json();
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
    var amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
        resultText.textContent = '\u0623\u062f\u062e\u0644 \u0645\u0628\u0644\u063a \u0635\u062d\u064a\u062d';
        resultDiv.classList.remove('hidden');
        rateInfoDiv.classList.add('hidden');
        return;
    }
    var from = fromSelect.value;
    var to = toSelect.value;
    convertBtn.textContent = '\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u062d\u0648\u064a\u0644...';
    convertBtn.disabled = true;
    convertBtn.classList.add('opacity-60', 'cursor-not-allowed');
    try {
        var rates = await fetchRates(from);
        var rate = rates[to];
        if (rate === undefined) {
            throw new Error('Rate not found for ' + to);
        }
        var result = amount * rate;
        resultText.textContent = formatNumber(amount) + ' ' + from + ' = ' + formatNumber(result) + ' ' + to;
        resultDiv.classList.remove('hidden');
        rateText.textContent = '1 ' + from + ' = ' + formatNumber(rate) + ' ' + to;
        lastUpdated.textContent = '\u0622\u062e\u0631 \u062a\u062d\u062f\u064a\u062b: ' + (ratesCache[from] ? ratesCache[from].updated : 'N/A');
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
        resultText.textContent = '\u062e\u0637\u0623 \u0641\u064a \u062c\u0644\u0628 \u0627\u0644\u0623\u0633\u0639\u0627\u0631. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u062a\u0627\u0646\u064a\u0629.';
        resultDiv.classList.remove('hidden');
        resultDiv.querySelector('p').classList.remove('text-emerald-600', 'dark:text-emerald-400');
        resultDiv.querySelector('p').classList.add('text-red-500');
        rateInfoDiv.classList.add('hidden');
    }
    finally {
        convertBtn.textContent = '\u062a\u062d\u0648\u064a\u0644';
        convertBtn.disabled = false;
        convertBtn.classList.remove('opacity-60', 'cursor-not-allowed');
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
        historyList.innerHTML = '<li class="text-center text-sm text-slate-400 dark:text-slate-500 italic py-4">\u0644\u0627 \u062a\u0648\u062c\u062f \u062a\u062d\u0648\u064a\u0644\u0627\u062a \u0628\u0639\u062f</li>';
        return;
    }
    historyList.innerHTML = conversionHistory
        .map(function(c) {
            var time = c.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
            return '<li class="flex items-center justify-between bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600/30 rounded-xl px-4 py-3 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700/50 transition"><span>' + formatNumber(c.amount) + ' ' + c.from + ' \u2192 ' + formatNumber(c.result) + ' ' + c.to + '</span><span class="text-xs text-slate-400 dark:text-slate-500">' + time + '</span></li>';
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
    if (e.key === 'Enter') convert();
});
// ===== Init =====
populateSelects();
