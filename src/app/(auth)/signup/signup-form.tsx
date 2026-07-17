"use client";

import { useActionState, useState } from "react";
import { signupAction, type AuthFormState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ROLES = [
  {
    value: "SEEKER",
    title: "I'm looking for a home",
    body: "Search verified rentals and homes for sale.",
  },
  {
    value: "LISTER",
    title: "I'm listing property",
    body: "Landlord, manager or agent — get direct leads.",
  },
] as const;

export function SignupForm({ defaultRole }: { defaultRole: "SEEKER" | "LISTER" }) {
  const [role, setRole] = useState<"SEEKER" | "LISTER">(defaultRole);
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    signupAction,
    undefined
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="role" value={role} />
      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Account type">
        {ROLES.map((r) => (
          <button
            key={r.value}
            type="button"
            role="radio"
            aria-checked={role === r.value}
            onClick={() => setRole(r.value)}
            className={cn(
              "rounded-xl border p-3.5 text-left transition-colors",
              role === r.value
                ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                : "border-border bg-card hover:border-primary/40"
            )}
          >
            <span className="block text-sm font-semibold text-foreground">{r.title}</span>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
              {r.body}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" autoComplete="name" placeholder="Jane Wanjiku" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone number (M-Pesa)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="0712 345 678"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="text-xs text-muted-foreground">At least 8 characters.</p>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
