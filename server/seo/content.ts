/**
 * Sunucuda basılan taranabilir içerik.
 *
 * SPA olduğu için #root istemcide doldurulur; JS çalıştırmayan istemciler
 * (GPTBot, ClaudeBot, PerplexityBot, ilk tur Googlebot) bu içeriği görür.
 * React yüklendiğinde createRoot aynı düğümün içeriğini değiştirir.
 *
 * KURAL: Buradaki bilgi, kullanıcının gördüğü bilgiyle AYNI olmalıdır —
 * gizli metin veya farklı içerik sunmak (cloaking) cezalandırılır.
 */
import { esc, tl, fullName } from "./util";
import { FAQ, type Faq } from "./faq";
import type { Pkg, Mobile, Post } from "./data";
import { summarize, summarizeMobile } from "./data";
import { byContext, PARTNER_REL, type PartnerContext } from "../../shared/partners";
import { legalBySlug } from "../../shared/legal";
import { SITE_INFO, hasContactPhone, hasContactAddress } from "../../shared/site";

const faqBlock = (items: Faq[]) =>
  !items.length
    ? ""
    : `<section><h2>Sık Sorulan Sorular</h2><dl>${items
        .map((f) => `<dt><h3>${esc(f.q)}</h3></dt><dd><p>${esc(f.a)}</p></dd>`)
        .join("")}</dl></section>`;

/**
 * İş ortağı bağlantıları.
 * Kullanıcının gördüğüyle aynı olmalı (cloaking yasak); rel="sponsored"
 * taşır, böylece ticari bağlantı olduğu arama motorlarına bildirilir.
 */
const partnerBlock = (ctx: PartnerContext) => {
  const list = byContext(ctx);
  if (!list.length) return "";
  return `<section><h2>İlginizi çekebilir <small>(reklam)</small></h2><ul>${list
    .map(
      (p) =>
        `<li><a href="${esc(p.url)}" rel="${PARTNER_REL}" target="_blank">${esc(p.name)}</a> — ${esc(p.description)}</li>`
    )
    .join("")}</ul></section>`;
};

/** Verinin ne kadar taze olduğunu herkese göster — güven ve şeffaflık. */
export const freshnessLine = (rows: { lastScrapedAt: Date | null }[]) => {
  const stamps = rows.map((r) => r.lastScrapedAt).filter(Boolean) as Date[];
  if (!stamps.length) return "";

  const newest = new Date(Math.max(...stamps.map((d) => new Date(d).getTime())));
  const gun = Math.floor((Date.now() - newest.getTime()) / 864e5);
  const tarih = newest.toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", year: "numeric",
  });

  // Veri eskiyse bunu gizlemiyoruz — kullanıcı yanlış fiyatla başvurmasın
  return gun >= 2
    ? `<p><small>Fiyatlar son olarak ${tarih} tarihinde (${gun} gün önce) kontrol edildi. ` +
      `Başvuru öncesi güncel fiyatı operatörün resmi sayfasından doğrulayın.</small></p>`
    : `<p><small>Fiyatlar son olarak ${tarih} tarihinde kontrol edildi. ` +
      `Kesin fiyat için operatörün resmi sayfasını ziyaret edin.</small></p>`;
};

const pkgRow = (p: Pkg) => {
  const feats = (() => {
    try {
      const arr = JSON.parse(p.features ?? "[]");
      return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
    } catch {
      return [];
    }
  })();

  return `<li>
    <h3>${esc(fullName(p.operator, p.name))}</h3>
    <p><strong>${tl(p.priceMonthly)}/ay</strong> · ${esc(p.downloadSpeed)} Mbps indirme${
      p.uploadSpeed ? ` · ${esc(p.uploadSpeed)} Mbps yükleme` : ""
    } · ${esc(p.dataLimit ?? "Limitsiz")}${
      p.commitmentMonths ? ` · ${esc(p.commitmentMonths)} ay taahhüt` : ""
    }${p.priceNoCommitment ? ` · taahhütsüz ${tl(p.priceNoCommitment)}` : ""}${
      p.modemIncluded ? " · modem dahil" : ""
    }</p>
    ${feats.length ? `<ul>${feats.map((f: string) => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}
  </li>`;
};

const mobileRow = (t: Mobile) => `<li>
    <h3>${esc(fullName(t.operator, t.name))}</h3>
    <p><strong>${tl(t.priceMonthly)}/ay</strong> · ${
      t.gbLimit ? `${esc(t.gbLimit)} GB internet` : "Sınırsız internet"
    } · ${t.minuteLimit ? `${esc(t.minuteLimit)} dakika` : "sınırsız dakika"} · ${
      t.isContract ? "faturalı" : "faturasız"
    } hat</p>
  </li>`;

/** Ana sayfa */
export function homeContent(pkgs: Pkg[], mobile: Mobile[]): string {
  const s = summarize(pkgs);
  const m = summarizeMobile(mobile);

  return `<h1>Türkiye'nin Tüm İnternet ve Mobil Tarifelerini Tek Yerde Karşılaştırın</h1>
<p>tarifesec.net.tr, Superonline, Türk Telekom, Vodafone, Turkcell ve TurkNet
ev interneti paketlerini ve mobil hat tarifelerini bağımsız olarak karşılaştıran
ücretsiz bir platformdur. Hiçbir operatörle ticari bağımız yoktur.</p>

${
  s
    ? `<p>Şu anda <strong>${s.count} ev interneti paketi</strong> listeleniyor.
Fiyatlar aylık <strong>${tl(s.minPrice)}</strong> ile <strong>${tl(s.maxPrice)}</strong> arasında,
en yüksek hız <strong>${s.maxSpeed} Mbps</strong>. En uygun paket:
<strong>${esc(fullName(s.cheapest.operator, s.cheapest.name))}</strong> —
${tl(s.cheapest.priceMonthly)}/ay, ${s.cheapest.downloadSpeed} Mbps.</p>`
    : ""
}
${
  m
    ? `<p><strong>${m.count} mobil tarife</strong> karşılaştırılıyor; aylık
${tl(m.minPrice)} ile ${tl(m.maxPrice)} arasında. En uygun tarife:
<strong>${esc(fullName(m.cheapest.operator, m.cheapest.name))}</strong> — ${tl(m.cheapest.priceMonthly)}/ay.</p>`
    : ""
}

<h2>Ne yapabilirsiniz?</h2>
<ul>
  <li><a href="/paket-karsilastir">Ev interneti paket karşılaştırma</a> — fiber, kablosuz ve ADSL paketlerini hız ve fiyata göre filtreleyin.</li>
  <li><a href="/mobil-tarifeler">Mobil tarife karşılaştırma</a> — faturalı ve faturasız hatları GB ve dakikaya göre inceleyin.</li>
  <li><a href="/hiz-testi">Ücretsiz internet hız testi</a> — indirme, yükleme ve ping değerlerinizi ölçün.</li>
  <li><a href="/blog">Rehber yazıları</a> — taahhüt, altyapı ve paket seçimi üzerine bağımsız içerikler.</li>
</ul>

${s ? `<h2>Öne çıkan paketler</h2><ul>${pkgs.slice(0, 6).map(pkgRow).join("")}</ul>` : ""}
${partnerBlock("genel")}
${faqBlock(FAQ["/"] ?? [])}`;
}

/** Ev interneti karşılaştırma */
export function packagesContent(pkgs: Pkg[]): string {
  const s = summarize(pkgs);
  const byOperator = new Map<string, Pkg[]>();
  for (const p of pkgs) {
    if (!byOperator.has(p.operator)) byOperator.set(p.operator, []);
    byOperator.get(p.operator)!.push(p);
  }

  return `<h1>Ev İnterneti Paket Karşılaştırma</h1>
<p>Fiber, kablosuz ve ADSL ev interneti paketlerini aylık ücret, indirme hızı ve
taahhüt süresine göre karşılaştırın. Tüm fiyatlar aylık ve KDV dahildir.</p>
${
  s
    ? `<p>Listede <strong>${s.count} paket</strong> ve <strong>${s.operators.length} operatör</strong>
bulunuyor: ${s.operators.map((o) => esc(o)).join(", ")}. Fiyat aralığı
${tl(s.minPrice)} – ${tl(s.maxPrice)}, en yüksek hız ${s.maxSpeed} Mbps.</p>`
    : "<p>Paket listesi yükleniyor.</p>"
}

${freshnessLine(pkgs)}

${[...byOperator.entries()]
  .map(
    ([op, list]) =>
      `<section><h2>${esc(op)} internet paketleri</h2><ul>${list.map(pkgRow).join("")}</ul></section>`
  )
  .join("")}

<section>
  <h2>Paket seçerken nelere dikkat etmeli?</h2>
  <p>Aylık ücret tek başına yeterli bir ölçüt değildir. Karar verirken şu
  başlıkları birlikte değerlendirin:</p>
  <ul>
    <li><strong>Altyapı:</strong> Adresinizde fiber yoksa yüksek hızlı paketler kurulamaz; kablosuz seçenekleri değerlendirin.</li>
    <li><strong>Taahhüt süresi:</strong> 24 ay taahhüt aylık ücreti düşürür, erken çıkışta cayma bedeli doğurur.</li>
    <li><strong>Taahhütsüz fiyat:</strong> Kısa süreli kullanımda toplam maliyeti hesaplayın.</li>
    <li><strong>Modem ve kurulum:</strong> Modemin ücretsiz olup olmadığını ve kurulum bedelini kontrol edin.</li>
    <li><strong>Gerçek hız:</strong> Taahhüt edilen hız üst sınırdır; <a href="/hiz-testi">hız testi</a> ile mevcut bağlantınızı ölçebilirsiniz.</li>
  </ul>
</section>

${partnerBlock("internet")}
${faqBlock(FAQ["/paket-karsilastir"] ?? [])}`;
}

/** Mobil tarifeler */
export function mobileContent(rows: Mobile[]): string {
  const m = summarizeMobile(rows);
  const byOperator = new Map<string, Mobile[]>();
  for (const t of rows) {
    if (!byOperator.has(t.operator)) byOperator.set(t.operator, []);
    byOperator.get(t.operator)!.push(t);
  }

  return `<h1>Mobil Hat Tarifeleri Karşılaştırma</h1>
<p>Turkcell, Vodafone ve Türk Telekom faturalı ve faturasız mobil tarifelerini
aylık ücret, internet (GB) ve dakika bakımından karşılaştırın.</p>
${
  m
    ? `<p>Listede <strong>${m.count} tarife</strong> var; aylık ${tl(m.minPrice)} –
${tl(m.maxPrice)} aralığında. Operatörler: ${m.operators.map((o) => esc(o)).join(", ")}.</p>`
    : "<p>Tarife listesi yükleniyor.</p>"
}

${[...byOperator.entries()]
  .map(
    ([op, list]) =>
      `<section><h2>${esc(op)} mobil tarifeleri</h2><ul>${list.map(mobileRow).join("")}</ul></section>`
  )
  .join("")}

${partnerBlock("internet")}
${faqBlock(FAQ["/mobil-tarifeler"] ?? [])}`;
}

/** Hız testi */
export function speedTestContent(): string {
  return `<h1>Ücretsiz İnternet Hız Testi</h1>
<p>İnternet bağlantınızın indirme (download) hızını, yükleme (upload) hızını ve
gecikme (ping) değerini tarayıcı üzerinden ölçün. Kurulum veya üyelik gerekmez;
ölçüm kendi sunucumuz üzerinden yapılır.</p>

<h2>Test hangi değerleri ölçer?</h2>
<ul>
  <li><strong>İndirme hızı (Mbps):</strong> İnternetten cihazınıza veri aktarım hızı. Video izleme ve dosya indirmeyi belirler.</li>
  <li><strong>Yükleme hızı (Mbps):</strong> Cihazınızdan internete aktarım hızı. Görüntülü görüşme ve bulut yedeklemede önemlidir.</li>
  <li><strong>Ping (ms):</strong> Sinyalin gidip dönme süresi. Online oyun ve canlı görüşmede düşük olması gerekir.</li>
</ul>

<h2>Sonucunuz beklediğinizden düşükse</h2>
<p>Wi-Fi yerine kabloyla bağlanın, arka plandaki indirmeleri durdurun ve testi
farklı saatlerde tekrarlayın. Ölçüm sürekli olarak paketinizin belirgin altında
kalıyorsa operatörünüze arıza kaydı açın. Daha hızlı bir pakete geçmeyi
düşünüyorsanız <a href="/paket-karsilastir">ev interneti paketlerini karşılaştırabilirsiniz</a>.</p>

${faqBlock(FAQ["/hiz-testi"] ?? [])}`;
}

/** Blog listesi */
export function blogContent(posts: Post[]): string {
  return `<h1>İnternet ve Mobil Tarife Rehberi</h1>
<p>Fiber altyapı, taahhüt şartları, numara taşıma ve doğru paket seçimi üzerine
bağımsız rehber yazıları.</p>
${
  posts.length
    ? `<ul>${posts
        .map(
          (p) =>
            `<li><h2><a href="/blog/${esc(p.slug)}">${esc(p.title)}</a></h2>${
              p.excerpt ? `<p>${esc(p.excerpt)}</p>` : ""
            }<p><small>${esc(p.category)} · ${new Date(p.createdAt).toLocaleDateString("tr-TR")}</small></p></li>`
        )
        .join("")}</ul>`
    : "<p>Henüz yayınlanmış yazı bulunmuyor.</p>"
}`;
}

/** Tek blog yazısı */
export function postContent(post: Post): string {
  return `<article>
  <h1>${esc(post.title)}</h1>
  <p><small>${esc(post.category)} · ${new Date(post.createdAt).toLocaleDateString("tr-TR")} · ${esc(
    post.author ?? "Editör"
  )}</small></p>
  ${post.excerpt ? `<p><strong>${esc(post.excerpt)}</strong></p>` : ""}
  ${post.content
    .split(/\n{2,}/)
    .map((para) => `<p>${esc(para.trim())}</p>`)
    .join("")}
</article>`;
}


/** KVKK / gizlilik / çerez metinleri */
export function legalContent(slug: string): string {
  const doc = legalBySlug(slug);
  if (!doc) return "";
  return `<h1>${esc(doc.title)}</h1>
<p>${esc(doc.intro)}</p>
<p><small>Son güncelleme: ${esc(SITE_INFO.legalUpdatedAt)}</small></p>
${doc.sections
  .map(
    (sec) =>
      `<section><h2>${esc(sec.heading)}</h2>${sec.paragraphs
        .map((para) => `<p>${esc(para)}</p>`)
        .join("")}</section>`
  )
  .join("")}`;
}

export function contactContent(): string {
  const c = SITE_INFO.company;
  return `<h1>İletişim</h1>
<p>Soru, öneri veya kişisel verilerinizle ilgili taleplerinizi bize iletebilirsiniz.</p>
<ul>
  <li>E-posta: <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>
  ${hasContactPhone() ? `<li>Telefon: ${esc(c.phone)}</li>` : ""}
  ${hasContactAddress() ? `<li>Adres: ${esc(c.address)}</li>` : ""}
</ul>
<p>Kişisel verilerinizin silinmesini veya düzeltilmesini talep etmek için yukarıdaki
e-posta adresine yazmanız yeterlidir. Talebiniz en geç 30 gün içinde sonuçlandırılır.
Ayrıntılar <a href="/kvkk">KVKK Aydınlatma Metni</a>'ndedir.</p>`;
}

export function aboutContent(): string {
  return `<h1>Hakkımızda</h1>
<p>${esc(SITE_INFO.name)}, Türkiye'deki ev interneti ve mobil hat tarifelerini tek
sayfada karşılaştırmanızı sağlayan bağımsız bir platformdur.</p>

<section><h2>Bağımsızlık</h2>
<p>Hiçbir operatörle ticari ortaklığımız yoktur ve sıralamalar ücret karşılığı
değiştirilmez. Sitede iş ortaklarımıza ait sponsorlu bağlantılar bulunur; bunlar
açıkça "reklam" olarak işaretlenir ve karşılaştırma sonuçlarını etkilemez.</p></section>

<section><h2>Veriler nasıl güncelleniyor?</h2>
<p>Fiyatlar operatörlerin resmi sayfalarından düzenli olarak taranır. Emin
olunamayan hiçbir değer yayınlanmaz: belirsiz eşleşmeler ve olağandışı fiyat
sıçramaları otomatik uygulanmaz, elle kontrol edilir.</p></section>

<section><h2>Sorumluluk sınırı</h2>
<p>Fiyatlar bilgilendirme amaçlıdır ve kampanyalara göre değişebilir. Başvuru
öncesinde kesin fiyatı ve adresinizdeki altyapı uygunluğunu operatörün resmi
sayfasından doğrulamanızı öneririz.</p></section>`;
}
