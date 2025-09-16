const AIService = require('../services/aiService');
const { validateApiKey } = require('../utils/validators');

exports.chat = async (req, res) => {
  try {
    const { messages, provider, options = {} } = req.body;
    
    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (!provider) {
      return res.status(400).json({ error: 'Provider is required' });
    }

    // Get API key from environment or request
    const apiKey = req.body.apiKey || process.env[`${provider.toUpperCase()}_API_KEY`];
    
    if (!apiKey) {
      return res.status(400).json({ error: `API key for ${provider} is required` });
    }

    // Validate API key format
    if (!validateApiKey(provider, apiKey)) {
      return res.status(400).json({ error: `Invalid API key format for ${provider}` });
    }

    // Call AI service
    const result = await AIService.callAI(provider, messages, apiKey, options);
    
    res.json({
      success: true,
      provider,
      content: result.content,
      usage: result.usage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ 
      error: error.message,
      provider: req.body.provider 
    });
  }
};

exports.generateWebsite = async (req, res) => {
  try {
    const { prompt, provider, options = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!provider) {
      return res.status(400).json({ error: 'Provider is required' });
    }

    // Get API key
    const apiKey = req.body.apiKey || process.env[`${provider.toUpperCase()}_API_KEY`];
    
    if (!apiKey) {
      return res.status(400).json({ error: `API key for ${provider} is required` });
    }

    // Validate API key format
    if (!validateApiKey(provider, apiKey)) {
      return res.status(400).json({ error: `Invalid API key format for ${provider}` });
    }

    // System prompt for website generation
    const systemPrompt = `You are an expert web developer. Create a complete, production-ready website based on the user's requirements. 

    Requirements:
    - Generate complete HTML, CSS, and JavaScript code
    - Use modern web standards and best practices
    - Include responsive design for all devices
    - Add smooth animations and interactions
    - Ensure accessibility compliance
    - Include SEO optimization
    - Use semantic HTML structure
    - Implement modern CSS with Flexbox/Grid
    - Add interactive JavaScript functionality
    - Include proper error handling
    - Use professional color schemes and typography
    - Add loading states and smooth transitions

    Format your response as a complete HTML document with embedded CSS and JavaScript.
    Make it visually appealing and fully functional.`;

    const messages = [{
      role: 'user',
      content: `Create a website: ${prompt}`
    }];

    // Call AI service
    const result = await AIService.callAI(provider, messages, apiKey, {
      ...options,
      systemPrompt
    });
    
    res.json({
      success: true,
      provider,
      html: result.content,
      usage: result.usage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Generate Website Error:', error);
    res.status(500).json({ 
      error: error.message,
      provider: req.body.provider 
    });
  }
};
