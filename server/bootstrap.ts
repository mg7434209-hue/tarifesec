/**
 * Açılış kurulumu — dağıtımda ELLE KOMUT ÇALIŞTIRMAYI ortadan kaldırır.
 *
 * 1. Veritabanı şemasını günceller (drizzle/migrations — idempotent)
 * 2. Tablolar boşsa başlangıç verisini yükler (paketler, tarifeler, yazılar)
 *
 * Var olan veriye DOKUNMAZ: doldurma yalnızca tablo tamamen boşken çalışır,
 * böylece elle düzenlenen fiyatlar her dağıtımda geri alınmaz.
 *
 * Hata durumunda süreç ÇÖKMEZ — site veritabanısız da ayakta kalır, sorun
 * günlüklere yazılır.
 */
import path from "path";
import fs from "fs";
import { sql } from "drizzle-orm";
import { db } from "../drizzle/db";
import { packages, mobileTariffs, blogPosts } from "../drizzle/schema";
import { SEED_PACKAGES, SEED_MOBILE } from "../drizzle/seed-data";
import { SEED_POSTS } from "../drizzle/seed-posts";

async function countRows(table: any): Promise<number> {
  const [row] = await db.select({ n: sql<number>`count(*)` }).from(table);
  return Number(row?.n ?? 0);
}

async function migrate() {
  // Derlenmiş sunucu dist/ içinden çalışır; migration SQL'leri depo kökünde
  const candidates = [
    path.join(process.cwd(), "drizzle", "migrations"),
    path.join(process.cwd(), "..", "drizzle", "migrations"),
  ];
  const folder = candidates.find((c) => fs.existsSync(c));

  if (!folder) {
    console.warn("[bootstrap] migration klasörü bulunamadı — şema güncellemesi atlandı");
    return;
  }

  const { migrate: run } = await import("drizzle-orm/node-postgres/migrator");
  await run(db, { migrationsFolder: folder });
  console.log("[bootstrap] veritabanı şeması güncel");
}

async function seedIfEmpty() {
  const [pkgCount, mobCount, postCount] = await Promise.all([
    countRows(packages),
    countRows(mobileTariffs),
    countRows(blogPosts),
  ]);

  if (pkgCount === 0) {
    await db.insert(packages).values(SEED_PACKAGES);
    console.log(`[bootstrap] ${SEED_PACKAGES.length} ev interneti paketi yüklendi`);
  }

  if (mobCount === 0) {
    await db.insert(mobileTariffs).values(SEED_MOBILE);
    console.log(`[bootstrap] ${SEED_MOBILE.length} mobil tarife yüklendi`);
  }

  if (postCount === 0) {
    await db
      .insert(blogPosts)
      .values(SEED_POSTS.map((p) => ({ ...p, isPublished: true, author: "tarifesec.net.tr" })));
    console.log(`[bootstrap] ${SEED_POSTS.length} rehber yazısı yüklendi`);
  }

  if (pkgCount && mobCount && postCount) {
    console.log("[bootstrap] veri mevcut — doldurma atlandı");
  }
}

export async function bootstrap(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.warn("[bootstrap] DATABASE_URL yok — kurulum atlandı");
    return;
  }

  try {
    await migrate();
    await seedIfEmpty();
  } catch (err) {
    console.error("[bootstrap] kurulum hatası:", (err as Error).message);
    console.error("[bootstrap] site çalışmaya devam ediyor; veritabanını kontrol edin.");
  }
}
