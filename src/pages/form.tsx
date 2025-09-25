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
import { transcribeAudio } from "@/services/transcribe-service";

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

  const run = async () => {
    try {
      const transcribe = await transcribeAudio();
      console.log(transcribe);
    } catch (err) {
      console.error("Transcription failed:", err);
    }
  };


  const FIELDS: DynField[] = [
    {
      id: "date",
      label: "Datum der Schichtübergabe",
      type: "date",
      required: true,
      description:
        "Kalenderdatum im ISO-Format (YYYY-MM-DD) der Übergabe."
    },
    {
      id: "shift",
      label: "Schicht (Früh/Spät/Nacht)",
      type: "text",
      required: true,
      description:
        "Bitte genau „Frühschicht“, „Spätschicht“ oder „Nachtschicht“ eintragen."
    },
    {
      id: "reporterName",
      label: "Schichtleiter/in (Name)",
      type: "text",
      required: true,
      description:
        "Vor- und Nachname der übergebenden Person (ohne Titel/Funktion)."
    },

    {
      id: "statusAuftraege",
      label: "Status der laufenden Aufträge/Projekte",
      type: "textarea",
      description:
        "Kurz zu jedem relevanten Auftrag: Nummer, Bauteil/Anlage, Besonderheiten/Parameteränderungen und aktuelles Ergebnis. Beispiel: „580004 | Kokille H1056 – Rohre klemmen; Parameter XY angepasst; Ergebnis: 3 Min. länger laufen lassen.“"
    },
    {
      id: "wichtigeEreignisse",
      label: "Wichtige Ereignisse während der Schicht",
      type: "textarea",
      description:
        "Abweichungen, Störungen, Alarme, Mengen-/Gewichtsabweichungen, Eskalationen. Beispiel: „Terminalgewicht ≠ tatsächliches Gewicht im Schmelzkessel – bitte ansprechen.“"
    },
    {
      id: "offeneAufgaben",
      label: "Offene Aufgaben",
      type: "textarea",
      description:
        "Ausstehende To-dos klar benennen; wenn möglich mit Verantwortlichem/Nachfasshinweis. Beispiel: „Kokille 6249 vor dem Abheben innen nachschleifen.“"
    },
    {
      id: "maschinenSystemstatus",
      label: "Maschinen-/Systemstatus",
      type: "textarea",
      description:
        "Umbauten, Stillstände, Restlaufzeiten, Wartungen, bekannte Workarounds. Beispiel: „Umbau G160 um 15:00 Uhr fertig.“"
    },
    {
      id: "besondereVorkommnisse",
      label: "Besondere Vorkommnisse",
      type: "textarea",
      description:
        "Beinahe-Unfälle, Qualitätsauffälligkeiten, Liefer-/Materialthemen, Behörden-/Kundenbesuche (kurz, faktenbasiert)."
    },
    {
      id: "sicherheitshinweise",
      label: "Sicherheitshinweise",
      type: "textarea",
      description:
        "Gefährdungen, Absperrungen, defekte PSA, temporäre Maßnahmen. Beispiel: „Verletzungsgefahr am Kokillengestell (siehe Foto).“"
    },
    {
      id: "rundgang",
      label: "Rundgang | Sauberkeit & Ordnung",
      type: "textarea",
      description:
        "5S/Ordnung & Sauberkeit, Leckagen, Stolperstellen, Materialablagen, Entsorgung – inkl. Bereich/Ort."
    },
    {
      id: "leiterNotizen",
      label: "Notizen Schichtleiter/in",
      type: "textarea",
      description:
        "Sonstige Hinweise für die nachfolgende Schicht (kurz & prägnant)."
    },
    {
      id: "fotoReferenzen",
      label: "Foto-/Dokumentenreferenzen (optional)",
      type: "text",
      description:
        "IDs oder Links zu Bildern/Dokumenten (z. B. DMS: „DOC-123, IMG-456“)."
    }
  ];


  const fewShots = [
    {
      id: "ex1_vollstaendig",
      text:
        "2025-09-23. Frühschicht. Hier ist Lena Schäfer. Auftrag 580004 — Kokille H1056: Rohre klemmen; Parameter XY um 0,3 erhöht; Ergebnis: drei Minuten länger laufen lassen. Ereignis: Terminalgewicht weicht vom realen Kesselgewicht ab, bitte ansprechen. Aufgabe: Kokille 6249 vor dem Abheben innen nachschleifen. Maschinen: Umbau G160 um 15:00 abgeschlossen; Linie 5 mit −20% Takt. Besonderes: Qualitätsauffälligkeit Charge 23-091 (Gratbildung). Sicherheit: Verletzungsgefahr am Kokillengestell, Absperrband angebracht. Rundgang: Leckage an Hydraulikpumpe Gießerei A; Durchgang freigeräumt. Fotos: IMG-123, DOC-77.",
      expected: {
        date: "2025-09-23",
        shift: "Frühschicht",
        reporterName: "Lena Schäfer",
        statusAuftraege:
          "580004 | Kokille H1056 – Rohre klemmen; Parameter XY +0,3; Ergebnis: 3 Min. länger laufen lassen.",
        wichtigeEreignisse:
          "Terminalgewicht weicht vom realen Kesselgewicht ab.",
        offeneAufgaben:
          "Kokille 6249 vor dem Abheben innen nachschleifen.",
        maschinenSystemstatus:
          "Umbau G160 um 15:00 abgeschlossen; Linie 5 mit −20% Takt.",
        besondereVorkommnisse:
          "Qualitätsauffälligkeit Charge 23-091 (Gratbildung).",
        sicherheitshinweise:
          "Verletzungsgefahr am Kokillengestell; Absperrband angebracht.",
        rundgang:
          "Leckage Hydraulikpumpe Gießerei A; Durchgang freigeräumt.",
        leiterNotizen: null,
        fotoReferenzen: "IMG-123, DOC-77"
      }
    },
    {
      id: "ex2_ohne_datum_mit_sicherheit",
      text:
        "Spätschicht, Jonas Weber. Status: 580112 – Kleinserie; 580118 – Materialeingang verspätet. Ereignis: Förderschnecke in Gießerei B kurz blockiert, neu gestartet. Bitte morgen mit Einkauf zur Bandlieferung sprechen. Sicherheit: PSA-Kasten in Halle 1 leer. Fotos im DMS: DOC-99.",
      expected: {
        date: null,
        shift: "Spätschicht",
        reporterName: "Jonas Weber",
        statusAuftraege:
          "580112 – Kleinserie; 580118 – Materialeingang verspätet.",
        wichtigeEreignisse:
          "Förderschnecke in Gießerei B kurz blockiert; neu gestartet.",
        offeneAufgaben:
          "Mit Einkauf zur Bandlieferung sprechen.",
        maschinenSystemstatus: null,
        besondereVorkommnisse: null,
        sicherheitshinweise:
          "PSA-Kasten in Halle 1 leer.",
        rundgang: null,
        leiterNotizen: null,
        fotoReferenzen: "DOC-99"
      }
    },
    {
      id: "ex3_nachtschicht_sensor_plc",
      text:
        "2025-09-22. Nachtschicht. Ich bin Özge Yıldız. Ereignis: Sensorfehler E-217 an der Abkühlstrecke, Alarm alle 30 Minuten. Maschinen: PLC der G160 neu gebootet; seither stabil. Rundgang: 5S – Werkbank E1 aufgeräumt, Shadowboard ergänzt. Notiz: Neue Kolleg:innen beim Rundgang mitnehmen.",
      expected: {
        date: "2025-09-22",
        shift: "Nachtschicht",
        reporterName: "Özge Yıldız",
        statusAuftraege: null,
        wichtigeEreignisse:
          "Sensorfehler E-217 an der Abkühlstrecke; Alarme alle 30 Minuten.",
        offeneAufgaben: null,
        maschinenSystemstatus:
          "PLC der G160 neu gebootet; seither stabil.",
        besondereVorkommnisse: null,
        sicherheitshinweise: null,
        rundgang:
          "Werkbank E1 aufgeräumt; Shadowboard ergänzt.",
        leiterNotizen:
          "Neue Kolleg:innen beim Rundgang mitnehmen.",
        fotoReferenzen: null
      }
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
      const data = await fillTemplateApi({
        templateId: "tmpl_incident_v1",
        oldTranscript: combinedTranscript || "",
        newTranscript: newTranscriptText || "",
        transcript: newTranscriptText || "", // optional, kept for BC with older backend
        fields: FIELDS,
        currentValues: current,
        lang: selectedLang,
        fewShots: fewShots,
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
      <button onClick={run}>test</button>
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        <ResizablePanel defaultSize={50} minSize={25} className="min-w-[280px]">
          {/* Chat sends transcript up; parent triggers fill */}
          <ChatPanel
            missingFields={missingFields}
            onTranscript={handleTranscript}
            isFilling={isFilling}
            chatResponse={lastChatResponse}
            processingState={processingState}
            selectedLang={selectedLang}
            setSelectedLang={setSelectedLang}

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
