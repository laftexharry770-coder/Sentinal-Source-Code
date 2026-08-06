#!/usr/bin/env node
/* ==========================================================================
   repair-data.js — undoes a half-finished paste of data.js.

   GitHub's editor inserts where the cursor is instead of replacing what is
   there, so pasting a fresh export over the old file can leave the old one
   sitting underneath. The file then has two copies of CATEGORIES and
   PRODUCTS, the browser cannot read it, and the shop loses its catalogue.

   This finds that exact shape and keeps the first complete export, which is
   the new one. It refuses to touch anything unless the result is a valid
   file with a shop, services, categories and at least one product — if it
   cannot be sure, it changes nothing and lets check-site.js report the
   problem instead.

       node tools/repair-data.js            # repair in place
       node tools/repair-data.js --dry-run  # say what it would do
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FILE = path.join(__dirname, '..', 'assets', 'js', 'data.js');
const dryRun = process.argv.indexOf('--dry-run') > -1;

const parses = (text) => {
  try { new vm.Script(text); } catch (e) { return null; }
  const context = {};
  vm.createContext(context);
  try {
    vm.runInContext(text +
      '\n;globalThis.__out = {' +
      '  SITE: typeof SITE === "undefined" ? null : SITE,' +
      '  SERVICES: typeof SERVICES === "undefined" ? null : SERVICES,' +
      '  CATEGORIES: typeof CATEGORIES === "undefined" ? null : CATEGORIES,' +
      '  PRODUCTS: typeof PRODUCTS === "undefined" ? null : PRODUCTS };', context);
  } catch (e) { return null; }
  const out = context.__out;
  const whole = out.SITE && typeof out.SITE === 'object' &&
    Array.isArray(out.SERVICES) && Array.isArray(out.CATEGORIES) &&
    Array.isArray(out.PRODUCTS) && out.PRODUCTS.length > 0;
  return whole ? out : null;
};

const original = fs.readFileSync(FILE, 'utf8');

if (parses(original)) {
  console.log('data.js is fine — nothing to repair.');
  process.exit(0);
}

const lines = original.split('\n');

/* A complete export ends at the line that closes PRODUCTS. Walk the file
   looking for every possible ending and keep the first one that gives a
   whole, readable file. Anything after it is the leftover old copy. */
let repaired = null;
let cut = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i] !== '];') continue;                 // PRODUCTS closes at the margin
  const candidate = lines.slice(0, i + 1).join('\n') + '\n';
  const parsed = parses(candidate);
  if (parsed) { repaired = candidate; cut = i + 1; console.log(
    'Found a complete catalogue in the first ' + cut + ' lines: ' +
    parsed.PRODUCTS.length + ' products, ' + parsed.CATEGORIES.length + ' categories, ' +
    parsed.SERVICES.length + ' services.'); break; }
}

if (!repaired) {
  console.log('data.js is broken, but not in a way this can safely repair.');
  console.log('Nothing has been changed. Replace the whole file with a fresh export.');
  process.exit(0);         // check-site.js is what reports the failure
}

const dropped = lines.length - cut;
console.log('Removing ' + dropped + ' leftover lines from the previous version.');

if (dryRun) { console.log('(dry run — the file was not written)'); process.exit(0); }

fs.writeFileSync(FILE, repaired);
console.log('Repaired assets/js/data.js.');
