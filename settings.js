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

  function apply(settings) {
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
