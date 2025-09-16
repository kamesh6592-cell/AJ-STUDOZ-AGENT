const axios = require('axios');

class AIService {
  constructor() {
    this.providers = {
      claude: {
        endpoint: 'https://api.anthropic.com/v1/messages',
        headers: (apiKey) => ({
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        }),
        formatRequest: (messages, options = {}) => ({
          model: options.model || 'claude-3-sonnet-20240229',
          max_tokens: options.maxTokens || 8000,
          temperature: options.temperature || 0.7,
          system: options.systemPrompt || `You are a professional web developer AI assistant specializing in creating modern, responsive websites. You provide complete HTML, CSS, and JavaScript code with best practices, accessibility features, and modern design patterns.`,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
        parseResponse: (data) => ({
          content: data.content[0].text,
          usage: data.usage
        })
      },
      gemini: {
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent',
        headers: (apiKey) => ({
          'Content-Type': 'application/json'
        }),
        formatRequest: (messages, options = {}) => ({
          contents: messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          })),
          generationConfig: {
            temperature: options.temperature || 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: options.maxTokens || 8000
          },
          systemInstruction: {
            parts: [{ text: options.systemPrompt || `You are a professional web developer AI assistant specializing in creating modern, responsive websites.` }]
          }
        }),
        parseResponse: (data) => ({
          content: data.candidates[0].content.parts[0].text,
          usage: data.usageMetadata
        })
      },
      groq: {
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        headers: (apiKey) => ({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }),
        formatRequest: (messages, options = {}) => ({
          model: options.model || 'llama3-70b-8192',
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          max_tokens: options.maxTokens || 8000,
          temperature: options.temperature || 0.7
        }),
        parseResponse: (data) => ({
          content: data.choices[0].message.content,
          usage: data.usage
        })
      },
      zai: {
        endpoint: 'https://api.z.ai/v1/chat/completions',
        headers: (apiKey) => ({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }),
        formatRequest: (messages, options = {}) => ({
          model: options.model || 'zai-7b',
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          max_tokens: options.maxTokens || 8000,
          temperature: options.temperature || 0.7
        }),
        parseResponse: (data) => ({
          content: data.choices[0].message.content,
          usage: data.usage
        })
      }
    };
  }

  async callAI(provider, messages, apiKey, options = {}) {
    const config = this.providers[provider];
    if (!config) {
      throw new Error(`Unsupported AI provider: ${provider}`);
    }

    const url = provider === 'gemini' 
      ? `${config.endpoint}?key=${apiKey}` 
      : config.endpoint;

    const requestData = config.formatRequest(messages, options);
    
    try {
      const response = await axios.post(url, requestData, {
        headers: config.headers(apiKey),
        timeout: 60000 // 60 seconds timeout
      });

      return config.parseResponse(response.data);
    } catch (error) {
      console.error(`${provider} API Error:`, error.response?.data || error.message);
      throw new Error(`${provider} API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

module.exports = new AIService();
