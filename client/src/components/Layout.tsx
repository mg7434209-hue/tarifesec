import { Link, useLocation } from "wouter";
import { Menu, X, Wifi } from "lucide-react";
import { useState } from "react";

const NAV = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Ev İnterneti", href: "/paket-karsilastir" },
  { label: "Mobil Tarifeler", href: "/mobil-tarifeler" },
  { label: "Hız Testi", href: "/hiz-testi" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[#0097a7]">
            <Wifi className="w-6 h-6" />
            <span>tarife<span className="text-[#1a237e]">sec</span>.net.tr</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  location === item.href
                    ? "text-[#0097a7]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/paket-karsilastir"
            className="hidden md:flex items-center gap-2 bg-[#0097a7] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#00838f] transition-colors"
          >
            Paketi Karşılaştır
          </Link>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-700 py-1"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-[#1a237e] text-white mt-16">
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg mb-3">
              <Wifi className="w-5 h-5 text-[#0097a7]" />
              tarifesec.net.tr
            </div>
            <p className="text-sm text-blue-200">
              Türkiye'nin tüm internet ve mobil tarifelerini bağımsız olarak karşılaştırın.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-blue-300">Sayfalar</h3>
            <ul className="space-y-2 text-sm text-blue-100">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-blue-300">Hakkımızda</h3>
            <p className="text-sm text-blue-100 mb-2">
              tarifesec.net.tr, Türkiye'deki tüm internet ve mobil operatörlerin paketlerini
              tarafsız biçimde karşılaştıran bağımsız bir platformdur.
            </p>
            <p className="text-sm text-blue-100">
              Herhangi bir operatörle ticari ilişkimiz bulunmamaktadır.
            </p>
          </div>
        </div>
        <div className="border-t border-blue-800 text-center py-4 text-xs text-blue-300">
          © {new Date().getFullYear()} tarifesec.net.tr — Fiyatlar bilgi amaçlıdır, güncel fiyatlar için operatör sitesini ziyaret edin.
        </div>
      </footer>
    </div>
  );
}
