/**
 * İş ortağı siteleri ve reklam alanları — TEK DOĞRU KAYNAK.
 *
 * Hem sunucu (SSR içeriği, llms.txt) hem istemci buradan okur.
 * Yeni ortak eklemek için yalnızca bu listeye satır eklenir.
 *
 * SEO NOTU: ticari yönlendirme bağlantıları rel="sponsored" taşır (Google'ın
 * ücretli/ortaklık bağlantıları için istediği değer). Kendi sitelerimize giden
 * tanıtım bağlantıları da bu kapsamdadır; aksi hâlde bağlantı şeması sayılabilir.
 */
export type Partner = {
  id: string;
  name: string;
  url: string;
  /** Kısa tanıtım — kartlarda görünür */
  description: string;
  /** Düğme metni */
  cta: string;
  /** Marka rengi */
  color: string;
  /** Hangi bağlamda gösterilsin */
  contexts: PartnerContext[];
};

export type PartnerContext =
  | "internet"      // ev interneti / mobil sayfaları
  | "genel"         // her yerde
  | "donusum";      // form gönderimi sonrası (teşekkür ekranı)

export const PARTNERS: Partner[] = [
  {
    id: "internetbasvuru",
    name: "internetbasvuru.com",
    url: "https://www.internetbasvuru.com",
    description:
      "Seçtiğiniz paket için başvurunuzu tek formla tamamlayın; altyapı sorgusu ve kurulum randevusu sizin adınıza takip edilsin.",
    cta: "Başvuruya git",
    color: "#0097a7",
    contexts: ["internet", "donusum"],
  },
  {
    id: "gespaenerji",
    name: "GESPA Enerji",
    url: "https://www.gespaenerji.com",
    description:
      "Çatınıza güneş enerjisi santrali kurarak elektrik faturanızı düşürün. Anahtar teslim GES kurulumu ve ücretsiz keşif.",
    cta: "Güneş enerjisini keşfet",
    color: "#f59e0b",
    contexts: ["genel"],
  },
];

export const byContext = (ctx: PartnerContext) =>
  PARTNERS.filter((p) => p.contexts.includes(ctx) || p.contexts.includes("genel"));

export const byId = (id: string) => PARTNERS.find((p) => p.id === id);

/** Dış bağlantılarda kullanılacak rel değeri */
export const PARTNER_REL = "sponsored noopener noreferrer";

/**
 * Reklam alanları.
 *
 * Şu an harici reklam ağı bağlı değil; alanlar iş ortağı kartlarıyla
 * doldurulur. AdSense vb. bağlanacaksa `network` alanı doldurulur ve
 * AdSlot bileşeni script'i o zaman yükler. Alan yükseklikleri SABİTTİR —
 * reklam geç yüklendiğinde sayfa zıplamaz (CLS = 0).
 */
export type AdPlacement = {
  id: string;
  /** Rezerve edilen alan (px) — CLS'i önler */
  height: { mobile: number; desktop: number };
  context: PartnerContext;
};

export const AD_PLACEMENTS: Record<string, AdPlacement> = {
  sonucAlti: { id: "sonuc-alti", height: { mobile: 280, desktop: 200 }, context: "internet" },
  yanPanel: { id: "yan-panel", height: { mobile: 280, desktop: 320 }, context: "genel" },
  icerikArasi: { id: "icerik-arasi", height: { mobile: 280, desktop: 200 }, context: "genel" },
};
