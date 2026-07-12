import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CATEGORIES } from '../config/catalog.js'
import { HOME_REVEAL_FROM, HOME_REVEAL_TO } from '../config/home.js'
import '../styles/buttons.css'
import '../components/Scenes.css'

gsap.registerPlugin(ScrollTrigger)

/**
 * Overlay de la home: un texto de bienvenida que se desvanece al
 * empezar a hacer scroll, y los botones de categoría que aparecen en
 * la parte baja del viewport justo cuando el portátil del vídeo queda
 * completamente abierto (ver HOME_REVEAL_FROM/TO en config/home.js).
 */
export default function HomeOverlay({ trackRef }) {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    const track = trackRef.current
    if (!root || !track) return

    const intro = root.querySelector('.home-intro')
    const categories = root.querySelector('.home-categories')

    const ctx = gsap.context(() => {
      gsap.set(intro, { autoAlpha: 1, y: 0 })
      gsap.set(categories, { autoAlpha: 0, y: 28 })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: track,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      })

      tl.to(intro, { autoAlpha: 0, y: -28, duration: 0.12 }, 0.06)
      tl.fromTo(
        categories,
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: HOME_REVEAL_TO - HOME_REVEAL_FROM },
        HOME_REVEAL_FROM,
      )
    }, root)

    return () => ctx.revert()
  }, [trackRef])

  return (
    <div className="scenes" ref={rootRef}>
      <section className="scene home-intro">
        <div className="scene-inner">
          <div className="scene-text">
            <p className="scene-kicker">Proyectos</p>
            <h1 className="scene-title">Selecciona una categoría</h1>
          </div>
          <div className="scroll-hint">
            <span className="scroll-hint-dot" />
          </div>
        </div>
      </section>

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
