# Ayah Studio reels

Finished wordless reels, hosted here so Metricool can fetch them for scheduled posts.

## Rendering reels on GitHub Actions
`.github/workflows/render.yml` renders a reel kit on up to 20 free runners, joins the slices and publishes a release with the 60 fps master, a PC copy and a phone copy.
- Submit: `bash tools/submit.sh KIT_DIR SOUND_WAV NAME FRAMES [SLICES] [FINISH_SH]`
- Collect: `bash tools/fetch.sh JOB DEST_DIR`
- Or run it by hand: Actions, "Render reel", Run workflow, with the job folder name under `render-jobs/`.
