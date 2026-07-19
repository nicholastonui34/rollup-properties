import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "You're offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <Logo className="mb-6" />
      <WifiOff className="mb-4 size-10 text-muted-foreground" aria-hidden="true" />
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
        You&apos;re offline
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Reconnect to the internet to keep browsing verified listings.
      </p>
      <Button asChild size="lg" className="mt-6">
        <Link href="/">Try again</Link>
      </Button>
    </div>
  );
}
