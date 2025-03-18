// Variables globales
let sentences = [];
let currentIndex = -1;
let viewedIndices = new Set();
let filteredSentences = [];
let isFilterActive = false;
let isShowingFavorites = false;
let autoChangeTimer = null;

// Ruta del archivo JSON predeterminado
const DEFAULT_JSON_PATH = 'sentences.json';

// Elementos del DOM
const counter = document.getElementById('counter');
const sentenceDisplay = document.getElementById('sentence-display');
const dateTimeDisplay = document.getElementById('date-time');
const filterInput = document.getElementById('filter-input');
const favoriteBtn = document.getElementById('favorite-btn');
const listContainer = document.getElementById('list-container');
const sentencesList = document.getElementById('sentences-list');
const settingsPanel = document.getElementById('settings-panel');
const settingsToggle = document.getElementById('settings-toggle');
const editButtonsPanel = document.getElementById('edit-buttons-panel');

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
    }, 30000); // 30000 ms = 30 segundos
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
                // Añadir propiedad favorite para cada sentencia si no existe
                sentences = data.sentences.map(sentence => {
                    if (!sentence.hasOwnProperty('favorite')) {
                        return { ...sentence, favorite: false };
                    }
                    return sentence;
                });
                currentIndex = 0;
                viewedIndices = new Set([0]);
                updateCounter();
                displayCurrentSentence();
                updateFavoriteButton();
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
    // Toggle del panel de configuraciones
    settingsToggle.addEventListener('click', toggleSettingsPanel);
    
    // Navegación
    document.getElementById('prev-btn').addEventListener('click', prevSentence);
    document.getElementById('next-btn').addEventListener('click', nextSentence);
    document.getElementById('random-btn').addEventListener('click', randomSentence);
    document.getElementById('reset-btn').addEventListener('click', resetViewing);
    
    // Edición
    document.getElementById('edit-btn').addEventListener('click', editSentence);
    document.getElementById('delete-btn').addEventListener('click', deleteSentence);
    
    // Filtrado y búsqueda
    document.getElementById('filter-btn').addEventListener('click', filterSentences);
    filterInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') filterSentences();
    });
    document.getElementById('show-all-btn').addEventListener('click', showAllSentences);
    document.getElementById('favorites-btn').addEventListener('click', toggleFavoritesFilter);
    
    // Favoritos
    favoriteBtn.addEventListener('click', toggleFavorite);
    
    // Lista de sentencias
    document.getElementById('close-list-btn').addEventListener('click', () => {
        listContainer.classList.add('hidden');
    });
}

// Función para mostrar/ocultar el panel de configuraciones
function toggleSettingsPanel() {
    settingsPanel.classList.toggle('hidden');
    settingsToggle.classList.toggle('active');
    
    // También mostrar/ocultar los botones de edición
    if (!settingsPanel.classList.contains('hidden')) {
        editButtonsPanel.style.display = 'flex';
    } else {
        editButtonsPanel.style.display = 'none';
    }
}

// Funciones de navegación
function displayCurrentSentence() {
    const sentencesToUse = isFilterActive ? filteredSentences : sentences;
    
    if (0 <= currentIndex && currentIndex < sentencesToUse.length) {
        const currentSentence = sentencesToUse[currentIndex];
        sentenceDisplay.textContent = currentSentence.content;
        viewedIndices.add(currentIndex);
        updateFavoriteButton();
    } else {
        sentenceDisplay.textContent = "No sentences available.";
        favoriteBtn.classList.remove('active');
    }
}

function updateFavoriteButton() {
    const sentencesToUse = isFilterActive ? filteredSentences : sentences;
    
    if (0 <= currentIndex && currentIndex < sentencesToUse.length) {
        const isFavorite = sentencesToUse[currentIndex].favorite;
        
        if (isFavorite) {
            favoriteBtn.classList.add('active');
        } else {
            favoriteBtn.classList.remove('active');
        }
    } else {
        favoriteBtn.classList.remove('active');
    }
}

function prevSentence() {
    if (isFilterActive) {
        if (filteredSentences.length && currentIndex > 0) {
            currentIndex--;
            displayCurrentSentence();
        }
    } else {
        if (sentences.length && currentIndex > 0) {
            currentIndex--;
            displayCurrentSentence();
        }
    }
    
    // Reiniciar el temporizador cuando el usuario interactúa
    startAutoChangeTimer();
}

function nextSentence() {
    const sentencesToUse = isFilterActive ? filteredSentences : sentences;
    
    if (sentencesToUse.length && currentIndex < sentencesToUse.length - 1) {
        currentIndex++;
        displayCurrentSentence();
    }
    
    // Reiniciar el temporizador cuando el usuario interactúa
    startAutoChangeTimer();
}

function randomSentence() {
    const sentencesToUse = isFilterActive ? filteredSentences : sentences;
    
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

function resetViewing() {
    viewedIndices.clear();
    const sentencesToUse = isFilterActive ? filteredSentences : sentences;
    currentIndex = sentencesToUse.length ? 0 : -1;
    displayCurrentSentence();
    
    // Reiniciar el temporizador cuando el usuario interactúa
    startAutoChangeTimer();
}

function editSentence() {
    const sentencesToUse = isFilterActive ? filteredSentences : sentences;
    
    if (!sentencesToUse.length || currentIndex < 0) return;
    
    const currentContent = sentencesToUse[currentIndex].content;
    const newContent = prompt("Edit the sentence:", currentContent);
    
    if (newContent !== null && newContent.trim()) {
        // Si estamos en modo filtrado, necesitamos encontrar el índice original
        if (isFilterActive) {
            const originalIndex = sentences.findIndex(s => s.content === currentContent);
            if (originalIndex !== -1) {
                sentences[originalIndex].content = newContent.trim();
                // Actualizar también en la lista filtrada
                filteredSentences[currentIndex].content = newContent.trim();
            }
        } else {
            sentences[currentIndex].content = newContent.trim();
        }
        
        displayCurrentSentence();
        
        // Reiniciar el temporizador cuando se edita una sentencia
        startAutoChangeTimer();
    }
}

function deleteSentence() {
    const sentencesToUse = isFilterActive ? filteredSentences : sentences;
    
    if (!sentencesToUse.length || currentIndex < 0) return;
    
    if (confirm("Are you sure you want to delete this sentence?")) {
        if (isFilterActive) {
            // Encontrar y eliminar de la lista original
            const currentContent = sentencesToUse[currentIndex].content;
            const originalIndex = sentences.findIndex(s => s.content === currentContent);
            
            if (originalIndex !== -1) {
                sentences.splice(originalIndex, 1);
                // Eliminar de la lista filtrada también
                filteredSentences.splice(currentIndex, 1);
            }
        } else {
            sentences.splice(currentIndex, 1);
        }
        
        // Ajustar índices
        if (!sentencesToUse.length) {
            currentIndex = -1;
        } else if (currentIndex >= sentencesToUse.length) {
            currentIndex = sentencesToUse.length - 1;
        }
        
        // Recrear conjunto de índices vistos (eliminando los que ya no existen)
        const newViewedIndices = new Set();
        viewedIndices.forEach(index => {
            if (index < sentencesToUse.length) {
                newViewedIndices.add(index);
            }
        });
        viewedIndices = newViewedIndices;
        
        displayCurrentSentence();
        updateCounter();
        
        // Reiniciar el temporizador cuando se elimina una sentencia
        startAutoChangeTimer();
    }
}

// Funciones de filtrado y favoritos
function filterSentences() {
    const query = filterInput.value.trim().toLowerCase();
    
    if (query === '') {
        isFilterActive = false;
        filteredSentences = [];
        
        // Si estamos mostrando solo favoritos, mantener ese filtro
        if (isShowingFavorites) {
            toggleFavoritesFilter();
        } else {
            currentIndex = sentences.length ? 0 : -1;
            displayCurrentSentence();
        }
        
        return;
    }
    
    // Filtrar las sentencias
    filteredSentences = sentences.filter(sentence => 
        sentence.content.toLowerCase().includes(query)
    );
    
    isFilterActive = true;
    currentIndex = filteredSentences.length ? 0 : -1;
    viewedIndices = new Set();
    
    // Mostrar resultados
    displayCurrentSentence();
    
    // Mostrar también la lista completa de resultados
    showSentencesList(filteredSentences, query);
    
    // Reiniciar el temporizador cuando se cambia el filtrado
    startAutoChangeTimer();
}

function showAllSentences() {
    isFilterActive = false;
    filteredSentences = [];
    filterInput.value = '';
    
    // Mostrar la lista completa
    showSentencesList(sentences);
    
    // Reiniciar el temporizador cuando se muestran todas las sentencias
    startAutoChangeTimer();
}

function toggleFavoritesFilter() {
    isShowingFavorites = !isShowingFavorites;
    
    if (isShowingFavorites) {
        filteredSentences = sentences.filter(sentence => sentence.favorite);
        isFilterActive = true;
        document.getElementById('favorites-btn').textContent = "Show All";
    } else {
        isFilterActive = false;
        filteredSentences = [];
        document.getElementById('favorites-btn').textContent = "Show Favorites";
    }
    
    currentIndex = filteredSentences.length || sentences.length ? 0 : -1;
    viewedIndices = new Set();
    displayCurrentSentence();
    
    if (isShowingFavorites) {
        showSentencesList(filteredSentences, null, true);
    }
    
    // Reiniciar el temporizador cuando se cambia el filtro de favoritos
    startAutoChangeTimer();
}

function toggleFavorite() {
    const sentencesToUse = isFilterActive ? filteredSentences : sentences;
    
    if (!sentencesToUse.length || currentIndex < 0) return;
    
    // Cambiar estado de favorito
    if (isFilterActive) {
        // Encontrar en la lista original para actualizar ahí también
        const currentContent = sentencesToUse[currentIndex].content;
        const originalIndex = sentences.findIndex(s => s.content === currentContent);
        
        if (originalIndex !== -1) {
            sentences[originalIndex].favorite = !sentences[originalIndex].favorite;
            sentencesToUse[currentIndex].favorite = sentences[originalIndex].favorite;
        }
    } else {
        sentencesToUse[currentIndex].favorite = !sentencesToUse[currentIndex].favorite;
    }
    
    // Actualizar UI
    updateFavoriteButton();
    
    // Si estamos mostrando solo favoritos y quitamos un favorito, actualizamos la lista
    if (isShowingFavorites && !sentencesToUse[currentIndex].favorite) {
        filteredSentences = sentences.filter(sentence => sentence.favorite);
        
        if (filteredSentences.length === 0) {
            // Si no quedan favoritos, volver a modo normal
            isShowingFavorites = false;
            isFilterActive = false;
            document.getElementById('favorites-btn').textContent = "Show Favorites";
            currentIndex = sentences.length ? 0 : -1;
        } else if (currentIndex >= filteredSentences.length) {
            currentIndex = filteredSentences.length - 1;
        }
        
        displayCurrentSentence();
    }
    
    // Reiniciar el temporizador cuando se cambia un favorito
    startAutoChangeTimer();
}

// Función para mostrar la lista completa de sentencias
function showSentencesList(sentencesToShow, highlightQuery = null, favoritesOnly = false) {
    // Limpiar lista actual
    sentencesList.innerHTML = '';
    
    if (!sentencesToShow.length) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'sentence-item';
        emptyMessage.textContent = favoritesOnly 
            ? "No favorite sentences yet. Mark some as favorites first."
            : "No sentences match your filter.";
        sentencesList.appendChild(emptyMessage);
    } else {
        // Detectar duplicados primero
        const contentCounts = {};
        sentencesToShow.forEach(sentence => {
            const lowerContent = sentence.content.toLowerCase();
            contentCounts[lowerContent] = (contentCounts[lowerContent] || 0) + 1;
        });
        
        // Crear elementos de lista
        sentencesToShow.forEach((sentence, index) => {
            const item = document.createElement('li');
            item.className = 'sentence-item';
            
            // Crear elemento para el texto
            const textSpan = document.createElement('span');
            textSpan.className = 'sentence-text';
            
            // Resaltar términos de búsqueda si es necesario
            if (highlightQuery && highlightQuery.trim()) {
                const content = sentence.content;
                const lowerContent = content.toLowerCase();
                const lowerQuery = highlightQuery.toLowerCase();
                
                if (lowerContent.includes(lowerQuery)) {
                    const startIndex = lowerContent.indexOf(lowerQuery);
                    const endIndex = startIndex + lowerQuery.length;
                    
                    // Texto antes, resaltado y después
                    const beforeMatch = content.substring(0, startIndex);
                    const match = content.substring(startIndex, endIndex);
                    const afterMatch = content.substring(endIndex);
                    
                    textSpan.innerHTML = `${beforeMatch}<strong style="background-color: #ffd43b;">${match}</strong>${afterMatch}`;
                } else {
                    textSpan.textContent = content;
                }
            } else {
                textSpan.textContent = sentence.content;
            }
            
            // Añadir advertencia de duplicado si es necesario
            const lowerContent = sentence.content.toLowerCase();
            if (contentCounts[lowerContent] > 1) {
                const duplicateSpan = document.createElement('span');
                duplicateSpan.className = 'duplicate-warning';
                duplicateSpan.textContent = ' (Duplicate)';
                textSpan.appendChild(duplicateSpan);
            }
            
            item.appendChild(textSpan);
            
            // Acciones (favorito, editar, eliminar)
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'sentence-actions';
            
            // Botón de favorito
            const favBtn = document.createElement('button');
            favBtn.className = 'item-favorite-btn' + (sentence.favorite ? ' active' : '');
            favBtn.innerHTML = '<i class="fas fa-star"></i>';
            favBtn.title = 'Toggle favorite';
            favBtn.addEventListener('click', () => {
                // Encontrar en la lista original para actualizar
                const originalIndex = sentences.findIndex(s => s.content === sentence.content);
                
                if (originalIndex !== -1) {
                    sentences[originalIndex].favorite = !sentences[originalIndex].favorite;
                    sentence.favorite = sentences[originalIndex].favorite;
                    favBtn.classList.toggle('active');
                    
                    // Si estamos mostrando solo favoritos y quitamos un favorito, actualizar la lista
                    if (favoritesOnly && !sentence.favorite) {
                        item.remove();
                        
                        // Si no quedan favoritos, mostrar mensaje
                        if (sentencesList.children.length === 0) {
                            const emptyMessage = document.createElement('li');
                            emptyMessage.className = 'sentence-item';
                            emptyMessage.textContent = "No favorite sentences yet. Mark some as favorites first.";
                            sentencesList.appendChild(emptyMessage);
                        }
                    }
                    
                    // Actualizar botón de favorito en la vista principal si es la sentencia actual
                    if (currentIndex === index) {
                        updateFavoriteButton();
                    }
                }
            });
            actionsDiv.appendChild(favBtn);
            
            // Botón de editar
            const editBtn = document.createElement('button');
            editBtn.className = 'item-edit-btn';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.title = 'Edit';
            editBtn.addEventListener('click', () => {
                const newContent = prompt("Edit the sentence:", sentence.content);
                
                if (newContent !== null && newContent.trim()) {
                    // Encontrar en la lista original para actualizar
                    const originalIndex = sentences.findIndex(s => s.content === sentence.content);
                    
                    if (originalIndex !== -1) {
                        sentences[originalIndex].content = newContent.trim();
                        sentence.content = newContent.trim();
                        textSpan.textContent = newContent.trim();
                        
                        // Actualizar la vista principal si es la sentencia actual
                        if (currentIndex === index) {
                            displayCurrentSentence();
                        }
                    }
                }
            });
            actionsDiv.appendChild(editBtn);
            
            // Botón de eliminar
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'item-delete-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.title = 'Delete';
            deleteBtn.addEventListener('click', () => {
                if (confirm("Are you sure you want to delete this sentence?")) {
                    // Encontrar en la lista original para eliminar
                    const originalIndex = sentences.findIndex(s => s.content === sentence.content);
                    
                    if (originalIndex !== -1) {
                        sentences.splice(originalIndex, 1);
                        item.remove();
                        
                        // Actualizar lista filtrada si está activa
                        if (isFilterActive) {
                            const filteredIndex = filteredSentences.findIndex(s => s.content === sentence.content);
                            if (filteredIndex !== -1) {
                                filteredSentences.splice(filteredIndex, 1);
                                
                                // Ajustar currentIndex si es necesario
                                if (currentIndex === filteredIndex) {
                                    currentIndex = filteredSentences.length ? 0 : -1;
                                } else if (currentIndex > filteredIndex) {
                                    currentIndex--;
                                }
                            }
                        } else {
                            // Ajustar currentIndex si es necesario
                            if (currentIndex === originalIndex) {
                                currentIndex = sentences.length ? 0 : -1;
                            } else if (currentIndex > originalIndex) {
                                currentIndex--;
                            }
                        }
                        
                        updateCounter();
                        displayCurrentSentence();
                        
                        // Si no quedan elementos, mostrar mensaje
                        if (sentencesList.children.length === 0) {
                            const emptyMessage = document.createElement('li');
                            emptyMessage.className = 'sentence-item';
                            emptyMessage.textContent = favoritesOnly 
                                ? "No favorite sentences yet. Mark some as favorites first."
                                : "No sentences match your filter.";
                            sentencesList.appendChild(emptyMessage);
                        }
                    }
                }
            });
            actionsDiv.appendChild(deleteBtn);
            
            item.appendChild(actionsDiv);
            sentencesList.appendChild(item);
            
            // Hacer clic en el texto para navegar a esa sentencia
            textSpan.addEventListener('click', () => {
                currentIndex = index;
                displayCurrentSentence();
                listContainer.classList.add('hidden');
            });
        });
    }
    
    // Mostrar la lista
    listContainer.classList.remove('hidden');
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
