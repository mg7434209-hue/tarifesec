import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Cookie, X } from "lucide-react";

const KEY = "tsec.cookieNotice";

/**
 * Çerez bilgilendirmesi.
 *
 * Site yalnızca ZORUNLU teknik çerez kullanır (ziyaretçi sayacı) — reklam veya
 * izleme çerezi yoktur. Bu yüzden "kabul et / reddet" seçimi sunan bir onay
 * duvarı gerekmez; yapılması gereken bilgilendirmedir. Kullanıcıyı sahte bir
 * seçimle karşılamak yerine ne yaptığımızı söyleyip yolundan çekiliyoruz.
 */
export default function CerezBilgisi() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* depolama kapalıysa gösterme */
    }
  }, []);

  if (!show) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* yoksay */
    }
    setShow(false);
  };

  return (
    <div
      role="region"
      aria-label="Çerez bilgilendirmesi"
      className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4"
    >
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 shadow-lg rounded-xl p-4 flex items-start gap-3">
        <Cookie className="w-5 h-5 text-[#0097a7] flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-gray-600 flex-1">
          Bu sitede yalnızca ziyaretçi sayımı için zorunlu bir teknik çerez
          kullanılır. Reklam veya izleme çerezi yoktur.{" "}
          <Link href="/cerez-politikasi" className="text-[#0097a7] underline">
            Ayrıntılar
          </Link>
        </p>
        <button
          onClick={dismiss}
          className="text-sm font-semibold text-[#0097a7] hover:text-[#00838f] px-2 py-1 flex-shrink-0"
          aria-label="Bilgilendirmeyi kapat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
