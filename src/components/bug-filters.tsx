"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BugFiltersProps {
  currentSeverity?: string;
  currentStatus?: string;
}

export function BugFilters({ currentSeverity, currentStatus }: BugFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/dashboard/bugs?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentSeverity || "all"}
        onValueChange={(val) => handleFilter("severity", val)}
      >
        <SelectTrigger className="w-[110px] h-7 text-[10px] rounded-sm border-border bg-card">
          <SelectValue placeholder="Severity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Severity</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={currentStatus || "all"}
        onValueChange={(val) => handleFilter("status", val)}
      >
        <SelectTrigger className="w-[110px] h-7 text-[10px] rounded-sm border-border bg-card">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="triaged">Triaged</SelectItem>
          <SelectItem value="needs_more_info">Needs Info</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
          <SelectItem value="duplicate">Duplicate</SelectItem>
          <SelectItem value="out_of_scope">Out of Scope</SelectItem>
          <SelectItem value="informative">Informative</SelectItem>
          <SelectItem value="n_a">N/A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
