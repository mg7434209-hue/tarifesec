import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPackages } from "@/lib/api";
import { Wifi, Star, ExternalLink, SlidersHorizontal, TrendingUp, TrendingDown } from "lucide-react";

const OPERATORS = [
  { value: "", label: "Tüm Operatörler" },
  { value: "superonline", label: "Superonline" },
  { value: "turk-telekom", label: "Türk Telekom" },
  { value: "vodafone", label: "Vodafone" },
  { value: "turknet", label: "TurkNet" },
];

const TYPES = [
  { value: "", label: "Tüm Türler" },
  { value: "fiber", label: "Fiber" },
  { value: "kablosuz", label: "Kablosuz" },
  { value: "adsl", label: "ADSL/VDSL" },
];

const SPEEDS = [
  { value: "", label: "Tüm Hızlar" },
  { value: "25", label: "25+ Mbps" },
  { value: "100", label: "100+ Mbps" },
  { value: "250", label: "250+ Mbps" },
];

const SORTS = [
  { value: "price_asc", label: "Fiyat (Düşük → Yüksek)" },
  { value: "price_desc", label: "Fiyat (Yüksek → Düşük)" },
  { value: "speed_desc", label: "Hız (Yüksek → Düşük)" },
];

const OP_COLORS: Record<string, string> = {
  superonline: "#0097a7",
  "turk-telekom": "#002d72",
  vodafone: "#e60000",
  turknet: "#ff6b00",
};

function PriceBadge({ pkg }: { pkg: any }) {
  if (!pkg.priceChanged) return null;
  const isUp = pkg.priceChangeDirection === "up";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
      isUp ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"
    }`}>
      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {isUp ? "Fiyat arttı" : "Fiyat düştü"}
    </span>
  );
}

export default function PaketKarsilastirma() {
  const [operator, setOperator] = useState("");
  const [type, setType] = useState("");
  const [minSpeed, setMinSpeed] = useState("");
  const [sort, setSort] = useState("price_asc");

  const { data, isLoading } = useQuery({
    queryKey: ["packages", operator, type, minSpeed, sort],
    queryFn: () => fetchPackages({
      operator: operator || undefined,
      type: type || undefined,
      minSpeed: minSpeed ? Number(minSpeed) : undefined,
      sort,
    }),
  });

  const pkgs = data?.data ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">İnternet Paketi Karşılaştırma</h1>
      <p className="text-sm text-gray-500 mb-6">Tüm operatörlerin ev interneti paketlerini filtreleyin</p>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Operatör", value: operator, set: setOperator, opts: OPERATORS },
          { label: "Tür", value: type, set: setType, opts: TYPES },
          { label: "Hız", value: minSpeed, set: setMinSpeed, opts: SPEEDS },
          { label: "Sıralama", value: sort, set: setSort, opts: SORTS },
        ].map((f) => (
          <div key={f.label}>
            <label className="text-xs text-gray-500 font-medium block mb-1">{f.label}</label>
            <select
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0097a7]/30"
            >
              {f.opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {isLoading ? "Yükleniyor..." : `${pkgs.length} paket bulundu`}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pkgs.map((pkg: any) => {
          const color = OP_COLORS[pkg.operatorSlug] ?? "#666";
          const features = pkg.features ? JSON.parse(pkg.features) : [];
          const borderClass = pkg.priceChanged
            ? pkg.priceChangeDirection === "up"
              ? "border-red-300 ring-1 ring-red-200"
              : "border-green-300 ring-1 ring-green-200"
            : pkg.isFeatured
            ? "border-[#0097a7] ring-1 ring-[#0097a7]"
            : "border-gray-200";

          return (
            <div key={pkg.id} className={`bg-white border rounded-xl p-5 flex flex-col hover:shadow-md transition-shadow ${borderClass}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex flex-col gap-1">
                  {pkg.isFeatured && !pkg.priceChanged && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0097a7] bg-[#e0f7fa] rounded-full px-2 py-0.5 self-start">
                      <Star className="w-3 h-3" /> Öne Çıkan
                    </span>
                  )}
                  <PriceBadge pkg={pkg} />
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{pkg.type}</span>
              </div>

              <span className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color }}>{pkg.operator}</span>
              <h3 className="font-semibold text-gray-900 mb-2">{pkg.name}</h3>

              <div className="flex items-baseline gap-2 mb-1">
                <span className={`text-2xl font-bold ${pkg.priceChangeDirection === "up" ? "text-red-600" : pkg.priceChangeDirection === "down" ? "text-green-600" : "text-gray-900"}`}>
                  {pkg.priceMonthly}₺
                </span>
                <span className="text-xs text-gray-400">/ay</span>
                {pkg.previousPrice && (
                  <span className="text-sm text-gray-400 line-through">{pkg.previousPrice}₺</span>
                )}
              </div>

              {pkg.priceChanged && (
                <p className="text-xs text-gray-400 mb-2">
                  Güncel fiyat için operatör sitesini ziyaret edin
                </p>
              )}

              <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                <span className="flex items-center gap-1"><Wifi className="w-3.5 h-3.5 text-[#0097a7]" />{pkg.downloadSpeed} Mbps</span>
                <span>{pkg.dataLimit ?? "Limitsiz"}</span>
              </div>

              {features.length > 0 && (
                <ul className="text-xs text-gray-500 space-y-1 mb-4 flex-1">
                  {features.map((f: string) => <li key={f}>✓ {f}</li>)}
                </ul>
              )}

              <div className="text-xs text-gray-300 mb-3">
                {pkg.lastScrapedAt
                  ? `Son kontrol: ${new Date(pkg.lastScrapedAt).toLocaleDateString("tr-TR")}`
                  : "Manuel güncelleme"}
              </div>

              <a
                href={pkg.affiliateUrl ?? pkg.officialUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-auto flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 rounded-lg transition-colors ${
                  pkg.affiliateUrl
                    ? "bg-[#0097a7] hover:bg-[#00838f] text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Başvur <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          );
        })}
      </div>

      {!isLoading && pkgs.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <SlidersHorizontal className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>Filtrelere uyan paket bulunamadı.</p>
        </div>
      )}
    </div>
  );
}
