import { ExternalLink } from "lucide-react";
import { byContext, PARTNER_REL, AD_PLACEMENTS, type PartnerContext, type Partner } from "@shared/partners";

/**
 * İş ortağı / reklam alanı.
 *
 * Yükseklik SABİT rezerve edilir — içerik geç gelse bile sayfa zıplamaz
 * (Cumulative Layout Shift = 0, Core Web Vitals sıralama sinyali).
 *
 * Dış bağlantılar rel="sponsored noopener noreferrer" taşır: ticari
 * yönlendirme olduğu için Google'ın istediği işaretleme budur.
 */

function Kart({ partner, compact }: { partner: Partner; compact?: boolean }) {
  return (
    <a
      href={partner.url}
      target="_blank"
      rel={PARTNER_REL}
      data-partner={partner.id}
      className="group block bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-gray-300 transition-all h-full"
    >
      <div className="flex items-start gap-3">
        <span
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: partner.color }}
          aria-hidden="true"
        >
          {partner.name[0].toUpperCase()}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{partner.name}</h3>
            <span className="text-[10px] uppercase tracking-wide text-gray-400 border border-gray-200 rounded px-1 py-0.5 flex-shrink-0">
              reklam
            </span>
          </div>
          {!compact && <p className="text-sm text-gray-500 mb-3">{partner.description}</p>}
          <span
            className="text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all"
            style={{ color: partner.color }}
          >
            {partner.cta} <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </a>
  );
}

export default function PartnerCard({
  context = "genel",
  placement,
  compact,
  only,
}: {
  context?: PartnerContext;
  /** AD_PLACEMENTS anahtarı — alan yüksekliğini rezerve eder */
  placement?: keyof typeof AD_PLACEMENTS;
  compact?: boolean;
  /** Yalnızca belirli ortağı göster */
  only?: string;
}) {
  const all = byContext(context);
  const partners = only ? all.filter((p) => p.id === only) : all;
  if (!partners.length) return null;

  const slot = placement ? AD_PLACEMENTS[placement] : null;

  return (
    <aside
      aria-label="Sponsorlu içerik"
      className="grid gap-3 sm:grid-cols-2"
      style={
        slot
          ? ({ "--slot-h-mobile": `${slot.height.mobile}px`, "--slot-h-desktop": `${slot.height.desktop}px` } as React.CSSProperties)
          : undefined
      }
    >
      {partners.map((p) => (
        <Kart key={p.id} partner={p} compact={compact} />
      ))}
    </aside>
  );
}
