"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { setFeaturedAction, unfeatureAction } from "@/app/(admin)/admin/verifications/actions";

export function FeatureListingButton({ listingId, featured }: { listingId: string; featured: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const action = featured ? unfeatureAction : setFeaturedAction;

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await action(listingId);
          router.refresh();
        })
      }
    >
      {featured ? "Remove featured placement" : "Feature for 30 days"}
    </Button>
  );
}
