/**
 * Yapılandırılmış veri üreticileri (schema.org).
 * Arama motorları zengin sonuç, yapay zekâ motorları ise doğrudan
 * alıntı için bu veriyi kullanır.
 */
import { SITE, SITE_NAME, type RouteMeta } from "./meta";
import { fullName } from "./util";
import type { Pkg, Mobile } from "./data";

export function organization() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE}/#organization`,
    name: SITE_NAME,
    url: `${SITE}/`,
    description:
      "Türkiye'deki internet ve mobil tarifeleri bağımsız olarak karşılaştıran ücretsiz platform.",
    areaServed: { "@type": "Country", name: "Türkiye" },
    knowsAbout: [
      "fiber internet", "ev interneti", "mobil tarife",
      "internet hız testi", "tarife karşılaştırma",
    ],
  };
}

export function website() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE}/#website`,
    name: SITE_NAME,
    url: `${SITE}/`,
    inLanguage: "tr-TR",
    publisher: { "@id": `${SITE}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE}/paket-karsilastir?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbs(route: RouteMeta) {
  const items = [{ name: "Ana Sayfa", url: `${SITE}/` }];
  if (route.path !== "/") items.push({ name: route.label, url: `${SITE}${route.path}` });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/** Ev interneti paketleri — Offer'lı ItemList */
export function packageList(pkgs: Pkg[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Ev interneti paketleri",
    numberOfItems: pkgs.length,
    itemListElement: pkgs.slice(0, 30).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: fullName(p.operator, p.name),
        category: p.type === "fiber" ? "Fiber internet" : p.type === "kablosuz" ? "Kablosuz internet" : "ADSL/VDSL",
        brand: { "@type": "Brand", name: p.operator },
        description: `${p.downloadSpeed} Mbps indirme hızı, ${p.dataLimit ?? "limitsiz"} kullanım${
          p.commitmentMonths ? `, ${p.commitmentMonths} ay taahhüt` : ""
        }.`,
        offers: {
          "@type": "Offer",
          price: p.priceMonthly,
          priceCurrency: "TRY",
          availability: "https://schema.org/InStock",
          url: `${SITE}/paket-karsilastir`,
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: p.priceMonthly,
            priceCurrency: "TRY",
            unitCode: "MON",
            billingIncrement: 1,
          },
        },
      },
    })),
  };
}

export function mobileList(rows: Mobile[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Mobil hat tarifeleri",
    numberOfItems: rows.length,
    itemListElement: rows.slice(0, 30).map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: fullName(t.operator, t.name),
        brand: { "@type": "Brand", name: t.operator },
        description: `${t.gbLimit ? `${t.gbLimit} GB` : "Sınırsız"} internet, ${
          t.isContract ? "faturalı" : "faturasız"
        } hat.`,
        offers: {
          "@type": "Offer",
          price: t.priceMonthly,
          priceCurrency: "TRY",
          availability: "https://schema.org/InStock",
          url: `${SITE}/mobil-tarifeler`,
        },
      },
    })),
  };
}

/** Hız testi aracı — SoftwareApplication olarak tanımlanır */
export function speedTestApp() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "tarifesec.net.tr İnternet Hız Testi",
    url: `${SITE}/hiz-testi`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    browserRequirements: "JavaScript etkin bir tarayıcı",
    offers: { "@type": "Offer", price: 0, priceCurrency: "TRY" },
    description:
      "Tarayıcı üzerinden indirme, yükleme ve ping ölçen ücretsiz internet hız testi.",
  };
}

export function article(post: { title: string; excerpt: string | null; slug: string; createdAt: Date | string; updatedAt: Date | string; author: string | null }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    datePublished: new Date(post.createdAt).toISOString(),
    dateModified: new Date(post.updatedAt).toISOString(),
    inLanguage: "tr-TR",
    mainEntityOfPage: `${SITE}/blog/${post.slug}`,
    author: { "@type": "Organization", name: post.author ?? SITE_NAME },
    publisher: { "@id": `${SITE}/#organization` },
  };
}
