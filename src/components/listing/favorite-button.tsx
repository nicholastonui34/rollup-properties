"use client";

import { useFormStatus } from "react-dom";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

function Icon({ saved }: { saved: boolean }) {
  const { pending } = useFormStatus();
  return <Heart className={cn("size-4", saved && "fill-current", pending && "animate-pulse")} />;
}

export function FavoriteButton({
  action,
  saved,
  variant = "inline",
  className,
}: {
  action: () => void;
  saved: boolean;
  variant?: "inline" | "overlay";
  className?: string;
}) {
  return (
    <form
      action={action}
      // Stops the click from bubbling to a parent <Link> (e.g. on the
      // listing card) so favoriting doesn't also trigger navigation.
      onClick={(e) => e.stopPropagation()}
      className={cn("z-10", className)}
    >
      {variant === "overlay" ? (
        <button
          type="submit"
          aria-label={saved ? "Remove from favorites" : "Save to favorites"}
          aria-pressed={saved}
          className={cn(
            "flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background",
            saved && "text-destructive"
          )}
        >
          <Icon saved={saved} />
        </button>
      ) : (
        <button
          type="submit"
          aria-pressed={saved}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted",
            saved && "border-destructive/30 text-destructive hover:bg-destructive/10"
          )}
        >
          <Icon saved={saved} />
          {saved ? "Saved" : "Save"}
        </button>
      )}
    </form>
  );
}
