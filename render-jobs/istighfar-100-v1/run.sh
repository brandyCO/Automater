#!/bin/bash
# Render one slice of Istighfar x100 v1 (one continuous take) into out/seg_FROM_TO.mp4.
# usage: bash run.sh FROM TO      (frame numbers at 60 fps; TO is exclusive; whole reel = 0..3572)
set -e
K=$(cd "$(dirname "$0")" && pwd); A=$1; B=$2
W=$(mktemp -d /tmp/istslice.XXXX)
cp "$K"/istighfar.html "$K"/*.woff2 "$K"/render.js "$W"/
cd "$W"
echo "rendering frames $A to $B in $W"
REEL=istighfar.html DUR=59.54 FROM=$A TO=$B node render.js video 60 frames
N=$(ls frames | wc -l); echo "rendered $N frames"
ffmpeg -hide_banner -loglevel error -y -framerate 60 -start_number $A -i frames/f%05d.png -frames:v $((B-A)) -c:v libx264 -crf 8 -preset veryfast -pix_fmt yuv420p seg.mp4
mkdir -p "$K/out"; cp seg.mp4 "$K/out/seg_${A}_${B}.part"; mv "$K/out/seg_${A}_${B}.part" "$K/out/seg_${A}_${B}.mp4"
echo "DONE: $K/out/seg_${A}_${B}.mp4 ($(du -h seg.mp4 | cut -f1))"
