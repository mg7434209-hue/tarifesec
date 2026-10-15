import { Link } from "wouter";
import { Zap, Loader2, RotateCcw, Download, Upload, Activity, ArrowRight } from "lucide-react";
import SpeedGauge from "@/components/SpeedGauge";
import { useSpeedTest } from "@/lib/useSpeedTest";

/**
 * Ana sayfadaki kompakt hız testi.
 *
 * SEO notu: "hız testi" aramasının hedef sayfası /hiz-testi'dir (başlık,
 * açıklama, WebApplication şeması, SSS orada). Bu kart ana sayfada ETKİLEŞİM
 * içindir — ana sayfa "internet paketleri / tarifeler" aramasını hedeflemeye
 * devam eder; iki sayfa aynı anahtar kelimede birbiriyle yarışmaz. Kart,
 * ayrıntılı sonuç için /hiz-testi'ye bağlantı verir.
 *
 * Sonuca göre öneri: ölçülen hız, kullanıcıyı doğru karşılaştırma sayfasına
 * yönlendirir (testten pakete geçiş = sitenin asıl dönüşümü).
 */
function oneri(mbps: number) {
  if (mbps < 30)
    return { text: "Hattınız yavaş görünüyor. Adresinizde fiber varsa çok daha hızlı paketler mümkün.", href: "/internet/fiber", cta: "Fiber paketleri gör" };
  if (mbps < 90)
    return { text: "Çoğu ev için 100 Mbps rahat bir hızdır. Operatörlerin 100 Mbps fiyatlarını karşılaştırın.", href: "/internet/100-mbps", cta: "100 Mbps paketleri gör" };
  return { text: "Bağlantınız hızlı. Aynı hıza daha az ödeyip ödemediğinizi kontrol edin.", href: "/internet/en-ucuz", cta: "En ucuz paketleri gör" };
}

export default function HizTestiKart() {
  const t = useSpeedTest("anasayfa");
  const o = t.result ? oneri(t.result.download) : null;

  return (
    <div className="bg-white text-gray-900 rounded-2xl shadow-xl p-5 md:p-6 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#0097a7]" /> İnternet Hız Testi
        </h2>
        <span className="text-[11px] text-gray-400">ücretsiz · üyeliksiz</span>
      </div>

      <SpeedGauge value={t.gaugeValue} active={t.running} label={t.phase === "upload" ? "Yükleme" : "İndirme"} />

      {t.running && (
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden my-3" aria-hidden="true">
          <div className="h-full bg-[#0097a7] transition-[width] duration-200" style={{ width: `${Math.min(t.progress, 100)}%` }} />
        </div>
      )}

      {t.result && (
        <div className="grid grid-cols-3 gap-2 my-3 text-center">
          {[
            { icon: Download, label: "İndirme", v: t.result.download.toFixed(1), u: "Mbps" },
            { icon: Upload, label: "Yükleme", v: t.result.upload.toFixed(1), u: "Mbps" },
            { icon: Activity, label: "Ping", v: String(Math.round(t.result.ping)), u: "ms" },
          ].map((m) => (
            <div key={m.label} className="bg-gray-50 rounded-xl py-2">
              <m.icon className="w-3.5 h-3.5 text-[#0097a7] mx-auto mb-0.5" />
              <div className="font-bold tabular-nums">{m.v}</div>
              <div className="text-[11px] text-gray-500">{m.label} ({m.u})</div>
            </div>
          ))}
        </div>
      )}

      {t.error && <p className="text-sm text-red-600 text-center my-2" role="alert">{t.error}</p>}

      <button
        onClick={t.running ? t.stop : t.run}
        className="w-full flex items-center justify-center gap-2 bg-[#0097a7] hover:bg-[#00838f] text-white font-semibold py-3 rounded-xl transition-colors mt-2"
      >
        {t.running ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Durdur</>
        ) : t.result ? (
          <><RotateCcw className="w-4 h-4" /> Tekrar Test Et</>
        ) : (
          <><Zap className="w-4 h-4" /> Hızımı Ölç</>
        )}
      </button>

      {o && (
        <div className="mt-3 bg-[#e0f7fa]/60 border border-[#0097a7]/20 rounded-xl p-3 text-sm text-gray-700">
          <p className="mb-2">{o.text}</p>
          <Link href={o.href} className="inline-flex items-center gap-1 font-semibold text-[#0097a7]">
            {o.cta} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      <p className="text-[11px] text-gray-400 text-center mt-3">
        Test yaklaşık 15 saniye sürer ve veri kullanır; mobil veride dikkatli olun.{" "}
        <Link href="/hiz-testi" className="text-[#0097a7] underline">Ayrıntılı test ve sonuç karşılaştırması</Link>
      </p>
    </div>
  );
}
