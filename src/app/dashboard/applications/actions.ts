"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const NEXT_STATUS = {
  SUBMITTED: ["UNDER_REVIEW", "DECLINED"],
  UNDER_REVIEW: ["SHORTLISTED", "DECLINED"],
  SHORTLISTED: ["APPROVED", "DECLINED"],
  APPROVED: [],
  DECLINED: [],
} as const;

export async function updateApplicationStatusAction(
  applicationId: string,
  status: "UNDER_REVIEW" | "SHORTLISTED" | "APPROVED" | "DECLINED"
) {
  const session = await auth();
  if (!session?.user || !["LISTER", "ADMIN"].includes(session.user.role)) {
    throw new Error("Not authorized");
  }

  const application = await prisma.rentalApplication.findUnique({ where: { id: applicationId } });
  if (!application || (application.pmId !== session.user.id && session.user.role !== "ADMIN")) {
    throw new Error("Application not found");
  }

  const allowed = (NEXT_STATUS[application.status] as readonly string[]).includes(status);
  if (!allowed) throw new Error("Invalid status transition");

  await prisma.rentalApplication.update({ where: { id: applicationId }, data: { status } });
  revalidatePath("/dashboard/applications");
  revalidatePath(`/applications/${applicationId}`);
}
