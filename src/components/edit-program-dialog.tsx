"use client";

import { useState } from "react";
import { updateProgram } from "@/lib/actions/programs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Edit } from "lucide-react";

interface EditProgramDialogProps {
  id: string;
  defaultName: string;
  defaultPlatform: string;
  defaultUrl?: string | null;
}

export function EditProgramDialog({ id, defaultName, defaultPlatform, defaultUrl }: EditProgramDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState(defaultPlatform || "HackerOne");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("platform", platform);
    
    const result = await updateProgram(id, formData);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Program updated successfully");
      setOpen(false);
    }
    
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] uppercase font-mono tracking-wider text-muted-foreground hover:text-violet-400 hover:bg-violet-400/10">
          <Edit className="h-3 w-3 mr-1.5" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#111111] border-[#1f1f1f] sm:rounded-sm">
        <DialogHeader>
          <DialogTitle className="font-bold">Edit Program</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono font-semibold">Program Name *</Label>
            <Input id="name" name="name" required defaultValue={defaultName} className="h-9 rounded-sm border-[#1f1f1f] bg-transparent focus-visible:ring-1 focus-visible:ring-violet-500" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono font-semibold">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="h-9 rounded-sm border-[#1f1f1f] bg-transparent focus:ring-1 focus:ring-violet-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HackerOne">HackerOne</SelectItem>
                <SelectItem value="Bugcrowd">Bugcrowd</SelectItem>
                <SelectItem value="Intigriti">Intigriti</SelectItem>
                <SelectItem value="YesWeHack">YesWeHack</SelectItem>
                <SelectItem value="Synack">Synack</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="url" className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono font-semibold">Program URL</Label>
            <Input id="url" name="url" defaultValue={defaultUrl || ""} className="h-9 rounded-sm border-[#1f1f1f] bg-transparent focus-visible:ring-1 focus-visible:ring-violet-500" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-sm h-9 border border-border bg-transparent hover:bg-accent text-sm">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="h-9 rounded-sm bg-violet-600 hover:bg-violet-700 text-sm">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
