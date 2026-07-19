import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";
import { MobileNav } from "@/components/site/mobile-nav";

export async function SiteHeader() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0];

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          <Button asChild variant="ghost" size="lg">
            <Link href="/search?purpose=RENT">Rent</Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="/search?purpose=SALE">Buy</Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="/#how-it-works">How it works</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              {["LISTER", "ADMIN"].includes(session.user.role) && (
                <Button asChild variant="ghost" size="lg" className="hidden sm:inline-flex">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              )}
              {["VERIFIER", "ADMIN"].includes(session.user.role) && (
                <Button asChild variant="ghost" size="lg" className="hidden sm:inline-flex">
                  <Link href="/admin">Admin</Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="lg" className="hidden sm:inline-flex">
                <Link href="/favorites">Favorites</Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="hidden sm:inline-flex">
                <Link href="/saved-searches">Saved searches</Link>
              </Button>
              {session.user.role === "SEEKER" && (
                <Button asChild variant="ghost" size="lg" className="hidden sm:inline-flex">
                  <Link href="/unlocks">My unlocks</Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="lg" className="hidden sm:inline-flex">
                <Link href="/my-reports">My reports</Link>
              </Button>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                Hi, <span className="font-medium text-foreground">{firstName}</span>
              </span>
              <form action={signOutAction} className="hidden sm:block">
                <Button variant="outline" size="lg" type="submit">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="lg" className="hidden sm:inline-flex">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="lg" className="hidden sm:inline-flex">
                <Link href="/signup?role=LISTER">List your property</Link>
              </Button>
            </>
          )}

          <MobileNav
            session={session?.user ? { firstName: firstName ?? "", role: session.user.role } : null}
            signOutAction={signOutAction}
          />
        </div>
      </div>
    </header>
  );
}
