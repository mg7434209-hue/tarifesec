/**
 * Hız göstergesi — yarım daire kadran + ibre.
 *
 * Ölçek LOGARİTMİKTİR: 1-1000 Mbps aralığını doğrusal göstermek, tipik ev
 * bağlantılarını (50-300 Mbps) kadranın dar bir bölgesine sıkıştırırdı.
 */
const MIN = 1;
const MAX = 1000;
const TICKS = [1, 5, 10, 25, 50, 100, 250, 500, 1000];

const toAngle = (mbps: number) => {
  const v = Math.max(MIN, Math.min(mbps, MAX));
  const ratio = Math.log10(v / MIN) / Math.log10(MAX / MIN);
  return -90 + ratio * 180;
};

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

export default function SpeedGauge({
  value,
  active,
  unit = "Mbps",
  label,
}: {
  value: number;
  active?: boolean;
  unit?: string;
  label?: string;
}) {
  const cx = 140;
  const cy = 132;
  const r = 104;
  const angle = toAngle(value);

  const start = polar(cx, cy, r, -90);
  const end = polar(cx, cy, r, 90);
  const cur = polar(cx, cy, r, angle);
  const needle = polar(cx, cy, r - 22, angle);

  // Dolan yay
  const largeArc = angle - -90 > 180 ? 1 : 0;

  return (
    <svg viewBox="0 0 280 168" className="w-full max-w-[320px] mx-auto" role="img"
         aria-label={`${label ?? "Hız"}: ${value.toFixed(1)} ${unit}`}>
      {/* Kadran zemini */}
      <path
        d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`}
        fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round"
      />
      {/* Dolan kısım */}
      {value > 0 && (
        <path
          d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${cur.x} ${cur.y}`}
          fill="none" stroke="#0097a7" strokeWidth="14" strokeLinecap="round"
          style={{ transition: active ? "none" : "stroke-dasharray .4s ease" }}
        />
      )}

      {/* Ölçek çentikleri */}
      {TICKS.map((t) => {
        const a = toAngle(t);
        const p1 = polar(cx, cy, r - 12, a);
        const p2 = polar(cx, cy, r - 6, a);
        const lp = polar(cx, cy, r - 26, a);
        return (
          <g key={t}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#9ca3af" strokeWidth="1.5" />
            <text x={lp.x} y={lp.y} fontSize="9" fill="#9ca3af" textAnchor="middle" dominantBaseline="middle">
              {t >= 1000 ? "1G" : t}
            </text>
          </g>
        );
      })}

      {/* İbre */}
      <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke="#1a237e" strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="6" fill="#1a237e" />

      {/* Değer */}
      <text x={cx} y={cy - 34} fontSize="34" fontWeight="700" fill="#111827" textAnchor="middle">
        {value >= 100 ? value.toFixed(0) : value.toFixed(1)}
      </text>
      <text x={cx} y={cy - 16} fontSize="11" fill="#6b7280" textAnchor="middle">
        {unit}
      </text>
    </svg>
  );
}
