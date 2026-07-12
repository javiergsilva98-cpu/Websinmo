#!/usr/bin/env bash
#
# Recodifica un vídeo para scroll-scrubbing fiable en iOS/Android/desktop.
#
#   ./scripts/encode-video.sh entrada.mov [nombre-base] [version]
#
# Genera:
#   public/media/<nombre-base>-v<N>.mp4        (vídeo scrubbable)
#   public/media/<nombre-base>-poster-v<N>.jpg (primer fotograma como poster)
#
# nombre-base identifica el vídeo (p. ej. "hero" para la casa, "home"
# para el índice): cada página/proyecto con su propio vídeo de fondo
# usa un nombre distinto para no pisarse entre sí.
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

INPUT="${1:?Uso: $0 entrada.mov [nombre-base] [version]}"
NAME="${2:-hero}"
VERSION="${3:-1}"
OUT_DIR="$(dirname "$0")/../public/media"
OUT_VIDEO="$OUT_DIR/${NAME}-v${VERSION}.mp4"
OUT_POSTER="$OUT_DIR/${NAME}-poster-v${VERSION}.jpg"

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
echo "Ahora actualiza VIDEO_SRC/VIDEO_POSTER donde corresponda:"
echo "  '/media/${NAME}-v${VERSION}.mp4'"
echo "  '/media/${NAME}-poster-v${VERSION}.jpg'"
