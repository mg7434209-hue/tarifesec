/**
 * Site haritası girdileri — sitemap.xml ve IndexNow bildirimi AYNI listeyi
 * kullanır. lastmod GERÇEK değişim tarihidir (bkz. routes/seo.ts açıklaması).
 */
import { SITE, ROUTES } from "./meta";
import { getPosts, getPackages, getMobile, liveLandings, lastChanged } from "./data";
import { LANDINGS } from "../../shared/landings";
import { SITE_INFO } from "../../shared/site";

export type SitemapEntry = { loc: string; lastmod: string; changefreq: string; priority: string };

export async function sitemapEntries(): Promise<SitemapEntry[]> {
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

  return [
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
}
