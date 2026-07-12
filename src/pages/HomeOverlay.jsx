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
 * Overlay de la home: los botones de categoría aparecen en la parte
 * baja del viewport justo cuando el portátil del vídeo queda
 * completamente abierto (ver HOME_REVEAL_FROM/TO en config/home.js).
 */
export default function HomeOverlay({ trackRef }) {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    const track = trackRef.current
    if (!root || !track) return

    const categories = root.querySelector('.home-categories')

    const ctx = gsap.context(() => {
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
