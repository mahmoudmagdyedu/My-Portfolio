"use strict";
// SkyPulse — Weather Dashboard App
var weatherDescriptions = {
    0: { text: 'Clear sky', emoji: '\u2600\ufe0f' },
    1: { text: 'Mainly clear', emoji: '\ud83c\udf24\ufe0f' },
    2: { text: 'Partly cloudy', emoji: '\u26c5' },
    3: { text: 'Overcast', emoji: '\u2601\ufe0f' },
    45: { text: 'Foggy', emoji: '\ud83c\udf2b\ufe0f' },
    48: { text: 'Depositing rime fog', emoji: '\ud83c\udf2b\ufe0f' },
    51: { text: 'Light drizzle', emoji: '\ud83c\udf26\ufe0f' },
    53: { text: 'Moderate drizzle', emoji: '\ud83c\udf26\ufe0f' },
    55: { text: 'Dense drizzle', emoji: '\ud83c\udf27\ufe0f' },
    61: { text: 'Slight rain', emoji: '\ud83c\udf26\ufe0f' },
    63: { text: 'Moderate rain', emoji: '\ud83c\udf27\ufe0f' },
    65: { text: 'Heavy rain', emoji: '\ud83c\udf27\ufe0f' },
    71: { text: 'Slight snow', emoji: '\ud83c\udf28\ufe0f' },
    73: { text: 'Moderate snow', emoji: '\u2744\ufe0f' },
    75: { text: 'Heavy snow', emoji: '\u2744\ufe0f' },
    80: { text: 'Rain showers', emoji: '\ud83c\udf26\ufe0f' },
    81: { text: 'Moderate showers', emoji: '\ud83c\udf27\ufe0f' },
    82: { text: 'Violent showers', emoji: '\u26c8\ufe0f' },
    95: { text: 'Thunderstorm', emoji: '\u26c8\ufe0f' },
    96: { text: 'Thunderstorm with hail', emoji: '\u26c8\ufe0f' },
    99: { text: 'Thunderstorm with heavy hail', emoji: '\u26c8\ufe0f' },
};
function getWeatherInfo(code) {
    return weatherDescriptions[code] || { text: 'Unknown', emoji: '\ud83c\udf21\ufe0f' };
}
function getDayName(dateStr) {
    var days = ['\u0627\u0644\u0623\u062d\u062f', '\u0627\u0644\u0625\u062b\u0646\u064a\u0646', '\u0627\u0644\u062b\u0644\u0627\u062b\u0627\u0621', '\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621', '\u0627\u0644\u062e\u0645\u064a\u0633', '\u0627\u0644\u062c\u0645\u0639\u0629', '\u0627\u0644\u0633\u0628\u062a'];
    var date = new Date(dateStr + 'T00:00:00');
    return days[date.getDay()];
}
function initTheme() {
    var saved = localStorage.getItem('skypulse-theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }
}
function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    var isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('skypulse-theme', isDark ? 'dark' : 'light');
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = isDark ? '\u2600\ufe0f' : '\ud83c\udf19';
}
function getFavorites() {
    try { return JSON.parse(localStorage.getItem('skypulse-favorites') || '[]'); }
    catch (e) { return []; }
}
function saveFavorites(favs) {
    localStorage.setItem('skypulse-favorites', JSON.stringify(favs));
}
function isFavorite(name, country) {
    return getFavorites().some(function(f) { return f.name === name && f.country === country; });
}
function addFavorite(city) {
    var favs = getFavorites();
    if (!favs.some(function(f) { return f.name === city.name && f.country === city.country; })) {
        favs.push(city);
        saveFavorites(favs);
    }
}
function removeFavorite(name, country) {
    saveFavorites(getFavorites().filter(function(f) { return !(f.name === name && f.country === country); }));
}
function renderFavorites() {
    var container = document.getElementById('favorites-list');
    if (!container) return;
    var favs = getFavorites();
    if (favs.length === 0) {
        container.innerHTML = '<p class="text-slate-400 dark:text-slate-500 text-sm text-center py-4">\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u062f\u0646 \u0645\u0641\u0636\u0644\u0629 \u0628\u0639\u062f</p>';
        return;
    }
    container.innerHTML = favs.map(function(f) {
        var safeName = f.name.replace(/'/g, "\\'");
        var safeCountry = (f.country || '').replace(/'/g, "\\'");
        return '<button onclick="loadWeather(' + f.lat + ', ' + f.lon + ', \'' + safeName + '\', \'' + safeCountry + '\')" class="flex items-center justify-between w-full bg-white dark:bg-slate-700 hover:bg-primary-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 transition group"><span class="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400">' + f.name + '</span><span class="text-xs text-slate-400">' + f.country + '</span></button>';
    }).join('');
}
var GEO_BASE = 'https://geocoding-api.open-meteo.com/v1/search';
var WEATHER_BASE = 'https://api.open-meteo.com/v1/forecast';

async function searchCity(query) {
    if (!query.trim()) return [];
    var url = GEO_BASE + '?name=' + encodeURIComponent(query) + '&count=5&language=en';
    var res = await fetch(url);
    var data = await res.json();
    return data.results || [];
}
async function fetchWeather(lat, lon) {
    var url = WEATHER_BASE + '?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=6';
    var res = await fetch(url);
    var data = await res.json();
    var current = {
        temperature: Math.round(data.current.temperature_2m),
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        weatherCode: data.current.weather_code,
        isDay: data.current.is_day === 1,
    };
    var forecast = data.daily.time.slice(1).map(function(date, i) {
        return {
            date: date,
            dayName: getDayName(date),
            tempMax: Math.round(data.daily.temperature_2m_max[i + 1]),
            tempMin: Math.round(data.daily.temperature_2m_min[i + 1]),
            weatherCode: data.daily.weather_code[i + 1],
        };
    });
    return { current: current, forecast: forecast };
}
var currentCity = { name: '', country: '', lat: 0, lon: 0 };
async function loadWeather(lat, lon, name, country) {
    currentCity = { name: name, country: country || '', lat: lat, lon: lon };
    var resultSection = document.getElementById('weather-result');
    var currentCard = document.getElementById('current-weather');
    var forecastGrid = document.getElementById('forecast-grid');
    var loader = document.getElementById('loader');
    resultSection.classList.remove('hidden');
    loader.classList.remove('hidden');
    currentCard.innerHTML = '';
    forecastGrid.innerHTML = '';
    try {
        var result = await fetchWeather(lat, lon);
        var current = result.current;
        var forecast = result.forecast;
        var info = getWeatherInfo(current.weatherCode);
        var favActive = isFavorite(name, currentCity.country);
        currentCard.innerHTML = '<div class="flex flex-col sm:flex-row items-center sm:items-start gap-6"><div class="text-center sm:text-right"><div class="text-7xl sm:text-8xl mb-2">' + info.emoji + '</div><p class="text-slate-500 dark:text-slate-400 font-medium">' + info.text + '</p></div><div class="flex-1 text-center sm:text-right"><div class="flex items-center justify-center sm:justify-start gap-3 mb-2"><h2 class="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">' + name + '</h2><button id="fav-btn" onclick="toggleFav()" class="text-2xl hover:scale-125 transition-transform" title="' + (favActive ? '\u0625\u0632\u0627\u0644\u0629 \u0645\u0646 \u0627\u0644\u0645\u0641\u0636\u0644\u0629' : '\u0625\u0636\u0627\u0641\u0629 \u0644\u0644\u0645\u0641\u0636\u0644\u0629') + '">' + (favActive ? '\u2b50' : '\u2606') + '</button></div><p class="text-6xl sm:text-7xl font-black text-primary-600 dark:text-primary-400 mb-4">' + current.temperature + '\u00b0C</p><div class="flex flex-wrap justify-center sm:justify-start gap-4 text-sm"><span class="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full font-semibold">\ud83d\udca7 \u0627\u0644\u0631\u0637\u0648\u0628\u0629: ' + current.humidity + '%</span><span class="flex items-center gap-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-3 py-1.5 rounded-full font-semibold">\ud83d\udca8 \u0627\u0644\u0631\u064a\u0627\u062d: ' + current.windSpeed + ' \u0643\u0645/\u0633</span></div></div></div>';
        forecastGrid.innerHTML = forecast.map(function(day) {
            var dayInfo = getWeatherInfo(day.weatherCode);
            return '<div class="bg-white dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 p-4 text-center hover:shadow-lg hover:-translate-y-1 transition-all"><p class="font-bold text-slate-600 dark:text-slate-300 text-sm mb-1">' + day.dayName + '</p><p class="text-xs text-slate-400 mb-3">' + day.date + '</p><div class="text-4xl mb-3">' + dayInfo.emoji + '</div><p class="text-xs text-slate-500 dark:text-slate-400 mb-2">' + dayInfo.text + '</p><div class="flex justify-center gap-2 text-sm font-bold"><span class="text-red-500">' + day.tempMax + '\u00b0</span><span class="text-slate-300 dark:text-slate-500">/</span><span class="text-blue-500">' + day.tempMin + '\u00b0</span></div></div>';
        }).join('');
    } catch (err) {
        currentCard.innerHTML = '<p class="text-red-500 text-center py-8 font-bold">\u26a0\ufe0f \u062d\u062f\u062b \u062e\u0637\u0623 \u0623\u062b\u0646\u0627\u0621 \u062a\u062d\u0645\u064a\u0644 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0637\u0642\u0633</p>';
    } finally {
        loader.classList.add('hidden');
    }
}
function toggleFav() {
    var name = currentCity.name;
    var country = currentCity.country;
    var lat = currentCity.lat;
    var lon = currentCity.lon;
    if (isFavorite(name, country)) {
        removeFavorite(name, country);
    } else {
        addFavorite({ name: name, country: country, lat: lat, lon: lon });
    }
    renderFavorites();
    var btn = document.getElementById('fav-btn');
    if (btn) {
        var active = isFavorite(name, country);
        btn.textContent = active ? '\u2b50' : '\u2606';
        btn.title = active ? '\u0625\u0632\u0627\u0644\u0629 \u0645\u0646 \u0627\u0644\u0645\u0641\u0636\u0644\u0629' : '\u0625\u0636\u0627\u0641\u0629 \u0644\u0644\u0645\u0641\u0636\u0644\u0629';
    }
}
var searchTimeout;
function setupSearch() {
    var input = document.getElementById('search-input');
    var dropdown = document.getElementById('search-dropdown');
    input.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        var query = input.value.trim();
        if (query.length < 2) { dropdown.classList.add('hidden'); return; }
        searchTimeout = setTimeout(async function() {
            var results = await searchCity(query);
            if (results.length === 0) { dropdown.classList.add('hidden'); return; }
            dropdown.innerHTML = results.map(function(r) {
                var safeName = r.name.replace(/'/g, "\\'");
                var safeCountry = (r.country || '').replace(/'/g, "\\'");
                var loc = r.admin1 ? r.admin1 + ', ' : '';
                return '<button onclick="selectCity(' + r.latitude + ', ' + r.longitude + ', \'' + safeName + '\', \'' + safeCountry + '\')" class="w-full text-right px-4 py-3 hover:bg-primary-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-between"><span class="font-semibold text-slate-700 dark:text-slate-200">' + r.name + '</span><span class="text-xs text-slate-400">' + loc + (r.country || '') + '</span></button>';
            }).join('');
            dropdown.classList.remove('hidden');
        }, 350);
    });
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') dropdown.classList.add('hidden');
    });
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#search-container')) dropdown.classList.add('hidden');
    });
}
function selectCity(lat, lon, name, country) {
    var input = document.getElementById('search-input');
    var dropdown = document.getElementById('search-dropdown');
    input.value = name;
    dropdown.classList.add('hidden');
    currentCity.country = country || '';
    loadWeather(lat, lon, name, country);
}
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    var isDark = document.documentElement.classList.contains('dark');
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = isDark ? '\u2600\ufe0f' : '\ud83c\udf19';
    setupSearch();
    renderFavorites();
    loadWeather(30.06, 31.25, '\u0627\u0644\u0642\u0627\u0647\u0631\u0629', '\u0645\u0635\u0631');
});
