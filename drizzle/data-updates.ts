/**
 * Tek seferlik VERİ güncellemeleri — kaynaklı fiyat düzeltmeleri.
 *
 * Başlangıç verisi (seed-data.ts) yalnızca BOŞ tabloya yazılır; canlı
 * veritabanındaki eski fiyatları düzeltmez. Bu liste, doğrulanmış fiyatları
 * açılışta (server/bootstrap.ts) bir kez uygular:
 *
 *  - Her kayıt `id` ile settings tablosuna işlenir → ikinci kez uygulanmaz.
 *  - GÜVENLİK: satırın şu anki fiyatı `expectPrice` değilse DOKUNULMAZ
 *    (admin elle düzeltmiş ya da tarama güncellemiş demektir); günlüğe yazılır.
 *  - Yalnızca KAYNAĞI olan değer yazılır. Doğrulanamayan fiyat buraya girmez;
 *    admin panelinden elle güncellenir.
 *
 * Yeni düzeltme = listeye yeni `id`'li kayıt. Eski kayıtları silmeyin.
 */
export type PackageUpdate = {
  id: string;
  match: { operatorSlug: string; type: string; downloadSpeed: number };
  /** Satır yalnızca bu fiyattaysa güncellenir */
  expectPrice: number;
  set: {
    priceMonthly: number;
    priceNoCommitment?: number | null;
    commitmentMonths?: number;
    uploadSpeed?: number | null;
    features?: string[];
    officialUrl?: string;
  };
  /** Kaynak ve doğrulama tarihi — kod incelemesi için */
  source: string;
};

export const PACKAGE_UPDATES: PackageUpdate[] = [
  {
    id: "2026-10-01-turknet-100",
    match: { operatorSlug: "turknet", type: "fiber", downloadSpeed: 100 },
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
      "TurkNet 19.06.2026 zammı (gzt.com, yenisafak.com, webtekno.com haberleri) + turk.net/hiz-isteyene-turknet-kampanyasi — doğrulama 01.10.2026",
  },
  {
    id: "2026-10-01-superonline-fiber-100",
    match: { operatorSlug: "superonline", type: "fiber", downloadSpeed: 100 },
    expectPrice: 699,
    set: {
      priceMonthly: 950,
      // Eski taahhütsüz fiyat (849) yeni taahhütlü fiyatın altında kaldı — bilinmiyor
      priceNoCommitment: null,
      commitmentMonths: 12,
      // Kampanya sayfası yükleme hızını yazmıyor; eski "100 Mbps" değeri kaldırıldı
      uploadSpeed: null,
      features: ["Online'a özel kampanya", "Modem dahil", "Ücretsiz kurulum", "YouTube Premium"],
      officialUrl: "https://www.superonline.net/ev-interneti/100-mbps",
    },
    source:
      "superonline.net 'Online'a Özel Fiber Hızları Kampanyası' — 100 Mbps, 12 ay taahhüt, 950 TL/ay — doğrulama 01.10.2026",
  },
];
