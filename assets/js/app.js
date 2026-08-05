/* ==========================================================================
   app.js — behaviour. You shouldn't need to edit this file to run the shop;
   everything you change day to day lives in data.js.
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

  const prettyPhone = (digits) => {
    const d = String(digits || '').replace(/\D/g, '');
    if (d.length === 12) return '+' + d.slice(0, 3) + ' ' + d.slice(3, 6) + ' ' + d.slice(6, 9) + ' ' + d.slice(9);
    return '+' + d;
  };

  const waLink  = (text) => 'https://wa.me/' + String(SITE.phone).replace(/\D/g, '') +
                            (text ? '?text=' + encodeURIComponent(text) : '');
  const telLink = () => 'tel:+' + String(SITE.phone).replace(/\D/g, '');
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

  const STOCK = {
    in:  { text: 'In stock',         cls: '',    label: 'In stock' },
    low: { text: 'Low stock',        cls: 'low', label: 'Low stock' },
    out: { text: 'Order on request', cls: 'out', label: 'Out of stock' }
  };

  /* ── State ─────────────────────────────────────────────────────────────── */
  const STORE_KEY   = 'sentinal-inquiry';
  const STOCK_KEY   = 'sentinal-stock';
  const MAX_COMPARE = 4;

  const state = {
    category: 'all',
    query: '',
    sort: 'featured',
    inquiry: load(STORE_KEY, []),
    compare: [],
    overrides: load(STOCK_KEY, {})
  };

  function load(key, fallback) {
    try {
      const raw = JSON.parse(localStorage.getItem(key) || 'null');
      if (raw == null) return fallback;
      if (Array.isArray(fallback)) {
        // Drop ids that no longer exist in the catalogue.
        return Array.isArray(raw) ? raw.filter((id) => PRODUCTS.some((p) => p.id === id)) : fallback;
      }
      return typeof raw === 'object' ? raw : fallback;
    } catch (e) { return fallback; }
  }
  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state.inquiry));
      localStorage.setItem(STOCK_KEY, JSON.stringify(state.overrides));
    } catch (e) {}
  }

  /** Availability, most specific first: your browser → data.js overrides → the product. */
  function stockOf(product) {
    const overrides = typeof STOCK_OVERRIDES === 'object' && STOCK_OVERRIDES ? STOCK_OVERRIDES : {};
    const key = state.overrides[product.id] || overrides[product.id] || product.stock || 'in';
    return STOCK[key] ? key : 'in';
  }

  /** A shareable web address that opens straight onto one product. */
  function productUrl(id) {
    return location.origin + location.pathname + '#p=' + encodeURIComponent(id);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
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

  /* ── Site details injected from data.js ────────────────────────────────── */
  function paintSite() {
    document.title = SITE.brand + ' — Computers, Phones & Accessories';
    $$('[data-site="brand"]').forEach((el) => { el.textContent = SITE.brand; });
    $$('[data-site="tagline"]').forEach((el) => { el.textContent = SITE.tagline; });
    $$('[data-site="email"]').forEach((el) => { el.textContent = SITE.email; });
    $$('[data-site="location"]').forEach((el) => { el.textContent = SITE.location; });
    $$('[data-site="hours"]').forEach((el) => { el.textContent = SITE.hours; });
    $$('[data-site="phoneDisplay"]').forEach((el) => { el.textContent = prettyPhone(SITE.phone); });

    const hello = 'Hi ' + SITE.brand + ', I saw your website and I have a question about ';

    const wa = $('#cardWhatsapp');
    if (wa) wa.href = waLink(hello + 'one of your products.');
    const call = $('#cardCall');
    if (call) call.href = telLink();
    const mail = $('#cardEmail');
    if (mail) mail.href = mailLink('Product inquiry', hello);

    const fWa = $('[data-site="linkWhatsapp"]');
    if (fWa) fWa.href = waLink(hello + 'one of your products.');
    const fTel = $('[data-site="linkPhone"]');
    if (fTel) fTel.href = telLink();
    const fMail = $('[data-site="linkEmail"]');
    if (fMail) fMail.href = mailLink('Product inquiry', hello);

    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
    const stat = $('#statCount');
    if (stat) stat.textContent = PRODUCTS.length;

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

  /* ── Filter chips ──────────────────────────────────────────────────────── */
  function paintChips() {
    const chips = $('#chips');
    chips.innerHTML = CATEGORIES.map((c) => {
      const n = c.key === 'all' ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === c.key).length;
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
      '<option value="Something not listed">Something not listed</option>';
  }

  /* ── Catalogue ─────────────────────────────────────────────────────────── */
  function visibleProducts() {
    const q = state.query.trim().toLowerCase();
    let list = PRODUCTS.filter((p) => {
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
      ? PRODUCTS.length
      : PRODUCTS.filter((p) => p.category === state.category).length;
    $('#resultCount').textContent = list.length
      ? 'Showing ' + list.length + ' of ' + total + ' product' + (total === 1 ? '' : 's')
      : '';

    $('#clearSearch').hidden = !state.query;
  }

  /* ── Product modal ─────────────────────────────────────────────────────── */
  const modal = $('#modal');
  let lastFocused = null;

  function openModal(id) {
    const p = PRODUCTS.find((x) => x.id === id);
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

  function compareProducts() {
    return state.compare.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
  }

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
      '<span class="price' + (prices[i] === cheapest && isFinite(cheapest) ? ' best' : '') + '">' +
        esc(money(p.price)) + '</span>' +
      (prices[i] === cheapest && isFinite(cheapest) && differs(prices)
        ? ' <span class="tag soft" style="position:static;display:inline-block;margin-left:6px">Lowest</span>' : ''));

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
    const product = PRODUCTS.find((p) => p.id === id);
    if (i > -1) {
      state.inquiry.splice(i, 1);
      toast(product ? product.name + ' removed' : 'Removed');
    } else {
      state.inquiry.push(id);
      toast(product ? product.name + ' added to your inquiry' : 'Added');
    }
    save();
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

  function inquiryProducts() {
    return state.inquiry.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
  }

  function inquiryTotal() {
    return inquiryProducts().reduce((sum, p) => sum + (p.price == null ? 0 : Number(p.price)), 0);
  }

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

  /* ── Stock manager ─────────────────────────────────────────────────────── */
  const manage = $('#manage');

  function paintManage() {
    const body = $('#manageBody');
    const groups = CATEGORIES.filter((c) => c.key !== 'all');

    body.innerHTML = groups.map((cat) => {
      const items = PRODUCTS.filter((p) => p.category === cat.key);
      if (!items.length) return '';
      return '<section class="manage-group"><h3>' + esc(cat.label) + '</h3>' +
        items.map((p) => {
          const current = stockOf(p);
          const edited = Object.prototype.hasOwnProperty.call(state.overrides, p.id);
          return '<div class="manage-row">' +
            '<span class="line-media">' + media(p, 'ph') + '</span>' +
            '<span class="line-info">' +
              '<strong>' + esc(p.name) +
                (edited ? '<span class="manage-edited">edited</span>' : '') + '</strong>' +
              '<span>' + esc(money(p.price)) + '</span>' +
            '</span>' +
            '<button type="button" class="copy-link" data-copy="' + esc(p.id) + '" ' +
              'title="Copy this product\'s link" aria-label="Copy link to ' + esc(p.name) + '">' +
              '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/>' +
              '<path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>' +
            '</button>' +
            '<select data-stock="' + esc(p.id) + '" data-value="' + esc(current) + '" ' +
              'aria-label="Availability for ' + esc(p.name) + '">' +
              ['in', 'low', 'out'].map((key) =>
                '<option value="' + key + '"' + (key === current ? ' selected' : '') + '>' +
                  STOCK[key].label + '</option>').join('') +
            '</select>' +
          '</div>';
        }).join('') + '</section>';
    }).join('');
  }

  function setStock(id, value) {
    const product = PRODUCTS.find((p) => p.id === id);
    if (!product) return;
    const fileValue = (typeof STOCK_OVERRIDES === 'object' && STOCK_OVERRIDES && STOCK_OVERRIDES[id]) || product.stock || 'in';
    if (value === fileValue) delete state.overrides[id];
    else state.overrides[id] = value;
    save();
    paintGrid();
    paintManage();
    if (!compareModal.hidden && state.compare.length > 1) paintCompareTable();
    toast(product.name + ' → ' + STOCK[value].label);
  }

  function overridesSnippet() {
    const merged = Object.assign({},
      (typeof STOCK_OVERRIDES === 'object' && STOCK_OVERRIDES) || {}, state.overrides);
    const lines = Object.keys(merged)
      .filter((id) => PRODUCTS.some((p) => p.id === id))
      .map((id) => "  '" + id + "': '" + merged[id] + "',");
    return 'const STOCK_OVERRIDES = {\n' + lines.join('\n') + (lines.length ? '\n' : '') + '};';
  }

  function openManage() {
    paintManage();
    lastFocused = document.activeElement;
    manage.hidden = false;
    document.body.classList.add('no-scroll');
    const close = $('.modal-close', manage);
    if (close) close.focus();
  }

  function closeManage() {
    manage.hidden = true;
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
    const looksPhone = contact.replace(/\D/g, '').length >= 9;
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
    try { localStorage.setItem('sentinal-theme', next); } catch (e) {}
  }

  /* ── Scroll behaviour: header border, nav highlight, reveals ───────────── */
  function initScroll() {
    const header = $('.site-header');
    const sections = ['catalogue', 'why', 'contact'].map((id) => $('#' + id)).filter(Boolean);

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

  /** #p=<id> opens that product; #manage opens the stock panel. */
  function openFromHash() {
    const hash = location.hash;
    if (hash.indexOf('#p=') === 0) {
      const id = decodeURIComponent(hash.slice(3));
      if (PRODUCTS.some((p) => p.id === id)) {
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
    paintChips();
    paintInterestOptions();
    paintGrid();
    paintCount();
    paintAttached();
    paintCompareBar();
    initScroll();
    openFromHash();

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

    // Modal buttons
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

    // Stock manager
    $('#openManage').addEventListener('click', openManage);
    manage.addEventListener('click', (e) => {
      const copy = e.target.closest('[data-copy]');
      if (copy) { copyProductLink(copy.dataset.copy); return; }
      if (e.target.closest('[data-close]')) closeManage();
    });
    manage.addEventListener('change', (e) => {
      const select = e.target.closest('[data-stock]');
      if (select) setStock(select.dataset.stock, select.value);
    });
    $('#copyOverrides').addEventListener('click', () => {
      copyText(overridesSnippet())
        .then(() => toast('Copied — paste it over STOCK_OVERRIDES in data.js'))
        .catch(() => toast('Copy failed — select the text manually'));
    });
    $('#resetOverrides').addEventListener('click', () => {
      state.overrides = {};
      save(); paintGrid(); paintManage();
      toast('Back to the values in data.js');
    });

    window.addEventListener('hashchange', openFromHash);

    drawer.addEventListener('click', (e) => {
      const add = e.target.closest('[data-add]');
      if (add) { toggleInquiry(add.dataset.add); return; }
      if (e.target.closest('[data-close]')) { closeDrawer(); return; }
      if (e.target.id === 'clearList') {
        state.inquiry = []; save(); paintGrid(); paintCount(); paintDrawer(); paintAttached();
        toast('Inquiry list cleared');
      }
      if (e.target.id === 'goForm') {
        closeDrawer();
        $('#contact').scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => $('#fName').focus(), 500);
      }
    });

    $('#openInquiry').addEventListener('click', openDrawer);

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

    // Theme
    $('#themeToggle').addEventListener('click', toggleTheme);

    // Form
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
