# Enhanced Dynamic Island for Windows

An enhanced macOS-style Dynamic Island widget for Windows with improved UI and additional features.

## ✨ New Features

### 🎵 Enhanced Music Controls
- Beautiful track display with artist and title
- Improved playback controls (play/pause, next, previous)
- Visual feedback for play states
- Spotify integration support

### 📊 System Monitoring
- Real-time CPU usage display
- Memory usage monitoring
- Network activity indicator
- Visual progress bars for all metrics

### 🔋 Battery & Status Indicators
- Battery level with charging status
- Network connectivity indicator
- Volume level monitoring
- Time and date display

### 🌤️ Weather Integration
- Current temperature display
- Weather condition icons
- Automatic updates every 10 minutes
- Beautiful weather icons for different conditions

### 🔔 Enhanced Notifications
- Popup notifications with animations
- Recent notifications history
- Timestamp tracking
- Smooth notification transitions

### 🎯 Quick Actions
- Settings quick access
- Volume control
- Microphone toggle
- Expandable interface

### 🎨 Improved UI/UX
- Glassmorphism design with blur effects
- Smooth animations powered by GSAP
- Expandable interface with more details
- Hover effects and visual feedback
- Responsive design
- Beautiful gradients and shadows

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Windows 10/11
- NirCmd (for media key support) - Download from [NirSoft](https://www.nirsoft.net/utils/nircmd.html)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd renderer
   npm install
   ```

### Running the Application
1. Start the development servers:
   ```bash
   npm run dev
   ```
   
   This will start both the React development server and the Electron app.

2. Or run them separately:
   ```bash
   # Terminal 1: Start React dev server
   cd renderer
   npm start
   
   # Terminal 2: Start Electron app
   npm start
   ```

## 📱 Features Overview

### Main Interface
- **Time & Date**: Current time with day/date display
- **Weather**: Real-time weather information
- **Battery**: Battery level with charging indicator
- **Network**: Connection status indicator

### Expandable View
Click the center weather section to expand the island and access:
- **System Stats**: CPU, Memory, and Network usage
- **Quick Actions**: Settings, Volume, Microphone controls
- **Notification History**: Recent notifications list

### Music Controls
When Spotify (or compatible music app) is running:
- **Track Info**: Artist and song title
- **Playback Controls**: Previous, Play/Pause, Next
- **Visual Feedback**: Play state indicators

## 🛠️ Customization

### Styling
The app uses a modern glassmorphism design with:
- Backdrop blur effects
- Smooth gradients
- Responsive animations
- Dark theme with light accents

### Adding New Features
1. **New Data Sources**: Add handlers in `main.js`
2. **UI Components**: Create new sections in `App.js`
3. **Styling**: Update `App.css` with new styles
4. **Animations**: Use GSAP for smooth transitions

## 🔧 Configuration

### Weather API
The app uses `wttr.in` for weather data. No API key required.

### System Information
Uses the `systeminformation` package for real-time system stats.

### Music Integration
Currently supports Spotify through window title detection. Can be extended for other music apps.

## 📋 Available Scripts

- `npm run dev`: Start both React and Electron in development mode
- `npm start`: Start Electron app (requires React dev server to be running)
- `npm run react`: Start only the React development server
- `npm run build`: Build the React app for production

## 🎨 Theming

The app features a beautiful dark theme with:
- **Primary Colors**: Dark grays with transparency
- **Accent Colors**: Blue (#64B5F6) for icons and highlights
- **Status Colors**: Green for battery/online, Red for alerts, Yellow for charging
- **Animations**: Smooth transitions and hover effects

## 🐛 Troubleshooting

### Common Issues
1. **App doesn't start**: Make sure React dev server is running first
2. **No music info**: Install NirCmd for media key support
3. **No system stats**: Ensure Electron has necessary permissions

### Development Tips
- Use Chrome DevTools for debugging the renderer process
- Check Electron main process logs for backend issues
- Hot reload is enabled for React components

## 🚀 Future Enhancements

Planned features:
- **Calendar Integration**: Upcoming events display
- **System Controls**: Brightness, WiFi toggle
- **Customizable Widgets**: User-configurable modules
- **Themes**: Multiple color schemes
- **Performance Mode**: Reduced animations for better performance

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Enjoy your enhanced Dynamic Island experience on Windows! 🎉
