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
