/**
 * index.html kabuğuna rota bazlı <head> ve taranabilir gövde enjekte eder.
 */
import { esc, jsonLdScript } from "./util";
import { SITE, SITE_NAME, byPath, type RouteMeta } from "./meta";
import * as ld from "./jsonld";
import { FAQ, faqJsonLd } from "./faq";
import * as content from "./content";
import { getPackages, getMobile, getPosts, getPostBySlug } from "./data";

export type Rendered = { html: string; status: number };

function head(opts: {
  title: string;
  description: string;
  canonical: string;
  jsonLd: unknown[];
  noindex?: boolean;
  /** noindex ile birlikte bağlantı takibini de kapat (yönetim sayfaları) */
  nofollow?: boolean;
  ogType?: string;
}) {
  const { title, description, canonical, jsonLd, noindex, nofollow, ogType = "website" } = opts;

  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${esc(canonical)}" />`,
    `<meta name="robots" content="${
      noindex
        ? `noindex, ${nofollow ? "nofollow" : "follow"}`
        : "index, follow, max-image-preview:large, max-snippet:-1"
    }" />`,
    `<meta property="og:type" content="${esc(ogType)}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="tr_TR" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(canonical)}" />`,
    `<meta property="og:image" content="${SITE}/og-tarifesec.svg" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${SITE}/og-tarifesec.svg" />`,
    ...jsonLd.map(jsonLdScript),
  ].join("\n    ");
}

/**
 * Şablonun <head> ve <body> içeriğini değiştirir.
 * Vite'ın ürettiği <script>/<link> etiketleri korunur.
 */
function inject(template: string, headHtml: string, bodyHtml: string): string {
  // Şablondaki statik SEO etiketlerini temizle — rota bazlı olanlar gelecek
  let out = template
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta\s+name="description"[^>]*>/gi, "")
    .replace(/<meta\s+name="robots"[^>]*>/gi, "")
    .replace(/<link\s+rel="canonical"[^>]*>/gi, "")
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, "")
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, "")
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");

  out = out.replace("</head>", `    ${headHtml}\n  </head>`);

  // Taranabilir içerik #root içine basılır; React mount olunca değiştirir.
  out = out.replace(
    /<div id="root"><\/div>/,
    `<div id="root"><div id="ssr-content" class="max-w-4xl mx-auto px-4 py-10 prose-seo">${bodyHtml}</div></div>`
  );

  return out;
}

/** Ortak sayfa şeması */
function baseJsonLd(route: RouteMeta) {
  return [ld.organization(), ld.website(), ld.breadcrumbs(route)];
}

export async function renderRoute(pathname: string, template: string): Promise<Rendered> {
  const route = byPath(pathname);

  // ── Bilinen statik rotalar ────────────────────────────────────────────────
  if (route) {
    const canonical = `${SITE}${route.path === "/" ? "/" : route.path}`;
    const faq = FAQ[route.path] ?? [];
    const jsonLd: unknown[] = baseJsonLd(route);
    if (faq.length) jsonLd.push(faqJsonLd(faq));

    let body = "";

    if (route.path === "/") {
      const [pkgs, mob] = await Promise.all([getPackages(), getMobile()]);
      body = content.homeContent(pkgs, mob);
      if (pkgs.length) jsonLd.push(ld.packageList(pkgs));
    } else if (route.path === "/paket-karsilastir") {
      const pkgs = await getPackages();
      body = content.packagesContent(pkgs);
      if (pkgs.length) jsonLd.push(ld.packageList(pkgs));
    } else if (route.path === "/mobil-tarifeler") {
      const rows = await getMobile();
      body = content.mobileContent(rows);
      if (rows.length) jsonLd.push(ld.mobileList(rows));
    } else if (route.path === "/hiz-testi") {
      body = content.speedTestContent();
      jsonLd.push(ld.speedTestApp());
    } else if (route.path === "/blog") {
      body = content.blogContent(await getPosts());
    }

    return {
      status: 200,
      html: inject(
        template,
        head({ title: route.title, description: route.description, canonical, jsonLd }),
        body
      ),
    };
  }

  // ── Yönetim paneli — indekslenmez, içerik basılmaz ────────────────────────
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return {
      status: 200,
      html: inject(
        template,
        head({
          title: `Yönetim Paneli | ${SITE_NAME}`,
          description: "Yetkili erişim.",
          canonical: `${SITE}/admin`,
          noindex: true,
          nofollow: true,
          jsonLd: [],
        }),
        ""
      ),
    };
  }

  // ── Blog yazısı ───────────────────────────────────────────────────────────
  const postMatch = pathname.match(/^\/blog\/([A-Za-z0-9\-_%]{1,300})$/);
  if (postMatch) {
    const slug = decodeURIComponent(postMatch[1]);
    const post = await getPostBySlug(slug);

    if (post && post.isPublished) {
      const canonical = `${SITE}/blog/${post.slug}`;
      const description =
        post.excerpt ?? post.content.slice(0, 155).replace(/\s+\S*$/, "") + "…";

      return {
        status: 200,
        html: inject(
          template,
          head({
            title: `${post.title} | ${SITE_NAME}`,
            description,
            canonical,
            ogType: "article",
            jsonLd: [
              ld.organization(),
              ld.article(post),
              {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: `${SITE}/` },
                  { "@type": "ListItem", position: 2, name: "Rehber", item: `${SITE}/blog` },
                  { "@type": "ListItem", position: 3, name: post.title, item: canonical },
                ],
              },
            ],
          }),
          content.postContent(post)
        ),
      };
    }
  }

  // ── 404 — gerçek 404 durum kodu (soft-404 değil) ──────────────────────────
  return {
    status: 404,
    html: inject(
      template,
      head({
        title: `Sayfa bulunamadı | ${SITE_NAME}`,
        description: "Aradığınız sayfa bulunamadı.",
        canonical: `${SITE}${pathname}`,
        noindex: true,
        jsonLd: [],
      }),
      `<h1>Sayfa bulunamadı</h1>
       <p>Aradığınız sayfa taşınmış veya silinmiş olabilir.</p>
       <ul>
         <li><a href="/">Ana sayfa</a></li>
         <li><a href="/paket-karsilastir">Ev interneti paketleri</a></li>
         <li><a href="/mobil-tarifeler">Mobil tarifeler</a></li>
         <li><a href="/hiz-testi">Hız testi</a></li>
       </ul>`
    ),
  };
}
