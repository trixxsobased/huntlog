"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { calculateCVSS, CVSSMetrics, parseCVSSVector } from "@/lib/cvss";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
import { createClient } from "@/lib/supabase/client";

interface BugFormProps {
  defaultValues?: {
    title: string;
    description: string;
    steps_to_reproduce: string;
    severity: string;
    status: string;
    vulnerability_type?: string;
    target_url?: string;
    expected_behavior?: string;
    actual_behavior?: string;
    impact?: string;
    remediation?: string;
    program_name?: string;
    cvss_score?: number;
    cvss_vector?: string;
    h1_report_id?: string;
    h1_report_url?: string;
    bounty_amount?: number;
  };
  action: (formData: FormData) => Promise<{ error: string } | void>;
  submitLabel: string;
  programs?: { id: string; name: string; }[];
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] uppercase tracking-widest text-[#a1a1aa] font-mono font-semibold">{children}</span>;
}

export function BugForm({ defaultValues, action, submitLabel, programs }: BugFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [description, setDescription] = useState(defaultValues?.description || "");
  const [stepsToReproduce, setStepsToReproduce] = useState(defaultValues?.steps_to_reproduce || "");
  const [impact, setImpact] = useState(defaultValues?.impact || "");

  const [cvssString, setCvssString] = useState(defaultValues?.cvss_vector || "");

  const [cvssMetrics, setCvssMetrics] = useState<CVSSMetrics>(() => {
    if (defaultValues?.cvss_vector) {
      const parsed = parseCVSSVector(defaultValues.cvss_vector);
      if (parsed.metrics) return parsed.metrics;
    }
    return {
      attackVector: "N",
      attackComplexity: "L",
      privilegesRequired: "N",
      userInteraction: "N",
      scope: "U",
      confidentiality: "N",
      integrity: "N",
      availability: "N",
    };
  });

  const [cvssResult, setCvssResult] = useState(() => {
    if (defaultValues?.cvss_vector) {
      const parsed = parseCVSSVector(defaultValues.cvss_vector);
      return {
        score: parsed.score,
        vector: defaultValues.cvss_vector,
        severity: parsed.severity
      };
    }
    return {
      score: 0,
      vector: "",
      severity: "None"
    };
  });

  const [manualSeverity, setManualSeverity] = useState(defaultValues?.severity || "low");

  useEffect(() => {
    if (!cvssString) {
      setCvssResult({ score: 0, vector: "", severity: "None" });
      return;
    }
    const parsed = parseCVSSVector(cvssString);
    if (parsed.metrics) {
      setCvssResult({ score: parsed.score, vector: cvssString, severity: parsed.severity });
      setCvssMetrics(parsed.metrics);
    }
  }, [cvssString]);

  useEffect(() => {
    const result = calculateCVSS(cvssMetrics);
    if (result.score > 0 && result.vector !== cvssResult.vector) {
       setCvssString(result.vector);
    }
  }, [cvssMetrics, cvssResult.vector]);


  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;

    const finalSeverity = cvssResult.score > 0 ? cvssResult.severity.toLowerCase() : manualSeverity.toLowerCase();

    if (!title || title.trim() === "") {
      setError("Title is required.");
      setLoading(false);
      return;
    }

    if (!description || description.trim() === "") {
      setError("Description is required.");
      setLoading(false);
      return;
    }

    if (!finalSeverity) {
      setError("Severity is required.");
      setLoading(false);
      return;
    }

    formData.set("description", description);
    formData.set("steps_to_reproduce", stepsToReproduce);
    formData.set("impact", impact);

    formData.set("cvss_score", cvssResult.score.toString());
    formData.set("cvss_vector", cvssResult.vector);

    formData.set("severity", finalSeverity);

    try {
      const result = await action(formData);

      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success(submitLabel === "Create Bug" ? "Bug reported successfully!" : "Bug updated successfully!");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save report";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const supabase = createClient();

  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;

        const toastId = toast.loading("Uploading pasted image...");

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Not authenticated");

          const fileExt = file.name.split('.').pop() || 'png';
          const fileName = `paste-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("attachments")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("attachments")
            .getPublicUrl(filePath);

          setter((prev) => `${prev}\n![Pasted Image](${publicUrl})\n`);
          toast.success("Image uploaded", { id: toastId });
        } catch (err) {
          console.error("Paste upload error:", err);
          toast.error("Failed to upload image", { id: toastId });
        }
      }
    }
  };

  const severityScoreColor: Record<string, string> = {
    None: "text-muted-foreground",
    Low: "text-blue-400",
    Medium: "text-yellow-400",
    High: "text-orange-400",
    Critical: "text-red-400",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        
        {/* LEFT COLUMN: Editors */}
        <div className="space-y-6 order-2 md:order-1">
          {/* Vulnerability Details */}
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono font-semibold border-b border-border pb-2">Vulnerability Details</p>

            <div className="space-y-1.5" data-color-mode="dark" onPaste={(e) => handlePaste(e, setDescription)}>
              <FormLabel>Description</FormLabel>
              <MDEditor
                value={description}
                onChange={(val) => setDescription(val || '')}
                height={120}
                preview="edit"
              />
            </div>

            <div className="space-y-1.5" data-color-mode="dark" onPaste={(e) => handlePaste(e, setStepsToReproduce)}>
              <FormLabel>Steps to Reproduce</FormLabel>
              <MDEditor
                value={stepsToReproduce}
                onChange={(val) => setStepsToReproduce(val || '')}
                height={120}
                preview="edit"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <FormLabel>Expected Behavior</FormLabel>
                  <Input
                    id="expected_behavior"
                    name="expected_behavior"
                    defaultValue={defaultValues?.expected_behavior}
                    placeholder="What should have happened"
                    className="h-9 rounded-sm border-[#1f1f1f] bg-[#0a0a0a] text-xs font-mono focus-visible:ring-1 focus-visible:ring-violet-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <FormLabel>Actual Behavior</FormLabel>
                  <Input
                    id="actual_behavior"
                    name="actual_behavior"
                    defaultValue={defaultValues?.actual_behavior}
                    placeholder="What actually happens"
                    className="h-9 rounded-sm border-[#1f1f1f] bg-[#0a0a0a] text-xs font-mono focus-visible:ring-1 focus-visible:ring-violet-500/50"
                  />
                </div>
            </div>

            <div className="space-y-1.5" data-color-mode="dark" onPaste={(e) => handlePaste(e, setImpact)}>
              <FormLabel>Impact</FormLabel>
              <MDEditor
                value={impact}
                onChange={(val) => setImpact(val || '')}
                height={120}
                preview="edit"
              />
            </div>

            <div className="space-y-1.5">
              <FormLabel>Remediation Suggestion</FormLabel>
              <Textarea
                id="remediation"
                name="remediation"
                defaultValue={defaultValues?.remediation}
                placeholder="Brief fix recommendation"
                rows={2}
                className="rounded-sm border-[#1f1f1f] bg-[#0a0a0a] text-xs font-mono focus-visible:ring-1 focus-visible:ring-violet-500/50 resize-none"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Metadata */}
        <div className="space-y-8 order-1 md:order-2">
          
          {/* Basic Information */}
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono font-semibold border-b border-border pb-2">Basic Information</p>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <FormLabel>Program Name</FormLabel>
                {programs && programs.length > 0 ? (
                  <Select name="program_name" defaultValue={defaultValues?.program_name || ""}>
                    <SelectTrigger className="h-9 rounded-sm text-sm border-[#1f1f1f] bg-[#0a0a0a] text-xs font-mono focus-visible:ring-1 focus-visible:ring-violet-500/50">
                      <SelectValue placeholder="Select a program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned" className="text-muted-foreground italic">Unassigned</SelectItem>
                      {programs.map((p) => (
                        <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="program_name"
                    name="program_name"
                    defaultValue={defaultValues?.program_name}
                    placeholder="e.g. Uber, Yahoo"
                    className="h-9 rounded-sm border-[#1f1f1f] bg-[#0a0a0a] text-xs font-mono focus-visible:ring-1 focus-visible:ring-violet-500/50"
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <FormLabel>Target Asset / URL</FormLabel>
                <Input
                  id="target_url"
                  name="target_url"
                  defaultValue={defaultValues?.target_url}
                  placeholder="e.g. https://api.uber.com/v1/user"
                  className="h-9 rounded-sm border-[#1f1f1f] bg-[#0a0a0a] text-xs font-mono focus-visible:ring-1 focus-visible:ring-violet-500/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <FormLabel>Report Title</FormLabel>
              <Input
                id="title"
                name="title"
                defaultValue={defaultValues?.title}
                required
                placeholder="e.g. IDOR on /v1/user endpoint"
                className="h-9 rounded-sm border-[#1f1f1f] bg-[#0a0a0a] text-xs font-mono focus-visible:ring-1 focus-visible:ring-violet-500/50"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <FormLabel>Vulnerability Type</FormLabel>
                <Select name="vulnerability_type" defaultValue={defaultValues?.vulnerability_type || "xss"}>
                  <SelectTrigger className="h-9 rounded-sm text-sm border-[#1f1f1f] bg-[#0a0a0a] text-xs font-mono focus-visible:ring-1 focus-visible:ring-violet-500/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xss">XSS</SelectItem>
                    <SelectItem value="sqli">SQLi</SelectItem>
                    <SelectItem value="idor">IDOR</SelectItem>
                    <SelectItem value="ssrf">SSRF</SelectItem>
                    <SelectItem value="rce">RCE</SelectItem>
                    <SelectItem value="lfi">LFI</SelectItem>
                    <SelectItem value="open_redirect">Open Redirect</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <FormLabel>Status</FormLabel>
                <Select name="status" defaultValue={defaultValues?.status || "new"}>
                  <SelectTrigger className="h-9 rounded-sm text-sm border-[#1f1f1f] bg-[#0a0a0a] text-xs font-mono focus-visible:ring-1 focus-visible:ring-violet-500/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="triaged">Triaged</SelectItem>
                    <SelectItem value="needs_more_info">Needs More Info</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="duplicate">Duplicate</SelectItem>
                    <SelectItem value="out_of_scope">Out of Scope</SelectItem>
                    <SelectItem value="informative">Informative</SelectItem>
                    <SelectItem value="n_a">N/A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* H1 Integration */}
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono font-semibold border-b border-border pb-2">H1 Integration</p>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <FormLabel>H1 Report ID</FormLabel>
                <Input
                  id="h1_report_id"
                  name="h1_report_id"
                  defaultValue={defaultValues?.h1_report_id ?? ""}
                  placeholder="#123456"
                  className="h-9 rounded-sm border-[#1f1f1f] bg-[#0a0a0a] text-xs font-mono focus-visible:ring-1 focus-visible:ring-violet-500/50"
                />
              </div>
              <div className="space-y-1.5">
                <FormLabel>H1 Report URL</FormLabel>
                <Input
                  id="h1_report_url"
                  name="h1_report_url"
                  defaultValue={defaultValues?.h1_report_url ?? ""}
                  placeholder="https://hackerone.com/reports/..."
                  className="h-9 rounded-sm border-[#1f1f1f] bg-[#0a0a0a] text-xs font-mono focus-visible:ring-1 focus-visible:ring-violet-500/50"
                />
              </div>
              <div className="space-y-1.5">
                <FormLabel>Bounty Amount (USD)</FormLabel>
                <Input
                  type="number"
                  id="bounty_amount"
                  name="bounty_amount"
                  min="0"
                  step="0.01"
                  defaultValue={defaultValues?.bounty_amount ?? ""}
                  placeholder="0.00"
                  className="h-9 rounded-sm border-[#1f1f1f] bg-[#0a0a0a] text-xs font-mono focus-visible:ring-1 focus-visible:ring-violet-500/50"
                />
              </div>
            </div>
          </div>

          {/* CVSS / Severity */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono font-semibold">Severity / CVSS</p>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-[10px] rounded-sm border-border">Calculator</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-sm">CVSS 3.1 Calculator</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">AV</Label>
                        <Select value={cvssMetrics.attackVector} onValueChange={(val: "N" | "A" | "L" | "P") => setCvssMetrics({...cvssMetrics, attackVector: val})}>
                          <SelectTrigger className="h-8 text-xs rounded-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="N">Network</SelectItem>
                            <SelectItem value="A">Adjacent</SelectItem>
                            <SelectItem value="L">Local</SelectItem>
                            <SelectItem value="P">Physical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">AC</Label>
                        <Select value={cvssMetrics.attackComplexity} onValueChange={(val: "L" | "H") => setCvssMetrics({...cvssMetrics, attackComplexity: val})}>
                          <SelectTrigger className="h-8 text-xs rounded-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="L">Low</SelectItem>
                            <SelectItem value="H">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">PR</Label>
                        <Select value={cvssMetrics.privilegesRequired} onValueChange={(val: "N" | "L" | "H") => setCvssMetrics({...cvssMetrics, privilegesRequired: val})}>
                          <SelectTrigger className="h-8 text-xs rounded-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="N">None</SelectItem>
                            <SelectItem value="L">Low</SelectItem>
                            <SelectItem value="H">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">UI</Label>
                        <Select value={cvssMetrics.userInteraction} onValueChange={(val: "N" | "R") => setCvssMetrics({...cvssMetrics, userInteraction: val})}>
                          <SelectTrigger className="h-8 text-xs rounded-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="N">None</SelectItem>
                            <SelectItem value="R">Required</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">S</Label>
                        <Select value={cvssMetrics.scope} onValueChange={(val: "U" | "C") => setCvssMetrics({...cvssMetrics, scope: val})}>
                          <SelectTrigger className="h-8 text-xs rounded-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="U">Unchanged</SelectItem>
                            <SelectItem value="C">Changed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">C</Label>
                        <Select value={cvssMetrics.confidentiality} onValueChange={(val: "H" | "L" | "N") => setCvssMetrics({...cvssMetrics, confidentiality: val})}>
                          <SelectTrigger className="h-8 text-xs rounded-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="H">High</SelectItem>
                            <SelectItem value="L">Low</SelectItem>
                            <SelectItem value="N">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">I</Label>
                        <Select value={cvssMetrics.integrity} onValueChange={(val: "H" | "L" | "N") => setCvssMetrics({...cvssMetrics, integrity: val})}>
                          <SelectTrigger className="h-8 text-xs rounded-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="H">High</SelectItem>
                            <SelectItem value="L">Low</SelectItem>
                            <SelectItem value="N">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">A</Label>
                        <Select value={cvssMetrics.availability} onValueChange={(val: "H" | "L" | "N") => setCvssMetrics({...cvssMetrics, availability: val})}>
                          <SelectTrigger className="h-8 text-xs rounded-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="H">High</SelectItem>
                            <SelectItem value="L">Low</SelectItem>
                            <SelectItem value="N">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-1.5">
                <FormLabel>CVSS Vector String</FormLabel>
                <Input
                  id="cvss_string"
                  value={cvssString}
                  onChange={(e) => setCvssString(e.target.value)}
                  placeholder="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
                  autoComplete="off"
                  className="h-9 rounded-sm border-[#1f1f1f] bg-[#0a0a0a] text-xs font-mono focus-visible:ring-1 focus-visible:ring-violet-500/50 font-mono text-xs"
                />
              </div>
              {cvssResult.score > 0 && (
                <div className="shrink-0 pt-4">
                  <Badge variant="outline" className={`font-mono text-sm px-2.5 py-1 rounded-sm ${severityScoreColor[cvssResult.severity] || "text-foreground"}`}>
                    {cvssResult.score.toFixed(1)}
                  </Badge>
                </div>
              )}
            </div>

            {cvssResult.score <= 0 && (
              <div className="space-y-1.5 max-w-xs">
                <FormLabel>Manual Severity</FormLabel>
                <Select value={manualSeverity} onValueChange={setManualSeverity}>
                  <SelectTrigger className="h-9 rounded-sm text-sm border-[#1f1f1f] bg-[#0a0a0a] text-xs font-mono focus-visible:ring-1 focus-visible:ring-violet-500/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="text-xs text-destructive bg-destructive/10 rounded-sm px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-4 pb-8">
        <Button type="submit" disabled={loading} className="w-full sm:w-auto px-6 bg-violet-600 hover:bg-violet-700 rounded-sm h-9 text-xs font-medium border-t border-white/10 pt-0.5 mt-2 sm:mt-0">
          {loading ? "Saving..." : submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/dashboard/bugs")} className="w-full sm:w-auto px-5 rounded-sm h-9 text-[11px] uppercase tracking-widest font-mono text-muted-foreground hover:bg-white/5 border border-transparent">
          Cancel
        </Button>
      </div>
    </form>
  );
}
