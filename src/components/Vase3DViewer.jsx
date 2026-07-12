import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

// Radio inicial de la cámara como % del encuadre automático: >100% aleja
// la cámara (modelo más pequeño dentro del encuadre).
const INITIAL_RADIUS = '135%'
// Límites nativos de min/max-camera-orbit, solo como red de seguridad
// amplia para la rueda/pellizco (sus porcentajes no son fiables como
// límite exacto: en pruebas, "auto auto 55%" no acotaba donde cabría
// esperar). El límite real y predecible de zoomIn/zoomOut se calcula en
// JS a partir del radio inicial ya renderizado.
const NATIVE_MIN_RADIUS = '20%'
const NATIVE_MAX_RADIUS = '500%'
const BUTTON_MIN_FACTOR = 0.4
const BUTTON_MAX_FACTOR = 2.2
const ZOOM_STEP = 1.2

/**
 * Núcleo del visor 3D (arrastrar para orbitar, rueda/pellizco o
 * zoomIn()/zoomOut() por ref para zoom), sin botones propios: cada
 * pantalla que lo usa (la del monitor, inclinada, o la de /3D, a
 * pantalla completa) pinta sus propios controles donde tenga sentido,
 * ya que en la pantalla inclinada los botones deben quedar rectos y NO
 * pueden vivir dentro del div con la matrix3d.
 *
 * isolateEvents aísla wheel/touch (stopPropagation) para que interactuar
 * con el modelo no mueva ningún scroll/paneo de la página que lo aloja;
 * solo hace falta cuando está embebido dentro de otra página con su
 * propio scroll (la pantalla del monitor), no en la vista a pantalla
 * completa donde no hay nada más que controlar.
 */
const Vase3DViewer = forwardRef(function Vase3DViewer({ src, isolateEvents = false }, ref) {
  const wrapRef = useRef(null)
  const mvRef = useRef(null)
  const baseRadiusRef = useRef(null)

  useEffect(() => {
    // @google/model-viewer empaqueta su propio Three.js (~300kB gzip):
    // se carga solo cuando este visor se monta, para no añadir ese peso
    // a las páginas que nunca lo usan.
    import('@google/model-viewer')
  }, [])

  useEffect(() => {
    if (!isolateEvents) return
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
  }, [isolateEvents])

  useEffect(() => {
    const mv = mvRef.current
    if (!mv) return
    // El radio inicial real (ya aplicado INITIAL_RADIUS) es la base
    // sobre la que se calculan los límites de zoomIn/zoomOut.
    const onLoad = () => {
      baseRadiusRef.current = mv.getCameraOrbit().radius
    }
    mv.addEventListener('load', onLoad)
    return () => mv.removeEventListener('load', onLoad)
  }, [])

  const zoomBy = (factor) => {
    const mv = mvRef.current
    if (!mv) return
    const { theta, phi, radius } = mv.getCameraOrbit()
    const base = baseRadiusRef.current ?? radius
    const next = Math.min(base * BUTTON_MAX_FACTOR, Math.max(base * BUTTON_MIN_FACTOR, radius * factor))
    mv.cameraOrbit = `${theta}rad ${phi}rad ${next}m`
  }

  useImperativeHandle(ref, () => ({
    zoomIn: () => zoomBy(1 / ZOOM_STEP),
    zoomOut: () => zoomBy(ZOOM_STEP),
  }))

  return (
    <div ref={wrapRef} style={{ width: '100%', height: '100%' }}>
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
  )
})

export default Vase3DViewer
