/* Generate a @supports fallback block for browsers without color-mix()
   (iOS Safari below 16.2). Every color-mix in the sheet is resolved to a
   literal rgba/rgb for each theme, and re-emitted with its original selector
   and @media context so the cascade lands in the same place. */
const fs = require('fs');
const SRC = require('path').join(__dirname, '..', 'assets/css/styles.css');
const raw = fs.readFileSync(SRC, 'utf8');
const src = raw.replace(/\/\*[\s\S]*?\*\//g, '');       // comments out of the way first

/* ---- theme token maps ------------------------------------------------- */
function tokensOf(block) {
  const m = {};
  (block.match(/--[a-z0-9-]+:\s*[^;]+;/g) || []).forEach((d) => {
    const k = d.match(/^(--[a-z0-9-]+):\s*([^;]+);/);
    if (k) m[k[1]] = k[2].trim();
  });
  return m;
}
const rootBlock = (src.match(/:root\s*\{[\s\S]*?\n\}/) || [''])[0];
const darkBlock = (src.match(/\[data-theme="dark"\][^{]*\{[\s\S]*?\n\}/) || [''])[0];
const T = { light: tokensOf(rootBlock) };
T.dark = Object.assign({}, T.light, tokensOf(darkBlock));

/* Some tokens (--amb-mix) are declared inside an ordinary rule rather than
   :root, so sweep the whole sheet as a last resort before giving up on one. */
const GLOBAL = tokensOf(src);
T.light = Object.assign({}, GLOBAL, T.light);
T.dark  = Object.assign({}, GLOBAL, T.dark);

const hex = (h) => {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};
/* colours are carried as [r,g,b,a] so a token that is itself a color-mix
   (--amb-3, --glass-brd) can be mixed again the way CSS would. */
function resolve(c, theme, d = 0) {
  c = c.trim();
  if (d > 6) return null;
  const v = c.match(/^var\((--[a-z0-9-]+)\)$/);
  if (v) { const t = T[theme][v[1]]; return t ? resolve(t, theme, d + 1) : null; }
  if (/^#[0-9a-f]{3,6}$/i.test(c)) return hex(c).concat(1);
  if (c === 'transparent') return [0, 0, 0, 0];
  const rgba = c.match(/^rgba?\(([^)]+)\)$/);
  if (rgba) { const n = rgba[1].split(/[,\s\/]+/).filter(Boolean).map(Number);
              return [n[0], n[1], n[2], n.length > 3 ? n[3] : 1]; }
  if (c.startsWith('color-mix(')) return mix(c, theme, d + 1);
  return null;
}
/* a percentage that may itself be a var(), e.g. var(--amb-mix) */
function pct(p, theme, d = 0) {
  p = p.trim();
  const v = p.match(/^var\((--[a-z0-9-]+)\)$/);
  if (v) { const t = T[theme][v[1]]; return t ? pct(t, theme, d + 1) : null; }
  const m = p.match(/^([\d.]+)%$/);
  return m ? parseFloat(m[1]) / 100 : null;
}
/* CSS mixes in premultiplied space; match that so translucent tokens blend right */
function mix(expr, theme, d = 0) {
  const inner = expr.slice('color-mix('.length, -1);
  const m = inner.match(/^\s*in\s+srgb\s*,\s*([\s\S]+?)\s+([\d.]+%|var\(--[a-z0-9-]+\))\s*,\s*([\s\S]+?)\s*$/);
  if (!m) return null;
  const A = resolve(m[1], theme, d), p = pct(m[2], theme), B = resolve(m[3], theme, d);
  if (!A || !B || p === null) return null;
  const wa = p * A[3], wb = (1 - p) * B[3], a = wa + wb;
  if (a === 0) return [0, 0, 0, 0];
  return [0, 1, 2].map((i) => Math.round((A[i] * wa + B[i] * wb) / a)).concat(+a.toFixed(4));
}
const css = (c) => c[3] >= 0.999
  ? `rgb(${c[0]},${c[1]},${c[2]})`
  : `rgba(${c[0]},${c[1]},${c[2]},${+c[3].toFixed(3)})`;

/* ---- paren-balanced color-mix replacement ------------------------------ */
let unresolved = [];
function literalise(value, theme) {
  let out = '', i = 0;
  while (i < value.length) {
    const at = value.indexOf('color-mix(', i);
    if (at === -1) { out += value.slice(i); break; }
    out += value.slice(i, at);
    // find the matching close paren
    let d = 0, j = at + 'color-mix'.length;
    for (; j < value.length; j++) {
      if (value[j] === '(') d++;
      else if (value[j] === ')') { d--; if (!d) break; }
    }
    const inner = value.slice(at, j + 1);
    const c = mix(inner, theme);
    let rep = c ? css(c) : null;
    if (!rep) { unresolved.push(theme + ': ' + inner.slice(0, 60)); rep = value.slice(at, j + 1); }
    out += rep;
    i = j + 1;
  }
  return out;
}

/* ---- walk the sheet, keeping @media context --------------------------- */
const rules = [];
let i = 0, media = [], buf = '';
while (i < src.length) {
  const ch = src[i];
  if (ch === '{') {
    const head = buf.trim().replace(/\s+/g, ' '); buf = '';
    if (head.startsWith('@')) { media.push(head); i++; continue; }
    let depth = 1, body = '', j = i + 1;
    while (j < src.length) {
      if (src[j] === '{') depth++;
      else if (src[j] === '}') { depth--; if (!depth) break; }
      body += src[j]; j++;
    }
    const decls = body.split(';').map((d) => d.trim())
      .filter((d) => d && /color-mix\(/.test(d));
    if (decls.length && head) rules.push({ media: media.slice(), selector: head, decls });
    i = j + 1; continue;
  }
  if (ch === '}') { media.pop(); i++; buf = ''; continue; }
  buf += ch; i++;
}

/* ---- emit ------------------------------------------------------------- */
const L = [], D = [];
for (const r of rules) {
  const sel = r.selector;
  const isRoot = /^:root$/.test(sel);
  const isDarkSel = /\[data-theme="dark"\]/.test(sel);
  const open = r.media.length ? r.media.join(' { ') + ' { ' : '';
  const close = r.media.length ? ' }'.repeat(r.media.length) : '';
  const fmt = (s, decls) => `  ${open}${s} { ${decls} }${close}`;

  if (!isDarkSel) L.push(fmt(sel, r.decls.map((x) => literalise(x, 'light') + ';').join(' ')));

  const dsel = isDarkSel ? sel
    : (isRoot ? '[data-theme="dark"]'
              : sel.split(',').map((s) => `[data-theme="dark"] ${s.trim()}`).join(', '));
  D.push(fmt(dsel, r.decls.map((x) => literalise(x, 'dark') + ';').join(' ')));
}

const out = `
/* ---------------------------------------------------------------------------
   color-mix() fallback — for iPhones on iOS 15 and older.

   The palette above leans on color-mix() in 75 places, and Safari only learned
   it in iOS 16.2. On an older iPhone every one of those declarations is thrown
   away: the header loses its background so the page scrolls visibly underneath
   it, the glass panels turn clear, and the focus rings vanish. That is not a
   cosmetic loss — it makes the shop hard to read.

   Below is the same palette written out by hand as rgba(), wrapped in a test so
   it is invisible to any browser that does support color-mix. Modern phones
   never see it; older ones get a solid, readable site.

   GENERATED — if you change a colour in the tokens above, regenerate this block
   rather than hand-editing it.
   --------------------------------------------------------------------------- */
@supports not (background: color-mix(in srgb, red 50%, transparent)) {

  /* ── light ─────────────────────────────────────────────────────────────── */
${L.join('\n')}

  /* ── dark ──────────────────────────────────────────────────────────────── */
${D.join('\n')}
}
`;
const OUT = require('path').join(__dirname, '..', 'colormix-fallback.generated.css');
fs.writeFileSync(OUT, out);
console.log(`rules with color-mix : ${rules.length}`);
console.log(`light overrides      : ${L.length}`);
console.log(`dark overrides       : ${D.length}`);
console.log(`unresolved           : ${unresolved.length}`);
unresolved.slice(0, 6).forEach((u) => console.log('   ! ' + u));
console.log(`bytes                : ${out.length}`);
