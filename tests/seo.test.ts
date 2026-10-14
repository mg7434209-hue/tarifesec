/**
 * SEO regresyon denetimi — `npm test` ile çalışır, veritabanı GEREKMEZ.
 *
 * Profesyonel SEO'nun sessizce bozulduğu yerler: ikinci <h1>, kesilen
 * başlık, eksik açıklama, bozuk JSON-LD, kırık iç bağlantı, uzun özet.
 * Bunların hiçbiri sayfayı çökertmez — bu yüzden ancak bir test yakalar.
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { renderRoute } from "../server/seo/render";
import { postContent } from "../server/seo/content";
import { ROUTES } from "../shared/routes";
import { LANDINGS } from "../shared/landings";
import { SEED_POSTS } from "../drizzle/seed-posts";
import { parsePost, plainText } from "../shared/blog-format";
import { relatedFor } from "../shared/blog-related";

after(() => setTimeout(() => process.exit(0), 50).unref());

const TEMPLATE = `<!doctype html><html lang="tr"><head><title>x</title></head><body><div id="root"></div></body></html>`;

const metaOf = (html: string, re: RegExp) => html.match(re)?.[1] ?? "";

function checkPage(path: string, html: string) {
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  assert.equal(h1, 1, `${path}: tam olarak bir <h1> olmalı (bulunan: ${h1})`);

  const title = metaOf(html, /<title>([^<]*)<\/title>/);
  assert.ok(title.length >= 20 && title.length <= 75, `${path}: başlık 20–75 karakter olmalı (${title.length}): ${title}`);

  const desc = metaOf(html, /<meta name="description" content="([^"]*)"/);
  assert.ok(desc.length >= 50 && desc.length <= 170, `${path}: açıklama 50–170 karakter olmalı (${desc.length})`);

  const canonical = metaOf(html, /<link rel="canonical" href="([^"]*)"/);
  assert.match(canonical, /^https:\/\/[^/]+(\/|\/[^?#]*)$/, `${path}: canonical mutlak ve sorgusuz olmalı`);

  assert.ok(!/undefined|NaN|\[object Object\]/.test(html), `${path}: çıktıda undefined/NaN var`);

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    assert.doesNotThrow(() => JSON.parse(m[1]), `${path}: JSON-LD geçersiz`);
  }
}

for (const r of ROUTES) {
  test(`sayfa ${r.path}`, async () => {
    const { html, status } = await renderRoute(r.path, TEMPLATE);
    assert.equal(status, 200);
    checkPage(r.path, html);
  });
}

test("bilinmeyen adres gerçek 404 + noindex döner", async () => {
  const { html, status } = await renderRoute("/yok-boyle-bir-sayfa", TEMPLATE);
  assert.equal(status, 404);
  assert.match(html, /noindex/);
});

test("açılış sayfası meta uzunlukları", () => {
  for (const l of LANDINGS) {
    assert.ok(l.title.length <= 75, `${l.path}: başlık uzun (${l.title.length})`);
    assert.ok(l.description.length >= 50 && l.description.length <= 170, `${l.path}: açıklama ${l.description.length}`);
    assert.ok(l.intro.length >= 1 && l.faq.length >= 1, `${l.path}: giriş ve SSS gerekli`);
  }
  assert.equal(new Set(LANDINGS.map((l) => l.path)).size, LANDINGS.length, "yinelenen açılış adresi");
});

const KNOWN = new Set([
  ...ROUTES.map((r) => r.path),
  ...LANDINGS.map((l) => l.path),
  ...SEED_POSTS.map((p) => `/blog/${p.slug}`),
]);

test("rehber yazıları: özet, slug, iç bağlantılar", () => {
  const slugs = new Set<string>();
  for (const p of SEED_POSTS) {
    assert.ok(!slugs.has(p.slug), `yinelenen slug: ${p.slug}`);
    slugs.add(p.slug);
    assert.match(p.slug, /^[a-z0-9-]+$/, `${p.slug}: slug yalnız küçük harf/rakam/tire`);
    assert.ok(p.excerpt.length >= 70 && p.excerpt.length <= 160, `${p.slug}: özet 70–160 karakter (${p.excerpt.length})`);
    assert.ok(plainText(p.content).split(" ").length >= 200, `${p.slug}: yazı çok kısa (ince içerik, en az 200 kelime)`);

    for (const b of parsePost(p.content)) {
      const parts = b.type === "p" ? b.parts : b.type === "ul" ? b.items.flat() : [];
      for (const x of parts) {
        if ("href" in x) {
          const path = x.href.split("#")[0];
          assert.ok(KNOWN.has(path), `${p.slug}: kırık iç bağlantı ${x.href}`);
        }
      }
    }
    for (const r of relatedFor(p.slug, p.title)) {
      assert.ok(KNOWN.has(r.href), `${p.slug}: ilgili sayfa bağlantısı kırık ${r.href}`);
    }
  }
});

test("rehber yazısı SSR çıktısı tek h1 ve güvenli bağlantılar içerir", () => {
  const now = new Date();
  for (const p of SEED_POSTS) {
    const html = postContent({
      ...p, id: 1, tags: null, coverImage: null, author: "tarifesec.net.tr",
      isPublished: true, viewCount: 0, createdAt: now, updatedAt: now,
    } as any);
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, `${p.slug}: tek h1`);
    assert.ok(!/href="(https?:)?\/\//.test(html), `${p.slug}: rehber gövdesinde dış bağlantı olmamalı`);
  }
});

test("işaretleme dış ve protokolsüz bağlantıyı reddeder", () => {
  const blocks = parsePost("[kötü](//kotu.site) ve [dış](https://x.com) ve [iyi](/hiz-testi)");
  const p = blocks[0];
  assert.equal(p.type, "p");
  const links = (p as any).parts.filter((x: any) => "href" in x);
  assert.deepEqual(links.map((x: any) => x.href), ["/hiz-testi"]);
});
