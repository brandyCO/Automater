#!/bin/bash
# swap the v5 soundtrack for v5b (only the drop on each count); picture copied untouched at full quality
set -e; K=$(cd "$(dirname "$0")" && pwd); NAME=$2
U=https://github.com/brandyCO/Automater/releases/download/render-istighfar-100-v5-18
for s in "" _pc _phone; do
  curl -sSL --retry 4 -o "v5$s.mp4" "$U/istighfar_100_v5$s.mp4"
  case "$s" in "") br=192k;; _pc) br=160k;; _phone) br=112k;; esac
  ffmpeg -hide_banner -loglevel error -y -i "v5$s.mp4" -i "$K/sound.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a $br -shortest -movflags +faststart "$NAME$s.mp4"
  rm -f "v5$s.mp4"
done
