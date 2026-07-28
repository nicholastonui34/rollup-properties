"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updatePmProfileAction } from "@/app/dashboard/settings/pm-profile/actions";

export function PmProfileForm({
  pmBio,
  whatsappPhone,
  whatsappEnabled,
}: {
  pmBio: string;
  whatsappPhone: string;
  whatsappEnabled: boolean;
}) {
  const [state, formAction, pending] = useActionState(updatePmProfileAction, undefined);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div className="space-y-2">
        <Label htmlFor="pm-bio">Microsite bio</Label>
        <Textarea id="pm-bio" name="pmBio" rows={3} defaultValue={pmBio} placeholder="A short line about you or your agency, shown on your public microsite." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pm-whatsapp">WhatsApp number (optional)</Label>
        <Input id="pm-whatsapp" name="whatsappPhone" placeholder="07xx xxx xxx" defaultValue={whatsappPhone} />
        <p className="text-xs text-muted-foreground">Leave blank to use your account phone number.</p>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="whatsappEnabled" defaultChecked={whatsappEnabled} className="size-4 rounded border-border" />
        Show a WhatsApp button to renters
      </label>

      {state?.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && <p className="text-sm text-primary">Saved.</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
