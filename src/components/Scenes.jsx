import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { LINKS } from '../config/content.js'
import './Scenes.css'

gsap.registerPlugin(ScrollTrigger)

const FADE = 0.04 // fracción del scroll que dura cada fundido

function GalleryIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M4 4h13v13H4V4Zm2 2v9h9V6H6Zm5 9.5V20H7v-2h2v-1.5h2ZM20 7v13H7v-2h11V7h2Z" />
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
        const layout = scene.layout || {}
        const anim = layout.anim || 'fade'
        const figures = el.querySelectorAll('.scene-figure')

        // Entrada/salida del contenedor. El hero entra sin deriva vertical:
        // su protagonismo lo lleva el reveal de clip-path.
        const drift = anim === 'clip' ? 0 : 28
        if (isFirst) {
          gsap.set(el, { autoAlpha: 1, y: 0 })
        } else {
          tl.fromTo(
            el,
            { autoAlpha: 0, y: drift },
            { autoAlpha: 1, y: 0, duration: FADE },
            scene.from,
          )
        }
        if (!isLast) {
          tl.to(el, { autoAlpha: 0, y: -drift, duration: FADE }, scene.to - FADE)
        }

        // Entrada propia de cada fotografía: tres familias de efecto
        // (reveal con clip-path, zoom lento, slide lateral) repartidas
        // entre secciones para romper la monotonía.
        if (anim === 'clip' && figures[0]) {
          // El reveal completa justo antes del punto de imán (snap):
          // en reposo la foto ya está a sangre, sin borde visible.
          const clipDur = Math.max(0.02, (scene.snap ?? scene.from) - scene.from - 0.008)
          tl.fromTo(
            figures[0],
            { clipPath: 'inset(14% 9% 14% 9% round 22px)' },
            { clipPath: 'inset(0% 0% 0% 0% round 16px)', duration: clipDur },
            scene.from,
          )
          tl.fromTo(
            figures[0].querySelector('img'),
            { scale: 1.12 },
            { scale: 1, duration: clipDur * 1.5 },
            scene.from,
          )
        } else if (anim === 'zoom' && figures[0]) {
          tl.fromTo(
            figures[0].querySelector('img'),
            { scale: 1.16 },
            { scale: 1, duration: FADE * 1.4 },
            scene.from,
          )
        } else if (anim === 'slide' && figures.length) {
          const base = layout.slideFrom === 'right' ? 64 : -64
          figures.forEach((fig, k) => {
            tl.fromTo(
              fig,
              { x: k === 0 ? base : -base, autoAlpha: k === 0 ? 1 : 0 },
              { x: 0, autoAlpha: 1, duration: FADE },
              scene.from + k * 0.01,
            )
          })
        }
      })
    }, root)

    return () => ctx.revert()
  }, [scenes, trackRef])

  return (
    <div className="scenes" ref={rootRef}>
      {scenes.map((scene) => {
        const layout = scene.layout || {}
        const variant = layout.variant || 'plain'
        const kicker = scene.kicker && !layout.hideKicker && (
          <p className="scene-kicker">{scene.kicker}</p>
        )
        const body = scene.body && !layout.hideBody && (
          <p className="scene-body">{scene.body}</p>
        )
        const img = (image, eager = false) => (
          <img
            src={image.src}
            alt={image.alt}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
          />
        )
        return (
        <section
          key={scene.id}
          className={`scene${scene.image ? ' scene--media' : ''} scene--${variant}`}
          data-scene={scene.id}
        >
          <div className="scene-inner">
            {variant === 'duo' && (
              <div className="duo">
                <figure className="scene-figure duo-main">{img(scene.image)}</figure>
                <figure className="scene-figure duo-detail">{img(scene.detail)}</figure>
              </div>
            )}
            {scene.image && variant !== 'duo' && (
              <figure className="scene-figure">{img(scene.image, variant === 'hero')}</figure>
            )}
            <div className="scene-text">
              {kicker}
              <h2 className="scene-title">{scene.title}</h2>
              {body}

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
            </div>

            {scene.actions && (
              <div className="scene-actions">
                <a className="btn btn-primary" href={LINKS.otherProjects} target="_blank" rel="noreferrer">
                  <GalleryIcon /> Ver otros proyectos
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
        )
      })}
    </div>
  )
}
