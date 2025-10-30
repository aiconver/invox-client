

import * as React from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import ChatPanel from "@/components/chat/chat-panel";
import { fillTemplate } from "@/services/form-service";
import Form from "@/components/form/form";
import { useState } from "react";

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
      label: "Datum",
      type: "date",
      required: true,
      description: `Datum der Schicht im Format JJJJ-MM-TT (z. B. 2025-10-27). 
- Tragen Sie das tatsächliche Kalenderdatum der dokumentierten Schicht ein. 
- Bei Nachtschichten, die über Mitternacht gehen, bitte das Startdatum der Schicht verwenden.`
    },
    {
      id: "shift_leader",
      label: "Schichtleiter",
      type: "text",
      required: true,
      description: `Vollständiger Name der verantwortlichen Schichtleitung. 
- Format: Vorname Nachname (z. B. „Alex Müller“). 
- Optional: Kürzel in Klammern (z. B. „Alex Müller (AM)“). 
- Bei Übergabe bitte zusätzlich Vertreter notieren: „Alex Müller; Vertretung: Pat Schmidt“.`
    },
    {
      id: "shift",
      label: "Schicht",
      type: "enum",
      required: true,
      options: ["FRÜHSCHICHT", "SPÄTSCHICHT", "NACHTSCHICHT"],
      description: `Wählen Sie die passende Schicht:
- FRÜHSCHICHT: typ. 06:00–14:00
- SPÄTSCHICHT: typ. 14:00–22:00
- NACHTSCHICHT: typ. 22:00–06:00
(Zeiten dienen als Richtwert; bei abweichenden Modellen bitte die intern gültigen Zeiten nutzen.)`
    },
    {
      id: "order_status",
      label: "Status der laufenden Aufträge/Projekte",
      type: "textarea",
      description: `Kurz und präzise pro Auftrag/Projekt (Stichpunkte). Für jeden Eintrag:
- Kennung/Bezeichnung (z. B. „AO-1842 – Kunde XY“)
- aktueller Fortschritt in % oder Meilenstein (z. B. „Montage 80 % abgeschlossen“)
- heutige Aktivitäten & Ergebnisse (mit Uhrzeit, falls relevant)
- Abweichungen/Verzögerungen (Ursache, Auswirkung)
- nächste Schritte + Verantwortliche + Fälligkeitsdatum
Beispiel:
• AO-1842 – Kunde XY: Montage 80 %; 10:30 Dichtigkeitsprüfung ok; Verzögerung wegen fehlender Dichtungen (Lieferung 28.10.); Nächster Schritt: Endprüfung (M. König) bis 29.10.`
    },
    {
      id: "important_events",
      label: "Wichtige Ereignisse während der Schicht",
      type: "textarea",
      description: `Listenform mit Zeitstempel. Arten von Ereignissen: Kundenbesuche, Audits, Besprechungen, Lieferungen, Eskalationen.
Für jeden Eintrag angeben:
- Zeitpunkt (HH:MM)
- Ereignisart + kurze Beschreibung
- Beteiligte/Ansprechpartner
- Ergebnis/Entscheidung
- offene Punkte/Follow-ups (mit Verantwortlichen & Termin)
Beispiel:
• 09:15 – Lieferverzug (Spedition ABC); Eintreffzeit neu 13:00; Folge: Linie 2 Stand 30 min; Follow-up: Wareneingang priorisieren (L. Weber).`
    },
    {
      id: "open_tasks",
      label: "Offene Aufgaben",
      type: "textarea",
      description: `Alle Aufgaben, die an die nächste Schicht übergeben werden. Pro Aufgabe bitte angeben:
- Aufgabe (klar formuliert, verifizierbar)
- Priorität: Hoch/Mittel/Niedrig
- Verantwortlich (Rolle/Name)
- Fällig bis (Datum/Uhrzeit)
- Abhängigkeiten/Risiken
Beispiel:
• Prüflehre kalibrieren – Priorität: Hoch – Verantwortlich: QS (T. Hahn) – Fällig: 28.10. 08:00 – Abhängigkeit: Labor frei.`
    },
    {
      id: "machine_system_status",
      label: "Maschinen-/Systemstatus",
      type: "textarea",
      description: `Übersicht pro Maschine/System. Für jeden Eintrag:
- ID/Bezeichnung (z. B. „Linie 2 – Presswerk“)
- Status: OK / Eingeschränkt / Ausfall
- Laufzeit/Stillstandsdauer (mit Zeiten)
- Störungscode/Fehlerbild (falls vorhanden)
- durchgeführte Maßnahmen/Wartung
- benötigte Teile/Service-Tickets (Nr. angeben)
- Auswirkungen auf Produktion/Qualität
Beispiel:
• Linie 2 – Presswerk: Eingeschränkt; 07:40–08:25 Werkzeugwechsel; 11:10 Störung E37 (Sensor); Reset + Reinigung; Ticket #SR-5123 offen; Output -5 %.`
    },
    {
      id: "special_incidents",
      label: "Besondere Vorkommnisse",
      type: "textarea",
      description: `Außergewöhnliche Ereignisse außerhalb der Standardkategorien (z. B. Unfälle/Beinaheunfälle, Sicherheitsstopps, IT-Ausfälle, ungewöhnliche Qualitätsabweichungen).
Für jeden Eintrag:
- Zeitpunkt & Ort/Bereich
- kurze Beschreibung (Fakten, keine Schuldzuweisung)
- Sofortmaßnahmen
- Meldungen/Nummern (z. B. Unfallmeldung, CAPA, Ticket)
- nächste Schritte/Beobachtung
Beispiel:
• 12:05 – Lagerzone B: Beinaheunfall durch nassen Boden; Bereich abgesperrt, Reinigung veranlasst; Meldung #HSE-2025-103; Monitoring 24 h.`
    },
    {
      id: "safety_notes",
      label: "Sicherheitshinweise",
      type: "textarea",
      description: `Konkrete Hinweise für die nächste Schicht zur sicheren Arbeitsdurchführung.
Bitte angeben:
- Gefahrenstelle/Risiko (Ort, Maschine, Prozess)
- erforderliche Schutzmaßnahmen (PPE, Sperrung, Freigabeprozesse)
- temporäre Änderungen (z. B. reduzierte Geschwindigkeit, Umleitung)
- Prüfpunkte vor Schichtbeginn
- Ansprechpartner bei Fragen/Notfällen
Beispiel:
• Gabelstaplerverkehr in Gang C erhöht – Wege markieren, Warnweste Pflicht, max. 6 km/h; vor Start: Hupentest; Ansprechpartner: Schichtleitung Logistics (Tel. 1234).`
    }
  ];

  // parent state
  const [patch, setPatch] = React.useState<Record<string, any> | null>(null);
  const [_missingFields, setMissingFields] = React.useState<string[]>([]);
  const [_isFilling, setIsFilling] = React.useState(false);

  // keep current user-entered values in parent (for iterative fills)
  const [currentValues, setCurrentValues] = React.useState<Record<string, any>>({});

  // NEW: keep rolling combined transcript to send as "oldTranscript" on next turn
  const [combinedTranscript, setCombinedTranscript] = React.useState<string>("");
  const [processingState, setProcessingState] = React.useState<string>("");
  const [selectedLang, setSelectedLang] = React.useState<string>("en");

  const [lastChatResponse, setLastChatResponse] = React.useState<string | null>(null);
  const [metadata, setMetadata] = useState({});


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

      // Extract values and metadata from the response
    const newValues: Record<string, any> = {};
    const newMetadata: Record<string, any> = {};

       Object.entries(data.filled).forEach(([fieldId, fieldData]: [string, any]) => {
      newValues[fieldId] = fieldData.value;
      
      // Build metadata object for each field
      newMetadata[fieldId] = {
        confidence: fieldData.confidence,
        source: fieldData.source,
        changed: fieldData.changed,
        evidence: fieldData.evidence,
        reason: fieldData.reason,
      };
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

      setMetadata(newMetadata);
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
            metadata={metadata}
            processingState={processingState}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
