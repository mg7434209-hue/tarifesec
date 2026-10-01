/**
 * Tek seferlik VERİ güncellemeleri — kaynaklı fiyat düzeltmeleri.
 *
 * Başlangıç verisi (seed-data.ts) yalnızca BOŞ tabloya yazılır; canlı
 * veritabanındaki eski fiyatları düzeltmez. Bu liste, doğrulanmış değerleri
 * açılışta (server/bootstrap.ts) bir kez uygular:
 *
 *  - Her kayıt `id` ile settings tablosuna işlenir → ikinci kez uygulanmaz.
 *  - GÜVENLİK: satırın şu anki fiyatı `expectPrice` değilse DOKUNULMAZ
 *    (admin elle düzeltmiş ya da tarama güncellemiş demektir); günlüğe yazılır.
 *  - Yalnızca KAYNAĞI olan değer yazılır (`source`). Doğrulanamayan kayıt
 *    tahmini fiyatla bırakılmaz: `set: { isActive: false }` ile yayından kalkar.
 *  - `replaces: true` → satır artık BAŞKA bir ürünü temsil ediyor (operatör
 *    eski paketi satıştan kaldırdı). "Fiyat arttı/düştü" rozeti ve üstü çizili
 *    eski fiyat gösterilmez; farklı ürünü kıyaslamak yanıltıcı olurdu.
 *
 * 3 GÜNDE BİR güncelleme rutini bu dosyaya yeni `id`'li kayıtlar ekler.
 * `match` + `expectPrice` her zaman seed-data.ts'teki GÜNCEL değerlerle
 * yazılır; uygulanan düzeltme seed-data.ts'e de işlenir (yeni kurulum güncel
 * başlasın). Eski kayıtları silmeyin.
 */
export type PackageSet = Partial<{
  name: string;
  type: string;
  downloadSpeed: number;
  uploadSpeed: number | null;
  priceMonthly: number;
  priceNoCommitment: number | null;
  commitmentMonths: number;
  dataLimit: string;
  modemIncluded: boolean;
  features: string[];
  officialUrl: string;
  isActive: boolean;
}>;

export type MobileSet = Partial<{
  name: string;
  gbLimit: number | null;
  minuteLimit: number | null;
  smsLimit: number | null;
  priceMonthly: number;
  isContract: boolean;
  features: string[];
  officialUrl: string;
  isActive: boolean;
}>;

type Base = {
  id: string;
  /** Satır yalnızca bu fiyattaysa güncellenir */
  expectPrice: number;
  replaces?: boolean;
  /** Kaynak ve doğrulama tarihi — kod incelemesi için */
  source: string;
};

export type DataUpdate =
  | (Base & {
      table: "packages";
      match: { operatorSlug: string; name: string };
      set: PackageSet;
    })
  | (Base & {
      table: "mobile";
      match: { operatorSlug: string; name: string };
      set: MobileSet;
    });

const SO_ONLINE = "superonline.net 'Online'a Özel Fiber Hızları Kampanyası' (12 ay, modem dahil) — doğrulama 01.10.2026";
const SB_5G = "superonline.net 'Superbox 5G Evinde Kampanyası' (12 ay, Wi-Fi 7 modem) — doğrulama 01.10.2026";
const TT_12AY =
  "bireysel.turktelekom.com.tr 'Online'da 12 Ay Avantaj Kampanyası' (19.06–31.12.2026, 12 ay, modem dahil değil) — doğrulama 01.10.2026";
const TC_ULTRA = "turkcell.com.tr '5G Ultra Dijital' yeni müşteri/numara taşıma, 12 ay sabit fiyat, 1000 dk — doğrulama 01.10.2026";
const VF_ONLINE = "vodafone.com.tr '5G Online Plus' faturalı, 12 fatura dönemi, 1000 dk + 250 SMS — doğrulama 01.10.2026";
const UNVERIFIED =
  "01.10.2026: güncel fiyat resmi kaynaktan doğrulanamadı (çelişkili/eski kaynaklar) — tahmini fiyat yayınlamamak için yayından kaldırıldı";

export const DATA_UPDATES: DataUpdate[] = [
  // ── 01.10.2026 — ilk tur ────────────────────────────────────────────────
  {
    id: "2026-10-01-turknet-100",
    table: "packages",
    match: { operatorSlug: "turknet", name: "TurkNet 100 Mbps" },
    expectPrice: 609,
    set: {
      // Liste fiyatı 949,90 ₺; fiyat sütunu tam sayı olduğu için 950
      priceMonthly: 950,
      priceNoCommitment: 950,
      commitmentMonths: 0,
      uploadSpeed: 20,
      features: [
        "Taahhütsüz",
        "Liste fiyatı 949,90 ₺/ay",
        "Yeni aboneliğe ilk 3 ay 749,90 ₺ (kampanya 31.10.2026'ya kadar)",
      ],
      officialUrl: "https://www.turk.net/",
    },
    source:
      "TurkNet 19.06.2026 zammı (gzt.com, yenisafak.com, webtekno.com) + turk.net/hiz-isteyene-turknet-kampanyasi — doğrulama 01.10.2026",
  },
  {
    id: "2026-10-01-superonline-fiber-100",
    table: "packages",
    match: { operatorSlug: "superonline", name: "Fiber 100 Mbps" },
    expectPrice: 699,
    set: {
      priceMonthly: 950,
      priceNoCommitment: null,
      commitmentMonths: 12,
      uploadSpeed: null,
      features: ["Online'a özel kampanya", "Modem dahil", "Ücretsiz kurulum", "YouTube Premium"],
      officialUrl: "https://www.superonline.net/ev-interneti/100-mbps",
    },
    source: SO_ONLINE,
  },
  {
    id: "2026-10-01-superonline-fiber-250-to-1000",
    table: "packages",
    match: { operatorSlug: "superonline", name: "Fiber 250 Mbps" },
    expectPrice: 849,
    replaces: true,
    set: {
      name: "Fiber 1000 Mbps",
      downloadSpeed: 1000,
      uploadSpeed: null,
      priceMonthly: 950,
      priceNoCommitment: null,
      commitmentMonths: 12,
      features: ["Online'a özel kampanya", "Modem dahil", "Ücretsiz kurulum", "YouTube Premium"],
      officialUrl: "https://www.superonline.net/ev-interneti/1000-mbps",
    },
    source: SO_ONLINE + " (250 Mbps paketi artık satılmıyor)",
  },
  {
    id: "2026-10-01-superonline-fiber-500",
    table: "packages",
    match: { operatorSlug: "superonline", name: "Fiber 500 Mbps" },
    expectPrice: 1099,
    set: {
      priceMonthly: 950,
      // "Taahhütsüz Fiberde Süper Teklif — 500 Mbps'ye kadar 1050 TL/ay"
      priceNoCommitment: 1050,
      commitmentMonths: 12,
      uploadSpeed: null,
      features: ["Fiber Hızları Kampanyası", "Modem dahil", "Ücretsiz kurulum"],
      officialUrl: "https://www.superonline.net/ev-interneti/500-mbps-ye-kadar",
    },
    source: SO_ONLINE + " + superonline.net/ev-interneti/taahhutsuz (1050 TL/ay)",
  },
  {
    id: "2026-10-01-superbox-25-to-5g-250gb",
    table: "packages",
    match: { operatorSlug: "superonline", name: "Superbox 25 Mbps" },
    expectPrice: 549,
    replaces: true,
    set: {
      name: "Superbox 5G Evinde 250 GB",
      type: "kablosuz",
      downloadSpeed: 0, // 5G: sabit hız yok, kapsamaya bağlı (shared/format.ts)
      uploadSpeed: null,
      priceMonthly: 790,
      priceNoCommitment: null,
      commitmentMonths: 12,
      dataLimit: "250 GB",
      features: ["5G", "Wi-Fi 7 modem", "Kurulum gerektirmez"],
      officialUrl: "https://www.superonline.net/ev-interneti/superbox",
    },
    source: SB_5G + " (4.5G Superbox 25 Mbps satıştan kalktı)",
  },
  {
    id: "2026-10-01-superbox-50-to-5g-500gb",
    table: "packages",
    match: { operatorSlug: "superonline", name: "Superbox 50 Mbps" },
    expectPrice: 699,
    replaces: true,
    set: {
      name: "Superbox 5G Evinde 500 GB",
      type: "kablosuz",
      downloadSpeed: 0,
      uploadSpeed: null,
      priceMonthly: 900,
      priceNoCommitment: null,
      commitmentMonths: 12,
      dataLimit: "500 GB",
      features: ["5G", "Wi-Fi 7 modem", "Kurulum gerektirmez"],
      officialUrl: "https://www.superonline.net/ev-interneti/superbox",
    },
    source: SB_5G + " (4.5G Superbox 50 Mbps satıştan kalktı)",
  },
  {
    id: "2026-10-01-tt-fiber-100",
    table: "packages",
    match: { operatorSlug: "turk-telekom", name: "Fiber 100 Mbps" },
    expectPrice: 659,
    set: {
      priceMonthly: 1145,
      priceNoCommitment: null,
      commitmentMonths: 12,
      uploadSpeed: null,
      modemIncluded: false,
      features: ["Online'da 12 Ay Avantaj Kampanyası", "Ücretsiz kurulum", "Kampanya 31.12.2026'ya kadar"],
      officialUrl:
        "https://bireysel.turktelekom.com.tr/evde-internet/yeni-musteri-kampanyalari/onlineda-12-ay-avantaj-kampanyasi-100-mbps",
    },
    source: TT_12AY,
  },
  {
    id: "2026-10-01-tt-fiber-250-to-500",
    table: "packages",
    match: { operatorSlug: "turk-telekom", name: "Fiber 250 Mbps" },
    expectPrice: 819,
    replaces: true,
    set: {
      name: "Fiber 500 Mbps",
      downloadSpeed: 500,
      uploadSpeed: null,
      priceMonthly: 1000,
      priceNoCommitment: null,
      commitmentMonths: 12,
      modemIncluded: false,
      features: ["Online'da 12 Ay Avantaj Kampanyası", "Ücretsiz kurulum", "Kampanya 31.12.2026'ya kadar"],
      officialUrl:
        "https://bireysel.turktelekom.com.tr/evde-internet/yeni-musteri-kampanyalari/onlineda-12-ay-avantaj-kampanyasi-500-mbps",
    },
    source: TT_12AY + " (kampanyada 500 Mbps, 100 Mbps'ten ucuz listeleniyor)",
  },
  {
    id: "2026-10-01-vodafone-ev-100-off",
    table: "packages",
    match: { operatorSlug: "vodafone", name: "Vodafone Ev 100 Mbps" },
    expectPrice: 679,
    set: { isActive: false },
    source: UNVERIFIED + " (Vodafone Evde Fiber için 499 / 799 / 1.039 TL gibi çelişkili değerler)",
  },

  // ── Mobil ────────────────────────────────────────────────────────────────
  ...(
    [
      ["Rahat 6 GB", 449, "5G Ultra Dijital 5 GB", 5, 400],
      ["Rahat 12 GB", 599, "5G Ultra Dijital 15 GB", 15, 500],
      ["Rahat 20 GB", 749, "5G Ultra Dijital 25 GB", 25, 600],
      ["Sınırsız S", 999, "5G Ultra Dijital 40 GB", 40, 720],
    ] as const
  ).map(
    ([old, oldPrice, name, gb, price]): DataUpdate => ({
      id: `2026-10-01-turkcell-${gb}gb`,
      table: "mobile",
      match: { operatorSlug: "turkcell", name: old },
      expectPrice: oldPrice,
      replaces: true,
      set: {
        name,
        gbLimit: gb,
        minuteLimit: 1000,
        priceMonthly: price,
        isContract: true,
        features: ["5G", "12 ay sabit fiyat", "Yeni hat / numara taşıma"],
        officialUrl: "https://www.turkcell.com.tr/turkcellli-olmak/paket-secimi",
      },
      source: TC_ULTRA,
    })
  ),
  ...(
    [
      ["Freedom M", 479, "5G Online Plus 20 GB", 20, 465],
      ["Freedom L", 649, "5G Online Plus 30 GB", 30, 565],
      ["Red XL", 1099, "5G Online Plus 50 GB", 50, 685],
    ] as const
  ).map(
    ([old, oldPrice, name, gb, price]): DataUpdate => ({
      id: `2026-10-01-vodafone-${gb}gb`,
      table: "mobile",
      match: { operatorSlug: "vodafone", name: old },
      expectPrice: oldPrice,
      replaces: true,
      set: {
        name,
        gbLimit: gb,
        minuteLimit: 1000,
        smsLimit: 250,
        priceMonthly: price,
        isContract: true,
        features: ["5G", "1000 dk + 250 SMS", "12 fatura dönemi", "Online'a özel"],
        officialUrl: "https://www.vodafone.com.tr/tarifeler/faturali-tarifeler",
      },
      source: VF_ONLINE,
    })
  ),
  ...(
    [
      ["Avantaj 8 GB", 429],
      ["Avantaj 15 GB", 569],
      ["Sınırsız Avantaj", 899],
    ] as const
  ).map(
    ([old, oldPrice]): DataUpdate => ({
      id: `2026-10-01-tt-mobil-off-${old.toLowerCase().replace(/\s+/g, "-")}`,
      table: "mobile",
      match: { operatorSlug: "turk-telekom", name: old },
      expectPrice: oldPrice,
      set: { isActive: false },
      source: UNVERIFIED + " (Türk Telekom mobil için 205–1.100 TL arası çelişkili değerler)",
    })
  ),
];
