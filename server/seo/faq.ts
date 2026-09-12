/**
 * Sayfa bazlı SSS içeriği.
 *
 * Hem görünür metin olarak sunucuda basılır hem de FAQPage JSON-LD üretir.
 * Yapay zekâ arama motorları (ChatGPT, Perplexity, Gemini, Claude) soru-cevap
 * biçimindeki içeriği doğrudan alıntılar — bu yüzden cevaplar kısa, somut ve
 * kendi başına anlamlı olacak şekilde yazılmıştır.
 */
export type Faq = { q: string; a: string };

export const FAQ: Record<string, Faq[]> = {
  "/": [
    {
      q: "tarifesec.net.tr nedir?",
      a: "tarifesec.net.tr, Türkiye'deki ev interneti ve mobil hat tarifelerini tek sayfada karşılaştıran bağımsız bir platformdur. Superonline, Türk Telekom, Vodafone, Turkcell ve TurkNet paketlerini fiyat, hız ve taahhüt süresine göre yan yana görebilirsiniz.",
    },
    {
      q: "Karşılaştırma ücretli mi?",
      a: "Hayır. Paket karşılaştırma, hız testi ve tarife filtreleme araçlarının tamamı ücretsizdir, üyelik gerektirmez.",
    },
    {
      q: "Fiyatlar ne sıklıkla güncelleniyor?",
      a: "Operatör fiyatları günlük olarak taranır ve değişiklikler karta işlenir. Fiyatı değişen paketlerde 'fiyat arttı' veya 'fiyat düştü' rozeti gösterilir. Kesin fiyat için başvuru öncesi operatörün resmi sayfasını kontrol etmeniz önerilir.",
    },
    {
      q: "Hangi operatörlerle çalışıyorsunuz?",
      a: "Hiçbir operatörle ticari bağımız yoktur. Platform bağımsızdır; paketler tarafsız biçimde, yalnızca fiyat ve teknik özelliklerine göre listelenir.",
    },
  ],

  "/paket-karsilastir": [
    {
      q: "En ucuz ev interneti hangi operatörde?",
      a: "En uygun fiyatlı paket, bulunduğunuz adresteki altyapıya göre değişir. Sayfadaki listeyi fiyata göre sıraladığınızda güncel en ucuz paketi görebilirsiniz. Fiber altyapısı olmayan adreslerde kablosuz (Superbox benzeri) paketler genellikle tek seçenektir.",
    },
    {
      q: "Fiber ile kablosuz internet arasındaki fark nedir?",
      a: "Fiber internet, eve kadar gelen optik kablo üzerinden çalışır; yüksek hız ve düşük gecikme (ping) sunar. Kablosuz internet ise mobil şebeke üzerinden çalışır, kurulum gerektirmez ve hemen aktif olur; ancak hız, baz istasyonu yoğunluğuna göre değişir. Online oyun ve video konferans için fiber belirgin biçimde avantajlıdır.",
    },
    {
      q: "Taahhütsüz internet almak mantıklı mı?",
      a: "Taahhütsüz paketlerde aylık ücret genellikle %15-25 daha yüksektir, ancak cayma bedeli ödemeden istediğiniz an çıkabilirsiniz. Kısa süreli oturacağınız bir adres veya kiralık ev için taahhütsüz; uzun vadede kalacaksanız 24 ay taahhütlü paket toplam maliyette daha uygundur.",
    },
    {
      q: "Adresimde fiber var mı, nasıl öğrenirim?",
      a: "Altyapı sorgusu adres bazlıdır. Operatörün resmi sitesindeki altyapı sorgulama ekranına adresinizi girerek öğrenebilirsiniz. Aynı binada fiber olması, dairenize çekildiği anlamına gelmeyebilir.",
    },
    {
      q: "Kaç Mbps internet yeterli?",
      a: "Tek kişilik kullanımda ve temel gezinme için 25-50 Mbps yeterlidir. 3-4 kişilik bir evde aynı anda video izleme ve görüntülü görüşme için 100 Mbps rahat eder. 4K yayın, çok sayıda cihaz veya evden çalışma söz konusuysa 250 Mbps ve üzeri önerilir.",
    },
    {
      q: "Modem ücreti ayrıca ödenir mi?",
      a: "Çoğu taahhütlü pakette modem ücretsiz verilir veya taahhüt süresince bedelsiz kullanım sağlanır. Taahhüt bitmeden iptal edilirse modem bedeli faturalandırılabilir. Kartlarda modem dahil olup olmadığı belirtilir.",
    },
  ],

  "/mobil-tarifeler": [
    {
      q: "Faturalı mı faturasız hat mı daha avantajlı?",
      a: "Faturalı hatlarda GB başına maliyet daha düşüktür ve kampanyalar daha geniştir; ancak taahhüt ve kredi kontrolü gerekir. Faturasız (ön ödemeli) hatlarda taahhüt yoktur, harcama kontrolü kolaydır, fakat aynı GB için genellikle daha fazla ödersiniz.",
    },
    {
      q: "Numara taşıma ne kadar sürer?",
      a: "Numara taşıma işlemi genellikle 1 iş günü içinde tamamlanır. İşlem sırasında hattınız kısa süreli kapanabilir. Taşıma için kimlik ve mevcut hattınızın borcunun bulunmaması gerekir.",
    },
    {
      q: "Kaç GB internet yeterli?",
      a: "Sosyal medya ve mesajlaşma ağırlıklı kullanımda 6-10 GB çoğu kullanıcıya yeter. Düzenli video izliyorsanız 20 GB ve üzeri, evde Wi-Fi kullanmıyorsanız sınırsız paketler daha uygundur.",
    },
    {
      q: "5G tarifeleri Türkiye'de kullanılabiliyor mu?",
      a: "Operatörler 5G uyumlu tarifeler sunsa da 5G şebekesi tüm illerde yaygın değildir. Cihazınız ve bulunduğunuz bölge desteklemiyorsa tarife 4.5G hızında çalışır.",
    },
  ],

  "/hiz-testi": [
    {
      q: "İnternet hız testi nasıl doğru yapılır?",
      a: "En doğru sonuç için cihazınızı modeme kabloyla bağlayın, diğer indirmeleri ve yayınları durdurun, VPN kapalı olsun ve testi birkaç kez tekrarlayın. Wi-Fi üzerinden yapılan ölçümler mesafe ve duvar sayısına göre belirgin biçimde düşük çıkabilir.",
    },
    {
      q: "Ping (gecikme) kaç olmalı?",
      a: "40 ms altı çok iyi, 40-80 ms normal, 100 ms üzeri online oyun ve görüntülü görüşmede fark edilir gecikme anlamına gelir. Fiber bağlantılarda ping genellikle 20 ms'in altındadır.",
    },
    {
      q: "Aldığım hız paketimin altında, ne yapmalıyım?",
      a: "Önce kabloyla test edin. Fark sürüyorsa modemi yeniden başlatın, kablo ve bağlantı noktalarını kontrol edin. Sorun devam ederse operatörünüze arıza kaydı açın; taahhüt edilen hızın belirgin altında kalıcı hız, abonelik şartlarına göre fesih gerekçesi olabilir.",
    },
    {
      q: "Mbps ile MB/s farkı nedir?",
      a: "Mbps saniyedeki megabit, MB/s ise saniyedeki megabayttır. 1 bayt 8 bit olduğu için 100 Mbps bağlantıda teorik indirme hızı yaklaşık 12,5 MB/s'dir. Operatörler hızı Mbps cinsinden belirtir.",
    },
  ],
};

export function faqJsonLd(items: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
