/**
 * Rehber yazılarını elle yükler (mevcut olanları günceller, silmez).
 * Çalıştır: npm run db:seed:blog
 *
 * NOT: Sunucu açılışta blog tablosu BOŞSA bunu otomatik yapar.
 */
import { db } from "./db";
import { blogPosts } from "./schema";
import { SEED_POSTS } from "./seed-posts";
import dotenv from "dotenv";
dotenv.config();

async function seedBlog() {
  console.log("🌱 Rehber yazıları ekleniyor…");
  for (const post of SEED_POSTS) {
    await db
      .insert(blogPosts)
      .values({ ...post, isPublished: true, author: "tarifesec.net.tr" })
      .onConflictDoUpdate({
        target: blogPosts.slug,
        set: {
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          isPublished: true,
          updatedAt: new Date(),
        },
      });
    console.log(`  ✅ ${post.slug}`);
  }
  console.log(`🎉 ${SEED_POSTS.length} yazı hazır.`);
  process.exit(0);
}

seedBlog().catch((e) => {
  console.error("❌ Blog seed hatası:", e);
  process.exit(1);
});
