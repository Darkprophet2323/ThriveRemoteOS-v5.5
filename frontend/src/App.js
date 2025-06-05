import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Desktop Environment Component
const ThriveRemoteOS = () => {
  const [openWindows, setOpenWindows] = useState([]);
  const [systemPerformance, setSystemPerformance] = useState(null);
  const [weather, setWeather] = useState(null);
  const [news, setNews] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Desktop Applications Configuration
  const desktopApps = [
    {
      id: 'ai-portal',
      name: 'AI Portal',
      icon: '🤖',
      description: '120+ AI Tools',
      component: AIPortal
    },
    {
      id: 'relocateme',
      name: 'RelocateMe',
      icon: '🌍',
      description: 'Global Opportunities',
      component: RelocateMeApp
    },
    {
      id: 'download-manager',
      name: 'Downloads',
      icon: '📥',
      description: 'File Management',
      component: DownloadManager
    },
    {
      id: 'weather-station',
      name: 'Weather',
      icon: '🌤️',
      description: 'Live Weather',
      component: WeatherStation
    },
    {
      id: 'file-vault',
      name: 'File Vault',
      icon: '📁',
      description: 'File Explorer',
      component: FileVault
    },
    {
      id: 'text-editor',
      name: 'Text Editor',
      icon: '📝',
      description: 'Document Editor',
      component: TextEditor
    },
    {
      id: 'terminal',
      name: 'Terminal',
      icon: '⚫',
      description: 'Command Line',
      component: QuantumTerminal
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: '⚙️',
      description: 'System Config',
      component: ProfessionalSettings
    }
  ];

  // Load initial data
  useEffect(() => {
    const loadSystemData = async () => {
      try {
        const [perfResponse, weatherResponse, newsResponse] = await Promise.all([
          axios.get(`${API}/system/performance`),
          axios.get(`${API}/weather/enhanced`),
          axios.get(`${API}/news/live`)
        ]);

        setSystemPerformance(perfResponse.data);
        setWeather(weatherResponse.data);
        setNews(newsResponse.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading system data:', error);
        setIsLoading(false);
      }
    };

    loadSystemData();
    
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Update system data every 30 seconds
    const dataInterval = setInterval(loadSystemData, 30000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(dataInterval);
    };
  }, []);

  const openApp = (app) => {
    if (!openWindows.find(w => w.id === app.id)) {
      const newWindow = {
        ...app,
        x: Math.random() * 200 + 100,
        y: Math.random() * 100 + 100,
        width: 800,
        height: 600,
        isMinimized: false,
        zIndex: openWindows.length + 100
      };
      setOpenWindows([...openWindows, newWindow]);
    }
  };

  const closeWindow = (windowId) => {
    setOpenWindows(openWindows.filter(w => w.id !== windowId));
  };

  const minimizeWindow = (windowId) => {
    setOpenWindows(openWindows.map(w => 
      w.id === windowId ? { ...w, isMinimized: !w.isMinimized } : w
    ));
  };

  const bringToFront = (windowId) => {
    const maxZ = Math.max(...openWindows.map(w => w.zIndex), 100);
    setOpenWindows(openWindows.map(w => 
      w.id === windowId ? { ...w, zIndex: maxZ + 1 } : w
    ));
  };

  if (isLoading) {
    return <ProfessionalRealTimeLoader />;
  }

  return (
    <div className="thrive-remote-os">
      {/* Desktop Background */}
      <div className="desktop-background">
        {/* Desktop Icons */}
        <div className="desktop-icons">
          {desktopApps.map((app) => (
            <DesktopIcon
              key={app.id}
              app={app}
              onDoubleClick={() => openApp(app)}
            />
          ))}
        </div>

        {/* News Ticker */}
        <div className="news-ticker">
          <div className="ticker-content">
            <span className="system-metrics">
              CPU: {systemPerformance?.cpu_percent.toFixed(1)}% | 
              RAM: {systemPerformance?.memory_percent.toFixed(1)}% | 
              Uptime: {systemPerformance?.uptime} | 
              {weather?.location}: {weather?.temperature}°C
            </span>
            <span className="news-items">
              {news.map((item, index) => (
                <span key={index} className="news-item">
                  📰 {item.title} • 
                </span>
              ))}
            </span>
          </div>
        </div>

        {/* Taskbar */}
        <div className="taskbar">
          <div className="start-menu">
            <div className="start-button">
              <span className="start-logo">⚡</span>
              <span>ThriveOS</span>
            </div>
          </div>
          
          <div className="taskbar-apps">
            {openWindows.map((window) => (
              <div
                key={window.id}
                className={`taskbar-app ${window.isMinimized ? 'minimized' : ''}`}
                onClick={() => minimizeWindow(window.id)}
              >
                <span className="taskbar-icon">{window.icon}</span>
                <span className="taskbar-name">{window.name}</span>
              </div>
            ))}
          </div>

          <div className="system-tray">
            <div className="tray-item weather-tray">
              {weather?.temperature}°C
            </div>
            <div className="tray-item time-tray">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Windows */}
        {openWindows.map((window) => (
          <Window
            key={window.id}
            window={window}
            onClose={() => closeWindow(window.id)}
            onMinimize={() => minimizeWindow(window.id)}
            onFocus={() => bringToFront(window.id)}
          />
        ))}
      </div>
    </div>
  );
};

// Desktop Icon Component
const DesktopIcon = ({ app, onDoubleClick }) => {
  return (
    <div className="desktop-icon" onDoubleClick={onDoubleClick}>
      <div className="icon-image">
        <span className="icon-emoji">{app.icon}</span>
      </div>
      <div className="icon-label">
        <div className="icon-name">{app.name}</div>
        <div className="icon-description">{app.description}</div>
      </div>
    </div>
  );
};

// Professional Window Component
const Window = ({ window, onClose, onMinimize, onFocus }) => {
  const [position, setPosition] = useState({ x: window.x, y: window.y });
  const [size, setSize] = useState({ width: window.width, height: window.height });
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e) => {
    if (e.target.closest('.window-controls')) return;
    setIsDragging(true);
    onFocus();
    
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleMouseMove = (e) => {
      setPosition({
        x: e.clientX - startX,
        y: e.clientY - startY
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (window.isMinimized) return null;

  const Component = window.component;

  return (
    <div
      className={`window ${isDragging ? 'dragging' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: window.zIndex
      }}
      onClick={onFocus}
    >
      <div className="window-header" onMouseDown={handleMouseDown}>
        <div className="window-title">
          <span className="window-icon">{window.icon}</span>
          <span className="window-name">{window.name}</span>
        </div>
        <div className="window-controls">
          <button className="control-btn minimize" onClick={onMinimize}>
            <span>−</span>
          </button>
          <button className="control-btn maximize">
            <span>□</span>
          </button>
          <button className="control-btn close" onClick={onClose}>
            <span>×</span>
          </button>
        </div>
      </div>
      <div className="window-content">
        <Component />
      </div>
    </div>
  );
};

// Professional Real-Time Loader
const ProfessionalRealTimeLoader = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const loadingSteps = [
    "Initializing ThriveRemoteOS...",
    "Loading System Performance Monitor...",
    "Connecting to Weather Services...",
    "Fetching Live News Feeds...",
    "Initializing AI Portal...",
    "Loading RelocateMe Platform...",
    "Setting up Download Manager...",
    "Preparing Professional Desktop...",
    "Configuring Window Management...",
    "ThriveRemoteOS Ready!"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress <= 100) {
          setCurrentStep(Math.floor((newProgress - 1) / 10));
          return newProgress;
        }
        return prev;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="professional-loader">
      <div className="loader-content">
        <div className="loader-logo">
          <span className="logo-icon">⚡</span>
          <h1>ThriveRemoteOS</h1>
          <p>Professional Remote Work Platform v5.4</p>
        </div>
        
        <div className="loader-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text">{progress}%</div>
        </div>

        <div className="loader-status">
          <p>{loadingSteps[currentStep]}</p>
        </div>

        <div className="loader-metrics">
          <div className="metric">
            <span>System Status:</span>
            <span className="status-good">Optimal</span>
          </div>
          <div className="metric">
            <span>Network:</span>
            <span className="status-good">Connected</span>
          </div>
          <div className="metric">
            <span>Services:</span>
            <span className="status-good">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// AI Portal Component
const AIPortal = () => {
  const [aiTools, setAiTools] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchAITools = async () => {
      try {
        const response = await axios.get(`${API}/ai/tools`);
        setAiTools(response.data.tools);
      } catch (error) {
        console.error('Error fetching AI tools:', error);
      }
    };
    fetchAITools();
  }, []);

  const categories = ['All', 'Writing', 'Design', 'Development', 'Marketing', 'Analytics'];

  return (
    <div className="ai-portal">
      <div className="portal-header">
        <h2>AI Portal - 120+ Professional Tools</h2>
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <div className="tools-grid">
        {aiTools.map((tool, index) => (
          <div key={index} className="tool-card">
            <div className="tool-header">
              <h3>{tool.name}</h3>
              <span className="tool-category">{tool.category}</span>
            </div>
            <p className="tool-description">{tool.description}</p>
            <button 
              className="tool-launch"
              onClick={() => window.open(tool.url, '_blank')}
            >
              Launch Tool
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// RelocateMe Component
const RelocateMeApp = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [oppResponse, countriesResponse] = await Promise.all([
          axios.get(`${API}/relocateme/opportunities`),
          axios.get(`${API}/relocateme/countries`)
        ]);
        setOpportunities(oppResponse.data);
        setCountries(countriesResponse.data.countries);
      } catch (error) {
        console.error('Error fetching relocation data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="relocateme-app">
      <div className="app-header">
        <h2>🌍 RelocateMe - Global Opportunities</h2>
        <p>Find your perfect international career move with visa support</p>
      </div>

      <div className="opportunities-section">
        <h3>Featured Opportunities</h3>
        <div className="opportunities-grid">
          {opportunities.map((opp) => (
            <div key={opp.id} className="opportunity-card">
              <div className="opp-header">
                <h4>{opp.job_title}</h4>
                <div className="location">{opp.city}, {opp.country}</div>
              </div>
              <div className="opp-details">
                <p><strong>Company:</strong> {opp.company}</p>
                <p><strong>Salary:</strong> {opp.salary_range}</p>
                <p><strong>Visa:</strong> {opp.visa_type}</p>
              </div>
              <div className="benefits">
                {opp.benefits.map((benefit, index) => (
                  <span key={index} className="benefit-tag">{benefit}</span>
                ))}
              </div>
              <button 
                className="apply-btn"
                onClick={() => window.open(opp.application_url, '_blank')}
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="countries-section">
        <h3>Available Countries</h3>
        <div className="countries-grid">
          {countries.map((country, index) => (
            <div key={index} className="country-card">
              <h4>{country.name}</h4>
              <p><strong>Visa Type:</strong> {country.visa_type}</p>
              <p><strong>Processing:</strong> {country.processing_time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Download Manager Component
const DownloadManager = () => {
  const [downloads, setDownloads] = useState([]);
  const [newDownload, setNewDownload] = useState({ filename: '', url: '' });

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    try {
      const response = await axios.get(`${API}/downloads`);
      setDownloads(response.data);
    } catch (error) {
      console.error('Error fetching downloads:', error);
    }
  };

  const startDownload = async () => {
    try {
      await axios.post(`${API}/downloads/start`, newDownload);
      setNewDownload({ filename: '', url: '' });
      fetchDownloads();
    } catch (error) {
      console.error('Error starting download:', error);
    }
  };

  return (
    <div className="download-manager">
      <div className="manager-header">
        <h2>📥 Professional Download Manager</h2>
      </div>

      <div className="new-download">
        <h3>Start New Download</h3>
        <div className="download-form">
          <input
            type="text"
            placeholder="Filename"
            value={newDownload.filename}
            onChange={(e) => setNewDownload({...newDownload, filename: e.target.value})}
          />
          <input
            type="url"
            placeholder="Download URL"
            value={newDownload.url}
            onChange={(e) => setNewDownload({...newDownload, url: e.target.value})}
          />
          <button onClick={startDownload}>Start Download</button>
        </div>
      </div>

      <div className="downloads-list">
        <h3>Active Downloads</h3>
        {downloads.map((download) => (
          <div key={download.id} className="download-item">
            <div className="download-info">
              <h4>{download.filename}</h4>
              <p>Status: {download.status}</p>
            </div>
            <div className="download-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${download.progress}%` }}
                ></div>
              </div>
              <span>{download.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Weather Station Component
const WeatherStation = () => {
  const [weather, setWeather] = useState(null);
  const [selectedCity, setSelectedCity] = useState('London');
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetchWeather();
    fetchCities();
  }, [selectedCity]);

  const fetchWeather = async () => {
    try {
      const response = await axios.get(`${API}/weather/enhanced?city=${selectedCity}`);
      setWeather(response.data);
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await axios.get(`${API}/weather/cities`);
      setCities(response.data.cities);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  if (!weather) return <div>Loading weather...</div>;

  return (
    <div className="weather-station">
      <div className="weather-header">
        <h2>🌤️ Professional Weather Station</h2>
        <select 
          value={selectedCity} 
          onChange={(e) => setSelectedCity(e.target.value)}
          className="city-selector"
        >
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <div className="current-weather">
        <div className="main-weather">
          <div className="temperature">{weather.temperature}°C</div>
          <div className="description">{weather.description}</div>
          <div className="location">{weather.location}</div>
        </div>
        
        <div className="weather-details">
          <div className="detail-item">
            <span>Humidity:</span>
            <span>{weather.humidity}%</span>
          </div>
          <div className="detail-item">
            <span>Wind:</span>
            <span>{weather.wind_speed} km/h</span>
          </div>
          <div className="detail-item">
            <span>Air Quality:</span>
            <span>{weather.air_quality}</span>
          </div>
        </div>
      </div>

      <div className="weather-forecast">
        <h3>3-Day Forecast</h3>
        <div className="forecast-grid">
          {weather.forecast.map((day, index) => (
            <div key={index} className="forecast-day">
              <div className="day-name">{day.day}</div>
              <div className="day-temp">{day.temp}°C</div>
              <div className="day-condition">{day.condition}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// File Vault Component
const FileVault = () => {
  return (
    <div className="file-vault">
      <div className="vault-header">
        <h2>📁 Professional File Vault</h2>
      </div>
      <div className="file-browser">
        <div className="sidebar">
          <div className="folder-item">📁 Documents</div>
          <div className="folder-item">📁 Downloads</div>
          <div className="folder-item">📁 Projects</div>
          <div className="folder-item">📁 Media</div>
        </div>
        <div className="file-grid">
          <div className="file-item">📄 Resume.pdf</div>
          <div className="file-item">📄 Project-Plan.docx</div>
          <div className="file-item">🖼️ Screenshot.png</div>
          <div className="file-item">📊 Data-Analysis.xlsx</div>
        </div>
      </div>
    </div>
  );
};

// Text Editor Component
const TextEditor = () => {
  const [content, setContent] = useState('');

  return (
    <div className="text-editor">
      <div className="editor-header">
        <h2>📝 Professional Text Editor</h2>
        <div className="editor-controls">
          <button>New</button>
          <button>Open</button>
          <button>Save</button>
        </div>
      </div>
      <textarea
        className="editor-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing your document..."
      />
    </div>
  );
};

// Quantum Terminal Component
const QuantumTerminal = () => {
  const [commands, setCommands] = useState([]);
  const [currentCommand, setCurrentCommand] = useState('');

  const executeCommand = (cmd) => {
    const newCommand = { command: cmd, output: `Executed: ${cmd}` };
    setCommands([...commands, newCommand]);
    setCurrentCommand('');
  };

  return (
    <div className="quantum-terminal">
      <div className="terminal-header">
        <h2>⚫ Quantum Terminal</h2>
      </div>
      <div className="terminal-content">
        <div className="terminal-output">
          {commands.map((cmd, index) => (
            <div key={index} className="command-line">
              <div className="command">$ {cmd.command}</div>
              <div className="output">{cmd.output}</div>
            </div>
          ))}
        </div>
        <div className="terminal-input">
          <span>$ </span>
          <input
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && executeCommand(currentCommand)}
            placeholder="Enter command..."
          />
        </div>
      </div>
    </div>
  );
};

// Professional Settings Component
const ProfessionalSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [theme, setTheme] = useState('dark');

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'display', name: 'Display', icon: '🖥️' },
    { id: 'network', name: 'Network', icon: '🌐' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'advanced', name: 'Advanced', icon: '🔧' }
  ];

  const themes = [
    { id: 'dark', name: 'Professional Dark', preview: '#1a1a1a' },
    { id: 'light', name: 'Executive Light', preview: '#ffffff' },
    { id: 'blue', name: 'Corporate Blue', preview: '#1e3a8a' },
    { id: 'purple', name: 'Authority Purple', preview: '#581c87' },
    { id: 'green', name: 'Success Green', preview: '#065f46' }
  ];

  return (
    <div className="professional-settings">
      <div className="settings-header">
        <h2>⚙️ Professional Settings</h2>
      </div>
      
      <div className="settings-content">
        <div className="settings-sidebar">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-name">{tab.name}</span>
            </div>
          ))}
        </div>

        <div className="settings-panel">
          {activeTab === 'display' && (
            <div className="theme-settings">
              <h3>Theme Selection</h3>
              <div className="themes-grid">
                {themes.map(themeOption => (
                  <div
                    key={themeOption.id}
                    className={`theme-card ${theme === themeOption.id ? 'selected' : ''}`}
                    onClick={() => setTheme(themeOption.id)}
                  >
                    <div 
                      className="theme-preview"
                      style={{ backgroundColor: themeOption.preview }}
                    ></div>
                    <div className="theme-name">{themeOption.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'general' && (
            <div className="general-settings">
              <h3>General Preferences</h3>
              <div className="setting-item">
                <label>Auto-start applications</label>
                <input type="checkbox" />
              </div>
              <div className="setting-item">
                <label>Enable notifications</label>
                <input type="checkbox" defaultChecked />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <ThriveRemoteOS />
    </div>
  );
}

export default App;