const config = {
  sidebarImage: "assets/vertical/side.jpg",

  galleryImages: [
    "assets/carousel/01.jpeg",
    "assets/carousel/02.jpeg",
    "assets/carousel/03.jpeg",
    "assets/carousel/04.jpeg",
    "assets/carousel/05.jpeg",
    "assets/carousel/06.jpeg",
    "assets/carousel/07.jpeg",
    "assets/carousel/08.jpeg",
    "assets/carousel/09.jpeg"
  ],

  phrases: [
    "Lo simple también puede tener alma.",
    "Hay silencios que decoran mejor que mil cosas.",
    "La calma, cuando es tuya, se vuelve paisaje.",
    "A veces la belleza solo necesita espacio.",
    "Lo que te acompaña también te construye."
  ],

  phraseInterval: 20000,
  galleryFadeDuration: 420,
  galleryIntervalMin: 4500,
  galleryIntervalMax: 11000
};

const elements = {
  sidebarImage: document.getElementById("sidebarImage"),
  hora: document.getElementById("hora"),
  fecha: document.getElementById("fecha"),
  frase: document.getElementById("frase"),
  galleryCards: Array.from(document.querySelectorAll(".gallery-card"))
};

let phraseIndex = 0;
let galleryTimer = null;

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function actualizarTemaPorHora(fecha = new Date()) {
  const hora = fecha.getHours();
  const esDia = hora >= 7 && hora < 19;
  document.body.classList.toggle("theme-day", esDia);
  document.body.classList.toggle("theme-night", !esDia);
}

function actualizarReloj() {
  const ahora = new Date();

  const horaTexto = new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(ahora);

  const fechaTexto = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(ahora);

  elements.hora.textContent = horaTexto;
  elements.fecha.textContent = capitalizar(fechaTexto);
  actualizarTemaPorHora(ahora);
}

function iniciarFrases() {
  if (!config.phrases.length) {
    elements.frase.textContent = "";
    return;
  }

  elements.frase.textContent = config.phrases[0];
  requestAnimationFrame(() => {
    elements.frase.classList.add("visible");
  });

  phraseIndex = 1;

  setInterval(() => {
    elements.frase.classList.remove("visible");

    setTimeout(() => {
      elements.frase.textContent = config.phrases[phraseIndex];
      elements.frase.classList.add("visible");
      phraseIndex = (phraseIndex + 1) % config.phrases.length;
    }, 250);
  }, config.phraseInterval);
}

function configurarAssets() {
  elements.sidebarImage.src = config.sidebarImage;
}

function numeroAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function elementoAleatorio(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

function precargarGaleria() {
  config.galleryImages.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

function obtenerNombreImagen(src) {
  const nombre = src.split("/").pop().split(".")[0];
  return Number.parseInt(nombre, 10) || 0;
}

function asignarImagenGaleria(card, src) {
  const img = card.querySelector("img");
  if (!img) return;

  const numero = obtenerNombreImagen(src);
  img.src = src;
  img.alt = `Imagen destacada ${numero}`;
  card.dataset.gallerySrc = src;
}

function configurarGaleriaInicial() {
  elements.galleryCards.forEach((card, index) => {
    const src = config.galleryImages[index];
    if (src) {
      asignarImagenGaleria(card, src);
    }
  });
}

function obtenerImagenesVisibles() {
  return new Set(
    elements.galleryCards
      .map((card) => card.dataset.gallerySrc)
      .filter(Boolean)
  );
}

function programarCambioGaleria() {
  window.clearTimeout(galleryTimer);

  galleryTimer = window.setTimeout(() => {
    cambiarImagenGaleria();
  }, numeroAleatorio(config.galleryIntervalMin, config.galleryIntervalMax));
}

function cambiarImagenGaleria() {
  if (document.hidden || elements.galleryCards.length === 0) {
    programarCambioGaleria();
    return;
  }

  const card = elementoAleatorio(elements.galleryCards);
  const visibles = obtenerImagenesVisibles();
  const opciones = config.galleryImages.filter((src) => !visibles.has(src));

  if (opciones.length === 0) {
    programarCambioGaleria();
    return;
  }

  const siguienteImagen = elementoAleatorio(opciones);
  card.classList.add("is-changing");

  window.setTimeout(() => {
    asignarImagenGaleria(card, siguienteImagen);
    requestAnimationFrame(() => {
      card.classList.remove("is-changing");
    });
  }, config.galleryFadeDuration);

  programarCambioGaleria();
}

function iniciarGaleria() {
  if (config.galleryImages.length < elements.galleryCards.length) return;

  precargarGaleria();
  configurarGaleriaInicial();
  programarCambioGaleria();
}

function manejarVisibilidadGaleria() {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.clearTimeout(galleryTimer);
      return;
    }

    programarCambioGaleria();
  });
}

function init() {
  configurarAssets();

  actualizarReloj();
  setInterval(actualizarReloj, 1000);

  iniciarFrases();
  iniciarGaleria();
  manejarVisibilidadGaleria();
}

init();
