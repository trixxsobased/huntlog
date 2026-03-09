"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProgram(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authorized" };
  }

  const name = formData.get("name") as string;
  const platform = formData.get("platform") as string;
  const url = formData.get("url") as string || null;

  const { error } = await supabase.from("programs").insert({
    name,
    platform,
    url,
    user_id: user.id
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/programs");
  revalidatePath("/dashboard/bugs/new");
  revalidatePath("/dashboard/bugs/[id]/edit", "page");
  return { success: true };
}

export async function deleteProgram(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authorized" };
  }

  const { error } = await supabase
    .from("programs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/programs");
  revalidatePath("/dashboard/bugs/new");
  return { success: true };
}

export async function updateProgram(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authorized" };
  }

  const name = formData.get("name") as string;
  const platform = formData.get("platform") as string;
  const url = formData.get("url") as string || null;

  const { error } = await supabase
    .from("programs")
    .update({ name, platform, url })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/programs");
  revalidatePath("/dashboard/bugs/new");
  revalidatePath("/dashboard/bugs/[id]/edit", "page");
  return { success: true };
}
