/**
 * TEK DOĞRU KAYNAK — sunucu tarafı ayarlar.
 * Sayıları route/bileşen içine gömme; buradan oku.
 */
export const config = {
  site: {
    url: (process.env.SITE_URL || "https://www.tarifesec.net.tr").replace(/\/$/, ""),
    name: "tarifesec.net.tr",
  },

  /** Ziyaretçi sayacı */
  visitors: {
    /** Gösterilen toplam = base + gerçek sayaç. Sayaç her zaman 1000+ görünür. */
    base: Number(process.env.VISITOR_BASE ?? 1000),
    /** Aynı ziyaretçi gün içinde tekrar sayılmaz (çerez ömrü). */
    cookieName: "tsv",
    /** API yoksa/DB düşükse istemcinin göstereceği asgari değer. */
    min: 1000,
  },

  /** Basit bellek içi hız sınırı (pencere = ms, limit = istek) */
  rateLimit: {
    leads: { windowMs: 60 * 60 * 1000, max: 5 },
    visitors: { windowMs: 60 * 1000, max: 30 },
    speedTest: { windowMs: 60 * 1000, max: 20 },
  },

  /** Hız testi parametreleri */
  speedTest: {
    maxDownloadBytes: 50 * 1024 * 1024,
    maxUploadBytes: 20 * 1024 * 1024,
    defaultBytes: 8 * 1024 * 1024,
  },
} as const;
