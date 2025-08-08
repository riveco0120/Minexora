document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const btnGuardar = document.getElementById("guardarContacto");
  const logoutBtn = document.getElementById("logoutBtn");
  const userSession = JSON.parse(localStorage.getItem("userLogged"));
  const form = document.getElementById("formRegistro");
  const btnConfirmarCodigo = document.getElementById("btnConfirmarCodigo");

  let correoTemporal = "";

  // Bloquear Enter para no enviar el formulario
  if (form) {
    form.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
      }
    });
  }

  // Establecer rol por defecto si no hay sesión
  const rolInput = document.getElementById("rol");
  const rolContainer = document.getElementById("rolContainer");
  if (!userSession) {
    if (rolInput) rolInput.value = "user";
    if (rolContainer) rolContainer.style.display = "none";
  } else if (userSession.rol !== "Administrador") {
    if (rolContainer) rolContainer.style.display = "none";
  }

  // LOGIN
  loginBtn?.addEventListener("click", () => {
    const userOrEmail = document.getElementById("usuario").value;
    const password = document.getElementById("password").value;

    fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userOrEmail, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          localStorage.setItem("userLogged", JSON.stringify(data.user));
          window.location.href = "/index.html";
        } else {
          alert("Credenciales inválidas");
        }
      })
      .catch((error) => {
        console.error("Error al iniciar sesión:", error);
        alert("Error al intentar iniciar sesión");
      });
  });

  // GUARDAR CONTACTO → Guarda en contact_temp + envía token
  btnGuardar?.addEventListener("click", async (event) => {
    event.preventDefault();

    const fields = [
      "name",
      "lastName",
      "documentType",
      "documentNumber",
      "mail",
      "username",
      "password",
      "rol",
      "telephone",
    ];
    const userData = {};
    let camposFaltantes = [];

    fields.forEach((field) => {
      const input = document.getElementById(field);
      input.classList.remove("error");
    });

    fields.forEach((field) => {
      const input = document.getElementById(field);
      let valor = input.value.trim();

      if (input.tagName === "SELECT") {
        valor = input.options[input.selectedIndex].value;
      }

      if (!valor) {
        input.classList.add("error");
        camposFaltantes.push(field);
      } else {
        userData[field] = valor;
      }
    });

    const password = userData.password;
    const confirmPassword = document.getElementById("confirmPassword")?.value.trim();

    if (!password || !confirmPassword) {
      alert("Por favor, ingresa y confirma la contraseña.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    if (camposFaltantes.length > 0) {
      alert("Por favor complete todos los campos obligatorios.");
      return;
    }

    try {
      // Validar duplicados antes de guardar
      const resVerif = await fetch("/api/verificar-contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: userData.documentType,
          documentNumber: userData.documentNumber,
          username: userData.username,
          mail: userData.mail,
        }),
      });

      const verifData = await resVerif.json();
      if (!verifData.ok) {
        alert(verifData.msg);
        return;
      }

      // Guardar datos en contact_temp y enviar token
      const resTemp = await fetch("/api/enviar-token-contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await resTemp.json();

      if (data.ok || data.success || data.status === "ok") {
        correoTemporal = userData.mail;
        window.datosUsuarioPendiente = userData;

        // Ocultar formulario y mostrar campo para código
        document.querySelectorAll("#formRegistro .form-group").forEach((group) => {
          group.style.display = "none";
        });

        btnGuardar.style.display = "none";

        const codigoContainer = document.getElementById("codigoConfirmacionContainer");
        if (codigoContainer) {
          codigoContainer.style.display = "block";
          codigoContainer.style.border = "2px solid #ccc";
          codigoContainer.style.padding = "1.5rem";
          codigoContainer.style.borderRadius = "8px";
          codigoContainer.style.backgroundColor = "#f9f9f9";
          codigoContainer.style.boxShadow = "0 0 10px rgba(0,0,0,0.1)";
          codigoContainer.style.marginTop = "2rem";
        }

        alert("Se ha enviado un código de verificación al correo.");
      } else {
        alert(data.msg || "Error al enviar el código.");
      }
    } catch (error) {
      console.error("Error al enviar token:", error);
      alert("No se pudo enviar el código.");
    }
  });

  // VALIDAR CÓDIGO → Si es correcto, guardar en user
  btnConfirmarCodigo?.addEventListener("click", async () => {
    const codigoIngresado = document.getElementById("codigoConfirmacion").value.trim();
    if (!correoTemporal || !codigoIngresado) {
      alert("Por favor ingresa el código de verificación.");
      return;
    }

    try {
     const res = await fetch("/api/validarContacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correoTemporal, token: codigoIngresado }),
      });

      const data = await res.json();
        if (data.ok || data.success || data.status === "ok") {
        const resCreate = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(window.datosUsuarioPendiente),
        });

        const created = await resCreate.json();

        if (created.message === "Usuario guardado con éxito") {
          alert("Usuario creado exitosamente.");
          window.location.href = "/login.html";
        } else {
          alert(created.msg || "No se pudo crear el usuario.");
        }
      } else {
        alert(data.msg || "Código inválido o expirado.");
      }
    } catch (err) {
      console.error("Error al validar token:", err);
      alert("Error al verificar el código.");
    }
  });

  // LOGOUT
  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("userLogged");
    window.location.href = "/login.html";
  });

  if (!userSession && logoutBtn) logoutBtn.style.display = "none";

  if (window.location.pathname.includes("login.html") && userSession) {
    window.location.href = "/index.html";
  }

  if (userSession && window.location.pathname.includes("index.html")) {
    const title = document.querySelector(".nombre");
    title.innerHTML += ` <span style="font-size:18px">(Bienvenido, ${userSession.username})</span>`;
  }

  // Cargar tipos de documento
  fetch("/api/document-types")
    .then((res) => res.json())
    .then((data) => {
      const select = document.getElementById("documentType");
      if (select) {
        data.forEach((item) => {
          const option = document.createElement("option");
          option.value = item.code;
          option.textContent = `${item.description}`;
          select.appendChild(option);
        });
      }
    })
    .catch((err) => console.error("Error al cargar tipos de documento:", err));
});
