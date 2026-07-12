import { Link, Navigate, useParams } from 'react-router-dom'
import { CATEGORIES } from '../config/catalog.js'
import { useDocumentTitle } from '../lib/useDocumentTitle.js'
import './IndexPages.css'

function ProjectCard({ category, project }) {
  const content = (
    <>
      {project.thumbnail && (
        <img src={project.thumbnail} alt={project.title} loading="lazy" />
      )}
      <span className="project-card-title">{project.title}</span>
    </>
  )
  const className = `project-card${project.thumbnail ? '' : ' project-card--plain'}`

  if (project.href) {
    return (
      <a className={className} href={project.href} target="_blank" rel="noreferrer">
        {content}
      </a>
    )
  }
  return (
    <Link className={className} to={`/${category.slug}/${project.slug}`}>
      {content}
    </Link>
  )
}

/** /<categoría> — listado de proyectos de esa categoría */
export default function CategoryPage() {
  const { categorySlug } = useParams()
  const category = CATEGORIES.find((c) => c.slug === categorySlug)
  useDocumentTitle(category ? `${category.title} — Websinmo` : null)

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
            <ProjectCard
              key={project.slug || project.href}
              category={category}
              project={project}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
