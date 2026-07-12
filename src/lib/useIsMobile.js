import { useEffect, useState } from 'react'

/**
 * true/false reactivo según el ancho de viewport, para alternar entre
 * variantes de una página (no solo CSS): usa matchMedia (no un simple
 * resize listener) para que también reaccione a rotar el dispositivo.
 */
export function useIsMobile(breakpoint = 768) {
  const query = `(max-width: ${breakpoint}px)`
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setIsMobile(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return isMobile
}
