/**
 * Rehber yazılarının altındaki "İlgili sayfalar" bağlantıları.
 *
 * İç bağlantı ağı: rehber okuyan kullanıcıyı ilgili karşılaştırma sayfasına,
 * arama motorunu da açılış sayfalarına yönlendirir. Sunucu (SSR) ve istemci
 * aynı listeyi kullanır. Yazıya özel liste yoksa başlıktaki anahtar
 * kelimelerden üretilir; yeni yazı eklemek için buraya dokunmak ŞART DEĞİL.
 */
export type RelatedLink = { href: string; label: string };

const L = {
  paket: { href: "/paket-karsilastir", label: "Ev interneti paketlerini karşılaştır" },
  mobil: { href: "/mobil-tarifeler", label: "Mobil tarifeleri karşılaştır" },
  hiz: { href: "/hiz-testi", label: "Ücretsiz internet hız testi" },
  fiber: { href: "/internet/fiber", label: "Fiber internet paketleri" },
  kablosuz: { href: "/internet/kablosuz", label: "Kablosuz (altyapısız) internet" },
  taahhutsuz: { href: "/internet/taahhutsuz", label: "Taahhütsüz internet paketleri" },
  ucuz: { href: "/internet/en-ucuz", label: "En ucuz ev interneti" },
  mbps100: { href: "/internet/100-mbps", label: "100 Mbps internet paketleri" },
  faturali: { href: "/mobil-tarifeler/faturali", label: "Faturalı hat tarifeleri" },
} satisfies Record<string, RelatedLink>;

const BY_SLUG: Record<string, RelatedLink[]> = {
  "fiber-mi-kablosuz-internet-mi": [L.fiber, L.kablosuz, L.hiz],
  "taahhutlu-mu-taahhutsuz-mu-internet": [L.taahhutsuz, L.paket, L.ucuz],
  "internet-hiz-testi-nasil-yapilir": [L.hiz, L.paket, L.mbps100],
  "numara-tasima-nasil-yapilir": [L.mobil, L.faturali],
  "kac-mbps-internet-yeterli": [L.mbps100, L.paket, L.hiz],
  "turkiyede-5g-nasil-kullanilir": [L.mobil, L.faturali, L.kablosuz],
  "wifi-hizi-nasil-artirilir": [L.hiz, L.fiber, L.paket],
  "internet-faturasi-nasil-dusurulur": [L.ucuz, L.taahhutsuz, L.paket],
  "altyapi-sorgulama-nasil-yapilir": [L.fiber, L.kablosuz, L.paket],
  "cayma-bedeli-nedir-nasil-hesaplanir": [L.taahhutsuz, L.paket, L.mobil],
  "ping-nasil-dusurulur": [L.hiz, L.fiber, L.paket],
  "tasinirken-internet-nakil-mi-yeni-abonelik-mi": [L.kablosuz, L.taahhutsuz, L.paket],
  "modem-arayuzu-wifi-sifresi-degistirme": [L.hiz, L.paket],
};

const KEYWORDS: [RegExp, RelatedLink][] = [
  [/fiber/i, L.fiber],
  [/kablosuz|altyap|superbox|5g/i, L.kablosuz],
  [/taahh|cayma/i, L.taahhutsuz],
  [/hız|hiz|ping|mbps|wi-?fi/i, L.hiz],
  [/mobil|hat|tarife|numara|gb/i, L.mobil],
  [/ucuz|fatura|zam/i, L.ucuz],
];

export function relatedFor(slug: string, title: string): RelatedLink[] {
  if (BY_SLUG[slug]) return BY_SLUG[slug];
  const out: RelatedLink[] = [];
  for (const [re, link] of KEYWORDS) if (re.test(title) && !out.includes(link)) out.push(link);
  if (!out.includes(L.paket)) out.push(L.paket);
  return out.slice(0, 3);
}
