// Variables globales
let sentences = [];
let currentIndex = -1;
let viewedIndices = new Set();
let autoChangeTimer = null;

// Ruta del archivo JSON predeterminado
const DEFAULT_JSON_PATH = 'sentences.json';

// Elementos del DOM
const counter = document.getElementById('counter');
const sentenceDisplay = document.getElementById('sentence-display');
const dateTimeDisplay = document.getElementById('date-time');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Configurar manejadores de eventos
    setupEventListeners();
    
    // Iniciar reloj
    updateClock();
    
    // Cargar el archivo JSON predeterminado
    loadDefaultDatabase();
    
    // Iniciar el temporizador para cambio automático
    startAutoChangeTimer();
});

// Función para iniciar el temporizador de cambio automático
function startAutoChangeTimer() {
    // Limpiar cualquier temporizador existente primero
    if (autoChangeTimer) {
        clearInterval(autoChangeTimer);
    }
    
    // Establecer un nuevo temporizador que se ejecute cada 30 segundos
    autoChangeTimer = setInterval(() => {
        randomSentence(); // Llamar a la función de selección aleatoria
    }, 60000); // 60000 ms = 60 segundos
}

// Cargar el archivo de base de datos predeterminado
function loadDefaultDatabase() {
    fetch(DEFAULT_JSON_PATH)
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo de sentencias predeterminado');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.sentences && data.sentences.length > 0) {
                sentences = data.sentences; // Carga directa sin mapear favoritos
                currentIndex = 0;
                viewedIndices = new Set([0]);
                updateCounter();
                displayCurrentSentence();
            } else {
                throw new Error('El archivo JSON no tiene el formato correcto');
            }
        })
        .catch(error => {
            console.error('Error cargando la base de datos:', error);
            sentenceDisplay.textContent = "Error loading sentences. Please check the sentences.json file.";
        });
}

// Configurar todos los manejadores de eventos
function setupEventListeners() {
    // Navegación
    document.getElementById('random-btn').addEventListener('click', randomSentence);
}

// Funciones de navegación
function displayCurrentSentence() {
    const sentencesToUse = sentences;
    
    if (0 <= currentIndex && currentIndex < sentencesToUse.length) {
        const currentSentence = sentencesToUse[currentIndex];
        sentenceDisplay.textContent = currentSentence.content;
        viewedIndices.add(currentIndex);
    } else {
        sentenceDisplay.textContent = "No sentences available.";
    }
}

function randomSentence() {
    const sentencesToUse = sentences;
    
    if (!sentencesToUse.length) return;
    
    // Obtener índices no vistos
    const unviewed = [];
    for (let i = 0; i < sentencesToUse.length; i++) {
        if (!viewedIndices.has(i)) {
            unviewed.push(i);
        }
    }
    
    if (unviewed.length) {
        currentIndex = unviewed[Math.floor(Math.random() * unviewed.length)];
        displayCurrentSentence();
    } else {
        // Si todas han sido vistas, reiniciar y elegir aleatoriamente
        viewedIndices.clear();
        currentIndex = Math.floor(Math.random() * sentencesToUse.length);
        displayCurrentSentence();
    }
    
    // Reiniciar el temporizador cuando cambia la sentencia
    startAutoChangeTimer();
}

// Funciones de utilidad
function updateCounter() {
    counter.textContent = `Sentences: ${sentences.length}`;
}

function updateClock() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    dateTimeDisplay.textContent = now.toLocaleDateString('en-US', options);
    
    // Actualizar cada segundo
    setTimeout(updateClock, 1000);
}
