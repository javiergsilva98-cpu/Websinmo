import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import InmobiliarioCategory from './pages/InmobiliarioCategory.jsx'
import InmobiliarioCategory2 from './pages/InmobiliarioCategory2.jsx'
import CasaFrenteAlMar from './pages/CasaFrenteAlMar.jsx'
import Vase3DPage from './pages/Vase3DPage.jsx'

export default function App() {
  return (
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
  )
}
