import { Link } from "wouter";
import { useEffect } from "react";

export default function NotFound() {
  // SPA fallback 200 döndürdüğü için arama motorlarına yumuşak 404
  // sinyali vermek üzere sayfayı indeks dışı bırakıyoruz.
  useEffect(() => {
    document.title = "Sayfa bulunamadı — tarifesec.net.tr";

    // Var olan robots etiketini geçici olarak değiştir; ikinci (çelişen)
    // etiket eklemek yerine eskisini geri koyuyoruz.
    const meta = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const previous = meta?.content ?? null;
    if (meta) meta.content = "noindex, follow";

    return () => {
      if (meta && previous !== null) meta.content = previous;
    };
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
      <p className="text-gray-600 mb-6">Bu sayfa bulunamadı.</p>
      <Link href="/" className="bg-[#0097a7] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#00838f] transition-colors">
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
