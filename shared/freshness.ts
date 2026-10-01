/**
 * Fiyatın GERÇEKTEN ne zaman kontrol edildiği — sunucu ve istemci aynı kural.
 *
 * - Otomatik tarama tarihi varsa o.
 * - Yoksa satır oluşturulduktan SONRA güncellenmişse (admin düzeltmesi ya da
 *   drizzle/data-updates.ts) güncelleme tarihi.
 * - Hiç dokunulmamış başlangıç verisi → null: "doğrulanmayı bekliyor".
 *   Kurulum tarihini "son kontrol" diye göstermek yanıltıcı olurdu.
 */
type Row = {
  lastScrapedAt?: Date | string | null;
  updatedAt?: Date | string | null;
  createdAt?: Date | string | null;
};

export function checkedAt(r: Row): Date | null {
  if (r.lastScrapedAt) return new Date(r.lastScrapedAt);
  const up = r.updatedAt ? new Date(r.updatedAt).getTime() : 0;
  const cr = r.createdAt ? new Date(r.createdAt).getTime() : 0;
  // Ekleme ile aynı işlemde yazılan zaman damgaları milisaniye farkı taşıyabilir
  return up && up - cr > 60_000 ? new Date(up) : null;
}

export const UNVERIFIED_TEXT = "Fiyat henüz doğrulanmadı — başvuru öncesi operatör sitesinden kontrol edin";

export function checkedLabel(r: Row): string {
  const d = checkedAt(r);
  return d ? `Son kontrol: ${d.toLocaleDateString("tr-TR")}` : UNVERIFIED_TEXT;
}
