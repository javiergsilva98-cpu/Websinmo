import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { VIDEO_SRC, VIDEO_POSTER } from '../config/content.js'

/**
 * Pantalla del monitor central: el vídeo real de la casa (sin ningún
 * texto de la propia web del proyecto, solo el vídeo) y scrubbable
 * con el scroll — pero únicamente mientras el puntero/dedo está sobre
 * esta pantalla. El wheel/touch se captura aquí (preventDefault +
 * stopPropagation) para que NUNCA llegue a mover el paneo de fondo
 * entre monitores; en cuanto el cursor sale de la pantalla, el scroll
 * vuelve a controlar el recorrido normal por la foto.
 */
export default function ProjectScreenVideo({ project, style }) {
  const linkRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    const el = linkRef.current
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

    const SEC_PER_PX = 0.0022

    const onWheel = (e) => {
      if (!duration) return
      e.preventDefault()
      e.stopPropagation()
      targetTime = Math.min(duration, Math.max(0, targetTime + e.deltaY * SEC_PER_PX))
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
        targetTime = Math.min(duration, Math.max(0, targetTime + delta * SEC_PER_PX * 3))
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
  }, [])

  return (
    <Link
      ref={linkRef}
      to={`/inmobiliario/${project.slug}`}
      className="inmo-screen inmo-screen--project"
      style={style}
    >
      <div className="inmo-project-media">
        <div className="inmo-project-poster" style={{ backgroundImage: `url(${VIDEO_POSTER})` }} />
        <video
          ref={videoRef}
          className="inmo-project-video"
          src={VIDEO_SRC}
          poster={VIDEO_POSTER}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
        />
      </div>
      <span className="inmo-screen-title">{project.title}</span>
    </Link>
  )
}
