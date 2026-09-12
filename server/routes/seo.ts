/**
 * SEO/AEO statik uçları: robots.txt, sitemap.xml, llms.txt, llms-full.txt
 * Hepsi canlı veriden üretilir (blog yazıları dahil).
 */
import { Router } from "express";
import { SITE } from "../seo/meta";
import { ROUTES } from "../seo/meta";
import { getPosts } from "../seo/data";
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

  text(
    res,
    `# ${SITE}
# Yapay zekâ tarayıcılarına açıktır — içerik alıntılanabilir.

User-agent: *
Allow: /
Disallow: /api/

${aiBots.map((b) => `User-agent: ${b}\nAllow: /`).join("\n\n")}

# Yapay zekâ için yapılandırılmış özet
# ${SITE}/llms.txt
# ${SITE}/llms-full.txt

Sitemap: ${SITE}/sitemap.xml
`
  );
});

router.get("/sitemap.xml", async (_req, res) => {
  const posts = await getPosts();
  const today = new Date().toISOString().slice(0, 10);

  const urls = [
    ...ROUTES.map((r) => ({
      loc: `${SITE}${r.path}`,
      lastmod: today,
      changefreq: r.changefreq,
      priority: r.priority,
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
