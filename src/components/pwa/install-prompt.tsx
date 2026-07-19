"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

const DISMISS_KEY = "rollup-install-dismissed-at";
const DISMISS_DAYS = 14;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isDismissedRecently(): boolean {
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const dismissedAt = Number(raw);
  if (Number.isNaN(dismissedAt)) return false;
  return Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

function dismiss() {
  localStorage.setItem(DISMISS_KEY, String(Date.now()));
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).standalone === true
  );
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosSheet, setShowIosSheet] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isStandalone() || isDismissedRecently()) return;

    if (isIos()) {
      // Deferred a tick so this reads as an async callback rather than a
      // synchronous setState-in-effect (react-hooks/set-state-in-effect) —
      // mirrors how the beforeinstallprompt branch below only ever sets
      // state from inside its event callback.
      Promise.resolve().then(() => {
        setShowIosSheet(true);
        trackEvent("install_prompt_shown", { platform: "ios" });
      });
      return;
    }

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      trackEvent("install_prompt_shown", { platform: "android_desktop" });
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  function handleDismiss() {
    dismiss();
    setDismissed(true);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") trackEvent("install_prompt_accepted", { platform: "android_desktop" });
    setDeferredPrompt(null);
    dismiss();
  }

  if (dismissed) return null;

  if (showIosSheet) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card p-4 shadow-lg sm:mx-auto sm:mb-4 sm:max-w-sm sm:rounded-2xl sm:border">
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
        <p className="pr-6 text-sm font-medium text-foreground">Install Rollup Properties</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          Tap <Share className="size-4 shrink-0" aria-hidden="true" /> then &ldquo;Add to Home
          Screen&rdquo;.
        </p>
      </div>
    );
  }

  if (deferredPrompt) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-3 border-t border-border bg-card p-4 shadow-lg sm:mx-auto sm:mb-4 sm:max-w-sm sm:rounded-2xl sm:border">
        <Download className="size-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Install Rollup Properties</p>
          <p className="text-xs text-muted-foreground">Quick access, right from your home screen.</p>
        </div>
        <Button type="button" size="sm" onClick={handleInstall}>
          Install
        </Button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return null;
}
