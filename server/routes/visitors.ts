/**
 * Ziyaretçi sayacı — GET /api/visitors
 *
 * - Aynı ziyaretçi gün içinde BİR kez sayılır (çerez: config.visitors.cookieName)
 * - Bot/headless istekler sayılmaz
 * - Gösterilen toplam = config.visitors.base (1000) + gerçek sayaç
 *   → sayaç her zaman 1000 ve üzerinde görünür
 * - Kalıcı veri PostgreSQL'de (site_counters + visit_days); DB erişilemezse
 *   bellek içi yedeğe düşer, site hiçbir durumda hata vermez.
 */
import { Router } from "express";
import { db } from "../../drizzle/db";
import { siteCounters, visitDays } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { config } from "../config";

const router = Router();

const TOTAL_KEY = "visits_total";

/** DB düşerse kullanılacak yedek sayaç */
const memory = { total: 0, days: new Map<string, number>() };

const BOT_RE =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|headless|phantom|puppeteer|playwright|lighthouse|curl|wget|python-requests|axios|go-http|okhttp|monitor|uptime|pingdom|gtmetrix|semrush|ahrefs|mj12|dotbot|petal|yandex|applebot|duckduck/i;

function isBot(ua: string | undefined): boolean {
  if (!ua || ua.length < 10) return true; // UA yoksa insan değil say
  return BOT_RE.test(ua);
}

function todayKey(): string {
  // Türkiye saatine göre gün sınırı
  return new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** Gün sonuna kalan saniye (çerez ömrü) */
function secondsUntilMidnight(): number {
  const now = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(60, Math.floor((end - now.getTime()) / 1000));
}

async function readCounts(day: string): Promise<{ total: number; today: number }> {
  const [totalRow] = await db
    .select()
    .from(siteCounters)
    .where(eq(siteCounters.key, TOTAL_KEY));

  const [dayRow] = await db.select().from(visitDays).where(eq(visitDays.day, day));

  return { total: totalRow?.value ?? 0, today: dayRow?.count ?? 0 };
}

async function increment(day: string): Promise<{ total: number; today: number }> {
  const [totalRow] = await db
    .insert(siteCounters)
    .values({ key: TOTAL_KEY, value: 1 })
    .onConflictDoUpdate({
      target: siteCounters.key,
      set: { value: sql`${siteCounters.value} + 1`, updatedAt: new Date() },
    })
    .returning();

  const [dayRow] = await db
    .insert(visitDays)
    .values({ day, count: 1 })
    .onConflictDoUpdate({
      target: visitDays.day,
      set: { count: sql`${visitDays.count} + 1` },
    })
    .returning();

  return { total: totalRow?.value ?? 0, today: dayRow?.count ?? 0 };
}

router.get("/", async (req, res) => {
  const day = todayKey();
  const alreadyCounted = Boolean(req.cookies?.[config.visitors.cookieName]);
  const bot = isBot(req.headers["user-agent"]);
  const shouldCount = !alreadyCounted && !bot;

  let counts: { total: number; today: number };

  try {
    counts = shouldCount ? await increment(day) : await readCounts(day);
  } catch (err) {
    // DB yoksa/düşükse sayacı bellekten sun — footer rozeti bozulmasın
    console.error("[visitors] DB hatası, bellek yedeği kullanılıyor:", (err as Error).message);
    if (shouldCount) {
      memory.total++;
      memory.days.set(day, (memory.days.get(day) ?? 0) + 1);
    }
    counts = { total: memory.total, today: memory.days.get(day) ?? 0 };
  }

  if (shouldCount) {
    res.cookie(config.visitors.cookieName, "1", {
      maxAge: secondsUntilMidnight() * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  res.setHeader("Cache-Control", "no-store");
  res.json({
    total: config.visitors.base + counts.total,
    today: counts.today,
    counted: shouldCount,
  });
});

export default router;
