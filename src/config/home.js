// Configuración del vídeo de fondo de la home (/).
// Mismas reglas de versión que el resto de vídeos: recodifica con
// scripts/encode-video.sh entrada.mov home <n> y sube el número aquí.
export const HOME_VIDEO_SRC = '/media/home-v1.mp4'
export const HOME_VIDEO_POSTER = '/media/home-poster-v1.jpg'

// Longitud del scroll en unidades de viewport (lvh). Sin imán (la home
// no imanta a ningún punto), así que esto solo controla la velocidad
// del scrubbing.
export const HOME_SCROLL_LENGTH_LVH = 300

// Fracción del progreso del vídeo en la que el portátil queda
// completamente abierto (medido a fotograma: ~8.9s de 10s = 0.89).
// Los botones de categoría se encienden en cuanto el scroll cruza
// este punto.
export const HOME_REVEAL_FROM = 0.84
