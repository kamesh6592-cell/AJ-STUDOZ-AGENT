import { Hono } from 'hono'

const app = new Hono()

// CORS middleware
app.use('*', async (c, next) => {
  // Set CORS headers
  c.header('Access-Control-Allow-Origin', '*')
  c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  
  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: 200 })
  }
  
  await next()
})

// Error handling middleware
app.onError((err, c) => {
  console.error('Error:', err)
  return c.json({ error: err.message }, 500)
})

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: c.env.NODE_ENV || 'development'
  })
})

// Get provider status
app.get('/api/providers', async (c) => {
  const providers = [
    { id: 'groq', name: 'Groq', status: await testProvider('groq', c.env.GROQ_API_KEY) },
    { id: 'gemini', name: 'Gemini', status: await testProvider('gemini', c.env.GEMINI_API_KEY) },
    { id: 'claude', name: 'Claude', status: await testProvider('claude', c.env.ANTHROPIC_API_KEY) },
    { id: 'xai', name: 'xAI', status: await testProvider('xai', c.env.XAI_API_KEY) },
  ]
  
  return c.json(providers)
})

// Main chat endpoint
app.post('/api/chat', async (c) => {
  const { messages, provider, options = {} } = await c.req.json()
  
  if (!messages || !provider) {
    return c.json({ error: 'Missing required parameters' }, 400)
  }

  let response
  switch (provider) {
    case 'groq':
      response = await callGroqAPI(messages, options, c.env.GROQ_API_KEY)
      break
    case 'gemini':
      response = await callGeminiAPI(messages, options, c.env.GEMINI_API_KEY)
      break
    case 'claude':
      response = await callClaudeAPI(messages, options, c.env.ANTHROPIC_API_KEY)
      break
    case 'xai':
      response = await callXaiAPI(messages, options, c.env.XAI_API_KEY)
      break
    default:
      return c.json({ error: 'Unsupported provider' }, 400)
  }

  if (options.streaming) {
    return handleStreamingResponse(response)
  } else {
    return c.json(response)
  }
})

// Helper functions
async function testProvider(provider, apiKey) {
  if (!apiKey) return 'offline'
  
  try {
    const testMessage = [{ role: 'user', content: 'Hello' }]
    
    switch (provider) {
      case 'groq':
        await callGroqAPI(testMessage, { length: 10 }, apiKey)
        break
      case 'gemini':
        await callGeminiAPI(testMessage, { length: 10 }, apiKey)
        break
      case 'claude':
        await callClaudeAPI(testMessage, { length: 10 }, apiKey)
        break
      case 'xai':
        await callXaiAPI(testMessage, { length: 10 }, apiKey)
        break
    }
    
    return 'online'
  } catch (error) {
    console.error(`Error testing ${provider}:`, error)
    return 'offline'
  }
}

function handleStreamingResponse(response) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send response in chunks with typing effect
        const chunks = response.content.match(/.{1,5}/g) || []
        
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i]
          const data = {
            content: chunk
          }
        
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
          
          // Wait for typing effect (30 characters per second)
          await new Promise(resolve => setTimeout(resolve, 1000 / 30))
        }
        
        // Send end signal
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (error) {
        console.error('Streaming error:', error)
        controller.error(error)
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    }
  })
}

async function callGroqAPI(messages, options, apiKey) {
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured')
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
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
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Groq API Error: ${errorData.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return {
    content: data.choices[0].message.content,
    provider: 'groq'
  }
}

async function callGeminiAPI(messages, options, apiKey) {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured')
  }

  // Convert messages to Gemini format
  const geminiMessages = messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }))

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
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
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return {
    content: data.candidates[0].content.parts[0].text,
    provider: 'gemini'
  }
}

async function callClaudeAPI(messages, options, apiKey) {
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
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
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Claude API Error: ${errorData.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return {
    content: data.content[0].text,
    provider: 'claude'
  }
}

async function callXaiAPI(messages, options, apiKey) {
  if (!apiKey) {
    throw new Error('XAI_API_KEY not configured')
  }

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
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
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`XAI API Error: ${errorData.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return {
    content: data.choices[0].message.content,
    provider: 'xai'
  }
}

export default app
