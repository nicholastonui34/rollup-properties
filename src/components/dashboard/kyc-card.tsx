"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { submitIdNumberAction } from "@/app/dashboard/kyc-actions";

export function KycCard({
  idNumber,
  idVerifiedAt,
}: {
  idNumber: string | null;
  idVerifiedAt: Date | null;
}) {
  const [state, formAction, pending] = useActionState(submitIdNumberAction, undefined);

  if (idVerifiedAt) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
        <Badge>ID verified</Badge>
        <p className="text-sm text-muted-foreground">
          Verified {idVerifiedAt.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-foreground">Verify your identity</p>
        {idNumber && <Badge variant="secondary">Pending review</Badge>}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {idNumber
          ? "We've got your ID number — our team will confirm it during listing verification."
          : "Submit your national ID number so our team can confirm you control the properties you list."}
      </p>
      <form action={formAction} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1">
          <Label htmlFor="idNumber" className="sr-only">
            National ID number
          </Label>
          <Input
            id="idNumber"
            name="idNumber"
            defaultValue={idNumber ?? ""}
            placeholder="National ID number"
          />
        </div>
        <Button type="submit" disabled={pending} size="sm">
          {idNumber ? "Update ID" : "Submit ID"}
        </Button>
      </form>
      {state?.error && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
    </div>
  );
}
