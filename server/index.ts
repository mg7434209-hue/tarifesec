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
import { config } from "./config";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";

// Railway proxy arkasında gerçek istemci IP'si (hız sınırı ve secure çerez için)
app.set("trust proxy", 1);
app.disable("x-powered-by");

// Hız testi yüklemesi ham gövde olarak okunur; JSON parser'ı ona uygulama.
app.use("/api/speedtest/upload", (_req, _res, next) => next());
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

// ─── API ──────────────────────────────────────────────────────────────────────
app.use("/api/packages", packagesRouter);
app.use("/api/mobile", mobileRouter);
app.use("/api/leads", leadsRouter);
app.use("/api/blog", blogRouter);
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

// ─── Statik SPA ───────────────────────────────────────────────────────────────
if (isProd) {
  const distPath = path.join(__dirname, "../dist/client");
  const indexFile = path.join(distPath, "index.html");

  if (!fs.existsSync(indexFile)) {
    console.error(`⚠️  İstemci derlemesi bulunamadı: ${indexFile} — 'npm run build' çalıştırın.`);
  }

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

  app.get("*", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(indexFile);
  });
}

app.listen(PORT, () => {
  console.log(`🚀 ${config.site.name} ${PORT} portunda çalışıyor`);
  if (!process.env.ADMIN_SECRET) {
    console.warn("⚠️  ADMIN_SECRET tanımlı değil — /api/admin uçları kapalı (503).");
  }
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️  DATABASE_URL tanımlı değil — veritabanı çağrıları başarısız olacak.");
  }
});
