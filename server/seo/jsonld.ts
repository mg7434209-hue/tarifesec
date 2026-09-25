/**
 * Yapılandırılmış veri üreticileri (schema.org).
 * Arama motorları zengin sonuç, yapay zekâ motorları ise doğrudan
 * alıntı için bu veriyi kullanır.
 */
import { SITE, SITE_NAME, OG_IMAGE, LOGO } from "./meta";
import { fullName } from "./util";
import type { Pkg, Mobile } from "./data";
import { SITE_INFO } from "../../shared/site";

export function organization() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE}/#organization`,
    name: SITE_NAME,
    url: `${SITE}/`,
    logo: { "@type": "ImageObject", url: LOGO.url, width: LOGO.width, height: LOGO.height },
    image: OG_IMAGE.url,
    email: SITE_INFO.company.email,
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
  };
}

/**
 * NOT: WebSite'ta SearchAction YOKTUR. Sitede ?q= ile çalışan bir arama
 * bulunmuyor; var olmayan bir arama ucunu bildirmek geçersiz işaretlemedir.
 * Arama eklenirse potentialAction geri getirilebilir.
 */

export type Crumb = { name: string; path: string };

/** @id'li BreadcrumbList — WebPage.breadcrumb buna bağlanır */
export function breadcrumbs(trail: Crumb[], pageUrl: string) {
  const items = [{ name: "Ana Sayfa", path: "/" }, ...trail.filter((c) => c.path !== "/")];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE}${it.path}`,
    })),
  };
}

/**
 * Sayfanın kendisi. dateModified verinin GERÇEK değişim tarihidir (paket
 * fiyatı, yazı güncellemesi); her istekte "bugün" yazmak tazelik sinyalini
 * anlamsızlaştırır.
 */
export function webPage(opts: {
  url: string;
  name: string;
  description: string;
  type?: "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage";
  dateModified?: Date | null;
  mainEntityId?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": opts.type ?? "WebPage",
    "@id": `${opts.url}#webpage`,
    url: opts.url,
    name: opts.name,
    description: opts.description,
    inLanguage: "tr-TR",
    isPartOf: { "@id": `${SITE}/#website` },
    publisher: { "@id": `${SITE}/#organization` },
    primaryImageOfPage: { "@type": "ImageObject", url: OG_IMAGE.url, width: OG_IMAGE.width, height: OG_IMAGE.height },
    breadcrumb: { "@id": `${opts.url}#breadcrumb` },
    ...(opts.dateModified ? { dateModified: new Date(opts.dateModified).toISOString() } : {}),
    ...(opts.mainEntityId ? { mainEntity: { "@id": opts.mainEntityId } } : {}),
  };
}

/** Ev interneti paketleri — Offer'lı ItemList */
export function packageList(pkgs: Pkg[], opts: { name?: string; url?: string } = {}) {
  const pageUrl = opts.url ?? `${SITE}/paket-karsilastir`;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${pageUrl}#list`,
    name: opts.name ?? "Ev interneti paketleri",
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
          url: pageUrl,
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

export function mobileList(rows: Mobile[], opts: { name?: string; url?: string } = {}) {
  const pageUrl = opts.url ?? `${SITE}/mobil-tarifeler`;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${pageUrl}#list`,
    name: opts.name ?? "Mobil hat tarifeleri",
    numberOfItems: rows.length,
    itemListElement: rows.slice(0, 30).map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: fullName(t.operator, t.name),
        brand: { "@type": "Brand", name: t.operator },
        category: t.isContract ? "Faturalı mobil hat" : "Faturasız mobil hat",
        description: `${t.gbLimit ? `${t.gbLimit} GB` : "Sınırsız"} internet, ${
          t.isContract ? "faturalı" : "faturasız"
        } hat.`,
        offers: {
          "@type": "Offer",
          price: t.priceMonthly,
          priceCurrency: "TRY",
          availability: "https://schema.org/InStock",
          url: pageUrl,
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
    "@id": `${SITE}/hiz-testi#app`,
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

export function article(post: { title: string; excerpt: string | null; slug: string; category: string; createdAt: Date | string; updatedAt: Date | string; author: string | null }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${SITE}/blog/${post.slug}#article`,
    headline: post.title,
    image: [OG_IMAGE.url],
    articleSection: post.category,
    description: post.excerpt ?? undefined,
    datePublished: new Date(post.createdAt).toISOString(),
    dateModified: new Date(post.updatedAt).toISOString(),
    inLanguage: "tr-TR",
    mainEntityOfPage: `${SITE}/blog/${post.slug}`,
    // Yazar kişi değil yayın ekibidir; sahte kişi profili üretilmez.
    author: { "@type": "Organization", name: SITE_NAME, url: `${SITE}/hakkimizda` },
    publisher: { "@id": `${SITE}/#organization` },
  };
}
