import { Link, Navigate, useParams } from 'react-router-dom'
import { CATEGORIES } from '../config/catalog.js'
import './IndexPages.css'

/** /<categoría> — listado de proyectos de esa categoría */
export default function CategoryPage() {
  const { categorySlug } = useParams()
  const category = CATEGORIES.find((c) => c.slug === categorySlug)

  if (!category) return <Navigate to="/" replace />

  return (
    <main className="index-page">
      <div className="index-inner">
        <Link to="/" className="index-back">
          ← Proyectos
        </Link>
        <p className="index-kicker">{category.title}</p>
        <h1 className="index-title">Proyectos</h1>
        <div className="project-grid">
          {category.projects.map((project) => (
            <Link
              key={project.slug}
              to={`/${category.slug}/${project.slug}`}
              className="project-card"
            >
              <img src={project.thumbnail} alt={project.title} loading="lazy" />
              <span className="project-card-title">{project.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
