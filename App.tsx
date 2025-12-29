import React, { useState, useEffect, useCallback } from 'react';
import { vertilAPI } from './services/vertilApi';
import { aetherisCore } from './services/aetherisCore';

// Componentes simplificados para movil
const MobileTerminal: React.FC = () => {
  const [output, setOutput] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const handleCommand = async (cmd: string) => {
    const response = await aetherisCore.executeNeuralInstruction(cmd);
    setOutput(prev => [...prev, `$ ${cmd}`, ...response.text.split('\n'), '']);
  };

  return (
    <div className="h-full flex flex-col bg-black text-phosphor font-mono text-sm p-4">
      <div className="flex-1 overflow-y-auto mb-4">
        {output.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">{line}</div>
        ))}
        <div className="flex items-center">
          <span className="text-phosphor/50">$ </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && input.trim()) {
                handleCommand(input);
                setInput('');
              }
            }}
            className="flex-1 bg-transparent border-none outline-none text-phosphor font-mono ml-2"
            placeholder="help"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};

const MobileFileExplorer: React.FC = () => {
  const [files] = useState([
    { name: 'system/', type: 'folder' },
    { name: 'apps/', type: 'folder' },
    { name: 'config.json', type: 'file' },
    { name: 'readme.txt', type: 'file' },
  ]);

  return (
    <div className="h-full bg-black p-4">
      <div className="space-y-2">
        {files.map((file, i) => (
          <div
            key={i}
            className="flex items-center space-x-3 p-3 border border-phosphor/20 hover:border-phosphor/50 transition-colors"
          >
            <span className="text-2xl">
              {file.type === 'folder' ? '📁' : '📄'}
            </span>
            <span className="text-phosphor font-mono text-sm">
              {file.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const MobileNeuralVision: React.FC = () => {
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const generateImage = async () => {
    const url = await aetherisCore.synthesizeNeuralAsset(description);
    setImageUrl(url);
  };

  return (
    <div className="h-full bg-black p-4">
      <div className="mb-4">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe el blueprint..."
          className="w-full h-20 bg-black border border-phosphor text-phosphor p-2 resize-none outline-none focus:border-phosphor"
        />
        <button
          onClick={generateImage}
          disabled={!description.trim()}
          className="w-full mt-2 bg-black border-2 border-phosphor text-phosphor py-2 active:border-phosphor/50"
        >
          GENERAR
        </button>
      </div>

      {imageUrl && (
        <div className="border border-phosphor/30 p-2">
          <img
            src={imageUrl}
            alt="Generated blueprint"
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

const MobileSettings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');

  const saveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    vertilAPI.notify('API key guardada', 'info');
  };

  return (
    <div className="h-full bg-black p-4 text-phosphor">
      <h2 className="text-lg font-bold mb-4">CONFIGURACION</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-phosphor/70 mb-2">
            Google Gemini API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Ingresa tu API key..."
            className="w-full bg-black border border-phosphor text-phosphor p-2 outline-none focus:border-phosphor"
          />
          <button
            onClick={saveApiKey}
            className="w-full mt-2 bg-black border-2 border-phosphor text-phosphor py-2"
          >
            GUARDAR
          </button>
        </div>

        <div className="border-t border-phosphor/20 pt-4">
          <h3 className="text-sm font-bold mb-2">INFO DEL SISTEMA</h3>
          <div className="space-y-1 text-xs">
            <div>Version: 18.0.0</div>
            <div>Modo: {aetherisCore.isGodMode() ? 'God Mode' : 'Seguro'}</div>
            <div>Neural: {aetherisCore.isOnline() ? 'Online' : 'Offline'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'terminal' | 'files' | 'vision' | 'settings'>('terminal');
  const [bootComplete, setBootComplete] = useState(false);

  useEffect(() => {
    // Verificar si hay API key guardada
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      // En una implementacion real, aqui se inicializaria Gemini
      console.log('API key encontrada');
    }

    // Verificar Modo Dios
    const godMode = localStorage.getItem('god_mode_enabled') === 'true';
    if (godMode) {
      aetherisCore.enableGodMode();
      vertilAPI.setGodMode(true);
    }

    setBootComplete(true);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'terminal':
        return <MobileTerminal />;
      case 'files':
        return <MobileFileExplorer />;
      case 'vision':
        return <MobileNeuralVision />;
      case 'settings':
        return <MobileSettings />;
      default:
        return <MobileTerminal />;
    }
  };

  // Animacion de arranque
  if (!bootComplete) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4 text-phosphor animate-pulse">
            RETROS v18.0
          </div>
          <div className="text-sm text-phosphor/70">
            Cargando subsistemas...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black text-phosphor font-mono overflow-hidden">
      {/* Fondo con efecto CRT */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }} />
        </div>
        <div className="scanline" />
      </div>

      {/* Contenido principal */}
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className={`
          flex items-center justify-between p-4 border-b
          ${aetherisCore.isGodMode() ? 'border-god-red/30' : 'border-phosphor/20'}
        `}>
          <div className="flex items-center space-x-2">
            <div className={`
              w-2 h-2 rounded-full
              ${aetherisCore.isGodMode() ? 'bg-god-red animate-pulse' : 'bg-phosphor'}
            `} />
            <span className="text-sm">
              RETROS v18.0
            </span>
          </div>
          
          <div className="text-xs text-phosphor/50">
            {aetherisCore.isGodMode() ? 'GOD MODE' : 'MOBILE'}
          </div>
        </div>

        {/* Vista actual */}
        <div className="flex-1 overflow-hidden">
          {renderView()}
        </div>

        {/* Navegacion inferior */}
        <div className={`
          flex border-t
          ${aetherisCore.isGodMode() ? 'border-god-red/30' : 'border-phosphor/20'}
        `}>
          {[
            { id: 'terminal', label: 'Terminal', icon: '>_', active: currentView === 'terminal' },
            { id: 'files', label: 'Archivos', icon: '[]', active: currentView === 'files' },
            { id: 'vision', label: 'Vision', icon: '◈', active: currentView === 'vision' },
            { id: 'settings', label: 'Config', icon: '⚙', active: currentView === 'settings' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id as any)}
              className={`
                flex-1 p-3 text-center transition-colors
                ${tab.active 
                  ? (aetherisCore.isGodMode() ? 'bg-god-red/10 text-god-red' : 'bg-phosphor/10 text-phosphor') 
                  : 'text-phosphor/50 hover:text-phosphor'
                }
              `}
            >
              <div className="text-lg mb-1">{tab.icon}</div>
              <div className="text-xs">{tab.label}</div>
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scanline::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 65, 0.03) 2px,
            rgba(0, 255, 65, 0.03) 4px
          );
          pointer-events: none;
          animation: scanline 8s linear infinite;
        }

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
};

export default App;