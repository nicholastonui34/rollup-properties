import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Create your account",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect(["LISTER", "ADMIN"].includes(session.user.role) ? "/dashboard" : "/");
  }

  const params = await searchParams;
  const defaultRole = params.role === "LISTER" ? "LISTER" : "SEEKER";

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
        Create your account
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Free to join — whether you&apos;re hunting for a home or listing one.
      </p>
      <div className="mt-8">
        <SignupForm defaultRole={defaultRole} />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
