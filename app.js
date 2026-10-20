document.addEventListener("DOMContentLoaded", function() {
  // 1. Registro de Service Worker para PWA (Ejecución inmediata)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker PWA registrado:', reg.scope))
      .catch(err => console.log('Error PWA:', err));
  }

  // Detección inicial de conexión a Internet
  actualizarEstadoRed();

  if (typeof CONFIG === "undefined") {
    showError("No se encuentra 'config.js'. Verifica que esté cargado correctamente.");
    return;
  }

  // 2. Cargar dinámicamente el script de la jornada activa
  const scriptJornada = document.createElement("script");
  scriptJornada.src = "jornadas/jornada" + CONFIG.jornadaActiva + ".js?v=" + Date.now();

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

    const cardHorarios = document.getElementById("cardHorarios");
    const cardLugar = document.getElementById("cardLugar");
    const cardEquipacion = document.getElementById("cardEquipacion");
    const cardRecordatorios = document.getElementById("cardRecordatorios");
    const cardDescanso = document.getElementById("cardDescanso");
    const vsBadge = document.querySelector(".vs-badge");

    // ==========================================
    // 1. GESTIÓN DE JORNADA DE DESCANSO
    // ==========================================
    if (CONVOCATORIA_SEMANAL.esDescanso) {
      if (cardHorarios) cardHorarios.style.display = "none";
      if (cardLugar) cardLugar.style.display = "none";
      if (cardEquipacion) cardEquipacion.style.display = "none";
      if (cardRecordatorios) cardRecordatorios.style.display = "none";
      if (cardDescanso) cardDescanso.style.display = "block";

      setElementText("txtTemporada", CONFIG.temporada || "2026/2027");
      setElementText("txtJornada", "☕ " + (CONVOCATORIA_SEMANAL.jornada || "DESCANSO"));
      setElementText("txtCompeticion", CONVOCATORIA_SEMANAL.competicion || CONFIG.competicion || "");

      const elLocal = document.getElementById("txtLocal");
      const elVisitante = document.getElementById("txtVisitante");

      if (elLocal) {
        elLocal.textContent = CONFIG.miEquipo || "CD Don Benito";
        elLocal.className = "team-name team-my-team";
      }
      if (vsBadge) vsBadge.textContent = "😴";
      if (elVisitante) {
        elVisitante.textContent = "DESCANSO";
        elVisitante.className = "team-name team-rival";
      }

      setElementText("txtFechaDescanso", CONVOCATORIA_SEMANAL.fecha || "Fin de semana sin competición");
      setElementText("txtNotasDescanso", CONVOCATORIA_SEMANAL.notasDescanso || "¡Esta semana no hay partido oficial! A recargar pilas.");

      const prox = CONVOCATORIA_SEMANAL.proximoPartido;
      const boxProximo = document.getElementById("boxProximoPartido");
      if (prox && prox.rival) {
        if (boxProximo) boxProximo.style.display = "block";
        setElementText("txtProximoRival", `${prox.jornada || "Próxima jornada"} vs ${prox.rival}`);
        setElementText("txtProximoDetalle", `${prox.fecha || ""} ${prox.lugar ? "· " + prox.lugar : ""}`);
      } else if (boxProximo) {
        boxProximo.style.display = "none";
      }

      setElementText("txtFooterEquipo", (CONFIG.miEquipo || "").toUpperCase());
      return; // Detiene la ejecución aquí en semanas de descanso
    } 

    // SI NO ES DESCANSO: Restaurar visibilidad de tarjetas principales
    if (cardDescanso) cardDescanso.style.display = "none";
    if (cardHorarios) cardHorarios.style.display = "block";
    if (cardLugar) cardLugar.style.display = "block";
    if (cardEquipacion) cardEquipacion.style.display = "block";
    if (cardRecordatorios) cardRecordatorios.style.display = "block";

    // Textos Generales desde CONFIG / JORNADA
    setElementText("txtTemporada", CONFIG.temporada || "2026/2027");
    setElementText("txtJornada", "🏆 " + (CONVOCATORIA_SEMANAL.jornada || "CONVOCATORIA"));
    setElementText("txtCompeticion", CONVOCATORIA_SEMANAL.competicion || CONFIG.competicion || "");

    const rowHoraPartido = document.getElementById("rowHoraPartido");
    const boxPartidosTorneo = document.getElementById("boxPartidosTorneo");
    let horaPartidoRaw = (CONVOCATORIA_SEMANAL.horaPartido || "").trim();

    // ==========================================
    // 2. MODO TORNEO VS MODO PARTIDO ÚNICO
    // ==========================================
    if (CONVOCATORIA_SEMANAL.esTorneo) {
      if (rowHoraPartido) rowHoraPartido.style.display = "none";
      if (boxPartidosTorneo) boxPartidosTorneo.style.display = "block";

      const elLocal = document.getElementById("txtLocal");
      const elVisitante = document.getElementById("txtVisitante");
      if (elLocal) {
        elLocal.textContent = CONFIG.miEquipo || 'CD Don Benito Prebenjamín "A"';
        elLocal.className = "team-name team-my-team";
      }
      if (vsBadge) vsBadge.textContent = "🏆";
      if (elVisitante) {
        elVisitante.textContent = CONVOCATORIA_SEMANAL.rival || "VARIOS EQUIPOS";
        elVisitante.className = "team-name team-rival";
      }

      // Dibujar lista de partidos del torneo
      const partidos = CONVOCATORIA_SEMANAL.partidosTorneo || [];
      if (partidos.length > 0) {
        let htmlTorneo = '<strong style="font-size:0.78rem; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:10px;">📅 Horario de Partidos</strong>';
        
        partidos.forEach(p => {
          htmlTorneo += `
            <div style="display:flex; align-items:center; justify-content:space-between; background:#f8fafc; padding:10px 12px; border-radius:8px; margin-bottom:8px; border:1px solid #e2e8f0;">
              <div>
                <strong style="color:#1e293b; font-size:0.88rem; display:block;">${p.rival}</strong>
                <span style="font-size:0.75rem; color:#64748b;">${p.campo || 'Campo por definir'}</span>
              </div>
              <span style="background:#e0f2fe; color:#0284c7; font-weight:700; font-size:0.82rem; padding:4px 8px; border-radius:6px; white-space:nowrap;">
                ⏰ ${p.hora}
              </span>
            </div>`;
        });
        boxPartidosTorneo.innerHTML = htmlTorneo;

        // Si no se definió una hora global de partido, toma la del primer enfrentamiento del torneo
        if (!horaPartidoRaw && partidos[0].hora) {
          horaPartidoRaw = partidos[0].hora;
        }
      }
    } else {
      // PARTIDO ÚNICO DE LIGA O AMISTOSO
      if (rowHoraPartido) rowHoraPartido.style.display = "flex";
      if (boxPartidosTorneo) boxPartidosTorneo.style.display = "none";
      if (vsBadge) vsBadge.textContent = "VS";

      const isLocal = !!CONVOCATORIA_SEMANAL.esLocal;
      const miEquipoStr = CONFIG.miEquipo || 'CD Don Benito Prebenjamín "A"';
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
    }

    // ==========================================
    // 3. DATOS DE INSTALACIÓN Y LUGAR
    // ==========================================
    const lugarKey = CONVOCATORIA_SEMANAL.lugarKey;
    const datosLugar = (CONFIG.lugares && lugarKey && CONFIG.lugares[lugarKey]) ? CONFIG.lugares[lugarKey] : null;

    const btnMaps = document.getElementById("btnMaps");
    const rowDesplazamiento = document.getElementById("rowDesplazamiento");
    const rowPista = document.getElementById("rowPista");
    const rowHoraSalida = document.getElementById("rowHoraSalida");

    if (datosLugar && datosLugar.nombre) {
      setElementText("txtLugarNombre", datosLugar.nombre);
      setElementText("txtLugarDireccion", datosLugar.direccion || "");

      const textoPista = (datosLugar.pista || "").trim();
      if (rowPista) {
        const pistaLower = textoPista.toLowerCase();
        if (textoPista && pistaLower !== "desconocido" && pistaLower !== "desconocida") {
          rowPista.style.display = "flex";
          setElementText("txtPista", textoPista);
        } else {
          rowPista.style.display = "none";
        }
      }

      const textoDesplazamiento = (datosLugar.desplazamiento || "").trim();
      if (rowDesplazamiento) {
        if (CONVOCATORIA_SEMANAL.esLocal || !textoDesplazamiento) {
          rowDesplazamiento.style.display = "none";
        } else {
          rowDesplazamiento.style.display = "flex";
          setElementText("txtDesplazamiento", textoDesplazamiento);
        }
      }

      if (btnMaps) {
        if (datosLugar.linkGoogleMaps) {
          btnMaps.href = datosLugar.linkGoogleMaps;
          btnMaps.style.display = "flex";
        } else {
          btnMaps.style.display = "none";
        }
      }
    } else {
      setElementText("txtLugarNombre", "Aún por definir");
      setElementText("txtLugarDireccion", "Instalación pendiente de confirmación oficial");

      if (rowPista) rowPista.style.display = "none";
      if (rowDesplazamiento) rowDesplazamiento.style.display = "none";
      if (rowHoraSalida) rowHoraSalida.style.display = "none";
      if (btnMaps) btnMaps.style.display = "none";
    }

    // ==========================================
    // 4. HORARIOS, ESTADO DE FECHA Y CITACIÓN
    // ==========================================
    let textoSubfecha = "";
    switch (CONVOCATORIA_SEMANAL.estadoFecha) {
      case 'confirmada':
        textoSubfecha = "Fecha y hora confirmadas";
        break;
      case 'pendiente':
        textoSubfecha = "⚠️ Pendiente de confirmación oficial (miércoles por la tarde)";
        break;
      case 'modificada':
        textoSubfecha = "🚨 ¡Atención! Horario modificado";
        break;
      case 'provisional':
        textoSubfecha = "Fecha y hora provisionales (Sujetas a cambios)";
        break;
      default:
        textoSubfecha = CONVOCATORIA_SEMANAL.estadoFecha || "";
    }

    setElementText("txtFecha", CONVOCATORIA_SEMANAL.fecha || "");
    setElementText("txtFechaSubtexto", textoSubfecha);

    const minutosAntes = parseInt(CONVOCATORIA_SEMANAL.minutosAntelacion, 10) || 0;
    const isProvisional = CONVOCATORIA_SEMANAL.estadoFecha === 'provisional';
    const isConfirmada = CONVOCATORIA_SEMANAL.estadoFecha === 'confirmada';
    const boxCitacion = document.getElementById("boxCitacion");

    if (!horaPartidoRaw) {
      setElementText("txtHoraPartido", "Aún por definir");
      if (boxCitacion) boxCitacion.style.display = "none";
      if (rowHoraSalida) rowHoraSalida.style.display = "none";
    } else {
      let horaFormateada = horaPartidoRaw.includes("h") ? horaPartidoRaw : horaPartidoRaw + " h";
      if (isProvisional) horaFormateada += " (Provisional)";
      setElementText("txtHoraPartido", horaFormateada);

      if (minutosAntes > 0) {
        const horaCalculada = calcularHoraCitacion(horaPartidoRaw, minutosAntes);
        if (horaCalculada && boxCitacion) {
          boxCitacion.style.display = "flex";
          setElementText("txtHoraCitacion", "Citación: " + horaCalculada);
          
          const notaAuto = `Estemos ${minutosAntes} minutos antes.`;
          const notaFinal = CONVOCATORIA_SEMANAL.notasCitacion 
            ? `${notaAuto} ${CONVOCATORIA_SEMANAL.notasCitacion}` 
            : notaAuto;
          
          setElementText("txtNotasCitacion", notaFinal);

          const minutosTrayecto = datosLugar ? parseInt(datosLugar.minutosTrayecto, 10) : 0;
          if (rowHoraSalida) {
            if (!CONVOCATORIA_SEMANAL.esLocal && minutosTrayecto > 0 && horaCalculada) {
              const horaSalida = calcularHoraCitacion(horaCalculada, minutosTrayecto);
              if (horaSalida) {
                setElementText("txtHoraSalida", horaSalida);
                rowHoraSalida.style.display = "flex";
              } else {
                rowHoraSalida.style.display = "none";
              }
            } else {
              rowHoraSalida.style.display = "none";
            }
          }

        } else {
          if (boxCitacion) boxCitacion.style.display = "none";
          if (rowHoraSalida) rowHoraSalida.style.display = "none";
        }
      } else {
        if (boxCitacion) boxCitacion.style.display = "none";
        if (rowHoraSalida) rowHoraSalida.style.display = "none";
      }
    }

    // ==========================================
    // 5. BOTÓN AÑADIR A CALENDARIO
    // ==========================================
    const boxCalendarBtn = document.getElementById("boxCalendarBtn");
    const btnCalendar = document.getElementById("btnCalendar");

    if (isConfirmada && horaPartidoRaw && CONVOCATORIA_SEMANAL.fechaISO) {
      if (boxCalendarBtn && btnCalendar) {
        boxCalendarBtn.style.display = "block";

        const localStr = CONVOCATORIA_SEMANAL.esTorneo ? (CONFIG.miEquipo || "Don Benito") : (CONVOCATORIA_SEMANAL.esLocal ? CONFIG.miEquipo : CONVOCATORIA_SEMANAL.rival);
        const visitanteStr = CONVOCATORIA_SEMANAL.esTorneo ? "Torneo" : (CONVOCATORIA_SEMANAL.esLocal ? CONVOCATORIA_SEMANAL.rival : CONFIG.miEquipo);

        const tituloEvento = `⚽ ${CONVOCATORIA_SEMANAL.jornada}: ${localStr} vs ${visitanteStr}`;
        const horaCitacionTxt = document.getElementById("txtHoraCitacion") ? document.getElementById("txtHoraCitacion").textContent : "";
        const descripcionEvento = `Convocatoria ${CONVOCATORIA_SEMANAL.jornada} - ${CONFIG.competicion || ""}.\n${horaCitacionTxt}`;
        
        const ubicacionEvento = datosLugar 
          ? `${datosLugar.nombre || ""} (${datosLugar.direccion || ""})` 
          : "Lugar aún por definir";

        const fechaLimpia = CONVOCATORIA_SEMANAL.fechaISO.replace(/-/g, "");
        const horaMatch = horaPartidoRaw.match(/(\d{1,2}):(\d{2})/);
        
        if (horaMatch) {
          const h = parseInt(horaMatch[1], 10);
          const m = parseInt(horaMatch[2], 10);
          const pad = n => n < 10 ? '0' + n : '' + n;
          const startISO = `${fechaLimpia}T${pad(h)}${pad(m)}00`;
          let endH = (h + 2) % 24;
          const endISO = `${fechaLimpia}T${pad(endH)}${pad(m)}00`;

          const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(tituloEvento)}&dates=${startISO}/${endISO}&details=${encodeURIComponent(descripcionEvento)}&location=${encodeURIComponent(ubicacionEvento)}`;
          btnCalendar.href = googleCalUrl;
        }
      }
    } else if (boxCalendarBtn) {
      boxCalendarBtn.style.display = "none";
    }

    // ==========================================
    // 6. EQUIPACIÓN OBLIGATORIA
    // ==========================================
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

    // ==========================================
    // 7. RECORDATORIOS Y PIE DE PÁGINA
    // ==========================================
    setElementText("txtAgua", CONFIG.aguaTexto || "Botella de agua personal");
    setElementText("txtValores", CONFIG.valoresTexto || "Respeto y apoyo incondicional");
    setElementText("txtFooterEquipo", (CONFIG.miEquipo || "").toUpperCase());

    // Escaneo de fotos de la instalación desde GitHub API
    const carpetaFotos = (datosLugar && datosLugar.carpeta) ? datosLugar.carpeta : "";
    escanearFotosGitHub(carpetaFotos, function(fotosEncontradas) {
      initCarousel(fotosEncontradas);
    });

  } catch (err) {
    showError("Error procesando la convocatoria: " + err.message);
  }
}

// ==========================================
// FUNCIONES AUXILIARES GLOBALMENTE DISPONIBLES
// ==========================================

async function escanearFotosGitHub(subcarpeta, callback) {
  if (!subcarpeta || !CONFIG.githubUser || !CONFIG.githubRepo) {
    callback([]);
    return;
  }

  const rutaBase = `imagenes/lugares/${subcarpeta}`;
  const apiUrl = `https://api.github.com/repos/${CONFIG.githubUser}/${CONFIG.githubRepo}/contents/${rutaBase}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      callback([]);
      return;
    }

    const files = await response.json();
    const extensiones = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
    const fotosValidas = files
      .filter(file => file.type === 'file' && extensiones.some(ext => file.name.toLowerCase().endsWith(ext)))
      .map(file => `${rutaBase}/${file.name}`);

    callback(fotosValidas);
  } catch (err) {
    console.warn("No se pudieron consultar las fotos vía API de GitHub:", err);
    callback([]);
  }
}

function calcularHoraCitacion(horaStr, minutosResta) {
  if (!horaStr) return null;
  const match = horaStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;

  let hrs = parseInt(match[1], 10);
  let mins = parseInt(match[2], 10);

  let totalMins = hrs * 60 + mins - minutosResta;
  if (totalMins < 0) totalMins += 24 * 60;

  let newHrs = Math.floor(totalMins / 60) % 24;
  let newMins = totalMins % 60;

  const pad = n => n < 10 ? '0' + n : n;
  return `${pad(newHrs)}:${pad(newMins)} h`;
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

// Detección de estado de red (Online / Offline)
function actualizarEstadoRed() {
  const banner = document.getElementById("errorBanner");
  const msgEl = document.getElementById("errorMessage");

  if (!navigator.onLine) {
    if (banner && msgEl) {
      banner.style.display = "block";
      banner.style.background = "#d97706";
      msgEl.textContent = "⚠️ Estás sin conexión. Mostrando la información guardada en tu teléfono.";
    }
  } else {
    if (banner) banner.style.display = "none";
  }
}

window.addEventListener('online', actualizarEstadoRed);
window.addEventListener('offline', actualizarEstadoRed);