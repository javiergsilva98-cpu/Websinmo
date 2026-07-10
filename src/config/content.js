// Constantes de módulo (estables entre renders → deps de useEffect seguras).

// Versiona SIEMPRE los nombres de los ficheros de media (v1, v2…) al
// recodificar/reemplazar, para saltarte la caché agresiva de Chrome.
export const VIDEO_SRC = '/media/hero-v1.mp4'
export const VIDEO_POSTER = '/media/hero-poster-v1.jpg'

// Longitud total del scroll en unidades de viewport (lvh).
// Más longitud = scrubbing más lento y suave.
export const SCROLL_LENGTH_LVH = 800

// Enlaces de los botones de acción (pendientes de personalizar).
export const LINKS = {
  whatsapp: 'https://wa.me/34600000000?text=Hola%2C%20he%20visto%20el%20proyecto',
  map: 'https://maps.google.com/?q=Direccion+del+proyecto',
  instagram: 'https://instagram.com/usuario',
}

// Escenas superpuestas al vídeo.
// from/to son fracciones del progreso total del scroll (0 → 1).
// snap es el punto de imán: donde se queda quieto el scroll al soltar.
// image añade una fotografía del proyecto; detail una segunda foto de
// detalle que se solapa a la principal.
//
// layout controla el tratamiento editorial de cada sección:
//   variant  hero | duo | top | portrait | bottom (sin variant = plano)
//   anim     clip | slide | zoom | fade   (entrada de la fotografía)
//   slideFrom 'left' | 'right'            (solo anim: slide)
//   hideKicker / hideBody                 (variación de ritmo tipográfico)
export const SCENES = [
  {
    id: 'hero',
    from: 0,
    to: 0.09,
    snap: 0,
    kicker: 'Proyecto de interiorismo',
    title: 'Una casa frente al mar',
    body: 'Desliza para recorrer el proyecto',
    hint: true,
  },
  {
    id: 'salon',
    from: 0.1,
    to: 0.19,
    snap: 0.143,
    kicker: 'El salón',
    title: 'Abierto al horizonte',
    body: 'El paisaje entra en casa: carpinterías ocultas y un interior que cede el protagonismo al mar.',
    image: { src: '/img/salon-v1.jpg', alt: 'Salón con vistas al mar al atardecer' },
    // La joya del proyecto: foto a pantalla completa con reveal de clip-path
    layout: { variant: 'hero', anim: 'clip' },
  },
  {
    id: 'cocina',
    from: 0.24,
    to: 0.33,
    snap: 0.286,
    kicker: 'La cocina',
    title: 'El centro de la casa',
    body: 'Isla de mármol y frentes en grafito, con la mesa de comedor mirando al agua.',
    image: { src: '/img/cocina-v1.jpg', alt: 'Cocina con isla de mármol y vistas al mar' },
    detail: { src: '/img/cocina-detail-v1.jpg', alt: 'Detalle del mármol de la isla' },
    // Dúo general + detalle, texto a la izquierda, entrada lateral
    layout: { variant: 'duo', anim: 'slide', slideFrom: 'left' },
  },
  {
    id: 'dormitorio',
    from: 0.38,
    to: 0.47,
    snap: 0.429,
    kicker: 'Dormitorio principal',
    title: 'Despertar sobre el mar',
    body: 'La terraza como prolongación del dormitorio; materiales cálidos y luz de poniente.',
    image: { src: '/img/dormitorio-v1.jpg', alt: 'Dormitorio principal abierto a la terraza y al mar' },
    // Banner arriba del viewport, sin overline, zoom lento
    layout: { variant: 'top', anim: 'zoom', hideKicker: true },
  },
  {
    id: 'bano',
    from: 0.53,
    to: 0.62,
    snap: 0.571,
    kicker: 'Baño principal',
    title: 'Mármol y calma',
    body: 'Bañera exenta tallada en mármol, ducha efecto lluvia y vestidor en cristal texturizado.',
    image: { src: '/img/bano-portrait-v1.jpg', alt: 'Baño principal con bañera de mármol exenta' },
    // Formato retrato en columna, fade puro
    layout: { variant: 'portrait', anim: 'fade' },
  },
  {
    id: 'suite',
    from: 0.67,
    to: 0.76,
    snap: 0.714,
    kicker: 'Suite de invitados',
    title: 'Materia y paisaje',
    body: 'Madera, piedra y estuco frente al desierto: la misma paleta, otra atmósfera.',
    image: { src: '/img/suite-v1.jpg', alt: 'Suite de invitados con vistas al desierto' },
    // Tarjeta compacta en la parte baja del viewport, texto debajo de la foto
    layout: { variant: 'bottom', anim: 'slide', slideFrom: 'right' },
  },
  {
    id: 'aseo',
    from: 0.81,
    to: 0.9,
    snap: 0.857,
    kicker: 'El aseo',
    title: 'Los detalles importan',
    body: 'Iluminación integrada, lavabo de mármol y nichos retroiluminados en nogal.',
    image: { src: '/img/aseo-v1.jpg', alt: 'Aseo con espejo retroiluminado y mueble de nogal' },
    // Tratamiento estándar: foto, overline, título y párrafo
    layout: { anim: 'fade' },
  },
  {
    id: 'cierre',
    from: 0.95,
    to: 1,
    snap: 1,
    kicker: '¿Qué te parece?',
    title: 'Hablemos del proyecto',
    body: 'Cuéntanos tus impresiones o ven a verlo con nosotros.',
    actions: true,
  },
]
