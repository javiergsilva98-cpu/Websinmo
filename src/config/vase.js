// Modelo 3D compartido entre la pantalla embebida en /inmobiliario y la
// vista a pantalla completa en /3D.
export const VASE_MODEL_SRC = '/models/vase-v1.glb'

// Esquinas reales de la pantalla del monitor donde vive el jarrón, por
// ajuste de recta (mínimos cuadrados) a cada uno de los 4 bordes por
// separado sobre zonas limpias de la foto (píxeles de la imagen fuente,
// 1376x768). No es un rectángulo: el monitor está girado, notablemente
// más alto por la derecha que por la izquierda. Se comparte aquí para
// que /3D pueda replicar exactamente esta misma forma irregular, no solo
// su proporción ancho/alto.
export const VASE_SCREEN_CORNERS = {
  tl: [878, 231],
  tr: [1351, 194],
  br: [1344, 472],
  bl: [875, 457],
}
