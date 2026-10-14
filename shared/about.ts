/**
 * Hakkımızda metni — TEK KAYNAK (sunucu SSR + istemci aynı metni basar).
 *
 * Arama motorları ve yapay zekâ motorları fiyat/karşılaştırma sitelerinde
 * "bu bilgi nereden geliyor, kim doğruluyor" sorusunun cevabını arar (E-E-A-T).
 * Buradaki yöntem anlatımı, docs/fiyat-guncelleme.md'deki gerçek süreçle
 * AYNI olmalıdır — süreç değişirse burası da değişir.
 */
export const ABOUT_INTRO =
  "Türkiye'deki ev interneti ve mobil hat tarifelerini tek sayfada karşılaştırmanızı sağlayan bağımsız bir platformdur. Amacımız, onlarca operatör sayfası arasında gezinmek zorunda kalmadan size uygun paketi görebilmenizdir.";

export const ABOUT_SECTIONS: { key: "scale" | "refresh" | "check" | "mail" | "shield"; title: string; text: string }[] = [
  {
    key: "scale",
    title: "Bağımsızlık",
    text: "Sıralamalar ücret karşılığı değiştirilmez; paketler yalnızca fiyat ve teknik özelliklerine göre listelenir. Bazı başvuru bağlantıları iş ortaklığı (bayi) bağlantısıdır; fiyatı ve sıralamayı etkilemez. Sitede iş ortaklarımıza ait sponsorlu bağlantılar bulunur; bunlar açıkça 'reklam' olarak işaretlenir ve karşılaştırma sonuçlarını etkilemez.",
  },
  {
    key: "refresh",
    title: "Veriler nasıl güncelleniyor?",
    text: "Tüm paket ve tarife fiyatları 3 günde bir operatörlerin resmi sayfalarından yeniden kontrol edilir. Superonline, Türk Telekom ve TurkNet sayfaları ayrıca 12 saatte bir otomatik taranır. Her paketin yanında son kontrol tarihi yazar.",
  },
  {
    key: "check",
    title: "Yöntem ve yayın ilkeleri",
    text: "Kaynak önceliğimiz operatörün resmi sayfasıdır; resmi sayfa yoksa en az iki bağımsız haber kaynağı aranır, karşılaştırma ve forum siteleri kaynak kabul edilmez. Kampanya fiyatları taahhüt süresi ve bitiş tarihiyle birlikte yazılır. Resmi kaynaklar çelişirse veya fiyat doğrulanamazsa tahmini rakam yayınlanmaz; paket doğrulanana kadar listeden çıkarılır. Rehber yazıları genel bilgilendirme amaçlıdır ve mevzuat değiştikçe güncellenir.",
  },
  {
    key: "mail",
    title: "Hata bildirimi",
    text: "Yanlış veya eski bir fiyat gördüyseniz İletişim sayfasındaki e-posta adresine yazın; bildirimler bir sonraki kontrolde öncelikle incelenir.",
  },
  {
    key: "shield",
    title: "Sorumluluk sınırı",
    text: "Fiyatlar bilgilendirme amaçlıdır ve kampanyalara göre değişebilir. Başvuru yapmadan önce kesin fiyatı ve adresinizdeki altyapı uygunluğunu operatörün resmi sayfasından doğrulamanızı öneririz.",
  },
];
