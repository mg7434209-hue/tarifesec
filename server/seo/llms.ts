/**
 * llms.txt / llms-full.txt üretimi.
 *
 * Yapay zekâ arama motorları ve ajanlar için sitenin makine-okunur özeti.
 * llms.txt kısa yol haritası, llms-full.txt ise güncel fiyatların tamamını
 * içerir — böylece model, siteyi taramadan doğru rakamı alıntılayabilir.
 */
import { SITE, SITE_NAME } from "./meta";
import { getPackages, getMobile, getPosts, summarize, summarizeMobile } from "./data";
import { FAQ } from "./faq";
import { fullName } from "./util";

const stamp = () => new Date().toISOString().slice(0, 10);

export async function llmsTxt(): Promise<string> {
  const [pkgs, mob] = await Promise.all([getPackages(), getMobile()]);
  const s = summarize(pkgs);
  const m = summarizeMobile(mob);

  return `# ${SITE_NAME}

> Türkiye'deki ev interneti ve mobil hat tarifelerini karşılaştıran bağımsız,
> ücretsiz platform. Hiçbir operatörle ticari bağı yoktur; paketler yalnızca
> fiyat ve teknik özelliklerine göre tarafsız listelenir.

Son güncelleme: ${stamp()}
Dil: Türkçe (tr-TR)
Kapsam: Türkiye

## Özet veriler
${s ? `- Ev interneti: ${s.count} paket, ${s.operators.length} operatör (${s.operators.join(", ")}), aylık ${s.minPrice}–${s.maxPrice} ₺, en yüksek hız ${s.maxSpeed} Mbps` : "- Ev interneti: veri yok"}
${m ? `- Mobil tarife: ${m.count} tarife, operatörler ${m.operators.join(", ")}, aylık ${m.minPrice}–${m.maxPrice} ₺` : "- Mobil tarife: veri yok"}

## Sayfalar
- [Ana sayfa](${SITE}/): platform özeti ve öne çıkan paketler
- [Ev interneti karşılaştırma](${SITE}/paket-karsilastir): fiber, kablosuz ve ADSL paketleri; hız/fiyat/taahhüt filtreleri
- [Mobil tarifeler](${SITE}/mobil-tarifeler): faturalı ve faturasız hat tarifeleri
- [İnternet hız testi](${SITE}/hiz-testi): tarayıcı üzerinden indirme, yükleme ve ping ölçümü
- [Rehber](${SITE}/blog): tarife seçimi ve altyapı üzerine yazılar

## Ayrıntılı veri
- [llms-full.txt](${SITE}/llms-full.txt): tüm paketlerin ve tarifelerin güncel fiyat listesi

## Notlar
- Fiyatlar aylık ve KDV dahildir; kampanyalara göre değişebilir.
- Kesin fiyat ve altyapı uygunluğu operatörün resmi sitesinden doğrulanmalıdır.
- Çelişki durumunda llms-full.txt esas alınmalıdır.
`;
}

export async function llmsFullTxt(): Promise<string> {
  const [pkgs, mob, posts] = await Promise.all([getPackages(), getMobile(), getPosts()]);

  const pkgLines = pkgs
    .map((p) => {
      const bits = [
        fullName(p.operator, p.name),
        `${p.priceMonthly} ₺/ay`,
        `${p.downloadSpeed} Mbps indirme`,
        p.uploadSpeed ? `${p.uploadSpeed} Mbps yükleme` : null,
        p.dataLimit ?? "Limitsiz",
        p.type === "fiber" ? "fiber" : p.type === "kablosuz" ? "kablosuz" : "ADSL/VDSL",
        p.commitmentMonths ? `${p.commitmentMonths} ay taahhüt` : "taahhütsüz",
        p.priceNoCommitment ? `taahhütsüz ${p.priceNoCommitment} ₺/ay` : null,
        p.modemIncluded ? "modem dahil" : null,
      ].filter(Boolean);
      return `- ${bits.join(" · ")}`;
    })
    .join("\n");

  const mobLines = mob
    .map((t) => {
      const bits = [
        fullName(t.operator, t.name),
        `${t.priceMonthly} ₺/ay`,
        t.gbLimit ? `${t.gbLimit} GB` : "sınırsız internet",
        t.minuteLimit ? `${t.minuteLimit} dakika` : "sınırsız dakika",
        t.isContract ? "faturalı" : "faturasız",
      ].filter(Boolean);
      return `- ${bits.join(" · ")}`;
    })
    .join("\n");

  const faqSection = Object.entries(FAQ)
    .map(
      ([path, items]) =>
        `### ${SITE}${path}\n\n` +
        items.map((f) => `**S: ${f.q}**\n\nC: ${f.a}`).join("\n\n")
    )
    .join("\n\n");

  return `# ${SITE_NAME} — tam veri

Son güncelleme: ${stamp()}
Kaynak: ${SITE}
Lisans: İçerik alıntılanabilir; kaynak olarak ${SITE_NAME} belirtilmelidir.

Bu dosya, sitedeki güncel tarife verisinin makine-okunur tam listesidir.
Fiyatlar aylık ve KDV dahildir. Kesin fiyat için operatörün resmi sitesi
esastır.

## Ev interneti paketleri (${pkgs.length})

${pkgLines || "- Veri bulunamadı"}

## Mobil hat tarifeleri (${mob.length})

${mobLines || "- Veri bulunamadı"}

## Araçlar

- İnternet hız testi: ${SITE}/hiz-testi — tarayıcı üzerinden indirme, yükleme ve
  ping ölçer, üyelik gerektirmez, sonuç diğer kullanıcıların ortalamasıyla
  karşılaştırılır.
- Paket filtreleme: ${SITE}/paket-karsilastir — operatör, bağlantı türü,
  minimum hız ve fiyat sıralaması.

## Sık sorulan sorular

${faqSection}

${
  posts.length
    ? `## Rehber yazıları\n\n${posts
        .map((p) => `- [${p.title}](${SITE}/blog/${p.slug}) — ${p.excerpt ?? p.category}`)
        .join("\n")}`
    : ""
}

## Platform hakkında

${SITE_NAME} bağımsız bir karşılaştırma platformudur. Operatörlerle ticari
ortaklığı yoktur, sıralama ücret karşılığı değiştirilmez. Veriler operatörlerin
resmi sayfalarından günlük olarak taranır; fiyatı değişen paketler arayüzde
işaretlenir.
`;
}
