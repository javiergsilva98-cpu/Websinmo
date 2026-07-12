import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initSmoothScroll } from '../lib/smoothScroll.js'
import { CATEGORIES } from '../config/catalog.js'
import './InmobiliarioCategory.css'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

// Tamaño natural de la foto y rectángulo de cada pantalla dentro de ella
// (medidos a mano sobre la imagen fuente). El orden es de izquierda a
// derecha tal cual aparecen en la foto.
const IMG_W = 1376
const IMG_H = 768
const SCREENS = {
  off: { x: 20, y: 200, w: 465, h: 252 },
  project: { x: 500, y: 207, w: 378, h: 244 },
  contact: { x: 893, y: 200, w: 462, h: 252 },
}
const STOP_CENTERS = [SCREENS.off, SCREENS.project, SCREENS.contact].map(
  (s) => s.x + s.w / 2,
)

const screenStyle = (s) => ({ left: s.x, top: s.y, width: s.w, height: s.h })

/**
 * /inmobiliario — recorrido horizontal por una foto fija de tres
 * monitores: el scroll (vertical, el gesto normal del usuario) mueve
 * la cámara de izquierda a derecha sobre la imagen ("scroll-scrubbing"
 * pero de paneo en vez de tiempo de vídeo). Tres paradas con imán:
 * pantalla apagada → proyecto → contacto.
 */
export default function InmobiliarioCategory() {
  const trackRef = useRef(null)
  const canvasRef = useRef(null)
  const project = CATEGORIES.find((c) => c.slug === 'inmobiliario')?.projects[0]

  useEffect(() => {
    const track = trackRef.current
    const canvas = canvasRef.current
    if (!track || !canvas) return

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)

    let targetProgress = 0
    let smoothed = 0

    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        targetProgress = self.progress
      },
    })

    // Encuadre: cubre el viewport por altura (o por ancho si la ventana
    // es más ancha que alta que la foto) y desplaza en X para centrar
    // la pantalla objetivo. Se recalcula cada frame porque depende del
    // tamaño de ventana en vivo (rota/resize).
    const applyTransform = (progress) => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const scale = Math.max(vh / IMG_H, vw / IMG_W)

      let cx
      if (progress <= 0.5) {
        const t = progress / 0.5
        cx = STOP_CENTERS[0] + (STOP_CENTERS[1] - STOP_CENTERS[0]) * t
      } else {
        const t = (progress - 0.5) / 0.5
        cx = STOP_CENTERS[1] + (STOP_CENTERS[2] - STOP_CENTERS[1]) * t
      }

      const scaledW = IMG_W * scale
      const scaledH = IMG_H * scale
      const minTx = vw - scaledW
      const tx = Math.min(0, Math.max(minTx, vw / 2 - cx * scale))
      const ty = Math.min(0, (vh - scaledH) / 2)

      gsap.set(canvas, { x: tx, y: ty, scale, transformOrigin: '0 0' })
    }

    const onTick = () => {
      smoothed += (targetProgress - smoothed) * 0.18
      applyTransform(smoothed)
    }
    gsap.ticker.add(onTick)

    // Tres paradas con imán: apagada / proyecto / contacto.
    const getSnapPoints = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max <= 0) return []
      return [0, max * 0.5, max]
    }
    const { destroy } = initSmoothScroll(getSnapPoints)

    const onResize = () => applyTransform(smoothed)
    window.addEventListener('resize', onResize)

    return () => {
      gsap.ticker.remove(onTick)
      window.removeEventListener('resize', onResize)
      st.kill()
      destroy()
    }
  }, [])

  return (
    <>
      <Link to="/" className="inmo-back">
        ← Proyectos
      </Link>

      <div className="inmo-viewport">
        <div className="inmo-canvas" ref={canvasRef}>
          <img
            className="inmo-photo"
            src="/img/monitors-v1.jpg"
            width={IMG_W}
            height={IMG_H}
            alt="Puesto de trabajo con tres monitores"
          />

          {project && (
            <Link
              to={`/inmobiliario/${project.slug}`}
              className="inmo-screen inmo-screen--project"
              style={screenStyle(SCREENS.project)}
            >
              <img src={project.thumbnail} alt={project.title} />
              <span className="inmo-screen-title">{project.title}</span>
            </Link>
          )}

          <div className="inmo-screen inmo-screen--contact" style={screenStyle(SCREENS.contact)}>
            <form className="inmo-contact-form" onSubmit={(e) => e.preventDefault()}>
              <p className="inmo-contact-title">Contacto</p>
              <input type="text" placeholder="Nombre" />
              <input type="email" placeholder="Email" />
              <textarea placeholder="Mensaje" rows={2} />
              <button type="submit">Enviar</button>
            </form>
          </div>
        </div>
      </div>

      {/* Track invisible: su altura define la longitud del recorrido */}
      <div ref={trackRef} className="scroll-track" style={{ height: '400lvh' }} />
    </>
  )
}
