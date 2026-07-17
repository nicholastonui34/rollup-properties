"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  addListingImageAction,
  removeListingImageAction,
  setCoverImageAction,
} from "@/app/dashboard/listings/actions";
import { MIN_LISTING_PHOTOS } from "@/lib/listing-options";

type ListingImage = { id: string; url: string; isCover: boolean };

export function ImageUploader({
  listingId,
  images,
}: {
  listingId: string;
  images: ListingImage[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const signRes = await fetch("/api/cloudinary/sign", { method: "POST" });
    if (!signRes.ok) {
      const body = await signRes.json().catch(() => ({}));
      setError(body.error ?? "Couldn't start upload. Try again.");
      return;
    }
    const { cloudName, apiKey, signature, timestamp, folder } = await signRes.json();

    const list = Array.from(files);
    setUploading(list.length);

    for (const file of list) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("api_key", apiKey);
        form.append("timestamp", String(timestamp));
        form.append("signature", signature);
        form.append("folder", folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: form }
        );
        const data = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(data?.error?.message ?? "Upload failed");

        await addListingImageAction(listingId, {
          url: data.secure_url,
          publicId: data.public_id,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading((n) => Math.max(0, n - 1));
      }
    }

    router.refresh();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const remaining = Math.max(0, MIN_LISTING_PHOTOS - images.length);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            Photos ({images.length})
          </p>
          <p className="text-xs text-muted-foreground">
            {remaining > 0
              ? `Add at least ${remaining} more photo${remaining === 1 ? "" : "s"} to submit for verification.`
              : "Minimum photo count met. Add more for a stronger listing."}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading > 0}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading > 0 ? `Uploading ${uploading}…` : "Add photos"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-xl border",
                img.isCover ? "border-primary ring-2 ring-primary/30" : "border-border"
              )}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="200px"
                className="object-cover"
              />
              {img.isCover && (
                <Badge className="absolute left-1.5 top-1.5" variant="default">
                  Cover
                </Badge>
              )}
              <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                {!img.isCover && (
                  <Button
                    type="button"
                    size="xs"
                    variant="secondary"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await setCoverImageAction(listingId, img.id);
                        router.refresh();
                      })
                    }
                  >
                    Set cover
                  </Button>
                )}
                <Button
                  type="button"
                  size="xs"
                  variant="destructive"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await removeListingImageAction(listingId, img.id);
                      router.refresh();
                    })
                  }
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
