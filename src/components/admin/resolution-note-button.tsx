"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Same inline expand/confirm/cancel pattern as RefundButton/BanListerButton
// — a window.prompt() dialog is unreliable to drive and doesn't block empty
// submits before they hit the server.
export function ResolutionNoteButton({
  label,
  confirmLabel,
  placeholder,
  variant,
}: {
  label: string;
  confirmLabel: string;
  placeholder: string;
  variant: "default" | "destructive" | "outline";
}) {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <Button type="button" size="sm" variant={variant} onClick={() => setExpanded(true)}>
        {label}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        name="resolutionNote"
        placeholder={placeholder}
        required
        minLength={3}
        autoFocus
        className="h-8 w-48 text-xs"
      />
      <Button type="submit" size="sm" variant={variant}>
        {confirmLabel}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={() => setExpanded(false)}>
        Cancel
      </Button>
    </div>
  );
}
