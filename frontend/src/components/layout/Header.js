import React from 'react';
import Button from '../common/Button';
import { Settings, Bot } from 'lucide-react';

const Header = ({ onSettingsClick, onApiClick }) => {
  return (
    <header className="glass border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900 dark:text-white">AJ PERSONAL AGENT</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">AI Website Studio</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onApiClick}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
