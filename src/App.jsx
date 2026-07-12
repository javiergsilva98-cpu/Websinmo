import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'

// Home se importa de forma estática (es la ruta de entrada más probable:
// sin ella no hay ningún "hop" extra de red antes del primer render). El
// resto de páginas se cargan bajo demanda: cada una pasa a ser su propio
// chunk, así que visitar "/" ya no descarga el JS de páginas que ese
// visitante puede que ni llegue a abrir (la casa, el visor 3D, la
// duplicada de prueba...).
const CategoryPage = lazy(() => import('./pages/CategoryPage.jsx'))
const InmobiliarioCategory = lazy(() => import('./pages/InmobiliarioCategory.jsx'))
const InmobiliarioCategory2 = lazy(() => import('./pages/InmobiliarioCategory2.jsx'))
const CasaFrenteAlMar = lazy(() => import('./pages/CasaFrenteAlMar.jsx'))
const Vase3DPage = lazy(() => import('./pages/Vase3DPage.jsx'))

// Mientras carga el chunk de la ruta, un fondo oscuro liso (el mismo
// #101418 de fondo de toda la web): nunca un flash en blanco.
function RouteFallback() {
  return <div style={{ position: 'fixed', inset: 0, background: '#101418' }} />
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/inmobiliario" element={<InmobiliarioCategory />} />
        <Route path="/inmobiliario2" element={<InmobiliarioCategory2 />} />
        <Route
          path="/inmobiliario/una-casa-frente-al-mar"
          element={<CasaFrenteAlMar />}
        />
        <Route path="/3D" element={<Vase3DPage />} />
        <Route path="/:categorySlug" element={<CategoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
