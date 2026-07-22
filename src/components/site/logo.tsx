import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-8", className)}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" className="fill-primary" />
      {/* roof */}
      <path
        d="M6.5 15.5 16 7.5l9.5 8"
        stroke="var(--gold)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* rolled-up floorplan: spiral */}
      <path
        d="M16 24.5c-3.6 0-6-2.2-6-5.1 0-2.5 2-4.4 4.6-4.4 2.2 0 3.8 1.5 3.8 3.5 0 1.7-1.3 2.9-3 2.9-1.3 0-2.2-.8-2.2-2"
        stroke="var(--primary-foreground)"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5 shrink-0", className)}
      aria-label="Nyoomba — home"
    >
      <LogoMark className={markClassName} />
      <span className="font-display text-xl font-semibold tracking-tight text-foreground">
        Nyoomba
      </span>
    </Link>
  );
}
