import { Router } from "express";
import { db } from "../../drizzle/db";
import { mobileTariffs } from "../../drizzle/schema";
import { eq, and, asc, desc } from "drizzle-orm";

const router = Router();

// GET /api/mobile?operator=turkcell&isContract=true&sort=price_asc
router.get("/", async (req, res) => {
  try {
    const { operator, isContract, sort } = req.query;

    const conditions = [eq(mobileTariffs.isActive, true)];
    if (operator) conditions.push(eq(mobileTariffs.operatorSlug, operator as string));
    if (isContract !== undefined)
      conditions.push(eq(mobileTariffs.isContract, isContract === "true"));

    const orderBy =
      sort === "price_desc"
        ? desc(mobileTariffs.priceMonthly)
        : asc(mobileTariffs.priceMonthly);

    const result = await db
      .select()
      .from(mobileTariffs)
      .where(and(...conditions))
      .orderBy(desc(mobileTariffs.isFeatured), orderBy);

    res.json({ data: result, total: result.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Tarifeler yüklenemedi" });
  }
});

// PUT /api/mobile/:id (admin)
router.put("/:id", async (req, res) => {
  try {
    const ALLOWED = [
      "name","priceMonthly","pricePrePaid","gbLimit","minuteLimit",
      "features","isFeatured","affiliateUrl","isActive","sortOrder"
    ];
    const clean = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => ALLOWED.includes(k))
    );
    clean.updatedAt = new Date();
    const result = await db
      .update(mobileTariffs)
      .set(clean)
      .where(eq(mobileTariffs.id, Number(req.params.id)))
      .returning();
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "Güncellenemedi" });
  }
});

export default router;
