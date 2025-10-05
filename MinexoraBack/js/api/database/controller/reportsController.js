const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const dayjs = require('dayjs');

const { insertReport, getLatestReports } = require('../repository/reportsRepository');

// carpeta física donde van los PDFs
const STORAGE_DIR = path.join(__dirname, '..', '..', 'domain', 'storage', 'reports');

function ensureStorage() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

function ddmmyyyy(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function makeStandardPDF({ type, format, fromDate, toDate }) {
  ensureStorage();

  const ts = dayjs().format('YYYYMMDD_HHmmss');
  const safeType = String(type || 'General').replace(/\s+/g, '_');
  const fileName = `Informe_${safeType}_${ts}.pdf`;
  const filePath = path.join(STORAGE_DIR, fileName);

  const doc = new PDFDocument({ size: 'A4', margin: 56 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Portada
  doc.font('Helvetica-Bold').fontSize(18).text(`Minexora - Informe ${type}`);
  doc.moveDown(0.5);
  doc.font('Helvetica').fontSize(11)
    .text(`Generado el: ${dayjs().format('DD/MM/YYYY')}`)
    .text(`Rango de fechas: ${ddmmyyyy(fromDate)} a ${ddmmyyyy(toDate)}`)
    .text(`Formato: ${String(format || 'pdf').toUpperCase()}`);

  doc.moveDown(0.7);
  doc.moveTo(56, doc.y).lineTo(539, doc.y).strokeColor('#C8C8C8').lineWidth(1).stroke();
  doc.moveDown(1);

  // Contenido
  doc.font('Helvetica-Bold').fontSize(13).text('Resumen');
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(11)
    .text('Informe estándar generado automáticamente. Para reportes con tablas/detalle use el módulo específico.');

  doc.moveDown(0.8);
  doc.font('Helvetica-Bold').fontSize(13).text('Resultados (placeholder)');
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(11)
    .text('Aquí puedes incluir métricas o anexar páginas adicionales según necesidad.');

  doc.moveDown(2);
  doc.fontSize(9).text('© Minexora');

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve({ fileName, filePath }));
    stream.on('error', reject);
  });
}

async function generateReport(req, res) {
  try {
    const { type, format = 'pdf', fromDate, toDate } = req.body || {};
    if (!type || !fromDate || !toDate) {
      return res.status(400).json({ ok: false, message: 'type, fromDate y toDate son obligatorios' });
    }
    if (String(type).toLowerCase() === 'ensayos') {
      return res.status(400).json({ ok: false, message: 'Para "ensayos" use el módulo específico.' });
    }

    const { fileName } = await makeStandardPDF({ type, format, fromDate, toDate });

    // URL pública que sirve el server (ver server.js abajo)
    const fileUrl = `/storage/reports/${fileName}`;

    const id = await insertReport({ type, format, fromDate, toDate, fileName, fileUrl });

    res.json({
      ok: true,
      report: {
        id, type, format, fromDate, toDate, fileName,
        fileUrl,
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
    });
  } catch (err) {
    console.error('[generateReport] error:', err);
    res.status(500).json({ ok: false, message: 'Error generando el informe' });
  }
}

async function listLatestReports(req, res) {
  try {
    const limit = req.query.limit || 10;
    const rows = await getLatestReports(limit);
    res.json({ ok: true, reports: Array.isArray(rows) ? rows : [] });
  } catch (err) {
    console.error('[listLatestReports] error:', err);
    res.status(500).json({ ok: false, message: 'Error listando informes' });
  }
}

module.exports = {
  generateReport,
  listLatestReports
};
