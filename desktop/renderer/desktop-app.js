/* ============================================================
   Theorem — desktop companion · Windows 11 skin, custom menus
   Auto-injected by main.js after the page loads, so the
   renderer files stay EXACT copies of the web version.
   ============================================================ */
(function () {
  if (window.__theoremDesktop) return;
  window.__theoremDesktop = true;

  const N = window.theoremNative;
  const $id = id => document.getElementById(id);

  if (!N) {
    document.title = 'Theorem — desktop bridge missing (check preload.js)';
    return;
  }

  /* ═══════════ 1 · Windows 11 skin ═══════════ */
  const skin = document.createElement('style');
  skin.textContent = [
    '#grain{display:none}',
    'body{-webkit-font-smoothing:subpixel-antialiased}',
    ':root{',
    '  --sans:"Segoe UI Variable Text","Segoe UI",-apple-system,sans-serif;',
    '  --mono:"Cascadia Code","Cascadia Mono",Consolas,"IBM Plex Mono",monospace;',
    '  --disp:"Segoe UI Variable Display","Segoe UI",sans-serif;',
    '  --paper:#f3f3f3;--panel:#ffffff;--panel2:#f5f5f5;',
    '  --ink:#1b1b1b;--ink2:#5c5c5c;--mut:#8a8a8a;',
    '  --line:#e6e6e6;--line2:#d9d9d9;',
    '  --stage:#ededed;--field:#ffffff;--track:#d9d9d9;',
    '}',
    'html.dark{',
    '  --paper:#202020;--panel:#2b2b2b;--panel2:#333333;',
    '  --ink:#f2f2f2;--ink2:#c6c6c6;--mut:#9b9b9b;',
    '  --line:#3a3a3a;--line2:#4a4a4a;',
    '  --stage:#262626;--field:#1e1e1e;--track:#4a4a4a;',
    '}',
    'body{user-select:none;-webkit-user-select:none}',
    '#tex,.errBox,.tTex,.refCode,.builtBy,.aboutBody p,.aboutBody li{user-select:text;-webkit-user-select:text}',

    /* title row — draggable custom title bar (overlay buttons sit top-right) */
    'header{flex:0 0 40px;display:flex;align-items:center;background:var(--paper);',
    '  border-bottom:1px solid var(--line);padding:0 170px 0 12px;',
    '  -webkit-app-region:drag}',
    'header .brand{display:flex;align-items:center;gap:8px;margin-right:2px}',
'.cmdLogo{width:20px;height:20px;display:block;flex:0 0 auto}',
    'header .mark,header .markDot,header .brandTag{display:none}',
    'header .status{display:none}',
    '.cmdBrand{font:600 13px/1 var(--sans);color:var(--ink);margin-right:10px}',
    '.menuStrip{display:flex;align-items:center;gap:1px;margin-right:auto}',
    '.menuTitle{height:26px;padding:0 11px;display:flex;align-items:center;border:0;background:transparent;',
    '  border-radius:4px;font:500 12px var(--sans);color:var(--ink2);cursor:default;',
    '  -webkit-app-region:no-drag}',
    '.menuTitle:hover,.menuTitle.open{background:var(--panel2);color:var(--ink)}',

    /* dropdown menus */
    '.menuPop{position:fixed;z-index:400;min-width:236px;max-width:340px;background:var(--panel);',
    '  border:1px solid var(--line2);border-radius:8px;box-shadow:0 12px 34px rgba(0,0,0,.18);',
    '  padding:5px;display:none;flex-direction:column}',
    'html.dark .menuPop{box-shadow:0 12px 34px rgba(0,0,0,.55)}',
    '.menuPop.open{display:flex}',
    '.mi{display:flex;align-items:center;justify-content:space-between;gap:30px;min-height:30px;',
    '  padding:4px 10px;border-radius:5px;font:400 12.5px var(--sans);color:var(--ink);cursor:default}',
    '.mi:hover{background:var(--panel2)}',
    '.mi.dis{color:var(--mut);pointer-events:none}',
    '.mi .lbl{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.mi .acc{font:400 11px var(--mono);color:var(--mut);white-space:nowrap}',
    '.mi .sub{font:600 13px var(--sans);color:var(--mut);line-height:1}',
    '.msep{height:1px;background:var(--line);margin:5px 9px}',

    /* toolbar row */
    '.winToolbar{flex:0 0 44px;display:flex;align-items:center;gap:2px;padding:0 10px;',
    '  background:var(--paper);border-bottom:1px solid var(--line)}',
    '.cmdGroup{display:flex;align-items:center;gap:1px;margin-right:auto}',
    '.cmdBtn{height:30px;min-width:32px;padding:0 9px;display:inline-flex;align-items:center;gap:6px;',
    '  border:0;background:transparent;border-radius:4px;font:500 11.5px var(--sans);',
    '  color:var(--ink2);cursor:pointer}',
    '.cmdBtn:hover{background:var(--panel2);color:var(--ink)}',
    '.cmdBtn:active{background:var(--line)}',
    '.cmdBtn.on{background:rgba(194,68,12,.15);color:var(--verm)}',
    '.cmdBtn svg{width:15px;height:15px;display:block}',
    '.cmdSep{width:1px;height:18px;background:var(--line);margin:0 5px}',
    '.tbRight{display:flex;align-items:center;gap:1px;margin-left:auto}',
    '.hBtn{border-color:transparent;background:transparent;border-radius:4px;padding:5px 7px}',
    '.hBtn:hover{background:var(--panel2);border-color:transparent}',

    /* controls */
    '.edBtn{border-radius:4px;background:var(--panel)}',
    '.edBtn:active{background:var(--panel2)}',
    '.seg{border-radius:4px}.segBtn{border-radius:3px}',
    '.chip,.exChip,.sw,.toolbar,.btnPrimary{border-radius:4px}',
    '.btnPrimary{font-family:var(--sans)}',
    '.btnPrimary:hover:not(:disabled){background:#a83a08;border-color:#a83a08}',
    'html.dark .btnPrimary:hover:not(:disabled){background:#d75a20;border-color:#d75a20}',
    '#tex,.txt,.search{border-radius:4px}',
    '#tex:focus,.txt:focus{box-shadow:0 0 0 2px rgba(194,68,12,.4);border-color:var(--verm)}',
    '#tex:focus-visible,.txt:focus-visible{outline:none}',

    /* section labels */
    '.micro{font:600 11px var(--sans);letter-spacing:.02em;color:var(--ink2);text-transform:none}',
    '.micro em{margin-right:6px}',

    /* layout + stage */
    '#panel{width:460px;flex:0 0 460px}',
    '#stageCol{background:var(--stage)}',
    '#viewport.bg-paper{background:var(--stage)}',
    '#frame{box-shadow:0 2px 10px rgba(0,0,0,.16)}',
    'html.dark #frame{box-shadow:0 2px 10px rgba(0,0,0,.5)}',
    '#empty .glyph{color:#d9d9d9}',

    /* sliders */
    'input[type=range]::-webkit-slider-thumb{background:var(--verm);border:2px solid var(--panel)}',
    'input[type=range]:active::-webkit-slider-thumb{background:#a83a08}',
    'input[type=range]::-moz-range-thumb{background:var(--verm);border:2px solid var(--panel)}',

    /* scrollbars */
    '::-webkit-scrollbar{width:10px;height:10px}',
    '::-webkit-scrollbar-track{background:transparent}',
    '::-webkit-scrollbar-thumb{background:#c4c4c4;border-radius:5px;border:2px solid transparent;background-clip:content-box}',
    '::-webkit-scrollbar-thumb:hover{background:#9f9f9f;border-radius:5px;border:2px solid transparent;background-clip:content-box}',
    'html.dark ::-webkit-scrollbar-thumb{background:#4d4d4d;border-radius:5px;border:2px solid transparent;background-clip:content-box}',
    'html.dark ::-webkit-scrollbar-thumb:hover{background:#6a6a6a;border-radius:5px;border:2px solid transparent;background-clip:content-box}',

    /* status bar */
    '#sb{flex:0 0 28px;display:flex;align-items:center;gap:16px;padding:0 12px;',
    '  border-top:1px solid var(--line);background:var(--paper);font:400 11px var(--sans);color:var(--ink2)}',
    '.sbSeg{display:flex;align-items:center;gap:6px;white-space:nowrap}',
    '.sbGrow{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}',
    '#sbDot{width:7px;height:7px;border-radius:2px;background:var(--verm);display:inline-block}',

    /* drop-anywhere overlay */
    '#dropZone{position:fixed;inset:0;z-index:500;display:none;align-items:center;justify-content:center;',
    '  background:rgba(243,243,243,.92);font:600 15px var(--sans);color:var(--ink)}',
    'html.dark #dropZone{background:rgba(18,18,18,.92);color:var(--ink)}',
    '#dropZone.on{display:flex}',
    '#dropZone::before{content:"";position:absolute;inset:12px;border:2px dashed var(--verm);border-radius:6px}',

    /* modals */
    '.modalCard{border-radius:8px;box-shadow:0 24px 60px rgba(0,0,0,.28)}',
    '.drawer{box-shadow:-18px 0 44px rgba(0,0,0,.18)}',
    'kbd{font-family:var(--sans);border-radius:3px}',
    '.toast{border-radius:4px}'
  ].join('\n');
  document.head.appendChild(skin);

  /* ═══════════ 2 · icons ═══════════ */
  const ICO = {
    newFile: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2h5.2L12 5.8V14H3z"/><path d="M8 2.2v3.6h3.6"/></svg>',
    open:    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 3.2h4.3l1.5 1.8H14.5v7.5H1.5z"/></svg>',
    save:    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2.5h8.2l2.8 2.8v8.2h-11z"/><path d="M4.6 13.2V8.6h6.8v4.6"/><path d="M4.6 2.6v3h5"/></svg>',
    copy:    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5.6" y="5.6" width="7.2" height="7.2" rx="1.2"/><path d="M10.4 3.2H4.2a1 1 0 0 0-1 1v6.2"/></svg>',
    zin:     '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="7" cy="7" r="4.6"/><path d="M10.4 10.4 14 14M7 5v4M5 7h4"/></svg>',
    zout:    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="7" cy="7" r="4.6"/><path d="M10.4 10.4 14 14M5 7h4"/></svg>'
  };

  /* ═══════════ 3 · menu strip — built-in default model (never empty) ═══════════ */
  const DEFAULT_MODEL = [
    { label: 'File', items: [
      { label: 'New', accel: 'Ctrl+N', action: 'new' },
      { label: 'Open…', accel: 'Ctrl+O', action: 'open' },
      { label: 'Open Recent', items: [ { label: 'No recent files', disabled: true } ] },
      { sep: true },
      { label: 'Save', accel: 'Ctrl+S', action: 'save' },
      { label: 'Save As…', accel: 'Ctrl+Shift+S', action: 'save-as' },
      { sep: true },
      { label: 'Export Image…', accel: 'Ctrl+Shift+E', action: 'export' },
      { label: 'Export As', items: [
        { label: 'PNG', action: 'export-as', arg: 'png' },
        { label: 'WebP', action: 'export-as', arg: 'webp' },
        { label: 'JPG', action: 'export-as', arg: 'jpg' },
        { label: 'SVG', action: 'export-as', arg: 'svg' },
        { label: 'PDF', action: 'export-as', arg: 'pdf' }
      ]},
      { sep: true },
      { label: 'Exit', action: 'quit' }
    ]},
    { label: 'Edit', items: [
      { label: 'Undo', accel: 'Ctrl+Z', action: 'edit-undo' },
      { label: 'Redo', accel: 'Ctrl+Y', action: 'edit-redo' },
      { sep: true },
      { label: 'Cut', accel: 'Ctrl+X', action: 'edit-cut' },
      { label: 'Copy', accel: 'Ctrl+C', action: 'edit-copy' },
      { label: 'Paste', accel: 'Ctrl+V', action: 'edit-paste' },
      { label: 'Select All', accel: 'Ctrl+A', action: 'edit-selectall' },
      { sep: true },
      { label: 'Color Selection…', action: 'hl-open' },
      { sep: true },
      { label: 'Copy PNG to Clipboard', accel: 'Ctrl+Shift+C', action: 'copy-png' },
      { label: 'Copy SVG Markup', action: 'copy-svg' },
      { label: 'Copy LaTeX Source', action: 'copy-tex' },
      { sep: true },
      { label: 'Duplicate Line', accel: 'Ctrl+D', action: 'dup-line' },
      { label: 'Toggle Comment', accel: 'Ctrl+/', action: 'comment' },
      { sep: true },
      { label: 'Clear Editor', action: 'clear' }
    ]},
    { label: 'Insert', items: [
      { label: 'Fraction', action: 'insert', arg: 'frac' },
      { label: 'Square Root', action: 'insert', arg: 'sqrt' },
      { label: 'Superscript', action: 'insert', arg: 'sup' },
      { label: 'Subscript', action: 'insert', arg: 'sub' },
      { sep: true },
      { label: 'Matrix (2×2)', action: 'insert', arg: 'matrix' },
      { label: 'Cases (piecewise)', action: 'insert', arg: 'cases' },
      { label: 'Aligned Block', action: 'insert', arg: 'aligned' },
      { sep: true },
      { label: 'Environment', items: ['equation','equation*','align','align*','aligned',
        'gather','gathered','split','cases','array'].map(n => (
          { label: '\\begin{' + n + '}', action: 'insert-env', arg: n }
        )) }
    ]},
    { label: 'View', items: [
      { label: 'Reload', accel: 'Ctrl+R', action: 'reload' },
      { label: 'Developer Tools', accel: 'F12', action: 'devtools' },
      { sep: true },
      { label: 'Zoom In', accel: 'Ctrl+=', action: 'zoomin' },
      { label: 'Zoom Out', accel: 'Ctrl+-', action: 'zoomout' },
      { label: 'Reset Zoom', accel: 'Ctrl+0', action: 'zoomreset' },
      { sep: true },
      { label: 'Toggle Theme', accel: 'Ctrl+Alt+T', action: 'theme' },
      { label: 'Full Screen', accel: 'F11', action: 'fullscreen' }
    ]},
    { label: 'Tools', items: [
      { label: 'Frame Preset', items: [
        { label: 'Bare (transparent, tight)', action: 'preset', arg: 'bare' },
        { label: 'Card (white, rounded)', action: 'preset', arg: 'card' },
        { label: 'Print (white, flat)', action: 'preset', arg: 'print' },
        { label: 'Dark (ink background)', action: 'preset', arg: 'dark' }
      ]},
      { label: 'Stage Backdrop', items: [
        { label: 'Paper', action: 'backdrop', arg: 'paper' },
        { label: 'Light', action: 'backdrop', arg: 'light' },
        { label: 'Ink', action: 'backdrop', arg: 'ink' }
      ]}
    ]},
    { label: 'Help', items: [
      { label: 'Keyboard Shortcuts', accel: 'F1', action: 'help' },
      { sep: true },
      { label: 'About Theorem', action: 'about' },
      { label: 'GitHub Repository', action: 'github' }
    ]}
  ];

  let menuModel = DEFAULT_MODEL;

  /* dropdown engine */
  let openTitle = null;
  function closeSubs(pop){
    if (pop._sub){ closeSubs(pop._sub); pop._sub.remove(); pop._sub = null; }
  }
  function closeMenus(){
    document.querySelectorAll('.menuPop.open').forEach(p => { closeSubs(p); p.remove(); });
    document.querySelectorAll('.menuTitle.open').forEach(t => t.classList.remove('open'));
    openTitle = null;
  }
  function place(el, x, y, w, h){
    el.style.left = Math.max(6, Math.min(x, innerWidth - w - 6)) + 'px';
    el.style.top  = Math.max(6, Math.min(y, innerHeight - h - 6)) + 'px';
  }
  function buildPop(items){
    const pop = document.createElement('div');
    pop.className = 'menuPop';
    items.forEach(it => {
      if (it.sep){
        const s = document.createElement('div'); s.className = 'msep'; pop.appendChild(s); return;
      }
      const el = document.createElement('div');
      el.className = 'mi' + (it.disabled ? ' dis' : '');
      const lbl = document.createElement('span'); lbl.className = 'lbl'; lbl.textContent = it.label;
      el.appendChild(lbl);
      if (it.items){
        const ar = document.createElement('span'); ar.className = 'sub'; ar.textContent = '›';
        el.appendChild(ar);
        const showSub = () => {
          closeSubs(pop);
          const sub = buildPop(it.items);
          document.body.appendChild(sub);
          sub.classList.add('open');
          const r = el.getBoundingClientRect();
          let x = r.right + 3;
          if (x + sub.offsetWidth > innerWidth - 6) x = r.left - sub.offsetWidth - 3;
          place(sub, x, r.top - 5, sub.offsetWidth, sub.offsetHeight);
          pop._sub = sub;
        };
        el.addEventListener('mouseenter', showSub);
        el.addEventListener('click', showSub);
      } else {
        const acc = document.createElement('span'); acc.className = 'acc';
        acc.textContent = it.accel || '';
        el.appendChild(acc);
        el.addEventListener('mouseenter', () => closeSubs(pop));
        el.addEventListener('click', () => { closeMenus(); runAction(it.action, it.arg); });
      }
      pop.appendChild(el);
    });
    return pop;
  }
  function openMenu(titleEl, def){
    closeMenus();
    const pop = buildPop(def.items);
    document.body.appendChild(pop);
    pop.classList.add('open');
    const r = titleEl.getBoundingClientRect();
    place(pop, r.left, r.bottom + 4, pop.offsetWidth, pop.offsetHeight);
    titleEl.classList.add('open');
    openTitle = titleEl;
  }
  function buildMenuStrip(){
    const strip = $id('menuStrip');
    if (!strip) return;
    strip.innerHTML = '';
    menuModel.forEach(def => {
      const t = document.createElement('button');
      t.type = 'button';
      t.className = 'menuTitle';
      t.textContent = def.label;
      t.addEventListener('click', (e) => {
        e.stopPropagation();
        if (openTitle === t) closeMenus();
        else openMenu(t, def);
      });
      t.addEventListener('mouseenter', () => { if (openTitle && openTitle !== t) openMenu(t, def); });
      strip.appendChild(t);
    });
    closeMenus();
  }

  /* title row: brand + menu strip; existing header buttons move to the toolbar */
  const header = document.querySelector('header');
    const brand = header.querySelector('.brand');
  brand.innerHTML =
    '<svg class="cmdLogo" viewBox="0 0 32 32" aria-hidden="true">' +
      '<rect width="32" height="32" rx="7" fill="#C2440C"/>' +
      '<text x="16" y="23" font-family="Georgia,serif" font-size="19" ' +
        'font-style="italic" text-anchor="middle" fill="#F6F2E7">ƒ</text>' +
    '</svg>' +
    '<span class="cmdBrand">Theorem</span>';
  const hBtns = header.querySelector('.hBtns');       /* listeners preserved — node is moved, not rebuilt */
  const strip = document.createElement('nav');
  strip.id = 'menuStrip'; strip.className = 'menuStrip';
  header.insertBefore(strip, hBtns);
  buildMenuStrip();                                     /* renders immediately from the default model */

  /* toolbar row */
  const tb = document.createElement('div');
  tb.className = 'winToolbar';
  const group = document.createElement('div');
  group.className = 'cmdGroup';
  function cmdBtn(label, title, icon, onclick){
    const b = document.createElement('button');
    b.className = 'cmdBtn'; b.type = 'button'; b.title = title;
    b.innerHTML = icon + (label ? '<span>' + label + '</span>' : '');
    b.onclick = onclick;
    return b;
  }
  const sep = () => { const s = document.createElement('span'); s.className = 'cmdSep'; return s; };
  group.appendChild(cmdBtn('New',  'New equation (Ctrl+N)',   ICO.newFile, () => guardUnsaved(newFile)));
  group.appendChild(cmdBtn('Open', 'Open .tex file (Ctrl+O)', ICO.open,    () => N.windowAction('open')));
  group.appendChild(cmdBtn('Save', 'Save .tex file (Ctrl+S)', ICO.save,    () => saveFile(false)));
  group.appendChild(sep());
  ['png', 'webp', 'jpg', 'svg', 'pdf'].forEach(f => {
    const b = document.createElement('button');
    b.className = 'cmdBtn'; b.type = 'button'; b.dataset.fmt = f;
    b.textContent = f.toUpperCase();
    b.title = 'Export as ' + f.toUpperCase();
    b.onclick = () => { S.fmt = f; updateExportUI(); persist(); doExport(); };
    group.appendChild(b);
  });
  group.appendChild(sep());
  group.appendChild(cmdBtn('Copy image', 'Copy PNG to clipboard (Ctrl+Shift+C)', ICO.copy, copyPNG));
  tb.appendChild(group);

  const right = document.createElement('div');
  right.className = 'tbRight';
  if (hBtns) right.appendChild(hBtns);                  /* Templates / Reference / About / theme / GitHub */
  right.appendChild(sep());
  right.appendChild(cmdBtn('', 'Zoom out (Ctrl+-)', ICO.zout, () => N.windowAction('zoomout')));
  right.appendChild(cmdBtn('', 'Zoom in (Ctrl+=)',  ICO.zin,  () => N.windowAction('zoomin')));
  tb.appendChild(right);
  document.querySelector('main').parentNode.insertBefore(tb, document.querySelector('main'));

  /* highlight the active export format */
  const _updateExportUI = updateExportUI;
  updateExportUI = function(){
    _updateExportUI();
    document.querySelectorAll('.cmdBtn[data-fmt]').forEach(b =>
      b.classList.toggle('on', b.dataset.fmt === S.fmt));
  };

  /* click-outside / Esc close the menus */
  document.addEventListener('mousedown', (e) => {
    if (!e.target.closest('.menuPop') && !e.target.closest('.menuTitle')) closeMenus();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.querySelector('.menuPop.open')){
      closeMenus();
      e.stopPropagation();
    }
  }, true);

  /* live model (Recent Files etc.) — requested AFTER the listener exists,
     so there is no race; falls back to DEFAULT_MODEL if IPC hiccups */
  N.onModel((m) => { if (m && m.length){ menuModel = m; buildMenuStrip(); } });
  N.requestModel();

  /* ═══════════ 4 · status bar ═══════════ */
  const sb = document.createElement('div');
  sb.id = 'sb';
  sb.innerHTML =
    '<span class="sbSeg"><i id="sbDot" hidden></i><span id="sbName">untitled</span></span>' +
    '<span class="sbSeg sbGrow" id="sbStatus"></span>' +
    '<span class="sbSeg" id="sbDims"></span>' +
    '<span class="sbSeg" id="sbPos">Ln 1, Col 1</span>';
  $id('app').appendChild(sb);

  const _setStatus = setStatus;
  setStatus = function(txt, cls){
    _setStatus(txt, cls);
    $id('sbStatus').textContent = txt;
  };
  const _updateDims = updateDims;
  updateDims = function(){
    _updateDims();
    $id('sbDims').textContent = dimsChip.textContent;
  };
  function updatePos(){
    const p = texEl.selectionStart;
    const before = texEl.value.slice(0, p);
    const line = before.split('\n').length;
    const col = p - (before.lastIndexOf('\n') + 1) + 1;
    $id('sbPos').textContent = 'Ln ' + line + ', Col ' + col;
  }
  ['keyup', 'click', 'input', 'select'].forEach(ev => texEl.addEventListener(ev, updatePos));
  $id('sbStatus').textContent = stTxt.textContent;
  $id('sbDims').textContent = dimsChip.textContent;
  updatePos();

  /* ═══════════ 5 · file tracking + dirty state ═══════════ */
  let currentPath = null, currentName = null, dirtyFlag = false;
  function markFile(p){ currentPath = p; currentName = String(p).split(/[\\/]/).pop(); }
  function setTitle(){
    document.title = currentName
      ? 'Theorem — ' + currentName + (dirtyFlag ? '*' : '')
      : 'Theorem — LaTeX Equation Press';
  }
  function setDirty(b){
    dirtyFlag = !!b;
    $id('sbDot').hidden = !dirtyFlag;
    $id('sbName').textContent = currentName || 'untitled';
    N.setDirty(dirtyFlag);
    setTitle();
  }
  const _afterEdit = afterEdit;
  afterEdit = function(){ _afterEdit(); setDirty(true); };
  texEl.addEventListener('input', () => setDirty(true));

  function applyOpen(p){
    texEl.value = String(p.content || '').slice(0, 50000);
    markFile(p.path); savedCaret = null;
    autoGrow(); render(); updatePos();
    setDirty(false);
    toast('Loaded ' + p.name);
  }
  function newFile(){
    texEl.value = ''; savedCaret = null; currentPath = null; currentName = null;
    autoGrow(); render(); updatePos();
    setDirty(false);
  }
  async function saveFile(as){
    const content = texEl.value;
    if (currentPath && !as){
      const r = await N.writeTex(currentPath, content);
      if (r && r.ok){ setDirty(false); toast('Saved ' + currentName); }
      else toast('Save failed — ' + (r && r.error), 'err');
      return;
    }
    const suggested = currentName || sanitizeName(fnameEl.value) + '.tex';
    const r = await N.saveTexAs(suggested, content);
    if (!r || r.cancelled) return toast('Save cancelled', 'info');
    if (r.error) return toast('Save failed — ' + r.error, 'err');
    markFile(r.path); persist();
    setDirty(false);
    toast('Saved ' + currentName);
  }
  async function guardUnsaved(next){
    if (!dirtyFlag) return next();
    const r = await N.confirmUnsaved(currentName);
    if (r === 'cancel') return;
    if (r === 'discard'){ setDirty(false); return next(); }
    await saveFile(false);
    if (dirtyFlag) return;
    next();
  }

  /* ═══════════ 6 · SELECTION COLOR — hardened ═══════════
     The original flow depended on focus state and execCommand;
     here the selection is snapshotted when the popover opens and
     the wrap is spliced in deterministically, so it always lands
     exactly around what you had selected. */
  let hlSnap = null;
  toggleHlPop = function(){
    if (!hlPopOpen) hlSnap = caretRange();      /* snapshot on open */
    hlPopOpen ? closeHlPop() : openHlPop();
  };
  colorApply = function(hex){
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
    S.hl = hex;
    document.documentElement.style.setProperty('--hl', hex);
    paintHl();
    persist();
    const r = hlSnap || caretRange();
    const s = r.s, e = r.e;
    const ta = texEl;
    const inner = ta.value.slice(s, e);
    const pre = '\\color{' + hex + '}{';
    /* deterministic splice — no focus/execCommand dependency */
    ta.value = ta.value.slice(0, s) + pre + inner + '}' + ta.value.slice(e);
    hlSnap = null;
    ta.focus();
    const off = s + pre.length;
    if (inner) ta.setSelectionRange(off, off + inner.length);
    else ta.setSelectionRange(off, off);
    closeHlPop();
    afterEdit();
  };

  /* ═══════════ 7 · editor actions ═══════════ */
  function duplicateLine(){
    const ta = texEl, s = ta.selectionStart, en = ta.selectionEnd;
    const ls = ta.value.lastIndexOf('\n', s - 1) + 1;
    let le = ta.value.indexOf('\n', en); if (le === -1) le = ta.value.length;
    const line = ta.value.slice(ls, le);
    insertRaw('\n' + line, le, le, false);
    const np = le + 1 + (s - ls);
    ta.setSelectionRange(np, np + (en - s));
    afterEdit();
  }
  function toggleComment(){
    const ta = texEl, s = ta.selectionStart, en = ta.selectionEnd;
    const ls = ta.value.lastIndexOf('\n', s - 1) + 1;
    let le = ta.value.indexOf('\n', en); if (le === -1) le = ta.value.length;
    const line = ta.value.slice(ls, le);
    const nl = /^\s*%/.test(line) ? line.replace(/^(\s*)%\s?/, '$1') : '%' + line;
    const delta = nl.length - line.length;
    insertRaw(nl, ls, le, false);
    ta.setSelectionRange(Math.max(ls, en + delta), Math.max(ls, en + delta));
    afterEdit();
  }
  const INSERTS = {
    frac:    () => insertSnippet('\\frac{a}{b}', [6, 1]),
    sqrt:    () => insertSnippet('\\sqrt{a}', [6, 1]),
    sup:     () => wrapSel('^{', '}'),
    sub:     () => wrapSel('_{', '}'),
    matrix:  () => insertSnippet('\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}'),
    cases:   () => insertSnippet('\\begin{cases} a, & x > 0 \\\\ b, & x \\le 0 \\end{cases}'),
    aligned: () => insertSnippet('\\begin{aligned} a &= b \\\\ c &= d \\end{aligned}')
  };

  /* ═══════════ 8 · drop a .tex anywhere ═══════════ */
  const dz = document.createElement('div');
  dz.id = 'dropZone';
  dz.textContent = 'Drop your .tex file to open it';
  document.body.appendChild(dz);
  let dragDepth = 0;
  window.addEventListener('dragenter', (e) => {
    if (!e.dataTransfer || ![...e.dataTransfer.types].includes('Files')) return;
    dragDepth++;
    dz.classList.add('on');
  });
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('dragleave', () => {
    dragDepth = Math.max(0, dragDepth - 1);
    if (!dragDepth) dz.classList.remove('on');
  });
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    dragDepth = 0;
    dz.classList.remove('on');
    if (e.target.closest && e.target.closest('.taWrap')) return;
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) guardUnsaved(() => readFile(f));
  });



    /* ═══════════ 8b · drag the equation out of the window ═══════════
     A 2× source-embedded PNG is quietly pre-rendered after each edit;
     dragging the stage frame drops the image as a FILE into PowerPoint,
     Word, Explorer, chat apps — anywhere a file drop works. */
  let dragFile = null, dragTimer = null;
  async function prerenderDragPng(){
    if (!currentSVG || !dims.w) return;
    try {
      const canvas = await rasterize({ scale: 2 });
      const blob = await pngBlobWithSource(canvas);
      const r = await N.writeTempPng(await blob.arrayBuffer());
      if (r && r.ok) dragFile = r.path;
    } catch (e) { /* non-fatal — drag just isn't ready yet */ }
  }
  const _renderDrag = render;
  render = async function(){
    await _renderDrag();
    clearTimeout(dragTimer);
    if (currentSVG) dragTimer = setTimeout(prerenderDragPng, 500);
  };
  frame.draggable = true;
  frame.addEventListener('dragstart', (e) => {
    if (!dragFile){ e.preventDefault(); return; }
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('DownloadURL', 'image/png:Theorem-equation.png:' + dragFile);
  });
  const ds = document.createElement('style');
  ds.textContent = '#frame[draggable="true"]{cursor:grab}';
  document.head.appendChild(ds);
  if (currentSVG) prerenderDragPng();   /* ready immediately on launch */



  /* ═══════════ 9 · offline PDF libs + theme → window & title-bar color ═══════════ */
  ensurePDFLibs = function(){
    if (!pdfLibs){
      pdfLibs = (async () => {
        await loadScript('vendor/jspdf.umd.min.js');
        try { await loadScript('vendor/svg2pdf.umd.min.js'); } catch (e) {}
      })();
    }
    return pdfLibs;
  };
  const _setTheme = setTheme;
  setTheme = function(dark){
    _setTheme(dark);
    N.setWindowBG(dark ? '#202020' : '#f3f3f3');
  };
  N.setWindowBG(isDark() ? '#202020' : '#f3f3f3');

  /* ═══════════ 10 · desktop-correct hints ═══════════ */
  const mac = /mac/i.test(navigator.platform || navigator.userAgent || '');
  $id('kbdExport').innerHTML = '<kbd>' + (mac ? '⌘⇧E' : 'Ctrl ⇧ E') + '</kbd> export image';
  $id('footHint').innerHTML = '<kbd>' + (mac ? '⌘N' : 'Ctrl N') + '</kbd> new · <kbd>' + (mac ? '⌘O' : 'Ctrl O') + '</kbd> open · <kbd>' +
    (mac ? '⌘S' : 'Ctrl S') + '</kbd> save · <kbd>' + (mac ? '⌘⇧E' : 'Ctrl ⇧ E') + '</kbd> export';
  const urlBtn = $id('copyLink'); if (urlBtn) urlBtn.style.display = 'none';

  setDirty(false);
  updateExportUI();

  /* ═══════════ 11 · action dispatch (menus + native accelerators) ═══════════ */
  function runAction(action, arg){
    switch (action){
      case 'new':           guardUnsaved(newFile); break;
      case 'clear':         texEl.value = ''; autoGrow(); render(); setDirty(true); break;
      case 'save':          saveFile(false); break;
      case 'save-as':       saveFile(true); break;
      case 'export':        doExport(); break;
      case 'export-as':     S.fmt = arg; updateExportUI(); persist(); doExport(); break;
      case 'copy-png':      copyPNG(); break;
      case 'copy-svg':      copySVG(); break;
      case 'copy-tex':      copyTeX(); break;
      case 'dup-line':      duplicateLine(); break;
      case 'comment':       toggleComment(); break;
      case 'insert':        if (INSERTS[arg]) INSERTS[arg](); break;
      case 'insert-env': {
        const ev = ENVS.find(e => e.name === arg);
        if (ev) insertSnippet(ev.tex);
        break;
      }
      case 'hl-open':       toggleHlPop(); break;
      case 'theme':         setTheme(!isDark()); break;
      case 'preset':
        Object.assign(S, FRAME_PRESETS[arg] || {});
        syncSettings(); persist();
        toast('Frame preset — ' + arg);
        break;
      case 'backdrop':
        S.backdrop = arg; applyStyles(); persist();
        break;
      case 'edit-undo':     document.execCommand('undo'); break;
      case 'edit-redo':     document.execCommand('redo'); break;
      case 'edit-cut':      document.execCommand('cut'); break;
      case 'edit-copy':     document.execCommand('copy'); break;
      case 'edit-paste':    document.execCommand('paste'); break;
      case 'edit-selectall':document.execCommand('selectAll'); break;
      default:              N.windowAction(action, arg);
    }
  }

  N.onMenu((action, p) => {
    if (action === 'open-tex')            guardUnsaved(() => applyOpen(p));
    else if (action === 'confirm-close')  guardUnsaved(() => N.closeWindow());
    else if (action === 'confirm-reload') guardUnsaved(() => location.reload());
    else if (action === 'download'){
      if (p.state === 'completed') toast('Saved ' + p.name);
      else if (p.state === 'cancelled') toast('Save cancelled', 'info');
    }
    else runAction(action, p);
  });
})();