"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const addSlotSchema = z.object({
  startsAt: z.string().min(1, "Choose a date and time"),
});

export async function addTourSlotAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user || !["LISTER", "ADMIN"].includes(session.user.role)) {
    throw new Error("Not authorized");
  }

  const parsed = addSlotSchema.safeParse({ startsAt: formData.get("startsAt") });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const startsAt = new Date(parsed.data.startsAt);
  if (Number.isNaN(startsAt.getTime()) || startsAt <= new Date()) {
    throw new Error("Choose a time in the future");
  }

  await prisma.tourSlot.create({
    data: { pmId: session.user.id, startsAt },
  });
  revalidatePath("/dashboard/availability");
}

export async function deleteTourSlotAction(slotId: string) {
  const session = await auth();
  if (!session?.user || !["LISTER", "ADMIN"].includes(session.user.role)) {
    throw new Error("Not authorized");
  }

  const slot = await prisma.tourSlot.findUnique({ where: { id: slotId } });
  if (!slot || (slot.pmId !== session.user.id && session.user.role !== "ADMIN")) {
    throw new Error("Slot not found");
  }
  if (slot.isBooked) {
    throw new Error("Can't delete a slot that's already booked");
  }

  await prisma.tourSlot.delete({ where: { id: slotId } });
  revalidatePath("/dashboard/availability");
}
