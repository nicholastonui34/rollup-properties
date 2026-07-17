"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  approveListingAction,
  needsInfoListingAction,
  rejectListingAction,
  startReviewAction,
} from "@/app/(admin)/admin/verifications/actions";

type Evidence = { url: string; publicId: string };

export function VerificationReviewPanel({
  listingId,
  status,
}: {
  listingId: string;
  status: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState("");
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const signRes = await fetch("/api/cloudinary/sign-evidence", { method: "POST" });
    if (!signRes.ok) {
      const body = await signRes.json().catch(() => ({}));
      setError(body.error ?? "Couldn't start upload. Try again.");
      return;
    }
    const { cloudName, apiKey, signature, timestamp, folder } = await signRes.json();

    const list = Array.from(files);
    setUploading(list.length);

    for (const file of list) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("api_key", apiKey);
        form.append("timestamp", String(timestamp));
        form.append("signature", signature);
        form.append("folder", folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: form }
        );
        const data = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(data?.error?.message ?? "Upload failed");

        setEvidence((prev) => [...prev, { url: data.secure_url, publicId: data.public_id }]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading((n) => Math.max(0, n - 1));
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function decide(action: "approve" | "reject" | "needs_info") {
    setError(null);
    if (action !== "approve" && notes.trim().length < 10) {
      setError("Add a clear reason (10+ characters) so the lister knows what to fix.");
      return;
    }
    startTransition(async () => {
      try {
        if (action === "approve") await approveListingAction(listingId, { notes, evidence });
        else if (action === "reject") await rejectListingAction(listingId, { notes, evidence });
        else await needsInfoListingAction(listingId, { notes, evidence });
        router.push("/admin/verifications");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  function beginReview() {
    startTransition(async () => {
      try {
        await startReviewAction(listingId);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold text-foreground">Review decision</h2>

      {status === "SUBMITTED" && (
        <Button type="button" size="sm" variant="outline" disabled={pending} onClick={beginReview}>
          Start review
        </Button>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Evidence ({evidence.length})</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading > 0}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading > 0 ? `Uploading ${uploading}…` : "Add evidence"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
        {evidence.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {evidence.map((e) => (
              <div key={e.publicId} className="relative aspect-square overflow-hidden rounded-lg border border-border">
                <Image src={e.url} alt="" fill sizes="100px" className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="verification-notes">Notes</Label>
        <Textarea
          id="verification-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What did you confirm (or what needs fixing)? Required for reject / needs info."
          rows={4}
        />
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={pending} onClick={() => decide("approve")}>
          Approve — go live
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => decide("needs_info")}>
          Needs info
        </Button>
        <Button type="button" size="sm" variant="destructive" disabled={pending} onClick={() => decide("reject")}>
          Reject
        </Button>
      </div>
    </div>
  );
}
