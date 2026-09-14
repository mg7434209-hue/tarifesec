import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Phone, CheckCircle2, Loader2 } from "lucide-react";
import { submitLead } from "@/lib/api";
import PartnerCard from "./PartnerCard";
import { Link } from "wouter";

const SEHIRLER = [
  "Adana", "Ankara", "Antalya", "Bursa", "Denizli", "Diyarbakır", "Eskişehir",
  "Gaziantep", "Hatay", "İstanbul", "İzmir", "Kayseri", "Kocaeli", "Konya",
  "Malatya", "Mersin", "Muğla", "Samsun", "Şanlıurfa", "Trabzon", "Diğer",
];

/**
 * Teklif talep formu — /api/leads'e yazar.
 * (Bu bileşen eklenene kadar submitLead() hiçbir sayfadan çağrılmıyordu;
 *  site fiilen hiç talep toplamıyordu.)
 */
export default function TeklifFormu({
  packageInterest,
  compact = false,
}: {
  packageInterest?: string;
  compact?: boolean;
}) {
  const [form, setForm] = useState({ name: "", phone: "", city: "", website: "" });
  const [onay, setOnay] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => submitLead({ ...form, packageInterest }),
    onError: (e: Error) => setError(e.message),
  });

  if (mutation.isSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <h3 className="font-semibold text-green-900 mb-1">Talebiniz alındı</h3>
        <p className="text-sm text-green-700 mb-5">
          En kısa sürede sizi arayıp size en uygun tarifeyi anlatacağız.
        </p>
        <div className="text-left">
          <p className="text-xs text-gray-500 mb-2">Beklemek istemiyorsanız:</p>
          <PartnerCard context="donusum" compact />
        </div>
      </div>
    );
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setError(null);
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        // KVKK 5/1: açık rıza olmadan kişisel veri işlenemez.
        if (!onay) {
          setError("Devam etmek için aydınlatma metnini onaylamanız gerekiyor.");
          return;
        }
        if (!form.phone.trim()) {
          setError("Telefon numarası gerekli.");
          return;
        }
        mutation.mutate();
      }}
      className={`bg-white border border-gray-200 rounded-2xl ${compact ? "p-5" : "p-6 md:p-8"}`}
    >
      <h2 className={`font-bold text-gray-900 ${compact ? "text-base mb-1" : "text-xl mb-2"}`}>
        Size en uygun tarifeyi bulalım
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Numaranızı bırakın, uzmanımız ücretsiz olarak sizi arasın.
      </p>

      <div className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"}`}>
        <div>
          <label htmlFor="lead-name" className="text-xs text-gray-500 font-medium block mb-1">
            Ad Soyad
          </label>
          <input
            id="lead-name"
            type="text"
            value={form.name}
            onChange={set("name")}
            autoComplete="name"
            placeholder="Adınız"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0097a7]/30"
          />
        </div>

        <div>
          <label htmlFor="lead-phone" className="text-xs text-gray-500 font-medium block mb-1">
            Telefon <span className="text-red-500">*</span>
          </label>
          <input
            id="lead-phone"
            type="tel"
            required
            value={form.phone}
            onChange={set("phone")}
            autoComplete="tel"
            inputMode="tel"
            placeholder="05XX XXX XX XX"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0097a7]/30"
          />
        </div>

        <div>
          <label htmlFor="lead-city" className="text-xs text-gray-500 font-medium block mb-1">
            Şehir
          </label>
          <select
            id="lead-city"
            value={form.city}
            onChange={set("city")}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#0097a7]/30"
          >
            <option value="">Seçiniz</option>
            {SEHIRLER.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* honeypot — ekran dışında, botlar doldurur */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={form.website}
        onChange={set("website")}
        className="absolute left-[-9999px] w-px h-px opacity-0"
      />

      <label className="flex items-start gap-2.5 mt-4 cursor-pointer">
        <input
          type="checkbox"
          checked={onay}
          onChange={(e) => { setOnay(e.target.checked); setError(null); }}
          className="mt-0.5 w-4 h-4 accent-[#0097a7] flex-shrink-0"
        />
        <span className="text-xs text-gray-500 leading-relaxed">
          Telefon numaramın, yalnızca bana uygun tarife seçeneklerini anlatmak
          amacıyla işlenmesine ve tarafımla iletişime geçilmesine izin veriyorum.{" "}
          <Link href="/kvkk" className="text-[#0097a7] underline">
            Aydınlatma metnini
          </Link>{" "}
          okudum.
        </span>
      </label>

      {error && (
        <p className="text-sm text-red-600 mt-3" role="alert">{error}</p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending || !onay}
        className="mt-4 w-full md:w-auto inline-flex items-center justify-center gap-2 bg-[#0097a7] hover:bg-[#00838f] disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        {mutation.isPending ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor…</>
        ) : (
          <><Phone className="w-4 h-4" /> Beni Arayın</>
        )}
      </button>

      <p className="text-xs text-gray-400 mt-3">
        Bilgileriniz yalnızca size dönüş yapmak için kullanılır, üçüncü kişilerle
        paylaşılmaz veya pazarlama listelerine eklenmez.
      </p>
    </form>
  );
}
