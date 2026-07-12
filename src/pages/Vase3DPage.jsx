import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Vase3DViewer from '../components/Vase3DViewer.jsx'
import { cornerPinStyle } from '../lib/cornerPin.js'
import { VASE_MODEL_SRC, VASE_SCREEN_CORNERS } from '../config/vase.js'
import './Vase3DPage.css'

// Mismo corner-pin (matrix3d) que la pantalla embebida en /inmobiliario,
// no una simple proporción: la pantalla real está girada (más alta por
// la derecha que por la izquierda), así que el recuadro tiene que ser
// ese mismo cuadrilátero irregular, no un rectángulo con su proporción.
const screenStyle = cornerPinStyle(VASE_SCREEN_CORNERS)

/**
 * /3D — el mismo modelo de la pantalla del monitor, a pantalla completa.
 * El recuadro replica la forma real (irregular, no un rectángulo) y las
 * dimensiones de la pantalla del monitor, solo escalada uniformemente
 * (con JS, recalculado en resize) para aprovechar el viewport disponible
 * — el propio cuadrilátero es fijo en tamaño "de foto", igual que en la
 * pantalla embebida, y aquí se amplía sin deformarlo.
 */
export default function Vase3DPage() {
  const viewerRef = useRef(null)
  const frameRef = useRef(null)

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return

    const updateScale = () => {
      const targetW = window.innerWidth * 0.92
      const targetH = window.innerHeight * 0.85
      const scale = Math.min(targetW / screenStyle.width, targetH / screenStyle.height)
      frame.style.transform = `scale(${scale})`
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  return (
    <div className="vase3d-page">
      <Link to="/inmobiliario" className="vase3d-page-back">
        ← Proyectos
      </Link>

      <div
        className="vase3d-page-frame"
        ref={frameRef}
        style={{ width: screenStyle.width, height: screenStyle.height }}
      >
        <div
          className="vase3d-page-tilt"
          style={{ transform: screenStyle.transform, transformOrigin: screenStyle.transformOrigin }}
        >
          <Vase3DViewer ref={viewerRef} src={VASE_MODEL_SRC} />
        </div>
      </div>

      <div className="vase3d-page-zoom">
        <button type="button" aria-label="Acercar" onClick={() => viewerRef.current?.zoomIn()}>
          +
        </button>
        <button type="button" aria-label="Alejar" onClick={() => viewerRef.current?.zoomOut()}>
          −
        </button>
      </div>
    </div>
  )
}
