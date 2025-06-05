import { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import WaitressJobPortal from "./components/WaitressJobPortal";
import LuxuryMusicPlayer from "./components/LuxuryMusicPlayer";
import LuxuryNewsTicker from "./components/LuxuryNewsTicker";
import NotepadApp from "./components/NotepadApp";
import VaultApp from "./components/VaultApp";
import WeatherWidget from "./components/WeatherWidget";
import WeatherWidgetEnhanced from "./components/WeatherWidgetEnhanced";
import ProfessionalWeatherWidget from "./components/ProfessionalWeatherWidget";
import DownloadManager from "./components/DownloadManager";
import ProfessionalDownloadManager from "./components/ProfessionalDownloadManager";
import EnhancedSettings from "./components/EnhancedSettings";
import ProfessionalSettings from "./components/ProfessionalSettings";
import QuantumTerminal from "./components/QuantumTerminal";
import RelocateMeIntegration from "./components/RelocateMeIntegration";
import RealTimeLoader from "./components/RealTimeLoader";
import ProfessionalRealTimeLoader from "./components/ProfessionalRealTimeLoader";
import SleekDesktopIcons from "./components/SleekDesktopIcons";
import { useSounds, SoundProvider } from "./components/SoundManager";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// News Ticker Component
const ProfessionalNewsTicker = () => {
  const [news, setNews] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsResponse, metricsResponse] = await Promise.all([
          axios.get(`${API}/news/live`),
          axios.get(`${API}/system/performance`)
        ]);
        
        if (newsResponse.data.success) {
          setNews(newsResponse.data.news);
        }
        
        if (metricsResponse.data.success) {
          setSystemMetrics(metricsResponse.data.performance);
        }
      } catch (error) {
        console.error('Error fetching ticker data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="professional-news-ticker">
      <div className="ticker-content">
        <div className="system-metrics">
          CPU: {systemMetrics.cpu_usage?.toFixed(1) || 0}% | 
          RAM: {systemMetrics.memory_usage?.toFixed(1) || 0}% | 
          Network: {systemMetrics.database_status || 'Connected'}
        </div>
        <div className="news-scroll">
          {news.map((item, index) => (
            <span key={index} className="news-item">
              📰 {item.title} • 
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Desktop Environment Component
const ThriveRemoteDesktop = () => {
  const [windows, setWindows] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [virtualPets, setVirtualPets] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const sounds = useSounds();

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        const statusResponse = await axios.get(`${API}/dashboard/live-stats`);
        setSystemStatus(statusResponse.data);

        const petsResponse = await axios.get(`${API}/virtual-pets`);
        setVirtualPets(petsResponse.data);

        setLoading(false);
      } catch (error) {
        console.error("Failed to connect to ThriveRemote systems:", error);
        setLoading(false);
      }
    };

    fetchSystemData();

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  const createWindow = (id, title, content, icon = "🖥️", size = { width: 300, height: 200 }) => {
    sounds.playWindowOpen();
    const newWindow = {
      id,
      title,
      content,
      icon,
      position: { x: 80 + windows.length * 25, y: 80 + windows.length * 25 },
      size,
      isMinimized: false,
      isMaximized: false,
      zIndex: windows.length + 100
    };
    setWindows([...windows, newWindow]);
  };

  const closeWindow = (id) => {
    sounds.playWindowClose();
    // Add closing animation class
    const windowElement = document.querySelector(`[data-window-id="${id}"]`);
    if (windowElement) {
      windowElement.classList.add('closing');
      setTimeout(() => {
        setWindows(windows.filter(w => w.id !== id));
      }, 400);
    } else {
      setWindows(windows.filter(w => w.id !== id));
    }
  };

  const minimizeWindow = (id) => {
    sounds.playClick();
    setWindows(windows.map(w => 
      w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
    ));
  };

  const maximizeWindow = (id) => {
    sounds.playClick();
    setWindows(windows.map(w => 
      w.id === id ? { 
        ...w, 
        isMaximized: !w.isMaximized,
        previousPosition: w.isMaximized ? w.previousPosition : w.position,
        previousSize: w.isMaximized ? w.previousSize : w.size,
        position: w.isMaximized ? (w.previousPosition || w.position) : { x: 0, y: 0 },
        size: w.isMaximized ? (w.previousSize || w.size) : { width: window.innerWidth, height: window.innerHeight - 60 }
      } : w
    ));
  };

  const bringToFront = (id) => {
    const maxZ = Math.max(...windows.map(w => w.zIndex));
    setWindows(windows.map(w => 
      w.id === id ? { ...w, zIndex: maxZ + 1 } : w
    ));
  };

  // Enhanced desktop icon click handler
  const handleIconClick = (title, icon, componentName, width = 400, height = 300) => {
    sounds.playClick();
    
    // Component mapping
    const componentMap = {
      'WaitressJobPortal': <WaitressJobPortal />,
      'RelocateMeIntegration': <RelocateMeIntegration />,
      'ProfessionalDownloadManager': <ProfessionalDownloadManager />,
      'ProfessionalWeatherWidget': <ProfessionalWeatherWidget />,
      'VaultApp': <VaultApp />,
      'NotepadApp': <NotepadApp />,
      'QuantumTerminal': <QuantumTerminal />,
      'ProfessionalSettings': <ProfessionalSettings />
    };
    
    const component = componentMap[componentName] || <div>Component not found</div>;
    
    const newWindow = {
      id: Date.now(),
      title,
      icon,
      content: component,
      position: { 
        x: Math.random() * (window.innerWidth - width - 100) + 50,
        y: Math.random() * (window.innerHeight - height - 150) + 80
      },
      size: { width, height },
      isMinimized: false,
      isMaximized: false,
      zIndex: 100 + windows.length
    };

    setWindows([...windows, newWindow]);
  };

  if (loading) {
    return (
      <div className="boot-screen">
        <div className="boot-logo">🎭</div>
        <div className="boot-text">ThriveRemoteOS V5.4</div>
        <div className="boot-subtitle">Initializing Professional Platform...</div>
        <div className="boot-progress">
          <div className="boot-progress-bar"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="desktop-environment">
      {/* Professional News Ticker */}
      <ProfessionalNewsTicker />

      {/* Luxury Music Player Integration */}
      <LuxuryMusicPlayer />

      {/* Desktop Background */}
      <div className="desktop-wallpaper"></div>

      {/* Enhanced Desktop Icons with Sound Effects */}
      <div className="desktop-grid">
        <div 
          className="desktop-icon" 
          onClick={() => handleIconClick('AI Career Portal', '🤖', 'WaitressJobPortal', 450, 325)}
          onMouseEnter={() => sounds.playHover()}
        >
          <div className="icon material-icons-outlined">smart_toy</div>
          <div className="label">ai portal</div>
        </div>
        <div 
          className="desktop-icon" 
          onClick={() => handleIconClick('Music Studio', '🎵', 
            <div style={{padding: '20px', textAlign: 'center', background: 'linear-gradient(135deg, #0D0D0D, #2D2D2D)', color: '#D4AF37'}}>
              <h3 style={{fontFamily: 'Playfair Display', marginBottom: '15px'}}>🎵 Noir Music Studio</h3>
              <p style={{opacity: 0.8, fontSize: '0.9rem'}}>Premium music integration active in taskbar player</p>
              <p style={{opacity: 0.6, marginTop: '10px', fontSize: '0.8rem'}}>Luxury curated playlist with sophisticated audio experience</p>
            </div>, 350, 200)}
          onMouseEnter={() => sounds.playHover()}
        >
          <div className="icon material-icons-outlined">library_music</div>
          <div className="label">music</div>
        </div>
        <div 
          className="desktop-icon" 
          onClick={() => handleIconClick('Virtual Companions', '🐾', 
            <div style={{padding: '20px', background: 'linear-gradient(135deg, #0D0D0D, #2D2D2D)', color: '#D4AF37'}}>
              <h3 style={{fontFamily: 'Playfair Display', marginBottom: '15px'}}>🐾 Virtual Companions</h3>
              <p style={{opacity: 0.8, fontSize: '0.9rem'}}>AI-powered desktop pets with sophisticated behavior</p>
              <div style={{marginTop: '15px'}}>
                <button className="luxury-btn" onClick={() => window.open('/virtual-pets-tool/', '_blank')}>
                  🥚 Cosmic Pets
                </button>
                <button className="luxury-btn" onClick={() => window.open('/virtual-desktop-pets/', '_blank')}>
                  🐾 Desktop Pets
                </button>
              </div>
            </div>, 400, 300)}
          onMouseEnter={() => sounds.playHover()}
        >
          <div className="icon material-icons-outlined">pets</div>
          <div className="label">companions</div>
        </div>
        <div 
          className="desktop-icon" 
          onClick={() => handleIconClick('RelocateMe Global', '🌍', 'RelocateMeIntegration', 500, 400)}
          onMouseEnter={() => sounds.playHover()}
        >
          <div className="icon material-icons-outlined">flight_takeoff</div>
          <div className="label">relocate</div>
        </div>
        <div 
          className="desktop-icon" 
          onClick={() => handleIconClick('Download Manager', '📥', 'ProfessionalDownloadManager', 600, 500)}
          onMouseEnter={() => sounds.playHover()}
        >
          <div className="icon material-icons-outlined">cloud_download</div>
          <div className="label">downloads</div>
        </div>
        <div 
          className="desktop-icon" 
          onClick={() => handleIconClick('Weather Station', '🌤️', 'ProfessionalWeatherWidget', 500, 450)}
          onMouseEnter={() => sounds.playHover()}
        >
          <div className="icon material-icons-outlined">wb_sunny</div>
          <div className="label">weather</div>
        </div>
        <div 
          className="desktop-icon" 
          onClick={() => handleIconClick('File Vault', '📁', 'VaultApp', 400, 300)}
          onMouseEnter={() => sounds.playHover()}
        >
          <div className="icon material-icons-outlined">folder_open</div>
          <div className="label">vault</div>
        </div>
        <div 
          className="desktop-icon" 
          onClick={() => handleIconClick('Neural Terminal', '⚫', 'QuantumTerminal', 350, 250)}
          onMouseEnter={() => sounds.playHover()}
        >
          <div className="icon material-icons-outlined">terminal</div>
          <div className="label">neural</div>
        </div>
        <div 
          className="desktop-icon" 
          onClick={() => handleIconClick('System Settings', '⚙️', 'ProfessionalSettings', 600, 500)}
          onMouseEnter={() => sounds.playHover()}
        >
          <div className="icon material-icons-outlined">tune</div>
          <div className="label">settings</div>
        </div>
        <div 
          className="desktop-icon" 
          onClick={() => handleIconClick('Calculator Pro', '🧮', 
            <div style={{padding: '20px', background: 'linear-gradient(135deg, #0D0D0D, #2D2D2D)', color: '#D4AF37'}}>
              <h3 style={{fontFamily: 'Playfair Display', marginBottom: '15px'}}>🧮 Noir Calculator</h3>
              <p style={{opacity: 0.8, fontSize: '0.9rem'}}>Sophisticated mathematical computations</p>
            </div>, 250, 300)}
          onMouseEnter={() => sounds.playHover()}
        >
          <div className="icon material-icons-outlined">calculate</div>
          <div className="label">calculator</div>
        </div>
        <div 
          className="desktop-icon" 
          onClick={() => handleIconClick('Text Atelier', '📝', 'NotepadApp', 400, 300)}
          onMouseEnter={() => sounds.playHover()}
        >
          <div className="icon material-icons-outlined">edit_note</div>
          <div className="label">atelier</div>
        </div>
      </div>

      {/* Windows */}
      {windows.map(window => (
        <Window
          key={window.id}
          window={window}
          onClose={() => closeWindow(window.id)}
          onMinimize={() => minimizeWindow(window.id)}
          onMaximize={() => maximizeWindow(window.id)}
          onBringToFront={() => bringToFront(window.id)}
          onMove={(newPosition) => {
            setWindows(windows.map(w => 
              w.id === window.id ? { ...w, position: newPosition } : w
            ));
          }}
          onResize={(newSize) => {
            setWindows(windows.map(w => 
              w.id === window.id ? { ...w, size: newSize } : w
            ));
          }}
        />
      ))}

      {/* Sophisticated Taskbar */}
      <div className="taskbar">
        <div className="start-menu-container">
          <button 
            className="start-button"
            onClick={() => {
              sounds.playHover();
              setShowStartMenu(!showStartMenu);
            }}
          >
            <span className="start-icon">🎭</span>
            <span className="start-text">ThriveOS</span>
          </button>
          
          {showStartMenu && (
            <div className="start-menu">
              <div className="start-menu-header">
                <div className="start-menu-title">ThriveRemoteOS V5.4</div>
                <div className="start-menu-subtitle">Professional Platform</div>
              </div>
              
              <div className="start-menu-section">
                <div className="section-title">🎭 AI Platform</div>
                <div className="menu-item" onClick={() => { 
                  handleIconClick('AI Career Portal', '🤖', 'WaitressJobPortal', 450, 325); 
                  setShowStartMenu(false); 
                }}>
                  <span className="menu-icon">🎭</span>AI Career Portal
                </div>
                <div className="menu-item" onClick={() => { 
                  handleIconClick('Weather Station', '🌤️', 'ProfessionalWeatherWidget', 500, 450); 
                  setShowStartMenu(false); 
                }}>
                  <span className="menu-icon">🌤️</span>Weather Station
                </div>
                <div className="menu-item" onClick={() => { 
                  handleIconClick('RelocateMe Global', '🌍', 'RelocateMeIntegration', 500, 400); 
                  setShowStartMenu(false); 
                }}>
                  <span className="menu-icon">🌍</span>RelocateMe Opportunities
                </div>
                <div className="menu-item" onClick={() => { 
                  handleIconClick('Download Manager', '📥', 'ProfessionalDownloadManager', 600, 500); 
                  setShowStartMenu(false); 
                }}>
                  <span className="menu-icon">📥</span>Download Manager
                </div>
              </div>
              
              <div className="start-menu-section">
                <div className="section-title">🎵 Entertainment</div>
                <div className="menu-item" onClick={() => window.open('/virtual-pets-tool/', '_blank')}>
                  <span className="menu-icon">🥚</span>Cosmic Pets Game
                </div>
                <div className="menu-item" onClick={() => window.open('/virtual-desktop-pets/', '_blank')}>
                  <span className="menu-icon">🐾</span>Desktop Pets
                </div>
                <div className="menu-item" onClick={() => { 
                  handleIconClick('Text Atelier', '📝', 'NotepadApp', 400, 300); 
                  setShowStartMenu(false); 
                }}>
                  <span className="menu-icon">📝</span>Text Atelier
                </div>
                <div className="menu-item" onClick={() => { 
                  handleIconClick('File Vault', '📁', 'VaultApp', 400, 300); 
                  setShowStartMenu(false); 
                }}>
                  <span className="menu-icon">📁</span>File Vault
                </div>
              </div>
              
              <div className="start-menu-section">
                <div className="section-title">🔧 System</div>
                <div className="menu-item" onClick={() => { 
                  handleIconClick('System Settings', '⚙️', 'ProfessionalSettings', 600, 500); 
                  setShowStartMenu(false); 
                }}>
                  <span className="menu-icon">⚙️</span>System Settings
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="taskbar-windows">
          {windows.map(window => (
            <div 
              key={window.id}
              className={`taskbar-window ${window.isMinimized ? 'minimized' : ''}`}
              onClick={() => minimizeWindow(window.id)}
            >
              <span className="taskbar-icon">{window.icon}</span>
              <span className="taskbar-title">{window.title}</span>
            </div>
          ))}
        </div>

        <div className="system-tray">
          <div className="tray-item">
            <span className="tray-icon">🔋</span>
            <span className="tray-text">98%</span>
          </div>
          <div className="tray-item">
            <span className="tray-icon">📶</span>
          </div>
          <div className="clock">
            <div className="time">{currentTime.toLocaleTimeString()}</div>
            <div className="date">{currentTime.toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Click outside to close start menu */}
      {showStartMenu && (
        <div className="start-menu-overlay" onClick={() => setShowStartMenu(false)}></div>
      )}
    </div>
  );
};

// Window Component with enhanced functionality
const Window = ({ window, onClose, onMinimize, onMaximize, onBringToFront, onMove, onResize }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = (e) => {
    if (e.target.classList.contains('window-title') || e.target.classList.contains('window-header')) {
      if (!window.isMaximized) {
        setIsDragging(true);
        setDragOffset({
          x: e.clientX - window.position.x,
          y: e.clientY - window.position.y
        });
        onBringToFront();
      }
    }
  };

  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    if (!window.isMaximized) {
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: window.size.width,
        height: window.size.height
      });
      onBringToFront();
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && !window.isMaximized) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep window within screen bounds
      const maxX = window.innerWidth - window.size.width;
      const maxY = window.innerHeight - window.size.height - 60; // Account for taskbar
      
      onMove({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    } else if (isResizing && !window.isMaximized) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = Math.max(300, resizeStart.width + deltaX);
      const newHeight = Math.max(200, resizeStart.height + deltaY);
      
      // Keep within screen bounds
      const maxWidth = window.innerWidth - window.position.x;
      const maxHeight = window.innerHeight - window.position.y - 60;
      
      onResize({
        width: Math.min(newWidth, maxWidth),
        height: Math.min(newHeight, maxHeight)
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleDoubleClick = (e) => {
    if (e.target.classList.contains('window-title') || e.target.classList.contains('window-header')) {
      onMaximize();
    }
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, resizeStart, window.isMaximized, window.size, window.position]);

  if (window.isMinimized) {
    return null;
  }

  return (
    <div
      className={`window ${window.isMaximized ? 'maximized' : ''}`}
      style={{
        left: window.position.x,
        top: window.position.y,
        width: window.size.width,
        height: window.size.height,
        zIndex: window.zIndex
      }}
      onClick={onBringToFront}
      data-window-id={window.id}
    >
      <div 
        className="window-header" 
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        <div className="window-title">
          <span className="window-icon">{window.icon}</span>
          {window.title}
        </div>
        <div className="window-controls">
          <button className="window-control minimize" onClick={(e) => { e.stopPropagation(); onMinimize(); }}>
            −
          </button>
          <button className="window-control maximize" onClick={(e) => { e.stopPropagation(); onMaximize(); }}>
            {window.isMaximized ? '❐' : '□'}
          </button>
          <button className="window-control close" onClick={(e) => { e.stopPropagation(); onClose(); }}>
            ×
          </button>
        </div>
      </div>
      <div className="window-content">
        <div className="window-content-inner">
          {window.content}
        </div>
      </div>
      {!window.isMaximized && (
        <div 
          className="window-resize-handle"
          onMouseDown={handleResizeMouseDown}
        />
      )}
    </div>
  );
};

// Desktop Environment Component
function DesktopEnvironment() {
  const [bootComplete, setBootComplete] = useState(false);

  const handleLoadingComplete = () => {
    // Apply saved theme settings
    const savedSettings = localStorage.getItem('thriveRemoteSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      // Apply theme immediately
      const root = document.documentElement;
      
      // Apply saved theme
      if (settings.theme) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('applyTheme', { 
            detail: { theme: settings.theme, settings } 
          }));
        }, 100);
      }
      
      // Apply other settings
      if (settings.fontSize) {
        document.body.classList.add(`font-${settings.fontSize}`);
      }
      
      if (settings.darkMode) {
        document.body.classList.add('dark-mode');
      }
      
      if (settings.highContrast) {
        document.body.classList.add('high-contrast');
      }
    }
    
    setBootComplete(true);
  };

  if (!bootComplete) {
    return <ProfessionalRealTimeLoader onComplete={handleLoadingComplete} />;
  }

  return <ThriveRemoteDesktop />;
}

function App() {
  return (
    <div className="App">
      <SoundProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DesktopEnvironment />} />
            <Route path="/waitress-job-portal" element={<WaitressJobPortal />} />
          </Routes>
        </BrowserRouter>
      </SoundProvider>
    </div>
  );
}

export default App;