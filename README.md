# Websinmo — invitación cinemática con scroll-scrubbing

Web de una sola página estilo Apple para vender una casa: un vídeo vertical
ocupa el fondo y **el scroll controla el tiempo del vídeo** (scroll-scrubbing).
Encima aparecen y desaparecen escenas de texto sincronizadas con el progreso,
y al final botones de acción (WhatsApp / mapa / Instagram).

**Stack:** Vite + React + GSAP (ScrollTrigger) + Lenis. Sin backend.
Deploy en Vercel conectado a GitHub (rama = producción).

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
npm run preview  # sirve dist/
```

## Cambiar el vídeo

El vídeo **debe** recodificarse con la receta exacta del script (sin B-frames,
keyframes densos, 60fps interpolado, faststart) o el scrubbing falla en iOS:

```bash
./scripts/encode-video.sh mi-video.mov 2   # genera hero-v2.mp4 + hero-poster-v2.jpg
```

Luego apunta `VIDEO_SRC` y `VIDEO_POSTER` en `src/config/content.js` a la
nueva versión. **Versiona siempre el nombre** (`-v2`, `-v3`…) para evitar la
caché de Chrome.

## Personalizar contenido

Todo el contenido editable vive en `src/config/content.js`:

- `SCENES`: textos, estadísticas, y puntos `from`/`to`/`snap` (fracción 0→1
  del scroll) de cada escena.
- `LINKS`: URLs de WhatsApp, mapa e Instagram.
- `SCROLL_LENGTH_LVH`: longitud total del scroll (más = scrubbing más lento).

## Decisiones técnicas críticas (no tocar sin leer)

1. **Vídeo sin B-frames** (`-bf 0`) y keyframes cada 8 frames (`-g 8`):
   los B-frames provocan fotogramas negros al hacer seek en iOS Safari.
2. **Un único `<source>` mp4** — nada de webm/VP9: Chrome lo prefiere y sus
   alt-ref frames rompen el seeking igual que los B-frames.
3. **Poster como fondo CSS detrás del `<video>`** (`.video-poster`), no solo
   el atributo `poster`: iOS borra el poster al hacer seek y deja negro; la
   capa CSS nunca se borra.
4. **Priming del vídeo** con `play()+pause()` en el primer toque: iOS no
   permite scrubbing hasta que un gesto del usuario activa el vídeo.
5. **`svh`/`lvh` en vez de `vh`** + `ScrollTrigger.config({ ignoreMobileResize: true })`
   + `overscroll-behavior-y: none`: la barra de URL móvil no rompe el layout
   ni el scroll.
6. **Imán de scroll vía Lenis** (`src/lib/smoothScroll.js`), nunca el `snap`
   nativo de ScrollTrigger (se pelean). La parada se detecta por **posición**
   (ticks < 3px no cuentan), no por velocidad. Animación 0.25–0.5s con
   easeInOutCubic.
7. **Escritorio:** el vídeo vertical va en columna 9:16 centrada (letterbox)
   sobre el propio poster difuminado — no `object-fit: cover` a pantalla
   completa, que recorta demasiado.
8. **Deps de useEffect estables:** las rutas de media y las escenas son
   constantes de módulo (`src/config/content.js`).
9. **Iconos y previews:** `apple-touch-icon` 180px (iOS),
   `manifest.webmanifest` con 192/512 (Android), y OG/Twitter con imagen
   1200×630 (`/og-v1.jpg`) para la preview de WhatsApp.
