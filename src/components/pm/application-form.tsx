"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentUploader } from "@/components/pm/document-uploader";
import { INCOME_RANGES } from "@/lib/listing-options";
import { trackEvent } from "@/lib/analytics";
import { submitApplicationAction } from "@/app/pm/[slug]/actions";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function ApplicationForm({
  pmSlug,
  pmId,
  listingId,
}: {
  pmSlug: string;
  pmId: string;
  listingId?: string;
}) {
  const [incomeRange, setIncomeRange] = useState<string>(INCOME_RANGES[0]);
  const [idDocumentUrl, setIdDocumentUrl] = useState("");
  const [incomeDocumentUrl, setIncomeDocumentUrl] = useState("");
  const [state, formAction, pending] = useActionState(
    async (prev: Awaited<ReturnType<typeof submitApplicationAction>>, formData: FormData) => {
      const next = await submitApplicationAction(pmSlug, prev, formData);
      if (next?.success) {
        trackEvent("application_submitted", { pmId, pmSlug, listingId });
      }
      return next;
    },
    undefined
  );

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-lg font-semibold text-foreground">Application submitted</p>
        <p className="mt-1 text-sm text-muted-foreground">
          You&apos;ll hear back as the manager reviews your application.
        </p>
        {state.applicationId && (
          <Button asChild className="mt-4">
            <Link href={`/applications/${state.applicationId}`}>Track status</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="absolute h-0 w-0 opacity-0"
        aria-hidden="true"
      />
      {listingId && <input type="hidden" name="listingId" value={listingId} />}
      <input type="hidden" name="monthlyIncomeRange" value={incomeRange} />
      <input type="hidden" name="idDocumentUrl" value={idDocumentUrl} />
      <input type="hidden" name="incomeDocumentUrl" value={incomeDocumentUrl} />

      <h2 className="font-display text-lg font-semibold text-foreground">Rental application</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="app-fullName">Full name</Label>
          <Input id="app-fullName" name="fullName" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="app-nationalId">National ID number</Label>
          <Input id="app-nationalId" name="nationalId" required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="app-phone">Phone</Label>
          <Input id="app-phone" name="phone" placeholder="07xx xxx xxx" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="app-email">Email</Label>
          <Input id="app-email" name="email" type="email" required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="app-occupation">Occupation</Label>
          <Input id="app-occupation" name="occupation" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="app-employer">Employer</Label>
          <Input id="app-employer" name="employer" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Monthly income range</Label>
        <Select value={incomeRange} onValueChange={setIncomeRange}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {INCOME_RANGES.map((range) => (
              <SelectItem key={range} value={range}>{range}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="app-residence">Current residence</Label>
        <Input id="app-residence" name="currentResidence" required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="app-moveIn">Desired move-in date</Label>
          <Input id="app-moveIn" name="desiredMoveInDate" type="date" min={todayIso()} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="app-occupants">Number of occupants</Label>
          <Input id="app-occupants" name="occupants" type="number" min={1} max={20} defaultValue={1} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="app-referee">Referee contact (name + phone or email)</Label>
        <Input id="app-referee" name="refereeContact" required />
      </div>

      <DocumentUploader id="app-id-doc" label="National ID copy" required onUploaded={setIdDocumentUrl} />
      <DocumentUploader id="app-income-doc" label="Payslip or bank statement (optional)" onUploaded={setIncomeDocumentUrl} />

      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input type="checkbox" name="consent" required className="mt-0.5 size-4 rounded border-border" />
        <span>
          I consent to Rollup Properties sharing this application, including my uploaded documents, with
          this property manager for the purpose of reviewing my application, in line with the Kenya Data
          Protection Act, 2019. See our{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </span>
      </label>

      {state?.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending || !idDocumentUrl}>
        {pending ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}
