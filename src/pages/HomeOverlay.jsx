import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CATEGORIES } from '../config/catalog.js'
import { HOME_REVEAL_FROM, HOME_REVEAL_TO } from '../config/home.js'
import '../styles/buttons.css'
import '../components/Scenes.css'
import './HomeOverlay.css'

/**
 * Overlay de la home: el logo (arriba, sobre la piedra) y los botones
 * de categoría (abajo) se funden de 0% a 80% de opacidad juntos, sin
 * desplazamiento, exactamente durante el tramo del vídeo en el que el
 * portátil se abre (ver HOME_REVEAL_FROM/TO en config/home.js) — es
 * una transición ligada al scroll, no una animación por tiempo: si el
 * usuario retrocede, se desvanecen igual. Van en elementos separados
 * (posiciones distintas en pantalla) pero comparten el mismo tween.
 */
export default function HomeOverlay({ trackRef }) {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    const track = trackRef.current
    if (!root || !track) return

    const logo = root.querySelector('.home-logo-wrap')
    const categories = root.querySelector('.home-categories')
    const targets = [logo, categories]

    const ctx = gsap.context(() => {
      gsap.set(targets, { autoAlpha: 0 })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: track,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      })

      tl.fromTo(
        targets,
        { autoAlpha: 0 },
        { autoAlpha: 0.8, duration: HOME_REVEAL_TO - HOME_REVEAL_FROM },
        HOME_REVEAL_FROM,
      )
      // Ancla el final del timeline en scroll=1: sin esto, la duración
      // total la marcaría el propio tween (que termina en HOME_REVEAL_TO)
      // y el progreso del scroll (0→1) se reescalaría sobre ese punto en
      // vez de sobre el recorrido completo.
      tl.to({}, { duration: 1 - HOME_REVEAL_TO })
    }, root)

    return () => ctx.revert()
  }, [trackRef])

  return (
    <div className="scenes" ref={rootRef}>
      <div className="home-logo-wrap">
        <img className="home-logo" src="/img/logo-v2.png" alt="Logo" />
      </div>

      <section className="scene scene--bottom home-categories">
        <div className="scene-inner">
          <div className="scene-actions">
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} className="btn btn--rect" to={`/${cat.slug}`}>
                {cat.title}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
