const db = require("../db/connection");

const UserRepository = {
  // Crear usuario
  create: (data, callback) => {
    const sql = `
      INSERT INTO user (Name, LastName, DocumentType, DocumentNumber, Mail, Username, Password, Rol, Telephone, Token)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, data, callback);
  },

  // Login por usuario o email + contraseña
  login: (userOrEmail, password, callback) => {
    const sql = `
      SELECT * FROM user
      WHERE (Username = ? OR Mail = ?) AND Password = ?
    `;
    db.query(sql, [userOrEmail, userOrEmail, password], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  },

  // Buscar usuario por correo
  findByEmail: (correo, callback) => {
    const sql = `
      SELECT * FROM user WHERE Mail = ?
    `;
    db.query(sql, [correo], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  },

  // Guardar token (para recuperación de contraseña)
  saveToken: (correo, token, callback) => {
    const sql = `
      UPDATE user SET Token = ? WHERE Mail = ?
    `;
    db.query(sql, [token, correo], callback);
  },

  // Validar correo + token (recuperación de contraseña)
  findByEmailAndToken: (correo, token, callback) => {
    const sql = `
      SELECT * FROM user WHERE Mail = ? AND Token = ?
    `;
    db.query(sql, [correo, token], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  },

  // Actualizar contraseña
  updatePassword: (correo, nuevaPassword, callback) => {
    const sql = `
      UPDATE user SET Password = ? WHERE Mail = ?
    `;
    db.query(sql, [nuevaPassword, correo], callback);
  },

  // 🔹 Validar si ya existe un usuario con el mismo documento, username o correo
  existsAnyDuplicate: (documentType, documentNumber, username, mail, callback) => {
    const sql = `
      SELECT 'document' AS type FROM user WHERE DocumentType = ? AND DocumentNumber = ?
      UNION
      SELECT 'username' AS type FROM user WHERE Username = ?
      UNION
      SELECT 'mail' AS type FROM user WHERE Mail = ?
    `;
    db.query(sql, [documentType, documentNumber, username, mail], (err, results) => {
      if (err) return callback(err, null);
      if (results.length > 0) {
        return callback(null, results.map(r => r.type)); // Devuelve qué campos están duplicados
      }
      callback(null, []);
    });
  },
};

/* =====================================================
   REPOSITORIO PARA TOKEN DE CREACIÓN DE CONTACTO
   (Tabla contact_temp)
   ===================================================== */
const ContactTokenRepository = {
  // Guardar token con tiempo de expiración
  saveToken: (correo, token, minutosExpira, callback) => {
    const expiresAt = new Date(Date.now() + minutosExpira * 60000); // Siempre en ms local
    const sql = `
      INSERT INTO contact_temp (Mail, Token, Expires_At)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE Token = VALUES(Token), Expires_At = VALUES(Expires_At)
    `;
    db.query(sql, [correo, token, expiresAt], callback);
  },

  // Obtener registro por correo
  getByEmail: (correo, callback) => {
    const sql = `SELECT * FROM contact_temp WHERE Mail = ?`;
    db.query(sql, [correo], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  },

  // Eliminar token después de validar
  deleteByEmail: (correo, callback) => {
    const sql = `DELETE FROM contact_temp WHERE Mail = ?`;
    db.query(sql, [correo], callback);
  },
};

module.exports = { UserRepository, ContactTokenRepository };
