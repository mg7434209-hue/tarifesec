/**
 * Gespa OS özeti — GET /api/os/summary  (başlık: X-OS-Token)
 *
 * Gespa OS'teki JARVIS (komuta asistanı) siteyi bu TEK uçtan izler: başvurular,
 * fiyat tarama durumu, onay bekleyen fiyat değişiklikleri, ziyaretçi.
 * YALNIZ OKUR. Yönetim şifresini DEĞİL ayrı OS_TOKEN'ı (≥32 karakter, yalnız
 * ortam değişkeni) kabul eder; tanımlı değilse 503.
 *
 * KVKK: başvuranın ADI, TELEFONU ve NOTU ÇIKMAZ (tests/os-summary.test.ts).
 * Yalnız il, ilgilendiği paket, kaynak, arandı mı ve tarih döner; kişiye
 * ulaşmak için yönetim paneli (/admin) kullanılır.
 */
import { Router } from "express";
import { timingSafeEqual } from "crypto";
import { desc, eq, gte, sql } from "drizzle-orm";
import { db } from "../../drizzle/db";
import { leads, packages, mobileTariffs, scrapeLog, siteCounters, visitDays } from "../../drizzle/schema";
import { schedulerStatus } from "../scheduler";
import { config } from "../config";

const router = Router();
const DAYS = 30;

export function osToken(): string {
  const t = (process.env.OS_TOKEN ?? "").trim();
  return t.length >= 32 ? t : "";
}

export function tokenOk(given: unknown, expected: string): boolean {
  if (!expected || typeof given !== "string") return false;
  const a = Buffer.from(given), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Başvuru kaydından kişisel veriyi ayıklar — ad, telefon, not DÖNMEZ. */
export function leadPublic(l: typeof leads.$inferSelect) {
  return {
    id: l.id,
    city: l.city ?? null,
    packageInterest: l.packageInterest ?? null,
    source: l.source ?? null,
    contacted: !!l.isContacted,
    createdAt: l.createdAt,
  };
}

router.all("/summary", async (req, res) => {
  if (req.method !== "GET") return res.status(405).json({ error: "Yalnız GET" });
  const expected = osToken();
  if (!expected) return res.status(503).json({ error: "OS_TOKEN tanımlı değil" });
  if (!tokenOk(req.headers["x-os-token"], expected)) return res.status(403).json({ error: "Geçersiz belirteç" });

  try {
    const since = new Date(Date.now() - DAYS * 864e5);
    const recent = await db.select().from(leads).where(gte(leads.createdAt, since)).orderBy(desc(leads.createdAt));
    const [{ n: uncontacted }] = await db.select({ n: sql<number>`count(*)::int` }).from(leads).where(eq(leads.isContacted, false));

    const pk = await db.select().from(packages).where(eq(packages.isActive, true));
    const mb = await db.select().from(mobileTariffs).where(eq(mobileTariffs.isActive, true));
    const staleMs = config.scrape.staleAfterHours * 3600 * 1000;
    const stale = pk.filter((p) => !p.lastScrapedAt || Date.now() - new Date(p.lastScrapedAt).getTime() > staleMs);

    const logs = await db.select().from(scrapeLog).orderBy(desc(scrapeLog.createdAt)).limit(30);
    const lastErr = logs.find((l) => l.status === "error");

    const [total] = await db.select().from(siteCounters).where(eq(siteCounters.key, "visits_total"));
    const today = new Date().toISOString().slice(0, 10);
    const days = await db.select().from(visitDays).orderBy(desc(visitDays.day)).limit(7);

    res.setHeader("Cache-Control", "no-store");
    res.json({
      site: "tarifesec.net.tr",
      generatedAt: new Date().toISOString(),
      leads: {
        days: DAYS,
        count: recent.length,
        uncontacted,
        items: recent.slice(0, 50).map(leadPublic),
      },
      prices: {
        packages: pk.length,
        mobile: mb.length,
        pendingApproval: pk.filter((p) => p.priceChanged).length + mb.filter((m) => m.priceChanged).length,
        stale: stale.length,
        staleAfterHours: config.scrape.staleAfterHours,
      },
      scraper: {
        scheduler: schedulerStatus(),
        lastRunAt: logs[0]?.createdAt ?? null,
        lastError: lastErr ? { operator: lastErr.operator, at: lastErr.createdAt, message: (lastErr.errorMessage ?? "").slice(0, 200) } : null,
      },
      visitors: {
        total: (total?.value ?? 0) + config.visitors.base,
        today: days.find((d) => d.day === today)?.count ?? 0,
        last7: days.map((d) => ({ day: d.day, count: d.count })),
      },
    });
  } catch (err) {
    console.error("[os] özet hatası:", (err as Error).message);
    res.status(500).json({ error: "Özet kurulamadı" });
  }
});

export default router;
