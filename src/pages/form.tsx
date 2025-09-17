"use client";

import * as React from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import IncidentForm from "@/components/form/incident-form";
import ChatPanel from "@/components/chat/chat-panel";
import { fillTemplateApi } from "@/services/fillTemplateApi";

// ---------- types for generic fields ----------
type DynFieldType = "text" | "textarea" | "date" | "number" | "enum";
type DynField = {
  id: string;
  label: string;
  type: DynFieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  description?: string;
};

// ---------- helper: map API filled -> plain patch ----------
function filledToPatch(filled: Record<string, { value: any }>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(filled)) {
    out[k] = v?.value ?? ""; // let the form handle empty
  }
  return out;
}

export default function Invox() {
  
  const FIELDS: DynField[] = [
    {
      id: "date",
      label: "Date of Report",
      type: "date",
      required: true,
      description:
        "Calendar date relevant to this incident in ISO format (YYYY-MM-DD) exactly as spoken in the NEW transcript. Do not reinterpret relative phrases like “today” or “yesterday”; only capture an explicit ISO date if one is stated."
    },
    {
      id: "reporterName",
      label: "Name of Reporting Person",
      type: "text",
      required: true,
      description:
        "Full name of the person filing the report as said in the NEW transcript. Use given + family name (keep diacritics). Omit titles, roles, emails, and extra words (e.g., not “I am”, not “Mr.”)."
    },
    {
      id: "title",
      label: "Title or Summary",
      type: "text",
      description:
        "Short headline (≈ 3–8 words) that names the core problem. Noun phrase preferred (e.g., “Conveyor jam on line 5”). Avoid long sentences, timestamps, and action steps."
    },
    {
      id: "description",
      label: "Detailed Description",
      type: "textarea",
      description:
        "2–3 concise sentences describing what happened, where, and impact/symptoms. Include concrete facts (signals, frequencies, locations). Do not include requests or solutions here—keep those for Corrective Action."
    },
    {
      id: "affectedLine",
      label: "Affected Machine / Production Line",
      type: "text",
      description:
        "Exact machine or production line identified as having the issue (e.g., “5th production line”, “line 5”, “case erector”). If multiple lines are mentioned, choose the one explicitly described as problematic."
    },
    {
      id: "correctiveAction",
      label: "Corrective Action Plan",
      type: "textarea",
      description:
        "Specific next step(s) requested or proposed to fix the issue, written as a single imperative sentence (e.g., “Replace the belt and recalibrate sensors”). No rationale, scheduling, or status—just the action(s)."
    }
  ];

  // parent state
  const [patch, setPatch] = React.useState<Record<string, any> | null>(null);
  const [missingFields, setMissingFields] = React.useState<string[]>([]);
  const [isFilling, setIsFilling] = React.useState(false);

  // keep current user-entered values in parent (for iterative fills)
  const [currentValues, setCurrentValues] = React.useState<Record<string, any>>({});

  // NEW: keep rolling combined transcript to send as "oldTranscript" on next turn
  const [combinedTranscript, setCombinedTranscript] = React.useState<string>("");
  const [processingState, setProcessingState] = React.useState<string>("");

  const [lastChatResponse, setLastChatResponse] = React.useState<string | null>(null);


  // ChatPanel -> transcript -> trigger fill
  const handleTranscript = async (newTranscriptText: string) => {
    try {
      setIsFilling(true);
      setProcessingState("transcribing")

      // shape currentValues for API (source: user)
      const current: Record<string, { value: any; source: "user" }> = {};
      const toNullIfEmpty = (v: any) =>
        typeof v === "string" ? (v.trim() === "" ? null : v) : (v ?? null);

      for (const f of FIELDS) {
        current[f.id] = { value: toNullIfEmpty(currentValues?.[f.id]), source: "user" };
      }
      setProcessingState("filling")

      // Send split transcripts. For back-compat, we also include `transcript` (not required).
      const data = await fillTemplateApi({
        templateId: "tmpl_incident_v1",
        oldTranscript: combinedTranscript || "",
        newTranscript: newTranscriptText || "",
        transcript: newTranscriptText || "", // optional, kept for BC with older backend
        fields: FIELDS,
        currentValues: current,
        options: {
          mode: "incremental",
          preserveUserEdits: false,
          fillOnlyEmpty: true,
          returnEvidence: true,
        },
      });

      const nextPatch = filledToPatch(data.filled);
      setPatch(nextPatch);

      setLastChatResponse(data.chatResponse ?? null);

      // Update rolling combined transcript from backend if available; else append locally
      const nextCombined =
        data.transcript?.combined ??
        [combinedTranscript, newTranscriptText].filter(Boolean).join("\n");
      setCombinedTranscript(nextCombined);
      setProcessingState("");
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
            chatResponse={lastChatResponse}
            processingState={processingState}
            
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={50} minSize={35}>
          <IncidentForm
            title="Incident Report"
            fields={FIELDS}
            values={currentValues}      
            patch={patch}               
            onMissingFields={(ids) => setMissingFields(ids)}
            onChange={(vals) => setCurrentValues(vals)} 
            onSubmit={(vals) => {
              console.log("submit:", vals);
            }}
            processingState={processingState}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
