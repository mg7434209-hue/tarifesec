/**
 * TEK DOĞRU KAYNAK — sunucu tarafı ayarlar.
 * Sayıları route/bileşen içine gömme; buradan oku.
 */
export const config = {
  site: {
    url: (process.env.SITE_URL || "https://www.tarifesec.net.tr").replace(/\/$/, ""),
    name: "tarifesec.net.tr",
    /**
     * Arama motoru doğrulama etiketleri — Railway Variables'tan girilir,
     * koda yazılmaz. Google'ınki index.html'de sabittir (zaten doğrulandı).
     *   BING_SITE_VERIFICATION   → <meta name="msvalidate.01">  (Bing Webmaster)
     *   YANDEX_VERIFICATION      → <meta name="yandex-verification">
     */
    verification: {
      bing: (process.env.BING_SITE_VERIFICATION ?? "").trim(),
      yandex: (process.env.YANDEX_VERIFICATION ?? "").trim(),
    },
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
    /** Yalnızca sonuç kaydı / istatistik uçları için */
    speedTestMeta: { windowMs: 60 * 1000, max: 30 },
  },

  /** Otomatik fiyat taraması */
  scrape: {
    auto: process.env.AUTO_SCRAPE !== "false",
    intervalHours: Number(process.env.SCRAPE_INTERVAL_HOURS ?? 12),
    /** Dağıtım sonrası ilk turu geciktir (yeniden başlatma fırtınasını önler) */
    startupDelayMinutes: Number(process.env.SCRAPE_STARTUP_DELAY_MIN ?? 5),
    /**
     * Bu süreden eski veri "bayat" sayılır; admin panelinde uyarı çıkar ve
     * karşılaştırma sayfasındaki tazelik satırı uyarı tonuna geçer.
     * Tarama 12 saatte bir çalıştığı için 48 saat, üst üste birkaç turun
     * sessizce başarısız olduğu anlamına gelir.
     */
    staleAfterHours: Number(process.env.STALE_AFTER_HOURS ?? 48),
  },

  /** Hız testi parametreleri */
  speedTest: {
    /**
     * IP başına bant genişliği bütçesi. Tek bir tam test ~1-2 GB'a kadar
     * çıkabilir (hızlı hatlarda); bütçe birkaç teste izin verecek, sürekli
     * kötüye kullanıma izin vermeyecek şekilde seçilmiştir.
     */
    budgetWindowMs: 10 * 60 * 1000,
    budgetBytes: 6 * 1024 * 1024 * 1024,
    maxDownloadBytes: 50 * 1024 * 1024,
    maxUploadBytes: 8 * 1024 * 1024,
    defaultBytes: 8 * 1024 * 1024,
    /**
     * Sunucu geneli GÜNLÜK veri bütçesi (GB). Dolunca test o gün "kapasite
     * doldu" der. 100 Mbps'lik bir hatta tek test ≈ 100–150 MB'tır; 200 GB
     * kabaca günde 1.500+ test demektir. Railway Variables: SPEEDTEST_DAILY_GB
     */
    dailyBudgetGB: Number(process.env.SPEEDTEST_DAILY_GB ?? 200),
  },
} as const;
