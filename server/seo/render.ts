/**
 * index.html kabuğuna rota bazlı <head> ve taranabilir gövde enjekte eder.
 */
import { esc, jsonLdScript } from "./util";
import { SITE, SITE_NAME, OG_IMAGE, byPath } from "./meta";
import * as ld from "./jsonld";
import { FAQ, faqJsonLd } from "./faq";
import * as content from "./content";
import { getPackages, getMobile, getPosts, getPostBySlug, landingRows, liveLandings, lastChanged } from "./data";
import { landingByPath } from "../../shared/landings";
import { SITE_INFO, SISTER_SITES } from "../../shared/site";

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
  /** Makale için yayın/güncelleme zamanı (article:*) */
  published?: Date | string;
  modified?: Date | string;
}) {
  const { title, description, canonical, jsonLd, noindex, nofollow, ogType = "website" } = opts;
  const iso = (d?: Date | string) => (d ? new Date(d).toISOString() : "");

  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${esc(canonical)}" />`,
    `<meta name="robots" content="${
      noindex
        ? `noindex, ${nofollow ? "nofollow" : "follow"}`
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    }" />`,
    `<meta property="og:type" content="${esc(ogType)}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="tr_TR" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(canonical)}" />`,
    // SVG paylaşım görseli Facebook/WhatsApp/X/LinkedIn'de GÖRÜNMEZ — raster
    `<meta property="og:image" content="${OG_IMAGE.url}" />`,
    `<meta property="og:image:type" content="${OG_IMAGE.type}" />`,
    `<meta property="og:image:width" content="${OG_IMAGE.width}" />`,
    `<meta property="og:image:height" content="${OG_IMAGE.height}" />`,
    `<meta property="og:image:alt" content="${esc(SITE_NAME)} — internet ve mobil tarife karşılaştırma" />`,
    ...(opts.published ? [`<meta property="article:published_time" content="${iso(opts.published)}" />`] : []),
    ...(opts.modified ? [`<meta property="article:modified_time" content="${iso(opts.modified)}" />`] : []),
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE.url}" />`,
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
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, "")
    // Etiketleri silinen başlık yorumları ve boş satırlar kalmasın
    .replace(/[ \t]*<!-- (Open Graph|Twitter) -->\n/g, "")
    .replace(/\n(?:[ \t]*\n)+/g, "\n");

  out = out.replace("</head>", `    ${headHtml}\n  </head>`);

  // Sayfanın en üstündeki grup siteleri şeridi (Layout.tsx ile aynı)
  const sister = `<nav aria-label="Grup sitelerimiz"><p>Grup sitelerimiz: ${SISTER_SITES.map(
    (x) => `<a href="${esc(x.url)}" rel="noopener">${esc(x.name)}</a> — ${esc(x.tagline)}`
  ).join(" · ")}</p></nav>`;
  bodyHtml = sister + bodyHtml;

  // Taranabilir içerik #root içine basılır; React mount olunca değiştirir.
  out = out.replace(
    /<div id="root"><\/div>/,
    `<div id="root"><div id="ssr-content" class="max-w-4xl mx-auto px-4 py-10 prose-seo">${bodyHtml}</div></div>`
  );

  return out;
}

export async function renderRoute(pathname: string, template: string): Promise<Rendered> {
  const route = byPath(pathname);

  // ── Bilinen statik rotalar ────────────────────────────────────────────────
  if (route) {
    const canonical = `${SITE}${route.path === "/" ? "/" : route.path}`;
    const faq = FAQ[route.path] ?? [];
    const jsonLd: unknown[] = [ld.organization(), ld.website()];
    const extra: unknown[] = [];
    if (faq.length) extra.push(faqJsonLd(faq));

    let body = "";
    let modified: Date | null = null;
    let pageType: Parameters<typeof ld.webPage>[0]["type"] = "WebPage";
    let mainEntityId: string | undefined;

    if (route.path === "/") {
      const [pkgs, mob, live] = await Promise.all([getPackages(), getMobile(), liveLandings()]);
      body = content.homeContent(pkgs, mob, live);
      modified = lastChanged([...pkgs, ...mob]);
      if (pkgs.length) extra.push(ld.packageList(pkgs));
    } else if (route.path === "/paket-karsilastir") {
      const [pkgs, live] = await Promise.all([getPackages(), liveLandings()]);
      body = content.packagesContent(pkgs, live);
      modified = lastChanged(pkgs);
      pageType = "CollectionPage";
      if (pkgs.length) {
        extra.push(ld.packageList(pkgs, { url: canonical }));
        mainEntityId = `${canonical}#list`;
      }
    } else if (route.path === "/mobil-tarifeler") {
      const [rows, live] = await Promise.all([getMobile(), liveLandings()]);
      body = content.mobileContent(rows, live);
      modified = lastChanged(rows);
      pageType = "CollectionPage";
      if (rows.length) {
        extra.push(ld.mobileList(rows, { url: canonical }));
        mainEntityId = `${canonical}#list`;
      }
    } else if (route.path === "/hiz-testi") {
      body = content.speedTestContent();
      extra.push(ld.speedTestApp());
      mainEntityId = `${SITE}/hiz-testi#app`;
    } else if (route.path === "/blog") {
      const posts = await getPosts();
      body = content.blogContent(posts);
      modified = lastChanged(posts);
      pageType = "CollectionPage";
    } else if (route.path === "/hakkimizda") {
      body = content.aboutContent();
      pageType = "AboutPage";
      modified = new Date(SITE_INFO.contentUpdatedAt);
    } else if (route.path === "/iletisim") {
      body = content.contactContent();
      pageType = "ContactPage";
      modified = new Date(SITE_INFO.contentUpdatedAt);
    } else if (["/kvkk", "/gizlilik", "/cerez-politikasi"].includes(route.path)) {
      body = content.legalContent(route.path.slice(1));
      modified = new Date(SITE_INFO.legalUpdatedAt);
    }

    jsonLd.push(
      ld.webPage({
        url: canonical,
        name: route.title,
        description: route.description,
        type: pageType,
        dateModified: modified,
        mainEntityId,
      }),
      ld.breadcrumbs([{ name: route.label, path: route.path }], canonical),
      ...extra
    );

    return {
      status: 200,
      html: inject(
        template,
        head({ title: route.title, description: route.description, canonical, jsonLd }),
        body
      ),
    };
  }

  // ── Arama niyetine özel açılış sayfaları (shared/landings.ts) ─────────────
  const landing = landingByPath(pathname);
  if (landing) {
    const [rows, live] = await Promise.all([landingRows(landing), liveLandings()]);

    // Boş liste = ince içerik; 404'e düşer (sitemap'te de yok)
    if (rows.length) {
      const canonical = `${SITE}${landing.path}`;
      const parent =
        landing.kind === "internet"
          ? { name: "Ev İnterneti", path: "/paket-karsilastir" }
          : { name: "Mobil Tarifeler", path: "/mobil-tarifeler" };
      const listLd =
        landing.kind === "internet"
          ? ld.packageList(rows as any, { name: landing.label, url: canonical })
          : ld.mobileList(rows as any, { name: landing.label, url: canonical });

      return {
        status: 200,
        html: inject(
          template,
          head({
            title: landing.title,
            description: landing.description,
            canonical,
            jsonLd: [
              ld.organization(),
              ld.website(),
              ld.webPage({
                url: canonical,
                name: landing.title,
                description: landing.description,
                type: "CollectionPage",
                dateModified: lastChanged(rows),
                mainEntityId: `${canonical}#list`,
              }),
              ld.breadcrumbs([parent, { name: landing.label, path: landing.path }], canonical),
              listLd,
              ...(landing.faq.length ? [faqJsonLd(landing.faq)] : []),
            ],
          }),
          content.landingContent(landing, rows, live)
        ),
      };
    }
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
            published: post.createdAt,
            modified: post.updatedAt,
            jsonLd: [
              ld.organization(),
              ld.website(),
              ld.webPage({
                url: canonical,
                name: post.title,
                description,
                dateModified: post.updatedAt,
                mainEntityId: `${canonical}#article`,
              }),
              ld.breadcrumbs(
                [
                  { name: "Rehber", path: "/blog" },
                  { name: post.title, path: `/blog/${post.slug}` },
                ],
                canonical
              ),
              ld.article(post),
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
