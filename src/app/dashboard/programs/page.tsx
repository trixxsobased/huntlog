import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Building2, ExternalLink } from "lucide-react";
import { CreateProgramDialog } from "@/components/create-program-dialog";
import { EditProgramDialog } from "@/components/edit-program-dialog";
import { DeleteProgramButton } from "@/components/delete-program-button";
import type { Program } from "@/lib/types";

export default async function ProgramsPage() {
  const supabase = await createClient();

  const { data: programs } = await supabase
    .from("programs")
    .select("*")
    .order("created_at", { ascending: false });

  const allPrograms = (programs as Program[]) || [];

  const { data: bugs } = await supabase
    .from("bugs")
    .select("program_name");

  const bugCounts = (bugs || []).reduce((acc: Record<string, number>, bug) => {
    if (bug.program_name) {
      acc[bug.program_name] = (acc[bug.program_name] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Programs</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your actively hunted targets.
          </p>
        </div>
        <CreateProgramDialog />
      </div>

      {allPrograms.length === 0 ? (
        <div className="border border-border rounded-sm py-12 text-center bg-card">
          <Building2 className="w-6 h-6 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm font-medium">No programs added yet</p>
          <p className="text-[10px] text-muted-foreground mt-1 max-w-xs mx-auto">
            Add programs to autocomplete targets when creating bug reports.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allPrograms.map((prog) => (
            <div key={prog.id} className="border border-border rounded-sm bg-card p-4 flex flex-col justify-between hover:border-violet-500/30 transition-colors">
              <div>
                <h3 className="font-bold text-sm text-foreground truncate">{prog.name}</h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-mono uppercase tracking-wider rounded-sm border-border text-violet-400">
                    {prog.platform}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {bugCounts[prog.name] || 0} bugs
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <div>
                  {prog.url ? (
                    <a
                      href={prog.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 hover:text-violet-300 flex items-center gap-1 text-[10px] font-mono transition-colors"
                    >
                      View Target
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[10px] font-mono text-muted-foreground italic">No URL explicitly provided</span>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-100 md:opacity-60 md:hover:opacity-100 transition-opacity">
                  <EditProgramDialog
                    id={prog.id}
                    defaultName={prog.name}
                    defaultPlatform={prog.platform}
                    defaultUrl={prog.url}
                  />
                  <DeleteProgramButton id={prog.id} name={prog.name} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
