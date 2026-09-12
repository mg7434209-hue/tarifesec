/** HTML kaçışı — DB'den gelen metin şablona güvenle gömülür. */
export function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** JSON-LD gömme: </script> kaçışı ve U+2028/29 temizliği. */
export function jsonLdScript(data: unknown): string {
  const json = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  return `<script type="application/ld+json">${json}</script>`;
}

export const tl = (n: number) => `${Number(n).toLocaleString("tr-TR")} ₺`;

/** Basit bellek içi önbellek — tarayıcı botları DB'yi yormasın. */
export function memoize<T>(fn: () => Promise<T>, ttlMs: number) {
  let value: T | null = null;
  let expires = 0;
  let inflight: Promise<T> | null = null;

  return async (): Promise<T> => {
    const now = Date.now();
    if (value !== null && now < expires) return value;
    if (inflight) return inflight;

    inflight = fn()
      .then((v) => {
        value = v;
        expires = Date.now() + ttlMs;
        return v;
      })
      .finally(() => {
        inflight = null;
      });

    return inflight;
  };
}

/**
 * Ürün tam adı. Paket adı zaten operatör adıyla başlıyorsa tekrar etmez
 * ("TurkNet" + "TurkNet 100 Mbps" → "TurkNet 100 Mbps").
 */
export function fullName(operator: string, name: string): string {
  const op = operator.trim();
  const nm = name.trim();
  return nm.toLocaleLowerCase("tr").startsWith(op.toLocaleLowerCase("tr")) ? nm : `${op} ${nm}`;
}
