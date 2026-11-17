#!/bin/bash
# Render one slice of Enough v2 front (65:3; one continuous take, loops at 40 s).
# usage: bash run.sh FROM TO      (frame numbers at 60 fps; TO is exclusive; whole reel = 0..2400)
set -e
K=$(cd "$(dirname "$0")" && pwd); A=$1; B=$2
W=$(mktemp -d /tmp/enoughslice.XXXX)
cp "$K"/enough.html "$K"/*.woff2 "$K"/inter.otf "$K"/render.js "$W"/
cd "$W"
echo "rendering frames $A to $B in $W"
REEL=enough.html DUR=40 FROM=$A TO=$B node render.js video 60 frames
N=$(ls frames | wc -l); echo "rendered $N frames"
ffmpeg -hide_banner -loglevel error -y -framerate 60 -start_number $A -i frames/f%05d.png -frames:v $((B-A)) -c:v libx264 -crf 8 -preset veryfast -pix_fmt yuv420p seg.mp4
mkdir -p "$K/out"; cp seg.mp4 "$K/out/seg_${A}_${B}.part"; mv "$K/out/seg_${A}_${B}.part" "$K/out/seg_${A}_${B}.mp4"
echo "DONE: $K/out/seg_${A}_${B}.mp4 ($(du -h seg.mp4 | cut -f1))"
