export interface Faq {
  question: string;
  answer: string;
}

export interface FaqGroup {
  audience: string;
  faqs: Faq[];
}

export const FAQ_GROUPS: FaqGroup[] = [
  {
    audience: "Renters & buyers",
    faqs: [
      {
        question: "How does the verified badge work?",
        answer:
          "Before a listing goes live, a Nyoomba verifier confirms the photos, address and ownership or management rights in person or via documentation. The badge shows the date it was last confirmed, so you know how fresh that check is.",
      },
      {
        question: "Why do I have to pay to see the contact?",
        answer:
          "A small one-time fee (currently KES 99) unlocks the property manager's direct phone number — far cheaper than a broker's viewing fee, and it's yours forever once paid. There's no ongoing subscription and no broker in the middle.",
      },
      {
        question: "What if the listing turns out to be fake?",
        answer:
          "Report it from the listing page. If we confirm it's fake after you've unlocked the contact, you get a full refund and the lister is banned from the platform.",
      },
      {
        question: "How do I book a viewing?",
        answer:
          "Use the \"Book a Tour\" button on any live listing to request an in-person or video-call viewing. The manager gets notified by email and WhatsApp and responds directly to you.",
      },
    ],
  },
  {
    audience: "Students",
    faqs: [
      {
        question: "What is the Student Housing Hub?",
        answer:
          "A filtered view of Nyoomba listings — hostels, shared apartments and independent units — within reach of Nairobi's main universities, with the same verification and refund guarantee as every other listing.",
      },
      {
        question: "Can I filter by university?",
        answer:
          "Yes — the Student Housing Hub and the main search both let you filter by proximity to a specific campus.",
      },
    ],
  },
  {
    audience: "Listers",
    faqs: [
      {
        question: "Is listing free?",
        answer:
          "Your first 20 published listings are free. From the 21st listing onward, publishing costs a small one-time fee (currently KES 99), charged via M-Pesa at the point of publishing.",
      },
      {
        question: "How does verification work for my listing?",
        answer:
          "After you submit a listing with at least 5 photos, it enters our verification queue. A verifier confirms the details before it goes live — this is what makes the badge meaningful to seekers.",
      },
      {
        question: "What is Pro Media?",
        answer:
          "Nyoomba's in-house team offers professional photography, video tours and 3D/virtual tours to help your listing stand out. Request it from your dashboard — pricing is quoted after we review your request.",
      },
      {
        question: "Can I add my agency's website?",
        answer:
          "Yes — add an optional agency name and website URL on any listing. It's shown to seekers after they unlock your contact, alongside your phone number.",
      },
    ],
  },
];
