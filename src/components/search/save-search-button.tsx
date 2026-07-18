"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveSearchAction } from "@/app/search/save-search-actions";

export function SaveSearchButton({ queryString }: { queryString: string }) {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <Button type="button" size="sm" variant="outline" onClick={() => setExpanded(true)}>
        <Bell className="size-3.5" />
        Save this search &amp; get alerts
      </Button>
    );
  }

  return (
    <form
      action={saveSearchAction.bind(null, queryString)}
      className="flex flex-wrap items-center gap-1.5"
    >
      <Input
        name="name"
        placeholder="e.g. 2BR Kilimani under 60k"
        required
        minLength={3}
        autoFocus
        className="h-8 w-56 text-xs"
      />
      <Button type="submit" size="sm">
        Save
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={() => setExpanded(false)}>
        Cancel
      </Button>
    </form>
  );
}
