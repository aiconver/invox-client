"use client";

import * as React from "react";
import { MdAssistant } from "react-icons/md";

export function AssistantBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 p-4 shadow-sm">
      <div className="mb-1 flex items-center gap-2 font-medium">
        <MdAssistant className="h-5 w-5" /> Assistant
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-primary/5 text-foreground border border-border p-4 shadow-sm">
      <div className="mb-1 font-medium">You</div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
