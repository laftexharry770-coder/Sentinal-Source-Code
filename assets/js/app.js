/* ==========================================================================
   app.js — behaviour. Everything you change day to day lives in data.js,
   or in the Manage panel (see README: "Getting into the Manage panel").
   ========================================================================== */
(function () {
  'use strict';

  /* Whether data.js actually loaded. `const` in another script is a global
     binding rather than a window property, so typeof is the only safe way to
     ask. Nothing in this file may assume the answer is yes — see the safety
     net at the bottom. */
  const catalogueLoaded = () =>
    typeof SITE === 'undefined'       ? false :
    typeof PRODUCTS === 'undefined'   ? false :
    typeof CATEGORIES === 'undefined' ? false :
    Boolean(SITE) && Array.isArray(PRODUCTS) && Array.isArray(CATEGORIES);

  const seedProducts   = () => (typeof PRODUCTS === 'undefined'   ? [] : PRODUCTS);
  const seedCategories = () => (typeof CATEGORIES === 'undefined' ? [] : CATEGORIES);

  /* ── Helpers ───────────────────────────────────────────────────────────── */
  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /** Escape anything that comes from data.js before putting it in the DOM. */
  const esc = (value) => String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const digits = (value) => String(value || '').replace(/\D/g, '');

  const money = (amount) => {
    if (amount == null || amount === '') return 'Price on request';
    try {
      return SITE.currency + ' ' + Number(amount).toLocaleString(SITE.locale || 'en-US');
    } catch (e) {
      return SITE.currency + ' ' + amount;
    }
  };

  const prettyPhone = (value) => {
    const d = digits(value);
    if (d.length === 12) return '+' + d.slice(0, 3) + ' ' + d.slice(3, 6) + ' ' + d.slice(6, 9) + ' ' + d.slice(9);
    return '+' + d;
  };

  /* Sales contacts */
  const salesNumber = () => digits(SITE.whatsapp || (SITE.phones && SITE.phones[0] && SITE.phones[0].number));
  const waLink   = (text) => 'https://wa.me/' + salesNumber() + (text ? '?text=' + encodeURIComponent(text) : '');
  const telLink  = (value) => 'tel:+' + digits(value || (SITE.phones && SITE.phones[0] && SITE.phones[0].number));
  const mailLink = (subject, body, address) =>
    'mailto:' + (address || SITE.email) +
    '?subject=' + encodeURIComponent(subject || ('Inquiry — ' + SITE.brand)) +
    (body ? '&body=' + encodeURIComponent(body) : '');

  /* Repair desk contacts — a separate line and inbox */
  const repairs      = () => SITE.repairs || {};
  const repairNumber = () => digits(repairs().whatsapp || repairs().phone || salesNumber());
  const repairEmail  = () => repairs().email || SITE.email;
  const repairWa     = (text) => 'https://wa.me/' + repairNumber() + (text ? '?text=' + encodeURIComponent(text) : '');

  /* ── Placeholder artwork (used when a product has no photo) ─────────────── */
  const ICONS = {
    computers: '<svg viewBox="0 0 64 48"><rect x="6" y="4" width="52" height="34" rx="3"/><path d="M2 44h60M26 38h12"/></svg>',
    'computer-accessories': '<svg viewBox="0 0 64 48"><rect x="4" y="10" width="56" height="28" rx="4"/><path d="M12 18h8M24 18h8M36 18h8M48 18h4M12 26h4M20 26h24M48 26h4M20 33h24"/></svg>',
    phones: '<svg viewBox="0 0 64 48"><rect x="21" y="2" width="22" height="44" rx="4"/><path d="M28 7h8M29 41h6"/></svg>',
    'phone-accessories': '<svg viewBox="0 0 64 48"><rect x="14" y="8" width="36" height="32" rx="6"/><path d="M22 20v8M42 20v8M28 16h8v16h-8z"/></svg>',
    'other-tech': '<svg viewBox="0 0 64 48"><rect x="10" y="8" width="44" height="30" rx="3"/><path d="M20 44h24M26 38v6M38 38v6M22 18h20M22 26h12"/></svg>',
    fallback: '<svg viewBox="0 0 64 48"><rect x="8" y="8" width="48" height="32" rx="4"/><path d="M8 30l12-10 10 8 8-6 18 12"/></svg>'
  };
  const art = (product) => ICONS[product.category] || ICONS.fallback;

  const mainImage = (product) => (product.images && product.images[0]) ||
    (product.spin && product.spin[0]) || '';

  const media = (product, className) => {
    const src = mainImage(product);
    if (!src) return '<div class="' + (className || 'ph') + '">' + art(product) + '</div>';
    // A frame borrowed from the 360 set is a cut-out, so show it whole.
    const fromSpin = !(product.images && product.images.length);
    return '<img class="' + (fromSpin ? 'is-spin' : '') + '" src="' + esc(src) +
      '" alt="' + esc(product.name) + '" loading="lazy" />';
  };

  const SERVICE_ICONS = {
    computer: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20M10 16h4"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/></svg>',
    drive: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg>',
    network: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5V12M12 12L6.5 16.5M12 12l5.5 4.5"/></svg>',
    fallback: '<svg viewBox="0 0 24 24"><path d="M14.7 6.3a4 4 0 0 1 5 5l-8.4 8.4a2.8 2.8 0 0 1-4-4z"/><path d="M6 6l3 3"/></svg>'
  };

  const STOCK = {
    in:  { text: 'In stock',         cls: '',    label: 'In stock' },
    low: { text: 'Low stock',        cls: 'low', label: 'Low stock' },
    out: { text: 'Order on request', cls: 'out', label: 'Out of stock' }
  };

  /* Shown at the bottom of the Manage panel so you can tell at a glance which
     version your phone is actually running. Keep it in step with
     CACHE_VERSION in service-worker.js. */
  const BUILD = 'v19';

  /* ── Storage ───────────────────────────────────────────────────────────── */
  const SHOP_KEY    = 'homcom-shop';       // { products, categories }
  const PUBLISHED_KEY = 'homcom-published'; // fingerprint of the last export
  const INQUIRY_KEY = 'homcom-inquiry';
  const UNLOCK_KEY  = 'homcom-unlocked';
  const MAX_COMPARE = 4;
  const OFFERS_KEY  = '__offers';          // the "On offer" filter chip

  /** Fill in fields older data may not have, so the rest of the code is simple. */
  function normalise(product) {
    const p = Object.assign({}, product);
    p.images = Array.isArray(p.images) ? p.images.slice() : [];
    if (p.image && !p.images.length) p.images = [p.image];
    delete p.image;
    p.spin = Array.isArray(p.spin) ? p.spin.slice() : [];
    p.price = p.price === '' || p.price == null ? null : Number(p.price);
    p.wasPrice = p.wasPrice === '' || p.wasPrice == null ? null : Number(p.wasPrice);
    p.stock = STOCK[p.stock] ? p.stock : 'in';
    p.specs = p.specs && typeof p.specs === 'object' ? p.specs : {};
    p.updated = Number(p.updated) || null;   // when the shop last changed it
    return p;
  }

  /** Mark a product as just changed, so it moves to the front of its category. */
  function touch(product) {
    if (product) product.updated = Date.now();
    return product;
  }

  let catalogue  = [];
  let categories = [];
  /* Set by loadShop when this device hands back to the published catalogue.
     Declared up here because loadShop runs on the next line. */
  let wentLive = false;
  loadShop();

  /* A short fingerprint of a catalogue. Two catalogues with the same products,
     prices, photos and categories produce the same string, so we can tell
     whether what the site is serving is the same thing this device last
     exported — without keeping a second copy of it to compare against. */
  function signature(products, cats) {
    const text = JSON.stringify({
      p: (products || []).map((p) => [
        p.id, p.name, p.category, p.price, p.wasPrice, p.stock, p.desc,
        (p.images || []).join(''), JSON.stringify(p.specs || {})
      ]),
      c: (cats || []).filter((c) => c.key !== 'all').map((c) => [c.key, c.label])
    });
    let h = 5381;
    for (let i = 0; i < text.length; i++) h = ((h * 33) ^ text.charCodeAt(i)) >>> 0;
    return h.toString(36) + '-' + text.length.toString(36);
  }

  /* Declarations, not arrow constants: loadShop runs before this point in the
     file and calls both of them. */
  function publishedMark() {
    try { return localStorage.getItem(PUBLISHED_KEY); } catch (e) { return null; }
  }

  /** Forget this device's private copy and follow the published catalogue. */
  function forgetLocalCopy() {
    try {
      localStorage.removeItem(SHOP_KEY);
      localStorage.removeItem(PUBLISHED_KEY);
    } catch (e) {}
  }

  function loadShop() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(SHOP_KEY) || 'null'); } catch (e) {}

    const seeded = clone(seedProducts()).map(normalise);
    const seedCats = clone(seedCategories());

    /* Changes are saved on this device first and published second, and the
       private copy used to sit on top of the published catalogue forever,
       hiding every later change from this phone. So it steps aside — but only
       once it has become identical to what the site is serving.

       Comparing the copy against the live catalogue, rather than against a
       note of what was last exported, is what makes this safe: if the two
       already say the same thing, dropping the copy cannot change what you
       see, so nothing can be lost. Anything you have added since — including
       while an upload was still in flight — makes them differ, and the copy
       stays until that reaches the site too. */
    const savedProducts = saved && Array.isArray(saved.products) ? saved.products : null;
    if (savedProducts && savedProducts.length &&
        signature(savedProducts.map(normalise), saved.categories) === signature(seeded, seedCats)) {
      forgetLocalCopy();
      saved = null;
      wentLive = true;
    }

    catalogue = (saved && Array.isArray(saved.products) && saved.products.length
      ? saved.products.map(normalise) : seeded);
    categories = saved && Array.isArray(saved.categories) && saved.categories.length
      ? clone(saved.categories) : seedCats;
    if (!categories.some((c) => c.key === 'all')) {
      categories.unshift({ key: 'all', label: 'Everything' });
    }
  }

  function saveShop() {
    try {
      localStorage.setItem(SHOP_KEY, JSON.stringify({ products: catalogue, categories: categories }));
      /* The file you last downloaded no longer matches this device, so stop
         saying an upload of it is pending. */
      localStorage.removeItem(PUBLISHED_KEY);
      return true;
    } catch (e) {
      toast('Storage is full — remove a photo or two, or use file paths instead of uploads');
      return false;
    }
  }

  const isEdited = () => { try { return localStorage.getItem(SHOP_KEY) != null; } catch (e) { return false; } };
  const byId = (id) => catalogue.find((p) => p.id === id);

  const catLabel = (key) => {
    const found = categories.find((c) => c.key === key);
    return found ? found.label : key;
  };

  /** How much of the browser's storage the saved shop is using, roughly. */
  function storageUsed() {
    try {
      const bytes = (localStorage.getItem(SHOP_KEY) || '').length;
      return { bytes: bytes, mb: (bytes / 1048576).toFixed(1) };
    } catch (e) { return { bytes: 0, mb: '0.0' }; }
  }

  const state = {
    category: 'all',
    query: '',
    sort: 'featured',
    inquiry: loadInquiry(),
    compare: [],
    editing: null,      // product id being edited, or 'new'
    draft: null         // images/spin held while the editor is open
  };

  function loadInquiry() {
    try {
      const raw = JSON.parse(localStorage.getItem(INQUIRY_KEY) || '[]');
      return Array.isArray(raw) ? raw.filter((id) => catalogue.some((p) => p.id === id)) : [];
    } catch (e) { return []; }
  }
  function saveInquiry() {
    try { localStorage.setItem(INQUIRY_KEY, JSON.stringify(state.inquiry)); } catch (e) {}
  }

  const stockOf = (product) => (STOCK[product.stock] ? product.stock : 'in');

  /** Percentage off, or 0 when the product isn't on offer. */
  function discount(product) {
    const was = Number(product.wasPrice);
    const now = Number(product.price);
    if (!was || !now || was <= now) return 0;
    return Math.round(((was - now) / was) * 100);
  }
  const saving = (product) => (discount(product) ? Number(product.wasPrice) - Number(product.price) : 0);

  const productUrl = (id) => location.origin + location.pathname + '#p=' + encodeURIComponent(id);

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise((resolve, reject) => {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      document.body.appendChild(area);
      area.select();
      try { document.execCommand('copy'); resolve(); } catch (e) { reject(e); }
      document.body.removeChild(area);
    });
  }

  /* ── Time, opening hours and contact hours ─────────────────────────────── */
  const DAYS = [
    { key: 'mon', name: 'Monday',    short: 'Mon' },
    { key: 'tue', name: 'Tuesday',   short: 'Tue' },
    { key: 'wed', name: 'Wednesday', short: 'Wed' },
    { key: 'thu', name: 'Thursday',  short: 'Thu' },
    { key: 'fri', name: 'Friday',    short: 'Fri' },
    { key: 'sat', name: 'Saturday',  short: 'Sat' },
    { key: 'sun', name: 'Sunday',    short: 'Sun' }
  ];

  const toMinutes = (hhmm) => {
    const parts = String(hhmm || '').split(':');
    return (Number(parts[0]) || 0) * 60 + (Number(parts[1]) || 0);
  };

  const clockLabel = (hhmm) => {
    const total = toMinutes(hhmm);
    const hour = Math.floor(total / 60);
    const minute = total % 60;
    const suffix = hour >= 12 ? 'pm' : 'am';
    const twelve = hour % 12 === 0 ? 12 : hour % 12;
    return twelve + (minute ? ':' + String(minute).padStart(2, '0') : '') + suffix;
  };

  /** Today's weekday and the time, in the shop's own timezone. */
  function shopNow() {
    const options = { weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false };
    if (SITE.timezone) options.timeZone = SITE.timezone;
    let parts;
    try {
      parts = new Intl.DateTimeFormat('en-GB', options).formatToParts(new Date());
    } catch (e) {
      parts = new Intl.DateTimeFormat('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false })
        .formatToParts(new Date());
    }
    const get = (type) => (parts.find((p) => p.type === type) || {}).value;
    const weekday = String(get('weekday') || '').slice(0, 3).toLowerCase();
    const index = DAYS.findIndex((d) => d.key === weekday);
    const hour = Number(get('hour')) % 24;   // midnight can come back as "24"
    return { index: index < 0 ? 0 : index, minutes: hour * 60 + Number(get('minute') || 0) };
  }

  const rangeFor = (index) => {
    const range = (SITE.hours || {})[DAYS[(index + 7) % 7].key];
    return Array.isArray(range) && range.length === 2 ? range : null;
  };

  /** Is the shop open right now, and what happens next? */
  function openStatus() {
    const now = shopNow();
    const today = rangeFor(now.index);

    if (today) {
      const start = toMinutes(today[0]);
      const end = toMinutes(today[1]);
      if (now.minutes >= start && now.minutes < end) {
        return { open: true, label: 'Open now', detail: 'Closes ' + clockLabel(today[1]) };
      }
      if (now.minutes < start) {
        return { open: false, label: 'Closed', detail: 'Opens ' + clockLabel(today[0]) + ' today' };
      }
    }
    for (let ahead = 1; ahead <= 7; ahead++) {
      const range = rangeFor(now.index + ahead);
      if (!range) continue;
      const day = DAYS[(now.index + ahead) % 7];
      const when = ahead === 1 ? 'tomorrow' : day.name;
      return { open: false, label: 'Closed', detail: 'Opens ' + when + ' ' + clockLabel(range[0]) };
    }
    return { open: false, label: 'Closed', detail: '' };
  }

  /** Are calls, texts and emails being answered right now? */
  function contactStatus() {
    const window_ = SITE.contactHours;
    if (!Array.isArray(window_) || window_.length !== 2) {
      return { open: true, label: 'Message us', detail: '' };
    }
    const now = shopNow();
    const from = toMinutes(window_[0]);
    const to = toMinutes(window_[1]);
    if (now.minutes >= from && now.minutes < to) {
      return { open: true, label: 'Answering now', detail: 'until ' + clockLabel(window_[1]) };
    }
    return {
      open: false,
      label: 'Outside contact hours',
      detail: 'we reply from ' + clockLabel(window_[0])
    };
  }

  /** "Mon – Fri 7am – 10pm" rows, merging days that match. */
  function hoursRows() {
    const rows = [];
    DAYS.forEach((day, i) => {
      const range = (SITE.hours || {})[day.key];
      const text = Array.isArray(range) && range.length === 2
        ? clockLabel(range[0]) + ' – ' + clockLabel(range[1])
        : 'Closed';
      const last = rows[rows.length - 1];
      if (last && last.text === text) {
        last.to = day.short;
        last.indexes.push(i);
      } else {
        rows.push({ from: day.short, to: null, text: text, indexes: [i] });
      }
    });
    return rows.map((r) => ({ days: r.to ? r.from + ' – ' + r.to : r.from, text: r.text, indexes: r.indexes }));
  }

  function paintHours() {
    const shop = openStatus();
    const contact = contactStatus();
    const now = shopNow();

    $$('[data-status-pill]').forEach((pill) => {
      pill.classList.toggle('is-open', shop.open);
      pill.classList.toggle('is-closed', !shop.open);
      pill.innerHTML = '<span class="status-dot"></span><span class="status-text">' + esc(shop.label) + '</span>';
      pill.title = shop.label + (shop.detail ? ' · ' + shop.detail : '');
    });
    $$('[data-status-detail]').forEach((el) => { el.textContent = shop.detail; });
    $$('[data-status-label]').forEach((el) => { el.textContent = shop.label; });

    $$('[data-contact-pill]').forEach((pill) => {
      pill.classList.toggle('is-open', contact.open);
      pill.classList.toggle('is-closed', !contact.open);
      pill.innerHTML = '<span class="status-dot"></span><span class="status-text">' + esc(contact.label) + '</span>';
    });
    $$('[data-contact-status]').forEach((el) => {
      el.textContent = contact.label + (contact.detail ? ' · ' + contact.detail : '');
      el.classList.toggle('is-closed', !contact.open);
    });
    $$('[data-site="contactNote"]').forEach((el) => {
      el.textContent = SITE.contactNote || '';
      el.hidden = !SITE.contactNote;
    });
    $$('[data-contact-window]').forEach((el) => {
      el.textContent = Array.isArray(SITE.contactHours)
        ? clockLabel(SITE.contactHours[0]) + ' – ' + clockLabel(SITE.contactHours[1]) + ', every day'
        : '';
    });

    const list = $('#hoursList');
    if (list) {
      list.innerHTML = hoursRows().map((row) =>
        '<li' + (row.indexes.indexOf(now.index) > -1 ? ' class="today"' : '') + '>' +
          '<span>' + esc(row.days) + '</span><span>' + esc(row.text) + '</span>' +
        '</li>').join('');
    }
    const note = $('[data-site="holidayNote"]');
    if (note) {
      note.textContent = SITE.holidayNote || '';
      note.hidden = !SITE.holidayNote;
    }
  }

  /* ── Site details ──────────────────────────────────────────────────────── */
  function paintSite() {
    document.title = SITE.brand + ' — Computers, Phones, Accessories & Repairs';
    $$('[data-site="brand"]').forEach((el) => { el.textContent = SITE.brand; });
    $$('[data-site="tagline"]').forEach((el) => { el.textContent = SITE.tagline; });
    $$('[data-site="email"]').forEach((el) => { el.textContent = SITE.email; });
    $$('[data-site="location"]').forEach((el) => { el.textContent = SITE.location; });
    $$('[data-site="repairEmail"]').forEach((el) => { el.textContent = repairEmail(); });
    $$('[data-site="repairPhone"]').forEach((el) => { el.textContent = prettyPhone(repairs().phone); });

    const hello = 'Hi ' + SITE.brand + ', I saw your website and I have a question about ';

    const phoneList = $('#phoneList');
    if (phoneList) {
      phoneList.innerHTML = (SITE.phones || []).map((phone, i) =>
        '<a class="contact-card" href="' + esc(telLink(phone.number)) + '">' +
          '<span class="contact-icon">' +
            '<svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>' +
          '</span>' +
          '<span class="contact-body">' +
            '<strong>' + esc(phone.label || (i === 0 ? 'Call us' : 'Alternative line')) + '</strong>' +
            '<span>' + esc(prettyPhone(phone.number)) + '</span>' +
            '<em data-contact-status></em>' +
          '</span>' +
          '<svg class="contact-arrow" viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg>' +
        '</a>').join('');
    }

    const wa = $('#cardWhatsapp');
    if (wa) {
      wa.href = waLink(hello + 'one of your products.');
      const number = $('[data-site="whatsappNumber"]');
      if (number) number.textContent = prettyPhone(salesNumber());
    }
    const mail = $('#cardEmail');
    if (mail) mail.href = mailLink('Product inquiry', hello);

    const fWa = $('[data-site="linkWhatsapp"]');
    if (fWa) fWa.href = waLink(hello + 'one of your products.');
    const fTel = $('[data-site="linkPhone"]');
    if (fTel) fTel.href = telLink();
    const fMail = $('[data-site="linkEmail"]');
    if (fMail) fMail.href = mailLink('Product inquiry', hello);

    // Repair desk
    const repairAsk = 'Hi ' + SITE.brand + ', I need a repair. My device is ';
    const repairCta = $('#repairCta');
    if (repairCta) repairCta.href = repairWa(repairAsk);
    const repairWaCard = $('#repairWhatsapp');
    if (repairWaCard) repairWaCard.href = repairWa(repairAsk);
    const repairCall = $('#repairCall');
    if (repairCall) repairCall.href = telLink(repairs().phone);
    const repairMail = $('#repairEmail');
    if (repairMail) repairMail.href = mailLink('Repair request', repairAsk, repairEmail());

    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();

    paintHours();
    paintMap();
  }

  /* ── Google Maps ───────────────────────────────────────────────────────── */
  function paintMap() {
    const query = encodeURIComponent(SITE.mapQuery || SITE.address || SITE.location || '');
    if (!query) return;

    const frame = $('#mapFrame');
    if (frame) frame.src = 'https://www.google.com/maps?q=' + query + '&hl=en&z=17&output=embed';

    const open = $('#mapOpen');
    if (open) open.href = 'https://www.google.com/maps/search/?api=1&query=' + query;

    const directions = $('#mapDirections');
    if (directions) directions.href = 'https://www.google.com/maps/dir/?api=1&destination=' + query;

    $$('[data-site="address"]').forEach((el) => { el.textContent = SITE.address || SITE.location; });
    const note = $('[data-site="mapNote"]');
    if (note) {
      note.textContent = SITE.mapNote || '';
      note.hidden = !SITE.mapNote;
    }
  }

  /* ── Repairs ───────────────────────────────────────────────────────────── */
  function paintServices() {
    const wrap = $('#services');
    if (!wrap || typeof SERVICES === 'undefined') return;

    wrap.innerHTML = SERVICES.map((service) => {
      const ask = 'Hi ' + SITE.brand + ', I need help with ' + service.name.toLowerCase() + '. My device is ';
      return '<article class="service reveal">' +
        '<span class="service-icon">' + (SERVICE_ICONS[service.icon] || SERVICE_ICONS.fallback) + '</span>' +
        '<h3>' + esc(service.name) + '</h3>' +
        '<p>' + esc(service.desc) + '</p>' +
        '<ul>' + (service.items || []).map((item) =>
          '<li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>' +
          esc(item) + '</li>').join('') + '</ul>' +
        (service.turnaround ? '<p class="service-turnaround">' + esc(service.turnaround) + '</p>' : '') +
        '<a class="btn btn-ghost btn-small" target="_blank" rel="noopener" href="' + esc(repairWa(ask)) + '">' +
          'Ask the repair desk</a>' +
      '</article>';
    }).join('');
  }

  /* ── Filter chips ──────────────────────────────────────────────────────── */
  function paintChips() {
    const offers = catalogue.filter(discount).length;
    const chips = categories.map((c) => {
      const n = c.key === 'all' ? catalogue.length : catalogue.filter((p) => p.category === c.key).length;
      if (c.key !== 'all' && n === 0) return '';      // hide empty categories from customers
      return '<button type="button" class="chip" data-cat="' + esc(c.key) + '" aria-pressed="' +
        (state.category === c.key) + '">' + esc(c.label) + '<span class="chip-n">' + n + '</span></button>';
    });
    if (offers) {
      chips.push('<button type="button" class="chip chip-offer" data-cat="' + OFFERS_KEY + '" aria-pressed="' +
        (state.category === OFFERS_KEY) + '">On offer<span class="chip-n">' + offers + '</span></button>');
    }
    $('#chips').innerHTML = chips.join('');
  }

  function paintInterestOptions() {
    const select = $('#fInterest');
    if (!select) return;
    select.innerHTML =
      '<option value="General question">General question</option>' +
      categories.filter((c) => c.key !== 'all')
        .map((c) => '<option value="' + esc(c.label) + '">' + esc(c.label) + '</option>').join('') +
      '<option value="Repair">A repair</option>' +
      '<option value="Something not listed">Something not listed</option>';
  }

  /* ── Catalogue ─────────────────────────────────────────────────────────── */
  function inCategory(product) {
    if (state.category === 'all') return true;
    if (state.category === OFFERS_KEY) return discount(product) > 0;
    return product.category === state.category;
  }

  function visibleProducts() {
    // The catalogue box understands the same words as the big search.
    const tokens = tokenise(state.query);
    let list = catalogue.filter((p) => {
      if (!inCategory(p)) return false;
      if (!tokens.length) return true;
      const haystack = productHaystack(p);
      return tokens.every((token) => matches(haystack, token));
    });

    const price = (p) => (p.price == null ? Infinity : Number(p.price));
    if (state.sort === 'featured')   list = byNewestChange(list);
    if (state.sort === 'price-asc')  list = list.slice().sort((a, b) => price(a) - price(b));
    if (state.sort === 'price-desc') list = list.slice().sort((a, b) => price(b) - price(a));
    if (state.sort === 'name')       list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
    if (state.sort === 'discount')   list = list.slice().sort((a, b) => discount(b) - discount(a));
    return list;
  }

  /* Anything the shop has just added, re-priced or changed the stock on comes
     first — in whichever category you are looking at, since the list is already
     filtered by the time it gets here. Products that have never been edited
     keep the order they have in data.js, below the recent ones. */
  function byNewestChange(list) {
    const original = new Map(catalogue.map((p, i) => [p.id, i]));
    return list.slice().sort((a, b) =>
      (b.updated || 0) - (a.updated || 0) ||
      (original.get(a.id) - original.get(b.id)));
  }

  function priceHTML(p) {
    const off = discount(p);
    /* The percentage is repeated here, next to the price, and not left only to
       the badge on the photo — that badge can be missed, sits away from the
       number it refers to, and is the first thing to go if anything paints
       over the image. */
    return '<span class="price">' +
      (off ? '<s>' + esc(money(p.wasPrice)) + '</s> ' : '') +
      esc(money(p.price)) +
      (p.price != null
        ? (off ? '<small class="save">save ' + esc(money(saving(p))) +
                   ' <span class="off">−' + off + '%</span></small>'
               : '<small class="vat">incl. VAT</small>')
        : '') +
    '</span>';
  }

  function cardHTML(p, index) {
    const stock = STOCK[stockOf(p)];
    const added = state.inquiry.includes(p.id);
    const comparing = state.compare.includes(p.id);
    const off = discount(p);
    const tagCls = p.tag === 'Refurbished' ? 'tag warn' : 'tag';
    const keySpecs = Object.values(p.specs || {}).slice(0, 3);

    return (
      '<article class="card" data-id="' + esc(p.id) + '" tabindex="0" role="button" ' +
        'aria-label="View details for ' + esc(p.name) + '" style="animation-delay:' + Math.min(index * 35, 400) + 'ms">' +
        '<div class="card-media">' +
          (off ? '<span class="tag offer">−' + off + '%</span>'
               : (p.tag ? '<span class="' + tagCls + '">' + esc(p.tag) + '</span>' : '')) +
          (p.spin && p.spin.length > 1 ? '<span class="spin-badge" title="360° view">360°</span>' : '') +
          media(p) +
        '</div>' +
        '<div class="card-body">' +
          '<span class="card-cat">' + esc(catLabel(p.category)) + '</span>' +
          '<h3 class="card-title">' + esc(p.name) + '</h3>' +
          '<p class="card-desc">' + esc(p.desc) + '</p>' +
          (keySpecs.length
            ? '<div class="card-specs">' + keySpecs.map((s) => '<span>' + esc(s) + '</span>').join('') + '</div>'
            : '') +
          '<span class="stock ' + stock.cls + '">' + stock.text + '</span>' +
          '<div class="card-foot">' +
            priceHTML(p) +
            '<span class="card-tools">' +
              '<button type="button" class="card-add' + (comparing ? ' compare-on' : '') + '" data-compare="' + esc(p.id) + '" ' +
                'aria-pressed="' + comparing + '" aria-label="' + (comparing ? 'Remove from' : 'Add to') + ' comparison" ' +
                'title="' + (comparing ? 'Remove from comparison' : 'Compare this') + '">' +
                '<svg viewBox="0 0 24 24"><path d="M4 7h6M4 17h6M16 4v16M13 7l3-3 3 3M13 17l3 3 3-3"/></svg>' +
              '</button>' +
              '<button type="button" class="card-add' + (added ? ' added' : '') + '" data-add="' + esc(p.id) + '" ' +
                'aria-label="' + (added ? 'Remove from' : 'Add to') + ' inquiry list" ' +
                'title="' + (added ? 'In your inquiry list' : 'Add to inquiry') + '">' +
                (added
                  ? '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>'
                  : '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>') +
              '</button>' +
            '</span>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function paintGrid() {
    const list = visibleProducts();
    const grid = $('#grid');
    const empty = $('#empty');

    grid.innerHTML = list.map(cardHTML).join('');
    empty.hidden = list.length > 0;
    grid.hidden = list.length === 0;

    const total = state.category === 'all' ? catalogue.length : catalogue.filter(inCategory).length;
    $('#resultCount').textContent = list.length
      ? 'Showing ' + list.length + ' of ' + total + ' product' + (total === 1 ? '' : 's')
      : '';

    $('#clearSearch').hidden = !state.query;
    const stat = $('#statCount');
    if (stat) stat.textContent = catalogue.length;
    const offerStat = $('#statOffers');
    if (offerStat) offerStat.textContent = catalogue.filter(discount).length;
  }

  /* ── Product viewer: photo gallery + 360° spin ─────────────────────────── */
  const modal = $('#modal');
  let lastFocused = null;
  let spinner = null;      // teardown for the active 360 viewer

  function viewerHTML(p) {
    const photos = p.images || [];
    const spin = p.spin || [];
    const hasSpin = spin.length > 1;

    if (!photos.length && !hasSpin) {
      return '<div class="viewer"><div class="ph">' + art(p) + '</div></div>';
    }

    const startSpin = !photos.length && hasSpin;
    return '<div class="viewer" data-mode="' + (startSpin ? 'spin' : 'photo') + '">' +
      (photos.length
        ? '<img class="viewer-main" id="viewerMain" src="' + esc(photos[0]) + '" alt="' + esc(p.name) + '" />'
        : '') +
      (hasSpin
        ? '<div class="spin-stage" id="spinStage">' +
            '<img id="spinFrame" src="' + esc(spin[0]) + '" alt="' + esc(p.name) + ', 360 degree view" draggable="false" />' +
            '<span class="spin-hint" id="spinHint">' +
              '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 1 2.3 5.6"/><path d="M4 8v4h4"/></svg>' +
              'Drag to spin' +
            '</span>' +
            '<button type="button" class="spin-play" id="spinPlay" aria-label="Play or pause the rotation">' +
              '<svg class="i-pause" viewBox="0 0 24 24"><path d="M9 5v14M15 5v14"/></svg>' +
              '<svg class="i-play" viewBox="0 0 24 24"><path d="M7 4l12 8-12 8z"/></svg>' +
            '</button>' +
          '</div>'
        : '') +
      (photos.length && hasSpin
        ? '<div class="viewer-tabs">' +
            '<button type="button" class="vt" data-view="photo" aria-pressed="true">Photos</button>' +
            '<button type="button" class="vt" data-view="spin" aria-pressed="false">360° view</button>' +
          '</div>'
        : '') +
      (photos.length > 1
        ? '<div class="thumbs">' + photos.map((src, i) =>
            '<button type="button" class="thumb' + (i === 0 ? ' on' : '') + '" data-photo="' + esc(src) + '" ' +
              'aria-label="Photo ' + (i + 1) + '"><img src="' + esc(src) + '" alt="" /></button>').join('') +
          '</div>'
        : '') +
    '</div>';
  }

  /** Drag, arrow keys and autoplay over a sequence of frames. */
  function startSpinner(frames) {
    const stage = $('#spinStage');
    const image = $('#spinFrame');
    if (!stage || !image || frames.length < 2) return null;

    const MS_PER_FRAME = 90;      // how fast the product turns, in real time
    let index = 0;
    let dragging = false;
    let startX = 0;
    let startIndex = 0;
    let raf = 0;
    let previous = 0;
    let carried = 0;              // time left over between frames

    // Preload so dragging doesn't flicker on the first turn.
    frames.forEach((src) => { const img = new Image(); img.src = src; });

    const show = (i) => {
      index = ((i % frames.length) + frames.length) % frames.length;
      image.src = frames[index];
    };

    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
      previous = 0;
      carried = 0;
      stage.classList.remove('playing');
    };

    /* Advance by elapsed time, not by frames drawn: the product turns at the
       same speed on a 60Hz phone, a 120Hz tablet and a 144Hz monitor. */
    const tick = (now) => {
      if (!previous) previous = now;
      let elapsed = now - previous;
      previous = now;
      // A backgrounded tab, or a slow frame, must not send it spinning.
      if (elapsed > 250) elapsed = MS_PER_FRAME;
      carried += elapsed;
      let steps = Math.floor(carried / MS_PER_FRAME);
      carried -= steps * MS_PER_FRAME;
      if (steps > 0) show(index + Math.min(steps, 4));
      raf = requestAnimationFrame(tick);
    };

    const play = () => {
      if (raf) return;
      stage.classList.add('playing');
      previous = 0;
      carried = 0;
      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', onVisibility);

    const onDown = (e) => {
      dragging = true;
      stop();
      stage.classList.add('grabbing');
      const hint = $('#spinHint');
      if (hint) hint.classList.add('gone');
      startX = (e.touches ? e.touches[0].clientX : e.clientX);
      startIndex = index;
      e.preventDefault();
    };
    const onMove = (e) => {
      if (!dragging) return;
      const x = (e.touches ? e.touches[0].clientX : e.clientX);
      const step = Math.max(6, stage.clientWidth / frames.length / 1.6);
      show(startIndex - Math.round((x - startX) / step));
      e.preventDefault();
    };
    const onUp = () => { dragging = false; stage.classList.remove('grabbing'); };

    stage.addEventListener('mousedown', onDown);
    stage.addEventListener('touchstart', onDown, { passive: false });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);

    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  { stop(); show(index - 1); }
      if (e.key === 'ArrowRight') { stop(); show(index + 1); }
    };
    document.addEventListener('keydown', onKey);

    const playBtn = $('#spinPlay');
    if (playBtn) playBtn.addEventListener('click', () => (raf ? stop() : play()));

    play();
    // One full turn to show it moves, then hand control to the customer.
    setTimeout(stop, frames.length * MS_PER_FRAME + 200);

    return function teardown() {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
      stage.removeEventListener('mousedown', onDown);
      stage.removeEventListener('touchstart', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
      document.removeEventListener('keydown', onKey);
    };
  }

  function openModal(id) {
    const p = byId(id);
    if (!p) return;
    const stock = STOCK[stockOf(p)];
    const added = state.inquiry.includes(p.id);
    const comparing = state.compare.includes(p.id);
    const off = discount(p);
    const askText = 'Hi ' + SITE.brand + ', I\'m interested in the ' + p.name +
      ' (' + money(p.price) + '). Is it available?';

    $('#modalBody').innerHTML =
      '<div class="modal-grid">' +
        '<div class="modal-media">' + viewerHTML(p) + '</div>' +
        '<div class="modal-info">' +
          '<span class="card-cat">' + esc(catLabel(p.category)) + '</span>' +
          '<h3 id="modalTitle">' + esc(p.name) + '</h3>' +
          '<p class="modal-price">' +
            (off ? '<s>' + esc(money(p.wasPrice)) + '</s> ' : '') + esc(money(p.price)) +
            (off ? ' <span class="pill-lowest">Save ' + esc(money(saving(p))) + ' · ' + off + '% off</span>' : '') +
          '</p>' +
          '<span class="stock ' + stock.cls + '">' + stock.text + '</span>' +
          '<p class="modal-desc">' + esc(p.desc) + '</p>' +
          '<ul class="specs">' +
            Object.entries(p.specs || {}).map(([k, v]) =>
              '<li><span class="k">' + esc(k) + '</span><span class="v">' + esc(v) + '</span></li>').join('') +
          '</ul>' +
          '<div class="modal-actions">' +
            '<a class="btn btn-wa" href="' + esc(waLink(askText)) + '" target="_blank" rel="noopener">' +
              '<svg viewBox="0 0 24 24"><path d="M20.5 11.6A8.4 8.4 0 0 1 7.9 19l-4.4 1.2 1.2-4.3A8.4 8.4 0 1 1 20.5 11.6z"/></svg>' +
              'Ask on WhatsApp</a>' +
            '<button type="button" class="btn btn-ghost" data-add="' + esc(p.id) + '">' +
              (added ? 'In your inquiry list' : 'Add to inquiry') + '</button>' +
            '<button type="button" class="btn btn-ghost" data-compare="' + esc(p.id) + '">' +
              (comparing ? 'In comparison' : 'Compare') + '</button>' +
            '<a class="btn btn-ghost" href="' + esc(mailLink('Inquiry: ' + p.name, askText)) + '">Email instead</a>' +
          '</div>' +
          '<p class="modal-note" data-contact-status></p>' +
          '<div class="share-row">' +
            '<span class="share-label">Direct link to this product</span>' +
            '<div class="share-line">' +
              '<code>' + esc(productUrl(p.id)) + '</code>' +
              '<button type="button" class="btn btn-ghost btn-small" data-copy="' + esc(p.id) + '">Copy</button>' +
            '</div>' +
            '<div class="share-actions">' +
              '<a class="btn btn-ghost btn-small" target="_blank" rel="noopener" href="' +
                esc('https://wa.me/?text=' + encodeURIComponent(p.name + ' — ' + money(p.price) + '\n' + productUrl(p.id))) +
                '">Share on WhatsApp</a>' +
              '<a class="btn btn-ghost btn-small" href="' +
                esc(mailLink(p.name + ' — ' + SITE.brand,
                  p.name + '\n' + money(p.price) + '\n\n' + productUrl(p.id))) + '">Share by email</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('no-scroll');
    if (history.replaceState) history.replaceState(null, '', '#p=' + encodeURIComponent(p.id));

    if (spinner) { spinner(); spinner = null; }
    if (p.spin && p.spin.length > 1) spinner = startSpinner(p.spin);
    paintHours();   // the "answering now" line inside the modal

    const close = $('.modal-close', modal);
    if (close) close.focus();
  }

  function closeModal() {
    if (spinner) { spinner(); spinner = null; }
    modal.hidden = true;
    if (history.replaceState && location.hash.indexOf('#p=') === 0) {
      history.replaceState(null, '', location.pathname + location.search);
    }
    if (!$('#drawer').hidden) return;
    document.body.classList.remove('no-scroll');
    if (lastFocused) lastFocused.focus();
  }

  /* ── Site-wide search ──────────────────────────────────────────────────────
     People rarely type the words on the label: "headphones" for earphones,
     "cover" for a case, "fix my screen" for a repair. Each word a customer
     types is widened to the words we actually use before matching.
     ------------------------------------------------------------------------ */
  /* Words that mean the same thing to a customer. Every word in a group finds
     every other word in it, so the table only has to be written once. */
  const ALIAS_GROUPS = [
    ['laptop', 'notebook', 'computer', 'macbook', 'thinkpad', 'elitebook', 'portable'],
    ['desktop', 'pc', 'tower', 'optiplex', 'computer'],
    ['gaming', 'game', 'rtx', 'graphics'],
    ['phone', 'smartphone', 'handset', 'iphone', 'samsung', 'tecno', 'infinix', 'pixel'],
    ['earphone', 'earbud', 'earpod', 'airpod', 'headphone', 'headset', 'bud', 'anc'],
    ['case', 'cover', 'flip', 'wallet', 'protector', 'glass', 'tempered'],
    ['charger', 'charging', 'charge', 'adapter', 'plug', 'gan', 'watt'],
    ['cable', 'cord', 'wire', 'lightning', 'usb'],
    ['extension', 'socket', 'surge', 'power'],
    ['mouse', 'mice', 'logitech'],
    ['keyboard', 'keypad', 'combo', 'mechanical', 'typing'],
    ['watch', 'smartwatch', 'wearable', 'fitness'],
    ['powerbank', 'bank', 'anker', 'portable'],
    ['screen', 'display', 'monitor', 'panel'],
    ['storage', 'ssd', 'drive', 'disk', 'memory', 'ram'],
    ['printer', 'print', 'scan', 'copy', 'deskjet'],
    ['router', 'wifi', 'network', 'internet', 'extender'],
    ['cctv', 'camera', 'security', 'surveillance', 'dvr'],
    ['projector', 'beamer', 'presentation'],
    ['ups', 'blackout', 'backup', 'battery'],
    ['repair', 'fix', 'broken', 'cracked', 'damaged', 'service', 'replacement', 'faulty', 'spoilt'],
    ['water', 'liquid', 'damage'],
    ['recovery', 'recover', 'deleted', 'lost', 'backup'],
    ['offer', 'discount', 'sale', 'deal', 'cheap', 'affordable', 'budget'],
    ['student', 'school', 'college', 'campus', 'budget'],
    ['office', 'work', 'business', 'desk']
  ];

  /* Built once: every word points at the union of the groups it belongs to. */
  const ALIASES = (function () {
    const map = {};
    ALIAS_GROUPS.forEach((group) => {
      group.forEach((word) => {
        map[word] = map[word] || [];
        group.forEach((other) => { if (map[word].indexOf(other) < 0) map[word].push(other); });
      });
    });
    return map;
  })();

  /* "do you have a cheap laptop" is really just "cheap laptop". */
  const STOP_WORDS = ('a an the my your our is are am do does i we you it of for to with and or ' +
    'have has need want looking please any some that this there here can could would get got ' +
    'me us buy sell price how much what where when').split(' ');

  const singular = (word) => (word.length > 3 && /s$/.test(word) && !/ss$/.test(word)
    ? word.slice(0, -1) : word);

  function tokenise(query) {
    return String(query).toLowerCase().split(/[^a-z0-9+]+/)
      .filter((word) => word && STOP_WORDS.indexOf(word) < 0);
  }

  const SECTIONS = [
    { label: 'The catalogue',      sub: 'Everything we sell',                   hash: '#catalogue', words: 'shop products browse catalogue buy stock' },
    { label: 'Repairs',            sub: 'Computers, phones, data and setup',    hash: '#repairs',   words: 'repair fix service workshop diagnosis' },
    { label: 'Opening hours',      sub: 'When we are open, when we answer',     hash: '#contact',   words: 'hours open closed time contact call sunday saturday' },
    { label: 'Find the shop',      sub: 'Tom Mboya Street, opposite Imenti House', hash: '#visit',  words: 'location map directions address tom mboya imenti odeon rasulmal nairobi' },
    { label: 'Get in touch',       sub: 'WhatsApp, phone and email',            hash: '#contact',   words: 'contact whatsapp call email phone number message inquiry' }
  ];

  const SUGGESTIONS = ['Laptops', 'Chargers', 'Earphones', 'Phone cases', 'Screen repair', 'On offer'];

  /** Every word we'd accept for one word the customer typed. */
  function expand(token) {
    const base = singular(token);
    const words = [token];
    if (base !== token) words.push(base);
    [token, base].forEach((form) => {
      (ALIASES[form] || []).forEach((word) => { if (words.indexOf(word) < 0) words.push(word); });
    });
    return words;
  }

  /* Two haystacks per product. Loose words (a charger is also an "adapter")
     are matched against the headline text only; the spec sheet is matched on
     the literal word, so "charger" doesn't drag in every phone that mentions
     fast charging in its battery row. */
  function productHaystack(p) {
    return {
      strong: [p.name, catLabel(p.category), p.tag, p.desc,
        discount(p) ? 'offer discount sale deal cheap' : ''].join(' ').toLowerCase(),
      full: Object.entries(p.specs || {}).map(([k, v]) => k + ' ' + v).join(' ').toLowerCase()
    };
  }

  const matches = (hay, token) =>
    expand(token).some((word) => hay.strong.includes(word)) || hay.full.includes(token);

  function searchProducts(tokens) {
    return catalogue.map((p) => {
      const hay = productHaystack(p);
      const name = p.name.toLowerCase();
      let score = 0;
      const matchedAll = tokens.every((token) => {
        const words = expand(token);
        if (!matches(hay, token)) return false;
        if (name.startsWith(token)) score += 4;
        else if (name.includes(token)) score += 3;
        else if (words.some((w) => name.includes(w))) score += 2;
        else score += 1;
        return true;
      });
      if (!matchedAll) return null;
      if (stockOf(p) === 'out') score -= 1;
      if (discount(p)) score += 0.5;
      return { product: p, score: score };
    }).filter(Boolean).sort((a, b) => b.score - a.score);
  }

  function searchServices(tokens) {
    if (typeof SERVICES === 'undefined') return [];
    return SERVICES.filter((s) => {
      const hay = [s.name, s.desc, (s.items || []).join(' '), 'repair fix service'].join(' ').toLowerCase();
      return tokens.every((token) => expand(token).some((w) => hay.includes(w)));
    });
  }

  function searchSections(tokens) {
    return SECTIONS.filter((s) => {
      const hay = (s.label + ' ' + s.sub + ' ' + s.words).toLowerCase();
      return tokens.every((token) => expand(token).some((w) => hay.includes(w)));
    });
  }

  const searchOverlay = $('#searchOverlay');
  let searchIndex = -1;      // which result is highlighted

  function paintSearch(query) {
    const box = $('#searchResults');
    const tokens = tokenise(query);
    $('#searchClear').hidden = !query;
    searchIndex = -1;

    if (!tokens.length) {
      box.innerHTML =
        '<p class="search-hint">Try a few of these</p>' +
        '<div class="search-suggestions">' +
          SUGGESTIONS.map((s) => '<button type="button" class="chip" data-suggest="' + esc(s) + '">' +
            esc(s) + '</button>').join('') +
        '</div>';
      return;
    }

    const products = searchProducts(tokens).slice(0, 8);
    const services = searchServices(tokens).slice(0, 3);
    const sections = searchSections(tokens).slice(0, 3);
    let n = 0;

    if (!products.length && !services.length && !sections.length) {
      const ask = 'Hi ' + SITE.brand + ', do you have ' + query.trim() + '?';
      box.innerHTML =
        '<div class="search-empty">' +
          '<h4>Nothing here matches “' + esc(query.trim()) + '”</h4>' +
          '<p>We source to order, so it is still worth asking.</p>' +
          '<a class="btn btn-wa btn-small" target="_blank" rel="noopener" href="' + esc(waLink(ask)) + '">' +
            'Ask us on WhatsApp</a>' +
        '</div>';
      return;
    }

    const productRows = products.map((hit) => {
      const p = hit.product;
      const off = discount(p);
      return '<button type="button" class="search-row" role="option" data-product="' + esc(p.id) + '" data-index="' + (n++) + '">' +
        '<span class="row-media">' + media(p, 'ph') + '</span>' +
        '<span class="row-text">' +
          '<strong>' + esc(p.name) + '</strong>' +
          '<span>' + esc(catLabel(p.category)) + ' · ' + esc(STOCK[stockOf(p)].text) + '</span>' +
        '</span>' +
        '<span class="row-price">' + esc(money(p.price)) +
          (off ? '<em>−' + off + '%</em>' : '') + '</span>' +
      '</button>';
    }).join('');

    const serviceRows = services.map((s) =>
      '<button type="button" class="search-row" role="option" data-service="' + esc(s.id) + '" data-index="' + (n++) + '">' +
        '<span class="row-media icon">' + (SERVICE_ICONS[s.icon] || SERVICE_ICONS.fallback) + '</span>' +
        '<span class="row-text"><strong>' + esc(s.name) + '</strong><span>' + esc(s.desc) + '</span></span>' +
      '</button>').join('');

    const sectionRows = sections.map((s) =>
      '<button type="button" class="search-row" role="option" data-hash="' + esc(s.hash) + '" data-index="' + (n++) + '">' +
        '<span class="row-media icon"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10"/></svg></span>' +
        '<span class="row-text"><strong>' + esc(s.label) + '</strong><span>' + esc(s.sub) + '</span></span>' +
      '</button>').join('');

    box.innerHTML =
      (products.length ? '<p class="search-hint">Products<span>' + products.length +
        (products.length === 8 ? '+' : '') + '</span></p>' + productRows : '') +
      (services.length ? '<p class="search-hint">Repairs</p>' + serviceRows : '') +
      (sectionRows ? '<p class="search-hint">On this page</p>' + sectionRows : '');

    highlight(0);
  }

  function highlight(index) {
    const rows = $$('.search-row', searchOverlay);
    if (!rows.length) return;
    searchIndex = ((index % rows.length) + rows.length) % rows.length;
    rows.forEach((row, i) => {
      const on = i === searchIndex;
      row.classList.toggle('on', on);
      row.setAttribute('aria-selected', String(on));
      if (on) row.scrollIntoView({ block: 'nearest' });
    });
  }

  function runResult(row) {
    if (!row) return;
    if (row.dataset.product) {
      closeSearch();
      openModal(row.dataset.product);
      return;
    }
    if (row.dataset.service) {
      closeSearch();
      const target = $('#repairs');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (row.dataset.hash) {
      closeSearch();
      const target = $(row.dataset.hash);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /** Hand the current words to the catalogue's own filter and jump there. */
  function searchInCatalogue() {
    const query = $('#globalSearch').value.trim();
    closeSearch();
    state.category = 'all';
    state.query = query;
    $('#search').value = query;
    paintChips();
    paintGrid();
    $('#catalogue').scrollIntoView({ behavior: 'smooth' });
  }

  function openSearch(seed) {
    lastFocused = document.activeElement;
    searchOverlay.hidden = false;
    document.body.classList.add('no-scroll');
    const input = $('#globalSearch');
    input.value = seed || $('#search').value || '';
    paintSearch(input.value);
    setTimeout(() => { input.focus(); input.select(); }, 30);
  }

  function closeSearch() {
    searchOverlay.hidden = true;
    if (modal.hidden && drawer.hidden && manage.hidden) document.body.classList.remove('no-scroll');
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  /* ── Compare ───────────────────────────────────────────────────────────── */
  const compareModal = $('#compareModal');

  function toggleCompare(id) {
    const i = state.compare.indexOf(id);
    if (i > -1) {
      state.compare.splice(i, 1);
    } else if (state.compare.length >= MAX_COMPARE) {
      toast('You can compare ' + MAX_COMPARE + ' products at a time');
      return;
    } else {
      state.compare.push(id);
    }
    paintGrid();
    paintCompareBar();
    if (!compareModal.hidden) {
      state.compare.length > 1 ? paintCompareTable() : closeCompare();
    }
    if (!modal.hidden) {
      $$('[data-compare="' + id + '"]', modal).forEach((btn) => {
        btn.textContent = state.compare.includes(id) ? 'In comparison' : 'Compare';
      });
    }
  }

  const compareProducts = () => state.compare.map(byId).filter(Boolean);

  function paintCompareBar() {
    const bar = $('#compareBar');
    const items = compareProducts();
    bar.hidden = items.length === 0;
    document.body.classList.toggle('has-compare', items.length > 0);
    if (!items.length) return;

    $('#comparePicks').innerHTML = items.map((p) =>
      '<span class="compare-pick">' +
        '<span class="pick-media">' + media(p, 'ph') + '</span>' +
        '<span>' + esc(p.name) + '</span>' +
        (discount(p) ? '<em class="pick-off">−' + discount(p) + '%</em>' : '') +
        '<button type="button" data-compare="' + esc(p.id) + '" aria-label="Remove ' + esc(p.name) + ' from comparison">&times;</button>' +
      '</span>').join('') +
      (items.length < 2 ? '<span class="compare-hint">Pick one more to compare</span>' : '');

    $('#compareCount').textContent = items.length;
    $('#compareOpen').disabled = items.length < 2;
  }

  function paintCompareTable() {
    const items = compareProducts();
    if (items.length < 2) return;

    const keys = [];
    items.forEach((p) => Object.keys(p.specs || {}).forEach((k) => {
      if (!keys.includes(k)) keys.push(k);
    }));

    const prices = items.map((p) => (p.price == null ? Infinity : Number(p.price)));
    const cheapest = Math.min.apply(null, prices);

    const row = (label, cells, isDifferent) =>
      '<tr' + (isDifferent ? ' class="differs"' : '') + '><th scope="row">' + esc(label) + '</th>' +
      cells.map((c) => '<td>' + c + '</td>').join('') + '</tr>';

    const differs = (values) => new Set(values.map((v) => String(v))).size > 1;

    const head = '<thead><tr><th scope="col"><span class="visually-hidden">Product</span></th>' +
      items.map((p) =>
        '<th scope="col"><span class="compare-head-cell">' +
          media(p, 'ph') +
          '<strong>' + esc(p.name) + '</strong>' +
          '<span class="card-cat">' + esc(catLabel(p.category)) + '</span>' +
        '</span></th>').join('') + '</tr></thead>';

    const priceCells = items.map((p, i) =>
      '<span class="price">' + (discount(p) ? '<s>' + esc(money(p.wasPrice)) + '</s> ' : '') +
        esc(money(p.price)) + '</span>' +
      (prices[i] === cheapest && isFinite(cheapest) && differs(prices)
        ? ' <span class="pill-lowest">Lowest</span>' : ''));

    const offerCells = items.map((p) => (discount(p)
      ? '<span class="pill-lowest">−' + discount(p) + '% · save ' + esc(money(saving(p))) + '</span>'
      : '—'));

    const stockCells = items.map((p) => {
      const s = STOCK[stockOf(p)];
      return '<span class="stock ' + s.cls + '">' + s.text + '</span>';
    });

    const specRows = keys.map((k) => {
      const values = items.map((p) => (p.specs && p.specs[k]) || '—');
      return row(k, values.map(esc), differs(values));
    }).join('');

    const actionCells = items.map((p) => {
      const ask = 'Hi ' + SITE.brand + ', I\'m interested in the ' + p.name + ' (' + money(p.price) + ').';
      return '<span class="row-actions">' +
        '<a class="btn btn-wa btn-small" target="_blank" rel="noopener" href="' + esc(waLink(ask)) + '">Ask about this</a> ' +
        '<button type="button" class="btn btn-ghost btn-small" data-add="' + esc(p.id) + '">' +
          (state.inquiry.includes(p.id) ? 'In inquiry list' : 'Add to inquiry') + '</button>' +
      '</span>';
    });

    const table = $('#compareTable');
    table.innerHTML = head + '<tbody>' +
      row('Price', priceCells, differs(prices)) +
      (items.some(discount) ? row('Offer', offerCells, differs(items.map(discount))) : '') +
      row('Availability', stockCells, differs(items.map(stockOf))) +
      specRows +
      row('', actionCells, false) +
      '</tbody>';

    /* The table is sized to how many products are in it, so two of them fit a
       phone outright instead of being cut off at the edge. */
    table.style.setProperty('--compare-cols', items.length);
    afterPaint(showSwipeHint);
  }

  /** Only mention swiping when there is actually something off to the side. */
  function showSwipeHint() {
    const scroll = $('.compare-scroll');
    const hint = $('#compareSwipe');
    if (!scroll || !hint) return;
    hint.classList.toggle('show', scroll.scrollWidth - scroll.clientWidth > 4);
  }

  const afterPaint = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));

  function openCompare() {
    if (state.compare.length < 2) { toast('Pick at least two products to compare'); return; }
    paintCompareTable();
    lastFocused = document.activeElement;
    compareModal.hidden = false;
    document.body.classList.add('no-scroll');
    const close = $('.modal-close', compareModal);
    if (close) close.focus();
  }

  function closeCompare() {
    compareModal.hidden = true;
    document.body.classList.remove('no-scroll');
    if (lastFocused) lastFocused.focus();
  }

  /* ── Inquiry list + drawer ─────────────────────────────────────────────── */
  const drawer = $('#drawer');

  function toggleInquiry(id) {
    const i = state.inquiry.indexOf(id);
    const product = byId(id);
    if (i > -1) {
      state.inquiry.splice(i, 1);
      toast(product ? product.name + ' removed' : 'Removed');
    } else {
      state.inquiry.push(id);
      toast(product ? product.name + ' added to your inquiry' : 'Added');
    }
    saveInquiry();
    paintGrid();
    paintCount();
    paintAttached();
    if (!drawer.hidden) paintDrawer();
    if (!modal.hidden) {
      $$('[data-add="' + id + '"]', modal).forEach((btn) => {
        btn.textContent = state.inquiry.includes(id) ? 'In your inquiry list' : 'Add to inquiry';
      });
    }
  }

  function paintCount() {
    const badge = $('#inquiryCount');
    badge.textContent = state.inquiry.length;
    badge.hidden = state.inquiry.length === 0;
  }

  const inquiryProducts = () => state.inquiry.map(byId).filter(Boolean);
  const inquiryTotal = () => inquiryProducts()
    .reduce((sum, p) => sum + (p.price == null ? 0 : Number(p.price)), 0);

  function inquiryMessage(form) {
    const items = inquiryProducts();
    const lines = ['Hi ' + SITE.brand + ','];
    if (form && form.message) lines.push('', form.message);
    if (items.length) {
      lines.push('', 'I\'m interested in:');
      items.forEach((p) => lines.push('• ' + p.name + ' — ' + money(p.price)));
      if (inquiryTotal() > 0) lines.push('Indicative total: ' + money(inquiryTotal()));
    }
    if (form && (form.name || form.contact)) {
      lines.push('', '—');
      if (form.name) lines.push(form.name);
      if (form.contact) lines.push(form.contact);
      if (form.interest) lines.push('Interested in: ' + form.interest);
    }
    return lines.join('\n');
  }

  function paintDrawer() {
    const items = inquiryProducts();
    const body = $('#drawerBody');
    const foot = $('#drawerFoot');

    if (!items.length) {
      body.innerHTML =
        '<div class="drawer-empty">' +
          '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1.2 11a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>' +
          '<p>Your inquiry list is empty.</p>' +
          '<p style="font-size:.85rem;opacity:.75">Tap the + on any product to line it up here, then send the whole list at once.</p>' +
        '</div>';
      foot.innerHTML = '<button class="btn btn-ghost btn-block" type="button" data-close>Browse products</button>';
      return;
    }

    body.innerHTML = items.map((p) => {
      const off = discount(p);
      return '<div class="line-item">' +
        '<span class="line-media">' + media(p, 'ph') + '</span>' +
        '<span class="line-info">' +
          '<strong>' + esc(p.name) + '</strong>' +
          // What they are saving belongs on the list they are about to send.
          '<span>' + (off ? '<s>' + esc(money(p.wasPrice)) + '</s> ' : '') +
            esc(money(p.price)) +
            (off ? ' <em class="line-off">−' + off + '%</em>' : '') + '</span>' +
        '</span>' +
        '<button class="line-remove" type="button" data-add="' + esc(p.id) + '" aria-label="Remove ' + esc(p.name) + '">&times;</button>' +
      '</div>';
    }).join('');

    foot.innerHTML =
      '<div class="drawer-total"><span>' + items.length + ' item' + (items.length === 1 ? '' : 's') +
        '</span><strong>' + esc(money(inquiryTotal())) + '</strong></div>' +
      '<a class="btn btn-wa btn-block" href="' + esc(waLink(inquiryMessage())) + '" target="_blank" rel="noopener">Send list on WhatsApp</a>' +
      '<a class="btn btn-ghost btn-block" href="' + esc(mailLink('Product inquiry', inquiryMessage())) + '">Send list by email</a>' +
      '<button class="btn btn-ghost btn-block" type="button" id="goForm">Use the inquiry form</button>' +
      '<button class="btn btn-ghost btn-block" type="button" id="clearList">Clear list</button>';
  }

  function openDrawer() {
    paintDrawer();
    lastFocused = document.activeElement;
    drawer.hidden = false;
    document.body.classList.add('no-scroll');
    const close = $('.modal-close', drawer);
    if (close) close.focus();
  }

  function closeDrawer() {
    drawer.hidden = true;
    if (!modal.hidden) return;
    document.body.classList.remove('no-scroll');
    if (lastFocused) lastFocused.focus();
  }

  /* ── Photos: shrink before storing ─────────────────────────────────────────
     A phone camera photo is 3–8MB, far too big to keep in a browser. Each one
     is redrawn at a sensible size as a JPEG first — around 100KB, which still
     looks sharp on a product card.
     ------------------------------------------------------------------------ */
  function shrinkImage(file, maxDim, quality) {
    return new Promise((resolve, reject) => {
      if (!/^image\//.test(file.type)) { reject(new Error('not an image')); return; }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('could not read image')); };
      img.src = url;
    });
  }

  const shrinkAll = (files, maxDim, quality) =>
    Promise.all(Array.from(files).map((f) => shrinkImage(f, maxDim, quality).catch(() => null)))
      .then((list) => list.filter(Boolean));

  /* ── Manage panel ────────────────────────────────────────────────────────── */
  const manage = $('#manage');

  const slug = (text) => String(text).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'item';

  function uniqueId(base, ignoreId) {
    let id = slug(base);
    let n = 2;
    while (catalogue.some((p) => p.id === id && p.id !== ignoreId)) id = slug(base) + '-' + n++;
    return id;
  }

  const specsToText = (specs) => Object.entries(specs || {}).map(([k, v]) => k + ': ' + v).join('\n');

  function textToSpecs(text) {
    const specs = {};
    String(text || '').split('\n').forEach((line) => {
      const at = line.indexOf(':');
      if (at < 1) return;
      const key = line.slice(0, at).trim();
      const value = line.slice(at + 1).trim();
      if (key && value) specs[key] = value;
    });
    return specs;
  }

  /* Access: only reachable via the secret address, then the code. */
  const unlocked = () => { try { return sessionStorage.getItem(UNLOCK_KEY) === '1'; } catch (e) { return false; } };
  const manageHash = () => '#manage-' + (SITE.manageKey || '');

  function unlock() {
    if (unlocked()) return true;
    if (SITE.managePin) {
      for (let tries = 0; tries < 3; tries++) {
        const entered = window.prompt('Management code');
        if (entered === null) return false;
        if (String(entered).trim() === String(SITE.managePin)) break;
        if (tries === 2) { toast('Wrong code'); return false; }
      }
    }
    try { sessionStorage.setItem(UNLOCK_KEY, '1'); } catch (e) {}
    const chip = $('#manageChip');
    if (chip) chip.hidden = false;
    return true;
  }

  function paintManage() {
    const body = $('#manageBody');

    if (state.editing) {
      body.innerHTML = editorHTML(state.editing === 'new' ? null : byId(state.editing));
      const first = $('#pName', body);
      if (first) first.focus();
      $('#manageFoot').hidden = true;
      return;
    }
    $('#manageFoot').hidden = false;

    const used = storageUsed();
    const banner = isEdited()
      ? '<div class="manage-banner edited">' +
          '<strong>You have unpublished changes.</strong> They show on this device now. ' +
          'Use <em>Download data.js</em> below and upload that file to publish them to everyone.' +
          (publishedMark()
            ? '<span class="storage">Waiting for your upload to go live. ' +
                'The moment it does, this device drops its own copy and follows the ' +
                'published shop — nothing is left stacked on top.</span>'
            : '') +
          '<span class="storage">Saved data: ' + used.mb + ' MB' +
            (used.bytes > 3500000 ? ' — getting full, prefer file paths for photos' : '') + '</span>' +
        '</div>'
      : '<div class="manage-banner">' +
          'Showing the catalogue exactly as it is in <code>data.js</code>. ' +
          'Any change you make here is saved on this device straight away.' +
        '</div>';

    const groups = categories.filter((c) => c.key !== 'all').map((cat) => {
      const items = catalogue.filter((p) => p.category === cat.key);
      return '<section class="manage-group">' +
        '<h3>' + esc(cat.label) + '<span class="group-n">' + items.length + '</span>' +
          (items.length === 0
            ? '<button type="button" class="tool-btn danger" data-delcat="' + esc(cat.key) + '" ' +
              'title="Remove this empty category" aria-label="Remove category ' + esc(cat.label) + '">' +
              '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13"/></svg></button>'
            : '') +
        '</h3>' +
        (items.length
          ? items.map(manageRow).join('')
          : '<p class="manage-empty">Nothing in here yet.</p>') +
      '</section>';
    }).join('');

    body.innerHTML = banner +
      '<div class="manage-actions">' +
        '<button type="button" class="btn btn-primary" id="addProduct">' +
          '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg> Add a product</button>' +
        '<button type="button" class="btn btn-ghost" id="addCategory">New category</button>' +
        // Only offered when there is a private copy to drop.
        (isEdited()
          ? '<button type="button" class="btn btn-ghost" id="usePublished">Use the published version</button>'
          : '') +
      '</div>' + groups;
  }

  /* Throw away this device's copy and show the published shop instead. This
     loses anything not yet uploaded, so it asks first and says what goes. */
  function usePublished() {
    const mine = catalogue.length;
    const live = seedProducts().length;
    const ok = confirm(
      'Show the published shop on this device?\n\n' +
      'This device is showing its own saved copy (' + mine + ' products).\n' +
      'The published shop has ' + live + '.\n\n' +
      'Any change here that you have not downloaded and uploaded will be lost.'
    );
    if (!ok) return;
    forgetLocalCopy();
    loadShop();
    state.editing = null;
    state.draft = null;
    refreshCatalogueViews();
    paintManage();
    toast('Now showing the published shop');
  }

  /** "just now", "3 hours ago", "12 Jul" — only ever shown in the Manage panel. */
  function editedLabel(product) {
    if (!product.updated) return '';
    const mins = Math.round((Date.now() - product.updated) / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return mins + (mins === 1 ? ' minute ago' : ' minutes ago');
    const hours = Math.round(mins / 60);
    if (hours < 24) return hours + (hours === 1 ? ' hour ago' : ' hours ago');
    const days = Math.round(hours / 24);
    if (days < 30) return days + (days === 1 ? ' day ago' : ' days ago');
    try {
      return new Date(product.updated)
        .toLocaleDateString(SITE.locale || 'en-KE', { day: 'numeric', month: 'short' });
    } catch (e) { return ''; }
  }

  function manageRow(p) {
    const off = discount(p);
    const edited = editedLabel(p);
    return '<div class="manage-row">' +
      '<span class="line-media">' + media(p, 'ph') + '</span>' +
      '<span class="line-info">' +
        '<strong>' + esc(p.name) +
          (off ? '<span class="row-flag">−' + off + '%</span>' : '') +
          (p.spin && p.spin.length > 1 ? '<span class="row-flag alt">360°</span>' : '') +
          (p.images && p.images.length ? '<span class="row-flag alt">' + p.images.length + ' photo' +
            (p.images.length === 1 ? '' : 's') + '</span>' : '') +
          (edited ? '<span class="row-flag time" title="Shows first in its category">Edited ' +
            esc(edited) + '</span>' : '') +
        '</strong>' +
        '<span class="manage-controls">' +
          '<label class="price-field" title="Selling price">' + esc(SITE.currency) +
            '<input type="number" min="0" step="1" value="' + (p.price == null ? '' : esc(p.price)) + '" ' +
              'data-price="' + esc(p.id) + '" placeholder="Ask" aria-label="Price for ' + esc(p.name) + '" />' +
          '</label>' +
          '<label class="price-field was" title="Old price — set it to put this on offer">was' +
            '<input type="number" min="0" step="1" value="' + (p.wasPrice == null ? '' : esc(p.wasPrice)) + '" ' +
              'data-was="' + esc(p.id) + '" placeholder="—" aria-label="Old price for ' + esc(p.name) + '" />' +
          '</label>' +
          '<select data-stock="' + esc(p.id) + '" data-value="' + esc(stockOf(p)) + '" ' +
            'aria-label="Availability for ' + esc(p.name) + '">' +
            ['in', 'low', 'out'].map((key) =>
              '<option value="' + key + '"' + (key === stockOf(p) ? ' selected' : '') + '>' +
                STOCK[key].label + '</option>').join('') +
          '</select>' +
        '</span>' +
      '</span>' +
      '<span class="row-tools">' +
        '<button type="button" class="tool-btn" data-copy="' + esc(p.id) + '" title="Copy this product\'s link" ' +
          'aria-label="Copy link to ' + esc(p.name) + '">' +
          '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/>' +
          '<path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg></button>' +
        '<button type="button" class="tool-btn" data-edit="' + esc(p.id) + '" title="Edit everything" ' +
          'aria-label="Edit ' + esc(p.name) + '">' +
          '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg></button>' +
        '<button type="button" class="tool-btn danger" data-delete="' + esc(p.id) + '" title="Remove from the catalogue" ' +
          'aria-label="Delete ' + esc(p.name) + '">' +
          '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13"/></svg></button>' +
      '</span>' +
    '</div>';
  }

  function editorHTML(product) {
    const p = product || {
      name: '', category: (categories[1] || {}).key || 'computers', price: '', wasPrice: '',
      desc: '', specs: {}, tag: '', stock: 'in', images: [], spin: []
    };
    if (!state.draft) state.draft = { images: (p.images || []).slice(), spin: (p.spin || []).slice() };
    const tags = ['', 'New', 'Best seller', 'Refurbished', 'Built to order'];

    return '<form class="editor" id="editor" data-id="' + esc(product ? product.id : '') + '">' +
      '<h3>' + (product ? 'Edit product' : 'New product') + '</h3>' +

      '<div class="field"><label for="pName">Name</label>' +
        '<input id="pName" required value="' + esc(p.name) + '" placeholder="Logitech M170 Wireless Mouse" /></div>' +

      '<div class="field-row">' +
        '<div class="field"><label for="pCategory">Category</label><select id="pCategory">' +
          categories.filter((c) => c.key !== 'all').map((c) =>
            '<option value="' + esc(c.key) + '"' + (c.key === p.category ? ' selected' : '') + '>' +
              esc(c.label) + '</option>').join('') +
        '</select></div>' +
        '<div class="field"><label for="pStock">Availability</label><select id="pStock">' +
          ['in', 'low', 'out'].map((key) =>
            '<option value="' + key + '"' + (key === p.stock ? ' selected' : '') + '>' +
              STOCK[key].label + '</option>').join('') +
        '</select></div>' +
      '</div>' +

      '<div class="field-row">' +
        '<div class="field"><label for="pPrice">Price now (' + esc(SITE.currency) + ')</label>' +
          '<input id="pPrice" type="number" min="0" step="1" value="' + (p.price == null ? '' : esc(p.price)) + '" ' +
            'placeholder="Empty = price on request" /></div>' +
        '<div class="field"><label for="pWas">Old price — set to put on offer</label>' +
          '<input id="pWas" type="number" min="0" step="1" value="' + (p.wasPrice == null ? '' : esc(p.wasPrice)) + '" ' +
            'placeholder="Leave empty for no offer" /></div>' +
      '</div>' +

      '<div class="field"><label for="pTag">Badge</label><select id="pTag">' +
        tags.map((t) => '<option value="' + esc(t) + '"' + (t === (p.tag || '') ? ' selected' : '') + '>' +
          (t || 'No badge') + '</option>').join('') +
      '</select><span class="hint">An offer badge appears on its own when an old price is set.</span></div>' +

      '<div class="field"><label for="pDesc">Short description</label>' +
        '<textarea id="pDesc" rows="2" placeholder="One or two lines shown on the card.">' + esc(p.desc) + '</textarea></div>' +

      '<div class="field"><label for="pSpecs">Specs — one per line, as <code>Label: value</code></label>' +
        '<textarea id="pSpecs" rows="6" placeholder="Connection: 2.4GHz USB receiver&#10;Battery: Up to 12 months">' +
          esc(specsToText(p.specs)) + '</textarea></div>' +

      '<div class="field"><label>Photos</label>' +
        '<div class="uploader">' +
          '<input type="file" id="pPhotos" accept="image/*" multiple hidden />' +
          '<button type="button" class="btn btn-ghost btn-small" id="pickPhotos">Choose photos</button>' +
          '<span class="hint">Straight from your phone or computer. They are shrunk automatically.</span>' +
        '</div>' +
        '<div class="tray" id="photoTray"></div>' +
      '</div>' +

      '<div class="field"><label>360° view</label>' +
        '<div class="uploader">' +
          '<input type="file" id="pSpin" accept="image/*" multiple hidden />' +
          '<button type="button" class="btn btn-ghost btn-small" id="pickSpin">Choose the turntable shots</button>' +
          '<span class="hint">Pick every frame at once — they are ordered by file name. 12–36 shots around the product works well.</span>' +
        '</div>' +
        '<div class="tray" id="spinTray"></div>' +
      '</div>' +

      '<div class="editor-actions">' +
        '<button type="submit" class="btn btn-primary">' + (product ? 'Save changes' : 'Add to catalogue') + '</button>' +
        '<button type="button" class="btn btn-ghost" id="cancelEdit">Cancel</button>' +
      '</div>' +
    '</form>';
  }

  function paintTrays() {
    if (!state.draft) return;
    const photoTray = $('#photoTray');
    const spinTray = $('#spinTray');
    if (photoTray) {
      photoTray.innerHTML = state.draft.images.length
        ? state.draft.images.map((src, i) =>
            '<span class="tray-item"><img src="' + esc(src) + '" alt="" />' +
              (i === 0 ? '<span class="tray-main">Main</span>' : '') +
              '<button type="button" data-drop-photo="' + i + '" aria-label="Remove photo ' + (i + 1) + '">&times;</button>' +
            '</span>').join('')
        : '<p class="tray-empty">No photos yet — the built-in line art is used instead.</p>';
    }
    if (spinTray) {
      const n = state.draft.spin.length;
      spinTray.innerHTML = n
        ? '<span class="tray-count">' + n + ' frame' + (n === 1 ? '' : 's') +
            (n > 1 ? ' — the 360° viewer is on' : ' — needs at least 2') + '</span>' +
          state.draft.spin.slice(0, 8).map((src) => '<span class="tray-item small"><img src="' + esc(src) + '" alt="" /></span>').join('') +
          (n > 8 ? '<span class="tray-more">+' + (n - 8) + '</span>' : '') +
          '<button type="button" class="btn btn-ghost btn-small" id="dropSpin">Remove all frames</button>'
        : '<p class="tray-empty">No 360° frames. Photograph the product from 12–36 angles on a turntable.</p>';
    }
  }

  function submitEditor(event) {
    event.preventDefault();
    const form = event.target;
    const existingId = form.dataset.id;
    const name = $('#pName').value.trim();
    if (!name) { $('#pName').focus(); return; }

    const number = (value) => (String(value).trim() === '' ? null : Number(value));
    const product = normalise({
      id: existingId || uniqueId(name),
      name: name,
      category: $('#pCategory').value,
      price: number($('#pPrice').value),
      wasPrice: number($('#pWas').value),
      desc: $('#pDesc').value.trim(),
      specs: textToSpecs($('#pSpecs').value),
      tag: $('#pTag').value,
      stock: $('#pStock').value,
      images: state.draft ? state.draft.images : [],
      spin: state.draft ? state.draft.spin : []
    });
    touch(product);

    if (product.wasPrice && product.price && product.wasPrice <= product.price) {
      toast('The old price must be higher than the price now — offer not applied');
      product.wasPrice = null;
    }

    if (existingId) {
      const index = catalogue.findIndex((p) => p.id === existingId);
      if (index > -1) catalogue[index] = product;
      toast(product.name + ' updated');
    } else {
      catalogue.push(product);
      toast(product.name + ' added to the catalogue');
    }

    saveShop();
    state.editing = null;
    state.draft = null;
    refreshCatalogueViews();
    paintManage();
  }

  function deleteProduct(id) {
    const product = byId(id);
    if (!product) return;
    if (!window.confirm('Remove "' + product.name + '" from the catalogue?')) return;

    catalogue = catalogue.filter((p) => p.id !== id);
    state.inquiry = state.inquiry.filter((x) => x !== id);
    state.compare = state.compare.filter((x) => x !== id);
    saveShop();
    saveInquiry();
    refreshCatalogueViews();
    paintManage();
    toast(product.name + ' removed');
  }

  function setField(id, field, value) {
    const product = byId(id);
    if (!product) return;
    const trimmed = String(value).trim();
    product[field] = trimmed === '' ? null : Number(trimmed);
    if (field === 'wasPrice' && product.wasPrice && product.price && product.wasPrice <= product.price) {
      product.wasPrice = null;
      toast('The old price must be higher than the price now');
    }
    touch(product);
    saveShop();
    refreshCatalogueViews();
    paintManage();
  }

  function setStock(id, value) {
    const product = byId(id);
    if (!product) return;
    product.stock = value;
    touch(product);
    saveShop();
    refreshCatalogueViews();
    const select = $('[data-stock="' + id + '"]');
    if (select) select.dataset.value = value;
    toast(product.name + ' → ' + STOCK[value].label);
  }

  function addCategory() {
    const label = window.prompt('Name the new category (e.g. "Printers & scanners")');
    if (!label || !label.trim()) return;
    const key = slug(label);
    if (categories.some((c) => c.key === key)) { toast('That category already exists'); return; }
    categories.push({ key: key, label: label.trim() });
    saveShop();
    refreshCatalogueViews();
    paintManage();
    toast('"' + label.trim() + '" added — it appears once it has a product in it');
  }

  function deleteCategory(key) {
    if (catalogue.some((p) => p.category === key)) { toast('Move or delete its products first'); return; }
    categories = categories.filter((c) => c.key !== key);
    if (state.category === key) state.category = 'all';
    saveShop();
    refreshCatalogueViews();
    paintManage();
    toast('Category removed');
  }

  function refreshCatalogueViews() {
    paintChips();
    paintGrid();
    paintCount();
    paintAttached();
    paintCompareBar();
    paintInterestOptions();
    if (!drawer.hidden) paintDrawer();
    if (!compareModal.hidden && state.compare.length > 1) paintCompareTable();
  }

  /** A complete, ready-to-upload data.js built from what's on screen now. */
  function dataFileText() {
    const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    return '/* ==========================================================================\n' +
      '   data.js — exported from the Manage panel on ' + stamp + '.\n' +
      '   Put this file in assets/js/ (replacing the old one) and upload it to\n' +
      '   publish these products, prices, offers and photos to everyone.\n' +
      '   ========================================================================== */\n\n' +
      'const SITE = ' + JSON.stringify(SITE, null, 2) + ';\n\n' +
      'const SERVICES = ' + JSON.stringify(typeof SERVICES === 'undefined' ? [] : SERVICES, null, 2) + ';\n\n' +
      'const CATEGORIES = ' + JSON.stringify(categories, null, 2) + ';\n\n' +
      'const PRODUCTS = ' + JSON.stringify(catalogue, null, 2) + ';\n';
  }

  function downloadDataFile() {
    const text = dataFileText();
    const blob = new Blob([text], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.js';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    /* Remember what this download contained. When the site starts serving the
       same thing, we know the upload landed and this device can stop holding
       its own copy — see loadShop. */
    try { localStorage.setItem(PUBLISHED_KEY, signature(catalogue, categories)); } catch (e) {}

    const mb = (text.length / 1048576).toFixed(1);
    toast('data.js downloaded (' + mb + ' MB) — put it in assets/js/ and upload');
  }

  function openManage(fromHash) {
    if (!fromHash && !unlocked()) return;      // no secret address, no panel
    if (!unlock()) return;
    state.editing = null;
    state.draft = null;
    paintManage();
    lastFocused = document.activeElement;
    manage.hidden = false;
    document.body.classList.add('no-scroll');
    const close = $('.modal-close', manage);
    if (close) close.focus();
  }

  function closeManage() {
    manage.hidden = true;
    state.editing = null;
    state.draft = null;
    document.body.classList.remove('no-scroll');
    if (history.replaceState && location.hash.indexOf('#manage') === 0) {
      history.replaceState(null, '', location.pathname + location.search);
    }
    if (lastFocused) lastFocused.focus();
  }

  /* ── Contact form ──────────────────────────────────────────────────────── */
  function paintAttached() {
    const box = $('#attached');
    const list = $('#attachedList');
    const items = inquiryProducts();
    box.hidden = items.length === 0;
    list.innerHTML = items.map((p) => '<li>' + esc(p.name) + ' — ' + esc(money(p.price)) + '</li>').join('');
  }

  function fieldError(input, message) {
    const wrap = input.closest('.field');
    const slot = $('[data-error-for="' + input.id + '"]');
    wrap.classList.toggle('invalid', Boolean(message));
    if (slot) slot.textContent = message || '';
    return !message;
  }

  function validate(form) {
    let ok = true;
    ok = fieldError(form.fName, form.fName.value.trim() ? '' : 'Please tell us your name.') && ok;

    const contact = form.fContact.value.trim();
    const looksEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact);
    const looksPhone = digits(contact).length >= 9;
    ok = fieldError(form.fContact,
      !contact ? 'We need an email or phone number to reply to.'
               : (looksEmail || looksPhone ? '' : 'That doesn\'t look like an email or phone number.')) && ok;

    ok = fieldError(form.fMessage, form.fMessage.value.trim().length >= 5
      ? '' : 'A line or two about what you need, please.') && ok;
    return ok;
  }

  function submitForm(event) {
    event.preventDefault();
    const form = $('#contactForm');
    if (!validate(form)) {
      const firstBad = $('.field.invalid input, .field.invalid textarea');
      if (firstBad) firstBad.focus();
      return;
    }

    const data = {
      name: form.fName.value.trim(),
      contact: form.fContact.value.trim(),
      interest: form.fInterest.value,
      message: form.fMessage.value.trim()
    };
    const channel = (event.submitter && event.submitter.dataset.channel) || 'whatsapp';
    const repair = /repair/i.test(data.interest);
    const body = inquiryMessage(data);

    if (SITE.formEndpoint) {
      fetch(SITE.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.assign({}, data, {
          products: inquiryProducts().map((p) => p.name).join(', ')
        }))
      }).catch(function () { /* the hand-off below still works */ });
    }

    if (channel === 'email') {
      window.location.href = mailLink('Inquiry from ' + data.name, body, repair ? repairEmail() : SITE.email);
    } else {
      window.open(repair ? repairWa(body) : waLink(body), '_blank', 'noopener');
    }

    const status = contactStatus();
    toast(status.open
      ? 'Opening ' + (channel === 'email' ? 'your email app' : 'WhatsApp') + '…'
      : 'Sending now — we answer from ' + clockLabel(SITE.contactHours[0]));
  }

  /* ── Toast ─────────────────────────────────────────────────────────────── */
  let toastTimer;
  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
  }

  /* ── Theme ─────────────────────────────────────────────────────────────── */
  function toggleTheme() {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('homcom-theme', next); } catch (e) {}
  }

  /* ── Install as an app (Android, desktop; iOS gets instructions) ───────── */
  function initInstall() {
    // One in the header for wide screens, one inside the menu for narrow ones,
    // where the header has no room to spare.
    const buttons = $$('#installBtn, #installBtnNav');
    if (!buttons.length) return;
    let prompt = null;

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    const showAll = (show) => buttons.forEach((b) => { b.hidden = !show; });
    if (standalone) { showAll(false); return; }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      prompt = e;
      showAll(true);
    });

    if (isIOS) showAll(true);

    buttons.forEach((button) => button.addEventListener('click', () => {
      if (prompt) {
        prompt.prompt();
        prompt.userChoice.finally(() => { prompt = null; showAll(false); });
      } else if (isIOS) {
        toast('In Safari: tap Share, then "Add to Home Screen"');
      } else {
        toast('Use your browser menu → "Install app" or "Add to Home screen"');
      }
    }));

    window.addEventListener('appinstalled', () => { showAll(false); toast('Installed — it now opens like an app'); });
  }

  function initServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol === 'file:') return;   // needs http(s)

    /* Whether this phone was already running an installed copy of the site.
       Read before registering, because registering is what changes it. */
    const wasInstalled = !!navigator.serviceWorker.controller;

    /* When a newer version takes over, the files this page was built from are
       already out of date — that is how a phone ends up showing last week's
       prices however many times its owner pulls to refresh. Reload once, and
       only for someone who had the old version: a first-time visitor is
       looking at the new one already. */
    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!wasInstalled || reloading) return;
      reloading = true;
      location.reload();
    });

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js')
        .then((reg) => { if (reg && reg.update) reg.update(); })
        .catch(() => {});
    });
  }

  /** Tells you which version this device is running, and where it came from. */
  function paintBuild() {
    const tag = $('#buildTag');
    const source = $('#buildSource');
    if (tag) tag.textContent = BUILD;
    if (!source) return;
    const offline = 'serviceWorker' in navigator && navigator.serviceWorker.controller;
    source.textContent = offline
      ? 'installed on this device — new versions load themselves'
      : 'loaded straight from the website';
  }

  /* ── Motion ────────────────────────────────────────────────────────────────
     Everything here is decoration: if the browser is asked to reduce motion,
     or there's no real cursor, it simply doesn't run.
     ------------------------------------------------------------------------ */
  const calmRequested = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initScroll() {
    const header = $('.site-header');
    const progress = $('.scroll-progress');
    const sections = ['catalogue', 'repairs', 'contact'].map((id) => $('#' + id)).filter(Boolean);
    let ticking = false;

    /* Everything the scroll handler needs is worked out once here rather than
       measured on every frame — reading offsetTop mid-scroll is the classic
       way to make a phone stutter. */
    const navLinks = $$('.nav a');
    let offsets = [];
    let scrollable = 0;
    const measure = () => {
      offsets = sections.map((section) => ({ id: section.id, top: section.offsetTop }));
      scrollable = document.documentElement.scrollHeight - window.innerHeight;
    };
    measure();
    window.addEventListener('resize', measure);
    // Turning the phone changes whether the comparison still fits.
    window.addEventListener('resize', () => {
      if (!compareModal.hidden) showSwipeHint();
    });
    window.addEventListener('orientationchange', measure);
    document.addEventListener('DOMContentLoaded', measure);
    window.addEventListener('load', measure);

    // Only write to the DOM when a value actually changed; a redundant write
    // still costs a style recalculation.
    let lastProgress = -1;
    let lastSection = null;
    let lastScrolled = null;

    const paintScroll = () => {
      ticking = false;
      const y = window.scrollY;

      const scrolled = y > 8;
      if (scrolled !== lastScrolled) {
        header.classList.toggle('scrolled', scrolled);
        lastScrolled = scrolled;
      }

      if (progress && scrollable > 0) {
        const value = Math.min(y / scrollable, 1);
        if (Math.abs(value - lastProgress) > 0.002) {
          progress.style.setProperty('--progress', value.toFixed(3));
          lastProgress = value;
        }
      }

      let current = '';
      for (let i = 0; i < offsets.length; i++) {
        if (y >= offsets[i].top - 120) current = offsets[i].id;
      }
      if (current !== lastSection) {
        navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
        lastSection = current;
      }
    };

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(paintScroll);
    }, { passive: true });
    paintScroll();

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

      // Things that arrive together arrive one after another, not all at once.
      const groups = {};
      $$('.reveal').forEach((el) => {
        const parent = el.parentElement;
        const key = parent ? (parent.dataset.revealGroup || (parent.dataset.revealGroup = Math.random())) : 'x';
        groups[key] = (groups[key] || 0) + 1;
        el.style.setProperty('--delay', Math.min((groups[key] - 1) * 70, 350) + 'ms');
        io.observe(el);
      });
    } else {
      $$('.reveal').forEach((el) => el.classList.add('in'));
    }
  }

  /* ── Refresh rate ──────────────────────────────────────────────────────────
     Every animation on the site is described in time, not in frames — CSS
     transitions and keyframes interpolate by the clock, and the 360° spinner
     advances on elapsed milliseconds. So a 60Hz phone, a 90Hz mid-range, a
     120Hz tablet and a 144Hz monitor all show the same thing at the same
     speed; the faster screen simply draws more steps in between.

     What still differs is whether a device can KEEP that rate. This samples
     real frame times once the page has settled and, if the device is missing
     its own target, drops the expensive decoration rather than stuttering.
     ------------------------------------------------------------------------ */
  function initFrameWatchdog() {
    if (!window.requestAnimationFrame) return;

    const override = new URLSearchParams(location.search).get('lite');
    if (override === '1') { document.documentElement.classList.add('lite'); return; }
    if (override === '0') return;

    const samples = [];
    let previous = 0;

    const sample = (now) => {
      if (previous) samples.push(now - previous);
      previous = now;
      if (samples.length < 45) { requestAnimationFrame(sample); return; }

      const sorted = samples.slice().sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];

      // Whatever rate this screen is actually delivering, noted for debugging.
      document.documentElement.dataset.hz = String(Math.round(1000 / median));

      /* One plain threshold rather than anything clever. Below about 42
         frames a second the page reads as janky whatever the cause — an old
         phone missing a 60Hz target, or a screen that only refreshes 30 times
         a second in the first place. Either way the answer is the same: keep
         the layout and the content, drop the blur and the decoration. */
      if (median > 24) document.documentElement.classList.add('lite');
    };

    // Wait for load and layout to settle so start-up work isn't mistaken for
    // a slow device.
    const begin = () => setTimeout(() => requestAnimationFrame(sample), 1200);
    if (document.readyState === 'complete') begin();
    else window.addEventListener('load', begin);
  }

  /** Cards, buttons and glass panes light up where the cursor is. */
  function initPointerFX() {
    if (calmRequested()) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const LIT = '.card, .feature, .service, .contact-card, .glass, .search-row, .btn, .map-block';
    const hero = $('.hero');
    const glow = $('.hero-glow');
    let queued = null;
    let frame = 0;

    const apply = () => {
      frame = 0;
      const event = queued;
      if (!event) return;

      const target = event.target.closest ? event.target.closest(LIT) : null;
      if (target) {
        const box = target.getBoundingClientRect();
        target.style.setProperty('--mx', (((event.clientX - box.left) / box.width) * 100).toFixed(1) + '%');
        target.style.setProperty('--my', (((event.clientY - box.top) / box.height) * 100).toFixed(1) + '%');
      }

      // The hero's coloured haze drifts against the pointer, a parallax hint.
      if (glow && hero) {
        const box = hero.getBoundingClientRect();
        if (box.bottom > 0 && box.top < window.innerHeight) {
          glow.style.setProperty('--px', (((event.clientX / window.innerWidth) - .5) * -1).toFixed(3));
          glow.style.setProperty('--py', (((event.clientY / window.innerHeight) - .5) * -1).toFixed(3));
        }
      }
    };

    document.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      queued = event;
      if (frame) return;
      frame = requestAnimationFrame(apply);
    }, { passive: true });
  }

  /* ── Deep links ────────────────────────────────────────────────────────── */
  function copyProductLink(id) {
    copyText(productUrl(id))
      .then(() => toast('Product link copied — paste it into a chat or email'))
      .catch(() => toast('Copy failed — long-press the address to copy it'));
  }

  function openFromHash() {
    const hash = location.hash;
    if (hash.indexOf('#p=') === 0) {
      const id = decodeURIComponent(hash.slice(3));
      if (byId(id)) {
        openModal(id);
      } else {
        toast('That product is no longer listed');
        if (history.replaceState) history.replaceState(null, '', location.pathname);
      }
    } else if (hash === manageHash()) {
      openManage(true);
    }
  }

  /* ── Wiring ────────────────────────────────────────────────────────────── */
  function init() {
    paintSite();
    paintServices();
    paintChips();
    paintInterestOptions();
    paintGrid();
    paintCount();
    paintAttached();
    paintCompareBar();
    initScroll();
    initFrameWatchdog();
    initPointerFX();
    initInstall();
    initServiceWorker();
    paintBuild();
    if (unlocked()) { const chip = $('#manageChip'); if (chip) chip.hidden = false; }
    openFromHash();

    setInterval(paintHours, 60000);   // keep both status badges honest

    // Search: open from the header, the hero, "/" or Ctrl/Cmd+K
    $('#openSearch').addEventListener('click', () => openSearch());
    $('#heroSearch').addEventListener('click', () => openSearch());
    $('#searchClear').addEventListener('click', () => {
      const input = $('#globalSearch');
      input.value = '';
      paintSearch('');
      input.focus();
    });
    $('#searchAll').addEventListener('click', searchInCatalogue);

    let globalTimer;
    $('#globalSearch').addEventListener('input', (e) => {
      const value = e.target.value;
      clearTimeout(globalTimer);
      globalTimer = setTimeout(() => paintSearch(value), 90);
    });

    $('#globalSearch').addEventListener('keydown', (e) => {
      const rows = $$('.search-row', searchOverlay);
      if (e.key === 'ArrowDown') { e.preventDefault(); highlight(searchIndex + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); highlight(searchIndex - 1); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        if (rows.length && searchIndex > -1) runResult(rows[searchIndex]);
        else if (e.target.value.trim()) searchInCatalogue();
      }
    });

    searchOverlay.addEventListener('click', (e) => {
      const suggest = e.target.closest('[data-suggest]');
      if (suggest) {
        const input = $('#globalSearch');
        input.value = suggest.dataset.suggest;
        paintSearch(input.value);
        input.focus();
        return;
      }
      const row = e.target.closest('.search-row');
      if (row) { runResult(row); return; }
      if (e.target.closest('[data-close]')) closeSearch();
    });

    document.addEventListener('keydown', (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || '')) || e.target.isContentEditable;
      if (e.key === '/' && !typing && searchOverlay.hidden) { e.preventDefault(); openSearch(); }
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); openSearch(); }
    });

    // Catalogue controls
    $('#chips').addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      state.category = chip.dataset.cat;
      paintChips();
      paintGrid();
    });

    let searchTimer;
    $('#search').addEventListener('input', (e) => {
      const value = e.target.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => { state.query = value; paintGrid(); }, 130);
    });

    $('#clearSearch').addEventListener('click', () => {
      $('#search').value = '';
      state.query = '';
      paintGrid();
      $('#search').focus();
    });

    $('#sort').addEventListener('change', (e) => { state.sort = e.target.value; paintGrid(); });

    $('#resetFilters').addEventListener('click', () => {
      state.category = 'all'; state.query = ''; state.sort = 'featured';
      $('#search').value = ''; $('#sort').value = 'featured';
      paintChips(); paintGrid();
    });

    // Cards
    $('#grid').addEventListener('click', (e) => {
      const add = e.target.closest('[data-add]');
      if (add) { e.stopPropagation(); toggleInquiry(add.dataset.add); return; }
      const cmp = e.target.closest('[data-compare]');
      if (cmp) { e.stopPropagation(); toggleCompare(cmp.dataset.compare); return; }
      const card = e.target.closest('.card');
      if (card) openModal(card.dataset.id);
    });
    $('#grid').addEventListener('keydown', (e) => {
      const card = e.target.closest('.card');
      if (card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openModal(card.dataset.id); }
    });

    // Product modal: actions, gallery, 360 tabs
    modal.addEventListener('click', (e) => {
      const add = e.target.closest('[data-add]');
      if (add) { toggleInquiry(add.dataset.add); return; }
      const cmp = e.target.closest('[data-compare]');
      if (cmp) { toggleCompare(cmp.dataset.compare); return; }
      const copy = e.target.closest('[data-copy]');
      if (copy) { copyProductLink(copy.dataset.copy); return; }

      const thumb = e.target.closest('[data-photo]');
      if (thumb) {
        const main = $('#viewerMain');
        if (main) main.src = thumb.dataset.photo;
        $$('.thumb', modal).forEach((t) => t.classList.toggle('on', t === thumb));
        const viewer = $('.viewer', modal);
        if (viewer) viewer.dataset.mode = 'photo';
        $$('.vt', modal).forEach((t) => t.setAttribute('aria-pressed', String(t.dataset.view === 'photo')));
        return;
      }

      const tab = e.target.closest('[data-view]');
      if (tab) {
        const viewer = $('.viewer', modal);
        if (viewer) viewer.dataset.mode = tab.dataset.view;
        $$('.vt', modal).forEach((t) => t.setAttribute('aria-pressed', String(t === tab)));
        return;
      }

      if (e.target.closest('[data-close]')) closeModal();
    });

    // Compare
    $('#compareBar').addEventListener('click', (e) => {
      const cmp = e.target.closest('[data-compare]');
      if (cmp) toggleCompare(cmp.dataset.compare);
    });
    $('#compareOpen').addEventListener('click', openCompare);
    $('#compareClear').addEventListener('click', () => {
      state.compare = [];
      paintGrid(); paintCompareBar(); closeCompare();
    });
    compareModal.addEventListener('click', (e) => {
      const add = e.target.closest('[data-add]');
      if (add) { toggleInquiry(add.dataset.add); paintCompareTable(); return; }
      if (e.target.closest('[data-close]')) closeCompare();
    });

    // Inquiry drawer
    drawer.addEventListener('click', (e) => {
      const add = e.target.closest('[data-add]');
      if (add) { toggleInquiry(add.dataset.add); return; }
      if (e.target.closest('[data-close]')) { closeDrawer(); return; }
      if (e.target.id === 'clearList') {
        state.inquiry = []; saveInquiry();
        paintGrid(); paintCount(); paintDrawer(); paintAttached();
        toast('Inquiry list cleared');
      }
      if (e.target.id === 'goForm') {
        closeDrawer();
        $('#contact').scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => $('#fName').focus(), 500);
      }
    });
    $('#openInquiry').addEventListener('click', openDrawer);

    // Manage panel
    const chip = $('#manageChip');
    if (chip) chip.addEventListener('click', () => openManage(false));

    /* A way in that doesn't need an address bar. Installed on a home screen
       the site opens as an app with no way to type #manage-…, so five quick
       taps on the logo asks for the code instead. It is not a second key —
       the code is still required — just a second door. */
    const brand = $('.header-inner .brand');
    if (brand) {
      let taps = 0;
      let timer = null;
      brand.addEventListener('click', (e) => {
        taps++;
        clearTimeout(timer);
        timer = setTimeout(() => { taps = 0; }, 1500);
        if (taps < 5) return;
        taps = 0;
        e.preventDefault();
        openManage(true);
      });
    }

    manage.addEventListener('click', (e) => {
      const copy = e.target.closest('[data-copy]');
      if (copy) { copyProductLink(copy.dataset.copy); return; }
      const edit = e.target.closest('[data-edit]');
      if (edit) { state.editing = edit.dataset.edit; state.draft = null; paintManage(); paintTrays(); return; }
      const del = e.target.closest('[data-delete]');
      if (del) { deleteProduct(del.dataset.delete); return; }
      const delcat = e.target.closest('[data-delcat]');
      if (delcat) { deleteCategory(delcat.dataset.delcat); return; }
      if (e.target.closest('#addProduct')) { state.editing = 'new'; state.draft = null; paintManage(); paintTrays(); return; }
      if (e.target.closest('#addCategory')) { addCategory(); return; }
      if (e.target.closest('#usePublished')) { usePublished(); return; }
      if (e.target.closest('#cancelEdit')) { state.editing = null; state.draft = null; paintManage(); return; }
      if (e.target.closest('#pickPhotos')) { $('#pPhotos').click(); return; }
      if (e.target.closest('#pickSpin')) { $('#pSpin').click(); return; }
      if (e.target.closest('#dropSpin')) { state.draft.spin = []; paintTrays(); return; }

      const dropPhoto = e.target.closest('[data-drop-photo]');
      if (dropPhoto) {
        state.draft.images.splice(Number(dropPhoto.dataset.dropPhoto), 1);
        paintTrays();
        return;
      }
      if (e.target.closest('[data-close]')) closeManage();
    });

    manage.addEventListener('change', (e) => {
      const stockSelect = e.target.closest('[data-stock]');
      if (stockSelect) { setStock(stockSelect.dataset.stock, stockSelect.value); return; }
      const priceInput = e.target.closest('[data-price]');
      if (priceInput) { setField(priceInput.dataset.price, 'price', priceInput.value); return; }
      const wasInput = e.target.closest('[data-was]');
      if (wasInput) { setField(wasInput.dataset.was, 'wasPrice', wasInput.value); return; }

      if (e.target.id === 'pPhotos' && e.target.files.length) {
        toast('Shrinking photos…');
        shrinkAll(e.target.files, 1100, 0.75).then((list) => {
          state.draft.images = state.draft.images.concat(list);
          paintTrays();
          toast(list.length + ' photo' + (list.length === 1 ? '' : 's') + ' added');
        });
      }
      if (e.target.id === 'pSpin' && e.target.files.length) {
        const files = Array.from(e.target.files)
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
          .slice(0, 36);
        toast('Preparing ' + files.length + ' frames…');
        shrinkAll(files, 800, 0.65).then((list) => {
          state.draft.spin = list;
          paintTrays();
          toast(list.length + ' frames ready — the 360° viewer is on');
        });
      }
    });

    manage.addEventListener('submit', (e) => { if (e.target.id === 'editor') submitEditor(e); });

    $('#downloadData').addEventListener('click', downloadDataFile);
    $('#copyData').addEventListener('click', () => {
      copyText(dataFileText())
        .then(() => toast('Copied — paste it over assets/js/data.js'))
        .catch(() => toast('Copy failed — use Download instead'));
    });
    $('#resetCatalogue').addEventListener('click', () => {
      if (!window.confirm('Throw away every change you have made on this device?')) return;
      try { localStorage.removeItem(SHOP_KEY); } catch (e) {}
      loadShop();
      state.inquiry = state.inquiry.filter(byId);
      state.compare = state.compare.filter(byId);
      saveInquiry();
      refreshCatalogueViews();
      paintManage();
      toast('Back to the catalogue in data.js');
    });

    window.addEventListener('hashchange', openFromHash);

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (!searchOverlay.hidden) closeSearch();
      else if (!modal.hidden) closeModal();
      else if (!compareModal.hidden) closeCompare();
      else if (!manage.hidden) closeManage();
      else if (!drawer.hidden) closeDrawer();
      else $('#nav').classList.remove('open');
    });

    // Mobile nav
    const navToggle = $('#navToggle');
    navToggle.addEventListener('click', () => {
      const open = $('#nav').classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    $$('.nav a').forEach((a) => a.addEventListener('click', () => {
      $('#nav').classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }));

    // Footer category shortcuts
    $$('[data-cat-link]').forEach((link) => link.addEventListener('click', () => {
      state.category = link.dataset.catLink;
      state.query = ''; $('#search').value = '';
      paintChips(); paintGrid();
    }));

    $$('#themeToggle, #themeToggleMobile').forEach((btn) => btn.addEventListener('click', toggleTheme));

    // Contact form
    $('#contactForm').addEventListener('submit', submitForm);
    $$('#contactForm input, #contactForm textarea').forEach((input) => {
      input.addEventListener('input', () => {
        if (input.closest('.field').classList.contains('invalid')) validate($('#contactForm'));
      });
    });

    /* Tells the failsafe in index.html that the page painted. Without it, that
       failsafe assumes the worst after eight seconds and shows everything. */
    document.documentElement.classList.add('ready');

    // Said once, on the first visit after an upload goes live.
    if (wentLive) {
      setTimeout(() => toast('Your changes are live — this device is following the published shop again'), 900);
    }
  }

  /* ── Safety net ──────────────────────────────────────────────────────────
     Two things can leave the page without a catalogue: data.js uploaded
     half-finished, or a phone still holding an old broken copy of it in its
     own cache. The second one is the cruel one — the shop fixes the file, the
     site is fine for everybody else, and that one phone keeps showing the
     fault until somebody clears its cache by hand.

     So: ask for the file once more under a name nothing can have cached. If
     that works, the page carries on as normal and the customer never knows.
     If it still fails, fall back to the plain HTML — the shop name, both phone
     numbers, the repair desk, the email, the hours, the address and the map
     links are all written into index.html — and say plainly what happened.
     ─────────────────────────────────────────────────────────────────────── */
  function whenReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  let refetched = false;

  function bootOrRecover() {
    if (catalogueLoaded()) {
      try { init(); } catch (err) { degrade(err); }
      return;
    }
    if (refetched) { degrade('data.js still unreadable after a fresh fetch'); return; }
    refetched = true;

    const fresh = document.createElement('script');
    fresh.src = 'assets/js/data.js?fresh=' + Date.now();
    // A syntax error still fires load, so re-check rather than trust it.
    fresh.onload  = () => { if (catalogueLoaded()) loadShop(); bootOrRecover(); };
    fresh.onerror = () => degrade('data.js could not be fetched');
    document.head.appendChild(fresh);
  }

  /** Throw away every cached copy of the site on this device, then reload. */
  function hardRefresh() {
    const jobs = [];
    if (window.caches && caches.keys) {
      jobs.push(caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))));
    }
    if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
      jobs.push(navigator.serviceWorker.getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.unregister()))));
    }
    Promise.all(jobs.map((j) => j.catch(() => null)))
      .then(() => location.replace(location.pathname + '?reload=' + Date.now()));
  }

  function degrade(reason) {
    document.documentElement.classList.remove('js');   // reveal every section
    try { console.error('HOMCOM:', reason); } catch (e) {}
    if (document.getElementById('dataError')) return;

    // Filters, sort, search and the inquiry form all need the catalogue to do
    // anything, so hide them rather than leave dead controls on the page. The
    // contact cards and the map stay: those are plain links in index.html and
    // work with no scripts at all. `display` is set directly because several of
    // these carry a display rule of their own.
    document.querySelectorAll(
      '#catalogue .controls, #openSearch, #heroSearch, #compareBar, #contactForm,' +
      ' #installBtnNav, .hero-stats'
    ).forEach((el) => { el.style.display = 'none'; });

    const notice = document.createElement('div');
    notice.id = 'dataError';
    notice.className = 'data-error';
    notice.setAttribute('role', 'status');
    notice.innerHTML =
      '<strong>The product list could not be loaded.</strong>' +
      '<span>Everything else on this page still works. Call, WhatsApp or email us ' +
      'and we will confirm stock and prices right away.</span>' +
      '<span class="data-error-actions">' +
        '<button type="button" class="btn btn-primary btn-small" id="dataErrorRetry">Try again</button>' +
        '<a class="btn btn-ghost btn-small" href="https://wa.me/254724359797" target="_blank" rel="noopener">WhatsApp us</a>' +
        '<a class="btn btn-ghost btn-small" href="tel:+254724359797">Call the shop</a>' +
      '</span>' +
      '<span class="data-error-owner">Shop owner: <code>assets/js/data.js</code> was ' +
      'uploaded incomplete. Paste the whole exported file over it — from the first ' +
      'line to the last — then refresh.</span>';

    const grid = document.getElementById('grid');
    if (grid && grid.parentNode) grid.parentNode.insertBefore(notice, grid);
    else document.body.insertBefore(notice, document.body.firstChild);

    const retry = document.getElementById('dataErrorRetry');
    if (retry) retry.addEventListener('click', () => {
      retry.disabled = true;
      retry.textContent = 'Reloading…';
      hardRefresh();
    });
  }

  whenReady(bootOrRecover);
})();
