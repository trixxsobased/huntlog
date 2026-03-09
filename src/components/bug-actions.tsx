"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Copy, CopyPlus, ExternalLink, Edit } from "lucide-react";
import { toast } from "sonner";
import { duplicateBug } from "@/lib/actions/bugs";
import { useTransition } from "react";
import type { Bug } from "@/lib/types";

export function BugActions({ bug }: { bug: Bug }) {
  const [isPending, startTransition] = useTransition();

  const handleCopyH1 = async () => {
    const report = `## Summary
${bug.description || "N/A"}

## Steps To Reproduce
${bug.steps_to_reproduce || "N/A"}

## Impact
${bug.impact || "N/A"}

## CVSS Score
${bug.cvss_vector || "None"} (${bug.cvss_score || "0.0"})

## Additional Notes
Program: ${bug.program_name || "N/A"}
Target: ${bug.target_url || "N/A"}
Severity: ${bug.severity}`;

    try {
      await navigator.clipboard.writeText(report);
      toast.success("Copied to clipboard!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="space-y-2">
      {/* Primary Action */}
      <Button
        className="w-full gap-2 bg-violet-600 hover:bg-violet-700 rounded-sm font-mono text-xs uppercase tracking-wider h-10"
        onClick={handleCopyH1}
      >
        <Copy className="w-3.5 h-3.5" />
        Copy H1 Report
      </Button>

      {/* Secondary Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 rounded-sm text-xs h-8 border-border"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const result = await duplicateBug(bug.id);
              if (result?.error) {
                toast.error(result.error);
              } else {
                toast.success("Report duplicated");
              }
            });
          }}
        >
          <CopyPlus className="w-3.5 h-3.5" />
          {isPending ? "..." : "Duplicate"}
        </Button>

        <Link href={`/dashboard/bugs/${bug.id}/edit`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full gap-1.5 rounded-sm text-xs h-8 border-border">
            <Edit className="w-3.5 h-3.5" />
            Edit
          </Button>
        </Link>
      </div>

      {bug.h1_report_url && (
        <a href={bug.h1_report_url} target="_blank" rel="noopener noreferrer" className="block">
          <Button variant="outline" size="sm" className="w-full gap-1.5 rounded-sm text-xs h-8 border-border">
            <ExternalLink className="w-3.5 h-3.5" />
            View H1 Report
          </Button>
        </a>
      )}
    </div>
  );
}
