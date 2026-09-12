/**
 * Yönetim şifresi.
 *
 * Öncelik: ADMIN_SECRET ortam değişkeni > veritabanında saklanan şifre.
 *
 * NEDEN VERİTABANI SEÇENEĞİ: Railway panelinden ortam değişkeni tanımlamak
 * teknik bilgi gerektiriyor ve site sahibi için engel oluşturuyordu. Şifre
 * yoksa panel ilk açılışta "kurulum" ekranı gösterir ve şifre tarayıcıdan
 * belirlenir — WordPress/Ghost gibi kendi kendine kurulan uygulamaların
 * standart akışı.
 *
 * GÜVENLİK NOTU: şifre belirlenene kadar /admin adresini bulan HERKES
 * şifreyi kendisi belirleyebilir. Bu yüzden dağıtımdan hemen sonra kurulum
 * yapılmalıdır; sunucu her açılışta bu uyarıyı günlüğe yazar. ADMIN_SECRET
 * tanımlıysa kurulum ekranı hiç gösterilmez ve DB'deki şifre yok sayılır —
 * bir sorun olursa kurtarma yolu budur.
 */
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../drizzle/db";
import { settings } from "../drizzle/schema";

const KEY = "admin_password";
const SCRYPT_N = 16384;

/** scrypt ile karma — düz metin asla saklanmaz */
function hash(password: string, salt?: string): string {
  const s = salt ?? crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, s, 32, { N: SCRYPT_N, r: 8, p: 1 });
  return `scrypt$${s}$${derived.toString("hex")}`;
}

function verifyHash(password: string, stored: string): boolean {
  const [scheme, salt, expected] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !expected) return false;
  const derived = crypto.scryptSync(password, salt, 32, { N: SCRYPT_N, r: 8, p: 1 });
  const a = Buffer.from(derived.toString("hex"), "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

const envSecret = () => {
  const s = process.env.ADMIN_SECRET;
  return s && s.length >= 8 ? s : null;
};

async function storedHash(): Promise<string | null> {
  try {
    const [row] = await db.select().from(settings).where(eq(settings.key, KEY));
    return row?.value ?? null;
  } catch {
    return null;
  }
}

/** Şifre hiç belirlenmemiş mi? (kurulum ekranı bunun için gösterilir) */
export async function needsSetup(): Promise<boolean> {
  if (envSecret()) return false;
  return (await storedHash()) === null;
}

/** İlk kurulum — yalnızca hiç şifre yokken çalışır */
export async function setupPassword(password: string): Promise<{ ok: boolean; error?: string }> {
  if (envSecret()) {
    return { ok: false, error: "Şifre ortam değişkeniyle tanımlı; kurulum gerekmiyor." };
  }
  if (typeof password !== "string" || password.length < 8) {
    return { ok: false, error: "Şifre en az 8 karakter olmalı." };
  }
  if (await storedHash()) {
    return { ok: false, error: "Şifre zaten belirlenmiş." };
  }

  await db.insert(settings).values({ key: KEY, value: hash(password) });
  console.warn("[auth] yönetim şifresi belirlendi (tarayıcı kurulumu).");
  return { ok: true };
}

/** Şifre değiştirme — mevcut şifre doğrulanarak */
export async function changePassword(
  current: string,
  next: string
): Promise<{ ok: boolean; error?: string }> {
  if (envSecret()) {
    return { ok: false, error: "Şifre ortam değişkeniyle yönetiliyor; buradan değiştirilemez." };
  }
  if (!(await verify(current))) return { ok: false, error: "Mevcut şifre hatalı." };
  if (typeof next !== "string" || next.length < 8) {
    return { ok: false, error: "Yeni şifre en az 8 karakter olmalı." };
  }

  await db
    .insert(settings)
    .values({ key: KEY, value: hash(next) })
    .onConflictDoUpdate({ target: settings.key, set: { value: hash(next), updatedAt: new Date() } });

  return { ok: true };
}

/** Verilen şifre geçerli mi? */
export async function verify(password: unknown): Promise<boolean> {
  if (typeof password !== "string" || !password) return false;

  const env = envSecret();
  if (env) return safeEqual(password, env);

  const stored = await storedHash();
  if (!stored) return false;
  return verifyHash(password, stored);
}
