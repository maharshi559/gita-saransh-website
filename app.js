/* Gita Saransh website: language picker, Ask Krishna demo, waitlist form. */
(function () {
  'use strict';

  var CFG = window.GITA_SARANSH || {};
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  /* ---------- language picker ---------- */
  var HELLO = {
    en: 'Namaste!', hi: 'नमस्ते!', te: 'నమస్కారం!', ta: 'வணக்கம்!',
    kn: 'ನಮಸ್ಕಾರ!', mr: 'नमस्कार!', bn: 'নমস্কার!', gu: 'નમસ્તે!'
  };
  var langSelects = $$('[data-lang-select]');
  var hello = $('[data-hello]');

  function setLang(code, save) {
    if (!HELLO[code]) code = 'en';
    langSelects.forEach(function (s) { s.value = code; });
    if (hello) hello.textContent = HELLO[code];
    if (save) store('gs-lang', code);
  }

  function guessLang() {
    var saved = store('gs-lang');
    if (saved && HELLO[saved]) return saved;
    var nav = (navigator.languages || [navigator.language || 'en']);
    for (var i = 0; i < nav.length; i++) {
      var c = String(nav[i]).slice(0, 2).toLowerCase();
      if (HELLO[c]) return c;
    }
    return 'en';
  }

  langSelects.forEach(function (s) {
    s.addEventListener('change', function () { setLang(s.value, true); });
  });
  setLang(guessLang(), false);

  /* ---------- header shadow ---------- */
  var header = $('.site-header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- reveal on scroll ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Ask Krishna demo ---------- */
  var ASK = {
    newborn: ['(kicks his tiny feet)', 'Aah-goo! Scared? Shh, shh. You study a little. Then a little more. Don’t count marks. Just try, try, try. Trying is your job!'],
    toddler: ['(giggles and hides a butter pot)', 'Exams are scary? Like when Yashoda Maa finds my butter pot! Hee hee. But listen: one step, then one step. Study a little bit every day. The marks? Leave them to me. Your job is the trying!'],
    boy: ['(twirls his flute)', 'When I take the cows out, I don’t sit worrying about rain. I walk them to the best grass. Make a small plan: some study each day, good sleep, your best on the day. The marks aren’t in your hands. Today’s study is.'],
    teen: ['', 'I get it, that pressure can feel like a mountain on your shoulders. I held Govardhan up because I wasn’t straining over the outcome. Break the syllabus into small parts, finish one a day, and stop checking the scoreboard in your head.'],
    youth: ['', 'Worry is energy spent in a future that hasn’t happened. Bring it back to today: decide what you’ll study this hour, give it full attention, then rest. Your part, and your freedom, is the quality of your effort.'],
    adult: ['', 'Arjuna stood before his battle trembling at what might happen, as you stand before this exam. Prepare steadily, give the paper your whole heart, then release the result. Cling neither to success nor to the fear of failure.']
  };
  var tabs = $$('[data-ask-tabs] .tab');
  var bubble = $('[data-ask-bubble]');
  var gesture = $('[data-ask-gesture]');
  var reply = $('[data-ask-reply]');
  var avatar = $('[data-ask-avatar]');
  var STAGE = {
    newborn: ['Shishu Krishna', 'Chapter 1', 'a tiny baby, all coos', 'chapter 1'],
    toddler: ['Bal Krishna', 'Chapters 2–5', 'playful and giggly', 'chapters 2 to 5'],
    boy: ['Gopal Krishna', 'Chapters 6–9', 'a cheerful cowherd boy', 'chapters 6 to 9'],
    teen: ['Kishore Krishna', 'Chapters 10–12', 'a brave, caring friend', 'chapters 10 to 12'],
    youth: ['Yuva Krishna', 'Chapters 13–15', 'a calm young prince', 'chapters 13 to 15'],
    adult: ['Parthasarathi', 'Chapters 16–18', 'Arjuna’s teacher', 'chapters 16 to 18']
  };
  var stageEl = $('[data-ask-stage]');

  function pickAge(age) {
    var a = ASK[age];
    if (!a) return;
    tabs.forEach(function (t) { t.setAttribute('aria-pressed', String(t.dataset.age === age)); });
    gesture.textContent = a[0];
    gesture.hidden = !a[0];
    reply.textContent = a[1];
    avatar.src = 'assets/krishna/' + age + '.svg';
    var st = STAGE[age];
    $('[data-ask-stage-img]').src = 'assets/krishna/' + age + '.svg';
    $('[data-ask-stage-name]').textContent = st[0];
    $('[data-ask-stage-span]').textContent = st[1];
    $('[data-ask-stage-tone]').textContent = st[2];
    $('[data-ask-sr]').textContent = st[0] + ', ' + st[3] + ', answers:';
    stageEl.classList.remove('flash');
    void stageEl.offsetWidth;
    stageEl.classList.add('flash');
    bubble.classList.remove('a-fade');
    void bubble.offsetWidth; // restart the fade
    bubble.classList.add('a-fade');
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { pickAge(t.dataset.age); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var next = tabs[(i + d + tabs.length) % tabs.length];
      next.focus();
      pickAge(next.dataset.age);
    });
  });

  /* ---------- FAQ: one open at a time (fallback for browsers without <details name>) ---------- */
  var faqs = $$('.faq details');
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ---------- waitlist form ---------- */
  var form = $('[data-form]');
  var joined = $('[data-joined]');
  var errorEl = $('[data-error]');
  var submitBtn = $('[data-submit]');
  var emailIn = form.elements.email;
  var waIn = form.elements.whatsapp;
  var consentRow = $('[data-consent-row]');

  var ccSel = form.elements.cc;

  // Default country from the visitor's time zone (falls back to India).
  (function guessCountry() {
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
    var iso = TZ[tz] || (CA.test(tz) ? 'CA' : /^America\//.test(tz) ? 'US' : /^Australia\//.test(tz) ? 'AU' : 'IN');
    ccSel.value = iso;
    updatePlaceholder();
  })();

  function dial() { return ccSel.options[ccSel.selectedIndex].getAttribute('data-dial'); }
  function updatePlaceholder() {
    var iso = ccSel.value;
    waIn.placeholder = iso === 'IN' ? '98765 43210' : (dial() === '1' ? '555 123 4567' : 'Your number');
  }
  ccSel.addEventListener('change', function () { updatePlaceholder(); showError(''); });

  function digits(s) { return String(s || '').replace(/\D/g, ''); }

  // Returns { e164: '+919876543210', pretty: '+91 98765 43210' }, {} when empty, or null when invalid.
  function parseWa(raw) {
    var txt = String(raw || '').trim();
    var d = digits(txt);
    if (!d) return {};
    var code, national;
    if (/^(\+|00)/.test(txt)) {             // full international number typed in
      if (txt.indexOf('00') === 0) d = d.slice(2);
      if (d.length < 8 || d.length > 15 || d.charAt(0) === '0') return null;
      return { e164: '+' + d, pretty: '+' + d };
    }
    code = dial();
    national = d;
    var withCode = ccSel.value === 'IN' ? 12 : code === '1' ? 11 : code.length + 8;
    if (national.indexOf(code) === 0 && national.length >= withCode) {
      national = national.slice(code.length);  // they typed the country code without +
    }
    if (code !== '1') national = national.replace(/^0+/, ''); // drop trunk 0 (e.g. UK 07..., India 098...)
    if (ccSel.value === 'IN' && !/^[6-9]\d{9}$/.test(national)) return null;
    if (code === '1' && !/^[2-9]\d{9}$/.test(national)) return null;
    if (national.length < 6 || (code + national).length > 15) return null;
    var pretty = ccSel.value === 'IN' ? national.replace(/(\d{5})(\d{5})/, '$1 $2')
      : code === '1' ? national.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3') : national;
    return { e164: '+' + code + national, pretty: '+' + code + ' ' + pretty };
  }

  function showError(msg, field) {
    errorEl.textContent = msg;
    errorEl.hidden = !msg;
    [emailIn, waIn].forEach(function (f) { f.removeAttribute('aria-invalid'); });
    if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
  }

  waIn.addEventListener('input', function () {
    consentRow.hidden = digits(waIn.value).length === 0;
    showError('');
  });
  emailIn.addEventListener('input', function () { showError(''); });

  var params = new URLSearchParams(location.search);
  var source = params.get('utm_source') || params.get('ref') || (document.referrer ? new URL(document.referrer).hostname : '');

  function siteLink() {
    var S = window.GITA_SARANSH_SETTINGS || {};
    return S.site_url || CFG.SITE_URL || (location.protocol.indexOf('http') === 0 ? location.origin + location.pathname : '');
  }

  // Works with both the new publishable key (sb_publishable_...) and the legacy anon key (eyJ...).
  function supabaseHeaders(extra) {
    var h = extra || {};
    h.apikey = CFG.SUPABASE_ANON_KEY;
    if (/^eyJ/.test(CFG.SUPABASE_ANON_KEY)) h.Authorization = 'Bearer ' + CFG.SUPABASE_ANON_KEY;
    return h;
  }

  function saveSignup(data) {
    if (!CFG.SUPABASE_URL || !CFG.SUPABASE_ANON_KEY) {
      console.warn('[Gita Saransh] Supabase is not configured in config.js. Sign-up not saved:', data);
      return new Promise(function (r) { setTimeout(function () { r({ already: false }); }, 500); });
    }
    return fetch(CFG.SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/rpc/join_waitlist', {
      method: 'POST',
      headers: supabaseHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    }).then(function (res) {
      if (!res.ok) return res.text().then(function (t) { throw new Error(t || res.status); });
      return res.json().then(function (j) { return { already: j === 'updated' }; });
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.elements.website.value) return; // bot

    var email = emailIn.value.trim();
    var wa = parseWa(waIn.value);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      showError('Please enter a valid email so we can reach you.', emailIn); return;
    }
    if (wa === null) {
      showError(ccSel.value === 'IN'
        ? 'Indian WhatsApp numbers have 10 digits. Leave it empty if you prefer email only.'
        : 'That number doesn’t look right for the country you picked. Check it, or leave it empty.', waIn); return;
    }
    showError('');

    var who = $$('input[name="who"]:checked', form).map(function (c) { return c.value; });
    var payload = {
      p_email: email.toLowerCase(),
      p_whatsapp: wa.e164 || null,
      p_wa_consent: !!(wa.e164 && form.elements.wa_consent.checked),
      p_language: form.elements.language.value,
      p_who: who,
      p_source: source || null
    };

    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.textContent = 'Joining…';
    saveSignup(payload).then(function (r) {
      $('[data-shown-email]').textContent = email;
      $('[data-shown-wa]').hidden = !payload.p_wa_consent;
      $('[data-shown-wa-num]').textContent = wa.pretty || '';
      $('[data-joined-title]').textContent = r.already ? 'Your details are updated!' : 'You’re a founding member!';
      var msg = 'I just joined the Gita Saransh waitlist. Recite the Gita and watch little Krishna grow up! ' + siteLink();
      $('[data-share]').href = 'https://wa.me/?text=' + encodeURIComponent(msg.trim());
      form.hidden = true;
      joined.hidden = false;
      $('[data-joined-title]').focus({ preventScroll: true });
      joined.scrollIntoView({ behavior: 'smooth', block: 'center' });
      store('gs-joined', '1');
    }).catch(function (err) {
      console.error(err);
      showError('Something went wrong on our side. Please try again in a minute.');
    }).then(function () {
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
      submitBtn.textContent = 'Join the waitlist';
    });
  });

  $('[data-edit]').addEventListener('click', function () {
    joined.hidden = true;
    form.hidden = false;
    emailIn.focus();
  });

  /* ---------- app preview: growth video ---------- */
  var vid = $('[data-grow-video]');
  var growText = $('[data-grow-text]');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (vid) {
    if (reduceMotion) {
      vid.removeAttribute('loop');
      growText.classList.add('on');
    } else if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { var p = vid.play(); if (p && p.catch) p.catch(function () { growText.classList.add('on'); }); }
          else vid.pause();
        });
      }, { threshold: 0.4 }).observe(vid);
      vid.addEventListener('timeupdate', function () {
        growText.classList.toggle('on', vid.currentTime > 3.3);
      });
    } else {
      growText.classList.add('on');
    }
  }

  var y = $('[data-year]');
  if (y) y.textContent = String(new Date().getFullYear());
})();
