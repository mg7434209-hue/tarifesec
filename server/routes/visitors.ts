/**
 * Ziyaretçi sayacı — GET /api/visitors
 *
 * - Aynı ziyaretçi gün içinde BİR kez sayılır (çerez: config.visitors.cookieName)
 * - Bot/headless istekler sayılmaz
 * - Gösterilen toplam = config.visitors.base (1000) + gerçek sayaç
 *   → sayaç her zaman 1000 ve üzerinde görünür
 * - Kalıcı veri PostgreSQL'de (site_counters + visit_days).
 *
 * DB ERİŞİLEMEZSE: site hata vermez, sayaç bellekten sunulur — AMA bellek
 * her yeniden başlatmada sıfırlanır. Bu durumda rozet sonsuza dek "1.001"de
 * takılı kalır ve dışarıdan sayaç bozukmuş gibi görünür. Bu yüzden:
 *   1. bellekte biriken ziyaretler SİLİNMEZ, DB geri gelince tek işlemde yazılır
 *   2. yanıtta `kaynak` ("veritabani" | "bellek") ve `uyari` alanları döner —
 *      /api/visitors adresi tarayıcıda açılınca sorun tek bakışta görünür
 *   3. aynı durum /api/health çıktısındaki `sayac` alanında da raporlanır
 */
import { Router } from "express";
import { db } from "../../drizzle/db";
import { siteCounters, visitDays } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { config } from "../config";

const router = Router();

const TOTAL_KEY = "visits_total";

/**
 * DB düşükken toplanan ziyaretler — gün bazında bekletilir ve bağlantı
 * dönünce DB'ye eklenir. `lastDbTotal` son başarılı okumadır; bellek moduna
 * düşülse bile rozet geriye gitmesin diye taban olarak kullanılır.
 */
const pending = new Map<string, number>();
let lastDbTotal = 0;
/** Son başarılı okumadaki günlük sayı — bellek moduna düşünce geri gitmesin */
let lastDbDay = "";
let lastDbToday = 0;
let lastError = "";
let lastSource: "veritabani" | "bellek" = "veritabani";

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

function pendingTotal(): number {
  let n = 0;
  for (const v of pending.values()) n += v;
  return n;
}

async function readCounts(day: string): Promise<{ total: number; today: number }> {
  const [totalRow] = await db
    .select()
    .from(siteCounters)
    .where(eq(siteCounters.key, TOTAL_KEY));

  const [dayRow] = await db.select().from(visitDays).where(eq(visitDays.day, day));

  return { total: totalRow?.value ?? 0, today: dayRow?.count ?? 0 };
}

/**
 * Bu isteğin ziyaretini ve bekleyen tüm ziyaretleri TEK İŞLEMDE yazar.
 *
 * Tek işlem şart: toplam satırı yazılıp gün satırı düşerse bekleyenler
 * silinemez, sonraki denemede toplam ikinci kez artardı. Hata olursa
 * transaction geri alınır, bekleyenler olduğu gibi kalır.
 */
async function flush(day: string, countNow: boolean): Promise<{ total: number; today: number }> {
  const batch = new Map(pending);
  if (countNow) batch.set(day, (batch.get(day) ?? 0) + 1);

  let delta = 0;
  for (const v of batch.values()) delta += v;

  if (delta === 0) return readCounts(day);

  const result = await db.transaction(async (tx) => {
    const [totalRow] = await tx
      .insert(siteCounters)
      .values({ key: TOTAL_KEY, value: delta })
      .onConflictDoUpdate({
        target: siteCounters.key,
        set: { value: sql`${siteCounters.value} + ${delta}`, updatedAt: new Date() },
      })
      .returning();

    let today = 0;
    for (const [d, n] of batch) {
      const [dayRow] = await tx
        .insert(visitDays)
        .values({ day: d, count: n })
        .onConflictDoUpdate({
          target: visitDays.day,
          set: { count: sql`${visitDays.count} + ${n}` },
        })
        .returning();
      if (d === day) today = dayRow?.count ?? 0;
    }

    if (!batch.has(day)) {
      const [dayRow] = await tx.select().from(visitDays).where(eq(visitDays.day, day));
      today = dayRow?.count ?? 0;
    }

    return { total: totalRow?.value ?? 0, today };
  });

  pending.clear(); // yazıldı
  return result;
}

/** /api/health için sayaç durumu — DB'ye dokunmaz, son bilinen durumu verir. */
export function counterState() {
  return {
    kaynak: lastSource,
    kalici: lastSource === "veritabani",
    toplam: config.visitors.base + lastDbTotal + pendingTotal(),
    bekleyen: pendingTotal(),
    ...(lastSource === "bellek"
      ? {
          sorun:
            "Ziyaretçi sayacı veritabanına yazamıyor; sayı her yeniden " +
            "başlatmada 1.000 tabanına döner." + (lastError ? ` (${lastError})` : ""),
        }
      : {}),
  };
}

router.get("/", async (req, res) => {
  const day = todayKey();
  const alreadyCounted = Boolean(req.cookies?.[config.visitors.cookieName]);
  const bot = isBot(req.headers["user-agent"]);
  const shouldCount = !alreadyCounted && !bot;

  let counts: { total: number; today: number };

  try {
    counts = await flush(day, shouldCount);
    lastDbTotal = counts.total;
    lastDbDay = day;
    lastDbToday = counts.today;
    lastSource = "veritabani";
    lastError = "";
  } catch (err) {
    // DB yoksa/düşükse sayacı bellekten sun — footer rozeti bozulmasın.
    // Ziyaret ATILMAZ: bekleyenlere yazılır, bağlantı dönünce DB'ye işlenir.
    lastError = (err as Error).message;
    lastSource = "bellek";
    console.error("[visitors] DB hatası, bellek yedeği kullanılıyor:", lastError);
    if (shouldCount) pending.set(day, (pending.get(day) ?? 0) + 1);
    const dbToday = lastDbDay === day ? lastDbToday : 0;
    counts = { total: lastDbTotal + pendingTotal(), today: dbToday + (pending.get(day) ?? 0) };
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
    counted: shouldCount,
    // Teşhis: rozet takılı kalıyorsa bu iki alan nedenini söyler
    kaynak: lastSource,
    ...(lastSource === "bellek"
      ? {
          uyari:
            "Veritabanına yazılamıyor — sayaç her yeniden başlatmada sıfırlanır. " +
            "Ayrıntı: /api/health",
        }
      : {}),
  });
});

export default router;
