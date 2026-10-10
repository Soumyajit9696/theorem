/* ============================================================
   Theorem — Windows desktop edition (Electron main process)
   Repo: https://github.com/Soumyajit9696/theorem
   Built by Soumyajit Das
   ============================================================ */
'use strict';
const { app, BrowserWindow, Menu, dialog, session, shell, ipcMain, net } = require('electron');
const path = require('path');
const fs = require('fs');

app.disableHardwareAcceleration();

let autoUpdater = null;
try { ({ autoUpdater } = require('electron-updater')); } catch (e) {}

const DESK      = __dirname;
const RENDERER  = path.join(DESK, 'renderer');
const COMPANION = path.join(RENDERER, 'desktop-app.js');
const VENDOR    = path.join(RENDERER, 'vendor');
const MJAX_BASE = 'https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/';
const MJAX_MAIN = 'tex-svg.js';

const RECENT_PATH = () => path.join(app.getPath('userData'), 'recent-files.json');
const MAX_RECENT = 8;
const ENV_LIST = ['equation', 'equation*', 'align', 'align*', 'aligned',
                  'gather', 'gathered', 'split', 'cases', 'array'];

const SHORTCUTS = [
  'File',
  '   Ctrl+N          New equation',
  '   Ctrl+O          Open .tex file',
  '   Ctrl+S          Save .tex',
  '   Ctrl+Shift+S    Save As…',
  '   Ctrl+Shift+E    Export image (current format)',
  '',
  'Editor',
  '   Ctrl+Z / Ctrl+Y  Undo / Redo',
  '   Ctrl+D          Duplicate line',
  '   Ctrl+/          Comment / uncomment line',
  '   Tab             Complete LaTeX autocomplete',
  '   Esc             Close panels / menus',
  '',
  'Clipboard',
  '   Ctrl+Shift+C    Copy rendered PNG',
  '',
  'View',
  '   Ctrl+= / - / 0  Zoom in / out / reset',
  '   Ctrl+Alt+T      Toggle dark / light theme',
  '   F11             Full screen',
  '   F12             Developer tools',
  '   F1              This help'
].join('\n');

/* pre-paint skin — kills the paper flash AND the Windows text blur */
const PRE_SKIN = [
  '#grain{display:none}',
  'body{-webkit-font-smoothing:subpixel-antialiased}',
  ':root{--sans:"Segoe UI Variable Text","Segoe UI",sans-serif;',
  '--mono:"Cascadia Code","Cascadia Mono",Consolas,monospace;',
  '--paper:#f3f3f3;--panel:#ffffff;--panel2:#f5f5f5;--ink:#1b1b1b;--ink2:#5c5c5c;--mut:#8a8a8a;',
  '--line:#e6e6e6;--line2:#d9d9d9;--stage:#ededed;--field:#ffffff;--track:#d9d9d9}',
  'html.dark{--paper:#202020;--panel:#2b2b2b;--panel2:#333333;--ink:#f2f2f2;--ink2:#c6c6c6;',
  '--mut:#9b9b9b;--line:#3a3a3a;--line2:#4a4a4a;--stage:#262626;--field:#1e1e1e;--track:#4a4a4a}'
].join('');

const LOCAL_ACTIONS = new Set([
  'new', 'clear', 'save', 'save-as', 'export', 'export-as',
  'copy-png', 'copy-svg', 'copy-tex', 'dup-line', 'comment',
  'insert', 'insert-env', 'theme', 'preset', 'backdrop', 'hl-open',
  'edit-undo', 'edit-redo', 'edit-cut', 'edit-copy', 'edit-paste', 'edit-selectall'
]);

let win = null;
let recentFiles = [];
let dirty = false;

function fileUrl(p){
  const s = path.resolve(p).split(path.sep).join('/');
  return 'file://' + (s.startsWith('/') ? '' : '/') + s;
}
function isOffline(){
  try { return !net.isOnline(); } catch (e) { return false; }
}

/* ---------------- one menu model → custom strip + hidden native menu ---------------- */
function menuModel(){
  return [
    { label: 'File', items: [
      { label: 'New',              accel: 'Ctrl+N',       action: 'new' },
      { label: 'Open…',            accel: 'Ctrl+O',       action: 'open' },
      { label: 'Open Recent', items: recentFiles.length
        ? [ ...recentFiles.map(f => ({ label: path.basename(f), action: 'recent', arg: f })),
            { sep: true },
            { label: 'Clear Recent Files', action: 'clear-recent' } ]
        : [ { label: 'No recent files', disabled: true } ] },
      { sep: true },
      { label: 'Save',             accel: 'Ctrl+S',       action: 'save' },
      { label: 'Save As…',         accel: 'Ctrl+Shift+S', action: 'save-as' },
      { sep: true },
      { label: 'Export Image…',    accel: 'Ctrl+Shift+E', action: 'export' },
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
      { label: 'Undo',             accel: 'Ctrl+Z',  noAccel: true, action: 'edit-undo' },
      { label: 'Redo',             accel: 'Ctrl+Y',  noAccel: true, action: 'edit-redo' },
      { sep: true },
      { label: 'Cut',              accel: 'Ctrl+X',  noAccel: true, action: 'edit-cut' },
      { label: 'Copy',             accel: 'Ctrl+C',  noAccel: true, action: 'edit-copy' },
      { label: 'Paste',            accel: 'Ctrl+V',  noAccel: true, action: 'edit-paste' },
      { label: 'Select All',       accel: 'Ctrl+A',  noAccel: true, action: 'edit-selectall' },
      { sep: true },
      { label: 'Color Selection…', action: 'hl-open' },
      { sep: true },
      { label: 'Copy PNG to Clipboard', accel: 'Ctrl+Shift+C', action: 'copy-png' },
      { label: 'Copy SVG Markup',                                    action: 'copy-svg' },
      { label: 'Copy LaTeX Source',                                  action: 'copy-tex' },
      { sep: true },
      { label: 'Duplicate Line',    accel: 'Ctrl+D',  action: 'dup-line' },
      { label: 'Toggle Comment',    accel: 'Ctrl+/',  action: 'comment' },
      { sep: true },
      { label: 'Clear Editor',                          action: 'clear' }
    ]},
    { label: 'Insert', items: [
      { label: 'Fraction',          action: 'insert', arg: 'frac' },
      { label: 'Square Root',       action: 'insert', arg: 'sqrt' },
      { label: 'Superscript',       action: 'insert', arg: 'sup' },
      { label: 'Subscript',         action: 'insert', arg: 'sub' },
      { sep: true },
      { label: 'Matrix (2×2)',      action: 'insert', arg: 'matrix' },
      { label: 'Cases (piecewise)', action: 'insert', arg: 'cases' },
      { label: 'Aligned Block',     action: 'insert', arg: 'aligned' },
      { sep: true },
      { label: 'Environment', items: ENV_LIST.map(n => ({
        label: '\\begin{' + n + '}', action: 'insert-env', arg: n
      })) }
    ]},
    { label: 'View', items: [
      { label: 'Reload',            accel: 'Ctrl+R',  action: 'reload' },
      { label: 'Developer Tools',   accel: 'F12',     action: 'devtools' },
      { sep: true },
      { label: 'Zoom In',           accel: 'Ctrl+=',  action: 'zoomin' },
      { label: 'Zoom Out',          accel: 'Ctrl+-',  action: 'zoomout' },
      { label: 'Reset Zoom',        accel: 'Ctrl+0',  action: 'zoomreset' },
      { sep: true },
      { label: 'Toggle Theme',      accel: 'Ctrl+Alt+T', action: 'theme' },
      { label: 'Full Screen',       accel: 'F11',     action: 'fullscreen' }
    ]},
    { label: 'Tools', items: [
      { label: 'Frame Preset', items: [
        { label: 'Bare (transparent, tight)', action: 'preset', arg: 'bare' },
        { label: 'Card (white, rounded)',     action: 'preset', arg: 'card' },
        { label: 'Print (white, flat)',       action: 'preset', arg: 'print' },
        { label: 'Dark (ink background)',     action: 'preset', arg: 'dark' }
      ]},
      { label: 'Stage Backdrop', items: [
        { label: 'Paper', action: 'backdrop', arg: 'paper' },
        { label: 'Light', action: 'backdrop', arg: 'light' },
        { label: 'Ink',   action: 'backdrop', arg: 'ink' }
      ]}
    ]},
    { label: 'Help', items: [
      { label: 'Keyboard Shortcuts', accel: 'F1', action: 'help' },
      { sep: true },
      { label: 'About Theorem',    action: 'about' },
      { label: 'GitHub Repository', action: 'github' }
    ]}
  ];
}

function toNative(items){
  return items.map(it => {
    if (it.sep) return { type: 'separator' };
    const item = { label: it.label, enabled: !it.disabled };
    if (it.items) item.submenu = toNative(it.items);
    else if (it.action) item.click = () => dispatch(it.action, it.arg);
    if (it.accel && !it.noAccel) item.accelerator = it.accel;
    return item;
  });
}

function dispatch(action, arg){
  if (!win) return;
  if (LOCAL_ACTIONS.has(action)) win.webContents.send('menu', action, arg);
  else windowAction(action, arg);
}

function windowAction(name, arg){
  if (!win) return;
  switch (name){
    case 'open':         openDialog(); break;
    case 'recent':       if (arg) openFile(arg); break;
    case 'clear-recent': recentFiles = []; saveRecent(); buildMenu(); sendModel(); break;
    case 'reload':
      if (dirty) win.webContents.send('menu', 'confirm-reload');
      else win.reload();
      break;
    case 'devtools':   win.webContents.toggleDevTools(); break;
    case 'fullscreen': win.setFullScreen(!win.isFullScreen()); break;
    case 'zoomin':     zoomBy(0.5); break;
    case 'zoomout':    zoomBy(-0.5); break;
    case 'zoomreset':  win.webContents.setZoomLevel(0); break;
    case 'about':      showAbout(); break;
    case 'help':       showShortcuts(); break;
    case 'github':     shell.openExternal('https://github.com/Soumyajit9696/theorem'); break;
    case 'quit':       win.close(); break;
  }
}

function buildMenu(){
  Menu.setApplicationMenu(Menu.buildFromTemplate(toNative(menuModel())));
}
function sendModel(){
  if (win) win.webContents.send('menu-model', menuModel());
}

/* ---------------- recent files ---------------- */
function loadRecent(){
  try {
    const list = JSON.parse(fs.readFileSync(RECENT_PATH(), 'utf8'));
    recentFiles = Array.isArray(list) ? list.filter(f => typeof f === 'string') : [];
  } catch (e) { recentFiles = []; }
}
function saveRecent(){
  try { fs.writeFileSync(RECENT_PATH(), JSON.stringify(recentFiles.slice(0, MAX_RECENT))); } catch (e) {}
}
function pushRecent(p){
  recentFiles = [p, ...recentFiles.filter(f => f !== p)].slice(0, MAX_RECENT);
  saveRecent();
  buildMenu();
  sendModel();
}

/* ---------------- window ---------------- */
const isWin = process.platform === 'win32';

function createWindow(){
  win = new BrowserWindow({
    width: 1360, height: 880, minWidth: 1000, minHeight: 640,
    backgroundColor: '#f3f3f3',
    show: false,
    ...(isWin ? {
      titleBarStyle: 'hidden',
      titleBarOverlay: { color: '#f3f3f3', symbolColor: '#1b1b1b', height: 40 }
    } : {}),
    webPreferences: {
      preload: path.join(DESK, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
      zoomFactor: 1,
      backgroundThrottling: false      /* snappy restore from minimize */
    }
  });
  win.once('ready-to-show', () => win.show());
  win.loadFile(path.join(RENDERER, 'index.html'));

  win.webContents.on('dom-ready', () => {
    win.webContents.insertCSS(PRE_SKIN).catch(() => {});
  });

  win.webContents.on('did-finish-load', () => {
    win.webContents.setZoomLevel(0);
    if (fs.existsSync(COMPANION)){
      win.webContents.executeJavaScript(
        "(function(){if(window.__theoremDesktop)return;var s=document.createElement('script');" +
        "s.src='desktop-app.js';document.head.appendChild(s);})()"
      ).catch(() => {});
    }
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://')) e.preventDefault();
  });

  win.on('close', (e) => {
    if (dirty){
      e.preventDefault();
      win.webContents.send('menu', 'confirm-close');
    }
  });
  win.on('closed', () => { win = null; });
}

/* ---------------- open / save ---------------- */
function openFile(filePath){
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return dialog.showErrorBox('Could not open file', String(err));
    pushRecent(filePath);
    if (win) win.webContents.send('menu', 'open-tex', {
      name: path.basename(filePath), path: filePath, content: String(data)
    });
  });
}
async function openDialog(){
  if (!win) return;
  const r = await dialog.showOpenDialog(win, {
    title: 'Open a LaTeX file',
    filters: [{ name: 'LaTeX / text / Theorem PNG', extensions: ['tex', 'txt', 'png'] }],
    properties: ['openFile']
  });
  if (!r.canceled && r.filePaths[0]) openFile(r.filePaths[0]);
}

ipcMain.handle('save-tex-as', async (_e, { name, content }) => {
  const suggested = name && /\.tex$/i.test(name) ? name : (name || 'equation') + '.tex';
  const r = await dialog.showSaveDialog(win, {
    title: 'Save LaTeX Source',
    defaultPath: path.join(app.getPath('documents'), suggested),
    filters: [{ name: 'LaTeX source', extensions: ['tex'] }, { name: 'All files', extensions: ['*'] }]
  });
  if (r.canceled || !r.filePath) return { cancelled: true };
  try { fs.writeFileSync(r.filePath, String(content), 'utf8'); }
  catch (err) { return { error: String(err) }; }
  pushRecent(r.filePath);
  return { path: r.filePath };
});

ipcMain.handle('write-tex', (_e, { filePath, content }) => {
  try { fs.writeFileSync(filePath, String(content), 'utf8'); return { ok: true }; }
  catch (err) { return { ok: false, error: String(err) }; }
});

/* drag-out: pre-rendered PNG written to temp for DownloadURL drags */
const DRAG_PNG = () => path.join(app.getPath('temp'), 'theorem-drag.png');
ipcMain.handle('write-temp-png', async (_e, data) => {
  try {
    fs.writeFileSync(DRAG_PNG(), Buffer.from(data));
    return { ok: true, path: DRAG_PNG() };
  } catch (err) { return { ok: false, error: String(err) }; }
});

ipcMain.on('window-action', (_e, name, arg) => windowAction(name, arg));
ipcMain.on('request-model', () => sendModel());

/* ---------------- unsaved-changes plumbing ---------------- */
ipcMain.on('dirty-state',  (_e, b)   => { dirty = !!b; });
ipcMain.on('close-window', ()       => { if (win) win.destroy(); });

ipcMain.on('set-bg', (_e, hex) => {
  if (!win || typeof hex !== 'string') return;
  win.setBackgroundColor(hex);
  try {
    const dark = hex.toLowerCase() === '#202020';
    win.setTitleBarOverlay({ color: hex, symbolColor: dark ? '#f2f2f2' : '#1b1b1b' });
  } catch (e) {}
});

ipcMain.handle('confirm-unsaved', (_e, name) => {
  const opts = {
    type: 'warning',
    title: 'Unsaved changes',
    message: 'Do you want to save changes to ' + (name || 'untitled.tex') + '?',
    detail: 'Your changes will be lost if you don\u2019t save them.',
    buttons: ['Save', 'Don\u2019t save', 'Cancel'],
    defaultId: 0, cancelId: 2, noLink: true
  };
  const choice = win ? dialog.showMessageBoxSync(win, opts) : dialog.showMessageBoxSync(opts);
  return ['save', 'discard', 'cancel'][choice];
});

/* ---------------- image exports → real save dialogs ---------------- */
function wireDownloads(){
  session.defaultSession.on('will-download', (event, item) => {
    const suggested = item.getFilename() || 'download';
    const ext = (suggested.match(/\.([a-z0-9]+)$/i) || [])[1];
    const target = dialog.showSaveDialogSync(win, {
      title: 'Save ' + suggested,
      defaultPath: path.join(app.getPath('downloads'), suggested),
      filters: ext
        ? [{ name: ext.toUpperCase() + ' file', extensions: [ext] }, { name: 'All files', extensions: ['*'] }]
        : undefined
    });
    if (!target){
      event.preventDefault();
      if (win) win.webContents.send('menu', 'download', { state: 'cancelled', name: suggested });
      return;
    }
    item.setSavePath(target);
    item.once('done', (_e, state) => {
      if (win) win.webContents.send('menu', 'download', { state, name: path.basename(target) });
    });
  });
}

/* ---------------- network policy: instant offline, zero font CDNs ----------------
   ONE webRequest listener (Electron allows only one per event):
   • MathJax es5/*  → served from the local vendor tree when the file exists,
                      otherwise canceled immediately when offline (no timeout hang),
                      otherwise allowed (online CDN fallback).
   • Google Fonts   → always canceled. The desktop skin uses Segoe UI / Cascadia,
                      so these fonts are unused — and a pending stylesheet blocks
                      first paint for the whole network timeout when offline.   */
function wireNetwork(){
  session.defaultSession.webRequest.onBeforeRequest(
    { urls: [MJAX_BASE + '*', '*://fonts.googleapis.com/*', '*://fonts.gstatic.com/*'] },
    (details, cb) => {
      const u = details.url;
      if (u.startsWith(MJAX_BASE)){
        const rel = u.slice(MJAX_BASE.length).split('?')[0];
        const local = path.join(VENDOR, rel);
        if (rel && fs.existsSync(local)) return cb({ redirectURL: fileUrl(local) });
        if (isOffline()) return cb({ cancel: true });
        return cb({});
      }
      return cb({ cancel: true });   /* web font CDNs */
    }
  );
}

/* ---------------- dialogs ---------------- */
function showAbout(){
  dialog.showMessageBox(win, {
    type: 'info', title: 'About Theorem',
    message: 'Theorem — LaTeX Equation Press',
    detail:
  'LaTeX to PNG / SVG / JPG / PDF converter.\n' +
  'Version ' + app.getVersion() + '\n\n' +
  'Built by Soumyajit Das\n' +
  'https://github.com/Soumyajit9696/theorem\n\n' +
  'MIT License · typeset by MathJax · pressed with jsPDF / svg2pdf',
    buttons: ['OK']
  });
}
function showShortcuts(){
  dialog.showMessageBox(win, {
    type: 'info', title: 'Keyboard Shortcuts',
    message: 'Theorem — Keyboard Shortcuts', detail: SHORTCUTS, buttons: ['OK']
  });
}

function zoomBy(delta){
  if (!win) return;
  win.webContents.zoomLevel = Math.max(-2, Math.min(4, win.webContents.zoomLevel + delta));
}

function fileFromArgv(argv){
  return (argv || []).find(a => typeof a === 'string' && /\.tex$/i.test(a) && fs.existsSync(a));
}

/* ---------------- lifecycle ---------------- */
const gotLock = app.requestSingleInstanceLock();
if (!gotLock){
  app.quit();
} else {
  app.on('second-instance', (_e, argv) => {
    if (win){ if (win.isMinimized()) win.restore(); win.focus(); }
    const f = fileFromArgv(argv);
    if (f) openFile(f);
  });

  app.whenReady().then(() => {
    if (process.platform === 'win32') app.setAppUserModelId('com.soumyajitdas.theorem');

    if (!fs.existsSync(COMPANION)){
      dialog.showErrorBox('Theorem — setup incomplete',
        'renderer/desktop-app.js was not found.\n\n' +
        'Put desktop-app.js inside the desktop/renderer folder and restart.');
    }
    if (!fs.existsSync(path.join(VENDOR, MJAX_MAIN)) && isOffline()){
      dialog.showErrorBox('Theorem — offline without local MathJax',
        'renderer/vendor/tex-svg.js was not found and you are offline, so ' +
        'equations cannot be typeset.\n\nDownload it once (see the README vendor ' +
        'commands) and everything works offline.');
    }

    loadRecent();
    wireDownloads();
    wireNetwork();
    buildMenu();
    createWindow();
    const f = fileFromArgv(process.argv);
    if (f) openFile(f);
    /* auto-update only in packaged builds — no network probing during npm start */
    if (autoUpdater && app.isPackaged) autoUpdater.checkForUpdatesAndNotify().catch(() => {});
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}