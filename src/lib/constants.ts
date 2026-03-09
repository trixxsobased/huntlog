export const severityColor: Record<string, string> = {
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

export const severityScoreColor: Record<string, string> = {
  critical: "text-red-400",
  high: "text-orange-400",
  medium: "text-yellow-400",
  low: "text-blue-400",
};

export const statusLabel: Record<string, string> = {
  new: "New",
  triaged: "Triaged",
  needs_more_info: "Needs Info",
  resolved: "Resolved",
  duplicate: "Duplicate",
  out_of_scope: "Out of Scope",
  informative: "Informative",
  n_a: "N/A",
};

export const statusTextColor: Record<string, string> = {
  new: "text-[#666]",
  triaged: "text-violet-400",
  needs_more_info: "text-orange-400",
  resolved: "text-emerald-400",
  duplicate: "text-red-400",
  out_of_scope: "text-[#666]",
  informative: "text-blue-400",
  n_a: "text-[#444]",
};

export const statusBadgeColor: Record<string, string> = {
  new: "bg-[#666]/10 text-[#999] border-[#666]/30",
  triaged: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  needs_more_info: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  resolved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  duplicate: "bg-red-500/15 text-red-400 border-red-500/30",
  out_of_scope: "bg-[#666]/10 text-[#999] border-[#666]/30",
  informative: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  n_a: "bg-[#444]/10 text-[#666] border-[#444]/30",
};
