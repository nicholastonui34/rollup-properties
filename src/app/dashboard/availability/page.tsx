import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmSubmitButton } from "@/components/listing/confirm-submit-button";
import { addTourSlotAction, deleteTourSlotAction } from "./actions";

export const metadata: Metadata = { title: "Tour availability" };

function minDateTimeLocal() {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

export default async function AvailabilityPage() {
  const session = await auth();
  const slots = await prisma.tourSlot.findMany({
    where: { pmId: session!.user.id, startsAt: { gt: new Date() } },
    orderBy: { startsAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Video tour availability
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Open 30-minute slots for renters to book a live video tour. If you have none open, video
          requests fall back to a &ldquo;request a time&rdquo; form you confirm manually.
        </p>
      </div>

      <form action={addTourSlotAction} className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="space-y-2">
          <Label htmlFor="slot-starts-at">Add a slot</Label>
          <Input id="slot-starts-at" name="startsAt" type="datetime-local" min={minDateTimeLocal()} required />
        </div>
        <Button type="submit">Add slot</Button>
      </form>

      {slots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">No upcoming slots yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {slots.map((slot) => (
            <div key={slot.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">
                  {slot.startsAt.toLocaleString("en-KE", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                <Badge variant={slot.isBooked ? "default" : "outline"}>
                  {slot.isBooked ? "Booked" : "Open"}
                </Badge>
              </div>
              {!slot.isBooked && (
                <form action={deleteTourSlotAction.bind(null, slot.id)}>
                  <ConfirmSubmitButton
                    type="submit"
                    size="sm"
                    variant="outline"
                    confirmMessage="Remove this slot?"
                  >
                    Remove
                  </ConfirmSubmitButton>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
