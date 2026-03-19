/**
 * Seed dosyası — Mart 2026 güncel fiyatları
 * Çalıştır: tsx drizzle/seed.ts
 */
import { db } from "./db";
import { packages, mobileTariffs } from "./schema";
import dotenv from "dotenv";
dotenv.config();

async function seed() {
  console.log("🌱 Seed başlıyor...");

  // ─── Ev İnterneti Paketleri ───────────────────────────────────────────────

  await db.delete(packages);

  await db.insert(packages).values([
    // ── Superonline Fiber (isFeatured = true, Bayi B9613) ──
    {
      operator: "Superonline", operatorSlug: "superonline", type: "fiber",
      name: "Fiber 100 Mbps", downloadSpeed: 100, uploadSpeed: 100,
      priceMonthly: 699, priceNoCommitment: 849, commitmentMonths: 24,
      dataLimit: "Limitsiz", modemIncluded: true, installationFee: 0,
      features: JSON.stringify(["WiFi 6 Modem", "Limitsiz", "7/24 Destek"]),
      isFeatured: true,
      affiliateUrl: "https://superonline.net?ref=B9613",
      officialUrl: "https://superonline.net/fiber",
    },
    {
      operator: "Superonline", operatorSlug: "superonline", type: "fiber",
      name: "Fiber 250 Mbps", downloadSpeed: 250, uploadSpeed: 250,
      priceMonthly: 849, priceNoCommitment: 999, commitmentMonths: 24,
      dataLimit: "Limitsiz", modemIncluded: true, installationFee: 0,
      features: JSON.stringify(["WiFi 6 Modem", "Limitsiz", "Ebeveyn Kontrolü"]),
      isFeatured: true,
      affiliateUrl: "https://superonline.net?ref=B9613",
      officialUrl: "https://superonline.net/fiber",
    },
    {
      operator: "Superonline", operatorSlug: "superonline", type: "fiber",
      name: "Fiber 500 Mbps", downloadSpeed: 500, uploadSpeed: 500,
      priceMonthly: 1099, priceNoCommitment: 1299, commitmentMonths: 24,
      dataLimit: "Limitsiz", modemIncluded: true, installationFee: 0,
      features: JSON.stringify(["WiFi 6 Modem", "Limitsiz", "Gaming Öncelik"]),
      isFeatured: true,
      affiliateUrl: "https://superonline.net?ref=B9613",
      officialUrl: "https://superonline.net/fiber",
    },
    // ── Superbox Kablosuz (isFeatured = true) ──
    {
      operator: "Superonline", operatorSlug: "superonline", type: "kablosuz",
      name: "Superbox 25 Mbps", downloadSpeed: 25, uploadSpeed: 10,
      priceMonthly: 549, priceNoCommitment: 699, commitmentMonths: 24,
      dataLimit: "Limitsiz", modemIncluded: true, installationFee: 0,
      features: JSON.stringify(["Kurulum yok", "Kablosuz 4.5G", "Anında aktif"]),
      isFeatured: true,
      affiliateUrl: "https://superonline.net?ref=B9613",
      officialUrl: "https://superonline.net/superbox",
    },
    {
      operator: "Superonline", operatorSlug: "superonline", type: "kablosuz",
      name: "Superbox 50 Mbps", downloadSpeed: 50, uploadSpeed: 20,
      priceMonthly: 699, priceNoCommitment: 849, commitmentMonths: 24,
      dataLimit: "Limitsiz", modemIncluded: true, installationFee: 0,
      features: JSON.stringify(["Kurulum yok", "Kablosuz 4.5G", "Anında aktif"]),
      isFeatured: true,
      affiliateUrl: "https://superonline.net?ref=B9613",
      officialUrl: "https://superonline.net/superbox",
    },
    // ── Türk Telekom ──
    {
      operator: "Türk Telekom", operatorSlug: "turk-telekom", type: "fiber",
      name: "Fiber 100 Mbps", downloadSpeed: 100, uploadSpeed: 20,
      priceMonthly: 659, priceNoCommitment: 799, commitmentMonths: 24,
      dataLimit: "Limitsiz", modemIncluded: true,
      features: JSON.stringify(["Limitsiz", "TV Paketi Seçeneği"]),
      isFeatured: false,
      officialUrl: "https://turktelekom.com.tr",
    },
    {
      operator: "Türk Telekom", operatorSlug: "turk-telekom", type: "fiber",
      name: "Fiber 250 Mbps", downloadSpeed: 250, uploadSpeed: 50,
      priceMonthly: 819, commitmentMonths: 24,
      dataLimit: "Limitsiz", modemIncluded: true,
      features: JSON.stringify(["Limitsiz", "Ebeveyn Kontrolü"]),
      officialUrl: "https://turktelekom.com.tr",
    },
    // ── Vodafone ──
    {
      operator: "Vodafone", operatorSlug: "vodafone", type: "fiber",
      name: "Vodafone Ev 100 Mbps", downloadSpeed: 100, uploadSpeed: 20,
      priceMonthly: 679, commitmentMonths: 24,
      dataLimit: "Limitsiz", modemIncluded: true,
      features: JSON.stringify(["Vodafone TV", "Limitsiz"]),
      officialUrl: "https://vodafone.com.tr/ev-interneti",
    },
    // ── TurkNet ──
    {
      operator: "TurkNet", operatorSlug: "turknet", type: "fiber",
      name: "TurkNet 100 Mbps", downloadSpeed: 100, uploadSpeed: 20,
      priceMonthly: 609, priceNoCommitment: 749, commitmentMonths: 24,
      dataLimit: "Limitsiz", modemIncluded: true,
      features: JSON.stringify(["Şeffaf Fiyat", "Altyapı Bağımsız"]),
      officialUrl: "https://turknet.net.tr",
    },
  ]);

  console.log("✅ Ev internet paketleri eklendi");

  // ─── Mobil Tarifeler ──────────────────────────────────────────────────────

  await db.delete(mobileTariffs);

  await db.insert(mobileTariffs).values([
    // ── Turkcell ──
    {
      operator: "Turkcell", operatorSlug: "turkcell",
      name: "Rahat 6 GB", gbLimit: 6, minuteLimit: null, smsLimit: null,
      priceMonthly: 449, isContract: true,
      features: JSON.stringify(["5G", "Sınırsız Dakika"]),
      officialUrl: "https://turkcell.com.tr",
    },
    {
      operator: "Turkcell", operatorSlug: "turkcell",
      name: "Rahat 12 GB", gbLimit: 12, minuteLimit: null,
      priceMonthly: 599, isContract: true,
      features: JSON.stringify(["5G", "Sınırsız Dakika", "BiP Premium"]),
      isFeatured: false,
      officialUrl: "https://turkcell.com.tr",
    },
    {
      operator: "Turkcell", operatorSlug: "turkcell",
      name: "Rahat 20 GB", gbLimit: 20, minuteLimit: null,
      priceMonthly: 749, isContract: true,
      features: JSON.stringify(["5G", "Sınırsız Dakika", "TV+"]),
      officialUrl: "https://turkcell.com.tr",
    },
    {
      operator: "Turkcell", operatorSlug: "turkcell",
      name: "Sınırsız S", gbLimit: null, minuteLimit: null,
      priceMonthly: 999, isContract: true,
      features: JSON.stringify(["5G", "Sınırsız İnternet", "Sınırsız Dakika"]),
      isFeatured: true,
      officialUrl: "https://turkcell.com.tr",
    },
    // ── Vodafone ──
    {
      operator: "Vodafone", operatorSlug: "vodafone",
      name: "Freedom M", gbLimit: 10, minuteLimit: null,
      priceMonthly: 479, isContract: true,
      features: JSON.stringify(["4.5G/5G", "Sınırsız Dakika"]),
      officialUrl: "https://vodafone.com.tr",
    },
    {
      operator: "Vodafone", operatorSlug: "vodafone",
      name: "Freedom L", gbLimit: 20, minuteLimit: null,
      priceMonthly: 649, isContract: true,
      features: JSON.stringify(["4.5G/5G", "Sınırsız Dakika", "Vodafone TV"]),
      isFeatured: true,
      officialUrl: "https://vodafone.com.tr",
    },
    {
      operator: "Vodafone", operatorSlug: "vodafone",
      name: "Red XL", gbLimit: null,
      priceMonthly: 1099, isContract: true,
      features: JSON.stringify(["5G", "Sınırsız", "Yurt Dışı Roaming"]),
      officialUrl: "https://vodafone.com.tr",
    },
    // ── Türk Telekom ──
    {
      operator: "Türk Telekom", operatorSlug: "turk-telekom",
      name: "Avantaj 8 GB", gbLimit: 8, minuteLimit: null,
      priceMonthly: 429, isContract: true,
      features: JSON.stringify(["4.5G", "Sınırsız Dakika"]),
      officialUrl: "https://turktelekom.com.tr",
    },
    {
      operator: "Türk Telekom", operatorSlug: "turk-telekom",
      name: "Avantaj 15 GB", gbLimit: 15, minuteLimit: null,
      priceMonthly: 569, isContract: true,
      features: JSON.stringify(["4.5G", "Sınırsız Dakika", "TV Paketi"]),
      isFeatured: true,
      officialUrl: "https://turktelekom.com.tr",
    },
    {
      operator: "Türk Telekom", operatorSlug: "turk-telekom",
      name: "Sınırsız Avantaj", gbLimit: null,
      priceMonthly: 899, isContract: true,
      features: JSON.stringify(["4.5G", "Sınırsız"]),
      officialUrl: "https://turktelekom.com.tr",
    },
  ]);

  console.log("✅ Mobil tarifeler eklendi");
  console.log("🎉 Seed tamamlandı!");
  process.exit(0);
}

seed().catch((e) => {
  console.error("❌ Seed hatası:", e);
  process.exit(1);
});
