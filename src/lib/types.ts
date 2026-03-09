export type Bug = {
  id: string;
  bug_id: string;
  title: string;
  description: string;
  steps_to_reproduce: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "new" | "triaged" | "needs_more_info" | "resolved" | "duplicate" | "out_of_scope" | "informative" | "n_a";
  cvss_score: number | null;
  cvss_vector: string | null;
  vulnerability_type: string | null;
  target_url: string | null;
  expected_behavior: string | null;
  actual_behavior: string | null;
  impact: string | null;
  remediation: string | null;
  program_name: string | null;
  h1_report_id: string | null;
  h1_report_url: string | null;
  bounty_amount: number | null;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type BugInsert = Omit<Bug, "id" | "bug_id" | "created_at" | "updated_at">;
export type BugUpdate = Partial<Omit<Bug, "id" | "bug_id" | "user_id" | "created_at" | "updated_at">>;

export type Program = {
  id: string;
  name: string;
  platform: "HackerOne" | "Bugcrowd" | "Intigriti" | "YesWeHack" | "Synack" | "Other";
  url: string | null;
  user_id: string;
  created_at: string;
};
