export interface CareerRole {
  slug: string;
  title: string;
  department: string;
  location: string;
  type: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
}

// Placeholder seed roles (V2_UPGRADE_BRIEF.md §6) — final list to be
// brainstormed by the team. Stored as a plain data file rather than a DB
// table so the roles page needs no admin CRUD for an MVP-sized list; editing
// a role means editing this file and deploying, same as any other content
// change in this codebase.
export const CAREER_ROLES: CareerRole[] = [
  {
    slug: "verification-agent",
    title: "Verification Agent",
    department: "Trust & Safety",
    location: "Nairobi (field-based)",
    type: "Contract",
    summary:
      "Visit listed properties in person to confirm photos, address and ownership before a listing goes live — the human check behind every verified badge on Rollup.",
    responsibilities: [
      "Visit properties within your assigned area to confirm the listing matches reality",
      "Photograph proof of visit and cross-check ownership or management documents",
      "Log verification outcomes in the Rollup admin queue with clear notes",
      "Flag suspicious listings for further review",
    ],
    requirements: [
      "Based in Nairobi with reliable means of getting around the city",
      "A smartphone with a working camera",
      "Comfortable talking to landlords, caretakers and property managers",
      "Detail-oriented — your sign-off is what makes the badge trustworthy",
    ],
  },
  {
    slug: "sales-executive",
    title: "Sales Executive",
    department: "Growth",
    location: "Nairobi",
    type: "Full-time",
    summary:
      "Bring property managers, agents and landlords onto Rollup — you're selling a better way to list, not a broker fee.",
    responsibilities: [
      "Prospect and onboard property managers, landlords and agencies",
      "Walk new listers through creating their first verified listing",
      "Hit monthly targets for new active listers and published listings",
      "Feed market feedback back to product and marketing",
    ],
    requirements: [
      "1+ years in sales, ideally in real estate, proptech or a related field",
      "Comfortable with in-person visits and cold outreach",
      "Fluent in English and Swahili",
    ],
  },
  {
    slug: "marketing-content",
    title: "Marketing & Content",
    department: "Marketing",
    location: "Nairobi (hybrid)",
    type: "Full-time",
    summary:
      "Own the story of Rollup — from social content to the articles on this site — as we build trust in a market used to broker fees and fake listings.",
    responsibilities: [
      "Plan and produce content across social, email and the News section",
      "Run campaigns that grow verified listing supply and serious seeker demand",
      "Track what's working and double down on it",
    ],
    requirements: [
      "Portfolio of content or campaign work you can show",
      "Strong written English; Swahili a plus",
      "Comfortable working with data to judge what's actually performing",
    ],
  },
  {
    slug: "customer-support",
    title: "Customer Support",
    department: "Operations",
    location: "Nairobi (remote-friendly)",
    type: "Full-time",
    summary:
      "Be the first response for seekers and listers with questions, payment issues, or a listing that doesn't look right.",
    responsibilities: [
      "Answer support requests via email and phone promptly and clearly",
      "Triage refund requests and escalate fraud reports to Trust & Safety",
      "Keep the Help Centre content accurate as the product changes",
    ],
    requirements: [
      "Clear written and spoken communication in English and Swahili",
      "Patient, calm under pressure, genuinely likes solving people's problems",
    ],
  },
  {
    slug: "pro-media-creator",
    title: "Pro Media Creator",
    department: "Pro Media",
    location: "Nairobi (field-based)",
    type: "Freelance / Contract",
    summary:
      "Photographers, videographers and 3D/virtual tour creators who shoot listings for Rollup's paid Pro Media service — helping listers stand out with photos and tours that actually sell the space.",
    responsibilities: [
      "Shoot professional listing photography, video tours or 3D/virtual tours on request",
      "Deliver on schedule and to Rollup's quality bar",
      "Work directly with listers to schedule shoots",
    ],
    requirements: [
      "Own camera/gimbal or 3D-tour equipment (Matterport, Kuula, Ricoh Theta, etc.)",
      "Portfolio of real estate or interior work",
      "Based in or able to travel around Nairobi",
    ],
  },
];

export function findCareerRole(slug: string): CareerRole | undefined {
  return CAREER_ROLES.find((r) => r.slug === slug);
}
