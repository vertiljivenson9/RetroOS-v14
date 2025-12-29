import { VertilEvent } from '../types';

export class VertilAPI {
  private eventListeners: Map<string, ((event: VertilEvent) => void)[]> = new Map();
  private godMode = false;

  constructor() {
    console.log('[VERTIL_API] System Bus inicializado (modo movil)');
  }

  emit(event: VertilEvent): void {
    const listeners = this.eventListeners.get(event.type) || [];
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('[VERTIL_API] Error en listener:', error);
      }
    });
  }

  on(eventType: string, callback: (event: VertilEvent) => void): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }

    this.eventListeners.get(eventType)!.push(callback);

    return () => {
      const listeners = this.eventListeners.get(eventType);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  // Utilidades simplificadas para movil
  notify(message: string, level: 'info' | 'warning' | 'error' | 'critical' = 'info'): void {
    // En movil, usar notificaciones visuales simples
    const notification = document.createElement('div');
    notification.className = `
      fixed top-4 left-4 right-4 z-50 p-3 border text-sm font-mono
      ${level === 'error' ? 'border-red-500 text-red-500 bg-red-500/10' : 
        level === 'warning' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' :
        'border-phosphor text-phosphor bg-phosphor/10'}
      transition-opacity duration-300
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  setGodMode(enabled: boolean): void {
    this.godMode = enabled;
    this.emit({
      type: 'sys.security.god_mode_changed',
      data: { enabled },
      timestamp: Date.now(),
      source: 'security_manager',
    });

    if (enabled) {
      this.notify('[CRITICAL] God Mode activado', 'critical');
    } else {
      this.notify('God Mode desactivado', 'info');
    }
  }

  getGodMode(): boolean {
    return this.godMode;
  }

  log(level: 'debug' | 'info' | 'warn' | 'error', source: string, message: string): void {
    const levels = { debug: '🐛', info: 'ℹ', warn: '⚠', error: '❌' };
    console.log(`[${levels[level]} ${source.toUpperCase()}] ${message}`);
  }

  appLaunched(appId: string): void {
    this.emit({
      type: 'app.launched',
      data: { appId },
      timestamp: Date.now(),
      source: 'app_manager',
    });
  }
}

// Exportar instancia singleton
export const vertilAPI = new VertilAPI();