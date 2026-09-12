/**
 * Taranan kayıtları veritabanı satırlarıyla eşleştirme.
 *
 * TEMEL İLKE: emin değilsen DOKUNMA.
 * Yanlış fiyat yayınlamak, fiyatı güncellememekten çok daha kötüdür —
 * kullanıcı yanlış bilgiyle operatöre başvurur ve sitenin güveni biter.
 */
import type { ScrapedPackage } from "./parse";

export type DbRow = { id: number; downloadSpeed: number; priceMonthly: number; name: string };

export type MatchResult =
  | { kind: "update"; id: number; oldPrice: number; newPrice: number }
  | { kind: "unchanged"; id: number }
  | { kind: "skipped"; id?: number; reason: string; detail?: string };

/**
 * Otomatik kabul edilen azami fiyat sapması.
 * Üzerindeki değişiklik yayınlanmaz; elle onaya düşer.
 */
export const MAX_DRIFT = 0.4;

export function matchAndPlan(scraped: ScrapedPackage[], rows: DbRow[]): MatchResult[] {
  const results: MatchResult[] = [];

  for (const rec of scraped) {
    // Hıza göre aday satırlar
    const candidates = rows.filter((r) => r.downloadSpeed === rec.speed);

    if (candidates.length === 0) {
      results.push({
        kind: "skipped",
        reason: "eşleşen paket yok",
        detail: `${rec.speed} Mbps / ${rec.price} ₺`,
      });
      continue;
    }

    if (candidates.length > 1) {
      // Aynı hızda birden fazla paket (ör. fiber + kablosuz) → belirsiz.
      results.push({
        kind: "skipped",
        reason: "birden fazla paket aynı hızda — belirsiz",
        detail: `${rec.speed} Mbps → ${candidates.map((c) => c.name).join(", ")}`,
      });
      continue;
    }

    const row = candidates[0];

    if (row.priceMonthly === rec.price) {
      results.push({ kind: "unchanged", id: row.id });
      continue;
    }

    const drift = Math.abs(rec.price - row.priceMonthly) / row.priceMonthly;
    if (drift > MAX_DRIFT) {
      results.push({
        kind: "skipped",
        id: row.id,
        reason: `sapma %${Math.round(drift * 100)} — elle onay gerekiyor`,
        detail: `${row.name}: ${row.priceMonthly} ₺ → ${rec.price} ₺`,
      });
      continue;
    }

    results.push({
      kind: "update",
      id: row.id,
      oldPrice: row.priceMonthly,
      newPrice: rec.price,
    });
  }

  return results;
}

/**
 * Toplu güvenlik kontrolü: tarama sonucu şüpheli görünüyorsa TÜM turu iptal et.
 * Sayfa yapısı bozulduğunda tek tek makul görünen ama topluca saçma olan
 * sonuçlar üretilebilir.
 */
export function sanityCheck(
  scraped: ScrapedPackage[],
  rows: DbRow[]
): { ok: true } | { ok: false; reason: string } {
  if (scraped.length === 0) {
    return { ok: false, reason: "hiç kayıt çıkarılamadı — sayfa yapısı değişmiş olabilir" };
  }

  // Veritabanındaki paketlerin yarısından fazlası eşleşmiyorsa güvenme
  const matched = scraped.filter((s) => rows.some((r) => r.downloadSpeed === s.speed)).length;
  if (rows.length > 0 && matched === 0) {
    return { ok: false, reason: "hiçbir kayıt mevcut paketlerle eşleşmedi" };
  }

  return { ok: true };
}
