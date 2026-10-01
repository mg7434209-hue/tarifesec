/**
 * SEO/AEO statik uçları: robots.txt, sitemap.xml, llms.txt, llms-full.txt
 * Hepsi canlı veriden üretilir (blog yazıları dahil).
 */
import { Router } from "express";
import { SITE } from "../seo/meta";
import { ROUTES } from "../seo/meta";
import { getPosts, getPackages, getMobile, liveLandings, lastChanged } from "../seo/data";
import { LANDINGS } from "../../shared/landings";
import { SITE_INFO } from "../../shared/site";
import { llmsTxt, llmsFullTxt } from "../seo/llms";

const router = Router();

const text = (res: any, body: string, type = "text/plain; charset=utf-8") => {
  res.setHeader("Content-Type", type);
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(body);
};

/**
 * robots.txt — yapay zekâ tarayıcıları AÇIKÇA karşılanır.
 *
 * GPTBot/OAI-SearchBot (ChatGPT), ClaudeBot (Claude), PerplexityBot,
 * Google-Extended (Gemini/AI Overviews) ve Applebot-Extended, varsayılan
 * "User-agent: *" kuralına ek olarak isimle listelenir. Bu botlar site
 * içeriğini alıntılayarak trafik getirir; engellenmeleri AI görünürlüğünü
 * sıfırlar.
 */
router.get("/robots.txt", (_req, res) => {
  const aiBots = [
    "GPTBot", "OAI-SearchBot", "ChatGPT-User",
    "ClaudeBot", "Claude-User", "Claude-SearchBot", "anthropic-ai",
    "PerplexityBot", "Perplexity-User",
    "Google-Extended", "Applebot-Extended",
    "meta-externalagent", "Bytespider", "Amazonbot", "cohere-ai",
  ];

  /**
   * Sayfanın render için çektiği OKUMA uçları açık kalır. Googlebot sayfayı
   * JS ile çizerken /api/packages'e erişemezse, React SSR içeriğini
   * "Yükleniyor…" ile değiştirir ve Google'ın gördüğü son hâl boş liste olur.
   * Uçların kendisi X-Robots-Tag: noindex taşır (server/index.ts), dizine
   * girmez. En uzun eşleşen kural kazanır: Allow /api/packages > Disallow /api/.
   */
  const rules = `Allow: /
Allow: /api/packages
Allow: /api/mobile
Allow: /api/blog
Disallow: /api/
Disallow: /admin`;

  text(
    res,
    `# ${SITE}
# Yapay zekâ tarayıcılarına açıktır — içerik alıntılanabilir.

User-agent: *
${rules}

# İsimle eşleşen bot "User-agent: *" grubunu YOK SAYAR (RFC 9309); bu yüzden
# engeller bu grupta da tekrarlanır — yoksa AI botları /admin ve /api/'yi tarar.
${aiBots.map((b) => `User-agent: ${b}`).join("\n")}
${rules}

# Yapay zekâ için yapılandırılmış özet
# ${SITE}/llms.txt
# ${SITE}/llms-full.txt

Sitemap: ${SITE}/sitemap.xml
`
  );
});

/**
 * sitemap.xml — lastmod GERÇEK değişim tarihidir.
 *
 * Her istekte "bugün" yazmak, Google'ın lastmod'a güvenmeyi bırakmasına yol
 * açar. Veri sayfaları paketlerin/tarifelerin son güncellemesini, kurumsal
 * ve yasal sayfalar shared/site.ts'teki tarihleri taşır.
 */
router.get("/sitemap.xml", async (_req, res) => {
  const [posts, pkgs, mob, live] = await Promise.all([getPosts(), getPackages(), getMobile(), liveLandings()]);
  const day = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : null);
  const fallback = SITE_INFO.contentUpdatedAt;

  const pkgDate = day(lastChanged(pkgs));
  const mobDate = day(lastChanged(mob));
  const postDate = day(lastChanged(posts));
  const newest = [pkgDate, mobDate].filter(Boolean).sort().pop() ?? null;

  const routeDate: Record<string, string | null> = {
    "/": newest,
    "/paket-karsilastir": pkgDate,
    "/mobil-tarifeler": mobDate,
    "/blog": postDate,
    "/kvkk": SITE_INFO.legalUpdatedAt,
    "/gizlilik": SITE_INFO.legalUpdatedAt,
    "/cerez-politikasi": SITE_INFO.legalUpdatedAt,
  };

  const urls = [
    ...ROUTES.map((r) => ({
      loc: `${SITE}${r.path}`,
      lastmod: routeDate[r.path] ?? fallback,
      changefreq: r.changefreq,
      priority: r.priority,
    })),
    // Yalnızca verisi olan açılış sayfaları — boş olanlar 404 döner
    ...LANDINGS.filter((l) => live.has(l.path)).map((l) => ({
      loc: `${SITE}${l.path}`,
      lastmod: (l.kind === "internet" ? pkgDate : mobDate) ?? fallback,
      changefreq: "daily",
      priority: "0.8",
    })),
    ...posts.map((p) => ({
      loc: `${SITE}/blog/${p.slug}`,
      lastmod: new Date(p.updatedAt).toISOString().slice(0, 10),
      changefreq: "monthly",
      priority: "0.6",
    })),
  ];

  text(
    res,
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`,
    "application/xml; charset=utf-8"
  );
});

router.get("/llms.txt", async (_req, res) => text(res, await llmsTxt()));
router.get("/llms-full.txt", async (_req, res) => text(res, await llmsFullTxt()));

export default router;
