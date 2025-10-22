// Variables globales
let sentences = [];
let currentIndex = -1;
let viewedIndices = new Set();
let autoChangeTimer = null;

// Ruta del archivo TXT predeterminado
const DEFAULT_JSON_PATH = 'quotes txt 221025_1213.txt';

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
    
    // Cargar el archivo TXT predeterminado
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
    
    // Establecer un nuevo temporizador que se ejecute cada 3 minutos
    autoChangeTimer = setInterval(() => {
        randomSentence(); // Llamar a la función de selección aleatoria (de una sola frase)
    }, 180000); // 180000 ms = 3 minutos
}

// Cargar el archivo de base de datos predeterminado
function loadDefaultDatabase() {
    fetch(DEFAULT_JSON_PATH)
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo de sentencias predeterminado');
            }
            return response.text(); // Cambiado de .json() a .text()
        })
        .then(data => {
            const lines = data.split('\n');
            
            // Procesar el archivo .txt
            sentences = lines
                .map(line => {
                    let quote = line.trim();
                    // Eliminar tags 
                    quote = quote.replace(/\/g, '');
                    // Eliminar números al inicio de la línea (ej. "1 ", "2\t", etc.)
                    quote = quote.replace(/^\d+\s+/, '');
                    return quote.trim();
                })
                .filter(line => line.length > 0 && line !== '}'); // Filtrar líneas vacías o basura

            if (sentences && sentences.length > 0) {
                currentIndex = 0;
                viewedIndices = new Set([0]);
                updateCounter();
                displayCurrentSentence();
            } else {
                throw new Error('El archivo TXT no tiene el formato correcto o está vacío');
            }
        })
        .catch(error => {
            console.error('Error cargando la base de datos:', error);
            sentenceDisplay.textContent = "Error loading sentences. Please check the .txt file.";
        });
}

// Configurar todos los manejadores de eventos
function setupEventListeners() {
    // Navegación
    document.getElementById('random-btn').addEventListener('click', randomSentence);
    document.getElementById('random-three-btn').addEventListener('click', randomThreeSentences);
}

// Funciones de navegación
function displayCurrentSentence() {
    const sentencesToUse = sentences;
    
    if (0 <= currentIndex && currentIndex < sentencesToUse.length) {
        const currentSentence = sentencesToUse[currentIndex];
        // Usamos innerHTML para poder insertar párrafos
        sentenceDisplay.innerHTML = `<p>${currentSentence}</p>`;
        viewedIndices.add(currentIndex);
    } else {
        sentenceDisplay.innerHTML = "<p>No sentences available.</p>";
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
    } else {
        // Si todas han sido vistas, reiniciar y elegir aleatoriamente
        viewedIndices.clear();
        currentIndex = Math.floor(Math.random() * sentencesToUse.length);
    }
    
    displayCurrentSentence();
    
    // Reiniciar el temporizador cuando cambia la sentencia
    startAutoChangeTimer();
}

// Nueva función para mostrar 3 frases
function randomThreeSentences() {
    const sentencesToUse = sentences;
    if (sentencesToUse.length < 3) {
        sentenceDisplay.innerHTML = "<p>Not enough sentences to display three.</p>";
        return;
    }

    let indices = new Set();
    let unviewed = [];

    // 1. Obtener índices no vistos
    for (let i = 0; i < sentencesToUse.length; i++) {
        if (!viewedIndices.has(i)) {
            unviewed.push(i);
        }
    }

    // 2. Si hay menos de 3 no vistas, reiniciamos la lista
    if (unviewed.length < 3) {
        viewedIndices.clear();
        // Rellenamos 'unviewed' con todos los índices posibles
        unviewed = Array.from(sentencesToUse.keys());
    }

    // 3. Elegimos 3 índices únicos de la lista 'unviewed'
    while (indices.size < 3) {
        const randomUnviewedIndex = Math.floor(Math.random() * unviewed.length);
        const actualIndex = unviewed[randomUnviewedIndex];
        
        indices.add(actualIndex);
        viewedIndices.add(actualIndex); // Marcar como vista
        
        // Quitar de la selección temporal para no repetirla en este mismo set de 3
        unviewed.splice(randomUnviewedIndex, 1);
    }
    
    // 4. Obtener las frases y formatear el HTML
    const threeQuotes = Array.from(indices).map(index => sentencesToUse[index]);
    
    sentenceDisplay.innerHTML = `
        <p>${threeQuotes[0]}</p>
        <p class="multi-quote-separator">❖</p>
        <p>${threeQuotes[1]}</p>
        <p class="multi-quote-separator">❖</p>
        <p>${threeQuotes[2]}</p>
    `;

    // Reiniciar el temporizador cuando el usuario interactúa
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
