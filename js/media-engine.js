"use strict";

const MIME = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",

  mp3: "audio/mpeg",
  ogg: "audio/ogg",
  wav: "audio/wav",

  mp4: "video/mp4",
  webm: "video/webm",

  vtt: "text/vtt",
};

const TIPOS = ["imagen", "audio", "video"];
const AMBITOS = ["deportes", "cultura", "municipal"];

const LICENCIAS_OK = [
    "CC0",
    "CC-BY",
    "CC-BY-NC",
    "Pexels",
    "Pixabay",
    "Unsplash",
    "propia"
];

const OBLIGATORIOS = [
  "id",
  "tipo",
  "ambito",
  "titulo",
  "archivo",
  "formatos",
  "autor",
  "licencia",
  "fuente",
  "pesoOriginalKB",
];

const PRESUPUESTO_KB = 800; // Etapa 2
const RUTA_MEDIA = 'media';
const PRIORIDAD = { probably: 2, maybe: 1, no: 0 };

let recursos = [];

/**
 * Comprueba si el usuario prefiere reducir las animaciones.
 */
function movimientoReducido() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Carga el manifiesto desde una URL.
 */
function cargarManifiesto(url) {
  return fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
  });
}

/**
 * Valida un recurso del manifiesto.
 */
function validarRecurso(r) {
  const errores = [];

  OBLIGATORIOS.forEach((campo) => {
    if (r[campo] === undefined || r[campo] === null || r[campo] === "") {
      errores.push(`falta "${campo}"`);
    }
  });

  if (!TIPOS.includes(r.tipo)) {
    errores.push(`tipo "${r.tipo}" no permitido`);
  }

  if (!AMBITOS.includes(r.ambito)) {
    errores.push(`ámbito "${r.ambito}" no permitido`);
  }

  if (Array.isArray(r.formatos)) {
    r.formatos.forEach((formato) => {
      if (!MIME[formato]) {
        errores.push(`formato .${formato} sin MIME conocido`);
      }
    });
  }

  if (!LICENCIAS_OK.includes(r.licencia)) {
    errores.push(`licencia ${r.licencia} no admitida`);
  }

  if (r.tipo === "imagen") {
    if (typeof r.alt !== "string" || r.alt.trim().length < 15) {
      errores.push("alt insuficiente");
    }
  }

  return errores;
}

/**
 * Calcula el % de ahorro de la mejor versión web frente al original.
 */
function ahorroRecurso(r) {
  const mejor = Math.min(...Object.values(r.pesosKB));
  return Math.round((1 - mejor / r.pesoOriginalKB) * 100);
}

function pesoPagina(lista, formato, ancho) {
  return lista
    .filter(r => r.tipo === "imagen")
    .reduce((total, r) => total + (r.pesosKB[`${formato}-${ancho}`] || 0), 0);
}

function informePeso(lista) {
  const tabla = lista
    .filter(r => r.tipo === "imagen")
    .map(r => ({
      id: r.id,
      originalKB: r.pesoOriginalKB,
      webp1200: r.pesosKB["webp-1200"],
      ahorro: `${ahorroRecurso(r)}%`
    }))
    .toSorted((a, b) => b.webp1200 - a.webp1200);
  
  console.table(tabla);

  const total = pesoPagina(lista, "webp", 1200);
  const exceso = total > PRESUPUESTO_KB;
  const caja = document.querySelector("#peso-galeria");

  if (caja) {
    caja.textContent = 
      `Galería: ${total} KB de ${PRESUPUESTO_KB} KB · ` +
      (exceso ? "¡supera el presupuesto!" : "dentro del presupuesto");
    caja.classList.toggle("estado--aviso", exceso);
  }

  return total;
}

/**
 * Reinicia una animación CSS forzando un reflow en el navegador.
 */
function reiniciarAnimacion(el) {
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
}

/**
 * Muestra el estado de la mediateca.
 */
function mostrarEstado(texto, tipo) {
  const caja = document.querySelector("#estado-mediateca");
  if (!caja) return;

  caja.textContent = texto;
  caja.className = `estado estado--${tipo}`;

  if (tipo === 'error') {
      reiniciarAnimacion(caja);
  }
}

// ==========================================
// ETAPA 5: MOTORES MULTIMEDIA Y COMPATIBILIDAD
// ==========================================

function soporteFormatos(r) {
  const prueba = document.createElement(r.tipo);
  return r.formatos.map(f => ({
    id: r.id,
    formato: f,
    mime: MIME[f],
    soporte: prueba.canPlayType(MIME[f]) || 'no',
    kb: r.pesosKB[f]
  }));
}

function ordenarFuentes(r) {
  return soporteFormatos(r)
    .filter(x => x.soporte !== 'no')
    .toSorted((a, b) => 
      PRIORIDAD[b.soporte] - PRIORIDAD[a.soporte] || a.kb - b.kb
    );
}

function crearFuentes(elemento, r) {
  const fuentes = ordenarFuentes(r);
  
  if (fuentes.length === 0) {
    throw new Error(`${r.id}: ningún formato compatible`);
  }
  
  fuentes.forEach(f => {
    const source = document.createElement('source');
    source.src = `${RUTA_MEDIA}/${r.archivo}.${f.formato}`;
    source.type = f.mime;
    elemento.append(source);
  });
  
  return elemento.lastElementChild;
}

function informeCompatibilidad(lista) {
  const filas = lista.filter(r => r.tipo !== 'imagen')
                     .flatMap(soporteFormatos);
  console.table(filas);
  return filas;
}

// ==========================================
// ETAPA 6: REPRODUCTOR DE AUDIO
// ==========================================

const reproductores = [];

/**
 * Convierte segundos a formato MM:SS (unificado para audio y vídeo si procede)
 */
function formatoTiempo(seg) {
    if (!Number.isFinite(seg) || seg < 0) return '0:00';
    const min = Math.floor(seg / 60);
    const s = String(Math.floor(seg % 60)).padStart(2, '0');
    return `${min}:${s}`;
}

function pausarOtros(activo) {
    reproductores.forEach(a => { 
        if (a !== activo) a.pause(); 
    });
}

function crearReproductorAudio(r) {
    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    
    crearFuentes(audio, r); 
    reproductores.push(audio);

    const tarjeta = document.createElement('article');
    tarjeta.className = 'audio';
    tarjeta.dataset.id = r.id;

    tarjeta.innerHTML = `
        <button class="audio__play" type="button">▶</button>
        <div class="audio__cuerpo">
            <p class="audio__titulo"></p>
            <div class="audio__eq" aria-hidden="true">
                <i></i><i></i><i></i>
            </div>
            <input class="audio__progreso" type="range" min="0" max="100" step="0.1" value="0" aria-label="Posición">
            <span class="audio__tiempo">0:00 / 0:00</span>
        </div>
        <input class="audio__volumen" type="range" min="0" max="1" step="0.05" value="0.8" aria-label="Volumen">
        <p class="audio__credito"></p>
    `;

    const $ = sel => tarjeta.querySelector(sel);
    const btn = $('.audio__play');
    const barra = $('.audio__progreso');
    const tiempo = $('.audio__tiempo');

    $('.audio__titulo').textContent = r.titulo;
    $('.audio__credito').textContent = `${r.autor} · ${r.licencia}`;
    btn.setAttribute('aria-label', `Reproducir: ${r.titulo}`);
    audio.volume = 0.8;

    const pintarTiempo = () => {
        const t = formatoTiempo(audio.currentTime);
        const dur = formatoTiempo(audio.duration);
        tiempo.textContent = `${t} / ${dur}`;
    };

    btn.addEventListener('click', () => {
        if (audio.paused) {
            pausarOtros(audio);
            audio.play().catch(err => {
                mostrarEstado(`No se pudo reproducir «${r.titulo}» (${err.name})`, 'aviso');
            });
        } else {
            audio.pause();
        }
    });

    audio.addEventListener('play', () => {
        tarjeta.classList.add('audio--sonando');
        btn.textContent = '⏸';
        btn.setAttribute('aria-label', `Pausar: ${r.titulo}`);
    });

    audio.addEventListener('pause', () => {
        tarjeta.classList.remove('audio--sonando');
        btn.textContent = '▶';
        btn.setAttribute('aria-label', `Reproducir: ${r.titulo}`);
    });

    audio.addEventListener('loadedmetadata', pintarTiempo);

    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            barra.value = (audio.currentTime / audio.duration) * 100;
        }
        pintarTiempo();
    });

    audio.addEventListener('ended', () => { 
        audio.currentTime = 0; 
    });

    barra.addEventListener('input', () => {
        if (audio.duration) {
            audio.currentTime = (barra.value / 100) * audio.duration;
        }
    });

    $('.audio__volumen').addEventListener('input', e => {
        audio.volume = Number(e.target.value);
    });

    tarjeta.append(audio);
    return tarjeta;
}

function renderAudios(lista) {
    const cont = document.querySelector('#audios');
    if (!cont) return;

    const frag = document.createDocumentFragment();
    lista.filter(r => r.tipo === 'audio').forEach(r => {
        try { 
            frag.append(crearReproductorAudio(r)); 
        } catch (err) { 
            console.warn(`Error al crear audio ${r.id}:`, err.message); 
        }
    });
    cont.replaceChildren(frag);
}

// ==========================================
// ETAPA 7: VIDEOTECA Y LISTA DE REPRODUCCIÓN
// ==========================================

const videoEl = document.querySelector("#video-principal");
const listaVideosEl = document.querySelector("#lista-videos");
const tituloVideoEl = document.querySelector("#titulo-video");
const avisoVideoEl = document.querySelector("#aviso-video");

let videos = [];
let videoActual = 0;

function avisoVideo(texto) {
    if (!avisoVideoEl) return;
    avisoVideoEl.textContent = texto;
    avisoVideoEl.hidden = !texto;
}

function leerDuracion(recurso, destino) {
    const sonda = document.createElement("video");
    sonda.preload = "metadata";

    sonda.addEventListener("loadedmetadata", () => {
        destino.textContent = formatoTiempo(sonda.duration);
    }, { once: true });

    sonda.addEventListener("error", () => {
        destino.textContent = "--:--";
    }, { once: true });

    try {
        crearFuentes(sonda, recurso);
        sonda.load();
    } catch (error) {
        destino.textContent = "--:--";
    }
}

function renderListaVideos(lista) {
    videos = lista.filter(recurso => recurso.tipo === "video");
    const fragmento = document.createDocumentFragment();

    videos.forEach((recurso, indice) => {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.dataset.indice = indice;
        boton.textContent = `${recurso.titulo} · `;

        const duracion = document.createElement("span");
        duracion.textContent = "--:--";

        boton.append(duracion);

        const elemento = document.createElement("li");
        elemento.append(boton);
        fragmento.append(elemento);

        leerDuracion(recurso, duracion);
    });

    if (listaVideosEl) {
        listaVideosEl.replaceChildren(fragmento);
    }
}

function cargarVideo(indice, reproducir = false) {
    const recurso = videos[indice];
    if (!recurso || !videoEl) return;

    videoActual = indice;
    videoEl.pause();
    videoEl.replaceChildren();
    avisoVideo("");

    videoEl.poster = recurso.poster ? `${RUTA_MEDIA}/${recurso.poster}` : "";

    try {
        const ultimaFuente = crearFuentes(videoEl, recurso);

        ultimaFuente.addEventListener("error", () => {
            avisoVideo("No se pudo cargar el vídeo. Comprueba sus archivos y formatos.");
        });

        videoEl.load();

        if (tituloVideoEl) {
            tituloVideoEl.textContent = `${recurso.titulo} — ${recurso.autor} · ${recurso.licencia}`;
        }

        if (listaVideosEl) {
            listaVideosEl.querySelectorAll("button").forEach((boton, i) => {
                if (i === indice) {
                    boton.setAttribute("aria-current", "true");
                } else {
                    boton.removeAttribute("aria-current");
                }
            });
        }

        if (reproducir) {
            videoEl.play().catch(() => {
                avisoVideo("Pulsa el botón de reproducción para iniciar el vídeo.");
            });
        }
    } catch (error) {
        avisoVideo(error.message);
    }
}

function iniciarVideoteca(lista) {
    renderListaVideos(lista);

    if (videos.length === 0) {
        avisoVideo("No hay vídeos válidos en el manifiesto.");
        return;
    }

    cargarVideo(0);

    if (listaVideosEl) {
        listaVideosEl.addEventListener("click", evento => {
            const boton = evento.target.closest("button[data-indice]");
            if (boton && listaVideosEl.contains(boton)) {
                cargarVideo(Number(boton.dataset.indice), true);
            }
        });
    }

    if (videoEl) {
        videoEl.addEventListener("ended", () => {
            if (videoActual < videos.length - 1) {
                cargarVideo(videoActual + 1, true);
            }
        });
    }
}

// ==========================================
// ETAPA 10: CIFRAS ANIMADAS Y CARGADOR LOTTIE
// ==========================================

const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

function animarNumero(el, destino, ms = 900, dec = 0) {
    if (!el) return;

    if (movimientoReducido()) {
        el.textContent = destino.toFixed(dec);
        return;
    }

    let inicio = null;

    function paso(ahora) {
        if (inicio === null) inicio = ahora;
        const t = Math.min((ahora - inicio) / ms, 1);
        const valor = destino * easeOutCubic(t);

        el.textContent = valor.toFixed(dec);

        if (t < 1) {
            requestAnimationFrame(paso);
        }
    }

    requestAnimationFrame(paso);
}

function mostrarResumen(lista) {
    const conPeso = lista.filter(r =>
        Number.isFinite(r.pesoOriginalKB) &&
        r.pesoOriginalKB > 0 &&
        r.pesosKB &&
        Object.values(r.pesosKB).some(p => Number.isFinite(p) && p >= 0)
    );

    const ahorroKB = conPeso.reduce((total, r) => {
        const pesos = Object.values(r.pesosKB).filter(p => Number.isFinite(p) && p >= 0);
        if (pesos.length === 0) return total;
        const mejorPeso = Math.min(...pesos);
        return total + Math.max(0, r.pesoOriginalKB - mejorPeso);
    }, 0);

    const originalKB = conPeso.reduce((total, r) => total + r.pesoOriginalKB, 0);
    const porcentaje = originalKB > 0 ? (ahorroKB / originalKB) * 100 : 0;

    animarNumero(document.querySelector("#cifra-recursos"), lista.length);
    animarNumero(document.querySelector("#cifra-mb"), ahorroKB / 1024, 900, 1);
    animarNumero(document.querySelector("#cifra-pct"), porcentaje, 900, 1);
}

function iniciarCargador() {
    const contenedor = document.querySelector(".carga");
    const cargador = document.querySelector("#cargador");
    if (!contenedor || !cargador) return;

    contenedor.hidden = false;
    cargador.hidden = false;

    if (movimientoReducido()) {
        cargador.removeAttribute("autoplay");
        if (typeof cargador.stop === "function") cargador.stop();
    } else {
        cargador.setAttribute("autoplay", "");
        if (typeof cargador.play === "function") cargador.play();
    }
}

function ocultarCargador() {
    const contenedor = document.querySelector(".carga");
    const cargador = document.querySelector("#cargador");

    if (cargador) {
        if (typeof cargador.stop === "function") cargador.stop();
        cargador.hidden = true;
    }
    if (contenedor) {
        contenedor.hidden = true;
    }
}

// ==========================================
// INICIALIZACIÓN PRINCIPAL
// ==========================================

function iniciarMediateca() {
    iniciarCargador();

    cargarManifiesto("media/manifest.json")
        .then((datos) => {
            const lista = Array.isArray(datos.recursos) ? datos.recursos : [];

            const informe = lista.map((recurso) => {
                const errores = validarRecurso(recurso);
                return {
                    id: recurso.id,
                    tipo: recurso.tipo,
                    valido: errores.length === 0,
                    errores: errores.join(" · ")
                };
            });

            console.table(informe);

            recursos = lista.filter((recurso, indice) => informe[indice].valido);

            const total = informe.length;
            const validos = recursos.length;
            const errores = total - validos;

            mostrarEstado(
                `${total} recursos · ${validos} válidos · ${errores} con errores`,
                errores === 0 ? "ok" : "aviso"
            );

            informePeso(recursos);
            informeCompatibilidad(recursos);
            mostrarResumen(recursos);

            // Renderizado de las diferentes secciones (Etapa 6 y Etapa 7)
            renderAudios(recursos);
            iniciarVideoteca(recursos);
        })
        .catch((error) => {
            mostrarEstado(`No se pudo cargar la mediateca: ${error.message}`, "error");
            console.error("Error al cargar la mediateca:", error);
            avisoVideo(error.message);
        })
        .finally(() => {
            ocultarCargador();
        });
}

document.addEventListener("DOMContentLoaded", iniciarMediateca);