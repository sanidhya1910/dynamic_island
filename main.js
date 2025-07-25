const { app, BrowserWindow, screen, ipcMain, Notification, powerMonitor } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const si = require('systeminformation');
const os = require('os');

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  const win = new BrowserWindow({
    width: 520,
    height: 80, // Start with compact height
    x: Math.floor((width - 520) / 2),
    y: 10, // Closer to top, more iOS-like
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false, // Remove shadow for sleeker look
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Handle window resizing when expanding/collapsing
  ipcMain.on('resize-window', (event, { width: newWidth, height: newHeight, expanded }) => {
    const currentBounds = win.getBounds();
    const screenWidth = primaryDisplay.workAreaSize.width;
    
    // Calculate new position to keep centered
    const newX = Math.floor((screenWidth - newWidth) / 2);
    
    win.setBounds({
      x: newX,
      y: expanded ? 10 : 10, // Keep same Y position
      width: newWidth,
      height: newHeight
    }, true);
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

  // Music information polling
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

  // System stats monitoring
  setInterval(async () => {
    try {
      const [cpuData, memData, networkData] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.networkStats()
      ]);

      const systemStats = {
        cpu: Math.round(cpuData.currentLoad),
        memory: Math.round((memData.used / memData.total) * 100),
        network: networkData[0] ? Math.round((networkData[0].rx_sec + networkData[0].tx_sec) / 1024) : 0
      };

      win.webContents.send('system-stats', systemStats);
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  }, 5000);

  // Battery monitoring (if available)
  if (powerMonitor) {
    const sendBatteryInfo = () => {
      const batteryLevel = powerMonitor.getSystemIdleTime ? 100 : Math.floor(Math.random() * 100);
      const isCharging = powerMonitor.isOnBatteryPower ? !powerMonitor.isOnBatteryPower() : false;
      
      win.webContents.send('battery-info', {
        level: batteryLevel,
        charging: isCharging
      });
    };

    sendBatteryInfo();
    setInterval(sendBatteryInfo, 30000); // Update every 30 seconds
  }

  // Volume monitoring (Windows specific)
  setInterval(() => {
    exec('powershell -command "Get-AudioDevice -PlaybackVolume"', (err, stdout) => {
      if (!err && stdout.trim()) {
        const volume = parseInt(stdout.trim()) || 50;
        win.webContents.send('volume-info', volume);
      }
    });
  }, 10000);

  // Weather update trigger
  ipcMain.on('request-weather', () => {
    // This can be expanded to provide more detailed weather info
    win.webContents.send('weather-update');
  });

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

  // Test notification system
  setTimeout(() => {
    win.webContents.send('show-notification', 'Dynamic Island is ready!');
  }, 3000);
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
