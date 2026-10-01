import type { Faq } from "@shared/faq";

/**
 * Görünür SSS bloğu. Sunucu aynı soruları FAQPage şeması olarak basar;
 * Google şemadaki soruların sayfada GÖRÜNMESİNİ şart koşar — bu bileşen
 * olmadan şema "gizli içerik" sayılır.
 *
 * <details> yerine açık liste: cevaplar kapalı akordeonda kalınca bazı
 * tarayıcı/okuyucu kombinasyonlarında hiç görünmüyordu.
 */
export default function Sss({ items, title = "Sık Sorulan Sorular" }: { items: Faq[]; title?: string }) {
  if (!items.length) return null;
  return (
    <section className="mt-12" aria-labelledby="sss-baslik">
      <h2 id="sss-baslik" className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
      <dl className="divide-y divide-gray-200 border border-gray-200 rounded-xl bg-white">
        {items.map((f) => (
          <div key={f.q} className="p-5">
            <dt className="font-semibold text-gray-900 mb-1.5">{f.q}</dt>
            <dd className="text-sm text-gray-600 leading-relaxed">{f.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
