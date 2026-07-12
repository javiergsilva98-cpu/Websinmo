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
 * scroll (snap) — NUNCA el snap nativo de ScrollTrigger, porque ambos
 * se pelean por el control del scroll.
 *
 * Diseño anti-oscilación:
 *  - La parada se detecta por POSICIÓN (ticks < 3px no cuentan), no por
 *    velocidad: la velocidad decae asintóticamente y en iOS tardaría ~1s.
 *  - El imán ejecuta SU PROPIA animación frame a frame (lenis.scrollTo
 *    immediate), así que se aborta al instante con cualquier input y
 *    jamás queda en un estado a medias.
 *  - Histéresis: tras un snap (o tras decidir no imantar), el imán queda
 *    DESARMADO hasta que hay un gesto real de scroll. Un snap por gesto:
 *    imposible entrar en bucle de sube-y-baja.
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
  const MOVE_EPS = 3 // px/frame: por debajo cuenta como "quieto"
  const STILL_FRAMES = 7 // ~115ms a 60fps parado antes de imantar
  const MAX_SNAP_DIST_VH = 0.6 // no imantar si el punto queda a > 60% de pantalla
  const REARM_DIST = 24 // px de scroll real necesarios para rearmar el imán

  let lastY = lenis.scroll
  let stillFrames = 0
  let touching = false // con el dedo en pantalla nunca se imanta
  let armed = true // histéresis: un snap por gesto de scroll
  let movedSinceDisarm = 0
  let anim = null // animación de snap en curso {from, to, t0, dur}

  const abortSnap = () => {
    anim = null
    stillFrames = -20 // periodo de gracia tras input del usuario
  }
  const onWheel = () => {
    abortSnap()
    armed = true // la rueda/trackpad es siempre un gesto deliberado
  }
  const onTouchStart = () => {
    touching = true
    abortSnap()
    armed = true
  }
  const onTouchEnd = () => {
    touching = false
    stillFrames = -10
  }
  window.addEventListener('wheel', onWheel, { passive: true })
  window.addEventListener('touchstart', onTouchStart, { passive: true })
  window.addEventListener('touchend', onTouchEnd, { passive: true })
  window.addEventListener('touchcancel', onTouchEnd, { passive: true })

  const onMagnetTick = () => {
    // Animación de snap en curso: la conducimos nosotros, frame a frame.
    if (anim) {
      const t = Math.min(1, (performance.now() - anim.t0) / anim.dur)
      const y = anim.from + (anim.to - anim.from) * easeInOutCubic(t)
      lenis.scrollTo(y, { immediate: true })
      lastY = y // nuestro propio movimiento no cuenta como gesto
      if (t >= 1) {
        anim = null
        stillFrames = 0
        // armed sigue false: no habrá otro snap hasta un scroll real
      }
      return
    }

    const y = lenis.scroll
    const moved = Math.abs(y - lastY)
    lastY = y

    if (moved >= MOVE_EPS) {
      stillFrames = Math.min(stillFrames, 0)
      movedSinceDisarm += moved
      if (movedSinceDisarm >= REARM_DIST) armed = true
      return
    }

    if (!armed || touching) return
    stillFrames++
    if (stillFrames < STILL_FRAMES) return

    // El scroll se ha parado de verdad: decisión única para este gesto.
    armed = false
    movedSinceDisarm = 0
    stillFrames = 0

    const points = getSnapPoints()
    if (!points.length) return
    let nearest = points[0]
    for (const p of points) {
      if (Math.abs(p - y) < Math.abs(nearest - y)) nearest = p
    }
    const dist = Math.abs(nearest - y)

    // El límite no puede ser un valor fijo: si el hueco entre dos paradas
    // consecutivas es mayor que 2x el límite, el punto medio entre ambas
    // queda fuera del alcance de las dos y el imán no actúa sobre él —
    // el scroll se queda "colgado" ahí (a medias entre dos pantallas).
    // Se amplía el límite, cuando hace falta, a medio hueco real entre
    // paradas (con un pequeño margen) para que el imán cubra siempre el
    // 100% del recorrido, sin tocar el comportamiento en páginas con
    // paradas ya lo bastante juntas (como el recorrido de la casa).
    const sorted = [...points].sort((a, b) => a - b)
    let maxGap = 0
    for (let i = 1; i < sorted.length; i++) maxGap = Math.max(maxGap, sorted[i] - sorted[i - 1])
    const limit = Math.max(window.innerHeight * MAX_SNAP_DIST_VH, (maxGap / 2) * 1.05)

    if (dist < 2 || dist > limit) return

    anim = {
      from: y,
      to: nearest,
      t0: performance.now(),
      dur: Math.min(500, Math.max(250, (dist / 1500) * 1000)),
    }
  }
  gsap.ticker.add(onMagnetTick)

  const destroy = () => {
    gsap.ticker.remove(onTick)
    gsap.ticker.remove(onMagnetTick)
    window.removeEventListener('wheel', onWheel)
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchend', onTouchEnd)
    window.removeEventListener('touchcancel', onTouchEnd)
    lenis.destroy()
  }

  return { lenis, destroy }
}
