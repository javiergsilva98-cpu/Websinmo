// Deforma un rectángulo plano (un div normal) hasta encajar exactamente
// en un cuadrilátero arbitrario — aquí, las 4 esquinas de la pantalla
// del monitor tal y como aparecen en la foto (con su inclinación y
// perspectiva reales), en vez de superponer un rectángulo recto encima
// de una pantalla que en la imagen no es un rectángulo recto.
//
// Es el algoritmo clásico de "corner pin" 2D→proyectivo: se busca la
// única transformación proyectiva que envía las 4 esquinas del div
// (0,0)-(w,0)-(w,h)-(0,h) a las 4 esquinas destino, y se empaqueta como
// una matrix3d de CSS.

function adjugate(m) {
  return [
    m[4] * m[8] - m[5] * m[7],
    m[2] * m[7] - m[1] * m[8],
    m[1] * m[5] - m[2] * m[4],
    m[5] * m[6] - m[3] * m[8],
    m[0] * m[8] - m[2] * m[6],
    m[2] * m[3] - m[0] * m[5],
    m[3] * m[7] - m[4] * m[6],
    m[1] * m[6] - m[0] * m[7],
    m[0] * m[4] - m[1] * m[3],
  ]
}

function multiplyMat(a, b) {
  const c = new Array(9)
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let sum = 0
      for (let k = 0; k < 3; k++) sum += a[i * 3 + k] * b[k * 3 + j]
      c[i * 3 + j] = sum
    }
  }
  return c
}

function multiplyVec(m, v) {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ]
}

function basisToPoints(x1, y1, x2, y2, x3, y3, x4, y4) {
  const m = [x1, x2, x3, y1, y2, y3, 1, 1, 1]
  const v = multiplyVec(adjugate(m), [x4, y4, 1])
  return multiplyMat(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]])
}

function general2DProjection(src, dst) {
  const s = basisToPoints(src[0][0], src[0][1], src[1][0], src[1][1], src[2][0], src[2][1], src[3][0], src[3][1])
  const d = basisToPoints(dst[0][0], dst[0][1], dst[1][0], dst[1][1], dst[2][0], dst[2][1], dst[3][0], dst[3][1])
  return multiplyMat(d, adjugate(s))
}

/**
 * Acerca las 4 esquinas hacia su propio centro un `factor` (1 = igual,
 * 0.9 = 10% más pequeño): sigue siendo el mismo cuadrilátero (mismo
 * plano, mismos ángulos), solo más pequeño, dejando un pequeño marco de
 * la pantalla real visible alrededor del contenido.
 */
export function shrinkCorners({ tl, tr, br, bl }, factor) {
  const cx = (tl[0] + tr[0] + br[0] + bl[0]) / 4
  const cy = (tl[1] + tr[1] + br[1] + bl[1]) / 4
  const shrink = ([x, y]) => [cx + (x - cx) * factor, cy + (y - cy) * factor]
  return { tl: shrink(tl), tr: shrink(tr), br: shrink(br), bl: shrink(bl) }
}

/**
 * corners: { tl, tr, br, bl } — cada una [x, y] en el mismo espacio de
 * coordenadas que el resto de la escena (píxeles de la foto fuente).
 *
 * Devuelve el left/top/width/height del bounding box axis-aligned (para
 * posicionar el div como siempre) más una transform matrix3d que, desde
 * ese rectángulo recto, lo inclina hasta encajar en las 4 esquinas
 * reales — el mismo plano que la pantalla fotografiada.
 */
export function cornerPinStyle({ tl, tr, br, bl }) {
  const left = Math.min(tl[0], tr[0], br[0], bl[0])
  const top = Math.min(tl[1], tr[1], br[1], bl[1])
  const width = Math.max(tl[0], tr[0], br[0], bl[0]) - left
  const height = Math.max(tl[1], tr[1], br[1], bl[1]) - top

  const src = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ]
  const dst = [
    [tl[0] - left, tl[1] - top],
    [tr[0] - left, tr[1] - top],
    [br[0] - left, br[1] - top],
    [bl[0] - left, bl[1] - top],
  ]

  const m = general2DProjection(src, dst)
  const t = m.map((v) => v / m[8])
  const matrix3d = [t[0], t[3], 0, t[6], t[1], t[4], 0, t[7], 0, 0, 1, 0, t[2], t[5], 0, t[8]]

  return {
    left,
    top,
    width,
    height,
    transform: `matrix3d(${matrix3d.join(',')})`,
    transformOrigin: '0 0',
  }
}
