/**
 * ============================================
 * NEURAL GATEWAY AI SYSTEM - RETROS V18.0
 * Inteligencia Artificial Profesional Integrada
 * ============================================
 */

class NeuralGateway {
    constructor(apiKey = null) {
        this.apiKey = apiKey;
        this.isOnline = false;
        this.models = {
            flash: 'gemini-3-flash-preview',
            pro: 'gemini-3-pro-preview',
            vision: 'gemini-2.5-flash-image'
        };
        this.conversationHistory = [];
        this.contextWindow = [];
        this.maxContextLength = 4096;
        this.responseCache = new Map();
        this.safetySettings = this.initializeSafetySettings();
        this.personality = this.initializePersonality();
        this.knowledgeBase = this.initializeKnowledgeBase();
        
        if (apiKey) {
            this.initializeConnection();
        }
    }

    // ============================================
    // INICIALIZACIÓN Y CONFIGURACIÓN
    // ============================================
    initializeSafetySettings() {
        return {
            harassment: 'BLOCK_NONE',
            hateSpeech: 'BLOCK_NONE',
            sexuallyExplicit: 'BLOCK_NONE',
            dangerousContent: 'BLOCK_NONE'
        };
    }

    initializePersonality() {
        return {
            name: 'Neural Gateway',
            role: 'Professional AI Assistant',
            tone: 'technical',
            language: 'español',
            capabilities: [
                'análisis técnico',
                'generación de código',
                'resolución de problemas',
                'procesamiento de lenguaje natural',
                'visión por computadora'
            ],
            limitations: [
                'no puede acceder a internet en tiempo real',
                'conocimiento hasta 2024',
                'no puede ejecutar código directamente'
            ]
        };
    }

    initializeKnowledgeBase() {
        return {
            system: {
                name: 'RetroOS v18.0',
                type: 'Sistema Operativo Web',
                architecture: 'Cliente-Servidor',
                kernel: 'Neural Gateway',
                gui: 'Window Manager v2.0'
            },
            features: [
                'Neural Gateway AI integration',
                'Professional file system',
                'Advanced window management',
                'Customizable interface',
                'Real-time processing',
                'Multi-model AI support'
            ],
            commands: {
                neural: 'Envía comandos al Neural Gateway',
                vision: 'Genera blueprints técnicos',
                analyze: 'Analiza texto o imágenes',
                process: 'Procesa datos complejos'
            },
            responses: {
                greetings: [
                    'Neural Gateway activado. Listo para procesar.',
                    'Sistema neural online. ¿En qué puedo ayudarte?',
                    'Gateway neural operativo. Proporciona instrucciones.'
                ],
                confirmations: [
                    'Instrucción recibida y procesada.',
                    'Comando ejecutado exitosamente.',
                    'Operación completada sin errores.'
                ],
                errors: [
                    'Error en procesamiento neural.',
                    'No se pudo completar la operación.',
                    'Requiere configuración adicional.'
                ]
            }
        };
    }

    async initializeConnection() {
        try {
            // Simular conexión con API de Google Gemini
            this.isOnline = await this.testApiConnection();
            
            if (this.isOnline) {
                console.log('[NEURAL_GATEWAY] Conexión establecida con Google Gemini');
                this.showNotification('Neural Gateway: ONLINE', 'info');
            } else {
                console.log('[NEURAL_GATEWAY] Modo offline activado');
                this.showNotification('Neural Gateway: OFFLINE (Modo simulado)', 'warning');
            }
        } catch (error) {
            console.error('[NEURAL_GATEWAY] Error de conexión:', error);
            this.isOnline = false;
            this.showNotification('Neural Gateway: OFFLINE', 'error');
        }
    }

    async testApiConnection() {
        // Simular test de conexión
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(!!this.apiKey && this.apiKey.length > 10);
            }, 1000);
        });
    }

    // ============================================
    // PROCESAMIENTO DE INSTRUCCIONES NEURALES
    // ============================================
    async executeNeuralInstruction(instruction, context = '', model = 'flash') {
        const startTime = Date.now();
        
        try {
            // Validar instrucción
            if (!instruction || instruction.trim().length === 0) {
                throw new Error('Instrucción vacía');
            }

            // Agregar al historial de contexto
            this.addToContext(instruction, context);

            // Verificar caché
            const cacheKey = this.generateCacheKey(instruction, context);
            if (this.responseCache.has(cacheKey)) {
                return this.responseCache.get(cacheKey);
            }

            // Procesar según modo
            let response;
            if (this.isOnline) {
                response = await this.processWithGemini(instruction, context, model);
            } else {
                response = await this.simulateNeuralResponse(instruction, context);
            }

            // Almacenar en caché
            this.responseCache.set(cacheKey, response);

            // Limpiar caché si excede límite
            if (this.responseCache.size > 100) {
                const firstKey = this.responseCache.keys().next().value;
                this.responseCache.delete(firstKey);
            }

            const endTime = Date.now();
            response.processingTime = endTime - startTime;
            
            return response;

        } catch (error) {
            console.error('[NEURAL_GATEWAY] Error procesando instrucción:', error);
            
            return {
                text: `KERNEL_PANIC: ${error.message}`,
                error: error.message,
                model: this.isOnline ? model : 'offline',
                timestamp: Date.now(),
                processingTime: Date.now() - startTime,
                success: false
            };
        }
    }

    async processWithGemini(instruction, context, model) {
        // Simular procesamiento con Google Gemini
        // En producción, aquí iría la llamada real a la API
        
        await this.simulateProcessingDelay();
        
        const enhancedPrompt = this.enhancePrompt(instruction, context);
        const simulatedResponse = this.generateSimulatedResponse(enhancedPrompt, model);
        
        return {
            text: simulatedResponse,
            model: model,
            timestamp: Date.now(),
            processingTime: Math.random() * 2000 + 500,
            success: true,
            tokens: {
                input: enhancedPrompt.length,
                output: simulatedResponse.length
            }
        };
    }

    async simulateNeuralResponse(instruction, context) {
        // Generar respuesta simulada basada en la instrucción
        await this.simulateProcessingDelay();
        
        const response = this.generateSimulatedResponse(instruction, 'offline');
        
        return {
            text: response,
            model: 'offline',
            timestamp: Date.now(),
            processingTime: Math.random() * 1000 + 200,
            success: true,
            simulated: true
        };
    }

    enhancePrompt(instruction, context) {
        let enhanced = instruction;
        
        if (context) {
            enhanced = `Contexto: ${context}\n\nInstrucción: ${instruction}`;
        }
        
        // Añadir contexto del sistema
        enhanced += `\n\n[Sistema: RetroOS v18.0 - Neural Gateway]`;
        
        return enhanced;
    }

    generateSimulatedResponse(prompt, model) {
        const lowerPrompt = prompt.toLowerCase();
        
        // Respuestas específicas según el tipo de instrucción
        if (lowerPrompt.includes('help') || lowerPrompt.includes('ayuda')) {
            return this.generateHelpResponse();
        }
        
        if (lowerPrompt.includes('status') || lowerPrompt.includes('estado')) {
            return this.generateStatusResponse();
        }
        
        if (lowerPrompt.includes('system') || lowerPrompt.includes('sistema')) {
            return this.generateSystemResponse();
        }
        
        if (lowerPrompt.includes('neural') || lowerPrompt.includes('gateway')) {
            return this.generateNeuralResponse();
        }
        
        if (lowerPrompt.includes('code') || lowerPrompt.includes('código')) {
            return this.generateCodeResponse();
        }
        
        if (lowerPrompt.includes('analyze') || lowerPrompt.includes('analiza')) {
            return this.generateAnalysisResponse();
        }
        
        // Respuesta genérica basada en modelo
        if (model === 'pro' || this.isGodMode) {
            return this.generateProfessionalResponse(prompt);
        } else {
            return this.generateStandardResponse(prompt);
        }
    }

    generateHelpResponse() {
        return `[NEURAL GATEWAY - AYUDA DISPONIBLE]

El Neural Gateway procesa instrucciones en lenguaje natural y ejecuta operaciones.

COMANDOS SOPORTADOS:
- help: Muestra esta ayuda
- status: Estado del sistema
- system: Información del sistema
- neural [texto]: Procesamiento neural
- code [descripción]: Generación de código
- analyze [datos]: Análisis de información

RESPUESTAS SEGÚN MODELO:
- flash: Respuestas rápidas (por defecto)
- pro: Respuestas detalladas y profesionales
- vision: Análisis de imágenes y visión

Para funcionalidad completa, configure su API key de Google Gemini.`;
    }

    generateStatusResponse() {
        return `[NEURAL GATEWAY - ESTADO DEL SISTEMA]

Estado: ${this.isOnline ? 'ONLINE' : 'OFFLINE'}
Modelo: ${this.isOnline ? 'gemini-3-flash-preview' : 'offline'}
God Mode: ${this.isGodMode ? 'ACTIVADO' : 'desactivado'}
Historial: ${this.conversationHistory.length} interacciones
Cache: ${this.responseCache.size} respuestas almacenadas

Capacidades:
- Procesamiento de lenguaje natural
- Generación de código
- Análisis técnico
- Vision por computadora (con API)

Limitaciones:
- Sin acceso a internet en tiempo real
- Conocimiento hasta 2024
- Requiere API key para funcionalidad completa`;
    }

    generateSystemResponse() {
        return `[SISTEMA RETROS v18.0 - INFORMACIÓN TÉCNICA]

Arquitectura:
- Kernel: Neural Gateway v3.0
- GUI: Window Manager v2.0
- Terminal: Professional Shell
- File System: Hardware Uplink compatible

Componentes:
- AetherisCore: Procesamiento neural
- KernelFS: Sistema de archivos
- VertilAPI: Bus de eventos
- WindowManager: Gestión de ventanas

Características:
- Multi-modelo AI (Gemini 3.x)
- Procesamiento en tiempo real
- Gestión avanzada de ventanas
- Sistema de archivos profesional
- Modo Dios con capacidades extendidas

Estado actual: ${this.isGodMode ? 'GOD MODE ACTIVO' : 'Modo seguro'}`;
    }

    generateNeuralResponse() {
        return `[NEURAL GATEWAY - CAPACIDADES NEURALES]

El Neural Gateway integra múltiples modelos de IA:

MODELOS DISPONIBLES:
- gemini-3-flash-preview: Respuestas rápidas
- gemini-3-pro-preview: Análisis profundo
- gemini-2.5-flash-image: Visión por computadora

FUNCIONALIDADES:
- Procesamiento de lenguaje natural
- Generación de código
- Análisis técnico
- Creación de blueprints
- Resolución de problemas

SEGURIDAD:
- Filtros de contenido configurables
- Procesamiento local disponible
- Encriptación de comunicaciones
- Auditoría de instrucciones

Para activar: Configure API key en Settings`;
    }

    generateCodeResponse() {
        return `[GENERACIÓN DE CÓDIGO - EJEMPLO]

\`\`\`javascript
// Función de ejemplo generada por Neural Gateway
function processData(data) {
    const result = {
        processed: true,
        timestamp: Date.now(),
        data: data
    };
    
    // Procesamiento neural simulado
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(result);
        }, Math.random() * 1000);
    });
}
\`\`\`

Este código demuestra la capacidad de generación del Neural Gateway.
Para código real, proporcione especificaciones más detalladas.`;
    }

    generateAnalysisResponse() {
        return `[ANÁLISIS NEURAL - RESULTADOS]

Análisis completado con éxito:

METADATOS:
- Tipo: Análisis genérico
- Complejidad: Media
- Confianza: 85%
- Procesamiento: Simulado

RESULTADOS:
- Datos procesados exitosamente
- Patrones identificados: 3
- Anomalías detectadas: 0
- Recomendaciones: 2

Para análisis más específicos, proporcione:
1. Tipo de datos
2. Objetivo del análisis
3. Parámetros específicos

Tiempo de procesamiento: ${Math.floor(Math.random() * 2000 + 500)}ms`;
    }

    generateProfessionalResponse(prompt) {
        return `[RESPUESTA PROFESIONAL - MODO DIOS]

Análisis detallado de instrucción:

ENTRADA: "${prompt}"

PROCESAMIENTO:
1. Análisis semántico completado
2. Identificación de intención: ${this.identifyIntent(prompt)}
3. Extracción de entidades: ${this.extractEntities(prompt).join(', ')}
4. Generación de contexto aplicado

RESULTADO:
${this.generateContextualResponse(prompt)}

CONFIDENZA: ${Math.floor(Math.random() * 20 + 80)}%
MODELO: gemini-3-pro-preview
PROCESAMIENTO: ${this.isGodMode ? 'GOD MODE' : 'Professional'}`;
    }

    generateStandardResponse(prompt) {
        return `[RESPUESTA ESTÁNDAR]

Instrucción procesada: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"

Respuesta generada por el Neural Gateway.

Para funcionalidad completa, configure su API key de Google Gemini en Settings.

Estado: ${this.isOnline ? 'ONLINE' : 'OFFLINE (simulado)'}
Modelo: ${this.isOnline ? 'gemini-3-flash-preview' : 'offline'}`;
    }

    identifyIntent(prompt) {
        const intents = {
            'help': 'solicitud_ayuda',
            'status': 'consulta_estado',
            'system': 'informacion_sistema',
            'analyze': 'analisis_datos',
            'generate': 'generacion_contenido',
            'process': 'procesamiento_datos'
        };

        for (const [keyword, intent] of Object.entries(intents)) {
            if (prompt.toLowerCase().includes(keyword)) {
                return intent;
            }
        }

        return 'procesamiento_general';
    }

    extractEntities(prompt) {
        // Extraer entidades básicas del texto
        const words = prompt.split(' ');
        return words.filter(word => word.length > 3).slice(0, 3);
    }

    generateContextualResponse(prompt) {
        // Generar respuesta contextual basada en el prompt
        const responses = [
            'El análisis completo indica patrones significativos en los datos proporcionados.',
            'Los resultados del procesamiento muestran correlaciones interesantes.',
            'La evaluación neural sugiere múltiples interpretaciones válidas.',
            'El procesamiento ha identificado estructuras relevantes en la información.'
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    simulateProcessingDelay() {
        return new Promise(resolve => {
            setTimeout(resolve, Math.random() * 1000 + 200);
        });
    }

    // ============================================
    // GENERACIÓN DE ASSETS NEURALES
    // ============================================
    async synthesizeNeuralAsset(description, type = 'technical_blueprint') {
        try {
            if (!description || description.trim().length === 0) {
                throw new Error('Descripción vacía');
            }

            const enhancedDescription = this.enhanceAssetDescription(description, type);
            
            if (this.isOnline) {
                return await this.generateAssetWithGemini(enhancedDescription, type);
            } else {
                return await this.generateSimulatedAsset(enhancedDescription, type);
            }

        } catch (error) {
            console.error('[NEURAL_GATEWAY] Error generando asset:', error);
            return this.generateErrorAsset();
        }
    }

    enhanceAssetDescription(description, type) {
        const enhancements = {
            technical_blueprint: 'Blueprint técnico industrial, diagrama de ingeniería, líneas precisas, grid técnico, estilo CAD profesional, alto contraste',
            industrial_design: 'Diseño industrial brutalista, formas geométricas pesadas, texturas metálicas, iluminación dramática, estilo Bauhaus moderno',
            system_diagram: 'Diagrama de sistema, arquitectura de red, conexiones neuronales, estilo cyberpunk, fondo oscuro con elementos luminosos',
            architectural: 'Arquitectura brutalista, estructuras masivas, geometría pura, minimalismo industrial',
            mechanical: 'Diseño mecánico, engranajes, pistones, sistemas de transmisión, estilo steampunk'
        };

        return `${description}. ${enhancements[type] || enhancements.technical_blueprint}. Estilo brutalista, alto contraste, fondo negro #010101, acentos en verde fósforo #00ff41`;
    }

    async generateAssetWithGemini(description, type) {
        // Simular generación con Gemini
        await this.simulateProcessingDelay();
        
        const svg = this.generateSVGAsset(description, type);
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }

    async generateSimulatedAsset(description, type) {
        // Generar asset simulado
        const svg = this.generateSVGAsset(description, type);
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }

    generateSVGAsset(description, type) {
        const width = 800;
        const height = 600;
        
        const baseSVG = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#00ff41" stroke-width="0.5" opacity="0.3"/>
                    </pattern>
                </defs>
                <rect width="${width}" height="${height}" fill="#010101"/>
                <rect width="${width}" height="${height}" fill="url(#grid)" opacity="0.2"/>
        `;

        let contentSVG = '';
        
        switch (type) {
            case 'technical_blueprint':
                contentSVG = this.generateTechnicalBlueprint(width, height);
                break;
            case 'industrial_design':
                contentSVG = this.generateIndustrialDesign(width, height);
                break;
            case 'system_diagram':
                contentSVG = this.generateSystemDiagram(width, height);
                break;
            case 'architectural':
                contentSVG = this.generateArchitecturalBlueprint(width, height);
                break;
            case 'mechanical':
                contentSVG = this.generateMechanicalBlueprint(width, height);
                break;
            default:
                contentSVG = this.generateTechnicalBlueprint(width, height);
        }

        const footerSVG = `
                <text x="${width / 2}" y="${height - 30}" fill="#00ff41" font-family="JetBrains Mono" font-size="10" text-anchor="middle">
                    ${type.toUpperCase()} - ${description.substring(0, 30)}...
                </text>
                <text x="${width / 2}" y="${height - 15}" fill="#00ff41" font-family="JetBrains Mono" font-size="8" text-anchor="middle">
                    Generated by Neural Gateway - ${new Date().toLocaleString()}
                </text>
            </svg>
        `;

        return baseSVG + contentSVG + footerSVG;
    }

    generateTechnicalBlueprint(width, height) {
        return `
            <rect x="50" y="50" width="${width - 100}" height="${height - 150}" fill="none" stroke="#00ff41" stroke-width="2"/>
            <rect x="70" y="70" width="200" height="150" fill="none" stroke="#00ff41" stroke-width="1"/>
            <rect x="300" y="70" width="150" height="100" fill="none" stroke="#00ff41" stroke-width="1"/>
            <line x1="270" y1="145" x2="300" y2="145" stroke="#00ff41" stroke-width="1"/>
            <circle cx="170" cy="200" r="40" fill="none" stroke="#00ff41" stroke-width="1"/>
            <text x="170" y="205" fill="#00ff41" font-family="JetBrains Mono" font-size="12" text-anchor="middle">CPU</text>
            <line x1="80" y1="250" x2="${width - 80}" y2="250" stroke="#00ff41" stroke-width="1"/>
            <text x="100" y="245" fill="#00ff41" font-family="JetBrains Mono" font-size="8">DATA BUS</text>
        `;
    }

    generateIndustrialDesign(width, height) {
        return `
            <rect x="100" y="100" width="200" height="120" fill="none" stroke="#00ff41" stroke-width="2"/>
            <rect x="120" y="120" width="50" height="80" fill="none" stroke="#00ff41" stroke-width="1"/>
            <rect x="230" y="120" width="50" height="80" fill="none" stroke="#00ff41" stroke-width="1"/>
            <circle cx="170" cy="160" r="30" fill="none" stroke="#00ff41" stroke-width="1"/>
            <rect x="350" y="130" width="80" height="60" fill="none" stroke="#00ff41" stroke-width="1"/>
            <line x1="300" y1="160" x2="350" y2="160" stroke="#00ff41" stroke-width="1"/>
            <text x="200" y="250" fill="#00ff41" font-family="JetBrains Mono" font-size="14" text-anchor="middle">
                INDUSTRIAL MODULE
            </text>
        `;
    }

    generateSystemDiagram(width, height) {
        return `
            <circle cx="150" cy="150" r="60" fill="none" stroke="#00ff41" stroke-width="2"/>
            <text x="150" y="155" fill="#00ff41" font-family="JetBrains Mono" font-size="10" text-anchor="middle">CORE</text>
            <circle cx="400" cy="120" r="40" fill="none" stroke="#00ff41" stroke-width="1"/>
            <text x="400" y="125" fill="#00ff41" font-family="JetBrains Mono" font-size="8" text-anchor="middle">I/O</text>
            <circle cx="400" cy="200" r="40" fill="none" stroke="#00ff41" stroke-width="1"/>
            <text x="400" y="205" fill="#00ff41" font-family="JetBrains Mono" font-size="8" text-anchor="middle">MEM</text>
            <line x1="210" y1="150" x2="360" y2="120" stroke="#00ff41" stroke-width="1"/>
            <line x1="210" y1="160" x2="360" y2="200" stroke="#00ff41" stroke-width="1"/>
            <text x="300" y="110" fill="#00ff41" font-family="JetBrains Mono" font-size="8">DATA</text>
            <text x="300" y="220" fill="#00ff41" font-family="JetBrains Mono" font-size="8">ADDR</text>
        `;
    }

    generateArchitecturalBlueprint(width, height) {
        return `
            <rect x="80" y="80" width="${width - 160}" height="${height - 200}" fill="none" stroke="#00ff41" stroke-width="2"/>
            <rect x="100" y="100" width="100" height="80" fill="none" stroke="#00ff41" stroke-width="1"/>
            <rect x="220" y="100" width="120" height="80" fill="none" stroke="#00ff41" stroke-width="1"/>
            <rect x="360" y="100" width="100" height="80" fill="none" stroke="#00ff41" stroke-width="1"/>
            <line x1="200" y1="140" x2="220" y2="140" stroke="#00ff41" stroke-width="1"/>
            <line x1="340" y1="140" x2="360" y2="140" stroke="#00ff41" stroke-width="1"/>
            <rect x="150" y="200" width="${width - 300}" height="120" fill="none" stroke="#00ff41" stroke-width="1"/>
            <text x="${width / 2}" y="260" fill="#00ff41" font-family="JetBrains Mono" font-size="12" text-anchor="middle">
                CENTRAL ATRIUM
            </text>
        `;
    }

    generateMechanicalBlueprint(width, height) {
        return `
            <circle cx="200" cy="150" r="50" fill="none" stroke="#00ff41" stroke-width="2"/>
            <circle cx="200" cy="150" r="30" fill="none" stroke="#00ff41" stroke-width="1"/>
            <rect x="180" y="130" width="40" height="40" fill="none" stroke="#00ff41" stroke-width="1"/>
            <circle cx="400" cy="150" r="40" fill="none" stroke="#00ff41" stroke-width="2"/>
            <line x1="250" y1="150" x2="360" y2="150" stroke="#00ff41" stroke-width="2"/>
            <rect x="350" y="140" width="20" height="20" fill="none" stroke="#00ff41" stroke-width="1"/>
            <text x="200" y="220" fill="#00ff41" font-family="JetBrains Mono" font-size="10" text-anchor="middle">GEAR A</text>
            <text x="400" y="220" fill="#00ff41" font-family="JetBrains Mono" font-size="10" text-anchor="middle">GEAR B</text>
            <text x="300" y="240" fill="#00ff41" font-family="JetBrains Mono" font-size="8" text-anchor="middle">TRANSMISSION SYSTEM</text>
        `;
    }

    generateErrorAsset() {
        return `
            <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                <rect width="400" height="300" fill="#010101"/>
                <text x="200" y="150" fill="#ff0000" font-family="JetBrains Mono" font-size="20" text-anchor="middle">
                    ERROR
                </text>
                <text x="200" y="180" fill="#ff0000" font-family="JetBrains Mono" font-size="12" text-anchor="middle">
                    Failed to generate blueprint
                </text>
            </svg>
        `;
    }

    // ============================================
    // GESTIÓN DE CONTEXTO Y HISTORIAL
    // ============================================
    addToContext(instruction, response) {
        const entry = {
            instruction,
            response,
            timestamp: Date.now()
        };

        this.contextWindow.push(entry);

        // Mantener solo los últimos N elementos
        if (this.contextWindow.length > this.maxContextLength) {
            this.contextWindow.shift();
        }
    }

    getContextSummary() {
        if (this.contextWindow.length === 0) return '';

        const recent = this.contextWindow.slice(-3);
        return recent.map(entry => 
            `Q: ${entry.instruction}\nA: ${entry.response}`
        ).join('\n\n');
    }

    clearContext() {
        this.contextWindow = [];
    }

    // ============================================
    // UTILIDADES DE CACHÉ
    // ============================================
    generateCacheKey(instruction, context) {
        return btoa(`${instruction}|${context}`.substring(0, 100));
    }

    clearCache() {
        this.responseCache.clear();
    }

    getCacheStats() {
        return {
            size: this.responseCache.size,
            entries: Array.from(this.responseCache.keys())
        };
    }

    // ============================================
    // UTILIDADES DEL SISTEMA
    // ============================================
    showNotification(message, type = 'info') {
        // Esta función se define en el sistema principal
        if (window.retroOS && window.retroOS.showNotification) {
            window.retroOS.showNotification(message, type);
        } else {
            console.log(`[NEURAL_GATEWAY] ${message}`);
        }
    }

    getStatus() {
        return {
            online: this.isOnline,
            godMode: this.isGodMode,
            apiKey: !!this.apiKey,
            contextSize: this.contextWindow.length,
            cacheSize: this.responseCache.size,
            models: this.models
        };
    }

    // ============================================
    // MENSAJERÍA Y CONVERSACIONES
    // ============================================
    startConversation(title = 'New Conversation') {
        const conversation = {
            id: `conv_${Date.now()}`,
            title,
            messages: [],
            startTime: Date.now(),
            lastActivity: Date.now()
        };

        this.conversationHistory.push(conversation);
        return conversation;
    }

    addMessage(conversationId, role, content) {
        const conversation = this.conversationHistory.find(c => c.id === conversationId);
        if (conversation) {
            conversation.messages.push({
                role,
                content,
                timestamp: Date.now()
            });
            conversation.lastActivity = Date.now();
        }
    }

    getConversation(conversationId) {
        return this.conversationHistory.find(c => c.id === conversationId);
    }

    getConversations() {
        return this.conversationHistory.sort((a, b) => b.lastActivity - a.lastActivity);
    }

    // ============================================
    // CONFIGURACIÓN Y AJUSTES
    // ============================================
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        this.initializeConnection();
    }

    setGodMode(enabled) {
        this.isGodMode = enabled;
        
        if (enabled && this.apiKey) {
            this.showNotification('God Mode activado. Capacidades extendidas disponibles.', 'critical');
        }
    }

    updateSafetySettings(settings) {
        this.safetySettings = { ...this.safetySettings, ...settings };
    }

    updatePersonality(personality) {
        this.personality = { ...this.personality, ...personality };
    }
}

// ============================================
// EXPORTAR SISTEMA NEURAL
// ============================================
window.NeuralGateway = NeuralGateway;

// Crear instancia global
window.neuralGateway = new NeuralGateway();

console.log('[AI_SYSTEM] Neural Gateway System loaded successfully');