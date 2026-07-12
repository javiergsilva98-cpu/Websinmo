// Índice de categorías y proyectos. Alimenta la home (/) y las páginas
// de categoría (/<categoría>). Cada proyecto es una página propia y a
// medida (no genérica): añadir uno nuevo implica crear su componente en
// src/pages/ y darlo de alta como <Route> explícita en App.jsx, además
// de una entrada aquí para que aparezca listado.
export const CATEGORIES = [
  {
    slug: 'inmobiliario',
    title: 'Inmobiliario',
    description: 'Invitaciones cinemáticas para propiedades en venta.',
    projects: [
      {
        slug: 'una-casa-frente-al-mar',
        title: 'Una casa frente al mar',
        thumbnail: '/img/salon-v1.jpg',
      },
    ],
  },
]
