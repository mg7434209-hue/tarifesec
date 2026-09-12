/**
 * Admin API — x-admin-secret başlığı ile korunur (server/middleware/auth.ts).
 * ADMIN_SECRET tanımlı değilse uçlar fail-closed çalışır (503).
 */
import { Router } from "express";
import { db } from "../../drizzle/db";
import { packages, mobileTariffs, scrapeLog, leads } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth";

const router = Router();

router.use(requireAdmin);

// ─── Fiyat değişiklikleri — onay bekleyenler ─────────────────────────────────
router.get("/price-changes", async (_req, res) => {
  try {
    const changedPackages = await db.select().from(packages)
      .where(eq(packages.priceChanged, true))
      .orderBy(desc(packages.updatedAt));

    const changedMobile = await db.select().from(mobileTariffs)
      .where(eq(mobileTariffs.priceChanged, true))
      .orderBy(desc(mobileTariffs.updatedAt));

    res.json({
      packages: changedPackages,
      mobile: changedMobile,
      total: changedPackages.length + changedMobile.length,
    });
  } catch (err) {
    res.status(500).json({ error: "Hata" });
  }
});

// ─── Fiyat değişikliğini onayla (kart normale döner) ─────────────────────────
router.post("/confirm-price/:table/:id", async (req, res) => {
  try {
    const { table, id } = req.params;
    const tbl = table === "mobile" ? mobileTariffs : packages;

    await db.update(tbl).set({
      priceChanged: false,
      previousPrice: null,
      priceChangeDirection: "none",
    }).where(eq(tbl.id, Number(id)));

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Hata" });
  }
});

// ─── Fiyatı elle güncelle (Turkcell/Vodafone için) ───────────────────────────
router.put("/package/:id", async (req, res) => {
  try {
    const ALLOWED = ["priceMonthly", "priceNoCommitment", "name", "features",
                     "isFeatured", "isActive", "affiliateUrl", "sortOrder"];
    const clean: any = Object.fromEntries(
      Object.entries(req.body ?? {}).filter(([k]) => ALLOWED.includes(k))
    );

    // Fiyat değişiyorsa previousPrice kaydet
    if (clean.priceMonthly) {
      const current = await db.select().from(packages)
        .where(eq(packages.id, Number(req.params.id)));
      if (current.length && current[0].priceMonthly !== Number(clean.priceMonthly)) {
        const direction = Number(clean.priceMonthly) > current[0].priceMonthly ? "up" : "down";
        clean.previousPrice = current[0].priceMonthly;
        clean.priceChanged = true;
        clean.priceChangeDirection = direction;
      }
    }

    clean.updatedAt = new Date();
    const result = await db.update(packages).set(clean)
      .where(eq(packages.id, Number(req.params.id))).returning();
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "Güncellenemedi" });
  }
});

router.put("/mobile/:id", async (req, res) => {
  try {
    const ALLOWED = ["priceMonthly", "pricePrePaid", "name", "gbLimit",
                     "features", "isFeatured", "isActive", "sortOrder"];
    const clean: any = Object.fromEntries(
      Object.entries(req.body ?? {}).filter(([k]) => ALLOWED.includes(k))
    );

    if (clean.priceMonthly) {
      const current = await db.select().from(mobileTariffs)
        .where(eq(mobileTariffs.id, Number(req.params.id)));
      if (current.length && current[0].priceMonthly !== Number(clean.priceMonthly)) {
        const direction = Number(clean.priceMonthly) > current[0].priceMonthly ? "up" : "down";
        clean.previousPrice = current[0].priceMonthly;
        clean.priceChanged = true;
        clean.priceChangeDirection = direction;
      }
    }

    clean.updatedAt = new Date();
    const result = await db.update(mobileTariffs).set(clean)
      .where(eq(mobileTariffs.id, Number(req.params.id))).returning();
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "Güncellenemedi" });
  }
});

// ─── Scrape log geçmişi ───────────────────────────────────────────────────────
router.get("/scrape-log", async (_req, res) => {
  try {
    const logs = await db.select().from(scrapeLog)
      .orderBy(desc(scrapeLog.createdAt))
      .limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Hata" });
  }
});

// ─── Scraper'ı manuel tetikle ─────────────────────────────────────────────────
// NOT: Eski sürüm `exec("tsx scraper/index.ts")` ile kabuk süreci başlatıyordu.
// Üretim imajında tsx yok (devDependency) ve web sürecinde kabuk açmak gereksiz
// bir saldırı yüzeyi. Scraper artık Railway Cron servisiyle çalışır
// (railway-cron.json) ve burada süreç içinde çağrılır.
router.post("/run-scraper", async (_req, res) => {
  try {
    const { runScraper } = await import("../../scraper/index");
    res.json({ message: "Scraper başlatıldı — logları kontrol edin" });
    runScraper().catch((e: unknown) =>
      console.error("[admin] scraper hatası:", (e as Error).message)
    );
  } catch (err) {
    console.error("[admin] scraper yüklenemedi:", (err as Error).message);
  }
});

// ─── Leadler ──────────────────────────────────────────────────────────────────
router.get("/leads", async (_req, res) => {
  try {
    const result = await db.select().from(leads).orderBy(desc(leads.createdAt));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Hata" });
  }
});

// ─── Tüm paketler (admin view) ────────────────────────────────────────────────
router.get("/packages", async (_req, res) => {
  try {
    const all = await db.select().from(packages).orderBy(packages.operatorSlug, packages.sortOrder);
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: "Hata" });
  }
});

router.get("/mobile", async (_req, res) => {
  try {
    const all = await db.select().from(mobileTariffs).orderBy(mobileTariffs.operatorSlug);
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: "Hata" });
  }
});

export default router;
