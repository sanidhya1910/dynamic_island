import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import axios from 'axios';
import './App.css';

import { 
  Cloud, Sun, CloudRain, CloudSnow, Zap, CloudDrizzle,
  Clock, Bell, Music, Battery, BatteryLow, Wifi, WifiOff,
  Volume2, VolumeX, ChevronDown, ChevronUp, Settings,
  SkipBack, SkipForward, Play, Pause, Shuffle, Repeat,
  Mic, Cpu, HardDrive, Activity
} from 'lucide-react';

function App() {
  const islandRef = useRef(null);
  const [track, setTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(new Date());
  const [notification, setNotification] = useState(null);
  const [weather, setWeather] = useState('');
  const [weatherIcon, setWeatherIcon] = useState(<Cloud />);
  const [temperature, setTemperature] = useState('');
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);
  const [systemStats, setSystemStats] = useState({ cpu: 0, memory: 0, network: 0 });
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Weather icon mapping
  const getWeatherIcon = (description, isDay = true) => {
    const desc = description.toLowerCase();
    if (desc.includes('sunny') || desc.includes('clear')) {
      return <Sun className="weather-icon" />;
    } else if (desc.includes('rain') || desc.includes('drizzle')) {
      return <CloudRain className="weather-icon" />;
    } else if (desc.includes('thunder') || desc.includes('storm')) {
      return <Zap className="weather-icon" />;
    } else if (desc.includes('snow')) {
      return <CloudSnow className="weather-icon" />;
    } else if (desc.includes('cloud')) {
      return <Cloud className="weather-icon" />;
    }
    return <Cloud className="weather-icon" />;
  };

  // Battery icon based on level
  const getBatteryIcon = () => {
    if (batteryLevel <= 15) return BatteryLow;
    return Battery;
  };

  useEffect(() => {
    // Enhanced entrance animation
    gsap.fromTo(islandRef.current, 
      { 
        translateY: -50,
        opacity: 0,
        scale: 0.8,
        rotationX: -15
      },
      {
        translateY: 0,
        opacity: 1,
        scale: 1,
        rotationX: 0,
        duration: 0.8,
        ease: 'back.out(1.7)',
      }
    );

    if (window.electronAPI) {
      window.electronAPI.onMusicInfo((data) => {
        setTrack(data);
      });
      
      window.electronAPI.onNotification((msg) => {
        const newNotification = {
          id: Date.now(),
          message: msg,
          timestamp: new Date()
        };
        setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
        setNotification(msg);
        setTimeout(() => setNotification(null), 4000);
      });

      window.electronAPI.onSystemStats((data) => {
        setSystemStats(data);
      });

      window.electronAPI.onBatteryInfo((data) => {
        setBatteryLevel(data.level);
        setIsCharging(data.charging);
      });

      window.electronAPI.onVolumeInfo((data) => {
        setVolume(data);
      });
    }

    // Battery monitoring fallback for browsers
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);
        
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
        
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      });
    }

    // Network status monitoring
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Enhanced time updates
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
      setCurrentDate(now);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Enhanced weather fetching
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get('https://wttr.in/?format=%C+%t+%h+%w');
        const [condition, temp, humidity, wind] = response.data.split(' ');
        setWeather(`${condition} ${temp}`);
        setTemperature(temp);
        setWeatherIcon(getWeatherIcon(condition));
      } catch {
        setWeather('N/A');
        setTemperature('--°');
      }
    };
    
    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // 10 minutes
    return () => clearInterval(interval);
  }, []);

  // System stats simulation (in real app, this would come from Electron main process)
  useEffect(() => {
    const updateStats = () => {
      // If electron API is not available, use mock data
      if (!window.electronAPI) {
        setSystemStats({
          cpu: Math.floor(Math.random() * 100),
          memory: Math.floor(Math.random() * 100),
          network: Math.floor(Math.random() * 1000)
        });
      }
    };
    
    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle window resizing when track changes
  useEffect(() => {
    if (window.electronAPI && islandRef.current) {
      setTimeout(() => {
        const rect = islandRef.current.getBoundingClientRect();
        const padding = 20;
        
        const dimensions = {
          width: Math.max(520, Math.min(rect.width + padding, 600)),
          height: Math.max(isExpanded ? 120 : 80, rect.height + padding),
          expanded: isExpanded
        };
        
        window.electronAPI.resizeWindow(dimensions);
      }, 100);
    }
  }, [track, isExpanded]);

  const handleControl = (action) => {
    if (window.electronAPI) {
      window.electronAPI.controlPlayback(action);
      if (action === 'play') {
        setIsPlaying(!isPlaying);
      }
    }
  };

  const toggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    
    // Calculate window dimensions based on content
    if (window.electronAPI) {
      setTimeout(() => {
        const islandElement = islandRef.current;
        if (islandElement) {
          const rect = islandElement.getBoundingClientRect();
          const padding = 20; // Reduced padding for tighter fit
          
          const dimensions = {
            width: Math.max(520, Math.min(rect.width + padding, 600)), // Max width cap
            height: Math.max(newExpanded ? 120 : 80, rect.height + padding),
            expanded: newExpanded
          };
          
          window.electronAPI.resizeWindow(dimensions);
        }
      }, 150); // Slightly longer delay for smoother animation
    }
    
    // Animate the expansion
    if (newExpanded) {
      gsap.to(islandRef.current, {
        scale: 1.02,
        duration: 0.2,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1
      });
    }
  };

  const formatDate = (date) => {
    const options = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString(undefined, options);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'settings':
        if (window.electronAPI) {
          window.electronAPI.triggerNotification('Settings panel opened');
        }
        break;
      case 'volume':
        if (window.electronAPI) {
          window.electronAPI.triggerNotification(`Volume: ${volume}%`);
        }
        break;
      case 'microphone':
        if (window.electronAPI) {
          window.electronAPI.triggerNotification('Microphone toggled');
        }
        break;
      default:
        break;
    }
  };

  const BatteryIcon = getBatteryIcon();

  return (
    <div ref={islandRef} className={`island ${isExpanded ? 'expanded' : ''}`}>
      {/* Main Status Bar */}
      <div className="status-bar">
        <div className="left-status">
          <span className="time-section">
            <Clock className="icon" size={16} />
            <div className="time-info">
              <div className="time">{time.toLocaleTimeString()}</div>
              <div className="date">{formatDate(currentDate)}</div>
            </div>
          </span>
        </div>
        
        <div className="center-status" onClick={toggleExpanded}>
          <span className="weather-section">
            <span className="weather-icon">{weatherIcon}</span>
            <span>{temperature}</span>
          </span>
          {isExpanded ? <ChevronUp className="expand-icon" size={16} /> : <ChevronDown className="expand-icon" size={16} />}
        </div>

        <div className="right-status">
          <span className="battery-section">
            <BatteryIcon className={`battery-icon ${batteryLevel <= 15 ? 'low-battery' : ''} ${isCharging ? 'charging' : ''}`} size={18} />
            <span className="battery-text">{batteryLevel}%</span>
          </span>
          <span className="network-section">
            {isOnline ? (
              <Wifi className="network-icon online" size={16} />
            ) : (
              <WifiOff className="network-icon offline" size={16} />
            )}
          </span>
        </div>
      </div>

      {/* Music Controls */}
      {track && (
        <div className="music-section">
          <div className="track-info">
            <Music className="music-icon" size={18} />
            <div className="track-details">
              <div className="track-title">{track.title}</div>
              <div className="track-artist">{track.artist}</div>
            </div>
          </div>
          
          <div className="music-controls">
            <button className="control-btn" onClick={() => handleControl('prev')}>
              <SkipBack size={12} />
            </button>
            <button className="control-btn main-control" onClick={() => handleControl('play')}>
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button className="control-btn" onClick={() => handleControl('next')}>
              <SkipForward size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="expanded-content">
          {/* System Stats */}
          <div className="system-stats">
            <div className="stat-item">
              <Cpu className="stat-icon" size={18} />
              <div className="stat-info">
                <div className="stat-label">CPU</div>
                <div className="stat-value">{systemStats.cpu}%</div>
                <div className="stat-bar">
                  <div 
                    className="stat-fill cpu" 
                    style={{width: `${systemStats.cpu}%`}}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="stat-item">
              <HardDrive className="stat-icon" size={18} />
              <div className="stat-info">
                <div className="stat-label">Memory</div>
                <div className="stat-value">{systemStats.memory}%</div>
                <div className="stat-bar">
                  <div 
                    className="stat-fill memory" 
                    style={{width: `${systemStats.memory}%`}}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="stat-item">
              <Activity className="stat-icon" size={18} />
              <div className="stat-info">
                <div className="stat-label">Network</div>
                <div className="stat-value">{systemStats.network} KB/s</div>
                <div className="stat-bar">
                  <div 
                    className="stat-fill network" 
                    style={{width: `${Math.min(systemStats.network / 10, 100)}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button className="quick-action-btn" onClick={() => handleQuickAction('settings')}>
              <Settings size={16} />
              <span>Settings</span>
            </button>
            <button className="quick-action-btn" onClick={() => handleQuickAction('volume')}>
              <Volume2 size={16} />
              <span>Volume</span>
            </button>
            <button className="quick-action-btn" onClick={() => handleQuickAction('microphone')}>
              <Mic size={16} />
              <span>Mic</span>
            </button>
          </div>

          {/* Recent Notifications */}
          {notifications.length > 0 && (
            <div className="notifications-section">
              <div className="section-title">Recent Notifications</div>
              <div className="notifications-list">
                {notifications.slice(0, 3).map(notif => (
                  <div key={notif.id} className="notification-item">
                    <Bell className="notif-icon" size={14} />
                    <div className="notif-content">
                      <div className="notif-message">{notif.message}</div>
                      <div className="notif-time">
                        {notif.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Notification Popup */}
      {notification && (
        <div className="notification-popup">
          <Bell className="popup-icon" size={16} />
          <span className="popup-text">{notification}</span>
        </div>
      )}
    </div>
  );
}

export default App;

