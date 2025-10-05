// server.js (actualizado)
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const chatRoutes = require('./routes/chat.routes');

// === Importar controladores de usuario ===
const {
  UserController,                 // ✅ Crear usuario
  loginController,                // ✅ Login
  recuperarController,            // ✅ Recuperar contraseña
  validarTokenController,         // ✅ Validar token de recuperación
  actualizarPasswordController,   // ✅ Actualizar contraseña
  enviarTokenContactoController,  // ✅ Enviar token tabla contact_temp
  validarContactoController       // ✅ Validar token tabla contact_temp
} = require('../database/controller/UserController');

// === Importar rutas adicionales ===
const docTypesRoutes = require('./routes/docTypes.Routes');
const verificarContactoRoutes = require('./routes/verificarContacto.routes');

// === NUEVO: rutas de reportes (PDF estándar para tipos ≠ ensayos) ===
const reportsRoutes = require('./routes/reportsRoutes');

const app = express();
const PORT = 30000;

// === Middlewares ===
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// == Chat ==
app.use('/api/chat', chatRoutes);

// === Archivos estáticos del frontend (Minexora) ===
const frontendPath = path.join(__dirname, '..', '..', '..', '..', 'Minexora');
app.use(express.static(frontendPath));

// === NUEVO: servir archivos estáticos de /storage (PDFs generados) ===
const storagePath = path.join(__dirname, 'storage');
const storageReportsPath = path.join(storagePath, 'reports');

// Crear carpeta /storage/reports si no existe
if (!fs.existsSync(storageReportsPath)) {
  fs.mkdirSync(storageReportsPath, { recursive: true });
}

// Exponer /storage para abrir PDFs en el navegador (sin descarga automática)
app.use('/storage', express.static(storagePath, {
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'no-cache');
  }
}));

// === Rutas de APIs existentes ===
app.use('/api/document-types', docTypesRoutes);
app.use('/api/verificar-contacto', verificarContactoRoutes);

// === NUEVO: Rutas de reportes ===
// POST /api/reports         -> Generar PDF estándar (tipos ≠ ensayos)
// GET  /api/reports/latest  -> Listar últimos informes
app.use('/api', reportsRoutes);

// === Rutas de usuario ===
app.post('/api/users', UserController);
app.post('/api/login', loginController);
app.post('/api/recuperar', recuperarController);
app.post('/api/validar-token', validarTokenController);
app.post('/api/actualizar-password', actualizarPasswordController);

// === Rutas para validación de contacto (tabla contact_temp) ===
app.post('/api/enviar-token-contacto', enviarTokenContactoController);
app.post('/api/validarContacto', validarContactoController);

// === Rutas HTML principales (frontend Minexora) ===
app.get('/', (req, res) => res.sendFile(path.join(frontendPath, 'index.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(frontendPath, 'index.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(frontendPath, 'login.html')));
app.get('/creationUser.html', (req, res) => res.sendFile(path.join(frontendPath, 'creationUser.html')));
app.get('/dashboard.html', (req, res) => res.sendFile(path.join(frontendPath, 'dashboard.html')));
app.get('/vistaUsuario.html', (req, res) => res.sendFile(path.join(frontendPath, 'vistaUsuario.html')));

// === Manejo de rutas inexistentes (debe ir al final) ===
app.use((req, res) => {
  res.status(404).json({ ok: false, msg: 'Ruta no encontrada' });
});

// === Iniciar servidor ===
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📄 PDFs servidos desde /storage (ruta física: ${storagePath})`);
});
