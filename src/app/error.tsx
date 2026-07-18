"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/site/logo";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <LogoMark className="size-14" />
      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-3 text-muted-foreground">
        Sorry about that — an unexpected error occurred. Try again, or head back home.
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={() => unstable_retry()}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/">Back to homepage</Link>
        </Button>
      </div>
    </div>
  );
}
