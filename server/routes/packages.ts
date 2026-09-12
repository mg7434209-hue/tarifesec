import { Router } from "express";
import { db } from "../../drizzle/db";
import { packages } from "../../drizzle/schema";
import { eq, and, gte, asc, desc } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth";

const router = Router();

// GET /api/packages?operator=superonline&type=fiber&minSpeed=100&sort=price_asc
router.get("/", async (req, res) => {
  try {
    const { operator, type, minSpeed, sort } = req.query;

    const conditions = [eq(packages.isActive, true)];
    if (operator) conditions.push(eq(packages.operatorSlug, operator as string));
    if (type) conditions.push(eq(packages.type, type as string));
    if (minSpeed) conditions.push(gte(packages.downloadSpeed, Number(minSpeed)));

    const orderBy =
      sort === "price_desc"
        ? desc(packages.priceMonthly)
        : sort === "speed_desc"
        ? desc(packages.downloadSpeed)
        : asc(packages.priceMonthly); // default: ucuzdan pahalıya

    const result = await db
      .select()
      .from(packages)
      .where(and(...conditions))
      .orderBy(desc(packages.isFeatured), orderBy);

    res.json({ data: result, total: result.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Paketler yüklenemedi" });
  }
});

// GET /api/packages/:id
router.get("/:id", async (req, res) => {
  try {
    const result = await db
      .select()
      .from(packages)
      .where(eq(packages.id, Number(req.params.id)));
    if (!result.length) return res.status(404).json({ error: "Bulunamadı" });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "Hata" });
  }
});

// POST /api/packages (admin)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const ALLOWED = [
      "operator","operatorSlug","type","name","downloadSpeed","uploadSpeed",
      "priceMonthly","priceNoCommitment","commitmentMonths","dataLimit",
      "modemIncluded","installationFee","features","isFeatured",
      "affiliateUrl","officialUrl","isActive","sortOrder"
    ];
    const clean: any = Object.fromEntries(
      Object.entries(req.body ?? {}).filter(([k]) => ALLOWED.includes(k))
    );
    if (!clean.operator || !clean.name || clean.priceMonthly == null) {
      return res.status(400).json({ error: "operator, name ve priceMonthly zorunlu" });
    }
    const result = await db.insert(packages).values(clean).returning();
    res.status(201).json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Eklenemedi" });
  }
});

// PUT /api/packages/:id (admin)
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const ALLOWED = [
      "name","priceMonthly","priceNoCommitment","downloadSpeed","uploadSpeed",
      "commitmentMonths","features","isFeatured","affiliateUrl","isActive","sortOrder"
    ];
    const clean: any = Object.fromEntries(
      Object.entries(req.body ?? {}).filter(([k]) => ALLOWED.includes(k))
    );
    clean.updatedAt = new Date();
    const result = await db
      .update(packages)
      .set(clean)
      .where(eq(packages.id, Number(req.params.id)))
      .returning();
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "Güncellenemedi" });
  }
});

export default router;
