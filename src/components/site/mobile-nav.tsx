"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type SessionInfo = { firstName: string; role: string } | null;

export function MobileNav({
  session,
  signOutAction,
}: {
  session: SessionInfo;
  signOutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-10"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {open && (
        <div
          id="mobile-nav-panel"
          className="fixed inset-x-0 top-16 z-30 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-border bg-background px-4 py-4 shadow-lg sm:px-6"
        >
          <nav className="flex flex-col gap-1" aria-label="Main">
            <Link href="/search?purpose=RENT" onClick={close} className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted">
              Rent
            </Link>
            <Link href="/search?purpose=SALE" onClick={close} className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted">
              Buy
            </Link>
            <Link href="/#how-it-works" onClick={close} className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted">
              How it works
            </Link>

            {session ? (
              <>
                <div className="my-2 border-t border-border" />
                {["LISTER", "ADMIN"].includes(session.role) && (
                  <Link href="/dashboard" onClick={close} className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted">
                    Dashboard
                  </Link>
                )}
                {["VERIFIER", "ADMIN"].includes(session.role) && (
                  <Link href="/admin" onClick={close} className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted">
                    Admin
                  </Link>
                )}
                <Link href="/favorites" onClick={close} className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted">
                  Favorites
                </Link>
                <Link href="/saved-searches" onClick={close} className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted">
                  Saved searches
                </Link>
                {session.role === "SEEKER" && (
                  <Link href="/unlocks" onClick={close} className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted">
                    My unlocks
                  </Link>
                )}
                <Link href="/my-reports" onClick={close} className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted">
                  My reports
                </Link>
                <div className="my-2 border-t border-border" />
                <p className="px-3 text-sm text-muted-foreground">
                  Signed in as <span className="font-medium text-foreground">{session.firstName}</span>
                </p>
                <form action={signOutAction}>
                  <Button type="submit" variant="outline" className="mt-2 w-full">
                    Sign out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <div className="my-2 border-t border-border" />
                <Link href="/login" onClick={close} className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted">
                  Log in
                </Link>
                <Button asChild className="mt-2 w-full" onClick={close}>
                  <Link href="/signup?role=LISTER">List your property</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
