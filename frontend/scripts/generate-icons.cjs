const fs = require('fs');
const path = require('path');

// SVG da caixinha 3D — fundo azul marinho com box isométrica laranja
const makeIconSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="18" fill="#0f1f3d"/>
  <!-- Tampa laranja -->
  <polygon points="50,10 90,30 50,50 10,30" fill="#f97316"/>
  <!-- Lado esquerdo azul escuro -->
  <polygon points="10,30 50,50 50,90 10,70" fill="#1e3a6e"/>
  <!-- Lado direito azul médio -->
  <polygon points="90,30 50,50 50,90 90,70" fill="#2a4f8f"/>
  <!-- Borda da tampa -->
  <polyline points="50,10 90,30 50,50 10,30 50,10" fill="none" stroke="#fb923c" stroke-width="2"/>
  <!-- Aresta vertical central -->
  <line x1="50" y1="50" x2="50" y2="90" stroke="#3a5fa0" stroke-width="1.5"/>
</svg>`;

async function generate() {
  const dir = path.join(__dirname, '../public/icons');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.error('sharp não encontrado. Execute: npm install sharp --save-dev');
    process.exit(1);
  }

  for (const size of [192, 512]) {
    const svg = Buffer.from(makeIconSvg(size));
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(path.join(dir, `icon-${size}.png`));
    console.log(`✓ icon-${size}.png gerado`);
  }

  console.log('Ícones PWA gerados com sucesso!');
}

generate().catch((err) => {
  console.error('Erro ao gerar ícones:', err.message);
  process.exit(1);
});
