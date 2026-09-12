/**
 * Başlangıç verisini elle yükler.
 * Çalıştır: npm run db:seed
 *
 * NOT: Sunucu açılışta tablolar BOŞSA bunu zaten otomatik yapar
 * (server/bootstrap.ts). Bu betik yalnızca elle yeniden yüklemek içindir —
 * mevcut veriyi SİLER.
 */
import { db } from "./db";
import { packages, mobileTariffs } from "./schema";
import { SEED_PACKAGES, SEED_MOBILE } from "./seed-data";
import dotenv from "dotenv";
dotenv.config();

async function seed() {
  console.log("🌱 Seed başlıyor (mevcut paketler silinecek)…");
  await db.delete(packages);
  await db.insert(packages).values(SEED_PACKAGES);
  console.log(`✅ ${SEED_PACKAGES.length} ev interneti paketi eklendi`);

  await db.delete(mobileTariffs);
  await db.insert(mobileTariffs).values(SEED_MOBILE);
  console.log(`✅ ${SEED_MOBILE.length} mobil tarife eklendi`);

  console.log("🎉 Seed tamamlandı!");
  process.exit(0);
}

seed().catch((e) => {
  console.error("❌ Seed hatası:", e);
  process.exit(1);
});
