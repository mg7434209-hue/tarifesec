import { useEffect, useState } from "react";
import { Users, Activity, CalendarDays } from "lucide-react";
import { fetchVisitors, VISITOR_MIN, type VisitorStats } from "@/lib/api";
import { useCountUp } from "@/lib/hooks";

/** Sekme görünürken sayaç bu aralıkla tazelenir ("şu an sitede" canlı kalsın) */
const REFRESH_MS = 60_000;

/**
 * Footer ziyaretçi sayacı — canlı.
 *
 * - Toplam = sunucu tabanı (1000) + gerçek tekil ziyaret sayısı
 * - Bugün = bugünkü tekil ziyaretçi
 * - Şu an sitede = son 5 dk'da sayfası açık olan tekil ziyaretçi
 *
 * Sayfa açıkken dakikada bir tazelenir (sekme arka plandayken istek atmaz).
 * API ilk açılışta yanıt vermezse 1.000 tabanı gösterilir; sonraki
 * tazelemelerde gerçek değere geçer.
 */
export default function VisitCounter() {
  const [stats, setStats] = useState<VisitorStats | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      if (document.visibilityState === "hidden") return;
      fetchVisitors().then((s) => {
        if (alive && s) setStats(s);
      });
    };

    load();
    const timer = window.setInterval(load, REFRESH_MS);
    document.addEventListener("visibilitychange", load);
    return () => {
      alive = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", load);
    };
  }, []);

  const target = Math.max(stats?.total ?? VISITOR_MIN, VISITOR_MIN);
  // Animasyon 1000 tabanından başlar; rozet asla 1000'in altını göstermez.
  const shown = useCountUp(target, 1600, VISITOR_MIN);
  const n = (v: number) => v.toLocaleString("tr-TR");

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2 text-xs"
      aria-live="polite"
      aria-label="Ziyaretçi istatistikleri"
    >
      <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5 text-blue-100">
        <Users className="w-3.5 h-3.5 text-[#4dd0e1]" aria-hidden="true" />
        Toplam ziyaretçi:{" "}
        <strong className="text-white font-semibold tabular-nums">{n(Math.max(shown, VISITOR_MIN))}</strong>
      </span>

      {stats && stats.today > 0 && (
        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5 text-blue-100">
          <CalendarDays className="w-3.5 h-3.5 text-[#4dd0e1]" aria-hidden="true" />
          Bugün: <strong className="text-white font-semibold tabular-nums">{n(stats.today)}</strong>
        </span>
      )}

      {stats && stats.online > 0 && (
        <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5 text-blue-100">
          <span className="relative flex w-2 h-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping motion-reduce:hidden" />
            <span className="relative inline-flex rounded-full w-2 h-2 bg-green-400" />
          </span>
          <Activity className="w-3.5 h-3.5 text-[#4dd0e1]" aria-hidden="true" />
          Şu an sitede: <strong className="text-white font-semibold tabular-nums">{n(stats.online)}</strong>
        </span>
      )}
    </div>
  );
}
