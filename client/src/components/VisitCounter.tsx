import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { fetchVisitors, VISITOR_MIN } from "@/lib/api";
import { useCountUp } from "@/lib/hooks";

/**
 * Footer ziyaretçi sayacı rozeti.
 *
 * Gösterilen toplam = sunucu tabanı (1000) + gerçek tekil ziyaret sayısı,
 * yani rozet her zaman 1000 ve üzerinde bir değer gösterir.
 * API erişilemezse VISITOR_MIN ile zarifçe 1.000'de kalır.
 */
export default function VisitCounter() {
  const [stats, setStats] = useState<{ total: number; today: number } | null>(null);

  useEffect(() => {
    let alive = true;
    fetchVisitors().then((s) => {
      if (alive) setStats(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  const target = Math.max(stats?.total ?? VISITOR_MIN, VISITOR_MIN);
  // Animasyon 1000 tabanından başlar; rozet asla 1000'in altını göstermez.
  const shown = useCountUp(target, 1600, VISITOR_MIN);

  return (
    <div
      className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5"
      title={stats?.today ? `Bugün ${stats.today.toLocaleString("tr-TR")} ziyaretçi` : undefined}
    >
      <Users className="w-3.5 h-3.5 text-[#4dd0e1]" aria-hidden="true" />
      <span className="text-xs text-blue-100">
        Toplam ziyaretçi:{" "}
        <strong className="text-white font-semibold tabular-nums">
          {Math.max(shown, VISITOR_MIN).toLocaleString("tr-TR")}
        </strong>
      </span>
      {stats?.today ? (
        <span className="text-[11px] text-blue-300 border-l border-white/15 pl-2">
          bugün {stats.today.toLocaleString("tr-TR")}
        </span>
      ) : null}
    </div>
  );
}
