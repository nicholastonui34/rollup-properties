"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function UnlockButton({ priceKes }: { priceKes: number }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="mt-3 w-full" disabled={pending}>
      {pending ? "Redirecting to payment…" : `Unlock contact — KES ${priceKes}`}
    </Button>
  );
}
