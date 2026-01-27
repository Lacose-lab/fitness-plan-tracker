import sharp from 'sharp'

const svg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#4f8cff" />
      <stop offset="1" stop-color="#1dbf73" />
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${size}" height="${size}" rx="${Math.round(size*0.22)}" fill="url(#g)"/>
  <g fill="#0b0f1a" opacity="0.95">
    <path d="M ${size*0.25} ${size*0.58} L ${size*0.45} ${size*0.38} L ${size*0.55} ${size*0.48} L ${size*0.75} ${size*0.28} L ${size*0.78} ${size*0.31} L ${size*0.55} ${size*0.54} L ${size*0.45} ${size*0.44} L ${size*0.28} ${size*0.61} Z"/>
  </g>
</svg>`

await sharp(Buffer.from(svg(192))).png().toFile('public/pwa-192.png')
await sharp(Buffer.from(svg(512))).png().toFile('public/pwa-512.png')
console.log('icons generated')
