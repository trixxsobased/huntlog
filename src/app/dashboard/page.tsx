import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Bug } from "@/lib/types";

import { severityColor, statusLabel, statusTextColor } from "@/lib/constants";
export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: bugs } = await supabase
    .from("bugs")
    .select("*")
    .order("created_at", { ascending: false });

  const allBugs = (bugs as Bug[]) || [];

  const total = allBugs.length;
  const duplicates = allBugs.filter((b) => b.status === "duplicate").length;
  const duplicateRate = total > 0 ? ((duplicates / total) * 100).toFixed(0) + "%" : "0%";

  const stats = [
    { label: "Total", value: total.toString() },
    { label: "Triaged", value: allBugs.filter((b) => b.status === "triaged").length.toString(), color: "text-violet-400" },
    { label: "Resolved", value: allBugs.filter((b) => b.status === "resolved").length.toString(), color: "text-emerald-400/90" },
    { label: "Dupe Rate", value: duplicateRate },
  ];

  const recentBugs = allBugs.slice(0, 10);

  return (
    <div className="space-y-6 w-full">
      {/* Mobile Header */}
      <div className="flex items-center justify-between md:hidden">
        <h1 className="text-lg font-bold tracking-widest uppercase font-mono">HUNTLOG</h1>
        <div className="h-8 w-8 rounded-sm bg-violet-600 flex items-center justify-center text-xs font-bold text-white font-mono">
          V
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-2 border border-[#1f1f1f] rounded-sm bg-[#0e0e0e] p-3 md:p-4 shadow-sm">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono font-semibold">{stat.label}</p>
            <p className={`text-lg md:text-2xl font-bold font-mono tabular-nums ${stat.color || "text-foreground"}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Bugs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">Recent Reports</h2>
          <Link
            href="/dashboard/bugs"
            className="text-[10px] md:text-xs uppercase font-mono text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 group font-semibold"
          >
            View all <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </Link>
        </div>

        {recentBugs.length === 0 ? (
          <div className="border border-border rounded-sm py-12 text-center bg-card">
            <p className="text-muted-foreground text-sm">
              No bugs reported yet.{" "}
              <Link href="/dashboard/bugs/new" className="text-violet-400 hover:underline">
                Create your first report
              </Link>
            </p>
          </div>
        ) : (
          <div className="border border-[#1f1f1f] rounded-sm bg-[#0a0a0a] divide-y divide-[#1f1f1f]">
            {recentBugs.map((bug) => (
              <Link
                key={bug.id}
                href={`/dashboard/bugs/${bug.id}`}
                className="flex items-center gap-3 px-3 py-1.5 hover:bg-[#111111] transition-colors group"
              >
                <span className="font-mono text-[10px] text-muted-foreground shrink-0 w-16 md:w-20 truncate">
                  {bug.bug_id}
                </span>
                <span className="text-sm font-medium truncate flex-1 min-w-0 group-hover:text-foreground">
                  {bug.title}
                </span>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 font-semibold capitalize shrink-0 rounded-sm ${severityColor[bug.severity]}`}>
                  {bug.severity}
                </Badge>
                <span className={`text-[10px] font-medium shrink-0 uppercase tracking-wider min-w-[50px] text-right ${statusTextColor[bug.status]}`}>
                  {statusLabel[bug.status]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
