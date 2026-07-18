"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { unbanListerAction } from "@/app/(admin)/admin/listers/actions";

export function UnbanListerButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await unbanListerAction(userId);
          router.refresh();
        })
      }
    >
      Unban
    </Button>
  );
}
