"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitCareerApplicationAction, type CareerApplicationFormState } from "@/app/careers/actions";

export function ApplicationForm({ roleSlug }: { roleSlug: string | null }) {
  const [state, formAction, pending] = useActionState<CareerApplicationFormState, FormData>(
    submitCareerApplicationAction.bind(null, roleSlug),
    undefined
  );

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm font-medium text-foreground">Application received</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Thanks — we&apos;ll be in touch if it&apos;s a fit.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-border bg-card p-6">
      {/* Honeypot */}
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
          <Label htmlFor="app-name">Name</Label>
          <Input id="app-name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="app-phone">Phone</Label>
          <Input id="app-phone" name="phone" placeholder="07xx xxx xxx" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="app-email">Email (optional)</Label>
        <Input id="app-email" name="email" type="email" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="app-cv">CV link (optional)</Label>
        <Input id="app-cv" name="cvUrl" type="url" placeholder="Link to your CV or portfolio" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="app-note">Cover note (optional)</Label>
        <Textarea id="app-note" name="note" rows={4} placeholder="Tell us why you'd be a good fit." />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}
