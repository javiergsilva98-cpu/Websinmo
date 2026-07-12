import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initSmoothScroll } from '../lib/smoothScroll.js'
import { cornerPinStyle } from '../lib/cornerPin.js'
import Vase3DViewer from '../components/Vase3DViewer.jsx'
import ContactFallSection from './ContactFallSection.jsx'
import { VASE_MODEL_SRC } from '../config/vase.js'
import {
  INMO2_BG_VIDEO_SRC,
  INMO2_BG_VIDEO_POSTER,
  INMO2_VIDEO_W,
  INMO2_VIDEO_H,
  INMO2_SEGMENTS,
} from '../config/inmo2.js'
import './InmobiliarioMobileRecorrido.css'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

const lerp = (a, b, t) => a + (b - a) * t
function lerpCorners(c1, c2, t) {
  const at = (k) => [lerp(c1[k][0], c2[k][0], t), lerp(c1[k][1], c2[k][1], t)]
  return { tl: at('tl'), tr: at('tr'), br: at('br'), bl: at('bl') }
}

// Opacidad triangular: 0 fuera de [from,to], rampa lineal de `fade` en
// cada extremo, 1 en la meseta central. Los tramos de fade de pantallas
// vecinas se solapan a propósito (ver progressRange en config/inmo2.js)
// para que una se funda en la siguiente en vez de cortar en seco.
function segmentOpacity(p, [from, to], fade) {
  if (p <= from) return from === 0 ? 1 : 0
  if (p >= to) return to === 1 ? 1 : 0
  if (p < from + fade) return (p - from) / fade
  if (p > to - fade) return (to - p) / fade
  return 1
}

// Progreso normalizado (0-1) dentro del propio tramo del segmento, para
// interpolar tanto su cuadrilátero como (si es vídeo) su propio tiempo.
function segmentLocalT(p, [from, to]) {
  if (to === from) return 0
  return Math.min(1, Math.max(0, (p - from) / (to - from)))
}

/**
 * Variante móvil de /inmobiliario2: en vez de la foto fija panorámica,
 * un vídeo de fondo (los dos monitores) scroll-scrubbed, con tres
 * pantallas superpuestas (Bernabéu, casa, visor 3D) que se van fundiendo
 * unas en otras siguiendo el mismo scroll — la cámara del vídeo ya hace
 * el "recorrido" entre las dos pantallas, así que aquí no hace falta
 * paneo en X como en la versión de escritorio, solo encajar el
 * cuadrilátero de cada pantalla en su sitio en cada instante.
 */
export default function InmobiliarioMobileRecorrido() {
  const trackRef = useRef(null)
  const viewportRef = useRef(null)
  const canvasRef = useRef(null)
  const bgVideoRef = useRef(null)
  const segmentRefs = useRef({})

  useEffect(() => {
    const track = trackRef.current
    const viewportEl = viewportRef.current
    const canvas = canvasRef.current
    const bgVideo = bgVideoRef.current
    if (!track || !viewportEl || !canvas || !bgVideo) return

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)

    // Encaje del vídeo de fondo (720x1280) en el viewport tipo
    // object-fit:cover, pero calculado en JS porque el canvas también
    // aloja las pantallas superpuestas (comparten el mismo transform que
    // el vídeo, así que sus coordenadas siguen siendo píxeles del vídeo
    // fuente sin más cálculo). No hay paneo, solo centrado: la cámara ya
    // se mueve dentro del propio vídeo.
    const fitCanvas = () => {
      const vw = viewportEl.clientWidth
      const vh = viewportEl.clientHeight
      const scale = Math.max(vw / INMO2_VIDEO_W, vh / INMO2_VIDEO_H)
      const tx = (vw - INMO2_VIDEO_W * scale) / 2
      const ty = (vh - INMO2_VIDEO_H * scale) / 2
      gsap.set(canvas, { x: tx, y: ty, scale, transformOrigin: '0 0' })
    }
    fitCanvas()

    let targetProgress = 0
    let smoothedProgress = 0
    let bgDuration = 0
    let bgSmoothedTime = 0
    const segState = {} // { [id]: { duration, smoothedTime } }
    for (const seg of INMO2_SEGMENTS) segState[seg.id] = { duration: 0, smoothedTime: 0 }

    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        targetProgress = self.progress
      },
    })

    const onBgMeta = () => {
      bgDuration = bgVideo.duration || 0
    }
    bgVideo.addEventListener('loadedmetadata', onBgMeta)
    if (bgVideo.readyState >= 1) onBgMeta()

    const videoMetaCleanups = []
    for (const seg of INMO2_SEGMENTS) {
      if (seg.kind !== 'video') continue
      const refs = segmentRefs.current[seg.id]
      const video = refs?.video
      if (!video) continue
      const onMeta = () => {
        segState[seg.id].duration = video.duration || 0
      }
      video.addEventListener('loadedmetadata', onMeta)
      if (video.readyState >= 1) onMeta()
      videoMetaCleanups.push(() => video.removeEventListener('loadedmetadata', onMeta))
    }

    // iOS bloquea currentTime hasta un play()+pause() ligado a un gesto
    // real del usuario: desbloquea el de fondo y los dos superpuestos (el
    // del visor 3D no es un <video>, no lo necesita) en el primer toque.
    let primed = false
    const primeAll = () => {
      if (primed) return
      primed = true
      const videos = [bgVideo]
      for (const seg of INMO2_SEGMENTS) {
        const v = segmentRefs.current[seg.id]?.video
        if (v) videos.push(v)
      }
      for (const v of videos) {
        const p = v.play()
        if (p && p.then) p.then(() => v.pause()).catch(() => {})
      }
    }
    window.addEventListener('touchstart', primeAll, { passive: true, once: true })
    window.addEventListener('pointerdown', primeAll, { passive: true, once: true })

    const applySegment = (seg, p) => {
      const refs = segmentRefs.current[seg.id]
      if (!refs) return
      const opacity = segmentOpacity(p, seg.progressRange, seg.fade)
      const visible = opacity > 0.01
      refs.wrap.style.opacity = String(opacity)
      refs.wrap.style.pointerEvents = visible ? 'auto' : 'none'
      if (!visible && opacity === 0) return

      const t = segmentLocalT(p, seg.progressRange)
      const corners = lerpCorners(seg.keyframes[0].corners, seg.keyframes[1].corners, t)
      const style = cornerPinStyle(corners)
      refs.wrap.style.left = `${style.left}px`
      refs.wrap.style.top = `${style.top}px`
      refs.wrap.style.width = `${style.width}px`
      refs.wrap.style.height = `${style.height}px`
      refs.tilt.style.transform = style.transform
      refs.tilt.style.transformOrigin = style.transformOrigin

      if (seg.kind === 'video' && refs.video) {
        const state = segState[seg.id]
        if (state.duration) {
          const targetTime = t * state.duration
          state.smoothedTime += (targetTime - state.smoothedTime) * 0.25
          if (!refs.video.seeking && Math.abs(refs.video.currentTime - state.smoothedTime) > 1 / 60) {
            refs.video.currentTime = state.smoothedTime
          }
        }
      }
    }

    const onTick = () => {
      smoothedProgress += (targetProgress - smoothedProgress) * 0.18
      const p = smoothedProgress

      if (bgDuration) {
        const targetBgTime = p * bgDuration
        bgSmoothedTime += (targetBgTime - bgSmoothedTime) * 0.25
        if (!bgVideo.seeking && Math.abs(bgVideo.currentTime - bgSmoothedTime) > 1 / 60) {
          bgVideo.currentTime = bgSmoothedTime
        }
      }

      for (const seg of INMO2_SEGMENTS) applySegment(seg, p)
    }
    gsap.ticker.add(onTick)

    // Imán de 3 paradas (una por pantalla), igual que en /inmobiliario:
    // desarmado una vez el usuario ha pasado al formulario de contacto.
    const trackMax = () => track.offsetTop + track.offsetHeight - window.innerHeight
    const getSnapPoints = () => {
      const max = trackMax()
      if (max <= 0) return []
      if (window.scrollY > max + 40) return []
      return [0, max * 0.5, max]
    }
    const { destroy } = initSmoothScroll(getSnapPoints)

    const onResize = () => fitCanvas()
    window.addEventListener('resize', onResize)

    return () => {
      gsap.ticker.remove(onTick)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('touchstart', primeAll)
      window.removeEventListener('pointerdown', primeAll)
      bgVideo.removeEventListener('loadedmetadata', onBgMeta)
      for (const cleanup of videoMetaCleanups) cleanup()
      st.kill()
      destroy()
    }
  }, [])

  return (
    <>
      <Link to="/" className="inmo2-back">
        ← Proyectos
      </Link>

      <div className="inmo2-viewport" ref={viewportRef}>
        <div className="inmo2-canvas" ref={canvasRef}>
          {/* Capa de poster CSS detrás del vídeo de fondo: mismo truco
              anti-fotograma-negro de iOS que en el resto del sitio. */}
          <div className="inmo2-bg-poster" style={{ backgroundImage: `url(${INMO2_BG_VIDEO_POSTER})` }} />
          <video
            ref={bgVideoRef}
            className="inmo2-bg-video"
            src={INMO2_BG_VIDEO_SRC}
            poster={INMO2_BG_VIDEO_POSTER}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
          />

          {INMO2_SEGMENTS.map((seg) => (
            <div
              key={seg.id}
              className="inmo2-screen"
              ref={(el) => {
                if (!segmentRefs.current[seg.id]) segmentRefs.current[seg.id] = {}
                segmentRefs.current[seg.id].wrap = el
              }}
            >
              <div
                className="inmo2-tilt"
                ref={(el) => {
                  if (!segmentRefs.current[seg.id]) segmentRefs.current[seg.id] = {}
                  segmentRefs.current[seg.id].tilt = el
                }}
              >
                {seg.kind === 'video' ? (
                  <>
                    <div className="inmo2-screen-poster" style={{ backgroundImage: `url(${seg.poster})` }} />
                    <video
                      ref={(el) => {
                        if (!segmentRefs.current[seg.id]) segmentRefs.current[seg.id] = {}
                        segmentRefs.current[seg.id].video = el
                      }}
                      className="inmo2-screen-video"
                      src={seg.videoSrc}
                      poster={seg.poster}
                      muted
                      playsInline
                      preload="auto"
                      disablePictureInPicture
                      disableRemotePlayback
                    />
                  </>
                ) : (
                  <Vase3DViewer src={VASE_MODEL_SRC} isolateEvents />
                )}
              </div>
              {seg.title && <span className="inmo2-screen-title">{seg.title}</span>}
            </div>
          ))}
        </div>
      </div>

      <div ref={trackRef} className="scroll-track" style={{ height: '350lvh' }} />

      <ContactFallSection />
    </>
  )
}
