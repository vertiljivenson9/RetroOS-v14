/**
 * ============================================
 * BOOT SEQUENCE - RETROS V18.0
 * Secuencia de Arranque con Efectos Visuales
 * ============================================
 */

class BootSequence {
    constructor() {
        this.bootStartTime = Date.now();
        this.bootImageUrl = 'https://res.cloudinary.com/dcclzhsim/image/upload/v1766961480/IMG_1273';
        this.bootStages = [];
        this.currentStage = 0;
        this.bootMessages = [];
        this.isBooting = false;
        this.bootCompleted = false;
        
        // Configuración de boot
        this.config = {
            showBios: true,
            showBootloader: true,
            showKernelMessages: true,
            showServices: true,
            showLogin: true,
            bootDelay: 100,
            stageDelay: 500,
            totalBootTime: 8000
        };
        
        // Estado del boot
        this.bootState = {
            bios: { completed: false, progress: 0 },
            bootloader: { completed: false, progress: 0 },
            kernel: { completed: false, progress: 0 },
            services: { completed: false, progress: 0 },
            desktop: { completed: false, progress: 0 }
        };
        
        this.init();
    }
    
    init() {
        console.log('[BOOT_SEQUENCE] Boot sequence initialized');
        this.setupBootStages();
        this.preloadBootImage();
    }
    
    setupBootStages() {
        this.bootStages = [
            { name: 'bios', duration: 1000, message: 'Initializing BIOS...' },
            { name: 'bootloader', duration: 1500, message: 'Loading Boot Manager...' },
            { name: 'kernel', duration: 2000, message: 'Loading RetroOS Kernel...' },
            { name: 'services', duration: 2500, message: 'Starting System Services...' },
            { name: 'desktop', duration: 1000, message: 'Initializing Desktop...' }
        ];
    }
    
    preloadBootImage() {
        const img = new Image();
        img.onload = () => {
            console.log('[BOOT_SEQUENCE] Boot image preloaded successfully');
        };
        img.onerror = () => {
            console.error('[BOOT_SEQUENCE] Failed to preload boot image');
        };
        img.src = this.bootImageUrl;
    }
    
    async startBootSequence() {
        if (this.isBooting) return;
        
        this.isBooting = true;
        this.bootStartTime = Date.now();
        
        console.log('[BOOT_SEQUENCE] Starting boot sequence...');
        
        try {
            // Crear overlay de boot
            this.createBootOverlay();
            
            // Mostrar logo de boot con imagen
            await this.showBootLogo();
            
            // Ejecutar secuencia de boot
            await this.executeBootSequence();
            
            // Completar boot y mostrar escritorio
            await this.completeBoot();
            
        } catch (error) {
            console.error('[BOOT_SEQUENCE] Boot failed:', error);
            this.showBootError(error);
        }
    }
    
    createBootOverlay() {
        // Crear overlay oscuro para el boot
        const overlay = document.createElement('div');
        overlay.id = 'boot-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: 'Courier New', monospace;
            color: #00ff41;
            overflow: hidden;
        `;
        
        document.body.appendChild(overlay);
        this.bootOverlay = overlay;
        
        // Agregar efectos de scanline CRT
        this.addScanlineEffect();
    }
    
    addScanlineEffect() {
        const scanlines = document.createElement('div');
        scanlines.className = 'boot-scanlines';
        scanlines.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            background: repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0, 255, 65, 0.03) 2px,
                rgba(0, 255, 65, 0.03) 4px
            );
            animation: scanlines 0.1s linear infinite;
        `;
        
        // Agregar keyframes para animación
        if (!document.getElementById('boot-animations')) {
            const style = document.createElement('style');
            style.id = 'boot-animations';
            style.textContent = `
                @keyframes scanlines {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(4px); }
                }
                
                @keyframes boot-flicker {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.95; }
                }
                
                @keyframes boot-glow {
                    0%, 100% { text-shadow: 0 0 5px #00ff41, 0 0 10px #00ff41; }
                    50% { text-shadow: 0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41; }
                }
                
                @keyframes progress-bar {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
                
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @typing {
                    from { width: 0; }
                    to { width: 100%; }
                }
                
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        this.bootOverlay.appendChild(scanlines);
    }
    
    async showBootLogo() {
        return new Promise((resolve) => {
            // Contenedor del logo
            const logoContainer = document.createElement('div');
            logoContainer.className = 'boot-logo-container';
            logoContainer.style.cssText = `
                position: relative;
                width: 400px;
                height: 300px;
                margin-bottom: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid #00ff41;
                background: rgba(0, 0, 0, 0.8);
                box-shadow: 0 0 30px rgba(0, 255, 65, 0.5);
                animation: boot-flicker 3s ease-in-out infinite;
            `;
            
            // Imagen de boot
            const bootImage = document.createElement('img');
            bootImage.src = this.bootImageUrl;
            bootImage.style.cssText = `
                max-width: 90%;
                max-height: 90%;
                object-fit: contain;
                filter: brightness(1.2) contrast(1.1);
            `;
            
            // Texto del sistema operativo
            const osText = document.createElement('div');
            osText.style.cssText = `
                position: absolute;
                bottom: -40px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 18px;
                font-weight: bold;
                color: #00ff41;
                text-shadow: 0 0 10px #00ff41;
                animation: boot-glow 2s ease-in-out infinite;
            `;
            osText.textContent = 'RETROS v18.0 - AETHERIS';
            
            logoContainer.appendChild(bootImage);
            logoContainer.appendChild(osText);
            this.bootOverlay.appendChild(logoContainer);
            
            // Efecto de inicialización de pantalla
            setTimeout(() => {
                logoContainer.style.animation = 'fade-in 1s ease-out';
                resolve();
            }, 500);
        });
    }
    
    async executeBootSequence() {
        // Contenedor de mensajes de boot
        const messagesContainer = document.createElement('div');
        messagesContainer.className = 'boot-messages';
        messagesContainer.style.cssText = `
            width: 80%;
            max-width: 800px;
            height: 300px;
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid #00ff41;
            padding: 20px;
            font-size: 12px;
            line-height: 1.4;
            overflow-y: auto;
            margin-bottom: 20px;
            box-shadow: inset 0 0 20px rgba(0, 255, 65, 0.2);
        `;
        
        // Barra de progreso
        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = `
            width: 80%;
            max-width: 800px;
            height: 20px;
            background: rgba(0, 0, 0, 0.8);
            border: 1px solid #00ff41;
            position: relative;
            margin-bottom: 20px;
        `;
        
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            height: 100%;
            background: linear-gradient(90deg, #00ff41, #00cc33);
            width: 0%;
            transition: width 0.3s ease;
            box-shadow: 0 0 10px #00ff41;
        `;
        
        const progressText = document.createElement('div');
        progressText.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 12px;
            color: #000;
            font-weight: bold;
            text-shadow: 0 0 5px #00ff41;
        `;
        progressText.textContent = '0%';
        
        progressContainer.appendChild(progressBar);
        progressContainer.appendChild(progressText);
        
        // Información de boot
        const bootInfo = document.createElement('div');
        bootInfo.style.cssText = `
            text-align: center;
            font-size: 11px;
            color: #00ff41;
            opacity: 0.8;
        `;
        bootInfo.innerHTML = `
            <div>RetroOS v18.0 - Aetheris Core</div>
            <div>Kernel: ${navigator.platform} - Memory: 8GB - CPU: 4 cores</div>
            <div>Boot Mode: Normal - Security: ${this.isGodMode ? 'GOD MODE' : 'Standard'}</div>
        `;
        
        this.bootOverlay.appendChild(messagesContainer);
        this.bootOverlay.appendChild(progressContainer);
        this.bootOverlay.appendChild(bootInfo);
        
        this.messagesContainer = messagesContainer;
        this.progressBar = progressBar;
        this.progressText = progressText;
        
        // Ejecutar cada etapa del boot
        for (let i = 0; i < this.bootStages.length; i++) {
            const stage = this.bootStages[i];
            await this.executeBootStage(stage, i);
        }
    }
    
    async executeBootStage(stage, index) {
        const stageStartTime = Date.now();
        
        // Agregar mensaje de inicio de etapa
        this.addBootMessage(stage.message, 'info');
        
        // Generar mensajes específicos de la etapa
        await this.generateStageMessages(stage.name);
        
        // Actualizar barra de progreso
        const progress = ((index + 1) / this.bootStages.length) * 100;
        this.updateProgress(progress);
        
        // Marcar etapa como completada
        this.bootState[stage.name].completed = true;
        this.bootState[stage.name].progress = 100;
        
        // Esperar el tiempo restante de la etapa
        const elapsed = Date.now() - stageStartTime;
        const remaining = Math.max(0, stage.duration - elapsed);
        
        if (remaining > 0) {
            await this.delay(remaining);
        }
    }
    
    async generateStageMessages(stageName) {
        const messages = this.getStageMessages(stageName);
        
        for (const message of messages) {
            await this.delay(this.config.bootDelay * (Math.random() * 2 + 1));
            this.addBootMessage(message.text, message.type);
        }
    }
    
    getStageMessages(stageName) {
        const messages = {
            bios: [
                { text: 'BIOS Revision 18.0.0 - Aetheris Core', type: 'info' },
                { text: 'Memory Test: 8192MB OK', type: 'success' },
                { text: 'CPU: Intel(R) Core(TM) i5-7200U @ 2.50GHz', type: 'info' },
                { text: 'Initializing USB Controller...', type: 'info' },
                { text: 'USB: 4 ports detected', type: 'success' },
                { text: 'Initializing SATA Controller...', type: 'info' },
                { text: 'SATA: 2 devices detected', type: 'success' },
                { text: 'Press F2 to enter BIOS Setup', type: 'warning' }
            ],
            bootloader: [
                { text: 'RetroOS Boot Manager v18.0', type: 'info' },
                { text: 'Loading kernel image...', type: 'info' },
                { text: 'Kernel: retroos-kernel-5.4.0-42-generic', type: 'info' },
                { text: 'Initrd: retroos-initrd.img', type: 'info' },
                { text: 'Boot parameters: quiet splash', type: 'info' },
                { text: 'Starting kernel boot...', type: 'info' }
            ],
            kernel: [
                { text: '[0.000000] Linux version 5.4.0-42-generic', type: 'info' },
                { text: '[0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz', type: 'info' },
                { text: '[0.123456] CPU: Intel Core i5-7200U', type: 'info' },
                { text: '[0.234567] Memory: 8192MB RAM available', type: 'success' },
                { text: '[0.345678] Detected hardware:', type: 'info' },
                { text: '[0.456789] - Storage: Virtual SATA Disk', type: 'info' },
                { text: '[0.567890] - Network: Intel 82540EM', type: 'info' },
                { text: '[0.678901] - Audio: Intel HD Audio', type: 'info' },
                { text: '[0.789012] - Video: NVIDIA GeForce 210', type: 'info' },
                { text: '[1.234567] Mounting root filesystem...', type: 'info' },
                { text: '[1.345678] EXT4-fs (sda1): mounted filesystem', type: 'success' },
                { text: '[1.456789] Loading Neural Gateway...', type: 'info' },
                { text: '[1.567890] Neural Gateway v2.0 initialized', type: 'success' },
                { text: '[1.678901] KernelFS mounted successfully', type: 'success' },
                { text: '[1.789012] Aetheris Core AI system loaded', type: 'success' }
            ],
            services: [
                { text: 'Starting system services...', type: 'info' },
                { text: '[OK] Started systemd-udevd', type: 'success' },
                { text: '[OK] Started systemd-journald', type: 'success' },
                { text: '[OK] Started networking service', type: 'success' },
                { text: '[OK] Started SSH daemon', type: 'success' },
                { text: '[OK] Started cron daemon', type: 'success' },
                { text: '[OK] Started syslog daemon', type: 'success' },
                { text: '[OK] Started Neural Gateway service', type: 'success' },
                { text: '[OK] Started KernelFS service', type: 'success' },
                { text: '[OK] Started Window Manager service', type: 'success' },
                { text: 'Initializing hardware drivers...', type: 'info' },
                { text: '[OK] Intel graphics driver loaded', type: 'success' },
                { text: '[OK] Intel network driver loaded', type: 'success' },
                { text: '[OK] Intel audio driver loaded', type: 'success' },
                { text: 'All services started successfully', type: 'success' }
            ],
            desktop: [
                { text: 'Initializing desktop environment...', type: 'info' },
                { text: 'Loading window manager...', type: 'info' },
                { text: 'Window Manager v2.0 initialized', type: 'success' },
                { text: 'Loading system tray...', type: 'info' },
                { text: 'System tray loaded', type: 'success' },
                { text: 'Starting user session...', type: 'info' },
                { text: 'User session started', type: 'success' },
                { text: 'Boot sequence completed successfully!', type: 'success' }
            ]
        };
        
        return messages[stageName] || [];
    }
    
    addBootMessage(text, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.style.cssText = `
            margin: 2px 0;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.2;
            ${this.getMessageStyle(type)}
        `;
        messageElement.textContent = text;
        
        this.messagesContainer.appendChild(messageElement);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        
        this.bootMessages.push({ text, type, timestamp: Date.now() });
    }
    
    getMessageStyle(type) {
        const styles = {
            info: 'color: #00ff41;',
            success: 'color: #00ff41; font-weight: bold;',
            warning: 'color: #ffff00;',
            error: 'color: #ff0000; font-weight: bold;',
            debug: 'color: #888888;'
        };
        return styles[type] || styles.info;
    }
    
    updateProgress(percent) {
        this.progressBar.style.width = `${percent}%`;
        this.progressText.textContent = `${Math.round(percent)}%`;
        
        // Efecto de parpadeo en 100%
        if (percent >= 100) {
            this.progressBar.style.animation = 'boot-glow 1s ease-in-out infinite';
        }
    }
    
    async completeBoot() {
        await this.delay(1000);
        
        // Agregar mensaje final
        this.addBootMessage('System boot completed successfully!', 'success');
        this.addBootMessage('Welcome to RetroOS v18.0 - Aetheris Core', 'info');
        this.addBootMessage('Type "help" for available commands', 'info');
        
        // Esperar un momento antes de ocultar el overlay
        await this.delay(2000);
        
        // Transición suave hacia el escritorio
        this.bootOverlay.style.transition = 'opacity 1.5s ease-out';
        this.bootOverlay.style.opacity = '0';
        
        await this.delay(1500);
        
        // Eliminar overlay de boot
        document.body.removeChild(this.bootOverlay);
        
        this.bootCompleted = true;
        this.isBooting = false;
        
        console.log('[BOOT_SEQUENCE] Boot sequence completed');
        
        // Notificar al sistema que el boot está completo
        if (window.systemCore) {
            window.systemCore.emitEvent('system', 'boot_complete', {
                bootTime: Date.now() - this.bootStartTime,
                stages: this.bootState
            });
        }
    }
    
    showBootError(error) {
        this.bootOverlay.style.background = 'linear-gradient(135deg, #330000 0%, #000000 50%, #330000 100%)';
        
        const errorContainer = document.createElement('div');
        errorContainer.style.cssText = `
            text-align: center;
            color: #ff0000;
            text-shadow: 0 0 10px #ff0000;
        `;
        
        const errorTitle = document.createElement('h2');
        errorTitle.textContent = 'BOOT FAILURE';
        errorTitle.style.cssText = `
            font-size: 48px;
            margin-bottom: 20px;
            animation: boot-flicker 0.5s ease-in-out infinite;
        `;
        
        const errorMessage = document.createElement('div');
        errorMessage.textContent = error.message;
        errorMessage.style.cssText = `
            font-size: 18px;
            margin-bottom: 30px;
        `;
        
        const rebootButton = document.createElement('button');
        rebootButton.textContent = 'REBOOT SYSTEM';
        rebootButton.style.cssText = `
            background: #ff0000;
            color: #000;
            border: 2px solid #ff0000;
            padding: 10px 20px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            text-transform: uppercase;
        `;
        rebootButton.onclick = () => {
            location.reload();
        };
        
        errorContainer.appendChild(errorTitle);
        errorContainer.appendChild(errorMessage);
        errorContainer.appendChild(rebootButton);
        
        this.bootOverlay.innerHTML = '';
        this.bootOverlay.appendChild(errorContainer);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // ============================================
    // MÉTODOS PÚBLICOS
    // ============================================
    isBooting() {
        return this.isBooting;
    }
    
    isBootCompleted() {
        return this.bootCompleted;
    }
    
    getBootTime() {
        return this.bootCompleted ? Date.now() - this.bootStartTime : null;
    }
    
    getBootMessages() {
        return this.bootMessages;
    }
    
    getBootState() {
        return this.bootState;
    }
    
    // Reiniciar secuencia de boot
    async reboot() {
        if (this.bootOverlay && document.body.contains(this.bootOverlay)) {
            document.body.removeChild(this.bootOverlay);
        }
        
        this.bootState = {
            bios: { completed: false, progress: 0 },
            bootloader: { completed: false, progress: 0 },
            kernel: { completed: false, progress: 0 },
            services: { completed: false, progress: 0 },
            desktop: { completed: false, progress: 0 }
        };
        
        this.bootMessages = [];
        this.currentStage = 0;
        this.bootCompleted = false;
        this.isBooting = false;
        
        await this.startBootSequence();
    }
}

// ============================================
// EXPORTAR BOOT SEQUENCE
// ============================================
window.BootSequence = BootSequence;
window.bootSequence = new BootSequence();

console.log('[BOOT_SEQUENCE] Boot Sequence module loaded successfully');