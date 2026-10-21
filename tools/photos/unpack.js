#!/usr/bin/env node
/* ==========================================================================
   unpack.js — moves the photos written inside data.js out into files.

   The Manage panel stores each photo it is given inside data.js itself, as a
   long line of text. That is easy, but every visitor then has to download
   every photo before a single price can show: 26 photos made data.js 939 KB,
   over a minute on a slow phone. Moved into files, data.js is a few KB, the
   prices show at once, and each photo is only fetched when its card comes
   near the screen.

       node tools/photos/unpack.js

   Each photo becomes assets/img/products/<product id>-<n>.<type> (and
   <id>-360-<n> for the frames of a 360° view), byte for byte the same
   picture, and data.js points at the file instead. Nothing else in data.js
   changes. Run it again after publishing a data.js from the Manage panel
   with new photos in it; with none left inside, it changes nothing.
   Plain Node, nothing to install.
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..', '..');
const DATA = path.join(ROOT, 'assets', 'js', 'data.js');
const DIR = 'assets/img/products';
const EXT = { webp: 'webp', jpeg: 'jpg', jpg: 'jpg', png: 'png', gif: 'gif', avif: 'avif' };

let source = fs.readFileSync(DATA, 'utf8');
const context = {};
vm.runInNewContext(source + '\n;__out = { PRODUCTS };', context, { filename: 'data.js' });
const products = context.__out.PRODUCTS || [];

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'product';
const before = Buffer.byteLength(source);
let moved = 0;

fs.mkdirSync(path.join(ROOT, DIR), { recursive: true });
products.forEach((p) => {
  [['images', ''], ['spin', '-360']].forEach(([key, tag]) => {
    (p[key] || []).forEach((src, i) => {
      const m = /^data:image\/([a-z+]+);base64,([A-Za-z0-9+/=]+)$/.exec(String(src));
      if (!m || !EXT[m[1]]) return;
      const file = DIR + '/' + slug(p.id) + tag + '-' + (i + 1) + '.' + EXT[m[1]];
      fs.writeFileSync(path.join(ROOT, file), Buffer.from(m[2], 'base64'));
      // The same photo can appear more than once; every copy points at the file.
      source = source.split(JSON.stringify(src)).join(JSON.stringify(file));
      moved++;
    });
  });
});

if (!moved) {
  console.log('No photos inside data.js; nothing to do.');
} else {
  fs.writeFileSync(DATA, source);
  const kb = (n) => Math.round(n / 1024) + ' KB';
  console.log('Moved ' + moved + ' photos into ' + DIR + '/. data.js: ' + kb(before) + ' → ' + kb(Buffer.byteLength(source)) + '.');
  console.log('Upload data.js and the new files in ' + DIR + '/ together.');
}
