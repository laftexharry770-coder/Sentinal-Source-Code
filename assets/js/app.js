/* ==========================================================================
   app.js — behaviour. Everything you change day to day lives in data.js,
   or in the "Manage catalogue" panel on the site itself.
   ========================================================================== */
(function () {
  'use strict';

  /* ── Helpers ───────────────────────────────────────────────────────────── */
  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /** Escape anything that comes from data.js before putting it in the DOM. */
  const esc = (value) => String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const clone = (value) => JSON.parse(JSON.stringify(value));

  const money = (amount) => {
    if (amount == null || amount === '') return 'Price on request';
    try {
      return SITE.currency + ' ' + Number(amount).toLocaleString(SITE.locale || 'en-US');
    } catch (e) {
      return SITE.currency + ' ' + amount;
    }
  };

  const catLabel = (key) => {
    const found = CATEGORIES.find((c) => c.key === key);
    return found ? found.label : key;
  };

  const digits = (value) => String(value || '').replace(/\D/g, '');

  const prettyPhone = (value) => {
    const d = digits(value);
    if (d.length === 12) return '+' + d.slice(0, 3) + ' ' + d.slice(3, 6) + ' ' + d.slice(6, 9) + ' ' + d.slice(9);
    return '+' + d;
  };

  const waNumber = () => digits(SITE.whatsapp || (SITE.phones && SITE.phones[0] && SITE.phones[0].number));

  const waLink  = (text) => 'https://wa.me/' + waNumber() + (text ? '?text=' + encodeURIComponent(text) : '');
  const telLink = (value) => 'tel:+' + digits(value || (SITE.phones && SITE.phones[0] && SITE.phones[0].number));
  const mailLink = (subject, body) =>
    'mailto:' + SITE.email +
    '?subject=' + encodeURIComponent(subject || ('Inquiry — ' + SITE.brand)) +
    (body ? '&body=' + encodeURIComponent(body) : '');

  /* ── Placeholder artwork (used when a product has no photo) ─────────────── */
  const ICONS = {
    computers: '<svg viewBox="0 0 64 48"><rect x="6" y="4" width="52" height="34" rx="3"/><path d="M2 44h60M26 38h12"/></svg>',
    'computer-accessories': '<svg viewBox="0 0 64 48"><rect x="4" y="10" width="56" height="28" rx="4"/><path d="M12 18h8M24 18h8M36 18h8M48 18h4M12 26h4M20 26h24M48 26h4M20 33h24"/></svg>',
    phones: '<svg viewBox="0 0 64 48"><rect x="21" y="2" width="22" height="44" rx="4"/><path d="M28 7h8M29 41h6"/></svg>',
    'phone-accessories': '<svg viewBox="0 0 64 48"><rect x="14" y="8" width="36" height="32" rx="6"/><path d="M22 20v8M42 20v8M28 16h8v16h-8z"/></svg>',
    fallback: '<svg viewBox="0 0 64 48"><rect x="8" y="8" width="48" height="32" rx="4"/><path d="M8 30l12-10 10 8 8-6 18 12"/></svg>'
  };
  const art = (product) => ICONS[product.category] || ICONS.fallback;

  const media = (product, className) => product.image
    ? '<img src="' + esc(product.image) + '" alt="' + esc(product.name) + '" loading="lazy" />'
    : '<div class="' + (className || 'ph') + '">' + art(product) + '</div>';

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

  /* ── Storage ───────────────────────────────────────────────────────────── */
  const CAT_KEY     = 'homcom-catalogue';
  const INQUIRY_KEY = 'homcom-inquiry';
  const MAX_COMPARE = 4;

  /** The live catalogue: your saved edits if there are any, else data.js. */
  let catalogue = loadCatalogue();

  function loadCatalogue() {
    try {
      const saved = JSON.parse(localStorage.getItem(CAT_KEY) || 'null');
      if (Array.isArray(saved) && saved.length) return saved;
    } catch (e) {}
    return clone(PRODUCTS);
  }
  function saveCatalogue() {
    try { localStorage.setItem(CAT_KEY, JSON.stringify(catalogue)); } catch (e) {}
  }
  function isEdited() {
    try { return localStorage.getItem(CAT_KEY) != null; } catch (e) { return false; }
  }
  function byId(id) { return catalogue.find((p) => p.id === id); }

  const state = {
    category: 'all',
    query: '',
    sort: 'featured',
    inquiry: loadInquiry(),
    compare: [],
    editing: null            // product id being edited in the manage panel, or 'new'
  };

  function loadInquiry() {
    try {
      const raw = JSON.parse(localStorage.getItem(INQUIRY_KEY) || '[]');
      return Array.isArray(raw) ? raw.filter((id) => byId(id)) : [];
    } catch (e) { return []; }
  }
  function saveInquiry() {
    try { localStorage.setItem(INQUIRY_KEY, JSON.stringify(state.inquiry)); } catch (e) {}
  }

  const stockOf = (product) => (STOCK[product.stock] ? product.stock : 'in');

  /** A shareable web address that opens straight onto one product. */
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

  /* ── Opening hours ─────────────────────────────────────────────────────── */
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
    // Intl gives 24-hour clock here, but midnight can come back as "24".
    const hour = Number(get('hour')) % 24;
    return {
      index: index < 0 ? 0 : index,
      minutes: hour * 60 + Number(get('minute') || 0)
    };
  }

  const rangeFor = (index) => {
    const range = (SITE.hours || {})[DAYS[(index + 7) % 7].key];
    return Array.isArray(range) && range.length === 2 ? range : null;
  };

  /** Are we open right now, and what's the next thing to happen? */
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

  /** "Mon – Fri 7:00am – 10:00pm" style rows, merging days that match. */
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
    return rows.map((row) => ({
      days: row.to ? row.from + ' – ' + row.to : row.from,
      text: row.text,
      indexes: row.indexes
    }));
  }

  function paintHours() {
    const status = openStatus();
    const now = shopNow();

    $$('[data-status-pill]').forEach((pill) => {
      pill.classList.toggle('is-open', status.open);
      pill.classList.toggle('is-closed', !status.open);
      pill.innerHTML = '<span class="status-dot"></span><span class="status-text">' +
        esc(status.label) + '</span>';
      pill.title = status.label + (status.detail ? ' · ' + status.detail : '');
    });

    $$('[data-status-detail]').forEach((el) => { el.textContent = status.detail; });
    $$('[data-status-label]').forEach((el) => { el.textContent = status.label; });
    $$('[data-status-full]').forEach((el) => {
      el.textContent = status.label + (status.detail ? ' · ' + status.detail.toLowerCase() : '');
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

    const hello = 'Hi ' + SITE.brand + ', I saw your website and I have a question about ';

    // Phone cards — one per number in data.js.
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
            '<em data-status-full></em>' +
          '</span>' +
          '<svg class="contact-arrow" viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg>' +
        '</a>').join('');
    }

    const wa = $('#cardWhatsapp');
    if (wa) {
      wa.href = waLink(hello + 'one of your products.');
      const number = $('[data-site="whatsappNumber"]');
      if (number) number.textContent = prettyPhone(waNumber());
    }
    const mail = $('#cardEmail');
    if (mail) mail.href = mailLink('Product inquiry', hello);

    const fWa = $('[data-site="linkWhatsapp"]');
    if (fWa) fWa.href = waLink(hello + 'one of your products.');
    const fTel = $('[data-site="linkPhone"]');
    if (fTel) fTel.href = telLink();
    const fMail = $('[data-site="linkEmail"]');
    if (fMail) fMail.href = mailLink('Product inquiry', hello);

    const repairCta = $('#repairCta');
    if (repairCta) repairCta.href = waLink('Hi ' + SITE.brand + ', I need a repair. My device is ');

    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
    const stat = $('#statCount');
    if (stat) stat.textContent = catalogue.length;

    paintHours();
    paintMap();
  }

  /* ── Google Maps ───────────────────────────────────────────────────────── */
  function paintMap() {
    const query = encodeURIComponent(SITE.mapQuery || SITE.address || SITE.location || '');
    if (!query) return;

    // The embed needs no API key; `output=embed` is the public map viewer.
    const frame = $('#mapFrame');
    if (frame) frame.src = 'https://www.google.com/maps?q=' + query + '&hl=en&z=16&output=embed';

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
        '<a class="btn btn-ghost btn-small" target="_blank" rel="noopener" href="' + esc(waLink(ask)) + '">' +
          'Ask about this repair</a>' +
      '</article>';
    }).join('');
  }

  /* ── Filter chips ──────────────────────────────────────────────────────── */
  function paintChips() {
    $('#chips').innerHTML = CATEGORIES.map((c) => {
      const n = c.key === 'all' ? catalogue.length : catalogue.filter((p) => p.category === c.key).length;
      return '<button type="button" class="chip" data-cat="' + esc(c.key) + '" aria-pressed="' +
        (state.category === c.key) + '">' + esc(c.label) +
        '<span class="chip-n">' + n + '</span></button>';
    }).join('');
  }

  function paintInterestOptions() {
    const select = $('#fInterest');
    if (!select) return;
    select.innerHTML =
      '<option value="General question">General question</option>' +
      CATEGORIES.filter((c) => c.key !== 'all')
        .map((c) => '<option value="' + esc(c.label) + '">' + esc(c.label) + '</option>').join('') +
      '<option value="Repair">A repair</option>' +
      '<option value="Something not listed">Something not listed</option>';
  }

  /* ── Catalogue ─────────────────────────────────────────────────────────── */
  function visibleProducts() {
    const q = state.query.trim().toLowerCase();
    let list = catalogue.filter((p) => {
      const inCat = state.category === 'all' || p.category === state.category;
      if (!inCat) return false;
      if (!q) return true;
      const haystack = [p.name, p.desc, catLabel(p.category), p.tag,
        Object.entries(p.specs || {}).map(([k, v]) => k + ' ' + v).join(' ')
      ].join(' ').toLowerCase();
      return q.split(/\s+/).every((word) => haystack.includes(word));
    });

    const price = (p) => (p.price == null ? Infinity : Number(p.price));
    if (state.sort === 'price-asc')  list = list.slice().sort((a, b) => price(a) - price(b));
    if (state.sort === 'price-desc') list = list.slice().sort((a, b) => price(b) - price(a));
    if (state.sort === 'name')       list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }

  function cardHTML(p, index) {
    const stock = STOCK[stockOf(p)];
    const added = state.inquiry.includes(p.id);
    const comparing = state.compare.includes(p.id);
    const tagCls = p.tag === 'Refurbished' ? 'tag warn' : (p.tag === 'Deal' ? 'tag soft' : 'tag');
    const keySpecs = Object.values(p.specs || {}).slice(0, 3);

    return (
      '<article class="card" data-id="' + esc(p.id) + '" tabindex="0" role="button" ' +
        'aria-label="View details for ' + esc(p.name) + '" style="animation-delay:' + Math.min(index * 35, 400) + 'ms">' +
        '<div class="card-media">' +
          (p.tag ? '<span class="' + tagCls + '">' + esc(p.tag) + '</span>' : '') +
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
            '<span class="price">' + esc(money(p.price)) +
              (p.price != null ? '<small>incl. VAT</small>' : '') + '</span>' +
            '<span class="card-tools">' +
              '<button type="button" class="card-add' + (comparing ? ' compare-on' : '') + '" data-compare="' + esc(p.id) + '" ' +
                'aria-pressed="' + comparing + '" ' +
                'aria-label="' + (comparing ? 'Remove from' : 'Add to') + ' comparison" ' +
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

    const total = state.category === 'all'
      ? catalogue.length
      : catalogue.filter((p) => p.category === state.category).length;
    $('#resultCount').textContent = list.length
      ? 'Showing ' + list.length + ' of ' + total + ' product' + (total === 1 ? '' : 's')
      : '';

    $('#clearSearch').hidden = !state.query;
    const stat = $('#statCount');
    if (stat) stat.textContent = catalogue.length;
  }

  /* ── Product modal ─────────────────────────────────────────────────────── */
  const modal = $('#modal');
  let lastFocused = null;

  function openModal(id) {
    const p = byId(id);
    if (!p) return;
    const stock = STOCK[stockOf(p)];
    const added = state.inquiry.includes(p.id);
    const comparing = state.compare.includes(p.id);
    const askText = 'Hi ' + SITE.brand + ', I\'m interested in the ' + p.name +
      ' (' + money(p.price) + '). Is it available?';

    $('#modalBody').innerHTML =
      '<div class="modal-grid">' +
        '<div class="modal-media">' + media(p) + '</div>' +
        '<div class="modal-info">' +
          '<span class="card-cat">' + esc(catLabel(p.category)) + '</span>' +
          '<h3 id="modalTitle">' + esc(p.name) + '</h3>' +
          '<p class="modal-price">' + esc(money(p.price)) + '</p>' +
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
    const close = $('.modal-close', modal);
    if (close) close.focus();
  }

  function closeModal() {
    modal.hidden = true;
    if (history.replaceState && location.hash.indexOf('#p=') === 0) {
      history.replaceState(null, '', location.pathname + location.search);
    }
    if (!$('#drawer').hidden) return;
    document.body.classList.remove('no-scroll');
    if (lastFocused) lastFocused.focus();
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
        '<button type="button" data-compare="' + esc(p.id) + '" aria-label="Remove ' + esc(p.name) + ' from comparison">&times;</button>' +
      '</span>').join('') +
      (items.length < 2 ? '<span class="compare-hint">Pick one more to compare</span>' : '');

    $('#compareCount').textContent = items.length;
    $('#compareOpen').disabled = items.length < 2;
  }

  function paintCompareTable() {
    const items = compareProducts();
    if (items.length < 2) return;

    // Every spec key any of the chosen products mentions, in first-seen order.
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
      '<span class="price">' + esc(money(p.price)) + '</span>' +
      (prices[i] === cheapest && isFinite(cheapest) && differs(prices)
        ? ' <span class="pill-lowest">Lowest</span>' : ''));

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

    $('#compareTable').innerHTML = head + '<tbody>' +
      row('Price', priceCells, differs(prices)) +
      row('Availability', stockCells, differs(items.map(stockOf))) +
      specRows +
      row('', actionCells, false) +
      '</tbody>';
  }

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

    body.innerHTML = items.map((p) =>
      '<div class="line-item">' +
        '<span class="line-media">' + media(p, 'ph') + '</span>' +
        '<span class="line-info">' +
          '<strong>' + esc(p.name) + '</strong>' +
          '<span>' + esc(money(p.price)) + '</span>' +
        '</span>' +
        '<button class="line-remove" type="button" data-add="' + esc(p.id) + '" aria-label="Remove ' + esc(p.name) + '">&times;</button>' +
      '</div>').join('');

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

  /* ── Manage catalogue ──────────────────────────────────────────────────────
     Add, edit, reprice, restock and delete products. Changes apply to this
     page immediately and are saved in this browser. "Download data.js" writes
     a fresh file to upload, which is what makes them live for everyone.
     ------------------------------------------------------------------------ */
  const manage = $('#manage');

  const slug = (text) => String(text).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'product';

  function uniqueId(base, ignoreId) {
    let id = slug(base);
    let n = 2;
    while (catalogue.some((p) => p.id === id && p.id !== ignoreId)) id = slug(base) + '-' + n++;
    return id;
  }

  const specsToText = (specs) => Object.entries(specs || {})
    .map(([k, v]) => k + ': ' + v).join('\n');

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

    const banner = isEdited()
      ? '<div class="manage-banner edited">' +
          '<strong>You have unpublished edits.</strong> They show on this device now. ' +
          'Use <em>Download data.js</em> below, upload that file, and everyone sees them.' +
        '</div>'
      : '<div class="manage-banner">' +
          'Showing the catalogue exactly as it is in <code>data.js</code>. ' +
          'Any change you make here is saved on this device straight away.' +
        '</div>';

    const groups = CATEGORIES.filter((c) => c.key !== 'all').map((cat) => {
      const items = catalogue.filter((p) => p.category === cat.key);
      if (!items.length) return '';
      return '<section class="manage-group"><h3>' + esc(cat.label) +
        '<span class="group-n">' + items.length + '</span></h3>' +
        items.map((p) =>
          '<div class="manage-row">' +
            '<span class="line-media">' + media(p, 'ph') + '</span>' +
            '<span class="line-info">' +
              '<strong>' + esc(p.name) + '</strong>' +
              '<span class="manage-controls">' +
                '<label class="price-field">' + esc(SITE.currency) +
                  '<input type="number" min="0" step="1" value="' + (p.price == null ? '' : esc(p.price)) + '" ' +
                    'data-price="' + esc(p.id) + '" placeholder="Ask" ' +
                    'aria-label="Price for ' + esc(p.name) + '" />' +
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
                '<path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>' +
              '</button>' +
              '<button type="button" class="tool-btn" data-edit="' + esc(p.id) + '" title="Edit everything" ' +
                'aria-label="Edit ' + esc(p.name) + '">' +
                '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>' +
              '</button>' +
              '<button type="button" class="tool-btn danger" data-delete="' + esc(p.id) + '" title="Remove from the catalogue" ' +
                'aria-label="Delete ' + esc(p.name) + '">' +
                '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13"/></svg>' +
              '</button>' +
            '</span>' +
          '</div>').join('') + '</section>';
    }).join('');

    body.innerHTML = banner +
      '<button type="button" class="btn btn-primary btn-block" id="addProduct">' +
        '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg> Add a product</button>' +
      groups;
  }

  function editorHTML(product) {
    const p = product || { name: '', category: 'computers', price: '', desc: '', specs: {}, tag: '', stock: 'in', image: '' };
    const tags = ['', 'New', 'Best seller', 'Deal', 'Refurbished', 'Built to order'];
    return '<form class="editor" id="editor" data-id="' + esc(product ? product.id : '') + '">' +
      '<h3>' + (product ? 'Edit product' : 'New product') + '</h3>' +
      '<div class="field"><label for="pName">Name</label>' +
        '<input id="pName" required value="' + esc(p.name) + '" placeholder="Logitech M170 Wireless Mouse" /></div>' +
      '<div class="field-row">' +
        '<div class="field"><label for="pCategory">Category</label><select id="pCategory">' +
          CATEGORIES.filter((c) => c.key !== 'all').map((c) =>
            '<option value="' + esc(c.key) + '"' + (c.key === p.category ? ' selected' : '') + '>' +
              esc(c.label) + '</option>').join('') +
        '</select></div>' +
        '<div class="field"><label for="pPrice">Price (' + esc(SITE.currency) + ')</label>' +
          '<input id="pPrice" type="number" min="0" step="1" value="' + (p.price == null ? '' : esc(p.price)) + '" ' +
            'placeholder="Leave empty for &quot;Price on request&quot;" /></div>' +
      '</div>' +
      '<div class="field-row">' +
        '<div class="field"><label for="pStock">Availability</label><select id="pStock">' +
          ['in', 'low', 'out'].map((key) =>
            '<option value="' + key + '"' + (key === p.stock ? ' selected' : '') + '>' +
              STOCK[key].label + '</option>').join('') +
        '</select></div>' +
        '<div class="field"><label for="pTag">Badge</label><select id="pTag">' +
          tags.map((t) => '<option value="' + esc(t) + '"' + (t === (p.tag || '') ? ' selected' : '') + '>' +
            (t || 'No badge') + '</option>').join('') +
        '</select></div>' +
      '</div>' +
      '<div class="field"><label for="pDesc">Short description</label>' +
        '<textarea id="pDesc" rows="2" placeholder="One or two lines shown on the card.">' + esc(p.desc) + '</textarea></div>' +
      '<div class="field"><label for="pSpecs">Specs — one per line, as <code>Label: value</code></label>' +
        '<textarea id="pSpecs" rows="6" placeholder="Connection: 2.4GHz USB receiver&#10;Battery: Up to 12 months&#10;Warranty: 12 months">' +
          esc(specsToText(p.specs)) + '</textarea></div>' +
      '<div class="field"><label for="pImage">Photo (optional)</label>' +
        '<input id="pImage" value="' + esc(p.image) + '" placeholder="assets/img/mouse.jpg" /></div>' +
      '<div class="editor-actions">' +
        '<button type="submit" class="btn btn-primary">' + (product ? 'Save changes' : 'Add to catalogue') + '</button>' +
        '<button type="button" class="btn btn-ghost" id="cancelEdit">Cancel</button>' +
      '</div>' +
    '</form>';
  }

  function submitEditor(event) {
    event.preventDefault();
    const form = event.target;
    const existingId = form.dataset.id;
    const name = $('#pName').value.trim();
    if (!name) { $('#pName').focus(); return; }

    const priceRaw = $('#pPrice').value.trim();
    const product = {
      id: existingId || uniqueId(name),
      name: name,
      category: $('#pCategory').value,
      price: priceRaw === '' ? null : Number(priceRaw),
      desc: $('#pDesc').value.trim(),
      specs: textToSpecs($('#pSpecs').value),
      tag: $('#pTag').value,
      stock: $('#pStock').value,
      image: $('#pImage').value.trim()
    };

    if (existingId) {
      const index = catalogue.findIndex((p) => p.id === existingId);
      if (index > -1) catalogue[index] = product;
      toast(product.name + ' updated');
    } else {
      catalogue.push(product);
      toast(product.name + ' added to the catalogue');
    }

    saveCatalogue();
    state.editing = null;
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
    saveCatalogue();
    saveInquiry();
    refreshCatalogueViews();
    paintManage();
    toast(product.name + ' removed');
  }

  function setPrice(id, value) {
    const product = byId(id);
    if (!product) return;
    const trimmed = String(value).trim();
    product.price = trimmed === '' ? null : Number(trimmed);
    saveCatalogue();
    refreshCatalogueViews();
  }

  function setStock(id, value) {
    const product = byId(id);
    if (!product) return;
    product.stock = value;
    saveCatalogue();
    refreshCatalogueViews();
    const select = $('[data-stock="' + id + '"]');
    if (select) select.dataset.value = value;
    toast(product.name + ' → ' + STOCK[value].label);
  }

  /** Repaint everything that reads from the catalogue. */
  function refreshCatalogueViews() {
    paintChips();
    paintGrid();
    paintCount();
    paintAttached();
    paintCompareBar();
    if (!drawer.hidden) paintDrawer();
    if (!compareModal.hidden && state.compare.length > 1) paintCompareTable();
  }

  /** A complete, ready-to-upload data.js built from what's on screen now. */
  function dataFileText() {
    const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    return '/* ==========================================================================\n' +
      '   data.js — exported from the Manage catalogue panel on ' + stamp + '.\n' +
      '   Replace assets/js/data.js with this file and upload it to publish\n' +
      '   these prices and stock levels to everyone.\n' +
      '   ========================================================================== */\n\n' +
      'const SITE = ' + JSON.stringify(SITE, null, 2) + ';\n\n' +
      'const SERVICES = ' + JSON.stringify(typeof SERVICES === 'undefined' ? [] : SERVICES, null, 2) + ';\n\n' +
      'const PRODUCTS = ' + JSON.stringify(catalogue, null, 2) + ';\n\n' +
      'const CATEGORIES = ' + JSON.stringify(CATEGORIES, null, 2) + ';\n';
  }

  function downloadDataFile() {
    const blob = new Blob([dataFileText()], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.js';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('data.js downloaded — put it in assets/js/ and upload');
  }

  function openManage() {
    if (SITE.managePin) {
      const entered = window.prompt('Enter your management code');
      if (entered === null) return;
      if (String(entered).trim() !== String(SITE.managePin)) { toast('Wrong code'); return; }
    }
    state.editing = null;
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
    document.body.classList.remove('no-scroll');
    if (history.replaceState && location.hash === '#manage') {
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
    const body = inquiryMessage(data);

    // Optional silent copy to Formspree (or any endpoint) if one is configured.
    if (SITE.formEndpoint) {
      fetch(SITE.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.assign({}, data, {
          products: inquiryProducts().map((p) => p.name).join(', ')
        }))
      }).catch(function () { /* the WhatsApp/email hand-off below still works */ });
    }

    if (channel === 'email') {
      window.location.href = mailLink('Inquiry from ' + data.name, body);
    } else {
      window.open(waLink(body), '_blank', 'noopener');
    }
    toast('Opening ' + (channel === 'email' ? 'your email app' : 'WhatsApp') + '…');
  }

  /* ── Toast ─────────────────────────────────────────────────────────────── */
  let toastTimer;
  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  /* ── Theme ─────────────────────────────────────────────────────────────── */
  function toggleTheme() {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('homcom-theme', next); } catch (e) {}
  }

  /* ── Scroll behaviour ──────────────────────────────────────────────────── */
  function initScroll() {
    const header = $('.site-header');
    const sections = ['catalogue', 'repairs', 'contact'].map((id) => $('#' + id)).filter(Boolean);

    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 8);
      let current = '';
      sections.forEach((section) => {
        if (window.scrollY >= section.offsetTop - 120) current = section.id;
      });
      $$('.nav a').forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
      $$('.reveal').forEach((el) => io.observe(el));
    } else {
      $$('.reveal').forEach((el) => el.classList.add('in'));
    }
  }

  /* ── Deep links ────────────────────────────────────────────────────────── */
  function copyProductLink(id) {
    copyText(productUrl(id))
      .then(() => toast('Product link copied — paste it into a chat or email'))
      .catch(() => toast('Copy failed — long-press the address to copy it'));
  }

  /** #p=<id> opens that product; #manage opens the catalogue panel. */
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
    } else if (hash === '#manage') {
      openManage();
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
    openFromHash();

    // Keep the open/closed badge honest without a page refresh.
    setInterval(paintHours, 60000);

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

    // Cards: open details, add to inquiry, or add to comparison
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

    // Product modal
    modal.addEventListener('click', (e) => {
      const add = e.target.closest('[data-add]');
      if (add) { toggleInquiry(add.dataset.add); return; }
      const cmp = e.target.closest('[data-compare]');
      if (cmp) { toggleCompare(cmp.dataset.compare); return; }
      const copy = e.target.closest('[data-copy]');
      if (copy) { copyProductLink(copy.dataset.copy); return; }
      if (e.target.closest('[data-close]')) closeModal();
    });

    // Compare bar + table
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

    // Manage catalogue
    $$('[data-open-manage]').forEach((btn) => btn.addEventListener('click', openManage));
    manage.addEventListener('click', (e) => {
      const copy = e.target.closest('[data-copy]');
      if (copy) { copyProductLink(copy.dataset.copy); return; }
      const edit = e.target.closest('[data-edit]');
      if (edit) { state.editing = edit.dataset.edit; paintManage(); return; }
      const del = e.target.closest('[data-delete]');
      if (del) { deleteProduct(del.dataset.delete); return; }
      if (e.target.closest('#addProduct')) { state.editing = 'new'; paintManage(); return; }
      if (e.target.closest('#cancelEdit')) { state.editing = null; paintManage(); return; }
      if (e.target.closest('[data-close]')) closeManage();
    });
    manage.addEventListener('change', (e) => {
      const stockSelect = e.target.closest('[data-stock]');
      if (stockSelect) setStock(stockSelect.dataset.stock, stockSelect.value);
      const priceInput = e.target.closest('[data-price]');
      if (priceInput) setPrice(priceInput.dataset.price, priceInput.value);
    });
    manage.addEventListener('submit', (e) => {
      if (e.target.id === 'editor') submitEditor(e);
    });
    $('#downloadData').addEventListener('click', downloadDataFile);
    $('#copyData').addEventListener('click', () => {
      copyText(dataFileText())
        .then(() => toast('Copied — paste it over assets/js/data.js'))
        .catch(() => toast('Copy failed — use Download instead'));
    });
    $('#resetCatalogue').addEventListener('click', () => {
      if (!window.confirm('Throw away every change you have made on this device?')) return;
      try { localStorage.removeItem(CAT_KEY); } catch (e) {}
      catalogue = clone(PRODUCTS);
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
      if (!modal.hidden) closeModal();
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
