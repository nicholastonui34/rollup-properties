"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitAdvertiseInquiryAction, type AdvertiseInquiryFormState } from "@/app/advertise/actions";

export function InquiryForm() {
  const [state, formAction, pending] = useActionState<AdvertiseInquiryFormState, FormData>(
    submitAdvertiseInquiryAction,
    undefined
  );

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm font-medium text-foreground">Inquiry received</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Our team will follow up with pricing and availability.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="absolute h-0 w-0 opacity-0"
        aria-hidden="true"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ad-org">Organization / brand</Label>
          <Input id="ad-org" name="organization" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ad-name">Your name</Label>
          <Input id="ad-name" name="contactName" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="ad-email">Email</Label>
        <Input id="ad-email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ad-message">What would you like to advertise?</Label>
        <Textarea
          id="ad-message"
          name="message"
          rows={4}
          placeholder="Featured listings, banner placement, a sponsored neighbourhood…"
          required
        />
      </div>
      {state?.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send inquiry"}
      </Button>
    </form>
  );
}
