document.addEventListener("DOMContentLoaded", () => {
  const chatBody = document.getElementById('chatBody');
  const chatInput = document.getElementById('chatMessage');
  const chatSendBtn = document.querySelector('.chat-input button');
  const chatHeader = chatContainer?.querySelector('.chat-header');
  const userData = JSON.parse(localStorage.getItem("userLogged"));
  if (!userData) return (window.location.href = "login.html");

  // Mostrar nombre
  document.getElementById("nombreUsuario").textContent =
    userData.name || userData.username;
  const datoNombre = document.getElementById("datoNombre");
  const datoMail = document.getElementById("datoMail");
  const datoRol = document.getElementById("datoRol");

  const fecha = document.getElementById("fechaAsesoria").value;
  const hora = document.getElementById("horaAsesoria").value;
  if (datoNombre) datoNombre.textContent = userData.name || "-";
  if (datoMail) datoMail.textContent = userData.mail || "-";
  if (datoRol) datoRol.textContent = userData.rol || "-";

  // Referencias para método de entrega y datos de recolección
  const envioMuestra = document.getElementById("opcionEnvio"); //  corregido
  const datosRecoleccion = document.getElementById("datosRecoleccion");

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("userLogged");
    window.location.href = "login.html";
  });

  // --------- Visibilidad de Recolección ---------
  if (datosRecoleccion) {
    // Ocultar por defecto al cargar
    datosRecoleccion.style.display = "none";
  }

  if (envioMuestra && datosRecoleccion) {
    envioMuestra.addEventListener("change", function () {
      if (this.value === "recoger") {
        datosRecoleccion.style.display = "block";
      } else {
        datosRecoleccion.style.display = "none";
      }
    });
  }
//-- --------- Chatbot ---------
 if (!chatBody || !chatInput || !chatSendBtn) return;

 // Abrir/cerrar al tocar el header
  if (chatHeader){
    chatHeader.addEventListener('click', () => {
      chatContainer.classList.toggle('open');
    });
  }


  const addBubble = (text, who = 'bot') => {
    const div = document.createElement('div');
    div.className = `chat-msg ${who}`;
    div.textContent = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
    return div;
  };

  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    addBubble(text, 'user');
    chatInput.value = '';
    const placeholder = addBubble('Escribiendo…', 'bot');

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await resp.json();
      placeholder.textContent = data?.reply || 'No hay respuesta.';
    } catch (e) {
      console.error(e);
      placeholder.textContent = 'Error al conectar con el asistente.';
    }
  }

  chatSendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });
});
