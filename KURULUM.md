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

## 0. HANGİ ADRESE BAKIYORSUNUZ? (önce bunu kontrol edin)

Alan adınızın iki hâli **farklı sunuculara** bakıyor:

| Adres | Nereye gidiyor |
|-------|----------------|
| `www.tarifesec.net.tr` | ✅ Railway (sitemizin çalıştığı yer) |
| `tarifesec.net.tr` (www'siz) | ❌ Başka bir sunucu — Railway değil |

**www'siz adrese bakarsanız değişiklikleri ASLA göremezsiniz**, kaç kez
dağıtım yaparsak yapalım. Test ederken mutlaka `www.` ile açın.

### Kalıcı çözümü (önerilir)

Alan adınızı aldığınız yerin DNS ayarlarında, www'siz kaydın da Railway'e
gitmesini sağlayın:

1. Railway → projeniz → **Settings** → **Domains**
2. `tarifesec.net.tr` (www'siz) adresini de **Custom Domain** olarak ekleyin
3. Railway size bir hedef gösterir; alan adı sağlayıcınızın DNS panelinde
   apex kaydını (`@` veya boş isimli kayıt) o hedefe yönlendirin
4. Alternatif: apex'i `www`'ye yönlendiren bir kural tanımlayın

Bu yapılmazsa ziyaretçilerinizin bir kısmı eski/boş sayfayı görmeye devam eder
ve Google iki ayrı site görür (SEO açısından da zararlıdır).

## 1. Railway'de PostgreSQL bağlı mı? (zorunlu)

### Önce şunu açın — 5 saniyede anlarsınız

Tarayıcınızdan:

```
https://www.tarifesec.net.tr/api/health
```

- `"database": "bağlı"` → her şey yolunda
- `"database": "yapılandırılmamış"` → **PostgreSQL bağlı değil**, aşağıdaki
  adımları uygulayın

Veritabanı bağlı değilken site açılır ama şunlar olmaz:
paketler görünmez (karşılaştırma sayfası boş kalır), ziyaretçi sayacı her
dağıtımda 1.000'e döner, fiyat şeması (JSON-LD) üretilemez ve Google fiyatları
göremez.

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

## 3.1 Tarifelerin güncel kaldığından emin olun

Site fiyatları **12 saatte bir** kendiliğinden tarar. Sizin bir şey yapmanız
gerekmez; ama taramanın sessizce bozulmadığını bilmek istersiniz.

### Panelden bakmak (en kolay)

`/admin` → üstte **"Operatör tarama durumu"** tablosu. Her operatör için:

- ✅ **çalışıyor** — son 48 saat içinde güncellenmiş
- ❌ **güncellenmiyor** — yanında hata sebebi yazar (ör. "sayfa yapısı değişmiş
  olabilir"). Bu operatörün fiyatlarını tablodan elle düzeltebilirsiniz.
- **elle güncellenir** — Turkcell ve Vodafone bot koruması nedeniyle otomatik
  taranamaz, normaldir.

Sorun varsa sayfanın üstünde kırmızı bir uyarı bandı çıkar.

### Otomatik uyarı almak (önerilir — ücretsiz)

Panele bakmayı unutursanız da haberiniz olsun diye bir sağlık adresi var:

```
https://www.tarifesec.net.tr/api/health/data
```

Veri güncelse **200**, 48 saattir güncellenmemişse **503** döner.

[UptimeRobot](https://uptimerobot.com) gibi ücretsiz bir izleme servisine
kaydolup bu adresi ekleyin (HTTP monitör, 1 saatte bir kontrol yeterli).
Tarama bozulduğunda size **e-posta gelir**. Kurulumu 5 dakika sürer.

### Ziyaretçi ne görür?

Veri 2 günden eskiyse karşılaştırma sayfasında turuncu bir uyarı çıkar:
"Fiyatlar son kontrol: 11 Eylül 2026 (3 gün önce) — başvuru öncesi operatör
sitesinden doğrulayın". Eski fiyatı gizlemek yerine açıkça söylüyoruz;
yanlış fiyatla operatöre başvuran kullanıcı siteye bir daha güvenmez.

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

**Site çalışıyor ama YAPTIĞIMIZ DEĞİŞİKLİKLER GÖRÜNMÜYOR**

En sık sebep: Railway'de derleme başarısız oluyor ve Railway **son çalışan
sürümü sunmaya devam ediyor**. Site açılır, hata vermez, ama kod eskidir.

Railway → servis → **Deployments** sekmesine bakın. Son dağıtım kırmızı
(Failed) ise üstüne tıklayıp günlüğe bakın. Şu satırı görüyorsanız:

    sh: 1: vite: not found

Sebep `NODE_ENV=production` değişkeninin derleme sırasında npm'in
devDependencies'i atlamasına yol açmasıdır. Bu sorun `nixpacks.toml` içinde
düzeltildi; yeni bir dağıtım tetiklemeniz yeterlidir (**Deployments** →
üç nokta → **Redeploy**).

Artık her commit'te GitHub'da otomatik derleme kontrolü çalışıyor: commit'in
yanında yeşil tik varsa derleme sağlamdır, kırmızı çarpı varsa sorun
GitHub'da görünür.

**Sayfalar "Cannot GET /" diyor veya 404 dönüyor**
Bu, sunucunun derlenmiş siteyi bulamadığı anlamına gelirdi. Artık site,
derleme çıktısı varsa kendiliğinden sunuluyor — `NODE_ENV` ayarlamanıza gerek
yok. Yine de görüyorsanız Railway günlüğünde
`İstemci derlemesi bulunamadı` satırını arayın: derleme adımı başarısız
olmuştur.

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
