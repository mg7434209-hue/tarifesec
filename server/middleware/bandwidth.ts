/**
 * Bant genişliği bütçesi — hız testi uçları için.
 *
 * NEDEN İSTEK SAYISI DEĞİL: hız testi 4 paralel akışla çalışır ve hızlı bir
 * hatta saniyeler içinde yüzlerce parça ister. İstek sayısına dayalı sınır,
 * hattı hızlı olan kullanıcıyı cezalandırır — test yarıda 429 alır. Doğru
 * ölçüt aktarılan BAYTTIR: yavaş da olsa hızlı da olsa bir test aynı hacmi
 * tüketir, kötüye kullanım ise hacimle ayrışır.
 */
import type { Request, Response, NextFunction } from "express";

type Budget = { used: number; resetAt: number };

export function bandwidthLimit(opts: { windowMs: number; maxBytes: number }) {
  const budgets = new Map<string, Budget>();

  const timer = setInterval(() => {
    const now = Date.now();
    for (const [k, b] of budgets) if (b.resetAt <= now) budgets.delete(k);
  }, opts.windowMs);
  timer.unref?.();

  const keyOf = (req: Request) =>
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";

  return {
    /** İstek öncesi bütçe kontrolü */
    guard(req: Request, res: Response, next: NextFunction) {
      const key = keyOf(req);
      const now = Date.now();
      let b = budgets.get(key);

      if (!b || b.resetAt <= now) {
        b = { used: 0, resetAt: now + opts.windowMs };
        budgets.set(key, b);
      }

      if (b.used >= opts.maxBytes) {
        const retry = Math.ceil((b.resetAt - now) / 1000);
        res.setHeader("Retry-After", String(retry));
        return res.status(429).json({
          error: "Hız testi kotanız doldu, birkaç dakika sonra tekrar deneyin.",
        });
      }

      next();
    },

    /** Aktarılan baytı düş */
    charge(req: Request, bytes: number) {
      const key = keyOf(req);
      const b = budgets.get(key);
      if (b) b.used += bytes;
    },
  };
}
