const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('deckAPI', {
  getBounds: () => ipcRenderer.invoke('deck:getBounds'),
  getOrigin: () => ipcRenderer.invoke('deck:getOrigin'),
  dockBottom: () => ipcRenderer.invoke('deck:dockBottom'),
  setReserveSpace: (value) => ipcRenderer.invoke('deck:setReserveSpace', value),
  getReserveSpace: () => ipcRenderer.invoke('deck:getReserveSpace'),
  setAlwaysOnTop: (value) => ipcRenderer.invoke('deck:setAlwaysOnTop', value),
  setOpacity: (value) => ipcRenderer.invoke('deck:setOpacity', value),
  minimize: () => ipcRenderer.invoke('deck:minimize'),
  close: () => ipcRenderer.invoke('deck:close'),
  loadPersistentState: () => ipcRenderer.invoke('deck:loadPersistentState'),
  savePersistentState: (data) => ipcRenderer.invoke('deck:savePersistentState', data),
  getPersistentPath: () => ipcRenderer.invoke('deck:getPersistentPath'),
  importPlaylistNoKey: (playlistId) => ipcRenderer.invoke('youtube:importPlaylistNoKey', playlistId),
  setTrayTooltip: (text) => ipcRenderer.invoke('deck:setTrayTooltip', text),
  onLockChanged: (callback) => ipcRenderer.on('deck-lock-changed', (_event, value) => callback(value)),
  onDisplayChanged: (callback) => ipcRenderer.on('deck-display-changed', (_event, value) => callback(value)),
  onTrayCommand: (callback) => ipcRenderer.on('deck-tray-command', (_event, value) => callback(value)),
});
