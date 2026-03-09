import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { updateBug } from "@/lib/actions/bugs";
import { BugForm } from "@/components/bug-form";
import { DeleteBugButton } from "@/components/delete-bug-button";
import Link from "next/link";
import type { Bug, Program } from "@/lib/types";

export default async function EditBugPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: bug } = await supabase
    .from("bugs")
    .select("*")
    .eq("id", id)
    .single();

  if (!bug) {
    notFound();
  }

  const { data: programs } = await supabase
    .from("programs")
    .select("id, name")
    .order("name");

  const allPrograms = (programs as Program[]) || [];

  const typedBug = bug as Bug;

  async function handleUpdate(formData: FormData) {
    "use server";
    return updateBug(id, formData);
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono mb-2">
            <Link href="/dashboard/bugs" className="hover:text-foreground transition-colors">
              Bugs
            </Link>
            <span>/</span>
            <span className="text-foreground">{typedBug.bug_id}</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight">Edit Bug</h1>
        </div>
        <DeleteBugButton bugId={id} />
      </div>

      <BugForm
        programs={allPrograms}
        defaultValues={{
          title: typedBug.title,
          description: typedBug.description,
          steps_to_reproduce: typedBug.steps_to_reproduce,
          severity: typedBug.severity,
          status: typedBug.status,
          vulnerability_type: typedBug.vulnerability_type || undefined,
          target_url: typedBug.target_url || undefined,
          expected_behavior: typedBug.expected_behavior || undefined,
          actual_behavior: typedBug.actual_behavior || undefined,
          impact: typedBug.impact || undefined,
          remediation: typedBug.remediation || undefined,
          program_name: typedBug.program_name || undefined,
          cvss_score: typedBug.cvss_score || undefined,
          cvss_vector: typedBug.cvss_vector || undefined,
        }}
        action={handleUpdate}
        submitLabel="Save Changes"
      />
    </div>
  );
}
