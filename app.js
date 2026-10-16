document.addEventListener("DOMContentLoaded", function() {
  if (typeof CONFIG === "undefined") {
    showError("No se encuentra 'config.js'. Verifica que esté cargado correctamente.");
    return;
  }

  // Cargar dinámicamente el script de la jornada activa
  const scriptJornada = document.createElement("script");
  scriptJornada.src = "jornadas/jornada" + CONFIG.jornadaActiva + ".js";

  scriptJornada.onload = function() {
    renderizarConvocatoria();
  };

  scriptJornada.onerror = function() {
    showError("No se encuentra 'jornadas/jornada" + CONFIG.jornadaActiva + ".js'. Comprueba que el archivo exista en la carpeta 'jornadas/'.");
  };

  document.head.appendChild(scriptJornada);
});

function renderizarConvocatoria() {
  try {
    if (typeof CONVOCATORIA_SEMANAL === "undefined") {
      showError("Error al interpretar la información de la jornada.");
      return;
    }

    // 1. Textos Generales desde CONFIG
    setElementText("txtTemporada", CONFIG.temporada || "2026/2027");
    setElementText("txtJornada", "🏆 " + (CONVOCATORIA_SEMANAL.jornada || "CONVOCATORIA"));
    setElementText("txtCompeticion", CONFIG.competicion || "");

    // 2. Cálculo de Equipos
    const isLocal = !!CONVOCATORIA_SEMANAL.esLocal;
    const miEquipoStr = CONFIG.miEquipo || "CD Don Benito A";
    const rivalStr = CONVOCATORIA_SEMANAL.rival || "Rival";

    const localName = isLocal ? miEquipoStr : rivalStr;
    const visitanteName = isLocal ? rivalStr : miEquipoStr;

    const elLocal = document.getElementById("txtLocal");
    const elVisitante = document.getElementById("txtVisitante");

    if (elLocal) {
      elLocal.textContent = localName;
      elLocal.className = isDonBenito(localName) ? "team-name team-my-team" : "team-name team-rival";
    }

    if (elVisitante) {
      elVisitante.textContent = visitanteName;
      elVisitante.className = isDonBenito(visitanteName) ? "team-name team-my-team" : "team-name team-rival";
    }

    // 3. Obtener Lugar desde CONFIG.lugares
    const lugarKey = CONVOCATORIA_SEMANAL.lugarKey;
    const datosLugar = (CONFIG.lugares && CONFIG.lugares[lugarKey]) ? CONFIG.lugares[lugarKey] : {};

    setElementText("txtLugarNombre", datosLugar.nombre || "");
    setElementText("txtLugarDireccion", datosLugar.direccion || "");

    // Desplazamiento
    const rowDesplazamiento = document.getElementById("rowDesplazamiento");
    const textoDesplazamiento = (datosLugar.desplazamiento || "").trim();

    if (rowDesplazamiento) {
      if (isLocal || !textoDesplazamiento) {
        rowDesplazamiento.style.display = "none";
      } else {
        rowDesplazamiento.style.display = "flex";
        setElementText("txtDesplazamiento", textoDesplazamiento);
      }
    }

    const btnMaps = document.getElementById("btnMaps");
    if (btnMaps && datosLugar.linkGoogleMaps) {
      btnMaps.href = datosLugar.linkGoogleMaps;
    }

    // 4. Horarios y Estados de Fecha
    let textoSubfecha = "";
    switch (CONVOCATORIA_SEMANAL.estadoFecha) {
      case 'confirmada':
        textoSubfecha = "Fecha y hora confirmadas";
        break;
      case 'pendiente':
        textoSubfecha = "⚠️ Pendiente de confirmación oficial";
        break;
      case 'modificada':
        textoSubfecha = "🚨 ¡Atención! Horario modificado";
        break;
      case 'provisional':
        textoSubfecha = "📅 Fecha provisional (Sujeta a cambios)";
        break;
      default:
        textoSubfecha = CONVOCATORIA_SEMANAL.estadoFecha || "";
    }

    setElementText("txtFecha", CONVOCATORIA_SEMANAL.fecha || "");
    setElementText("txtFechaSubtexto", textoSubfecha);
    setElementText("txtHoraPartido", CONVOCATORIA_SEMANAL.horaPartido || "");
    setElementText("txtHoraCitacion", CONVOCATORIA_SEMANAL.horaCitacion ? "Citación: " + CONVOCATORIA_SEMANAL.horaCitacion : "");
    setElementText("txtNotasCitacion", CONVOCATORIA_SEMANAL.notasCitacion || "");

    // 5. Equipación desde CONFIG.equipaciones
    const numEquip = CONVOCATORIA_SEMANAL.equipacionSeleccionada || 1;
    const equipActiva = (CONFIG.equipaciones && CONFIG.equipaciones[numEquip]) ? CONFIG.equipaciones[numEquip] : {};

    setElementText("txtHeaderEquipacion", equipActiva.nombre || "Equipación Obligatoria");
    setElementText("txtCamiseta", equipActiva.camiseta || "Rojiblanca");
    setElementText("txtPantalon", equipActiva.pantalon || "Azul");
    setElementText("txtMedias", equipActiva.medias || "Rojas");

    setElementBackground("swatchCamiseta", equipActiva.swatchCamiseta);
    setElementBackground("swatchPantalon", equipActiva.swatchPantalon);
    setElementBackground("swatchMedias", equipActiva.swatchMedias);

    const imgEq = document.getElementById("imgEquipacion");
    const containerEq = document.getElementById("boxEquipacion");
    if (imgEq && equipActiva.foto) {
      imgEq.src = equipActiva.foto;
      if (containerEq) containerEq.style.display = "flex";
      imgEq.onerror = function() {
        if (containerEq) containerEq.style.display = "none";
      };
    } else if (containerEq) {
      containerEq.style.display = "none";
    }

    // 6. Recordatorios y Pie
    setElementText("txtAgua", CONFIG.aguaTexto || "Botella de agua personal");
    setElementText("txtValores", CONFIG.valoresTexto || "Respeto y apoyo incondicional");
    setElementText("txtFooterEquipo", miEquipoStr.toUpperCase());

    // 7. Escaneo automático de fotos numeradas (1.jpg, 2.jpg...)
    escanearFotosLugar(datosLugar.carpeta, function(fotosEncontradas) {
      initCarousel(fotosEncontradas);
    });

  } catch (err) {
    showError("Error procesando la convocatoria: " + err.message);
  }
}

function isDonBenito(str) {
  return (str || "").toLowerCase().includes("don benito");
}

function setElementText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setElementBackground(id, bgValue) {
  const el = document.getElementById(id);
  if (el && bgValue) el.style.background = bgValue;
}

function showError(msg) {
  const banner = document.getElementById("errorBanner");
  const msgEl = document.getElementById("errorMessage");
  if (banner && msgEl) {
    banner.style.display = "block";
    msgEl.textContent = msg;
  }
}

// Busca fotos numeradas (1.jpg, 2.jpg, etc.) en la subcarpeta del lugar
function escanearFotosLugar(subcarpeta, callback) {
  if (!subcarpeta) {
    callback([]);
    return;
  }

  const rutaBase = "imagenes/lugares/" + subcarpeta + "/";
  const extensiones = [".jpg", ".png", ".jpeg", ".webp", ".JPG", ".PNG"];
  let fotosValidas = [];
  let numero = 1;
  const maxFotos = 10;

  function probarNumero() {
    if (numero > maxFotos) {
      callback(fotosValidas);
      return;
    }

    let extIndex = 0;

    function probarExtension() {
      if (extIndex >= extensiones.length) {
        numero++;
        probarNumero();
        return;
      }

      const ext = extensiones[extIndex];
      const url = `${rutaBase}${numero}${ext}`;
      const img = new Image();

      img.onload = function() {
        fotosValidas.push(url);
        numero++;
        probarNumero();
      };

      img.onerror = function() {
        extIndex++;
        probarExtension();
      };

      img.src = url;
    }

    probarExtension();
  }

  probarNumero();
}

function initCarousel(fotos) {
  const container = document.getElementById("carouselContainer");
  const track = document.getElementById("carouselTrack");
  const dotsContainer = document.getElementById("carouselDots");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");

  if (!container || !track || !dotsContainer) return;

  if (!fotos || !Array.isArray(fotos) || fotos.length === 0) {
    container.style.display = "none";
    return;
  }

  container.style.display = "block";
  let currentSlide = 0;
  const totalSlides = fotos.length;
  track.innerHTML = "";
  dotsContainer.innerHTML = "";

  fotos.forEach((src, idx) => {
    const img = document.createElement("img");
    img.src = src;
    img.className = "carousel-slide";
    img.alt = `Instalación ${idx + 1}`;
    track.appendChild(img);

    const dot = document.createElement("div");
    dot.className = `dot ${idx === 0 ? 'active' : ''}`;
    dot.addEventListener("click", () => {
      currentSlide = idx;
      update();
    });
    dotsContainer.appendChild(dot);
  });

  if (totalSlides <= 1) {
    if (btnPrev) btnPrev.style.display = "none";
    if (btnNext) btnNext.style.display = "none";
    dotsContainer.style.display = "none";
    container.ontouchstart = null;
    container.ontouchend = null;
  } else {
    if (btnPrev) {
      btnPrev.style.display = "flex";
      btnPrev.onclick = () => {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        update();
      };
    }
    if (btnNext) {
      btnNext.style.display = "flex";
      btnNext.onclick = () => {
        currentSlide = (currentSlide + 1) % totalSlides;
        update();
      };
    }
    dotsContainer.style.display = "flex";

    let startX = 0;
    container.ontouchstart = (e) => { startX = e.touches[0].clientX; };
    container.ontouchend = (e) => {
      let diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) currentSlide = (currentSlide + 1) % totalSlides;
        else currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        update();
      }
    };
  }

  function update() {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    const dots = dotsContainer.querySelectorAll(".dot");
    dots.forEach((dot, idx) => dot.classList.toggle("active", idx === currentSlide));
  }
}