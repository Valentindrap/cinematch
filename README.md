# Cinematch

Una aplicación web para encontrar películas en común con tus amigos de Letterboxd.

## 🎬 Características

- 🎯 Compara watchlists de múltiples usuarios
- 📊 Dashboard de estadísticas con gráficos
- 🏆 Sistema de logros gamificado
- 🎨 4 temas visuales (Default, Dark, Retro, Neon)
- 🎬 Detalles enriquecidos con TMDB (sinopsis, director, trailer)
- 🔊 Efectos de sonido
- 📤 Compartir en redes sociales
- ⌨️ Atajos de teclado
- 📱 PWA instalable
- 🎲 Ruleta para elegir qué película ver

## 🚀 Instalación Local

```bash
# Instalar dependencias
npm install

# Iniciar proxy CORS (terminal 1)
npx local-cors-proxy --proxyUrl https://letterboxd.com

# Iniciar app (terminal 2)
npm run dev
```

La app estará en `http://localhost:5173`

## 📦 Deploy en Vercel

1. Sube el proyecto a GitHub
2. Conecta con Vercel en [vercel.com](https://vercel.com)
3. Importa el repositorio
4. ¡Deploy automático!

La función serverless en `/api/proxy.js` maneja el CORS en producción.

## 🛠️ Tecnologías

- React 19
- Vite
- Zustand (state management)
- Recharts (gráficos)
- Framer Motion (animaciones)
- TMDB API
- Letterboxd (scraping)

## ⌨️ Atajos de Teclado

- `Espacio` - Girar ruleta
- `R` - Nueva búsqueda
- `S` - Ver estadísticas
- `A` - Toggle logros
- `M` - Toggle sonido
- `Esc` - Cerrar modales

## 📝 Licencia

MIT

## 🎯 Autor

Valentin Drapanti
