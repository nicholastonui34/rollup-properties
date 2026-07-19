"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type LightboxImage = { id: string; url: string };

export function PhotoLightbox({
  images,
  index,
  onIndexChange,
  open,
  onOpenChange,
  title,
}: {
  images: LightboxImage[];
  index: number;
  onIndexChange: (i: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
}) {
  const touchStartX = useRef<number | null>(null);
  const current = images[index];

  const goPrev = () => onIndexChange((index - 1 + images.length) % images.length);
  const goNext = () => onIndexChange((index + 1) % images.length);

  // Radix's own focus trap + Escape-to-close + body scroll lock (via DialogContent)
  // cover most of the WCAG requirements here — arrow-key paging is the one thing
  // this feature needs on top of that.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, images.length]);

  if (!current) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-none bg-black p-0 text-white shadow-none">
        <DialogTitle className="sr-only">
          {title} — photo {index + 1} of {images.length}
        </DialogTitle>

        <div
          className="relative flex-1"
          style={{ touchAction: "pan-y pinch-zoom" }}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current == null) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            if (Math.abs(dx) > 50) {
              if (dx > 0) goPrev();
              else goNext();
            }
            touchStartX.current = null;
          }}
        >
          <Image
            key={current.id}
            src={current.url}
            alt={`${title} — photo ${index + 1} of ${images.length}`}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous photo"
              className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next photo"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronRight className="size-6" />
            </button>
          </>
        )}

        <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm font-medium text-white">
          {index + 1} / {images.length}
        </div>
      </DialogContent>
    </Dialog>
  );
}
