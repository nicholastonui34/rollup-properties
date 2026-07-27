"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const MAX_BYTES = 5 * 1024 * 1024;

export function DocumentUploader({
  id,
  label,
  required,
  onUploaded,
}: {
  id: string;
  label: string;
  required?: boolean;
  onUploaded: (url: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);

    if (!/^(image\/|application\/pdf)/.test(file.type)) {
      setError("Only images or PDFs are accepted.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File is too large — max 5MB.");
      return;
    }

    setUploading(true);
    try {
      const signRes = await fetch("/api/cloudinary/sign-application-doc", { method: "POST" });
      if (!signRes.ok) {
        const body = await signRes.json().catch(() => ({}));
        throw new Error(body.error ?? "Couldn't start upload. Try again.");
      }
      const { cloudName, apiKey, signature, timestamp, folder } = await signRes.json();

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", apiKey);
      form.append("timestamp", String(timestamp));
      form.append("signature", signature);
      form.append("folder", folder);
      form.append("resource_type", "auto");

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: form,
      });
      const data = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(data?.error?.message ?? "Upload failed");

      setFileName(file.name);
      onUploaded(data.secure_url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <Button
        type="button"
        variant="outline"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        className="w-full justify-start gap-2"
      >
        {fileName ? <CheckCircle2 className="size-4 text-primary" /> : <Upload className="size-4" />}
        {uploading ? "Uploading…" : fileName ?? "Choose file (PDF or image, max 5MB)"}
      </Button>
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
