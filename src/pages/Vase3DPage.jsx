import { useRef } from 'react'
import { Link } from 'react-router-dom'
import Vase3DViewer from '../components/Vase3DViewer.jsx'
import { VASE_MODEL_SRC } from '../config/vase.js'
import './Vase3DPage.css'

/** /3D — el mismo modelo de la pantalla del monitor, a pantalla completa. */
export default function Vase3DPage() {
  const viewerRef = useRef(null)

  return (
    <div className="vase3d-page">
      <Link to="/inmobiliario" className="vase3d-page-back">
        ← Proyectos
      </Link>

      <Vase3DViewer ref={viewerRef} src={VASE_MODEL_SRC} />

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
