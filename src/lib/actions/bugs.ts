"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function extractFormData(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const steps_to_reproduce = formData.get("steps_to_reproduce") as string;
  const severity = formData.get("severity") as string;
  const status = formData.get("status") as string;
  
  // Phase 2 & 3 fields
  const cvss_score = formData.get("cvss_score") ? parseFloat(formData.get("cvss_score") as string) : null;
  const cvss_vector = formData.get("cvss_vector") as string || null;
  const vulnerability_type = formData.get("vulnerability_type") as string || null;
  const target_url = formData.get("target_url") as string || null;
  const expected_behavior = formData.get("expected_behavior") as string || null;
  const actual_behavior = formData.get("actual_behavior") as string || null;
  const impact = formData.get("impact") as string || null;
  const remediation = formData.get("remediation") as string || null;
  
  const raw_program = formData.get("program_name") as string;
  const program_name = (!raw_program || raw_program === "unassigned") ? null : raw_program;
  const h1_report_id = formData.get("h1_report_id") as string || null;
  const h1_report_url = formData.get("h1_report_url") as string || null;
  const bounty_amount = formData.get("bounty_amount") ? parseFloat(formData.get("bounty_amount") as string) : null;

  return {
    title,
    description: description || "",
    steps_to_reproduce: steps_to_reproduce || "",
    severity,
    status,
    cvss_score,
    cvss_vector,
    vulnerability_type,
    target_url,
    expected_behavior,
    actual_behavior,
    impact,
    remediation,
    program_name,
    h1_report_id,
    h1_report_url,
    bounty_amount,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateBugId(supabase: any) {
  const { data: latest } = await supabase
    .from("bugs")
    .select("bug_id")
    .order("created_at", { ascending: false })
    .limit(1);

  let nextNum = 1;
  if (latest && latest.length > 0 && latest[0].bug_id) {
    const match = latest[0].bug_id.match(/-(\d+)$/);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }
  return `HL-${nextNum.toString().padStart(4, "0")}`;
}

export async function createBug(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const payload = extractFormData(formData);
  const bug_id = await generateBugId(supabase);

  const { error } = await supabase.from("bugs").insert({
    ...payload,
    bug_id,
    user_id: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/bugs");
  redirect("/dashboard/bugs");
}

export async function updateBug(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const payload = extractFormData(formData);

  const { error } = await supabase
    .from("bugs")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/bugs");
  redirect(`/dashboard/bugs/${id}`);
}

export async function deleteBug(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("bugs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Related attachments will cascade delete.

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/bugs");
  redirect("/dashboard/bugs");
}

export async function updateBugStatus(id: string, status: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("bugs")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/bugs");
  revalidatePath(`/dashboard/bugs/${id}`);
}

export async function duplicateBug(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch the existing bug
  const { data: existingBug, error: fetchError } = await supabase
    .from("bugs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !existingBug) {
    return { error: "Bug not found or no permission" };
  }

  // 2. Prepare the duplicated payload
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _oldId, bug_id: _oldBugId, created_at: _oldCreatedAt, updated_at: _oldUpdatedAt, ...copyData } = existingBug;
  
  const duplicatedPayload = {
    ...copyData,
    bug_id: await generateBugId(supabase),
    title: `[COPY] ${copyData.title}`,
    status: "new",
    h1_report_id: null,
    bounty_amount: null,
  };

  // 3. Insert the new record
  const { data: newBug, error: insertError } = await supabase
    .from("bugs")
    .insert(duplicatedPayload)
    .select()
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/bugs");
  redirect(`/dashboard/bugs/${newBug.id}`);
}
