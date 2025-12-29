/**
 * ============================================
 * CORTEX BACKDOOR - RETROS V18.0
 * Sistema de Depuración y Análisis Avanzado
 * ============================================
 */

class CortexBackdoor {
    constructor() {
        this.isActive = false;
        this.debugMode = false;
        this.traceMode = false;
        this.logLevel = 'info';
        this.breakpoints = new Map();
        this.watchVariables = new Map();
        this.callStack = [];
        this.performanceMetrics = new Map();
        this.memorySnapshots = [];
        this.systemSnapshots = [];
        this.debugLog = [];
        
        // Configuración de depuración
        this.config = {
            maxLogSize: 10000,
            maxSnapshots: 50,
            autoTrace: false,
            performanceMonitoring: true,
            memoryTracking: true,
            errorReporting: true,
            remoteDebugging: false,
            debugPort: 9222
        };
        
        // Niveles de log
        this.logLevels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
            critical: 4
        };
        
        // Hooks del sistema
        this.hooks = {
            console: null,
            error: null,
            promise: null,
            performance: null,
            memory: null
        };
        
        this.init();
    }
    
    init() {
        console.log('[CORTEX_BACKDOOR] Initializing Cortex Backdoor debugging system...');
        this.setupDebugEnvironment();
        this.installSystemHooks();
        this.initializeBreakpoints();
        this.startPerformanceMonitoring();
        this.createDebugInterface();
    }
    
    setupDebugEnvironment() {
        // Configurar entorno de depuración
        if (window.systemCore) {
            window.systemCore.addEventListener('error', (event) => {
                this.handleSystemError(event);
            });
        }
        
        // Configurar manejadores globales de errores
        window.addEventListener('error', (e) => {
            this.logError('javascript', e.error, {
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                message: e.message
            });
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            this.logError('promise', e.reason, {
                promise: e.promise
            });
        });
    }
    
    installSystemHooks() {
        // Hook para console.log
        this.hooks.console = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            info: console.info,
            debug: console.debug
        };
        
        // Redirigir logs al sistema de depuración
        Object.keys(this.hooks.console).forEach(method => {
            console[method] = (...args) => {
                this.hooks.console[method].apply(console, args);
                this.logMessage(method, args.join(' '));
            };
        });
        
        // Hook para performance.now
        this.hooks.performance = performance.now;
        performance.now = () => {
            const time = this.hooks.performance.call(performance);
            this.recordPerformanceMetric('timestamp', time);
            return time;
        };
    }
    
    initializeBreakpoints() {
        // Breakpoints del sistema
        const systemBreakpoints = [
            { id: 'system.boot', enabled: true, condition: 'always' },
            { id: 'system.error', enabled: true, condition: 'error' },
            { id: 'system.shutdown', enabled: false, condition: 'manual' },
            { id: 'filesystem.write', enabled: false, condition: 'always' },
            { id: 'network.connect', enabled: false, condition: 'always' },
            { id: 'process.create', enabled: false, condition: 'always' },
            { id: 'memory.allocate', enabled: false, condition: 'size > 100MB' },
            { id: 'security.privilege', enabled: true, condition: 'escalation' },
            { id: 'plugin.load', enabled: false, condition: 'always' },
            { id: 'neural.process', enabled: false, condition: 'always' }
        ];
        
        systemBreakpoints.forEach(bp => {
            this.breakpoints.set(bp.id, {
                ...bp,
                hitCount: 0,
                lastHit: null,
                actions: ['log', 'trace']
            });
        });
    }
    
    startPerformanceMonitoring() {
        if (!this.config.performanceMonitoring) return;
        
        // Monitorear métricas de rendimiento
        setInterval(() => {
            this.collectPerformanceMetrics();
        }, 1000);
        
        // Monitorear uso de memoria
        if (this.config.memoryTracking) {
            setInterval(() => {
                this.collectMemoryMetrics();
            }, 5000);
        }
    }
    
    createDebugInterface() {
        // Crear interfaz de depuración si está habilitada
        if (this.debugMode) {
            this.renderDebugInterface();
        }
    }
    
    // ============================================
    // MÉTODOS DE ACTIVACIÓN
    // ============================================
    activate(debugMode = true) {
        if (this.isActive) {
            this.logMessage('warn', 'Cortex Backdoor is already active');
            return false;
        }
        
        this.isActive = true;
        this.debugMode = debugMode;
        
        this.logMessage('info', 'Cortex Backdoor activated');
        this.createDebugInterface();
        
        // Notificar al sistema
        if (window.systemCore) {
            window.systemCore.emitEvent('debug', 'cortex_activated', {
                debugMode,
                timestamp: Date.now()
            });
        }
        
        return true;
    }
    
    deactivate() {
        if (!this.isActive) return false;
        
        this.isActive = false;
        this.debugMode = false;
        
        this.logMessage('info', 'Cortex Backdoor deactivated');
        this.hideDebugInterface();
        
        // Notificar al sistema
        if (window.systemCore) {
            window.systemCore.emitEvent('debug', 'cortex_deactivated', {
                timestamp: Date.now()
            });
        }
        
        return true;
    }
    
    // ============================================
    // GESTIÓN DE BREAKPOINTS
    // ============================================
    setBreakpoint(id, condition = 'always', actions = ['log']) {
        if (!this.breakpoints.has(id)) {
            this.breakpoints.set(id, {
                id,
                enabled: true,
                condition,
                actions,
                hitCount: 0,
                lastHit: null
            });
        } else {
            const bp = this.breakpoints.get(id);
            bp.enabled = true;
            bp.condition = condition;
            bp.actions = actions;
        }
        
        this.logMessage('debug', `Breakpoint set: ${id} (condition: ${condition})`);
        return true;
    }
    
    removeBreakpoint(id) {
        if (this.breakpoints.has(id)) {
            this.breakpoints.delete(id);
            this.logMessage('debug', `Breakpoint removed: ${id}`);
            return true;
        }
        return false;
    }
    
    enableBreakpoint(id) {
        const bp = this.breakpoints.get(id);
        if (bp) {
            bp.enabled = true;
            this.logMessage('debug', `Breakpoint enabled: ${id}`);
            return true;
        }
        return false;
    }
    
    disableBreakpoint(id) {
        const bp = this.breakpoints.get(id);
        if (bp) {
            bp.enabled = false;
            this.logMessage('debug', `Breakpoint disabled: ${id}`);
            return true;
        }
        return false;
    }
    
    hitBreakpoint(id, context = {}) {
        const bp = this.breakpoints.get(id);
        if (!bp || !bp.enabled) return false;
        
        // Verificar condición
        if (!this.evaluateCondition(bp.condition, context)) {
            return false;
        }
        
        // Incrementar contador
        bp.hitCount++;
        bp.lastHit = Date.now();
        
        this.logMessage('debug', `Breakpoint hit: ${id} (hit #${bp.hitCount})`);
        
        // Ejecutar acciones
        bp.actions.forEach(action => {
            this.executeBreakpointAction(action, id, context);
        });
        
        return true;
    }
    
    evaluateCondition(condition, context) {
        switch (condition) {
            case 'always':
                return true;
            case 'error':
                return context.error !== undefined;
            case 'manual':
                return false; // Requiere activación manual
            case 'size > 100MB':
                return context.size > 100 * 1024 * 1024;
            case 'escalation':
                return context.privilege === 'escalation';
            default:
                // Condiciones personalizadas
                try {
                    return new Function('context', `return ${condition}`)(context);
                } catch (e) {
                    this.logError('condition', e, { condition });
                    return false;
                }
        }
    }
    
    executeBreakpointAction(action, breakpointId, context) {
        switch (action) {
            case 'log':
                this.logBreakpointHit(breakpointId, context);
                break;
            case 'trace':
                this.traceExecution(breakpointId, context);
                break;
            case 'snapshot':
                this.takeSystemSnapshot(breakpointId);
                break;
            case 'pause':
                this.pauseExecution(breakpointId);
                break;
            case 'alert':
                this.sendAlert(breakpointId, context);
                break;
        }
    }
    
    logBreakpointHit(breakpointId, context) {
        const entry = {
            timestamp: Date.now(),
            breakpoint: breakpointId,
            context: this.sanitizeContext(context),
            stack: this.getStackTrace()
        };
        
        this.debugLog.push(entry);
        this.trimDebugLog();
    }
    
    // ============================================
    // SEGUIMIENTO DE VARIABLES
    // ============================================
    watchVariable(name, expression, condition = 'always') {
        this.watchVariables.set(name, {
            expression,
            condition,
            lastValue: undefined,
            lastUpdate: null,
            updateCount: 0,
            history: []
        });
        
        this.logMessage('debug', `Watching variable: ${name} (${expression})`);
    }
    
    unwatchVariable(name) {
        if (this.watchVariables.has(name)) {
            this.watchVariables.delete(name);
            this.logMessage('debug', `Stopped watching: ${name}`);
            return true;
        }
        return false;
    }
    
    updateWatchedVariables(context = {}) {
        this.watchVariables.forEach((watch, name) => {
            try {
                const currentValue = this.evaluateExpression(watch.expression, context);
                
                if (this.evaluateCondition(watch.condition, { 
                    lastValue: watch.lastValue, 
                    currentValue 
                })) {
                    
                    if (currentValue !== watch.lastValue) {
                        watch.history.push({
                            timestamp: Date.now(),
                            value: currentValue,
                            oldValue: watch.lastValue
                        });
                        
                        watch.lastValue = currentValue;
                        watch.lastUpdate = Date.now();
                        watch.updateCount++;
                        
                        this.logMessage('debug', `Variable changed: ${name} = ${currentValue}`);
                    }
                }
            } catch (error) {
                this.logError('variable_watch', error, { name, expression: watch.expression });
            }
        });
    }
    
    evaluateExpression(expression, context) {
        try {
            return new Function('context', `with(context) { return ${expression} }`)(context);
        } catch (e) {
            this.logError('expression', e, { expression });
            return undefined;
        }
    }
    
    getWatchHistory(name) {
        const watch = this.watchVariables.get(name);
        return watch ? watch.history : [];
    }
    
    // ============================================
    // ANÁLISIS DE RENDIMIENTO
    // ============================================
    collectPerformanceMetrics() {
        const metrics = {
            timestamp: Date.now(),
            memory: this.getMemoryUsage(),
            cpu: this.getCPUUsage(),
            network: this.getNetworkUsage(),
            storage: this.getStorageUsage()
        };
        
        this.performanceMetrics.set('current', metrics);
        
        // Mantener historial limitado
        if (this.performanceMetrics.size > 1000) {
            const firstKey = this.performanceMetrics.keys().next().value;
            this.performanceMetrics.delete(firstKey);
        }
    }
    
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        
        // Estimación si no está disponible
        return {
            used: Math.random() * 100000000, // ~100MB
            total: 200000000, // ~200MB
            limit: 2000000000 // ~2GB
        };
    }
    
    getCPUUsage() {
        // Simulación de uso de CPU
        return {
            user: Math.random() * 50,
            system: Math.random() * 20,
            idle: Math.random() * 30
        };
    }
    
    getNetworkUsage() {
        // Simulación de uso de red
        return {
            upload: Math.random() * 1000000, // ~1MB/s
            download: Math.random() * 5000000, // ~5MB/s
            connections: Math.floor(Math.random() * 50)
        };
    }
    
    getStorageUsage() {
        // Simulación de uso de almacenamiento
        return {
            read: Math.random() * 100000000, // ~100MB/s
            write: Math.random() * 50000000, // ~50MB/s
            operations: Math.floor(Math.random() * 1000)
        };
    }
    
    // ============================================
       // CAPTURAS DE MEMORIA
    // ============================================
    takeMemorySnapshot(label = 'manual') {
        const snapshot = {
            id: Date.now(),
            label,
            timestamp: Date.now(),
            memory: this.getMemoryUsage(),
            variables: this.captureVariableStates(),
            processes: this.captureProcessStates(),
            events: this.captureEventStates()
        };
        
        this.memorySnapshots.push(snapshot);
        
        // Limitar número de snapshots
        if (this.memorySnapshots.length > this.config.maxSnapshots) {
            this.memorySnapshots.shift();
        }
        
        this.logMessage('debug', `Memory snapshot taken: ${label} (#${snapshot.id})`);
        return snapshot.id;
    }
    
    captureVariableStates() {
        const states = {};
        
        // Capturar variables globales importantes
        if (window.systemCore) {
            states.systemCore = {
                uptime: window.systemCore.getUptime(),
                processCount: window.systemCore.processes.size,
                memoryUsage: window.systemCore.getMemoryUsage()
            };
        }
        
        if (window.neuralGateway) {
            states.neuralGateway = {
                isOnline: window.neuralGateway.isOnline,
                requestCount: window.neuralGateway.requestCount || 0
            };
        }
        
        return states;
    }
    
    captureProcessStates() {
        const states = [];
        
        if (window.systemCore) {
            window.systemCore.processes.forEach(process => {
                states.push({
                    id: process.id,
                    name: process.name,
                    status: process.status,
                    memory: process.memory,
                    uptime: Date.now() - process.startTime
                });
            });
        }
        
        return states;
    }
    
    captureEventStates() {
        const states = [];
        
        if (window.systemCore) {
            const recentEvents = window.systemCore.events.slice(-10);
            recentEvents.forEach(event => {
                states.push({
                    type: event.type,
                    subtype: event.subtype,
                    timestamp: event.timestamp
                });
            });
        }
        
        return states;
    }
    
    takeSystemSnapshot(label = 'manual') {
        const snapshot = {
            id: Date.now(),
            label,
            timestamp: Date.now(),
            system: this.captureSystemState(),
            performance: this.capturePerformanceState(),
            environment: this.captureEnvironmentState()
        };
        
        this.systemSnapshots.push(snapshot);
        
        // Limitar número de snapshots
        if (this.systemSnapshots.length > this.config.maxSnapshots) {
            this.systemSnapshots.shift();
        }
        
        this.logMessage('debug', `System snapshot taken: ${label} (#${snapshot.id})`);
        return snapshot.id;
    }
    
    captureSystemState() {
        return {
            url: window.location.href,
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            hardwareConcurrency: navigator.hardwareConcurrency,
            maxTouchPoints: navigator.maxTouchPoints
        };
    }
    
    capturePerformanceState() {
        const navigation = performance.getEntriesByType('navigation')[0];
        
        return {
            timing: navigation ? {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                totalTime: navigation.loadEventEnd - navigation.fetchStart
            } : null,
            memory: this.getMemoryUsage(),
            metrics: this.performanceMetrics.get('current')
        };
    }
    
    captureEnvironmentState() {
        return {
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            location: {
                href: location.href,
                protocol: location.protocol,
                host: location.host,
                hostname: location.hostname,
                port: location.port,
                pathname: location.pathname,
                search: location.search,
                hash: location.hash
            }
        };
    }
    
    // ============================================
    // ANÁLISIS Y DIAGNÓSTICO
    // ============================================
    analyzeSystemHealth() {
        const analysis = {
            timestamp: Date.now(),
            overall: 'healthy',
            issues: [],
            recommendations: [],
            metrics: {}
        };
        
        // Analizar memoria
        const memory = this.getMemoryUsage();
        const memoryUsagePercent = (memory.used / memory.total) * 100;
        
        if (memoryUsagePercent > 90) {
            analysis.issues.push({
                type: 'memory',
                severity: 'critical',
                message: `High memory usage: ${memoryUsagePercent.toFixed(1)}%`,
                recommendation: 'Consider restarting the application'
            });
            analysis.overall = 'critical';
        } else if (memoryUsagePercent > 70) {
            analysis.issues.push({
                type: 'memory',
                severity: 'warning',
                message: `Elevated memory usage: ${memoryUsagePercent.toFixed(1)}%`,
                recommendation: 'Monitor memory consumption'
            });
            if (analysis.overall === 'healthy') analysis.overall = 'warning';
        }
        
        // Analizar errores
        const recentErrors = this.debugLog.filter(entry => 
            entry.level >= this.logLevels.error &&
            Date.now() - entry.timestamp < 60000 // Último minuto
        );
        
        if (recentErrors.length > 10) {
            analysis.issues.push({
                type: 'errors',
                severity: 'critical',
                message: `High error rate: ${recentErrors.length} errors in the last minute`,
                recommendation: 'Check application logs and restart if necessary'
            });
            analysis.overall = 'critical';
        } else if (recentErrors.length > 5) {
            analysis.issues.push({
                type: 'errors',
                severity: 'warning',
                message: `Elevated error rate: ${recentErrors.length} errors in the last minute`,
                recommendation: 'Monitor for stability issues'
            });
            if (analysis.overall === 'healthy') analysis.overall = 'warning';
        }
        
        // Analizar rendimiento
        const avgResponseTime = this.calculateAverageResponseTime();
        if (avgResponseTime > 1000) {
            analysis.issues.push({
                type: 'performance',
                severity: 'warning',
                message: `High response time: ${avgResponseTime.toFixed(0)}ms average`,
                recommendation: 'Optimize critical code paths'
            });
            if (analysis.overall === 'healthy') analysis.overall = 'warning';
        }
        
        analysis.metrics = {
            memory: memoryUsagePercent,
            errors: recentErrors.length,
            responseTime: avgResponseTime,
            uptime: this.getSystemUptime()
        };
        
        return analysis;
    }
    
    calculateAverageResponseTime() {
        // Calcular tiempo promedio de respuesta basado en métricas
        const metrics = Array.from(this.performanceMetrics.values());
        if (metrics.length === 0) return 0;
        
        const total = metrics.reduce((sum, metric) => {
            return sum + (metric.responseTime || 0);
        }, 0);
        
        return total / metrics.length;
    }
    
    getSystemUptime() {
        if (window.systemCore) {
            return window.systemCore.getUptime();
        }
        
        // Fallback: tiempo desde que se cargó la página
        return performance.now();
    }
    
    generateDiagnosticsReport() {
        const report = {
            timestamp: Date.now(),
            system: this.captureSystemState(),
            environment: this.captureEnvironmentState(),
            performance: this.capturePerformanceState(),
            memory: this.getMemoryUsage(),
            snapshots: {
                memory: this.memorySnapshots.length,
                system: this.systemSnapshots.length
            },
            logs: {
                debug: this.debugLog.length,
                breakpoints: this.breakpoints.size,
                watches: this.watchVariables.size
            },
            analysis: this.analyzeSystemHealth()
        };
        
        return report;
    }
    
    // ============================================
    // INTERFAZ DE DEPURACIÓN
    // ============================================
    renderDebugInterface() {
        // Crear panel de depuración flotante
        const debugPanel = document.createElement('div');
        debugPanel.id = 'cortex-debug-panel';
        debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 400px;
            height: 300px;
            background: rgba(1, 1, 1, 0.95);
            border: 2px solid #00ff41;
            color: #00ff41;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 9998;
            display: flex;
            flex-direction: column;
            box-shadow: 0 0 20px rgba(0, 255, 65, 0.5);
        `;
        
        // Barra de título
        const titleBar = document.createElement('div');
        titleBar.style.cssText = `
            background: #00ff41;
            color: #000;
            padding: 5px;
            font-weight: bold;
            cursor: move;
            display: flex;
            justify-content: space-between;
        `;
        titleBar.innerHTML = `
            <span>CORTEX DEBUGGER</span>
            <span>
                <button onclick="cortexBackdoor.minimizeDebugPanel()" style="background: none; border: none; color: #000; cursor: pointer;">_</button>
                <button onclick="cortexBackdoor.closeDebugPanel()" style="background: none; border: none; color: #000; cursor: pointer;">X</button>
            </span>
        `;
        
        // Contenido del panel
        const content = document.createElement('div');
        content.id = 'debug-panel-content';
        content.style.cssText = `
            flex: 1;
            padding: 10px;
            overflow-y: auto;
            background: #010101;
        `;
        
        // Tabs
        const tabs = document.createElement('div');
        tabs.style.cssText = `
            display: flex;
            border-bottom: 1px solid #00ff41;
        `;
        
        const tabNames = ['Log', 'Breakpoints', 'Watches', 'Performance', 'Memory'];
        tabNames.forEach((tabName, index) => {
            const tab = document.createElement('button');
            tab.textContent = tabName;
            tab.style.cssText = `
                background: ${index === 0 ? '#00ff41' : 'transparent'};
                color: ${index === 0 ? '#000' : '#00ff41'};
                border: 1px solid #00ff41;
                padding: 5px 10px;
                cursor: pointer;
                margin-right: 2px;
            `;
            tab.onclick = () => this.switchDebugTab(tabName.toLowerCase());
            tabs.appendChild(tab);
        });
        
        // Área de contenido de tabs
        const tabContent = document.createElement('div');
        tabContent.id = 'debug-tab-content';
        tabContent.style.cssText = `
            flex: 1;
            padding: 10px;
            overflow-y: auto;
            background: #010101;
        `;
        
        content.appendChild(tabs);
        content.appendChild(tabContent);
        
        debugPanel.appendChild(titleBar);
        debugPanel.appendChild(content);
        
        document.body.appendChild(debugPanel);
        this.debugPanel = debugPanel;
        
        // Hacer el panel arrastrable
        this.makeDraggable(debugPanel, titleBar);
        
        // Mostrar contenido inicial
        this.switchDebugTab('log');
    }
    
    makeDraggable(element, handle) {
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };
        
        handle.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragOffset.x = e.clientX - element.offsetLeft;
            dragOffset.y = e.clientY - element.offsetTop;
            handle.style.cursor = 'grabbing';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            element.style.left = (e.clientX - dragOffset.x) + 'px';
            element.style.top = (e.clientY - dragOffset.y) + 'px';
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
            handle.style.cursor = 'move';
        });
    }
    
    switchDebugTab(tabName) {
        const tabContent = document.getElementById('debug-tab-content');
        if (!tabContent) return;
        
        // Actualizar botones de tab
        const tabs = document.querySelectorAll('#debug-panel-content button');
        tabs.forEach((tab, index) => {
            const tabNames = ['Log', 'Breakpoints', 'Watches', 'Performance', 'Memory'];
            const isActive = tabNames[index].toLowerCase() === tabName;
            tab.style.background = isActive ? '#00ff41' : 'transparent';
            tab.style.color = isActive ? '#000' : '#00ff41';
        });
        
        // Mostrar contenido del tab
        switch (tabName) {
            case 'log':
                this.renderDebugLog(tabContent);
                break;
            case 'breakpoints':
                this.renderBreakpoints(tabContent);
                break;
            case 'watches':
                this.renderWatches(tabContent);
                break;
            case 'performance':
                this.renderPerformance(tabContent);
                break;
            case 'memory':
                this.renderMemory(tabContent);
                break;
        }
    }
    
    renderDebugLog(container) {
        const recentLogs = this.debugLog.slice(-50);
        
        container.innerHTML = `
            <div style="color: #00ff41; font-size: 11px; line-height: 1.2;">
                ${recentLogs.map(entry => `
                    <div style="margin-bottom: 2px;">
                        <span style="color: #888;">[${new Date(entry.timestamp).toLocaleTimeString()}]</span>
                        <span style="color: ${this.getLogLevelColor(entry.level)};">[${entry.level.toUpperCase()}]</span>
                        <span>${this.escapeHtml(entry.message)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    renderBreakpoints(container) {
        const breakpoints = Array.from(this.breakpoints.values());
        
        container.innerHTML = `
            <div style="color: #00ff41; font-size: 11px;">
                ${breakpoints.map(bp => `
                    <div style="margin-bottom: 8px; padding: 4px; border: 1px solid ${bp.enabled ? '#00ff41' : '#444'};">
                        <div>
                            <span style="color: ${bp.enabled ? '#00ff41' : '#888'};">
                                ${bp.enabled ? '●' : '○'} ${bp.id}
                            </span>
                        </div>
                        <div style="color: #888; font-size: 10px;">
                            Condition: ${bp.condition} | Hits: ${bp.hitCount}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    renderWatches(container) {
        const watches = Array.from(this.watchVariables.entries());
        
        container.innerHTML = `
            <div style="color: #00ff41; font-size: 11px;">
                ${watches.map(([name, watch]) => `
                    <div style="margin-bottom: 8px;">
                        <div style="font-weight: bold;">${name}</div>
                        <div style="color: #888; font-size: 10px;">
                            Expression: ${watch.expression}
                        </div>
                        <div style="color: #00ff41;">
                            Value: ${JSON.stringify(watch.lastValue)}
                        </div>
                        <div style="color: #888; font-size: 10px;">
                            Updates: ${watch.updateCount}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    renderPerformance(container) {
        const current = this.performanceMetrics.get('current');
        
        container.innerHTML = `
            <div style="color: #00ff41; font-size: 11px;">
                <div style="margin-bottom: 8px;">
                    <div>Memory Usage: ${current ? (current.memory.used / 1024 / 1024).toFixed(1) : '0'} MB</div>
                    <div>CPU Usage: ${current ? current.cpu.user.toFixed(1) : '0'}%</div>
                    <div>Network: ↓${current ? (current.network.download / 1024 / 1024).toFixed(1) : '0'} MB/s ↑${current ? (current.network.upload / 1024 / 1024).toFixed(1) : '0'} MB/s</div>
                </div>
                <div style="color: #888; font-size: 10px;">
                    Metrics collected: ${this.performanceMetrics.size}
                </div>
            </div>
        `;
    }
    
    renderMemory(container) {
        const memory = this.getMemoryUsage();
        const usagePercent = (memory.used / memory.total) * 100;
        
        container.innerHTML = `
            <div style="color: #00ff41; font-size: 11px;">
                <div style="margin-bottom: 8px;">
                    <div>Used: ${(memory.used / 1024 / 1024).toFixed(1)} MB</div>
                    <div>Total: ${(memory.total / 1024 / 1024).toFixed(1)} MB</div>
                    <div>Usage: ${usagePercent.toFixed(1)}%</div>
                </div>
                <div style="width: 100%; height: 10px; background: #333; margin: 4px 0;">
                    <div style="width: ${usagePercent}%; height: 100%; background: #00ff41;"></div>
                </div>
                <div style="color: #888; font-size: 10px;">
                    Snapshots: ${this.memorySnapshots.length}
                </div>
            </div>
        `;
    }
    
    hideDebugInterface() {
        if (this.debugPanel && document.body.contains(this.debugPanel)) {
            document.body.removeChild(this.debugPanel);
            this.debugPanel = null;
        }
    }
    
    minimizeDebugPanel() {
        if (this.debugPanel) {
            this.debugPanel.style.height = '30px';
            this.debugPanel.querySelector('#debug-panel-content').style.display = 'none';
        }
    }
    
    closeDebugPanel() {
        this.hideDebugInterface();
    }
    
    // ============================================
    // MÉTODOS DE LOGGING
    // ============================================
    logMessage(level, message, data = {}) {
        if (this.logLevels[level] < this.logLevels[this.logLevel]) {
            return;
        }
        
        const entry = {
            timestamp: Date.now(),
            level,
            message,
            data,
            source: 'cortex_backdoor'
        };
        
        this.debugLog.push(entry);
        this.trimDebugLog();
        
        // Actualizar interfaz si está visible
        if (this.debugPanel) {
            const tabContent = document.getElementById('debug-tab-content');
            if (tabContent && this.getCurrentTab() === 'log') {
                this.renderDebugLog(tabContent);
            }
        }
    }
    
    logError(category, error, context = {}) {
        this.logMessage('error', `${category}: ${error.message}`, {
            stack: error.stack,
            context
        });
    }
    
    trimDebugLog() {
        if (this.debugLog.length > this.config.maxLogSize) {
            this.debugLog = this.debugLog.slice(-this.config.maxLogSize);
        }
    }
    
    getLogLevelColor(level) {
        const colors = {
            debug: '#888',
            info: '#00ff41',
            warn: '#ffff00',
            error: '#ff0000',
            critical: '#ff00ff'
        };
        return colors[level] || colors.info;
    }
    
    getCurrentTab() {
        const tabs = document.querySelectorAll('#debug-panel-content button');
        const activeTab = Array.from(tabs).find(tab => 
            tab.style.background === 'rgb(0, 255, 65)'
        );
        return activeTab ? activeTab.textContent.toLowerCase() : 'log';
    }
    
    // ============================================
    // MÉTODOS DE UTILIDAD
    // ============================================
    sanitizeContext(context) {
        // Sanitizar contexto para evitar referencias circulares
        const sanitized = {};
        
        for (const [key, value] of Object.entries(context)) {
            if (value && typeof value === 'object') {
                sanitized[key] = `[Object ${value.constructor?.name || 'Object'}]`;
            } else if (typeof value === 'function') {
                sanitized[key] = `[Function ${value.name || 'anonymous'}]`;
            } else {
                sanitized[key] = value;
            }
        }
        
        return sanitized;
    }
    
    getStackTrace() {
        try {
            throw new Error('Stack trace');
        } catch (e) {
            return e.stack.split('\n').slice(2).join('\n');
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    handleSystemError(event) {
        this.logError('system', event.data.error, {
            type: event.data.type,
            source: event.data.source
        });
    }
    
    notifySystemActivation() {
        if (window.systemCore) {
            window.systemCore.emitEvent('debug', 'cortex_activated', {
                debugMode: this.debugMode,
                traceMode: this.traceMode
            });
        }
    }
    
    notifySystemDeactivation() {
        if (window.systemCore) {
            window.systemCore.emitEvent('debug', 'cortex_deactivated', {
                timestamp: Date.now()
            });
        }
    }
    
    // ============================================
    // MÉTODOS PÚBLICOS
    // ============================================
    isActive() {
        return this.isActive;
    }
    
    isDebugMode() {
        return this.debugMode;
    }
    
    setLogLevel(level) {
        if (this.logLevels[level] !== undefined) {
            this.logLevel = level;
            this.logMessage('info', `Log level changed to: ${level}`);
            return true;
        }
        return false;
    }
    
    getDebugLog() {
        return this.debugLog;
    }
    
    getPerformanceMetrics() {
        return this.performanceMetrics;
    }
    
    getMemorySnapshots() {
        return this.memorySnapshots;
    }
    
    getSystemSnapshots() {
        return this.systemSnapshots;
    }
    
    exportDebugData() {
        const data = {
            timestamp: Date.now(),
            debugLog: this.debugLog,
            breakpoints: Array.from(this.breakpoints.entries()),
            watches: Array.from(this.watchVariables.entries()),
            performanceMetrics: Array.from(this.performanceMetrics.entries()),
            memorySnapshots: this.memorySnapshots,
            systemSnapshots: this.systemSnapshots,
            config: this.config
        };
        
        return JSON.stringify(data, null, 2);
    }
}

// ============================================
// EXPORTAR CORTEX BACKDOOR
// ============================================
window.CortexBackdoor = CortexBackdoor;
window.cortexBackdoor = new CortexBackdoor();

console.log('[CORTEX_BACKDOOR] Cortex Backdoor debugging module loaded successfully');