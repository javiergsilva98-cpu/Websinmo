// Configuración de /inmobiliario2 (solo la variante móvil): un vídeo de
// fondo de los dos monitores scroll-scrubbed, con tres pantallas
// superpuestas (Bernabéu, casa, visor 3D) que se funden una en otra a
// medida que la cámara del propio vídeo se acerca/aleja.
//
// Recodificado con scripts/encode-video.sh (mismas reglas que el resto:
// H.264 High, sin B-frames, keyframes densos) a partir del vídeo vertical
// aportado por el cliente.
import { VIDEO_SRC as CASA_VIDEO_SRC, VIDEO_POSTER as CASA_VIDEO_POSTER } from './content.js'

export const INMO2_BG_VIDEO_SRC = '/media/inmo2bg-v1.mp4'
export const INMO2_BG_VIDEO_POSTER = '/media/inmo2bg-poster-v1.jpg'
export const INMO2_VIDEO_W = 720
export const INMO2_VIDEO_H = 1280

// Reutiliza el vídeo de Bernabéu ya existente (el mismo que en
// /inmobiliario, la pantalla que aún no tiene proyecto propio).
export const BERNABEU_VIDEO_SRC = '/media/bernabeu-v1.mp4'
export const BERNABEU_VIDEO_POSTER = '/media/bernabeu-poster-v1.jpg'

// Las tres pantallas, cada una con:
//  - progressRange: tramo del scroll (0-1) donde es la protagonista.
//  - fade: cuánto dura la transición de entrada/salida (mismas unidades
//    de progreso), superpuesta con la pantalla vecina.
//  - keyframes: cuadrilátero (en píxeles nativos del vídeo, 720x1280) al
//    principio y al final de su propio tramo — entre medias se
//    interpola en línea recta, igual que STOP_CENTERS en
//    InmobiliarioCategory.jsx pero con un cuadrilátero completo en vez
//    de solo un centro X.
//
// Medidos a ojo sobre fotogramas extraídos del propio vídeo (a
// t=0.1/1.7/4.1/5.7/6.5/9.5s): las pantallas están apagadas (negras) en
// el vídeo, así que un pequeño error de precisión no se nota (no hay
// detalle de foto alrededor del borde que lo delate, a diferencia de la
// foto fija de /inmobiliario).
export const INMO2_SEGMENTS = [
  {
    id: 'bernabeu',
    kind: 'video',
    title: 'Santiago Bernabéu',
    videoSrc: BERNABEU_VIDEO_SRC,
    poster: BERNABEU_VIDEO_POSTER,
    progressRange: [0, 0.222],
    fade: 0.06,
    keyframes: [
      { p: 0, corners: { tl: [-40, 210], tr: [488, 248], br: [486, 760], bl: [-40, 800] } },
      { p: 0.222, corners: { tl: [-10, 225], tr: [368, 235], br: [366, 790], bl: [-10, 800] } },
    ],
  },
  {
    id: 'casa',
    kind: 'video',
    title: null, // sin título propio: es el proyecto principal (misma pantalla que /inmobiliario)
    videoSrc: CASA_VIDEO_SRC,
    poster: CASA_VIDEO_POSTER,
    progressRange: [0.181, 0.705],
    fade: 0.06,
    keyframes: [
      { p: 0.181, corners: { tl: [495, 255], tr: [730, 240], br: [730, 730], bl: [495, 745] } },
      { p: 0.705, corners: { tl: [128, 140], tr: [602, 118], br: [606, 872], bl: [132, 890] } },
    ],
  },
  {
    id: 'vase',
    kind: 'vase3d',
    title: null,
    progressRange: [0.665, 1],
    fade: 0.06,
    keyframes: [
      { p: 0.665, corners: { tl: [128, 140], tr: [602, 118], br: [606, 872], bl: [132, 890] } },
      { p: 1, corners: { tl: [-20, -20], tr: [740, -20], br: [740, 1300], bl: [-20, 1300] } },
    ],
  },
]
