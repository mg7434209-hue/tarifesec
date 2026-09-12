/**
 * Hız ölçüm motoru.
 *
 * NEDEN PARALEL AKIŞ: tek bir TCP bağlantısı, yüksek hızlı hatlarda
 * pencere boyutu ve gecikme nedeniyle hattı dolduramaz; tek akışla yapılan
 * ölçüm 200 Mbps üzeri bağlantılarda gerçeğin belirgin altında çıkar.
 * Ookla/fast.com dahil ciddi ölçerler paralel akış kullanır.
 *
 * YAVAŞ BAŞLANGIÇ: ilk ~800 ms atılır (TCP slow start + bağlantı kurulumu),
 * aksi hâlde sonuç düşük çıkar.
 *
 * SONUÇ: kararlı pencerelerin medyanı alınır — anlık zirve değil, sürekli
 * elde edilebilen hız raporlanır.
 */

export type Phase = "idle" | "ping" | "download" | "upload" | "done";

export type Sample = { t: number; mbps: number };

export type Result = {
  download: number;
  upload: number;
  ping: number;
  jitter: number;
  /** Ölçüm kalitesi göstergesi */
  stability: number;
  samples: { download: Sample[]; upload: Sample[] };
};

const STREAMS = 4;
/**
 * Tek testin azami veri tüketimi. Süre sınırının yanına bayt sınırı da
 * konur: gigabit üstü hatlarda 8 saniye gereksiz yere gigabaytlarca veri
 * aktarır, sunucu kotasını ve kullanıcının mobil paketini yakar.
 */
const MAX_DOWNLOAD_BYTES = 700 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 150 * 1024 * 1024;
const WARMUP_MS = 800;
const DOWNLOAD_MS = 8000;
const UPLOAD_MS = 6000;
const PING_SAMPLES = 10;
const CHUNK = 4 * 1024 * 1024;

const toMbps = (bytes: number, ms: number) => (bytes * 8) / (ms / 1000) / 1_000_000;

function median(xs: number[]): number {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Değişkenlik: düşükse bağlantı kararlı demektir (0-100) */
function stabilityScore(xs: number[]): number {
  if (xs.length < 3) return 0;
  const avg = xs.reduce((a, b) => a + b, 0) / xs.length;
  if (avg === 0) return 0;
  const sd = Math.sqrt(xs.reduce((a, b) => a + (b - avg) ** 2, 0) / xs.length);
  return Math.max(0, Math.min(100, Math.round(100 - (sd / avg) * 100)));
}

export async function measurePing(
  signal: AbortSignal,
  onProgress?: (p: number) => void
): Promise<{ ping: number; jitter: number }> {
  const samples: number[] = [];

  for (let i = 0; i < PING_SAMPLES; i++) {
    const t0 = performance.now();
    await fetch(`/api/speedtest/ping?t=${Date.now()}-${i}`, { cache: "no-store", signal });
    samples.push(performance.now() - t0);
    onProgress?.(((i + 1) / PING_SAMPLES) * 100);
  }

  // İlk ölçüm bağlantı kurulumunu içerir, atılır
  const clean = samples.slice(1);
  const ping = median(clean);
  const jitter =
    clean.length > 1
      ? clean.slice(1).reduce((acc, s, i) => acc + Math.abs(s - clean[i]), 0) / (clean.length - 1)
      : 0;

  return { ping, jitter };
}

/** Paralel akışlarla yönlü ölçüm */
async function measureStreams(opts: {
  signal: AbortSignal;
  durationMs: number;
  maxBytes: number;
  onSample: (mbps: number, progress: number) => void;
  makeRequest: (signal: AbortSignal, onBytes: (n: number) => void) => Promise<void>;
}): Promise<{ mbps: number; samples: Sample[]; stability: number }> {
  const { signal, durationMs, maxBytes, onSample, makeRequest } = opts;

  let totalBytes = 0;
  const start = performance.now();
  const samples: Sample[] = [];
  const windowValues: number[] = [];

  let windowBytes = 0;
  let windowStart = start;

  // Süre veya bayt sınırı dolunca akışları durdur
  const stopper = new AbortController();

  const onBytes = (n: number) => {
    totalBytes += n;
    windowBytes += n;

    // Bayt sınırına ulaşıldıysa akışları durdur
    if (totalBytes >= maxBytes) stopper.abort();

    const now = performance.now();
    const elapsed = now - start;

    // 250 ms'lik pencerelerde anlık hız
    if (now - windowStart >= 250) {
      const mbps = toMbps(windowBytes, now - windowStart);
      windowBytes = 0;
      windowStart = now;

      if (elapsed > WARMUP_MS) {
        windowValues.push(mbps);
        samples.push({ t: Math.round(elapsed), mbps });
      }
      onSample(mbps, Math.min((elapsed / durationMs) * 100, 100));
    }
  };

  const onAbort = () => stopper.abort();
  signal.addEventListener("abort", onAbort, { once: true });
  const timer = setTimeout(() => stopper.abort(), durationMs);

  const workers = Array.from({ length: STREAMS }, async () => {
    // Süre dolana kadar art arda istek yap
    while (!stopper.signal.aborted) {
      try {
        await makeRequest(stopper.signal, onBytes);
      } catch {
        break; // iptal veya ağ hatası
      }
    }
  });

  await Promise.allSettled(workers);
  clearTimeout(timer);
  signal.removeEventListener("abort", onAbort);

  if (signal.aborted) throw new DOMException("Aborted", "AbortError");

  const effective = performance.now() - start - WARMUP_MS;
  const overall = effective > 0 ? toMbps(totalBytes, performance.now() - start) : 0;

  // Kararlı pencerelerin medyanı; yoksa genel ortalamaya düş
  const mbps = windowValues.length >= 3 ? median(windowValues) : overall;

  return { mbps, samples, stability: stabilityScore(windowValues) };
}

export function measureDownload(
  signal: AbortSignal,
  onSample: (mbps: number, progress: number) => void
) {
  return measureStreams({
    signal,
    durationMs: DOWNLOAD_MS,
    maxBytes: MAX_DOWNLOAD_BYTES,
    onSample,
    makeRequest: async (sig, onBytes) => {
      const res = await fetch(`/api/speedtest/download?bytes=${CHUNK}&t=${Date.now()}-${Math.random()}`, {
        cache: "no-store",
        signal: sig,
      });
      // Kota dolduysa (429) bu akışı bitir; ölçülen veri geçerli kalır.
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error("Akış desteklenmiyor");
      const reader = res.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        onBytes(value.length);
      }
    },
  });
}

export function measureUpload(
  signal: AbortSignal,
  onSample: (mbps: number, progress: number) => void
) {
  // Tek seferlik rastgele bloğu yeniden kullan — her turda üretmek CPU yer
  const block = new Uint8Array(1024 * 1024);
  crypto.getRandomValues(block.subarray(0, 65536));

  return measureStreams({
    signal,
    durationMs: UPLOAD_MS,
    maxBytes: MAX_UPLOAD_BYTES,
    onSample,
    makeRequest: async (sig, onBytes) => {
      await fetch("/api/speedtest/upload", {
        method: "POST",
        body: block,
        headers: { "Content-Type": "application/octet-stream" },
        signal: sig,
      });
      // Yükleme ilerlemesi akış olarak okunamaz; blok tamamlanınca sayılır
      onBytes(block.length);
    },
  });
}

export function rate(mbps: number): { label: string; tone: "bad" | "ok" | "good" | "great" } {
  if (mbps < 10) return { label: "Düşük", tone: "bad" };
  if (mbps < 50) return { label: "Orta", tone: "ok" };
  if (mbps < 200) return { label: "İyi", tone: "good" };
  return { label: "Çok iyi", tone: "great" };
}

export function pingRate(ms: number): { label: string; tone: "bad" | "ok" | "good" | "great" } {
  if (ms > 100) return { label: "Yüksek", tone: "bad" };
  if (ms > 60) return { label: "Orta", tone: "ok" };
  if (ms > 25) return { label: "İyi", tone: "good" };
  return { label: "Mükemmel", tone: "great" };
}
