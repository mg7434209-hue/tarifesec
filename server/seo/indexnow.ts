/**
 * IndexNow — Bing, Yandex, Seznam, Naver'e "bu sayfalar değişti" bildirimi.
 *
 * Bing dizini ChatGPT ve Copilot aramasını da besler; fiyat güncellemesi veya
 * yeni rehber yazısı haftalar yerine dakikalar içinde taranır. Google IndexNow
 * kullanmaz (onun için sitemap.xml + Search Console).
 *
 * Kurulum: Railway → Variables → INDEXNOW_KEY = 8–128 karakter harf/rakam
 * (ör. `openssl rand -hex 16`). Anahtar dosyası /<anahtar>.txt adresinde
 * otomatik yayımlanır. Anahtar tanımlı değilse hiçbir şey gönderilmez.
 *
 * Bildirim yalnız KANONİK alan adından gönderilir; *.up.railway.app veya yerel
 * ortamdan gönderilen bildirim, anahtar dosyası orada doğrulanamayacağı için
 * IndexNow tarafından reddedilir (ve bir süre önbelleğe alınır).
 */
import { SITE } from "./meta";

export const indexNowKey = (): string | null => {
  const k = (process.env.INDEXNOW_KEY ?? "").trim();
  return /^[A-Za-z0-9-]{8,128}$/.test(k) ? k : null;
};

export type IndexNowResult = { sent: number; status: number | null; error?: string };

export async function pingIndexNow(urls: string[]): Promise<IndexNowResult> {
  const key = indexNowKey();
  if (!key) return { sent: 0, status: null, error: "INDEXNOW_KEY tanımlı değil" };
  if (process.env.NODE_ENV === "development") return { sent: 0, status: null, error: "geliştirme ortamı" };

  const host = new URL(SITE).host;
  const list = [...new Set(urls)].filter((u) => u.startsWith(SITE)).slice(0, 10_000);
  if (!list.length) return { sent: 0, status: null };

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key, keyLocation: `${SITE}/${key}.txt`, urlList: list }),
      signal: AbortSignal.timeout(15_000),
    });
    // 200 = kabul, 202 = alındı (anahtar doğrulaması sürüyor)
    console.log(`[indexnow] ${list.length} adres bildirildi — HTTP ${res.status}`);
    return { sent: list.length, status: res.status };
  } catch (err) {
    console.warn("[indexnow] bildirim gönderilemedi:", (err as Error).message);
    return { sent: 0, status: null, error: (err as Error).message };
  }
}
