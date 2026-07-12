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
 * con un formulario de contacto. Animación de entrada en dos tramos:
 *
 *  1. Mientras la sección sube y queda encuadrada (1 altura de
 *     viewport, sin pin): el título entra letra a letra y las cajas de
 *     los campos se asientan (el "suelo").
 *  2. Ya con la sección fijada en pantalla (pin), un recorrido de scroll
 *     mucho más largo controla la caída lenta de las etiquetas de cada
 *     campo. Al llegar al final de ese recorrido, el último rebote de
 *     aterrizaje se dispara como animación por TIEMPO, no por scroll:
 *     se ve aunque el usuario ya se haya parado justo al llegar abajo.
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

      // Tramo 1: título + cajas, mientras la sección sube a su sitio.
      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'top top',
          scrub: true,
        },
      })
        .to(letters, {
          y: 0,
          opacity: 1,
          rotate: 0,
          duration: 1,
          stagger: 0.05,
          ease: 'bounce.out',
        })
        .to(boxes, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out' }, 0.3)

      // Rebote final de aterrizaje: por tiempo, no por scroll — se
      // dispara una sola vez al llegar al final y se rearma si el
      // usuario retrocede y vuelve a llegar.
      let bounced = false
      const landingBounce = gsap
        .timeline({ paused: true })
        .to(labels, { y: -14, duration: 0.13, ease: 'power2.out', stagger: 0.05 })
        .to(labels, { y: 0, duration: 0.65, ease: 'bounce.out', stagger: 0.05 }, '>-0.02')

      // Tramo 2: sección fijada (pin) durante un recorrido de scroll
      // mucho más largo (2.5 alturas de viewport) que controla, lenta y
      // deliberadamente, la caída de las etiquetas.
      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${window.innerHeight * 2.5}`,
          scrub: true,
          pin: true,
          onUpdate: (self) => {
            if (self.progress >= 1 && !bounced) {
              bounced = true
              landingBounce.restart()
            } else if (self.progress < 1) {
              bounced = false
            }
          },
        },
      }).to(labels, { y: 0, opacity: 1, rotate: 0, duration: 3, stagger: 0.5, ease: 'power1.in' })
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
