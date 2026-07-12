import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './ScrollVideo.css'

// Encuadre del vídeo por tramo de scroll: pequeños cambios de zoom y
// deriva vertical para que el fondo no repita el mismo movimiento en
// todas las secciones (solo transform → no cuesta rendimiento).
const PARALLAX_KEYFRAMES = [
  { p: 0, scale: 1, yPercent: 0 },
  { p: 0.143, scale: 1.06, yPercent: -1.6 },
  { p: 0.286, scale: 1.0, yPercent: 1.2 },
  { p: 0.429, scale: 1.07, yPercent: -1.0 },
  { p: 0.571, scale: 1.02, yPercent: 1.8 },
  { p: 0.714, scale: 1.08, yPercent: -1.8 },
  { p: 0.857, scale: 1.03, yPercent: 1.0 },
  { p: 1, scale: 1, yPercent: 0 },
]

/**
 * Vídeo de fondo cuyo tiempo se controla con el scroll (scroll-scrubbing).
 *
 * Requisitos del fichero de vídeo (ver scripts/encode-video.sh):
 *  - H.264 High, level <= 4.2, yuv420p, +faststart
 *  - SIN B-frames (-bf 0): con B-frames, iOS Safari pinta un fotograma
 *    negro al saltar de tiempo.
 *  - Keyframes densos (-g 8) para que cada seek resuelva rápido.
 *  - Un único <source> mp4. Nada de webm/VP9: Chrome lo preferiría y sus
 *    alt-ref frames rompen el seeking igual que los B-frames.
 *
 * El poster va ADEMÁS como fondo CSS detrás del <video>: iOS descarta el
 * atributo poster en el primer seek y deja negro si aún no ha decodificado;
 * la capa CSS nunca se borra, así que nunca se ve fondo negro.
 *
 * En escritorio el vídeo vertical se muestra en columna centrada
 * (letterbox) sobre el propio poster difuminado, sin recortes agresivos.
 *
 * @param {string} src         URL del mp4 (constante de módulo, versionada)
 * @param {string} poster      URL del poster (constante de módulo, versionada)
 * @param {React.RefObject} trackRef  elemento que define la longitud del scroll
 */
export default function ScrollVideo({ src, poster, trackRef }) {
  const videoRef = useRef(null)
  const mediaRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    const track = trackRef.current
    if (!video || !track) return

    // Parallax del encuadre: timeline con scrub entre keyframes.
    const parallax = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: track,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    })
    for (let i = 1; i < PARALLAX_KEYFRAMES.length; i++) {
      const prev = PARALLAX_KEYFRAMES[i - 1]
      const kf = PARALLAX_KEYFRAMES[i]
      parallax.to(
        mediaRef.current,
        { scale: kf.scale, yPercent: kf.yPercent, duration: kf.p - prev.p },
        prev.p,
      )
    }

    let duration = 0
    let targetTime = 0
    let smoothedTime = 0
    let primed = false

    const onMeta = () => {
      duration = video.duration || 0
      // Si el usuario ya ha hecho scroll antes de que carguen los
      // metadatos, sincroniza el objetivo con la posición actual.
      targetTime = st.progress * duration
      smoothedTime = targetTime
    }
    video.addEventListener('loadedmetadata', onMeta)

    // iOS bloquea currentTime hasta que el vídeo ha sido "activado" por un
    // gesto del usuario: un play()+pause() silencioso lo desbloquea.
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
    window.addEventListener('touchstart', prime, { passive: true, once: true })
    window.addEventListener('pointerdown', prime, { passive: true, once: true })

    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        if (duration) targetTime = self.progress * duration
      },
    })
    if (video.readyState >= 1) onMeta()

    // El seek real va desacoplado del scroll: cada frame nos acercamos al
    // tiempo objetivo (lerp) y solo escribimos currentTime si el seek
    // anterior terminó — encadenar seeks a medias es lo que atasca Safari.
    const onTick = () => {
      if (!duration) return
      smoothedTime += (targetTime - smoothedTime) * 0.22
      if (!video.seeking && Math.abs(video.currentTime - smoothedTime) > 1 / 90) {
        video.currentTime = smoothedTime
      }
    }
    gsap.ticker.add(onTick)

    return () => {
      gsap.ticker.remove(onTick)
      parallax.scrollTrigger?.kill()
      parallax.kill()
      st.kill()
      video.removeEventListener('loadedmetadata', onMeta)
      window.removeEventListener('touchstart', prime)
      window.removeEventListener('pointerdown', prime)
    }
  }, [src, poster, trackRef])

  return (
    <div className="video-stage" aria-hidden="true">
      {/* Fondo difuminado del propio poster: rellena el letterbox en escritorio */}
      <div
        className="video-backdrop"
        style={{ backgroundImage: `url(${poster})` }}
      />
      <div className="video-frame">
        {/* Wrapper del parallax: zoom/deriva por sección via transform */}
        <div className="video-media" ref={mediaRef}>
          {/* Capa CSS de poster: el seguro anti-fotograma-negro de iOS */}
          <div
            className="video-poster"
            style={{ backgroundImage: `url(${poster})` }}
          />
          <video
            ref={videoRef}
            className="video-el"
            src={src}
            poster={poster}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
          />
        </div>
      </div>
    </div>
  )
}
