import { auth } from "@/lib/auth";

export async function requireVerifier() {
  const session = await auth();
  if (!session?.user || !["VERIFIER", "ADMIN"].includes(session.user.role)) {
    throw new Error("Not authorized");
  }
  return session.user;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }
  return session.user;
}
