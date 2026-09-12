/**
 * Admin auth — x-admin-secret başlığı ile.
 *
 * Şifre kaynağı: ADMIN_SECRET ortam değişkeni > veritabanı (bkz. adminAuth.ts).
 * Hiç şifre yoksa uçlar 503 döner ve panel kurulum ekranını gösterir.
 *
 * FAIL-CLOSED: eski sürümde `token !== process.env.ADMIN_SECRET` karşılaştırması,
 * ADMIN_SECRET tanımsızken başlıksız isteği `undefined === undefined` ile
 * geçiriyordu — tüm admin API'si açıktı.
 *
 * Secret YALNIZCA başlıkta kabul edilir; `?secret=` sorgu parametresi sunucu
 * loglarına ve Referer başlığına sızdığı için desteklenmez.
 */
import type { Request, Response, NextFunction } from "express";
import { verify, needsSetup } from "../adminAuth";

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    if (await needsSetup()) {
      return res.status(503).json({
        error: "Yönetim şifresi henüz belirlenmedi",
        needsSetup: true,
      });
    }

    const header = req.headers["x-admin-secret"];
    const token = Array.isArray(header) ? header[0] : header;

    if (!(await verify(token))) {
      return res.status(401).json({ error: "Yetkisiz" });
    }

    next();
  } catch (err) {
    console.error("[auth] doğrulama hatası:", (err as Error).message);
    res.status(503).json({ error: "Kimlik doğrulama kullanılamıyor" });
  }
}
