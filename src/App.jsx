import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import CasaFrenteAlMar from './pages/CasaFrenteAlMar.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/inmobiliario/una-casa-frente-al-mar"
        element={<CasaFrenteAlMar />}
      />
      <Route path="/:categorySlug" element={<CategoryPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
