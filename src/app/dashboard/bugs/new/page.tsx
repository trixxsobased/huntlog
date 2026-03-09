import { createBug } from "@/lib/actions/bugs";
import { BugForm } from "@/components/bug-form";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Program } from "@/lib/types";

export default async function NewBugPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  const { data: programs } = await supabase
    .from("programs")
    .select("id, name")
    .order("name");

  const allPrograms = (programs as Program[]) || [];

  const defaultValues = {
    title: params.title as string | undefined,
    description: params.description as string | undefined,
    steps_to_reproduce: params.steps_to_reproduce as string | undefined,
    impact: params.impact as string | undefined,
    expected_behavior: params.expected_behavior as string | undefined,
    actual_behavior: params.actual_behavior as string | undefined,
    remediation: params.remediation as string | undefined,
    severity: (params.severity as string) || "low",
    status: "new",
    vulnerability_type: params.vulnerability_type as string | undefined,
    target_url: params.target_url as string | undefined,
    program_name: params.program_name as string | undefined,
    cvss_score: params.cvss_score ? parseFloat(params.cvss_score as string) : undefined,
    cvss_vector: params.cvss_vector as string | undefined,
  };

  return (
    <div className="space-y-4 w-full">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono mb-2">
          <Link href="/dashboard/bugs" className="hover:text-foreground transition-colors">
            Bugs
          </Link>
          <span>/</span>
          <span className="text-foreground">New</span>
        </div>
        <h1 className="text-lg font-bold tracking-tight">New Bug Report</h1>
      </div>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <BugForm action={createBug} submitLabel="Create Bug" programs={allPrograms} defaultValues={defaultValues as any} />
    </div>
  );
}
