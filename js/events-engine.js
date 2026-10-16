"use strict";

console.log("Archivo events-engine.js cargado");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM preparado");

  // ============================================================
  // PASO 1 - LOCALIZAR ELEMENTOS PRINCIPALES
  // ============================================================

  const formulario = document.querySelector("#form-reserva");
  const grid = document.querySelector("#contenedor-catalogo");
  const inputFiltro = document.querySelector("#filtro-busqueda");

  console.log("Formulario:", formulario);
  console.log("Grid:", grid);
  console.log("Filtro:", inputFiltro);

  // ============================================================
  // PASO 2 - CAPTURA DEL FORMULARIO
  // ============================================================

  if (formulario) {
    formulario.addEventListener("submit", function (event) {
      event.preventDefault();

      console.log("Submit interceptado correctamente");

      const instalacion = document
        .querySelector("#input-instalacion")
        .value.trim();

      const fecha = document.querySelector("#input-fecha").value.trim();

      const hora = document.querySelector("#input-hora-inicio").value;

      const empadronado = document.querySelector("#input-empadronado").checked;

      const luz = document.querySelector("#input-luz").checked;

      const reserva = {
        instalacion: instalacion,
        fecha: fecha,
        hora: hora,
        empadronado: empadronado,
        luz: luz,
      };

      console.log("Reserva capturada:", reserva);
    });

    console.log("Listener del formulario registrado");
  }

  // ============================================================
  // PASO 3 - DELEGACIÓN DE EVENTOS
  // ============================================================

  if (grid) {
    grid.addEventListener("click", function (event) {
      const boton = event.target.closest(".btn-reserva");

      if (boton) {
        const idPista = boton.dataset.id;

        const tarjeta = boton.closest(".tarjeta-card");

        console.log("Botón encontrado:", boton);
        console.log("Tarjeta encontrada:", tarjeta);
        console.log("Reserva delegada, pista ID:", idPista);

        // Buscar la pista correspondiente en el array
        const pista = pistas.find((p) => p.id === Number(idPista));

        if (pista) {
          console.log("Pista seleccionada:", pista);
        }
      }
    });

    console.log("Delegación de eventos preparada");
  }

  // ============================================================
  // PASO 4 - BUSCADOR EN TIEMPO REAL
  // ============================================================

  if (inputFiltro) {
    inputFiltro.addEventListener("input", function (event) {
      const texto = event.target.value.toLowerCase().trim();

      const resultados = pistas.filter((pista) =>
        pista.nombre.toLowerCase().includes(texto),
      );

      renderizarPistas(resultados);

      console.log("Texto buscado:", texto);
      console.log("Resultados:", resultados);
    });

    console.log("Buscador en tiempo real preparado");
  }

  // ============================================================
  // PASO 5 - MENSAJE FINAL
  // ============================================================

  console.log("Módulo events-engine.js cargado correctamente");
  console.log("Persistencia disponible mediante LocalStorage");
});
