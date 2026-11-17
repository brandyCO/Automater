#!/bin/bash
# audio-only job: the picture is the finished v5 master; this slice is a placeholder
K=$(cd "$(dirname "$0")" && pwd); mkdir -p "$K/out"
ffmpeg -v error -y -f lavfi -i color=c=black:s=16x16:d=0.1 -c:v libx264 "$K/out/seg_${1}_${2}.mp4"
