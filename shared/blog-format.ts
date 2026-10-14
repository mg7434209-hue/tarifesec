/**
 * Rehber yazısı biçimi — küçük, GÜVENLİ bir işaretleme alt kümesi.
 *
 * Yazılar düz metin olarak saklanır; şu kurallar tanınır:
 *   ## Başlık          → h2
 *   ### Alt başlık     → h3
 *   - madde            → liste (ardışık satırlar tek liste)
 *   [metin](/yol)      → SİTE İÇİ bağlantı (yalnız "/" ile başlayan yollar)
 *   boş satır          → paragraf ayırıcı
 *
 * HTML yorumlanmaz: sunucu her parçayı kaçışlar, istemci React düğümü kurar
 * (dangerouslySetInnerHTML YOK). Dış bağlantı yazılamaz — rehber yazısından
 * izinsiz dış bağlantı / gizli reklam sızmasın.
 *
 * Eski yazılar (işaretleme içermeyen) aynen paragraf olarak görünür.
 */

export type Inline = { text: string } | { text: string; href: string };

export type Block =
  | { type: "h2" | "h3"; text: string; id: string }
  | { type: "p"; parts: Inline[] }
  | { type: "ul"; items: Inline[][] };

const LINK_RE = /\[([^\]\n]{1,120})\]\((\/[A-Za-z0-9\-_/#?=&%.]{0,200})\)/g;

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of src.matchAll(LINK_RE)) {
    const i = m.index ?? 0;
    // "//alan.adi" protokolsüz dış bağlantıdır — reddet, metin olarak bırak
    if (m[2].startsWith("//")) continue;
    if (i > last) out.push({ text: src.slice(last, i) });
    out.push({ text: m[1], href: m[2] });
    last = i + m[0].length;
  }
  if (last < src.length) out.push({ text: src.slice(last) });
  return out;
}

/** Türkçe karakterleri sadeleştirip başlıktan çapa (id) üretir */
export function slugify(s: string): string {
  const map: Record<string, string> = { ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u" };
  return s
    .toLocaleLowerCase("tr")
    .replace(/[çğıİöşü]/g, (c) => map[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function parsePost(content: string): Block[] {
  const blocks: Block[] = [];
  const used = new Set<string>();
  const uniq = (base: string) => {
    let id = base || "bolum";
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    return id;
  };

  for (const chunk of content.replace(/\r\n/g, "\n").split(/\n{2,}/)) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    let para: string[] = [];
    let list: string[] = [];
    const flushPara = () => {
      if (para.length) blocks.push({ type: "p", parts: parseInline(para.join(" ")) });
      para = [];
    };
    const flushList = () => {
      if (list.length) blocks.push({ type: "ul", items: list.map(parseInline) });
      list = [];
    };

    for (const line of lines) {
      const h = /^(#{2,3})\s+(.+)$/.exec(line);
      if (h) {
        flushPara();
        flushList();
        const text = h[2].trim();
        blocks.push({ type: h[1].length === 2 ? "h2" : "h3", text, id: uniq(slugify(text)) });
      } else if (/^[-•]\s+/.test(line)) {
        flushPara();
        list.push(line.replace(/^[-•]\s+/, ""));
      } else {
        flushList();
        para.push(line);
      }
    }
    flushPara();
    flushList();
  }
  return blocks;
}

/** Düz metin (meta açıklama, llms.txt, okuma süresi için) */
export function plainText(content: string): string {
  return content
    .replace(LINK_RE, "$1")
    .replace(/^#{2,3}\s+/gm, "")
    .replace(/^[-•]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Ortalama 200 kelime/dk */
export const readingMinutes = (content: string) =>
  Math.max(1, Math.round(plainText(content).split(" ").length / 200));
