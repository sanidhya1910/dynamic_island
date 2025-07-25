const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onMusicInfo: (callback) => ipcRenderer.on('music-info', (event, data) => callback(data)),
  controlPlayback: (action) => ipcRenderer.send('playback-control', action),
  onNotification: (callback) => ipcRenderer.on('show-notification', (event, message) => callback(message)),
});