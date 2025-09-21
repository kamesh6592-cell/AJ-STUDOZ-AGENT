export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Forward request to your backend
      const backendResponse = await fetch('https://aj-studioz-agent.vercel.app/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Visitor-ID': request.headers.get('X-Visitor-ID') || '',
          'Authorization': request.headers.get('Authorization') || ''
        },
        body: request.body
      });

      // Return backend response
      return backendResponse;
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Visitor-ID'
    }
  });
}
