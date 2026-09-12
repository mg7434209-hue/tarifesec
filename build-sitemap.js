/**
 * sitemap.xml üretici — `npm run build` içinde çalışır.
 * Rotalar client/src/App.tsx ile aynı tutulmalıdır.
 */
import fs from "fs";
import path from "path";

const SITE = (process.env.SITE_URL || "https://www.tarifesec.net.tr").replace(/\/$/, "");

const ROUTES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/paket-karsilastir", priority: "0.9", changefreq: "daily" },
  { path: "/mobil-tarifeler", priority: "0.9", changefreq: "daily" },
  { path: "/hiz-testi", priority: "0.7", changefreq: "weekly" },
  { path: "/blog", priority: "0.6", changefreq: "weekly" },
];

const lastmod = new Date().toISOString().slice(0, 10);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(
  (r) => `  <url>
    <loc>${SITE}${r.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
).join("\n")}
</urlset>
`;

// Hem kaynak public/ hem de derlenmiş dist/client/ içine yaz
const targets = [
  path.join(process.cwd(), "client", "public", "sitemap.xml"),
  path.join(process.cwd(), "dist", "client", "sitemap.xml"),
];

for (const t of targets) {
  if (!fs.existsSync(path.dirname(t))) continue;
  fs.writeFileSync(t, xml, "utf8");
  console.log(`🗺️  sitemap yazıldı: ${path.relative(process.cwd(), t)}`);
}
