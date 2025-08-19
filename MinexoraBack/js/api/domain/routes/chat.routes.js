const express = require('express');
const router = express.Router();

// IMPORTA desde ../services/llm/provider (según tu estructura)
const { openaiChat } = require('../services/llm/provider');

// Endpoint: POST /api/chat  { message: "..." }
router.post('/', async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Falta "message" (string).' });
    }

    const reply = await openaiChat(message);
    return res.json({ reply });
  } catch (e) {
    console.error('Error /api/chat:', e);
    return res.status(500).json({ error: e.message || 'Error en /api/chat' });
  }
});

module.exports = router;