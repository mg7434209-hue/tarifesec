/**
 * TEK DOĞRU KAYNAK — arama niyetine göre açılış sayfaları.
 *
 * "turknet internet paketleri", "fiber internet fiyatları", "faturasız hat
 * tarifeleri" gibi aramalar tek bir genel karşılaştırma sayfasına değil,
 * o niyete özel bir sayfaya iner. Her kayıt:
 *   - aynı veriyi (paketler / mobil tarifeler) bir SÜZGEÇLE daraltır,
 *   - kendi başlığını, açıklamasını, giriş metnini ve SSS'ini taşır.
 *
 * Sunucu (SSR + JSON-LD + sitemap + llms) ve istemci (Landing.tsx) aynı
 * süzgeç fonksiyonunu kullanır — bot ile kullanıcının gördüğü liste AYNIDIR.
 *
 * KURAL: Süzgece uyan kayıt yoksa sayfa 404 döner ve sitemap'e girmez
 * (boş sayfa = "ince içerik"). Veri gelince sayfa kendiliğinden açılır.
 *
 * Yeni sayfa eklemek = bu listeye bir kayıt. App.tsx, sitemap ve SSR
 * otomatik kapsar.
 */

export type LandingKind = "internet" | "mobil";

export type LandingFilter = {
  operator?: string;
  type?: string;
  /** Tam hız eşleşmesi (Mbps) */
  speed?: number;
  /** Taahhütsüz fiyatı olan paketler */
  noCommitment?: boolean;
  /** Mobil: true = faturalı, false = faturasız */
  isContract?: boolean;
  /** Fiyata göre sıralanmış listeden ilk N kayıt */
  limit?: number;
};

export type LandingFaq = { q: string; a: string };

export type Landing = {
  path: string;
  kind: LandingKind;
  /** Breadcrumb ve bağlantılarda görünen kısa ad */
  label: string;
  title: string;
  description: string;
  h1: string;
  intro: string[];
  filter: LandingFilter;
  faq: LandingFaq[];
};

const YIL = 2026;

export const LANDINGS: Landing[] = [
  // ── Ev interneti: operatörler ─────────────────────────────────────────────
  {
    path: "/internet/superonline",
    kind: "internet",
    label: "Superonline İnternet Paketleri",
    title: `Superonline İnternet Paketleri ${YIL} — Fiber ve Superbox Fiyatları`,
    description:
      "Superonline fiber ve Superbox kablosuz ev interneti paketlerinin güncel aylık fiyatları, hızları ve taahhüt koşulları. Diğer operatörlerle tarafsız karşılaştırın.",
    h1: `Superonline İnternet Paketleri ve Fiyatları (${YIL})`,
    intro: [
      "Superonline, Turkcell grubunun ev interneti markasıdır. Fiber altyapısı olan adreslerde fiber paketler, fiber olmayan adreslerde ise mobil şebeke üzerinden çalışan Superbox kablosuz paketler sunar.",
      "Aşağıdaki liste Superonline paketlerini aylık ücrete göre sıralar. Aynı hızdaki diğer operatör paketlerini görmek için ev interneti karşılaştırma sayfasını kullanabilirsiniz.",
    ],
    filter: { operator: "superonline" },
    faq: [
      {
        q: "Superbox ile Superonline fiber arasındaki fark nedir?",
        a: "Superonline fiber, eve kadar çekilen optik kablo üzerinden çalışır ve kurulum gerektirir. Superbox ise mobil şebekeye bağlanan bir modemdir; kurulum beklemeden prize takılıp kullanılır, ancak hızı baz istasyonu yoğunluğuna göre değişir.",
      },
      {
        q: "Superonline fiber adresime gelir mi?",
        a: "Fiber erişimi adres bazlıdır. Superonline'ın resmi sitesindeki altyapı sorgulama ekranına tam adresinizi girerek öğrenebilirsiniz. Fiber yoksa Superbox kablosuz paketler seçenek olarak kalır.",
      },
    ],
  },
  {
    path: "/internet/turk-telekom",
    kind: "internet",
    label: "Türk Telekom İnternet Paketleri",
    title: `Türk Telekom İnternet Paketleri ${YIL} — Fiber Fiyatları`,
    description:
      "Türk Telekom ev interneti paketlerinin güncel aylık fiyatları, indirme/yükleme hızları ve taahhüt koşulları. Diğer operatörlerle yan yana karşılaştırın.",
    h1: `Türk Telekom İnternet Paketleri ve Fiyatları (${YIL})`,
    intro: [
      "Türk Telekom, Türkiye'nin en geniş sabit internet altyapısına sahip operatörüdür; fiber ve VDSL hizmetini doğrudan kendi altyapısı üzerinden verir.",
      "Aşağıda Türk Telekom paketleri aylık ücrete göre sıralanmıştır. Yükleme hızları ve taahhütsüz fiyatlar, bilgi varsa her paketin altında gösterilir.",
    ],
    filter: { operator: "turk-telekom" },
    faq: [
      {
        q: "Türk Telekom internette yükleme hızı neden düşük?",
        a: "Asimetrik paketlerde yükleme hızı indirme hızından düşük tanımlanır. Bulut yedekleme, canlı yayın veya büyük dosya gönderimi yapıyorsanız paketin yükleme hızını da karşılaştırın.",
      },
    ],
  },
  {
    path: "/internet/vodafone",
    kind: "internet",
    label: "Vodafone Ev İnterneti Paketleri",
    title: `Vodafone Ev İnterneti Paketleri ${YIL} — Güncel Fiyatlar`,
    description:
      "Vodafone ev interneti (Vodafone Net) paketlerinin güncel aylık fiyatları, hızları ve taahhüt süreleri. Diğer operatörlerin paketleriyle karşılaştırın.",
    h1: `Vodafone Ev İnterneti Paketleri ve Fiyatları (${YIL})`,
    intro: [
      "Vodafone, mobil hatlarının yanında ev interneti paketleri de sunar. Hizmet, adresinizdeki altyapıya göre fiber veya VDSL olarak verilir.",
      "Liste Vodafone ev interneti paketlerini aylık ücrete göre sıralar. Mobil hat ile birlikte alınan kampanyalar operatörün sitesinde ayrıca duyurulur.",
    ],
    filter: { operator: "vodafone" },
    faq: [
      {
        q: "Vodafone ev interneti ile mobil hattı birlikte almak avantajlı mı?",
        a: "Operatörler zaman zaman ev interneti ve mobil hattı birlikte alanlara indirim tanımlar. Kampanya koşulları değiştiği için toplam aylık maliyeti, iki hizmeti ayrı operatörlerden almakla karşılaştırarak hesaplayın.",
      },
    ],
  },
  {
    path: "/internet/turknet",
    kind: "internet",
    label: "TurkNet İnternet Paketleri",
    title: `TurkNet İnternet Paketleri ${YIL} — Fiber Fiyatları`,
    description:
      "TurkNet ev interneti paketlerinin güncel aylık fiyatları, hızları ve taahhütlü/taahhütsüz seçenekleri. Diğer operatörlerle tarafsız karşılaştırın.",
    h1: `TurkNet İnternet Paketleri ve Fiyatları (${YIL})`,
    intro: [
      "TurkNet, ev interneti odaklı bir servis sağlayıcıdır; mobil hat hizmeti vermez. Paketleri fiber ve VDSL altyapısı üzerinden sunulur.",
      "Aşağıda TurkNet paketleri aylık ücrete göre sıralanmıştır. Taahhütsüz fiyat bilgisi varsa her paketin altında ayrıca gösterilir.",
    ],
    filter: { operator: "turknet" },
    faq: [
      {
        q: "TurkNet taahhütsüz internet sunuyor mu?",
        a: "Listede taahhütsüz fiyatı bulunan TurkNet paketleri ayrıca belirtilir. Güncel taahhütsüz koşulları başvuru öncesinde TurkNet'in resmi sitesinden doğrulayın.",
      },
    ],
  },

  // ── Ev interneti: bağlantı türü ve koşul ──────────────────────────────────
  {
    path: "/internet/fiber",
    kind: "internet",
    label: "Fiber İnternet Paketleri",
    title: `Fiber İnternet Paketleri ${YIL} — Tüm Operatörlerin Fiyatları`,
    description:
      "Superonline, Türk Telekom ve TurkNet fiber internet paketleri tek listede: aylık ücret, indirme ve yükleme hızı, taahhüt süresi.",
    h1: `Fiber İnternet Paketleri (${YIL})`,
    intro: [
      "Fiber internet, veriyi eve kadar optik kablo ile taşır. Bakır hatlara göre mesafeye bağlı hız kaybı çok düşüktür, gecikme (ping) genellikle 20 ms'in altında kalır ve yüksek hızlarda kararlı çalışır.",
      "Fiber paket alabilmek için adresinize fiber çekilmiş olması gerekir. Aşağıdaki liste tüm operatörlerin fiber paketlerini aylık ücrete göre sıralar.",
    ],
    filter: { type: "fiber" },
    faq: [
      {
        q: "Fiber internet ile VDSL arasındaki fark nedir?",
        a: "VDSL, santralden sokak dolabına kadar fiber, dolaptan eve kadar bakır hat kullanır; hız, bakır hattın uzunluğuna göre düşer. Fiber (FTTH) ise eve kadar optik kablodur ve paketteki hıza çok daha yakın değer verir.",
      },
      {
        q: "En ucuz fiber internet hangisi?",
        a: "Bu sayfadaki liste fiber paketleri aylık ücrete göre sıralar; ilk sıradaki paket şu anki en düşük fiyatlı fiber pakettir. Fiyatlar kampanyaya göre değiştiği için başvuru öncesi operatör sitesinden doğrulayın.",
      },
    ],
  },
  {
    path: "/internet/kablosuz",
    kind: "internet",
    label: "Kablosuz (Altyapısız) İnternet",
    title: `Kablosuz Ev İnterneti ${YIL} — Altyapısız İnternet Fiyatları`,
    description:
      "Fiber altyapısı olmayan adresler için kablosuz (altyapısız) ev interneti paketleri: aylık ücret, hız ve taahhüt koşulları tek listede.",
    h1: `Kablosuz (Altyapısız) Ev İnterneti Paketleri (${YIL})`,
    intro: [
      "Kablosuz ev interneti, mobil şebekeye bağlanan bir modemle çalışır. Kablo çekimi ve teknisyen randevusu gerekmez; cihaz prize takıldıktan kısa süre sonra kullanıma hazır olur.",
      "Hız, bulunduğunuz bölgedeki baz istasyonunun kapsamasına ve yoğunluğuna bağlıdır; akşam saatlerinde düşüş yaşanabilir. Adresinizde fiber varsa fiber paketler genellikle daha kararlıdır.",
    ],
    filter: { type: "kablosuz" },
    faq: [
      {
        q: "Altyapısız internet kimler için uygundur?",
        a: "Adresinde fiber veya VDSL altyapısı olmayanlar, kısa süreli oturanlar ve kurulum beklemek istemeyenler için uygundur. Online oyun ve yoğun görüntülü görüşme için gecikme değeri fiber kadar düşük değildir.",
      },
    ],
  },
  {
    path: "/internet/taahhutsuz",
    kind: "internet",
    label: "Taahhütsüz İnternet Paketleri",
    title: `Taahhütsüz İnternet Paketleri ${YIL} — Cayma Bedelsiz Fiyatlar`,
    description:
      "Taahhütsüz ev interneti fiyatları: taahhütlü fiyatla yan yana, aradaki farkla birlikte. Cayma bedeli ödemeden çıkabileceğiniz paketleri karşılaştırın.",
    h1: `Taahhütsüz İnternet Paketleri (${YIL})`,
    intro: [
      "Taahhütsüz pakette istediğiniz ay aboneliği sonlandırabilirsiniz; cayma bedeli doğmaz. Karşılığında aylık ücret aynı paketin taahhütlü fiyatından yüksektir.",
      "Aşağıda taahhütsüz fiyatı bilinen paketler listelenir ve taahhütlü fiyatla aradaki fark gösterilir. Kiralık evde oturuyorsanız veya taşınma ihtimaliniz varsa bu farkı, olası cayma bedeliyle karşılaştırın.",
    ],
    filter: { noCommitment: true },
    faq: [
      {
        q: "Taahhütsüz internet ne kadar pahalı?",
        a: "Listedeki paketlerde taahhütsüz fiyat, taahhütlü fiyatın üzerindedir; fark her paketin satırında ayrıca yazılır. Kalacağınız ay sayısını bu farkla çarpıp cayma bedeliyle karşılaştırmak en doğru hesaptır.",
      },
    ],
  },
  {
    path: "/internet/100-mbps",
    kind: "internet",
    label: "100 Mbps İnternet Paketleri",
    title: `100 Mbps İnternet Paketleri ${YIL} — Operatör Fiyatları`,
    description:
      "100 Mbps ev interneti paketlerinin operatörlere göre aylık fiyatları, yükleme hızları ve taahhüt koşulları. Aynı hızda en uygun paketi bulun.",
    h1: `100 Mbps İnternet Paketleri (${YIL})`,
    intro: [
      "100 Mbps, 3-4 kişilik bir evde aynı anda video izleme, görüntülü görüşme ve oyun için çoğu zaman yeterli bir hızdır. 4K yayın ve çok sayıda cihaz aynı anda kullanılıyorsa daha yüksek hızlar değerlendirilebilir.",
      "Aynı indirme hızındaki paketler yükleme hızı, taahhüt süresi ve modem koşullarında farklılaşır. Aşağıdaki liste 100 Mbps paketleri aylık ücrete göre sıralar.",
    ],
    filter: { speed: 100 },
    faq: [
      {
        q: "100 Mbps internet ile saniyede kaç MB indirilir?",
        a: "1 bayt 8 bit olduğu için 100 Mbps bağlantıda teorik indirme hızı yaklaşık 12,5 MB/s'dir. Gerçek değer Wi-Fi koşulları ve sunucu hızına göre daha düşük çıkabilir.",
      },
    ],
  },
  {
    path: "/internet/en-ucuz",
    kind: "internet",
    label: "En Ucuz Ev İnterneti",
    title: `En Ucuz Ev İnterneti ${YIL} — Aylık Fiyata Göre İlk 10`,
    description:
      "Aylık ücrete göre sıralanmış en ucuz ev interneti paketleri: hız, taahhüt ve modem koşullarıyla birlikte. Fiyatlar düzenli olarak güncellenir.",
    h1: `En Ucuz Ev İnterneti Paketleri (${YIL})`,
    intro: [
      "Bu liste tüm operatörlerin ev interneti paketlerini aylık ücrete göre sıralar ve en uygun 10 paketi gösterir. Sıralama ücret karşılığı değiştirilmez.",
      "En düşük aylık ücret her zaman en düşük toplam maliyet anlamına gelmez: taahhüt süresi, kurulum bedeli ve modem koşullarını da hesaba katın. Adresinizde fiber yoksa listedeki fiber paketler kurulamaz.",
    ],
    filter: { limit: 10 },
    faq: [
      {
        q: "En ucuz internet paketi hangisi?",
        a: "Listenin ilk sırasındaki paket, sitemizdeki güncel verilere göre aylık ücreti en düşük ev interneti paketidir. Adresinizdeki altyapıya göre bu paket kurulamayabilir; başvuru öncesi altyapı sorgulaması yapın.",
      },
    ],
  },

  // ── Mobil ─────────────────────────────────────────────────────────────────
  {
    path: "/mobil-tarifeler/faturali",
    kind: "mobil",
    label: "Faturalı Hat Tarifeleri",
    title: `Faturalı Hat Tarifeleri ${YIL} — Turkcell ve Vodafone Fiyatları`,
    description:
      "Turkcell ve Vodafone faturalı hat tarifeleri: aylık ücret, GB ve dakika bilgisi tek listede, fiyata göre sıralı.",
    h1: `Faturalı Hat Tarifeleri (${YIL})`,
    intro: [
      "Faturalı hatta kullanım bedeli ay sonunda faturalanır. Aynı internet miktarı için GB başına maliyet genellikle faturasız hatlardan düşüktür; buna karşılık tarifeler çoğunlukla taahhütle sunulur.",
      "Aşağıdaki liste tüm operatörlerin faturalı tarifelerini aylık ücrete göre sıralar.",
    ],
    filter: { isContract: true },
    faq: [
      {
        q: "Faturalı hatta taahhüt zorunlu mu?",
        a: "Hayır, taahhütsüz faturalı tarifeler de vardır; ancak kampanyalı fiyatlar genellikle 12 veya 24 ay taahhüde bağlıdır. Taahhüt bitmeden çıkarsanız cayma bedeli doğabilir.",
      },
    ],
  },
  {
    path: "/mobil-tarifeler/faturasiz",
    kind: "mobil",
    label: "Faturasız Hat Tarifeleri",
    title: `Faturasız Hat Tarifeleri ${YIL} — Ön Ödemeli Paket Fiyatları`,
    description:
      "Faturasız (ön ödemeli) hat paketlerinin aylık ücret, GB ve dakika bilgisi. Taahhütsüz kullanmak isteyenler için operatörleri karşılaştırın.",
    h1: `Faturasız Hat Tarifeleri (${YIL})`,
    intro: [
      "Faturasız hatta önce yükleme yapar, sonra kullanırsınız; ay sonunda sürpriz fatura çıkmaz ve taahhüt gerekmez.",
      "Aynı internet miktarı için aylık ücret genellikle faturalı tarifelerden yüksektir. Aşağıdaki liste faturasız paketleri aylık ücrete göre sıralar.",
    ],
    filter: { isContract: false },
    faq: [
      {
        q: "Faturasızdan faturalıya numara değiştirmeden geçilir mi?",
        a: "Evet. Aynı operatörde hat türü değişikliği numara korunarak yapılır; farklı operatöre geçişte numara taşıma ile numaranızı koruyabilirsiniz.",
      },
    ],
  },
  {
    path: "/mobil-tarifeler/turkcell",
    kind: "mobil",
    label: "Turkcell Tarifeleri",
    title: `Turkcell Tarifeleri ${YIL} — Faturalı Paket Fiyatları`,
    description:
      "Turkcell mobil hat tarifelerinin güncel aylık fiyatları, GB ve dakika bilgisi. diğer operatörlerin tarifeleriyle karşılaştırın.",
    h1: `Turkcell Tarifeleri ve Fiyatları (${YIL})`,
    intro: [
      "Turkcell, abone sayısı bakımından Türkiye'nin en büyük mobil operatörüdür. Aşağıda Turkcell tarifeleri aylık ücrete göre sıralanmıştır.",
      "Aynı GB miktarındaki diğer operatör tarifelerini görmek için mobil tarife karşılaştırma sayfasını kullanabilirsiniz.",
    ],
    filter: { operator: "turkcell" },
    faq: [
      {
        q: "Turkcell'e numara taşıyınca ek kampanya var mı?",
        a: "Operatörler numara taşıyarak gelen abonelere zaman zaman ek internet veya indirim tanımlar. Kampanya koşulları sık değiştiği için başvuru öncesi Turkcell'in resmi sitesinden kontrol edin.",
      },
    ],
  },
  {
    path: "/mobil-tarifeler/vodafone",
    kind: "mobil",
    label: "Vodafone Tarifeleri",
    title: `Vodafone Tarifeleri ${YIL} — Faturalı Paket Fiyatları`,
    description:
      "Vodafone mobil hat tarifelerinin güncel aylık fiyatları, GB ve dakika bilgisi. diğer operatörlerin tarifeleriyle karşılaştırın.",
    h1: `Vodafone Tarifeleri ve Fiyatları (${YIL})`,
    intro: [
      "Vodafone Türkiye'deki üç mobil operatörden biridir. Aşağıda Vodafone tarifeleri aylık ücrete göre sıralanmıştır.",
      "Tarifeler arasında seçim yaparken aylık GB ihtiyacınızı ve evde Wi-Fi kullanıp kullanmadığınızı göz önünde bulundurun.",
    ],
    filter: { operator: "vodafone" },
    faq: [
      {
        q: "Vodafone'da kullanılmayan GB sonraki aya devreder mi?",
        a: "Devretme koşulu tarifeye ve kampanyaya göre değişir. Tarifenizin ayrıntılarını Vodafone'un resmi sitesinden veya müşteri hizmetlerinden kontrol edin.",
      },
    ],
  },
  {
    path: "/mobil-tarifeler/turk-telekom",
    kind: "mobil",
    label: "Türk Telekom Mobil Tarifeleri",
    title: `Türk Telekom Mobil Tarifeleri ${YIL} — Faturalı Paket Fiyatları`,
    description:
      "Türk Telekom mobil hat tarifelerinin güncel aylık fiyatları, GB ve dakika bilgisi. Turkcell ve Vodafone tarifeleriyle karşılaştırın.",
    h1: `Türk Telekom Mobil Tarifeleri ve Fiyatları (${YIL})`,
    intro: [
      "Türk Telekom, mobil hatlarını ev interneti hizmetiyle aynı çatı altında sunar. Aşağıda Türk Telekom mobil tarifeleri aylık ücrete göre sıralanmıştır.",
      "Ev interneti de Türk Telekom'dan alınıyorsa birleşik kampanyalar olabilir; toplam maliyeti ayrı operatörlerden almakla karşılaştırın.",
    ],
    filter: { operator: "turk-telekom" },
    faq: [
      {
        q: "Türk Telekom mobil hat ile ev internetini birlikte almak ucuz mu?",
        a: "Birleşik kampanyalar dönemsel olarak sunulur. İki hizmetin toplam aylık bedelini, ayrı operatörlerin en uygun paketleriyle karşılaştırarak karar verin.",
      },
    ],
  },
];

export const landingByPath = (p: string) => LANDINGS.find((l) => l.path === p);

// ── Süzgeç — sunucu ve istemci AYNI fonksiyonu kullanır ─────────────────────

type PkgLike = {
  operatorSlug: string;
  type: string;
  downloadSpeed: number;
  priceMonthly: number;
  priceNoCommitment?: number | null;
};

type MobileLike = {
  operatorSlug: string;
  isContract?: boolean | null;
  priceMonthly: number;
};

const byPrice = <T extends { priceMonthly: number }>(a: T, b: T) => a.priceMonthly - b.priceMonthly;

export function filterPackages<T extends PkgLike>(l: Landing, rows: T[]): T[] {
  const f = l.filter;
  const out = rows
    .filter(
      (p) =>
        (!f.operator || p.operatorSlug === f.operator) &&
        (!f.type || p.type === f.type) &&
        (!f.speed || p.downloadSpeed === f.speed) &&
        (!f.noCommitment || (p.priceNoCommitment ?? 0) > 0)
    )
    .sort(byPrice);
  return f.limit ? out.slice(0, f.limit) : out;
}

export function filterMobile<T extends MobileLike>(l: Landing, rows: T[]): T[] {
  const f = l.filter;
  const out = rows
    .filter(
      (t) =>
        (!f.operator || t.operatorSlug === f.operator) &&
        (f.isContract === undefined || Boolean(t.isContract) === f.isContract)
    )
    .sort(byPrice);
  return f.limit ? out.slice(0, f.limit) : out;
}

/**
 * Listenin tek cümlelik özeti — hem sayfada hem SSR'da aynı metin.
 * Yapay zekâ motorları bu cümleyi doğrudan alıntılar; kendi başına anlamlı.
 */
export function landingSummary(
  l: Landing,
  rows: { priceMonthly: number; downloadSpeed?: number; operator: string; name: string }[]
): string {
  if (!rows.length) return "";
  const prices = rows.map((r) => r.priceMonthly);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const tlf = (n: number) => `${n.toLocaleString("tr-TR")} ₺`;
  const cheapest = rows.reduce((a, b) => (a.priceMonthly <= b.priceMonthly ? a : b));
  const nm = cheapest.name.toLocaleLowerCase("tr").startsWith(cheapest.operator.toLocaleLowerCase("tr"))
    ? cheapest.name
    : `${cheapest.operator} ${cheapest.name}`;
  const unit = l.kind === "internet" ? "paket" : "tarife";
  const range = min === max ? `aylık ${tlf(min)}` : `aylık ${tlf(min)} ile ${tlf(max)} arasında`;
  return `Bu listede ${rows.length} ${unit} var; fiyatlar ${range}. En uygun seçenek ${nm} (${tlf(cheapest.priceMonthly)}/ay).`;
}

