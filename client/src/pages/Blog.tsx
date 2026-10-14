import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, FileText, Clock, ChevronRight } from "lucide-react";
import { parsePost, readingMinutes, type Inline } from "@shared/blog-format";
import { relatedFor } from "@shared/blog-related";
import { fetchBlogPosts } from "@/lib/api";
import { useSeo, useRouteSeo } from "@/lib/hooks";

type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  author: string | null;
  createdAt: string;
  updatedAt: string;
};

const trDate = (d: string) =>
  new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

export function BlogListesi() {
  const { data, isLoading } = useQuery<Post[]>({ queryKey: ["blog"], queryFn: fetchBlogPosts });
  const posts = data ?? [];

  useRouteSeo("/blog");

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">İnternet ve Mobil Tarife Rehberi</h1>
      <p className="text-sm text-gray-500 mb-8">
        Tarife seçimi, fiber altyapı ve operatörler hakkında bağımsız rehberler
      </p>

      {isLoading && <p className="text-sm text-gray-400">Yükleniyor…</p>}

      {!isLoading && posts.length === 0 && (
        <div className="text-center py-16 text-gray-400 border border-dashed border-gray-200 rounded-2xl">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Henüz yayınlanmış yazı yok.</p>
        </div>
      )}

      <div className="grid gap-4">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/blog/${p.slug}`}
            className="block bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-[#0097a7]/40 transition-all"
          >
            <span className="text-xs font-semibold text-[#0097a7] bg-[#e0f7fa] rounded-full px-2 py-0.5">
              {p.category}
            </span>
            <h2 className="text-lg font-semibold text-gray-900 mt-3 mb-1.5">{p.title}</h2>
            {p.excerpt && <p className="text-sm text-gray-500 mb-3">{p.excerpt}</p>}
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> {trDate(p.createdAt)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BlogYazisi() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug;

  const { data: post, isLoading, isError } = useQuery<Post>({
    queryKey: ["blog", slug],
    queryFn: async () => {
      const res = await fetch(`/api/blog/${slug}`);
      if (!res.ok) throw new Error("Yazı bulunamadı");
      return res.json();
    },
    enabled: Boolean(slug),
  });

  useSeo({
    title: post ? `${post.title} | tarifesec.net.tr` : "Yazı | tarifesec.net.tr",
    description: post?.excerpt ?? undefined,
    canonicalPath: slug ? `/blog/${slug}` : undefined,
  });

  if (isLoading) return <p className="max-w-3xl mx-auto px-4 py-16 text-gray-400">Yükleniyor…</p>;

  if (isError || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 mb-4">Bu yazı bulunamadı.</p>
        <Link href="/blog" className="text-[#0097a7] font-medium">← Tüm yazılar</Link>
      </div>
    );
  }

  const blocks = parsePost(post.content);
  const toc = blocks.filter((b) => b.type === "h2") as { text: string; id: string }[];
  const updated = new Date(post.updatedAt).getTime() - new Date(post.createdAt).getTime() > 864e5;
  const related = relatedFor(post.slug, post.title);

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <nav aria-label="Konum" className="text-xs text-gray-500 mb-4">
        <ol className="flex flex-wrap items-center gap-1">
          <li><Link href="/" className="hover:text-[#0097a7]">Ana Sayfa</Link></li>
          <li aria-hidden="true"><ChevronRight className="w-3 h-3" /></li>
          <li><Link href="/blog" className="hover:text-[#0097a7]">Rehber</Link></li>
          <li aria-hidden="true"><ChevronRight className="w-3 h-3" /></li>
          <li aria-current="page" className="text-gray-700 line-clamp-1">{post.title}</li>
        </ol>
      </nav>
      <span className="text-xs font-semibold text-[#0097a7] bg-[#e0f7fa] rounded-full px-2 py-0.5">
        {post.category}
      </span>
      <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-2">{post.title}</h1>
      <p className="text-xs text-gray-400 mb-6 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5" /> Yayın: {trDate(post.createdAt)}
        </span>
        {updated && <span>Güncelleme: {trDate(post.updatedAt)}</span>}
        <span className="inline-flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> {readingMinutes(post.content)} dk okuma
        </span>
        <span>tarifesec.net.tr editörlüğü</span>
      </p>
      {post.excerpt && <p className="text-gray-700 font-medium mb-6">{post.excerpt}</p>}

      {toc.length >= 3 && (
        <nav aria-label="İçindekiler" className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">İçindekiler</h2>
          <ol className="list-decimal list-inside text-sm space-y-1">
            {toc.map((t) => (
              <li key={t.id}><a href={`#${t.id}`} className="text-[#0097a7] hover:underline">{t.text}</a></li>
            ))}
          </ol>
        </nav>
      )}

      {/* Güvenli işaretleme: HTML yorumlanmaz, dangerouslySetInnerHTML YOK */}
      <div className="text-gray-700 leading-relaxed space-y-4">
        {blocks.map((b, i) =>
          b.type === "h2" ? (
            <h2 key={i} id={b.id} className="text-xl font-bold text-gray-900 pt-4 scroll-mt-24">{b.text}</h2>
          ) : b.type === "h3" ? (
            <h3 key={i} id={b.id} className="text-lg font-semibold text-gray-900 pt-2 scroll-mt-24">{b.text}</h3>
          ) : b.type === "ul" ? (
            <ul key={i} className="list-disc pl-5 space-y-1.5">
              {b.items.map((it, j) => <li key={j}><Satir parts={it} /></li>)}
            </ul>
          ) : b.type === "p" ? (
            <p key={i}><Satir parts={b.parts} /></p>
          ) : null
        )}
      </div>

      <aside className="mt-10 border-t border-gray-200 pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">İlgili sayfalar</h2>
        <ul className="flex flex-wrap gap-2">
          {related.map((r) => (
            <li key={r.href}>
              <Link
                href={r.href}
                className="inline-block text-sm bg-white border border-gray-200 rounded-full px-3 py-1.5 text-gray-700 hover:border-[#0097a7] hover:text-[#0097a7]"
              >
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </article>
  );
}

/** Satır içi metin + site içi bağlantılar */
function Satir({ parts }: { parts: Inline[] }) {
  return (
    <>
      {parts.map((x, i) =>
        "href" in x ? (
          <Link key={i} href={x.href} className="text-[#0097a7] font-medium hover:underline">{x.text}</Link>
        ) : (
          <span key={i}>{x.text}</span>
        )
      )}
    </>
  );
}
