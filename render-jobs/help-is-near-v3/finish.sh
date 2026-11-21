#!/bin/bash
# Join the slices: 60 fps master (12 Mb/s, light grain), a PC copy, and a phone copy that stays at a true 60 fps.
# usage (from the workflow): bash finish.sh SEG_DIR NAME   (runs in the output folder; sound.wav sits next to this script)
set -e
SEG=$1; NAME=$2; K=$(cd "$(dirname "$0")" && pwd)
SEGS=$(ls "$SEG"/seg_*.mp4 | sort -t_ -k2 -n)
IN=""; FC=""; CAT=""; i=0
for s in $SEGS; do IN="$IN -i $s"; FC="$FC[$i:v]setsar=1[s$i];"; CAT="$CAT[s$i]"; i=$((i+1)); done
echo "joining $i slices"
ffmpeg -hide_banner -loglevel error -y $IN -i "$K/sound.wav" \
  -filter_complex "${FC}${CAT}concat=n=$i:v=1:a=0,noise=alls=3:allf=t,format=yuv420p[v]" \
  -map "[v]" -map $i:a -c:v libx264 -preset medium -b:v 12M -maxrate 14M -bufsize 24M -r 60 \
  -c:a aac -b:a 192k -movflags +faststart -shortest "$NAME.mp4"
ffmpeg -hide_banner -loglevel error -y -i "$NAME.mp4" -c:v libx264 -preset slow -b:v 2.0M -maxrate 2.8M -bufsize 5M -r 60 -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart "${NAME}_pc.mp4" &
ffmpeg -hide_banner -loglevel error -y -i "$NAME.mp4" -c:v libx264 -preset slow -tune grain -b:v 3.2M -r 60 -pass 1 -passlogfile ph -an -f mp4 /dev/null && \
ffmpeg -hide_banner -loglevel error -y -i "$NAME.mp4" -c:v libx264 -preset slow -tune grain -b:v 3.2M -maxrate 4.5M -bufsize 8M -r 60 -pass 2 -passlogfile ph -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "${NAME}_phone.mp4"
wait
for f in "$NAME.mp4" "${NAME}_pc.mp4" "${NAME}_phone.mp4"; do ffprobe -v error -select_streams v -show_entries stream=r_frame_rate,nb_frames:format=duration -of compact "$f"; done
