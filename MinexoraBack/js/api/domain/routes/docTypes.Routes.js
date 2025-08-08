const express = require('express');
const router = express.Router();
const connection = require('../../database/db/connection');

router.get('/', (req, res) => {
  connection.query('SELECT code, description FROM document_types ORDER BY description', (err, results) => {
    if (err) {
      console.error('Error al consultar tipos de documentos:', err);
      return res.status(500).json({ error: 'Error al obtener tipos de documentos' });
    }
    res.json(results);
  });
});

module.exports = router;
