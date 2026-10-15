/**
 * Hız testi API'si.
 *
 * Eski HizTesti sayfası fast.com'u <iframe> içine alıyordu; fast.com
 * X-Frame-Options/CSP ile çerçevelenmeyi engellediği için kullanıcı boş
 * kutu görüyordu. Test artık kendi sunucumuz üzerinden yapılır.
 *
 *  GET  /api/speedtest/ping                → gecikme ölçümü (boş 204)
 *  GET  /api/speedtest/download?bytes=N    → N bayt sıkıştırılamaz veri
 *  POST /api/speedtest/upload              → gövdeyi yutar, boyutu döner
 *  POST /api/speedtest/result              → sonucu kaydeder (istatistik)
 */
import { Router } from "express";
import crypto from "crypto";
import { db } from "../../drizzle/db";
import { speedTests } from "../../drizzle/schema";
import { desc, sql } from "drizzle-orm";
import { config } from "../config";
import { rateLimit } from "../middleware/rateLimit";
import { bandwidthLimit } from "../middleware/bandwidth";

const router = Router();

// Bant genişliği uçları bayt bütçesiyle sınırlanır (istek sayısıyla değil)
const bw = bandwidthLimit({
  windowMs: config.speedTest.budgetWindowMs,
  maxBytes: config.speedTest.budgetBytes,
});

/**
 * SUNUCU GENELİ günlük veri bütçesi (indirme + yükleme).
 *
 * IP başına bütçe tek kişinin kötüye kullanımını keser ama trafik patlamasını
 * (ör. ana sayfadaki test kartı viral olursa) kesmez; Railway trafiği
 * faturalandırır. Bütçe dolunca test o gün için "kapasite doldu" der, site
 * çalışmaya devam eder. Gün Türkiye saatine göre döner.
 */
const daily = { day: "", bytes: 0 };
const trDay = () => new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
const dailyLimit = () => config.speedTest.dailyBudgetGB * 1024 ** 3;

/** Son 7 günde testlerin başlatıldığı yer — ana sayfa kartı işe yarıyor mu? */
export async function speedTestSources(): Promise<Record<string, number>> {
  const r: any = await db.execute(
    sql`select coalesce(source, 'sayfa') as s, count(*)::int as n from speed_tests
        where created_at > now() - interval '7 days' group by 1`
  );
  const rows = r.rows ?? r;
  return Object.fromEntries(rows.map((x: any) => [x.s, Number(x.n)]));
}

export function speedTestUsage() {
  if (daily.day !== trDay()) return { gun: trDay(), kullanilanGB: 0, limitGB: config.speedTest.dailyBudgetGB };
  return {
    gun: daily.day,
    kullanilanGB: Math.round((daily.bytes / 1024 ** 3) * 100) / 100,
    limitGB: config.speedTest.dailyBudgetGB,
  };
}

function dailyGuard(_req: any, res: any, next: any) {
  if (daily.day !== trDay()) {
    daily.day = trDay();
    daily.bytes = 0;
  }
  if (daily.bytes >= dailyLimit()) {
    res.setHeader("Retry-After", "3600");
    return res.status(503).json({
      error: "Hız testi bugünlük kapasitesine ulaştı. Lütfen yarın tekrar deneyin.",
    });
  }
  next();
}

function chargeAll(req: any, bytes: number) {
  bw.charge(req, bytes);
  if (daily.day !== trDay()) {
    daily.day = trDay();
    daily.bytes = 0;
  }
  daily.bytes += bytes;
}

const noStore = (res: any) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
};

router.get("/ping", (_req, res) => {
  noStore(res);
  res.status(204).end();
});

router.get("/download", dailyGuard, bw.guard, (req, res) => {
    const requested = Number(req.query.bytes) || config.speedTest.defaultBytes;
    const total = Math.min(Math.max(requested, 1024), config.speedTest.maxDownloadBytes);

    noStore(res);
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Length", String(total));

    // Rastgele veri: ara katmanlar sıkıştıramaz, ölçüm gerçekçi kalır.
    const CHUNK = 64 * 1024;
    const chunk = crypto.randomBytes(CHUNK);
    let sent = 0;

    const write = () => {
      while (sent < total) {
        const size = Math.min(CHUNK, total - sent);
        const buf = size === CHUNK ? chunk : chunk.subarray(0, size);
        sent += size;
        if (!res.write(buf)) {
          res.once("drain", write);
          return;
        }
      }
      res.end();
    };

    // Akış kesilse de (istemci süre dolunca iptal eder — normaldir) gönderilen
    // bayt bütçeye yazılır. Eskiden yalnız "finish"te yazılıyordu; kesilen
    // indirmeler kotaya hiç girmiyordu.
    let charged = false;
    const charge = () => {
      if (charged) return;
      charged = true;
      chargeAll(req, sent);
    };
    req.on("close", () => {
      charge();
      res.destroy();
    });
    res.on("finish", charge);
    write();
});

router.post("/upload", dailyGuard, bw.guard, (req, res) => {
    let received = 0;
    let aborted = false;

    req.on("data", (c: Buffer) => {
      received += c.length;
      if (received > config.speedTest.maxUploadBytes && !aborted) {
        aborted = true;
        res.status(413).json({ error: "Çok büyük" });
        req.destroy();
      }
    });

    // Yükleme yarıda kesilse de alınan bayt bütçeye yazılır
    req.on("close", () => {
      if (!aborted && !req.complete) chargeAll(req, received);
    });

    req.on("end", () => {
      if (aborted) return;
      chargeAll(req, received);
      noStore(res);
      res.json({ bytes: received });
    });
});

/** Sonucu kaydet — anonim istatistik (IP/kişisel veri tutulmaz) */
router.post("/result", rateLimit(config.rateLimit.speedTestMeta), async (req, res) => {
  try {
    const download = Math.round(Number(req.body?.downloadSpeed));
    const upload = Math.round(Number(req.body?.uploadSpeed));
    const ping = Math.round(Number(req.body?.ping));

    if (![download, upload, ping].every((n) => Number.isFinite(n) && n >= 0 && n < 100000)) {
      return res.status(400).json({ error: "Geçersiz ölçüm" });
    }

    await db.insert(speedTests).values({
      downloadSpeed: download,
      uploadSpeed: upload,
      ping,
      isp: typeof req.body?.isp === "string" ? req.body.isp.slice(0, 100) : null,
      city: typeof req.body?.city === "string" ? req.body.city.slice(0, 50) : null,
      source: req.body?.source === "anasayfa" ? "anasayfa" : "sayfa",
    });

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("[speedtest] kayıt hatası:", (err as Error).message);
    res.status(500).json({ error: "Kaydedilemedi" });
  }
});

/** Ortalama değerler — sayfada "Türkiye ortalaması" karşılaştırması için */
router.get("/stats", async (_req, res) => {
  try {
    const [row] = await db
      .select({
        avgDownload: sql<number>`coalesce(round(avg(${speedTests.downloadSpeed})), 0)`,
        avgUpload: sql<number>`coalesce(round(avg(${speedTests.uploadSpeed})), 0)`,
        avgPing: sql<number>`coalesce(round(avg(${speedTests.ping})), 0)`,
        total: sql<number>`count(*)`,
      })
      .from(speedTests);

    res.json({
      avgDownload: Number(row?.avgDownload ?? 0),
      avgUpload: Number(row?.avgUpload ?? 0),
      avgPing: Number(row?.avgPing ?? 0),
      total: Number(row?.total ?? 0),
    });
  } catch {
    res.json({ avgDownload: 0, avgUpload: 0, avgPing: 0, total: 0 });
  }
});

export default router;
