import React from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import Button from './common/Button';
import { 
  Rocket, 
  ShoppingCart, 
  Palette, 
  Building, 
  BarChart3, 
  Sparkles,
  Zap,
  Grid,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const WelcomeScreen = ({ onStartChat }) => {
  const { selectedProvider, apiStatus, generateWebsite } = useApp();
  const { darkMode } = useTheme();
  
  const capabilities = [
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "SaaS Landing Pages",
      description: "High-converting landing pages with modern design",
      prompt: "Create a cutting-edge SaaS landing page with animated hero section, feature showcase, pricing tiers with hover effects, customer testimonials, and compelling call-to-action buttons. Include smooth scrolling navigation and mobile-responsive design.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <ShoppingCart className="w-6 h-6" />,
      title: "E-commerce Stores",
      description: "Complete online stores with advanced functionality",
      prompt: "Build a modern e-commerce website with product grid, detailed product pages, shopping cart with animations, user reviews, search and filter functionality, and checkout process. Include responsive design and product image galleries.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Creative Portfolios",
      description: "Stunning portfolios with interactive galleries",
      prompt: "Design a creative portfolio website with masonry image gallery, project case studies, smooth animations, about section with timeline, skills showcase, and contact form. Include dark/light mode toggle and artistic transitions.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Building className="w-6 h-6" />,
      title: "Corporate Websites",
      description: "Professional business sites with CMS features",
      prompt: "Create a professional corporate website with executive team profiles, services showcase, company history timeline, blog section with categories, career pages, and multi-level navigation. Include SEO optimization and contact forms.",
      color: "from-gray-600 to-gray-800"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics Dashboards",
      description: "Interactive dashboards with real-time data",
      prompt: "Build an advanced analytics dashboard with interactive charts, data visualization, real-time metrics, customizable widgets, data tables with sorting and filtering, and responsive sidebar navigation. Include dark theme.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Interactive Apps",
      description: "Dynamic web applications with advanced features",
      prompt: "Generate an interactive web application with user authentication UI, dynamic content management, advanced animations, form handling with validation, modal dialogs, and responsive components. Include loading states and error handling.",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const quickActions = [
    { 
      icon: <Zap className="w-4 h-4" />, 
      text: "Quick Start", 
      prompt: "Create a modern, responsive website with hero section, features grid, and call-to-action. Use gradient backgrounds and smooth animations.",
      color: "bg-yellow-500 hover:bg-yellow-600"
    },
    { 
      icon: <Grid className="w-4 h-4" />, 
      text: "Templates", 
      prompt: "Show me 5 different professional website templates with modern design patterns, each for different industries (tech, creative, business, healthcare, education).",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    { 
      icon: <TrendingUp className="w-4 h-4" />, 
      text: "Optimize", 
      prompt: "Help me create a high-performance website with advanced SEO, accessibility features, and performance optimizations. Include lazy loading and modern web standards.",
      color: "bg-green-500 hover:bg-green-600"
    }
  ];

  const handleCapabilityClick = async (prompt) => {
    if (!apiStatus[selectedProvider]) {
      alert('Please configure your API key first');
      return;
    }
    
    try {
      await generateWebsite(prompt);
      onStartChat();
    } catch (error) {
      console.error('Error generating website:', error);
      alert('Failed to generate website. Please check your API key and try again.');
    }
  };

  const handleQuickActionClick = (prompt) => {
    if (!apiStatus[selectedProvider]) {
      alert('Please configure your API key first');
      return;
    }
    
    onStartChat();
    // Set the prompt in the chat input
    setTimeout(() => {
      const input = document.getElementById('message-input');
      if (input) {
        input.value = prompt;
        input.focus();
      }
    }, 100);
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-16">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
          AJ PERSONAL AGENT
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Professional web development powered by advanced AI. Create stunning websites, landing pages, and applications with natural language.
        </p>
      </div>

      {/* Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {capabilities.map((capability, index) => (
          <div
            key={index}
            onClick={() => handleCapabilityClick(capability.prompt)}
            className="capability-card cursor-pointer group relative overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${capability.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
            
            <div className={`w-14 h-14 bg-gradient-to-br ${capability.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
              {capability.icon}
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 dark:group-hover:from-white dark:group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
              {capability.title}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
              {capability.description}
            </p>

            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Sparkles className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="text-center mb-16">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Start Options</h3>
        <div className="flex justify-center gap-4 flex-wrap">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="primary"
              className={`${action.color} text-white`}
              onClick={() => handleQuickActionClick(action.prompt)}
            >
              {action.icon}
              {action.text}
            </Button>
          ))}
        </div>
      </div>

      {/* API Configuration Prompt */}
      {!apiStatus[selectedProvider] && (
        <div className="mt-16 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-500/30 rounded-2xl text-center">
          <AlertCircle className="w-8 h-8 text-yellow-500 dark:text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">API Configuration Required</h3>
          <p className="text-yellow-700 dark:text-yellow-200/80 mb-4">
            Configure your {selectedProvider === 'claude' ? 'Claude' : 
              selectedProvider === 'gemini' ? 'Gemini' : 
              selectedProvider === 'groq' ? 'Groq' : 'Z.ai'} API key to start creating websites
          </p>
          <Button
            variant="primary"
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
            onClick={() => {
              const settingsBtn = document.getElementById('settings-button');
              if (settingsBtn) settingsBtn.click();
            }}
          >
            Configure API Keys
          </Button>
        </div>
      )}
    </div>
  );
};

export default WelcomeScreen;
