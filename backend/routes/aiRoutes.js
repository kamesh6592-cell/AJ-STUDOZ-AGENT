const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { validateApiKey } = require('../middleware/auth');

// Chat endpoint
router.post('/chat', validateApiKey, aiController.chat);

// Generate website endpoint
router.post('/generate-website', validateApiKey, aiController.generateWebsite);

module.exports = router;
