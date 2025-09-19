// api/chat.js
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { messages, provider, options = {} } = await req.json();
    
    if (!messages || !provider) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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
        return new Response(JSON.stringify({ error: 'Unsupported provider' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }

    if (options.streaming) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            // Send response in chunks with typing effect
            const chunks = response.content.match(/.{1,5}/g) || [];
            
            for (let i = 0; i < chunks.length; i++) {
              const chunk = chunks[i];
              const data = {
                content: chunk
              };
            
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
              
              // Wait for typing effect (30 characters per second)
              await new Promise(resolve => setTimeout(resolve, 1000 / 30));
            }
            
            // Send end signal
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            console.error('Streaming error:', error);
            controller.error(error);
          }
        }
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      });
    } else {
      return new Response(JSON.stringify(response), {
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      });
  }
}

// Helper functions for each API provider
async function callGroqAPI(messages, options) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: messages,
        temperature: options.creativity ? options.creativity / 100 : 0.7,
        max_tokens: options.length || 2000,
        top_p: options.focus ? options.focus / 100 : 0.5,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Groq API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      provider: 'groq'
    };
  } catch (error) {
    console.error('Groq API Error:', error);
    throw error;
  }
}

async function callGeminiAPI(messages, options) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  try {
    // Convert messages to Gemini format
    const geminiMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: geminiMessages,
        generationConfig: {
          temperature: options.creativity ? options.creativity / 100 : 0.7,
          topP: options.focus ? options.focus / 100 : 0.5,
          maxOutputTokens: options.length || 2000,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.candidates[0].content.parts[0].text,
      provider: 'gemini'
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

async function callClaudeAPI(messages, options) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: options.length || 2000,
        temperature: options.creativity ? options.creativity / 100 : 0.7,
        top_p: options.focus ? options.focus / 100 : 0.5,
        messages: messages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Claude API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      provider: 'claude'
    };
  } catch (error) {
    console.error('Claude API Error:', error);
    throw error;
  }
}

async function callXaiAPI(messages, options) {
  const XAI_API_KEY = process.env.XAI_API_KEY;
  
  if (!XAI_API_KEY) {
    throw new Error('XAI_API_KEY not configured');
  }

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: messages,
        temperature: options.creativity ? options.creativity / 100 : 0.7,
        max_tokens: options.length || 2000,
        top_p: options.focus ? options.focus / 100 : 0.5,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`XAI API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      provider: 'xai'
    };
  } catch (error) {
    console.error('XAI API Error:', error);
    throw error;
  }
}
