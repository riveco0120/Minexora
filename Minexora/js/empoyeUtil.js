document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formInformes');
  const tipoInformeEl = document.getElementById('tipoInforme');
  const extra = document.getElementById('ensayosExtra');

  const tenorM1 = document.getElementById('tenorM1');
  const tenorM2 = document.getElementById('tenorM2');
  const solicitanteNombre = document.getElementById('solicitanteNombre');
  const solicitanteCorreo = document.getElementById('solicitanteCorreo');

  const btnGenerar = document.getElementById('btnGenerar');
  const btnEnviarEnsayo = document.getElementById('btnEnviarEnsayo');

  const rangoDesde = document.getElementById('rangoDesde');
  const rangoHasta = document.getElementById('rangoHasta');

  function toggleEnsayosExtra() {
    const isEnsayos = tipoInformeEl.value === 'ensayos';
    if (extra) extra.hidden = !isEnsayos;

    // Requeridos solo si es "Ensayos"
    [tenorM1, tenorM2, solicitanteNombre, solicitanteCorreo].forEach(el => {
      if (!el) return;
      el.required = isEnsayos;
    });

    // Al cambiar tipo, ocultamos el botón Enviar hasta que se vuelva a Generar
    if (btnEnviarEnsayo) btnEnviarEnsayo.style.display = 'none';
  }

  if (tipoInformeEl) {
    tipoInformeEl.addEventListener('change', toggleEnsayosExtra);
    toggleEnsayosExtra(); // estado inicial
  }

  // Al hacer clic en Generar (submit del formulario)
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault(); // simulamos generación
      // Validar campos visibles/requeridos
      if (!form.reportValidity()) return;

      // Mostrar "Enviar" solo si el tipo de informe es Ensayos
      if (tipoInformeEl && tipoInformeEl.value === 'ensayos') {
        if (btnEnviarEnsayo) btnEnviarEnsayo.style.display = 'inline-block';
      } else {
        if (btnEnviarEnsayo) btnEnviarEnsayo.style.display = 'none';
      }

      // Aquí podrías ejecutar la generación real del informe si aplica
      // ...
    });
  }

  // Envío de Ensayo
  if (btnEnviarEnsayo) {
    btnEnviarEnsayo.addEventListener('click', () => {
      // Valida todo el formulario, incluidos los campos extra cuando visible
      if (!form.reportValidity()) return;

      const data = {
        desde: rangoDesde?.value || '',
        hasta: rangoHasta?.value || '',
        tenorM1: tenorM1?.value || '',
        tenorM2: tenorM2?.value || '',
        solicitante: solicitanteNombre?.value?.trim() || '',
        correo: solicitanteCorreo?.value?.trim() || ''
      };

      // Simulación de envío + agregar a "Últimos informes"
      const ul = document.querySelector('.informes-lista');
      if (ul) {
        const li = document.createElement('li');
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();

        li.innerHTML = `
          <span class="inf-nombre">Ensayos · ${data.desde || '--'} a ${data.hasta || '--'}</span>
          <span class="inf-fecha">Solicitante: ${data.solicitante} · ${dd}/${mm}/${yyyy}</span>
          <div class="inf-acciones">
            <button class="btn-link">Ver</button>
            <button class="btn-link">Descargar</button>
          </div>
        `;
        ul.prepend(li);
      }

      alert('Solicitud de informe de ensayos enviada correctamente.');

      // Limpia solo campos extra; conserva rangos
      [tenorM1, tenorM2, solicitanteNombre, solicitanteCorreo].forEach(el => el.value = '');

      // Tras enviar, ocultamos el botón hasta una nueva "Generación"
      if (btnEnviarEnsayo) btnEnviarEnsayo.style.display = 'none';
    });
  }
});
