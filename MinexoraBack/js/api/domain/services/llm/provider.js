const fetchImpl = global.fetch || ((...a) =>
  import('node-fetch').then(({ default: f }) => f(...a))
);

/**
 * Chat con OpenAI (chat.completions)
 * @param {string} message
 * @returns {Promise<string>}
 */
async function openaiChat(message) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model  = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  if (!apiKey) throw new Error('Falta OPENAI_API_KEY en .env');

  const r = await fetchImpl('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'Eres el asistente de Minexora. Responde claro y útil.' },
        { role: 'user', content: message },
      ],
    }),
  });

  const json = await r.json();
  if (!r.ok) {
    console.error('[OpenAI error]', json);
    throw new Error(json?.error?.message || 'Error del proveedor OpenAI');
  }
  return json?.choices?.[0]?.message?.content ?? 'No hay respuesta.';
}

// Exporta SOLO esta función
module.exports = { openaiChat };