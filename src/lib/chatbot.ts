import { FAQ_GROUPS, type Faq } from "@/lib/faqs";

const ALL_FAQS: Faq[] = FAQ_GROUPS.flatMap((g) => g.faqs);

function findFaq(question: string): Faq {
  const faq = ALL_FAQS.find((f) => f.question === question);
  if (!faq) throw new Error(`Suggested question not found in FAQ_GROUPS: "${question}"`);
  return faq;
}

// Hand-picked starter chips spanning the main audiences (renter, student,
// lister, agency, investor) rather than mechanically taking each group's
// first entry — the FAQ set has grown well past "one chip per group" size,
// so this keeps the widget's first screen from getting crowded.
export const SUGGESTED_QUESTIONS: Faq[] = [
  "How does the verified badge work?",
  "What is the Student Housing Hub?",
  "Is listing free?",
  "Can I get a website for my agency?",
].map(findFaq);

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

// Small keyword-overlap scorer — good enough for a bounded FAQ set like this
// one, with zero external calls or API keys required. Question-word matches
// count for more than answer-word matches: with ~30 FAQs now covering every
// part of the product, generic terms repeated across many answers ("listing",
// "Nyoomba", "verified") would otherwise blur which entry is the real match.
// Anything below the threshold falls through to the "talk to a human" handoff.
export function findBestFaqMatch(query: string): Faq | null {
  const queryTokens = new Set(tokenize(query));
  if (queryTokens.size === 0) return null;

  let best: Faq | null = null;
  let bestScore = 0;
  for (const faq of ALL_FAQS) {
    let score = 0;
    for (const t of tokenize(faq.question)) if (queryTokens.has(t)) score += 2;
    for (const t of tokenize(faq.answer)) if (queryTokens.has(t)) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = faq;
    }
  }
  return bestScore >= 2 ? best : null;
}
