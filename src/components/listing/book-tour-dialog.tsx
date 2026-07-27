"use client";

import { useActionState, useState } from "react";
import { CalendarCheck, Copy, MessageCircle } from "lucide-react";
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
import { trackEvent } from "@/lib/analytics";

export type TourSlotOption = { id: string; startsAt: string };

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function maxDateIso() {
  return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function formatSlot(iso: string) {
  return new Date(iso).toLocaleString("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

// The server's tourSchema always requires preferredDate/timeSlot, even for a
// slot-picker booking — derive both from the chosen slot's real time so the
// manager's dashboard shows the actual booked time, not a placeholder.
function slotTimeBucket(hour: number): "MORNING" | "AFTERNOON" | "EVENING" {
  if (hour < 12) return "MORNING";
  if (hour < 17) return "AFTERNOON";
  return "EVENING";
}

export function BookTourDialog({
  listingId,
  pmSlug,
  userId,
  availableSlots = [],
  className,
  triggerVariant = "outline",
  triggerLabel = "Book a Tour",
}: {
  listingId: string;
  pmSlug?: string;
  userId?: string;
  availableSlots?: TourSlotOption[];
  className?: string;
  triggerVariant?: "outline" | "default";
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [timeSlot, setTimeSlot] = useState<"MORNING" | "AFTERNOON" | "EVENING">("MORNING");
  const [tourType, setTourType] = useState<"IN_PERSON" | "VIDEO_CALL">("IN_PERSON");
  const [selectedSlotId, setSelectedSlotId] = useState<string>(availableSlots[0]?.id ?? "");
  const [state, formAction, pending] = useActionState<TourFormState, FormData>(
    (prev, formData) => {
      return submitTourRequestAction(listingId, prev, formData).then((next) => {
        if (next?.success) {
          trackEvent(tourType === "VIDEO_CALL" ? "tour_video_booked" : "tour_inperson_booked", {
            listingId,
            pmSlug,
            userId,
          });
        }
        return next;
      });
    },
    undefined
  );

  const useSlotPicker = tourType === "VIDEO_CALL" && availableSlots.length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant={triggerVariant} size="lg" className={className}>
          <CalendarCheck className="size-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        {state?.success ? (
          <>
            <DialogHeader>
              <DialogTitle>Tour request sent</DialogTitle>
              <DialogDescription>
                {state.videoRoomUrl
                  ? "Your video tour is confirmed."
                  : "The manager typically responds within 24 hours to confirm your tour."}
              </DialogDescription>
            </DialogHeader>
            {state.videoRoomUrl && (
              <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-sm font-medium text-foreground">Your video call link</p>
                <div className="flex items-center gap-2">
                  <Input readOnly value={state.videoRoomUrl} className="text-xs" />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(state.videoRoomUrl!)}
                    aria-label="Copy link"
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <a href={state.videoRoomUrl} target="_blank" rel="noopener noreferrer">
                      Join now
                    </a>
                  </Button>
                </div>
              </div>
            )}
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
              <input type="hidden" name="tourType" value={tourType} />

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
                <Label htmlFor="tour-email">Email {useSlotPicker ? "" : "(optional)"}</Label>
                <Input id="tour-email" name="email" type="email" required={useSlotPicker} />
              </div>

              {useSlotPicker ? (
                <div className="space-y-2">
                  <Label>Choose an available slot</Label>
                  <input type="hidden" name="slotId" value={selectedSlotId} />
                  {(() => {
                    const selected = availableSlots.find((s) => s.id === selectedSlotId);
                    const startsAt = selected ? new Date(selected.startsAt) : new Date();
                    return (
                      <>
                        <input type="hidden" name="preferredDate" value={startsAt.toISOString().slice(0, 10)} />
                        <input type="hidden" name="timeSlot" value={slotTimeBucket(startsAt.getHours())} />
                      </>
                    );
                  })()}
                  <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-lg border border-border p-2">
                    {availableSlots.map((slot) => (
                      <label
                        key={slot.id}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                      >
                        <input
                          type="radio"
                          name="slot-picker"
                          value={slot.id}
                          checked={selectedSlotId === slot.id}
                          onChange={() => setSelectedSlotId(slot.id)}
                        />
                        {formatSlot(slot.startsAt)}
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <input type="hidden" name="slotId" value="" />
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
                  {tourType === "VIDEO_CALL" && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MessageCircle className="size-3.5" aria-hidden="true" />
                      No open video slots right now — request a time and the manager will confirm.
                    </p>
                  )}
                </>
              )}

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
