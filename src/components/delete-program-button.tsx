"use client";

import { useState } from "react";
import { deleteProgram } from "@/lib/actions/programs";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteProgramButton({ id, name }: { id: string, name: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const result = await deleteProgram(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Program deleted");
    }
    setLoading(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] uppercase font-mono tracking-wider text-muted-foreground hover:text-red-400 hover:bg-red-400/10">
          <Trash2 className="h-3 w-3 mr-1.5" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#111111] border-[#1f1f1f] sm:rounded-sm">
        <DialogHeader>
          <DialogTitle className="font-bold text-red-500">Delete {name}?</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            This will permanently delete this program entity. Ensure no bugs are actively relying on it to prevent reference issues if you plan to link them strictly later.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-2">
          <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-sm h-9 border border-border bg-transparent hover:bg-accent text-sm">Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading} className="rounded-sm h-9 hover:bg-red-600 text-sm bg-red-500 text-white">
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
