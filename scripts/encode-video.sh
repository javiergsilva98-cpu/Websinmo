#!/usr/bin/env bash
#
# Recodifica un vídeo para scroll-scrubbing fiable en iOS/Android/desktop.
#
#   ./scripts/encode-video.sh entrada.mov [version]
#
# Genera:
#   public/media/hero-v<N>.mp4        (vídeo scrubbable)
#   public/media/hero-poster-v<N>.jpg (primer fotograma como poster)
#
# Después actualiza VIDEO_SRC/VIDEO_POSTER en src/config/content.js.
#
# Por qué cada flag (aprendido a base de sustos):
#   -bf 0            SIN B-frames: con ellos iOS Safari pinta un fotograma
#                    negro al hacer seek.
#   -g 8             keyframe cada 8 frames: cada seek resuelve casi al
#                    instante; sin esto el scrubbing va a tirones.
#   -sc_threshold 0  no insertar keyframes extra por cambio de escena
#                    (mantiene el GOP regular).
#   minterpolate 60  interpola a 60fps para que el movimiento lento del
#                    scrubbing sea fluido.
#   profile high / level 4.2 / yuv420p   máxima compatibilidad hardware
#                    (level > 4.2 no decodifica en muchos móviles).
#   +faststart       moov al principio: el vídeo es seekable antes de
#                    descargarse entero.
#   -an              sin audio: es un fondo mudo y el audio estorba al
#                    autoplay/priming de iOS.
#
# Un ÚNICO mp4. No generes webm/VP9: Chrome lo preferiría y sus alt-ref
# frames rompen el seeking igual que los B-frames.
#
# Versiona el nombre (v1, v2…) en cada recodificación para saltar la
# caché agresiva de Chrome.

set -euo pipefail

INPUT="${1:?Uso: $0 entrada.mov [version]}"
VERSION="${2:-1}"
OUT_DIR="$(dirname "$0")/../public/media"
OUT_VIDEO="$OUT_DIR/hero-v${VERSION}.mp4"
OUT_POSTER="$OUT_DIR/hero-poster-v${VERSION}.jpg"

mkdir -p "$OUT_DIR"

# 1080 de ancho máximo (vídeo vertical). 1080x1920@60 cabe justo en level 4.2.
ffmpeg -y -i "$INPUT" \
  -vf "minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,scale='min(1080,iw)':-2" \
  -c:v libx264 -profile:v high -level:v 4.2 -pix_fmt yuv420p \
  -bf 0 -g 8 -keyint_min 8 -sc_threshold 0 \
  -preset slow -crf 21 \
  -movflags +faststart \
  -an \
  "$OUT_VIDEO"

# Poster: primer fotograma (mismo tamaño que el vídeo)
ffmpeg -y -i "$OUT_VIDEO" -frames:v 1 -q:v 3 "$OUT_POSTER"

echo ""
echo "OK:"
echo "  $OUT_VIDEO"
echo "  $OUT_POSTER"
echo ""
echo "Ahora actualiza src/config/content.js:"
echo "  VIDEO_SRC    = '/media/hero-v${VERSION}.mp4'"
echo "  VIDEO_POSTER = '/media/hero-poster-v${VERSION}.jpg'"
