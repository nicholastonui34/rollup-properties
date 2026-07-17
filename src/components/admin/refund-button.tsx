"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// An inline text field with native `required`/`minLength` validation, not a
// window.prompt() dialog — dialogs are unreliable to drive (headless tools,
// popup-blocked contexts) and a failed one used to reach the server with an
// empty reason and crash the action instead of being caught client-side.
export function RefundButton() {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <Button type="button" size="sm" variant="outline" onClick={() => setExpanded(true)}>
        Mark refunded
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        name="reason"
        placeholder="Refund reason"
        required
        minLength={3}
        autoFocus
        className="h-8 w-40 text-xs"
      />
      <Button type="submit" size="sm" variant="destructive">
        Confirm
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={() => setExpanded(false)}>
        Cancel
      </Button>
    </div>
  );
}
