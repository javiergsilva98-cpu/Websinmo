import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './ScrollVideo.css'

gsap.registerPlugin(ScrollTrigger)

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

  useEffect(() => {
    const video = videoRef.current
    const track = trackRef.current
    if (!video || !track) return

    let duration = 0
    let targetTime = 0
    let smoothedTime = 0
    let primed = false

    const onMeta = () => {
      duration = video.duration || 0
    }
    if (video.readyState >= 1) onMeta()
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
  )
}
