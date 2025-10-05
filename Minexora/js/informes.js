// public/js/informes.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formInformes");
  const tipoInforme = document.getElementById("tipoInforme");
  const formatoInforme = document.getElementById("formatoInforme");
  const rangoDesde = document.getElementById("rangoDesde");
  const rangoHasta = document.getElementById("rangoHasta");

  // Extras de Ensayos
  const ensayosExtra = document.getElementById("ensayosExtra");
  const tenorM1 = document.getElementById("tenorM1");
  const tenorM2 = document.getElementById("tenorM2");
  const solicitanteNombre = document.getElementById("solicitanteNombre");
  const solicitanteCorreo = document.getElementById("solicitanteCorreo");

  // Botones
  const btnEnviarEnsayo = document.getElementById("btnEnviarEnsayo");

  // Lista de últimos
  const listaUl = document.querySelector(".informes-lista");

  // Mostrar/Ocultar extras de Ensayos
  tipoInforme.addEventListener("change", () => {
    const isEnsayos = tipoInforme.value === "ensayos";
    ensayosExtra.hidden = !isEnsayos;
    // En esta vista no mostramos "Enviar" para ensayos
    btnEnviarEnsayo.style.display = "none";
  });

  // Cargar últimos informes al abrir
  fetchLatestReports();

  // Submit (Generar)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const type = tipoInforme.value;
    const format = formatoInforme.value;
    const fromDate = rangoDesde.value; // YYYY-MM-DD
    const toDate = rangoHasta.value;

    if (!type || !format || !fromDate || !toDate) {
      alert("Completa todos los campos requeridos.");
      return;
    }

    // Si NO es "ensayos": generar estándar en backend
    if (type !== "ensayos") {
      try {
        const res = await fetch("/api/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, format, fromDate, toDate })
        });
        const data = await res.json();
        if (!data.ok) {
          alert(data.message || "No se pudo generar el informe.");
          return;
        }
        // Abrir en nueva pestaña (Ver) sin auto-descargar
        if (data.report?.fileUrl) {
          window.open(data.report.fileUrl, "_blank");
        }
        // Refrescar lista
        await fetchLatestReports();
      } catch (err) {
        console.error(err);
        alert("Error generando el informe.");
      }
      return;
    }

    // === Flujo "Ensayos" (tu lógica específica) ===
    // Aquí harías tu post a /api/reportes/ensayos con los extras
    // Ejemplo:
    /*
    const payload = {
      type, format, fromDate, toDate,
      tenorM1: tenorM1.value || "",
      tenorM2: tenorM2.value || "",
      solicitanteNombre: solicitanteNombre.value || "",
      solicitanteCorreo: solicitanteCorreo.value || ""
    };
    const res = await fetch("/api/reportes/ensayos", { ... });
    */
    alert("La generación para 'Ensayos' va en su módulo específico (pendiente).");
  });

  async function fetchLatestReports() {
    try {
      const res = await fetch("/api/reports/latest?limit=10");
      const data = await res.json();
      if (!data.ok) return;

      renderList(data.reports || []);
    } catch (err) {
      console.error(err);
    }
  }

  function renderList(items) {
    if (!listaUl) return;
    listaUl.innerHTML = "";

    items.forEach((r) => {
      const li = document.createElement("li");

      const spanNombre = document.createElement("span");
      spanNombre.className = "inf-nombre";
      spanNombre.textContent = `${capitalize(r.type)} · ${monthYearFromRange(r.fromDate, r.toDate)}`;

      const spanFecha = document.createElement("span");
      spanFecha.className = "inf-fecha";
      spanFecha.textContent = `Generado: ${formatDMY(new Date(r.createdAt))}`;

      const acciones = document.createElement("div");
      acciones.className = "inf-acciones";

      // Ver (abrir en nueva pestaña)
      const btnVer = document.createElement("a");
      btnVer.className = "btn-link";
      btnVer.textContent = "Ver";
      btnVer.href = r.fileUrl;
      btnVer.target = "_blank";
      btnVer.rel = "noopener";

      // Descargar (solo cuando el usuario lo pida)
      const btnDescargar = document.createElement("a");
      btnDescargar.className = "btn-link";
      btnDescargar.textContent = "Descargar";
      btnDescargar.href = r.fileUrl;      // mismo archivo
      btnDescargar.download = r.fileName; // sugiere el nombre al navegador

      acciones.append(btnVer, btnDescargar);
      li.append(spanNombre, spanFecha, acciones);
      listaUl.appendChild(li);
    });
  }

  function capitalize(s = "") {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function formatDMY(d) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  function monthYearFromRange(fromDate, toDate) {
    try {
      const d = new Date(toDate || fromDate);
      const month = d.toLocaleString('es-ES', { month: 'long' });
      return `${capitalize(month)} ${d.getFullYear()}`;
    } catch {
      return '';
    }
  }
});
