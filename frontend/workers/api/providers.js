export default {
  async fetch(request, env, ctx) {
    const providers = [
      { id: 'claude', name: 'Claude', color: '#8B5CF6', status: 'online' },
      { id: 'gemini', name: 'Gemini', color: '#4285F4', status: 'online' },
      { id: 'groq', name: 'Groq', color: '#FF6B35', status: 'online' },
      { id: 'xai', name: 'XAI', color: '#10B981', status: 'online' }
    ];

    return new Response(JSON.stringify(providers), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
