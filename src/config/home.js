// Configuración del vídeo de fondo de la home (/).
// Mismas reglas de versión que el resto de vídeos: recodifica con
// scripts/encode-video.sh entrada.mov home <n> y sube el número aquí.
export const HOME_VIDEO_SRC = '/media/home-v1.mp4'
export const HOME_VIDEO_POSTER = '/media/home-poster-v1.jpg'

// Longitud del scroll en unidades de viewport (lvh). Con solo dos
// puntos de imán (arriba/abajo) un recorrido corto deja casi todo el
// track dentro del radio de captura del imán (que es un radio fijo en
// píxeles de viewport, ver MAX_SNAP_DIST_VH en lib/smoothScroll.js):
// cualquier pausa saltaría directa a un extremo y el scrubbing del
// portátil abriéndose apenas se llegaría a ver. 500lvh deja ~70% del
// recorrido central libre de imán para que el scrub se sienta continuo.
export const HOME_SCROLL_LENGTH_LVH = 500

// Fracción del progreso del vídeo en la que el portátil queda
// completamente abierto (medido a fotograma: ~8.9s de 10s = 0.89).
// Los botones de categoría empiezan a aparecer justo antes de este
// punto y terminan de aparecer justo después.
export const HOME_REVEAL_FROM = 0.84
export const HOME_REVEAL_TO = 0.9
