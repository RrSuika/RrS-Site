import sharp from "sharp";

const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid" width="52" height="90" patternUnits="userSpaceOnUse">
      <path d="M52 0H0V90" fill="none" stroke="rgba(255,255,255,0.045)" stroke-width="1"/>
      <path d="M26 0L52 45L26 90L0 45Z" fill="none" stroke="rgba(255,255,255,0.025)" stroke-width="1"/>
    </pattern>
    <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="1" fill="rgba(255,255,255,0.025)"/>
    </pattern>
    <radialGradient id="glow" cx="0.15" cy="0.1" r="1.1">
      <stop offset="0%" stop-color="#e8943a" stop-opacity="0.16"/>
      <stop offset="60%" stop-color="#e8943a" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#07070d" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.9">
      <stop offset="60%" stop-color="#07070d" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.5"/>
    </radialGradient>
  </defs>

  <!-- Ground -->
  <rect width="1200" height="630" fill="#07070d"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="1200" height="630" fill="url(#scan)"/>
  <rect width="1200" height="630" fill="url(#vignette)"/>

  <!-- Corner brackets — right side mirrored to match left -->
  <g stroke="#e8943a" stroke-width="4" fill="none" opacity="0.85">
    <path d="M50 92V50H92"/>
    <path d="M1150 92V50H1108"/>
    <path d="M50 538V580H92"/>
    <path d="M1150 538V580H1108"/>
  </g>

  <!-- Data tag -->
  <text x="110" y="168" font-family="Consolas, monospace" font-size="24" letter-spacing="6" fill="#e8943a">RrSuika_STUDIO // PORTFOLIO_DATABASE</text>

  <!-- Title. ⚠️ At 158 the ink ran 115 -> 1279 on a 1200px card, clipping the
       final "O" off the right edge. Measured with Consolas: each +1 of font-size
       moves the right edge ~7.6px, so 134 lands it at ~1088 — flush with the
       right-aligned URL above it and clear of the corner bracket at x=1108. -->
  <text x="105" y="348" font-family="Consolas, monospace" font-weight="bold" font-size="134" letter-spacing="-3" fill="#e8e6e0">RrSuika STUDIO</text>

  <!-- Tagline — sized to stay inside the right bracket -->
  <text x="110" y="408" font-family="Consolas, monospace" font-size="26" letter-spacing="2" fill="#8a8880">INDUSTRIAL DESIGN x EMBEDDED SYSTEMS x CREATIVE MAKING</text>

  <!-- Tri-color stripe -->
  <rect x="110" y="522" width="170" height="10" fill="#e04040"/>
  <rect x="290" y="522" width="170" height="10" fill="#f0c040"/>
  <rect x="470" y="522" width="170" height="10" fill="#3ab8d8"/>

  <!-- URL -->
  <text x="1090" y="532" text-anchor="end" font-family="Consolas, monospace" font-size="26" fill="rgba(232,148,58,0.85)">rrsuika-studio.pages.dev</text>

  <!-- Chinese tagline -->
  <text x="110" y="560" font-family="Consolas, monospace" font-size="22" fill="rgba(255,255,255,0.38)">个人网站 // 工业设计 x 嵌入式系统 x 创意制造</text>
</svg>`;

// ---------------------------------------------------------------------------
// Guard: the ink of every <text> must stay inside the canvas.
// ⚠️ librsvg (which sharp uses) IGNORES `textLength`/`lengthAdjust` — verified by
// rendering both variants and getting byte-identical bounds — so there is no way
// to pin the text width font-independently. The only protection is to measure
// what actually got rasterised and refuse to write a card that overflows.
// Done by diffing the full card against the same card with the text removed:
// everything else (grid, glow, scanlines, vignette, brackets) cancels out.
// ---------------------------------------------------------------------------
const TEXT_SAFE_MARGIN = 24;

async function textInkBounds(source) {
  const withoutText = source.replace(/<text\b[^>]*>[\s\S]*?<\/text>/g, "");
  const a = await sharp(Buffer.from(source)).raw().toBuffer({ resolveWithObject: true });
  const b = await sharp(Buffer.from(withoutText)).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = a.info;
  const ch = Math.min(a.info.channels, b.info.channels);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * a.info.channels;
      const j = (y * width + x) * b.info.channels;
      let d = 0;
      for (let c = 0; c < ch; c++) d = Math.max(d, Math.abs(a.data[i + c] - b.data[j + c]));
      if (d > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, maxX, minY, maxY };
}

const bounds = await textInkBounds(svg);
const canvasW = Number(svg.match(/width="(\d+)"/)[1]);
const canvasH = Number(svg.match(/height="(\d+)"/)[1]);
console.log(
  `text ink spans x ${bounds.minX}..${bounds.maxX}, y ${bounds.minY}..${bounds.maxY} ` +
  `(canvas ${canvasW}x${canvasH}, safe margin ${TEXT_SAFE_MARGIN})`
);

const overflow = [];
if (bounds.maxX > canvasW - TEXT_SAFE_MARGIN) overflow.push(`right by ${bounds.maxX - (canvasW - TEXT_SAFE_MARGIN)}px`);
if (bounds.minX < TEXT_SAFE_MARGIN) overflow.push(`left by ${TEXT_SAFE_MARGIN - bounds.minX}px`);
if (bounds.maxY > canvasH - TEXT_SAFE_MARGIN) overflow.push(`bottom by ${bounds.maxY - (canvasH - TEXT_SAFE_MARGIN)}px`);
if (bounds.minY < TEXT_SAFE_MARGIN) overflow.push(`top by ${TEXT_SAFE_MARGIN - bounds.minY}px`);

if (overflow.length) {
  throw new Error(
    `OG card text leaves the safe area (${overflow.join(", ")}). ` +
    `Nothing was written. Reduce the offending font-size in this file — ` +
    `the title moves ~7.6px of right edge per +1 of font-size with Consolas.`
  );
}

await sharp(Buffer.from(svg))
  .png()
  .toFile("public/og-card.png");

console.log("og-card.png generated");
