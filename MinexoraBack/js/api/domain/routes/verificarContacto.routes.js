const express = require('express');
const router = express.Router();
const connection = require('../../database/db/connection');

router.post("/", (req, res) => {
  const { documentType, documentNumber, username, mail } = req.body;

  if (!documentType || !documentNumber || !username || !mail) {
    return res.status(400).json({ ok: false, msg: "Faltan datos para validar duplicados." });
  }

  const query = `
    SELECT documentType, documentNumber, username, mail 
    FROM user 
    WHERE (documentType = ? AND documentNumber = ?)
       OR username = ?
       OR mail = ?
    LIMIT 1;
  `;

  connection.query(query, [documentType, documentNumber, username, mail], (err, results) => {
    if (err) {
      console.error("❌ Error en la consulta de verificación:", err);
      return res.status(500).json({ ok: false, msg: "Error en la verificación." });
    }

    if (results.length > 0) {
      const duplicado = results[0];
      let mensaje = "Ya existe un contacto con ";

      if (duplicado.documentType === documentType && duplicado.documentNumber === documentNumber) {
        mensaje += `tipo ${documentType} y número ${documentNumber}`;
      } else if (duplicado.username === username) {
        mensaje += `el nombre de usuario ${username}`;
      } else if (duplicado.mail === mail) {
        mensaje += `el correo ${mail}`;
      }

      return res.json({ ok: false, msg: mensaje });
    }

    return res.json({ ok: true });
  });
});

module.exports = router;