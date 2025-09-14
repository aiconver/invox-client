"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export function TranscriptEditor({ value, onChange }: Props) {
  return (
    <div className="mt-4 space-y-2">
      <Label htmlFor="transcript" className="text-xs text-muted-foreground">
        Transcript (manual text; optional)
      </Label>
      <Textarea
        id="transcript"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-28"
      />
    </div>
  );
}
