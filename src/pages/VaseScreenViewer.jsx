import { useEffect, useRef } from 'react'

/**
 * Pantalla del monitor: un modelo 3D interactivo (arrastrar para
 * orbitar, pellizcar/rueda para zoom) sobre fondo negro, en vez de
 * contenido plano. <model-viewer> ya trae sus propios controles de
 * cámara táctiles/de ratón; aquí solo se aísla el wheel/touch (igual
 * que en las pantallas de vídeo) para que interactuar con el modelo
 * nunca mueva el paneo de fondo entre monitores.
 */
export default function VaseScreenViewer({ src, style }) {
  const wrapRef = useRef(null)

  useEffect(() => {
    // @google/model-viewer empaqueta su propio Three.js (~300kB gzip):
    // se carga solo cuando esta pantalla se monta, para no añadir ese
    // peso a las demás páginas (home, casa, varios) que nunca lo usan.
    import('@google/model-viewer')
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

  return (
    <div ref={wrapRef} className="inmo-screen inmo-screen--vase" style={style}>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <model-viewer
        src={src}
        camera-controls
        touch-action="none"
        interaction-prompt="none"
        shadow-intensity="0"
        exposure="1"
        style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
      />
    </div>
  )
}
