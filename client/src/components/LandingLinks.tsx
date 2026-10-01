import { Link } from "wouter";
import { LANDINGS, type LandingKind } from "@shared/landings";
import { useLiveLandings } from "@/lib/landing";

/**
 * Operatöre / türe göre açılış sayfalarına iç bağlantılar.
 * Sunucudaki landingLinks() ile AYNI liste: yalnızca verisi olan sayfalar
 * (boş sayfa 404 döner, ona bağlantı verilmez).
 */
export default function LandingLinks({ kind, exclude }: { kind: LandingKind; exclude?: string }) {
  const live = useLiveLandings();
  const list = LANDINGS.filter((l) => l.kind === kind && l.path !== exclude && live.has(l.path));
  if (!list.length) return null;

  const title =
    kind === "internet" ? "Ev interneti: operatöre ve türe göre" : "Mobil tarifeler: operatöre ve hat türüne göre";

  return (
    <nav aria-label={title} className="mt-10">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">{title}</h2>
      <ul className="flex flex-wrap gap-2">
        {list.map((l) => (
          <li key={l.path}>
            <Link
              href={l.path}
              className="inline-block text-sm bg-white border border-gray-200 rounded-full px-3 py-1.5 text-gray-700 hover:border-[#0097a7] hover:text-[#0097a7] transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
