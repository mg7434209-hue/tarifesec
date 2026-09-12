import { useCallback, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Zap, Download, Upload, Activity, RotateCcw, Loader2, Waves, Gauge, Share2, Check,
} from "lucide-react";
import { fetchSpeedStats, saveSpeedResult } from "@/lib/api";
import { useRouteSeo } from "@/lib/hooks";
import SpeedGauge from "@/components/SpeedGauge";
import PartnerCard from "@/components/PartnerCard";
import {
  measurePing, measureDownload, measureUpload, rate, pingRate,
  type Phase, type Result,
} from "@/lib/speedtest";

const TONE: Record<string, string> = {
  bad: "text-red-600 bg-red-50 border-red-200",
  ok: "text-amber-600 bg-amber-50 border-amber-200",
  good: "text-[#0097a7] bg-[#e0f7fa] border-[#0097a7]/30",
  great: "text-green-700 bg-green-50 border-green-200",
};

const PHASE_TEXT: Record<Phase, string> = {
  idle: "",
  ping: "Gecikme ölçülüyor…",
  download: "İndirme hızı ölçülüyor…",
  upload: "Yükleme hızı ölçülüyor…",
  done: "",
};

function Metrik({
  icon: Icon, label, value, unit, tone,
}: {
  icon: typeof Download; label: string; value: string; unit: string; tone?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
      <Icon className="w-4 h-4 text-[#0097a7] mx-auto mb-1.5" />
      <div className="text-xl font-bold text-gray-900 tabular-nums">{value}</div>
      <div className="text-xs text-gray-500 mb-1.5">{label} ({unit})</div>
      {tone && (
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${TONE[tone.split("|")[1]]}`}>
          {tone.split("|")[0]}
        </span>
      )}
    </div>
  );
}

export default function HizTesti() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [live, setLive] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const { data: stats } = useQuery({ queryKey: ["speedstats"], queryFn: fetchSpeedStats });

  useRouteSeo("/hiz-testi");

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
      });
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        setPhase("idle");
        return;
      }
      setError("Test tamamlanamadı. Bağlantınızı kontrol edip tekrar deneyin.");
      setPhase("idle");
    }
  }, []);

  const running = phase === "ping" || phase === "download" || phase === "upload";
  const gaugeValue = running && phase !== "ping" ? live : result?.download ?? 0;

  const paylas = () => {
    if (!result) return;
    const text =
      `İnternet hız testim: ${result.download.toFixed(1)} Mbps indirme, ` +
      `${result.upload.toFixed(1)} Mbps yükleme, ${Math.round(result.ping)} ms ping ` +
      `— tarifesec.net.tr/hiz-testi`;
    if (navigator.share) {
      void navigator.share({ text }).catch(() => {});
    } else {
      void navigator.clipboard?.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-[#e0f7fa] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Zap className="w-7 h-7 text-[#0097a7]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">İnternet Hız Testi</h1>
        <p className="text-gray-500">
          Paralel bağlantılarla gerçek hattınızı ölçer — kurulum ve üyelik gerekmez.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <SpeedGauge
          value={gaugeValue}
          active={running}
          label={phase === "upload" ? "Yükleme" : "İndirme"}
        />

        <p className="text-sm text-gray-500 text-center h-5 mb-4">{PHASE_TEXT[phase]}</p>

        {running && (
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-[#0097a7] transition-[width] duration-200"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}

        {result && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <Metrik
                icon={Download} label="İndirme" unit="Mbps"
                value={result.download.toFixed(1)}
                tone={`${rate(result.download).label}|${rate(result.download).tone}`}
              />
              <Metrik
                icon={Upload} label="Yükleme" unit="Mbps"
                value={result.upload.toFixed(1)}
                tone={`${rate(result.upload).label}|${rate(result.upload).tone}`}
              />
              <Metrik
                icon={Activity} label="Ping" unit="ms"
                value={String(Math.round(result.ping))}
                tone={`${pingRate(result.ping).label}|${pingRate(result.ping).tone}`}
              />
              <Metrik
                icon={Waves} label="Jitter" unit="ms"
                value={result.jitter.toFixed(1)}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-4 mb-2">
              <span className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5" />
                Bağlantı kararlılığı: <strong className="text-gray-700">%{result.stability}</strong>
              </span>
              <button onClick={paylas} className="inline-flex items-center gap-1.5 hover:text-gray-900">
                {copied ? <><Check className="w-3.5 h-3.5" /> Kopyalandı</> : <><Share2 className="w-3.5 h-3.5" /> Sonucu paylaş</>}
              </button>
            </div>
          </>
        )}

        {error && <p className="text-sm text-red-600 text-center mb-4" role="alert">{error}</p>}

        <button
          onClick={running ? () => abortRef.current?.abort() : run}
          className="w-full flex items-center justify-center gap-2 bg-[#0097a7] hover:bg-[#00838f] text-white font-semibold py-3.5 rounded-xl transition-colors mt-2"
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
          ortalaması <strong>{stats.avgDownload} Mbps</strong>.{" "}
          {result.download >= stats.avgDownload ? (
            "Bağlantınız ortalamanın üzerinde. 👍"
          ) : (
            <>
              Bağlantınız ortalamanın altında —{" "}
              <Link href="/paket-karsilastir" className="text-[#0097a7] font-semibold underline">
                daha hızlı paketleri karşılaştırın
              </Link>
              .
            </>
          )}
        </div>
      )}

      {result && (
        <div className="mt-6">
          <PartnerCard context="internet" placement="icerikArasi" />
        </div>
      )}

      <div className="mt-8 text-sm text-gray-500 space-y-2">
        <h2 className="font-semibold text-gray-900">Ölçüm nasıl yapılıyor?</h2>
        <p>
          Test, kendi sunucumuza <strong>4 paralel bağlantı</strong> açar. Tek bağlantıyla
          yapılan ölçümler yüksek hızlı hatlarda gerçeğin altında çıkar; paralel akış
          hattın tamamını doldurur.
        </p>
        <p>
          İlk 0,8 saniye <strong>hesaba katılmaz</strong> (bağlantı kurulumu ve TCP yavaş
          başlangıcı). Sonuç, kararlı ölçüm pencerelerinin <strong>medyanıdır</strong> —
          anlık zirve değil, sürekli elde edebildiğiniz hız.
        </p>
        <p className="text-xs text-gray-400">
          En doğru sonuç için kabloyla bağlanın, diğer indirmeleri durdurun ve VPN'i kapatın.
          Wi-Fi üzerinden yapılan ölçümler mesafe ve duvar sayısına göre düşük çıkabilir.
        </p>
      </div>
    </div>
  );
}
