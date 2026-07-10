import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { LINKS } from '../config/content.js'
import './Scenes.css'

gsap.registerPlugin(ScrollTrigger)

const FADE = 0.06 // fracción del scroll que dura cada fundido

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.1-.3 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  )
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2a3.8 3.8 0 0 1-.9 1.4c-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4a3.8 3.8 0 0 1-1.4-.9 3.8 3.8 0 0 1-.9-1.4c-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1Zm0 1.8c-3.1 0-3.5 0-4.8.1-1.1 0-1.7.2-2.1.4-.5.2-.9.4-1.2.8-.4.3-.6.7-.8 1.2-.2.4-.3 1-.4 2.1-.1 1.3-.1 1.7-.1 4.8s0 3.5.1 4.8c0 1.1.2 1.7.4 2.1.2.5.4.9.8 1.2.3.4.7.6 1.2.8.4.2 1 .3 2.1.4 1.3.1 1.7.1 4.8.1s3.5 0 4.8-.1c1.1 0 1.7-.2 2.1-.4.5-.2.9-.4 1.2-.8.4-.3.6-.7.8-1.2.2-.4.3-1 .4-2.1.1-1.3.1-1.7.1-4.8s0-3.5-.1-4.8c0-1.1-.2-1.7-.4-2.1a2 2 0 0 0-.8-1.2 2 2 0 0 0-1.2-.8c-.4-.2-1-.3-2.1-.4-1.3-.1-1.7-.1-4.8-.1Zm0 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Zm5.2-3.1a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z" />
    </svg>
  )
}

/**
 * Escenas de texto que aparecen/desaparecen sincronizadas con el scroll.
 * Una única timeline con scrub sobre el track; cada escena entra en
 * `from` y sale en `to` (la última se queda fija).
 */
export default function Scenes({ scenes, trackRef }) {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    const track = trackRef.current
    if (!root || !track) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: track,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      })

      scenes.forEach((scene, i) => {
        const el = root.querySelector(`[data-scene="${scene.id}"]`)
        if (!el) return
        const isFirst = i === 0
        const isLast = i === scenes.length - 1

        if (isFirst) {
          gsap.set(el, { autoAlpha: 1, y: 0 })
        } else {
          tl.fromTo(
            el,
            { autoAlpha: 0, y: 28 },
            { autoAlpha: 1, y: 0, duration: FADE },
            scene.from,
          )
        }
        if (!isLast) {
          tl.to(el, { autoAlpha: 0, y: -28, duration: FADE }, scene.to - FADE)
        }
      })
    }, root)

    return () => ctx.revert()
  }, [scenes, trackRef])

  return (
    <div className="scenes" ref={rootRef}>
      {scenes.map((scene) => (
        <section key={scene.id} className="scene" data-scene={scene.id}>
          <div className="scene-inner">
            {scene.kicker && <p className="scene-kicker">{scene.kicker}</p>}
            <h2 className="scene-title">{scene.title}</h2>
            {scene.body && <p className="scene-body">{scene.body}</p>}

            {scene.stats && (
              <ul className="scene-stats">
                {scene.stats.map((s) => (
                  <li key={s.label}>
                    <span className="stat-value">
                      {s.value}
                      {s.unit && <small>{s.unit}</small>}
                    </span>
                    <span className="stat-label">{s.label}</span>
                  </li>
                ))}
              </ul>
            )}

            {scene.actions && (
              <div className="scene-actions">
                <a className="btn btn-primary" href={LINKS.whatsapp} target="_blank" rel="noreferrer">
                  <WhatsAppIcon /> WhatsApp
                </a>
                <a className="btn" href={LINKS.map} target="_blank" rel="noreferrer">
                  <MapIcon /> Cómo llegar
                </a>
                <a className="btn" href={LINKS.instagram} target="_blank" rel="noreferrer">
                  <InstagramIcon /> Instagram
                </a>
              </div>
            )}

            {scene.hint && (
              <div className="scroll-hint">
                <span className="scroll-hint-dot" />
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  )
}
