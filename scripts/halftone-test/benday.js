/**
 * Benday dot halftone effect
 *
 * Matches tooooools.app/effects/dots with:
 *   Blur 0 | Grain 0 | Gamma 1.1 | Black Point 33 | White Point 255
 *   Grid: Regular Benday | Angle 0 | Min Dot 2 | Max Dot 4
 *   Corner Radius 0 | Step 4 | Noise 0
 *
 * Source images are ~200px wide at 72dpi; we upscale to TARGET_WIDTH before
 * applying the dot grid so the effect has enough pixels to work with.
 */
const sharp = require('sharp');
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const SETTINGS = {
  targetWidth: 800,
  gamma: 1.1,
  blackPoint: 100,   // was 33 — push shadows deeper
  whitePoint: 210,  // pull highlights in slightly
  stepSize: 4,
  minDotSize: 1,
  maxDotSize: 3.5,
};

async function benday(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .resize(SETTINGS.targetWidth, null, { kernel: 'lanczos3' })
    .greyscale()
    .gamma(SETTINGS.gamma)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;

  const range = SETTINGS.whitePoint - SETTINGS.blackPoint;
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.round(
      Math.max(0, Math.min(255, ((data[i] - SETTINGS.blackPoint) / range) * 255))
    );
  }

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#1a1a1a';

  const { stepSize, minDotSize, maxDotSize } = SETTINGS;

  for (let y = 0; y < height; y += stepSize) {
    for (let x = 0; x < width; x += stepSize) {
      const sampleX = Math.min(Math.round(x + stepSize / 2), width - 1);
      const sampleY = Math.min(Math.round(y + stepSize / 2), height - 1);
      const luminance = data[sampleY * width + sampleX] / 255;

      const dotSize = minDotSize + (1 - luminance) * (maxDotSize - minDotSize);
      const half = dotSize / 2;
      const cx = x + stepSize / 2 - half;
      const cy = y + stepSize / 2 - half;

      ctx.fillRect(cx, cy, dotSize, dotSize);
    }
  }

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`  -> ${path.basename(outputPath)}`);
}

async function main() {
  const portraits = [
    'thomas-addis-emmet1_young.jpg',
    'johnpatten-5-EMMET72dpi.jpg',
    'miss-MARGARET-TAEsister-72dpi.jpg',
    'william-colville-11EMMET-72dpi.jpg',
    'christopher-7-templeEMMET-72dpi.jpg',
  ];

  const srcDir = path.join(
    __dirname,
    '../../archive/site/emmetry.org/sites/default/files/people'
  );
  const outDir = path.join(__dirname, 'out');

  for (const name of portraits) {
    const src = path.join(srcDir, name);
    const out = path.join(outDir, name.replace(/\.jpg$/i, '.png'));
    console.log(`Processing: ${name}`);
    await benday(src, out);
  }

  console.log(`\nDone. Output in: ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
