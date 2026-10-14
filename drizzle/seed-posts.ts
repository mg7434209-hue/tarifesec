/**
 * Rehber yazıları — hem CLI seed'i hem sunucu açılışındaki otomatik doldurma
 * buradan okur.
 *
 * Yazılar özgündür; rakip metin kopyalanmaz. Yeni yazı eklerken slug benzersiz
 * olmalı ve excerpt 160 karakteri geçmemeli (meta description olarak kullanılır).
 */
export const SEED_POSTS = [
  {
    title: "Fiber mi Kablosuz İnternet mi? Karşılaştırma ve Seçim Rehberi",
    slug: "fiber-mi-kablosuz-internet-mi",
    category: "Rehber",
    excerpt:
      "Fiber ve kablosuz ev interneti arasındaki gerçek farklar: hız, gecikme, kurulum süresi ve hangi durumda hangisinin mantıklı olduğu.",
    content: `Ev interneti seçerken karşınıza çıkan ilk ayrım, bağlantının eve nasıl geldiğidir. Fiber internet optik kablo üzerinden, kablosuz internet ise mobil şebeke (4.5G/5G) üzerinden çalışır. İkisi arasındaki fark yalnızca hız değildir; kararlılık, gecikme, kurulum süresi ve toplam maliyet de farklıdır.

## Fiber internetin üstünlükleri

Fiber internetin en belirgin üstünlüğü kararlılıktır. Optik kablo elektriksel parazitten etkilenmez ve mesafeye bağlı hız kaybı çok düşüktür.

- Gecikme (ping) değeri genellikle 20 milisaniyenin altında kalır; online oyun ve görüntülü görüşmede fark hissedilir.
- Hız gün içinde pek değişmez; akşam saatlerinde bile paket hızına yakın değer alınır.
- Yüksek hızlarda (500–1000 Mbps) yükleme hızı da genellikle yüksektir; bulut yedekleme ve canlı yayın için önemlidir.
- Kota sorunu yoktur; paketlerin çoğu limitsizdir.

Dezavantajı kurulumdur: adresinizde fiber yoksa paket alınamaz, varsa da teknisyen randevusu birkaç gün sürebilir.

## Kablosuz internetin üstünlükleri

Kablosuz internetin üstünlüğü erişilebilirliktir. Teknisyen beklemez, cihazı prize takıp kısa sürede kullanmaya başlarsınız.

- Altyapı gerektirmez; fiber ve VDSL olmayan adreslerde çoğu zaman tek seçenektir.
- Taşınırken cihazı yanınızda götürebilirsiniz.
- 5G kapsaması olan yerlerde yüksek hızlar görülebilir.

Buna karşılık hız, bulunduğunuz bölgedeki baz istasyonunun yoğunluğuna göre gün içinde değişir; akşam saatlerinde düşüş yaşanması olağandır. Paketlerin çoğu kotalıdır; kota dolduğunda hız düşer veya ek ücret çıkar.

## Hangisini seçmelisiniz?

- Adresinizde fiber var ve uzun süre kalacaksanız: fiber neredeyse her zaman daha iyi seçenektir.
- Fiber yok, port bekleniyor veya kısa süre kalacaksınız: kablosuz internet mantıklıdır.
- Online oyun, evden çalışma, çok sayıda cihaz: düşük ve kararlı ping için fiber.
- Hafif kullanım (sosyal medya, video), tek kişilik ev: kablosuz paketlerin kotası çoğu zaman yeter.

## Önce altyapınızı öğrenin

Aynı binada fiber bulunması, dairenize çekildiği anlamına gelmez. Operatörün altyapı sorgulama ekranına tam adresinizi girerek kontrol edin. Ayrıntılı adımlar için [altyapı sorgulama rehberimize](/blog/altyapi-sorgulama-nasil-yapilir) bakabilirsiniz.

Karar vermeden önce mevcut bağlantınızın gerçek değerlerini [hız testi](/hiz-testi) ile ölçün. Ardından [fiber internet paketlerini](/internet/fiber) ve [kablosuz internet seçeneklerini](/internet/kablosuz) fiyat ve taahhüt koşullarıyla yan yana karşılaştırabilirsiniz.`,
  },
  {
    title: "Taahhütlü mü Taahhütsüz mü İnternet Almalı?",
    slug: "taahhutlu-mu-taahhutsuz-mu-internet",
    category: "Rehber",
    excerpt:
      "Taahhüt aylık ücreti düşürür ama erken çıkışta cayma bedeli doğurur. Hangi durumda taahhütsüz paketin toplam maliyeti daha düşük kalır? Örnek hesap.",
    content: `Operatörler aynı paketi çoğu zaman iki fiyatla sunar: taahhütlü ve taahhütsüz. Aradaki fark operatöre ve kampanyaya göre değişir. Bu farkın size değip değmeyeceği, o adreste ne kadar kalacağınıza ve esnekliğe ne kadar ihtiyaç duyduğunuza bağlıdır.

## Taahhütlü paketin avantajları

- Aylık ücret daha düşüktür; kampanyalar genellikle taahhütlü paketlere tanımlanır.
- Modem çoğu zaman ücretsiz verilir veya taahhüt süresince bedelsiz kullanılır.
- Kurulum bedeli genellikle alınmaz.
- Kampanya süresince fiyat sabitlenebilir.

## Taahhütlü paketin riskleri

- Süre dolmadan ayrılırsanız cayma bedeli ödersiniz. Bu bedelin üst sınırı mevzuatla belirlenir; ayrıntılar için [cayma bedeli rehberimize](/blog/cayma-bedeli-nedir-nasil-hesaplanir) bakın.
- Taahhüt bittiğinde ücret çoğu zaman kampanyasız liste fiyatına yükselir.
- Hizmet kalitesinden memnun kalmazsanız ayrılmak maliyetlidir.

## Taahhütsüz paket kimler için mantıklı?

Taahhütsüz pakette aylık ücret yüksektir ama istediğiniz ay aboneliği sonlandırabilirsiniz.

- Kiralık evde oturanlar ve taşınma ihtimali olanlar
- Bölgedeki hizmet kalitesini önce denemek isteyenler
- Yazlık gibi yılın bir bölümünde kullanılan adresler

## Basit bir hesap

Taahhütlü paketin kampanya süresince toplam maliyetini çıkarın. Sonra taahhütsüz paketin aylık ücretini, gerçekte kalacağınızı düşündüğünüz ay sayısıyla çarpın. Erken çıkış ihtimaliniz yüksekse, cayma bedeli riski olmadığı için taahhütsüz seçenek çoğu zaman daha ucuza gelir. Uzun süre kalacaksanız taahhütlü paket toplamda belirgin tasarruf sağlar.

## Taahhüt bitince ne yapmalı?

Taahhüt süresi dolmadan birkaç hafta önce operatörünüzü arayıp yenileme kampanyası isteyin ve bu teklifi diğer operatörlerin yeni müşteri fiyatlarıyla karşılaştırın. Bu, çoğu abonenin atladığı ama kayda değer tasarruf sağlayan bir adımdır.

Güncel seçenekleri görmek için [taahhütsüz internet paketlerini](/internet/taahhutsuz) ve [en ucuz ev interneti listesini](/internet/en-ucuz) inceleyebilirsiniz.`,
  },
  {
    title: "İnternet Hız Testi Nasıl Doğru Yapılır?",
    slug: "internet-hiz-testi-nasil-yapilir",
    category: "Teknik",
    excerpt:
      "Hız testi sonucunuz paketinizin altında mı çıkıyor? Ölçümü etkileyen faktörler ve gerçek hızınızı doğru görmek için yapmanız gerekenler.",
    content: `Hız testi sonucunun paketinizde yazan rakamın altında çıkması, tek başına bir arıza göstergesi değildir. Ölçümü etkileyen birkaç faktör vardır ve bunları elemeden operatörünüzü aramak genellikle sonuç vermez.

## Hız testi neyi ölçer?

- İndirme (download): internetten cihazınıza veri aktarım hızı. Video izleme ve dosya indirmeyi belirler.
- Yükleme (upload): cihazınızdan internete aktarım hızı. Görüntülü görüşme ve bulut yedeklemede önemlidir.
- Ping (gecikme): verinin gidip gelme süresi. Oyun ve canlı görüşmede belirleyicidir.
- Jitter: ping'in dalgalanmasıdır; yüksekse görüntülü görüşmede donmalar olur.

## Doğru ölçüm için 5 kural

### 1. Kabloyla ölçün
En sık karşılaşılan neden Wi-Fi bağlantısıdır. Modemden uzakta, duvar arkasında veya 2,4 GHz bandında yapılan ölçümler gerçek hattın çok altında çıkar. Testi mümkünse Ethernet kablosuyla yapın; kablo yoksa modeme yakın durun ve 5 GHz bandını kullanın.

### 2. Arka plandaki trafiği durdurun
Bulut yedeklemesi, açık kalmış bir video akışı, oyun güncellemesi veya aynı ağdaki başka bir cihaz bant genişliğini paylaşır. Test sırasında bunları durdurun.

### 3. Cihazınızı hesaba katın
Eski bir telefon veya dizüstü bilgisayarın Wi-Fi kartı yüksek hızları zaten alamayabilir. Aynı testi ikinci bir cihazda tekrarlamak bunu hızlıca ayırt eder.

### 4. VPN'i kapatın
VPN trafiği ek bir sunucu üzerinden geçirir; hem hızı düşürür hem ping'i artırır.

### 5. Farklı saatlerde tekrarlayın
Akşam saatleri şebekenin en yoğun olduğu dilimdir. Sabah yapılan bir ölçümle karşılaştırmak, bölgesel yoğunluk olup olmadığını gösterir.

## Sonuç düşükse ne yapmalı?

Modemi yeniden başlatın, kablo ve bağlantı noktalarını kontrol edin. Hız kalıcı olarak paketinizin belirgin altındaysa operatörünüze arıza kaydı açın ve ölçüm sonuçlarınızı kayıt numarasıyla birlikte iletin. Taahhüt edilen hizmetin sürekli sağlanamaması, abonelik şartlarına göre fesih gerekçesi olabilir.

Ücretsiz [hız testimiz](/hiz-testi) dört paralel bağlantıyla ölçer ve kararlı ölçüm pencerelerinin medyanını raporlar; anlık zirveyi değil, sürekli alabildiğiniz hızı gösterir. Ne kadar hıza ihtiyacınız olduğunu anlamak için [kaç Mbps internet yeterli](/blog/kac-mbps-internet-yeterli) rehberine de bakabilirsiniz.`,
  },
  {
    title: "Numara Taşıma Nasıl Yapılır? Adım Adım",
    slug: "numara-tasima-nasil-yapilir",
    category: "Mobil",
    excerpt:
      "Mobil numaranızı başka operatöre taşırken gereken belgeler, süreç ve sık yapılan hatalar. Numara taşıma ücretsizdir ve birkaç iş gününde tamamlanır.",
    content: `Numara taşıma, mevcut telefon numaranızı koruyarak operatör değiştirmenizi sağlar. Türkiye'de bu hak mevzuatla güvence altındadır ve işlem için ücret alınmaz.

## Adım adım numara taşıma

- Geçmek istediğiniz operatörü ve tarifeyi seçin. Güncel seçenekleri [mobil tarifeler](/mobil-tarifeler) sayfasında karşılaştırabilirsiniz.
- Yeni operatöre başvurun. Başvuru mağazadan, internetten veya uygulamadan yapılabilir; kimlik bilgileriniz gerekir.
- Yeni SIM kartınızı alın. Birçok operatör kartı adresinize gönderir; bazıları e-Devlet onayıyla başvuruyu dijital tamamlar.
- Taşıma talebini yeni operatör yürütür. Eski operatörünüzü aramanıza veya oradan izin almanıza gerek yoktur.
- Taşıma tamamlanınca yeni SIM kart aktif olur, eski kart devre dışı kalır.

## Ne kadar sürer?

Taşıma talebinin iletilmesi ve kontrolü için mevzuatta azami süreler vardır; işlem birkaç iş günü içinde tamamlanır, uygulamada çoğunlukla 1 iş günü yeterlidir. Geçiş anında hattınız kısa bir süre kapalı kalabilir.

## Başvurunun reddedilme nedenleri

- Hattın başvuranın adına kayıtlı olmaması
- Kimlik bilgilerinde uyuşmazlık
- Mevcut hatta ödenmemiş borç bulunması (faturalı hatlarda)
- Numaranın kısa süre önce taşınmış olması; bu durumda bekleme süresi uygulanabilir, operatörünüze sorun

## Taahhüdünüzü kontrol edin

Taşımadan önce mevcut hattınızdaki taahhüdü kontrol edin. Taahhüt süresi dolmadan ayrılırsanız eski operatörünüz cayma bedeli faturalandırabilir; bu bedel numara taşımayı engellemez ancak ödemeniz gerekir. Hesaplama mantığı için [cayma bedeli rehberimize](/blog/cayma-bedeli-nedir-nasil-hesaplanir) bakın.

## Faturalı mı, faturasız mı?

Numara taşırken hat türünü de değiştirebilirsiniz. Faturalı hatlarda aynı internet miktarı genellikle daha ucuzdur; faturasız hatlarda taahhüt yoktur ve harcama kontrolü kolaydır. Güncel fiyatlar için [faturalı hat tarifelerini](/mobil-tarifeler/faturali) inceleyebilirsiniz.

## Son kontrol listesi

- Rehberinizi ve SIM üzerindeki verileri yedekleyin.
- İki adımlı doğrulama kullanan uygulamalarda numaranızın değişmediğini, yalnız operatörün değiştiğini unutmayın; SMS kodları yeni SIM'e gelir.
- Eski operatördeki ek paket ve abonelikleri (dijital servisler) iptal edin.`,
  },
  {
    title: "Kaç Mbps İnternet Yeterli? Kullanıma Göre Rehber",
    slug: "kac-mbps-internet-yeterli",
    category: "Rehber",
    excerpt:
      "Ev halkının büyüklüğüne ve kullanım alışkanlığına göre gerçekten ihtiyacınız olan internet hızı. Gereksiz yüksek pakete para ödemeyin.",
    content: `İnternet paketi seçerken en sık yapılan hata, ihtiyacın çok üzerinde bir hız satın almaktır. Yüksek hız, ancak onu kullanacak cihaz ve alışkanlık varsa fark yaratır. Tersi de sorundur: düşük hız, kalabalık bir evde sürekli takılmaya yol açar.

## Kullanıma göre önerilen hızlar

- Tek kişi, sosyal medya, e-posta, standart video: 25–50 Mbps
- 2–4 kişi, aynı anda HD video ve görüntülü görüşme: 100 Mbps
- 4K yayın, çok sayıda cihaz, evden çalışma: 250–500 Mbps
- Büyük dosya indirme, oyun güncellemeleri, yayıncılık: 500–1000 Mbps

## Hesap nasıl yapılır?

Evde aynı anda yapılan işleri toplayın. Kabaca bir HD yayın 5–8 Mbps, bir 4K yayın yaklaşık 25 Mbps, bir görüntülü görüşme 3–5 Mbps kullanır. Akşam saatlerinde iki 4K yayın ve bir görüntülü toplantı aynı anda yapılıyorsa toplam ihtiyaç 60 Mbps civarındadır; Wi-Fi kayıplarıyla birlikte 100 Mbps rahat bir paydır.

## Yükleme hızını unutmayın

Fiber paketlerde yükleme hızı genellikle yüksektir, kablosuz ve bakır hatlı paketlerde ise belirgin biçimde düşüktür. Görüntülü toplantı yapıyor, bulut yedeklemesi kullanıyor veya canlı yayın açıyorsanız yükleme hızı, indirme hızından daha belirleyicidir.

## Hız mı, ping mi?

Online oyunda belirleyici olan hız değil gecikmedir (ping). 100 Mbps'lik fiber bağlantı, 500 Mbps'lik ama yüksek gecikmeli bir bağlantıdan oyunda daha iyi sonuç verebilir. Ayrıntılar için [ping düşürme rehberimize](/blog/ping-nasil-dusurulur) bakın.

## Mbps ile MB/s farkı

Operatörler hızı megabit (Mbps) cinsinden yazar, indirme programları ise megabayt (MB/s) gösterir. 1 bayt 8 bittir; 100 Mbps bağlantıda teorik indirme hızı yaklaşık 12,5 MB/s'dir.

## Karar vermeden önce ölçün

Mevcut bağlantınızın gerçek hızını ölçmeden karar vermeyin. [Hız testi](/hiz-testi) yapıp sonucu paketinizle karşılaştırın. Çoğu ev için iyi bir başlangıç noktası olan [100 Mbps internet paketlerini](/internet/100-mbps) operatörlere göre yan yana görebilirsiniz.`,
  },
  {
    title: "Türkiye'de 5G: Nasıl Kullanılır, Neye Dikkat Etmeli? (2026)",
    slug: "turkiyede-5g-nasil-kullanilir",
    category: "Rehber",
    excerpt:
      "5G 1 Nisan 2026'da 81 ilde ticari olarak başladı. Telefonunuzda 5G'yi kullanmak için gerekenler ve tarife seçerken dikkat edilecekler.",
    content: `Türkiye'de 5G hizmeti 1 Nisan 2026'da Turkcell, Vodafone ve Türk Telekom'da 81 ilde aynı anda ticari olarak başladı. Kapsama ilk aşamada il ve ilçe merkezlerinde yoğundur ve operatörlerin açıkladığı plana göre genişlemeye devam ediyor.

## 5G kullanmak için gerekenler

Üç koşulun birlikte sağlanması gerekir:

- Telefonunuzun 5G desteklemesi
- Bulunduğunuz noktada 5G kapsaması olması
- Hattınızın 5G kullanımına açık olması

Bu üçünden biri eksikse telefon otomatik olarak 4.5G'ye geçer; aramalarınız ve internetiniz kesilmez.

## Telefonum 5G destekliyor mu?

Ayarlar menüsündeki mobil ağ seçeneklerinde "tercih edilen ağ türü" listesine bakın. Listede 5G seçeneği yoksa cihaz 5G desteklemiyordur ya da yazılım güncellemesi gerekiyordur. Cihazın üreticisinin teknik özellik sayfası da bunu gösterir.

## 5G'nin getirdikleri

- Daha yüksek indirme ve yükleme hızları
- Kalabalık ortamlarda (stadyum, konser) daha kararlı bağlantı
- Daha düşük gecikme; bulut oyun ve görüntülü görüşmede fark edilir

## Tarife seçerken dikkat edin

5G daha yüksek hız sağlar, ancak hız arttıkça veri tüketimi de artar. Aynı videoyu daha yüksek çözünürlükte izlediğinizde paketiniz daha hızlı biter.

- Aylık GB miktarını gerçek kullanımınıza göre seçin.
- Paket bittiğinde uygulanacak ücreti ve hız kısıtını öğrenin.
- Video uygulamalarında mobil veri kalitesini sınırlamak tüketimi belirgin azaltır.

Güncel 5G tarifelerini [faturalı hat tarifeleri](/mobil-tarifeler/faturali) sayfasında karşılaştırabilirsiniz.

## Evde 5G internet

Fiber altyapısı olmayan adreslerde 5G modemli ev interneti bir seçenektir. Kapsamanın evinizin içinde de güçlü olduğundan emin olun; mobil şebeke üzerinden çalışan ev internetinde hız, baz istasyonunun yoğunluğuna göre gün içinde değişebilir. Seçenekler için [kablosuz internet paketlerine](/internet/kablosuz) bakabilirsiniz.

Mevcut bağlantınızın gerçek hızını görmek için [hız testi](/hiz-testi) sayfamızı kullanabilirsiniz.`,
  },
  {
    title: "Wi-Fi Hızınızı Artırmanın 8 Yolu",
    slug: "wifi-hizi-nasil-artirilir",
    category: "Rehber",
    excerpt:
      "Paketiniz hızlı ama evde internet yavaş mı? Modem yerinden kanal seçimine, ek ücret ödemeden Wi-Fi hızını artırmanın pratik yolları.",
    content: `Paketinizin hızı ile cihazınıza ulaşan hız çoğu zaman aynı değildir. Aradaki fark genellikle hattan değil, evin içindeki kablosuz bağlantıdan kaynaklanır. Yeni pakete geçmeden önce aşağıdaki adımları deneyin.

## Önce sorunun yerini bulun

Bilgisayarı modeme Ethernet kablosuyla bağlayıp [hız testi](/hiz-testi) yapın. Kabloda hız normalse sorun hatta değil, Wi-Fi'dadır ve aşağıdaki adımlar işe yarar. Kabloda da düşükse sorun hatta veya modemdedir; operatörünüze arıza kaydı açın.

## Wi-Fi hızını artırmanın 8 yolu

### 1. Modemi doğru yere koyun
Modemi evin ortasına ve yükseğe taşıyın. Dolap içi, televizyon arkası ve yere yakın konumlar sinyali belirgin biçimde zayıflatır. Kalın beton duvarlar, aynalar ve akvaryumlar da sinyali keser.

### 2. 5 GHz bandını kullanın
Modeminiz destekliyorsa yakın odalarda 5 GHz ağına bağlanın. 2,4 GHz daha uzağa ulaşır ama daha yavaştır ve komşu ağlarla daha çok çakışır.

### 3. Kanalı değiştirin
Apartmanlarda onlarca ağ aynı kanalı kullanabilir. Modem arayüzünden kanal seçimini otomatiğe alın ya da daha boş bir kanal seçin. Arayüze giriş için [modem ayarları rehberimize](/blog/modem-arayuzu-wifi-sifresi-degistirme) bakın.

### 4. Modemi yeniden başlatın ve güncelleyin
Uzun süre kapanmadan çalışan modemlerde performans düşebilir; üretici yazılım güncellemeleri kararlılığı artırır.

### 5. Bağlı cihazları gözden geçirin
Arka planda güncelleme indiren konsol, televizyon veya bulut yedeklemesi yapan bir bilgisayar diğer cihazların hızını düşürür. Tanımadığınız cihaz görürseniz Wi-Fi şifresini değiştirin.

### 6. Sabit cihazları kabloya alın
Televizyon, oyun konsolu ve masaüstü bilgisayar gibi yeri değişmeyen cihazları kabloyla bağlamak, kablosuz ağı telefon ve tabletlere bırakır.

### 7. Geniş evde mesh sistemi düşünün
Basit tekrarlayıcılar hızı yarıya indirebilir; mesh sistemler kapsamayı daha verimli dağıtır.

### 8. Eski cihazların sınırını hesaba katın
Birkaç yıllık telefon veya dizüstü bilgisayarlar yeni Wi-Fi standartlarını desteklemediği için modem ne kadar hızlı olursa olsun belirli bir hızın üzerine çıkamaz.

## Hâlâ yavaşsa

Bu adımlardan sonra kabloyla ölçülen hız da paketinizin belirgin altında kalıyorsa operatörünüze arıza kaydı açın. Adresinizde fiber varsa [fiber internet paketleri](/internet/fiber) hem hız hem kararlılık açısından en güçlü seçenektir.`,
  },
  {
    title: "İnternet Faturası Nasıl Düşürülür? 2026 Zamlarına Karşı 6 Öneri",
    slug: "internet-faturasi-nasil-dusurulur",
    category: "Rehber",
    excerpt:
      "2026'da ev interneti fiyatları yükseldi. Taahhüt bitimi, peşin ödeme, doğru hız seçimi ve kampanya takibiyle aylık faturayı düşürmenin yolları.",
    content: `2026 yılında ev interneti fiyatlarında belirgin artışlar yaşandı. Örneğin TurkNet, 19 Haziran 2026'dan itibaren 100 Mbps paketinin aylık ücretini 699,90 TL'den 949,90 TL'ye yükseltti. Diğer operatörlerde de kampanya fiyatları dönem dönem güncelleniyor. Faturanızı düşürmek için aşağıdaki adımları değerlendirin.

## 1. Gerçek ihtiyacınızı ölçün

Çoğu evde 100 Mbps yeterlidir. [Hız testi](/hiz-testi) yapın ve [kaç Mbps internet yeterli](/blog/kac-mbps-internet-yeterli) rehberimizdeki hesabı uygulayın. Kullanmadığınız bir hıza fazla ödüyorsanız bir alt pakete geçmek en hızlı tasarruftur.

## 2. Taahhüt bitiş tarihini takip edin

Taahhüt sona erdiğinde abonelik genellikle kampanyasız liste fiyatından devam eder. Bitişten önce operatörünüzü arayıp yenileme kampanyası isteyin ve teklifi diğer operatörlerin yeni müşteri fiyatlarıyla karşılaştırın.

## 3. Peşin ödeme seçeneklerine bakın

Bazı operatörler 12 aylık peşin ödemede aylık maliyeti belirgin biçimde düşürür ve fiyatı bu süre boyunca sabitler. Toplam tutarı tek seferde ödeyebiliyorsanız bu seçenek zamlara karşı da koruma sağlar.

## 4. Yeni müşteri kampanyalarını karşılaştırın

Operatörler yeni abonelere ilk aylarda indirimli fiyat sunar. İndirimli dönem bittiğinde ödeyeceğiniz tutarı da hesaba katarak toplam maliyeti karşılaştırın; yalnız ilk ayın fiyatına bakmayın.

## 5. Ek ücretleri kontrol edin

Modem kirası, kurulum bedeli ve ek hizmetler (TV, statik IP, ek hız paketi) faturayı büyütebilir. Faturanızı satır satır inceleyin ve kullanmadığınız ek hizmetleri kapatın.

## 6. Taahhütlü ve taahhütsüz fiyatı karşılaştırın

Kısa süre kalacaksanız cayma bedeli riskini, uzun süre kalacaksanız aylık farkın toplamını karşılaştırın. Ayrıntılı hesap için [taahhütlü mü taahhütsüz mü](/blog/taahhutlu-mu-taahhutsuz-mu-internet) rehberimize bakın.

## 7. Ev ve mobil hattı birlikte değerlendirin

Bazı operatörler ev interneti ve mobil hattı birlikte alanlara indirim tanımlar. İki hizmetin toplam maliyetini, ayrı operatörlerden almakla karşılaştırarak karar verin.

## Güncel fiyatları karşılaştırın

Paketleri fiyat, hız ve taahhüde göre yan yana görmek için [ev interneti karşılaştırma](/paket-karsilastir) sayfamızı ve [en ucuz ev interneti](/internet/en-ucuz) listesini kullanabilirsiniz. Başvuru öncesi kesin fiyatı mutlaka operatörün resmi sitesinden doğrulayın.`,
  },
  {
    title: "Altyapı Sorgulama Nasıl Yapılır? Fiber, VDSL ve Kablosuz Rehberi",
    slug: "altyapi-sorgulama-nasil-yapilir",
    category: "Rehber",
    excerpt:
      "Adresinize hangi internetin gelebileceğini öğrenmenin yolu altyapı sorgulamadır. FTTH, FTTB, VDSL sonuçları ne anlama gelir, port yoksa ne yapılır?",
    content: `Ev interneti seçerken ilk adım fiyat değil, adresinizdeki altyapıdır. Aynı mahallede bir binaya fiber gelirken yan binaya gelmeyebilir; bu yüzden sorgu her zaman tam adresle yapılır.

## Sorgu nasıl yapılır?

Operatörlerin resmi sitelerinde "altyapı sorgulama" ekranı bulunur. İl, ilçe, mahalle, sokak, bina ve daire numarasını sırayla seçersiniz. Sonuç ekranı adresinize sunulabilecek en yüksek hızı ve bağlantı türünü gösterir.

- Bilgileri tapu veya fatura adresinizle aynı biçimde girin; yanlış daire seçimi farklı sonuç verebilir.
- Birden fazla operatörde sorgu yapın: farklı operatörler farklı altyapı kullanabilir.
- Yeni binalarda adres sisteme geç işlenebilir; sonuç çıkmazsa operatörü arayın.

## Sonuç ekranındaki kısaltmalar

- FTTH (eve kadar fiber): Optik kablo dairenize kadar gelir. En yüksek hızlar ve en düşük gecikme bu altyapıdadır.
- FTTB (binaya kadar fiber): Fiber binaya kadar gelir, daireye bina içi kabloyla ulaşır. Hız genellikle FTTH'ye yakındır.
- VDSL / FTTC (sokak dolabına kadar fiber): Dolaptan eve bakır hat kullanılır; hız, dolaba olan mesafeye göre düşer.
- ADSL: Tamamen bakır hat üzerinden çalışan eski altyapıdır; hızlar düşüktür.

## "Boş port yok" ne demek?

Altyapı olsa bile sokak dolabında ya da santralde boş bağlantı noktası (port) kalmamış olabilir. Bu durumda başvurunuz sıraya alınır. Beklemek istemiyorsanız [kablosuz internet seçeneklerine](/internet/kablosuz) bakabilirsiniz; kurulum gerektirmez.

## Altyapınızı öğrendikten sonra

Adresinize fiber geliyorsa [fiber internet paketlerini](/internet/fiber) karşılaştırın. Mevcut bağlantınızın gerçek hızını görmek için önce [hız testi](/hiz-testi) yapmanız, ne kadar hıza ihtiyacınız olduğunu anlamanıza yardımcı olur.`,
  },
  {
    title: "Cayma Bedeli Nedir, Nasıl Hesaplanır? Taahhüt Bozma Rehberi",
    slug: "cayma-bedeli-nedir-nasil-hesaplanir",
    category: "Rehber",
    excerpt:
      "Taahhüt bitmeden aboneliği iptal edince ödenen cayma bedelinin üst sınırı mevzuatla belirlenir. Hesaplama mantığı ve bedel ödenmeyen durumlar.",
    content: `Taahhütlü bir internet ya da mobil hat aboneliğini süre dolmadan sonlandırırsanız operatör cayma bedeli talep edebilir. Bu bedel keyfî belirlenemez; elektronik haberleşme mevzuatı bir üst sınır koyar.

## Hesaplamanın mantığı

Taahhüt karşılığında size indirimli fiyat, ücretsiz modem veya cihaz gibi avantajlar sağlanır. Erken ayrılırsanız operatör bu avantajların bir kısmını geri ister. Mevzuata göre tüketiciden istenebilecek tutar, şu iki tutardan DÜŞÜK olanıdır:

- Fesih tarihine kadar size sağlanmış indirimlerin ve cihaz gibi diğer avantajların toplamı
- Taahhüdün kalan ayları için ödeyecek olduğunuz ücretlerin toplamı

Yani taahhüdün sonuna çok az kalmışsa cayma bedeli de buna bağlı olarak düşük kalır.

## Örnek

Aylık liste fiyatı 1.000 ₺ olan bir paketi taahhütle 800 ₺'ye aldığınızı ve 12 aylık taahhüdün 9. ayında ayrıldığınızı düşünün. Bu sürede aldığınız indirim 9 × 200 = 1.800 ₺'dir. Kalan 3 ayın ücreti 3 × 800 = 2.400 ₺'dir. Düşük olan tutar, yani 1.800 ₺, istenebilecek üst sınırdır (cihaz veya ek avantaj yoksa).

## Cayma bedeli ödenmeyen durumlar

- Taşındığınız adreste operatör aynı nitelikte hizmet sunamıyorsa aboneliği bedelsiz sonlandırma hakkınız vardır. Altyapı olmadığını yazılı olarak belgelemeniz önemlidir.
- Operatör sözleşme koşullarını aleyhinize tek taraflı değiştirirse, belirli bir süre içinde bedelsiz fesih hakkı doğabilir.

## Pratik öneriler

Fesih talebinizi yazılı kanallardan iletin ve sözlü verilen bilgilere güvenmeyin. Faturanızda beklenenden yüksek bir cayma bedeli görürseniz önce operatöre itiraz edin, sonuç alamazsanız tüketici hakem heyetine başvurabilirsiniz.

Taahhüde girmeden önce [taahhütsüz paketleri](/internet/taahhutsuz) de karşılaştırmanız, ileride bu hesapla uğraşmamanızı sağlar.

⚖️ Bu yazı genel bilgilendirme amaçlıdır; kesin tutar için sözleşmenizi ve mevzuatın güncel metnini kontrol edin.`,
  },
  {
    title: "Ping Nasıl Düşürülür? Oyun ve Görüntülü Görüşme İçin 7 Öneri",
    slug: "ping-nasil-dusurulur",
    category: "Rehber",
    excerpt:
      "Yüksek ping oyunda gecikme ve görüntülü görüşmede donma demektir. Kablolu bağlantıdan sunucu seçimine kadar ping'i düşürmenin pratik yolları.",
    content: `Ping, bilgisayarınızdan gönderilen bir verinin sunucuya gidip geri dönme süresidir ve milisaniye (ms) ile ölçülür. İndirme hızınız yüksek olsa bile ping yüksekse online oyunda gecikme, görüntülü görüşmede donma yaşarsınız.

## Kaç ms iyi sayılır?

- 40 ms altı: çok iyi, rekabetçi oyunlar için ideal
- 40–80 ms: çoğu kullanım için sorunsuz
- 100 ms üzeri: oyunda ve canlı görüşmede fark edilir gecikme

Önce mevcut değerinizi [hız testi](/hiz-testi) ile ölçün; böylece yaptığınız değişikliğin etkisini görebilirsiniz.

## Ping'i düşürmenin yolları

### 1. Kabloyla bağlanın
Wi-Fi, özellikle duvar ve mesafe arttıkça gecikmeyi ve dalgalanmayı artırır. Oyun bilgisayarını veya konsolu modeme Ethernet kablosuyla bağlamak en etkili adımdır.

### 2. Arka plandaki yükü durdurun
Aynı ağda büyük dosya indirmesi, bulut yedeklemesi veya yüksek çözünürlüklü yayın varsa ping yükselir. Oyun sırasında bu işlemleri duraklatın.

### 3. Doğru sunucuyu seçin
Oyunlarda size coğrafi olarak en yakın sunucuyu (örneğin Avrupa) seçin. Uzak sunucu, hattınız ne kadar iyi olursa olsun ping'i artırır.

### 4. Modemi yeniden başlatın ve güncelleyin
Uzun süre kapanmadan çalışan modemlerde performans düşebilir. Modem yazılımının güncel olduğundan emin olun.

### 5. 5 GHz bandını kullanın
Kablo kullanamıyorsanız modeme yakın odada 5 GHz Wi-Fi ağına bağlanın; 2,4 GHz daha kalabalıktır.

### 6. VPN'i kapatın
VPN trafiği ek bir sunucu üzerinden geçirir ve genellikle ping'i artırır.

### 7. Altyapıyı değerlendirin
Tüm adımlara rağmen ping yüksekse sorun bağlantı türündedir. Fiber bağlantılarda ping genellikle 20 ms'in altındadır; kablosuz (mobil şebeke) internette daha yüksek ve değişkendir. Adresinizde fiber varsa [fiber internet paketlerine](/internet/fiber) geçmek kalıcı çözümdür.`,
  },
  {
    title: "Taşınırken İnternet: Nakil mi, Yeni Abonelik mi?",
    slug: "tasinirken-internet-nakil-mi-yeni-abonelik-mi",
    category: "Rehber",
    excerpt:
      "Yeni eve taşınırken internet aboneliğini taşımak mı, iptal edip yeni abonelik açmak mı mantıklı? Nakil süreci, altyapı kontrolü ve cayma bedeli.",
    content: `Taşınma sürecinde internet çoğu zaman son ana kalır ve yeni evde günlerce bağlantısız kalınır. Doğru planlama ile bu süre kısaltılabilir.

## Önce yeni adreste altyapıyı kontrol edin

Taşınmadan önce mevcut operatörünüzün yeni adresinize hizmet verip veremediğini öğrenin. Bunun için operatörün sitesindeki altyapı sorgulama ekranını kullanabilirsiniz. Ayrıntılar için [altyapı sorgulama rehberimize](/blog/altyapi-sorgulama-nasil-yapilir) bakın.

## Nakil (adres değişikliği)

Mevcut operatörünüz yeni adreste hizmet verebiliyorsa aboneliğinizi taşıyabilirsiniz. Bu durumda taahhüdünüz devam eder ve cayma bedeli doğmaz.

- Nakil talebini taşınma tarihinden önce verin; kurulum randevusu birkaç gün sürebilir.
- Nakil ücreti ve yeni adresteki hız, sözleşmenize ve altyapıya göre değişebilir; talep öncesi sorun.
- Yeni adreste altyapı daha düşük hızdaysa paketiniz değişebilir.

## Yeni adreste altyapı yoksa

Operatörünüz yeni adresinizde aynı nitelikte hizmet sunamıyorsa aboneliği cayma bedeli ödemeden sonlandırma hakkınız vardır. Bu durumu yazılı olarak belgeleyin ve fesih talebinizi yazılı kanaldan iletin. Ayrıntılar için [cayma bedeli rehberimize](/blog/cayma-bedeli-nedir-nasil-hesaplanir) bakın.

## Taşınma öncesi kontrol listesi

- Taşınma tarihini netleştirdiğiniz anda yeni adreste altyapı sorgusu yapın.
- Nakil veya yeni abonelik talebini en az bir hafta önceden verin.
- Eski adresteki modemin operatöre ait olup olmadığını öğrenin; iade gerekiyorsa teslim şeklini sorun.
- Taahhüt bitiş tarihinizi ve olası cayma bedelini yazılı olarak teyit edin.
- Yeni adreste kurulum günü evde bulunabileceğiniz bir randevu alın.

## Nakil mi, yeni abonelik mi?

Taahhüdünüzün sonuna yaklaştıysanız veya yeni adreste başka bir operatör daha hızlı ya da ucuz paket sunuyorsa, nakil yerine yeni abonelik daha avantajlı olabilir. Bu durumda olası cayma bedelini yeni paketin sağlayacağı tasarrufla karşılaştırın.

## Geçiş dönemi için kablosuz internet

Kurulum beklerken bağlantısız kalmamak için [kablosuz internet](/internet/kablosuz) çözümleri prize takıldığı anda çalışır. Kısa süre kalacağınız bir adreste [taahhütsüz paketler](/internet/taahhutsuz) de esneklik sağlar.

⚖️ Bu yazı genel bilgilendirme amaçlıdır; sözleşme koşullarınızı operatörünüzden teyit edin.`,
  },
  {
    title: "Modem Arayüzüne Giriş ve Wi-Fi Şifresi Değiştirme",
    slug: "modem-arayuzu-wifi-sifresi-degistirme",
    category: "Rehber",
    excerpt:
      "Modem arayüzüne nasıl girilir, Wi-Fi adı ve şifresi nasıl değiştirilir? Güvenli bir ev ağı için adım adım kontrol listesi.",
    content: `Varsayılan Wi-Fi şifresini kullanmak ağınızı yabancılara açık hâle getirebilir. Modem arayüzünden şifreyi ve diğer temel ayarları birkaç dakikada değiştirebilirsiniz.

## Arayüze giriş

- Bilgisayarı veya telefonu modemin ağına bağlayın.
- Tarayıcının adres çubuğuna modemin yerel adresini yazın. Bu adres çoğunlukla modemin altındaki etikette yazar; sık kullanılanlar 192.168.1.1 ve 192.168.0.1'dir.
- Etiketteki kullanıcı adı ve şifreyle giriş yapın. Etikette yoksa operatörünüzün destek sayfasına bakın.

Adres açılmıyorsa cihazınızın gerçekten modemin ağına bağlı olduğunu ve mobil veriyi kapattığınızı kontrol edin.

## Wi-Fi adı ve şifresini değiştirme

Kablosuz (Wireless / WLAN) menüsünde ağ adını (SSID) ve şifreyi değiştirebilirsiniz.

- Şifre en az 12 karakter olsun; harf, rakam ve sembol karıştırın.
- Şifreleme türü olarak WPA2 veya destekleniyorsa WPA3 seçin.
- Ağ adına adınızı, adresinizi veya daire numaranızı yazmayın.
- 2,4 GHz ve 5 GHz ağlarına aynı ya da farklı ad verebilirsiniz; farklı ad, hangi banda bağlandığınızı görmenizi kolaylaştırır.

## Güvenlik için ek adımlar

- Modem yönetim şifresini de varsayılandan farklı bir şifreyle değiştirin.
- WPS özelliğini kullanmıyorsanız kapatın.
- Misafirler için ayrı bir misafir ağı açın; ana ağınızdaki cihazlara erişemezler.
- Modem yazılımını güncel tutun.
- Bağlı cihazlar listesini ara sıra kontrol edin; tanımadığınız cihaz varsa şifreyi değiştirin.

## Değişiklikten sonra

Ayarları kaydettiğinizde modem kısa süre yeniden başlayabilir ve tüm cihazların yeni şifreyle tekrar bağlanması gerekir. Akıllı televizyon, yazıcı ve akıllı ev cihazlarını da güncellemeyi unutmayın.

Wi-Fi hızınızın beklentinin altında kaldığını düşünüyorsanız [hız testi](/hiz-testi) yapın ve [Wi-Fi hızını artırma rehberimize](/blog/wifi-hizi-nasil-artirilir) göz atın.`,
  },
];

export type SeedPost = (typeof SEED_POSTS)[number];
