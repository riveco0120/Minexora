document.addEventListener('DOMContentLoaded', () => {
  const userSessionRaw = localStorage.getItem('userLogged');
  const userSession = userSessionRaw ? JSON.parse(userSessionRaw) : null;
  const isLoginPage = window.location.pathname.includes('login.html');
  const isIndexPage = window.location.pathname.includes('index.html');

  const logoutBtn = document.getElementById('logoutBtn');
  const perfilBtn = document.getElementById('btn-vistaUser');
  const avatarImg = document.getElementById('userProfileImage'); // corregido
  const nombreSpan = document.getElementById('nombreUsuario');

  if (userSession && isLoginPage) {
    window.location.href = '/index.html';
    return;
  }

  if (logoutBtn) {
    logoutBtn.style.display = userSession ? 'inline-block' : 'none';
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('userLogged');
      window.location.href = '/login.html';
    });
  }

  if (perfilBtn) {
    perfilBtn.style.display = userSession ? 'inline-block' : 'none';
    perfilBtn.addEventListener('click', () => {
      window.location.href = '/vistaUsuari.html';
    });
  }

  if (userSession && isIndexPage) {
    if (nombreSpan) {
      nombreSpan.textContent = userSession.name || userSession.username || 'Usuario';
      nombreSpan.style.display = 'inline-block';
    }

    if (avatarImg) {
      let avatar = userSession.avatar;
      if (!avatar || typeof avatar !== 'string' || avatar.trim() === '') {
        avatar = 'user-default.png';
      }
      avatarImg.src = avatar;
      avatarImg.style.display = 'inline-block';
    }
  } else {
    if (nombreSpan) nombreSpan.style.display = 'none';
    if (avatarImg) avatarImg.style.display = 'none';
  }

  if (userSession?.rol === 'Administrador' && isIndexPage) {
    const createUserBtn = document.getElementById('adminCreateUser');
    if (createUserBtn) {
      createUserBtn.style.display = 'inline-block';
    }

    const menuItemsToHide = ['btn-Acerca', 'btn-Servicios', 'btn-Galeria', 'btn-Ubicacion','btn-Login'];
    menuItemsToHide.forEach(id => {
      const item = document.getElementById(id);
      if (item) item.style.display = 'none';
    });
  }
});