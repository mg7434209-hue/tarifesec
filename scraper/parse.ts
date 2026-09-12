/**
 * Operatör sayfalarından yapılandırılmış paket kaydı çıkarımı.
 *
 * TASARIM KURALI — konuma göre eşleştirme YOK.
 * Eski sürüm `prices[i]` ile `dbPackages[i]`'yi eşleştiriyordu; sayfaya bir
 * kampanya kutusu eklendiğinde tüm fiyatlar kayıyor ve yanlış fiyat emin
 * biçimde yayınlanıyordu. Artık her kayıt kendi HIZ bilgisini taşır ve
 * veritabanı satırıyla hız üzerinden eşleşir. Hız okunamıyorsa kayıt atılır.
 */

export type ScrapedPackage = {
  /** Mbps — veritabanı eşleşmesinin anahtarı */
  speed: number;
  /** Aylık ₺ */
  price: number;
  /** Ham metin — günlük/hata ayıklama için */
  raw?: string;
};

const MIN_PRICE = 100;
const MAX_PRICE = 10_000;
const MIN_SPEED = 1;
const MAX_SPEED = 10_000;

const toInt = (s: string) => parseInt(s.replace(/[^\d]/g, ""), 10);

const plausible = (r: ScrapedPackage) =>
  Number.isFinite(r.speed) && Number.isFinite(r.price) &&
  r.speed >= MIN_SPEED && r.speed <= MAX_SPEED &&
  r.price >= MIN_PRICE && r.price <= MAX_PRICE;

/** Aynı hız birden çok kez geçtiyse ve fiyatlar çelişiyorsa ikisini de at. */
function dedupe(records: ScrapedPackage[]): ScrapedPackage[] {
  const bySpeed = new Map<number, ScrapedPackage[]>();
  for (const r of records) {
    if (!bySpeed.has(r.speed)) bySpeed.set(r.speed, []);
    bySpeed.get(r.speed)!.push(r);
  }

  const out: ScrapedPackage[] = [];
  for (const [speed, list] of bySpeed) {
    const prices = [...new Set(list.map((l) => l.price))];
    if (prices.length === 1) out.push({ speed, price: prices[0], raw: list[0].raw });
    // çelişkili fiyat → belirsiz, atla
  }
  return out;
}

/**
 * Hız ve fiyatı AYNI metin bloğu içinde arayan genel çıkarıcı.
 *
 * Sayfa yapıları değiştiği için tek bir seçiciye bağlanmak yerine, "…Mbps…"
 * ve "…TL/₺…" ifadelerinin birbirine yakın geçtiği pencereleri tarar.
 * Yakınlık penceresi dar tutulur; aksi hâlde alakasız sayılar eşleşir.
 */
export function extractByProximity(html: string, windowChars = 400): ScrapedPackage[] {
  // Etiketleri boşluğa çevir, metni sadeleştir
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ");

  const speedRe = /(\d{1,4})\s*(?:mbps|mbit|mb\/s)/gi;
  const records: ScrapedPackage[] = [];

  for (const m of text.matchAll(speedRe)) {
    const speed = toInt(m[1]);
    const start = m.index ?? 0;
    const slice = text.slice(start, start + windowChars);

    // Penceredeki ilk makul fiyat
    const priceMatch = [...slice.matchAll(/(\d{2,3}(?:[.,]\d{3})*|\d{3,5})\s*(?:TL|₺)/gi)]
      .map((p) => toInt(p[1]))
      .find((p) => p >= MIN_PRICE && p <= MAX_PRICE);

    if (priceMatch !== undefined) {
      records.push({ speed, price: priceMatch, raw: slice.slice(0, 120).trim() });
    }
  }

  return dedupe(records.filter(plausible));
}

/**
 * Yapılandırılmış veri çıkarıcı — sayfa JSON-LD veya data-* öznitelikleri
 * taşıyorsa bu çok daha güvenilirdir; önce bu denenir.
 */
export function extractFromJsonLd(html: string): ScrapedPackage[] {
  const records: ScrapedPackage[] = [];
  const blocks = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];

  for (const b of blocks) {
    let data: unknown;
    try {
      data = JSON.parse(b[1].trim());
    } catch {
      continue;
    }

    const walk = (node: any): void => {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) return node.forEach(walk);

      const price = Number(
        node?.offers?.price ?? node?.offers?.lowPrice ?? node?.price
      );
      const nameish = `${node?.name ?? ""} ${node?.description ?? ""}`;
      const speedMatch = nameish.match(/(\d{1,4})\s*(?:mbps|mbit)/i);

      if (Number.isFinite(price) && speedMatch) {
        records.push({ speed: toInt(speedMatch[1]), price: Math.round(price), raw: nameish.slice(0, 120) });
      }

      for (const v of Object.values(node)) walk(v);
    };

    walk(data);
  }

  return dedupe(records.filter(plausible));
}

/** Önce JSON-LD, boşsa yakınlık taraması. */
export function extractPackages(html: string): ScrapedPackage[] {
  const structured = extractFromJsonLd(html);
  if (structured.length) return structured;
  return extractByProximity(html);
}
