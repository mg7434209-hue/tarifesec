import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import packagesRouter from "./routes/packages";
import mobileRouter from "./routes/mobile";
import leadsRouter from "./routes/leads";
import blogRouter from "./routes/blog";
import adminRouter from "./routes/admin";
import visitorsRouter from "./routes/visitors";
import speedTestRouter from "./routes/speedtest";
import seoRouter from "./routes/seo";
import setupRouter from "./routes/setup";
import { renderRoute } from "./seo/render";
import { config } from "./config";
import { startScheduler } from "./scheduler";
import { bootstrap } from "./bootstrap";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";

// Railway proxy arkasında gerçek istemci IP'si (hız sınırı ve secure çerez için)
app.set("trust proxy", 1);
app.disable("x-powered-by");

// Hız testi yüklemesi application/octet-stream gönderir; express.json ve
// urlencoded yalnızca kendi içerik türlerini ayrıştırdığı için ham gövde
// speedtest rotasına dokunulmadan ulaşır.
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// ─── Güvenlik başlıkları ─────────────────────────────────────────────────────
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  if (isProd) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

if (!isProd) {
  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-secret");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    next();
  });
}

// ─── SEO / AEO uçları (statikten ÖNCE: canlı veriden üretilir) ───────────────
app.use(seoRouter);

// ─── API ──────────────────────────────────────────────────────────────────────
app.use("/api/packages", packagesRouter);
app.use("/api/mobile", mobileRouter);
app.use("/api/leads", leadsRouter);
app.use("/api/blog", blogRouter);
app.use("/api/setup", setupRouter);
app.use("/api/admin", adminRouter);
app.use("/api/visitors", visitorsRouter);
app.use("/api/speedtest", speedTestRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Bilinmeyen API yolu HTML değil JSON 404 döndürsün
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Bulunamadı" });
});

// ─── Statik SPA + sunucu tarafı SEO render ────────────────────────────────────
if (isProd) {
  const distPath = path.join(__dirname, "../dist/client");
  const indexFile = path.join(distPath, "index.html");

  if (!fs.existsSync(indexFile)) {
    console.error(`⚠️  İstemci derlemesi bulunamadı: ${indexFile} — 'npm run build' çalıştırın.`);
  }

  // Şablon bir kez okunur
  const template = fs.existsSync(indexFile) ? fs.readFileSync(indexFile, "utf8") : "";

  // Hash'li varlıklar uzun süre, index.html hiç önbelleğe alınmaz
  app.use(
    express.static(distPath, {
      index: false,
      setHeaders(res, filePath) {
        if (/\.(js|css|woff2?|png|jpe?g|svg|webp|avif)$/.test(filePath)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );

  /**
   * SPA istemcide render edildiği için JS çalıştırmayan istemciler
   * (GPTBot, ClaudeBot, PerplexityBot ve Googlebot'un ilk turu) boş bir
   * <div id="root"> görüyordu; her URL aynı başlıkla indeksleniyordu.
   * Artık her rota sunucuda kendi başlığı, açıklaması, canonical'ı,
   * JSON-LD'si ve gerçek içeriğiyle basılır.
   */
  app.get("*", async (req, res) => {
    if (!template) return res.status(503).send("Derleme bulunamadı");

    try {
      const { html, status } = await renderRoute(req.path, template);
      res.status(status);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300, must-revalidate");
      res.send(html);
    } catch (err) {
      console.error("[seo] render hatası:", (err as Error).message);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(template); // en kötü ihtimalle ham SPA kabuğu
    }
  });
}

app.listen(PORT, async () => {
  console.log(`🚀 ${config.site.name} ${PORT} portunda çalışıyor`);

  if (!process.env.DATABASE_URL) {
    console.warn("⚠️  DATABASE_URL tanımlı değil — veritabanı çağrıları başarısız olacak.");
  }

  // Şema güncellemesi + ilk veri yüklemesi (elle komut gerektirmez)
  await bootstrap();

  if (!process.env.ADMIN_SECRET) {
    const { needsSetup } = await import("./adminAuth");
    if (await needsSetup()) {
      console.warn(
        "⚠️  Yönetim şifresi henüz belirlenmedi. /admin adresini açıp HEMEN " +
          "bir şifre belirleyin — o ana kadar adresi bulan herkes belirleyebilir."
      );
    }
  }

  startScheduler();
});
