const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onMusicInfo: (callback) => ipcRenderer.on('music-info', (event, data) => callback(data)),
  controlPlayback: (action) => ipcRenderer.send('playback-control', action),
  onNotification: (callback) => ipcRenderer.on('show-notification', (event, message) => callback(message)),
  onSystemStats: (callback) => ipcRenderer.on('system-stats', (event, data) => callback(data)),
  onBatteryInfo: (callback) => ipcRenderer.on('battery-info', (event, data) => callback(data)),
  onVolumeInfo: (callback) => ipcRenderer.on('volume-info', (event, data) => callback(data)),
  requestWeather: () => ipcRenderer.send('request-weather'),
  triggerNotification: (message) => ipcRenderer.send('trigger-notification', message),
});