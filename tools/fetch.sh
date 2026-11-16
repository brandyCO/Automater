#!/bin/bash
# Wait for the newest render of a job and download its mp4s.
# usage: bash tools/fetch.sh JOB DEST_DIR      (e.g. bash tools/fetch.sh mother-v6 /mnt/project-files/wordless-reels/mother)
set -e
JOB=$1; DEST=$2; REPO=brandyCO/automater; [ -n "$JOB" ] && [ -n "$DEST" ] || { sed -n 2,3p "$0"; exit 1; }
SUB=$(grep -s SUBMITTED "$(dirname "$0")/../render-jobs/$JOB/job.env" | cut -d= -f2); SUB=${SUB:-1970-01-01T00:00:00Z}
for i in $(seq 1 120); do
  TAG=$(gh api "repos/$REPO/releases?per_page=30" --jq "[.[]|select((.tag_name|startswith(\"render-$JOB-\")) and .published_at > \"$SUB\")][0].tag_name" 2>/dev/null)
  [ -n "$TAG" ] && [ "$TAG" != null ] && break
  RUN=$(gh api "repos/$REPO/actions/workflows/render.yml/runs?per_page=1" --jq '.workflow_runs[0]|"\(.status) \(.conclusion)"' 2>/dev/null)
  case "$RUN" in "completed failure"*|"completed cancelled"*) echo "render run failed: $RUN"; exit 1;; esac
  echo "waiting ($RUN)"; sleep 30
done
[ -n "$TAG" ] && [ "$TAG" != null ] || { echo "timed out"; exit 1; }
mkdir -p "$DEST"
for u in $(gh api "repos/$REPO/releases/tags/$TAG" --jq '.assets[].browser_download_url'); do
  f="$DEST/$(basename "$u")"; curl -sSL --retry 4 -o "$f.part" "$u" && mv "$f.part" "$f"; echo "got $f ($(du -h "$f" | cut -f1))"
done
