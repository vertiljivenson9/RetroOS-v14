import { vertilAPI } from './vertilApi';

export class KernelFS {
  private isInitialized = true;
  private mountStatus = false;

  constructor() {
    console.log('[KERNEL_FS] Sistema de archivos inicializado (modo sandbox)');
    this.initializeSandbox();
  }

  private initializeSandbox(): void {
    // Modo sandbox para navegadores moviles
    this.isInitialized = true;
    console.log('[KERNEL_FS] Modo sandbox activado. Almacenamiento en memoria.');
  }

  // Simulacion de montaje de hardware uplink
  async mountHardwareUplink(): Promise<boolean> {
    try {
      // En movil, usar showDirectoryPicker si esta disponible
      if ('showDirectoryPicker' in window) {
        const handle = await window.showDirectoryPicker({
          mode: 'readwrite',
        });
        this.mountStatus = true;
        
        vertilAPI.notify('Hardware Uplink montado', 'info');
        console.log('[KERNEL_FS] Hardware Uplink montado:', handle.name);
        return true;
      } else {
        // Fallback para navegadores sin File System Access API
        this.mountStatus = true;
        vertilAPI.notify('Modo sandbox activado', 'info');
        return true;
      }
    } catch (error) {
      console.error('[KERNEL_FS] Error al montar:', error);
      vertilAPI.notify('Error al montar Hardware Uplink', 'error');
      return false;
    }
  }

  // Operaciones de archivo simuladas
  async listDirectory(path: string = '/'): Promise<any[]> {
    // Retorna estructura simulada para movil
    return [
      { name: 'system/', type: 'directory' },
      { name: 'apps/', type: 'directory' },
      { name: 'config.json', type: 'file', size: 1024 },
      { name: 'readme.txt', type: 'file', size: 512 },
      { name: 'data/', type: 'directory' },
    ];
  }

  async writeFile(path: string, content: string): Promise<void> {
    // Simular escritura en localStorage para movil
    const key = `file_${path.replace(/[/\\:]/g, '_')}`;
    localStorage.setItem(key, content);
    
    vertilAPI.emit({
      type: 'fs.file_changed',
      data: { path, action: 'write' },
      timestamp: Date.now(),
      source: 'kernelFS',
    });
  }

  async readFile(path: string): Promise<string> {
    // Leer de localStorage
    const key = `file_${path.replace(/[/\\:]/g, '_')}`;
    const content = localStorage.getItem(key);
    return content || `Archivo no encontrado: ${path}`;
  }

  async deleteFile(path: string): Promise<void> {
    const key = `file_${path.replace(/[/\\:]/g, '_')}`;
    localStorage.removeItem(key);
    
    vertilAPI.emit({
      type: 'fs.file_changed',
      data: { path, action: 'delete' },
      timestamp: Date.now(),
      source: 'kernelFS',
    });
  }

  getMountStatus(): boolean {
    return this.mountStatus;
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  isHardwareUplinkReady(): boolean {
    return this.isInitialized;
  }
}

export const createKernelFS = () => new KernelFS();