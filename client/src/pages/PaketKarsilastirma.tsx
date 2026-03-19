import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPackages } from "@/lib/api";
import { Wifi, Star, ExternalLink, SlidersHorizontal } from "lucide-react";

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
  { value: "kablosuz", label: "Kablosuz (Superbox)" },
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

const OPERATOR_COLORS: Record<string, string> = {
  superonline: "#0097a7",
  "turk-telekom": "#002d72",
  vodafone: "#e60000",
  turknet: "#ff6b00",
  "d-smart": "#444",
};

export default function PaketKarsilastirma() {
  const [operator, setOperator] = useState("");
  const [type, setType] = useState("");
  const [minSpeed, setMinSpeed] = useState("");
  const [sort, setSort] = useState("price_asc");

  const { data, isLoading } = useQuery({
    queryKey: ["packages", operator, type, minSpeed, sort],
    queryFn: () => fetchPackages({ operator: operator || undefined, type: type || undefined, minSpeed: minSpeed ? Number(minSpeed) : undefined, sort }),
  });

  const packages = data?.data ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">İnternet Paketi Karşılaştırma</h1>
      <p className="text-gray-500 text-sm mb-6">Türkiye'deki tüm operatörlerin ev interneti paketlerini filtreleyin ve karşılaştırın</p>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Operatör", value: operator, onChange: setOperator, options: OPERATORS },
          { label: "Tür", value: type, onChange: setType, options: TYPES },
          { label: "Hız", value: minSpeed, onChange: setMinSpeed, options: SPEEDS },
          { label: "Sıralama", value: sort, onChange: setSort, options: SORTS },
        ].map((f) => (
          <div key={f.label}>
            <label className="text-xs text-gray-500 font-medium block mb-1">{f.label}</label>
            <select
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0097a7]/30"
            >
              {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {isLoading ? "Yükleniyor..." : `${packages.length} paket bulundu`}
      </p>

      {/* Package grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg: any) => {
          const color = OPERATOR_COLORS[pkg.operatorSlug] ?? "#666";
          const features = pkg.features ? JSON.parse(pkg.features) : [];
          return (
            <div
              key={pkg.id}
              className={`bg-white border rounded-xl p-5 flex flex-col hover:shadow-md transition-shadow ${pkg.isFeatured ? "border-[#0097a7] ring-1 ring-[#0097a7]" : "border-gray-200"}`}
            >
              {pkg.isFeatured && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0097a7] bg-[#e0f7fa] rounded-full px-2 py-0.5 mb-3 self-start">
                  <Star className="w-3 h-3" /> Öne Çıkan
                </span>
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color }}>{pkg.operator}</span>
                <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{pkg.type}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{pkg.name}</h3>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-2xl font-bold text-gray-900">{pkg.priceMonthly}₺</span>
                <span className="text-xs text-gray-400">/ay · {pkg.commitmentMonths} ay taahhüt</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                <span className="flex items-center gap-1"><Wifi className="w-3.5 h-3.5 text-[#0097a7]" />{pkg.downloadSpeed} Mbps</span>
                <span>{pkg.dataLimit ?? "Limitsiz"}</span>
              </div>
              {features.length > 0 && (
                <ul className="text-xs text-gray-500 space-y-1 mb-4 flex-1">
                  {features.map((f: string) => <li key={f} className="flex items-center gap-1.5">✓ {f}</li>)}
                </ul>
              )}
              {pkg.affiliateUrl ? (
                <a
                  href={pkg.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto flex items-center justify-center gap-1.5 bg-[#0097a7] hover:bg-[#00838f] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Başvur <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <a
                  href={pkg.officialUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto flex items-center justify-center gap-1.5 border border-gray-300 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Operatör Sitesi <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          );
        })}
      </div>

      {!isLoading && packages.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <SlidersHorizontal className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>Filtrelere uyan paket bulunamadı. Filtreleri genişletin.</p>
        </div>
      )}
    </div>
  );
}
