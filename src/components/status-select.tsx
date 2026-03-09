"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateBugStatus } from "@/lib/actions/bugs";
import { toast } from "sonner";

import { statusLabel, statusTextColor } from "@/lib/constants";

export function StatusSelect({ bugId, initialStatus }: { bugId: string; initialStatus: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    
    startTransition(async () => {
      try {
        const res = await updateBugStatus(bugId, newStatus);
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success("Status updated");
          router.refresh();
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to update status");
      }
    });
  }

  return (
    <div className="relative inline-flex items-center">
      <select
        defaultValue={initialStatus}
        onChange={handleStatusChange}
        disabled={isPending}
        className={`text-[10px] uppercase tracking-wider pl-1.5 pr-5 py-0 h-5 font-mono font-semibold rounded-sm border border-[#1f1f1f] bg-transparent focus:outline-none appearance-none cursor-pointer ${statusTextColor[initialStatus] || ""} disabled:opacity-50 hover:bg-accent/50 transition-colors inline-block`}
      >
        {Object.entries(statusLabel).map(([value, label]) => (
          <option key={value} value={value} className="bg-[#111111] text-foreground font-sans normal-case tracking-normal">
            {label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground opacity-70">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>
    </div>
  );
}
