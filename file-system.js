/**
 * ============================================
 * KERNEL FILE SYSTEM - RETROS V18.0
 * Sistema de Archivos Profesional con Hardware Uplink
 * ============================================
 */

class KernelFileSystem {
    constructor() {
        this.rootHandle = null;
        this.currentDirectory = '/';
        this.mountPoint = null;
        this.isInitialized = false;
        this.maxFileSize = 100 * 1024 * 1024; // 100MB
        this.supportedTypes = [
            'text/plain',
            'image/jpeg',
            'image/png',
            'image/svg+xml',
            'application/json',
            'application/javascript',
            'text/css',
            'text/html'
        ];
        
        // Sistema de archivos en memoria (sandbox)
        this.memoryFS = new Map();
        this.initializeMemoryFileSystem();
        
        // Gestores de archivos
        this.fileHandlers = new Map();
        this.initializeFileHandlers();
        
        // Sistema de permisos
        this.permissions = new Map();
        this.initializePermissions();
        
        // Logs del sistema
        this.operationLog = [];
        
        this.init();
    }

    // ============================================
    // INICIALIZACIÓN DEL SISTEMA
    // ============================================
    async init() {
        try {
            await this.loadFileSystemState();
            this.isInitialized = true;
            console.log('[KERNEL_FS] Sistema de archivos inicializado');
        } catch (error) {
            console.error('[KERNEL_FS] Error inicializando sistema de archivos:', error);
            this.initializeFallbackSystem();
        }
    }

    initializeMemoryFileSystem() {
        // Sistema de archivos por defecto
        const defaultStructure = {
            '/': {
                type: 'directory',
                contents: ['system/', 'users/', 'applications/', 'boot.ini', 'readme.txt']
            },
            '/system/': {
                type: 'directory',
                contents: ['kernel/', 'drivers/', 'registry/', 'config.sys']
            },
            '/users/': {
                type: 'directory',
                contents: ['admin/', 'guest/']
            },
            '/applications/': {
                type: 'directory',
                contents: ['terminal.exe', 'explorer.exe', 'vision.exe', 'settings.exe']
            },
            '/system/kernel/': {
                type: 'directory',
                contents: ['core.dll', 'neural.dll', 'fs.sys']
            },
            '/system/registry/': {
                type: 'directory',
                contents: ['system.dat', 'user.dat', 'security.dat']
            },
            '/users/admin/': {
                type: 'directory',
                contents: ['documents/', 'downloads/', 'pictures/', 'config.ini']
            },
            '/users/guest/': {
                type: 'directory',
                contents: ['documents/', 'temp/']
            }
        };

        // Convertir a estructura de Map
        for (const [path, data] of Object.entries(defaultStructure)) {
            this.memoryFS.set(path, data);
        }

        // Crear archivos de contenido
        this.createDefaultFiles();
    }

    createDefaultFiles() {
        const defaultFiles = {
            '/readme.txt': {
                type: 'file',
                content: `RETROS v18.0 - NEURAL GATEWAY PROFESSIONAL

Sistema operativo web con inteligencia artificial integrada.

CARACTERÍSTICAS:
- Neural Gateway con Google Gemini
- Sistema de archivos profesional
- Gestión avanzada de ventanas
- Interfaz brutalista personalizable

COMANDOS:
- help: Muestra ayuda del sistema
- neofetch: Información del sistema
- neural [texto]: Procesamiento con IA
- vision [desc]: Generación de blueprints

Para más información, visite Settings > System Information.

© 2024 Neural Gateway Systems`,
                size: 512,
                modified: Date.now()
            },
            '/boot.ini': {
                type: 'file',
                content: `[boot loader]
timeout=30
default=multi(0)disk(0)rdisk(0)partition(1)\WINDOWS

[operating systems]
RetroOS v18.0="RetroOS v18.0 Professional" /fastdetect /neural /godmode`,
                size: 256,
                modified: Date.now()
            },
            '/system/config.sys': {
                type: 'file',
                content: `[System]
Version=18.0.0
Build=1800
Kernel=Neural Gateway v3.0
GUI=Window Manager v2.0

[Neural]
Gateway=Active
Model=gemini-3-flash-preview
MaxTokens=4096

[Security]
GodMode=false
AccessLevel=User
Encryption=AES-256`,
                size: 384,
                modified: Date.now()
            },
            '/users/admin/config.ini': {
                type: 'file',
                content: `[UserProfile]
Name=admin
Home=/users/admin/
Theme=Phosphor
GodMode=false

[Preferences]
Terminal=bash
Editor=neural-vim
Browser=quantum

[History]
LastLogin=${new Date().toISOString()}
CommandsExecuted=0
FilesCreated=0`,
                size: 320,
                modified: Date.now()
            }
        };

        for (const [path, data] of Object.entries(defaultFiles)) {
            this.memoryFS.set(path, data);
        }
    }

    initializeFileHandlers() {
        this.fileHandlers.set('text/plain', this.handleTextFile.bind(this));
        this.fileHandlers.set('application/json', this.handleJSONFile.bind(this));
        this.fileHandlers.set('image/svg+xml', this.handleSVGFile.bind(this));
        this.fileHandlers.set('default', this.handleBinaryFile.bind(this));
    }

    initializePermissions() {
        // Permisos por defecto
        this.permissions.set('/', { read: true, write: false, execute: true });
        this.permissions.set('/system/', { read: true, write: false, execute: false });
        this.permissions.set('/users/', { read: true, write: true, execute: true });
        this.permissions.set('/users/admin/', { read: true, write: true, execute: true });
        this.permissions.set('/users/guest/', { read: true, write: false, execute: true });
        this.permissions.set('/applications/', { read: true, write: false, execute: true });
    }

    initializeFallbackSystem() {
        console.log('[KERNEL_FS] Inicializando sistema de respaldo');
        this.isInitialized = true;
    }

    // ============================================
    // HARDWARE UPLINK - MONTAJE DE SISTEMA DE ARCHIVOS
    // ============================================
    async mountHardwareUplink() {
        try {
            if (!('showDirectoryPicker' in window)) {
                throw new Error('File System Access API no soportada');
            }

            const directoryHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents'
            });

            this.rootHandle = directoryHandle;
            this.mountPoint = directoryHandle.name;
            this.uplinkMounted = true;

            console.log(`[KERNEL_FS] Hardware Uplink montado en: ${this.mountPoint}`);
            this.logOperation('mount', '/', 'success');
            
            // Crear estructura del sistema en el directorio
            await this.createSystemStructure(directoryHandle);
            
            return {
                success: true,
                path: this.mountPoint,
                handle: directoryHandle
            };

        } catch (error) {
            console.error('[KERNEL_FS] Error montando Hardware Uplink:', error);
            this.logOperation('mount', '/', 'failed', error.message);
            
            // Fallback a sistema sandbox
            this.uplinkMounted = false;
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    async createSystemStructure(rootHandle) {
        try {
            // Crear directorios del sistema
            const dirs = ['System', 'Users', 'Applications', 'Temp'];
            
            for (const dirName of dirs) {
                try {
                    await rootHandle.getDirectoryHandle(dirName, { create: true });
                } catch (error) {
                    console.warn(`[KERNEL_FS] Error creando directorio ${dirName}:`, error);
                }
            }

            // Crear archivo de estado del kernel
            const kernelState = {
                version: '18.0.0',
                build: 1800,
                mountTime: Date.now(),
                neuralGateway: false,
                godMode: false
            };

            const systemDir = await rootHandle.getDirectoryHandle('System', { create: true });
            const stateFile = await systemDir.getFileHandle('kernel_state.json', { create: true });
            const writable = await stateFile.createWritable();
            await writable.write(JSON.stringify(kernelState, null, 2));
            await writable.close();

        } catch (error) {
            console.error('[KERNEL_FS] Error creando estructura del sistema:', error);
        }
    }

    // ============================================
    // OPERACIONES DE ARCHIVOS
    // ============================================
    async writeFile(path, content, type = 'text/plain') {
        try {
            if (this.uplinkMounted && this.rootHandle) {
                return await this.writeFileReal(path, content, type);
            } else {
                return await this.writeFileMemory(path, content, type);
            }
        } catch (error) {
            console.error('[KERNEL_FS] Error escribiendo archivo:', error);
            throw error;
        }
    }

    async writeFileReal(path, content, type) {
        const parts = path.split('/').filter(Boolean);
        const fileName = parts.pop();
        
        let currentDir = this.rootHandle;
        
        // Navegar hasta el directorio padre
        for (const part of parts) {
            currentDir = await currentDir.getDirectoryHandle(part, { create: true });
        }

        // Crear y escribir el archivo
        const fileHandle = await currentDir.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        
        try {
            await writable.write(content);
            await writable.close();
            
            this.logOperation('write', path, 'success');
            
            // Notificar al sistema
            if (window.retroOS && window.retroOS.showNotification) {
                window.retroOS.showNotification(`File written: ${fileName}`, 'info');
            }
            
        } catch (error) {
            await writable.abort();
            throw error;
        }
    }

    async writeFileMemory(path, content, type) {
        const fileData = {
            type: 'file',
            content: content,
            size: content.length,
            modified: Date.now(),
            created: Date.now(),
            mimeType: type
        };

        this.memoryFS.set(path, fileData);
        
        // Actualizar directorio padre
        const dirPath = path.substring(0, path.lastIndexOf('/') + 1) || '/';
        const fileName = path.split('/').pop();
        
        const dirData = this.memoryFS.get(dirPath);
        if (dirData && dirData.type === 'directory') {
            if (!dirData.contents.includes(fileName)) {
                dirData.contents.push(fileName);
            }
        }

        this.logOperation('write', path, 'success');
        
        // Notificar al sistema
        if (window.retroOS && window.retroOS.showNotification) {
            window.retroOS.showNotification(`File written to memory: ${fileName}`, 'info');
        }
    }

    async readFile(path) {
        try {
            if (this.uplinkMounted && this.rootHandle) {
                return await this.readFileReal(path);
            } else {
                return await this.readFileMemory(path);
            }
        } catch (error) {
            console.error('[KERNEL_FS] Error leyendo archivo:', error);
            throw error;
        }
    }

    async readFileReal(path) {
        const parts = path.split('/').filter(Boolean);
        const fileName = parts.pop();
        
        let currentDir = this.rootHandle;
        
        // Navegar hasta el directorio padre
        for (const part of parts) {
            currentDir = await currentDir.getDirectoryHandle(part);
        }

        const fileHandle = await currentDir.getFileHandle(fileName);
        const file = await fileHandle.getFile();
        
        this.logOperation('read', path, 'success');
        
        return await file.text();
    }

    async readFileMemory(path) {
        const fileData = this.memoryFS.get(path);
        
        if (!fileData || fileData.type !== 'file') {
            throw new Error(`File not found: ${path}`);
        }

        this.logOperation('read', path, 'success');
        
        return fileData.content;
    }

    async deleteFile(path) {
        try {
            if (this.uplinkMounted && this.rootHandle) {
                return await this.deleteFileReal(path);
            } else {
                return await this.deleteFileMemory(path);
            }
        } catch (error) {
            console.error('[KERNEL_FS] Error eliminando archivo:', error);
            throw error;
        }
    }

    async deleteFileReal(path) {
        const parts = path.split('/').filter(Boolean);
        const fileName = parts.pop();
        
        let currentDir = this.rootHandle;
        
        // Navegar hasta el directorio padre
        for (const part of parts) {
            currentDir = await currentDir.getDirectoryHandle(part);
        }

        await currentDir.removeEntry(fileName);
        this.logOperation('delete', path, 'success');
    }

    deleteFileMemory(path) {
        const fileData = this.memoryFS.get(path);
        
        if (!fileData || fileData.type !== 'file') {
            throw new Error(`File not found: ${path}`);
        }

        this.memoryFS.delete(path);
        
        // Actualizar directorio padre
        const dirPath = path.substring(0, path.lastIndexOf('/') + 1) || '/';
        const fileName = path.split('/').pop();
        
        const dirData = this.memoryFS.get(dirPath);
        if (dirData && dirData.type === 'directory') {
            const index = dirData.contents.indexOf(fileName);
            if (index > -1) {
                dirData.contents.splice(index, 1);
            }
        }

        this.logOperation('delete', path, 'success');
    }

    async listDirectory(path = '/') {
        try {
            if (this.uplinkMounted && this.rootHandle) {
                return await this.listDirectoryReal(path);
            } else {
                return await this.listDirectoryMemory(path);
            }
        } catch (error) {
            console.error('[KERNEL_FS] Error listando directorio:', error);
            throw error;
        }
    }

    async listDirectoryReal(path) {
        const parts = path.split('/').filter(Boolean);
        let currentDir = this.rootHandle;

        // Navegar hasta el directorio objetivo
        for (const part of parts) {
            currentDir = await currentDir.getDirectoryHandle(part);
        }

        const entries = [];

        for await (const [name, handle] of currentDir.entries()) {
            entries.push({
                name,
                type: handle.kind === 'directory' ? 'directory' : 'file',
                path: path === '/' ? `/${name}` : `${path}/${name}`,
                handle
            });
        }

        this.logOperation('list', path, 'success');
        
        return entries.sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === 'directory' ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        });
    }

    listDirectoryMemory(path = '/') {
        const dirData = this.memoryFS.get(path);
        
        if (!dirData || dirData.type !== 'directory') {
            throw new Error(`Directory not found: ${path}`);
        }

        const entries = dirData.contents.map(name => {
            const itemPath = path === '/' ? `/${name}` : `${path}/${name}`;
            const itemData = this.memoryFS.get(itemPath);
            
            return {
                name,
                type: name.endsWith('/') || (itemData && itemData.type === 'directory') ? 'directory' : 'file',
                path: itemPath,
                size: itemData ? itemData.size : 0,
                modified: itemData ? itemData.modified : Date.now()
            };
        });

        this.logOperation('list', path, 'success');
        
        return entries.sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === 'directory' ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        });
    }

    async createDirectory(path) {
        try {
            if (this.uplinkMounted && this.rootHandle) {
                return await this.createDirectoryReal(path);
            } else {
                return await this.createDirectoryMemory(path);
            }
        } catch (error) {
            console.error('[KERNEL_FS] Error creando directorio:', error);
            throw error;
        }
    }

    async createDirectoryReal(path) {
        const parts = path.split('/').filter(Boolean);
        let currentDir = this.rootHandle;

        for (const part of parts) {
            currentDir = await currentDir.getDirectoryHandle(part, { create: true });
        }

        this.logOperation('mkdir', path, 'success');
        
        return currentDir;
    }

    createDirectoryMemory(path) {
        if (this.memoryFS.has(path)) {
            throw new Error(`Directory already exists: ${path}`);
        }

        const dirName = path.split('/').pop() + '/';
        const parentPath = path.substring(0, path.lastIndexOf('/') + 1) || '/';
        
        // Crear el directorio
        this.memoryFS.set(path, {
            type: 'directory',
            contents: [],
            created: Date.now(),
            modified: Date.now()
        });

        // Añadir al padre
        const parentData = this.memoryFS.get(parentPath);
        if (parentData && parentData.type === 'directory') {
            if (!parentData.contents.includes(dirName)) {
                parentData.contents.push(dirName);
            }
        }

        this.logOperation('mkdir', path, 'success');
        
        return this.memoryFS.get(path);
    }

    // ============================================
    // MANEJADORES DE ARCHIVOS ESPECIALIZADOS
    // ============================================
    handleTextFile(path, content, operation) {
        if (operation === 'read') {
            return content;
        } else if (operation === 'write') {
            return content;
        }
    }

    handleJSONFile(path, content, operation) {
        if (operation === 'read') {
            try {
                return JSON.parse(content);
            } catch (error) {
                throw new Error(`Invalid JSON in ${path}: ${error.message}`);
            }
        } else if (operation === 'write') {
            try {
                return typeof content === 'object' ? JSON.stringify(content, null, 2) : content;
            } catch (error) {
                throw new Error(`Error serializing JSON for ${path}: ${error.message}`);
            }
        }
    }

    handleSVGFile(path, content, operation) {
        if (operation === 'read') {
            return content;
        } else if (operation === 'write') {
            // Validar SVG básico
            if (!content.includes('<svg') || !content.includes('</svg>')) {
                throw new Error(`Invalid SVG content in ${path}`);
            }
            return content;
        }
    }

    handleBinaryFile(path, content, operation) {
        // Para archivos binarios, solo pasar el contenido
        return content;
    }

    // ============================================
    // PERMISOS Y SEGURIDAD
    // ============================================
    checkPermission(path, operation) {
        // Verificar permisos específicos del archivo
        const filePermissions = this.permissions.get(path);
        if (filePermissions && filePermissions[operation] !== undefined) {
            return filePermissions[operation];
        }

        // Verificar permisos del directorio padre
        const parentPath = path.substring(0, path.lastIndexOf('/') + 1) || '/';
        const parentPermissions = this.permissions.get(parentPath);
        
        if (parentPermissions && parentPermissions[operation] !== undefined) {
            return parentPermissions[operation];
        }

        // Permisos por defecto
        const defaultPermissions = {
            read: true,
            write: false,
            execute: true
        };

        return defaultPermissions[operation] || false;
    }

    setPermission(path, operation, allowed) {
        if (!this.permissions.has(path)) {
            this.permissions.set(path, {});
        }
        
        this.permissions.get(path)[operation] = allowed;
    }

    // ============================================
    // UTILIDADES
    // ============================================
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    getMimeType(filename) {
        const ext = this.getFileExtension(filename);
        const mimeTypes = {
            'txt': 'text/plain',
            'json': 'application/json',
            'js': 'application/javascript',
            'css': 'text/css',
            'html': 'text/html',
            'svg': 'image/svg+xml',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg'
        };
        
        return mimeTypes[ext] || 'application/octet-stream';
    }

    logOperation(operation, path, status, details = null) {
        const logEntry = {
            timestamp: Date.now(),
            operation,
            path,
            status,
            details
        };
        
        this.operationLog.push(logEntry);
        
        // Mantener solo los últimos 1000 registros
        if (this.operationLog.length > 1000) {
            this.operationLog.shift();
        }
    }

    getOperationLog(limit = 100) {
        return this.operationLog.slice(-limit);
    }

    // ============================================
    // PERSISTENCIA
    // ============================================
    async saveFileSystemState() {
        const state = {
            memoryFS: Array.from(this.memoryFS.entries()),
            permissions: Array.from(this.permissions.entries()),
            operationLog: this.operationLog,
            timestamp: Date.now()
        };

        localStorage.setItem('retroos_filesystem_state', JSON.stringify(state));
    }

    async loadFileSystemState() {
        try {
            const stateStr = localStorage.getItem('retroos_filesystem_state');
            if (stateStr) {
                const state = JSON.parse(stateStr);
                
                this.memoryFS = new Map(state.memoryFS);
                this.permissions = new Map(state.permissions);
                this.operationLog = state.operationLog || [];
                
                console.log('[KERNEL_FS] Estado del sistema de archivos restaurado');
            }
        } catch (error) {
            console.error('[KERNEL_FS] Error restaurando estado:', error);
        }
    }

    // ============================================
    // SISTEMA DE ARCHIVOS VIRTUAL AVANZADO
    // ============================================
    createVirtualFileSystem(name) {
        const vfs = {
            name,
            root: new Map(),
            metadata: {
                created: Date.now(),
                modified: Date.now(),
                type: 'virtual'
            }
        };
        
        return vfs;
    }

    mountVirtualFileSystem(name, vfs) {
        const mountPoint = `/vfs/${name}/`;
        
        this.memoryFS.set(mountPoint, {
            type: 'directory',
            contents: [],
            virtual: true,
            vfs: vfs
        });
        
        return mountPoint;
    }

    // ============================================
    // NOTIFICACIONES AL SISTEMA
    // ============================================
    showNotification(message, type = 'info') {
        if (window.retroOS && window.retroOS.showNotification) {
            window.retroOS.showNotification(message, type);
        } else {
            console.log(`[KERNEL_FS] ${message}`);
        }
    }

    // ============================================
    // ESTADÍSTICAS
    // ============================================
    getStatistics() {
        const files = Array.from(this.memoryFS.values()).filter(item => item.type === 'file');
        const directories = Array.from(this.memoryFS.values()).filter(item => item.type === 'directory');
        
        const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
        
        return {
            totalFiles: files.length,
            totalDirectories: directories.length,
            totalSize,
            mountPoint: this.mountPoint,
            uplinkMounted: this.uplinkMounted,
            operationCount: this.operationLog.length,
            permissionsCount: this.permissions.size
        };
    }
}

// ============================================
// EXPORTAR SISTEMA DE ARCHIVOS
// ============================================
window.KernelFileSystem = KernelFileSystem;
window.kernelFS = new KernelFileSystem();

console.log('[FILE_SYSTEM] Kernel File System loaded successfully');