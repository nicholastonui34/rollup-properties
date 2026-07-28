"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  submitAgencyWebsiteInquiryAction,
  type AgencyWebsiteInquiryFormState,
} from "@/app/agency-websites/actions";

export function AgencyWebsiteInquiryForm() {
  const [state, formAction, pending] = useActionState<AgencyWebsiteInquiryFormState, FormData>(
    submitAgencyWebsiteInquiryAction,
    undefined
  );

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm font-medium text-foreground">Inquiry received</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Our team will follow up about custom domains and branding options.
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
          <Label htmlFor="aw-agency">Agency / company name</Label>
          <Input id="aw-agency" name="agencyName" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="aw-name">Your name</Label>
          <Input id="aw-name" name="contactName" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="aw-email">Email</Label>
        <Input id="aw-email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="aw-message">What do you need?</Label>
        <Textarea
          id="aw-message"
          name="message"
          rows={4}
          placeholder="Custom domain, extra branding, portfolio size…"
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
