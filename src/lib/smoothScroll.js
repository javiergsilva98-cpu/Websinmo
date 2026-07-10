import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// La barra de URL de iOS/Android dispara resize al colapsar; sin esto
// ScrollTrigger recalcula todo en pleno scroll y la página "salta".
ScrollTrigger.config({ ignoreMobileResize: true })

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

/**
 * Inicializa Lenis + integración con GSAP/ScrollTrigger y un "imán" de
 * scroll (snap) gestionado por Lenis — NUNCA por el snap nativo de
 * ScrollTrigger, porque ambos se pelean por el control del scroll.
 *
 * El imán detecta que el scroll se ha parado por POSICIÓN (ticks < 3px
 * no cuentan como movimiento), no por velocidad: la velocidad de Lenis
 * decae asintóticamente y en iOS tardaría ~1s en llegar a cero.
 *
 * @param {() => number[]} getSnapPoints posiciones de scroll (px) a las que imantar
 * @returns {{ lenis: Lenis, destroy: () => void }}
 */
export function initSmoothScroll(getSnapPoints) {
  const lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    syncTouch: false,
  })

  lenis.on('scroll', ScrollTrigger.update)

  const onTick = (time) => {
    lenis.raf(time * 1000)
  }
  gsap.ticker.add(onTick)
  gsap.ticker.lagSmoothing(0)

  // ---- Imán de scroll -------------------------------------------------
  const MOVE_EPS = 3 // px: por debajo de esto el frame cuenta como "quieto"
  const STILL_FRAMES = 7 // ~115ms a 60fps parado antes de imantar
  const MAX_SNAP_DIST_VH = 0.6 // no imantar si el punto queda a > 60% de pantalla

  let lastY = lenis.scroll
  let stillFrames = 0
  let snapping = false

  const cancelSnap = () => {
    snapping = false
    stillFrames = -20 // periodo de gracia tras input del usuario
  }
  window.addEventListener('wheel', cancelSnap, { passive: true })
  window.addEventListener('touchstart', cancelSnap, { passive: true })
  window.addEventListener('pointerdown', cancelSnap, { passive: true })

  const onMagnetTick = () => {
    const y = lenis.scroll
    const moved = Math.abs(y - lastY)
    lastY = y

    if (snapping) return
    if (moved >= MOVE_EPS) {
      stillFrames = Math.min(stillFrames, 0)
      return
    }
    stillFrames++
    if (stillFrames < STILL_FRAMES) return

    const points = getSnapPoints()
    if (!points.length) return
    let nearest = points[0]
    for (const p of points) {
      if (Math.abs(p - y) < Math.abs(nearest - y)) nearest = p
    }
    const dist = Math.abs(nearest - y)
    if (dist < 2 || dist > window.innerHeight * MAX_SNAP_DIST_VH) {
      stillFrames = 0
      return
    }

    snapping = true
    lenis.scrollTo(nearest, {
      duration: Math.min(0.5, Math.max(0.25, dist / 1500)),
      easing: easeInOutCubic,
      lock: true,
      onComplete: () => {
        snapping = false
        stillFrames = 0
        lastY = nearest
      },
    })
  }
  gsap.ticker.add(onMagnetTick)

  const destroy = () => {
    gsap.ticker.remove(onTick)
    gsap.ticker.remove(onMagnetTick)
    window.removeEventListener('wheel', cancelSnap)
    window.removeEventListener('touchstart', cancelSnap)
    window.removeEventListener('pointerdown', cancelSnap)
    lenis.destroy()
  }

  return { lenis, destroy }
}
