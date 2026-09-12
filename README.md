# tarifesec.net.tr

Türkiye'nin internet ve mobil tarife karşılaştırma platformu.
**internetpaketi.net.tr** için trafik besleyici yan platform.

## Stack

- **Frontend**: React 19 + Vite + TypeScript + Tailwind v4 (wouter router, TanStack Query)
- **Backend**: Node.js + Express + TypeScript
- **DB**: PostgreSQL (Railway)
- **ORM**: Drizzle
- **Hosting**: Railway (GitHub auto-deploy)

## Geliştirme

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. .env dosyası oluştur
cp .env.example .env
# DATABASE_URL ve ADMIN_SECRET'i doldur

# 3. DB şeması + başlangıç verileri
npm run db:push
npm run db:seed
npm run db:seed:blog   # rehber yazıları

# 4. Dev sunucusu (backend :3000, Vite :5173)
npm run dev
```

## Ortam Değişkenleri

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `DATABASE_URL` | ✅ | PostgreSQL bağlantısı (Railway otomatik inject eder) |
| `ADMIN_SECRET` | ✅ | Admin API şifresi. **Tanımlı değilse `/api/admin` uçları 503 ile kapalı çalışır.** |
| `NODE_ENV` | — | `production` derlenmiş SPA'yı servis eder |
| `VISITOR_BASE` | — | Ziyaretçi sayacı tabanı (varsayılan `1000`) |
| `DATABASE_SSL` | — | `true`/`false` ile SSL'i elle zorla; boşsa host'a göre otomatik |
| `SITE_URL` | — | sitemap/canonical kökü (varsayılan `https://www.tarifesec.net.tr`) |

## Ziyaretçi Sayacı

Footer'daki rozet (`client/src/components/VisitCounter.tsx`) `GET /api/visitors`
ucundan beslenir.

- **Gösterilen toplam = `VISITOR_BASE` (1000) + gerçek tekil ziyaret sayısı** —
  rozet her zaman 1000 ve üzerinde bir değer gösterir; sayma animasyonu da
  1000'den başlar, asla altına düşmez.
- Aynı ziyaretçi gün içinde **bir kez** sayılır (`tsv` çerezi, gün sonunda düşer).
- Bot/crawler/headless istekler User-Agent'a göre elenir.
- Kalıcı veri PostgreSQL'de: `site_counters` (toplam) + `visit_days` (günlük).
- DB erişilemezse bellek içi yedeğe düşer; rozet hiçbir durumda hata göstermez.

Taban değeri değiştirmek için `VISITOR_BASE` ortam değişkenini ayarlayın —
koda sayı gömmeyin.

## API

| Uç | Yetki | Açıklama |
|----|-------|----------|
| `GET /api/packages` | açık | Ev interneti paketleri (`operator`, `type`, `minSpeed`, `sort`) |
| `GET /api/packages/:id` | açık | Tek paket |
| `POST/PUT /api/packages` | 🔒 admin | Paket ekle/güncelle |
| `GET /api/mobile` | açık | Mobil tarifeler |
| `PUT /api/mobile/:id` | 🔒 admin | Tarife güncelle |
| `POST /api/leads` | açık (hız sınırlı) | Teklif formu — TR telefon doğrulaması + honeypot |
| `GET /api/leads` | 🔒 admin | **Kişisel veri** — yalnızca admin |
| `GET /api/blog[/:slug]` | açık | Yayınlanmış yazılar |
| `/robots.txt` `/sitemap.xml` | açık | Canlı veriden üretilir |
| `/llms.txt` `/llms-full.txt` | açık | Yapay zekâ motorları için özet/tam veri |
| `GET /api/visitors` | açık | Ziyaretçi sayacı |
| `GET /api/speedtest/*` | açık (hız sınırlı) | Hız testi ping/download/upload/stats |
| `/api/admin/*` | 🔒 admin | Fiyat onayı, scrape log, leadler |

Admin yetkisi **yalnızca `x-admin-secret` başlığıyla** verilir. `?secret=`
sorgu parametresi loglara ve Referer başlığına sızdığı için desteklenmez.

## SEO / AEO — sunucu tarafı üretim (AI botları JS çalıştırmaz!)

Site bir SPA'dir; **içerik istemcide render edilir**. GPTBot, ClaudeBot,
PerplexityBot ve Googlebot'un ilk turu JavaScript çalıştırmadığı için bu
istemciler eskiden boş bir `<div id="root">` ve her URL'de aynı `<title>`
görüyordu. Bu yüzden HTML artık **sunucuda** üretilir:

- `server/seo/render.ts` her rota için `<title>`, `description`, `canonical`,
  Open Graph / Twitter etiketlerini ve JSON-LD bloklarını `index.html` kabuğuna
  enjekte eder; `#root` içine **gerçek içerik** basar (paket listesi, fiyatlar,
  SSS). React mount olunca bu düğümün yerini alır.
- **KURAL:** sunucuda basılan bilgi, kullanıcının gördüğü bilgiyle AYNI olmalı.
  Gizli metin veya farklı içerik sunmak (cloaking) cezalandırılır.
- Rota meta verisi `shared/routes.ts` içindedir; sunucu ve istemci **aynı**
  kaynaktan okur (`useRouteSeo`). İkisinin ayrı başlık tutması, Googlebot'un
  JS öncesi/sonrası farklı başlık görmesine yol açar — ayırmayın.
- JSON-LD **yalnızca sunucuda** üretilir (`server/seo/jsonld.ts`): Organization,
  WebSite+SearchAction, BreadcrumbList, FAQPage, ItemList+Offer (paketler ve
  tarifeler), WebApplication (hız testi), Article (blog).
- SSS içeriği `server/seo/faq.ts` — hem görünür metin hem FAQPage şeması üretir.
  Yapay zekâ motorları soru-cevap içeriğini doğrudan alıntılar; cevapları kısa
  ve kendi başına anlamlı yazın.
- 404 artık gerçek **404** durum kodu döner (eski SPA fallback 200 dönüyordu =
  soft-404).

### Yapay zekâ görünürlüğü (AEO)

- `/llms.txt` — sitenin makine-okunur özeti (yol haritası + özet rakamlar)
- `/llms-full.txt` — tüm paket/tarife fiyatlarının tam listesi + SSS
- `/robots.txt` — GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot,
  Google-Extended, Applebot-Extended **isimle karşılanır**. Bu botları
  engellemek AI görünürlüğünü sıfırlar.
- `/sitemap.xml` — canlı veriden üretilir, blog yazılarını da içerir.

Dördü de `server/routes/seo.ts` içinde, DB'den **canlı** üretilir; statik
kopya tutulmaz (veri bayatlamasın).

### Yeni rota eklerken

1. `client/src/App.tsx` — rota tanımı
2. `shared/routes.ts` — başlık/açıklama (sitemap ve SSR otomatik kapsar)
3. `server/seo/content.ts` — taranabilir içerik (gerekiyorsa)
4. `server/seo/faq.ts` — sayfaya ait SSS (varsa)

## Klasör Yapısı

```
tarifesec/
├── shared/routes.ts     # TEK DOĞRU KAYNAK — rota meta (sunucu + istemci)
├── client/
│   ├── public/          # favicon, OG görseli
│   └── src/
│       ├── pages/       # Home, PaketKarsilastirma, MobilTarifeler, HizTesti, Blog, NotFound
│       ├── components/  # Layout, VisitCounter, TeklifFormu
│       └── lib/         # api.ts (fetch), hooks.ts (useSeo, useCountUp, parseFeatures)
├── server/
│   ├── index.ts         # Express entry + güvenlik başlıkları + SSR servis
│   ├── config.ts        # TEK DOĞRU KAYNAK — sayılar/katsayılar
│   ├── middleware/      # auth.ts (fail-closed), rateLimit.ts
│   ├── seo/             # render, meta, jsonld, content, faq, llms, data
│   └── routes/          # packages, mobile, leads, blog, admin, visitors,
│                        # speedtest, seo (robots/sitemap/llms)
├── drizzle/             # schema.ts, db.ts, seed.ts, seed-blog.ts
└── scraper/index.ts     # Günlük fiyat tarayıcı (Railway Cron)
```

## Konvansiyonlar

- **Sayı gömme**: katsayı/limit/taban değerleri `server/config.ts`'te tutulur.
- **SEO**: Yukarıdaki "SEO / AEO" bölümüne bakın. Başlık/açıklama tek kaynakta
  (`shared/routes.ts`); istemciye sayı veya metin gömmeyin.
- **Fiyat güvenliği**: scraper HTML'den sırayla eşleştirme yaptığı için
  %40'tan büyük fiyat sapmalarını **yayınlamaz**, elle onaya bırakır
  (`scraper/index.ts` → `MAX_DRIFT`).
- `features` alanı bozuk JSON içerebilir; her zaman `parseFeatures()` ile okuyun.

## Test (commit öncesi)

```bash
npm test          # tsc --noEmit
npm run build     # vite build + sitemap + esbuild → dist/
npm start         # http://localhost:3000
```

`/`, `/paket-karsilastir`, `/mobil-tarifeler`, `/hiz-testi`, `/blog` ve
`/api/health`, `/api/visitors` uçlarının 200 döndüğünü doğrulayın.

## Railway Deploy

1. GitHub repo'yu Railway'e bağla
2. **PostgreSQL** servisi ekle → `DATABASE_URL` otomatik inject edilir
3. `NODE_ENV=production` ve `ADMIN_SECRET` environment variable ekle
4. Deploy → `npm run build` && `npm start`

Scraper ayrı bir **Cron Service** olarak çalışır (`railway-cron.json`, her gün 03:00).

## Superonline Bayi

Bağımsız karşılaştırma platformu.
Superonline başvuruları `affiliateUrl` alanındaki `?ref=B9613` parametresiyle izlenir.
