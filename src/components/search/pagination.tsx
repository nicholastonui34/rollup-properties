import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { RawSearchParams } from "@/lib/search";

function buildQuery(raw: RawSearchParams, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (key === "page") continue;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value) {
      params.set(key, value);
    }
  }
  params.set("page", String(page));
  return `/search?${params.toString()}`;
}

export function SearchPagination({
  raw,
  page,
  pageCount,
}: {
  raw: RawSearchParams;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1
  );

  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
      <Link
        href={buildQuery(raw, Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`flex size-9 items-center justify-center rounded-lg border text-sm transition-colors ${
          page === 1 ? "pointer-events-none opacity-40" : "hover:bg-muted"
        }`}
      >
        <ChevronLeft className="size-4" />
      </Link>

      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-sm text-muted-foreground">…</span>}
          <Link
            href={buildQuery(raw, p)}
            className={`flex size-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
              p === page ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            {p}
          </Link>
        </span>
      ))}

      <Link
        href={buildQuery(raw, Math.min(pageCount, page + 1))}
        aria-disabled={page === pageCount}
        className={`flex size-9 items-center justify-center rounded-lg border text-sm transition-colors ${
          page === pageCount ? "pointer-events-none opacity-40" : "hover:bg-muted"
        }`}
      >
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}
