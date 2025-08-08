document.addEventListener('DOMContentLoaded', () => {
  const userData = JSON.parse(localStorage.getItem('userLogged'));
  if (!userData) return window.location.href = 'login.html';

  // Mostrar nombre
  document.getElementById('nombreUsuario').textContent = userData.name || userData.username;
  document.getElementById('datoNombre').textContent = userData.name || '-';
  document.getElementById('datoMail').textContent = userData.mail || '-';
  document.getElementById('datoRol').textContent = userData.rol || '-';

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('userLogged');
    window.location.href = 'login.html';
  });

  // Agregar reunión
  const formReunion = document.getElementById('formReunion');
  const listaReuniones = document.getElementById('listaReuniones');
  formReunion.addEventListener('submit', (e) => {
    e.preventDefault();
    const titulo = document.getElementById('tituloReunion').value;
    const fecha = document.getElementById('fechaReunion').value;
    const hora = document.getElementById('horaReunion').value;
    const li = document.createElement('li');
    li.textContent = `${titulo} - ${fecha} ${hora}`;
    listaReuniones.appendChild(li);
    formReunion.reset();
  });

  // Funcionalidad del chat flotante
  const chatContainer = document.getElementById("chatContainer");
  const chatBody = document.getElementById("chatBody");
  const chatMessage = document.getElementById("chatMessage");

  window.toggleChat = function () {
    chatContainer.classList.toggle("open");
  }

  window.sendChatMessage = async function () {
    const message = chatMessage.value.trim();
    if (!message) return;

    const userMsg = document.createElement("div");
    userMsg.className = "chat-msg user";
    userMsg.textContent = message;
    chatBody.appendChild(userMsg);

    const botMsg = document.createElement("div");
    botMsg.className = "chat-msg bot";
    botMsg.textContent = "Escribiendo...";
    chatBody.appendChild(botMsg);

    chatMessage.value = "";
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      botMsg.textContent = data.reply || "No se recibió respuesta.";
    } catch (error) {
      botMsg.textContent = "Error al conectar con el asistente.";
      console.error(error);
    }

    chatBody.scrollTop = chatBody.scrollHeight;
  }
});