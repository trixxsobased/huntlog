import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Bug } from "@/lib/types";
import { BugFilters } from "@/components/bug-filters";

export const dynamic = "force-dynamic";

import { severityColor, statusLabel, statusTextColor } from "@/lib/constants";
export default async function BugsPage({
  searchParams,
}: {
  searchParams: Promise<{ severity?: string; status?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("bugs")
    .select("*")
    .order("created_at", { ascending: false });

  if (params.severity && params.severity !== "all") {
    query = query.eq("severity", params.severity);
  }
  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  const { data: bugs } = await query;
  const allBugs = (bugs as Bug[]) || [];

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Bug Reports</h1>
        </div>
        <Link href="/dashboard/bugs/new">
          <Button size="sm" className="gap-1.5 h-8 text-xs rounded-sm bg-violet-600 hover:bg-violet-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            New Bug
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between gap-3">
        <BugFilters
          currentSeverity={params.severity}
          currentStatus={params.status}
        />
        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider shrink-0">
          {allBugs.length} {allBugs.length === 1 ? "report" : "reports"}
        </span>
      </div>

      {allBugs.length === 0 ? (
        <div className="border border-border rounded-sm py-12 text-center bg-card">
          <p className="text-muted-foreground text-sm">No bugs found</p>
        </div>
      ) : (
        <div className="border border-border rounded-sm bg-card divide-y divide-border">
          {allBugs.map((bug) => (
            <Link
              key={bug.id}
              href={`/dashboard/bugs/${bug.id}`}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent/50 transition-colors group"
            >
              <span className="font-mono text-[10px] text-muted-foreground shrink-0 w-16 md:w-20 truncate">
                {bug.bug_id}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium truncate block group-hover:text-foreground">
                  {bug.title}
                </span>
                {bug.program_name && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {bug.program_name}
                  </span>
                )}
              </div>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 font-semibold capitalize shrink-0 rounded-sm ${severityColor[bug.severity]}`}>
                {bug.severity}
              </Badge>
              <span className={`text-[10px] font-medium shrink-0 uppercase tracking-wider min-w-[50px] text-right ${statusTextColor[bug.status]}`}>
                {statusLabel[bug.status]}
              </span>
              <span className="text-[10px] text-muted-foreground shrink-0 hidden md:block font-mono">
                {new Date(bug.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
