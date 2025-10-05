// MinexoraBack/js/api/database/repository/reportsRepository.js

// Usa la ruta real de tu conexión:
const db = require('../db/connection'); // <-- Ajusta aquí SOLO si tu connection está en otro sitio

// Helper: normaliza la respuesta del driver a "rows"
async function runQuery(sql, params = []) {
  let res;

  if (db && typeof db.execute === 'function') {
    res = await db.execute(sql, params);
  } else if (db && typeof db.query === 'function') {
    res = await db.query(sql, params);
  } else if (db?.pool && typeof db.pool.execute === 'function') {
    res = await db.pool.execute(sql, params);
  } else if (db?.pool && typeof db.pool.query === 'function') {
    res = await db.pool.query(sql, params);
  } else if (typeof db === 'function') {
    res = await db(sql, params);
  } else {
    throw new Error('[reportsRepository] No reconozco la API del cliente DB');
  }

  // mysql2/promise -> [rows, fields]
  if (Array.isArray(res)) return res[0];
  // pg-like -> { rows: [...] }
  if (res && Array.isArray(res.rows)) return res.rows;
  // algunos wrappers devuelven rows directo
  return res;
}

async function insertReport({ type, format, fromDate, toDate, fileName, fileUrl }) {
  const sql = `
    INSERT INTO reports (type, format, from_date, to_date, file_name, file_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  let res;
  if (db && typeof db.execute === 'function') {
    res = await db.execute(sql, [type, format, fromDate, toDate, fileName, fileUrl]);
  } else if (db && typeof db.query === 'function') {
    res = await db.query(sql, [type, format, fromDate, toDate, fileName, fileUrl]);
  } else if (db?.pool && typeof db.pool.execute === 'function') {
    res = await db.pool.execute(sql, [type, format, fromDate, toDate, fileName, fileUrl]);
  } else if (db?.pool && typeof db.pool.query === 'function') {
    res = await db.pool.query(sql, [type, format, fromDate, toDate, fileName, fileUrl]);
  } else {
    throw new Error('[reportsRepository] No reconozco la API del cliente DB al insertar');
  }

  const r0 = Array.isArray(res) ? res[0] : res;
  if (r0 && r0.insertId != null) return r0.insertId;
  return null;
}

async function getLatestReports(limit = 10) {
  const lim = Math.max(1, Number(limit) || 10);

  const sql = `
    SELECT
      id,
      type,
      format,
      from_date   AS fromDate,
      to_date     AS toDate,
      file_name   AS fileName,
      file_url    AS fileUrl,
      created_at  AS createdAt
    FROM reports
    ORDER BY created_at DESC
    LIMIT ${lim}
  `;

  const rows = await runQuery(sql);
  return rows || [];
}

module.exports = {
  insertReport,
  getLatestReports,
};
