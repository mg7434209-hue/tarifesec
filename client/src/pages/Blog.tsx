import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ArrowLeft, FileText } from "lucide-react";
import { fetchBlogPosts } from "@/lib/api";
import { useSeo } from "@/lib/hooks";

type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  author: string | null;
  createdAt: string;
};

const trDate = (d: string) =>
  new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

export function BlogListesi() {
  const { data, isLoading } = useQuery<Post[]>({ queryKey: ["blog"], queryFn: fetchBlogPosts });
  const posts = data ?? [];

  useSeo({
    title: "Rehber & Blog — İnternet ve Mobil Tarife Rehberi | tarifesec.net.tr",
    description:
      "Fiber internet, mobil tarife ve operatör seçimi hakkında bağımsız rehber yazıları. Doğru paketi seçmenize yardımcı oluyoruz.",
    canonicalPath: "/blog",
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Rehber & Blog</h1>
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
    jsonLd: post
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt ?? undefined,
          datePublished: post.createdAt,
          author: { "@type": "Organization", name: post.author ?? "tarifesec.net.tr" },
          publisher: { "@type": "Organization", name: "tarifesec.net.tr" },
        }
      : undefined,
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

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/blog" className="text-sm text-[#0097a7] inline-flex items-center gap-1.5 mb-6">
        <ArrowLeft className="w-4 h-4" /> Tüm yazılar
      </Link>
      <span className="text-xs font-semibold text-[#0097a7] bg-[#e0f7fa] rounded-full px-2 py-0.5">
        {post.category}
      </span>
      <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-2">{post.title}</h1>
      <p className="text-xs text-gray-400 mb-8 flex items-center gap-1.5">
        <CalendarDays className="w-3.5 h-3.5" /> {trDate(post.createdAt)}
        {post.author && <span>· {post.author}</span>}
      </p>
      {/* İçerik düz metin olarak render edilir — XSS riski taşımaması için
          dangerouslySetInnerHTML KULLANILMAZ. */}
      <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
        {post.content}
      </div>
    </article>
  );
}
