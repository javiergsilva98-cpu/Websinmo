// Configuración del vídeo de fondo de la home (/).
// Mismas reglas de versión que el resto de vídeos: recodifica con
// scripts/encode-video.sh entrada.mov home <n> [recorte-inicio-seg] y
// sube el número aquí. v2 recorta los 2 primeros segundos (desierto
// estático antes de que la mano entre en plano) para no alargar el
// scroll con metraje sin movimiento.
export const HOME_VIDEO_SRC = '/media/home-v2.mp4'
export const HOME_VIDEO_POSTER = '/media/home-poster-v2.jpg'

// Longitud del scroll en unidades de viewport (lvh). Sin imán (la home
// no imanta a ningún punto), así que esto solo controla la velocidad
// del scrubbing.
export const HOME_SCROLL_LENGTH_LVH = 300

// Fracciones del progreso del vídeo (7.93s tras el recorte) entre las
// que el portátil se abre: la mano empieza a levantar la tapa a
// ~5.6s (0.70) y queda completamente abierto a ~6.8s (0.86). Los
// botones de categoría se funden de 0% a 80% de opacidad exactamente
// en ese tramo, en vez de aparecer de golpe.
export const HOME_REVEAL_FROM = 0.7
export const HOME_REVEAL_TO = 0.86
