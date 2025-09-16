import React from 'react';
import Button from '../common/Button';
import { Download, X } from 'lucide-react';

const PreviewModal = ({ isOpen, onClose, htmlContent }) => {
  const handleDownload = () => {
    if (!htmlContent) return;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `website-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Website Preview</h3>
          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto bg-gray-100">
          {htmlContent ? (
            <iframe
              srcDoc={htmlContent}
              className="w-full h-full border-none"
              title="Website Preview"
              sandbox="allow-same-origin allow-scripts allow-forms"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No website to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
