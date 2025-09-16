import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import ChatInterface from './components/ChatInterface';
import WelcomeScreen from './components/WelcomeScreen';
import ApiModal from './components/modals/ApiModal';
import PreviewModal from './components/modals/PreviewModal';
import SettingsModal from './components/modals/SettingsModal';
import useLocalStorage from './hooks/useLocalStorage';

function App() {
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [currentView, setCurrentView] = useState('welcome'); // 'welcome' or 'chat'

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <ThemeProvider value={{ darkMode, setDarkMode }}>
      <AppProvider>
        <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''}`}>
          <Header 
            onSettingsClick={() => setShowSettingsModal(true)}
            onApiClick={() => setShowApiModal(true)}
          />
          
          <div className="flex flex-1 overflow-hidden">
            <Sidebar 
              onNewProject={() => {
                setCurrentView('welcome');
              }}
            />
            
            <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
              {currentView === 'welcome' ? (
                <WelcomeScreen onStartChat={() => setCurrentView('chat')} />
              ) : (
                <ChatInterface 
                  onPreview={() => setShowPreviewModal(true)}
                />
              )}
            </main>
          </div>
          
          <ApiModal 
            isOpen={showApiModal} 
            onClose={() => setShowApiModal(false)} 
          />
          
          <PreviewModal 
            isOpen={showPreviewModal} 
            onClose={() => setShowPreviewModal(false)} 
          />
          
          <SettingsModal 
            isOpen={showSettingsModal} 
            onClose={() => setShowSettingsModal(false)} 
          />
        </div>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
