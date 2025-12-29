import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { aetherisCore } from '../services/aetherisCore';
import { vertilAPI } from '../services/vertilApi';
import { TerminalHistory } from '../types';

interface TerminalProps {
  windowId: string;
}

interface CommandOutput {
  command: string;
  output: string[];
  timestamp: number;
}

export const Terminal: React.FC<TerminalProps> = ({ windowId }) => {
  const [currentPath, setCurrentPath] = useState('/');
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<CommandOutput[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Comandos del sistema
  const systemCommands: Record<string, (args: string[]) => Promise<string[]>> = {
    help: async () => [
      'RETROS v18.0 - Terminal Shell',
      '===========================',
      '',
      'Comandos del sistema:',
      '  help        - Muestra esta ayuda',
      '  neofetch    - Información del sistema',
      '  clear       - Limpia la pantalla',
      '  echo        - Repite el texto',
      '  date        - Muestra la fecha y hora',
      '  whoami      - Muestra el usuario actual',
      '  ls          - Lista archivos',
      '  pwd         - Muestra el directorio actual',
      '  cd          - Cambia de directorio',
      '  cat         - Muestra contenido de archivo',
      '',
      'Comandos neurales:',
      '  neural      - Ejecuta instrucción en Aetheris Core',
      '  vision      - Genera blueprint técnico',
      '',
      'Comandos de sistema:',
      '  registry    - Muestra el registro del sistema',
      '  uplink      - Monta Hardware Uplink',
      '  status      - Estado del sistema',
      '',
      'Para comandos neuronales, use: neural <instrucción>',
      'Ejemplo: neural "¿Cuál es la capital de Francia?"',
    ],

    neofetch: async () => {
      const isGodMode = vertilAPI.getGodMode();
      const neuralStatus = aetherisCore.isOnline() ? 'ONLINE' : 'OFFLINE';
      const bootTime = new Date().toLocaleString();
      
      return [
        '',
        `  ██████╗ ███████╗████████╗██╗   ██╗ ██████╗ ███████╗`,
        `  ██╔══██╗██╔════╝╚══██╔══╝██║   ██║██╔════╝ ██╔════╝`,
        `  ██████╔╝█████╗     ██║   ██║   ██║██║  ███╗█████╗  `,
        `  ██╔══██╗██╔══╝     ██║   ██║   ██║██║   ██║██╔══╝  `,
        `  ██║  ██║███████╗   ██║   ╚██████╔╝╚██████╔╝███████╗`,
        `  ╚═╝  ╚═╝╚══════╝   ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝`,
        '',
        `  Sistema: RetroOS v18.0`,
        `  Kernel: Neural Gateway`,
        `  Estado: ${isGodMode ? 'GOD MODE' : 'SEGURE'}`,
        `  Neural: ${neuralStatus}`,
        `  Arranque: ${bootTime}`,
        '',
      ];
    },

    clear: async () => {
      setOutput([]);
      return [];
    },

    echo: async (args: string[]) => {
      return [args.join(' ')];
    },

    date: async () => {
      return [new Date().toString()];
    },

    whoami: async () => {
      return ['root@retroos'];
    },

    ls: async () => {
      return [
        'Cloud/',
        'System/',
        'Applications/',
        'kernel_state.json',
        'welcome.txt',
      ];
    },

    pwd: async () => {
      return [currentPath];
    },

    cd: async (args: string[]) => {
      if (args.length === 0) {
        setCurrentPath('/');
        return [];
      }
      const newPath = args[0];
      // Simulación simple de navegación
      if (newPath === '..' || newPath === '/') {
        setCurrentPath('/');
      } else if (newPath === 'Cloud' || newPath === './Cloud') {
        setCurrentPath('/Cloud');
      } else {
        return [`cd: no such file or directory: ${newPath}`];
      }
      return [];
    },

    cat: async (args: string[]) => {
      if (args.length === 0) {
        return ['cat: missing operand'];
      }
      
      const filename = args[0];
      if (filename === 'welcome.txt') {
        return [
          'Bienvenido a RetroOS v18.0',
          '===========================',
          '',
          'Sistema operativo web brutalista con IA integrada.',
          '',
          'Comandos disponibles:',
          '  - help: Muestra la ayuda',
          '  - neofetch: Información del sistema',
          '  - neural: Comandos de IA',
          '',
          'Para activar el Modo Dios, acceda a CortexBackdoor.',
        ];
      }
      return [`cat: ${filename}: No such file or directory`];
    },

    registry: async () => {
      const events = vertilAPI.getEventHistory();
      return [
        'System Registry',
        '===============',
        `Total events: ${events.length}`,
        `God Mode: ${vertilAPI.getGodMode() ? 'ENABLED' : 'DISABLED'}`,
        `Neural Status: ${aetherisCore.isOnline() ? 'ONLINE' : 'OFFLINE'}`,
        '',
        'Recent events:',
        ...events.slice(-5).map(e => `${e.type}: ${e.source}`),
      ];
    },

    status: async () => {
      const coreStatus = await aetherisCore.analyzeSystemStatus();
      const busStatus = vertilAPI.getStatus();
      
      return [
        'System Status Report',
        '====================',
        '',
        ...coreStatus.split('\n'),
        '',
        'Event Bus Status:',
        `  Listeners: ${busStatus.listeners}`,
        `  History Size: ${busStatus.historySize}`,
        `  Uptime: ${Math.floor(busStatus.uptime / 1000)}s`,
      ];
    },

    uplink: async () => {
      // Este comando debería interactuar con KernelFS
      return [
        'Hardware Uplink Command',
        '=======================',
        '',
        'Para montar el Hardware Uplink, use el File Explorer',
        'o ejecute el comando desde el menú del sistema.',
      ];
    },
  };

  // Procesar comando
  const executeCommand = async (cmd: string) => {
    const parts = cmd.trim().split(' ');
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    const newOutput: CommandOutput = {
      command: cmd,
      output: [],
      timestamp: Date.now(),
    };

    if (commandName === 'neural') {
      // Comando neural - enviar a Aetheris Core
      const instruction = args.join(' ');
      if (!instruction) {
        newOutput.output = ['neural: missing instruction'];
      } else {
        newOutput.output = ['Enviando instrucción a Neural Gateway...'];
        setOutput(prev => [...prev, newOutput]);
        
        const response = await aetherisCore.executeNeuralInstruction(instruction);
        newOutput.output = response.text.split('\n');
        if (response.error) {
          newOutput.output.push(`Error: ${response.error}`);
        }
      }
    } else if (commandName === 'vision') {
      // Comando vision - generar blueprint
      const description = args.join(' ') || 'sistema industrial';
      newOutput.output = ['Generando blueprint técnico...'];
      setOutput(prev => [...prev, newOutput]);
      
      const imageUrl = await aetherisCore.synthesizeNeuralAsset(description, 'technical_blueprint');
      if (imageUrl) {
        newOutput.output = [
          'Blueprint generado exitosamente.',
          `Descripción: ${description}`,
          'URL: [imagen generada]',
        ];
      } else {
        newOutput.output = ['Error: No se pudo generar el blueprint'];
      }
    } else if (systemCommands[commandName]) {
      try {
        newOutput.output = await systemCommands[commandName](args);
      } catch (error) {
        newOutput.output = [`Error: ${error}`];
      }
    } else if (commandName) {
      newOutput.output = [`${commandName}: command not found`];
    }

    if (newOutput.output.length > 0) {
      setOutput(prev => [...prev, newOutput]);
    }
  };

  // Manejar entrada del teclado
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (command.trim()) {
        // Agregar al historial
        setHistory(prev => [...prev, command]);
        setHistoryIndex(-1);
        
        // Ejecutar comando
        executeCommand(command);
        setCommand('');
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(newIndex);
        setCommand(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(history[history.length - 1 - newIndex]);
      } else {
        setHistoryIndex(-1);
        setCommand('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Autocompletado simple
      const commands = Object.keys(systemCommands);
      const matches = commands.filter(cmd => cmd.startsWith(command));
      if (matches.length === 1) {
        setCommand(matches[0]);
      }
    }
  };

  // Auto-scroll al output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Focus en input cuando se hace clic en la terminal
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div 
      className="h-full flex flex-col bg-black text-phosphor font-mono text-sm cursor-text"
      onClick={handleTerminalClick}
    >
      {/* Output Area */}
      <div 
        ref={outputRef}
        className="flex-1 p-4 overflow-y-auto leading-relaxed"
        style={{ 
          fontFamily: 'JetBrains Mono, monospace',
          textShadow: '0 0 5px currentColor'
        }}
      >
        {output.map((cmd, index) => (
          <div key={index} className="mb-2">
            <div className="text-phosphor/70">
              <span className="text-phosphor/50">{currentPath}</span> $ {cmd.command}
            </div>
            {cmd.output.map((line, lineIndex) => (
              <div key={lineIndex} className="whitespace-pre-wrap">
                {line}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Input Line */}
      <div className="flex items-center p-4 border-t border-phosphor/20">
        <span className="text-phosphor/50 mr-2">
          {currentPath} $
        </span>
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-phosphor font-mono"
          style={{ 
            fontFamily: 'JetBrains Mono, monospace',
            textShadow: '0 0 5px currentColor'
          }}
          autoFocus
        />
        <span className="text-phosphor animate-pulse">█</span>
      </div>
    </div>
  );
};