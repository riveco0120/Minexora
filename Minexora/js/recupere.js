document.addEventListener("DOMContentLoaded", () => {
  const link = document.getElementById("mostrarRecuperar");
  const loginCampos = document.getElementById("loginCampos");
  const loginControles = document.getElementById("loginControles");
  const formRecuperar = document.getElementById("recuperarContainer");
  const tokenContainer = document.getElementById("tokenContainer");
  const resetContainer = document.getElementById("resetContainer");

  const btnEnviar = document.getElementById("btnEnviarRecuperar");
  const btnValidar = document.getElementById("btnValidarToken");
  const btnCambiar = document.getElementById("btnCambiarPassword");

  const mensaje = document.getElementById("mensajeRecuperar");
  const mensajeToken = document.getElementById("mensajeToken");
  const mensajeReset = document.getElementById("mensajeReset");

  let correoTemporal = ""; // se guarda el correo para enviarlo luego

  const mostrarRecuperacion = () => {
    const titulo = document.querySelector('.login-box h2');
    if (titulo) titulo.textContent = "Recuperar Contraseña";

    loginCampos.style.display = "none";
    loginControles.style.display = "none";
    formRecuperar.style.display = "block";
    tokenContainer.style.display = "none";
    resetContainer.style.display = "none";
    mensaje.textContent = "";
  };

  const enviarToken = async () => {
    const correo = document.getElementById("correoRecuperar").value.trim();
    if (!correo || !correo.includes("@")) {
      mensaje.style.color = "red";
      mensaje.textContent = "Ingresa un correo válido.";
      return;
    }

    try {
      const res = await fetch("/api/recuperar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });
      const data = await res.json();
      if (data.ok) {
        formRecuperar.style.display = "none";
        tokenContainer.style.display = "block";
        mensaje.textContent = "";
        correoTemporal = correo; // guardamos el correo para siguiente paso
      } else {
        mensaje.style.color = "red";
        mensaje.textContent = data.msg || "Error al enviar el token.";
      }
    } catch (err) {
      console.error("Error al enviar token:", err);
      mensaje.style.color = "red";
      mensaje.textContent = "Ocurrió un error inesperado.";
    }
  };

  const validarToken = async () => {
    const token = document.getElementById("tokenInput").value.trim();

    if (!correoTemporal || !token) {
      mensajeToken.textContent = "Completa todos los campos.";
      mensajeToken.style.color = "red";
      return;
    }

    try {
      const res = await fetch("/api/validar-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correoTemporal, token }),
      });
      const data = await res.json();
      if (data.ok) {
        loginCampos.style.display = "none";
        loginControles.style.display = "none";
        formRecuperar.style.display = "none";
        tokenContainer.style.display = "none";
        resetContainer.style.display = "block";

        mensajeToken.textContent = "";
      } else {
        mensajeToken.textContent = data.msg || "Código inválido.";
        mensajeToken.style.color = "red";
      }
    } catch (err) {
      console.error("Error al validar token:", err);
      mensajeToken.textContent = "Error al validar el código.";
      mensajeToken.style.color = "red";
    }
  };

  const cambiarPassword = async () => {
    const nueva = document.getElementById("newPassword").value.trim();
    const confirmar = document.getElementById("confirmPassword").value.trim();

    if (!nueva || !confirmar) {
      mensajeReset.textContent = "Completa todos los campos.";
      mensajeReset.style.color = "red";
      return;
    }

    if (nueva !== confirmar) {
      mensajeReset.textContent = "Las contraseñas no coinciden.";
      mensajeReset.style.color = "red";
      return;
    }

    try {
      const res = await fetch("/api/actualizar-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correoTemporal, nuevaPassword: nueva }),
      });
      const data = await res.json();
      if (data.ok) {
        mensajeReset.textContent = "Contraseña actualizada con éxito.";
        mensajeReset.style.color = "green";

        // ✅ Mostrar login nuevamente
        setTimeout(() => {
          const titulo = document.querySelector('.login-box h2');
          if (titulo) titulo.textContent = "Iniciar Sesión";

          loginCampos.style.display = "block";
          loginControles.style.display = "block";
          formRecuperar.style.display = "none";
          tokenContainer.style.display = "none";
          resetContainer.style.display = "none";

          mensajeReset.textContent = "";
        }, 2000);
      } else {
        mensajeReset.textContent = data.msg || "Error al actualizar contraseña.";
        mensajeReset.style.color = "red";
      }
    } catch (err) {
      console.error("Error al cambiar contraseña:", err);
      mensajeReset.textContent = "Ocurrió un error inesperado.";
      mensajeReset.style.color = "red";
    }
  };

  link?.addEventListener("click", mostrarRecuperacion);
  btnEnviar?.addEventListener("click", enviarToken);
  btnValidar?.addEventListener("click", validarToken);
  btnCambiar?.addEventListener("click", cambiarPassword);
});
