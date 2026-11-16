#!/bin/bash
# Send a reel render kit to GitHub Actions (free, ~20 machines in parallel).
# usage: bash tools/submit.sh KIT_DIR SOUND_WAV NAME FRAMES [SLICES] [FINISH_SH]
#   KIT_DIR   folder with run.sh (bash run.sh FROM TO -> out/seg_FROM_TO.mp4), render.js, html/js, fonts
#   SOUND_WAV final loudness-normalised soundtrack (e.g. source_vN/sound_final.wav)
#   NAME      output name, e.g. mother_v6  -> mother_v6.mp4, mother_v6_pc.mp4, mother_v6_phone.mp4
#   FRAMES    total frames at 60 fps (the "whole reel = 0..N" number in run.sh)
#   FINISH_SH optional custom join script (gets SEG_DIR NAME, runs in the output folder)
# Run from a clone of brandyCO/automater. Prints the job name; the workflow starts on push.
set -e
KIT=$1; SND=$2; NAME=$3; FRAMES=$4; SLICES=${5:-20}; FIN=$6
[ -f "$KIT/run.sh" ] && [ -f "$SND" ] && [ -n "$NAME" ] && [ -n "$FRAMES" ] || { sed -n 2,9p "$0"; exit 1; }
R=$(cd "$(dirname "$0")/.." && pwd); JOB=$(echo "$NAME" | tr '_ ' '--' | tr -cd 'a-zA-Z0-9-')
D="$R/render-jobs/$JOB"; rm -rf "$D"; mkdir -p "$D"
for f in "$KIT"/*; do case "$(basename "$f")" in out|frames|stills|*.mp4|*.png) ;; *) cp -r "$f" "$D/";; esac; done
cp "$SND" "$D/sound.wav"; [ -n "$FIN" ] && cp "$FIN" "$D/finish.sh"
printf 'NAME=%s\nFRAMES=%s\nSLICES=%s\nSUBMITTED=%s\n' "$NAME" "$FRAMES" "$SLICES" "$(date -u +%FT%TZ)" > "$D/job.env"
cd "$R"; git pull -q --rebase || true; git add "render-jobs/$JOB"
git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -qm "Render job $JOB ($FRAMES frames)" -m "Co-Authored-By: Claude <noreply@anthropic.com>"
for i in 1 2 3 4; do git -c push.negotiate=true push -q origin main && break; sleep $((i*4)); done
echo "submitted job $JOB. Watch: https://github.com/brandyCO/automater/actions/workflows/render.yml"
echo "When done: bash tools/fetch.sh $JOB DEST_DIR"
