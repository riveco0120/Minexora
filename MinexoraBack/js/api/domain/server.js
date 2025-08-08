const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const OpenAI = require('openai');

// === Importar controladores ===
const {
  UserController,          // ✅ Crear usuario
  loginController,         // ✅ Login
  recuperarController,     // ✅ Recuperar contraseña
  validarTokenController,  // ✅ Validar token de recuperación
  actualizarPasswordController, // ✅ Actualizar contraseña
  enviarTokenContactoController, // ✅ Enviar token tabla contact_temp
  validarContactoController      // ✅ Validar token tabla contact_temp
} = require('../database/controller/UserController');

// === Importar rutas adicionales ===
const docTypesRoutes = require('./routes/docTypes.Routes');
const verificarContactoRoutes = require('./routes/verificarContacto.routes');

const app = express();
const PORT = 30000;

// === Middlewares ===
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// === Archivos estáticos del frontend (Minexora) ===
const frontendPath = path.join(__dirname, '..', '..', '..', '..', 'Minexora');
app.use(express.static(frontendPath));

// === Rutas de APIs ===
app.use('/api/document-types', docTypesRoutes);
app.use('/api/verificar-contacto', verificarContactoRoutes);

// === Rutas de usuario ===
app.post('/api/users', UserController);
app.post('/api/login', loginController);
app.post('/api/recuperar', recuperarController);
app.post('/api/validar-token', validarTokenController);
app.post('/api/actualizar-password', actualizarPasswordController);

// === Rutas para validación de contacto (tabla contact_temp) ===
app.post('/api/enviar-token-contacto', enviarTokenContactoController);
app.post('/api/validarContacto', validarContactoController);

// === Chat con OpenAI ===
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
console.log('🔐 Clave API cargada:', process.env.OPENAI_API_KEY ? "Cargada correctamente" : "No encontrada");

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    });

    const respuesta = completion.choices[0].message.content;
    res.json({ reply: respuesta });
  } catch (error) {
    console.error('❌ Error en OpenAI:', error);
    res.status(500).json({ error: 'Error al conectar con el asistente.' });
  }
});

// === Rutas HTML principales ===
app.get('/', (req, res) => res.sendFile(path.join(frontendPath, 'index.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(frontendPath, 'index.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(frontendPath, 'login.html')));
app.get('/creationUser.html', (req, res) => res.sendFile(path.join(frontendPath, 'creationUser.html')));
app.get('/dashboard.html', (req, res) => res.sendFile(path.join(frontendPath, 'dashboard.html')));
app.get('/vistaUsuario.html', (req, res) => res.sendFile(path.join(frontendPath, 'vistaUsuario.html')));

// === Manejo de rutas inexistentes (evitar Unexpected token '<') ===
app.use((req, res) => {
  res.status(404).json({ ok: false, msg: "Ruta no encontrada" });
});

// === Iniciar servidor ===
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
