import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './ContactFallSection.css'

gsap.registerPlugin(ScrollTrigger)

const HEADING = 'Hablemos'
const FIELDS = [
  { name: 'nombre', label: 'Nombre', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
]

/**
 * Última sección de /inmobiliario, después del recorrido por los tres
 * monitores: una pantalla blanca normal (scroll de verdad, no paneo,
 * sin pin — la sección ocupa solo su altura natural, nada de recorrido
 * extra) con un formulario de contacto.
 *
 * La animación de entrada es independiente del scroll: se dispara una
 * sola vez, fluida, en cuanto la sección está ~75% visible, y a partir
 * de ahí corre sola por tiempo (no se controla arrastrando el scroll).
 *  1. El título entra letra a letra.
 *  2. Las cajas de los campos se asientan (el "suelo").
 *  3. Las etiquetas caen y aterrizan sobre su caja, con rebote final.
 */
export default function ContactFallSection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const letters = section.querySelectorAll('.fall-letter')
    const boxes = section.querySelectorAll('.fall-box')
    const labels = section.querySelectorAll('.fall-label')

    const ctx = gsap.context(() => {
      gsap.set(letters, { y: -40, opacity: 0, rotate: () => gsap.utils.random(-14, 14) })
      gsap.set(boxes, { y: 24, opacity: 0 })
      gsap.set(labels, { y: -170, opacity: 0, rotate: () => gsap.utils.random(-16, 16) })

      const tl = gsap.timeline({ paused: true })

      tl.to(letters, {
        y: 0,
        opacity: 1,
        rotate: 0,
        duration: 0.6,
        stagger: 0.04,
        ease: 'bounce.out',
      })
      tl.to(boxes, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }, 0.25)
      // Caída de las etiquetas, sin rebote todavía.
      tl.to(
        labels,
        { y: 0, opacity: 1, rotate: 0, duration: 0.7, stagger: 0.12, ease: 'power2.in' },
        0.55,
      )
      // Rebote de aterrizaje: un pequeño salto y el rebote final.
      tl.to(labels, { y: -14, duration: 0.13, ease: 'power2.out', stagger: 0.05 })
      tl.to(labels, { y: 0, duration: 0.6, ease: 'bounce.out', stagger: 0.05 }, '>-0.02')

      ScrollTrigger.create({
        trigger: section,
        start: 'top 25%', // ~75% de la sección ya visible
        once: true,
        onEnter: () => tl.play(),
      })
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
          {FIELDS.map((field) => (
            <div className="fall-field" key={field.name}>
              <span className="fall-label">{field.label}</span>
              <div className="fall-box">
                <input type={field.type} name={field.name} />
              </div>
            </div>
          ))}

          <div className="fall-field">
            <span className="fall-label">Mensaje</span>
            <div className="fall-box">
              <textarea name="mensaje" rows={4} />
            </div>
          </div>

          <div className="fall-box fall-box--button">
            <button type="submit">Enviar</button>
          </div>
        </form>
      </div>
    </section>
  )
}
