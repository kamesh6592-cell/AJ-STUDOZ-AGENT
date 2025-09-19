// api/chat.js
export default async function handler(req, res) {
  const { messages, provider, options } = req.body;
  
  try {
    let response;
    
    switch (provider) {
      case 'groq':
        response = await callGroqAPI(messages, options);
        break;
      case 'gemini':
        response = await callGeminiAPI(messages, options);
        break;
      case 'claude':
        response = await callClaudeAPI(messages, options);
        break;
      case 'xai':
        response = await callXaiAPI(messages, options);
        break;
      default:
        throw new Error('Unsupported provider');
    }
    
    // Set up streaming if needed
    if (options?.streaming) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Stream the response
      const stream = new ReadableStream({
        start(controller) {
          // Send chunks of the response
          const chunks = response.content.match(/.{1,5}/g) || [];
          
          const sendChunk = (index) => {
            if (index < chunks.length) {
              controller.enqueue(`data: ${JSON.stringify({ content: chunks[index] })}\n\n`);
              setTimeout(() => sendChunk(index + 1), 1000 / 30); // 30 characters per second
            } else {
              controller.enqueue('data: [DONE]\n\n');
              controller.close();
            }
          };
          
          sendChunk(0);
        }
      });
      
      return new Response(stream);
    } else {
      return res.json(response);
    }
  } catch (error) {
    console.error('Error in chat API:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function callGroqAPI(messages, options) {
  // Implementation for Groq API using GROQ_API_KEY
  // ...
}

async function callGeminiAPI(messages, options) {
  // Implementation for Gemini API using GEMINI_API_KEY
  // ...
}

async function callClaudeAPI(messages, options) {
  // Implementation for Claude API using ANTHROPIC_API_KEY
  // ...
}

async function callXaiAPI(messages, options) {
  // Implementation for XAI API using XAI_API_KEY
  // ...
}
