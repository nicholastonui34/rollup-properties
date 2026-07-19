"use client";

import { useActionState, useState } from "react";
import { CalendarCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitTourRequestAction, type TourFormState } from "@/app/listings/[slug]/tour-actions";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function maxDateIso() {
  return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function BookTourDialog({ listingId, className }: { listingId: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [timeSlot, setTimeSlot] = useState<"MORNING" | "AFTERNOON" | "EVENING">("MORNING");
  const [tourType, setTourType] = useState<"IN_PERSON" | "VIDEO_CALL">("IN_PERSON");
  const [state, formAction, pending] = useActionState<TourFormState, FormData>(
    submitTourRequestAction.bind(null, listingId),
    undefined
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="lg" className={className}>
          <CalendarCheck className="size-4" />
          Book a Tour
        </Button>
      </DialogTrigger>
      <DialogContent>
        {state?.success ? (
          <>
            <DialogHeader>
              <DialogTitle>Tour request sent</DialogTitle>
              <DialogDescription>
                The manager typically responds within 24 hours to confirm your tour.
              </DialogDescription>
            </DialogHeader>
            <Button type="button" className="w-full" onClick={() => setOpen(false)}>
              Done
            </Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Book a Tour</DialogTitle>
              <DialogDescription>Tell the manager when you&apos;d like to view this property.</DialogDescription>
            </DialogHeader>

            <form action={formAction} className="space-y-4">
              {/* Honeypot — hidden from real visitors via CSS, no aria label so screen readers skip it too. */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                className="absolute h-0 w-0 opacity-0"
                aria-hidden="true"
              />
              <input type="hidden" name="timeSlot" value={timeSlot} />
              <input type="hidden" name="tourType" value={tourType} />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tour-name">Name</Label>
                  <Input id="tour-name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tour-phone">Phone</Label>
                  <Input id="tour-phone" name="phone" placeholder="07xx xxx xxx" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tour-email">Email (optional)</Label>
                <Input id="tour-email" name="email" type="email" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tour-date">Preferred date</Label>
                  <Input
                    id="tour-date"
                    name="preferredDate"
                    type="date"
                    min={todayIso()}
                    max={maxDateIso()}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time slot</Label>
                  <Select value={timeSlot} onValueChange={(v) => setTimeSlot(v as typeof timeSlot)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MORNING">Morning</SelectItem>
                      <SelectItem value="AFTERNOON">Afternoon</SelectItem>
                      <SelectItem value="EVENING">Evening</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tour type</Label>
                <Select value={tourType} onValueChange={(v) => setTourType(v as typeof tourType)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN_PERSON">In-person</SelectItem>
                    <SelectItem value="VIDEO_CALL">Video call</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tour-message">Message (optional)</Label>
                <Textarea id="tour-message" name="message" rows={3} />
              </div>

              {state?.error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                  {state.error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Sending…" : "Request tour"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
