import InmobiliarioCategory from './InmobiliarioCategory.jsx'
import InmobiliarioMobileRecorrido from './InmobiliarioMobileRecorrido.jsx'
import { useIsMobile } from '../lib/useIsMobile.js'

/**
 * /inmobiliario2 — duplicado de /inmobiliario para probar, SOLO en
 * móvil, un fondo de vídeo scroll-scrubbed en vez de la foto fija
 * panorámica (ver InmobiliarioMobileRecorrido). En escritorio es
 * exactamente la misma página que /inmobiliario (mismo componente, sin
 * lógica propia aquí): así el original queda intacto y este duplicado
 * nunca diverge de él salvo en el tramo móvil que se pidió cambiar.
 */
export default function InmobiliarioCategory2() {
  const isMobile = useIsMobile()
  return isMobile ? <InmobiliarioMobileRecorrido /> : <InmobiliarioCategory />
}
