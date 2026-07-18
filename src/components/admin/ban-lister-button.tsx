"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Same inline expand/confirm/cancel pattern as RefundButton — a
// window.prompt() dialog is unreliable to drive and doesn't block empty
// submits before they hit the server.
export function BanListerButton() {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <Button type="button" size="sm" variant="destructive" onClick={() => setExpanded(true)}>
        Ban lister
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        name="reason"
        placeholder="Ban reason"
        required
        minLength={3}
        autoFocus
        className="h-8 w-40 text-xs"
      />
      <Button type="submit" size="sm" variant="destructive">
        Confirm ban
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={() => setExpanded(false)}>
        Cancel
      </Button>
    </div>
  );
}
