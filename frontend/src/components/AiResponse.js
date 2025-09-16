import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, RotateCcw } from 'lucide-react';
import Button from './common/Button';

const AiResponse = ({ content, provider, isError }) => {
  const [copied, setCopied] = useState(false);
  
  // Check if content contains HTML code
  const containsHtml = content.includes('<html') || content.includes('<!DOCTYPE html') || 
                     content.includes('<div') || content.includes('<style') || 
                     content.includes('<script');
  
  // Check if content contains code blocks
  const containsCode = content.includes('```') || content.includes('<code>');
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format content with syntax highlighting for code blocks
  const formatContent = () => {
    if (!containsCode) {
      return <div className="whitespace-pre-wrap break-words">{content}</div>;
    }
    
    // Simple code block detection and formatting
    const parts = content.split(/```([\s\S]*?)```/);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a code block
        const lines = part.split('\n');
        const language = lines[0].trim();
        const code = lines.slice(1).join('\n');
        
        return (
          <div key={index} className="my-3">
            <div className="flex items-center justify-between bg-gray-800 text-gray-200 px-4 py-2 rounded-t-lg text-sm">
              <span>{language || 'code'}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(code)}
                className="text-gray-400 hover:text-white"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <SyntaxHighlighter
              language={language || 'javascript'}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                borderRadius: '0 0 0.5rem 0.5rem',
                fontSize: '0.875rem'
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        );
      } else {
        // This is regular text
        return (
          <div key={index} className="whitespace-pre-wrap break-words">
            {part}
          </div>
        );
      }
    });
  };

  return (
    <div className={`ai-response ${isError ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`provider-badge provider-badge-${provider}`}>
            {provider === 'claude' ? 'Claude' : 
             provider === 'gemini' ? 'Gemini' : 
             provider === 'groq' ? 'Groq' : 'Z.ai'}
          </span>
          {containsHtml && (
            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
              HTML
            </span>
          )}
        </div>
        
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {copied ? 'Copied!' : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {formatContent()}
      </div>
    </div>
  );
};

export default AiResponse;
