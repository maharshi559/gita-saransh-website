/* Site settings from Supabase (table public.site_settings).
   Edit values in the Supabase Table Editor; the site picks them up on the next page load.

   Markup hooks:
     data-tpl="Text with {key} and {other_key}"   replaces the element's text when every key has a value;
                                                   otherwise the text written in the HTML stays as the fallback.
     data-tpl-href="mailto:{key}"                  same, for the link address.
     data-needs="key"                              element is shown only when that key has a value.
     data-unless="key"                             element is hidden when that key has a value. */
(function () {
  'use strict';

  var CFG = window.GITA_SARANSH || {};

  /* ---------- visitor's country (from the device time zone; no tracking, no IP lookup) ---------- */
  var COUNTRY = (function () {
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { /* ignore */ }
    var TZ = {
      'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN', 'Europe/London': 'GB', 'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA',
      'Asia/Qatar': 'QA', 'Asia/Kuwait': 'KW', 'Asia/Muscat': 'OM', 'Asia/Bahrain': 'BH', 'Asia/Singapore': 'SG',
      'Asia/Kuala_Lumpur': 'MY', 'Asia/Kathmandu': 'NP', 'Asia/Katmandu': 'NP', 'Asia/Colombo': 'LK', 'Asia/Dhaka': 'BD',
      'Indian/Mauritius': 'MU', 'Pacific/Fiji': 'FJ', 'Africa/Johannesburg': 'ZA', 'Africa/Nairobi': 'KE',
      'America/Port_of_Spain': 'TT', 'America/Guyana': 'GY', 'America/Paramaribo': 'SR', 'Europe/Berlin': 'DE',
      'Europe/Amsterdam': 'NL', 'Europe/Dublin': 'IE', 'Europe/Paris': 'FR', 'Europe/Rome': 'IT',
      'Asia/Hong_Kong': 'HK', 'Asia/Tokyo': 'JP', 'Pacific/Auckland': 'NZ'
    };
    var CA = /^America\/(Toronto|Vancouver|Edmonton|Winnipeg|Halifax|Regina|St_Johns|Montreal|Moncton)/;
    return TZ[tz] || (CA.test(tz) ? 'CA' : /^America\//.test(tz) ? 'US' : /^Australia\//.test(tz) ? 'AU' : '');
  })();
  window.GS_COUNTRY = COUNTRY; // '' when unknown

  /* ---------- price for this visitor ----------
     price        India price, e.g. "₹99" (shown in India)
     price_intl   price for everyone outside India, e.g. "$4.99"
     prices       optional per-country overrides as JSON, e.g. {"GB":"£3.99","AE":"AED 19"}
     Outside India with no matching price, the price sentence shows neutral wording instead. */
  function localPrice(settings) {
    var byCountry = {};
    if (has(settings, 'prices')) {
      try { byCountry = JSON.parse(settings.prices) || {}; } catch (e) { byCountry = {}; }
    }
    if (COUNTRY && byCountry[COUNTRY]) return byCountry[COUNTRY];
    if (COUNTRY === 'IN') return settings.price;
    return has(settings, 'price_intl') ? settings.price_intl : null;
  }
  var CACHE_KEY = 'gs-settings';
  var TOKEN = /\{(\w+)\}/g;

  function has(settings, key) {
    return settings[key] != null && String(settings[key]).trim() !== '';
  }

  function fill(tpl, settings) {
    var ok = true;
    var out = tpl.replace(TOKEN, function (_, k) {
      if (!has(settings, k)) { ok = false; return ''; }
      return String(settings[k]).trim();
    });
    return ok ? out : null;
  }

  function apply(raw) {
    var settings = {};
    Object.keys(raw || {}).forEach(function (k) { settings[k] = raw[k]; });
    settings.price = localPrice(raw || {});
    window.GITA_SARANSH_SETTINGS = settings;
    document.querySelectorAll('[data-tpl]').forEach(function (el) {
      if (!el.hasAttribute('data-fallback')) el.setAttribute('data-fallback', el.textContent);
      var txt = fill(el.getAttribute('data-tpl'), settings);
      el.textContent = txt != null ? txt : el.getAttribute('data-fallback');
    });
    document.querySelectorAll('[data-tpl-href]').forEach(function (el) {
      var href = fill(el.getAttribute('data-tpl-href'), settings);
      if (href != null) el.setAttribute('href', href);
    });
    document.querySelectorAll('[data-needs]').forEach(function (el) {
      el.hidden = !el.getAttribute('data-needs').split(/\s+/).every(function (k) { return has(settings, k); });
    });
    document.querySelectorAll('[data-unless]').forEach(function (el) {
      el.hidden = has(settings, el.getAttribute('data-unless'));
    });
    document.dispatchEvent(new CustomEvent('gs:settings', { detail: settings }));
  }

  // 1. Last known values straight away (no flash of fallback text on repeat visits).
  var cached = null;
  try { cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch (e) { cached = null; }
  if (cached) apply(cached);

  // 2. Fresh values from Supabase.
  if (!CFG.SUPABASE_URL || !CFG.SUPABASE_ANON_KEY) {
    console.warn('[Gita Saransh] Supabase is not configured in config.js; showing fallback text.');
    return;
  }
  fetch(CFG.SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/site_settings?select=key,value', {
    headers: /^eyJ/.test(CFG.SUPABASE_ANON_KEY)
      ? { apikey: CFG.SUPABASE_ANON_KEY, Authorization: 'Bearer ' + CFG.SUPABASE_ANON_KEY }
      : { apikey: CFG.SUPABASE_ANON_KEY }
  }).then(function (res) {
    if (!res.ok) throw new Error('settings ' + res.status);
    return res.json();
  }).then(function (rows) {
    var settings = {};
    rows.forEach(function (r) { settings[r.key] = r.value; });
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(settings)); } catch (e) { /* ignore */ }
    apply(settings);
  }).catch(function (err) {
    console.warn('[Gita Saransh] Could not load site settings:', err);
  });
})();
