import React from 'react';
import Modal from '../common/Modal';
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
    <Modal isOpen={isOpen} onClose={onClose} title="Website Preview" className="max-w-6xl h-[90vh]">
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
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
        <Button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>
    </Modal>
  );
};

export default PreviewModal;
