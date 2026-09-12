/**
 * Uygulama içi zamanlayıcı.
 *
 * Neden ayrı Railway Cron servisi değil: railway-cron.json ELLE ayrı bir
 * servis oluşturulmasını gerektirir. Oluşturulmadığı sürece scraper hiç
 * çalışmaz — sitenin hiç yayına çıkmamış olması nedeniyle bugüne dek de
 * çalışmamış olması kuvvetle muhtemel. Bu zamanlayıcı web süreciyle birlikte
 * başlar; ek yapılandırma istemez.
 *
 * Kapatmak için: AUTO_SCRAPE=false
 * Aralık: SCRAPE_INTERVAL_HOURS (varsayılan 12)
 */
import { config } from "./config";

let timer: NodeJS.Timeout | null = null;
let running = false;
let lastRun: { at: Date; changed: number; error?: string } | null = null;

export function schedulerStatus() {
  return {
    enabled: config.scrape.auto,
    intervalHours: config.scrape.intervalHours,
    running,
    lastRun,
  };
}

async function runOnce(reason: string) {
  if (running) {
    console.log("[scheduler] önceki tur sürüyor, atlandı");
    return;
  }
  if (!process.env.DATABASE_URL) {
    console.warn("[scheduler] DATABASE_URL yok — tarama atlandı");
    return;
  }

  running = true;
  try {
    console.log(`[scheduler] tarama başlıyor (${reason})`);
    const { runScraper } = await import("../scraper/index");
    const summaries = await runScraper();
    const changed = summaries.reduce((a, s) => a + s.changed, 0);
    lastRun = { at: new Date(), changed };
  } catch (err) {
    const message = (err as Error).message;
    console.error("[scheduler] tarama hatası:", message);
    lastRun = { at: new Date(), changed: 0, error: message };
  } finally {
    running = false;
  }
}

export function startScheduler() {
  if (!config.scrape.auto) {
    console.log("[scheduler] otomatik tarama kapalı (AUTO_SCRAPE=false)");
    return;
  }

  const intervalMs = Math.max(1, config.scrape.intervalHours) * 60 * 60 * 1000;

  // Açılışta hemen tarama YAPMA — dağıtım sırasında her yeniden başlatma
  // operatör sitelerine istek yağdırırdı. Kısa bir gecikmeyle bir kez çalışır.
  const firstDelay = Math.min(config.scrape.startupDelayMinutes * 60 * 1000, intervalMs);

  setTimeout(() => {
    void runOnce("açılış");
    timer = setInterval(() => void runOnce("zamanlanmış"), intervalMs);
    timer.unref?.();
  }, firstDelay).unref?.();

  console.log(
    `[scheduler] otomatik tarama açık — her ${config.scrape.intervalHours} saatte bir ` +
      `(ilk tur ${config.scrape.startupDelayMinutes} dk sonra)`
  );
}

/** Admin panelinden elle tetikleme */
export function triggerScrape() {
  void runOnce("elle tetiklendi");
}

export function stopScheduler() {
  if (timer) clearInterval(timer);
  timer = null;
}
