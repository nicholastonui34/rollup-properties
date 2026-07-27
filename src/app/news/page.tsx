import type { Metadata } from "next";
import Link from "next/link";
import { NEWS_ARTICLES } from "@/lib/news";

export const metadata: Metadata = {
  title: "News",
  description: "Updates and articles from Nyoomba.",
};

export default function NewsPage() {
  const articles = [...NEWS_ARTICLES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        News
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Updates and articles from the Nyoomba team.</p>

      <div className="mt-8 space-y-6">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/news/${article.slug}`}
            className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <p className="text-xs text-muted-foreground">
              {new Date(article.publishedAt).toLocaleDateString("en-KE", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold tracking-tight text-foreground">
              {article.title}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{article.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
