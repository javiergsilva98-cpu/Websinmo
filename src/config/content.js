// Constantes de módulo (estables entre renders → deps de useEffect seguras).

// Versiona SIEMPRE los nombres de los ficheros de media (v1, v2…) al
// recodificar, para saltarte la caché agresiva de Chrome.
export const VIDEO_SRC = '/media/hero-v1.mp4'
export const VIDEO_POSTER = '/media/hero-poster-v1.jpg'

// Longitud total del scroll en unidades de viewport (lvh).
// Más longitud = scrubbing más lento y suave.
export const SCROLL_LENGTH_LVH = 600

// Enlaces de los botones de acción (pendientes de personalizar).
export const LINKS = {
  whatsapp: 'https://wa.me/34600000000?text=Hola%2C%20me%20interesa%20la%20casa',
  map: 'https://maps.google.com/?q=Direccion+de+la+casa',
  instagram: 'https://instagram.com/usuario',
}

// Escenas de texto superpuestas al vídeo.
// from/to son fracciones del progreso total del scroll (0 → 1).
// snap es el punto de imán: donde se queda quieto el scroll al soltar.
export const SCENES = [
  {
    id: 'hero',
    from: 0,
    to: 0.18,
    snap: 0,
    kicker: 'En venta',
    title: 'Tu nueva casa te espera',
    body: 'Desliza para recorrerla',
    hint: true,
  },
  {
    id: 'espacio',
    from: 0.24,
    to: 0.44,
    snap: 0.32,
    kicker: 'El espacio',
    title: 'Hecha para vivirla',
    stats: [
      { value: '220', unit: 'm²', label: 'construidos' },
      { value: '4', unit: '', label: 'habitaciones' },
      { value: '3', unit: '', label: 'baños' },
    ],
  },
  {
    id: 'detalles',
    from: 0.5,
    to: 0.7,
    snap: 0.58,
    kicker: 'Los detalles',
    title: 'Luz todo el día',
    body: 'Orientación sur, jardín privado y terraza con vistas despejadas.',
  },
  {
    id: 'cierre',
    from: 0.78,
    to: 1,
    snap: 1,
    kicker: '¿Te la enseñamos?',
    title: 'Ven a verla',
    body: 'Escríbenos y organizamos una visita.',
    actions: true,
  },
]
