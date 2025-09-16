import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import AiResponse from './AiResponse';
import FileUpload from './FileUpload';
import Button from './common/Button';
import { Send, Paperclip, Mic, Download, Eye, Trash2 } from 'lucide-react';

const ChatInterface = ({ onPreview }) => {
  const { 
    messages, 
    sendMessage, 
    isGenerating, 
    selectedProvider, 
    apiStatus,
    generatedWebsite,
    setMessages,
    setGeneratedWebsite
  } = useApp();
  
  const { darkMode } = useTheme();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputText]);

  const handleSend = () => {
    if (!inputText.trim() || isGenerating || !apiStatus[selectedProvider]) return;
    sendMessage(inputText);
    setInputText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setGeneratedWebsite(null);
  };

  const handleDownload = () => {
    if (!generatedWebsite) return;
    
    const blob = new Blob([generatedWebsite], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `website-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {selectedProvider === 'claude' ? 'Claude' : 
             selectedProvider === 'gemini' ? 'Gemini' : 
             selectedProvider === 'groq' ? 'Groq' : 'Z.ai'}
          </span>
          <span className={`w-2 h-2 rounded-full ${apiStatus[selectedProvider] ? 'bg-green-500' : 'bg-red-500'}`}></span>
        </div>
        
        <div className="flex gap-2">
          {generatedWebsite && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onPreview}
                className="flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </Button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Describe the website you want to create
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">
                    {message.type === 'user' ? 'You' : 
                     message.provider === 'claude' ? 'Claude' : 
                     message.provider === 'gemini' ? 'Gemini' : 
                     message.provider === 'groq' ? 'Groq' : 'Z.ai'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                {message.type === 'assistant' ? (
                  <AiResponse 
                    content={message.content} 
                    provider={message.provider}
                    isError={message.isError}
                  />
                ) : (
                  <div className="message-bubble user-message">
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {isGenerating && (
          <div className="flex justify-start">
            <div className="max-w-[80%]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">
                  {selectedProvider === 'claude' ? 'Claude' : 
                   selectedProvider === 'gemini' ? 'Gemini' : 
                   selectedProvider === 'groq' ? 'Groq' : 'Z.ai'}
                </span>
              </div>
              <div className="message-bubble ai-message">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-end gap-3">
          <FileUpload />
          
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              id="message-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe the website you want to create..."
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none min-h-[56px] max-h-[200px]"
              rows={1}
              disabled={isGenerating || !apiStatus[selectedProvider]}
            />
          </div>
          
          <Button
            onClick={handleSend}
            disabled={!inputText.trim() || isGenerating || !apiStatus[selectedProvider]}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        
        {!apiStatus[selectedProvider] && (
          <div className="text-center mt-2 text-sm text-yellow-600 dark:text-yellow-400">
            Configure your API key to start creating
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
