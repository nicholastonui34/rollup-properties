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
        question: "How exactly do refunds work?",
        answer:
          "Report a fake or misrepresented listing within 14 days of unlocking it — from the listing page, or by emailing support with your receipt from My Unlocks. An admin reviews the case and, if confirmed, refunds the KES 99 fee within 5–7 business days and bans the lister.",
      },
      {
        question: "How do I book a viewing?",
        answer:
          "Use the \"Book a Tour\" button on any live listing to request an in-person or video-call viewing. The manager gets notified by email and WhatsApp and responds directly to you.",
      },
      {
        question: "Can I see the location on a map?",
        answer:
          "Yes — every geocoded listing has Map and Satellite tabs (free, always on), plus a Street View tab where available, so you can check the exact location before you unlock the contact.",
      },
      {
        question: "Can I see what's nearby — schools, hospitals, shops?",
        answer:
          "Yes — listings show real nearby places pulled automatically once the address is confirmed: cafes, restaurants, groceries, schools, hospitals, gyms, nightlife, public transport stops and more, each with distance and rating.",
      },
      {
        question: "Can I save listings or searches?",
        answer:
          "Yes — tap the heart icon to save a listing to Favorites, or save a search from the search page to get email alerts when new matching listings go live.",
      },
      {
        question: "How do I apply for a place, not just view it?",
        answer:
          "On a property manager's page you can submit a full rental application — ID, income range, references and documents — instead of just calling. You can track its status (submitted, under review, shortlisted, approved) from your account.",
      },
      {
        question: "Can I use Nyoomba as an app on my phone?",
        answer:
          "Yes — Nyoomba is installable as a PWA. On Android/desktop you'll get an install prompt; on iOS, use Share → \"Add to Home Screen\".",
      },
      {
        question: "Do I pay my rent through Nyoomba?",
        answer:
          "No — Nyoomba only ever charges the one-time KES 99 contact-unlock fee. Rent, deposits and any ongoing payments go directly to the property manager, however you two arrange it.",
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
      {
        question: "Which universities does the Hub cover?",
        answer:
          "University of Nairobi (Main Campus), Kenyatta University, Strathmore University, JKUAT (Juja), USIU-Africa, and Multimedia University of Kenya — more campuses are added as we get real listing coverage nearby.",
      },
      {
        question: "I'm an international student — can I sort housing before I arrive?",
        answer:
          "Yes — search, get verified, and book a video-call tour before you land, so a room is confirmed before intake starts. It's a big part of why we built the Hub in the first place.",
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
        question: "What happens after I submit a listing?",
        answer:
          "It moves to \"In verification\". A verifier either approves it (it goes Live), or sends it back \"Needs info\"/\"Rejected\" with notes on what to fix, so you can resubmit.",
      },
      {
        question: "Do I need to verify my identity?",
        answer:
          "Yes — submit your national ID number from your dashboard so our team can confirm you control the properties you list. It's reviewed alongside your listing verification.",
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
      {
        question: "Can tenants book viewings without calling me?",
        answer:
          "Yes — publish your availability from the dashboard and tenants book an open slot directly. You still get every request in your Tour requests inbox.",
      },
      {
        question: "Can tenants apply online instead of just calling?",
        answer:
          "Yes — your property-manager page accepts full rental applications (ID, income, references, documents), which you review and move through submitted → under review → shortlisted → approved from your dashboard.",
      },
      {
        question: "Does my listing get maps and nearby amenities automatically?",
        answer:
          "Yes — once your address is geocoded, Map/Satellite/Street View tabs and a nearby-amenities panel (schools, hospitals, shops, transport and more) are generated automatically. Nothing extra to upload.",
      },
      {
        question: "Does Nyoomba collect rent or deposits for me?",
        answer:
          "No — rent, deposits and any ongoing tenant payments stay a direct arrangement between you and your tenant. Nyoomba only charges its own platform fees: the KES 99 unlock fee (paid by seekers), Pro Media/boost fees, and listing fees past your free quota.",
      },
    ],
  },
  {
    audience: "Agencies & realtors",
    faqs: [
      {
        question: "Can I get a website for my agency?",
        answer:
          "Yes — every lister gets a branded property-manager page automatically (nyoomba.com/pm/your-name) the moment they list. See /agency-websites for a custom domain or extra branding.",
      },
      {
        question: "What can tenants do on my agency page?",
        answer:
          "Browse your live listings, contact you, apply for a specific unit, and book an available tour slot — all handled on Nyoomba's platform, with no separate site to run.",
      },
    ],
  },
  {
    audience: "Investors",
    faqs: [
      {
        question: "How can I invest in Nyoomba?",
        answer:
          "We're raising KES 50,000,000 to scale verification, the Student Housing Hub, and the agency-website product. See /investors for the pitch and a form to request the deck.",
      },
      {
        question: "What is Nyoomba's business model?",
        answer:
          "Contact-unlock fees, listing fees past the free quota, Pro Media (photography/video/3D tours), advertising, and — newest — branded websites for agencies and property managers.",
      },
    ],
  },
  {
    audience: "About Nyoomba",
    faqs: [
      {
        question: "What is Nyoomba?",
        answer:
          "A verified marketplace for renting, buying and selling property in Kenya. Every listing is checked by a real person before it goes live, and you deal directly with the property manager — no broker fees, no fake listings.",
      },
      {
        question: "Are you hiring?",
        answer:
          "Check /careers — we're usually looking for Verification Agents, Sales roles, and content/growth roles as we expand beyond Nairobi.",
      },
      {
        question: "How do I contact support?",
        answer:
          "Chat with me right here, use the form on the Help Centre (/help#contact), or email support@nyoomba.co.ke.",
      },
    ],
  },
];
