const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { validateApiKey } = require('../middleware/auth');

// File upload endpoint
router.post('/upload', validateApiKey, fileController.upload, fileController.uploadFile);

// File deletion endpoint
router.delete('/:filename', validateApiKey, fileController.deleteFile);

// Serve uploaded files
router.use('/uploads', express.static('uploads'));

module.exports = router;
