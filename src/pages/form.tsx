"use client";

import * as React from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import IncidentForm from "@/components/form/incident-form";
import ChatPanel from "@/components/chat/chat-panel";

// ---------- types for generic fields ----------
type DynFieldType = "text" | "textarea" | "date" | "number" | "enum";
type DynField = {
  id: string;
  label: string;
  type: DynFieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
};

// ---------- helper: call /form/fill ----------
async function fillTemplateApi(input: {
  templateId: string;
  transcript: string;
  fields: DynField[];
  currentValues?: Record<string, { value: any; source?: "user" | "ai"; locked?: boolean }>;
  options?: {
    mode?: "incremental" | "fresh";
    preserveUserEdits?: boolean;
    fillOnlyEmpty?: boolean;
    returnEvidence?: boolean;
  };
}) {
  const res = await fetch("/api/v1/form/fill", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body?.success === false) {
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
  return body.data as { filled: Record<string, { value: any }>; model: string };
}

// ---------- helper: map API filled -> plain patch ----------
function filledToPatch(filled: Record<string, { value: any }>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(filled)) {
    out[k] = v?.value ?? ""; // let the form handle empty
  }
  return out;
}

export default function Invox() {
  // generic template definition (swap this at runtime if you like)
  const FIELDS: DynField[] = [
    { id: "date", label: "Date of Report", type: "date", required: true },
    { id: "reporterName", label: "Name of Reporting Person", type: "text", required: true },
    { id: "title", label: "Title or Summary", type: "text" },
    { id: "description", label: "Detailed Description", type: "textarea" },
    { id: "affectedLine", label: "Affected Machine / Production Line", type: "text" },
    { id: "correctiveAction", label: "Corrective Action Plan", type: "textarea" },
  ];

  // parent state
  const [patch, setPatch] = React.useState<Record<string, any> | null>(null);
  const [missingFields, setMissingFields] = React.useState<string[]>([]);
  const [isFilling, setIsFilling] = React.useState(false);

  // keep current user-entered values in parent (for iterative fills)
  const [currentValues, setCurrentValues] = React.useState<Record<string, any>>({});

  // ChatPanel -> transcript -> trigger fill
  const handleTranscript = async (transcript: string) => {
    console.log("[Invox] onTranscript len:", transcript?.length || 0);
    try {
      setIsFilling(true);

      // shape currentValues for API (source: user)
      const current: Record<string, { value: any; source: "user" }> = {};
      const toNullIfEmpty = (v: any) =>
        typeof v === "string" ? (v.trim() === "" ? null : v) : (v ?? null);

      for (const f of FIELDS) {
        current[f.id] = { value: toNullIfEmpty(currentValues?.[f.id]), source: "user" };
      }

      const data = await fillTemplateApi({
        templateId: "tmpl_incident_v1",
        transcript,
        fields: FIELDS,
        currentValues: current,
        options: { mode: "incremental", preserveUserEdits: false, fillOnlyEmpty: true, returnEvidence: true },
      });

      const nextPatch = filledToPatch(data.filled);
      setPatch(nextPatch);
    } catch (e: any) {
      console.error("Fill failed:", e?.message || e);
    } finally {
      setIsFilling(false);
    }
  };

  return (
    // Full-bleed area below a sticky topbar of height h-14
    <div className="fixed inset-x-0 top-14 bottom-0 bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        <ResizablePanel defaultSize={50} minSize={25} className="min-w-[280px]">
          {/* Chat sends transcript up; parent triggers fill */}
          <ChatPanel
            missingFields={missingFields}
            onTranscript={handleTranscript}
            isFilling={isFilling}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={50} minSize={35}>
          <IncidentForm
            title="Incident Report"
            fields={FIELDS}
            values={currentValues}      // initial/current values
            patch={patch}               // AI patch merged on top inside form
            onMissingFields={(ids) => setMissingFields(ids)}
            onChange={(vals) => setCurrentValues(vals)} // keep parent in sync
            onSubmit={(vals) => {
              console.log("submit:", vals);
            }}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
