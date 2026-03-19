import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMobile } from "@/lib/api";
import { Phone, Star, ExternalLink } from "lucide-react";

const OPERATORS = [
  { value: "", label: "Tüm Operatörler" },
  { value: "turkcell", label: "Turkcell" },
  { value: "vodafone", label: "Vodafone" },
  { value: "turk-telekom", label: "Türk Telekom" },
];

const CONTRACT_OPTS = [
  { value: "", label: "Tümü" },
  { value: "true", label: "Faturalı" },
  { value: "false", label: "Faturasız" },
];

const OPERATOR_COLORS: Record<string, string> = {
  turkcell: "#FFD700",
  vodafone: "#e60000",
  "turk-telekom": "#002d72",
};

const OPERATOR_TEXT: Record<string, string> = {
  turkcell: "#000",
  vodafone: "#fff",
  "turk-telekom": "#fff",
};

export default function MobilTarifeler() {
  const [operator, setOperator] = useState("");
  const [isContract, setIsContract] = useState("");
  const [sort, setSort] = useState("price_asc");

  const { data, isLoading } = useQuery({
    queryKey: ["mobile", operator, isContract, sort],
    queryFn: () =>
      fetchMobile({
        operator: operator || undefined,
        isContract: isContract === "" ? undefined : isContract === "true",
        sort,
      }),
  });

  const tariffs = data?.data ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Mobil Hat Tarifeleri</h1>
      <p className="text-sm text-gray-500 mb-6">Turkcell, Vodafone ve Türk Telekom güncel faturalı hat fiyatları</p>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap gap-3">
        {[
          { label: "Operatör", value: operator, onChange: setOperator, options: OPERATORS },
          { label: "Hat Türü", value: isContract, onChange: setIsContract, options: CONTRACT_OPTS },
          { label: "Sıralama", value: sort, onChange: setSort, options: [
            { value: "price_asc", label: "Ucuzdan Pahalıya" },
            { value: "price_desc", label: "Pahalıdan Ucuza" },
          ]},
        ].map((f) => (
          <div key={f.label} className="flex-1 min-w-[150px]">
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
        {isLoading ? "Yükleniyor..." : `${tariffs.length} tarife bulundu`}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tariffs.map((t: any) => {
          const bgColor = OPERATOR_COLORS[t.operatorSlug] ?? "#666";
          const txtColor = OPERATOR_TEXT[t.operatorSlug] ?? "#fff";
          const features = t.features ? JSON.parse(t.features) : [];
          return (
            <div
              key={t.id}
              className={`bg-white border rounded-xl p-5 flex flex-col hover:shadow-md transition-shadow ${t.isFeatured ? "border-[#0097a7] ring-1 ring-[#0097a7]" : "border-gray-200"}`}
            >
              {t.isFeatured && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0097a7] bg-[#e0f7fa] rounded-full px-2 py-0.5 mb-3 self-start">
                  <Star className="w-3 h-3" /> Popüler
                </span>
              )}
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded"
                  style={{ backgroundColor: bgColor, color: txtColor }}
                >
                  {t.operator}
                </span>
                <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                  {t.isContract ? "Faturalı" : "Faturasız"}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{t.name}</h3>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-2xl font-bold text-gray-900">{t.priceMonthly}₺</span>
                <span className="text-xs text-gray-400">/ay</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#0097a7]" />
                  {t.gbLimit ? `${t.gbLimit} GB` : "Sınırsız"}
                </span>
                {!t.minuteLimit && <span>Sınırsız Dakika</span>}
              </div>
              {features.length > 0 && (
                <ul className="text-xs text-gray-500 space-y-1 mb-4 flex-1">
                  {features.map((f: string) => <li key={f}>✓ {f}</li>)}
                </ul>
              )}
              <a
                href={t.officialUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto flex items-center justify-center gap-1.5 border border-gray-300 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Başvur <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
