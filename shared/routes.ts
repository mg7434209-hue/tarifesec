/**
 * TEK DOĞRU KAYNAK — rota meta verisi.
 *
 * Hem sunucu (server/seo) hem istemci (useSeo) buradan okur. İkisinin ayrı
 * başlık tutması, Googlebot'un JS öncesi ve sonrası FARKLI başlık görmesine
 * yol açıyordu; bu dosya o ikiliği ortadan kaldırır.
 *
 * Yeni rota eklerken: App.tsx + burası. Sitemap ve SSR otomatik kapsar.
 */
export type RouteMeta = {
  path: string;
  /** Breadcrumb ve menüde görünen kısa ad */
  label: string;
  title: string;
  description: string;
  changefreq: string;
  priority: string;
};

export const ROUTES: RouteMeta[] = [
  {
    path: "/",
    label: "Ana Sayfa",
    title: "İnternet ve Mobil Tarife Karşılaştırma 2026 | tarifesec.net.tr",
    description:
      "Superonline, Türk Telekom, Vodafone, Turkcell ve TurkNet ev interneti paketlerini ve mobil tarifeleri tek sayfada tarafsız karşılaştırın. Güncel fiyatlar, ücretsiz hız testi.",
    changefreq: "daily",
    priority: "1.0",
  },
  {
    path: "/paket-karsilastir",
    label: "Ev İnterneti",
    title: "Ev İnterneti Paket Karşılaştırma — Fiber ve Kablosuz Fiyatları | tarifesec.net.tr",
    description:
      "Fiber, kablosuz ve ADSL ev interneti paketlerini hız, aylık ücret ve taahhüt süresine göre filtreleyin. Superonline, Türk Telekom, Vodafone ve TurkNet fiyatları yan yana.",
    changefreq: "daily",
    priority: "0.9",
  },
  {
    path: "/mobil-tarifeler",
    label: "Mobil Tarifeler",
    title: "Mobil Tarife Karşılaştırma — Faturalı ve Faturasız Fiyatlar | tarifesec.net.tr",
    description:
      "Turkcell, Vodafone ve Türk Telekom faturalı ile faturasız mobil hat tarifelerini GB, dakika ve aylık ücrete göre karşılaştırın.",
    changefreq: "daily",
    priority: "0.9",
  },
  {
    path: "/hiz-testi",
    label: "Hız Testi",
    title: "İnternet Hız Testi — Ücretsiz Download, Upload ve Ping Ölçümü | tarifesec.net.tr",
    description:
      "İnternet hızınızı ücretsiz ölçün: indirme, yükleme ve ping değerleri. Sonucunuzu diğer kullanıcıların ortalamasıyla karşılaştırın, paketinizin hakkını alıp almadığınızı görün.",
    changefreq: "weekly",
    priority: "0.8",
  },
  {
    path: "/hakkimizda",
    label: "Hakkımızda",
    title: "Hakkımızda — Bağımsız Tarife Karşılaştırma | tarifesec.net.tr",
    description:
      "tarifesec.net.tr nasıl çalışır, fiyatlar nasıl güncellenir ve bağımsızlığımızı nasıl koruyoruz.",
    changefreq: "monthly",
    priority: "0.5",
  },
  {
    path: "/iletisim",
    label: "İletişim",
    title: "İletişim | tarifesec.net.tr",
    description:
      "Soru, öneri ve kişisel verilerinizle ilgili talepleriniz için bize ulaşın.",
    changefreq: "monthly",
    priority: "0.5",
  },
  {
    path: "/kvkk",
    label: "KVKK Aydınlatma Metni",
    title: "KVKK Aydınlatma Metni | tarifesec.net.tr",
    description:
      "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında kişisel verilerinizin nasıl işlendiği.",
    changefreq: "yearly",
    priority: "0.3",
  },
  {
    path: "/gizlilik",
    label: "Gizlilik Politikası",
    title: "Gizlilik Politikası | tarifesec.net.tr",
    description:
      "Hangi bilgileri sakladığımız, nasıl koruduğumuz ve haklarınız.",
    changefreq: "yearly",
    priority: "0.3",
  },
  {
    path: "/cerez-politikasi",
    label: "Çerez Politikası",
    title: "Çerez Politikası | tarifesec.net.tr",
    description:
      "Sitede kullanılan çerezler, ne işe yaradıkları ve nasıl yönetebileceğiniz.",
    changefreq: "yearly",
    priority: "0.3",
  },
  {
    path: "/blog",
    label: "Rehber",
    title: "İnternet ve Mobil Tarife Rehberi — Bağımsız Yazılar | tarifesec.net.tr",
    description:
      "Fiber altyapı, taahhüt şartları, numara taşıma ve doğru paket seçimi üzerine bağımsız rehber yazıları.",
    changefreq: "weekly",
    priority: "0.7",
  },
];

export const byPath = (p: string) => ROUTES.find((r) => r.path === p);
