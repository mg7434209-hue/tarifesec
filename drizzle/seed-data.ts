/**
 * Başlangıç verisi — hem CLI seed'i hem de sunucu açılışındaki otomatik
 * doldurma buradan okur (tek kaynak).
 *
 * Değerler 01.10.2026'da resmi operatör sayfalarından doğrulandı; kaynaklar
 * drizzle/data-updates.ts'te. Fiyat değişince BURASI ve data-updates.ts
 * birlikte güncellenir (canlı veritabanını data-updates düzeltir).
 */
import type { InsertPackage, InsertMobileTariff } from "./schema";

const SO_FEATS = JSON.stringify(["Online'a özel kampanya", "Modem dahil", "Ücretsiz kurulum", "YouTube Premium"]);
const SB_FEATS = JSON.stringify(["5G", "Wi-Fi 7 modem", "Kurulum gerektirmez"]);
const TT_FEATS = JSON.stringify(["Online'da 12 Ay Avantaj Kampanyası", "Ücretsiz kurulum", "Kampanya 31.12.2026'ya kadar"]);

export const SEED_PACKAGES: InsertPackage[] = [
    // ── Superonline Fiber (isFeatured = true, Bayi B9613) ──
    {
      operator: "Superonline", operatorSlug: "superonline", type: "fiber",
      name: "Fiber 100 Mbps", downloadSpeed: 100, uploadSpeed: null,
      priceMonthly: 950, priceNoCommitment: null, commitmentMonths: 12,
      dataLimit: "Limitsiz", modemIncluded: true, installationFee: 0,
      features: SO_FEATS, isFeatured: true,
      affiliateUrl: "https://superonline.net",
      officialUrl: "https://www.superonline.net/ev-interneti/100-mbps",
    },
    {
      operator: "Superonline", operatorSlug: "superonline", type: "fiber",
      name: "Fiber 500 Mbps", downloadSpeed: 500, uploadSpeed: null,
      priceMonthly: 950, priceNoCommitment: 1050, commitmentMonths: 12,
      dataLimit: "Limitsiz", modemIncluded: true, installationFee: 0,
      features: JSON.stringify(["Fiber Hızları Kampanyası", "Modem dahil", "Ücretsiz kurulum"]),
      isFeatured: true,
      affiliateUrl: "https://superonline.net",
      officialUrl: "https://www.superonline.net/ev-interneti/500-mbps-ye-kadar",
    },
    {
      operator: "Superonline", operatorSlug: "superonline", type: "fiber",
      name: "Fiber 1000 Mbps", downloadSpeed: 1000, uploadSpeed: null,
      priceMonthly: 950, priceNoCommitment: null, commitmentMonths: 12,
      dataLimit: "Limitsiz", modemIncluded: true, installationFee: 0,
      features: SO_FEATS, isFeatured: true,
      affiliateUrl: "https://superonline.net",
      officialUrl: "https://www.superonline.net/ev-interneti/1000-mbps",
    },
    // ── Superbox 5G (kablosuz; downloadSpeed 0 = hız kapsamaya bağlı) ──
    {
      operator: "Superonline", operatorSlug: "superonline", type: "kablosuz",
      name: "Superbox 5G Evinde 250 GB", downloadSpeed: 0, uploadSpeed: null,
      priceMonthly: 790, priceNoCommitment: null, commitmentMonths: 12,
      dataLimit: "250 GB", modemIncluded: true, installationFee: 0,
      features: SB_FEATS, isFeatured: true,
      affiliateUrl: "https://superonline.net",
      officialUrl: "https://www.superonline.net/ev-interneti/superbox",
    },
    {
      operator: "Superonline", operatorSlug: "superonline", type: "kablosuz",
      name: "Superbox 5G Evinde 500 GB", downloadSpeed: 0, uploadSpeed: null,
      priceMonthly: 900, priceNoCommitment: null, commitmentMonths: 12,
      dataLimit: "500 GB", modemIncluded: true, installationFee: 0,
      features: SB_FEATS, isFeatured: true,
      affiliateUrl: "https://superonline.net",
      officialUrl: "https://www.superonline.net/ev-interneti/superbox",
    },
    // ── Türk Telekom (modem fiyata dahil değil) ──
    {
      operator: "Türk Telekom", operatorSlug: "turk-telekom", type: "fiber",
      name: "Fiber 100 Mbps", downloadSpeed: 100, uploadSpeed: null,
      priceMonthly: 1145, priceNoCommitment: null, commitmentMonths: 12,
      dataLimit: "Limitsiz", modemIncluded: false,
      features: TT_FEATS,
      officialUrl: "https://bireysel.turktelekom.com.tr/evde-internet/yeni-musteri-kampanyalari/onlineda-12-ay-avantaj-kampanyasi-100-mbps",
    },
    {
      operator: "Türk Telekom", operatorSlug: "turk-telekom", type: "fiber",
      name: "Fiber 500 Mbps", downloadSpeed: 500, uploadSpeed: null,
      priceMonthly: 1000, priceNoCommitment: null, commitmentMonths: 12,
      dataLimit: "Limitsiz", modemIncluded: false,
      features: TT_FEATS,
      officialUrl: "https://bireysel.turktelekom.com.tr/evde-internet/yeni-musteri-kampanyalari/onlineda-12-ay-avantaj-kampanyasi-500-mbps",
    },
    // ── TurkNet (taahhütsüz; liste fiyatı 949,90 ₺) ──
    {
      operator: "TurkNet", operatorSlug: "turknet", type: "fiber",
      name: "TurkNet 100 Mbps", downloadSpeed: 100, uploadSpeed: 20,
      priceMonthly: 950, priceNoCommitment: 950, commitmentMonths: 0,
      dataLimit: "Limitsiz", modemIncluded: true,
      features: JSON.stringify([
        "Taahhütsüz",
        "Liste fiyatı 949,90 ₺/ay",
        "Yeni aboneliğe ilk 3 ay 749,90 ₺ (kampanya 31.10.2026'ya kadar)",
      ]),
      officialUrl: "https://www.turk.net/",
    },
    // Vodafone ev interneti: 01.10.2026'da güncel fiyat doğrulanamadı — eklenmedi.
  ];

const TC = (name: string, gb: number, price: number, featured = false): InsertMobileTariff => ({
  operator: "Turkcell", operatorSlug: "turkcell", name,
  gbLimit: gb, minuteLimit: 1000, priceMonthly: price, isContract: true, isFeatured: featured,
  features: JSON.stringify(["5G", "12 ay sabit fiyat", "Yeni hat / numara taşıma"]),
  officialUrl: "https://www.turkcell.com.tr/turkcellli-olmak/paket-secimi",
});

const VF = (name: string, gb: number, price: number, featured = false): InsertMobileTariff => ({
  operator: "Vodafone", operatorSlug: "vodafone", name,
  gbLimit: gb, minuteLimit: 1000, smsLimit: 250, priceMonthly: price, isContract: true, isFeatured: featured,
  features: JSON.stringify(["5G", "1000 dk + 250 SMS", "12 fatura dönemi", "Online'a özel"]),
  officialUrl: "https://www.vodafone.com.tr/tarifeler/faturali-tarifeler",
});

export const SEED_MOBILE: InsertMobileTariff[] = [
    TC("5G Ultra Dijital 5 GB", 5, 400),
    TC("5G Ultra Dijital 15 GB", 15, 500),
    TC("5G Ultra Dijital 25 GB", 25, 600),
    TC("5G Ultra Dijital 40 GB", 40, 720),
    VF("5G Online Plus 20 GB", 20, 465),
    VF("5G Online Plus 30 GB", 30, 565),
    VF("5G Online Plus 50 GB", 50, 685),
    // Türk Telekom mobil: 01.10.2026'da güncel fiyat doğrulanamadı — eklenmedi.
  ];
