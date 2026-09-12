import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * SSL seçimi.
 *
 * Eski sürüm NODE_ENV=production iken SSL'i KOŞULSUZ açıyordu. Railway'in
 * özel ağı (*.railway.internal) TLS konuşmaz; bu kurulumda tüm sorgular
 * "The server does not support SSL connections" ile düşer.
 *
 * Sıra: DATABASE_SSL env > bağlantı dizesindeki sslmode > sunucu adına göre
 * otomatik karar (internal/localhost = SSL yok, herkese açık host = SSL).
 */
function resolveSsl(url: string | undefined) {
  const flag = process.env.DATABASE_SSL?.toLowerCase();
  if (flag === "true" || flag === "require") return { rejectUnauthorized: false };
  if (flag === "false" || flag === "disable") return false;

  if (!url) return false;

  try {
    const parsed = new URL(url);
    const sslmode = parsed.searchParams.get("sslmode");
    if (sslmode === "disable") return false;
    if (sslmode) return { rejectUnauthorized: false };

    const host = parsed.hostname;
    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.endsWith(".internal") ||
      host.endsWith(".local");

    return isLocal ? false : { rejectUnauthorized: false };
  } catch {
    return false;
  }
}

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: resolveSsl(connectionString),
  max: Number(process.env.PG_POOL_MAX ?? 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

// Havuzdaki boştaki bağlantı hatası süreci düşürmesin
pool.on("error", (err) => {
  console.error("[db] havuz hatası:", err.message);
});

export const db = drizzle(pool, { schema });
export type DB = typeof db;
