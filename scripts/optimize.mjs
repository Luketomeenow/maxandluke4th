import { readdir, mkdir, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import sharp from "sharp";
import ffmpeg from "ffmpeg-static";

const ROOT = path.resolve(import.meta.dirname, "..", "..");
const OUT = path.resolve(import.meta.dirname, "..", "public", "photos");
const IMG_EXT = new Set([".jpg", ".jpeg", ".png"]);
const VID_EXT = new Set([".mov", ".mp4"]);
// years whose videos are converted and shown in the gallery
const VIDEO_YEARS = new Set([4]);

const years = [1, 2, 3, 4];
const manifest = {};

// three rungs: 480px thumb for tiles, 960px for large tiles / retina,
// 1600px for the lightbox
const SIZES = [
  { suffix: "", width: 1600, quality: 76 },
  { suffix: "-m", width: 960, quality: 72 },
  { suffix: "-t", width: 480, quality: 70 },
];

async function toWebp(input, outDir, name) {
  const full = await sharp(input)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 76 })
    .toBuffer();
  await writeFile(path.join(outDir, `${name}.webp`), full);
  for (const { suffix, width, quality } of SIZES.slice(1)) {
    const buf = await sharp(full)
      .resize({ width, height: width, fit: "inside", withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
    await writeFile(path.join(outDir, `${name}${suffix}.webp`), buf);
  }
  const meta = await sharp(full).metadata();
  const { dominant } = await sharp(full).stats();
  return {
    w: meta.width,
    h: meta.height,
    color: `rgb(${dominant.r},${dominant.g},${dominant.b})`,
  };
}

for (const year of years) {
  const srcDir = path.join(ROOT, `Year ${year}`, "iCloud Photos");
  const outDir = path.join(OUT, `y${year}`);
  await mkdir(outDir, { recursive: true });

  const all = await readdir(srcDir);
  const images = all.filter((f) => IMG_EXT.has(path.extname(f).toLowerCase())).sort();
  const videos = VIDEO_YEARS.has(year)
    ? all.filter((f) => VID_EXT.has(path.extname(f).toLowerCase())).sort()
    : [];
  const imageBasenames = new Map(
    images.map((f) => [path.parse(f).name.toLowerCase(), f])
  );

  /* ---- images ---- */
  const entries = [];
  const entryByBasename = new Map();
  let i = 0;
  for (const file of images) {
    i += 1;
    const id = String(i).padStart(3, "0");
    try {
      const { w, h, color } = await toWebp(path.join(srcDir, file), outDir, id);
      const base = `/photos/y${year}/${id}`;
      const entry = { src: `${base}.webp`, m: `${base}-m.webp`, t: `${base}-t.webp`, w, h, color };
      entries.push(entry);
      entryByBasename.set(path.parse(file).name.toLowerCase(), entry);
    } catch (err) {
      console.warn(`skip ${file}: ${err.message}`);
    }
  }

  /* ---- videos (converted once, cached by source name) ---- */
  const standalone = [];
  for (const file of videos) {
    const base = path.parse(file).name.toLowerCase();
    const outName = `v-${base.replace(/[^a-z0-9_-]/g, "")}.mp4`;
    const outPath = path.join(outDir, outName);
    try {
      if (!existsSync(outPath)) {
        console.log(`converting ${file}...`);
        execFileSync(ffmpeg, [
          "-y", "-i", path.join(srcDir, file),
          "-vf", "scale=960:960:force_original_aspect_ratio=decrease:force_divisible_by=2",
          "-an",
          "-c:v", "libx264",
          "-preset", "fast",
          "-crf", "27",
          "-pix_fmt", "yuv420p",
          "-movflags", "+faststart",
          outPath,
        ], { stdio: ["ignore", "ignore", "pipe"] });
      }

      const videoSrc = `/photos/y${year}/${outName}`;
      const paired = entryByBasename.get(base);
      if (paired) {
        // Live Photo: the still becomes the poster, the clip plays in place
        paired.video = videoSrc;
      } else {
        // standalone video: grab a poster frame from the converted file
        const frame = path.join(outDir, `v-${base}-frame.jpg`);
        execFileSync(ffmpeg, ["-y", "-ss", "0.5", "-i", outPath, "-frames:v", "1", frame], {
          stdio: ["ignore", "ignore", "pipe"],
        });
        const posterBase = `v-${base.replace(/[^a-z0-9_-]/g, "")}`;
        const { w, h, color } = await toWebp(frame, outDir, posterBase);
        await rm(frame);
        const urlBase = `/photos/y${year}/${posterBase}`;
        standalone.push({
          src: `${urlBase}.webp`,
          m: `${urlBase}-m.webp`,
          t: `${urlBase}-t.webp`,
          w, h, color,
          video: videoSrc,
        });
      }
    } catch (err) {
      console.warn(`skip video ${file}: ${err.message}`);
    }
  }

  // spread standalone videos through the list instead of stacking them at the end
  if (standalone.length) {
    const step = Math.floor(entries.length / (standalone.length + 1));
    standalone.forEach((v, k) => entries.splice((k + 1) * step + k, 0, v));
  }

  manifest[`y${year}`] = entries;
  const vidCount = entries.filter((e) => e.video).length;
  console.log(`Year ${year}: ${entries.length} entries (${vidCount} with video)`);
}

await writeFile(
  path.resolve(import.meta.dirname, "..", "src", "manifest.json"),
  JSON.stringify(manifest)
);
console.log("manifest written");
