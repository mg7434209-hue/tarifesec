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
import { createHash } from "crypto";
import { db } from "../../drizzle/db";
import { siteCounters, visitDays } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { config } from "../config";
import { rateLimit } from "../middleware/rateLimit";

const router = Router();

const TOTAL_KEY = "visits_total";

/**
 * "Şu an sitede" — son ONLINE_WINDOW_MS içinde nabız atan tekil ziyaretçi.
 * Yalnız bellekte tutulur; kimlik IP+UA karmasıdır, ham IP SAKLANMAZ.
 * (Tek süreç varsayılır; Railway'de tek örnek çalışır.)
 */
const ONLINE_WINDOW_MS = 5 * 60 * 1000;
const online = new Map<string, number>();

function visitorKey(req: any): string {
  return createHash("sha256")
    .update(`${req.ip ?? ""}|${req.headers["user-agent"] ?? ""}`)
    .digest("hex")
    .slice(0, 24);
}

function touchOnline(key: string): number {
  const now = Date.now();
  online.set(key, now);
  for (const [k, t] of online) if (now - t > ONLINE_WINDOW_MS) online.delete(k);
  return online.size;
}

function onlineCount(): number {
  const now = Date.now();
  let n = 0;
  for (const t of online.values()) if (now - t <= ONLINE_WINDOW_MS) n++;
  return n;
}

/** DB düşerse kullanılacak yedek sayaç */
const memory = { total: 0, days: new Map<string, number>() };
let usingMemory = false;

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

router.get("/", rateLimit(config.rateLimit.visitors), async (req, res) => {
  const day = todayKey();
  const alreadyCounted = Boolean(req.cookies?.[config.visitors.cookieName]);
  const bot = isBot(req.headers["user-agent"]);
  const shouldCount = !alreadyCounted && !bot;

  let counts: { total: number; today: number };
  // Nabız: bot değilse "şu an sitede" listesini tazeler (sayaç ARTMAZ)
  const nowOnline = bot ? onlineCount() : touchOnline(visitorKey(req));

  try {
    counts = shouldCount ? await increment(day) : await readCounts(day);
    usingMemory = false;
  } catch (err) {
    usingMemory = true;
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
      // NODE_ENV yerine gerçek bağlantı: Railway HTTPS sonlandırıp
      // x-forwarded-proto ile iletir.
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
      path: "/",
    });
  }

  res.setHeader("Cache-Control", "no-store");
  res.json({
    total: config.visitors.base + counts.total,
    today: counts.today,
    // Kendisi sayılmasa da (bot/önizleme) en az 1 göstermek yanıltıcı olur;
    // gerçek sayı neyse o.
    online: nowOnline,
    counted: shouldCount,
    /** false → veritabanı yok, sayaç yeniden başlatmada sıfırlanır */
    persistent: !usingMemory,
  });
});

export default router;
