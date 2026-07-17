"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { verifyListerKycAction } from "@/app/(admin)/admin/listers/actions";

export function KycVerifyButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await verifyListerKycAction(userId);
          router.refresh();
        })
      }
    >
      Verify ID
    </Button>
  );
}
