let preguntas = [];
let indiceActual = 0;
let jugadorActual = null;
let puntajes = {
  '1': 0,
  '2': 0
};
let lecturaActiva = false; // Bloquea entrada mientras se lee

// Cargar sonidos
const sonidoCorrecto = new Audio('../assets/sonido_correcto.mp3');
const sonidoIncorrecto = new Audio('../assets/sonido_incorrecto.mp3');

// Función para cargar el archivo JSON
async function cargarPreguntas() {
  try {
    const respuesta = await fetch('../assets/preguntas.json');
    preguntas = await respuesta.json();
    mostrarPregunta(indiceActual);
  } catch (error) {
    console.error('Error al cargar preguntas:', error);
  }
}
// Función para alternar pantalla completa
function togglePantallaCompleta() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error al intentar activar pantalla completa: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }
  

// Función para leer texto en voz alta
function leerTexto(texto, callback) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = 'es-MX';
  utterance.pitch = 1;
  utterance.rate = 1;
  utterance.volume = 1;
  lecturaActiva = true;

  utterance.onend = () => {
    lecturaActiva = false;
    if (typeof callback === 'function') callback();
  };

  synth.speak(utterance);
}

// Detener la síntesis de voz al salir de la página
window.addEventListener('beforeunload', () => {
    window.speechSynthesis.cancel();
    lecturaActiva = false;
  });

// Función para mostrar pregunta y opciones (deshabilitadas inicialmente)
function mostrarPregunta(indice) {
  const preguntaActual = preguntas[indice];
  const contenedorPregunta = document.getElementById('pregunta');
  const contenedorOpciones = document.getElementById('opciones');
  const botonContinuar = document.getElementById('boton-continuar');
  const mensajeResultado = document.getElementById('mensaje-resultado');
  const mensajeJugador = document.getElementById('mensaje-jugador');
  const mensajeGanador = document.getElementById('mensaje-ganador');

  jugadorActual = null;
  contenedorPregunta.textContent = preguntaActual.pregunta;
  contenedorOpciones.innerHTML = '';
  botonContinuar.style.display = 'none';

  mensajeResultado.classList.remove('visible', 'correcto', 'incorrecto');
  mensajeResultado.classList.add('oculto');
  mensajeJugador.classList.remove('visible');
  mensajeJugador.classList.add('oculto');
  mensajeGanador.classList.remove('visible');
  mensajeGanador.classList.add('oculto');

  preguntaActual.opciones.forEach(opcion => {
    const boton = document.createElement('button');
    boton.textContent = opcion;
    boton.disabled = true;
    boton.onclick = () => verificarRespuesta(opcion, preguntaActual.respuesta);
    contenedorOpciones.appendChild(boton);
  });

  // Armar texto completo a leer
  let textoCompleto = preguntaActual.pregunta + '. Opciones: ';
  textoCompleto += preguntaActual.opciones.map((op, i) => `Opción ${String.fromCharCode(65 + i)}: ${op}`).join('. ');

  leerTexto(textoCompleto, () => {
    document.addEventListener('keydown', detectarJugador);
  });
}

// Función para detectar al jugador que va a responder
function detectarJugador(e) {
  if (lecturaActiva) return;
  if (e.key === '1' || e.key === '2') {
    jugadorActual = e.key;
    mostrarMensajeJugador('Jugador ' + jugadorActual);
    habilitarOpciones();
    document.removeEventListener('keydown', detectarJugador);
  }
}

function habilitarOpciones() {
  const botones = document.querySelectorAll('#opciones button');
  botones.forEach(boton => boton.disabled = false);
}

// Verificar respuesta y mostrar botón para continuar
function verificarRespuesta(opcionElegida, respuestaCorrecta) {
  const esCorrecta = opcionElegida === respuestaCorrecta;
  const mensaje = esCorrecta
    ? '¡Correcto!'
    : 'Incorrecto. La respuesta correcta era: ' + respuestaCorrecta;

  if (esCorrecta) {
    sonidoCorrecto.play();
    puntajes[jugadorActual]++;
  } else {
    sonidoIncorrecto.play();
  }

  mostrarMensajeResultado('Jugador ' + jugadorActual + ': ' + mensaje, esCorrecta);

  const botones = document.querySelectorAll('#opciones button');
  botones.forEach(boton => boton.disabled = true);

  const botonContinuar = document.getElementById('boton-continuar');
  botonContinuar.style.display = 'block';
}

function siguientePregunta() {
  const mensajeResultado = document.getElementById('mensaje-resultado');
  const mensajeJugador = document.getElementById('mensaje-jugador');
  const mensajeGanador = document.getElementById('mensaje-ganador');
  mensajeResultado.classList.remove('visible', 'correcto', 'incorrecto');
  mensajeResultado.classList.add('oculto');
  mensajeJugador.classList.remove('visible');
  mensajeJugador.classList.add('oculto');
  mensajeGanador.classList.remove('visible');
  mensajeGanador.classList.add('oculto');

  indiceActual++;
  if (indiceActual < preguntas.length) {
    mostrarPregunta(indiceActual);
  } else {
    mostrarGanador();
    document.getElementById('boton-continuar').style.display = 'none';
  }
}

function mostrarMensajeJugador(texto) {
  const mensaje = document.getElementById('mensaje-jugador');
  mensaje.textContent = texto;
  mensaje.classList.remove('oculto');
  mensaje.classList.add('visible');
}

function mostrarMensajeResultado(texto, correcto) {
  const mensaje = document.getElementById('mensaje-resultado');
  mensaje.textContent = texto;

  mensaje.classList.remove('oculto', 'correcto', 'incorrecto', 'visible');
  mensaje.classList.add(correcto ? 'correcto' : 'incorrecto');
  mensaje.classList.add('visible');
}

// Función para mostrar el ganador y reiniciar
function mostrarGanador() {
    let mensajeFinal = '';
    if (puntajes['1'] > puntajes['2']) {
      mensajeFinal = '🏆 ¡Jugador 1 gana con ' + puntajes['1'] + ' respuestas correctas!';
    } else if (puntajes['2'] > puntajes['1']) {
      mensajeFinal = '🏆 ¡Jugador 2 gana con ' + puntajes['2'] + ' respuestas correctas!';
    } else {
      mensajeFinal = '🤝 ¡Empate! Ambos jugadores tienen ' + puntajes['1'] + ' respuestas correctas';
    }
  
    // Ocultar todo excepto el mensaje final
    document.getElementById('pregunta').style.display = 'none';
    document.getElementById('opciones').style.display = 'none';
    document.getElementById('boton-continuar').style.display = 'none';
    document.getElementById('mensaje-jugador').style.display = 'none';
    document.getElementById('mensaje-resultado').style.display = 'none';
  
    const mensaje = document.getElementById('mensaje-ganador');
    mensaje.textContent = mensajeFinal;
    mensaje.classList.remove('oculto');
    mensaje.classList.add('visible', 'ganador');
    mensaje.style.position = 'fixed';
    mensaje.style.top = '50%';
    mensaje.style.left = '50%';
    mensaje.style.transform = 'translate(-50%, -50%)';
    mensaje.style.background = 'rgba(255, 223, 0, 0.9)'; // Fondo dorado translúcido
    mensaje.style.color = 'black';
    mensaje.style.padding = '2rem';
    mensaje.style.borderRadius = '15px';
    mensaje.style.fontSize = '2rem';
    mensaje.style.textAlign = 'center';
    mensaje.style.boxShadow = '0 0 20px white';
    mensaje.style.zIndex = '1000';
  
    // Agregar botón de reinicio
    const botonReiniciar = document.createElement('button');
    botonReiniciar.textContent = 'Reiniciar';
    botonReiniciar.style.display = 'block';
    botonReiniciar.style.margin = '20px auto';
    botonReiniciar.style.padding = '10px 20px';
    botonReiniciar.style.fontSize = '1.2rem';
    botonReiniciar.style.border = 'none';
    botonReiniciar.style.backgroundColor = '#007BFF';
    botonReiniciar.style.color = 'white';
    botonReiniciar.style.borderRadius = '8px';
    botonReiniciar.style.cursor = 'pointer';
    botonReiniciar.onclick = reiniciarJuego;
    mensaje.appendChild(botonReiniciar);
  }

  // Función para reiniciar el juego
  function reiniciarJuego() {
    location.reload();
  }
  
  // Iniciar
  cargarPreguntas();