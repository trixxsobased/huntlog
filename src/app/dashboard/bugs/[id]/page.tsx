import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AttachmentUpload } from "@/components/attachment-upload";
import { BugActions } from "@/components/bug-actions";
import { StatusSelect } from "@/components/status-select";
import MarkdownViewer from "@/components/md-viewer";
import type { Bug } from "@/lib/types";

import { severityColor, severityScoreColor, statusLabel } from "@/lib/constants";

function CollapsibleSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="border border-[#1f1f1f] rounded-sm bg-[#0e0e0e] group">
      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#111111] transition-colors border-b border-transparent group-open:border-[#1f1f1f]">
        <span className="text-[10px] font-semibold uppercase tracking-widest font-mono text-[#a1a1aa]">{title}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground chevron-icon">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </summary>
      <div className="px-4 py-4 text-sm leading-relaxed text-[#d4d4d8]">
        {children}
      </div>
    </details>
  );
}

export default async function BugDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const supabase = await createClient();

  const { data: bug } = await supabase
    .from("bugs")
    .select("*")
    .eq("id", resolvedParams.id)
    .single();

  if (!bug) {
    notFound();
  }

  const { data: attachments } = await supabase
    .from("bug_attachments")
    .select("*")
    .eq("bug_id", resolvedParams.id)
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-5 w-full">
      {/* Back nav */}
      <Link href="/dashboard/bugs" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        {bug.bug_id}
      </Link>

      {/* Header row: Bug info badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 font-semibold capitalize rounded-sm ${severityColor[bug.severity]}`}>
          {bug.severity}
        </Badge>
        <StatusSelect bugId={bug.id} initialStatus={bug.status} />
        {bug.vulnerability_type && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 uppercase tracking-wider font-mono rounded-sm border-border text-muted-foreground">
            {bug.vulnerability_type}
          </Badge>
        )}
        {bug.program_name && (
          <span className="text-[10px] font-mono text-muted-foreground">
            {bug.program_name}
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-xl md:text-2xl font-bold tracking-tight leading-tight">
        {bug.title}
      </h1>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left column: content */}
        <div className="md:col-span-2 space-y-3">
          {/* CVSS Score Display */}
          {bug.cvss_score > 0 && (
            <div className="border border-[#1f1f1f] rounded-sm bg-[#0e0e0e] p-4 w-fit min-w-[200px]">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mb-1">CVSS Score</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-bold font-mono tabular-nums ${severityScoreColor[bug.severity]}`}>
                  {bug.cvss_score.toFixed(1)}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">CVSS 3.1</span>
              </div>
              {bug.cvss_vector && (
                <p className="text-[10px] font-mono text-muted-foreground mt-2 break-all">{bug.cvss_vector}</p>
              )}
            </div>
          )}

          {/* Collapsible Sections */}
          {bug.description && (
            <CollapsibleSection title="Description" defaultOpen={true}>
              <div data-color-mode="dark" className="prose prose-invert max-w-none prose-sm">
                <MarkdownViewer source={bug.description} style={{ backgroundColor: 'transparent', color: 'inherit' }} />
              </div>
            </CollapsibleSection>
          )}

          {bug.steps_to_reproduce && (
            <CollapsibleSection title="Steps to Reproduce">
              <div data-color-mode="dark" className="prose prose-invert max-w-none prose-sm">
                <MarkdownViewer source={bug.steps_to_reproduce} style={{ backgroundColor: 'transparent', color: 'inherit' }} />
              </div>
            </CollapsibleSection>
          )}

          {bug.impact && (
            <CollapsibleSection title="Impact">
              <div data-color-mode="dark" className="prose prose-invert max-w-none prose-sm">
                <MarkdownViewer source={bug.impact} style={{ backgroundColor: 'transparent', color: 'inherit' }} />
              </div>
            </CollapsibleSection>
          )}

          {(bug.expected_behavior || bug.actual_behavior) && (
            <CollapsibleSection title="Expected / Actual Behavior">
              <div className="space-y-3">
                {bug.expected_behavior && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-mono mb-1">Expected</p>
                    <p className="whitespace-pre-wrap">{bug.expected_behavior}</p>
                  </div>
                )}
                {bug.actual_behavior && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-red-400 font-mono mb-1">Actual</p>
                    <p className="whitespace-pre-wrap">{bug.actual_behavior}</p>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}

          {bug.remediation && (
            <CollapsibleSection title="Remediation">
              <p className="whitespace-pre-wrap">{bug.remediation}</p>
            </CollapsibleSection>
          )}

          {/* Evidence */}
          <div className="border border-[#1f1f1f] rounded-sm bg-[#0e0e0e] p-4">
            <p className="text-[10px] uppercase tracking-widest text-[#a1a1aa] font-mono mb-3 font-semibold">Evidence Attachments</p>
            <div className="overflow-x-auto">
              <AttachmentUpload bugId={bug.id} existingAttachments={attachments || []} />
            </div>
          </div>
        </div>

        {/* Right column: metadata + actions */}
        <div className="md:col-span-1 space-y-3">
          {/* Details card */}
          <div className="border border-[#1f1f1f] rounded-sm bg-[#0a0a0a] p-3 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-mono font-semibold">Details</p>

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground/70 text-[10px] uppercase font-mono">Bug ID</span>
                <span className="font-mono text-[11px] text-[#e4e4e7]">{bug.bug_id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground/70 text-[10px] uppercase font-mono">Status</span>
                <span className="text-[11px] font-medium text-[#e4e4e7]">{statusLabel[bug.status]}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground/70 text-[10px] uppercase font-mono">Severity</span>
                <span className="text-[11px] capitalize text-[#e4e4e7]">{bug.severity}</span>
              </div>
              {bug.target_url && (
                <div className="flex justify-between items-start gap-2 pt-1 border-t border-white/5">
                  <span className="text-muted-foreground/70 text-[10px] uppercase font-mono shrink-0">Target</span>
                  <span className="font-mono text-[10px] text-right break-all text-violet-300">{bug.target_url}</span>
                </div>
              )}
              {bug.h1_report_id && (
                <div className="flex justify-between items-center pt-1 border-t border-white/5">
                  <span className="text-muted-foreground/70 text-[10px] uppercase font-mono">H1 Report</span>
                  <span className="font-mono text-[11px] text-[#e4e4e7]">#{bug.h1_report_id}</span>
                </div>
              )}
              {bug.bounty_amount !== null && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground/70 text-[10px] uppercase font-mono">Bounty</span>
                  <span className="text-[11px] font-semibold text-emerald-400 font-mono">${bug.bounty_amount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1 border-t border-white/5">
                <span className="text-muted-foreground/70 text-[10px] uppercase font-mono">Reported</span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {new Date(bug.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <BugActions bug={bug as Bug} />
        </div>
      </div>
    </div>
  );
}
