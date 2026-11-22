// Genera les icones PNG de la PWA a partir de public/favicon.svg.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const BG = '#fbe4ea';
const svg = readFileSync(new URL('../public/favicon.svg', import.meta.url), 'utf8');
const out = (name) => fileURLToPath(new URL(`../public/${name}`, import.meta.url));

// Icones normals: tal com l'SVG (cantonades arrodonides).
await sharp(Buffer.from(svg)).resize(192, 192).png().toFile(out('pwa-192x192.png'));
await sharp(Buffer.from(svg)).resize(512, 512).png().toFile(out('pwa-512x512.png'));

// Maskable i Apple: fons ple (el sistema hi aplica la seva forma) i el dibuix dins la zona segura.
const artwork = Buffer.from(svg.replace(`fill="${BG}"`, 'fill="none"'));
async function fullBleed(size, inner, file) {
  const art = await sharp(artwork).resize(inner, inner).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: art, gravity: 'center' }])
    .png()
    .toFile(out(file));
}
await fullBleed(512, 420, 'maskable-512x512.png');
await fullBleed(180, 160, 'apple-touch-icon.png');
console.log('Icones generades.');
