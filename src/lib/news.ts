export interface NewsArticle {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  // Plain paragraphs; a line starting with "## " renders as a subheading.
  body: string[];
}

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    slug: "rollup-properties-launches-in-nairobi",
    title: "Rollup Properties is live in Nairobi",
    excerpt:
      "A verified rental and sale marketplace for Kenya, built to cut out broker fees and fake listings — starting in Nairobi, expanding from there.",
    publishedAt: "2026-07-18",
    body: [
      "Kenya's rental market runs on trust that most platforms don't earn. Photos that don't match the unit, addresses that turn out to be somewhere else entirely, and broker fees paid just to see a house that may not even exist — anyone who has searched for a home here knows the pattern.",
      "Rollup Properties is our answer to that: a marketplace where every listing is checked by a real person before it goes live, and where you deal directly with the property manager once you unlock their contact. No broker fee, no middleman, no guessing.",
      "## What's live today",
      "Search and browse verified rental and sale listings across Nairobi, with a dedicated Student Housing Hub for units near the city's main universities. Unlock a manager's direct contact for a small one-time fee via M-Pesa or card. Book a tour directly from any listing. And if a listing turns out to be fake after you've unlocked it, you get a full refund and the lister is banned.",
      "## What's next",
      "We're extending coverage to more Kenyan towns, adding richer property media — tours, video, satellite and street view — and building the verification network that makes the badge on every listing mean something. Nairobi first, then everywhere else.",
    ],
  },
  {
    slug: "how-listing-verification-works",
    title: "How listing verification actually works",
    excerpt:
      "The verified badge isn't automatic — here's what a Rollup verifier actually checks before a listing goes live, and why we re-confirm it over time.",
    publishedAt: "2026-07-19",
    body: [
      "A verified badge only means something if it's backed by an actual check. Here's what happens between a lister submitting a listing and it going live on Rollup.",
      "## The check",
      "A Rollup verifier confirms the listing's photos genuinely match the unit, the address is real and matches where the property actually sits, and the lister has the right to manage or let the property — whether that's ownership, a management agreement, or agency authorization.",
      "## Why the date matters",
      "Every verified badge shows the date it was last confirmed. A listing that's been sitting unconfirmed for months is a different level of trust than one checked last week, so we show that date rather than hiding it behind a static badge. Listings flagged as stale get prioritized for re-verification.",
      "## What happens if something's wrong",
      "If a verifier finds a mismatch — wrong photos, an address that doesn't check out, no proof of management rights — the listing is sent back to the lister with specific notes on what needs fixing before it can go live. Nothing gets a pass.",
      "This is deliberately manual right now, not an algorithm rubber-stamping listings. It's slower, but it's the only way the badge stays honest as we scale.",
    ],
  },
  {
    slug: "no-more-broker-fees-how-unlock-works",
    title: "No more broker fees: how the KES 99 unlock works",
    excerpt:
      "Rollup replaces broker viewing fees with a single, transparent, one-time payment — here's exactly what it buys you.",
    publishedAt: "2026-07-19",
    body: [
      "Broker fees in Kenya's rental market are opaque by design — you often don't know what you're paying for until you've already paid it, and it's frequently non-refundable even if the house turns out to be unavailable or fake.",
      "Rollup replaces that with one transparent, one-time payment: KES 99 to unlock a property manager's direct phone number on any listing. No subscription, no repeat fees for the same listing, no broker taking a cut of your future rent.",
      "## What you get",
      "Once you pay, the manager's phone number is unlocked permanently for that listing — you can call or WhatsApp them directly, negotiate, and arrange a viewing with no one else in the conversation. A receipt is saved to your account under My Unlocks.",
      "## The refund guarantee",
      "If a listing turns out to be fake after you've unlocked it, report it. Once we confirm that, you get a full refund and the lister loses access to the platform. The fee only works as a trust mechanism if we back it with an actual guarantee — so we do.",
    ],
  },
];

export function findNewsArticle(slug: string): NewsArticle | undefined {
  return NEWS_ARTICLES.find((a) => a.slug === slug);
}
