import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["LISTER", "ADMIN"].includes(session.user.role)) redirect("/");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</div>
  );
}
