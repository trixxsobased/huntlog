"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, X, UploadCloud } from "lucide-react";

interface Attachment {
  id: string;
  file_url: string;
  file_name: string;
}

interface AttachmentUploadProps {
  bugId: string;
  existingAttachments?: Attachment[];
}

export function AttachmentUpload({ bugId, existingAttachments = [] }: AttachmentUploadProps) {
  const [attachments, setAttachments] = useState<Attachment[]>(existingAttachments);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    
    if (attachments.length + files.length > 5) {
      setError("Maximum 5 attachments allowed");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const newAttachments: Attachment[] = [];
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
           throw new Error("Only images are allowed");
        }
        if (file.size > 5 * 1024 * 1024) {
           throw new Error("File too large. Max 5MB.");
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${bugId}/${fileName}`;

        // 1. Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("attachments")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from("attachments")
          .getPublicUrl(filePath);

        // 3. Save to database
        const { data: attachmentRecord, error: dbError } = await supabase
          .from("bug_attachments")
          .insert({
            bug_id: bugId,
            file_url: publicUrl,
            file_name: file.name,
            uploaded_by: user.id
          })
          .select()
          .single();

        if (dbError) throw dbError;

        if (attachmentRecord) {
           newAttachments.push(attachmentRecord);
        }
      }

      setAttachments([...attachments, ...newAttachments]);
    } catch (err) {
      console.error("Upload error:", err);
      const message = err instanceof Error ? err.message : "Failed to upload file";
      setError(message);
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleDelete = async (attachment: Attachment) => {
    try {
      // 1. Delete from DB
      const { error: dbError } = await supabase
        .from("bug_attachments")
        .delete()
        .eq("id", attachment.id);

      if (dbError) throw dbError;

      // 2. Delete from Storage (extract path from URL)
      // publicUrl format: .../storage/v1/object/public/attachments/bugId/fileName
      const urlParts = attachment.file_url.split('/attachments/');
      if (urlParts.length === 2) {
          const filePath = urlParts[1];
          await supabase.storage.from("attachments").remove([filePath]);
      }

      setAttachments(attachments.filter(a => a.id !== attachment.id));
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete attachment");
    }
  };

  return (
    <div className="space-y-4">
      {error && <div className="text-sm text-destructive">{error}</div>}
      
      <div className="flex flex-wrap gap-4">
        {attachments.map((attachment) => (
          <div key={attachment.id} className="relative group w-32 h-32 rounded-lg border bg-muted/30 overflow-hidden flex items-center justify-center">
            <img 
              src={attachment.file_url} 
              alt={attachment.file_name} 
              className="object-cover w-full h-full"
            />
            <button
              onClick={() => handleDelete(attachment)}
              className="absolute top-1 right-1 p-1 bg-background/80 hover:bg-destructive hover:text-destructive-foreground rounded-full opacity-60 hover:opacity-100 group-hover:opacity-100 transition-opacity"
              title="Delete attachment"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {attachments.length < 5 && (
          <div className="relative w-32 h-32 rounded-lg border border-dashed hover:bg-muted/50 transition-colors flex flex-col items-center justify-center cursor-pointer">
            {isUploading ? (
               <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : (
               <>
                 <UploadCloud className="w-6 h-6 text-muted-foreground mb-2" />
                 <span className="text-xs text-muted-foreground text-center px-2">Upload Image</span>
               </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Max 5 images. Up to 5MB each.</p>
    </div>
  );
}
