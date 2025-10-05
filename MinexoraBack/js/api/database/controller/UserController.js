const UserDTO = require("../dto/user.DTO");
const { UserMapper } = require("../mapper/userMapper");
const {
  UserRepository,
  ContactTokenRepository,
} = require("../repository/userRepository");
const nodemailer = require("nodemailer");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Crear usuario
function UserController(req, res) {
  const data = req.body;

  try {
    const userDTO = new UserDTO(
      data.name,
      data.lastName,
      data.documentType,
      data.documentNumber,
      data.mail,
      data.username,
      data.password,
      data.rol,
      data.telephone
    );

    // Validar duplicados
    UserRepository.existsAnyDuplicate(
      userDTO.documentType,
      userDTO.documentNumber,
      userDTO.username,
      userDTO.mail,
      (dupErr, duplicates) => {
        if (dupErr) {
          console.error("❌ Error validando duplicados:", dupErr);
          return res.status(500).json({ error: "Error validando duplicados" });
        }

        if (duplicates.includes("document"))
          return res.status(409).json({ error: "Documento ya registrado" });
        if (duplicates.includes("username"))
          return res.status(409).json({ error: "Usuario ya registrado" });
        if (duplicates.includes("mail"))
          return res.status(409).json({ error: "Correo ya registrado" });

        const userEntity = UserMapper.toEntity(userDTO);
        const dbData = [
          userDTO.name,
          userDTO.lastName,
          userDTO.documentType,
          userDTO.documentNumber,
          userDTO.mail,
          userDTO.username,
          userDTO.password,
          userDTO.rol,
          userDTO.telephone,
          userEntity.token,
        ];

        UserRepository.create(dbData, (err, result) => {
          if (err) {
            console.error("❌ Error al guardar en la base de datos:", err);
            return res.status(500).json({
              error: "Error al guardar el usuario",
              details: err.message,
            });
          }
          return res
            .status(200)
            .json({ message: "Usuario guardado con éxito", result });
        });
      }
    );
  } catch (error) {
    console.error("❌ Error inesperado en el controlador:", error);
    return res.status(500).json({ error: "Error interno en el servidor" });
  }
}

// Login
function loginController(req, res) {
  const { userOrEmail, password } = req.body;

  UserRepository.login(userOrEmail, password, (err, user) => {
    if (err) {
      console.error("❌ Error en login:", err);
      return res.status(500).json({ success: false });
    }

    if (user) {
      delete user.Password;
      return res.json({
        success: true,
        user: {
          name: user.Name,
          lastName: user.LastName,
          documentType: user.DocumentType,
          documentNumber: user.DocumentNumber,
          mail: user.Mail,
          username: user.Username,
          rol: user.Rol,
          telephone: user.Telephone,
          avatar: "img/user-default.png",
        },
      });
    } else {
      return res.json({ success: false });
    }
  });
}

// Recuperar contraseña
function recuperarController(req, res) {
  const email = (req.body.correo || req.body.mail || "").trim().toLowerCase();

  if (!emailRegex.test(email)) {
    return res.status(400).json({ ok: false, msg: "Correo inválido" });
  }

  UserRepository.findByEmail(email, (err, user) => {
    if (err) {
      console.error("❌ Error al buscar usuario:", err);
      return res
        .status(500)
        .json({ ok: false, msg: "Error al buscar usuario" });
    }

    if (!user) {
      return res
        .status(404)
        .json({ ok: false, msg: "El correo no está registrado" });
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString();

    UserRepository.saveToken(user.Mail, token, (err2) => {
      if (err2) {
        console.error("❌ Error al guardar el token:", err2);
        return res
          .status(500)
          .json({ ok: false, msg: "Error al guardar token" });
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_FROM,
          pass: process.env.EMAIL_PASS,
        },
      });

      transporter.sendMail(
        {
          from: process.env.EMAIL_FROM,
          to: user.Mail,
          subject: "Recuperación de contraseña - Minexora",
          text: `Hola ${user.Name},\n\nTu código de recuperación es: ${token}\n\nSi no solicitaste este código, por favor ignora este mensaje.`,
        },
        (error) => {
          if (error) {
            console.error("❌ Error enviando correo:", error);
            return res
              .status(500)
              .json({ ok: false, msg: "Error al enviar correo" });
          }
          return res.json({
            ok: true,
            msg: "Token enviado al correo registrado",
          });
        }
      );
    });
  });
}

// Validar token recuperación
function validarTokenController(req, res) {
  const { correo, token } = req.body;

  if (!correo || !token) {
    return res.status(400).json({ ok: false, msg: "Faltan datos" });
  }

  UserRepository.findByEmailAndToken(
    correo.trim().toLowerCase(),
    token.trim(),
    (err, user) => {
      if (err) {
        console.error("❌ Error al validar token:", err);
        return res.status(500).json({ ok: false, msg: "Error en el servidor" });
      }

      if (!user) {
         return res
          .status(401)
          .json({ ok: false, msg: "Token incorrecto o expirado" });
      }

      UserRepository.saveToken(correo.trim().toLowerCase(), "", (err2) => {
        if (err2) {
          console.error("❌ Error al borrar token:", err2);
          return res
            .status(500)
            .json({ ok: false, msg: "Error al borrar token" });
        }
        return res.json({ ok: true, msg: "Código correcto" });
      });
    }
  );
}

// Cambiar contraseña
function actualizarPasswordController(req, res) {
  const email = (req.body.correo || req.body.mail || "").trim().toLowerCase();

  if (!emailRegex.test(email) || !req.body.nuevaPassword) {
    return res
      .status(400)
      .json({ ok: false, msg: "Faltan datos o correo inválido" });
  }

  UserRepository.updatePassword(email, req.body.nuevaPassword.trim(), (err) => {
    if (err) {
      console.error("❌ Error al actualizar contraseña:", err);
      return res.status(500).json({ ok: false, msg: "Error al actualizar" });
    }
    return res.json({ ok: true, msg: "Contraseña actualizada correctamente" });
  });
}

/* =======================
   Verificación de contacto
   ======================= */
function enviarTokenContactoController(req, res) {
  const email = (req.body.correo || req.body.mail || "").trim().toLowerCase();
  const nombre = req.body.nombre || req.body.name || "usuario";

  if (!emailRegex.test(email)) {
    return res.status(400).json({ ok: false, msg: "Correo inválido" });
  }

  const token = Math.floor(100000 + Math.random() * 900000).toString();

  ContactTokenRepository.saveToken(email, token, 10, (err) => {
    if (err) {
      console.error("❌ Error al guardar token para contacto:", err);
      return res.status(500).json({ ok: false, msg: "Error interno" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS,
      },
    });

    transporter.sendMail(
      {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Verificación de registro - Minexora",
        text: `Hola ${nombre},\n\nTu código de verificación es: ${token}\nCaduca en 10 minutos.\n\nSi no solicitaste este código, por favor ignora este mensaje.`,
      },
      (error) => {
        if (error) {
          console.error("❌ Error enviando correo:", error);
          return res
            .status(500)
            .json({ ok: false, msg: "Error al enviar correo" });
        }
        return res.json({
          ok: true,
          msg: "Token enviado exitosamente al correo",
        });
      }
    );
  });
}

// Validar token contacto usando contact_temp
function validarContactoController(req, res) {
  const email = (req.body.correo || req.body.mail || "").trim().toLowerCase();
  const token = (req.body.token || "").trim();
  if (!emailRegex.test(email) || !token) {
    return res
      .status(400)
      .json({ ok: false, msg: "Faltan datos o correo inválido" });
  }

  ContactTokenRepository.getByEmail(email, (err, rec) => {
    if (err) {
      console.error("❌ Error en validación de contacto:", err);
      return res.status(500).json({ ok: false, msg: "Error interno" });
    }

    if (
      rec.token !== token ||
      new Date(rec.expires_at).getTime() < Date.now()
    ) {
      return res
        .status(401)
        .json({ ok: false, msg: "Código incorrecto o expirado" });
    }

    ContactTokenRepository.deleteByEmail(email, (delErr) => {
      if (delErr) {
        console.error("❌ Error al limpiar token:", delErr);
        return res
          .status(500)
          .json({ ok: false, msg: "Error al limpiar token" });
      }
      return res.json({ ok: true, msg: "Código validado correctamente" });
    });
  });
}

module.exports = {
  UserController,
  loginController,
  recuperarController,
  validarTokenController,
  actualizarPasswordController,
  enviarTokenContactoController,
  validarContactoController,
};
