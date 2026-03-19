# tarifesec.net.tr

Türkiye'nin internet ve mobil tarife karşılaştırma platformu.  
**internetpaketi.net.tr** için trafik besleyici yan platform.

## Stack

- **Frontend**: React 19 + Vite + TypeScript + Tailwind v4
- **Backend**: Node.js + Express + TypeScript
- **DB**: PostgreSQL (Railway)
- **ORM**: Drizzle
- **Hosting**: Railway (GitHub auto-deploy)

## Geliştirme

```bash
# 1. Bağımlılıkları yükle
pnpm install

# 2. .env dosyası oluştur
cp .env.example .env
# DATABASE_URL'yi Railway PostgreSQL bağlantısıyla doldur

# 3. DB migration + seed
pnpm db:push
tsx drizzle/seed.ts

# 4. Dev sunucusu (frontend :5173, backend :3000)
pnpm dev
```

## Railway Deploy

1. GitHub repo'yu Railway'e bağla
2. **PostgreSQL** servisi ekle → `DATABASE_URL` otomatik inject edilir
3. `NODE_ENV=production` environment variable ekle
4. Deploy!

## Klasör Yapısı

```
tarifesec/
├── client/src/
│   ├── pages/         # Home, PaketKarsilastirma, MobilTarifeler, HizTesti
│   ├── components/    # Layout, Navbar, Footer
│   └── lib/           # api.ts (fetch helpers)
├── server/
│   ├── index.ts       # Express entry
│   └── routes/        # packages, mobile, leads, blog
├── drizzle/
│   ├── schema.ts      # PostgreSQL şeması
│   ├── db.ts          # DB bağlantısı
│   └── seed.ts        # Başlangıç verileri
├── railway.json
├── nixpacks.toml
└── drizzle.config.ts
```

## Superonline Bayi

Göksoylar İletişim — Bayi Kodu: **B9613** — Manavgat, Antalya  
Superonline başvuruları `affiliateUrl` alanındaki `?ref=B9613` parametresiyle izlenir.
