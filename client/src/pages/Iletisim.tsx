import { Mail, Phone, MapPin, Shield } from "lucide-react";
import { SITE_INFO, hasContactPhone, hasContactAddress } from "@shared/site";
import { useRouteSeo } from "@/lib/hooks";
import TeklifFormu from "@/components/TeklifFormu";

/**
 * İletişim sayfası.
 * Ticari bir sitede ziyaretçinin site sahibine ulaşabilmesi hem yasal
 * beklenti hem de güven unsurudur; önceden hiçbir iletişim yolu yoktu.
 */
export default function Iletisim() {
  useRouteSeo("/iletisim");

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">İletişim</h1>
      <p className="text-gray-600 mb-8">
        Soru, öneri veya kişisel verilerinizle ilgili taleplerinizi bize iletebilirsiniz.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 mb-10">
        <a
          href={`mailto:${SITE_INFO.company.email}`}
          className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#0097a7]/40 hover:shadow-sm transition-all"
        >
          <Mail className="w-5 h-5 text-[#0097a7] mb-2" />
          <div className="text-xs text-gray-500 mb-0.5">E-posta</div>
          <div className="font-medium text-gray-900 break-all">{SITE_INFO.company.email}</div>
        </a>

        {hasContactPhone() && (
          <a
            href={`tel:${SITE_INFO.company.phone.replace(/\s/g, "")}`}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#0097a7]/40 hover:shadow-sm transition-all"
          >
            <Phone className="w-5 h-5 text-[#0097a7] mb-2" />
            <div className="text-xs text-gray-500 mb-0.5">Telefon</div>
            <div className="font-medium text-gray-900">{SITE_INFO.company.phone}</div>
          </a>
        )}

        {hasContactAddress() && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <MapPin className="w-5 h-5 text-[#0097a7] mb-2" />
            <div className="text-xs text-gray-500 mb-0.5">Adres</div>
            <div className="font-medium text-gray-900">{SITE_INFO.company.address}</div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-10 flex gap-3">
        <Shield className="w-5 h-5 text-[#0097a7] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-600">
          Kişisel verilerinizin silinmesini veya düzeltilmesini talep etmek için
          yukarıdaki e-posta adresine yazmanız yeterlidir. Talebiniz en geç 30 gün
          içinde sonuçlandırılır. Ayrıntılar{" "}
          <a href="/kvkk" className="text-[#0097a7] underline">KVKK Aydınlatma Metni</a>'nde.
        </p>
      </div>

      <TeklifFormu />
    </div>
  );
}
