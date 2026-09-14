import { useRoute, Link } from "wouter";
import { FileText } from "lucide-react";
import { legalBySlug, LEGAL_DOCS } from "@shared/legal";
import { SITE_INFO } from "@shared/site";
import { useSeo } from "@/lib/hooks";
import NotFound from "./NotFound";

/** KVKK / Gizlilik / Çerez metinleri — ortak şablon */
export default function Yasal() {
  const [, params] = useRoute("/:slug");
  const doc = legalBySlug(params?.slug ?? "");

  useSeo({
    title: doc ? `${doc.title} | ${SITE_INFO.name}` : "Yasal",
    description: doc?.description,
    canonicalPath: doc ? `/${doc.slug}` : undefined,
  });

  if (!doc) return <NotFound />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="w-11 h-11 bg-[#e0f7fa] rounded-xl flex items-center justify-center mb-4">
        <FileText className="w-5 h-5 text-[#0097a7]" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{doc.title}</h1>
      <p className="text-gray-600 mb-2">{doc.intro}</p>
      <p className="text-xs text-gray-400 mb-8">
        Son güncelleme: {SITE_INFO.legalUpdatedAt}
      </p>

      {doc.sections.map((s) => (
        <section key={s.heading} className="mb-7">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{s.heading}</h2>
          {s.paragraphs.map((p, i) => (
            <p key={i} className="text-sm text-gray-600 leading-relaxed mb-2">{p}</p>
          ))}
        </section>
      ))}

      <nav className="border-t border-gray-200 pt-5 flex flex-wrap gap-4 text-sm">
        {LEGAL_DOCS.filter((d) => d.slug !== doc.slug).map((d) => (
          <Link key={d.slug} href={`/${d.slug}`} className="text-[#0097a7] hover:underline">
            {d.title}
          </Link>
        ))}
        <Link href="/iletisim" className="text-[#0097a7] hover:underline">İletişim</Link>
      </nav>
    </div>
  );
}
