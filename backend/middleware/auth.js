const jwt = require('jsonwebtoken');
const { validateApiKey } = require('../utils/validators');

// API key validation middleware
const validateApiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key is required' });
  }

  // For now, we'll just validate the format
  // In a production app, you would verify against a database
  const provider = req.body.provider || req.query.provider;
  
  if (provider && !validateApiKey(provider, apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  req.apiKey = apiKey;
  next();
};

// JWT authentication middleware (for future user accounts)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token is required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
};

module.exports = {
  validateApiKey: validateApiKeyMiddleware,
  authenticateToken
};
