#!/bin/bash
# Render one slice of "A mistake many make" v1 (one continuous take, 20 s loop) into out/seg_FROM_TO.mp4
# usage: bash run.sh FROM TO   (frames at 60 fps; TO exclusive; whole reel = 0..1200)
set -e
K=$(cd "$(dirname "$0")" && pwd); A=$1; B=$2
W=$(mktemp -d /tmp/mistslice.XXXX)
cp "$K"/mistake.html "$K"/*.ttf "$K"/*.woff2 "$K"/render.js "$W"/
cd "$W"
REEL=mistake.html DUR=20 FROM=$A TO=$B node render.js video 60 frames
ffmpeg -hide_banner -loglevel error -y -framerate 60 -start_number $A -i frames/f%05d.png -frames:v $((B-A)) -c:v libx264 -crf 8 -preset veryfast -pix_fmt yuv420p seg.mp4
mkdir -p "$K/out"; cp seg.mp4 "$K/out/seg_${A}_${B}.part"; mv "$K/out/seg_${A}_${B}.part" "$K/out/seg_${A}_${B}.mp4"
echo "DONE: $K/out/seg_${A}_${B}.mp4"
