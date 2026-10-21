#!/usr/bin/env node
/* ==========================================================================
   trails.js — draws the light that carries on below the first screen.

   In the first screen motion.js draws, live, a fan of fine light streaks
   curling into the chrome H at night and bands of violet glass by day. Past
   it, the head of each section is lit by a still drawing of the same two
   things, entering from the top right as if that light ran on down the page:

       assets/img/light/trails-night.svg   the streaks
       assets/img/light/trails-day.svg     the ribbons

   styles.css sets the one that matches the theme behind each section's head
   (`--trails`). To redraw both after changing anything below:

       node tools/light/trails.js

   It follows the shader's own rules: the same lane hash, the same share of
   lanes left dark, the same line weights and the same two colours, and for
   the ribbons the same tints and the same twist. Run twice, it writes the
   same bytes. Nothing to install.
   ========================================================================== */

const fs = require('fs');
const path = require('path');

const W = 1200, H = 560;                       // the symbol's own units
const f1 = (n) => (Math.round(n * 10) / 10).toString();
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

/* ── Night: the streaks ──────────────────────────────────────────────────────
   Lanes radiate from a point above and to the left of the art and curl
   toward the horizontal as they run, so they fall in through the top edge
   and leave by the right one. A lane is a spiral arc; a quadratic through
   its two ends and its middle follows it to well under a pixel. */
const C = [430, -400], LANES = 72, R0 = 420, R1 = 1300, CURL = 0.00046;
const MID = 0.80;                              // the lane the fan crowds round
function lanePoint(theta, r) {
  const a = theta - CURL * (r - R0);
  return [C[0] + r * Math.cos(a), C[1] + r * Math.sin(a)];
}
function arc(theta, ra, rb) {
  const p0 = lanePoint(theta, ra), pm = lanePoint(theta, (ra + rb) / 2), p2 = lanePoint(theta, rb);
  const q = [2 * pm[0] - (p0[0] + p2[0]) / 2, 2 * pm[1] - (p0[1] + p2[1]) / 2];
  return 'M' + f1(p0[0]) + ' ' + f1(p0[1]) + 'Q' + f1(q[0]) + ' ' + f1(q[1]) + ' ' + f1(p2[0]) + ' ' + f1(p2[1]);
}
const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const VIOLET = [0.50, 0.42, 1.0], BLUE = [0.30, 0.56, 1.0], PULSE = [0.95, 0.93, 1.0];
const lines = [], pulses = [];
for (let i = 0; i < LANES; i++) {
  const h = hash(i + 17);
  if (h < 0.22) continue;                      // as in the shader, about a fifth of the lanes stay dark
  const theta = 0.40 + 0.80 * (i / (LANES - 1)) + (hash(i + 91) - 0.5) * 0.008;
  const sector = 1 - smooth(0, 0.42, Math.abs(theta - MID));   // brightest where they crowd
  const width = 0.7 * (1 + 1.1 * h);
  const alpha = (0.22 + 0.5 * h) * (0.3 + 0.7 * sector);
  // four hues from violet to blue, as the shader mixes them by the lane's hash
  lines.push('<path d="' + arc(theta, R0, R1) + '" stroke="url(#s' + Math.min(3, Math.floor(h * 4)) + ')" stroke-width="' + f1(width) +
    '" stroke-opacity="' + alpha.toFixed(2) + '"/>');
  if (h > 0.8 && sector > 0.45) {              // a few pulses of light, caught on their way in
    const at = R0 + 300 + (R1 - R0 - 600) * hash(i + 53);
    pulses.push('<path d="' + arc(theta, at, at + 64) + '" stroke-opacity="' + (0.3 + 0.4 * sector).toFixed(2) + '"/>');
  }
}

/* ── Day: the ribbons ────────────────────────────────────────────────────────
   Three bands of violet glass, translucent in the middle and bright at the
   edges, each wider where it turns toward you. Tints are the shader's. */
const RIBBONS = [
  { y0: 34,  slope: 0.30, amp: 38, freq: 0.0062, ph: 1.0, w: 64,  tint: [0.66, 0.50, 1.0], a: 0.70 },
  { y0: 150, slope: 0.20, amp: 52, freq: 0.0046, ph: 2.6, w: 124, tint: [0.56, 0.44, 1.0], a: 1.0 },
  { y0: -24, slope: 0.42, amp: 30, freq: 0.0080, ph: 4.2, w: 48,  tint: [0.44, 0.54, 1.0], a: 1.0 }
];
function ribbon(rb, narrow) {
  const centre = (x) => rb.y0 + rb.slope * (x - 600) + rb.amp * Math.sin(x * rb.freq + rb.ph) + 6 * Math.sin(x * rb.freq * 4 - rb.ph * 1.6);
  const half = (x) => (rb.w / 2) * (0.35 + 0.75 * (0.5 + 0.5 * Math.cos(x * rb.freq * 2.6 + rb.ph * 1.3))) * narrow;
  const xs = []; for (let x = 180; x <= 1260; x += 90) xs.push(x);
  const top = xs.map((x) => [x, centre(x) - half(x)]), bottom = xs.map((x) => [x, centre(x) + half(x)]).reverse();
  return 'M' + curve(top) + 'L' + curve(bottom) + 'Z';
}
/* A smooth line through the points (Catmull-Rom, written as cubic Béziers),
   to the nearest unit: the ribbons are soft enough not to need finer. */
function curve(pts) {
  const f0 = (n) => Math.round(n).toString();
  let d = f0(pts[0][0]) + ' ' + f0(pts[0][1]);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += 'C' + [c1[0], c1[1], c2[0], c2[1], p2[0], p2[1]].map(f0).join(' ');
  }
  return d;
}
const ribbons = RIBBONS.map((rb, k) =>
  '<path d="' + ribbon(rb, 1) + '" fill="url(#r' + k + ')" fill-opacity="' + (0.42 * rb.a).toFixed(2) + '"/>' +
  '<path d="' + ribbon(rb, 0.45) + '" fill="url(#w)" fill-opacity="' + (0.3 * rb.a).toFixed(2) + '" stroke="none"/>');

/* ── The two files ───────────────────────────────────────────────────────────
   Each fades out the same way, brightest just under the top edge on the
   right, gone before the words on the left. The fade is in the colour of
   every line and ribbon itself (fade(), below), not a mask over them: a mask
   makes the browser draw the whole picture a second time, offscreen, for
   every piece of the page it paints, and measured that way it was most of
   what the light cost to draw. */
const hex = (c) => '#' + c.map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const fade = (id, colour) =>
  '<radialGradient id="' + id + '" cx="950" cy="130" r="560" gradientUnits="userSpaceOnUse" gradientTransform="translate(950 130) scale(1 .74) translate(-950 -130)">' +
  '<stop offset="0" stop-color="' + colour + '"/><stop offset=".42" stop-color="' + colour + '" stop-opacity=".78"/>' +
  '<stop offset="1" stop-color="' + colour + '" stop-opacity="0"/></radialGradient>';
const svg = (defs, body) => [
  '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">',
  '<!-- Drawn by tools/light/trails.js; change that and run it, not this. -->',
  '<defs>', ...defs, '</defs>',
  ...body,
  '</svg>', ''
].join('\n');

const night = svg(
  [0, 1, 2, 3].map((k) => fade('s' + k, hex(mix(VIOLET, BLUE, (k + 0.5) / 4)))).concat(fade('p', hex(PULSE)),
    '<radialGradient id="h"><stop offset="0" stop-color="#7B6BFF" stop-opacity=".2"/><stop offset="1" stop-color="#7B6BFF" stop-opacity="0"/></radialGradient>'),
  [
    '<ellipse cx="960" cy="150" rx="400" ry="200" transform="rotate(24 960 150)" fill="url(#h)"/>',
    '<g fill="none" stroke-linecap="round">' + lines.join('') + '</g>',
    // each pulse twice: a soft bloom, then the bright core
    '<g fill="none" stroke-linecap="round" stroke="url(#p)" stroke-width="5" opacity=".1">' + pulses.join('') + '</g>',
    '<g fill="none" stroke-linecap="round" stroke="url(#p)" stroke-width="1.5">' + pulses.join('') + '</g>'
  ]);
const day = svg(
  RIBBONS.map((rb, k) => fade('r' + k, hex(mix(rb.tint, [1, 1, 1], 0.3)))).concat(fade('w', '#FFFFFF'),
    '<radialGradient id="h"><stop offset="0" stop-color="#B6A8FF" stop-opacity=".34"/><stop offset="1" stop-color="#B6A8FF" stop-opacity="0"/></radialGradient>'),
  [
    '<ellipse cx="940" cy="150" rx="440" ry="230" transform="rotate(18 940 150)" fill="url(#h)"/>',
    '<g stroke="url(#w)" stroke-opacity=".9" stroke-width="1.2">' + ribbons.join('') + '</g>'
  ]);

const dir = path.join(__dirname, '..', '..', 'assets', 'img', 'light');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'trails-night.svg'), night);
fs.writeFileSync(path.join(dir, 'trails-day.svg'), day);
console.log('assets/img/light/trails-night.svg  ' + lines.length + ' streaks, ' + pulses.length + ' pulses, ' + night.length + ' bytes');
console.log('assets/img/light/trails-day.svg    ' + RIBBONS.length + ' ribbons, ' + day.length + ' bytes');
