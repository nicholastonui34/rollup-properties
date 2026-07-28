"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitInvestorInquiryAction, type InvestorInquiryFormState } from "@/app/investors/actions";

export function InvestorInquiryForm() {
  const [state, formAction, pending] = useActionState<InvestorInquiryFormState, FormData>(
    submitInvestorInquiryAction,
    undefined
  );

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm font-medium text-foreground">Thanks for reaching out</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Our team will follow up with the deck and more detail.
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
          <Label htmlFor="inv-name">Your name</Label>
          <Input id="inv-name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inv-org">Fund / organization (optional)</Label>
          <Input id="inv-org" name="organization" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="inv-email">Email</Label>
          <Input id="inv-email" name="email" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inv-ticket">Typical ticket size (optional)</Label>
          <Input id="inv-ticket" name="ticketSize" placeholder="e.g. KES 2M – 10M" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="inv-message">Tell us about your interest</Label>
        <Textarea id="inv-message" name="message" rows={4} required />
      </div>
      {state?.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Request the deck"}
      </Button>
    </form>
  );
}
