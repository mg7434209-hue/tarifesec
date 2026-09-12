# Yayına Alma Rehberi

> Bu dosya, siteyi canlıya alırken **ne yapmanız gerektiğini** anlatır.
> Teknik bilgi gerektiren adımlar mümkün olduğunca otomatikleştirilmiştir.

## Kısa özet

Yapmanız gereken **tek zorunlu iş** var: Railway'de PostgreSQL servisinin
bağlı olduğundan emin olmak. Geri kalan her şey site kendiliğinden yapar.

| İş | Kim yapar |
|----|-----------|
| Veritabanı tablolarını oluşturmak | ✅ Site, açılışta otomatik |
| Paketleri, tarifeleri, yazıları yüklemek | ✅ Site, ilk açılışta otomatik |
| Yönetim şifresi belirlemek | 👤 Siz — tarayıcıdan, 1 dakika |
| Fiyatları güncel tutmak | ✅ Site, 12 saatte bir otomatik |

---

## 1. Railway'de PostgreSQL bağlı mı? (zorunlu)

Site verileri veritabanında tutar. Railway panelinde projenize bakın:

1. [railway.app](https://railway.app) → projenizi açın
2. Serviste **PostgreSQL** kutusu görünüyor mu?
   - **Görünüyorsa** → bir şey yapmanıza gerek yok, `DATABASE_URL` otomatik bağlanır
   - **Görünmüyorsa** → sağ üstten **New** → **Database** → **Add PostgreSQL**

Veritabanı yoksa site yine açılır ama paketler görünmez ve ziyaretçi sayacı
her yeniden başlatmada sıfırlanır.

## 2. Yönetim şifresini belirleyin (ilk dağıtımdan hemen sonra)

Tarayıcınızdan şu adrese gidin:

```
https://www.tarifesec.net.tr/admin
```

İlk açılışta **"İlk Kurulum"** ekranı çıkar. Bir şifre yazın (en az 8 karakter),
tekrarlayın, kaydedin. Hepsi bu — Railway'de hiçbir ayar yapmanıza gerek yok.

> ⚠️ **Bunu ilk dağıtımdan sonra hemen yapın.** Şifre belirlenene kadar
> `/admin` adresini bulan herkes şifreyi kendisi belirleyebilir. Sayfa arama
> motorlarına kapalıdır ama adres tahmin edilebilir.

Şifreyi unutursanız veya biri sizden önce belirlediyse: Railway'de
**Variables** sekmesinden `ADMIN_SECRET` adında bir değişken tanımlayın.
Ortam değişkeni her zaman öncelikli olur ve veritabanındaki şifreyi geçersiz
kılar. (Bu, kurtarma yoludur; normal kullanımda gerekmez.)

Şifrenizi sonradan panelin altındaki **"Şifreyi değiştir"** ile
değiştirebilirsiniz.

## 3. Fiyat güncellemesini kontrol edin (dağıtımdan ~10 dakika sonra)

Site, açılıştan **5 dakika sonra** ilk fiyat taramasını yapar, sonra **12 saatte
bir** tekrarlar. Elle bir şey çalıştırmanıza gerek yoktur.

Çalışıp çalışmadığını görmek için `/admin` panelinde üstteki kartlara bakın:

- **"Bayat (72s+)"** sayısı zamanla **azalıyorsa** → tarama çalışıyor ✅
- Sayı **düşmüyorsa** → tarama operatör sayfalarından veri çıkaramıyor

Tarama çalışmıyorsa panelde **"Şimdi tara"** düğmesine basıp birkaç dakika
bekleyin ve sayfayı yenileyin. Yine olmuyorsa operatörler sayfa yapısını
değiştirmiş demektir; `scraper/sources.ts` dosyasındaki adreslerin
güncellenmesi gerekir (bu bir geliştirici işidir — bana söylemeniz yeterli).

> Tarama çalışmasa bile **site yanlış fiyat göstermez**: emin olunamayan hiçbir
> değer yayınlanmaz, eski fiyat olduğu gibi kalır ve panelde "bayat" olarak
> işaretlenir. Bu durumda fiyatları panelden elle de güncelleyebilirsiniz.

## 4. Google'a siteyi tanıtın (isteğe bağlı ama önerilir)

1. [Google Search Console](https://search.google.com/search-console) → siteyi ekleyin
2. **Sitemaps** bölümüne şunu girin: `sitemap.xml`

Site zaten arama motorları ve yapay zekâ botları için hazırdır
(`robots.txt`, `sitemap.xml`, `llms.txt` otomatik üretilir).

---

## Panelde neler yapabilirsiniz?

`/admin` adresinde:

- **Fiyat düzenleme** — tablodaki fiyat kutusuna yeni değeri yazıp "Kaydet".
  Turkcell ve Vodafone bot koruması nedeniyle otomatik taranamaz; onları
  buradan elle güncellemeniz gerekir.
- **"Fiyat değişti" onayı** — tarama bir fiyat değiştirdiğinde kartta rozet
  çıkar. Kontrol edip "Onayla" derseniz rozet kalkar.
- **Bayat veri uyarısı** — 72 saattir kontrol edilmemiş paketler işaretlenir.
- **"Şimdi tara"** — beklemeden tarama başlatır.
- **Şifre değiştirme**.

## Sorun giderme

**Site açılmıyor / hata veriyor**
Railway → **Deployments** → son dağıtımın günlüğüne bakın. `[bootstrap]` ile
başlayan satırlar veritabanı kurulumunu gösterir.

**Paketler görünmüyor**
PostgreSQL bağlı değil (bkz. adım 1). Günlükte
`DATABASE_URL tanımlı değil` yazar.

**Ziyaretçi sayacı her dağıtımda sıfırlanıyor**
Veritabanı bağlı değil; sayaç bellekte tutuluyor demektir.

**Fiyatlar eski**
Panelde "bayat" sayısına bakın, "Şimdi tara" deneyin, olmazsa elle güncelleyin.
