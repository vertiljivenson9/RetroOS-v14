/**
 * ============================================
 * WINDOW MANAGER - RETROS V18.0
 * Gestor de Ventanas Profesional con Efectos CRT
 * ============================================
 */

class WindowManager {
    constructor() {
        this.windows = new Map();
        this.activeWindow = null;
        this.zIndexCounter = 10;
        this.minimizedWindows = new Set();
        this.maximizedWindows = new Set();
        this.windowSnapshots = new Map();
        this.dragState = {
            isDragging: false,
            window: null,
            startX: 0,
            startY: 0,
            initialX: 0,
            initialY: 0
        };
        this.resizeState = {
            isResizing: false,
            window: null,
            startX: 0,
            startY: 0,
            startWidth: 0,
            startHeight: 0
        };
        
        // Configuración de ventanas
        this.config = {
            minWidth: 300,
            minHeight: 200,
            snapDistance: 20,
            animationDuration: 200,
            borderWidth: 2,
            titlebarHeight: 32
        };
        
        // Temas
        this.themes = {
            phosphor: {
                borderColor: '#00ff41',
                titlebarBg: 'rgba(0, 255, 65, 0.1)',
                titlebarText: '#00ff41',
                shadowColor: 'rgba(0, 255, 65, 0.3)',
                glowColor: '#00ff41'
            },
            god: {
                borderColor: '#ff0000',
                titlebarBg: 'rgba(255, 0, 0, 0.1)',
                titlebarText: '#ff0000',
                shadowColor: 'rgba(255, 0, 0, 0.3)',
                glowColor: '#ff0000'
            }
        };
        
        this.currentTheme = 'phosphor';
        
        this.init();
    }

    // ============================================
    // INICIALIZACIÓN
    // ============================================
    init() {
        this.setupGlobalEventListeners();
        this.loadWindowStates();
        console.log('[WINDOW_MANAGER] Window Manager initialized');
    }

    setupGlobalEventListeners() {
        // Eventos de mouse para arrastre y redimensionamiento
        document.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });

        document.addEventListener('mouseup', (e) => {
            this.handleMouseUp(e);
        });

        // Eventos de teclado para atajos
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });

        // Prevenir selección de texto en ventanas
        document.addEventListener('selectstart', (e) => {
            if (e.target.closest('.window')) {
                e.preventDefault();
            }
        });

        // Gestión del foco
        document.addEventListener('mousedown', (e) => {
            const window = e.target.closest('.window');
            if (window) {
                this.focusWindow(window);
            }
        });
    }

    // ============================================
    // GESTIÓN DE VENTANAS
    // ============================================
    registerWindow(id, element, options = {}) {
        const windowData = {
            id,
            element,
            title: options.title || element.querySelector('.window-title')?.textContent || id,
            minimized: false,
            maximized: false,
            zIndex: ++this.zIndexCounter,
            position: {
                x: parseInt(element.style.left) || 50,
                y: parseInt(element.style.top) || 50
            },
            size: {
                width: parseInt(element.style.width) || 600,
                height: parseInt(element.style.height) || 400
            },
            originalPosition: null,
            originalSize: null,
            ...options
        };

        this.windows.set(id, windowData);
        
        // Configurar arrastre y redimensionamiento
        this.setupWindowDrag(element);
        this.setupWindowResize(element);
        
        // Aplicar tema actual
        this.applyTheme(element);
        
        console.log(`[WINDOW_MANAGER] Window registered: ${id}`);
        
        return windowData;
    }

    unregisterWindow(id) {
        const windowData = this.windows.get(id);
        if (windowData) {
            this.windows.delete(id);
            this.windowSnapshots.delete(id);
            
            if (this.activeWindow === id) {
                this.activeWindow = null;
            }
            
            console.log(`[WINDOW_MANAGER] Window unregistered: ${id}`);
        }
    }

    showWindow(id) {
        const windowData = this.windows.get(id);
        if (!windowData) return false;

        windowData.element.classList.remove('hidden', 'minimized');
        windowData.minimized = false;
        
        this.bringToFront(windowData.element);
        this.activeWindow = id;
        
        // Animación de aparición
        windowData.element.style.opacity = '0';
        windowData.element.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            windowData.element.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
            windowData.element.style.opacity = '1';
            windowData.element.style.transform = 'scale(1)';
            
            setTimeout(() => {
                windowData.element.style.transition = '';
            }, 200);
        }, 10);

        return true;
    }

    hideWindow(id) {
        const windowData = this.windows.get(id);
        if (!windowData) return false;

        windowData.element.classList.add('hidden');
        
        if (this.activeWindow === id) {
            this.activeWindow = null;
        }

        return true;
    }

    minimizeWindow(id) {
        const windowData = this.windows.get(id);
        if (!windowData) return false;

        windowData.element.classList.add('minimized');
        windowData.minimized = true;
        
        // Animación de minimización
        windowData.element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        windowData.element.style.opacity = '0';
        windowData.element.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            windowData.element.style.transition = '';
        }, 300);

        if (this.activeWindow === id) {
            this.activeWindow = null;
        }

        this.minimizedWindows.add(id);

        return true;
    }

    restoreWindow(id) {
        const windowData = this.windows.get(id);
        if (!windowData) return false;

        windowData.element.classList.remove('minimized');
        windowData.minimized = false;
        
        // Animación de restauración
        windowData.element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        windowData.element.style.opacity = '1';
        windowData.element.style.transform = 'scale(1)';
        
        setTimeout(() => {
            windowData.element.style.transition = '';
        }, 300);

        this.minimizedWindows.delete(id);
        this.activeWindow = id;

        return true;
    }

    maximizeWindow(id) {
        const windowData = this.windows.get(id);
        if (!windowData) return false;

        if (windowData.maximized) {
            // Restaurar
            this.restoreWindowFromMaximize(id);
        } else {
            // Maximizar
            this.maximizeWindowToFull(id);
        }

        return true;
    }

    maximizeWindowToFull(id) {
        const windowData = this.windows.get(id);
        
        // Guardar estado original
        windowData.originalPosition = { ...windowData.position };
        windowData.originalSize = { ...windowData.size };
        
        // Maximizar
        windowData.element.style.left = '0px';
        windowData.element.style.top = '0px';
        windowData.element.style.width = '100vw';
        windowData.element.style.height = 'calc(100vh - 60px)';
        
        windowData.position = { x: 0, y: 0 };
        windowData.size = {
            width: window.innerWidth,
            height: window.innerHeight - 60
        };
        
        windowData.maximized = true;
        this.maximizedWindows.add(id);
        
        // Aplicar estilo de ventana maximizada
        windowData.element.classList.add('maximized');
    }

    restoreWindowFromMaximize(id) {
        const windowData = this.windows.get(id);
        
        if (windowData.originalPosition && windowData.originalSize) {
            // Restaurar posición y tamaño originales
            windowData.element.style.left = windowData.originalPosition.x + 'px';
            windowData.element.style.top = windowData.originalPosition.y + 'px';
            windowData.element.style.width = windowData.originalSize.width + 'px';
            windowData.element.style.height = windowData.originalSize.height + 'px';
            
            windowData.position = { ...windowData.originalPosition };
            windowData.size = { ...windowData.originalSize };
            
            windowData.originalPosition = null;
            windowData.originalSize = null;
        }
        
        windowData.maximized = false;
        this.maximizedWindows.delete(id);
        
        // Quitar estilo de ventana maximizada
        windowData.element.classList.remove('maximized');
    }

    closeWindow(id) {
        const windowData = this.windows.get(id);
        if (!windowData) return false;

        // Animación de cierre
        windowData.element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        windowData.element.style.opacity = '0';
        windowData.element.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            this.hideWindow(id);
            windowData.element.style.transition = '';
            windowData.element.style.opacity = '1';
            windowData.element.style.transform = 'scale(1)';
        }, 300);

        return true;
    }

    // ============================================
    // ARRASTRE DE VENTANAS
    // ============================================
    setupWindowDrag(element) {
        const titlebar = element.querySelector('.window-titlebar');
        if (!titlebar) return;

        titlebar.addEventListener('mousedown', (e) => {
            if (e.target !== titlebar && !titlebar.contains(e.target)) return;
            if (e.target.classList.contains('window-control')) return;
            
            const windowData = this.getWindowData(element);
            if (!windowData || windowData.maximized) return;

            this.startDrag(e, windowData);
        });
    }

    startDrag(e, windowData) {
        this.dragState.isDragging = true;
        this.dragState.window = windowData.element;
        this.dragState.startX = e.clientX;
        this.dragState.startY = e.clientY;
        this.dragState.initialX = windowData.position.x;
        this.dragState.initialY = windowData.position.y;

        // Cambiar cursor
        windowData.element.style.cursor = 'grabbing';
        
        // Traer al frente
        this.bringToFront(windowData.element);
        this.activeWindow = windowData.id;

        // Prevenir selección de texto
        e.preventDefault();
    }

    handleMouseMove(e) {
        if (this.dragState.isDragging) {
            this.updateDragPosition(e);
        }

        if (this.resizeState.isResizing) {
            this.updateResizeSize(e);
        }
    }

    handleMouseUp(e) {
        if (this.dragState.isDragging) {
            this.endDrag();
        }

        if (this.resizeState.isResizing) {
            this.endResize();
        }
    }

    updateDragPosition(e) {
        const deltaX = e.clientX - this.dragState.startX;
        const deltaY = e.clientY - this.dragState.startY;
        
        const newX = this.dragState.initialX + deltaX;
        const newY = this.dragState.initialY + deltaY;

        // Limitar a los bordes de la pantalla
        const maxX = window.innerWidth - this.dragState.window.offsetWidth;
        const maxY = window.innerHeight - this.dragState.window.offsetHeight - 60; // Restar taskbar

        const boundedX = Math.max(0, Math.min(newX, maxX));
        const boundedY = Math.max(0, Math.min(newY, maxY));

        this.dragState.window.style.left = boundedX + 'px';
        this.dragState.window.style.top = boundedY + 'px';

        // Actualizar datos de la ventana
        const windowData = this.getWindowData(this.dragState.window);
        if (windowData) {
            windowData.position.x = boundedX;
            windowData.position.y = boundedY;
        }

        // Snap to edges
        this.handleWindowSnap(boundedX, boundedY);
    }

    handleWindowSnap(x, y) {
        const snapDistance = this.config.snapDistance;
        
        // Snap a bordes
        if (x < snapDistance) {
            this.dragState.window.style.left = '0px';
        }
        if (y < snapDistance) {
            this.dragState.window.style.top = '0px';
        }
        if (x > window.innerWidth - this.dragState.window.offsetWidth - snapDistance) {
            this.dragState.window.style.left = (window.innerWidth - this.dragState.window.offsetWidth) + 'px';
        }
    }

    endDrag() {
        if (this.dragState.window) {
            this.dragState.window.style.cursor = 'default';
        }

        this.dragState.isDragging = false;
        this.dragState.window = null;
    }

    // ============================================
    // REDIMENSIONAMIENTO DE VENTANAS
    // ============================================
    setupWindowResize(element) {
        const resizeHandle = element.querySelector('.window-resize');
        if (!resizeHandle) return;

        resizeHandle.addEventListener('mousedown', (e) => {
            const windowData = this.getWindowData(element);
            if (!windowData || windowData.maximized) return;

            this.startResize(e, windowData);
            e.preventDefault();
        });
    }

    startResize(e, windowData) {
        this.resizeState.isResizing = true;
        this.resizeState.window = windowData.element;
        this.resizeState.startX = e.clientX;
        this.resizeState.startY = e.clientY;
        this.resizeState.startWidth = windowData.size.width;
        this.resizeState.startHeight = windowData.size.height;

        // Cambiar cursor
        document.body.style.cursor = 'se-resize';
    }

    updateResizeSize(e) {
        const deltaX = e.clientX - this.resizeState.startX;
        const deltaY = e.clientY - this.resizeState.startY;
        
        const newWidth = Math.max(
            this.config.minWidth,
            this.resizeState.startWidth + deltaX
        );
        const newHeight = Math.max(
            this.config.minHeight,
            this.resizeState.startHeight + deltaY
        );

        this.resizeState.window.style.width = newWidth + 'px';
        this.resizeState.window.style.height = newHeight + 'px';

        // Actualizar datos de la ventana
        const windowData = this.getWindowData(this.resizeState.window);
        if (windowData) {
            windowData.size.width = newWidth;
            windowData.size.height = newHeight;
        }
    }

    endResize() {
        document.body.style.cursor = 'default';
        
        this.resizeState.isResizing = false;
        this.resizeState.window = null;
    }

    // ============================================
    // FOCO Y Z-INDEX
    // ============================================
    focusWindow(windowElement) {
        const windowData = this.getWindowData(windowElement);
        if (!windowData) return;

        // Desenfocar ventana anterior
        if (this.activeWindow) {
            const prevWindowData = this.windows.get(this.activeWindow);
            if (prevWindowData) {
                prevWindowData.element.classList.remove('active');
            }
        }

        // Enfocar nueva ventana
        windowElement.classList.add('active');
        this.activeWindow = windowData.id;
        
        this.bringToFront(windowElement);
    }

    bringToFront(windowElement) {
        const windowData = this.getWindowData(windowElement);
        if (!windowData) return;

        // Incrementar contador de z-index
        this.zIndexCounter += 10;
        
        // Aplicar z-index
        windowElement.style.zIndex = this.zIndexCounter;
        windowData.zIndex = this.zIndexCounter;

        // Actualizar orden de ventanas
        this.updateWindowOrder();
    }

    updateWindowOrder() {
        const sortedWindows = Array.from(this.windows.values())
            .sort((a, b) => a.zIndex - b.zIndex);

        sortedWindows.forEach((windowData, index) => {
            windowData.element.style.zIndex = index + 10;
            windowData.zIndex = index + 10;
        });

        this.zIndexCounter = sortedWindows.length + 10;
    }

    // ============================================
    // TEMAS Y ESTILOS
    // ============================================
    applyTheme(windowElement) {
        const theme = this.themes[this.currentTheme];
        
        // Aplicar colores de borde
        windowElement.style.borderColor = theme.borderColor;
        windowElement.style.boxShadow = `0 0 20px ${theme.shadowColor}`;
        
        // Aplicar estilos al titlebar
        const titlebar = windowElement.querySelector('.window-titlebar');
        if (titlebar) {
            titlebar.style.background = theme.titlebarBg;
            titlebar.style.borderBottomColor = theme.borderColor;
        }
        
        // Aplicar color de texto
        const title = windowElement.querySelector('.window-title');
        if (title) {
            title.style.color = theme.titlebarText;
        }
        
        // Aplicar color a controles
        const controls = windowElement.querySelectorAll('.window-control');
        controls.forEach(control => {
            control.style.borderColor = theme.borderColor;
        });
        
        // Aplicar color a resize handle
        const resizeHandle = windowElement.querySelector('.window-resize');
        if (resizeHandle) {
            resizeHandle.style.borderColor = theme.borderColor;
        }
    }

    setTheme(themeName) {
        if (!this.themes[themeName]) return;
        
        this.currentTheme = themeName;
        
        // Aplicar tema a todas las ventanas
        this.windows.forEach(windowData => {
            this.applyTheme(windowData.element);
        });
    }

    // ============================================
    // ATAJOS DE TECLADO
    // ============================================
    handleKeyDown(e) {
        // Alt + F4: Cerrar ventana activa
        if (e.altKey && e.key === 'F4') {
            e.preventDefault();
            if (this.activeWindow) {
                this.closeWindow(this.activeWindow);
            }
        }

        // Ctrl + N: Nueva ventana (si está implementado)
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            // Implementar creación de nueva ventana
        }

        // Ctrl + Tab: Cambiar entre ventanas
        if (e.ctrlKey && e.key === 'Tab') {
            e.preventDefault();
            this.cycleWindows();
        }

        // Windows key + D: Mostrar/Esconder escritorio
        if ((e.key === 'Meta' || e.key === 'Super') && !e.repeat) {
            // Implementar mostrar/esconder escritorio
        }
    }

    cycleWindows() {
        const visibleWindows = Array.from(this.windows.values())
            .filter(w => !w.element.classList.contains('hidden') && !w.minimized);

        if (visibleWindows.length === 0) return;

        const currentIndex = visibleWindows.findIndex(w => w.id === this.activeWindow);
        const nextIndex = (currentIndex + 1) % visibleWindows.length;
        
        this.focusWindow(visibleWindows[nextIndex].element);
    }

    // ============================================
    // UTILIDADES
    // ============================================
    getWindowData(element) {
        return Array.from(this.windows.values()).find(w => w.element === element);
    }

    getWindowById(id) {
        return this.windows.get(id);
    }

    getAllWindows() {
        return Array.from(this.windows.values());
    }

    getVisibleWindows() {
        return this.getAllWindows().filter(w => 
            !w.element.classList.contains('hidden') && !w.minimized
        );
    }

    // ============================================
    // PERSISTENCIA
    // ============================================
    saveWindowStates() {
        const states = {};
        
        this.windows.forEach((windowData, id) => {
            states[id] = {
                position: windowData.position,
                size: windowData.size,
                minimized: windowData.minimized,
                maximized: windowData.maximized,
                zIndex: windowData.zIndex
            };
        });

        localStorage.setItem('retroos_window_states', JSON.stringify(states));
    }

    loadWindowStates() {
        try {
            const statesStr = localStorage.getItem('retroos_window_states');
            if (statesStr) {
                const states = JSON.parse(statesStr);
                
                Object.entries(states).forEach(([id, state]) => {
                    const windowData = this.windows.get(id);
                    if (windowData) {
                        windowData.position = state.position || windowData.position;
                        windowData.size = state.size || windowData.size;
                        windowData.minimized = state.minimized || false;
                        windowData.maximized = state.maximized || false;
                        windowData.zIndex = state.zIndex || windowData.zIndex;
                        
                        // Aplicar posición y tamaño
                        windowData.element.style.left = windowData.position.x + 'px';
                        windowData.element.style.top = windowData.position.y + 'px';
                        windowData.element.style.width = windowData.size.width + 'px';
                        windowData.element.style.height = windowData.size.height + 'px';
                    }
                });
            }
        } catch (error) {
            console.error('[WINDOW_MANAGER] Error loading window states:', error);
        }
    }

    // ============================================
    // ESTADÍSTICAS
    // ============================================
    getStatistics() {
        return {
            totalWindows: this.windows.size,
            visibleWindows: this.getVisibleWindows().length,
            minimizedWindows: this.minimizedWindows.size,
            maximizedWindows: this.maximizedWindows.size,
            activeWindow: this.activeWindow,
            maxZIndex: this.zIndexCounter,
            currentTheme: this.currentTheme
        };
    }

    // ============================================
    // EFECTOS ESPECIALES
    // ============================================
    addWindowEffect(element, effect) {
        switch (effect) {
            case 'shake':
                this.shakeWindow(element);
                break;
            case 'glow':
                this.glowWindow(element);
                break;
            case 'fade':
                this.fadeWindow(element);
                break;
        }
    }

    shakeWindow(element) {
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }

    glowWindow(element) {
        element.style.boxShadow = `0 0 30px ${this.themes[this.currentTheme].glowColor}`;
        setTimeout(() => {
            element.style.boxShadow = `0 0 20px ${this.themes[this.currentTheme].shadowColor}`;
        }, 1000);
    }

    fadeWindow(element) {
        element.style.transition = 'opacity 1s ease';
        element.style.opacity = '0.5';
        setTimeout(() => {
            element.style.opacity = '1';
        }, 1000);
    }

    // ============================================
    // NOTIFICACIONES
    // ============================================
    showNotification(message, type = 'info') {
        if (window.retroOS && window.retroOS.showNotification) {
            window.retroOS.showNotification(message, type);
        } else {
            console.log(`[WINDOW_MANAGER] ${message}`);
        }
    }

    // ============================================
    // MENÚ CONTEXTUAL
    // ============================================
    showContextMenu(x, y, windowElement) {
        const contextMenu = document.getElementById('contextMenu');
        if (!contextMenu) return;

        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        contextMenu.classList.remove('hidden');

        // Configurar acciones del menú contextual
        const actions = contextMenu.querySelectorAll('[data-action]');
        actions.forEach(action => {
            action.onclick = () => {
                const actionType = action.dataset.action;
                this.handleContextMenuAction(actionType, windowElement);
                this.hideContextMenu();
            };
        });
    }

    hideContextMenu() {
        const contextMenu = document.getElementById('contextMenu');
        if (contextMenu) {
            contextMenu.classList.add('hidden');
        }
    }

    handleContextMenuAction(action, windowElement) {
        const windowData = this.getWindowData(windowElement);
        if (!windowData) return;

        switch (action) {
            case 'refresh':
                // Refrescar contenido de la ventana
                this.showNotification(`${windowData.title} refreshed`, 'info');
                break;
            case 'properties':
                // Mostrar propiedades de la ventana
                this.showWindowProperties(windowData);
                break;
            case 'close':
                this.closeWindow(windowData.id);
                break;
        }
    }

    showWindowProperties(windowData) {
        const properties = `
Window Properties:
- ID: ${windowData.id}
- Title: ${windowData.title}
- Position: (${windowData.position.x}, ${windowData.position.y})
- Size: ${windowData.size.width}x${windowData.size.height}
- Z-Index: ${windowData.zIndex}
- Minimized: ${windowData.minimized}
- Maximized: ${windowData.maximized}
        `.trim();

        this.showNotification(properties, 'info');
    }
}

// ============================================
// EXPORTAR WINDOW MANAGER
// ============================================
window.WindowManager = WindowManager;
window.windowManager = new WindowManager();

console.log('[WINDOW_MANAGER] Window Manager loaded successfully');