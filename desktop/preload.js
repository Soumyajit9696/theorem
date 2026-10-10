/* Secure bridge — the only API the renderer gets.
   Runs BEFORE any page script, so window.theoremNative
   exists when the page's inline scripts execute. */
'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('theoremNative', {
  /* main → renderer */
  onMenu:      (cb) => ipcRenderer.on('menu', (_e, action, payload) => cb(action, payload)),
  onModel:     (cb) => ipcRenderer.on('menu-model', (model) => cb(model)),

  /* renderer → main */
  saveTexAs:      (name, content)     => ipcRenderer.invoke('save-tex-as', { name, content }),
  writeTex:       (filePath, content) => ipcRenderer.invoke('write-tex', { filePath, content }),
  writeTempPng:   (data)              => ipcRenderer.invoke('write-temp-png', data),
  confirmUnsaved: (name)              => ipcRenderer.invoke('confirm-unsaved', name),
  setDirty:       (b)                 => ipcRenderer.send('dirty-state', !!b),
  closeWindow:    ()                  => ipcRenderer.send('close-window'),
  setWindowBG:    (hex)               => ipcRenderer.send('set-bg', hex),
  windowAction:   (name, arg)         => ipcRenderer.send('window-action', name, arg),
  requestModel:   ()                  => ipcRenderer.send('request-model')
});