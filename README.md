# Four Years of Us

An anniversary journey site: a hero page, then one chapter per year, each with its own gallery animation.

- **Year 1 — The Spark**: polaroids that "develop" as you scroll to them
- **Year 2 — The Adventure**: a pinned filmstrip; three rows slide in opposite directions as you scroll
- **Year 3 — The Quiet**: two drifting parallax columns; photos wake from black-and-white into color
- **Year 4 — The Now**: a scattered constellation of photos converges into one mosaic

## Run locally

```
npm install
npm run dev
```

## Update photos

Drop images into `../Year 1/iCloud Photos` (etc.), then:

```
npm run photos
```

This resizes everything to WebP in `public/photos/` and regenerates `src/manifest.json`.

Year 4 also picks up videos (`.mov` / `.mp4`): they're converted to muted 960px H.264 MP4s with ffmpeg (bundled via `ffmpeg-static`, no install needed). A video that shares a name with a photo (an iPhone Live Photo pair like `IMG_7599.JPG` + `IMG_7599.MOV`) plays inside that photo's tile; standalone videos get their own tile with a poster frame. Conversions are cached — already-converted clips are skipped on re-runs.

## Deploy to Netlify

Option A — drag & drop: run `npm run build`, then drag the `dist` folder onto https://app.netlify.com/drop

Option B — CLI:

```
npm run build
npx netlify-cli deploy --prod --dir=dist
```

Option C — Git: push this `site` folder to a repo and connect it in Netlify. `netlify.toml` already sets the build command and publish directory (set base directory to `site` if the repo root is the parent folder).
