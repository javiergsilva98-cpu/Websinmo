import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CATEGORIES } from '../config/catalog.js'
import { HOME_REVEAL_FROM } from '../config/home.js'
import '../styles/buttons.css'
import '../components/Scenes.css'

gsap.registerPlugin(ScrollTrigger)

/**
 * Overlay de la home: los botones de categoría se encienden de golpe
 * (sin fundido ni desplazamiento) en la parte baja del viewport justo
 * cuando el portátil del vídeo queda completamente abierto (ver
 * HOME_REVEAL_FROM en config/home.js).
 */
export default function HomeOverlay({ trackRef }) {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    const track = trackRef.current
    if (!root || !track) return

    const categories = root.querySelector('.home-categories')

    const ctx = gsap.context(() => {
      gsap.set(categories, { autoAlpha: 0 })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: track,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      })

      // Sin fundido ni desplazamiento: se encienden de golpe en cuanto
      // el scroll cruza el punto de revelado.
      tl.set(categories, { autoAlpha: 1 }, HOME_REVEAL_FROM)
      // Ancla el final del timeline en scroll=1: sin esto, la duración
      // total la marcaría el único .set() de arriba (en 0.84) y el
      // progreso del scroll (0→1) se reescalaría sobre ese 0.84 en vez
      // de sobre el recorrido completo, adelantando el punto real de
      // revelado.
      tl.to({}, { duration: 1 - HOME_REVEAL_FROM })
    }, root)

    return () => ctx.revert()
  }, [trackRef])

  return (
    <div className="scenes" ref={rootRef}>
      <section className="scene scene--bottom home-categories">
        <div className="scene-inner">
          <div className="scene-actions">
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} className="btn" to={`/${cat.slug}`}>
                {cat.title}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
