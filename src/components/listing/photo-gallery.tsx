"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Images } from "lucide-react";
import { PhotoLightbox } from "./photo-lightbox";

type GalleryImage = { id: string; url: string };

export function PhotoGallery({
  images,
  title,
  priority = true,
}: {
  images: GalleryImage[];
  title: string;
  priority?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [mobileActive, setMobileActive] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) return null;

  function openAt(i: number) {
    setIndex(i);
    setOpen(true);
  }

  function handleMobileScroll() {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    setMobileActive(Math.round(el.scrollLeft / el.clientWidth));
  }

  const desktopThumbs = images.slice(1, 4);
  const extraCount = images.length - 4;

  return (
    <>
      {/* Mobile: swipeable carousel, tap any photo to open the lightbox. */}
      <div className="relative sm:hidden">
        <div
          ref={scrollRef}
          onScroll={handleMobileScroll}
          className="flex snap-x snap-mandatory gap-2 overflow-x-auto rounded-2xl"
        >
          {images.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => openAt(idx)}
              aria-label={`View photo ${idx + 1} of ${images.length}`}
              className="relative aspect-4/3 w-full flex-none snap-center overflow-hidden rounded-2xl"
            >
              <Image
                src={img.url}
                alt={idx === 0 ? title : ""}
                fill
                sizes="100vw"
                className="object-cover"
                priority={idx === 0 && priority}
                loading={idx === 0 ? undefined : "lazy"}
              />
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <span className="absolute right-2 bottom-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
            {mobileActive + 1} / {images.length}
          </span>
        )}
      </div>

      {/* Tablet/desktop: hero + thumbnail grid, last tile shows a "+N photos" overlay. */}
      <div className="hidden grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl sm:grid">
        <button
          type="button"
          onClick={() => openAt(0)}
          aria-label={`View photo 1 of ${images.length}`}
          className="relative col-span-2 row-span-2 aspect-video"
        >
          <Image src={images[0].url} alt={title} fill sizes="600px" className="object-cover" priority={priority} />
          {images.length > 1 && (
            <span className="absolute right-2 bottom-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
              1 / {images.length}
            </span>
          )}
        </button>
        {desktopThumbs.map((img, i) => {
          const idx = i + 1;
          const isLastSlot = i === desktopThumbs.length - 1;
          const showOverlay = isLastSlot && extraCount > 0;
          return (
            <button
              key={img.id}
              type="button"
              onClick={() => openAt(idx)}
              aria-label={`View photo ${idx + 1} of ${images.length}`}
              className="relative col-span-2 row-span-1 aspect-square"
            >
              <Image src={img.url} alt="" fill sizes="300px" className="object-cover" loading="lazy" />
              {showOverlay && (
                <span className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/60 text-sm font-medium text-white">
                  <Images className="size-4" />+{extraCount} photos
                </span>
              )}
            </button>
          );
        })}
      </div>

      <PhotoLightbox images={images} index={index} onIndexChange={setIndex} open={open} onOpenChange={setOpen} title={title} />
    </>
  );
}
