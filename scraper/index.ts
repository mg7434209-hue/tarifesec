/**
 * tarifesec.net.tr — Günlük fiyat scraper
 * Railway Cron Service olarak çalışır: her gün 03:00'de
 *
 * Çalıştır: tsx scraper/index.ts
 * Ya da Railway cron: 0 3 * * *
 */
import { db } from "../drizzle/db";
import { packages, mobileTariffs, scrapeLog } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";
dotenv.config();

// ─── Yardımcı: fiyat güncelle ────────────────────────────────────────────────

async function updatePackagePrice(
  id: number,
  newPrice: number,
  table: "packages" | "mobile"
) {
  const tbl = table === "packages" ? packages : mobileTariffs;
  const current = await db.select().from(tbl).where(eq(tbl.id, id));
  if (!current.length) return;

  const old = current[0].priceMonthly;
  if (old === newPrice) {
    await db.update(tbl).set({ lastScrapedAt: new Date() }).where(eq(tbl.id, id));
    return { changed: false };
  }

  const direction = newPrice > old ? "up" : "down";
  await db.update(tbl).set({
    priceMonthly: newPrice,
    previousPrice: old,
    priceChanged: true,
    priceChangeDirection: direction,
    lastScrapedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(tbl.id, id));

  console.log(`  💰 Fiyat değişti [${id}]: ${old}₺ → ${newPrice}₺ (${direction})`);
  return { changed: true, old, new: newPrice, direction };
}

// ─── Superonline Scraper ──────────────────────────────────────────────────────
// Superonline paket sayfası statik HTML — Cheerio ile parse edilebilir

async function scrapeSuperonline(): Promise<number> {
  const start = Date.now();
  let changes = 0;

  try {
    console.log("\n🔍 Superonline taranıyor...");

    const res = await fetch("https://www.superonline.net/bireysel/internet/fiber-internet-paketleri", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TarifeSec/1.0)" }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // Superonline sayfasından fiyatları parse et
    // Sayfa yapısı: data-price="699" ya da içerik "699 TL/ay"
    const priceMatches = [...html.matchAll(/data-price="(\d+)"/g)];
    const prices = priceMatches.map(m => parseInt(m[1])).filter(p => p > 100 && p < 5000);

    console.log(`  Bulunan fiyatlar: ${prices.join(", ")}`);

    // DB'deki Superonline paketleriyle eşleştir (sıralı)
    const dbPackages = await db.select().from(packages)
      .where(eq(packages.operatorSlug, "superonline"));

    for (let i = 0; i < Math.min(prices.length, dbPackages.length); i++) {
      const result = await updatePackagePrice(dbPackages[i].id, prices[i], "packages");
      if (result?.changed) changes++;
    }

    await db.insert(scrapeLog).values({
      operator: "superonline",
      status: "success",
      packagesFound: prices.length,
      priceChanges: changes,
      durationMs: Date.now() - start,
    });

    console.log(`  ✅ Superonline tamamlandı. ${changes} değişiklik.`);
  } catch (err: any) {
    console.error(`  ❌ Superonline hata:`, err.message);
    await db.insert(scrapeLog).values({
      operator: "superonline",
      status: "error",
      errorMessage: err.message,
      durationMs: Date.now() - start,
    });
  }

  return changes;
}

// ─── TurkNet Scraper ──────────────────────────────────────────────────────────

async function scrapeTurknet(): Promise<number> {
  const start = Date.now();
  let changes = 0;

  try {
    console.log("\n🔍 TurkNet taranıyor...");

    const res = await fetch("https://www.turknet.net.tr/internet-paketleri", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TarifeSec/1.0)" }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const priceMatches = [...html.matchAll(/(\d{3,4})\s*(?:TL|₺)/g)];
    const prices = [...new Set(
      priceMatches.map(m => parseInt(m[1])).filter(p => p > 100 && p < 3000)
    )];

    console.log(`  Bulunan fiyatlar: ${prices.join(", ")}`);

    const dbPackages = await db.select().from(packages)
      .where(eq(packages.operatorSlug, "turknet"));

    for (let i = 0; i < Math.min(prices.length, dbPackages.length); i++) {
      const result = await updatePackagePrice(dbPackages[i].id, prices[i], "packages");
      if (result?.changed) changes++;
    }

    await db.insert(scrapeLog).values({
      operator: "turknet",
      status: "success",
      packagesFound: prices.length,
      priceChanges: changes,
      durationMs: Date.now() - start,
    });

    console.log(`  ✅ TurkNet tamamlandı. ${changes} değişiklik.`);
  } catch (err: any) {
    console.error(`  ❌ TurkNet hata:`, err.message);
    await db.insert(scrapeLog).values({
      operator: "turknet",
      status: "error",
      errorMessage: err.message,
      durationMs: Date.now() - start,
    });
  }

  return changes;
}

// ─── Türk Telekom Scraper ─────────────────────────────────────────────────────

async function scrapeTurkTelekom(): Promise<number> {
  const start = Date.now();
  let changes = 0;

  try {
    console.log("\n🔍 Türk Telekom taranıyor...");

    // TT API endpoint — network tab'dan yakalandı
    const res = await fetch("https://www.turktelekom.com.tr/api/packages?category=internet", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TarifeSec/1.0)",
        "Accept": "application/json",
      }
    });

    // API başarısız olursa HTML fallback
    if (!res.ok) {
      const htmlRes = await fetch("https://www.turktelekom.com.tr/ev-interneti/fiber-internet", {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; TarifeSec/1.0)" }
      });
      const html = await htmlRes.text();
      const priceMatches = [...html.matchAll(/(\d{3,4})\s*(?:TL|₺)/g)];
      const prices = [...new Set(
        priceMatches.map(m => parseInt(m[1])).filter(p => p > 300 && p < 3000)
      )];

      console.log(`  Bulunan fiyatlar (HTML): ${prices.join(", ")}`);

      const dbPackages = await db.select().from(packages)
        .where(eq(packages.operatorSlug, "turk-telekom"));

      for (let i = 0; i < Math.min(prices.length, dbPackages.length); i++) {
        const result = await updatePackagePrice(dbPackages[i].id, prices[i], "packages");
        if (result?.changed) changes++;
      }
    } else {
      const data = await res.json();
      console.log(`  API yanıtı alındı: ${data?.packages?.length ?? 0} paket`);
      // API yapısına göre parse et
    }

    await db.insert(scrapeLog).values({
      operator: "turk-telekom",
      status: "success",
      packagesFound: 0,
      priceChanges: changes,
      durationMs: Date.now() - start,
    });

    console.log(`  ✅ Türk Telekom tamamlandı. ${changes} değişiklik.`);
  } catch (err: any) {
    console.error(`  ❌ Türk Telekom hata:`, err.message);
    await db.insert(scrapeLog).values({
      operator: "turk-telekom",
      status: "error",
      errorMessage: err.message,
      durationMs: Date.now() - start,
    });
  }

  return changes;
}

// ─── Vodafone & Turkcell — Elle güncelleme gerekir ────────────────────────────
// Bot koruması güçlü. Bunlar admin panelden elle onaylanır.

async function markManualCheckNeeded(operatorSlug: string) {
  console.log(`\n⚠️  ${operatorSlug} — bot koruması var, elle kontrol gerekiyor`);
  await db.insert(scrapeLog).values({
    operator: operatorSlug,
    status: "partial",
    errorMessage: "Bot koruması — elle güncelleme gerekiyor",
    packagesFound: 0,
    priceChanges: 0,
  });
}

// ─── Ana fonksiyon ────────────────────────────────────────────────────────────

async function runScraper() {
  console.log("=".repeat(50));
  console.log(`🚀 TarifeSec Scraper başladı: ${new Date().toLocaleString("tr-TR")}`);
  console.log("=".repeat(50));

  let totalChanges = 0;

  totalChanges += await scrapeSuperonline();
  totalChanges += await scrapeTurknet();
  totalChanges += await scrapeTurkTelekom();
  await markManualCheckNeeded("turkcell");
  await markManualCheckNeeded("vodafone");

  console.log("\n" + "=".repeat(50));
  console.log(`✅ Scraper tamamlandı. Toplam ${totalChanges} fiyat değişikliği.`);
  if (totalChanges > 0) {
    console.log("   → Admin panelden değişiklikleri onaylayın.");
  }
  console.log("=".repeat(50));

  process.exit(0);
}

runScraper().catch(e => {
  console.error("❌ Scraper kritik hata:", e);
  process.exit(1);
});
