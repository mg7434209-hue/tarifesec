import { Shield, Scale, RefreshCw, CheckCircle2, Mail } from "lucide-react";
import { useRouteSeo } from "@/lib/hooks";
import { SITE_INFO } from "@shared/site";
import { ABOUT_INTRO, ABOUT_SECTIONS } from "@shared/about";

const ICONS = { scale: Scale, refresh: RefreshCw, check: CheckCircle2, mail: Mail, shield: Shield };

export default function Hakkimizda() {
  useRouteSeo("/hakkimizda");

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Hakkımızda</h1>
      <p className="text-gray-600 mb-8 leading-relaxed">
        {SITE_INFO.name}, {ABOUT_INTRO}
      </p>

      {ABOUT_SECTIONS.map((b) => {
        const Icon = ICONS[b.key];
        return (
        <section key={b.title} className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="w-4 h-4 text-[#0097a7]" />
            <h2 className="font-semibold text-gray-900">{b.title}</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{b.text}</p>
        </section>
        );
      })}
    </div>
  );
}
