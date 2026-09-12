/**
 * İlk kurulum uçları — yönetim şifresi belirlenirken kullanılır.
 * Şifre bir kez belirlendikten sonra bu uçlar kurulumu REDDEDER.
 */
import { Router } from "express";
import { needsSetup, setupPassword, changePassword } from "../adminAuth";
import { rateLimit } from "../middleware/rateLimit";
import { requireAdmin } from "../middleware/auth";

const router = Router();

/** Panel açılışta buraya sorar: kurulum gerekiyor mu? */
router.get("/state", async (_req, res) => {
  try {
    res.json({ needsSetup: await needsSetup() });
  } catch {
    res.json({ needsSetup: false });
  }
});

/** İlk şifreyi belirle (yalnızca hiç şifre yokken) */
router.post("/password", rateLimit({ windowMs: 10 * 60 * 1000, max: 10 }), async (req, res) => {
  const result = await setupPassword(req.body?.password);
  if (!result.ok) return res.status(400).json({ error: result.error });
  res.status(201).json({ success: true });
});

/** Şifre değiştir (giriş yapmış olmayı gerektirir) */
router.post("/change-password", requireAdmin, async (req, res) => {
  const result = await changePassword(req.body?.current, req.body?.next);
  if (!result.ok) return res.status(400).json({ error: result.error });
  res.json({ success: true });
});

export default router;
