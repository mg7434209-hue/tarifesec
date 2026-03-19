import { Router } from "express";
import { db } from "../../drizzle/db";
import { leads } from "../../drizzle/schema";
import { desc } from "drizzle-orm";

const router = Router();

// POST /api/leads  — Superonline bayi B9613 lead formu
router.post("/", async (req, res) => {
  try {
    const ALLOWED = ["name", "phone", "city", "packageInterest", "source"];
    const clean = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => ALLOWED.includes(k))
    );
    if (!clean.phone) return res.status(400).json({ error: "Telefon gerekli" });
    const result = await db.insert(leads).values(clean).returning();
    res.status(201).json({ success: true, id: result[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kaydedilemedi" });
  }
});

// GET /api/leads (admin)
router.get("/", async (_req, res) => {
  try {
    const result = await db
      .select()
      .from(leads)
      .orderBy(desc(leads.createdAt));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Hata" });
  }
});

export default router;
