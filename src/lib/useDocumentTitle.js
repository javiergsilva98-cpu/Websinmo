import { useEffect } from 'react'

/**
 * document.title por página: index.html trae un único <title>/OG pensado
 * para "Una casa frente al mar" (la página que más se comparte), pero sin
 * esto TODAS las rutas (home, /inmobiliario, /3D...) mostraban ese mismo
 * título en la pestaña/historial del navegador.
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    if (title) document.title = title
  }, [title])
}
