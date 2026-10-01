/**
 * Paylaşım görseli ve logo üretici — SVG kaynaklardan raster çıktı.
 *
 * Facebook, WhatsApp, X ve LinkedIn og:image olarak SVG KABUL ETMEZ; Google
 * da Organization logosu için raster (PNG/JPG) ister. Kaynak SVG değişirse:
 *   node tools/og-gorsel.mjs
 * Playwright + Chromium gerekir (projenin bağımlılığı değildir; global kurulu
 * olanı veya PLAYWRIGHT_MODULE ile verilen yolu kullanır).
 */
const mod = process.env.PLAYWRIGHT_MODULE || 'playwright';
const { chromium } = await import(mod).catch(() => import('/opt/node22/lib/node_modules/playwright/index.mjs'));
import fs from 'fs';
const b = await chromium.launch();
const shot = async (svgPath, w, h, out) => {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const svg = fs.readFileSync(svgPath, 'utf8');
  await p.setContent(`<html><body style="margin:0"><div style="width:${w}px;height:${h}px">${svg.replace('<svg ', `<svg style="width:${w}px;height:${h}px;display:block" `)}</div></body></html>`);
  await p.screenshot({ path: out, ...(out.endsWith('.jpg') ? { type: 'jpeg', quality: 86 } : {}), clip: { x: 0, y: 0, width: w, height: h } });
};
await shot('client/public/og-tarifesec.svg', 1200, 630, 'client/public/og-tarifesec.jpg');
await shot('client/public/favicon.svg', 512, 512, 'client/public/logo-512.png');
await shot('client/public/favicon.svg', 180, 180, 'client/public/apple-touch-icon.png');
await b.close();
