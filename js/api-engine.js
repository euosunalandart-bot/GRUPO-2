"use strict";

/**
 * Valida que el parámetro id sea un texto no vacío.
 *
 * @param {string} id - Identificador que se desea validar.
 * @returns {string} El identificador validado.
 * @throws {Error} Si el parámetro id no es un texto o está vacío.
 */
function validarParametroConsulta(id) {
  if (typeof id !== "string" || id.trim() === "") {
    throw new Error("El parámetro id debe ser un texto no vacío");
  }

  return id;
}

/**
 * Carga datos desde una URL y gestiona los posibles errores.
 *
 * @param {string} id - Identificador utilizado para construir la URL de consulta.
 * @throws {Error} Si la respuesta HTTP no es correcta.
 */
function cargarDatosRemotos(id) {
  try {
    const idValidado = validarParametroConsulta(id);

    fetch(`https://jsonplaceholder.typicode.com/posts/${idValidado}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error HTTP: " + response.status);
        }

        return response.json();
      })

      .then((datos) => {
        console.log("Datos recibidos:", datos);
      })

      .catch((error) => {
        console.error("Error en la petición:", error.message);
      });
  } catch (error) {
    console.error("Error de validación:", error.message);
  } finally {
    console.log("La validación ha terminado.");
  }
}

cargarDatosRemotos("1");
