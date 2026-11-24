/*!
 * Creator Easter Egg — everything in one file.
 * ===========================================================================
 * A "Made by" avatar for your website's footer. Its 3D eyes follow the cursor
 * (or the last touch on phones). Hover → speech bubble. Click → your website.
 * Plus the admin panel to change its settings. No other files or libraries.
 *
 * 1. IN YOUR FOOTER
 *    <div class="creator-credit" hidden>
 *      <span class="creator-credit-label">Made by</span>
 *      <creator-egg url="https://your-site.com" align="right" label="Made by"></creator-egg>
 *    </div>
 *    <script src="creator-egg.js" defer><\/script>
 *
 *    Settings can also come from a settings file: <creator-egg config-src="creator-egg.config.json">
 *    or from code: document.querySelector('creator-egg').configure({ url: 'https://…' })
 *    It stays hidden until it has a valid https:// address.
 *
 * 2. ON YOUR ADMIN PAGE
 *    <creator-egg-admin toolbar storage-key="creator-egg.settings"></creator-egg-admin>
 *    <script src="creator-egg.js" defer><\/script>
 *
 *    toolbar          adds Load settings / Start over / Download settings buttons
 *    storage-key      keeps changes in this browser as you go
 *    theme            "light" or "dark" (default: follows the page / the device)
 *    From your own code: panel.value = settings; panel.addEventListener('change', e => save(e.detail));
 *    The panel doesn't check who uses it: keep your admin page behind your own login.
 *
 * SETTINGS
 *    enabled  true/false            url      https://… (required to show)
 *    align    left | center | right label    text before the picture ("Made by")
 *    name     your name             tipTitle, tipSub   the speech bubble's two lines ("" = default)
 *    image    "" = your 3D avatar, or a picture URL / data: URL
 *    eyesOn   your own picture: draw moving eyes   eyes  your own picture: { lx, ly, rx, ry, w, h } in %
 *
 * SIZE AND FONT:  creator-egg { --size: 64px; --egg-font: inherit; }   (default 58px, 44px on phones)
 */
(() => {
  'use strict';
  if (typeof window === 'undefined' || !window.customElements || customElements.get('creator-egg')) return;

  /* ---- the pictures: your avatar with the irises painted out (the code draws moving irises),
          and the untouched avatar (for the admin panel) ---- */
  const FACE = 'data:image/webp;base64,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';
  const FACE_FULL = 'data:image/webp;base64,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';

  /* ---- the footer row: "Made by" + avatar, lined up with the rest of the footer ---- */
  const CREDIT_CSS = `
creator-egg { --egg-font: inherit; }
.creator-credit { display: inline-flex; align-items: center; gap: 10px; }
.creator-credit[hidden] { display: none !important; }
.creator-credit[data-align="left"] { margin-right: auto; }
.creator-credit[data-align="center"] { margin-inline: auto; }
.creator-credit[data-align="right"] { margin-left: auto; }
@media (max-width: 900px) {
  .creator-credit { display: flex; flex: 1 0 100%; justify-content: flex-end; margin: 0; }
  .creator-credit[data-align="left"] { justify-content: flex-start; }
  .creator-credit[data-align="center"] { justify-content: center; }
}`;
  if (!document.getElementById('creator-egg-css')) {
    const st = document.createElement('style'); st.id = 'creator-egg-css'; st.textContent = CREDIT_CSS;
    (document.head || document.documentElement).appendChild(st);
  }

/* ===========================================================================
   THE AVATAR  <creator-egg>
   =========================================================================== */
{

  const NAME = 'Joraveer Singh Ratan';
  const TIP_TITLE = 'Hi, I am the creator of this website 👋';
  const tipSubFor = (name) => `— ${name} · Click to visit my site`;
  /* Where the eyes sit on the built-in 3D avatar (percent of the picture). "real" eyes keep the picture's
     own eyelids and lashes: only the iris is drawn, and it moves. */
  const EYES = { style: 'real', lx: 37.40, ly: 58.69, rx: 62.11, ry: 58.69, w: 12.11, h: 5.86, rt: 0.56, rb: 0.53 };

  function validateUrl(u) {
    const s = String(u ?? '').trim();
    if (!s || /\s/.test(s)) return '';
    try {
      const x = new URL(s);
      if (x.protocol !== 'https:' || !/^[^.]+(\.[^.]+)+$/.test(x.hostname) || x.username || x.password) return '';
      return x.href;
    } catch { return ''; }
  }

  const CSS = `
:host { all: initial; display: inline-block; vertical-align: middle; position: relative; --size: 58px; --ring: rgba(22,22,29,.14);
  --bg: #F3EBE0; --tip-bg: #16161D; --tip-fg: #FFFFFF; --tip-sub: rgba(255,255,255,.72); --focus: #A9BC63;
  font-family: var(--egg-font, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif);
  width: var(--size); height: var(--size); line-height: 0; -webkit-tap-highlight-color: transparent; }
:host([hidden]) { display: none !important; }
:host([scheme="dark"]) { --ring: rgba(255,255,255,.16); --bg: #2A2620; --tip-bg: #F4F1EA; --tip-fg: #16161D; --tip-sub: rgba(22,22,29,.66); }
@media (max-width: 640px) { :host { --size: 44px; } }
* { box-sizing: border-box; }
a { display: block; width: 100%; height: 100%; border-radius: 50%; position: relative; outline: none; cursor: pointer;
  background: var(--bg); box-shadow: 0 0 0 1.5px var(--ring), 0 6px 16px -6px rgba(22,22,29,.35), 0 1px 3px rgba(22,22,29,.12);
  text-decoration: none; color: inherit; }
a:not([href]) { cursor: default; }
a:focus-visible { box-shadow: 0 0 0 2px var(--bg), 0 0 0 4.5px var(--focus), 0 6px 16px -6px rgba(22,22,29,.35); }
.clip { position: absolute; inset: 0; border-radius: 50%; overflow: hidden; clip-path: circle(50% at 50% 50%); -webkit-clip-path: circle(50% at 50% 50%); isolation: isolate; }
.head { position: absolute; inset: 0; }
.head img, .head svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; pointer-events: none; user-select: none; -webkit-user-drag: none; }
.head svg { visibility: hidden; overflow: visible; }
:host(.loaded) .head svg { visibility: visible; }
.tip { display: none; position: absolute; left: auto; right: var(--tip-r, 0px); bottom: calc(100% + 12px); width: max-content; max-width: min(310px, calc(100vw - 32px));
  padding: 10px 14px 11px; border-radius: 14px; background: var(--tip-bg); color: var(--tip-fg); text-align: left; line-height: 1.35;
  font-size: 14px; font-weight: 600; letter-spacing: 0; white-space: normal; z-index: 5;
  box-shadow: 0 14px 30px -10px rgba(22,22,29,.45), 0 2px 6px rgba(22,22,29,.12); pointer-events: none; }
:host(.tip-open) .tip { display: block; }
.tip small { display: block; margin-top: 3px; font-size: 12.5px; font-weight: 500; color: var(--tip-sub); }
.tip::after { content: ""; position: absolute; left: var(--tail-x, calc(100% - var(--size) / 2)); top: 100%; margin-left: -7px;
  border: 7px solid transparent; border-top-color: var(--tip-bg); border-bottom: 0; }`;

  class CreatorEgg extends HTMLElement {
    constructor() {
      super();
      this.cfg = { enabled: true, url: '', name: NAME, tipTitle: '', tipSub: '', image: '', eyesOn: true, eyes: null };
      this.hover = this.focusOn = this.tapOpen = false;
      this.pointer = 'mouse'; this.look = { x: 0, y: 0, tx: 0, ty: 0 }; this.target = null; this.visible = false;
      const r = this.attachShadow({ mode: 'open' });
      r.innerHTML = `<style>${CSS}</style><a part="avatar" role="link" tabindex="0" target="_blank" rel="noopener noreferrer">
          <span class="clip"><span class="head"><img alt="" width="256" height="256" loading="lazy" decoding="async" draggable="false"><svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"></svg></span></span>
        </a><span class="tip" role="tooltip" id="tip" part="tooltip"><span class="t1"></span><small class="t2"></small></span>`;
      this.a = r.querySelector('a'); this.img = r.querySelector('img'); this.svg = r.querySelector('svg'); this.tip = r.querySelector('.tip');
      this.a.setAttribute('aria-describedby', 'tip');
      this.img.addEventListener('load', () => this.classList.add('loaded'));
      this.dm = matchMedia('(prefers-color-scheme: dark)');
      this.bind();
    }

    /* ---------------- public ---------------- */
    configure(cfg = {}) { this.cfg = { ...this.cfg, ...cfg }; if (this.isConnected) this.render(); return this; }
    static validateUrl(u) { return validateUrl(u); }
    get url() { return validateUrl(this.cfg.url); }

    connectedCallback() {
      this.scheme();
      this._mo = new MutationObserver(() => this.scheme());
      this._mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
      this._io = new IntersectionObserver((es) => { this.visible = es.some((e) => e.isIntersecting); this.visible ? this.wake() : this.sleep(); }, { rootMargin: '120px' });
      this._io.observe(this);
      // settings from attributes (url, align, label, name, tip-title, tip-sub) and/or a settings file
      const attr = {};
      for (const [a, k] of [['url', 'url'], ['align', 'align'], ['label', 'label'], ['name', 'name'], ['tip-title', 'tipTitle'], ['tip-sub', 'tipSub']]) if (this.hasAttribute(a)) attr[k] = this.getAttribute(a);
      if (Object.keys(attr).length) this.cfg = { ...this.cfg, ...attr };
      const src = this.getAttribute('config-src');
      if (src && !this._loaded) { this._loaded = true; this.loadConfig(src); }
      this.render();
    }
    disconnectedCallback() { this._mo?.disconnect(); this._io?.disconnect(); this.sleep(); }

    async loadConfig(src) {
      try {
        const base = new URL(src, location.href), c = await (await fetch(base, { cache: 'no-cache' })).json();
        if (c.image) c.image = new URL(c.image, base).href;
        this.configure(c);
      } catch (e) { console.warn('[creator-egg] could not load', src, e); }
    }

    /* ---------------- drawing ---------------- */
    render() {
      const c = this.cfg, name = String(c.name || NAME).trim(), url = this.url;
      const show = c.enabled !== false && (!!url || this.hasAttribute('preview'));
      if (this.hidden === show) this.hidden = !show;
      this.dispatchEvent(new CustomEvent('creator-egg:state', { detail: { shown: show }, bubbles: true }));
      this.a.setAttribute('aria-label', `Visit the creator's website, ${name}`);
      if (url) this.a.href = url; else this.a.removeAttribute('href');
      this.tip.querySelector('.t1').textContent = String(c.tipTitle || '').trim() || TIP_TITLE;
      this.tip.querySelector('.t2').textContent = String(c.tipSub || '').trim() || tipSubFor(name);
      this.img.alt = `Cartoon avatar of ${name}`;
      const src = c.image || this.getAttribute('image') || FACE;
      if (src && this.img.getAttribute('src') !== src) { this.classList.remove('loaded'); this.img.src = src; }
      this.drawEyes();
      // the "Made by" row around it, if there is one
      const wrap = this.closest('.creator-credit');
      if (wrap && !this.hasAttribute('preview')) {
        wrap.hidden = !show; wrap.dataset.align = ['left', 'center', 'right'].includes(c.align) ? c.align : 'right';
        const lbl = wrap.querySelector('.creator-credit-label'); if (lbl && c.label != null) lbl.textContent = c.label;
      }
    }
    /** No eyes setting = the built-in avatar (3D irises). An eyes setting = your own photo (drawn eyes),
        placed where you clicked, or where the avatar's eyes are until you do. */
    eyeGeom() {
      const e = this.cfg.eyes;
      if (!e || typeof e !== 'object') return EYES;
      const ok = +e.w > 0 && +e.lx > 0;
      return ok ? { lx: +e.lx, ly: +e.ly, rx: +e.rx, ry: +e.ry, w: +e.w, h: +(e.h || e.w * 0.52) } : { lx: EYES.lx, ly: EYES.ly, rx: EYES.rx, ry: EYES.ry, w: 13, h: 6.8 };
    }
    drawEyes() {
      if (this.cfg.eyesOn === false && this.cfg.image) { this.svg.innerHTML = ''; this.eyes = []; return; }
      const g = this.eyeGeom();
      if (g.style === 'real') return this.drawRealEyes(g);
      // your own photo: simple drawn eyes (white almond, brown iris, pupil, glint)
      const w = g.w, h = g.h, r = h * 0.47;
      const al = `M${-w / 2} 0.3 C${-w * 0.3} ${-h * 0.78} ${w * 0.3} ${-h * 0.78} ${w / 2} 0.3 C${w * 0.3} ${h * 0.6} ${-w * 0.3} ${h * 0.6} ${-w / 2} 0.3Z`;
      const lid = `M${-w / 2 - 0.2} 0.5 C${-w * 0.3} ${-h * 0.8} ${w * 0.3} ${-h * 0.8} ${w / 2 + 0.2} 0.4`;
      const eye = (id, x, y) => `<g transform="translate(${x} ${y})">
          <clipPath id="c${id}"><path d="${al}"/></clipPath>
          <path d="${al}" fill="#FBF8F3"/>
          <g clip-path="url(#c${id})"><g class="iris">
            <circle r="${r}" fill="#6A4128"/><circle r="${r}" fill="none" stroke="#2A1910" stroke-width="${r * 0.16}"/>
            <circle r="${r * 0.5}" fill="#120C08"/><circle cx="${-r * 0.36}" cy="${-r * 0.38}" r="${r * 0.26}" fill="#fff"/>
          </g><path d="M${-w / 2} ${-h * 0.2} C${-w * 0.3} ${-h * 0.95} ${w * 0.3} ${-h * 0.95} ${w / 2} ${-h * 0.2}" fill="none" stroke="rgba(60,30,15,.25)" stroke-width="${h * 0.3}"/></g>
          <path d="${al}" fill="none" stroke="#1E140E" stroke-width="${h * 0.07}"/>
          <path d="${lid}" fill="none" stroke="#1E140E" stroke-width="${h * 0.2}" stroke-linecap="round"/>
        </g>`;
      this.svg.innerHTML = eye('l', g.lx, g.ly) + eye('r', g.rx, g.ry);
      this.trackEyes(g, { x: w / 2 - r * 0.95, y: h * 0.2 });
    }
    /** 3D eyes for the built-in avatar: a brown iris with rings, pupil and glints and a soft shadow from
        the upper lid, clipped to the picture's own eye opening. */
    drawRealEyes(g) {
      const w = g.w, h = g.h, rt = h * g.rt, rb = h * g.rb, r = h * 0.62;
      const open = `M${-w / 2} 0 A${w / 2} ${rt} 0 0 1 ${w / 2} 0 A${w / 2} ${rb} 0 0 1 ${-w / 2} 0Z`;
      const defs = `<defs>
          <radialGradient id="irisG" cx="50%" cy="58%" r="55%"><stop offset="0" stop-color="#A9663A"/><stop offset=".45" stop-color="#8A4E2B"/><stop offset=".78" stop-color="#5E2F18"/><stop offset="1" stop-color="#341609"/></radialGradient>
          <linearGradient id="shadeG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3C1E12" stop-opacity=".5"/><stop offset=".45" stop-color="#3C1E12" stop-opacity="0"/></linearGradient>
        </defs>`;
      const eye = (id, x, y) => `<g transform="translate(${x} ${y})">
          <clipPath id="c${id}"><path d="${open}"/></clipPath>
          <g clip-path="url(#c${id})">
            <g class="iris">
              <circle r="${r}" fill="url(#irisG)"/>
              <circle r="${r * 0.97}" fill="none" stroke="#2A1208" stroke-opacity=".55" stroke-width="${r * 0.1}"/>
              <circle r="${r * 0.44}" fill="#150C08"/>
              <ellipse cx="${r * 0.36}" cy="${-r * 0.4}" rx="${r * 0.24}" ry="${r * 0.21}" fill="#fff" fill-opacity=".95"/>
              <circle cx="${-r * 0.32}" cy="${r * 0.36}" r="${r * 0.08}" fill="#fff" fill-opacity=".55"/>
            </g>
            <rect x="${-w / 2}" y="${-rt}" width="${w}" height="${rt + rb}" fill="url(#shadeG)"/>
          </g>
        </g>`;
      this.svg.innerHTML = defs + eye('l', g.lx, g.ly) + eye('r', g.rx, g.ry);
      this.trackEyes(g, { x: w / 2 - r * 0.92, y: h * 0.17 });
    }
    trackEyes(g, reach) {
      this.eyes = [...this.svg.querySelectorAll('.iris')].map((iris, i) => ({ iris, cx: i ? g.rx : g.lx, cy: i ? g.ry : g.ly }));
      this.reach = reach; this._lx = this._ly = null;
    }
    scheme() {
      const h = document.documentElement, t = h.dataset.theme;
      const dark = t === 'dark' || h.classList.contains('dark') ? true : t === 'light' || h.classList.contains('light') ? false : this.dm.matches;
      this.setAttribute('scheme', dark ? 'dark' : 'light');
    }

    /* ---------------- eyes follow the pointer ----------------
       Angle from the eyes to the cursor (or the last touch); the distance sets how far the irises
       move, clamped inside the eye, with smooth easing on every animation frame. Runs only while
       the avatar is on screen and the tab is visible. */
    wake() {
      if (this._raf || document.hidden || !this.visible) return;
      let last = performance.now();
      const step = (now) => {
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        this.updateLook(dt);
        this._raf = requestAnimationFrame(step);
      };
      this._raf = requestAnimationFrame(step);
    }
    sleep() { cancelAnimationFrame(this._raf); this._raf = 0; }
    updateLook(dt) {
      if (!this.eyes?.length) return;
      const L = this.look, box = this.svg.getBoundingClientRect(); if (!box.width) return;
      if (this.target) {
        const ex = box.left + box.width * (this.eyes[0].cx + this.eyes[1].cx) / 200, ey = box.top + box.height * (this.eyes[0].cy + this.eyes[1].cy) / 200;
        const dx = this.target.x - ex, dy = this.target.y - ey, d = Math.hypot(dx, dy) || 1;
        const f = Math.min(1, d / (box.width * 2.2)), ang = Math.atan2(dy, dx);
        L.tx = Math.cos(ang) * f; L.ty = Math.sin(ang) * f;
      }
      const k = 1 - Math.exp(-dt * 11);                               // smooth easing (frame-rate independent lerp)
      L.x += (L.tx - L.x) * k; L.y += (L.ty - L.y) * k;
      const m = Math.hypot(L.x, L.y); if (m > 1) { L.x /= m; L.y /= m; }   // clamp inside the eye
      const x = (L.x * this.reach.x).toFixed(3), y = (L.y * this.reach.y).toFixed(3);
      if (x === this._lx && y === this._ly) return; this._lx = x; this._ly = y;
      for (const e of this.eyes) e.iris.setAttribute('transform', `translate(${x} ${y})`);
    }

    /* ---------------- speech bubble, tap and click ---------------- */
    active() { return this.hover || this.focusOn || this.tapOpen; }
    setActive() {
      const on = this.active();
      if (on) this.place();
      this.classList.toggle('tip-open', on);
    }
    /** Keeps the bubble on screen: it opens upward, centred on the avatar, and moves sideways if the
        avatar is near an edge. It's measured where it can't make a phone page wider. */
    place() {
      const r = this.getBoundingClientRect(), vw = document.documentElement.clientWidth || innerWidth, t = this.tip.style;
      t.display = 'block'; t.position = 'fixed'; t.left = '0px'; t.visibility = 'hidden';
      const tw = this.tip.offsetWidth || 260, edge = 12;
      t.display = t.position = t.left = t.visibility = '';
      let left = r.left + r.width / 2 - tw / 2;
      left = Math.max(edge, Math.min(vw - edge - tw, left));
      const tail = Math.max(18, Math.min(tw - 18, r.left + r.width / 2 - left));
      this.style.setProperty('--tip-r', (r.right - (left + tw)).toFixed(1) + 'px');
      this.style.setProperty('--tail-x', tail.toFixed(1) + 'px');
    }
    bind() {
      const a = this.a, aim = (x, y) => { this.target = { x, y }; };
      addEventListener('pointermove', (e) => aim(e.clientX, e.clientY), { passive: true });
      addEventListener('pointerdown', (e) => aim(e.clientX, e.clientY), { passive: true });
      addEventListener('touchstart', (e) => { const t = e.touches[0]; if (t) aim(t.clientX, t.clientY); }, { passive: true });
      addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) aim(t.clientX, t.clientY); }, { passive: true });
      document.addEventListener('visibilitychange', () => (document.hidden ? this.sleep() : this.wake()));
      document.addEventListener('keydown', () => { this.pointer = 'keyboard'; }, true);

      a.addEventListener('pointerdown', (e) => { this.pointer = e.pointerType || 'mouse'; });
      a.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') { this.hover = true; this.setActive(); } });
      a.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') { this.hover = false; this.setActive(); } });
      a.addEventListener('focus', () => { if (this.pointer === 'touch') return; this.focusOn = true; this.setActive(); });
      a.addEventListener('blur', () => { this.focusOn = this.tapOpen = false; this.setActive(); });
      a.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { this.tapOpen = this.hover = false; this.classList.remove('tip-open'); }
        if (e.key === 'Enter' && !a.href) e.preventDefault();
      });
      a.addEventListener('click', (e) => {
        const touch = this.pointer === 'touch' || (this.pointer !== 'mouse' && this.pointer !== 'keyboard' && matchMedia('(hover: none)').matches);
        if (touch && !this.tapOpen) { e.preventDefault(); this.tapOpen = true; this.setActive(); return; }   // first tap: say hello
        if (!this.url) { e.preventDefault(); return; }
        this.tapOpen = false; this.setActive();                                   // the link opens in a new tab
      });
      document.addEventListener('pointerdown', (e) => {
        if (this.tapOpen && !e.composedPath().includes(this)) { this.tapOpen = false; this.setActive(); }
      }, true);
      this.dm.addEventListener?.('change', () => this.scheme());
    }
  }
  customElements.define('creator-egg', CreatorEgg);
  window.CreatorEgg = { validateUrl, TIP_TITLE, tipSubFor, EYES, FACE, FACE_FULL };
}

/* ===========================================================================
   THE ADMIN PANEL  <creator-egg-admin>
   =========================================================================== */
{

  const DEFAULTS = {
    enabled: true, url: '', align: 'right', label: 'Made by', name: 'Joraveer Singh Ratan', tipTitle: '', tipSub: '',
    image: '', eyesOn: true, eyes: null,
  };
  const escA = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const I = {
    upload: '<svg viewBox="0 0 24 24"><path d="M12 15.5V4.5M7.5 9 12 4.5 16.5 9M4.5 15v3a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-3"/></svg>',
    undo: '<svg viewBox="0 0 24 24"><path d="M9 7 4.5 11.5 9 16"/><path d="M5 11.5h9.5a5 5 0 0 1 0 10H11"/></svg>',
    alert: '<svg viewBox="0 0 24 24"><path d="M12 4 2.8 19.5h18.4L12 4Z"/><path d="M12 10v4.5M12 17.2v.3"/></svg>',
  };

  const CSS = `
:host { all: initial; display: block; color-scheme: light;
  --bg: #F7F4EE; --surface: #FFFFFF; --paper: #F2EDE3; --ink: #16161D; --ink-2: #5B5A60; --rule: #E2DDD3;
  --accent: #A9BC63; --ok: #1E7A45; --bad: #B4231B; --radius: 18px;
  font: 15px/1.5 var(--egg-font, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif); color: var(--ink); }
:host([data-scheme="dark"]) { color-scheme: dark; --bg: #0F0F12; --surface: #19191E; --paper: #23222A; --ink: #F4F1EA; --ink-2: #B4B1AA; --rule: #33323A; --ok: #5FD08E; --bad: #FF8A80; }
* { box-sizing: border-box; }
.wrap { display: grid; gap: 18px; }
.card { background: var(--surface); border: 1px solid var(--rule); border-radius: var(--radius); padding: 22px; display: grid; gap: 16px; }
.card h2 { font-size: 19px; margin: 0; letter-spacing: -.01em; } .sub { margin: -10px 0 0; color: var(--ink-2); font-size: 14px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 20px; }
.fld { display: grid; gap: 6px; align-content: start; } .fld.wide { grid-column: 1 / -1; }
label, .lbl { font-weight: 600; font-size: 14px; } .help { margin: -4px 0 0; color: var(--ink-2); font-size: 12.5px; }
input[type=text], input[type=url] { font: inherit; padding: 10px 12px; border-radius: 12px; border: 1.5px solid var(--rule); background: var(--surface); color: var(--ink); width: 100%; }
input[aria-invalid="true"] { border-color: var(--bad); }
input:focus-visible, button:focus-visible, .pick:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.msg { font-weight: 600; font-size: 13px; margin: 0; min-height: 1.3em; color: var(--ink-2); } .msg.good { color: var(--ok); } .msg.bad { color: var(--bad); }
.note { display: flex; gap: 10px; align-items: flex-start; margin: 0; padding: 12px 14px; border-radius: 14px; background: color-mix(in srgb, var(--accent) 18%, var(--surface)); font-size: 14px; }
.note svg, button svg, .btn svg { width: 18px; height: 18px; flex: none; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.btn { font: inherit; font-weight: 600; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; padding: 9px 14px; border-radius: 999px;
  border: 1.5px solid var(--rule); background: var(--surface); color: var(--ink); cursor: pointer; }
.btn.primary { background: var(--accent); border-color: var(--accent); color: #16161D; }
.toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 8px; }
.toolbar .msg { margin-right: auto; }
.btn:hover { border-color: color-mix(in srgb, var(--ink) 30%, var(--rule)); } .btn:disabled { opacity: .45; cursor: default; }
.row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.tgl { display: inline-flex; align-items: center; gap: 10px; cursor: pointer; font-weight: 600; font-size: 14px; }
.tgl input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.trk { width: 42px; height: 24px; border-radius: 99px; background: var(--rule); position: relative; transition: background .2s; flex: none; }
.trk::after { content: ""; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.3); transition: transform .2s; }
.tgl input:checked + .trk { background: var(--ok); } .tgl input:checked + .trk::after { transform: translateX(18px); }
.tgl input:focus-visible + .trk { outline: 3px solid var(--accent); outline-offset: 2px; }
.seg { display: inline-flex; padding: 4px; gap: 4px; border-radius: 999px; background: var(--paper); }
.seg button { font: inherit; font-size: 14px; font-weight: 600; border: 0; background: none; color: var(--ink-2); padding: 7px 14px; border-radius: 999px; cursor: pointer; }
.seg button[aria-pressed="true"] { background: var(--surface); color: var(--ink); box-shadow: 0 1px 3px rgba(0,0,0,.12); }
.stage { position: sticky; top: 0; z-index: 3; display: grid; justify-items: center; padding: 26px 20px 18px; border-radius: 16px; background: var(--paper); }
.made-by { display: inline-flex; align-items: center; gap: 10px; color: var(--ink-2); font-size: 14.5px; }
.pic { display: flex; gap: 22px; align-items: center; flex-wrap: wrap; }
.place { position: relative; width: 200px; height: 200px; border-radius: 16px; overflow: hidden; background: #F3EBE0; flex: none; box-shadow: 0 0 0 1px var(--rule); }
.place img { width: 100%; height: 100%; display: block; object-fit: cover; }
.place.placing { cursor: crosshair; box-shadow: 0 0 0 2px var(--accent); }
.mk { position: absolute; width: 22px; height: 22px; margin: -11px 0 0 -11px; border-radius: 50%; border: 2.5px solid #fff; background: var(--accent);
  box-shadow: 0 1px 4px rgba(0,0,0,.4); color: #16161D; font-weight: 700; font-size: 11px; line-height: 17px; font-family: inherit; text-align: center; pointer-events: none; }
input[type=range] { width: 100%; accent-color: var(--accent); }
@media (max-width: 640px) {
  .card { padding: 18px 16px; } .grid { grid-template-columns: 1fr; }
  .place { width: 100%; max-width: 260px; height: auto; aspect-ratio: 1; }
}`;

  class CreatorEggAdmin extends HTMLElement {
    constructor() {
      super();
      this.cfg = clone(DEFAULTS); this.next = 'l';
      this.root = this.attachShadow({ mode: 'open' });
      this.root.addEventListener('click', (e) => this.onClick(e));
      this.root.addEventListener('input', (e) => this.onInput(e));
      this.root.addEventListener('change', (e) => this.onChange(e));
      this.dm = matchMedia('(prefers-color-scheme: dark)');
    }
    connectedCallback() {
      this.scheme();
      const key = this.getAttribute('storage-key');
      if (key && !this._restored) {
        this._restored = true;
        try { const v = JSON.parse(localStorage.getItem(key)); if (v) this.cfg = { ...clone(DEFAULTS), ...v }; } catch { /* storage blocked */ }
        this.addEventListener('change', (e) => { try { localStorage.setItem(key, JSON.stringify(e.detail)); this.barMsg('Saved in this browser'); } catch { this.barMsg('Couldn’t save in this browser'); } });
      }
      this._mo = new MutationObserver(() => this.scheme());
      this._mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
      this.dm.addEventListener?.('change', () => this.scheme());
      this.render();
    }
    disconnectedCallback() { this._mo?.disconnect(); }
    static get observedAttributes() { return ['theme']; }
    attributeChangedCallback() { if (this.isConnected) { this.scheme(); this.render(); } }

    /* ---------- public ---------- */
    get value() { return clone(this.cfg); }
    set value(v) { this.cfg = { ...clone(DEFAULTS), ...(v && typeof v === 'object' ? clone(v) : {}) }; if (this.isConnected) this.render(); }
    static get defaults() { return clone(DEFAULTS); }

    /* ---------- helpers ---------- */
    scheme() {
      const t = this.getAttribute('theme'), h = document.documentElement;
      const dark = t ? t === 'dark' : h.dataset.theme === 'dark' || h.classList.contains('dark') ? true : h.dataset.theme === 'light' || h.classList.contains('light') ? false : this.dm.matches;
      this.dataset.scheme = dark ? 'dark' : 'light';
    }
    validUrl(u) { return window.CreatorEgg ? window.CreatorEgg.validateUrl(u) : /^https:\/\/[^\s/]+\.[^\s]+/.test(String(u || '').trim()) ? String(u).trim() : ''; }
    emit(label) {
      this.syncPreview();
      this.dispatchEvent(new CustomEvent('change', { detail: this.value, bubbles: true, composed: true }));
      if (label) this.dispatchEvent(new CustomEvent('creator-egg-admin:changed', { detail: { label }, bubbles: true, composed: true }));
    }
    barMsg(t) { this._barMsg = t; const m = this.root.getElementById('bar-msg'); if (m) m.textContent = t; }
    set(key, val, rerender = false, label = '') { this.cfg[key] = val; if (rerender) this.render(true); this.emit(label); }
    eyeGeo() { const e = this.cfg.eyes; const E = (window.CreatorEgg && window.CreatorEgg.EYES) || { lx: 37.4, ly: 58.7, rx: 62.1, ry: 58.7 }; return e && +e.w > 0 ? e : { lx: E.lx, ly: E.ly, rx: E.rx, ry: E.ry, w: 13, h: 6.8 }; }
    syncPreview() {
      this.root.querySelectorAll('creator-egg').forEach((el) => el.configure && el.configure({ ...this.cfg, enabled: true }));
      const lbl = this.root.querySelector('.made-by > span'); if (lbl) lbl.textContent = this.cfg.label ?? '';
    }

    /* ---------- drawing ---------- */
    render(keepScroll) {
      const c = this.cfg, ok = this.validUrl(c.url), custom = !!c.image, geo = this.eyeGeo();
      const pic = c.image || FACE_FULL;
      const msg = !c.url ? ['', 'No address yet, so the easter egg stays hidden.'] : ok ? ['good', 'Looks good. Visitors go here when they click your picture.'] : ['bad', 'Use a full address that starts with https://, like https://example.com'];
      const tg = (key, label, help) => `<div class="fld"><label class="tgl"><input type="checkbox" data-k="${key}" ${c[key] !== false ? 'checked' : ''}><span class="trk" aria-hidden="true"></span>${label}</label>${help ? `<p class="help" style="margin:0">${help}</p>` : ''}</div>`;
      const tx = (key, label, help, wide, ph = '') => `<div class="fld${wide ? ' wide' : ''}"><label for="f-${key}">${label}</label>${help ? `<p class="help">${help}</p>` : ''}<input type="text" id="f-${key}" data-k="${key}" value="${escA(c[key])}" placeholder="${escA(ph)}"></div>`;
      const T = window.CreatorEgg || { TIP_TITLE: 'Hi, I am the creator of this website 👋', tipSubFor: (n) => `— ${n} · Click to visit my site` };
      const bar = this.hasAttribute('toolbar') ? `<div class="toolbar"><span class="msg" id="bar-msg" role="status">${escA(this._barMsg || '')}</span>
          <label class="btn" style="cursor:pointer">Load settings<input type="file" accept="application/json,.json" data-load hidden></label>
          <button class="btn" type="button" data-act="start-over">Start over</button>
          <button class="btn primary" type="button" data-act="download">Download settings</button></div>` : '';
      this.root.innerHTML = `<style>${CSS}</style><div class="wrap">${bar}
        ${c.enabled !== false && !ok ? `<p class="note">${I.alert}<span>The easter egg stays hidden on your site until you add your website address.</span></p>` : ''}
        <section class="card"><h2>Preview</h2>
          <div class="stage"><span class="made-by"><span>${escA(c.label)}</span><creator-egg preview></creator-egg></span></div>
          <p class="sub" style="margin:0">Move your mouse around: the eyes follow it. Hover the picture to see the speech bubble.</p></section>
        <section class="card"><h2>Settings</h2><div class="grid">
          <div class="fld wide"><label for="f-url">Creator website URL</label><p class="help">Your personal website. It opens in a new tab. Must start with https://</p>
            <input type="url" id="f-url" data-url value="${escA(c.url)}" placeholder="https://" spellcheck="false" autocomplete="url"${c.url && !ok ? ' aria-invalid="true"' : ''} aria-describedby="url-msg">
            <p class="msg ${msg[0]}" id="url-msg" role="status">${escA(msg[1])}</p></div>
          ${tg('enabled', 'Show the easter egg', 'Turn off to hide it everywhere without losing your settings.')}
          <div class="fld"><span class="lbl">Footer alignment</span><div class="seg" role="group" aria-label="Footer alignment">${[['left', 'Left'], ['center', 'Center'], ['right', 'Right']].map(([v, t]) => `<button type="button" data-act="align" data-v="${v}" aria-pressed="${(c.align || 'right') === v}">${t}</button>`).join('')}</div></div>
          ${tx('label', 'Text before the picture', 'For example "Made by" or "Built by".')}
          ${tx('name', 'Your name', 'Used in the speech bubble and read out by screen readers.')}
          ${tx('tipTitle', 'Speech bubble, first line', 'Leave empty for the default.', true, T.TIP_TITLE)}
          ${tx('tipSub', 'Speech bubble, second line', 'Leave empty for the default.', true, T.tipSubFor(c.name || 'your name'))}
        </div></section>
        <section class="card"><h2>Picture</h2><div class="pic">
          <div class="place${custom && c.eyesOn !== false ? ' placing' : ''}" id="place"><img src="${escA(pic)}" alt="Your easter egg picture">
            ${custom && c.eyesOn !== false ? `<span class="mk" style="left:${geo.lx}%;top:${geo.ly}%">L</span><span class="mk" style="left:${geo.rx}%;top:${geo.ry}%">R</span>` : ''}</div>
          <div style="display:grid;gap:12px;flex:1;min-width:220px">
            <p class="sub" style="margin:0">${custom ? 'You’re using your own picture.' : 'You’re using the built-in 3D avatar. Its irises are drawn on top of the picture, so they follow the mouse.'}</p>
            <div class="row"><label class="btn" style="cursor:pointer">${I.upload}Upload a new picture<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" data-upload hidden></label>
              <button class="btn" type="button" data-act="reset-pic"${custom ? '' : ' disabled'}>${I.undo}Back to my avatar</button></div>
            ${custom ? tg('eyesOn', 'Draw moving eyes on the picture', 'They cover the eyes in your picture so they can follow the mouse.') : ''}
            ${custom && c.eyesOn !== false ? `<p class="sub" style="margin:0"><b>Place the eyes:</b> click the middle of the left eye (L), then the right eye (R).</p>
              <div class="fld"><label for="f-eyesize">Eye size</label><input type="range" id="f-eyesize" data-eyesize min="6" max="26" step="0.2" value="${escA(geo.w)}"></div>` : ''}
            <p class="sub" style="margin:0;font-size:13px">A square picture of your face works best. It’s shrunk to 256 × 256 so pages stay fast.</p>
          </div></div></section>
</div>`;
      this.syncPreview();
    }

    /* ---------- events ---------- */
    onInput(e) {
      const el = e.target;
      if (el.matches('[data-url]')) {
        const v = el.value.trim(), ok = this.validUrl(v), m = this.root.getElementById('url-msg');
        if (!v) { el.removeAttribute('aria-invalid'); m.className = 'msg'; m.textContent = 'No address yet, so the easter egg stays hidden.'; this.set('url', '', false, 'Removed the website'); }
        else if (ok) { el.removeAttribute('aria-invalid'); m.className = 'msg good'; m.textContent = 'Looks good. Visitors go here when they click your picture.'; this.set('url', ok, false, 'Changed the website'); }
        else { el.setAttribute('aria-invalid', 'true'); m.className = 'msg bad'; m.textContent = 'Use a full address that starts with https://, like https://example.com (not saved yet).'; }
      } else if (el.matches('input[type=text][data-k]')) this.set(el.dataset.k, el.value, false, 'Changed text');
      else if (el.matches('[data-eyesize]')) { const g = { ...this.eyeGeo() }; g.w = +el.value; g.h = +(g.w * 0.52).toFixed(2); this.set('eyes', g, false, 'Changed the eye size'); }
    }
    onChange(e) {
      const el = e.target;
      if (el.matches('input[type=checkbox][data-k]')) this.set(el.dataset.k, el.checked, true, 'Changed a switch');
      if (el.matches('[data-upload]') && el.files[0]) this.upload(el.files[0]);
      if (el.matches('[data-load]') && el.files[0]) {
        el.files[0].text().then((t) => { this.value = JSON.parse(t); this.emit('Loaded settings'); this.barMsg('Settings loaded'); })
          .catch(() => this.barMsg('That file isn’t a settings file.'));
      }
    }
    onClick(e) {
      const place = e.target.closest('#place.placing');
      if (place) {
        const r = place.getBoundingClientRect(), x = +((e.clientX - r.left) / r.width * 100).toFixed(1), y = +((e.clientY - r.top) / r.height * 100).toFixed(1);
        const g = { ...this.eyeGeo() }; if (this.next === 'l') { g.lx = x; g.ly = y; } else { g.rx = x; g.ry = y; }
        this.next = this.next === 'l' ? 'r' : 'l'; this.set('eyes', g, true, 'Placed an eye'); return;
      }
      const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
      const act = b.dataset.act, v = b.dataset.v;
      if (act === 'align') this.set('align', v, true, 'Changed the alignment');
      else if (act === 'download') {
        const blob = new Blob([JSON.stringify(this.value, null, 2)], { type: 'application/json' });
        const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'creator-egg.config.json' });
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        this.barMsg('Downloaded creator-egg.config.json');
      } else if (act === 'start-over') { this.value = DEFAULTS; this.emit('Started over'); this.barMsg('Back to the default settings'); }
      else if (act === 'reset-pic') { this.cfg.image = ''; this.cfg.eyesOn = true; this.cfg.eyes = null; this.render(true); this.emit('Went back to the avatar'); }
    }
    /** Shrinks an uploaded picture to a 256 px square (WebP when the browser can make it). */
    async upload(file) {
      try {
        const url = URL.createObjectURL(file);
        const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = url; });
        const c = document.createElement('canvas'); c.width = c.height = 256;
        const s = Math.min(img.naturalWidth, img.naturalHeight);
        c.getContext('2d').drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, 256, 256);
        URL.revokeObjectURL(url);
        let data = c.toDataURL('image/webp', 0.86);
        if (!data.startsWith('data:image/webp')) data = c.toDataURL('image/png');
        if (data.length > 220000) data = c.toDataURL('image/jpeg', 0.86);
        this.cfg.image = data; this.cfg.eyesOn = false; this.cfg.eyes = { lx: 0, ly: 0, rx: 0, ry: 0, w: 0 }; this.next = 'l';
        this.render(true); this.emit('Uploaded a picture');
      } catch { this.dispatchEvent(new CustomEvent('creator-egg-admin:error', { detail: { code: 'bad_picture', message: 'That picture couldn’t be used. Try a PNG, JPG or WebP.' }, bubbles: true, composed: true })); }
    }
  }
  customElements.define('creator-egg-admin', CreatorEggAdmin);
}
})();
