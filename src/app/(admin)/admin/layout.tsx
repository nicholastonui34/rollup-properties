import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!["VERIFIER", "ADMIN"].includes(session.user.role)) redirect("/");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <nav className="mb-8 flex items-center gap-1" aria-label="Admin">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/verifications">Verification queue</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/listers">Lister KYC</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/payments">Payments</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/reports">Reports</Link>
        </Button>
        {session.user.role === "ADMIN" && (
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/media-requests">Pro Media</Link>
          </Button>
        )}
      </nav>
      {children}
    </div>
  );
}
