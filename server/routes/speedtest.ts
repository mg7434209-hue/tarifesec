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

const router = Router();

const noStore = (res: any) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
};

router.get("/ping", (_req, res) => {
  noStore(res);
  res.status(204).end();
});

router.get(
  "/download",
  rateLimit(config.rateLimit.speedTest),
  (req, res) => {
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

    req.on("close", () => res.destroy());
    write();
  }
);

router.post(
  "/upload",
  rateLimit(config.rateLimit.speedTest),
  (req, res) => {
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

    req.on("end", () => {
      if (aborted) return;
      noStore(res);
      res.json({ bytes: received });
    });
  }
);

/** Sonucu kaydet — anonim istatistik (IP/kişisel veri tutulmaz) */
router.post("/result", rateLimit(config.rateLimit.speedTest), async (req, res) => {
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
