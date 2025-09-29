"use client";

import * as React from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import ChatPanel from "@/components/chat/chat-panel";
import { fillTemplate } from "@/services/form-service";
import Form from "@/components/form/form";

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
    "id": "incident_type",
    "label": "Incident Type",
    "type": "enum",
    "required": true,
    "options": ["ATTACK", "BOMBING", "KIDNAPPING", "ASSASSINATION", "ARSON", "HIJACKING", "OTHER"],
    "description": "Select exactly one category that best summarizes the event. Use domain intuition to pick the primary act (not every sub-act). • BOMBING: use when an explosive device detonated (IED, grenade, car bomb, mine, etc.). • ARSON: deliberate setting of fire without an explicit explosive device. • ASSASSINATION: targeted killing of a specific individual (political, military, civic). • KIDNAPPING: abduction, hostage-taking, detention by perpetrators. • HIJACKING: seizure of a vehicle/aircraft/vessel. • ATTACK: general armed attack (shooting, shelling, ambush, clashes) that doesn’t clearly fit the above. • OTHER: clearly violent incident that fits none of the categories. If multiple acts occur, choose the **most salient** one (e.g., bomb detonation during a broader clash → BOMBING). Keep the value exactly as one of the options (UPPERCASE)."
  },
  {
    "id": "PerpInd",
    "label": "Perpetrator Individuals",
    "type": "textarea",
    "description": "List the **individual people** suspected of, responsible for, or claiming the incident. Use one item per person, separated by commas. Use canonical personal names: “First Last” (e.g., \"Juan Pérez\"). Keep original diacritics and capitalization. **Do include** known aliases in parentheses if mentioned (e.g., \"Roberto d’Aubuisson (alias Roberto)\") only when helpful for disambiguation. **Do not include** titles/ranks (Col., Gen.), roles (Minister), or organizations here; those belong in PerpOrg. If only a role is given without a name (e.g., \"an army captain\"), leave this field empty. If perpetrators are unknown or only described as a crowd/mob, leave empty. Examples: \"Ignacio X.\", \"John Doe\"."
  },
  {
    "id": "PerpOrg",
    "label": "Perpetrator Organizations",
    "type": "textarea",
    "description": "List the **organizations or groups** suspected of, responsible for, or claiming the incident. Separate multiple entries with commas. Use the group’s canonical short name if present (e.g., \"FMLN\", \"ERP\"). Normalize dotted acronyms to plain uppercase (e.g., \"F.M.L.N.\" → \"FMLN\"). If there is **competing attribution** (e.g., police blame Group A; Group B denies), include all named groups mentioned. If a subgroup is specified, use the most specific label given (e.g., \"FMLN – Radio Venceremos\" → \"FMLN\"). Do **not** list state forces unless they are explicitly acting as perpetrators (e.g., death squads tied to security forces). If perpetrators are unknown or only described generically (\"guerrillas\", \"paramilitaries\" without a name), leave empty."
  },
  {
    "id": "Target",
    "label": "Target",
    "type": "textarea",
    "description": "List the **intended target(s)** of the attack—people, institutions, facilities, or assets the perpetrators aimed at. Separate multiple entries with commas. Use concise, specific noun phrases: e.g., \"UCA campus\", \"Power lines\", \"National Guard convoy\", \"U.S. Embassy\", \"Treasury Police outpost\", \"Electrical substation\", \"Bus carrying soldiers\". **Do not** put victim names here (those go to Victim). **Do not** put weapons or methods here. If unclear whether an object was targeted or incidental, omit it. Prefer concrete entities over broad areas (\"San Miguel\" is too broad unless the city itself was the target)."
  },
  {
    "id": "Victim",
    "label": "Victim",
    "type": "textarea",
    "description": "List those **harmed, killed, or directly threatened**. Separate with commas. Accept both **individual names** (\"Ignacio Ellacuría\") and **category labels** when names aren’t given (\"Civilians\", \"Jesuit priests\", \"University student\", \"National Guard soldiers\"). Include role descriptors when they uniquely identify the victim group (\"UCA director\", \"UCA human rights institute director\"). **Do not** list organizations here unless the organization itself suffered as a corporate entity (those belong in Target). Avoid duplicates (e.g., if both \"Priests\" and specific priest names are present, keep the most informative items). If no victims are reported, leave empty."
  },
  {
    "id": "Weapon",
    "label": "Weapon",
    "type": "textarea",
    "description": "List the **weapons or methods** used. Separate multiple entries with commas. Use clear, generic names unless a specific model is given. Examples: \"Bomb\", \"Grenade\", \"RPG-7\", \"AK-47\", \"Firearms\", \"Explosive device\", \"Land mine\", \"Arson\", \"Molotov cocktail\". Prefer the **specific model** when explicitly stated (\"RPG-7\" rather than \"Rocket launcher\"). If the account only mentions effects (\"explosion\", \"blast\") without naming the device, use \"Explosive device\". **Do not** include places, targets, or perpetrator names here. If unknown, leave empty."
  }
]
;

  // parent state
  const [patch, setPatch] = React.useState<Record<string, any> | null>(null);
  const [missingFields, setMissingFields] = React.useState<string[]>([]);
  const [isFilling, setIsFilling] = React.useState(false);

  // keep current user-entered values in parent (for iterative fills)
  const [currentValues, setCurrentValues] = React.useState<Record<string, any>>({});

  // NEW: keep rolling combined transcript to send as "oldTranscript" on next turn
  const [combinedTranscript, setCombinedTranscript] = React.useState<string>("");
  const [processingState, setProcessingState] = React.useState<string>("");
  const [selectedLang, setSelectedLang] = React.useState<string>("en");

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
      const data = await fillTemplate({
        templateId: "tmpl_incident_v1",
        oldTranscript: combinedTranscript || "",
        newTranscript: newTranscriptText || "",
        transcript: newTranscriptText || "", // optional, kept for BC with older backend
        fields: FIELDS,
        currentValues: current,
        lang: selectedLang,
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
            onTranscript={handleTranscript}
            chatResponse={lastChatResponse}
            processingState={processingState}
            selectedLang={selectedLang}
            setSelectedLang={setSelectedLang}

          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={50} minSize={35}>
          <Form
            title="Shift Handover Report"
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
