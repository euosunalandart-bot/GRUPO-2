"use strict";

//PRÁCTICA 1 DEL TEMA 6 PARTE 8

// Paso 2: Buscar el contenedor principal
const contenedor = document.querySelector("#contenedor-catalogo");
console.log(contenedor);

// Paso 3: Buscar todos los botones
const botones = document.querySelectorAll(".btn-primario");
console.log(botones);

// Paso 4: Comprobar los resultados
console.log(contenedor !== null);
console.log(botones.length);

// Paso 5: Recorrer los botones
botones.forEach((boton) => {
  console.log(boton.textContent);
});

// Paso 6: Consultar los datos del documento
console.log(document.title);
console.log(document.URL);

//PRACTICA 3

// Paso 1. Crear el objeto de datos
const servicio = {
  id: 101,
  nombre: "Pista de tenis",
};

// Paso 2. Crear la función que construye la tarjeta
function crearTarjetaDom(servicio) {
  const tarjeta = document.createElement("div");

  tarjeta.classList.add("card-instalacion");

  // Paso 3. Asignar el identificador
  tarjeta.dataset.id = servicio.id;

  // Paso 4. Crear el título de la tarjeta
  const titulo = document.createElement("h3");

  titulo.textContent = servicio.nombre;

  // Paso 5. Montar el título y devolver la tarjeta
  tarjeta.appendChild(titulo);

  return tarjeta;
}

// Paso 6. Probar la función
const nuevaTarjeta = crearTarjetaDom(servicio);

console.log(nuevaTarjeta);

// Paso 7. Añadir la tarjeta a la página
const contenedores = document.querySelector("#contenedores-instalaciones");

if (contenedores) {
  contenedores.appendChild(nuevaTarjeta);
}

//ULTIMA PRÁCTICA
