import { useCallback, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Zap, Download, Upload, Activity, RotateCcw, Loader2 } from "lucide-react";
import { fetchSpeedStats, saveSpeedResult } from "@/lib/api";
import { useRouteSeo } from "@/lib/hooks";

type Phase = "idle" | "ping" | "download" | "upload" | "done";

type Result = { download: number; upload: number; ping: number; jitter: number };

/** Bayt/sn → Mbps */
const toMbps = (bytes: number, ms: number) => (bytes * 8) / (ms / 1000) / 1_000_000;

const DOWNLOAD_BYTES = 12 * 1024 * 1024;
const UPLOAD_BYTES = 4 * 1024 * 1024;
const PING_SAMPLES = 6;

export default function HizTesti() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [live, setLive] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { data: stats } = useQuery({ queryKey: ["speedstats"], queryFn: fetchSpeedStats });

  useRouteSeo("/hiz-testi");

  const measurePing = useCallback(async (signal: AbortSignal) => {
    const samples: number[] = [];
    for (let i = 0; i < PING_SAMPLES; i++) {
      const t0 = performance.now();
      await fetch(`/api/speedtest/ping?t=${Date.now()}-${i}`, { cache: "no-store", signal });
      samples.push(performance.now() - t0);
      setProgress(((i + 1) / PING_SAMPLES) * 100);
    }
    samples.sort((a, b) => a - b);
    const ping = samples[Math.floor(samples.length / 2)];
    const jitter =
      samples.reduce((acc, s) => acc + Math.abs(s - ping), 0) / samples.length;
    return { ping, jitter };
  }, []);

  const measureDownload = useCallback(async (signal: AbortSignal) => {
    const t0 = performance.now();
    const res = await fetch(`/api/speedtest/download?bytes=${DOWNLOAD_BYTES}&t=${Date.now()}`, {
      cache: "no-store",
      signal,
    });
    if (!res.body) throw new Error("Akış desteklenmiyor");

    const reader = res.body.getReader();
    let received = 0;

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.length;
      const elapsed = performance.now() - t0;
      setProgress((received / DOWNLOAD_BYTES) * 100);
      if (elapsed > 250) setLive(toMbps(received, elapsed));
    }

    return toMbps(received, performance.now() - t0);
  }, []);

  const measureUpload = useCallback(async (signal: AbortSignal) => {
    const payload = new Uint8Array(UPLOAD_BYTES);
    crypto.getRandomValues(payload.subarray(0, 65536));

    const t0 = performance.now();
    setProgress(15);
    await fetch("/api/speedtest/upload", {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/octet-stream" },
      signal,
    });
    setProgress(100);
    return toMbps(UPLOAD_BYTES, performance.now() - t0);
  }, []);

  const run = useCallback(async () => {
    const controller = new AbortController();
    abortRef.current = controller;
    setError(null);
    setResult(null);
    setLive(0);

    try {
      setPhase("ping");
      setProgress(0);
      const { ping, jitter } = await measurePing(controller.signal);

      setPhase("download");
      setProgress(0);
      const download = await measureDownload(controller.signal);

      setPhase("upload");
      setProgress(0);
      const upload = await measureUpload(controller.signal);

      const r = { download, upload, ping, jitter };
      setResult(r);
      setPhase("done");

      saveSpeedResult({
        downloadSpeed: Math.round(download),
        uploadSpeed: Math.round(upload),
        ping: Math.round(ping),
      });
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError("Test tamamlanamadı. Bağlantınızı kontrol edip tekrar deneyin.");
      setPhase("idle");
    }
  }, [measurePing, measureDownload, measureUpload]);

  const running = phase === "ping" || phase === "download" || phase === "upload";

  const phaseLabel =
    phase === "ping" ? "Gecikme ölçülüyor…"
    : phase === "download" ? "İndirme hızı ölçülüyor…"
    : phase === "upload" ? "Yükleme hızı ölçülüyor…"
    : "";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center">
        <div className="w-14 h-14 bg-[#e0f7fa] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Zap className="w-7 h-7 text-[#0097a7]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">İnternet Hız Testi</h1>
        <p className="text-gray-500 mb-8">
          İndirme, yükleme ve gecikme değerlerinizi ölçün — kurulum gerekmez.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        {/* Canlı gösterge */}
        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-gray-900 tabular-nums">
            {running && phase === "download"
              ? live.toFixed(1)
              : result
              ? result.download.toFixed(1)
              : "—"}
            <span className="text-lg font-medium text-gray-400 ml-2">Mbps</span>
          </div>
          <p className="text-sm text-gray-500 mt-2 h-5">{phaseLabel}</p>
        </div>

        {running && (
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-[#0097a7] transition-[width] duration-150"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}

        {result && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: Download, label: "İndirme", value: `${result.download.toFixed(1)}`, unit: "Mbps" },
              { icon: Upload, label: "Yükleme", value: `${result.upload.toFixed(1)}`, unit: "Mbps" },
              { icon: Activity, label: "Ping", value: `${Math.round(result.ping)}`, unit: "ms" },
            ].map((m) => (
              <div key={m.label} className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                <m.icon className="w-4 h-4 text-[#0097a7] mx-auto mb-1.5" />
                <div className="text-xl font-bold text-gray-900 tabular-nums">{m.value}</div>
                <div className="text-xs text-gray-500">{m.label} ({m.unit})</div>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-red-600 text-center mb-4" role="alert">{error}</p>}

        <button
          onClick={running ? () => abortRef.current?.abort() : run}
          className="w-full flex items-center justify-center gap-2 bg-[#0097a7] hover:bg-[#00838f] text-white font-semibold py-3.5 rounded-xl transition-colors"
        >
          {running ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Durdur</>
          ) : result ? (
            <><RotateCcw className="w-4 h-4" /> Tekrar Test Et</>
          ) : (
            <><Zap className="w-4 h-4" /> Testi Başlat</>
          )}
        </button>
      </div>

      {result && stats && stats.total > 3 && (
        <div className="mt-4 bg-[#e0f7fa]/50 border border-[#0097a7]/20 rounded-xl p-4 text-sm text-gray-700">
          Bu sitede yapılan <strong>{stats.total.toLocaleString("tr-TR")}</strong> testin
          ortalaması <strong>{stats.avgDownload} Mbps</strong> indirme.{" "}
          {result.download >= stats.avgDownload
            ? "Bağlantınız ortalamanın üzerinde. 👍"
            : "Bağlantınız ortalamanın altında — daha hızlı bir paket işinizi görebilir."}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4 text-center">
        Ölçüm kendi sunucumuz üzerinden yapılır. Sonuç; cihazınız, Wi-Fi mesafesi ve
        ağ yoğunluğuna göre değişebilir. En doğru sonuç için kabloyla bağlanın ve
        diğer indirmeleri durdurun.
      </p>
    </div>
  );
}
