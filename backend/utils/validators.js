// Validate API key format for different providers
const validateApiKey = (provider, apiKey) => {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  // Basic validation - in production, you would verify against the provider
  switch (provider) {
    case 'claude':
      return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
    case 'gemini':
      return apiKey.length > 20; // Gemini keys are alphanumeric strings
    case 'groq':
      return apiKey.startsWith('gsk_') && apiKey.length > 20;
    case 'zai':
      return apiKey.startsWith('zai-') && apiKey.length > 20;
    default:
      return false;
  }
};

// Validate project input
const validateProject = (data) => {
  const schema = {
    title: (value) => typeof value === 'string' && value.trim().length > 0 && value.length <= 100,
    description: (value) => typeof value === 'string' && value.length <= 500,
    provider: (value) => ['claude', 'gemini', 'groq', 'zai'].includes(value),
    messages: (value) => Array.isArray(value) && value.every(msg => 
      typeof msg === 'object' && 
      ['user', 'assistant'].includes(msg.type) &&
      typeof msg.content === 'string'
    )
  };

  const errors = {};
  
  for (const [key, validator] of Object.entries(schema)) {
    if (data[key] !== undefined && !validator(data[key])) {
      errors[key] = `Invalid ${key}`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

module.exports = {
  validateApiKey,
  validateProject
};
