/**
 * Bağımlılıksız, bellek içi hız sınırlayıcı.
 * Tek Railway replikası için yeterlidir; çoklu replikada Redis'e taşınmalı.
 */
import type { Request, Response, NextFunction } from "express";

type Bucket = { count: number; resetAt: number };

export function rateLimit(opts: { windowMs: number; max: number; message?: string }) {
  const hits = new Map<string, Bucket>();

  // Sızıntıyı önlemek için süresi dolan kayıtları periyodik temizle
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, b] of hits) if (b.resetAt <= now) hits.delete(key);
  }, opts.windowMs);
  timer.unref?.();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip =
      (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown";

    const now = Date.now();
    const bucket = hits.get(ip);

    if (!bucket || bucket.resetAt <= now) {
      hits.set(ip, { count: 1, resetAt: now + opts.windowMs });
      return next();
    }

    bucket.count++;
    if (bucket.count > opts.max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({
        error: opts.message ?? "Çok fazla istek gönderildi, lütfen biraz sonra tekrar deneyin.",
      });
    }

    next();
  };
}
