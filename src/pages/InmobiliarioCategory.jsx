import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initSmoothScroll } from '../lib/smoothScroll.js'
import { CATEGORIES } from '../config/catalog.js'
import ProjectScreenVideo from './ProjectScreenVideo.jsx'
import { cornerPinStyle } from '../lib/cornerPin.js'
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
  // Medido por detección de bordes sobre la foto (transición
  // brillo->oscuro), no a ojo: el rectángulo anterior invadía un poco
  // el bisel y la pared por arriba.
  project: { x: 503, y: 240, w: 370, h: 195 },
}

const screenStyle = (s) => ({ left: s.x, top: s.y, width: s.w, height: s.h })

// Esquinas reales de la pantalla de contacto, medidas a mano sobre la
// foto (píxeles de la imagen fuente): el monitor está girado, así que
// no es un rectángulo recto sino un cuadrilátero. cornerPinStyle calcula
// la matrix3d que deforma el div plano del formulario hasta encajar
// exactamente en ese plano inclinado, en vez de superponerlo recto.
const CONTACT_CORNERS = {
  tl: [874, 204],
  tr: [1296, 181],
  br: [1325, 478],
  bl: [875, 458],
}
const contactScreenStyle = cornerPinStyle(CONTACT_CORNERS)

const STOP_CENTERS = [
  SCREENS.off.x + SCREENS.off.w / 2,
  SCREENS.project.x + SCREENS.project.w / 2,
  contactScreenStyle.left + contactScreenStyle.width / 2,
]

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
  const viewportRef = useRef(null)
  const project = CATEGORIES.find((c) => c.slug === 'inmobiliario')?.projects[0]

  useEffect(() => {
    const track = trackRef.current
    const canvas = canvasRef.current
    const viewportEl = viewportRef.current
    if (!track || !canvas || !viewportEl) return

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
    //
    // OJO: se mide el propio contenedor (clientWidth/Height), NO
    // window.innerWidth/innerHeight. En iOS Safari, innerHeight puede
    // reportar el "viewport grande" (barra de direcciones oculta)
    // mientras el contenedor está pintado a 100svh (viewport pequeño,
    // barra visible) — si se usa innerHeight para calcular la escala,
    // el canvas queda más grande de lo que cabe en el contenedor real
    // y la foto se desborda por los lados.
    const applyTransform = (progress) => {
      const vw = viewportEl.clientWidth
      const vh = viewportEl.clientHeight
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
    const { lenis, destroy } = initSmoothScroll(getSnapPoints)

    // Swipe horizontal en móvil: el gesto natural para "pasar de
    // pantalla" en un recorrido horizontal es arrastrar a los lados,
    // no solo hacia arriba/abajo. Traduce el arrastre horizontal a la
    // misma posición de scroll que ya mueve el paneo, así que el imán
    // y todo lo demás sigue funcionando igual sin duplicar lógica. Si
    // el toque empieza dentro de la pantalla del proyecto, esa ya
    // captura su propio touch (vídeo) y stopPropagation lo aísla de
    // aquí, así que no hay conflicto.
    const HORIZ_THRESHOLD = 8
    // El scroll nativo vertical tiene inercia (fling) que le da mucho
    // alcance por swipe; este mapeo es directo (sin inercia), así que
    // se amplifica para que un arrastre normal baste para cruzar el
    // radio de captura del imán y llegar a la siguiente pantalla.
    const HORIZ_SENSITIVITY = 6.75 // 4.5 + 50%
    let touchStartX = 0
    let touchStartY = 0
    let touchLastX = 0
    let horizDragging = null

    const onTouchStart = (e) => {
      const t = e.touches[0]
      touchStartX = touchLastX = t.clientX
      touchStartY = t.clientY
      horizDragging = null
    }
    const onTouchMove = (e) => {
      const t = e.touches[0]
      const dx = t.clientX - touchStartX
      const dy = t.clientY - touchStartY
      if (horizDragging === null && (Math.abs(dx) > HORIZ_THRESHOLD || Math.abs(dy) > HORIZ_THRESHOLD)) {
        horizDragging = Math.abs(dx) > Math.abs(dy)
      }
      if (horizDragging) {
        e.preventDefault()
        const stepX = touchLastX - t.clientX // arrastrar a la izquierda avanza
        touchLastX = t.clientX
        const max = document.documentElement.scrollHeight - window.innerHeight
        const next = Math.min(max, Math.max(0, lenis.scroll + stepX * HORIZ_SENSITIVITY))
        lenis.scrollTo(next, { immediate: true })
      }
    }
    viewportEl.addEventListener('touchstart', onTouchStart, { passive: true })
    viewportEl.addEventListener('touchmove', onTouchMove, { passive: false })

    const onResize = () => applyTransform(smoothed)
    window.addEventListener('resize', onResize)

    return () => {
      gsap.ticker.remove(onTick)
      window.removeEventListener('resize', onResize)
      viewportEl.removeEventListener('touchstart', onTouchStart)
      viewportEl.removeEventListener('touchmove', onTouchMove)
      st.kill()
      destroy()
    }
  }, [])

  return (
    <>
      <Link to="/" className="inmo-back">
        ← Proyectos
      </Link>

      <div className="inmo-viewport" ref={viewportRef}>
        <div className="inmo-canvas" ref={canvasRef}>
          <img
            className="inmo-photo"
            src="/img/monitors-v1.jpg"
            width={IMG_W}
            height={IMG_H}
            alt="Puesto de trabajo con tres monitores"
          />

          {project && (
            <ProjectScreenVideo project={project} style={screenStyle(SCREENS.project)} />
          )}

          <div className="inmo-screen inmo-screen--contact" style={contactScreenStyle}>
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
