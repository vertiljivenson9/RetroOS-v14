/**
 * ============================================
 * CINEMA ANALYZER - RETROS V18.0
 * Analizador de Medios y Reproductor Profesional
 * ============================================
 */

class CinemaAnalyzer {
    constructor() {
        this.isInitialized = false;
        this.currentMedia = null;
        this.playlist = [];
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.volume = 75;
        this.playbackRate = 1.0;
        this.loopMode = false;
        this.shuffleMode = false;
        this.equalizer = null;
        this.analyser = null;
        this.visualizer = null;
        this.mediaHistory = [];
        this.favorites = [];
        this.analysisResults = new Map();
        
        // Configuración del analizador
        this.config = {
            sampleRate: 44100,
            fftSize: 2048,
            smoothingTimeConstant: 0.8,
            minDecibels: -100,
            maxDecibels: -30,
            visualizationType: 'bars',
            colorScheme: 'phosphor',
            autoAnalyze: true,
            saveHistory: true,
            cacheResults: true,
            maxHistoryItems: 1000,
            supportedFormats: ['mp3', 'wav', 'ogg', 'mp4', 'webm', 'avi', 'mov', 'mkv']
        };
        
        // Análisis de audio
        this.audioAnalysis = {
            bpm: 0,
            key: null,
            energy: 0,
            dynamics: 0,
            brightness: 0,
            spectralCentroid: 0,
            zeroCrossingRate: 0,
            mfcc: [],
            chroma: [],
            onsetTimes: [],
            beatPattern: []
        };
        
        // Análisis de video
        this.videoAnalysis = {
            fps: 0,
            resolution: { width: 0, height: 0 },
            duration: 0,
            bitrate: 0,
            codec: null,
            sceneChanges: [],
            motionVectors: [],
            colorHistogram: [],
            brightness: 0,
            contrast: 0,
            saturation: 0
        };
        
        // Estadísticas de reproducción
        this.playbackStats = {
            totalPlayTime: 0,
            totalTracksPlayed: 0,
            averageTrackLength: 0,
            mostPlayedGenre: null,
            listeningTimeByHour: new Array(24).fill(0),
            preferredVolume: 0,
            skipRate: 0
        };
        
        this.init();
    }
    
    init() {
        console.log('[CINEMA_ANALYZER] Initializing Cinema Analyzer...');
        this.setupAudioContext();
        this.createVisualizer();
        this.loadUserPreferences();
        this.setupEventListeners();
        this.isInitialized = true;
    }
    
    setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = this.config.fftSize;
            this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant;
            this.analyser.minDecibels = this.config.minDecibels;
            this.analyser.maxDecibels = this.config.maxDecibels;
            
            // Crear ecualizador
            this.setupEqualizer();
            
        } catch (error) {
            console.error('[CINEMA_ANALYZER] Failed to create audio context:', error);
        }
    }
    
    setupEqualizer() {
        this.equalizer = {
            bands: [
                { frequency: 60, gain: 0, q: 1 },
                { frequency: 170, gain: 0, q: 1 },
                { frequency: 310, gain: 0, q: 1 },
                { frequency: 600, gain: 0, q: 1 },
                { frequency: 1000, gain: 0, q: 1 },
                { frequency: 3000, gain: 0, q: 1 },
                { frequency: 6000, gain: 0, q: 1 },
                { frequency: 12000, gain: 0, q: 1 },
                { frequency: 14000, gain: 0, q: 1 },
                { frequency: 16000, gain: 0, q: 1 }
            ],
            filters: []
        };
    }
    
    createVisualizer() {
        // Canvas para visualización
        this.canvas = document.createElement('canvas');
        this.canvas.width = 400;
        this.canvas.height = 200;
        this.ctx = this.canvas.getContext('2d');
        
        // Configurar estilo visual
        this.setupVisualizerStyle();
    }
    
    setupVisualizerStyle() {
        const styles = {
            phosphor: {
                background: '#010101',
                primary: '#00ff41',
                secondary: '#00cc33',
                accent: '#008822'
            },
            fire: {
                background: '#000000',
                primary: '#ff4400',
                secondary: '#ff6600',
                accent: '#ff8800'
            },
            ocean: {
                background: '#001122',
                primary: '#0088ff',
                secondary: '#00aaff',
                accent: '#00ccff'
            },
            matrix: {
                background: '#000000',
                primary: '#00ff00',
                secondary: '#44ff44',
                accent: '#88ff88'
            }
        };
        
        this.visualizerStyle = styles[this.config.colorScheme] || styles.phosphor;
    }
    
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('cinema_analyzer_prefs');
            if (saved) {
                const prefs = JSON.parse(saved);
                this.config = { ...this.config, ...prefs.config };
                this.volume = prefs.volume || this.volume;
                this.playbackRate = prefs.playbackRate || this.playbackRate;
                this.favorites = prefs.favorites || [];
            }
        } catch (error) {
            console.error('[CINEMA_ANALYZER] Failed to load preferences:', error);
        }
    }
    
    saveUserPreferences() {
        try {
            const prefs = {
                config: this.config,
                volume: this.volume,
                playbackRate: this.playbackRate,
                favorites: this.favorites,
                timestamp: Date.now()
            };
            localStorage.setItem('cinema_analyzer_prefs', JSON.stringify(prefs));
        } catch (error) {
            console.error('[CINEMA_ANALYZER] Failed to save preferences:', error);
        }
    }
    
    setupEventListeners() {
        // Escuchar cambios en el contexto de audio
        if (this.audioContext) {
            this.audioContext.addEventListener('statechange', () => {
                console.log('[CINEMA_ANALYZER] Audio context state:', this.audioContext.state);
            });
        }
    }
    
    // ============================================
    // CARGA Y GESTIÓN DE MEDIOS
    // ============================================
    async loadMedia(url, type = 'auto') {
        try {
            this.logActivity('load_media', { url, type });
            
            // Determinar tipo de medio
            if (type === 'auto') {
                type = this.detectMediaType(url);
            }
            
            // Crear elemento de medio apropiado
            let mediaElement;
            if (type.startsWith('audio/')) {
                mediaElement = new Audio(url);
            } else if (type.startsWith('video/')) {
                mediaElement = document.createElement('video');
                mediaElement.src = url;
            } else {
                throw new Error(`Unsupported media type: ${type}`);
            }
            
            // Esperar a que el medio esté listo
            await new Promise((resolve, reject) => {
                mediaElement.addEventListener('loadedmetadata', resolve);
                mediaElement.addEventListener('error', reject);
                mediaElement.load();
            });
            
            this.currentMedia = {
                element: mediaElement,
                url,
                type,
                metadata: this.extractMetadata(mediaElement)
            };
            
            // Conectar al contexto de audio para análisis
            this.connectToAudioContext(mediaElement);
            
            // Analizar el medio si está habilitado
            if (this.config.autoAnalyze) {
                await this.analyzeCurrentMedia();
            }
            
            // Actualizar historial
            this.updateMediaHistory(this.currentMedia);
            
            return this.currentMedia;
            
        } catch (error) {
            this.logError('load_media', error);
            throw error;
        }
    }
    
    detectMediaType(url) {
        const extension = url.split('.').pop().toLowerCase();
        const typeMap = {
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'mp4': 'video/mp4',
            'webm': 'video/webm',
            'avi': 'video/avi',
            'mov': 'video/quicktime',
            'mkv': 'video/x-matroska'
        };
        
        return typeMap[extension] || 'application/octet-stream';
    }
    
    extractMetadata(mediaElement) {
        const metadata = {
            duration: mediaElement.duration || 0,
            currentTime: mediaElement.currentTime || 0,
            volume: mediaElement.volume || 0,
            muted: mediaElement.muted || false,
            paused: mediaElement.paused || true,
            playbackRate: mediaElement.playbackRate || 1,
            readyState: mediaElement.readyState || 0,
            networkState: mediaElement.networkState || 0
        };
        
        // Información específica de video
        if (mediaElement.videoWidth) {
            metadata.videoWidth = mediaElement.videoWidth;
            metadata.videoHeight = mediaElement.videoHeight;
        }
        
        return metadata;
    }
    
    connectToAudioContext(mediaElement) {
        if (!this.audioContext || !this.analyser) return;
        
        try {
            // Crear source node
            const source = this.audioContext.createMediaElementSource(mediaElement);
            
            // Conectar a través del ecualizador si está disponible
            if (this.equalizer && this.equalizer.filters.length > 0) {
                let lastNode = source;
                this.equalizer.filters.forEach(filter => {
                    lastNode.connect(filter);
                    lastNode = filter;
                });
                lastNode.connect(this.analyser);
            } else {
                source.connect(this.analyser);
            }
            
            // Conectar al destino
            this.analyser.connect(this.audioContext.destination);
            
        } catch (error) {
            console.error('[CINEMA_ANALYZER] Failed to connect to audio context:', error);
        }
    }
    
    // ============================================
    // CONTROLES DE REPRODUCCIÓN
    // ============================================
    play() {
        if (!this.currentMedia) {
            throw new Error('No media loaded');
        }
        
        const promise = this.currentMedia.element.play();
        
        if (promise) {
            promise.then(() => {
                this.isPlaying = true;
                this.isPaused = false;
                this.logActivity('play');
                this.startVisualization();
            }).catch(error => {
                this.logError('play', error);
            });
        }
        
        return promise;
    }
    
    pause() {
        if (!this.currentMedia) return;
        
        this.currentMedia.element.pause();
        this.isPlaying = false;
        this.isPaused = true;
        this.logActivity('pause');
        this.stopVisualization();
    }
    
    stop() {
        if (!this.currentMedia) return;
        
        this.currentMedia.element.pause();
        this.currentMedia.element.currentTime = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.logActivity('stop');
        this.stopVisualization();
    }
    
    seek(time) {
        if (!this.currentMedia) return;
        
        this.currentMedia.element.currentTime = time;
        this.logActivity('seek', { time });
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        if (this.currentMedia) {
            this.currentMedia.element.volume = this.volume;
        }
        
        this.logActivity('set_volume', { volume });
        this.saveUserPreferences();
    }
    
    setPlaybackRate(rate) {
        this.playbackRate = rate;
        
        if (this.currentMedia) {
            this.currentMedia.element.playbackRate = rate;
        }
        
        this.logActivity('set_playback_rate', { rate });
        this.saveUserPreferences();
    }
    
    // ============================================
    // ANÁLISIS DE AUDIO
    // ============================================
    async analyzeCurrentMedia() {
        if (!this.currentMedia || !this.analyser) {
            throw new Error('No media or analyser available');
        }
        
        this.logActivity('analyze_media', { url: this.currentMedia.url });
        
        try {
            // Análisis de audio
            if (this.currentMedia.type.startsWith('audio/')) {
                await this.analyzeAudio();
            }
            
            // Análisis de video
            if (this.currentMedia.type.startsWith('video/')) {
                await this.analyzeVideo();
            }
            
            // Guardar resultados
            if (this.config.cacheResults) {
                this.cacheAnalysisResults();
            }
            
        } catch (error) {
            this.logError('analyze_media', error);
            throw error;
        }
    }
    
    async analyzeAudio() {
        const bufferLength = this.analyser.frequencyBinCount;
        const frequencyData = new Uint8Array(bufferLength);
        const timeDomainData = new Uint8Array(bufferLength);
        
        // Capturar datos del analizador
        this.analyser.getByteFrequencyData(frequencyData);
        this.analyser.getByteTimeDomainData(timeDomainData);
        
        // Calcular características
        this.audioAnalysis = {
            ...this.audioAnalysis,
            energy: this.calculateEnergy(timeDomainData),
            brightness: this.calculateBrightness(frequencyData),
            spectralCentroid: this.calculateSpectralCentroid(frequencyData),
            zeroCrossingRate: this.calculateZeroCrossingRate(timeDomainData),
            dynamics: this.calculateDynamics(timeDomainData)
        };
        
        // Detectar BPM (simulado)
        this.audioAnalysis.bpm = this.detectBPM(timeDomainData);
        
        // Detectar tonalidad (simulado)
        this.audioAnalysis.key = this.detectKey(frequencyData);
        
        return this.audioAnalysis;
    }
    
    calculateEnergy(timeDomainData) {
        let energy = 0;
        for (let i = 0; i < timeDomainData.length; i++) {
            const sample = (timeDomainData[i] - 128) / 128;
            energy += sample * sample;
        }
        return Math.sqrt(energy / timeDomainData.length);
    }
    
    calculateBrightness(frequencyData) {
        let highFreqEnergy = 0;
        let totalEnergy = 0;
        
        for (let i = 0; i < frequencyData.length; i++) {
            const energy = frequencyData[i] * frequencyData[i];
            totalEnergy += energy;
            
            if (i > frequencyData.length * 0.5) {
                highFreqEnergy += energy;
            }
        }
        
        return totalEnergy > 0 ? highFreqEnergy / totalEnergy : 0;
    }
    
    calculateSpectralCentroid(frequencyData) {
        let numerator = 0;
        let denominator = 0;
        
        for (let i = 0; i < frequencyData.length; i++) {
            const magnitude = frequencyData[i];
            numerator += i * magnitude;
            denominator += magnitude;
        }
        
        return denominator > 0 ? numerator / denominator : 0;
    }
    
    calculateZeroCrossingRate(timeDomainData) {
        let crossings = 0;
        let prevSample = (timeDomainData[0] - 128) / 128;
        
        for (let i = 1; i < timeDomainData.length; i++) {
            const sample = (timeDomainData[i] - 128) / 128;
            if ((prevSample >= 0 && sample < 0) || (prevSample < 0 && sample >= 0)) {
                crossings++;
            }
            prevSample = sample;
        }
        
        return crossings / timeDomainData.length;
    }
    
    calculateDynamics(timeDomainData) {
        let max = -Infinity;
        let min = Infinity;
        
        for (let i = 0; i < timeDomainData.length; i++) {
            const sample = (timeDomainData[i] - 128) / 128;
            max = Math.max(max, sample);
            min = Math.min(min, sample);
        }
        
        return max - min;
    }
    
    detectBPM(timeDomainData) {
        // Algoritmo simplificado de detección de BPM
        // En una implementación real, usaría algoritmos más sofisticados
        const baseBPM = 120;
        const variation = (Math.random() - 0.5) * 60;
        return Math.round(baseBPM + variation);
    }
    
    detectKey(frequencyData) {
        // Detección simplificada de tonalidad musical
        const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const keyIndex = Math.floor(Math.random() * keys.length);
        return keys[keyIndex];
    }
    
    async analyzeVideo() {
        if (!this.currentMedia.element.videoWidth) {
            throw new Error('No video element available');
        }
        
        const video = this.currentMedia.element;
        
        this.videoAnalysis = {
            fps: this.detectFPS(),
            resolution: {
                width: video.videoWidth,
                height: video.videoHeight
            },
            duration: video.duration,
            bitrate: this.estimateBitrate(),
            codec: this.detectCodec(),
            brightness: this.analyzeVideoBrightness(video),
            contrast: this.analyzeVideoContrast(video),
            saturation: this.analyzeVideoSaturation(video)
        };
        
        return this.videoAnalysis;
    }
    
    detectFPS() {
        // Estimar FPS basado en la duración y frames (simulado)
        return 30 + Math.random() * 30; // 30-60 FPS
    }
    
    estimateBitrate() {
        // Estimar bitrate basado en la duración y tamaño (simulado)
        return 1000000 + Math.random() * 9000000; // 1-10 Mbps
    }
    
    detectCodec() {
        // Detectar codec (simulado)
        const codecs = ['H.264', 'H.265', 'VP8', 'VP9', 'AV1'];
        return codecs[Math.floor(Math.random() * codecs.length)];
    }
    
    analyzeVideoBrightness(video) {
        // Análisis simplificado de brillo de video
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 100;
        canvas.height = 100;
        
        ctx.drawImage(video, 0, 0, 100, 100);
        const imageData = ctx.getImageData(0, 0, 100, 100);
        
        let brightness = 0;
        for (let i = 0; i < imageData.data.length; i += 4) {
            brightness += (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
        }
        
        return brightness / (imageData.data.length / 4) / 255;
    }
    
    analyzeVideoContrast(video) {
        // Análisis simplificado de contraste de video
        return 0.5 + Math.random() * 0.5; // 0.5 - 1.0
    }
    
    analyzeVideoSaturation(video) {
        // Análisis simplificado de saturación de video
        return 0.3 + Math.random() * 0.7; // 0.3 - 1.0
    }
    
    // ============================================
    // VISUALIZACIÓN
    // ============================================
    startVisualization() {
        if (!this.analyser) return;
        
        this.visualizationActive = true;
        this.visualize();
    }
    
    stopVisualization() {
        this.visualizationActive = false;
    }
    
    visualize() {
        if (!this.visualizationActive) return;
        
        requestAnimationFrame(() => this.visualize());
        
        const bufferLength = this.analyser.frequencyBinCount;
        const frequencyData = new Uint8Array(bufferLength);
        const timeDomainData = new Uint8Array(bufferLength);
        
        this.analyser.getByteFrequencyData(frequencyData);
        this.analyser.getByteTimeDomainData(timeDomainData);
        
        // Limpiar canvas
        this.ctx.fillStyle = this.visualizerStyle.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dibujar visualización según el tipo
        switch (this.config.visualizationType) {
            case 'bars':
                this.drawBars(frequencyData);
                break;
            case 'waveform':
                this.drawWaveform(timeDomainData);
                break;
            case 'circular':
                this.drawCircular(frequencyData);
                break;
            case 'spectrum':
                this.drawSpectrum(frequencyData);
                break;
            default:
                this.drawBars(frequencyData);
        }
    }
    
    drawBars(frequencyData) {
        const barWidth = this.canvas.width / frequencyData.length * 4;
        
        for (let i = 0; i < frequencyData.length / 4; i++) {
            const barHeight = (frequencyData[i] / 255) * this.canvas.height;
            
            // Crear gradiente
            const gradient = this.ctx.createLinearGradient(0, this.canvas.height, 0, this.canvas.height - barHeight);
            gradient.addColorStop(0, this.visualizerStyle.primary);
            gradient.addColorStop(1, this.visualizerStyle.secondary);
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(i * barWidth, this.canvas.height - barHeight, barWidth - 2, barHeight);
        }
    }
    
    drawWaveform(timeDomainData) {
        this.ctx.strokeStyle = this.visualizerStyle.primary;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        const sliceWidth = this.canvas.width / timeDomainData.length;
        let x = 0;
        
        for (let i = 0; i < timeDomainData.length; i++) {
            const v = (timeDomainData[i] / 128.0);
            const y = v * this.canvas.height / 2;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        this.ctx.stroke();
    }
    
    drawCircular(frequencyData) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        
        for (let i = 0; i < frequencyData.length; i++) {
            const angle = (i / frequencyData.length) * Math.PI * 2;
            const amplitude = (frequencyData[i] / 255) * radius;
            
            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + amplitude);
            const y2 = centerY + Math.sin(angle) * (radius + amplitude);
            
            this.ctx.strokeStyle = this.visualizerStyle.primary;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }
    }
    
    drawSpectrum(frequencyData) {
        const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        
        for (let x = 0; x < this.canvas.width; x++) {
            const frequencyIndex = Math.floor((x / this.canvas.width) * frequencyData.length);
            const intensity = frequencyData[frequencyIndex];
            
            for (let y = 0; y < this.canvas.height; y++) {
                const index = (y * this.canvas.width + x) * 4;
                
                // Mapear intensidad a color
                const color = this.intensityToColor(intensity, y / this.canvas.height);
                
                imageData.data[index] = color.r;
                imageData.data[index + 1] = color.g;
                imageData.data[index + 2] = color.b;
                imageData.data[index + 3] = 255;
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    intensityToColor(intensity, position) {
        const factor = intensity / 255;
        
        switch (this.config.colorScheme) {
            case 'fire':
                return {
                    r: Math.min(255, factor * 255),
                    g: Math.min(255, factor * 128),
                    b: 0
                };
            case 'ocean':
                return {
                    r: 0,
                    g: Math.min(255, factor * 128),
                    b: Math.min(255, factor * 255)
                };
            default: // phosphor
                return {
                    r: 0,
                    g: Math.min(255, factor * 255),
                    b: Math.min(255, factor * 128)
                };
        }
    }
    
    // ============================================
    // GESTIÓN DE LISTAS DE REPRODUCCIÓN
    // ============================================
    createPlaylist(name, tracks = []) {
        const playlist = {
            id: Date.now(),
            name,
            tracks,
            created: Date.now(),
            modified: Date.now(),
            playCount: 0
        };
        
        this.playlists = this.playlists || [];
        this.playlists.push(playlist);
        
        this.logActivity('create_playlist', { name, trackCount: tracks.length });
        return playlist;
    }
    
    addToPlaylist(playlistId, track) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) return false;
        
        playlist.tracks.push(track);
        playlist.modified = Date.now();
        
        this.logActivity('add_to_playlist', { playlistId, track });
        return true;
    }
    
    removeFromPlaylist(playlistId, trackIndex) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) return false;
        
        playlist.tracks.splice(trackIndex, 1);
        playlist.modified = Date.now();
        
        this.logActivity('remove_from_playlist', { playlistId, trackIndex });
        return true;
    }
    
    loadPlaylist(playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) return false;
        
        this.playlist = [...playlist.tracks];
        this.currentTrackIndex = 0;
        
        this.logActivity('load_playlist', { playlistId, name: playlist.name });
        return true;
    }
    
    // ============================================
    // CONTROLES DE ECUALIZADOR
    // ============================================
    setEqualizerBand(bandIndex, gain) {
        if (!this.equalizer || !this.equalizer.bands[bandIndex]) return false;
        
        this.equalizer.bands[bandIndex].gain = gain;
        
        // Actualizar filtro si está conectado
        if (this.equalizer.filters[bandIndex]) {
            this.equalizer.filters[bandIndex].gain.value = gain;
        }
        
        this.logActivity('set_eq_band', { bandIndex, gain });
        return true;
    }
    
    getEqualizerSettings() {
        return this.equalizer ? this.equalizer.bands : [];
    }
    
    resetEqualizer() {
        if (!this.equalizer) return;
        
        this.equalizer.bands.forEach(band => {
            band.gain = 0;
        });
        
        this.equalizer.filters.forEach(filter => {
            filter.gain.value = 0;
        });
        
        this.logActivity('reset_eq');
    }
    
    // ============================================
    // ANÁLISIS AVANZADO
    // ============================================
    detectSceneChanges() {
        // Detectar cambios de escena en video (simulado)
        const sceneChanges = [];
        const duration = this.currentMedia?.metadata.duration || 300;
        
        for (let i = 0; i < duration; i += 30) {
            if (Math.random() < 0.1) { // 10% de probabilidad de cambio de escena
                sceneChanges.push(i);
            }
        }
        
        this.videoAnalysis.sceneChanges = sceneChanges;
        return sceneChanges;
    }
    
    extractColorHistogram() {
        // Extraer histograma de color del video (simulado)
        const histogram = [];
        for (let i = 0; i < 256; i++) {
            histogram.push(Math.floor(Math.random() * 1000));
        }
        
        this.videoAnalysis.colorHistogram = histogram;
        return histogram;
    }
    
    generateThumbnails(interval = 10) {
        // Generar miniaturas del video (simulado)
        const thumbnails = [];
        const duration = this.currentMedia?.metadata.duration || 300;
        
        for (let time = 0; time < duration; time += interval) {
            thumbnails.push({
                time,
                data: `thumbnail_at_${time}s`,
                width: 160,
                height: 90
            });
        }
        
        return thumbnails;
    }
    
    // ============================================
    // ESTADÍSTICAS Y REPORTES
    // ============================================
    getPlaybackStats() {
        return {
            ...this.playbackStats,
            currentSession: {
                tracksPlayed: this.mediaHistory.length,
                totalTime: this.mediaHistory.reduce((total, media) => total + (media.metadata.duration || 0), 0),
                startTime: this.mediaHistory.length > 0 ? this.mediaHistory[0].timestamp : null
            }
        };
    }
    
    generateListeningReport() {
        const stats = this.getPlaybackStats();
        const report = {
            summary: {
                totalTracks: stats.totalTracksPlayed,
                totalPlayTime: stats.totalPlayTime,
                averageTrackLength: stats.averageTrackLength,
                skipRate: stats.skipRate
            },
            preferences: {
                mostPlayedGenre: stats.mostPlayedGenre,
                preferredVolume: stats.preferredVolume,
                peakListeningHour: this.getPeakListeningHour()
            },
            recentActivity: this.mediaHistory.slice(-10)
        };
        
        return report;
    }
    
    getPeakListeningHour() {
        let maxHour = 0;
        let maxCount = 0;
        
        this.playbackStats.listeningTimeByHour.forEach((time, hour) => {
            if (time > maxCount) {
                maxCount = time;
                maxHour = hour;
            }
        });
        
        return maxHour;
    }
    
    // ============================================
    // MÉTODOS DE UTILIDAD
    // ============================================
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }
    
    formatFileSize(bytes) {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 B';
        
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    updateMediaHistory(media) {
        if (!this.config.saveHistory) return;
        
        const historyEntry = {
            ...media,
            timestamp: Date.now(),
            playCount: 1
        };
        
        // Buscar si ya existe en el historial
        const existingIndex = this.mediaHistory.findIndex(entry => entry.url === media.url);
        if (existingIndex !== -1) {
            const existing = this.mediaHistory[existingIndex];
            existing.playCount++;
            existing.timestamp = Date.now();
            this.mediaHistory.splice(existingIndex, 1);
        }
        
        this.mediaHistory.unshift(historyEntry);
        
        // Limitar tamaño del historial
        if (this.mediaHistory.length > this.config.maxHistoryItems) {
            this.mediaHistory = this.mediaHistory.slice(0, this.config.maxHistoryItems);
        }
        
        // Actualizar estadísticas
        this.updatePlaybackStats();
    }
    
    updatePlaybackStats() {
        const stats = this.playbackStats;
        
        stats.totalTracksPlayed = this.mediaHistory.length;
        stats.totalPlayTime = this.mediaHistory.reduce((total, media) => 
            total + (media.metadata.duration || 0), 0
        );
        stats.averageTrackLength = stats.totalPlayTime / stats.totalTracksPlayed;
        
        // Calcular hora pico de escucha
        const hour = new Date().getHours();
        stats.listeningTimeByHour[hour]++;
        
        // Volumen preferido (promedio)
        stats.preferredVolume = this.volume;
    }
    
    logActivity(action, data = {}) {
        const activity = {
            timestamp: Date.now(),
            action,
            data,
            media: this.currentMedia ? {
                url: this.currentMedia.url,
                type: this.currentMedia.type
            } : null
        };
        
        if (window.systemCore) {
            window.systemCore.emitEvent('media', action, activity);
        }
        
        console.log(`[CINEMA_ANALYZER] ${action}:`, data);
    }
    
    logError(action, error) {
        this.logActivity('error', {
            action,
            error: error.message,
            stack: error.stack
        });
    }
    
    cacheAnalysisResults() {
        if (!this.currentMedia) return;
        
        const results = {
            audio: this.audioAnalysis,
            video: this.videoAnalysis,
            timestamp: Date.now()
        };
        
        this.analysisResults.set(this.currentMedia.url, results);
    }
    
    getCachedAnalysis(url) {
        return this.analysisResults.get(url);
    }
    
    // ============================================
    // MÉTODOS PÚBLICOS
    // ============================================
    isInitialized() {
        return this.isInitialized;
    }
    
    isPlaying() {
        return this.isPlaying;
    }
    
    getCurrentMedia() {
        return this.currentMedia;
    }
    
    getAnalysisResults() {
        return {
            audio: this.audioAnalysis,
            video: this.videoAnalysis
        };
    }
    
    getCanvas() {
        return this.canvas;
    }
    
    getVisualizerStyle() {
        return this.visualizerStyle;
    }
    
    setVisualizationType(type) {
        const validTypes = ['bars', 'waveform', 'circular', 'spectrum'];
        if (validTypes.includes(type)) {
            this.config.visualizationType = type;
            return true;
        }
        return false;
    }
    
    setColorScheme(scheme) {
        const validSchemes = ['phosphor', 'fire', 'ocean', 'matrix'];
        if (validSchemes.includes(scheme)) {
            this.config.colorScheme = scheme;
            this.setupVisualizerStyle();
            return true;
        }
        return false;
    }
    
    exportAnalysisData() {
        const data = {
            timestamp: Date.now(),
            currentMedia: this.currentMedia,
            analysis: this.getAnalysisResults(),
            playbackStats: this.getPlaybackStats(),
            preferences: {
                volume: this.volume,
                playbackRate: this.playbackRate,
                colorScheme: this.config.colorScheme,
                visualizationType: this.config.visualizationType
            }
        };
        
        return JSON.stringify(data, null, 2);
    }
}

// ============================================
// EXPORTAR CINEMA ANALYZER
// ============================================
window.CinemaAnalyzer = CinemaAnalyzer;
window.cinemaAnalyzer = new CinemaAnalyzer();

console.log('[CINEMA_ANALYZER] Cinema Analyzer module loaded successfully');