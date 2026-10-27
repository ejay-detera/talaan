import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svg = `
<svg width="800" height="1000" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#FAF8F4"/>
  <!-- Red margin rule on left -->
  <line x1="120" y1="0" x2="120" y2="1000" stroke="#E11D48" stroke-width="2"/>
  <!-- Horizontal notebook lines -->
  <line x1="0" y1="100" x2="800" y2="100" stroke="#CBD5E1" stroke-width="1"/>
  <line x1="0" y1="180" x2="800" y2="180" stroke="#CBD5E1" stroke-width="1"/>
  <line x1="0" y1="260" x2="800" y2="260" stroke="#CBD5E1" stroke-width="1"/>
  <line x1="0" y1="340" x2="800" y2="340" stroke="#CBD5E1" stroke-width="1"/>
  <line x1="0" y1="420" x2="800" y2="420" stroke="#CBD5E1" stroke-width="1"/>
  <line x1="0" y1="500" x2="800" y2="500" stroke="#CBD5E1" stroke-width="1"/>
  <line x1="0" y1="600" x2="800" y2="600" stroke="#CBD5E1" stroke-width="2"/>

  <!-- Handwritten notebook entries in dark ink -->
  <text x="150" y="80" font-family="sans-serif" font-size="26" fill="#0F172A" font-weight="bold">Oct 27, 2026 - Listahan</text>
  <text x="150" y="160" font-family="sans-serif" font-size="24" fill="#1E293B">Aling Nena - 3 Lucky Me @ 12 = 36</text>
  <text x="150" y="240" font-family="sans-serif" font-size="24" fill="#1E293B">Kuya Jun - 2 Coke Mismo @ 20 = 40</text>
  <text x="150" y="320" font-family="sans-serif" font-size="24" fill="#1E293B">Mang Jose - bayad 50</text>
  <text x="150" y="400" font-family="sans-serif" font-size="24" fill="#1E293B">Nanay Cora - 1 Safeguard = 45</text>
  <text x="150" y="580" font-family="sans-serif" font-size="28" fill="#DC2626" font-weight="bold">Total: 71</text>
</svg>
`;

const outputPath = path.join(__dirname, "../sample-notebook-test.jpg");

sharp(Buffer.from(svg))
  .jpeg({ quality: 90 })
  .toFile(outputPath)
  .then(() => console.log("Created sample-notebook-test.jpg successfully!"))
  .catch((err) => console.error(err));
