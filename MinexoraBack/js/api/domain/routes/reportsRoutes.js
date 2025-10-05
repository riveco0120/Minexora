const express = require('express');
const router = express.Router();

const {
  generateReport,
  listLatestReports
} = require('../../database/controller/reportsController');

// POST /api/reports          -> generar PDF estándar (tipos ≠ ensayos)
router.post('/reports', generateReport);

// GET  /api/reports/latest   -> listar últimos informes
router.get('/reports/latest', listLatestReports);

module.exports = router;
