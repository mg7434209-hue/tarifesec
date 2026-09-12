/**
 * Taranacak kaynaklar — BİLDİRİMSEL yapılandırma.
 * Yeni operatör eklemek için koda değil, bu listeye satır eklenir.
 *
 * NOT: Turkcell ve Vodafone güçlü bot korumasına sahiptir; otomatik tarama
 * güvenilir çalışmaz. Bunlar `manual: true` ile işaretlenir ve admin
 * panelinden elle güncellenir (bkz. /admin).
 */
export type Source = {
  operatorSlug: string;
  label: string;
  /** Sırayla denenir; ilki başarısız olursa diğerine geçilir. */
  urls: string[];
  /** true → otomatik taranmaz, admin panelinde "elle güncelle" olarak görünür */
  manual?: boolean;
};

export const SOURCES: Source[] = [
  {
    operatorSlug: "superonline",
    label: "Superonline",
    urls: [
      "https://www.superonline.net/bireysel/internet/fiber-internet-paketleri",
      "https://www.superonline.net/fiber-internet",
    ],
  },
  {
    operatorSlug: "turknet",
    label: "TurkNet",
    urls: [
      "https://www.turknet.net.tr/internet-paketleri",
      "https://www.turknet.net.tr/",
    ],
  },
  {
    operatorSlug: "turk-telekom",
    label: "Türk Telekom",
    urls: [
      "https://www.turktelekom.com.tr/ev-interneti/fiber-internet",
      "https://www.turktelekom.com.tr/ev-interneti/kampanyalar",
    ],
  },
  { operatorSlug: "turkcell", label: "Turkcell", urls: [], manual: true },
  { operatorSlug: "vodafone", label: "Vodafone", urls: [], manual: true },
];

export const USER_AGENT =
  "Mozilla/5.0 (compatible; TarifeSecBot/1.0; +https://www.tarifesec.net.tr/robots.txt)";

/** Tek bir isteğin azami süresi */
export const FETCH_TIMEOUT_MS = 20_000;
