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
 * monitores: una pantalla blanca normal (scroll de verdad, no paneo)
 * con un formulario de contacto. Animación de entrada ligada al propio
 * scroll (scrub, no a la carga de la página — si el usuario retrocede,
 * se deshace igual):
 *  1. El título entra letra a letra.
 *  2. Las cajas de los campos se asientan (son el "suelo").
 *  3. Las etiquetas con el nombre de cada campo caen desde arriba y
 *     aterrizan sobre su caja, con rebote — efecto de gravedad.
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
      gsap.set(labels, { y: -130, opacity: 0, rotate: () => gsap.utils.random(-16, 16) })

      // Todo el recorrido de entrada ocupa exactamente una altura de
      // viewport de scroll: empieza cuando la sección asoma por abajo y
      // termina justo cuando queda encuadrada arriba del todo.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'top top',
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
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out' },
        0.35,
      )
      // Las etiquetas caen y aterrizan sobre su caja después, como si la
      // gravedad tirara de ellas una vez el "suelo" ya está puesto.
      tl.to(
        labels,
        { y: 0, opacity: 1, rotate: 0, duration: 1.1, stagger: 0.15, ease: 'bounce.out' },
        0.75,
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
