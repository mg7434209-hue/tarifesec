import { useCallback, useRef, useState } from "react";
import { saveSpeedResult } from "@/lib/api";
import { measurePing, measureDownload, measureUpload, type Phase, type Result } from "@/lib/speedtest";

/**
 * Hız testi durumu — /hiz-testi sayfası ve ana sayfadaki kart AYNI kancayı
 * kullanır (ölçüm mantığı tek yerde).
 *
 * Test YALNIZ kullanıcı düğmeye basınca başlar: kendiliğinden başlatmak hem
 * ziyaretçinin mobil paketini hem sunucu trafiğini yakar, hem de sayfa
 * açılışını (Core Web Vitals) bozar.
 */
export function useSpeedTest(source: "sayfa" | "anasayfa") {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [live, setLive] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async () => {
    const controller = new AbortController();
    abortRef.current = controller;
    setError(null);
    setResult(null);
    setLive(0);

    try {
      setPhase("ping");
      setProgress(0);
      const { ping, jitter } = await measurePing(controller.signal, setProgress);

      setPhase("download");
      setProgress(0);
      setLive(0);
      const dl = await measureDownload(controller.signal, (mbps, p) => {
        setLive(mbps);
        setProgress(p);
      });
      // Hiç veri gelmediyse (kapasite/kota dolu veya bağlantı koptu) 0 Mbps
      // sonucu göstermek yanıltıcı olur — hata olarak bildir.
      if (dl.mbps <= 0) throw new Error("no-data");

      setPhase("upload");
      setProgress(0);
      setLive(0);
      const ul = await measureUpload(controller.signal, (mbps, p) => {
        setLive(mbps);
        setProgress(p);
      });

      const r: Result = {
        download: dl.mbps,
        upload: ul.mbps,
        ping,
        jitter,
        stability: dl.stability,
        samples: { download: dl.samples, upload: ul.samples },
      };
      setResult(r);
      setPhase("done");

      saveSpeedResult({
        downloadSpeed: Math.round(dl.mbps),
        uploadSpeed: Math.round(ul.mbps),
        ping: Math.round(ping),
        source,
      });
    } catch (e) {
      setPhase("idle");
      if ((e as Error).name === "AbortError") return;
      setError(
        (e as Error).message === "no-data"
          ? "Ölçüm yapılamadı: test sunucusu şu an yoğun olabilir. Biraz sonra tekrar deneyin."
          : "Test tamamlanamadı. Bağlantınızı kontrol edip tekrar deneyin."
      );
    }
  }, [source]);

  const stop = useCallback(() => abortRef.current?.abort(), []);
  const running = phase === "ping" || phase === "download" || phase === "upload";
  const gaugeValue = running && phase !== "ping" ? live : result?.download ?? 0;

  return { phase, progress, live, result, error, running, gaugeValue, run, stop };
}
