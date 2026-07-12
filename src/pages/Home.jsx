import { Link } from 'react-router-dom'
import { CATEGORIES } from '../config/catalog.js'
import './IndexPages.css'

/** / — índice de categorías */
export default function Home() {
  return (
    <main className="index-page">
      <div className="index-inner">
        <p className="index-kicker">Proyectos</p>
        <h1 className="index-title">Selecciona una categoría</h1>
        <nav className="index-grid">
          {CATEGORIES.map((cat) => (
            <Link key={cat.slug} to={`/${cat.slug}`} className="index-card">
              <span className="index-card-title">{cat.title}</span>
              {cat.description && (
                <span className="index-card-desc">{cat.description}</span>
              )}
              <span className="index-card-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  )
}
