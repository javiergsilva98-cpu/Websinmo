import { useEffect, useRef } from 'react'

// Radio inicial de la cámara como % del encuadre automático: >100% aleja
// la cámara (modelo más pequeño dentro de la pantalla).
const INITIAL_RADIUS = '135%'
// Límites nativos de min/max-camera-orbit, solo como red de seguridad
// amplia para la rueda/pellizco (sus porcentajes no son fiables como
// límite exacto: en pruebas, "auto auto 55%" no acotaba donde cabría
// esperar). El límite real y predecible de los botones +/- se calcula
// en JS a partir del radio inicial ya renderizado, ver zoomBy.
const NATIVE_MIN_RADIUS = '20%'
const NATIVE_MAX_RADIUS = '500%'
const BUTTON_MIN_FACTOR = 0.4 // los botones no acercan más allá del 40% del radio inicial
const BUTTON_MAX_FACTOR = 2.2 // ni alejan más allá del 220%
const ZOOM_STEP = 1.2 // factor de acercamiento/alejamiento por click

/**
 * Pantalla del monitor: un modelo 3D interactivo (arrastrar para
 * orbitar, rueda/pellizco o los botones +/- para zoom) sobre fondo
 * negro, en vez de contenido plano. <model-viewer> ya trae sus propios
 * controles de cámara táctiles/de ratón; aquí solo se aísla el
 * wheel/touch (igual que en las pantallas de vídeo) para que interactuar
 * con el modelo nunca mueva el paneo de fondo entre monitores.
 *
 * El div exterior ocupa el rectángulo axis-aligned (left/top/width/height
 * de cornerPinStyle) sin inclinar, para que los botones de zoom queden
 * rectos y legibles; la inclinación real de la pantalla (transform
 * matrix3d) se aplica solo al div interior que envuelve el modelo.
 */
export default function VaseScreenViewer({ src, style }) {
  const wrapRef = useRef(null)
  const mvRef = useRef(null)
  const baseRadiusRef = useRef(null)

  useEffect(() => {
    // @google/model-viewer empaqueta su propio Three.js (~300kB gzip):
    // se carga solo cuando esta pantalla se monta, para no añadir ese
    // peso a las demás páginas (home, casa, varios) que nunca lo usan.
    import('@google/model-viewer')
  }, [])

  useEffect(() => {
    const mv = mvRef.current
    if (!mv) return
    // El radio inicial real (ya aplicado INITIAL_RADIUS) es la base sobre
    // la que se calculan los límites de los botones +/-.
    const onLoad = () => {
      baseRadiusRef.current = mv.getCameraOrbit().radius
    }
    mv.addEventListener('load', onLoad)
    return () => mv.removeEventListener('load', onLoad)
  }, [])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const stop = (e) => e.stopPropagation()
    el.addEventListener('wheel', stop, { passive: true })
    el.addEventListener('touchstart', stop, { passive: true })
    el.addEventListener('touchmove', stop, { passive: true })

    return () => {
      el.removeEventListener('wheel', stop)
      el.removeEventListener('touchstart', stop)
      el.removeEventListener('touchmove', stop)
    }
  }, [])

  const zoomBy = (factor) => {
    const mv = mvRef.current
    if (!mv) return
    const { theta, phi, radius } = mv.getCameraOrbit()
    const base = baseRadiusRef.current ?? radius
    const next = Math.min(base * BUTTON_MAX_FACTOR, Math.max(base * BUTTON_MIN_FACTOR, radius * factor))
    mv.cameraOrbit = `${theta}rad ${phi}rad ${next}m`
  }

  const { left, top, width, height, transform, transformOrigin } = style

  return (
    <div ref={wrapRef} className="inmo-screen inmo-screen--vase" style={{ left, top, width, height }}>
      <div className="inmo-vase-tilt" style={{ transform, transformOrigin }}>
        {/* eslint-disable-next-line react/no-unknown-property */}
        <model-viewer
          ref={mvRef}
          src={src}
          camera-controls
          touch-action="none"
          interaction-prompt="none"
          shadow-intensity="0"
          exposure="1"
          camera-orbit={`0deg 75deg ${INITIAL_RADIUS}`}
          min-camera-orbit={`auto auto ${NATIVE_MIN_RADIUS}`}
          max-camera-orbit={`auto auto ${NATIVE_MAX_RADIUS}`}
          style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
        />
      </div>

      <div className="inmo-vase-zoom">
        <button type="button" aria-label="Acercar" onClick={() => zoomBy(1 / ZOOM_STEP)}>
          +
        </button>
        <button type="button" aria-label="Alejar" onClick={() => zoomBy(ZOOM_STEP)}>
          −
        </button>
      </div>
    </div>
  )
}
