/**
 * FAQPage JSON-LD. Soru-cevap metni shared/faq.ts'tedir (istemci de okur).
 */
export { FAQ, type Faq } from "../../shared/faq";
import type { Faq } from "../../shared/faq";

export function faqJsonLd(items: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
