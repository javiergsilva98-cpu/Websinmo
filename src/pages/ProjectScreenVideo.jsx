import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'

/**
 * Pantalla de un monitor: un vídeo (sin ningún texto de la propia web
 * del proyecto, solo el vídeo) y scrubbable con el scroll — pero
 * únicamente mientras el puntero/dedo está sobre esta pantalla. El
 * wheel/touch se captura aquí (preventDefault + stopPropagation) para
 * que NUNCA llegue a mover el paneo de fondo entre monitores; en cuanto
 * el cursor sale de la pantalla, el scroll vuelve a controlar el
 * recorrido normal por la foto.
 *
 * Genérico: no todos los proyectos tienen página propia todavía — si no
 * se pasa `to`, la pantalla no navega a ningún sitio al tocarla, solo
 * reproduce.
 */
export default function ProjectScreenVideo({ videoSrc, poster, title, to, sensitivity = 0.014, style }) {
  const elRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    const el = elRef.current
    const video = videoRef.current
    if (!el || !video) return

    let duration = 0
    let targetTime = 0
    let smoothed = 0
    let primed = false

    const onMeta = () => {
      duration = video.duration || 0
    }
    video.addEventListener('loadedmetadata', onMeta)
    if (video.readyState >= 1) onMeta()

    // iOS bloquea currentTime hasta que el vídeo recibe un play() ligado
    // a un gesto del usuario: un play()+pause() silencioso lo desbloquea.
    const prime = () => {
      if (primed) return
      primed = true
      const p = video.play()
      if (p && p.then) {
        p.then(() => video.pause()).catch(() => {
          primed = false
        })
      }
    }

    const onWheel = (e) => {
      if (!duration) return
      e.preventDefault()
      e.stopPropagation()
      targetTime = Math.min(duration, Math.max(0, targetTime + e.deltaY * sensitivity))
    }

    // Táctil: distingue arrastre (scrub del vídeo) de toque simple
    // (navegar al proyecto). stopPropagation ya en touchstart para que
    // Lenis nunca llegue a iniciar su propio arrastre en esta zona.
    const DRAG_THRESHOLD = 6
    let touchStartY = 0
    let touchLastY = 0
    let dragging = false

    const onTouchStart = (e) => {
      e.stopPropagation()
      prime()
      touchStartY = touchLastY = e.touches[0].clientY
      dragging = false
    }
    const onTouchMove = (e) => {
      e.stopPropagation()
      const y = e.touches[0].clientY
      const delta = touchLastY - y
      touchLastY = y
      if (!dragging && Math.abs(y - touchStartY) > DRAG_THRESHOLD) dragging = true
      if (dragging && duration) {
        e.preventDefault()
        targetTime = Math.min(duration, Math.max(0, targetTime + delta * sensitivity * 3))
      }
    }
    const onTouchEnd = (e) => {
      e.stopPropagation()
      if (dragging) e.preventDefault() // no dispares la navegación al soltar un arrastre
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: false })
    el.addEventListener('pointerdown', prime)

    const onTick = () => {
      if (!duration) return
      smoothed += (targetTime - smoothed) * 0.25
      if (!video.seeking && Math.abs(video.currentTime - smoothed) > 1 / 60) {
        video.currentTime = smoothed
      }
    }
    gsap.ticker.add(onTick)

    return () => {
      gsap.ticker.remove(onTick)
      video.removeEventListener('loadedmetadata', onMeta)
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('pointerdown', prime)
    }
  }, [sensitivity])

  const content = (
    <>
      <div className="inmo-project-media">
        <div className="inmo-project-poster" style={{ backgroundImage: `url(${poster})` }} />
        <video
          ref={videoRef}
          className="inmo-project-video"
          src={videoSrc}
          poster={poster}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
        />
      </div>
      <span className="inmo-screen-title">{title}</span>
    </>
  )

  if (to) {
    return (
      <Link ref={elRef} to={to} className="inmo-screen inmo-screen--project" style={style}>
        {content}
      </Link>
    )
  }

  return (
    <div ref={elRef} className="inmo-screen inmo-screen--project" style={style}>
      {content}
    </div>
  )
}
