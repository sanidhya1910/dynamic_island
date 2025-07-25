import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import axios from 'axios';
import './App.css';
import { WiCloudy } from 'react-icons/wi';
import { MdAccessTime, MdNotifications, MdMusicNote } from 'react-icons/md';
import { FaStepBackward, FaStepForward, FaPlay } from 'react-icons/fa';

function App() {
  const islandRef = useRef(null);
  const [track, setTrack] = useState(null);
  const [time, setTime] = useState(new Date());
  const [notification, setNotification] = useState(null);
  const [weather, setWeather] = useState('');

  useEffect(() => {
    gsap.to(islandRef.current, {
      translateY: 0,
      opacity: 1,
      duration: 0.5,
      ease: 'easeOutQuad',
    });

    if (window.electronAPI) {
      window.electronAPI.onMusicInfo((data) => {
        setTrack(data);
      });
      window.electronAPI.onNotification((msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 4000);
      });
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get('https://wttr.in/?format=%t');
        setWeather(response.data);
      } catch {
        setWeather('N/A');
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  const handleControl = (action) => {
    if (window.electronAPI) {
      window.electronAPI.controlPlayback(action);
    }
  };

  return (
    <div ref={islandRef} className="island">
      <div className="top-line">
        <span className="time">
          <MdAccessTime /> {time.toLocaleTimeString()}
        </span>
        <span className="weather">
          <WiCloudy /> {weather}
        </span>
      </div>

      {track && (
        <div className="music-line">
          <span className="track">
            <MdMusicNote /> {track.artist} - {track.title}
          </span>
          <span className="controls">
            <button onClick={() => handleControl('prev')}>
              <FaStepBackward />
            </button>
            <button onClick={() => handleControl('play')}>
              <FaPlay />
            </button>
            <button onClick={() => handleControl('next')}>
              <FaStepForward />
            </button>
          </span>
        </div>
      )}

      {notification && (
        <div className="notification-popup">
          <MdNotifications /> {notification}
        </div>
      )}
    </div>
  );
}

export default App;

