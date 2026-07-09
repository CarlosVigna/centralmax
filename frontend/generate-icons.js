// Gera icon-192.png e icon-512.png a partir do SVG
// Requer: npm install -g sharp  OU  node >=22 com API de canvas
// Uso: node generate-icons.js

const { createCanvas } = await import('canvas').catch(() => null) || {};

function drawIcon(canvas) {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const radius = size * 0.156;

  // Fundo laranja com bordas arredondadas
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  // Texto CM
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.43}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CM', size / 2, size / 2 + size * 0.03);
}

import fs from 'fs';

if (createCanvas) {
  for (const size of [192, 512]) {
    const canvas = createCanvas(size, size);
    drawIcon(canvas);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`public/icons/icon-${size}.png`, buffer);
    console.log(`Gerado: public/icons/icon-${size}.png`);
  }
} else {
  console.log('canvas não disponível. Use o SVG ou instale: npm install canvas');
  console.log('O SVG em public/icons/icon.svg funciona para PWA em browsers modernos.');
}
