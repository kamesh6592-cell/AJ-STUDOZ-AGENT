import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import Button from './common/Button';

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  const onDrop = async (acceptedFiles) => {
    setUploading(true);
    
    try {
      const newFiles = [...files];
      
      for (const file of acceptedFiles) {
        // In a real app, you would upload the file to your backend
        // For now, we'll just store it in state
        newFiles.push({
          id: Date.now() + Math.random(),
          file,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
          name: file.name,
          size: file.size,
          type: file.type
        });
      }
      
      setFiles(newFiles);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };
  
  const removeFile = (id) => {
    setFiles(files.filter(file => file.id !== id));
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'text/*': ['.txt', '.html', '.css', '.js'],
      'application/json': ['.json'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });
  
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Paperclip className="w-5 h-5" />
      </Button>
      
      {files.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Attached Files</h3>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {files.map((file) => (
              <div key={file.id} className="flex items-center gap-2 p-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                {file.preview ? (
                  <img 
                    src={file.preview} 
                    alt={file.name} 
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                    <File className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <div
            {...getRootProps()}
            className={`p-3 text-center cursor-pointer border-t border-gray-200 dark:border-gray-700 ${
              isDragActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
          >
            <input {...getInputProps()} />
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {isDragActive ? 'Drop files here' : 'Add more files'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
