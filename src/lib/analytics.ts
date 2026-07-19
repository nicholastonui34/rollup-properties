// No analytics provider is wired up yet (PostHog is a planned M8 item). This
// helper is the single call site every feature uses to fire named events —
// it no-ops safely today and will start actually sending events the moment
// gtag/posthog is added to the page, with zero call-site changes needed.
type EventProps = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: string, props?: EventProps) {
  if (typeof window === "undefined") return;

  const w = window as typeof window & {
    gtag?: (...args: unknown[]) => void;
    posthog?: { capture: (name: string, props?: EventProps) => void };
  };

  try {
    w.gtag?.("event", name, props);
    w.posthog?.capture(name, props);
  } catch {
    // Analytics must never break the app.
  }

  if (process.env.NODE_ENV !== "production") {
    console.debug(`[analytics] ${name}`, props ?? {});
  }
}
