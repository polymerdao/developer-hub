export const config = { path: "/*" };

function safeCompare(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export default async (request, context) => {
  const authToken = request.headers.get('X-Polymer-Token') || '';
  const SECRET_TOKEN = Netlify.env.get('POLYMER_TOKEN');

  if (!SECRET_TOKEN) {
    console.error('❌ POLYMER_TOKEN not set');
    return new Response('Server misconfigured', { status: 500 });
  }

  if (!safeCompare(authToken, SECRET_TOKEN)) {
    return new Response('Unauthorized', { status: 401 });
  }

  return context.next();
}
