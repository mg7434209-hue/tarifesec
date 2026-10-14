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
import { db } from "../drizzle/db";
import { and, eq, sql } from "drizzle-orm";
import { packages, mobileTariffs, blogPosts, settings } from "../drizzle/schema";
import { DATA_UPDATES } from "../drizzle/data-updates";
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

/**
 * Yeni rehber yazıları — tablo doluyken de eklenir (slug yoksa). Var olan
 * yazıya dokunulmaz; admin'in düzenlemesi korunur.
 */
async function addMissingPosts() {
  const existing = new Set((await db.select({ slug: blogPosts.slug }).from(blogPosts)).map((r) => r.slug));
  const missing = SEED_POSTS.filter((p) => !existing.has(p.slug));
  if (!missing.length) return;
  await db
    .insert(blogPosts)
    .values(missing.map((p) => ({ ...p, isPublished: true, author: "tarifesec.net.tr" })));
  console.log(`[bootstrap] ${missing.length} yeni rehber yazısı eklendi`);
}

/** Listede bu kayıttan SONRA aynı satırı hedefleyen bir güncelleme var mı? */
function supersededLater(u: (typeof DATA_UPDATES)[number]): boolean {
  const i = DATA_UPDATES.indexOf(u);
  return DATA_UPDATES.slice(i + 1).some(
    (v) => v.table === u.table && v.match.operatorSlug === u.match.operatorSlug && v.match.name === u.match.name
  );
}

/** drizzle/data-updates.ts — kaynaklı fiyat düzeltmeleri, her biri bir kez */
async function applyDataUpdates() {
  const KEY = "data_updates_applied";
  const [row] = await db.select().from(settings).where(eq(settings.key, KEY));
  const done = new Set<string>(row ? JSON.parse(row.value) : []);

  for (const u of DATA_UPDATES) {
    if (done.has(u.id)) continue;
    const table = u.table === "packages" ? packages : mobileTariffs;
    const where = and(eq(table.operatorSlug, u.match.operatorSlug), eq(table.name, u.match.name));
    const rows = await db.select().from(table).where(where);
    const target = u.set.priceMonthly ?? u.expectPrice;

    if (rows.length === 1 && rows[0].priceMonthly === u.expectPrice) {
      const { features, ...rest } = u.set as typeof u.set & { features?: string[] };
      const changed = !u.replaces && target !== u.expectPrice;
      await db
        .update(table)
        .set({
          ...rest,
          ...(features ? { features: JSON.stringify(features) } : {}),
          // Aynı ürünün fiyatı değiştiyse rozet + üstü çizili eski fiyat;
          // başka ürüne geçildiyse (replaces) kıyas gösterilmez.
          previousPrice: changed ? u.expectPrice : null,
          priceChanged: changed,
          priceChangeDirection: changed ? (target > u.expectPrice ? "up" : "down") : "none",
          updatedAt: new Date(),
        } as any)
        .where(eq(table.id, rows[0].id));
      console.log(`[bootstrap] veri güncellemesi uygulandı: ${u.id}`);
    } else if (rows.length === 1 && rows[0].priceMonthly === target && u.set.isActive !== false) {
      // Zaten güncel (yeni kurulum güncel başlangıç verisiyle açıldı)
    } else if (rows.length === 0 && (u.set.isActive === false || u.replaces)) {
      // Yeni kurulumda eski satır hiç yok — yapılacak bir şey yok
    } else if (supersededLater(u)) {
      // Aynı satır için daha yeni bir güncelleme var (yeni kurulum güncel
      // başlangıç verisiyle açıldı) — bu eski kayıt geçersiz, uyarı gereksiz
    } else {
      // Fiyat elle/taramayla değişmiş ya da satır bulunamadı — dokunma
      console.warn(
        `[bootstrap] veri güncellemesi atlandı (${u.id}): ${rows.length} satır, ` +
          `mevcut fiyat ${rows[0]?.priceMonthly ?? "-"}, beklenen ${u.expectPrice}`
      );
    }
    done.add(u.id);
  }

  const value = JSON.stringify([...done]);
  await db
    .insert(settings)
    .values({ key: KEY, value })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
}

/**
 * Açılış durumu — /api/health ile tarayıcıdan okunur. Kurulumun hangi adımı
 * başarısız oldu, artık sunucu günlüğüne bakmadan görülebilir.
 */
export const bootstrapStatus: Record<string, string> = {};

/**
 * Sayaç ve ayar tablolarını GARANTİ eder (idempotent).
 *
 * Üretim veritabanı ilk kurulumda migration dışı bir yolla (ör. drizzle-kit
 * push) oluşturulduysa migrate() "tablo zaten var" hatasıyla durur ve sonraki
 * tablolar hiç oluşmaz. site_counters / visit_days yoksa ziyaretçi sayacı
 * yalnızca bellekte tutulur, her yeniden başlatmada 1.000'e döner — "sayaç
 * hiç artmıyor" belirtisinin kaynağı budur. Bu adım migrate'ten BAĞIMSIZ çalışır.
 */
export async function ensureCoreTables(): Promise<void> {
  await db.execute(sql`CREATE TABLE IF NOT EXISTS "site_counters" (
    "key" varchar(50) PRIMARY KEY NOT NULL,
    "value" integer DEFAULT 0 NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
  )`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS "visit_days" (
    "day" varchar(10) PRIMARY KEY NOT NULL,
    "count" integer DEFAULT 0 NOT NULL
  )`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS "settings" (
    "key" varchar(60) PRIMARY KEY NOT NULL,
    "value" text NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
  )`);
}

/**
 * Her adım AYRI denenir: eskiden tek try bloğundaydı ve migrate() hata
 * verince veri yükleme, fiyat güncellemeleri ve tablo garantisi sessizce
 * atlanıyordu.
 */
async function step(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    bootstrapStatus[name] = "ok";
  } catch (err) {
    const msg = (err as Error).message;
    // "Tablo zaten var" = veritabanı migration dışı kurulmuş; sorun değil,
    // eksik tablolar bir sonraki adımda (ensureCoreTables) tamamlanır.
    // 42P07 = duplicate_table (PostgreSQL); drizzle asıl hatayı `cause`'ta taşır
    const code = (err as any)?.cause?.code ?? (err as any)?.code;
    const exists = name === "migrate" && code === "42P07";
    bootstrapStatus[name] = exists ? "atlandı (tablolar zaten var)" : `hata: ${msg.split("\n")[0].slice(0, 200)}`;
    if (exists) console.warn(`[bootstrap] ${name}: tablolar zaten var — eksikler ayrıca tamamlanıyor`);
    else console.error(`[bootstrap] ${name} hatası:`, msg);
  }
}

export async function bootstrap(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.warn("[bootstrap] DATABASE_URL yok — kurulum atlandı");
    bootstrapStatus.database = "yapılandırılmamış";
    return;
  }

  await step("migrate", migrate);
  await step("tablolar", ensureCoreTables);
  await step("baslangicVerisi", seedIfEmpty);
  await step("rehberYazilari", addMissingPosts);
  await step("fiyatGuncellemeleri", applyDataUpdates);
  bootstrapStatus.zaman = new Date().toISOString();
}
