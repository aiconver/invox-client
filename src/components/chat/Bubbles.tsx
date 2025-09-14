"use client";

import * as React from "react";

export function AssistantMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[80%] rounded-lg bg-muted/50 p-3 shadow-sm">
        <div className="text-sm font-medium text-muted-foreground mb-1">Assistant</div>
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end mb-4">
      <div className="max-w-[80%] rounded-lg bg-primary text-primary-foreground p-3 shadow-sm">
        <div className="text-sm font-medium mb-1 opacity-90">You</div>
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}