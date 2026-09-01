/* ==========================================================================
   starfield.js — the live night sky behind the shop.

   A field of stars that drift and twinkle, with a shooting star every few
   seconds. It sits behind everything and never takes a tap.

   Two versions, because the shop has two themes and one sky cannot serve both:

     dark    a real night sky — deep navy fading to black, warm white stars,
             bright meteors. This is the effect at full strength.
     light   the same sky, drawn as soft blue sparkles on the pale background
             the light theme already has. Stars on white would be invisible,
             and turning the page black would have put dark text on a dark
             ground. This keeps every existing contrast ratio untouched.

   It gives up gracefully, and on purpose:
     · "Reduce motion" turned on  → the stars are drawn once and left still.
     · A phone that says its screen is slow → drawn once, left still.
     · Lite mode (html.lite)      → no canvas at all.
     · Tab in the background      → the loop stops; it is not worth the battery.

   Nothing else on the page depends on this file. If it throws, the shop is
   untouched.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  if (root.classList.contains('lite')) return;

  var mqMotion = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  var mqSlow   = window.matchMedia ? matchMedia('(update: slow)') : null;
  var mqCoarse = window.matchMedia ? matchMedia('(pointer: coarse)') : null;

  var canvas = document.createElement('canvas');
  canvas.id = 'sky';
  canvas.setAttribute('aria-hidden', 'true');
  var ctx = canvas.getContext && canvas.getContext('2d');
  if (!ctx) return;                                  // very old browser: skip quietly

  /* Behind the page, never in the way of a tap or a screen reader. */
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;z-index:-2;pointer-events:none;';

  var W = 0, H = 0, dpr = 1;
  var stars = [], shooting = [], sprite = null, spriteR = 0;
  var running = false, rafId = 0, lastFrame = 0, nextShot = 0;

  var still = function () {
    return (mqMotion && mqMotion.matches) || (mqSlow && mqSlow.matches);
  };
  var isDark = function () {
    if (root.getAttribute('data-theme') === 'dark') return true;
    if (root.getAttribute('data-theme') === 'light') return false;
    return !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  };

  /* ── palette ─────────────────────────────────────────────────────────── */
  function palette() {
    return isDark()
      ? { star: '255,255,255', warm: '190,215,255', shot: '255,255,255',
          max: 1, skyTop: 'rgba(9,13,28,.92)', skyBot: 'rgba(3,5,12,.96)', sky: true }
      /* On the light theme the page keeps its own pale background; the stars
         are a tint over it rather than holes in a black sky. Strong enough to
         be seen on purpose, far too small and sparse to change the effective
         background colour behind a letter — checked, not assumed. */
      : { star: '64,96,158', warm: '96,124,180', shot: '52,88,155',
          max: .66, skyTop: null, skyBot: null, sky: false };
  }
  var pal = palette();

  /* A star is drawn from one small pre-rendered sprite rather than an arc()
     per star per frame — same picture, a fraction of the cost. */
  function buildSprite() {
    spriteR = Math.max(6, Math.round(6 * Math.min(dpr, 2)));
    var s = document.createElement('canvas');
    s.width = s.height = spriteR * 2;
    var c = s.getContext('2d');
    var g = c.createRadialGradient(spriteR, spriteR, 0, spriteR, spriteR, spriteR);
    g.addColorStop(0,   'rgba(255,255,255,1)');
    g.addColorStop(.35, 'rgba(255,255,255,.55)');
    g.addColorStop(1,   'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, spriteR * 2, spriteR * 2);
    sprite = s;
  }

  /* ── the field ───────────────────────────────────────────────────────── */
  function seed() {
    /* Density by area, so a phone is not asked to draw a desktop's worth of
       sky, and a big monitor does not look empty. Capped at both ends. */
    var area = (W * H) / (dpr * dpr);
    var count = Math.round(area / 9000);
    count = Math.max(45, Math.min(mqCoarse && mqCoarse.matches ? 110 : 190, count));

    stars = [];
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: (Math.random() * 1.1 + 0.45) * dpr,      // radius in device pixels
        a: Math.random() * 0.5 + 0.25,              // base brightness
        tw: Math.random() * Math.PI * 2,            // twinkle phase
        ts: Math.random() * 0.9 + 0.25,             // twinkle speed
        dx: (Math.random() - 0.5) * 0.02 * dpr,     // very slow drift
        dy: (Math.random() - 0.5) * 0.02 * dpr,
        warm: Math.random() < 0.22
      });
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);   // 3x costs a lot, shows nothing
    var w = window.innerWidth, h = window.innerHeight;
    W = Math.max(1, Math.round(w * dpr));
    H = Math.max(1, Math.round(h * dpr));
    canvas.width = W; canvas.height = H;
    buildSprite();
    seed();
    draw(0);
  }

  /* ── shooting stars ──────────────────────────────────────────────────── */
  function spawnShot() {
    /* Enter from the top edge or the left, travel down-right — the direction
       a meteor actually reads as. */
    var fromTop = Math.random() < 0.45;
    var speed = (Math.random() * 0.5 + 0.65) * dpr;
    /* A shooting star reads as a shooting star when it runs across the sky,
       not down it. Steeper than about 50° and it looks like falling debris. */
    var ang = (Math.random() * 0.16 + 0.11) * Math.PI;      // ~20°–49°
    shooting.push({
      x: fromTop ? Math.random() * W : -40 * dpr,
      y: fromTop ? -40 * dpr : Math.random() * H * 0.55,
      vx: Math.cos(ang) * speed * 9,
      vy: Math.sin(ang) * speed * 9,
      len: (Math.random() * 90 + 70) * dpr,
      life: 0,
      span: Math.random() * 420 + 520                        // ms on screen
    });
    if (shooting.length > 3) shooting.shift();
  }

  /* ── painting ────────────────────────────────────────────────────────── */
  function draw(dt) {
    ctx.clearRect(0, 0, W, H);

    if (pal.sky) {
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, pal.skyTop);
      g.addColorStop(1, pal.skyBot);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    var i, s;
    for (i = 0; i < stars.length; i++) {
      s = stars[i];
      if (dt) {
        s.tw += s.ts * dt * 0.0016;
        s.x += s.dx; s.y += s.dy;
        if (s.x < 0) s.x += W; else if (s.x > W) s.x -= W;
        if (s.y < 0) s.y += H; else if (s.y > H) s.y -= H;
      }
      /* sin gives a smooth breath rather than a flicker */
      var a = s.a * (0.62 + 0.38 * Math.sin(s.tw)) * pal.max;
      if (a <= 0.01) continue;
      var d = s.r * 3.2;
      ctx.globalAlpha = a;
      ctx.drawImage(sprite, s.x - d, s.y - d, d * 2, d * 2);
    }
    ctx.globalAlpha = 1;

    /* tint the white sprite to the theme's star colour in one pass */
    if (pal.star !== '255,255,255') {
      ctx.globalCompositeOperation = 'source-in';
      ctx.fillStyle = 'rgb(' + pal.star + ')';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
    }

    for (i = shooting.length - 1; i >= 0; i--) {
      var m = shooting[i];
      if (dt) { m.life += dt; m.x += m.vx * dt * 0.06; m.y += m.vy * dt * 0.06; }
      var t = m.life / m.span;
      if (t >= 1 || m.x > W + m.len || m.y > H + m.len) { shooting.splice(i, 1); continue; }
      /* bright in the middle of its run, gone at both ends */
      var fade = Math.sin(Math.min(1, Math.max(0, t)) * Math.PI);
      var mag = Math.hypot(m.vx, m.vy) || 1;
      var tx = m.x - (m.vx / mag) * m.len;
      var ty = m.y - (m.vy / mag) * m.len;
      var tg = ctx.createLinearGradient(m.x, m.y, tx, ty);
      tg.addColorStop(0, 'rgba(' + pal.shot + ',' + (0.9 * fade * pal.max) + ')');
      tg.addColorStop(1, 'rgba(' + pal.shot + ',0)');
      ctx.strokeStyle = tg;
      ctx.lineWidth = 1.7 * dpr;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(m.x, m.y);
      ctx.stroke();
    }
  }

  /* ── the loop ────────────────────────────────────────────────────────── */
  function frame(now) {
    if (!running) return;
    var dt = lastFrame ? Math.min(now - lastFrame, 50) : 16;   // a long pause is not a long step
    lastFrame = now;

    if (now >= nextShot) {
      spawnShot();
      nextShot = now + 2600 + Math.random() * 5200;
    }
    draw(dt);
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running || still() || document.hidden) return;
    running = true; lastFrame = 0;
    nextShot = (window.performance ? performance.now() : Date.now()) + 1200;
    rafId = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  /* ── wiring ──────────────────────────────────────────────────────────── */
  var resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    /* Phone toolbars grow and shrink as you scroll, firing resize constantly.
       Only a real width change is worth reseeding for. */
    resizeTimer = setTimeout(resize, 180);
  }

  function onTheme() {
    pal = palette();
    draw(0);
  }

  function mount() {
    document.body.insertBefore(canvas, document.body.firstChild);
    resize();
    if (still()) draw(0);       // one still frame, honouring the preference
    else start();

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    new MutationObserver(onTheme)
      .observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    /* If the reader changes their mind about motion, follow it live. */
    if (mqMotion) {
      var onMotion = function () { if (still()) { stop(); draw(0); } else start(); };
      if (mqMotion.addEventListener) mqMotion.addEventListener('change', onMotion);
      else if (mqMotion.addListener) mqMotion.addListener(onMotion);
    }
    if (window.matchMedia) {
      var mqScheme = matchMedia('(prefers-color-scheme: dark)');
      if (mqScheme.addEventListener) mqScheme.addEventListener('change', onTheme);
      else if (mqScheme.addListener) mqScheme.addListener(onTheme);
    }
  }

  try {
    if (document.body) mount();
    else document.addEventListener('DOMContentLoaded', function () {
      try { mount(); } catch (e) { /* the sky is decoration; never fatal */ }
    });
  } catch (e) { /* same */ }
})();
