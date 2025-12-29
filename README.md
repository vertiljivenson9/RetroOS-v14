# RetroOS v18.0 - Mobile Web Edition

Sistema operativo web brutalista optimizado para dispositivos móviles. Diseñado como una aplicación de una sola página (SPA) sin dependencias de inteligencia artificial externas.

## 🚀 Características

- **Diseño móvil optimizado**: Interfaz touch-friendly con navegación inferior
- **Estética brutalista**: CRT scanlines, efectos de parpadeo y tipografía JetBrains Mono
- **Modo Dios**: Sistema de escalada de privilegios con tema rojo
- **Aplicaciones integradas**:
  - Terminal con comandos simulados
  - Explorador de archivos (modo sandbox)
  - Generador de blueprints (placeholders)
  - Configuración del sistema
- **Sin dependencias externas**: Funciona completamente offline
- **Peso ligero**: Sin librerías pesadas de IA

## 🛠️ Tecnologías

- React 19
- TypeScript
- Tailwind CSS
- Vite
- Sin Google Gemini SDK

## 📦 Instalación

```bash
# Clonar el repositorio
git clone [url-del-repo]
cd retroos

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# La aplicacion abrira en http://localhost:8080
```

## 🎮 Uso en Móvil

### Navegación
- **Terminal**: Acceso al shell del sistema
- **Archivos**: Explorador de archivos simulado
- **Vision**: Generador de blueprints
- **Config**: Configuración y estado del sistema

### Modo Dios (God Mode)
1. Ve a Configuración
2. Ingresa una API key válida de Google Gemini (opcional)
3. El sistema detectará la API key y activará el Modo Dios
4. La interfaz cambiará a color rojo con efectos mejorados

### Características Offline
- Todas las aplicaciones funcionan sin conexión a internet
- Las respuestas de "IA" son simuladas con mensajes predefinidos
- Los blueprints son SVGs generados localmente
- El estado se guarda en localStorage del navegador

## 🎨 Estilo visual

- **Colores principales**: Negro (#010101) y verde fósforo (#00ff41)
- **Modo Dios**: Rojo (#ff0000) con efectos de glitch
- **Tipografía**: JetBrains Mono
- **Efectos**: Scanlines CRT, parpadeo, sombras de texto
- **Diseño móvil**: Navegación inferior, botones táctiles grandes

## 🔧 Estructura del Proyecto

```
retroos/
├── src/
│   ├── services/          # Servicios del sistema
│   │   ├── aetherisCore.ts    # Nucleo del sistema (sin IA)
│   │   ├── kernelFS.ts        # Sistema de archivos sandbox
│   │   └── vertilApi.ts       # Bus de eventos
│   ├── App.tsx           # Componente principal
│   ├── main.tsx          # Punto de entrada
│   └── index.css         # Estilos globales
├── index.html            # HTML principal
├── package.json          # Dependencias
└── README.md            # Documentacion
```

## 📱 Optimizaciones Móviles

- **Touch-friendly**: Botones grandes y espaciado adecuado
- **Sin scroll horizontal**: Todo el contenido se adapta a la pantalla
- **Performance**: Sin librerías pesadas, carga rápida
- **Offline-first**: Funciona sin conexión a internet
- **Responsive**: Se adapta a diferentes tamaños de pantalla

## 🎛️ Comandos de Terminal

```bash
help          # Muestra la ayuda
status        # Estado del sistema (siempre offline)
info          # Informacion sobre el sistema
[texto libre] # Respuestas simuladas de IA
```

## 🔐 Sistema de Seguridad

- **Modo seguro**: Por defecto, todas las funciones están limitadas
- **Modo Dios**: Desbloquea temas visuales y mensajes especiales
- **Persistencia**: El estado se guarda en localStorage
- **Sin comunicación externa**: No hay llamadas a APIs

## 🚧 Desarrollo

```bash
# Construir para produccion
npm run build

# Vista previa de produccion
npm run preview
```

El build generará archivos estáticos en la carpeta `dist/` que pueden ser servidos desde cualquier servidor web.

## 📄 Diferencias con la Versión Original

| Característica | Versión Original | Versión Móvil |
|----------------|------------------|---------------|
| Google Gemini | ✅ Integrado | ❌ Eliminado |
| IA Real | ✅ Funcional | ❌ Simulada |
| File System API | ✅ Real | ❌ Simulado |
| Video Streaming | ✅ URL Obligatoria | ❌ Eliminado |
| Ventanas | ✅ Múltiples | ❌ Una sola vista |
| Tamaño | ~2MB+ | ~500KB |
| Offline | ❌ Requiere API key | ✅ 100% Offline |

## ⚠️ Notas

- Esta versión está diseñada específicamente para dispositivos móviles
- No requiere API keys ni conexión a internet
- Todas las funciones de IA son simulaciones
- El sistema de archivos es un sandbox en memoria
- Ideal para demostraciones o prototipos

## 🎯 Casos de Uso

- **Demostraciones**: Mostrar diseño brutalista sin dependencias
- **Prototipos**: Base para sistemas operativos web
- **Educación**: Aprender sobre interfaces alternativas
- **Arte Digital**: Experiencias visuales únicas
- **Offline Apps**: Aplicaciones que funcionan sin internet