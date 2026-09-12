/**
 * Sunucu tarafı SEO içeriği için veri katmanı.
 * Sonuçlar önbelleklenir; botlar DB'yi yormaz.
 */
import { db } from "../../drizzle/db";
import { packages, mobileTariffs, blogPosts } from "../../drizzle/schema";
import { eq, asc, desc } from "drizzle-orm";
import { memoize } from "./util";

const TTL = 5 * 60 * 1000;

export type Pkg = typeof packages.$inferSelect;
export type Mobile = typeof mobileTariffs.$inferSelect;
export type Post = typeof blogPosts.$inferSelect;

export const getPackages = memoize<Pkg[]>(async () => {
  try {
    return await db
      .select()
      .from(packages)
      .where(eq(packages.isActive, true))
      .orderBy(asc(packages.priceMonthly));
  } catch {
    return [];
  }
}, TTL);

export const getMobile = memoize<Mobile[]>(async () => {
  try {
    return await db
      .select()
      .from(mobileTariffs)
      .where(eq(mobileTariffs.isActive, true))
      .orderBy(asc(mobileTariffs.priceMonthly));
  } catch {
    return [];
  }
}, TTL);

export const getPosts = memoize<Post[]>(async () => {
  try {
    return await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true))
      .orderBy(desc(blogPosts.createdAt));
  } catch {
    return [];
  }
}, TTL);

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const [row] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return row ?? null;
  } catch {
    return null;
  }
}

/** Sayfa metinlerinde kullanılan özetler */
export function summarize(pkgs: Pkg[]) {
  if (!pkgs.length) return null;
  const prices = pkgs.map((p) => p.priceMonthly);
  const speeds = pkgs.map((p) => p.downloadSpeed);
  const operators = [...new Set(pkgs.map((p) => p.operator))];
  return {
    count: pkgs.length,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    maxSpeed: Math.max(...speeds),
    operators,
    cheapest: pkgs.reduce((a, b) => (a.priceMonthly <= b.priceMonthly ? a : b)),
  };
}

export function summarizeMobile(rows: Mobile[]) {
  if (!rows.length) return null;
  const prices = rows.map((r) => r.priceMonthly);
  return {
    count: rows.length,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    operators: [...new Set(rows.map((r) => r.operator))],
    cheapest: rows.reduce((a, b) => (a.priceMonthly <= b.priceMonthly ? a : b)),
  };
}
