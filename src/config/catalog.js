// Índice de categorías y proyectos. Alimenta la home (/) y las páginas
// de categoría (/<categoría>). Cada proyecto es una página propia y a
// medida (no genérica): añadir uno nuevo implica crear su componente en
// src/pages/ y darlo de alta como <Route> explícita en App.jsx, además
// de una entrada aquí para que aparezca listado.
//
// Un proyecto puede ser interno (slug + página propia bajo esta app) o
// externo (href a otro dominio/deploy, p. ej. otro proyecto en Vercel).
// thumbnail es opcional: sin ella la tarjeta cae a un estilo sin foto.
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
  {
    // Duplicado de "inmobiliario" solo para probar, en móvil, un fondo
    // de vídeo scroll-scrubbed en vez de la foto fija (ver
    // InmobiliarioCategory2 / InmobiliarioMobileRecorrido). En
    // escritorio es la misma página que "inmobiliario", por eso
    // reutiliza el mismo proyecto.
    slug: 'inmobiliario2',
    title: 'Inmobiliario (prueba)',
    description: 'Prueba: fondo de vídeo scroll-scrubbed en móvil.',
    projects: [
      {
        slug: 'una-casa-frente-al-mar',
        title: 'Una casa frente al mar',
        thumbnail: '/img/salon-v1.jpg',
      },
    ],
  },
  {
    slug: 'varios',
    title: 'Varios',
    description: 'Otros proyectos.',
    projects: [
      {
        title: 'BBQ Gonsastrez',
        href: 'https://bbq-gonsastrez.vercel.app/',
        thumbnail: '/img/bbq-gonsastrez-v1.jpg',
      },
    ],
  },
]
