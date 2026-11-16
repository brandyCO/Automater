#!/bin/bash
# Render one slice of Mother v6 (one continuous take, light loop) and drop it in out/ as an mp4 segment.
# usage: bash run.sh FROM TO      (frame numbers at 60 fps; TO is exclusive; whole reel = 0..2880)
set -e
K=$(cd "$(dirname "$0")" && pwd); A=$1; B=$2
W=$(mktemp -d /tmp/motherslice.XXXX)
cp "$K"/mother.html "$K"/mother_mc.js "$K"/mother_mom.js "$K"/*.woff2 "$K"/render.js "$W"/
cd "$W"
echo "rendering frames $A to $B in $W"
REEL=mother.html DUR=48 FROM=$A TO=$B node render.js video 60 frames
N=$(ls frames | wc -l); echo "rendered $N frames"
ffmpeg -hide_banner -loglevel error -y -framerate 60 -start_number $A -i frames/f%05d.png -frames:v $((B-A)) -c:v libx264 -crf 8 -preset veryfast -pix_fmt yuv420p seg.mp4
cp seg.mp4 "$K/out/seg_${A}_${B}.part"; mv "$K/out/seg_${A}_${B}.part" "$K/out/seg_${A}_${B}.mp4"
echo "DONE: $K/out/seg_${A}_${B}.mp4 ($(du -h seg.mp4 | cut -f1))"
