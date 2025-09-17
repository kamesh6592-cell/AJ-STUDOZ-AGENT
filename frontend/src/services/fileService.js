import { apiService } from './apiService';

export const fileService = {
  uploadFile: async (file, onUploadProgress) => {
    return apiService.uploadFile(file, onUploadProgress);
  },
  
  deleteFile: async (filename) => {
    return apiService.deleteFile(filename);
  },
  
  getFileUrl: (filename) => {
    return `${process.env.REACT_APP_API_URL}/uploads/${filename}`;
  }
};
