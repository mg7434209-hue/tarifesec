import express from "express";
import cookieParser from "cookie-parser";
import compression from "compression";
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
const isDev = process.env.NODE_ENV === "development";

/**
 * Derlenmiş site NEREDE: dist/client
 *
 * Sunum artık NODE_ENV'e BAĞLI DEĞİL. railway.json başlatma komutu
 * `node dist/index.js` olduğu için NODE_ENV ayarlanmıyordu; değişken elle
 * tanımlanmadığında sunucu statik dosyaları ve SSR'ı tamamen atlıyor, her
 * sayfa 404 dönüyordu. Artık ölçüt basit ve güvenilir: derleme çıktısı
 * varsa ve geliştirme modunda değilsek siteyi sun.
 */
const distPath = path.join(__dirname, "../dist/client");
const indexFile = path.join(distPath, "index.html");
const hasBuild = fs.existsSync(indexFile);
const serveSite = hasBuild && !isDev;

// Railway proxy arkasında gerçek istemci IP'si (hız sınırı ve secure çerez için)
app.set("trust proxy", 1);
app.disable("x-powered-by");

/**
 * Sıkıştırma — HTML, JSON, JS, CSS, sitemap, llms.txt.
 * Railway kenarı yanıtları sıkıştırmıyor; sıkıştırmasız HTML/JS LCP'yi ve
 * Core Web Vitals'ı doğrudan kötüleştirir. Hız testi uçları HARİÇ: rastgele
 * baytları sıkıştırmaya çalışmak CPU harcar ve ölçümü bozar.
 */
app.use(
  compression({
    filter: (req, res) => !req.path.startsWith("/api/speedtest") && compression.filter(req, res),
  })
);

/**
 * Tek adres kuralı (yinelenen içerik önlemi):
 *  - www'suz alan adı → www (301)          tarifesec.net.tr → www.tarifesec.net.tr
 *  - http → https (301)                    yalnız kanonik alan adında
 *  - sondaki eğik çizgi → çizgisiz (301)   /paket-karsilastir/ → /paket-karsilastir
 * Railway'in *.up.railway.app adresi dizine girmesin diye noindex başlığı alır.
 */
const canonicalUrl = new URL(config.site.url);
const canonicalHost = canonicalUrl.host;
const apexHost = canonicalHost.replace(/^www\./, "");
app.use((req, res, next) => {
  const host = String(req.headers.host ?? "").toLowerCase();
  const proto = String(req.headers["x-forwarded-proto"] ?? req.protocol).split(",")[0].trim();
  const isCanonicalFamily = host === canonicalHost || host === apexHost;

  if (host.endsWith(".up.railway.app")) res.setHeader("X-Robots-Tag", "noindex, nofollow");
  if (req.path.startsWith("/api/") || (req.method !== "GET" && req.method !== "HEAD")) return next();

  const needsSlash = req.path.length > 1 && req.path.endsWith("/");
  const needsHost = isCanonicalFamily && host !== canonicalHost;
  const needsHttps = isCanonicalFamily && canonicalUrl.protocol === "https:" && proto === "http";
  if (!needsSlash && !needsHost && !needsHttps) return next();

  const qs = req.originalUrl.slice(req.path.length);
  // Baştaki çoklu eğik çizgi tekilleştirilir: "//kotu.site/" → göreli
  // yönlendirmede protokolsüz adres (açık yönlendirme) olmasın.
  const trimmed = needsSlash ? req.path.replace(/\/+$/, "") : req.path;
  const pathOnly = "/" + trimmed.replace(/^\/+/, "");
  const origin = isCanonicalFamily ? `${canonicalUrl.protocol}//${canonicalHost}` : "";
  res.redirect(301, `${origin}${pathOnly}${qs}`);
});

// Hız testi yüklemesi application/octet-stream gönderir; express.json ve
// urlencoded yalnızca kendi içerik türlerini ayrıştırdığı için ham gövde
// speedtest rotasına dokunulmadan ulaşır.
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// ─── Güvenlik başlıkları ─────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

if (isDev) {
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
// Sayfaların çektiği JSON uçları robots.txt'te taranabilir (render için),
// ama arama sonuçlarına girmemeli.
app.use("/api", (_req, res, next) => {
  res.setHeader("X-Robots-Tag", "noindex");
  next();
});
app.use("/api/packages", packagesRouter);
app.use("/api/mobile", mobileRouter);
app.use("/api/leads", leadsRouter);
app.use("/api/blog", blogRouter);
app.use("/api/setup", setupRouter);
app.use("/api/admin", adminRouter);
app.use("/api/visitors", visitorsRouter);
app.use("/api/speedtest", speedTestRouter);

/**
 * Sunucu ve bağlantı durumu — tarayıcıdan açılıp okunabilecek teşhis.
 *
 * Veritabanı bağlı değilse site AÇILIR ama paketler görünmez, ziyaretçi
 * sayacı her yeniden başlatmada sıfırlanır ve fiyat şeması (JSON-LD)
 * üretilemez. Bu durum daha önce yalnızca sunucu günlüğünde görünüyordu;
 * artık tek bir adresten anlaşılıyor.
 */
app.get("/api/health", async (_req, res) => {
  const out: Record<string, unknown> = {
    status: "ok",
    timestamp: new Date().toISOString(),
  };

  if (!process.env.DATABASE_URL) {
    out.database = "yapılandırılmamış";
    out.sorun =
      "DATABASE_URL tanımlı değil. Railway'de PostgreSQL servisi ekleyin — " +
      "paketler görünmez, ziyaretçi sayacı sıfırlanır ve fiyat şeması üretilemez.";
    return res.status(503).json(out);
  }

  try {
    const { db } = await import("../drizzle/db");
    const { sql } = await import("drizzle-orm");
    await db.execute(sql`select 1`);
    out.database = "bağlı";
    res.json(out);
  } catch (err) {
    out.status = "degraded";
    out.database = "bağlanamadı";
    out.sorun = (err as Error).message;
    res.status(503).json(out);
  }
});

/**
 * Veri tazeliği — DIŞARIDAN izlenmek için tasarlandı.
 *
 * Veri bayatsa 503 döner. UptimeRobot gibi ücretsiz bir izleme servisine bu
 * adresi verirseniz, tarama sessizce bozulduğunda size e-posta gelir; aksi
 * hâlde sorun yalnızca admin paneline bakıldığında fark edilir.
 */
app.get("/api/health/data", async (_req, res) => {
  try {
    const { healthReport } = await import("./health");
    const report = await healthReport();
    res.status(report.ok ? 200 : 503).json(report);
  } catch (err) {
    res.status(503).json({ ok: false, error: (err as Error).message });
  }
});

// Bilinmeyen API yolu HTML değil JSON 404 döndürsün
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Bulunamadı" });
});

// ─── Statik SPA + sunucu tarafı SEO render ────────────────────────────────────
if (serveSite) {
  // Şablon bir kez okunur
  const template = fs.readFileSync(indexFile, "utf8");

  // Hash'li varlıklar (dist/client/assets) bir yıl; adı sabit dosyalar
  // (og görseli, logo, favicon) bir gün — değişince eski kopya takılı kalmasın.
  app.use(
    express.static(distPath, {
      index: false,
      setHeaders(res, filePath) {
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (/\.(png|jpe?g|svg|webp|avif|ico)$/.test(filePath)) {
          res.setHeader("Cache-Control", "public, max-age=86400");
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
} else if (!isDev) {
  console.error(
    `⚠️  İstemci derlemesi bulunamadı: ${indexFile}\n` +
      "   'npm run build' çalıştırılmadan başlatılmış olabilir — site sayfa sunamaz."
  );
}

/**
 * Son çare hata yakalayıcı.
 *
 * Express'te yakalanmayan hata varsayılan olarak yığın izini (stack trace)
 * istemciye yazar — dosya yolları ve kod yapısı sızar. Bu katman hatayı
 * günlüğe alır, dışarıya yalnızca genel bir mesaj verir.
 */
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(`[hata] ${req.method} ${req.path}:`, err.message);
  if (res.headersSent) return;

  if (req.path.startsWith("/api/")) {
    res.status(500).json({ error: "Sunucu hatası" });
  } else {
    res.status(500).type("html").send(
      "<!doctype html><meta charset=\"utf-8\"><title>Sunucu hatası</title>" +
        "<p>Beklenmeyen bir hata oluştu. Lütfen birazdan tekrar deneyin.</p>" +
        "<p><a href=\"/\">Ana sayfa</a></p>"
    );
  }
});

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
