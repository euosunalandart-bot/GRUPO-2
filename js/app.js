"use strict";

/**
 * GilenaApp - Módulo de Deportes (Grupo 1)
 * Lógica principal de la aplicación: Arrays, Métodos avanzados, LocalStorage,
 * Estructuras de control, DOM Dinámico, Objetos Math/String y Funciones.
 */

// 1. ARRAY DE OBJETOS: Catálogo inicial de instalaciones deportivas
let pistas = [
  {
    id: 1,
    nombre: "Pista Central de Pádel",
    tipo: "aire libre",
    precio: 12.5,
    disponible: true,
  },
  {
    id: 2,
    nombre: "Pista de Fútbol Sala",
    tipo: "aire libre",
    precio: 25.0,
    disponible: true,
  },
  {
    id: 3,
    nombre: "Pista de Tenis Municipal",
    tipo: "aire libre",
    precio: 10.0,
    disponible: true,
  },
  {
    id: 4,
    nombre: "Pabellón Cubierto",
    tipo: "cubierto",
    precio: 30.0,
    disponible: true,
  },
  {
    id: 5,
    nombre: "Pista de Voleibol",
    tipo: "aire libre",
    precio: 8.0,
    disponible: true,
  },
];

// 2. MÉTODOS DE ARRAYS (.map()): Normalización de datos (limpieza de espacios y minúsculas)
pistas = pistas.map((pista) => ({
  ...pista,
  nombre: pista.nombre.trim(),
  tipo: pista.tipo.trim().toLowerCase(),
}));

// 3. LOCALSTORAGE (Persistencia): Guardar y recuperar datos en el navegador
function guardarEnLocalStorage() {
  localStorage.setItem("reservas_gilena_v12", JSON.stringify(pistas));
}

function cargarDesdeLocalStorage() {
  const datosGuardados = localStorage.getItem("reservas_gilena_v12");
  if (datosGuardados) {
    try {
      pistas = JSON.parse(datosGuardados);
    } catch (e) {
      console.error("Error al parsear localStorage:", e);
    }
  } else {
    guardarEnLocalStorage();
  }
}

cargarDesdeLocalStorage();

// Demostración de MÉTODOS DE ARRAYS en consola (.filter, .find, .some, .reduce)
console.log("--- MÉTODOS DE ARRAYS ---");
console.log(
  "Disponibles (.filter):",
  pistas.filter((p) => p.disponible),
);
console.log(
  "Nombres (.map):",
  pistas.map((p) => p.nombre),
);
console.log(
  "Buscar ID 2 (.find):",
  pistas.find((p) => p.id === 2),
);
console.log(
  "¿Hay alguna libre? (.some):",
  pistas.some((p) => p.disponible),
);
console.log(
  "Coste total catálogo (.reduce):",
  pistas.reduce((acc, p) => acc + p.precio, 0).toFixed(2),
  "€",
);

// 4. HOISTING Y FUNCTION DECLARATION: Cálculo del importe base
function calcularImportePista(
  precioHora = 12.5,
  horas = 1,
  esEmpadronado = false,
  luzSuplementaria = false,
) {
  if (precioHora <= 0 || horas <= 0) return 0;
  let subtotal = precioHora * horas;
  if (esEmpadronado) subtotal -= subtotal * 0.2;
  if (luzSuplementaria) subtotal += 2.5 * horas;
  return subtotal;
}

// 5. ARROW FUNCTIONS Y VALIDACIÓN DE AFORO
const evaluarDisponibilidad = (aforoActual = 0, aforoMaximo = 4) => {
  return aforoActual < aforoMaximo;
};

// 6. FUNCIÓN RECURSIVA: Simulación de temporizador para la asignación
function simularCronometroAsignacion(segundosRestantes) {
  if (segundosRestantes <= 0) {
    console.log("¡Asignación completada con éxito!");
    return; // Caso base
  }
  console.log(`Asignando pista... Quedan ${segundosRestantes} segundos.`);
  setTimeout(() => simularCronometroAsignacion(segundosRestantes - 1), 1000); // Llamada recursiva
}

// 7. OBJETO MATH Y MÉTODOS DE STRINGS: Generador de localizador de reserva único
function generarLocalizadorReserva() {
  let letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let letraAleatoria1 = letras.charAt(
    Math.floor(Math.random() * letras.length),
  );
  let letraAleatoria2 = letras.charAt(
    Math.floor(Math.random() * letras.length),
  );
  let numeroAleatorio = Math.floor(Math.random() * 9000) + 1000; // Número aleatorio de 4 cifras
  return `${letraAleatoria1}${letraAleatoria2}-${numeroAleatorio}`;
}

// 8. ESTRUCTURA SWITCH: Control de perfiles de usuario y Login
let rolUsuario = "CIUDADANO";

function evaluarRolUsuario(rol) {
  switch (rol) {
    case "CIUDADANO":
      console.log("Perfil: Ciudadano - Consulta y reserva de instalaciones.");
      break;
    case "GESTOR":
      console.log("Perfil: Gestor - Validación de reservas y turnos.");
      break;
    case "ADMIN":
      console.log("Perfil: Administrador - Control total del sistema.");
      break;
    default:
      console.log("Perfil no autorizado.");
  }
}

function cambiarRolUsuario() {
  const selectRol = document.getElementById("select-rol");
  if (!selectRol) return;

  const nuevoRol = selectRol.value;

  if (nuevoRol === "GESTOR" || nuevoRol === "ADMIN") {
    const pantalla = document.getElementById("pantalla-login");
    document.getElementById("titulo-login").innerText = `Acceso: ${nuevoRol}`;
    pantalla.classList.remove("oculto"); // Muestra la pantalla
  } else {
    rolUsuario = nuevoRol;
    evaluarRolUsuario(rolUsuario);
  }
}

function procesarLogin(event) {
  event.preventDefault();

  const usuario = document.getElementById("input-usuario").value;
  const pass = document.getElementById("input-pass").value;
  const selectRol = document.getElementById("select-rol");
  const rolIntentado = selectRol.value;

  // Credenciales de prueba
  if (usuario === "admin" && pass === "1234") {
    alert(`¡Autenticación correcta! Bienvenido al panel de ${rolIntentado}.`);
    rolUsuario = rolIntentado;
    evaluarRolUsuario(rolUsuario);

    document.getElementById("pantalla-login").classList.add("oculto"); // Oculta la pantalla
    document.getElementById("form-login").reset();
  } else {
    alert("Usuario o contraseña incorrectos.");
    cancelarLogin();
  }
}

function cancelarLogin() {
  const selectRol = document.getElementById("select-rol");
  const pantalla = document.getElementById("pantalla-login");

  selectRol.value = "CIUDADANO";
  rolUsuario = "CIUDADANO";
  evaluarRolUsuario(rolUsuario);

  pantalla.classList.add("oculto"); // Oculta la pantalla
  document.getElementById("form-login").reset();
}

// 9. DOM DINÁMICO Y RENDERIZADO DE TARJETAS
function renderizarPistas(listaPistas) {
  const contenedor = document.getElementById("contenedor-catalogo");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  listaPistas.forEach((pista) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = `tarjeta-card ${pista.disponible ? "tarjeta-libre" : "tarjeta-ocupada"}`;

    tarjeta.innerHTML = `
            <h3>${pista.nombre}</h3>
            <p><strong>Tipo:</strong> ${pista.tipo.toUpperCase()}</p>
            <p><strong>Precio por hora:</strong> ${pista.precio.toFixed(2)} €</p>
            <p><strong>Estado:</strong> <span class="badge-estado ${pista.disponible ? "badge-verde" : "badge-rojo"}">${pista.disponible ? "LIBRE" : "OCUPADO"}</span></p>
            <button 
    class="btn-primario btn-reserva" 
    data-id="${pista.id}"
    onclick="seleccionarParaReservar(${pista.id})">
    ${pista.disponible ? "Seleccionar para Reservar" : "No disponible"}
</button>
        `;
    contenedor.appendChild(tarjeta);
  });
}

function filtrarInstalacionesPorSelect() {
  const tipoSeleccionado = document
    .getElementById("filtro-deporte")
    .value.toLowerCase();
  if (tipoSeleccionado === "todos") {
    renderizarPistas(pistas);
  } else {
    const filtradas = pistas.filter((p) => p.tipo === tipoSeleccionado);
    renderizarPistas(filtradas);
  }
}

function seleccionarParaReservar(id) {
  const pistaActual = pistas.find((p) => p.id === id);
  if (!pistaActual || !pistaActual.disponible) {
    alert("Lo sentimos, esta instalación se encuentra ocupada.");
    return;
  }

  const inputFormInstalacion = document.getElementById("input-instalacion");
  if (inputFormInstalacion) inputFormInstalacion.value = pistaActual.nombre;

  document
    .getElementById("seccion-formulario")
    .scrollIntoView({ behavior: "smooth" });
}

// 10. BUCLES (for) Y SENTENCIA DE SALTO (continue) PARA TURNOS
function renderizarTurnos() {
  const contenedorManana = document.getElementById("lista-turnos-manana");
  const contenedorTarde = document.getElementById("lista-turnos-tarde");
  if (!contenedorManana || !contenedorTarde) return;

  let htmlManana = "";
  let htmlTarde = "";

  for (let hora = 9; hora <= 21; hora++) {
    let horaStr = hora < 10 ? `0${hora}:00` : `${hora}:00`;
    let horaSiguiente = hora + 1 < 10 ? `0${hora + 1}:00` : `${hora + 1}:00`;
    let itemHtml = "";

    if (hora === 11 || hora === 19) {
      itemHtml = `<div class="turno-item turno-ocupado">Franja ${horaStr} - ${horaSiguiente} h: [OCUPADO / Descanso de Personal]</div>`;
    } else {
      itemHtml = `<div class="turno-item">Turno disponible: ${horaStr} - ${horaSiguiente} h</div>`;
    }

    if (hora < 12) {
      htmlManana += itemHtml;
    } else {
      htmlTarde += itemHtml;
    }
  }

  contenedorManana.innerHTML = htmlManana;
  contenedorTarde.innerHTML = htmlTarde;
}

// 11. GESTIÓN DE FORMULARIOS Y EVENTOS (preventDefault)
function enviarReservaFormulario(event) {
  event.preventDefault();

  const nombreInstalacion = document.getElementById("input-instalacion").value;
  const horaInicio = document.getElementById("input-hora-inicio").value;
  const fecha = document.getElementById("input-fecha").value;

  // 1. Validar horas de descanso
  if (horaInicio === "11:00" || horaInicio === "19:00") {
    alert(
      "Ese turno está reservado para el descanso del personal. Por favor, elige otra hora.",
    );
    return;
  }

  // 2. Validar fechas pasadas
  const fechaHoy = new Date().toISOString().split("T")[0];
  if (fecha < fechaHoy) {
    alert("No puedes realizar una reserva en una fecha pasada.");
    return;
  }

  const esEmpadronado = document.getElementById("input-empadronado").checked;
  const luzSuplementaria = document.getElementById("input-luz").checked;

  const pistaEncontrada = pistas.find((p) => p.nombre === nombreInstalacion);
  let precioBase = pistaEncontrada ? pistaEncontrada.precio : 12.5;

  if (pistaEncontrada) {
    pistaEncontrada.disponible = false;
    guardarEnLocalStorage();
    renderizarPistas(pistas);
  }

  let costeTotal = calcularImportePista(
    precioBase,
    1,
    esEmpadronado,
    luzSuplementaria,
  );
  let localizador = generarLocalizadorReserva();
  simularCronometroAsignacion(3);

  alert(
    `¡Reserva completada con éxito!\n\nLocalizador: ${localizador}\nInstalación: ${nombreInstalacion}\nFecha: ${fecha}\nTurno: ${horaInicio} h (1 hora)\nEmpadronado: ${esEmpadronado ? "Sí (20% dto.)" : "No"}\nLuz suplementaria: ${luzSuplementaria ? "Sí (+2,50 €)" : "No"}\nTotal a pagar: ${costeTotal.toFixed(2)} €`,
  );
}

// INICIALIZACIÓN AL CARGAR EL DOM
document.addEventListener("DOMContentLoaded", () => {
  evaluarRolUsuario(rolUsuario);
  renderizarPistas(pistas);
  renderizarTurnos();
});
