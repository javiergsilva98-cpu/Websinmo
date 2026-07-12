import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './ContactFallSection.css'

gsap.registerPlugin(ScrollTrigger)

const HEADING = 'Hablemos'

/**
 * Última sección de /inmobiliario, después del recorrido por los tres
 * monitores: una pantalla blanca normal (scroll de verdad, no paneo)
 * con un formulario de contacto. El título (letra a letra) y los campos
 * (caja a caja) entran cayendo desde arriba, como piezas sueltas que
 * aterrizan al llegar aquí — animación ligada al propio scroll (scrub),
 * no a la carga de la página: si el usuario retrocede, se deshace igual.
 */
export default function ContactFallSection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const letters = section.querySelectorAll('.fall-letter')
    const boxes = section.querySelectorAll('.fall-box')

    const ctx = gsap.context(() => {
      gsap.set(letters, { y: -40, opacity: 0, rotate: () => gsap.utils.random(-14, 14) })
      gsap.set(boxes, { y: -80, opacity: 0, rotate: () => gsap.utils.random(-5, 5) })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'top 20%',
          scrub: true,
        },
      })

      tl.to(letters, {
        y: 0,
        opacity: 1,
        rotate: 0,
        duration: 1,
        stagger: 0.05,
        ease: 'bounce.out',
      })
      tl.to(
        boxes,
        {
          y: 0,
          opacity: 1,
          rotate: 0,
          duration: 1,
          stagger: 0.12,
          ease: 'bounce.out',
        },
        0.3,
      )
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className="fall-section" ref={sectionRef}>
      <div className="fall-inner">
        <h2 className="fall-heading">
          {HEADING.split('').map((ch, i) => (
            <span className="fall-letter" key={i}>
              {ch}
            </span>
          ))}
        </h2>

        <form className="fall-form" onSubmit={(e) => e.preventDefault()}>
          <div className="fall-box">
            <input type="text" placeholder="Nombre" />
          </div>
          <div className="fall-box">
            <input type="email" placeholder="Email" />
          </div>
          <div className="fall-box">
            <textarea placeholder="Mensaje" rows={4} />
          </div>
          <div className="fall-box fall-box--button">
            <button type="submit">Enviar</button>
          </div>
        </form>
      </div>
    </section>
  )
}
