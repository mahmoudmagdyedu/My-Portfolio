// ===== Types & Interfaces =====

interface Currency {
  code: string;
  name: string;
}

interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  timestamp: Date;
}

interface ExchangeRateResponse {
  result: string;
  base_code: string;
  conversion_rates: Record<string, number>;
  time_last_update_utc: string;
}

// ===== Constants =====

const POPULAR_CURRENCIES: Currency[] = [
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

let conversionHistory: ConversionResult[] = [];
let ratesCache: Record<string, { rates: Record<string, number>; updated: string }> = {};

// ===== DOM Elements =====

const amountInput = document.getElementById('amount') as HTMLInputElement;
const fromSelect = document.getElementById('fromCurrency') as HTMLSelectElement;
const toSelect = document.getElementById('toCurrency') as HTMLSelectElement;
const swapBtn = document.getElementById('swapBtn') as HTMLButtonElement;
const convertBtn = document.getElementById('convertBtn') as HTMLButtonElement;
const resultDiv = document.getElementById('result') as HTMLDivElement;
const resultText = document.getElementById('resultText') as HTMLSpanElement;
const rateInfoDiv = document.getElementById('rateInfo') as HTMLDivElement;
const rateText = document.getElementById('rateText') as HTMLSpanElement;
const lastUpdated = document.getElementById('lastUpdated') as HTMLSpanElement;
const historyList = document.getElementById('historyList') as HTMLUListElement;

// ===== Functions =====

function populateSelects(): void {
  const fragment = document.createDocumentFragment();
  POPULAR_CURRENCIES.forEach((currency: Currency) => {
    const option = document.createElement('option');
    option.value = currency.code;
    option.textContent = `${currency.code} — ${currency.name}`;
    fragment.appendChild(option);
  });

  fromSelect.appendChild(fragment.cloneNode(true));
  toSelect.appendChild(fragment);

  fromSelect.value = 'USD';
  toSelect.value = 'EGP';
}

async function fetchRates(base: string): Promise<Record<string, number>> {
  if (ratesCache[base]) {
    return ratesCache[base].rates;
  }

  // Primary API: fawazahmed0 currency-api (Cloudflare Pages CDN, no rate limit)
  try {
    const primaryRes = await fetch(
      `https://latest.currency-api.pages.dev/v1/currencies/${base.toLowerCase()}.json`
    );
    if (primaryRes.ok) {
      const primaryData = await primaryRes.json();
      const ratesObj: Record<string, number> | undefined = primaryData[base.toLowerCase()];
      if (ratesObj) {
        const rates: Record<string, number> = {};
        for (const [key, value] of Object.entries(ratesObj)) {
          rates[key.toUpperCase()] = value as number;
        }
        ratesCache[base] = { rates, updated: primaryData.date || new Date().toUTCString() };
        return rates;
      }
    }
  } catch (_e) {
    // Fall through to backup API
  }

  // Fallback API: open.er-api.com
  const response = await fetch(`https://open.er-api.com/v6/latest/${base}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data: ExchangeRateResponse = await response.json();
  if (data.result !== 'success') {
    throw new Error('Failed to fetch exchange rates');
  }

  ratesCache[base] = {
    rates: data.conversion_rates,
    updated: data.time_last_update_utc,
  };

  return data.conversion_rates;
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

async function convert(): Promise<void> {
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
      throw new Error(`Rate not found for ${to}`);
    }

    const result = amount * rate;

    resultText.textContent = `${formatNumber(amount)} ${from} = ${formatNumber(result)} ${to}`;
    resultDiv.classList.remove('hidden');

    rateText.textContent = `1 ${from} = ${formatNumber(rate)} ${to}`;
    lastUpdated.textContent = `Last updated: ${ratesCache[from]?.updated || 'N/A'}`;
    rateInfoDiv.classList.remove('hidden');

    const conversion: ConversionResult = {
      from,
      to,
      amount,
      result,
      rate,
      timestamp: new Date(),
    };
    addToHistory(conversion);
  } catch (error) {
    resultText.textContent = 'Error fetching rates. Please try again.';
    resultDiv.classList.remove('hidden');
    rateInfoDiv.classList.add('hidden');
  } finally {
    convertBtn.textContent = 'Convert';
    convertBtn.disabled = false;
  }
}

function addToHistory(conversion: ConversionResult): void {
  conversionHistory.unshift(conversion);
  if (conversionHistory.length > 10) {
    conversionHistory.pop();
  }
  renderHistory();
}

function renderHistory(): void {
  if (conversionHistory.length === 0) {
    historyList.innerHTML = '<li class="empty-state">No conversions yet</li>';
    return;
  }

  historyList.innerHTML = conversionHistory
    .map((c: ConversionResult) => {
      const time = c.timestamp.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `<li>${formatNumber(c.amount)} ${c.from} → ${formatNumber(c.result)} ${c.to} <span style="color:var(--text-muted);float:right">${time}</span></li>`;
    })
    .join('');
}

function swapCurrencies(): void {
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;
}

// ===== Event Listeners =====

convertBtn.addEventListener('click', convert);
swapBtn.addEventListener('click', () => {
  swapCurrencies();
  convert();
});

amountInput.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter') convert();
});

// ===== Init =====

populateSelects();
