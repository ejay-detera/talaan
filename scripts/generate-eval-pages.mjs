import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.join(__dirname, "../eval/pages-30");

const CUSTOMERS = [
  "Mang Jose",
  "Ate Baby",
  "Nanay Cora",
  "Kuya Jun",
  "Aling Rosa",
  "Tito Boy",
  "Ate Lorna",
  "Mangardo",
];

const ITEMS = [
  { item: "corned beef", price: 38 },
  { item: "pancit canton", price: 12 },
  { item: "kopiko brown", price: 20 },
  { item: "bigas 1kg", price: 55 },
  { item: "sardinas", price: 24 },
  { item: "coke mismo", price: 20 },
  { item: "safeguard", price: 45 },
  { item: "itlog", price: 9 },
  { item: "mantika bote", price: 35 },
  { item: "asukal 1/4", price: 25 },
];

function buildPageSpec(index) {
  const pageNum = String(index + 1).padStart(2, "0");
  const pageId = `page-${pageNum}`;
  const dateStr = `Oct ${(index % 28) + 1}, 2026`;

  // Pages 28-30: Unreadable blurry pages
  if (index >= 27) {
    return {
      page_id: pageId,
      synthetic: true,
      category: "unreadable",
      page_date: null,
      unreadable: true,
      written_total: null,
      expected_computed_total: 0,
      has_page_discrepancy: false,
      entries: [],
      linesText: ["~~~ ### ???", "... illegible smudge ...", "/// ???"],
      blurSigma: 22,
      rotateDeg: index === 28 ? -4 : 3,
    };
  }

  const isDiscrepancyPage = index >= 15 && index < 27;
  const rowCount = 3 + (index % 2); // 3 or 4 rows per page
  const entries = [];
  const linesText = [];
  let trueTotal = 0;

  for (let r = 0; r < rowCount; r++) {
    const cust = CUSTOMERS[(index * 3 + r) % CUSTOMERS.length];
    const prod = ITEMS[(index * 2 + r) % ITEMS.length];
    const qty = ((index + r) % 3) + 1;
    const trueRowAmt = qty * prod.price;

    // On discrepancy pages 16-23, plant a row multiplication error on row 0
    const plantRowError = isDiscrepancyPage && index < 23 && r === 0;
    const writtenRowAmt = plantRowError ? trueRowAmt + 10 : trueRowAmt;

    entries.push({
      customer_name: cust,
      item: prod.item,
      quantity: qty,
      unit_price: prod.price,
      amount: writtenRowAmt,
      entry_type: "credit",
      line_discrepancy: plantRowError,
    });

    trueTotal += trueRowAmt;
    linesText.push(`${cust} - ${qty} ${prod.item} @ ${prod.price} = ${writtenRowAmt}`);
  }

  // Add a payment row on every 4th clean page
  if (!isDiscrepancyPage && index % 4 === 0) {
    const cust = CUSTOMERS[index % CUSTOMERS.length];
    entries.push({
      customer_name: cust,
      item: "Bayad",
      quantity: null,
      unit_price: null,
      amount: 50,
      entry_type: "payment",
      line_discrepancy: false,
    });
    trueTotal -= 50;
    linesText.push(`${cust} - bayad 50`);
  }

  // On discrepancy pages 24-27, plant a page total addition error
  const writtenTotal = isDiscrepancyPage ? trueTotal + 10 : trueTotal;

  return {
    page_id: pageId,
    synthetic: true,
    category: isDiscrepancyPage ? "discrepancy" : "clean",
    page_date: `2026-10-${String((index % 28) + 1).padStart(2, "0")}`,
    unreadable: false,
    written_total: writtenTotal,
    expected_computed_total: trueTotal,
    has_page_discrepancy: isDiscrepancyPage,
    entries,
    dateHeader: `${dateStr} - Listahan #${pageNum}`,
    linesText,
    blurSigma: 0,
    rotateDeg: ((index % 3) - 1) * 0.8,
  };
}

function renderSvg(spec) {
  const bgColors = ["#FAF8F4", "#F4F6EE", "#FDFBF7"];
  const bg = bgColors[parseInt(spec.page_id.slice(-2), 10) % bgColors.length];
  const textOpacity = spec.unreadable ? "0.18" : "0.92";

  const rowsSvg = spec.linesText
    .map((line, idx) => {
      const y = 175 + idx * 80;
      const escaped = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<text x="145" y="${y}" font-family="sans-serif" font-size="24" fill="#1E293B" fill-opacity="${textOpacity}">${escaped}</text>`;
    })
    .join("\n  ");

  const totalLine =
    spec.written_total !== null
      ? `<text x="145" y="575" font-family="sans-serif" font-size="28" fill="#B91C1C" font-weight="bold" fill-opacity="${textOpacity}">Total = ${spec.written_total}</text>`
      : "";

  return `<svg width="800" height="720" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bg}"/>
  <g transform="rotate(${spec.rotateDeg} 400 360)">
    <line x1="115" y1="0" x2="115" y2="720" stroke="#C8302F" stroke-width="2"/>
    <line x1="0" y1="110" x2="800" y2="110" stroke="#CBD5E1" stroke-width="1"/>
    <line x1="0" y1="190" x2="800" y2="190" stroke="#CBD5E1" stroke-width="1"/>
    <line x1="0" y1="270" x2="800" y2="270" stroke="#CBD5E1" stroke-width="1"/>
    <line x1="0" y1="350" x2="800" y2="350" stroke="#CBD5E1" stroke-width="1"/>
    <line x1="0" y1="430" x2="800" y2="430" stroke="#CBD5E1" stroke-width="1"/>
    <line x1="0" y1="510" x2="800" y2="510" stroke="#CBD5E1" stroke-width="1"/>
    <line x1="0" y1="600" x2="800" y2="600" stroke="#CBD5E1" stroke-width="2"/>
    ${
      spec.dateHeader
        ? `<text x="145" y="88" font-family="sans-serif" font-size="26" fill="#0F172A" font-weight="bold" fill-opacity="${textOpacity}">${spec.dateHeader}</text>`
        : ""
    }
    ${rowsSvg}
    ${totalLine}
  </g>
</svg>`;
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });

  for (let i = 0; i < 30; i++) {
    const spec = buildPageSpec(i);
    const svg = renderSvg(spec);
    const jpgPath = path.join(outDir, `${spec.page_id}.jpg`);
    const jsonPath = path.join(outDir, `${spec.page_id}.json`);

    let pipeline = sharp(Buffer.from(svg));
    if (spec.blurSigma > 0) {
      pipeline = pipeline.blur(spec.blurSigma);
    }
    await pipeline.jpeg({ quality: 88 }).toFile(jpgPath);

    const groundTruth = {
      page_id: spec.page_id,
      synthetic: spec.synthetic,
      category: spec.category,
      page_date: spec.page_date,
      unreadable: spec.unreadable,
      written_total: spec.written_total,
      expected_computed_total: spec.expected_computed_total,
      has_page_discrepancy: spec.has_page_discrepancy,
      entries: spec.entries,
    };

    await fs.writeFile(jsonPath, JSON.stringify(groundTruth, null, 2) + "\n", "utf8");
  }

  console.log("Generated 30 synthetic notebook pages and ground-truth JSONs in eval/pages-30/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

