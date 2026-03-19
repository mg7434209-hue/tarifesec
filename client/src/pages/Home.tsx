import { Link } from "wouter";
import { Zap, Smartphone, BarChart3, ArrowRight, CheckCircle, Shield } from "lucide-react";

const OPERATORS = [
  { name: "Superonline", color: "#0097a7" },
  { name: "Turkcell", color: "#FFD700", text: "#000" },
  { name: "Vodafone", color: "#E60000" },
  { name: "Türk Telekom", color: "#002D72" },
  { name: "TurkNet", color: "#FF6B00" },
];

const FEATURES = [
  {
    icon: BarChart3,
    title: "Paket Karşılaştırma",
    desc: "Fiber, kablosuz ve ADSL paketlerini filtrele, yan yana karşılaştır.",
    href: "/paket-karsilastir",
    cta: "Paketi Bul",
  },
  {
    icon: Smartphone,
    title: "Mobil Tarifeler",
    desc: "Turkcell, Vodafone ve Türk Telekom güncel faturalı hat fiyatlarını karşılaştır.",
    href: "/mobil-tarifeler",
    cta: "Tarifeyi Seç",
  },
  {
    icon: Zap,
    title: "Hız Testi",
    desc: "Mevcut bağlantı hızını ölç, ISP performansını gör.",
    href: "/hiz-testi",
    cta: "Hızı Test Et",
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a237e] to-[#0097a7] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            Bağımsız Karşılaştırma Platformu
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Türkiye'nin Tüm Tarifelerini<br />
            <span className="text-[#4dd0e1]">Tek Yerde Karşılaştır</span>
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Superonline, Turkcell, Vodafone ve Türk Telekom internet ile mobil
            paketlerini tarafsız olarak karşılaştırın. Hız testi yapın.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/paket-karsilastir"
              className="bg-[#0097a7] hover:bg-[#00838f] text-white font-semibold px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
            >
              Paketi Karşılaştır <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/mobil-tarifeler"
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Mobil Tarife Bul
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-5 mt-8 text-sm text-blue-100">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" />5 Operatör</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" />Tarafsız Karşılaştırma</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" />Ücretsiz Araçlar</span>
          </div>
        </div>
      </section>

      {/* Operator strip */}
      <section className="bg-white border-b border-gray-100 py-5 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center items-center gap-6 md:gap-10">
          {OPERATORS.map((op) => (
            <div key={op.name} className="flex flex-col items-center gap-1">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: op.color, color: op.text ?? "#fff" }}
              >
                {op.name[0]}
              </div>
              <span className="text-xs text-gray-500">{op.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="w-10 h-10 rounded-xl bg-[#e0f7fa] flex items-center justify-center mb-4">
              <f.icon className="w-5 h-5 text-[#0097a7]" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h2>
            <p className="text-sm text-gray-500 flex-1 mb-4">{f.desc}</p>
            <Link
              href={f.href}
              className="text-sm font-semibold text-[#0097a7] flex items-center gap-1 hover:gap-2 transition-all"
            >
              {f.cta} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </section>

      {/* Bağımsızlık bandı */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-[#e0f7fa] flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-[#0097a7]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Neden tarifesec.net.tr?</h2>
            <p className="text-sm text-gray-500">
              Herhangi bir operatörle ticari bağımız yoktur. Tüm karşılaştırmalar
              operatörlerin resmi sitelerindeki güncel fiyatlara dayanır. Amacımız
              tek bir yerde en doğru bilgiyle doğru kararı vermenize yardımcı olmaktır.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
