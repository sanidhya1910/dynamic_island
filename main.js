const { app, BrowserWindow, screen, ipcMain, Notification } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const si = require('systeminformation');

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width } = primaryDisplay.workAreaSize;

  const win = new BrowserWindow({
    width: 460,
    height: 160,
    x: Math.floor((width - 460) / 2),
    y: 30,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const REACT_DEV_URL = 'http://localhost:3000';
  const pollReact = setInterval(() => {
    fetch(REACT_DEV_URL)
      .then(() => {
        clearInterval(pollReact);
        win.loadURL(REACT_DEV_URL);
      })
      .catch(() => {});
  }, 1000);

  setInterval(() => {
    exec('powershell -command "Get-Process -Name Spotify -ErrorAction SilentlyContinue | Select -ExpandProperty MainWindowTitle"', (err, stdout) => {
      if (!err && stdout.trim()) {
        const title = stdout.trim();
        const [artist, songTitle] = title.split(' - ');
        win.webContents.send('music-info', {
          artist: artist || 'Unknown',
          title: songTitle || 'Unknown'
        });
      } else {
        win.webContents.send('music-info', null);
      }
    });
  }, 2000);

  ipcMain.on('playback-control', (event, action) => {
    const mediaKeys = {
      play: 'PlayPauseMedia',
      next: 'NextTrack',
      prev: 'PreviousTrack',
    };
    if (mediaKeys[action]) {
      exec(`nircmd sendkeypress ${mediaKeys[action]}`);
    }
  });

  ipcMain.on('trigger-notification', (event, message) => {
    win.webContents.send('show-notification', message);
  });
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
