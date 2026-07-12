import { Component } from 'react'

/**
 * Red de seguridad de última instancia: sin esto, cualquier excepción en
 * cualquier página (un vídeo que falla al cargar, una API del navegador
 * que no existe, lo que sea) tira TODO el árbol de React y deja pantalla
 * en blanco. Con esto, el resto de la app sigue rota igual, pero al menos
 * hay un mensaje en vez de un blanco total sin pista de qué ha pasado.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error(error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#101418',
            color: '#fff',
            fontFamily: 'sans-serif',
            padding: 24,
            textAlign: 'center',
          }}
        >
          Algo ha fallado. Recarga la página.
        </div>
      )
    }
    return this.props.children
  }
}
