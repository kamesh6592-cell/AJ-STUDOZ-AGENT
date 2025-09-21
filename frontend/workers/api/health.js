export default {
  async fetch(request, env, ctx) {
    const health = {
      status: 'ok',
      deploymentId: env.DEPLOYMENT_ID || 'unknown',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    return new Response(JSON.stringify(health), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
