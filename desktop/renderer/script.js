/* ============================================================
   Theorem — LaTeX equation press
   Repo:   https://github.com/Soumyajit9696/theorem
   Live:   https://soumyajit9696.github.io/theorem/
   Built by Soumyajit Das
   Requires: index.html + style.css in the same folder.
   ============================================================ */
'use strict';
const $ = id => document.getElementById(id);
const SVGNS = 'http://www.w3.org/2000/svg';
const LS = 'theorem.v1';
const HIST_LS = 'theorem.hist';
const THEME_LS = 'theorem.theme';
const EMPTY_HINT = 'Nothing typeset yet — write LaTeX,<br>open the template library, or<br>pick a symbol from the palette.';

/* ---------------- state ---------------- */
const S = {
  tex: '\\int_{-\\infty}^{\\infty} e^{-x^{2}}\\,dx = \\sqrt{\\pi}',
  display: 'display', variant: 'regular',
  size: 26, ink: '#1A1917', hl: '#C2440C',
  bgMode: 'transparent', bgColor: '#FFFFFF', pad: 24, radius: 0,
  fmt: 'png', scale: 2, fname: 'equation', backdrop: 'paper'
};

/* ---------------- element refs ---------------- */
const texEl = $('tex'), errBox = $('errBox'),
      ptabsEl = $('ptabs'), pgridEl = $('pgrid'), palHint = $('palHint'),
      frameWrap = $('frameWrap'), frame = $('frame'), stageMath = $('stageMath'),
      emptyEl = $('empty'), emptyHint = $('emptyHint'), viewport = $('viewport'),
      fitChip = $('fitChip'), dimsChip = $('dimsChip'), histEl = $('hist'),
      statusBox = $('statusBox'), stTxt = $('stTxt'),
      measurer = $('measurer'), sink = $('sink'),
      exportBtn = $('exportBtn'), exportLbl = $('exportLbl'), fmtNote = $('fmtNote'),
      fnameEl = $('fname'), bgSwRow = $('bgSwRow'), radRow = $('radRow'), radR = $('radR'),
      drawer = $('drawer'), tplCatsEl = $('tplCats'), tplListEl = $('tplList'), tplSearch = $('tplSearch'),
      modal = $('modal'), refBody = $('refBody'), refSearch = $('refSearch'),
      aboutModal = $('aboutModal'),
      envListEl = $('envList'), envMatEl = $('envMat'), charCount = $('charCount'),
      hlPop = $('hlPop'), hlSw = $('hlSw'), hlCustom = $('hlCustom'),
      acBox = $('acBox');

/* ---------------- theme helpers ---------------- */
const isDark = () => document.documentElement.classList.contains('dark');
const pvInk = () => isDark() ? '#EDE7D9' : '#211E19';
const panelColor = () => isDark() ? '#2B261E' : '#FCFBF6';

function paintThemeBtn(){
  $('icoMoon').hidden = isDark();
  $('icoSun').hidden = !isDark();
  $('themeBtn').title = isDark() ? 'switch to light theme' : 'switch to dark theme';
}
function setTheme(dark){
  document.documentElement.classList.toggle('dark', dark);
  try { localStorage.setItem(THEME_LS, dark ? 'dark' : 'light'); } catch (e) {}
  paintThemeBtn();
  swPaints.forEach(fn => fn());
  paintHl();
  refreshPreviews();
}
/* previews re-ink in place: old markup stays visible until the new one replaces it */
function refreshPreviews(){
  pvCache.clear();
  document.querySelectorAll('.tPrev,.envPrev,.refMath').forEach(el => {
    delete el.dataset.done;
  });
  envPrevsDone = false;
  if (drawerOpen) fillPreviews();
  if (!$('envView').hidden) showEnvPreviews();
  if (modalOpen) queueRefPreviews();
}

/* ---------------- caret memory ---------------- */
let savedCaret = null;
function saveCaret(){
  savedCaret = { s: texEl.selectionStart, e: texEl.selectionEnd };
}
['keyup', 'mouseup', 'touchend', 'input', 'select'].forEach(ev =>
  texEl.addEventListener(ev, saveCaret));
document.addEventListener('selectionchange', () => {
  if (document.activeElement === texEl) saveCaret();
});
function caretRange(){
  const len = texEl.value.length;
  if (document.activeElement === texEl)
    return { s: texEl.selectionStart, e: texEl.selectionEnd };
  if (savedCaret)
    return { s: Math.min(savedCaret.s, len), e: Math.min(savedCaret.e, len) };
  return { s: len, e: len };
}

/* ---------------- helpers ---------------- */
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const serialize = el => new XMLSerializer().serializeToString(el);
const kb = n => n > 1048576 ? (n/1048576).toFixed(1)+' MB' : Math.max(1, Math.round(n/1024))+' KB';

function errText(e){
  if (!e) return 'unknown error';
  if (typeof e === 'string') return e;
  let m = e.message || '';
  if (Array.isArray(e.data) && e.data.length) m = (m ? m + ' — ' : '') + e.data.join(' ').trim();
  if (!m) m = String(e);
  return m.replace(/^tex2svg:\s*/i, '').slice(0, 240);
}
function sanitizeName(s){
  return (s || 'equation').replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ').trim().slice(0, 60) || 'equation';
}
function download(blob, name){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
const canvasBlob = (c, t = 'image/png', q) => new Promise(r => c.toBlob(r, t, q));


/* ---------------- smart PNGs: LaTeX source embedded in the file ----------------
   The source rides as an uncompressed iTXt chunk ("LaTeX") inside every PNG
   Theorem produces — drop or open that PNG back here to recover the source. */
const PNG_SIG = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

function pngCrc32(buf){
  let t = pngCrc32._t;
  if (!t){
    t = pngCrc32._t = new Int32Array(256);
    for (let n = 0; n < 256; n++){
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c;
    }
  }
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function u32(n){
  return new Uint8Array([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
}
function embedTexInPng(buffer, tex){
  try {
    const src = new Uint8Array(buffer);
    if (src.length < 12 || PNG_SIG.some((b, i) => src[i] !== b)) return src;

    const kw   = new TextEncoder().encode('LaTeX');
    const body = new TextEncoder().encode(String(tex).slice(0, 50000));
    const data = new Uint8Array(kw.length + 5 + body.length);
    data.set(kw, 0);
    data[kw.length]     = 0;   /* keyword separator     */
    data[kw.length + 1] = 0;   /* compression flag: off */
    data[kw.length + 2] = 0;   /* compression method    */
    data[kw.length + 3] = 0;   /* empty language tag    */
    data[kw.length + 4] = 0;   /* empty translated kw   */
    data.set(body, kw.length + 5);

    const type  = new Uint8Array([0x69, 0x54, 0x58, 0x74]);   /* "iTXt" */
    const crcIn = new Uint8Array(4 + data.length);
    crcIn.set(type, 0); crcIn.set(data, 4);

    const chunk = new Uint8Array(12 + data.length);
    chunk.set(u32(data.length), 0);
    chunk.set(type, 4);
    chunk.set(data, 8);
    chunk.set(u32(pngCrc32(crcIn)), 8 + data.length);

    /* insert right before IEND */
    let off = 8, at = -1;
    while (off + 12 <= src.length){
      const len = (src[off] << 24 | src[off + 1] << 16 | src[off + 2] << 8 | src[off + 3]) >>> 0;
      const typ = String.fromCharCode(src[off + 4], src[off + 5], src[off + 6], src[off + 7]);
      if (typ === 'IEND'){ at = off; break; }
      off += 12 + len;
    }
    if (at < 0) return src;
    const out = new Uint8Array(src.length + chunk.length);
    out.set(src.subarray(0, at), 0);
    out.set(chunk, at);
    out.set(src.subarray(at), at + chunk.length);
    return out;
  } catch (e) { return new Uint8Array(buffer); }
}
function extractTexFromPng(bytes){
  try {
    const src = new Uint8Array(bytes);
    if (src.length < 12 || PNG_SIG.some((b, i) => src[i] !== b)) return null;
    let off = 8;
    while (off + 12 <= src.length){
      const len = (src[off] << 24 | src[off + 1] << 16 | src[off + 2] << 8 | src[off + 3]) >>> 0;
      const typ = String.fromCharCode(src[off + 4], src[off + 5], src[off + 6], src[off + 7]);
      if (typ === 'iTXt' && len > 5){
        const d = src.subarray(off + 8, off + 8 + len);
        const z1 = d.indexOf(0);
        if (z1 === 5 && String.fromCharCode(d[0], d[1], d[2], d[3], d[4]) === 'LaTeX'
            && d[6] === 0 && d[7] === 0){
          const z2 = d.indexOf(0, 8);
          const z3 = z2 >= 0 ? d.indexOf(0, z2 + 1) : -1;
          if (z2 >= 0 && z3 >= 0){
            const text = new TextDecoder().decode(d.subarray(z3 + 1));
            if (text) return text;
          }
        }
      }
      if (typ === 'IEND') break;
      off += 12 + len;
    }
  } catch (e) {}
  return null;
}
function blobToDataURL(blob){
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(new Error('could not read blob'));
    r.readAsDataURL(blob);
  });
}
async function pngBlobWithSource(canvas){
  const blob = await canvasBlob(canvas);
  try {
    const out = embedTexInPng(await blob.arrayBuffer(), texEl.value);
    return new Blob([out], { type: 'image/png' });
  } catch (e) { return blob; }
}

const loaded = {};
function loadScript(src){
  return loaded[src] || (loaded[src] = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.onload = res;
    s.onerror = () => { delete loaded[src]; rej(new Error('could not load ' + src)); };
    document.head.appendChild(s);
  }));
}

/* ---------------- toasts ---------------- */
const IC = {
  ok:   '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3.2 8.6l3.2 3.2 6.4-7"/></svg>',
  err:  '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="8" cy="8" r="6.2"/><path d="M8 4.6v4.1"/><path d="M8 11.7h.01"/></svg>',
  info: '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="8" cy="8" r="6.2"/><path d="M8 7.2v4"/><path d="M8 4.6h.01"/></svg>'
};
function toast(msg, kind = 'ok'){
  const box = $('toasts');
  while (box.children.length > 3) box.firstChild.remove();
  const t = document.createElement('div');
  t.className = 'toast ' + (kind === 'err' ? 'err' : kind === 'info' ? 'info' : '');
  t.innerHTML = '<span class="tIco">' + (IC[kind] || IC.ok) + '</span><span class="tMsg"></span>';
  t.querySelector('.tMsg').textContent = msg;
  box.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 240); }, 3200);
}
function setStatus(txt, cls){
  stTxt.textContent = txt;
  statusBox.className = 'status ' + cls;
}

/* ---------------- persistence ---------------- */
let pT;
function persist(){
  S.tex = texEl.value;
  clearTimeout(pT);
  pT = setTimeout(() => { try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) {} }, 250);
}
function restore(){
  try {
    const d = JSON.parse(localStorage.getItem(LS));
    if (d && typeof d === 'object') Object.assign(S, d);
  } catch (e) {}
}

/* ---------------- MathJax readiness (resilient) ---------------- */
let mjReady = false, mjFailed = false, mjHooked = false, mjTicks = 0;

function setFatal(msg){
  if (mjFailed || mjReady) return;
  mjFailed = true;
  setStatus('offline', 'err');
  stTxt.textContent = 'MathJax unavailable';
  emptyHint.textContent = msg;
}
function markMJReady(){
  if (mjReady || mjFailed) return;
  if (!(window.MathJax && typeof window.MathJax.tex2svgPromise === 'function')) return;
  mjReady = true;
  setStatus('ready', 'ok');
  render();
}
function mjWatch(){
  if (mjReady || mjFailed) return;
  if (window.__mjFailed){
    setFatal('MathJax could not load from its CDN — check your connection and reload this page.');
    return;
  }
  markMJReady();
  const M = window.MathJax;
  if (!mjHooked && M && M.startup && M.startup.promise && typeof M.startup.promise.then === 'function'){
    mjHooked = true;
    M.startup.promise.then(markMJReady).catch(err => {
      setFatal('MathJax failed to start — ' + errText(err));
    });
  }
  mjTicks++;
  if (mjTicks === 14) setStatus('still loading MathJax…', 'busy');
  if (mjTicks > 75){
    setFatal('MathJax never finished loading — the CDN may be blocked. Check your network and reload.');
    return;
  }
  setTimeout(mjWatch, 350);
}
function waitMJ(){
  return mjReady ? Promise.resolve() : new Promise(res => {
    const iv = setInterval(() => { if (mjReady || mjFailed){ clearInterval(iv); res(); } }, 200);
  });
}

/* ---------------- source preprocessing ---------------- */
function stripDelims(t){
  t = t.trim();
  const pairs = [['$$','$$'], ['\\(','\\)'], ['\\[','\\]'], ['$','$']];
  for (const [a, b] of pairs){
    if (t.startsWith(a) && t.endsWith(b) && t.length >= a.length + b.length)
      return t.slice(a.length, t.length - b.length).trim();
  }
  return t;
}
function preprocess(t){
  t = stripDelims(t);
  /* TeX-style % comments (respecting \%) */
  t = t.split('\n').map(line => line.replace(/(^|[^\\])%.*$/, '$1')).join('\n');
  t = t
    .replace(/\\documentclass(\[[^\]]*\])?\s*\{[^{}]*\}/g, ' ')
    .replace(/\\usepackage(\[[^\]]*\])?\s*\{[^{}]*\}/g, ' ')
    .replace(/\\(begin|end)\{document\}/g, ' ')
    .replace(/\\(begin|end)\{(equation\*?|displaymath)\}/g, ' ')
    .replace(/\\label\{[^{}]*\}/g, ' ');
  return t.trim();
}
function effectiveSource(){
  let t = preprocess(texEl.value);
  const hasEnv = /\\begin\{/.test(t);
  if (!hasEnv){
    if (S.variant === 'bold')  t = '\\boldsymbol{' + t + '}';
    else if (S.variant === 'roman') t = '\\mathrm{' + t + '}';
  }
  return t;
}

/* ---------------- render pipeline ---------------- */
let renderSeq = 0, renderTimer = null,
    currentSVG = null, dims = { w: 0, h: 0 },
    fitMode = 'fit', firstPaint = true;

function scheduleRender(){ clearTimeout(renderTimer); renderTimer = setTimeout(render, 140); }

async function render(){
  const raw = texEl.value.trim();
  persist();
  if (!raw){
    currentSVG = null;
    frameWrap.style.display = 'none';
    emptyEl.style.display = '';
    emptyHint.innerHTML = EMPTY_HINT;
    showError(null);
    exportBtn.disabled = true;
    setStatus('idle', 'ok');
    updateDims();
    return;
  }
  if (!mjReady || !(window.MathJax && MathJax.tex2svgPromise)) return;

  setStatus('typesetting…', 'busy');
  const src = effectiveSource();
  const t0 = performance.now();
  const my = ++renderSeq;
  try {
    let node;
    try {
      node = await MathJax.tex2svgPromise(src, { display: S.display === 'display' });
    } catch (e1){
      if (S.display === 'inline' && /\\begin\{/.test(src)){
        node = await MathJax.tex2svgPromise(src, { display: true });
      } else throw e1;
    }
    if (my !== renderSeq) return;
    const svg = (node && node.tagName && node.tagName.toLowerCase() === 'svg')
              ? node : (node ? node.querySelector('svg') : null);
    if (!svg) throw new Error('no output produced');

    currentSVG = svg;
    stageMath.innerHTML = '';
    stageMath.appendChild(svg);
    frameWrap.style.display = '';
    emptyEl.style.display = 'none';
    showError(null);
    exportBtn.disabled = false;

    const dt = performance.now() - t0;
    setStatus('typeset in ' + (dt < 10 ? dt.toFixed(1) : Math.round(dt)) + ' ms', 'ok');
    measure();
    relayout();
    pushHistory(raw);
    if (firstPaint){
      firstPaint = false;
      frame.classList.add('born');
      setTimeout(() => frame.classList.remove('born'), 600);
    }
  } catch (e){
    if (my !== renderSeq) return;
    showError(errText(e));
    setStatus('compile error', 'err');
  }
}
function showError(msg){
  if (msg){ errBox.textContent = msg; errBox.classList.add('show'); }
  else { errBox.textContent = ''; errBox.classList.remove('show'); }
}

function measureNode(node, fontSize){
  measurer.style.fontSize = fontSize + 'px';
  measurer.innerHTML = '';
  measurer.appendChild(node.cloneNode(true));
  return measurer.firstElementChild.getBoundingClientRect();
}
function measure(){
  if (!currentSVG){ dims = { w: 0, h: 0 }; return; }
  const r = measureNode(currentSVG, S.size);
  dims = { w: r.width, h: r.height };
}

let relayoutPending = false;
function relayout(){
  if (relayoutPending) return;
  relayoutPending = true;
  requestAnimationFrame(() => { relayoutPending = false; doRelayout(); });
}
function doRelayout(){
  if (!currentSVG){ updateDims(); return; }
  const tw = dims.w + 2 * S.pad, th = dims.h + 2 * S.pad;
  let f = 1;
  if (fitMode === 'fit'){
    const vw = viewport.clientWidth - 104, vh = viewport.clientHeight - 138;
    if (vw > 0 && vh > 0) f = Math.min(1, vw / tw, vh / th);
  }
  frameWrap.style.transform = f < 0.999 ? 'scale(' + f + ')' : '';
  const pct = Math.round(f * 100);
  fitChip.hidden = (fitMode === 'fit' && pct >= 100);
  fitChip.textContent = fitMode === 'fit' ? 'fit ' + pct + '%' : 'actual';
  updateDims();
}
function updateDims(){
  if (!currentSVG){ dimsChip.textContent = '— × —'; return; }
  const W = Math.round((dims.w + 2 * S.pad) * S.scale);
  const H = Math.round((dims.h + 2 * S.pad) * S.scale);
  dimsChip.textContent = W + ' × ' + H + ' px · ' + S.fmt.toUpperCase() + ' ×' + (S.scale % 1 ? S.scale.toFixed(1) : S.scale);
}

/* ---------------- history (persisted across sessions) ---------------- */
let hist = [];
function saveHist(){
  try { localStorage.setItem(HIST_LS, JSON.stringify(hist)); } catch (e) {}
}
function loadHist(){
  try {
    const h = JSON.parse(localStorage.getItem(HIST_LS));
    if (Array.isArray(h)) hist = h.filter(x => x && typeof x.tex === 'string').slice(0, 14);
  } catch (e) {}
}
function pushHistory(raw){
  if (!raw) return;
  if (hist.length && hist[0].tex === raw){ renderHistory(raw); return; }
  let svg = '';
  if (dims.h > 0){
    const b = buildSVG({ scale: 40 / Math.max(8, dims.h), pad: 0, withBg: false, radius: 0 });
    if (b) svg = serialize(b.el);
  }
  hist.unshift({ tex: raw, svg: svg });
  if (hist.length > 14) hist.pop();
  saveHist();
  renderHistory(raw);
}
function renderHistory(activeTex){
  if (!hist.length) return;
  histEl.innerHTML = '';
  hist.forEach(h => {
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'hItem' + (h.tex === activeTex ? ' on' : '');
    d.title = h.tex.length > 90 ? h.tex.slice(0, 90) + '…' : h.tex;
    if (h.svg) d.innerHTML = h.svg;
    d.onclick = () => {
      texEl.value = h.tex;
      savedCaret = null;
      autoGrow();
      renderHistory(h.tex);
      render();
    };
    histEl.appendChild(d);
  });
}

/* ---------------- standalone SVG builder ----------------
   MathJax renders \color regions via color wrappers, and plain glyphs
   via fill="currentColor". We resolve every currentColor to an explicit
   computed color, so colored regions survive every export and the SVG is
   fully standalone (Illustrator, canvas, svg2pdf). */
function standaloneSVG(node, W, H, o = {}){
  const ink = o.ink || S.ink;
  const clone = node.cloneNode(true);
  clone.removeAttribute('style');
  clone.setAttribute('style', 'color:' + ink);   /* currentColor anchor */
  clone.setAttribute('fill', ink);               /* safety net for unattributed glyphs */
  const w = Math.max(1, Math.round(W)), h = Math.max(1, Math.round(H)), P = Math.round(o.P || 0);
  clone.setAttribute('width', w);
  clone.setAttribute('height', h);
  clone.setAttribute('x', P);
  clone.setAttribute('y', P);
  const out = document.createElementNS(SVGNS, 'svg');
  out.setAttribute('width', w + 2 * P);
  out.setAttribute('height', h + 2 * P);
  if (o.bg){
    const r = document.createElementNS(SVGNS, 'rect');
    r.setAttribute('x', 0); r.setAttribute('y', 0);
    r.setAttribute('width', w + 2 * P); r.setAttribute('height', h + 2 * P);
    if (o.radius > 0) r.setAttribute('rx', Math.round(o.radius));
    r.setAttribute('fill', o.bg);
    out.appendChild(r);
  }
  out.appendChild(clone);
  /* resolve currentColor → explicit colors (needs a live DOM context) */
  sink.appendChild(out);
  try {
    out.querySelectorAll('[fill="currentColor"]').forEach(el => {
      const c = getComputedStyle(el).fill;
      if (c && c !== 'none') el.setAttribute('fill', c);
      else el.removeAttribute('fill');
    });
    out.querySelectorAll('[stroke="currentColor"]').forEach(el => {
      const c = getComputedStyle(el).stroke;
      if (c && c !== 'none') el.setAttribute('stroke', c);
      else el.removeAttribute('stroke');
    });
  } catch (e) {}
  out.remove();
  return { el: out, w: w + 2 * P, h: h + 2 * P };
}
function buildSVG(o = {}){
  if (!currentSVG || !dims.w) return null;
  const scale = o.scale !== undefined ? o.scale : S.scale;
  const pad   = o.pad   !== undefined ? o.pad   : S.pad;
  const radius = o.radius !== undefined ? o.radius : S.radius;
  const withBg = o.withBg !== undefined ? o.withBg : (S.bgMode === 'color');
  return standaloneSVG(currentSVG, dims.w * scale, dims.h * scale, {
    ink: S.ink, P: pad * scale, radius: radius * scale,
    bg: withBg ? (o.bg !== undefined ? o.bg : S.bgColor) : null
  });
}

function pathRR(ctx, w, h, r){
  if (r > w / 2) r = w / 2;
  if (r > h / 2) r = h / 2;
  if (r <= 0){ ctx.beginPath(); ctx.rect(0, 0, w, h); return; }
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0); ctx.quadraticCurveTo(w, 0, w, r);
  ctx.lineTo(w, h - r); ctx.quadraticCurveTo(w, h, w - r, h);
  ctx.lineTo(r, h); ctx.quadraticCurveTo(0, h, 0, h - r);
  ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
}

async function rasterize(o = {}){
  if (!currentSVG) throw new Error('Nothing to render yet');
  let scale = o.scale !== undefined ? o.scale : S.scale;
  const tw = (dims.w + 2 * S.pad) * scale, th = (dims.h + 2 * S.pad) * scale;
  const m = Math.max(tw, th);
  if (m > 12000){ scale *= 12000 / m; toast('Scale clamped to stay under 12 000 px', 'info'); }
  const withBg = o.withBg !== undefined ? o.withBg : (S.bgMode === 'color');
  const b = buildSVG({ scale, withBg, bg: o.bgColor });
  if (!b) throw new Error('Nothing to render yet');

  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' + serialize(b.el);
  const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }));
  const img = new Image();
  try {
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = () => rej(new Error('the browser could not rasterize this SVG'));
      img.src = url;
    });
    if (img.decode){ try { await img.decode(); } catch (e) {} }
    const canvas = document.createElement('canvas');
    canvas.width = b.w; canvas.height = b.h;
    const ctx = canvas.getContext('2d');
    if (withBg){
      ctx.fillStyle = o.bgColor || S.bgColor;
      pathRR(ctx, b.w, b.h, S.radius * scale);
      ctx.fill();
    } else if (o.forceWhite){
      ctx.fillStyle = '#FFFFFF';
      pathRR(ctx, b.w, b.h, S.radius * scale);
      ctx.fill();
    }
    ctx.drawImage(img, 0, 0, b.w, b.h);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* ---------------- exports ---------------- */
function setBusy(b){
  exportBtn.disabled = b;
  exportLbl.textContent = b ? 'Working…' : 'Export ' + S.fmt.toUpperCase();
}
function stamp(){
  frame.classList.remove('stamp');
  void frame.offsetWidth;
  frame.classList.add('stamp');
  setTimeout(() => frame.classList.remove('stamp'), 600);
}

async function doExport(){
  if (!currentSVG){ toast('Nothing to export yet — write some LaTeX first', 'err'); return; }
  const name = sanitizeName(fnameEl.value);
  setBusy(true);
  try {
    if (S.fmt === 'svg'){
      const b = buildSVG();
      const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' + serialize(b.el);
      download(new Blob([xml], { type: 'image/svg+xml' }), name + '.svg');
      toast('Saved ' + name + '.svg — vector, ' + b.w + ' × ' + b.h);
    } else if (S.fmt === 'png'){
      const canvas = await rasterize();
      const blob = await pngBlobWithSource(canvas);
      download(blob, name + '.png');
      toast('Saved ' + name + '.png — ' + canvas.width + ' × ' + canvas.height + ' px, ' + kb(blob.size) + ' · LaTeX source embedded');
    } else if (S.fmt === 'webp'){
      const canvas = await rasterize();
      const blob = await canvasBlob(canvas, 'image/webp', 0.92);
      download(blob, name + '.webp');
      toast('Saved ' + name + '.webp — ' + canvas.width + ' × ' + canvas.height + ' px, ' + kb(blob.size));
    } else if (S.fmt === 'jpg'){
      const noAlpha = S.bgMode === 'transparent';
      const canvas = await rasterize({ forceWhite: noAlpha });
      const blob = await canvasBlob(canvas, 'image/jpeg', 0.92);
      download(blob, name + '.jpg');
      if (noAlpha) toast('JPEG has no alpha channel — filled the background white', 'info');
      toast('Saved ' + name + '.jpg — ' + canvas.width + ' × ' + canvas.height + ' px, ' + kb(blob.size));
    } else if (S.fmt === 'pdf'){
      await exportPDF(name);
    }
    stamp();
  } catch (e){
    toast('Export failed — ' + errText(e), 'err');
  } finally {
    setBusy(false);
  }
}

let pdfLibs = null;
function ensurePDFLibs(){
  if (!pdfLibs){
    pdfLibs = (async () => {
      await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2/dist/jspdf.umd.min.js');
      try { await loadScript('https://cdn.jsdelivr.net/npm/svg2pdf.js@2/dist/svg2pdf.umd.min.js'); } catch (e) {}
    })();
  }
  return pdfLibs;
}
async function exportPDF(name){
  await ensurePDFLibs();
  if (!window.jspdf || !window.jspdf.jsPDF) throw new Error('jsPDF could not be loaded (offline?)');
  const { jsPDF } = window.jspdf;
  const b = buildSVG({ scale: S.scale });
  if (!b) throw new Error('Nothing to render yet');
  const mk = () => new jsPDF({
    orientation: b.w >= b.h ? 'landscape' : 'portrait',
    unit: 'px', format: [b.w, b.h], hotfixes: ['px_scaling']
  });
  let doc = null, mode = 'vector';
  try {
    doc = mk();
    sink.appendChild(b.el);
    if (typeof doc.svg !== 'function') throw new Error('svg2pdf unavailable');
    await doc.svg(b.el, { x: 0, y: 0, width: b.w, height: b.h });
  } catch (e){
    mode = 'raster';
    doc = mk();
    const canvas = await rasterize();
    doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, b.w, b.h);
  } finally {
    b.el.remove();
  }
  doc.save(name + '.pdf');
  toast('Saved ' + name + '.pdf — ' + (mode === 'vector' ? 'true vector' : 'raster fallback') + ', ' + b.w + ' × ' + b.h);
}

async function copyPNG(){
  if (!currentSVG){ toast('Nothing to copy yet', 'err'); return; }
  try {
    const canvas = await rasterize();
    const blob = await pngBlobWithSource(canvas);
    if (navigator.clipboard && typeof ClipboardItem !== 'undefined'){
      /* two flavors: image/png for image apps, text/html for Word / Docs / Outlook */
      let html = null;
      try {
        const dataUrl = await blobToDataURL(blob);
        html = new Blob(['<img src="' + dataUrl + '" alt="LaTeX equation">'], { type: 'text/html' });
      } catch (e) {}
      try {
        await navigator.clipboard.write([new ClipboardItem(
          html ? { 'image/png': blob, 'text/html': html } : { 'image/png': blob }
        )]);
        toast(html ? 'Copied — paste straight into Word, Docs or any image app'
                   : 'PNG copied to clipboard');
        return;
      } catch (e){
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          toast('PNG copied to clipboard'); return;
        } catch (e2) {
          try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': Promise.resolve(blob) })]);
            toast('PNG copied to clipboard'); return;
          } catch (e3) {}
        }
      }
    }
    download(blob, sanitizeName(fnameEl.value) + '.png');
    toast('Clipboard unavailable here — downloaded the PNG instead', 'info');
  } catch (e){
    toast('Copy failed — ' + errText(e), 'err');
  }
}
async function copySVG(){
  if (!currentSVG){ toast('Nothing to copy yet', 'err'); return; }
  const b = buildSVG();
  try {
    await navigator.clipboard.writeText(serialize(b.el));
    toast('SVG markup copied to clipboard');
  } catch (e){
    toast('Clipboard write blocked — ' + errText(e), 'err');
  }
}
async function copyTeX(){
  try {
    await navigator.clipboard.writeText(texEl.value);
    toast('LaTeX source copied to clipboard');
  } catch (e){
    toast('Clipboard write blocked — ' + errText(e), 'err');
  }
}
function saveTeX(){
  if (!texEl.value.trim()){ toast('Nothing to save yet', 'err'); return; }
  const name = sanitizeName(fnameEl.value);
  download(new Blob([texEl.value], { type: 'text/x-tex' }), name + '.tex');
  toast('Saved ' + name + '.tex');
}
async function copyDataURI(){
  if (!currentSVG){ toast('Nothing to copy yet', 'err'); return; }
  try {
    const canvas = await rasterize();
    const blob = await pngBlobWithSource(canvas);
    const uri = await blobToDataURL(blob);
    await navigator.clipboard.writeText(uri);
    toast('Data URI copied — ' + kb(uri.length) + ', source embedded');
  } catch (e){
    toast('Copy failed — ' + errText(e), 'err');
  }
}
async function copyShareLink(){
  const tex = texEl.value.trim();
  if (!tex){ toast('Nothing to share yet', 'err'); return; }
  const url = location.href.split('#')[0] + '#tex=' + encodeURIComponent(tex);
  try {
    await navigator.clipboard.writeText(url);
    toast('Share link copied — the equation travels inside the URL');
  } catch (e){
    toast('Could not copy the link — ' + errText(e), 'err');
  }
}

/* ---------------- small-formula previews ---------------- */
const pvCache = new Map();
async function texPreviewSVG(tex, targetH){
  const key = tex + '\u0001' + (isDark() ? 'd' : 'l');
  if (pvCache.has(key)) return pvCache.get(key);
  let markup = '<span class="pvErr">—</span>';
  if (mjReady){
    try {
      const node = await MathJax.tex2svgPromise(preprocess(tex), { display: true });
      const svg = (node && node.tagName && node.tagName.toLowerCase() === 'svg') ? node : node.querySelector('svg');
      if (svg){
        const r = measureNode(svg, 20);
        const tall = /\\begin\{\s*([a-zA-Z]*matrix|cases|align|gather|split|array)/.test(tex);
        let H = tall ? 46 : (targetH || 26);
        let W = Math.max(4, r.width * (H / Math.max(1, r.height)));
        const maxW = 330;
        if (W > maxW){ H = H * maxW / W; W = maxW; }
        const out = standaloneSVG(svg, W, H, { ink: pvInk() });
        markup = serialize(out.el);
      }
    } catch (e) {}
  }
  pvCache.set(key, markup);
  return markup;
}
const pvQueue = [];
let pvRunning = false;
function queuePreview(el, tex){
  pvQueue.push({ el, tex });
  if (!pvRunning) runPvQueue();
}
async function runPvQueue(){
  pvRunning = true;
  await waitMJ();
  let n = 0;
  while (pvQueue.length){
    const job = pvQueue.shift();
    if (!job.el.isConnected) continue;
    const m = await texPreviewSVG(job.tex);
    if (job.el.isConnected) job.el.innerHTML = m;
    if (++n % 6 === 0) await new Promise(r => requestAnimationFrame(r));
  }
  pvRunning = false;
}

/* ---------------- template library ---------------- */
const TEMPLATES = [
  { cat:'basics', name:"Euler's identity", tex:'e^{i\\pi} + 1 = 0' },
  { cat:'basics', name:'Quadratic formula', tex:'x = \\frac{-b \\pm \\sqrt{b^{2} - 4ac}}{2a}' },
  { cat:'basics', name:'Binomial theorem', tex:'(x + y)^{n} = \\sum_{k=0}^{n} \\binom{n}{k} x^{n-k} y^{k}' },
  { cat:'basics', name:'Golden ratio', tex:'\\varphi = \\frac{1 + \\sqrt{5}}{2} \\approx 1.618' },
  { cat:'basics', name:'Pythagorean theorem', tex:'a^{2} + b^{2} = c^{2}' },
  { cat:'calculus', name:'Gaussian integral', tex:'\\int_{-\\infty}^{\\infty} e^{-x^{2}}\\,dx = \\sqrt{\\pi}' },
  { cat:'calculus', name:'Derivative definition', tex:"f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}" },
  { cat:'calculus', name:'Fundamental theorem', tex:"\\int_{a}^{b} f'(x)\\,dx = f(b) - f(a)" },
  { cat:'calculus', name:'Taylor series', tex:'e^{x} = \\sum_{n=0}^{\\infty} \\frac{x^{n}}{n!}' },
  { cat:'calculus', name:'Integration by parts', tex:'\\int u\\,dv = uv - \\int v\\,du' },
  { cat:'calculus', name:'Fourier transform', tex:'\\hat{f}(\\xi) = \\int_{-\\infty}^{\\infty} f(x)\\, e^{-2\\pi i x \\xi}\\,dx' },
  { cat:'calculus', name:'Laplace transform', tex:'F(s) = \\int_{0}^{\\infty} f(t)\\, e^{-st}\\,dt' },
  { cat:'linear', name:'Matrix', tex:'\\mathbf{A} = \\begin{pmatrix} a_{11} & a_{12} \\\\ a_{21} & a_{22} \\end{pmatrix}' },
  { cat:'linear', name:'Matrix product', tex:'c_{ij} = \\sum_{k=1}^{n} a_{ik} b_{kj}' },
  { cat:'linear', name:'Determinant', tex:'\\det A = \\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc' },
  { cat:'linear', name:'Eigenvalue equation', tex:'\\mathbf{A}\\mathbf{v} = \\lambda\\mathbf{v}' },
  { cat:'linear', name:'Cross product', tex:'\\mathbf{a} \\times \\mathbf{b} = \\begin{vmatrix} \\mathbf{i} & \\mathbf{j} & \\mathbf{k} \\\\ a_1 & a_2 & a_3 \\\\ b_1 & b_2 & b_3 \\end{vmatrix}' },
  { cat:'linear', name:'Cauchy–Schwarz', tex:'|\\mathbf{u} \\cdot \\mathbf{v}| \\leq \\|\\mathbf{u}\\|\\,\\|\\mathbf{v}\\|' },
  { cat:'linear', name:'Matrix equation', tex:'\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} e \\\\ f \\end{pmatrix}' },
  { cat:'probability', name:"Bayes' theorem", tex:'P(A \\mid B) = \\frac{P(B \\mid A)\\, P(A)}{P(B)}' },
  { cat:'probability', name:'Normal distribution', tex:'f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}}\\, e^{-\\frac{(x - \\mu)^{2}}{2\\sigma^{2}}}' },
  { cat:'probability', name:'Expectation', tex:'\\mathbb{E}[X] = \\sum_{i} x_{i}\\, p_{i}' },
  { cat:'probability', name:'Variance', tex:'\\operatorname{Var}(X) = \\mathbb{E}\\!\\left[(X - \\mu)^{2}\\right]' },
  { cat:'probability', name:'Entropy', tex:'H(X) = -\\sum_{i} p_{i} \\log_{2} p_{i}' },
  { cat:'probability', name:'KL divergence', tex:'D_{\\mathrm{KL}}(P \\,\\|\\, Q) = \\sum_{i} P(i) \\log \\frac{P(i)}{Q(i)}' },
  { cat:'physics', name:'Mass–energy', tex:'E = mc^{2}' },
  { cat:'physics', name:'Schrödinger equation', tex:'i\\hbar \\frac{\\partial}{\\partial t} \\Psi(\\mathbf{r},t) = \\hat{H} \\Psi(\\mathbf{r},t)' },
  { cat:'physics', name:"Maxwell (Gauss' law)", tex:'\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_{0}}' },
  { cat:'physics', name:"Newton's second law", tex:'\\mathbf{F} = m\\,\\mathbf{a}' },
  { cat:'physics', name:'Universal gravitation', tex:'F = G\\, \\frac{m_{1} m_{2}}{r^{2}}' },
  { cat:'physics', name:'Lorentz factor', tex:'\\gamma = \\frac{1}{\\sqrt{1 - v^{2}/c^{2}}}' },
  { cat:'physics', name:'Heisenberg uncertainty', tex:'\\Delta x\\, \\Delta p \\geq \\frac{\\hbar}{2}' },
  { cat:'chemistry', name:'Water synthesis', tex:'\\ce{2H2 + O2 -> 2H2O}' },
  { cat:'chemistry', name:'Ammonia equilibrium', tex:'\\ce{N2 + 3H2 <=> 2NH3}' },
  { cat:'chemistry', name:'Photosynthesis', tex:'\\ce{6CO2 + 6H2O -> C6H12O6 + 6O2}' },
  { cat:'environments', name:'Linear system (aligned)', tex:'\\begin{aligned}\n  2x + 3y &= 7 \\\\\n  x - 4y &= -2\n\\end{aligned}' },
  { cat:'environments', name:'Sign function (cases)', tex:'\\operatorname{sgn}(x) =\n\\begin{cases}\n  +1, & x > 0 \\\\\n  0, & x = 0 \\\\\n  -1, & x < 0\n\\end{cases}' },
  { cat:'environments', name:'Numbered equation', tex:'\\begin{equation}\n  S = k_{B} \\ln W  \\tag{B.41}\n\\end{equation}' },
  { cat:'environments', name:'Step derivation (aligned)', tex:'\\begin{aligned}\n  (a + b)^{2} &= (a + b)(a + b) \\\\\n  &= a^{2} + 2ab + b^{2}\n\\end{aligned}' },
  { cat:'environments', name:'Value table (array)', tex:"\\begin{array}{c|cc}\n  x & f(x) & f'(x) \\\\ \\hline\n  0 & 1 & 0 \\\\\n  1 & 2 & 2\n\\end{array}" },
  { cat:'environments', name:'Aligned pair (align)', tex:'\\begin{align}\n  E &= mc^{2} \\\\\n  F &= ma\n\\end{align}' }
];
const CAT_LABELS = {
  all:'All', basics:'Basics', calculus:'Calculus', linear:'Linear algebra',
  probability:'Probability', physics:'Physics', chemistry:'Chemistry', environments:'Environments'
};

let tplCat = 'all', tplQ = '', drawerOpen = false;

function buildDrawer(){
  const cats = ['all', ...new Set(TEMPLATES.map(t => t.cat))];
  cats.forEach(c => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ptab' + (c === 'all' ? ' on' : '');
    b.textContent = CAT_LABELS[c] || c;
    b.dataset.cat = c;
    b.onclick = () => {
      tplCat = c;
      [...tplCatsEl.children].forEach(x => x.classList.toggle('on', x.dataset.cat === c));
      renderTplList();
    };
    tplCatsEl.appendChild(b);
  });
  renderTplList();
}
function renderTplList(){
  const q = tplQ.trim().toLowerCase();
  tplList.innerHTML = '';
  let shown = 0;
  TEMPLATES.forEach((t, i) => {
    if (tplCat !== 'all' && t.cat !== tplCat) return;
    if (q && !(t.name.toLowerCase().includes(q) || t.tex.toLowerCase().includes(q))) return;
    shown++;
    const tall = /\\begin\{\s*([a-zA-Z]*matrix|cases|align|gather|split|array)/.test(t.tex);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tCard' + (tall ? ' tall' : '');
    b.dataset.i = i;
    b.innerHTML = '<div class="tPrev"></div>' +
      '<div class="tMeta"><span class="tName">' + esc(t.name) + '</span><span class="tCat">' + esc(CAT_LABELS[t.cat] || t.cat) + '</span></div>' +
      '<div class="tTex">' + esc(t.tex.replace(/\s+/g, ' ').slice(0, 84)) + '</div>';
    b.onclick = () => {
      texEl.value = t.tex;
      savedCaret = null;
      autoGrow();
      closeDrawer();
      render();
      toast('Loaded template — ' + t.name);
    };
    tplList.appendChild(b);
  });
  if (!shown) tplList.innerHTML = '<div class="hEmpty" style="padding:18px 6px">No templates match.</div>';
  if (drawerOpen) fillPreviews();
}
function fillPreviews(){
  [...tplList.querySelectorAll('.tCard')].forEach(c => {
    const prev = c.querySelector('.tPrev');
    if (prev.dataset.done) return;
    prev.dataset.done = '1';
    queuePreview(prev, TEMPLATES[+c.dataset.i].tex);
  });
}
function openDrawer(){
  closeAbout(); closeModal();
  drawerOpen = true;
  drawer.classList.add('open');
  fillPreviews();
}
function closeDrawer(){ drawerOpen = false; drawer.classList.remove('open'); }

/* ---------------- LaTeX reference ---------------- */
const REFERENCE = [
['Fractions & roots', ['\\frac{a}{b}','\\dfrac{a}{b}','\\tfrac{a}{b}','\\binom{n}{k}','\\sqrt{x}','\\sqrt[3]{x}','\\overline{z}','\\underline{x}']],
['Sums, products & integrals', ['\\sum_{i=1}^{n} a_{i}','\\prod_{i=1}^{n} i','\\int_{a}^{b} f(x)\\,dx','\\iint_{D} f\\,dA','\\oint_{C} \\mathbf{F} \\cdot d\\mathbf{r}','\\lim_{x \\to 0} \\frac{f(x)}{x}','\\sup_{x \\in S} f(x)','\\bigcup_{i} A_{i}','\\bigcap_{i} A_{i}']],
['Binary operators', ['\\pm','\\mp','\\times','\\div','\\cdot','\\ast','\\star','\\circ','\\bullet','\\oplus','\\ominus','\\otimes','\\odot','\\setminus']],
['Relations & logic', ['\\neq','\\leq','\\geq','\\ll','\\gg','\\approx','\\equiv','\\sim','\\simeq','\\cong','\\propto','\\in','\\notin','\\subset','\\subseteq','\\supseteq','\\cup','\\cap','\\perp','\\parallel','\\mid','\\forall','\\exists','\\neg','\\land','\\lor']],
['Arrows', ['\\to','\\leftarrow','\\leftrightarrow','\\Rightarrow','\\Leftarrow','\\Leftrightarrow','\\longrightarrow','\\Longrightarrow','\\mapsto','\\hookrightarrow','\\rightharpoonup','\\rightleftharpoons','\\nearrow','\\searrow','\\uparrow','\\downarrow']],
['Accents & decorations', ['\\hat{x}','\\bar{x}','\\tilde{x}','\\vec{x}','\\dot{x}','\\ddot{x}','\\check{x}','\\breve{x}','\\widehat{xyz}','\\widetilde{xyz}','\\overbrace{a}^{b}','\\underbrace{a}_{b}','\\overrightarrow{AB}','\\overline{AB}']],
['Delimiters', ['\\left( \\frac{a}{b} \\right)','\\left[ x \\right]','\\left\\{ 1, 2 \\right\\}','\\left| x \\right|','\\left\\| v \\right\\|','\\left\\langle a \\right\\rangle','\\lfloor x \\rfloor','\\lceil x \\rceil','\\{ \\}','\\langle \\rangle']],
['Text, fonts & color', ['\\text{if } x > 0','\\mathrm{d}x','\\mathbf{v}','\\boldsymbol{\\alpha}','\\mathbb{R}^{n}','\\mathcal{L}[f]','\\mathfrak{g}','\\mathsf{s}','\\mathtt{m}','\\boxed{x = 1}','\\color{#C2440C}{x}']],
['Spacing', ['\\,','\\;','\\quad','\\qquad','\\!','\\ ']],
['Stacks & structures', ['\\overset{\\text{def}}{=}','\\underset{a}{b}','\\stackrel{?}{=}','\\substack{a \\\\ b}']],
['Greek — lowercase', ['\\alpha','\\beta','\\gamma','\\delta','\\epsilon','\\varepsilon','\\zeta','\\eta','\\theta','\\vartheta','\\iota','\\kappa','\\lambda','\\mu','\\nu','\\xi','\\pi','\\rho','\\sigma','\\varsigma','\\tau','\\upsilon','\\phi','\\varphi','\\chi','\\psi','\\omega']],
['Greek — uppercase', ['\\Gamma','\\Delta','\\Theta','\\Lambda','\\Xi','\\Pi','\\Sigma','\\Upsilon','\\Phi','\\Psi','\\Omega']],
['Environments', ['\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}','\\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}','\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}','\\begin{cases} a, & x > 0 \\\\ b, & x \\le 0 \\end{cases}','\\begin{aligned} a &= b \\\\ c &= d \\end{aligned}','\\begin{array}{c|c} a & b \\\\ c & d \\end{array}']]
];

let refQ = '', refBuilt = false, modalOpen = false, aboutOpen = false;

function buildReference(){
  refBuilt = true;
  REFERENCE.forEach(([group, items]) => {
    const h = document.createElement('div');
    h.className = 'refGroup';
    h.textContent = group;
    refBody.appendChild(h);
    items.forEach(tex => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'refRow';
      row.dataset.tex = tex;
      row.dataset.q = (group + ' ' + tex).toLowerCase();
      row.innerHTML = '<span class="refMath"></span><span class="refCode">' + esc(tex) + '</span>';
      row.addEventListener('mousedown', e => e.preventDefault());
      row.onclick = () => { insertSnippet(tex); closeModal(); };
      refBody.appendChild(row);
    });
  });
}
function filterReference(){
  const q = refQ.trim().toLowerCase();
  const kids = [...refBody.children];
  let g = null;
  const counts = new Map();
  kids.forEach(k => {
    if (k.classList.contains('refGroup')){
      g = k; counts.set(g, 0);
    } else {
      const show = !q || k.dataset.q.includes(q);
      k.classList.toggle('hide', !show);
      if (show && g) counts.set(g, counts.get(g) + 1);
    }
  });
  counts.forEach((n, gEl) => gEl.classList.toggle('hide', n === 0));
}
function queueRefPreviews(){
  refBody.querySelectorAll('.refRow:not(.hide)').forEach(row => {
    const m = row.querySelector('.refMath');
    if (!m.dataset.done){
      m.dataset.done = '1';
      queuePreview(m, row.dataset.tex);
    }
  });
}
function openModal(){
  if (!refBuilt) buildReference();
  closeAbout(); closeDrawer();
  modalOpen = true;
  modal.hidden = false;
  filterReference();
  queueRefPreviews();
}
function closeModal(){ modalOpen = false; modal.hidden = true; }
function openAbout(){
  closeDrawer(); closeModal(); closeHlPop();
  aboutOpen = true;
  aboutModal.hidden = false;
}
function closeAbout(){ aboutOpen = false; aboutModal.hidden = true; }

/* ---------------- environment browser ---------------- */
const ENVS = [
  { name:'equation',  tag:'display',  desc:'single numbered-style equation — wrappers are auto-converted', tex:'\\begin{equation}\n  f(x) = x^{2}\n\\end{equation}' },
  { name:'equation*', tag:'display',  desc:'unnumbered equation — wrappers are auto-converted', tex:'\\begin{equation*}\n  f(x) = x^{2}\n\\end{equation*}' },
  { name:'align',     tag:'display',  desc:'multi-line alignment at the & markers', tex:'\\begin{align}\n  a &= b \\\\\n  c &= d\n\\end{align}' },
  { name:'align*',    tag:'display',  desc:'multi-line alignment without tags', tex:'\\begin{align*}\n  a &= b \\\\\n  c &= d\n\\end{align*}' },
  { name:'aligned',   tag:'nestable', desc:'alignment block — fits inside other math', tex:'\\begin{aligned}\n  a &= b \\\\\n  c &= d\n\\end{aligned}' },
  { name:'gather',    tag:'display',  desc:'centered lines, one per row', tex:'\\begin{gather}\n  a = b \\\\\n  c = d\n\\end{gather}' },
  { name:'gathered',  tag:'nestable', desc:'centered block — fits inside other math', tex:'\\begin{gathered}\n  a = b \\\\\n  c = d\n\\end{gathered}' },
  { name:'split',     tag:'display',  desc:'break one long equation across lines', tex:'\\begin{split}\n  a &= b \\\\\n    &= c\n\\end{split}' },
  { name:'cases',     tag:'nestable', desc:'piecewise definitions with a left brace', tex:'\\begin{cases}\n  a, & x > 0 \\\\\n  b, & x \\le 0\n\\end{cases}' },
  { name:'array',     tag:'nestable', desc:'table with column spec — c, l, r and | rules', tex:'\\begin{array}{cc|c}\n  a & b & c \\\\\n  d & e & f\n\\end{array}' }
];
const ENV_MATS = [
  { h:'<span class="mlbl">matrix</span>', t:'matrix', ins:'\\begin{matrix}\n  a & b \\\\\n  c & d\n\\end{matrix}' },
  { h:'<span class="mpair">( )</span>', t:'pmatrix', ins:'\\begin{pmatrix}\n  a & b \\\\\n  c & d\n\\end{pmatrix}' },
  { h:'<span class="mpair">[ ]</span>', t:'bmatrix', ins:'\\begin{bmatrix}\n  a & b \\\\\n  c & d\n\\end{bmatrix}' },
  { h:'<span class="mpair">{ }</span>', t:'Bmatrix', ins:'\\begin{Bmatrix}\n  a & b \\\\\n  c & d\n\\end{Bmatrix}' },
  { h:'<span class="mpair">| |</span>', t:'vmatrix', ins:'\\begin{vmatrix}\n  a & b \\\\\n  c & d\n\\end{vmatrix}' },
  { h:'<span class="mpair">‖ ‖</span>', t:'Vmatrix', ins:'\\begin{Vmatrix}\n  a & b \\\\\n  c & d\n\\end{Vmatrix}' },
  { h:'<span class="mlbl">small</span>', t:'smallmatrix', ins:'\\begin{smallmatrix} a & b \\\\ c & d \\end{smallmatrix}' }
];

let envPrevsDone = false;
function buildEnvs(){
  ENVS.forEach((ev, i) => {
    const tall = /\\begin\{\s*([a-zA-Z]*matrix|cases|align|gather|split|array)/.test(ev.tex);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'envCard' + (tall ? ' tall' : '');
    b.dataset.i = i;
    b.addEventListener('mousedown', e => e.preventDefault());
    b.innerHTML =
      '<span class="envLeft">' +
        '<span class="envNameRow"><span class="envName">\\begin{' + esc(ev.name) + '}</span>' +
        '<span class="envTag' + (ev.tag === 'nestable' ? ' nest' : '') + '">' + ev.tag + '</span></span>' +
        '<span class="envDesc">' + esc(ev.desc) + '</span>' +
      '</span>' +
      '<span class="envPrev"></span>';
    b.onclick = () => insertSnippet(ev.tex);
    envListEl.appendChild(b);
  });
  ENV_MATS.forEach(mt => {
    const c = document.createElement('button');
    c.type = 'button';
    c.className = 'chip';
    c.innerHTML = mt.h;
    c.title = 'inserts ' + mt.ins.replace(/\s+/g, ' ');
    c.addEventListener('mousedown', e => e.preventDefault());
    c.addEventListener('mouseenter', () => { $('envHint').innerHTML = 'inserts <b>' + esc(mt.t) + '</b>'; });
    c.addEventListener('mouseleave', () => { $('envHint').textContent = 'click any environment to insert a skeleton at the cursor — placeholders are yours to edit'; });
    c.addEventListener('click', () => insertSnippet(mt.ins));
    envMatEl.appendChild(c);
  });
}
function showEnvPreviews(){
  if (envPrevsDone) return;
  envPrevsDone = true;
  [...envListEl.querySelectorAll('.envCard')].forEach(c =>
    queuePreview(c.querySelector('.envPrev'), ENVS[+c.dataset.i].tex));
}

/* ---------------- symbol palette ---------------- */
const m = (arr) => arr.map(([g, ins]) => ({ g, ins }));

const TABS = [
  { name:'Greek', items: [
    ...m([['α','\\alpha'],['β','\\beta'],['γ','\\gamma'],['δ','\\delta'],['ε','\\epsilon'],['ϵ','\\varepsilon'],
      ['ζ','\\zeta'],['η','\\eta'],['θ','\\theta'],['ϑ','\\vartheta'],['ι','\\iota'],['κ','\\kappa'],
      ['λ','\\lambda'],['μ','\\mu'],['ν','\\nu'],['ξ','\\xi'],['π','\\pi'],['ρ','\\rho'],['σ','\\sigma'],
      ['ς','\\varsigma'],['τ','\\tau'],['υ','\\upsilon'],['φ','\\phi'],['ϕ','\\varphi'],['χ','\\chi'],
      ['ψ','\\psi'],['ω','\\omega'],['Γ','\\Gamma'],['Δ','\\Delta'],['Θ','\\Theta'],['Λ','\\Lambda'],
      ['Ξ','\\Xi'],['Π','\\Pi'],['Σ','\\Sigma'],['Φ','\\Phi'],['Ψ','\\Psi'],['Ω','\\Omega']])
  ]},
  { name:'Operators', items: [
    ...m([['±','\\pm'],['∓','\\mp'],['×','\\times'],['÷','\\div'],['⋅','\\cdot'],['∗','\\ast'],['⋆','\\star'],
      ['∘','\\circ'],['•','\\bullet'],['⊕','\\oplus'],['⊖','\\ominus'],['⊗','\\otimes'],['⊙','\\odot'],
      ['∑','\\sum'],['∏','\\prod'],['∫','\\int'],['∬','\\iint'],['∭','\\iiint'],['∮','\\oint'],
      ['∂','\\partial'],['∇','\\nabla'],['∞','\\infty'],['∅','\\emptyset'],['ℵ','\\aleph'],['ℏ','\\hbar'],
      ['ℓ','\\ell'],['¬','\\neg'],['∧','\\land'],['∨','\\lor']])
  ]},
  { name:'Relations', items: [
    ...m([['≠','\\neq'],['≤','\\leq'],['≥','\\geq'],['≪','\\ll'],['≫','\\gg'],['≈','\\approx'],['≡','\\equiv'],
      ['∼','\\sim'],['≃','\\simeq'],['≅','\\cong'],['∝','\\propto'],['∈','\\in'],['∉','\\notin'],
      ['⊂','\\subset'],['⊆','\\subseteq'],['⊃','\\supset'],['⊇','\\supseteq'],['∣','\\mid'],['∤','\\nmid'],
      ['∥','\\parallel'],['⊥','\\perp'],['∀','\\forall'],['∃','\\exists'],['∄','\\nexists']])
  ]},
  { name:'Arrows', items: [
    ...m([['→','\\to'],['←','\\leftarrow'],['↔','\\leftrightarrow'],['⇒','\\Rightarrow'],['⇐','\\Leftarrow'],
      ['⇔','\\Leftrightarrow'],['⟶','\\longrightarrow'],['⟹','\\Longrightarrow'],['↦','\\mapsto'],
      ['⇀','\\rightharpoonup'],['↼','\\leftharpoonup'],['⇌','\\rightleftharpoons'],['↪','\\hookrightarrow'],
      ['↑','\\uparrow'],['↓','\\downarrow'],['↕','\\updownarrow'],['↗','\\nearrow'],['↘','\\searrow']])
  ]},
  { name:'Structures', items: [
    { h:'<span class="mfrac"><span>a</span><i></i><span>b</span></span>', t:'\\frac{}{}', ins:'\\frac{a}{b}', sel:[6,1] },
    { h:'<span class="mfrac"><span>d</span><i></i><span>dx</span></span>', t:'\\frac{d}{dx}', ins:'\\frac{\\mathrm{d}}{\\mathrm{d}x}' },
    { h:'<span class="mfrac"><span>∂</span><i></i><span>∂x</span></span>', t:'\\frac{\\partial}{\\partial x}', ins:'\\frac{\\partial}{\\partial x}' },
    { h:'<span class="msqrt">√<span class="mr">a</span></span>', t:'\\sqrt{}', ins:'\\sqrt{a}', sel:[6,1] },
    { h:'<span class="msqrt">∛<span class="mr">a</span></span>', t:'\\sqrt[n]{}', ins:'\\sqrt[3]{a}', sel:[9,1] },
    { h:'x<sup>n</sup>', t:'x^{}', ins:'x^{n}', sel:[3,1] },
    { h:'x<sub>i</sub>', t:'x_{}', ins:'x_{i}', sel:[3,1] },
    { h:'x<sub>i</sub><sup>n</sup>', t:'x_{}^{}', ins:'x_{i}^{n}', sel:[3,1] },
    { h:'<span class="mwrap">(<span class="mstack"><span>n</span><span>k</span></span>)</span>', t:'\\binom{}{}', ins:'\\binom{n}{k}', sel:[7,1] },
    { h:'<span class="mbig">∑<sub>i=1</sub><sup>n</sup></span>', t:'\\sum_{}^{}', ins:'\\sum_{i=1}^{n}', sel:[6,3] },
    { h:'<span class="mbig">∏<sub>i=1</sub><sup>n</sup></span>', t:'\\prod_{}^{}', ins:'\\prod_{i=1}^{n}', sel:[7,3] },
    { h:'<span class="mbig">∫<sub>a</sub><sup>b</sup></span>', t:'\\int_{}^{}', ins:'\\int_{a}^{b}', sel:[6,1] },
    { h:'<span class="mlim">lim<sub>x→0</sub></span>', t:'\\lim_{}', ins:'\\lim_{x \\to 0}', sel:[6,7] },
    { h:'<span class="mpair">( )</span>', t:'\\left( \\right)', ins:'\\left( a \\right)', sel:[7,1] },
    { h:'<span class="mpair">[ ]</span>', t:'\\left[ \\right]', ins:'\\left[ a \\right]', sel:[7,1] },
    { h:'<span class="mpair">| |</span>', t:'\\left| \\right|', ins:'\\left| a \\right|', sel:[7,1] },
    { h:'<span class="mpair">‖ ‖</span>', t:'\\left\\| \\right\\|', ins:'\\left\\| v \\right\\|', sel:[8,1] },
    { h:'<span class="mpair">⟨ ⟩</span>', t:'\\left\\langle \\right\\rangle', ins:'\\left\\langle a \\right\\rangle', sel:[13,1] },
    { h:'<span class="mpair">⌊ ⌋</span>', t:'\\lfloor \\rfloor', ins:'\\lfloor x \\rfloor', sel:[8,1] },
    { h:'<span class="mpair">⌈ ⌉</span>', t:'\\lceil \\rceil', ins:'\\lceil x \\rceil', sel:[7,1] },
    { h:'<span class="mstack3"><span>a</span><span>b</span></span>', t:'\\overset{}{}', ins:'\\overset{a}{b}', sel:[9,1] },
    { h:'<span class="mlbl">u-brace</span>', t:'\\underbrace{}_{}', ins:'\\underbrace{a}_{b}', sel:[12,1] },
    { h:'<span class="mlbl">o-brace</span>', t:'\\overbrace{}^{}', ins:'\\overbrace{a}^{b}', sel:[11,1] },
    { h:'<span class="mlbl">o-line</span>', t:'\\overline{}', ins:'\\overline{a}', sel:[10,1] },
    { h:'<span class="mlbl">u-line</span>', t:'\\underline{}', ins:'\\underline{a}', sel:[11,1] },
    { h:'<span class="mboxed">a</span>', t:'\\boxed{}', ins:'\\boxed{a}', sel:[7,1] },
    { h:'<span class="mtext">abc</span>', t:'\\text{}', ins:'\\text{...}', sel:[6,3] }
  ]},
  { name:'Styles', items: [
    { g:'ℝ', t:'\\mathbb{R}', ins:'\\mathbb{R}', sel:[8,1] },
    { g:'ℤ', t:'\\mathbb{Z}', ins:'\\mathbb{Z}', sel:[8,1] },
    { g:'ℕ', t:'\\mathbb{N}', ins:'\\mathbb{N}', sel:[8,1] },
    { g:'ℂ', t:'\\mathbb{C}', ins:'\\mathbb{C}', sel:[8,1] },
    { g:'ℚ', t:'\\mathbb{Q}', ins:'\\mathbb{Q}', sel:[8,1] },
    { g:'ℒ', t:'\\mathcal{L}', ins:'\\mathcal{L}', sel:[9,1] },
    { g:'ℛ', t:'\\mathcal{R}', ins:'\\mathcal{R}', sel:[9,1] },
    { g:'ℱ', t:'\\mathcal{F}', ins:'\\mathcal{F}', sel:[9,1] },
    { g:'ℰ', t:'\\mathcal{E}', ins:'\\mathcal{E}', sel:[9,1] },
    { g:'ℌ', t:'\\mathfrak{H}', ins:'\\mathfrak{H}', sel:[10,1] },
    { g:'ℜ', t:'\\mathfrak{R}', ins:'\\mathfrak{R}', sel:[10,1] },
    { g:'ℑ', t:'\\mathfrak{I}', ins:'\\mathfrak{I}', sel:[10,1] },
    { h:'<span class="up">d</span>', t:'\\mathrm{}', ins:'\\mathrm{d}', sel:[8,1] },
    { h:'<span class="bfit">v</span>', t:'\\boldsymbol{}', ins:'\\boldsymbol{v}', sel:[12,1] },
    { h:'<span class="bf">X</span>', t:'\\mathbf{}', ins:'\\mathbf{X}', sel:[8,1] },
    { h:'<span class="sf">A</span>', t:'\\mathsf{}', ins:'\\mathsf{A}', sel:[8,1] },
    { h:'<span class="tt">t</span>', t:'\\mathtt{}', ins:'\\mathtt{t}', sel:[8,1] },
    { g:'x̂', t:'\\hat{}', ins:'\\hat{x}', sel:[5,1] },
    { g:'x̄', t:'\\bar{}', ins:'\\bar{x}', sel:[5,1] },
    { g:'x̃', t:'\\tilde{}', ins:'\\tilde{x}', sel:[5,1] },
    { g:'x̌', t:'\\check{}', ins:'\\check{x}', sel:[5,1] },
    { g:'x̆', t:'\\breve{}', ins:'\\breve{x}', sel:[5,1] },
    { g:'x̀', t:'\\grave{}', ins:'\\grave{x}', sel:[5,1] },
    { g:'x́', t:'\\acute{}', ins:'\\acute{x}', sel:[5,1] },
    { g:'ẋ', t:'\\dot{}', ins:'\\dot{x}', sel:[5,1] },
    { g:'ẍ', t:'\\ddot{}', ins:'\\ddot{x}', sel:[5,1] },
    { g:'x⃗', t:'\\vec{}', ins:'\\vec{x}', sel:[5,1] },
    { h:'<span class="mlbl">w-hat</span>', t:'\\widehat{}', ins:'\\widehat{xyz}', sel:[9,3] },
    { h:'<span class="mlbl">w-tilde</span>', t:'\\widetilde{}', ins:'\\widetilde{xyz}', sel:[11,3] }
  ]}
];

let curTab = 0;
function buildTabs(){
  TABS.forEach((t, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ptab' + (i === 0 ? ' on' : '');
    b.textContent = t.name;
    b.onclick = () => {
      curTab = i;
      [...ptabsEl.children].forEach((c, j) => c.classList.toggle('on', j === i));
      buildGrid();
    };
    ptabsEl.appendChild(b);
  });
}
function buildGrid(){
  pgridEl.innerHTML = '';
  TABS[curTab].items.forEach(it => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.innerHTML = it.h || esc(it.g || '');
    b.title = it.t || it.ins;
    b.addEventListener('mousedown', e => e.preventDefault());
    b.addEventListener('mouseenter', () => { palHint.innerHTML = 'inserts <b>' + esc(it.ins) + '</b>'; });
    b.addEventListener('mouseleave', () => { palHint.textContent = 'hover a symbol to preview · click to insert'; });
    b.addEventListener('click', () => insertSnippet(it.ins, it.sel));
    pgridEl.appendChild(b);
  });
}

/* ---------------- LaTeX autocomplete ----------------
   Command corpus compiled from the palette, reference and environments. */
const CMDS = (() => {
  const map = new Map();
  const add = (name, ins, g, sel) => {
    if (!map.has(name) || (ins.includes('{') && !map.get(name).ins.includes('{')))
      map.set(name, { name, ins, g: g || null, sel: sel || null });
  };
  TABS.forEach(t => t.items.forEach(it => {
    if (it.ins){
      const mm = it.ins.match(/^\\([a-zA-Z]+)/);
      if (mm) add(mm[1], it.ins, it.g, it.sel);
    }
  }));
  REFERENCE.forEach(([group, items]) => items.forEach(tex => {
    const mm = tex.match(/^\\([a-zA-Z]+)/);
    if (mm) add(mm[1], tex, null, null);
  }));
  ENVS.forEach(ev => add(ev.name, ev.tex, null, null));
  ENV_MATS.forEach(mt => add(mt.t, mt.ins, null, null));
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
})();

let acItems = [], acIdx = 0, acOpen = false;

function acUpdate(){
  const ta = texEl;
  const before = ta.value.slice(0, ta.selectionStart);
  const mm = before.match(/\\([a-zA-Z]{1,18})$/);
  /* no command in progress, or the backslash is itself escaped (\\ row break) */
  if (!mm || (before.length > mm[0].length && before[before.length - mm[0].length - 1] === '\\'))
    return acHide();
  const q = mm[1];
  /* don't suggest a command that is already fully typed (unless it adds braces) */
  const hits = CMDS.filter(c => c.name.startsWith(q) && !(c.name === q && c.ins === '\\' + q))
    .sort((a, b) => a.name.length - b.name.length || a.name.localeCompare(b.name))
    .slice(0, 7);
  if (!hits.length) return acHide();
  acItems = hits; acIdx = 0; acOpen = true;
  acBox.hidden = false;
  acBox.innerHTML = '';
  hits.forEach((c, i) => {
    const r = document.createElement('button');
    r.type = 'button';
    r.className = 'acRow' + (i === 0 ? ' on' : '');
    r.innerHTML = '<span class="acCmd">\\' + esc(c.name) + '</span><span class="acGl">' + (c.g ? esc(c.g) : '') + '</span>';
    r.addEventListener('mousedown', e => e.preventDefault());  /* keep the editor caret */
    r.onclick = () => acComplete(c);
    acBox.appendChild(r);
  });
  const foot = document.createElement('div');
  foot.className = 'acFoot';
  foot.textContent = 'tab — complete · ↑↓ — browse · esc — dismiss';
  acBox.appendChild(foot);
}
function acHide(){ acOpen = false; acBox.hidden = true; acItems = []; }
function acMove(d){
  if (!acOpen) return;
  acIdx = (acIdx + d + acItems.length) % acItems.length;
  [...acBox.querySelectorAll('.acRow')].forEach((r, i) => r.classList.toggle('on', i === acIdx));
}
function acComplete(item){
  item = item || acItems[acIdx];
  if (!item) return acHide();
  const ta = texEl;
  const before = ta.value.slice(0, ta.selectionStart);
  const mm = before.match(/\\[a-zA-Z]*$/);
  if (!mm) return acHide();
  const start = ta.selectionStart - mm[0].length;
  insertRaw(item.ins, start, ta.selectionStart, !item.ins.includes('\n'));
  ta.focus();
  if (item.sel) ta.setSelectionRange(start + item.sel[0], start + item.sel[0] + item.sel[1]);
  else ta.setSelectionRange(start + item.ins.length, start + item.ins.length);
  acHide();
  afterEdit();
}

/* ---------------- editor insert / wrap machinery ---------------- */
function insertRaw(text, start, end, allowEC = true){
  const ta = texEl;
  let ok = false;
  if (allowEC && document.execCommand){
    if (start !== end) ta.setSelectionRange(start, end);
    try { ok = document.execCommand('insertText', false, text); } catch (e) {}
  }
  if (!ok){
    ta.value = ta.value.slice(0, start) + text + ta.value.slice(end);
  }
  return ok;
}
function afterEdit(){ autoGrow(); scheduleRender(); persist(); acUpdate(); }

function insertSnippet(ins, sel){
  const ta = texEl;
  const r = caretRange();
  const s = r.s, e = r.e;
  insertRaw(ins, s, e, document.activeElement === ta && !ins.includes('\n'));
  ta.focus();
  const base = s;
  if (sel) ta.setSelectionRange(base + sel[0], base + sel[0] + sel[1]);
  else ta.setSelectionRange(base + ins.length, base + ins.length);
  afterEdit();
}
function wrapSel(pre, post){
  const ta = texEl;
  const r = caretRange();
  const s = r.s, e = r.e;
  const inner = ta.value.slice(s, e);
  insertRaw(pre + inner + post, s, e, document.activeElement === ta && !inner.includes('\n'));
  ta.focus();
  if (inner) ta.setSelectionRange(s + pre.length, s + pre.length + inner.length);
  else ta.setSelectionRange(s + pre.length, s + pre.length);
  afterEdit();
}
function fracAction(){
  const ta = texEl;
  const r = caretRange();
  const s = r.s, e = r.e;
  if (s !== e){
    const inner = ta.value.slice(s, e);
    insertRaw('\\frac{' + inner + '}{}', s, e, document.activeElement === ta && !inner.includes('\n'));
    ta.focus();
    const p = s + 6 + inner.length + 2;
    ta.setSelectionRange(p, p);
    afterEdit();
  } else insertSnippet('\\frac{a}{b}', [6, 1]);
}

/* selection color — its own palette, independent of the equation ink */
let hlPopOpen = false;
function toggleHlPop(){ hlPopOpen ? closeHlPop() : openHlPop(); }
function openHlPop(){ hlPopOpen = true; hlPop.hidden = false; paintHl(); }
function closeHlPop(){ hlPopOpen = false; hlPop.hidden = true; }

function paintHl(){
  const v = S.hl;
  let matched = false;
  [...hlSw.querySelectorAll('.sw')].forEach(b => {
    const on = b.dataset.c === v;
    b.classList.toggle('on', on);
    if (on) matched = true;
  });
  const cw = hlSw.querySelector('.swCustom');
  cw.classList.toggle('on', !matched);
  cw.style.setProperty('--c', matched ? panelColor() : v);
  if (!matched && /^#[0-9a-fA-F]{6}$/.test(v)) hlCustom.value = v;
  let lum = 1;
  if (!matched && /^#[0-9a-fA-F]{6}$/.test(v)){
    const c = v.slice(1);
    lum = 0.2126*parseInt(c.substr(0,2),16)/255 + 0.7152*parseInt(c.substr(2,2),16)/255 + 0.0722*parseInt(c.substr(4,2),16)/255;
  }
  cw.style.color = lum > 0.55 ? 'rgba(30,26,18,.55)' : 'rgba(255,255,255,.8)';
}
function colorApply(hex){
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
  S.hl = hex;
  document.documentElement.style.setProperty('--hl', hex);
  paintHl();
  persist();
  const ta = texEl;
  const r = caretRange();
  const s = r.s, e = r.e;
  const inner = ta.value.slice(s, e);
  const pre = '\\color{' + hex + '}{';
  insertRaw(pre + inner + '}', s, e, document.activeElement === ta && !inner.includes('\n'));
  ta.focus();
  const off = s + pre.length;
  if (inner) ta.setSelectionRange(off, off + inner.length);
  else ta.setSelectionRange(off, off);
  closeHlPop();
  afterEdit();
}

/* keydown: autocomplete → shortcuts → auto-pairs → smart keys */
const PAIRS = { '(':')', '[':']', '{':'}', '$':'$' };
const CLOSERS = { ')':1, ']':1, '}':1, '$':1 };
texEl.addEventListener('keydown', e => {
  const ta = texEl;
  const s = ta.selectionStart, en = ta.selectionEnd;

  /* autocomplete navigation */
  if (acOpen){
    if (e.key === 'ArrowDown'){ e.preventDefault(); acMove(1); return; }
    if (e.key === 'ArrowUp'){ e.preventDefault(); acMove(-1); return; }
    if (e.key === 'Tab'){ e.preventDefault(); acComplete(); return; }
    if (e.key === 'Escape'){ e.preventDefault(); e.stopPropagation(); acHide(); return; }
    if (e.key === 'Enter'){ acHide(); }  /* fall through: Enter stays a newline */
  }

  /* ⌘D / Ctrl+D — duplicate the current line (selection travels with it) */
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd'){
    e.preventDefault();
    const ls = ta.value.lastIndexOf('\n', s - 1) + 1;
    let le = ta.value.indexOf('\n', en); if (le === -1) le = ta.value.length;
    const line = ta.value.slice(ls, le);
    insertRaw('\n' + line, le, le, false);
    const np = le + 1 + (s - ls);
    ta.setSelectionRange(np, np + (en - s));
    afterEdit();
    return;
  }

  /* ⌘/ / Ctrl+/ — comment-toggle the current line */
  if ((e.metaKey || e.ctrlKey) && e.key === '/'){
    e.preventDefault();
    const ls = ta.value.lastIndexOf('\n', s - 1) + 1;
    let le = ta.value.indexOf('\n', en); if (le === -1) le = ta.value.length;
    const line = ta.value.slice(ls, le);
    const nl = /^\s*%/.test(line) ? line.replace(/^(\s*)%\s?/, '$1') : '%' + line;
    const delta = nl.length - line.length;
    insertRaw(nl, ls, le, false);
    ta.setSelectionRange(Math.max(ls, en + delta), Math.max(ls, en + delta));
    afterEdit();
    return;
  }

  if (PAIRS[e.key]){
    e.preventDefault();
    const close = PAIRS[e.key];
    if (s !== en){
      const inner = ta.value.slice(s, en);
      insertRaw(e.key + inner + close, s, en);
      ta.setSelectionRange(s + 1, s + 1 + inner.length);
    } else {
      insertRaw(e.key + close, s, en);
      ta.setSelectionRange(s + 1, s + 1);
    }
    afterEdit();
    return;
  }
  if (CLOSERS[e.key] && s === en && ta.value[s] === e.key){
    e.preventDefault();
    ta.setSelectionRange(s + 1, s + 1);
    return;
  }
  if (e.key === 'Backspace' && s === en && s > 0){
    const before = ta.value[s - 1], after = ta.value[s];
    if (PAIRS[before] && PAIRS[before] === after){
      e.preventDefault();
      insertRaw('', s - 1, s + 1, false);
      ta.setSelectionRange(s - 1, s - 1);
      afterEdit();
      return;
    }
  }
  if (e.key === 'Enter'){
    const ls = ta.value.lastIndexOf('\n', s - 1) + 1;
    let le = ta.value.indexOf('\n', en); if (le === -1) le = ta.value.length;
    const before = ta.value.slice(ls, s);
    const after = ta.value.slice(s, le);
    const open = before.match(/\\begin\{([^}]*)\}\s*$/);
    const close = after.match(/^\s*\\end\{([^}]*)\}/);
    const indent = (before.match(/^[ \t]*/) || [''])[0];
    if (open && close && open[1] === close[1]){
      e.preventDefault();
      insertRaw('\n' + indent + '  \n' + indent, s, en, false);
      ta.setSelectionRange(s + 1 + indent.length + 2, s + 1 + indent.length + 2);
      afterEdit();
      return;
    }
    if (indent){
      e.preventDefault();
      insertRaw('\n' + indent, s, en, false);
      ta.setSelectionRange(s + 1 + indent.length, s + 1 + indent.length);
      afterEdit();
      return;
    }
  }
  if (e.key === 'Tab'){
    e.preventDefault();
    insertRaw('  ', s, en);
    ta.setSelectionRange(s + 2, s + 2);
    afterEdit();
  }
});

/* ---------------- .tex file open / drag & drop ---------------- */
function readFile(f){
  if (!f) return;
  /* Theorem PNGs carry their LaTeX source — open them back up */
  const isPng = (f.type === 'image/png') || /\.png$/i.test(f.name);
  if (isPng){
    if (f.size > 25000000){ toast('Image too large', 'err'); return; }
    const rd = new FileReader();
    rd.onload = () => {
      const tex = extractTexFromPng(rd.result);
      if (tex){
        texEl.value = tex.slice(0, 50000);
        savedCaret = null;
        autoGrow(); render();
        toast('Recovered LaTeX source from ' + f.name);
      } else {
        toast('No embedded LaTeX in this PNG — only Theorem exports carry it', 'err');
      }
    };
    rd.onerror = () => toast('Could not read that image', 'err');
    rd.readAsArrayBuffer(f);
    return;
  }
  if (f.size > 1000000){ toast('File too large for the editor', 'err'); return; }
  const rd = new FileReader();
  rd.onload = () => {
    texEl.value = String(rd.result).slice(0, 50000);
    savedCaret = null;
    autoGrow(); render();
    toast('Loaded ' + f.name);
  };
  rd.onerror = () => toast('Could not read that file', 'err');
  rd.readAsText(f);
}

/* ---------------- UI bindings ---------------- */
function autoGrow(){
  texEl.style.height = 'auto';
  texEl.style.height = Math.min(340, Math.max(116, texEl.scrollHeight)) + 'px';
  charCount.textContent = texEl.value.length ? texEl.value.length + ' ch' : '';
}
function paintRange(inp){
  const p = (inp.value - inp.min) / (inp.max - inp.min) * 100;
  inp.style.setProperty('--p', p + '%');
}
const sliderSyncs = [];
function bindSlider(inp, out, key, fmt, after){
  const upd = () => {
    S[key] = +inp.value;
    out.textContent = fmt(S[key]);
    paintRange(inp);
    if (after) after();
    persist();
  };
  inp.addEventListener('input', upd);
  sliderSyncs.push(() => { inp.value = S[key]; out.textContent = fmt(S[key]); paintRange(inp); if (after) after(); });
}
const segPaints = [];
function bindSeg(el, key, after){
  const btns = [...el.querySelectorAll('.segBtn')];
  const paint = () => btns.forEach(b => b.classList.toggle('on', b.dataset.v === S[key]));
  btns.forEach(b => b.addEventListener('click', () => {
    if (S[key] === b.dataset.v) return;
    S[key] = b.dataset.v;
    paint();
    if (after) after();
    persist();
  }));
  segPaints.push(paint);
}
const swPaints = [];
function bindSwatches(rowId, key, customId, after){
  const row = $(rowId), custom = $(customId), btns = [...row.querySelectorAll('.sw')];
  const paint = () => {
    const v = S[key];
    let matched = false;
    btns.forEach(b => {
      const on = b.dataset.c === v;
      b.classList.toggle('on', on);
      if (on) matched = true;
    });
    const cw = row.querySelector('.swCustom');
    cw.classList.toggle('on', !matched);
    cw.style.setProperty('--c', matched ? panelColor() : v);
    if (!matched && /^#[0-9a-fA-F]{6}$/.test(v)) custom.value = v;
    let lum = 1;
    if (!matched && /^#[0-9a-fA-F]{6}$/.test(v)){
      const c = v.slice(1);
      lum = 0.2126*parseInt(c.substr(0,2),16)/255 + 0.7152*parseInt(c.substr(2,2),16)/255 + 0.0722*parseInt(c.substr(4,2),16)/255;
    }
    cw.style.color = lum > 0.55 ? 'rgba(30,26,18,.55)' : 'rgba(255,255,255,.8)';
  };
  btns.forEach(b => b.addEventListener('click', () => { S[key] = b.dataset.c; paint(); if (after) after(); persist(); }));
  custom.addEventListener('input', () => { S[key] = custom.value; paint(); if (after) after(); persist(); });
  swPaints.push(paint);
}
function applyStyles(){
  const r = document.documentElement.style;
  r.setProperty('--eq-size', S.size + 'px');
  r.setProperty('--pad', S.pad + 'px');
  r.setProperty('--radius', S.radius + 'px');
  r.setProperty('--eq-ink', S.ink);
  r.setProperty('--eq-bg', S.bgColor);
  r.setProperty('--hl', S.hl || '#C2440C');
  frame.classList.toggle('trans', S.bgMode === 'transparent');
  frame.classList.toggle('bg', S.bgMode === 'color');
  bgSwRow.classList.toggle('hide', S.bgMode !== 'color');
  const dimmed = S.bgMode !== 'color';
  radR.disabled = dimmed;
  radRow.classList.toggle('dim', dimmed);
  viewport.className = 'bg-' + S.backdrop;
}
function updateExportUI(){
  exportLbl.textContent = 'Export ' + S.fmt.toUpperCase();
  let n = '';
  if (S.fmt === 'png') n = 'Lossless, alpha preserved · LaTeX source embedded in the file.';
  else if (S.fmt === 'webp') n = 'WebP — far smaller files, transparency preserved.';
  else if (S.fmt === 'svg') n = 'Vector — crisp at any size, opens in Illustrator, Inkscape, Figma.';
  else if (S.fmt === 'jpg') n = S.bgMode === 'transparent'
        ? 'JPEG has no alpha — the background will be filled white.'
        : 'JPEG — flattened onto your background color.';
  else n = 'True vector PDF via svg2pdf, raster fallback if unavailable.';
  fmtNote.textContent = n;
  updateDims();
}
function syncSettings(){
  sliderSyncs.forEach(fn => fn());
  segPaints.forEach(fn => fn());
  swPaints.forEach(fn => fn());
  paintHl();
  applyStyles();
  updateExportUI();
  relayout();
}

const FRAME_PRESETS = {
  bare:  { bgMode:'transparent', bgColor:'#FFFFFF', pad:12,  radius:0 },
  card:  { bgMode:'color', bgColor:'#FFFFFF', pad:36, radius:18 },
  print: { bgMode:'color', bgColor:'#FFFFFF', pad:24, radius:0 },
  dark:  { bgMode:'color', bgColor:'#1A1917', pad:36, radius:18, ink:'#FFFFFF' }
};

function bindAll(){
  texEl.addEventListener('input', () => { autoGrow(); scheduleRender(); acUpdate(); });
  texEl.addEventListener('click', acUpdate);
  texEl.addEventListener('blur', () => setTimeout(acHide, 150));
  $('clearBtn').onclick = () => { texEl.value = ''; savedCaret = null; autoGrow(); render(); texEl.focus(); };

  /* theme toggle */
  $('themeBtn').addEventListener('mousedown', e => e.preventDefault());
  $('themeBtn').onclick = () => setTheme(!isDark());

  /* .tex open + drag & drop */
  $('openBtn').onclick = () => $('texFile').click();
  $('texFile').addEventListener('change', e => {
    readFile(e.target.files && e.target.files[0]);
    e.target.value = '';
  });
  texEl.addEventListener('dragover', e => { e.preventDefault(); texEl.classList.add('drop'); });
  texEl.addEventListener('dragleave', () => texEl.classList.remove('drop'));
  texEl.addEventListener('drop', e => {
    e.preventDefault();
    texEl.classList.remove('drop');
    readFile(e.dataTransfer.files && e.dataTransfer.files[0]);
  });

  /* editor toolbar */
  $('edBar').addEventListener('click', e => {
    const b = e.target.closest('.edBtn');
    if (!b) return;
    const a = b.dataset.a;
    if (a === 'hl'){ toggleHlPop(); return; }
    const map = {
      bold:  () => wrapSel('\\boldsymbol{', '}'),
      text:  () => wrapSel('\\text{', '}'),
      sup:   () => wrapSel('^{', '}'),
      sub:   () => wrapSel('_{', '}'),
      sqrt:  () => wrapSel('\\sqrt{', '}'),
      abs:   () => wrapSel('\\left|', '\\right|'),
      paren: () => wrapSel('\\left(', '\\right)'),
      frac:  fracAction
    };
    if (map[a]) map[a]();
  });
  [...$('edBar').querySelectorAll('.edBtn')].forEach(b =>
    b.addEventListener('mousedown', e => e.preventDefault()));

  /* selection-color popover */
  hlSw.querySelectorAll('.sw:not(.swCustom)').forEach(b => {
    b.addEventListener('mousedown', e => e.preventDefault());
    b.onclick = () => colorApply(b.dataset.c);
  });
  hlCustom.addEventListener('input', () => colorApply(hlCustom.value));
  document.addEventListener('click', e => {
    if (hlPopOpen && !e.target.closest('.popWrap')) closeHlPop();
    if (acOpen && !e.target.closest('.taWrap')) acHide();
  });

  /* insert view switch: symbols ↔ environments */
  const insBtns = [...document.querySelectorAll('#insSeg .segBtn')];
  insBtns.forEach(b => b.addEventListener('click', () => {
    insBtns.forEach(x => x.classList.toggle('on', x === b));
    const v = b.dataset.v;
    $('symView').hidden = v !== 'sym';
    $('envView').hidden = v !== 'env';
    if (v === 'env') showEnvPreviews();
  }));

  /* header buttons */
  const keepFocus = btn => btn.addEventListener('mousedown', e => e.preventDefault());
  keepFocus($('tplBtn')); keepFocus($('refBtn')); keepFocus($('aboutBtn'));
  $('tplBtn').onclick = () => drawerOpen ? closeDrawer() : openDrawer();
  $('refBtn').onclick = () => modalOpen ? closeModal() : openModal();
  $('aboutBtn').onclick = () => aboutOpen ? closeAbout() : openAbout();
  $('drawerClose').onclick = closeDrawer;
  $('modalClose').onclick = closeModal;
  $('aboutClose').onclick = closeAbout;
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  aboutModal.addEventListener('click', e => { if (e.target === aboutModal) closeAbout(); });
  tplSearch.addEventListener('input', () => { tplQ = tplSearch.value; renderTplList(); });
  refSearch.addEventListener('input', () => { refQ = refSearch.value; filterReference(); queueRefPreviews(); });

  /* frame presets */
  document.querySelectorAll('.exChip[data-p]').forEach(b => b.onclick = () => {
    const p = FRAME_PRESETS[b.dataset.p];
    Object.assign(S, p);
    syncSettings();
    persist();
    toast(b.dataset.p === 'dark'
      ? 'Dark preset — ink switched to white for contrast'
      : 'Frame preset applied — ' + b.textContent.toLowerCase());
  });

  bindSeg($('modeSeg'), 'display', render);
  bindSeg($('varSeg'), 'variant', render);
  bindSeg($('fmtSeg'), 'fmt', updateExportUI);
  bindSeg($('bgSeg'), 'bgMode', () => { applyStyles(); updateExportUI(); });
  bindSeg($('backSeg'), 'backdrop', applyStyles);

  bindSlider($('sizeR'), $('sizeV'), 'size', v => v + ' px', () => { applyStyles(); relayout(); });
  bindSlider($('padR'), $('padV'), 'pad', v => v + ' px', () => { applyStyles(); relayout(); });
  bindSlider($('scaleR'), $('scaleV'), 'scale', v => '×' + (v % 1 ? v.toFixed(1) : v), updateDims);
  bindSlider(radR, $('radV'), 'radius', v => v + ' px', () => { applyStyles(); });

  bindSwatches('inkSw', 'ink', 'inkCustom', () => { applyStyles(); });
  bindSwatches('bgSw', 'bgColor', 'bgCustom', () => { applyStyles(); });

  fnameEl.addEventListener('input', persist);

  exportBtn.onclick = doExport;
  $('copyPng').onclick = copyPNG;
  $('copySvg').onclick = copySVG;
  $('copyTex').onclick = copyTeX;
  $('saveTex').onclick = saveTeX;
  $('copyUri').onclick = copyDataURI;
  $('copyLink').onclick = copyShareLink;

  fitChip.onclick = () => { fitMode = fitMode === 'fit' ? 'actual' : 'fit'; relayout(); };

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape'){
      if (hlPopOpen) closeHlPop();
      else if (aboutOpen) closeAbout();
      else if (modalOpen) closeModal();
      else if (drawerOpen) closeDrawer();
      return;
    }
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;
    const k = e.key.toLowerCase();
    if (k === 's'){ e.preventDefault(); doExport(); }
    else if (k === 'c' && e.shiftKey){ e.preventDefault(); copyPNG(); }
  });

  if (window.ResizeObserver) new ResizeObserver(() => relayout()).observe(viewport);
  window.addEventListener('resize', relayout);
}

/* ---------------- boot ---------------- */
function syncUI(){
  texEl.value = S.tex;
  fnameEl.value = S.fname;
  syncSettings();
}
function boot(){
  restore();
  /* a shared link (#tex=…) takes priority over the saved session */
  const hm = location.hash.match(/^#tex=(.+)$/);
  if (hm){ try { S.tex = decodeURIComponent(hm[1]).slice(0, 50000); } catch (e) {} }

  bindAll();
  syncUI();
  buildTabs();
  buildGrid();
  buildEnvs();
  buildDrawer();
  loadHist();
  if (hist.length) renderHistory(texEl.value.trim());
  autoGrow();
  paintThemeBtn();

  const mac = /mac/i.test(navigator.platform || navigator.userAgent || '');
  $('footHint').innerHTML = (mac ? '<kbd>⌘S</kbd> export · <kbd>⌘⇧C</kbd> copy image · <kbd>⌘D</kbd> duplicate line' : '<kbd>Ctrl S</kbd> export · <kbd>Ctrl ⇧ C</kbd> copy image · <kbd>Ctrl D</kbd> duplicate line')
    + ' · drop a .tex file to open it · built by <b>Soumyajit Das</b>';
  $('kbdExport').innerHTML = '<kbd>' + (mac ? '⌘S' : 'Ctrl S') + '</kbd> export';
  $('kbdCopy').innerHTML = '<kbd>' + (mac ? '⌘⇧C' : 'Ctrl ⇧ C') + '</kbd> copy PNG';
  $('kbdDup').innerHTML = '<kbd>' + (mac ? '⌘D' : 'Ctrl D') + '</kbd> duplicate line';
  $('kbdCmt').innerHTML = '<kbd>' + (mac ? '⌘/' : 'Ctrl /') + '</kbd> comment line';

  setStatus('loading MathJax…', 'busy');
  mjWatch();
  if (window.matchMedia && matchMedia('(pointer:fine)').matches) texEl.focus();
}
boot();
