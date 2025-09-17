import React from 'react';
import Button from '../common/Button';
import { Plus, Folder, Bot, Settings } from 'lucide-react';

const Sidebar = ({ onNewProject }) => {
  return (
    <div className="w-64 glass border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Button
          onClick={onNewProject}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-6">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Projects</h3>
          <div className="space-y-1">
            {/* Projects will be dynamically added here */}
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">AI Providers</h3>
          <div className="space-y-1">
            {/* Providers will be dynamically added here */}
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
