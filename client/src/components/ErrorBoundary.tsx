import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Hata sınırı.
 *
 * React'te yakalanmayan bir render hatası TÜM ağacı söker; kullanıcı bembeyaz
 * bir sayfa görür ve ne olduğunu anlamaz. Sınır, hatayı o dala hapseder ve
 * kullanılabilir bir ekran gösterir.
 *
 * Sunucu tarafı içerik zaten basıldığı için arama motorları bu durumdan
 * etkilenmez; sorun yalnızca tarayıcı tarafındadır.
 */
type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error("[ErrorBoundary] yakalanan hata:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
        </div>
        <h1 className="text-lg font-bold text-gray-900 mb-2">Bir şeyler ters gitti</h1>
        <p className="text-sm text-gray-500 mb-6">
          Sayfa görüntülenirken beklenmeyen bir hata oluştu. Yenilemek genellikle
          sorunu çözer.
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-[#0097a7] hover:bg-[#00838f] text-white text-sm font-semibold px-5 py-2.5 rounded-lg"
          >
            Sayfayı yenile
          </button>
          <a
            href="/"
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-lg"
          >
            Ana sayfa
          </a>
        </div>
      </div>
    );
  }
}
