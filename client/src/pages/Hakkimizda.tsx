import { Shield, Scale, RefreshCw } from "lucide-react";
import { useRouteSeo } from "@/lib/hooks";
import { SITE_INFO } from "@shared/site";

export default function Hakkimizda() {
  useRouteSeo("/hakkimizda");

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Hakkımızda</h1>
      <p className="text-gray-600 mb-8 leading-relaxed">
        {SITE_INFO.name}, Türkiye'deki ev interneti ve mobil hat tarifelerini tek
        sayfada karşılaştırmanızı sağlayan bağımsız bir platformdur. Amacımız,
        onlarca operatör sayfası arasında gezinmek zorunda kalmadan size uygun
        paketi görebilmenizdir.
      </p>

      {[
        {
          icon: Scale,
          title: "Bağımsızlık",
          text: "Hiçbir operatörle ticari ortaklığımız yoktur ve sıralamalar ücret karşılığı değiştirilmez. Paketler yalnızca fiyat ve teknik özelliklerine göre listelenir. Sitede iş ortaklarımıza ait sponsorlu bağlantılar bulunur; bunlar açıkça 'reklam' olarak işaretlenir ve karşılaştırma sonuçlarını etkilemez.",
        },
        {
          icon: RefreshCw,
          title: "Veriler nasıl güncelleniyor?",
          text: "Fiyatlar operatörlerin resmi sayfalarından düzenli olarak taranır. Emin olunamayan hiçbir değer yayınlanmaz: belirsiz eşleşmeler ve olağandışı fiyat sıçramaları otomatik olarak uygulanmaz, elle kontrol edilir. Her paketin en son ne zaman kontrol edildiğini karşılaştırma sayfasında görebilirsiniz.",
        },
        {
          icon: Shield,
          title: "Sorumluluk sınırı",
          text: "Fiyatlar bilgilendirme amaçlıdır ve kampanyalara göre değişebilir. Başvuru yapmadan önce kesin fiyatı ve adresinizdeki altyapı uygunluğunu operatörün resmi sayfasından doğrulamanızı öneririz.",
        },
      ].map((b) => (
        <section key={b.title} className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <b.icon className="w-4 h-4 text-[#0097a7]" />
            <h2 className="font-semibold text-gray-900">{b.title}</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{b.text}</p>
        </section>
      ))}
    </div>
  );
}
