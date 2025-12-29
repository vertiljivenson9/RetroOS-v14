/**
 * ============================================
 * MESSENGER COMMS - RETROS V18.0
 * Sistema de Comunicación y Mensajería Avanzado
 * ============================================
 */

class MessengerComms {
    constructor() {
        this.isInitialized = false;
        this.connections = new Map();
        this.messageQueue = [];
        this.userSessions = new Map();
        this.chatRooms = new Map();
        this.messageHistory = [];
        this.contacts = new Map();
        this.presence = new Map();
        this.notifications = [];
        
        // Configuración de mensajería
        this.config = {
            maxMessageSize: 1048576, // 1MB
            maxHistorySize: 10000,
            deliveryTimeout: 30000, // 30 segundos
            retryAttempts: 3,
            retryDelay: 5000,
            presenceUpdateInterval: 30000,
            typingTimeout: 5000,
            encryptionEnabled: true,
            compressionEnabled: true,
            deliveryReceipts: true,
            readReceipts: true
        };
        
        // Protocolos de comunicación
        this.protocols = {
            direct: 'direct_message',
            room: 'room_message',
            broadcast: 'broadcast_message',
            system: 'system_message'
        };
        
        // Estados de presencia
        this.presenceStates = {
            online: 'Online',
            away: 'Away',
            busy: 'Busy',
            offline: 'Offline',
            invisible: 'Invisible'
        };
        
        // Tipos de mensaje
        this.messageTypes = {
            text: 'text',
            image: 'image',
            file: 'file',
            audio: 'audio',
            video: 'video',
            location: 'location',
            contact: 'contact',
            system: 'system'
        };
        
        // Colores para usuarios
        this.userColors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
            '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
            '#10ac84', '#ee5a24', '#0abde3', '#3867d6', '#f368e0'
        ];
        
        this.init();
    }
    
    init() {
        console.log('[MESSENGER_COMMS] Initializing Messenger Comms...');
        this.setupConnectionHandlers();
        this.initializeDefaultRooms();
        this.loadContacts();
        this.startPresenceUpdates();
        this.setupMessageHandlers();
        this.isInitialized = true;
    }
    
    setupConnectionHandlers() {
        // Configurar manejadores de conexión
        this.connectionHandlers = {
            onConnect: this.handleConnection.bind(this),
            onDisconnect: this.handleDisconnection.bind(this),
            onMessage: this.handleIncomingMessage.bind(this),
            onError: this.handleConnectionError.bind(this)
        };
    }
    
    initializeDefaultRooms() {
        // Crear salas de chat por defecto
        const defaultRooms = [
            {
                id: 'general',
                name: 'General Chat',
                description: 'Main discussion room',
                type: 'public',
                maxUsers: 1000,
                created: Date.now(),
                moderators: ['system'],
                settings: {
                    allowFiles: true,
                    allowImages: true,
                    maxMessageLength: 2000,
                    slowMode: false
                }
            },
            {
                id: 'support',
                name: 'Technical Support',
                description: 'Get help with RetroOS',
                type: 'public',
                maxUsers: 100,
                created: Date.now(),
                moderators: ['support_team'],
                settings: {
                    allowFiles: true,
                    allowImages: true,
                    maxMessageLength: 5000,
                    slowMode: true
                }
            },
            {
                id: 'development',
                name: 'Development',
                description: 'Developer discussions',
                type: 'private',
                maxUsers: 50,
                created: Date.now(),
                moderators: ['dev_team'],
                settings: {
                    allowFiles: true,
                    allowImages: true,
                    maxMessageLength: 10000,
                    slowMode: false
                }
            }
        ];
        
        defaultRooms.forEach(room => {
            this.chatRooms.set(room.id, {
                ...room,
                users: new Set(),
                messages: [],
                active: true
            });
        });
    }
    
    loadContacts() {
        // Cargar contactos del sistema
        const systemContacts = [
            {
                id: 'system',
                name: 'System',
                status: this.presenceStates.online,
                avatar: '👤',
                role: 'system',
                lastSeen: Date.now(),
                isOnline: true
            },
            {
                id: 'support_team',
                name: 'Support Team',
                status: this.presenceStates.online,
                avatar: '🛠️',
                role: 'support',
                lastSeen: Date.now(),
                isOnline: true
            },
            {
                id: 'neural_gateway',
                name: 'Neural Gateway',
                status: this.presenceStates.online,
                avatar: '🧠',
                role: 'ai',
                lastSeen: Date.now(),
                isOnline: true
            },
            {
                id: 'kernel_fs',
                name: 'Kernel FS',
                status: this.presenceStates.online,
                avatar: '💾',
                role: 'service',
                lastSeen: Date.now(),
                isOnline: true
            }
        ];
        
        systemContacts.forEach(contact => {
            this.contacts.set(contact.id, contact);
            this.presence.set(contact.id, contact.status);
        });
    }
    
    startPresenceUpdates() {
        // Actualizar presencia periódicamente
        setInterval(() => {
            this.updatePresence();
        }, this.config.presenceUpdateInterval);
    }
    
    setupMessageHandlers() {
        // Configurar manejadores de mensajes del sistema
        if (window.systemCore) {
            window.systemCore.addEventListener('message', (event) => {
                this.handleSystemMessage(event);
            });
        }
    }
    
    // ============================================
    // GESTIÓN DE CONEXIONES
    // ============================================
    connect(userId, options = {}) {
        if (this.connections.has(userId)) {
            return { success: false, reason: 'Already connected' };
        }
        
        const connection = {
            id: userId,
            status: 'connecting',
            sessionId: this.generateSessionId(),
            startTime: Date.now(),
            options,
            messages: []
        };
        
        this.connections.set(userId, connection);
        
        // Simular conexión exitosa
        setTimeout(() => {
            connection.status = 'connected';
            this.updateUserPresence(userId, 'online');
            this.connectionHandlers.onConnect(userId);
        }, 1000);
        
        return { success: true, sessionId: connection.sessionId };
    }
    
    disconnect(userId) {
        const connection = this.connections.get(userId);
        if (!connection) {
            return { success: false, reason: 'Not connected' };
        }
        
        connection.status = 'disconnected';
        connection.endTime = Date.now();
        
        this.updateUserPresence(userId, 'offline');
        this.connectionHandlers.onDisconnect(userId);
        
        // Mantener conexión por un tiempo para mensajes pendientes
        setTimeout(() => {
            this.connections.delete(userId);
        }, 5000);
        
        return { success: true };
    }
    
    handleConnection(userId) {
        this.logActivity('user_connected', { userId });
        
        // Enviar mensaje de bienvenida
        this.sendSystemMessage(userId, 'Welcome to RetroOS Messenger!');
        
        // Notificar a otros usuarios
        this.broadcastPresenceUpdate(userId, 'online');
    }
    
    handleDisconnection(userId) {
        this.logActivity('user_disconnected', { userId });
        
        // Limpiar estado de usuario
        this.userSessions.delete(userId);
        
        // Notificar a otros usuarios
        this.broadcastPresenceUpdate(userId, 'offline');
    }
    
    handleConnectionError(error, userId) {
        this.logError('connection_error', { error, userId });
        
        // Intentar reconectar
        if (userId) {
            setTimeout(() => {
                this.connect(userId);
            }, this.config.retryDelay);
        }
    }
    
    // ============================================
    // ENVÍO Y RECEPCIÓN DE MENSAJES
    // ============================================
    sendMessage(target, content, options = {}) {
        const message = {
            id: this.generateMessageId(),
            type: options.type || this.messageTypes.text,
            from: options.from || 'user',
            to: target,
            content,
            timestamp: Date.now(),
            protocol: this.determineProtocol(target),
            options,
            status: 'sending',
            receipts: {
                sent: false,
                delivered: false,
                read: false
            }
        };
        
        // Encriptar si está habilitado
        if (this.config.encryptionEnabled) {
            message.content = this.encryptMessage(message.content);
        }
        
        // Comprimir si está habilitado
        if (this.config.compressionEnabled && message.content.length > 1000) {
            message.content = this.compressMessage(message.content);
            message.compressed = true;
        }
        
        // Agregar a cola de mensajes
        this.messageQueue.push(message);
        
        // Intentar enviar inmediatamente
        this.processMessageQueue();
        
        // Actualizar historial
        this.messageHistory.push(message);
        this.trimMessageHistory();
        
        return message;
    }
    
    sendDirectMessage(userId, content, options = {}) {
        return this.sendMessage(userId, content, {
            ...options,
            protocol: this.protocols.direct
        });
    }
    
    sendRoomMessage(roomId, content, options = {}) {
        return this.sendMessage(roomId, content, {
            ...options,
            protocol: this.protocols.room
        });
    }
    
    sendSystemMessage(target, content, options = {}) {
        return this.sendMessage(target, content, {
            ...options,
            from: 'system',
            type: this.messageTypes.system,
            protocol: this.protocols.system
        });
    }
    
    processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            
            try {
                this.deliverMessage(message);
                message.status = 'sent';
                message.receipts.sent = true;
                
                // Confirmación de envío
                if (this.config.deliveryReceipts) {
                    this.sendDeliveryReceipt(message);
                }
                
            } catch (error) {
                message.status = 'failed';
                this.handleMessageFailure(message, error);
            }
        }
    }
    
    deliverMessage(message) {
        const connection = this.connections.get(message.to);
        if (!connection || connection.status !== 'connected') {
            throw new Error('Recipient not connected');
        }
        
        // Simular latencia de red
        setTimeout(() => {
            this.handleIncomingMessage(message, message.to);
        }, Math.random() * 200);
    }
    
    handleIncomingMessage(message, recipientId) {
        // Desencriptar si es necesario
        if (this.config.encryptionEnabled && !message.from.startsWith('system')) {
            message.content = this.decryptMessage(message.content);
        }
        
        // Descomprimir si es necesario
        if (message.compressed) {
            message.content = this.decompressMessage(message.content);
            delete message.compressed;
        }
        
        // Procesar según el protocolo
        switch (message.protocol) {
            case this.protocols.direct:
                this.handleDirectMessage(message, recipientId);
                break;
            case this.protocols.room:
                this.handleRoomMessage(message, recipientId);
                break;
            case this.protocols.broadcast:
                this.handleBroadcastMessage(message);
                break;
            case this.protocols.system:
                this.handleSystemMessage(message, recipientId);
                break;
        }
        
        // Confirmación de entrega
        if (this.config.deliveryReceipts && !message.from.startsWith('system')) {
            this.sendDeliveryReceipt(message);
        }
    }
    
    handleDirectMessage(message, recipientId) {
        const connection = this.connections.get(recipientId);
        if (connection) {
            connection.messages.push(message);
            this.notifyUser(recipientId, 'New message from ' + message.from);
        }
        
        // Actualizar UI si es el usuario actual
        if (recipientId === 'user') {
            this.displayMessage(message);
        }
    }
    
    handleRoomMessage(message, roomId) {
        const room = this.chatRooms.get(roomId);
        if (!room) return;
        
        room.messages.push(message);
        
        // Notificar a todos los miembros de la sala
        room.users.forEach(userId => {
            if (userId !== message.from) {
                this.notifyUser(userId, `New message in ${room.name}`);
            }
        });
        
        // Actualizar UI si el usuario está en la sala
        if (room.users.has('user')) {
            this.displayRoomMessage(message, roomId);
        }
    }
    
    handleBroadcastMessage(message) {
        // Enviar a todos los usuarios conectados
        this.connections.forEach((connection, userId) => {
            if (userId !== message.from) {
                this.handleIncomingMessage(message, userId);
            }
        });
    }
    
    handleSystemMessage(message, recipientId) {
        // Mensajes del sistema tienen tratamiento especial
        message.priority = 'high';
        message.persistent = true;
        
        this.handleDirectMessage(message, recipientId);
    }
    
    handleMessageFailure(message, error) {
        this.logError('message_delivery', { message, error });
        
        // Reintentar si es posible
        if (message.retryCount < this.config.retryAttempts) {
            message.retryCount = (message.retryCount || 0) + 1;
            
            setTimeout(() => {
                this.messageQueue.push(message);
                this.processMessageQueue();
            }, this.config.retryDelay * message.retryCount);
        } else {
            message.status = 'failed_permanently';
            this.notifyUser(message.from, 'Message delivery failed');
        }
    }
    
    // ============================================
    // CONFIRMACIONES Y RECIBOS
    // ============================================
    sendDeliveryReceipt(message) {
        const receipt = {
            type: 'delivery_receipt',
            originalMessageId: message.id,
            from: message.to,
            to: message.from,
            timestamp: Date.now()
        };
        
        this.sendMessage(message.from, receipt, { type: 'system' });
    }
    
    sendReadReceipt(message) {
        if (!this.config.readReceipts) return;
        
        const receipt = {
            type: 'read_receipt',
            originalMessageId: message.id,
            from: message.to,
            to: message.from,
            timestamp: Date.now()
        };
        
        this.sendMessage(message.from, receipt, { type: 'system' });
    }
    
    // ============================================
    // PRESENCIA Y ESTADO
    // ============================================
    updatePresence(userId = 'user', status = null, message = null) {
        if (!status) {
            status = this.presenceStates.online;
        }
        
        const oldStatus = this.presence.get(userId);
        this.presence.set(userId, status);
        
        // Actualizar información del contacto
        const contact = this.contacts.get(userId);
        if (contact) {
            contact.status = status;
            contact.lastSeen = Date.now();
            contact.presenceMessage = message;
        }
        
        // Notificar cambio de presencia
        if (oldStatus !== status) {
            this.broadcastPresenceUpdate(userId, status, message);
        }
    }
    
    broadcastPresenceUpdate(userId, status, message = null) {
        const presenceUpdate = {
            type: 'presence_update',
            userId,
            status,
            message,
            timestamp: Date.now()
        };
        
        // Enviar a todos los contactos
        this.contacts.forEach((contact, contactId) => {
            if (contactId !== userId && this.connections.has(contactId)) {
                this.sendMessage(contactId, presenceUpdate, { type: 'system' });
            }
        });
    }
    
    setTyping(userId, isTyping, targetId) {
        const typingEvent = {
            type: 'typing_indicator',
            userId,
            targetId,
            isTyping,
            timestamp: Date.now()
        };
        
        this.sendMessage(targetId, typingEvent, { type: 'system' });
        
        // Limpiar indicador después de un tiempo
        if (isTyping) {
            setTimeout(() => {
                this.setTyping(userId, false, targetId);
            }, this.config.typingTimeout);
        }
    }
    
    // ============================================
    // SALAS DE CHAT
    // ============================================
    joinRoom(roomId, userId = 'user') {
        const room = this.chatRooms.get(roomId);
        if (!room) {
            return { success: false, reason: 'Room not found' };
        }
        
        if (room.users.size >= room.maxUsers) {
            return { success: false, reason: 'Room is full' };
        }
        
        room.users.add(userId);
        
        // Notificar a otros miembros
        this.sendRoomMessage(roomId, `${userId} joined the room`, {
            from: 'system',
            type: 'system'
        });
        
        // Enviar historial reciente al nuevo miembro
        this.sendRoomHistory(roomId, userId);
        
        return { success: true };
    }
    
    leaveRoom(roomId, userId = 'user') {
        const room = this.chatRooms.get(roomId);
        if (!room) {
            return { success: false, reason: 'Room not found' };
        }
        
        room.users.delete(userId);
        
        // Notificar a otros miembros
        this.sendRoomMessage(roomId, `${userId} left the room`, {
            from: 'system',
            type: 'system'
        });
        
        return { success: true };
    }
    
    createRoom(name, options = {}) {
        const room = {
            id: this.generateRoomId(),
            name,
            description: options.description || '',
            type: options.type || 'private',
            maxUsers: options.maxUsers || 50,
            created: Date.now(),
            creator: options.creator || 'user',
            moderators: new Set([options.creator || 'user']),
            users: new Set([options.creator || 'user']),
            messages: [],
            active: true,
            settings: {
                allowFiles: options.allowFiles !== false,
                allowImages: options.allowImages !== false,
                maxMessageLength: options.maxMessageLength || 2000,
                slowMode: options.slowMode || false,
                password: options.password || null
            }
        };
        
        this.chatRooms.set(room.id, room);
        
        this.logActivity('room_created', { roomId: room.id, name });
        return room;
    }
    
    sendRoomHistory(roomId, userId) {
        const room = this.chatRooms.get(roomId);
        if (!room) return;
        
        const recentMessages = room.messages.slice(-50);
        recentMessages.forEach(message => {
            this.sendDirectMessage(userId, message.content, {
                from: message.from,
                type: message.type,
                timestamp: message.timestamp,
                isHistory: true
            });
        });
    }
    
    // ============================================
    // CONTACTOS Y USUARIOS
    // ============================================
    addContact(contactInfo) {
        const contact = {
            id: contactInfo.id,
            name: contactInfo.name || contactInfo.id,
            avatar: contactInfo.avatar || '👤',
            status: this.presenceStates.offline,
            role: contactInfo.role || 'user',
            lastSeen: Date.now(),
            isOnline: false,
            groups: contactInfo.groups || [],
            notes: contactInfo.notes || '',
            added: Date.now()
        };
        
        this.contacts.set(contact.id, contact);
        this.presence.set(contact.id, contact.status);
        
        this.logActivity('contact_added', { contactId: contact.id });
        return contact;
    }
    
    removeContact(contactId) {
        const removed = this.contacts.delete(contactId);
        this.presence.delete(contactId);
        
        if (removed) {
            this.logActivity('contact_removed', { contactId });
        }
        
        return removed;
    }
    
    getContact(contactId) {
        return this.contacts.get(contactId);
    }
    
    getAllContacts() {
        return Array.from(this.contacts.values());
    }
    
    getOnlineContacts() {
        return this.getAllContacts().filter(contact => contact.isOnline);
    }
    
    // ============================================
    // NOTIFICACIONES
    // ============================================
    notifyUser(userId, message, type = 'info') {
        const notification = {
            id: this.generateNotificationId(),
            userId,
            message,
            type,
            timestamp: Date.now(),
            read: false
        };
        
        this.notifications.push(notification);
        
        // Limpiar notificaciones antiguas
        if (this.notifications.length > 100) {
            this.notifications.shift();
        }
        
        // Mostrar notificación en UI si es el usuario actual
        if (userId === 'user') {
            this.displayNotification(notification);
        }
        
        return notification;
    }
    
    displayNotification(notification) {
        // Crear elemento de notificación
        const notificationEl = document.createElement('div');
        notificationEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(1, 1, 1, 0.95);
            border: 2px solid #00ff41;
            color: #00ff41;
            padding: 15px;
            font-family: monospace;
            font-size: 12px;
            max-width: 300px;
            z-index: 9999;
            box-shadow: 0 0 20px rgba(0, 255, 65, 0.5);
        `;
        
        notificationEl.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">${notification.type.toUpperCase()}</div>
            <div>${this.escapeHtml(notification.message)}</div>
            <div style="font-size: 10px; opacity: 0.7; margin-top: 5px;">
                ${new Date(notification.timestamp).toLocaleTimeString()}
            </div>
        `;
        
        document.body.appendChild(notificationEl);
        
        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            if (document.body.contains(notificationEl)) {
                document.body.removeChild(notificationEl);
            }
        }, 5000);
        
        // Cerrar al hacer clic
        notificationEl.onclick = () => {
            if (document.body.contains(notificationEl)) {
                document.body.removeChild(notificationEl);
            }
        };
    }
    
    // ============================================
    // ENCRIPTACIÓN Y SEGURIDAD
    // ============================================
    encryptMessage(content) {
        // Encriptación simplificada (en producción usar algoritmos seguros)
        try {
            return btoa(content); // Base64 como ejemplo
        } catch (error) {
            this.logError('encryption', error);
            return content;
        }
    }
    
    decryptMessage(content) {
        // Desencriptación simplificada
        try {
            return atob(content);
        } catch (error) {
            this.logError('decryption', error);
            return content;
        }
    }
    
    compressMessage(content) {
        // Compresión simplificada
        try {
            // En una implementación real, usaría algoritmos de compresión reales
            return content; // Por simplicidad, no comprimir
        } catch (error) {
            this.logError('compression', error);
            return content;
        }
    }
    
    decompressMessage(content) {
        // Descompresión simplificada
        return content;
    }
    
    // ============================================
    // HISTORIAL Y BÚSQUEDA
    // ============================================
    getMessageHistory(userId = null, limit = 50) {
        let messages = this.messageHistory;
        
        if (userId) {
            messages = messages.filter(msg => 
                msg.from === userId || msg.to === userId
            );
        }
        
        return messages.slice(-limit);
    }
    
    searchMessages(query, options = {}) {
        const { from, to, type, startDate, endDate } = options;
        
        let results = this.messageHistory;
        
        // Filtrar por término de búsqueda
        if (query) {
            results = results.filter(msg => 
                msg.content.toLowerCase().includes(query.toLowerCase())
            );
        }
        
        // Filtrar por remitente
        if (from) {
            results = results.filter(msg => msg.from === from);
        }
        
        // Filtrar por destinatario
        if (to) {
            results = results.filter(msg => msg.to === to);
        }
        
        // Filtrar por tipo
        if (type) {
            results = results.filter(msg => msg.type === type);
        }
        
        // Filtrar por fecha
        if (startDate) {
            results = results.filter(msg => msg.timestamp >= startDate);
        }
        
        if (endDate) {
            results = results.filter(msg => msg.timestamp <= endDate);
        }
        
        return results;
    }
    
    trimMessageHistory() {
        if (this.messageHistory.length > this.config.maxHistorySize) {
            this.messageHistory = this.messageHistory.slice(-this.config.maxHistorySize);
        }
    }
    
    // ============================================
    // MÉTODOS DE SISTEMA
    // ============================================
    handleSystemMessage(event) {
        const { type, subtype, data } = event;
        
        switch (type) {
            case 'user_action':
                this.handleUserAction(data);
                break;
            case 'system_notification':
                this.handleSystemNotification(data);
                break;
            case 'presence_change':
                this.handlePresenceChange(data);
                break;
        }
    }
    
    handleUserAction(data) {
        const { action, userId, targetId, details } = data;
        
        switch (action) {
            case 'typing':
                this.setTyping(userId, true, targetId);
                break;
            case 'stop_typing':
                this.setTyping(userId, false, targetId);
                break;
            case 'message_read':
                this.sendReadReceipt({ id: details.messageId });
                break;
        }
    }
    
    handleSystemNotification(data) {
        const { title, message, type, userId } = data;
        
        this.notifyUser(userId || 'user', message, type);
    }
    
    handlePresenceChange(data) {
        const { userId, status, message } = data;
        
        this.updatePresence(userId, status, message);
    }
    
    // ============================================
    // MÉTODOS DE UTILIDAD
    // ============================================
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateRoomId() {
        return 'room_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateNotificationId() {
        return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    determineProtocol(target) {
        if (target.startsWith('room_') || this.chatRooms.has(target)) {
            return this.protocols.room;
        } else if (target === 'all' || target === 'broadcast') {
            return this.protocols.broadcast;
        } else if (target === 'system') {
            return this.protocols.system;
        } else {
            return this.protocols.direct;
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    logActivity(action, data = {}) {
        const activity = {
            timestamp: Date.now(),
            action,
            data,
            source: 'messenger_comms'
        };
        
        if (window.systemCore) {
            window.systemCore.emitEvent('messenger', action, activity);
        }
        
        console.log(`[MESSENGER_COMMS] ${action}:`, data);
    }
    
    logError(action, error) {
        this.logActivity('error', {
            action,
            error: error.message || error,
            stack: error.stack
        });
    }
    
    // ============================================
    // INTERFAZ DE USUARIO
    // ============================================
    displayMessage(message) {
        // Implementar visualización de mensajes en UI
        console.log('[MESSENGER_UI] Message:', message);
    }
    
    displayRoomMessage(message, roomId) {
        // Implementar visualización de mensajes de sala en UI
        console.log(`[MESSENGER_UI] Room ${roomId} message:`, message);
    }
    
    // ============================================
    // MÉTODOS PÚBLICOS
    // ============================================
    isInitialized() {
        return this.isInitialized;
    }
    
    getConnectionStatus(userId) {
        const connection = this.connections.get(userId);
        return connection ? connection.status : 'disconnected';
    }
    
    getRoom(roomId) {
        return this.chatRooms.get(roomId);
    }
    
    getAllRooms() {
        return Array.from(this.chatRooms.values());
    }
    
    getPresence(userId) {
        return this.presence.get(userId) || this.presenceStates.offline;
    }
    
    getNotifications(userId = null) {
        if (userId) {
            return this.notifications.filter(n => n.userId === userId);
        }
        return this.notifications;
    }
    
    markNotificationAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            return true;
        }
        return false;
    }
    
    getStats() {
        return {
            connections: this.connections.size,
            messagesSent: this.messageHistory.length,
            rooms: this.chatRooms.size,
            contacts: this.contacts.size,
            notifications: this.notifications.length
        };
    }
    
    // ============================================
    // MÉTODOS DE DEPURACIÓN
    // ============================================
    simulateMessage(target, content, options = {}) {
        const message = {
            id: this.generateMessageId(),
            type: options.type || this.messageTypes.text,
            from: options.from || 'simulated_user',
            to: target,
            content,
            timestamp: Date.now(),
            protocol: this.determineProtocol(target),
            options,
            status: 'delivered'
        };
        
        this.handleIncomingMessage(message, target);
        return message;
    }
    
    simulateUserJoin(roomId, userId) {
        this.joinRoom(roomId, userId);
        
        this.sendRoomMessage(roomId, `${userId} joined the room`, {
            from: 'system',
            type: 'system'
        });
    }
    
    simulateUserLeave(roomId, userId) {
        this.leaveRoom(roomId, userId);
        
        this.sendRoomMessage(roomId, `${userId} left the room`, {
            from: 'system',
            type: 'system'
        });
    }
    
    generateTestData() {
        // Generar datos de prueba
        const testUsers = ['alice', 'bob', 'charlie', 'diana'];
        const testRooms = ['test_room_1', 'test_room_2'];
        
        // Crear contactos de prueba
        testUsers.forEach(userId => {
            this.addContact({
                id: userId,
                name: userId.charAt(0).toUpperCase() + userId.slice(1),
                avatar: '👤',
                status: this.presenceStates.online,
                role: 'user'
            });
        });
        
        // Crear salas de prueba
        testRooms.forEach(roomId => {
            this.createRoom(`Test Room ${roomId.split('_').pop()}`, {
                type: 'public',
                creator: 'user'
            });
        });
        
        // Generar mensajes de prueba
        for (let i = 0; i < 10; i++) {
            const fromUser = testUsers[Math.floor(Math.random() * testUsers.length)];
            const toUser = testUsers[Math.floor(Math.random() * testUsers.length)];
            
            if (fromUser !== toUser) {
                this.simulateMessage(toUser, `Test message ${i + 1} from ${fromUser}`, {
                    from: fromUser
                });
            }
        }
        
        console.log('[MESSENGER_COMMS] Test data generated');
    }
}

// ============================================
// EXPORTAR MESSENGER COMMS
// ============================================
window.MessengerComms = MessengerComms;
window.messengerComms = new MessengerComms();

console.log('[MESSENGER_COMMS] Messenger Comms module loaded successfully');