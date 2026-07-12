import { useRef } from 'react'
import { Link } from 'react-router-dom'
import Vase3DViewer from '../components/Vase3DViewer.jsx'

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="12" height="12">
      <path d="M14 3h7v7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 3l-8 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 21H3v-7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 21l8-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Pantalla del monitor: el modelo 3D (Vase3DViewer) más un botón de
 * ampliar (a /3D, a pantalla completa) y los botones de zoom. El
 * rectángulo exterior ocupa el bounding box axis-aligned (left/top/
 * width/height de cornerPinStyle) sin inclinar, para que esos controles
 * queden rectos y legibles; la inclinación real de la pantalla
 * (transform matrix3d) se aplica solo al div interior que envuelve el
 * visor.
 */
export default function VaseScreenViewer({ src, style }) {
  const viewerRef = useRef(null)
  const { left, top, width, height, transform, transformOrigin } = style

  return (
    <div className="inmo-screen inmo-screen--vase" style={{ left, top, width, height }}>
      <div className="inmo-vase-tilt" style={{ transform, transformOrigin }}>
        <Vase3DViewer ref={viewerRef} src={src} isolateEvents />
      </div>

      <Link to="/3D" className="inmo-vase-expand" aria-label="Ver a pantalla completa">
        <ExpandIcon />
      </Link>

      <div className="inmo-vase-zoom">
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
