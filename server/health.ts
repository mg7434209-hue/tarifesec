/**
 * Veri tazeliği ve tarama sağlığı.
 *
 * Tarama sessizce başarısız olabilir (operatör sayfası değişir, bot koruması
 * devreye girer). Günlük tutuluyordu ama kimse bakmıyordu; bu modül durumu
 * hem admin paneline hem de dışarıdan izlenebilir bir uca taşır.
 */
import { db } from "../drizzle/db";
import { packages, scrapeLog } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { config } from "./config";
import { SOURCES } from "../scraper/sources";

export type OperatorHealth = {
  operatorSlug: string;
  label: string;
  mode: "otomatik" | "manuel";
  /** Son BAŞARILI tarama */
  lastSuccessAt: string | null;
  lastStatus: string | null;
  lastError: string | null;
  packageCount: number;
  /** Bu operatörün paketlerinin en yeni kontrol zamanı */
  lastCheckedAt: string | null;
  stale: boolean;
};

export type HealthReport = {
  ok: boolean;
  staleAfterHours: number;
  checkedAt: string;
  totals: { packages: number; stale: number; operators: number; staleOperators: number };
  operators: OperatorHealth[];
  /** İnsan tarafından okunabilir özet — panelde ve uyarılarda gösterilir */
  summary: string;
};

const hoursAgo = (d: Date | string | null) =>
  d === null ? Infinity : (Date.now() - new Date(d).getTime()) / 36e5;

export async function healthReport(): Promise<HealthReport> {
  const staleAfter = config.scrape.staleAfterHours;
  const rows = await db.select().from(packages).where(eq(packages.isActive, true));

  const operators: OperatorHealth[] = [];

  for (const src of SOURCES) {
    const own = rows.filter((r) => r.operatorSlug === src.operatorSlug);

    const [lastSuccess] = await db
      .select()
      .from(scrapeLog)
      .where(and(eq(scrapeLog.operator, src.operatorSlug), eq(scrapeLog.status, "success")))
      .orderBy(desc(scrapeLog.createdAt))
      .limit(1);

    const [lastAny] = await db
      .select()
      .from(scrapeLog)
      .where(eq(scrapeLog.operator, src.operatorSlug))
      .orderBy(desc(scrapeLog.createdAt))
      .limit(1);

    const stamps = own
      .map((p) => p.lastScrapedAt)
      .filter(Boolean)
      .map((d) => new Date(d as Date).getTime());
    const lastChecked = stamps.length ? new Date(Math.max(...stamps)) : null;

    operators.push({
      operatorSlug: src.operatorSlug,
      label: src.label,
      mode: src.manual ? "manuel" : "otomatik",
      lastSuccessAt: lastSuccess?.createdAt ? new Date(lastSuccess.createdAt).toISOString() : null,
      lastStatus: lastAny?.status ?? null,
      lastError: lastAny?.errorMessage ?? null,
      packageCount: own.length,
      lastCheckedAt: lastChecked ? lastChecked.toISOString() : null,
      // Elle yönetilen operatörler tarama başarısızlığından sayılmaz
      stale: !src.manual && hoursAgo(lastChecked) > staleAfter,
    });
  }

  const stalePackages = rows.filter((p) => hoursAgo(p.lastScrapedAt) > staleAfter);
  const staleOperators = operators.filter((o) => o.stale);

  const summary = staleOperators.length
    ? `${staleOperators.map((o) => o.label).join(", ")} ${staleAfter} saatten uzun süredir güncellenmedi.`
    : "Tüm otomatik operatörler güncel.";

  return {
    ok: staleOperators.length === 0,
    staleAfterHours: staleAfter,
    checkedAt: new Date().toISOString(),
    totals: {
      packages: rows.length,
      stale: stalePackages.length,
      operators: operators.length,
      staleOperators: staleOperators.length,
    },
    operators,
    summary,
  };
}
