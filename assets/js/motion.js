/* ==========================================================================
   motion.js — what moves on the page, and what has to work before the
   catalogue has finished arriving.

   The catalogue (data.js) is close to a megabyte. On a phone at 9 KB/s that is
   well over a minute, and app.js cannot start until all of it is here. This
   file is small and loads on its own, ahead of it, so three things no longer
   wait that long:

     1. The menu button and the theme switch. app.js sees they are already
        wired (window.HOMCOM_EARLY) and leaves them alone.
     2. Scroll reveals. Sections rise into place as they come into view.
     3. The chrome H in the first screen: the shop's own mark as a real 3D
        object, drawn by the phone's graphics chip, lit by the page's colours.
        It turns by itself, leans toward a mouse, and a finger can spin it.

   Everything here is decoration or a head start. If any of it fails, the page
   is still whole: the H falls back to a drawn picture of itself, the sections
   are visible, and app.js wires the controls itself when it arrives.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var media = function (query) {
    try { return window.matchMedia(query); } catch (e) { return { matches: false }; }
  };
  var mqCalm     = media('(prefers-reduced-motion: reduce)');
  var mqSlow     = media('(update: slow)');
  var mqFine     = media('(hover: hover) and (pointer: fine)');
  var mqContrast = media('(prefers-contrast: more)');
  var mqForced   = media('(forced-colors: active)');
  var calm = function () { return mqCalm.matches || mqSlow.matches; };
  var onChange = function (mq, fn) {
    if (mq.addEventListener) mq.addEventListener('change', fn);
    else if (mq.addListener) mq.addListener(fn);
  };
  var part = function (name, fn) {
    try { fn(); } catch (err) { try { console.error('HOMCOM motion: "' + name + '" failed —', err); } catch (e) {} }
  };

  /* ── 1. Controls that must not wait for the catalogue ─────────────────── */
  var THEME_COLOR = { dark: '#07080C', light: '#F3F2F8' };

  function paintThemeColor() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLOR[root.getAttribute('data-theme')] || THEME_COLOR.dark);
  }

  function earlyControls() {
    var nav = document.getElementById('nav');
    var toggle = document.getElementById('navToggle');
    var early = { nav: false, theme: false };

    if (nav && toggle) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
      });
      Array.prototype.forEach.call(nav.querySelectorAll('a'), function (a) {
        a.addEventListener('click', function () {
          nav.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
      early.nav = true;
    }

    var themeButtons = document.querySelectorAll('#themeToggle, #themeToggleMobile');
    Array.prototype.forEach.call(themeButtons, function (button) {
      button.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('homcom-theme', next); } catch (e) {}
        paintThemeColor();
      });
    });
    early.theme = themeButtons.length > 0;

    window.HOMCOM_EARLY = early;
  }

  /* ── 2. Scroll reveals ─────────────────────────────────────────────────────
     A .reveal element is visible in the stylesheet by default. It is only
     held back once this has marked it (data-rv) and put `motion` on <html>,
     so nothing can be hidden by a script that never ran. Siblings that come
     into view together arrive one after another, 60ms apart. */
  function reveals() {
    if (!('IntersectionObserver' in window) || calm()) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.06 });

    var watch = function (list) {
      Array.prototype.forEach.call(list || document.querySelectorAll('.reveal'), function (el) {
        if (el.hasAttribute('data-rv') || el.classList.contains('in')) return;
        var parent = el.parentElement;
        var n = parent ? (parent.__revealCount = (parent.__revealCount || 0) + 1) : 1;
        el.style.setProperty('--delay', Math.min((n - 1) * 60, 300) + 'ms');
        el.setAttribute('data-rv', '');
        io.observe(el);
      });
    };

    watch();
    root.classList.add('motion');
    /* app.js draws some sections itself (the repair services); it hands them
       over here so they rise in the same way. */
    window.HOMCOM_REVEAL = watch;
  }

  /* ── 3. The chrome H ───────────────────────────────────────────────────────
     One full-screen triangle and a fragment shader. For every pixel the
     shader fires a ray at the letter, which is described as a distance field:
     two rounded bars and a crossbar, with the phone's speaker slot cut into
     the left bar and the monitor's power light into the right, exactly as in
     the logo. Where the ray hits, the surface reflects a studio made of light
     strips and the page's own violet and blue. That reflection is all chrome
     is. Where it misses, the same pixel draws the background: light streaks
     flowing into the letter at night, violet glass ribbons by day.

     No library. Three.js would be 150 KB before the first triangle; this is
     the whole thing.
     ------------------------------------------------------------------------ */
  var VERT =
    'attribute vec2 aPos;' +
    'void main(){gl_Position=vec4(aPos,0.0,1.0);}';

  var FRAG = [
    'uniform vec2 uRes;',
    'uniform float uTime;',
    'uniform mat3 uRot;',
    'uniform float uDay;',
    'uniform float uFocal;',
    'uniform float uBob;',
    'uniform float uLed;',
    'const float TAU = 6.2831853;',
    'const float PI = 3.14159265;',

    'float hash11(float p){p=fract(p*0.1031);p*=p+33.33;p*=p+p;return fract(p);}',
    'float hash21(vec2 p){vec3 p3=fract(vec3(p.xyx)*0.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}',
    'float adiff(float a,float b){return abs(mod(a-b+PI,TAU)-PI);}',

    /* The letter. Units: the H is 2 tall; the logo's 64-unit drawing / 18. */
    'float roundBox(vec3 p,vec3 b,float r){vec3 q=abs(p)-b+r;return length(max(q,0.0))+min(max(q.x,max(q.y,q.z)),0.0)-r;}',
    'float smin(float a,float b,float k){float h=clamp(0.5+0.5*(b-a)/k,0.0,1.0);return mix(b,a,h)-k*h*(1.0-h);}',
    'float mapH(vec3 p){',
    '  float d=roundBox(vec3(abs(p.x)-0.5556,p.y,p.z),vec3(0.3056,1.0,0.2),0.13);',
    '  d=smin(d,roundBox(p,vec3(0.42,0.25,0.15),0.1),0.06);',
    '  d=max(d,-roundBox(p-vec3(-0.5556,0.74,0.2),vec3(0.14,0.048,0.07),0.045));',
    '  d=max(d,-(length(p-vec3(0.5556,-0.80,0.25))-0.075));',
    '  return d;',
    '}',
    'vec3 normalH(vec3 p){',
    '  const vec2 k=vec2(1.0,-1.0);const float e=0.0015;',
    '  return normalize(k.xyy*mapH(p+k.xyy*e)+k.yyx*mapH(p+k.yyx*e)+k.yxy*mapH(p+k.yxy*e)+k.xxx*mapH(p+k.xxx*e));',
    '}',

    /* The studio the chrome reflects, one for each theme. Chrome is only a
       mirror, so what makes it read as chrome is a studio with hard edges in
       it: a sharp horizon, thin strip lights, a tall softbox to one side and a
       dark gap beside it. As the letter turns, its flat faces sweep across
       them and flash. Night: black, lavender above the horizon, violet and
       blue rim light. Day: a pale room with a dark table edge and a dark
       panel, because chrome in an all-white room reflects nothing. */
    'float band(float x,float a,float b,float s){return smoothstep(a-s,a+s,x)*(1.0-smoothstep(b-s,b+s,x));}',
    /* The letter leans its top toward the camera, so its front faces mirror
       the band of studio just below eye level (r.y from about -0.45 to 0).
       y is shifted so the studio's features sit in that band. */
    'vec3 envNight(vec3 r){',
    '  float y=r.y+0.36;float x=r.x;float back=step(0.0,r.z);',
    '  vec3 c=mix(vec3(0.010,0.010,0.018),vec3(0.10,0.09,0.17),smoothstep(0.16,0.20,y));',
    '  c+=vec3(0.05,0.04,0.10)*smoothstep(0.2,0.9,y);',
    '  c+=vec3(2.2,2.2,2.5)*band(y,0.27,0.31,0.012)*smoothstep(1.0,0.4,abs(x));',
    '  c+=vec3(1.1,1.1,1.3)*band(y,0.52,0.55,0.012)*smoothstep(1.0,0.3,abs(x+0.1));',
    '  c+=vec3(2.4,2.35,2.6)*band(x,-0.62,-0.30,0.02)*band(y,0.22,0.95,0.03)*back;',
    '  c+=vec3(1.4,1.45,1.8)*band(x,0.02,0.08,0.012)*band(y,0.0,0.8,0.03)*back;',
    '  c+=vec3(1.5,1.5,1.7)*band(y,0.04,0.065,0.01)*smoothstep(1.0,0.3,abs(x+0.2));',
    '  c+=vec3(1.8)*smoothstep(0.78,0.9,y);',
    '  c+=vec3(0.50,0.42,1.0)*2.0*pow(max(dot(r,normalize(vec3(1.0,0.1,-0.2))),0.0),4.0);',
    '  c+=vec3(0.30,0.55,1.0)*1.6*pow(max(dot(r,normalize(vec3(-1.0,0.0,-0.1))),0.0),5.0);',
    '  c+=vec3(0.20,0.14,0.45)*0.8*smoothstep(-0.1,-0.6,y);',
    '  c+=vec3(0.07,0.05,0.18)*smoothstep(0.18,-0.25,y);',
    '  return c;',
    '}',
    'vec3 envDay(vec3 r){',
    '  float y=r.y+0.36;float x=r.x;float back=step(0.0,r.z);',
    '  vec3 c=mix(vec3(0.30,0.28,0.42),vec3(1.15,1.14,1.22),smoothstep(0.16,0.20,y));',
    '  c=mix(c,vec3(0.07,0.06,0.12),band(y,0.20,0.29,0.01));',
    '  c+=vec3(0.10,0.06,0.22)*smoothstep(0.18,-0.3,y);',
    '  c+=vec3(0.6)*band(y,0.52,0.55,0.012);',
    '  c+=vec3(0.8)*band(x,-0.62,-0.30,0.02)*band(y,0.3,0.95,0.03)*back;',
    '  c=mix(c,vec3(0.16,0.15,0.24),0.85*band(x,-0.05,0.18,0.02)*band(y,0.28,0.9,0.03)*back);',
    '  c+=vec3(0.7)*band(y,0.04,0.065,0.01);',
    '  c+=vec3(0.52,0.40,1.0)*0.9*pow(max(dot(r,normalize(vec3(1.0,0.1,-0.2))),0.0),4.0);',
    '  c+=vec3(0.36,0.56,1.0)*0.6*pow(max(dot(r,normalize(vec3(-1.0,0.0,-0.1))),0.0),5.0);',
    '  c+=vec3(0.4)*smoothstep(0.8,0.95,y);',
    '  return c;',
    '}',
    'vec3 env(vec3 r){',
    '  if(uDay<0.001)return envNight(r);',
    '  if(uDay>0.999)return envDay(r);',
    '  return mix(envNight(r),envDay(r),uDay);',
    '}',
    'vec3 tone(vec3 c){c=1.0-exp(-c*1.25);return pow(c,vec3(0.4545));}',

    'vec3 shade(vec3 p,vec3 rd){',
    '  vec3 n=normalH(p);',
    '  vec3 r=reflect(rd,n);',
    '  float ndv=clamp(dot(n,-rd),0.0,1.0);',
    '  vec3 F0=vec3(0.72,0.72,0.76);',
    '  vec3 F=F0+(1.0-F0)*pow(1.0-ndv,5.0);',
    '  vec3 c=env(uRot*r)*F;',
    '  float ao=clamp(mapH(p+n*0.06)/0.06,0.0,1.0);',
    '  c*=0.5+0.5*ao;',
    '  float led=1.0-smoothstep(0.045,0.07,length(p.xy-vec2(0.5556,-0.80)));',
    '  led*=smoothstep(0.1,0.16,p.z);',
    '  vec3 ledCol=mix(vec3(0.45,0.55,1.0),vec3(0.60,0.50,1.0),uDay)*(1.5+0.9*uLed);',
    '  c=mix(c,ledCol,led);',
    '  return tone(c);',
    '}',

    /* Premultiplied "a over b". */
    'vec4 over(vec4 a,vec4 b){return a+b*(1.0-a.a);}',

    /* Light streaks: a fan of fine lines around the letter, curling as they
       widen, arriving from the lower left and leaving to the upper right, with
       pulses of light running inward along them. q is measured in letters. */
    'vec4 streaks(vec2 q,float pixQ){',
    '  vec2 s=q-vec2(0.08,0.04);',
    '  float rad=length(s);',
    '  float a0=atan(s.y,s.x);',
    '  float lane=(a0+0.30*rad)/TAU*120.0;',
    '  float h=hash11(floor(lane)+17.0);',
    '  float dist=abs(fract(lane)-0.5)*TAU/120.0*rad;',
    '  float line=smoothstep(pixQ*(0.8+0.9*h),0.0,dist);',
    '  float sector=max(smoothstep(0.95,0.2,adiff(a0,3.75)),0.55*smoothstep(0.7,0.12,adiff(a0,0.5)));',
    '  float reach=smoothstep(6.0,1.3,rad)*smoothstep(0.9,1.5,rad);',
    '  float ph=fract(rad*0.32+uTime*(0.07+0.08*h)+h*7.0);',
    '  float pulse=smoothstep(0.0,0.04,ph)*smoothstep(0.30,0.04,ph);',
    '  float k=line*sector*reach*step(0.3,h)*(0.20+1.15*pulse);',
    '  vec3 cN=mix(vec3(0.50,0.42,1.0),vec3(0.30,0.56,1.0),h);',
    '  cN=mix(cN,vec3(0.95,0.93,1.0),pulse*0.55);',
    '  vec3 cD=mix(vec3(0.40,0.30,0.95),vec3(0.28,0.42,0.92),h);',
    '  float a=k*mix(1.0,0.45,uDay);',
    '  return vec4(mix(cN,cD,uDay)*a,a);',
    '}',

    /* A band of violet glass: translucent in the middle, bright at its edges,
       its width breathing as if it were twisting in depth. */
    'vec4 ribbon(vec2 q,float y0,float amp,float freq,float ph,float w,vec3 tint){',
    '  float cy=y0+amp*sin(q.x*freq+ph)+0.12*sin(q.x*2.1-ph*1.6);',
    '  float twist=0.5+0.5*cos(q.x*0.9+ph*1.3);',
    '  float s=(q.y-cy)/(w*(0.35+0.75*twist));',
    '  float inside=1.0-smoothstep(0.86,1.0,abs(s));',
    '  if(inside<=0.0)return vec4(0.0);',
    '  float edge=pow(abs(s),6.0);',
    '  vec3 c=mix(tint,vec3(1.0),0.30+0.45*twist);',
    '  c=mix(c,vec3(1.0),edge*0.85);',
    '  float a=inside*(0.20+0.30*twist+0.45*edge);',
    '  return vec4(c*a,a);',
    '}',

    'vec4 background(vec2 uv,vec2 q,float pixQ){',
    '  float night=1.0-uDay;',
    '  float halo=exp(-dot(q,q)*0.45);',
    '  float haloA=mix(0.42,0.34,uDay)*halo;',
    '  vec4 acc=vec4(mix(vec3(0.34,0.28,0.92),vec3(0.74,0.68,1.0),uDay)*haloA,haloA);',
    '  if(night>0.01){',
    '    vec2 g=uv*11.0;vec2 cell=floor(g);float h=hash21(cell);',
    '    if(h>0.84){',
    '      vec2 o=vec2(hash21(cell+3.7),hash21(cell+9.1))*0.7+0.15;',
    '      float d=length(fract(g)-o)/11.0;',
    '      float size=(2.0/uRes.y)*(0.7+7.0*(h-0.84));',
    '      float tw=0.55+0.45*sin(uTime*(0.6+2.0*h)+h*60.0);',
    '      float k=smoothstep(size*1.6,size*0.2,d)*tw*night*0.85;',
    '      acc=over(vec4(vec3(0.86,0.88,1.0)*k,k),acc);',
    '    }',
    '  }',
    '  if(uDay>0.01){',
    '    acc=over(ribbon(q,0.95,0.55,0.75,0.5+uTime*0.11,0.34,vec3(0.56,0.44,1.0))*uDay,acc);',
    '    acc=over(ribbon(q,-1.25,0.35,1.05,2.3-uTime*0.08,0.2,vec3(0.44,0.54,1.0))*uDay,acc);',
    '  }',
    '  acc=over(streaks(q,pixQ),acc);',
    '  float f=exp(-(q.x*q.x*1.4+pow((q.y+1.28)*4.2,2.0)));',
    '  float floorA=mix(0.40,0.20,uDay)*f;',
    '  acc=over(vec4(mix(vec3(0.45,0.38,1.0),vec3(0.16,0.12,0.30),uDay)*floorA,floorA),acc);',
    '  return acc;',
    '}',

    'void main(){',
    '  vec2 uv=(2.0*gl_FragCoord.xy-uRes)/uRes.y;',
    '  float hy=uFocal/5.0;',
    '  vec2 hv=uv-vec2(0.0,0.02+uBob*hy);',
    '  float pixUV=2.0/uRes.y;',
    '  vec2 e=gl_FragCoord.xy/uRes*2.0-1.0;',
    '  vec4 col=background(uv,hv/hy,pixUV/hy)*(1.0-smoothstep(0.55,1.0,length(e)));',
    '  vec3 rdW=normalize(vec3(hv,-uFocal));',
    '  vec3 ro=vec3(0.0,0.0,5.0)*uRot;',
    '  vec3 rd=rdW*uRot;',
    /* Only pixels whose ray passes through the letter's box are marched. */
    '  vec3 bmax=vec3(0.92,1.04,0.26);',
    '  vec3 inv=sign(rd+1e-9)/(abs(rd)+1e-6);',
    '  vec3 t0=(-bmax-ro)*inv;vec3 t1=(bmax-ro)*inv;',
    '  vec3 tlo=min(t0,t1);vec3 thi=max(t0,t1);',
    '  float tn=max(max(tlo.x,tlo.y),tlo.z);',
    '  float tf=min(min(thi.x,thi.y),thi.z);',
    '  if(tf>tn&&tf>0.0){',
    '    float t=max(tn,0.0);float best=1e3;bool hit=false;',
    '    for(int i=0;i<64;i++){',
    '      float d=mapH(ro+rd*t);',
    '      best=min(best,d/t);',
    '      if(d<0.0005*t){hit=true;break;}',
    '      t+=d*0.95;',
    '      if(t>tf)break;',
    '    }',
    '    if(hit){',
    '      col=vec4(shade(ro+rd*t,rd),1.0);',
    '    }else{',
    /* A ray that just grazed the letter still covers part of its pixel.
       At that angle chrome reflects almost exactly what is behind it. */
    '      float cov=1.0-smoothstep(0.0,pixUV/uFocal*1.3,best);',
    '      if(cov>0.0)col=vec4(tone(env(rdW)*0.8)*cov,cov)+col*(1.0-cov);',
    '    }',
    '  }',
    '  gl_FragColor=col;',
    '}'
  ].join('\n');

  function chromeH() {
    var stage = document.querySelector('[data-hero-stage]');
    var canvas = stage && stage.querySelector('canvas');
    if (!canvas || !window.WebGLRenderingContext) return;

    /* ?lite=0 means "full effects, whatever the device" everywhere on the
       site; here it also accepts a software renderer, which is what a
       headless test browser has. */
    var forced = /[?&]lite=0\b/.test(location.search);
    var liteAsked = /[?&]lite=1\b/.test(location.search);
    var unwanted = function () {
      return liteAsked || (root.classList.contains('lite') && !forced) || mqForced.matches || mqContrast.matches;
    };
    if (unwanted()) return;

    var gl = null;
    try {
      gl = canvas.getContext('webgl', {
        alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false,
        powerPreference: 'low-power',
        /* A phone with no real graphics chip would draw this on its CPU,
           slowly, and heat up doing it. Better the drawn picture. */
        failIfMajorPerformanceCaveat: !forced
      });
    } catch (e) { gl = null; }
    if (!gl) return;

    var loc = {};
    var dead = false;

    function compile(type, source) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) && !gl.isContextLost()) {
        try { console.warn('HOMCOM motion: shader —', gl.getShaderInfoLog(shader)); } catch (e) {}
        return null;
      }
      return shader;
    }

    function build() {
      var high = gl.getShaderPrecisionFormat &&
        gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
      var precision = high && high.precision > 0 ? 'highp' : 'mediump';
      var vs = compile(gl.VERTEX_SHADER, VERT);
      var fs = compile(gl.FRAGMENT_SHADER, 'precision ' + precision + ' float;\n' + FRAG);
      if (!vs || !fs) return false;
      var program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
      gl.useProgram(program);

      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var aPos = gl.getAttribLocation(program, 'aPos');
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      ['uRes', 'uTime', 'uRot', 'uDay', 'uFocal', 'uBob', 'uLed'].forEach(function (name) {
        loc[name] = gl.getUniformLocation(program, name);
      });
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      return true;
    }
    if (!build()) return;

    /* ── size ── */
    var scale = Math.min(window.devicePixelRatio || 1, 2);
    var MIN_SCALE = 0.8;
    var cssW = 1, cssH = 1, focal = 3.3, stageBottom = 1;

    function fitCanvas() {
      var w = Math.max(1, Math.round(cssW * scale));
      var h = Math.max(1, Math.round(cssH * scale));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    }

    /* The lens is chosen so the letter spans data-fill of the stage's width,
       but never more than 72% of its height. */
    function measure() {
      var box = stage.getBoundingClientRect();
      cssW = Math.max(1, box.width);
      cssH = Math.max(1, box.height);
      stageBottom = Math.max(1, box.bottom + (window.pageYOffset || 0));
      var fill = parseFloat(stage.getAttribute('data-fill')) || 0.56;
      focal = Math.min(fill * (cssW / cssH) * 5.814, 3.6);
      fitCanvas();
    }

    /* ── pose ── */
    var TAU = Math.PI * 2;
    var rot = new Float32Array(9);
    var t = 2.2;                       // the idle pose at t = 2.2 is a good still
    var yawUser = 0, velUser = 0, pitchUser = 0;
    var tiltX = 0, tiltY = 0, aimX = 0, aimY = 0, shownX = 0, shownY = 0;
    var isDay = function () { return root.getAttribute('data-theme') === 'light'; };
    var day = isDay() ? 1 : 0, dayAim = day;

    /* R = Ry(yaw) · Rx(pitch), column by column, the order WebGL wants. */
    function pose(yaw, pitch) {
      var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      rot[0] = cy;      rot[1] = 0;   rot[2] = -sy;
      rot[3] = sy * sp; rot[4] = cp;  rot[5] = cy * sp;
      rot[6] = sy * cp; rot[7] = -sp; rot[8] = cy * cp;
    }

    var live = false;
    function draw() {
      if (dead || gl.isContextLost()) return;
      var moving = !calm();
      var turn = moving ? Math.min(1, Math.max(0, (window.pageYOffset || 0) / stageBottom)) * 1.1 : 0;
      pose(-0.34 + 0.42 * Math.sin(t * 0.36) + yawUser + tiltX * 0.5 + turn,
           0.12 + 0.05 * Math.sin(t * 0.27 + 1.3) + pitchUser + tiltY * 0.28);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(loc.uRes, canvas.width, canvas.height);
      gl.uniform1f(loc.uTime, t);
      gl.uniformMatrix3fv(loc.uRot, false, rot);
      gl.uniform1f(loc.uDay, day);
      gl.uniform1f(loc.uFocal, focal);
      gl.uniform1f(loc.uBob, moving ? 0.045 * Math.sin(t * 0.9) : 0);
      gl.uniform1f(loc.uLed, moving ? 0.5 + 0.5 * Math.sin(t * 1.7) : 0.6);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!live) {
        live = true;
        /* The drawn picture underneath fades out once a real frame is up. */
        requestAnimationFrame(function () { if (!dead) stage.classList.add('is-live'); });
      }
    }

    /* ── keeping up ────────────────────────────────────────────────────────
       A few frames in, eight of them are timed to the end of the graphics
       chip's work. Too slow, and the canvas drops to fewer pixels (the glow
       hides it well); still too slow at the floor, and the letter stops
       turning by itself and only moves when touched. */
    var frames = 0, samples = [], rounds = 0, frozen = false;
    function timedDraw() {
      frames++;
      if (frozen || rounds > 2 || frames < 24 || frames % 2) { draw(); return; }
      var start = performance.now();
      draw();
      gl.finish();
      samples.push(performance.now() - start);
      if (samples.length < 8) return;
      var median = samples.sort(function (a, b) { return a - b; })[4];
      samples = [];
      frames = 0;
      if (median <= 14) { rounds = 3; return; }
      if (scale > MIN_SCALE + 0.01) {
        scale = Math.max(MIN_SCALE, scale * Math.max(0.6, Math.sqrt(11 / median)));
        fitCanvas();
        rounds++;
      } else {
        frozen = true;
      }
    }

    /* ── the loop ── */
    var raf = 0, last = 0, visible = true, dragging = false;
    var animating = function () { return !calm() && !frozen; };

    function step(dt) {
      if (!dragging) {
        yawUser += velUser * dt;
        velUser *= Math.exp(-2.6 * dt);
        /* Once the spin has nearly died, the letter swings home to face the
           front again, by the shortest way round. */
        if (Math.abs(velUser) < 0.35) {
          var home = Math.round(yawUser / TAU) * TAU;
          yawUser += (home - yawUser) * (1 - Math.exp(-2.2 * dt));
        }
        pitchUser *= Math.exp(-3 * dt);
      }
      var k = 1 - Math.exp(-5 * dt);
      tiltX += (aimX - tiltX) * k;
      tiltY += (aimY - tiltY) * k;
      day += (dayAim - day) * (1 - Math.exp(-7 * dt));
      if (Math.abs(dayAim - day) < 0.002) day = dayAim;

      /* The product tiles drift a little against the pointer. */
      if (Math.abs(tiltX - shownX) > 0.003 || Math.abs(tiltY - shownY) > 0.003) {
        shownX = tiltX; shownY = tiltY;
        stage.style.setProperty('--px', shownX.toFixed(3));
        stage.style.setProperty('--py', shownY.toFixed(3));
      }
    }

    function frame(now) {
      raf = 0;
      var dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;
      if (animating()) t += dt;
      step(dt);
      timedDraw();
      schedule();
    }

    function schedule() {
      if (raf || dead || !visible || document.hidden || !animating()) return;
      raf = requestAnimationFrame(frame);
    }

    /* One frame on request: for a drag or a theme change while the letter is
       otherwise standing still. */
    function redraw() {
      if (raf || dead) return;
      raf = requestAnimationFrame(function (now) {
        raf = 0;
        last = now;
        draw();
        schedule();
      });
    }

    /* ── touch and mouse ── */
    var lastX = 0, lastY = 0, lastT = 0;
    canvas.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      dragging = true;
      velUser = 0;
      lastX = e.clientX; lastY = e.clientY; lastT = performance.now();
      try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
      stage.classList.add('is-grabbing');
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var now = performance.now();
      var width = cssW || 300;
      var turn = (e.clientX - lastX) / width * Math.PI * 1.25;
      yawUser += turn;
      pitchUser = Math.max(-0.5, Math.min(0.5, pitchUser + (e.clientY - lastY) / width * 1.1));
      var dt = Math.max(1, now - lastT) / 1000;
      velUser = velUser * 0.6 + (turn / dt) * 0.4;
      lastX = e.clientX; lastY = e.clientY; lastT = now;
      if (!animating()) redraw();
    });
    var release = function () {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove('is-grabbing');
      /* Let go after holding still, and it should not fly off. */
      if (performance.now() - lastT > 90) velUser = 0;
      velUser = Math.max(-14, Math.min(14, velUser));
      if (!animating()) velUser = 0;
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);

    /* The letter leans toward a mouse, anywhere on the screen. */
    if (mqFine.matches) {
      window.addEventListener('pointermove', function (e) {
        if (e.pointerType && e.pointerType !== 'mouse') return;
        if (!animating()) return;
        aimX = e.clientX / (window.innerWidth || 1) - 0.5;
        aimY = e.clientY / (window.innerHeight || 1) - 0.5;
      }, { passive: true });
    }

    /* ── only while it can be seen ── */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[entries.length - 1].isIntersecting;
        last = 0;
        schedule();
      }, { rootMargin: '120px 0px' }).observe(stage);
    }
    document.addEventListener('visibilitychange', function () { last = 0; schedule(); });

    var onResize = function () { measure(); if (!animating()) redraw(); };
    if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(stage);
    else window.addEventListener('resize', onResize, { passive: true });

    /* The theme switch lights a different studio; the change is eased unless
       motion has been turned down, in which case it simply changes. */
    new MutationObserver(function () {
      if (unwanted()) { stop(); return; }
      dayAim = isDay() ? 1 : 0;
      if (!animating()) { day = dayAim; redraw(); }
    }).observe(root, { attributes: true, attributeFilter: ['data-theme', 'class'] });

    onChange(mqCalm, function () { last = 0; if (animating()) schedule(); else redraw(); });

    /* If the device turns out to struggle (app.js adds `lite`), stop and
       hand the stage back to the drawn picture. */
    function stop() {
      dead = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      stage.classList.remove('is-live');
    }

    canvas.addEventListener('webglcontextlost', function (e) {
      e.preventDefault();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      stage.classList.remove('is-live');
      live = false;
    });
    canvas.addEventListener('webglcontextrestored', function () {
      if (dead || !build()) return;
      redraw();
    });

    measure();
    if (animating()) schedule(); else redraw();
  }

  part('early controls', earlyControls);
  part('reveals', reveals);
  part('chrome H', chromeH);
})();
