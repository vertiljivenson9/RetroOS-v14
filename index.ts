export interface WindowConfig {
  id: string;
  title: string;
  component: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  props?: Record<string, any>;
}

export interface SystemRegistry {
  vertil: {
    sys: {
      version: string;
      build: number;
      security: {
        god_mode: boolean;
        cortex_access: boolean;
        hardware_uplink: boolean;
      };
      kernel_state: {
        boot_time: number;
        last_session: number | null;
        active_windows: string[];
        system_theme: 'phosphor' | 'god';
      };
    };
    fs: {
      root_handle: FileSystemDirectoryHandle | null;
      mounted_path: string | null;
      available_space: number;
    };
    neural: {
      api_key: string | null;
      model_flash: string;
      model_pro: string;
      model_image: string;
      last_sync: number | null;
    };
  };
}

export interface NeuralResponse {
  text: string;
  error?: string;
  model: string;
  timestamp: number;
}

export interface FileSystemEntry {
  name: string;
  type: 'file' | 'directory';
  handle: FileSystemHandle;
  path: string;
  size?: number;
  lastModified?: number;
}

export interface VertilEvent {
  type: string;
  data: any;
  timestamp: number;
  source: string;
}

export interface CinemaMetadata {
  title: string;
  duration: number;
  resolution: string;
  codec: string;
  bitrate: number;
  fps: number;
  analyzed: boolean;
  neural_analysis?: {
    scene_changes: number;
    dominant_colors: string[];
    motion_intensity: number;
    audio_spectrum: number[];
  };
}

export interface TerminalHistory {
  commands: string[];
  outputs: string[];
  timestamp: number;
}