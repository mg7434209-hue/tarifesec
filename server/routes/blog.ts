import { Router } from "express";
import { db } from "../../drizzle/db";
import { blogPosts } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const result = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true))
      .orderBy(desc(blogPosts.createdAt));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Hata" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const result = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, req.params.slug));
    if (!result.length) return res.status(404).json({ error: "Bulunamadı" });
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: "Hata" });
  }
});

export default router;
