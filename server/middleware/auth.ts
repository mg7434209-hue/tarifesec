/**
 * Admin auth — x-admin-secret başlığı ile.
 *
 * FAIL-CLOSED: ADMIN_SECRET tanımlı değilse hiçbir istek geçmez.
 * (Eski sürümde `token !== process.env.ADMIN_SECRET` karşılaştırması,
 *  ADMIN_SECRET tanımsızken başlıksız isteği `undefined === undefined`
 *  ile geçiriyordu — tüm admin API'si açıktı.)
 *
 * Secret YALNIZCA başlıkta kabul edilir; `?secret=` sorgu parametresi
 * sunucu loglarına ve Referer başlığına sızdığı için desteklenmez.
 */
import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.ADMIN_SECRET;

  if (!secret || secret.length < 8) {
    console.error("[auth] ADMIN_SECRET tanımlı değil — admin uçları kapalı.");
    return res.status(503).json({ error: "Admin API yapılandırılmamış" });
  }

  const header = req.headers["x-admin-secret"];
  const token = Array.isArray(header) ? header[0] : header;

  if (typeof token !== "string" || !safeEqual(token, secret)) {
    return res.status(401).json({ error: "Yetkisiz" });
  }

  next();
}
