import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { apiService } from '../services/apiService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedProvider, setSelectedProvider] = useLocalStorage('selectedProvider', 'claude');
  const [apiKeys, setApiKeys] = useLocalStorage('apiKeys', {
    claude: '',
    gemini: '',
    groq: '',
    zai: ''
  });
  const [apiStatus, setApiStatus] = useState({
    claude: false,
    gemini: false,
    groq: false,
    zai: false
  });
  const [generatedWebsite, setGeneratedWebsite] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Check API status on mount
  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    const newStatus = { ...apiStatus };
    
    for (const provider of Object.keys(apiKeys)) {
      if (apiKeys[provider]) {
        try {
          await apiService.testConnection(provider, apiKeys[provider]);
          newStatus[provider] = true;
        } catch (error) {
          newStatus[provider] = false;
        }
      } else {
        newStatus[provider] = false;
      }
    }
    
    setApiStatus(newStatus);
  };

  const sendMessage = async (content) => {
    if (!content.trim() || isGenerating || !apiStatus[selectedProvider]) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);

    try {
      const response = await apiService.chat(
        selectedProvider,
        [...messages, userMessage],
        apiKeys[selectedProvider]
      );
      
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response.content,
        provider: selectedProvider,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Check if response contains HTML
      if (response.content.includes('<html') || response.content.includes('<!DOCTYPE html')) {
        setGeneratedWebsite(response.content);
      }
      
      // Auto-create project if none exists
      if (!currentProject) {
        const newProject = {
          id: Date.now(),
          title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
          messages: [userMessage, assistantMessage],
          provider: selectedProvider,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setCurrentProject(newProject);
        setProjects(prev => [newProject, ...prev.slice(0, 9)]);
      } else {
        // Update existing project
        const updatedProject = {
          ...currentProject,
          messages: [...messages, userMessage, assistantMessage],
          updatedAt: new Date()
        };
        setCurrentProject(updatedProject);
        setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `❌ **Error**: ${error.message}\n\n**Troubleshooting:**\n- Check your API key is valid\n- Ensure you have sufficient API credits\n- Try switching to a different AI provider\n- Check your internet connection`,
        provider: selectedProvider,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateWebsite = async (prompt) => {
    if (!prompt.trim() || isGenerating || !apiStatus[selectedProvider]) return;

    setIsGenerating(true);
    
    try {
      const response = await apiService.generateWebsite(
        selectedProvider,
        prompt,
        apiKeys[selectedProvider]
      );
      
      setGeneratedWebsite(response.html);
      
      // Create project with the generated website
      const newProject = {
        id: Date.now(),
        title: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
        messages: [{
          id: Date.now(),
          type: 'user',
          content: prompt,
          timestamp: new Date()
        }, {
          id: Date.now() + 1,
          type: 'assistant',
          content: response.html,
          provider: selectedProvider,
          timestamp: new Date()
        }],
        provider: selectedProvider,
        htmlOutput: response.html,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setCurrentProject(newProject);
      setProjects(prev => [newProject, ...prev.slice(0, 9)]);
      
      return response.html;
    } catch (error) {
      console.error('Error generating website:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const value = {
    projects,
    setProjects,
    currentProject,
    setCurrentProject,
    messages,
    setMessages,
    selectedProvider,
    setSelectedProvider,
    apiKeys,
    setApiKeys,
    apiStatus,
    setApiStatus,
    generatedWebsite,
    setGeneratedWebsite,
    isGenerating,
    setIsGenerating,
    sendMessage,
    generateWebsite,
    checkApiStatus
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
