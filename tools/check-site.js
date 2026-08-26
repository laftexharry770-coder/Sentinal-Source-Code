#!/usr/bin/env node
/* ==========================================================================
   check-site.js — reads every file the website is made of and refuses to
   pass if anything is wrong.

   This runs on GitHub automatically after every change, so a bad upload is
   caught in about a minute instead of by a customer. Run it yourself with:

       node tools/check-site.js

   Nothing here needs installing — plain Node, no packages.
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const problems = [];
const notes = [];

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const fail = (file, message) => problems.push({ file, message });

/* ── 1. The files the site cannot open without ──────────────────────────── */
const REQUIRED = [
  'index.html', 'assets/js/data.js', 'assets/js/app.js',
  'assets/css/styles.css', 'service-worker.js', 'manifest.webmanifest'
];
REQUIRED.forEach((rel) => { if (!exists(rel)) fail(rel, 'missing'); });
if (problems.length) { report(); process.exit(1); }

/* ── 2. Does every script actually parse? ───────────────────────────────── */
['assets/js/data.js', 'assets/js/app.js', 'service-worker.js', 'tools/check-site.js']
  .forEach((rel) => {
    try { new vm.Script(read(rel), { filename: rel }); }
    catch (err) {
      fail(rel, 'the browser cannot read this file — ' + err.message +
        (/already been declared/.test(err.message) || /Unexpected token/.test(err.message)
          ? '\n      This is what a half-finished paste looks like. Replace the whole file.'
          : ''));
    }
  });

/* ── 3. The catalogue itself ────────────────────────────────────────────── */
let data = null;
if (!problems.some((p) => p.file === 'assets/js/data.js')) {
  const context = {};
  vm.createContext(context);
  try {
    vm.runInContext(
      read('assets/js/data.js') +
      '\n;globalThis.__out = {' +
      '  SITE: typeof SITE === "undefined" ? null : SITE,' +
      '  SERVICES: typeof SERVICES === "undefined" ? null : SERVICES,' +
      '  CATEGORIES: typeof CATEGORIES === "undefined" ? null : CATEGORIES,' +
      '  PRODUCTS: typeof PRODUCTS === "undefined" ? null : PRODUCTS };',
      context, { filename: 'assets/js/data.js' });
    data = context.__out;
  } catch (err) {
    fail('assets/js/data.js', 'failed while loading — ' + err.message);
  }
}

if (data) {
  const { SITE, SERVICES, CATEGORIES, PRODUCTS } = data;

  if (!SITE || typeof SITE !== 'object') fail('assets/js/data.js', 'SITE is missing');
  if (!Array.isArray(SERVICES))   fail('assets/js/data.js', 'SERVICES is missing or is not a list');
  if (!Array.isArray(CATEGORIES)) fail('assets/js/data.js', 'CATEGORIES is missing or is not a list');
  if (!Array.isArray(PRODUCTS))   fail('assets/js/data.js', 'PRODUCTS is missing or is not a list');

  if (SITE) {
    ['brand', 'email', 'currency'].forEach((key) => {
      if (!SITE[key]) fail('assets/js/data.js', 'SITE.' + key + ' is empty — the site needs it');
    });
    if (!Array.isArray(SITE.phones) || !SITE.phones.length) {
      fail('assets/js/data.js', 'SITE.phones is empty — customers would have no number to call');
    }
    if (SITE.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(SITE.email)) {
      fail('assets/js/data.js', 'SITE.email does not look like an email address: ' + SITE.email);
    }
    if (SITE.repairs && SITE.repairs.email &&
        !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(SITE.repairs.email)) {
      fail('assets/js/data.js', 'the repair desk email does not look right: ' + SITE.repairs.email);
    }
    (SITE.phones || []).forEach((phone, i) => {
      const digits = String(phone && phone.number || '').replace(/\D/g, '');
      if (digits.length < 9) fail('assets/js/data.js', 'phone ' + (i + 1) + ' looks too short: ' + phone.number);
    });
  }

  if (Array.isArray(PRODUCTS)) {
    if (!PRODUCTS.length) fail('assets/js/data.js', 'there are no products at all');

    const keys = Array.isArray(CATEGORIES) ? CATEGORIES.map((c) => c.key) : [];
    const seen = new Set();
    const STOCK = ['in', 'low', 'out'];

    PRODUCTS.forEach((p, i) => {
      const where = 'product ' + (i + 1) + ' (' + (p && (p.name || p.id) || 'unnamed') + ')';
      if (!p || typeof p !== 'object') { fail('assets/js/data.js', where + ' is not a product'); return; }
      if (!p.id)   fail('assets/js/data.js', where + ' has no id');
      if (!p.name) fail('assets/js/data.js', where + ' has no name');
      if (p.id && seen.has(p.id)) fail('assets/js/data.js', 'two products share the id "' + p.id + '"');
      if (p.id) seen.add(p.id);
      if (p.category && keys.length && keys.indexOf(p.category) === -1) {
        fail('assets/js/data.js', where + ' is in category "' + p.category + '", which does not exist');
      }
      if (p.price != null && !(Number(p.price) >= 0)) {
        fail('assets/js/data.js', where + ' has a price that is not a number: ' + p.price);
      }
      if (p.wasPrice != null && p.price != null && Number(p.wasPrice) <= Number(p.price)) {
        fail('assets/js/data.js', where + ' is marked on offer but the old price is not higher');
      }
      if (p.stock && STOCK.indexOf(p.stock) === -1) {
        fail('assets/js/data.js', where + ' has an unknown availability: "' + p.stock + '"');
      }
      ['images', 'spin'].forEach((key) => {
        if (p[key] != null && !Array.isArray(p[key])) {
          fail('assets/js/data.js', where + ' has a "' + key + '" that is not a list');
        }
      });
      (p.images || []).concat(p.spin || []).forEach((src) => {
        if (typeof src !== 'string') { fail('assets/js/data.js', where + ' has a picture that is not a link'); return; }
        if (/^(https?:|data:)/.test(src)) return;                     // hosted or embedded
        if (!exists(src.replace(/^\.?\//, ''))) {
          fail('assets/js/data.js', where + ' points at a picture that is not in the repository: ' + src);
        }
      });
    });

    const offers = PRODUCTS.filter((p) => p.wasPrice && p.price && p.wasPrice > p.price).length;
    notes.push(PRODUCTS.length + ' products, ' + offers + ' on offer, ' +
      (CATEGORIES || []).length + ' categories, ' + (SERVICES || []).length + ' services');
    if (SITE) notes.push('contact: ' + SITE.email + ' · ' +
      (SITE.phones || []).map((p) => p.number).join(' / '));
  }
}

/* ── 4. Everything index.html asks the browser to load ──────────────────── */
if (exists('index.html')) {
  const html = read('index.html');
  const refs = [];
  const patterns = [/<script[^>]+src="([^"]+)"/g, /<link[^>]+href="([^"]+)"/g, /<img[^>]+src="([^"]+)"/g];
  patterns.forEach((re) => {
    let m;
    while ((m = re.exec(html))) refs.push(m[1]);
  });
  refs.forEach((ref) => {
    if (/^(https?:|data:|mailto:|tel:|#)/.test(ref)) return;
    const clean = ref.split('?')[0].replace(/^\.?\//, '');
    if (clean && !exists(clean)) fail('index.html', 'refers to a file that is not here: ' + ref);
  });

  // The failsafe that keeps a stale phone from showing a blank page.
  if (html.indexOf('stalePage') === -1) {
    fail('index.html', 'the blank-page failsafe has been removed');
  }
  if (read('assets/js/app.js').indexOf("classList.add('ready')") === -1) {
    fail('assets/js/app.js', 'nothing marks the page as painted, so the failsafe would fire on a good page');
  }
}

/* ── 5. The version stamps that push a new copy onto phones ─────────────── */
if (exists('service-worker.js') && exists('assets/js/app.js')) {
  const sw = (read('service-worker.js').match(/CACHE_VERSION\s*=\s*'homcom-(v[\w.]+)'/) || [])[1];
  const app = (read('assets/js/app.js').match(/BUILD\s*=\s*'(v[\w.]+)'/) || [])[1];
  if (!sw)  fail('service-worker.js', 'CACHE_VERSION is missing');
  if (!app) fail('assets/js/app.js', 'BUILD is missing');
  if (sw && app && sw !== app) {
    fail('service-worker.js', 'CACHE_VERSION is ' + sw + ' but BUILD in app.js is ' + app +
      ' — they must match, or the Manage panel reports the wrong version');
  }
  if (sw) notes.push('version ' + sw);

  /* The ?v= on the stylesheet and the script is what stops a phone painting
     the old design out of its cache. Three places have to agree: what
     index.html asks for, what the worker precaches, and the version itself.
     If they drift, the worker stores one address while the page requests
     another — every phone downloads both, and the stale one is what a
     returning visitor keeps seeing. */
  const assetV = (read('service-worker.js').match(/ASSET_V\s*=\s*'([\w.]+)'/) || [])[1];
  if (exists('index.html')) {
    const stamps = [...read('index.html').matchAll(/(?:href|src)="assets\/(?:css|js)\/[\w.-]+\?v=([\w.]+)"/g)]
      .map((m) => m[1]);
    if (!assetV) {
      fail('service-worker.js', 'ASSET_V is missing — it must match the ?v= in index.html');
    }
    if (!stamps.length) {
      fail('index.html', 'styles.css and app.js have no ?v= stamp, so a cached copy can outlive an update');
    }
    stamps.forEach((v) => {
      if (assetV && v !== assetV) {
        fail('index.html', 'asks for ?v=' + v + ' but service-worker.js precaches ?v=' + assetV);
      }
      if (sw && v !== sw.replace(/^v/, '')) {
        fail('index.html', 'asks for ?v=' + v + ' but CACHE_VERSION is ' + sw + ' — bump them together');
      }
    });
  }
}

/* ── 6. Files that make the site installable and shareable ──────────────── */
if (exists('manifest.webmanifest')) {
  try {
    const manifest = JSON.parse(read('manifest.webmanifest'));
    (manifest.icons || []).forEach((icon) => {
      const clean = String(icon.src || '').replace(/^\.?\//, '');
      if (clean && !exists(clean)) fail('manifest.webmanifest', 'missing icon: ' + icon.src);
    });
  } catch (err) {
    fail('manifest.webmanifest', 'is not valid JSON — ' + err.message);
  }
}
if (!exists('.nojekyll')) fail('.nojekyll', 'missing — GitHub Pages may skip files starting with an underscore');

report();
process.exit(problems.length ? 1 : 0);

function report() {
  if (!problems.length) {
    console.log('The site checks out.');
    notes.forEach((n) => console.log('  · ' + n));
    return;
  }
  console.log('Something is wrong with the website:\n');
  const byFile = {};
  problems.forEach((p) => { (byFile[p.file] = byFile[p.file] || []).push(p.message); });
  Object.keys(byFile).forEach((file) => {
    console.log('  ' + file);
    byFile[file].forEach((m) => console.log('    - ' + m));
    console.log('');
  });
  console.log('Until this is fixed the website will not show everything it should.');
}
