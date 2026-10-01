/**
 * Rehber yazıları — hem CLI seed'i hem sunucu açılışındaki otomatik doldurma
 * buradan okur.
 *
 * Yazılar özgündür; rakip metin kopyalanmaz. Yeni yazı eklerken slug benzersiz
 * olmalı ve excerpt 160 karakteri geçmemeli (meta description olarak kullanılır).
 */
export const SEED_POSTS = [
  {
    title: "Fiber mi Kablosuz İnternet mi? 2026 Karşılaştırması",
    slug: "fiber-mi-kablosuz-internet-mi",
    category: "Rehber",
    excerpt:
      "Fiber ve kablosuz ev interneti arasındaki gerçek farklar: hız, gecikme, kurulum süresi ve hangi durumda hangisinin mantıklı olduğu.",
    content: `Ev interneti seçerken karşınıza çıkan ilk ayrım, bağlantının eve nasıl geldiğidir. Fiber internet optik kablo üzerinden, kablosuz internet ise mobil şebeke üzerinden çalışır. İkisi arasındaki fark yalnızca hız değildir.

Fiber internetin en belirgin üstünlüğü kararlılıktır. Optik kablo elektriksel parazitten etkilenmez, mesafeye bağlı hız kaybı çok düşüktür ve gecikme (ping) değeri genellikle 20 milisaniyenin altında kalır. Online oyun oynuyorsanız, düzenli görüntülü toplantı yapıyorsanız veya evden çalışıyorsanız bu fark somut olarak hissedilir.

Kablosuz internetin üstünlüğü ise erişilebilirliktir. Kurulum için teknisyen beklemez, cihazı prize takıp birkaç dakika içinde kullanmaya başlarsınız. Taşınma ihtimaliniz varsa cihazı yanınızda götürebilirsiniz. Buna karşılık hız, bulunduğunuz bölgedeki baz istasyonunun yoğunluğuna göre gün içinde değişir; akşam saatlerinde düşüş yaşanması olağandır.

Karar verirken şu soruyu sorun: adresimde fiber altyapısı var mı? Yoksa tartışma zaten bitmiştir. Varsa ve uzun süre o adreste kalacaksanız fiber, hem hız hem de aylık maliyet açısından neredeyse her zaman daha iyi seçenektir.

Aynı binada fiber bulunmasının dairenize çekildiği anlamına gelmediğini unutmayın. Operatörün altyapı sorgulama ekranına tam adresinizi girerek kontrol edin.

Mevcut bağlantınızın gerçekte ne kadar hız verdiğini merak ediyorsanız hız testi sayfamızdan ölçebilir, ardından paket karşılaştırma sayfasında alternatifleri inceleyebilirsiniz.`,
  },
  {
    title: "Taahhütlü mü Taahhütsüz mü İnternet Almalı?",
    slug: "taahhutlu-mu-taahhutsuz-mu-internet",
    category: "Rehber",
    excerpt:
      "24 ay taahhüt aylık ücreti düşürür ama cayma bedeli doğurur. Hangi durumda taahhütsüz paketin toplam maliyeti daha düşük kalır?",
    content: `Operatörler aynı paketi iki fiyatla sunar: taahhütlü ve taahhütsüz. Aradaki fark genellikle yüzde 15 ile 25 arasındadır. Bu farkın size değip değmeyeceği, o adreste ne kadar kalacağınıza bağlıdır.

24 ay taahhütte aylık ücret düşer, çoğu zaman modem ücretsiz verilir ve kurulum bedeli alınmaz. Buna karşılık süre dolmadan çıkarsanız cayma bedeli ödersiniz. Cayma bedeli genellikle kalan ay sayısıyla orantılıdır ve modem bedeli de faturaya eklenebilir.

Taahhütsüz pakette aylık ücret yüksektir ama istediğiniz ay aboneliği sonlandırabilirsiniz. Kiralık evde oturuyorsanız, iş nedeniyle şehir değiştirme ihtimaliniz varsa veya bölgedeki hizmet kalitesinden emin değilseniz bu esneklik gerçek bir değerdir.

Basit bir hesap yapın: taahhütlü paketin 24 aylık toplam maliyetini çıkarın, taahhütsüz paketin gerçekte kalacağınızı düşündüğünüz ay sayısıyla çarpımıyla karşılaştırın. Taahhütsüz seçenekte cayma bedeli olmadığı için erken çıkış senaryosunda toplam maliyet çoğu zaman daha düşük kalır.

Bir ayrıntı daha: taahhüt süresi bittiğinde ücret otomatik olarak liste fiyatına yükselir. Süre dolduğunda operatörünüzü arayıp yenileme kampanyası talep etmek, çoğu abonenin atladığı ama kayda değer tasarruf sağlayan bir adımdır.`,
  },
  {
    title: "İnternet Hız Testi Nasıl Doğru Yapılır?",
    slug: "internet-hiz-testi-nasil-yapilir",
    category: "Teknik",
    excerpt:
      "Hız testi sonucunuz paketinizin altında mı çıkıyor? Ölçümü etkileyen faktörler ve gerçek hızınızı doğru görmek için yapmanız gerekenler.",
    content: `Hız testi sonucunun paketinizde yazan rakamın altında çıkması, tek başına bir arıza göstergesi değildir. Ölçümü etkileyen birkaç faktör vardır ve bunları elemeden operatörünüzü aramak genellikle sonuç vermez.

En sık karşılaşılan neden Wi-Fi bağlantısıdır. Modemden uzakta, duvar arkasında veya 2.4 GHz bandında yapılan ölçümler gerçek hattın çok altında çıkar. Testi mümkünse ethernet kablosuyla yapın; kablo yoksa modeme yakın durun ve 5 GHz bandını kullanın.

İkinci neden arka plandaki trafiktir. Bulut yedeklemesi, açık kalmış bir video akışı, oyun güncellemesi veya aynı ağdaki başka bir cihaz bant genişliğini paylaşır. Test sırasında bunları durdurun.

Üçüncü neden cihazınızın kendisidir. Eski bir telefon veya dizüstü bilgisayarın Wi-Fi kartı, 100 Mbps üzerindeki hızları zaten alamayabilir. Aynı testi ikinci bir cihazda tekrarlamak bunu hızlıca ayırt eder.

Ölçümü günün farklı saatlerinde birkaç kez tekrarlayın. Akşam 20:00-23:00 arası şebekenin en yoğun olduğu dilimdir; sabah yapılan bir ölçümle karşılaştırmak bölgesel yoğunluk olup olmadığını gösterir.

Tüm bunlara rağmen hız kalıcı olarak paketinizin belirgin altındaysa operatörünüze arıza kaydı açın ve ölçüm sonuçlarınızı kayıt numarasıyla birlikte iletin. Taahhüt edilen hızın sürekli sağlanamaması, abonelik şartlarına göre cayma bedeli ödemeden fesih gerekçesi olabilir.`,
  },
  {
    title: "Numara Taşıma Nasıl Yapılır? Adım Adım",
    slug: "numara-tasima-nasil-yapilir",
    category: "Mobil",
    excerpt:
      "Mobil numaranızı başka operatöre taşırken gereken belgeler, süreç ve sık yapılan hatalar. İşlem genellikle 1 iş gününde tamamlanır.",
    content: `Numara taşıma, mevcut telefon numaranızı koruyarak operatör değiştirmenizi sağlar. Türkiye'de bu hak yasayla güvence altındadır ve işlem ücretsizdir.

Süreç, geçmek istediğiniz operatörün başvuru noktasında başlar. Kimlik belgenizle başvurur, yeni operatörün SIM kartını alırsınız. Başvuruyu yeni operatör yürütür; eski operatörünüzü aramanıza veya oradan izin almanıza gerek yoktur.

Taşıma işleminin tamamlanması genellikle 1 iş günü sürer. Geçiş anında hattınız kısa bir süre kapalı kalabilir; bu süre çoğunlukla birkaç dakikadır ve gece saatlerinde gerçekleşir.

Başvurunun reddedilmesine yol açan en yaygın nedenler şunlardır: mevcut hatta ödenmemiş borç bulunması, hattın başkasının adına kayıtlı olması, kimlik bilgilerinde uyuşmazlık veya numaranın son taşıma işleminin üzerinden 60 gün geçmemiş olması.

Taşımadan önce mevcut hattınızdaki taahhüdü kontrol edin. Taahhüt süresi dolmadan ayrılırsanız eski operatörünüz cayma bedeli faturalandırabilir; bu bedel numara taşımayı engellemez ancak ödemeniz gerekir.

Son bir uyarı: taşıma tamamlandıktan sonra eski SIM kartınız devre dışı kalır. Rehberinizi ve SIM üzerindeki verileri önceden yedekleyin.`,
  },
  {
    title: "Kaç Mbps İnternet Yeterli? Kullanıma Göre Rehber",
    slug: "kac-mbps-internet-yeterli",
    category: "Rehber",
    excerpt:
      "Ev halkının büyüklüğüne ve kullanım alışkanlığına göre gerçekten ihtiyacınız olan internet hızı. Gereksiz yüksek pakete para ödemeyin.",
    content: `İnternet paketi seçerken en sık yapılan hata, ihtiyacın çok üzerinde bir hız satın almaktır. Yüksek hız, ancak onu kullanacak cihaz ve alışkanlık varsa fark yaratır.

Tek kişilik bir evde sosyal medya, e-posta ve standart kalitede video izleme için 25-50 Mbps rahatlıkla yeter. Bu aralık aynı zamanda en uygun fiyatlı paketlerin bulunduğu banttır.

İki ila dört kişilik bir evde aynı anda video izleme, müzik dinleme ve görüntülü görüşme yapılıyorsa 100 Mbps konforlu bir seçimdir. Bu hız, birden fazla HD yayını sorunsuz taşır.

4K içerik izliyorsanız, evde çok sayıda bağlı cihaz varsa, düzenli olarak büyük dosya indiriyor veya evden çalışıyorsanız 250 Mbps ve üzeri anlamlı hale gelir. Tek bir 4K yayın yaklaşık 25 Mbps tüketir; aynı anda iki farklı 4K yayın ve bir görüntülü toplantı düşünüldüğünde üst paketler gerekçelendirilir.

Yükleme hızını da göz ardı etmeyin. Fiber paketlerde yükleme hızı genellikle indirmeye yakındır, kablosuz ve ADSL paketlerde ise belirgin biçimde düşüktür. Görüntülü toplantı yapıyor veya bulut yedeklemesi kullanıyorsanız yükleme hızı, indirme hızından daha belirleyicidir.

Mevcut bağlantınızın gerçek hızını ölçmeden karar vermeyin. Hız testi sayfamızda ölçüm yapıp sonucu paketinizle karşılaştırabilir, gerçekten yükseltmeye ihtiyacınız olup olmadığını görebilirsiniz.`,
  },
  {
    title: "Türkiye'de 5G: Nasıl Kullanılır, Neye Dikkat Etmeli? (2026)",
    slug: "turkiyede-5g-nasil-kullanilir",
    category: "Rehber",
    excerpt:
      "5G 1 Nisan 2026'da 81 ilde ticari olarak başladı. Telefonunuzda 5G'yi kullanmak için gerekenler ve tarife seçerken dikkat edilecekler.",
    content: `Türkiye'de 5G hizmeti 1 Nisan 2026'da Turkcell, Vodafone ve Türk Telekom'da 81 ilde aynı anda ticari olarak başladı. Kapsama ilk aşamada il ve ilçe merkezlerinde yoğundur ve operatörlerin açıkladığı plana göre genişlemeye devam ediyor.

5G'yi kullanabilmek için üç koşulun birlikte sağlanması gerekir: telefonunuzun 5G desteklemesi, bulunduğunuz noktada 5G kapsaması olması ve hattınızın 5G kullanımına açık olması. Bu üçünden biri eksikse telefon otomatik olarak 4.5G'ye geçer; aramalarınız ve internetiniz kesilmez.

Telefonunuzun 5G desteklediğini ayarlar menüsündeki mobil ağ seçeneklerinden görebilirsiniz. Tercih edilen ağ türü listesinde 5G seçeneği yoksa cihaz 5G desteklemiyordur ya da yazılım güncellemesi gerekiyordur.

5G daha yüksek hız sağlar, ancak hız arttıkça veri tüketimi de artar. Aynı videoyu daha yüksek çözünürlükte izlediğinizde paketiniz daha hızlı biter. Tarife seçerken aylık GB miktarına ve paket bittiğinde uygulanacak ücrete özellikle bakın.

Evde sabit internet yerine 5G modem kullanmayı düşünüyorsanız, kapsamanın evinizin içinde de güçlü olduğundan emin olun. Mobil şebeke üzerinden çalışan ev internetinde hız, baz istasyonunun yoğunluğuna göre gün içinde değişebilir.

Güncel mobil tarifeleri karşılaştırmak için mobil tarifeler sayfamızı, mevcut bağlantınızın gerçek hızını görmek için hız testi sayfamızı kullanabilirsiniz.`,
  },
  {
    title: "Wi-Fi Hızınızı Artırmanın 8 Yolu",
    slug: "wifi-hizi-nasil-artirilir",
    category: "Rehber",
    excerpt:
      "Paketiniz hızlı ama evde internet yavaş mı? Modem yerinden kanal seçimine, ek ücret ödemeden Wi-Fi hızını artırmanın pratik yolları.",
    content: `Paketinizin hızı ile cihazınıza ulaşan hız çoğu zaman aynı değildir. Aradaki fark genellikle hattan değil, evin içindeki kablosuz bağlantıdan kaynaklanır. Yeni pakete geçmeden önce aşağıdaki adımları deneyin.

1. Önce kabloyla ölçün. Bilgisayarı modeme Ethernet kablosuyla bağlayıp hız testi yapın. Kabloda hız normalse sorun hatta değil, Wi-Fi'dadır.

2. Modemi evin ortasına ve yükseğe taşıyın. Dolap içi, televizyon arkası ve yere yakın konumlar sinyali belirgin biçimde zayıflatır. Kalın duvarlar, aynalar ve akvaryumlar da sinyali keser.

3. 5 GHz bandını kullanın. Modeminiz destekliyorsa yakın odalarda 5 GHz ağına bağlanın; 2,4 GHz daha uzağa ulaşır ama daha yavaştır ve komşu ağlarla daha çok çakışır.

4. Kanalı değiştirin. Apartmanlarda onlarca ağ aynı kanalı kullanabilir. Modem arayüzünden kanal seçimini otomatiğe alın ya da daha boş bir kanal seçin.

5. Modemi yeniden başlatın ve yazılımını güncelleyin. Uzun süre kapanmadan çalışan modemlerde performans düşebilir; üretici güncellemeleri de kararlılığı artırır.

6. Bağlı cihazları gözden geçirin. Arka planda güncelleme indiren konsol, televizyon veya bulut yedeklemesi yapan bir bilgisayar, diğer cihazların hızını düşürür.

7. Geniş evde ağ genişletici yerine mesh sistemi düşünün. Basit tekrarlayıcılar hızı yarıya indirebilir; mesh sistemler kapsamayı daha verimli dağıtır.

8. Eski cihazların sınırını hesaba katın. Birkaç yıllık telefon veya dizüstü bilgisayarlar, yeni Wi-Fi standartlarını desteklemediği için modem ne kadar hızlı olursa olsun belirli bir hızın üzerine çıkamaz.

Bu adımlardan sonra kabloyla ölçülen hız da paketinizin belirgin altında kalıyorsa operatörünüze arıza kaydı açın. Daha hızlı bir paket düşünüyorsanız ev interneti karşılaştırma sayfamızdan seçenekleri inceleyebilirsiniz.`,
  },
  {
    title: "İnternet Faturası Nasıl Düşürülür? 2026 Zamlarına Karşı 6 Öneri",
    slug: "internet-faturasi-nasil-dusurulur",
    category: "Rehber",
    excerpt:
      "2026'da ev interneti fiyatları yükseldi. Taahhüt bitimi, peşin ödeme, doğru hız seçimi ve kampanya takibiyle aylık faturayı düşürmenin yolları.",
    content: `2026 yılında ev interneti fiyatlarında belirgin artışlar yaşandı. Örneğin TurkNet, 19 Haziran 2026'dan itibaren 100 Mbps paketinin aylık ücretini 699,90 TL'den 949,90 TL'ye yükseltti. Diğer operatörlerde de kampanya fiyatları dönem dönem güncelleniyor. Faturanızı düşürmek için şu adımları değerlendirin.

1. Gerçek ihtiyacınızı ölçün. Çoğu evde 100 Mbps yeterlidir. Hız testi yapın; kullanmadığınız bir hıza fazla ödüyorsanız bir alt pakete geçmek en hızlı tasarruftur.

2. Taahhüt bitiş tarihini takip edin. Taahhüt sona erdiğinde abonelik genellikle kampanyasız liste fiyatından devam eder. Bitişten önce operatörünüzü arayıp yeni kampanya isteyin ya da alternatifleri karşılaştırın.

3. Peşin ödeme seçeneklerine bakın. Bazı operatörler 12 aylık peşin ödemede aylık maliyeti belirgin biçimde düşürür ve fiyatı bu süre boyunca sabitler.

4. Yeni müşteri kampanyalarını karşılaştırın. Operatörler yeni abonelere ilk aylarda indirimli fiyat sunar. İndirimli dönem bittiğinde ödeyeceğiniz tutarı da hesaba katarak toplam maliyeti karşılaştırın.

5. Ek ücretleri kontrol edin. Modem kirası, kurulum bedeli ve ek hizmetler (TV, statik IP, ek hız paketi) faturayı büyütebilir. Kullanmadığınız ek hizmetleri kapatın.

6. Taahhütsüz ile taahhütlü fiyatı kendi senaryonuza göre hesaplayın. Kısa süre kalacaksanız cayma bedeli riskini, uzun süre kalacaksanız aylık farkın toplamını karşılaştırın.

Güncel paketleri fiyat, hız ve taahhüde göre yan yana görmek için ev interneti karşılaştırma sayfamızı kullanabilirsiniz. Başvuru öncesi kesin fiyatı mutlaka operatörün resmi sitesinden doğrulayın.`,
  },
];

export type SeedPost = (typeof SEED_POSTS)[number];
