/**
 * tarifesec.net.tr — fiyat tarayıcı
 *
 * Çalıştırma:
 *   npm run scrape             (elle, tek sefer)
 *   Railway Cron               (railway-cron.json)
 *   Uygulama içi zamanlayıcı   (server/scheduler.ts — ayrı servis gerekmez)
 *
 * GÜVENLİK İLKESİ: emin değilsen dokunma. Belirsiz eşleşme, büyük fiyat
 * sıçraması veya bozuk sayfa → güncelleme YAPILMAZ, kayıt scrape_log'a
 * düşer ve admin panelinde görünür.
 */
import { db } from "../drizzle/db";
import { packages, scrapeLog } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import dotenv from "dotenv";
import { extractPackages } from "./parse";
import { matchAndPlan, sanityCheck, type DbRow } from "./match";
import { SOURCES, USER_AGENT, FETCH_TIMEOUT_MS, type Source } from "./sources";

dotenv.config();

export type ScrapeSummary = {
  operator: string;
  status: "success" | "error" | "partial" | "manual";
  found: number;
  changed: number;
  skipped: number;
  error?: string;
};

async function fetchHtml(url: string): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" },
      signal: ctrl.signal,
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function scrapeSource(src: Source): Promise<ScrapeSummary> {
  const started = Date.now();

  if (src.manual || src.urls.length === 0) {
    await db.insert(scrapeLog).values({
      operator: src.operatorSlug,
      status: "partial",
      errorMessage: "Bot koruması — admin panelinden elle güncellenir",
      packagesFound: 0,
      priceChanges: 0,
      durationMs: Date.now() - started,
    });
    console.log(`⏭️  ${src.label}: elle güncelleme gerekiyor`);
    return { operator: src.label, status: "manual", found: 0, changed: 0, skipped: 0 };
  }

  console.log(`\n🔍 ${src.label} taranıyor…`);

  try {
    // Sırayla dene — ilk başarılı sayfadan kayıt çıkana kadar
    let scraped: ReturnType<typeof extractPackages> = [];
    let lastError = "";

    for (const url of src.urls) {
      try {
        const html = await fetchHtml(url);
        scraped = extractPackages(html);
        if (scraped.length) {
          console.log(`   kaynak: ${url}`);
          break;
        }
        lastError = "kayıt çıkarılamadı";
      } catch (e) {
        lastError = (e as Error).message;
      }
    }

    const rows = (await db
      .select()
      .from(packages)
      .where(and(eq(packages.operatorSlug, src.operatorSlug), eq(packages.isActive, true)))) as DbRow[];

    const sane = sanityCheck(scraped, rows);
    if (!sane.ok) {
      await db.insert(scrapeLog).values({
        operator: src.operatorSlug,
        status: "error",
        errorMessage: `${sane.reason}${lastError ? ` (${lastError})` : ""}`,
        packagesFound: scraped.length,
        priceChanges: 0,
        durationMs: Date.now() - started,
      });
      console.warn(`   ⚠️  tur iptal: ${sane.reason}`);
      return {
        operator: src.label,
        status: "error",
        found: scraped.length,
        changed: 0,
        skipped: 0,
        error: sane.reason,
      };
    }

    const plan = matchAndPlan(scraped, rows);
    let changed = 0;
    let skipped = 0;

    for (const step of plan) {
      if (step.kind === "update") {
        const direction = step.newPrice > step.oldPrice ? "up" : "down";
        await db
          .update(packages)
          .set({
            priceMonthly: step.newPrice,
            previousPrice: step.oldPrice,
            priceChanged: true,
            priceChangeDirection: direction,
            lastScrapedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(packages.id, step.id));
        changed++;
        console.log(`   💰 [${step.id}] ${step.oldPrice} ₺ → ${step.newPrice} ₺ (${direction})`);
      } else if (step.kind === "unchanged") {
        await db
          .update(packages)
          .set({ lastScrapedAt: new Date() })
          .where(eq(packages.id, step.id));
      } else {
        skipped++;
        console.warn(`   ⏭️  atlandı: ${step.reason}${step.detail ? ` — ${step.detail}` : ""}`);
      }
    }

    await db.insert(scrapeLog).values({
      operator: src.operatorSlug,
      status: skipped > 0 ? "partial" : "success",
      packagesFound: scraped.length,
      priceChanges: changed,
      errorMessage: skipped > 0 ? `${skipped} kayıt belirsizlik nedeniyle atlandı` : null,
      durationMs: Date.now() - started,
    });

    console.log(`   ✅ ${scraped.length} kayıt · ${changed} değişiklik · ${skipped} atlandı`);
    return { operator: src.label, status: "success", found: scraped.length, changed, skipped };
  } catch (err) {
    const message = (err as Error).message;
    await db.insert(scrapeLog).values({
      operator: src.operatorSlug,
      status: "error",
      errorMessage: message,
      durationMs: Date.now() - started,
    });
    console.error(`   ❌ ${src.label}: ${message}`);
    return { operator: src.label, status: "error", found: 0, changed: 0, skipped: 0, error: message };
  }
}

export async function runScraper(): Promise<ScrapeSummary[]> {
  console.log("=".repeat(52));
  console.log(`🚀 Fiyat tarayıcı: ${new Date().toLocaleString("tr-TR")}`);
  console.log("=".repeat(52));

  const summaries: ScrapeSummary[] = [];
  for (const src of SOURCES) {
    summaries.push(await scrapeSource(src));
  }

  const totalChanged = summaries.reduce((a, s) => a + s.changed, 0);
  const totalSkipped = summaries.reduce((a, s) => a + s.skipped, 0);

  console.log("\n" + "=".repeat(52));
  console.log(`✅ Tamamlandı — ${totalChanged} fiyat güncellendi, ${totalSkipped} kayıt onaya düştü.`);
  if (totalSkipped > 0) console.log("   → Admin panelinden kontrol edin: /admin");
  console.log("=".repeat(52));

  return summaries;
}

// Doğrudan çalıştırıldığında süreci sonlandır; import edildiğinde sonlandırma.
const isDirectRun =
  process.argv[1] && /scraper[\\/](index)\.(ts|js)$/.test(process.argv[1]);

if (isDirectRun) {
  runScraper()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error("❌ Kritik hata:", e);
      process.exit(1);
    });
}
