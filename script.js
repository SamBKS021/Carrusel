const config = {
  sidebarImage: "assets/vertical/side.jpg",
  particleDensity: 3100,
  particleMinCount: 78,
  particleMaxCount: 150,

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

  phraseInterval: 20000,
  galleryFadeDuration: 420,
  galleryIntervalMin: 4500,
  galleryIntervalMax: 11000
};

const elements = {
  sidebarImage: document.getElementById("sidebarImage"),
  particleCanvas: document.getElementById("particleCanvas"),
  hora: document.getElementById("hora"),
  fecha: document.getElementById("fecha"),
  frase: document.getElementById("frase"),
  fraseTexto: document.getElementById("fraseTexto"),
  fraseAutor: document.getElementById("fraseAutor"),
  galleryCards: Array.from(document.querySelectorAll(".gallery-card"))
};

let galleryTimer = null;
let frases = [];
let fraseActualIndex = -1;
let colaFrases = [];
let particles = [];
let particleAnimationId = null;
let particleContext = null;
let particleLastTime = 0;
let particleBounds = {
  width: 0,
  height: 0
};

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

function normalizarFrase(frase) {
  if (!frase) return null;

  const text = typeof frase.text === "string" ? frase.text : frase.frase;
  const author = typeof frase.author === "string" ? frase.author : frase.autor;

  if (typeof text !== "string" || typeof author !== "string") return null;

  const fraseLimpia = text.trim();
  const autorLimpio = author.trim();

  if (!fraseLimpia || !autorLimpio) return null;

  return {
    text: fraseLimpia,
    author: autorLimpio
  };
}

function cargarFrases() {
  const data = Array.isArray(window.quotes) ? window.quotes : [];
  frases = data.map(normalizarFrase).filter(Boolean);

  if (!frases.length) {
    console.warn("quotes.js no tiene frases validas.");
  }
}

function mostrarFrase(frase) {
  if (!frase) return;

  elements.fraseTexto.textContent = `“${frase.text}”`;
  elements.fraseAutor.textContent = frase.author;
}

function mezclar(lista) {
  const copia = [...lista];

  for (let index = copia.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copia[index], copia[randomIndex]] = [copia[randomIndex], copia[index]];
  }

  return copia;
}

function prepararColaFrases() {
  const indices = frases
    .map((_, index) => index)
    .filter((index) => index !== fraseActualIndex);

  colaFrases = mezclar(indices);
}

function obtenerFraseAleatoria() {
  if (!frases.length) return null;

  if (!colaFrases.length) {
    prepararColaFrases();
  }

  const siguienteIndex = colaFrases.pop();
  fraseActualIndex = siguienteIndex;
  return frases[siguienteIndex];
}

function iniciarFrases() {
  if (!frases.length) {
    elements.fraseTexto.textContent = "";
    elements.fraseAutor.textContent = "";
    elements.frase.classList.remove("visible");
    return;
  }

  mostrarFrase(obtenerFraseAleatoria());
  requestAnimationFrame(() => {
    elements.frase.classList.add("visible");
  });

  if (frases.length < 2) return;

  setInterval(() => {
    elements.frase.classList.remove("visible");

    setTimeout(() => {
      mostrarFrase(obtenerFraseAleatoria());
      elements.frase.classList.add("visible");
    }, 250);
  }, config.phraseInterval);
}

function configurarAssets() {
  elements.sidebarImage.src = config.sidebarImage;
}

function aleatorio(min, max) {
  return Math.random() * (max - min) + min;
}

function crearParticula(distribuirVerticalmente = false) {
  const height = particleBounds.height || 1;

  return {
    x: aleatorio(0, particleBounds.width || 1),
    y: distribuirVerticalmente ? aleatorio(0, height) : aleatorio(-height * 0.18, -8),
    radius: aleatorio(0.55, 1.55),
    length: aleatorio(3.5, 10),
    speedY: aleatorio(12, 31),
    driftX: aleatorio(-6, 9),
    sway: aleatorio(0.5, 2.8),
    swaySpeed: aleatorio(0.0007, 0.0015),
    phase: aleatorio(0, Math.PI * 2),
    alpha: aleatorio(0.28, 0.72),
    glow: Math.random() > 0.72
  };
}

function obtenerCantidadParticulas(width, height) {
  const count = Math.round((width * height) / config.particleDensity);
  return Math.min(config.particleMaxCount, Math.max(config.particleMinCount, count));
}

function redimensionarParticulas() {
  if (!elements.particleCanvas) return;

  const canvas = elements.particleCanvas;
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  particleBounds = {
    width: rect.width,
    height: rect.height
  };

  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));

  particleContext = canvas.getContext("2d");
  if (!particleContext) return;

  particleContext.setTransform(dpr, 0, 0, dpr, 0, 0);

  const targetCount = obtenerCantidadParticulas(rect.width, rect.height);

  if (particles.length < targetCount) {
    const nuevas = Array.from(
      { length: targetCount - particles.length },
      () => crearParticula(true)
    );
    particles = particles.concat(nuevas);
  } else if (particles.length > targetCount) {
    particles = particles.slice(0, targetCount);
  }
}

function dibujarParticulas(timestamp = 0) {
  if (!particleContext || !particleBounds.width || !particleBounds.height) return;

  const delta = Math.min(48, timestamp - particleLastTime || 16) / 1000;
  particleLastTime = timestamp;

  particleContext.clearRect(0, 0, particleBounds.width, particleBounds.height);
  particleContext.lineCap = "round";

  particles.forEach((particle, index) => {
    const swayOffset = Math.sin(timestamp * particle.swaySpeed + particle.phase) * particle.sway;

    particle.x += (particle.driftX + swayOffset) * delta;
    particle.y += particle.speedY * delta;

    if (
      particle.y > particleBounds.height + 12 ||
      particle.x < -18 ||
      particle.x > particleBounds.width + 18
    ) {
      particles[index] = crearParticula(false);
      return;
    }

    particleContext.globalAlpha = particle.alpha;
    particleContext.strokeStyle = particle.glow
      ? "rgba(255, 248, 202, 0.95)"
      : "rgba(255, 253, 248, 0.92)";
    particleContext.lineWidth = particle.radius;
    particleContext.beginPath();
    particleContext.moveTo(particle.x, particle.y);
    particleContext.lineTo(
      particle.x + particle.driftX * 0.16,
      particle.y + particle.length
    );
    particleContext.stroke();

    if (particle.glow) {
      particleContext.globalAlpha = particle.alpha * 0.34;
      particleContext.fillStyle = "rgba(255, 248, 202, 0.85)";
      particleContext.beginPath();
      particleContext.arc(particle.x, particle.y, particle.radius * 1.9, 0, Math.PI * 2);
      particleContext.fill();
    }
  });

  particleContext.globalAlpha = 1;
  particleAnimationId = window.requestAnimationFrame(dibujarParticulas);
}

function iniciarParticulas() {
  if (!elements.particleCanvas) return;

  const reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) return;

  redimensionarParticulas();
  window.addEventListener("resize", redimensionarParticulas);
  particleAnimationId = window.requestAnimationFrame(dibujarParticulas);
}

function pausarParticulas() {
  window.cancelAnimationFrame(particleAnimationId);
  particleAnimationId = null;
  particleLastTime = 0;
}

function reanudarParticulas() {
  if (particleAnimationId || !particleContext) return;

  particleAnimationId = window.requestAnimationFrame(dibujarParticulas);
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
      pausarParticulas();
      return;
    }

    programarCambioGaleria();
    reanudarParticulas();
  });
}

function init() {
  configurarAssets();
  cargarFrases();

  actualizarReloj();
  setInterval(actualizarReloj, 1000);

  iniciarFrases();
  iniciarParticulas();
  iniciarGaleria();
  manejarVisibilidadGaleria();
}

init();
