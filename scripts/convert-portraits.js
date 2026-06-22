/**
 * Convert all recovered portrait photos to Benday dot halftone PNGs.
 *
 * Settings locked in from testing:
 *   blackPoint 100 | whitePoint 210 | gamma 1.1
 *   stepSize 4 | minDot 1 | maxDot 3.5
 *
 * Output: app/public/portraits/<name-genealogical-id>.png
 * Naming convention matches the old site's people URL slugs with the
 * genealogical ID moved to a numeric suffix.
 */

const sharp = require('sharp');
const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const SETTINGS = {
  targetWidth: 800,
  gamma: 1.1,
  blackPoint: 100,
  whitePoint: 210,
  stepSize: 4,
  minDotSize: 1,
  maxDotSize: 3.5,
};

const PEOPLE_DIR = path.join(__dirname, '../archive/site/emmetry.org/sites/default/files/people');
const FILES_DIR  = path.join(__dirname, '../archive/site/emmetry.org/sites/default/files');
const OUT_DIR    = path.join(__dirname, '../app/public/portraits');

// [source filename, output slug]
const PORTRAITS = [
  ['thomas-addis-emmet1_young.jpg',         'thomas-addis-emmet-1'],       // Thomas (1) Addis Emmet
  ['miss-MARGARET-TAEsister-72dpi.jpg',     'margaret-emmet-3'],           // Margaret (3) Emmet
  ['elizabeth-4-emmet',                     'elizabeth-emmet-4'],          // Elizabeth (4) Emmet — see note
  ['johnpatten-5-EMMET72dpi.jpg',           'john-patten-emmet-5'],        // John (5) Patten Emmet
  ['thomas-addis-6_EMMET-72dpi.jpg',        'thomas-addis-emmet-jr-6'],    // Thomas (6) Addis Emmet Jr.
  ['christopher-7-templeEMMET-72dpi.jpg',   'christopher-temple-emmet-7'], // Christopher (7) Temple Emmet
  ['jane-8EMMET-mcevers-72dpi.jpg',         'jane-emmet-8'],               // Jane (8) Emmet
  ['mary-anne-10-EMMET-graves72dpi.jpg',    'mary-anne-emmet-10'],         // Mary (10) Anne Emmet
  ['william-colville-11EMMET-72dpi.jpg',    'william-colville-emmet-11'],  // William (11) Colville Emmet
  ['jane-EMMET27-griswold-72dpi.jpg',       'jane-emmet-27'],              // Jane (27) Emmet
  ['neddy%20graves.jpg',                    'edward-boonen-graves-40b'],   // Edward (40B) Boonen Graves
  ['drTAE-25-72dpi-2ndversion.jpg',         'thomas-addis-emmet-25'],      // Thomas (25) Addis Emmet
  ['robert%20temple%20emmet.jpg',           'robert-emmet-2'],             // Robert (2) Emmet
  ['ellen-bay-gertrude-rand.jpeg.jpg',      'ellen-bay-gertrude-emmet-63'],// Ellen (63) "Bay" Gertrude Emmet
].map(([src, slug]) => ({
  src: path.join(PEOPLE_DIR, src),
  out: path.join(OUT_DIR, `${slug}.png`),
  slug,
}));

// Jane Patten Emmet is in files/ root, not people/ — married-in, no genealogical ID
PORTRAITS.push({
  src: path.join(FILES_DIR, 'jane-patten-emmet.jpg'),
  out: path.join(OUT_DIR, 'jane-patten-emmet.png'),
  slug: 'jane-patten-emmet',
});

// mrselizabethEMMET-4 is the actual file for Elizabeth (4)
PORTRAITS[2].src = path.join(PEOPLE_DIR, 'mrselizabethEMMET-4-leroy72dpi.jpg');

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
      ctx.fillRect(x + stepSize / 2 - half, y + stepSize / 2 - half, dotSize, dotSize);
    }
  }

  fs.writeFileSync(outputPath, canvas.toBuffer('image/png'));
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let ok = 0;
  let skipped = 0;

  for (const { src, out, slug } of PORTRAITS) {
    if (!fs.existsSync(src)) {
      console.warn(`  SKIP (not found): ${path.basename(src)}`);
      skipped++;
      continue;
    }
    process.stdout.write(`  ${slug} ...`);
    await benday(src, out);
    console.log(' done');
    ok++;
  }

  console.log(`\n${ok} portraits written to ${OUT_DIR}`);
  if (skipped) console.log(`${skipped} skipped (source not found)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
