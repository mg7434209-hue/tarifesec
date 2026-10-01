import { Link, useLocation } from "wouter";
import { ExternalLink, Wifi, Phone, ChevronRight } from "lucide-react";
import { landingByPath, filterPackages, filterMobile, landingSummary } from "@shared/landings";
import { PARTNER_REL } from "@shared/partners";
import { checkedLabel } from "@shared/freshness";
import { speedText } from "@shared/format";
import { useSeo, parseFeatures } from "@/lib/hooks";
import { useAllPackages, useAllMobile } from "@/lib/landing";
import LandingLinks from "@/components/LandingLinks";
import PartnerCard from "@/components/PartnerCard";
import Sss from "@/components/Sss";
import NotFound from "./NotFound";

const tl = (n: number) => `${Number(n).toLocaleString("tr-TR")} ₺`;
const fullName = (op: string, nm: string) =>
  nm.toLocaleLowerCase("tr").startsWith(op.toLocaleLowerCase("tr")) ? nm : `${op} ${nm}`;

/**
 * Arama niyetine özel açılış sayfası (shared/landings.ts).
 *
 * Sunucu aynı sayfayı aynı süzgeçle basar (server/seo/content.ts →
 * landingContent); kullanıcı ile botun gördüğü liste birebir aynıdır.
 */
export default function Landing() {
  const [location] = useLocation();
  const landing = landingByPath(location);
  const isNet = landing?.kind === "internet";

  const pkgQ = useAllPackages();
  const mobQ = useAllMobile();
  const q = isNet ? pkgQ : mobQ;

  useSeo({
    title: landing?.title ?? "Sayfa bulunamadı — tarifesec.net.tr",
    description: landing?.description,
    canonicalPath: landing?.path,
  });

  if (!landing) return <NotFound />;

  const rows: any[] = isNet
    ? filterPackages(landing, pkgQ.data?.data ?? [])
    : filterMobile(landing, mobQ.data?.data ?? []);

  // Veri geldi ve liste boş → sunucu da 404 veriyor
  if (!q.isLoading && !q.isError && rows.length === 0) return <NotFound />;

  const parent = isNet
    ? { label: "Ev İnterneti", href: "/paket-karsilastir" }
    : { label: "Mobil Tarifeler", href: "/mobil-tarifeler" };
  const summary = landingSummary(landing, rows);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <nav aria-label="Konum" className="text-xs text-gray-500 mb-4">
        <ol className="flex flex-wrap items-center gap-1">
          <li><Link href="/" className="hover:text-[#0097a7]">Ana Sayfa</Link></li>
          <li aria-hidden="true"><ChevronRight className="w-3 h-3" /></li>
          <li><Link href={parent.href} className="hover:text-[#0097a7]">{parent.label}</Link></li>
          <li aria-hidden="true"><ChevronRight className="w-3 h-3" /></li>
          <li aria-current="page" className="text-gray-700">{landing.label}</li>
        </ol>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{landing.h1}</h1>
      <div className="max-w-3xl space-y-3 text-gray-600 mb-4">
        {landing.intro.map((p) => <p key={p}>{p}</p>)}
      </div>
      {summary && <p className="max-w-3xl font-semibold text-gray-900 mb-6">{summary}</p>}

      {q.isLoading ? (
        <p className="text-sm text-gray-400 py-10">Yükleniyor…</p>
      ) : q.isError ? (
        <p className="text-sm text-red-600 py-10">Liste yüklenemedi. Lütfen sayfayı yenileyin.</p>
      ) : (
        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((r) => (isNet ? <PkgCard key={r.id} p={r} /> : <MobileCard key={r.id} t={r} />))}
        </ol>
      )}

      <p className="text-sm text-gray-500 mt-6">
        Tüm operatörleri filtrelemek için{" "}
        <Link href={parent.href} className="text-[#0097a7] font-medium">
          {isNet ? "ev interneti karşılaştırma" : "mobil tarife karşılaştırma"}
        </Link>{" "}
        sayfasına bakın.
      </p>

      <LandingLinks kind={landing.kind} exclude={landing.path} />

      <div className="mt-10">
        <PartnerCard context="internet" placement="sonucAlti" />
      </div>

      <Sss items={landing.faq} />

    </div>
  );
}

/** Operatör bağlantısı: iş ortaklığı (affiliate) varsa rel="sponsored" */
function Basvur({ affiliateUrl, officialUrl }: { affiliateUrl?: string | null; officialUrl?: string | null }) {
  const href = affiliateUrl ?? officialUrl;
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel={affiliateUrl ? PARTNER_REL : "noopener noreferrer"}
      className={`mt-auto flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 rounded-lg transition-colors ${
        affiliateUrl
          ? "bg-[#0097a7] hover:bg-[#00838f] text-white"
          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
      }`}
    >
      Başvur <ExternalLink className="w-3.5 h-3.5" />
    </a>
  );
}

/** Son kontrol tarihi — sunucu çıktısıyla aynı kural */
function Kontrol({ r }: { r: any }) {
  return (
    <p className="text-xs text-gray-400 mb-3">
      {checkedLabel(r)}
    </p>
  );
}

function PkgCard({ p }: { p: any }) {
  const features = parseFeatures(p.features);
  const fark = p.priceNoCommitment && p.priceNoCommitment > p.priceMonthly ? p.priceNoCommitment - p.priceMonthly : 0;
  return (
    <li className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col hover:shadow-md transition-shadow">
      <span className="text-xs font-bold uppercase tracking-wide text-[#0097a7] mb-1">{p.operator}</span>
      <h3 className="font-semibold text-gray-900 mb-2">{fullName(p.operator, p.name)}</h3>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-bold text-gray-900">{tl(p.priceMonthly)}</span>
        <span className="text-xs text-gray-400">/ay</span>
      </div>
      <p className="text-sm text-gray-600 mb-3 flex flex-wrap gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-1"><Wifi className="w-3.5 h-3.5 text-[#0097a7]" />{speedText(p.downloadSpeed)}</span>
        {p.uploadSpeed ? <span>{p.uploadSpeed} Mbps yükleme</span> : null}
        <span>{p.dataLimit ?? "Limitsiz"}</span>
        {p.commitmentMonths ? <span>{p.commitmentMonths} ay taahhüt</span> : null}
        {p.modemIncluded ? <span>modem dahil</span> : null}
      </p>
      {p.priceNoCommitment ? (
        <p className="text-xs text-gray-500 mb-3">
          Taahhütsüz: {tl(p.priceNoCommitment)}/ay{fark ? ` (+${tl(fark)})` : ""}
        </p>
      ) : null}
      {features.length > 0 && (
        <ul className="text-xs text-gray-500 space-y-1 mb-4">
          {features.map((f) => <li key={f}>✓ {f}</li>)}
        </ul>
      )}
      <Kontrol r={p} />
      <Basvur affiliateUrl={p.affiliateUrl} officialUrl={p.officialUrl} />
    </li>
  );
}

function MobileCard({ t }: { t: any }) {
  return (
    <li className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wide text-[#0097a7]">{t.operator}</span>
        <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
          {t.isContract ? "Faturalı" : "Faturasız"}
        </span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{fullName(t.operator, t.name)}</h3>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-2xl font-bold text-gray-900">{tl(t.priceMonthly)}</span>
        <span className="text-xs text-gray-400">/ay</span>
      </div>
      <p className="text-sm text-gray-600 mb-4 flex flex-wrap gap-x-3">
        <span className="inline-flex items-center gap-1">
          <Phone className="w-3.5 h-3.5 text-[#0097a7]" />
          {t.gbLimit ? `${t.gbLimit} GB internet` : "Sınırsız internet"}
        </span>
        <span>{t.minuteLimit ? `${t.minuteLimit} dakika` : "Sınırsız dakika"}</span>
      </p>
      <Kontrol r={t} />
      <Basvur affiliateUrl={t.affiliateUrl} officialUrl={t.officialUrl} />
    </li>
  );
}
