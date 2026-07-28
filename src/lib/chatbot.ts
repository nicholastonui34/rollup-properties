import { FAQ_GROUPS, type Faq } from "@/lib/faqs";

const ALL_FAQS: Faq[] = FAQ_GROUPS.flatMap((g) => g.faqs);

// One representative question per audience group — used as the widget's
// starter suggestion chips so a first-time visitor sees the FAQ actually
// covers renters, students, and listers, not just one of them.
export const SUGGESTED_QUESTIONS: Faq[] = FAQ_GROUPS.map((g) => g.faqs[0]);

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "do", "does", "how", "what", "why", "can",
  "i", "to", "for", "of", "on", "in", "and", "or", "my", "your", "it", "its",
  "this", "that", "with", "you", "me", "will", "if",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

// Very small keyword-overlap scorer — good enough for a bounded FAQ set like
// this one, with zero external calls or API keys required. Anything below
// the match threshold falls through to the "talk to a human" handoff.
export function findBestFaqMatch(query: string): Faq | null {
  const queryTokens = new Set(tokenize(query));
  if (queryTokens.size === 0) return null;

  let best: Faq | null = null;
  let bestScore = 0;
  for (const faq of ALL_FAQS) {
    const faqTokens = tokenize(`${faq.question} ${faq.answer}`);
    let score = 0;
    for (const t of faqTokens) if (queryTokens.has(t)) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = faq;
    }
  }
  return bestScore >= 2 ? best : null;
}
