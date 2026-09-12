import { Router } from "express";
import { db } from "../../drizzle/db";
import { leads } from "../../drizzle/schema";
import { desc } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth";
import { rateLimit } from "../middleware/rateLimit";
import { config } from "../config";

const router = Router();

/** TR telefon: 05xxxxxxxxx / +905xxxxxxxxx / 905xxxxxxxxx → 05xxxxxxxxx */
function normalizePhone(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const d = raw.replace(/\D/g, "");
  if (/^0?5\d{9}$/.test(d)) return d.length === 10 ? "0" + d : d;
  if (/^905\d{9}$/.test(d)) return "0" + d.slice(2);
  return null;
}

// POST /api/leads — Teklif talep formu (herkese açık, hız sınırlı)
router.post("/", rateLimit(config.rateLimit.leads), async (req, res) => {
  try {
    const phone = normalizePhone(req.body?.phone);
    if (!phone) {
      return res.status(400).json({ error: "Geçerli bir telefon numarası girin (05XX XXX XX XX)" });
    }

    // Honeypot: gizli alan doluysa bot demektir — başarı döndür, kaydetme.
    if (typeof req.body?.website === "string" && req.body.website.trim() !== "") {
      return res.status(201).json({ success: true });
    }

    const str = (v: unknown, max: number) =>
      typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

    const result = await db
      .insert(leads)
      .values({
        phone,
        name: str(req.body?.name, 100),
        city: str(req.body?.city, 50),
        packageInterest: str(req.body?.packageInterest, 150),
        source: str(req.body?.source, 100) ?? "tarifesec",
      })
      .returning();

    res.status(201).json({ success: true, id: result[0].id });
  } catch (err) {
    console.error("[leads] kayıt hatası:", (err as Error).message);
    res.status(500).json({ error: "Kaydedilemedi" });
  }
});

// GET /api/leads — KİŞİSEL VERİ. Yalnızca admin.
// (Önceden auth yoktu: tüm müşteri ad/telefon/şehir bilgisi herkese açıktı.)
router.get("/", requireAdmin, async (_req, res) => {
  try {
    const result = await db.select().from(leads).orderBy(desc(leads.createdAt));
    res.json(result);
  } catch {
    res.status(500).json({ error: "Hata" });
  }
});

export default router;
