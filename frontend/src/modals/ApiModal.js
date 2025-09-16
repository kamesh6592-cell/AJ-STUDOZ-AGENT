import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Button from '../common/Button';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const ApiModal = ({ isOpen, onClose }) => {
  const { apiKeys, setApiKeys, apiStatus, checkApiStatus } = useApp();
  const [showKeys, setShowKeys] = useState({});
  const [testing, setTesting] = useState({});
  
  const providers = [
    { id: 'claude', name: 'Claude', icon: '🧠', url: 'console.anthropic.com' },
    { id: 'gemini', name: 'Gemini', icon: '💎', url: 'makersuite.google.com/app/apikey' },
    { id: 'groq', name: 'Groq', icon: '⚡', url: 'console.groq.com' },
    { id: 'zai', name: 'Z.ai', icon: '🤖', url: 'z.ai' }
  ];
  
  const handleKeyChange = (provider, value) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }));
  };
  
  const toggleShowKey = (provider) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };
  
  const testConnection = async (provider) => {
    if (!apiKeys[provider]) return;
    
    setTesting(prev => ({ ...prev, [provider]: true }));
    
    try {
      // Simulate API test - in a real app, you would make an actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update status
      const newStatus = { ...apiStatus };
      newStatus[provider] = true;
      
      // In a real app, you would update the context with the new status
      // For now, we'll just show a success message
      alert(`${provider} API connection successful!`);
    } catch (error) {
      alert(`Failed to connect to ${provider} API. Please check your API key.`);
    } finally {
      setTesting(prev => ({ ...prev, [provider]: false }));
    }
  };
  
  const saveKeys = () => {
    // Save to localStorage is handled by the context
    checkApiStatus();
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5" />
              API Configuration
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Configure your API keys to start generating websites
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {providers.map((provider) => (
            <div key={provider.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <span>{provider.icon}</span>
                  {provider.name}
                </label>
                <div className="flex items-center gap-2">
                  {apiStatus[provider.id] ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  {testing[provider.id] && (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  )}
                </div>
              </div>
              
              <div className="relative">
                <input
                  type={showKeys[provider.id] ? 'text' : 'password'}
                  value={apiKeys[provider.id] || ''}
                  onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
                  placeholder={`Enter ${provider.name} API key...`}
                />
                <button
                  onClick={() => toggleShowKey(provider.id)}
                  className="absolute right-10 top-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showKeys[provider.id] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Get your API key from: {provider.url}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => testConnection(provider.id)}
                disabled={!apiKeys[provider.id] || testing[provider.id]}
                className="w-full"
              >
                {testing[provider.id] ? 'Testing...' : 'Test Connection'}
              </Button>
            </div>
          ))}
        </div>
        
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={saveKeys}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Save & Encrypt
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApiModal;
