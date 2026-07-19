import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findCareerRole, CAREER_ROLES } from "@/lib/careers";
import { ApplicationForm } from "@/components/careers/application-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const role = findCareerRole(slug);
  if (!role) return {};
  return { title: role.title, description: role.summary };
}

export default async function CareerRolePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const role = findCareerRole(slug);
  if (!role) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/careers" className="text-sm text-muted-foreground hover:text-foreground">
        ← All roles
      </Link>

      <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {role.title}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {role.department} · {role.location} · {role.type}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{role.summary}</p>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-foreground">What you&apos;ll do</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          {role.responsibilities.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-foreground">What we&apos;re looking for</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          {role.requirements.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Apply for this role</h2>
        <ApplicationForm roleSlug={role.slug} />
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return CAREER_ROLES.map((role) => ({ slug: role.slug }));
}
