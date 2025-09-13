import React from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdMic, MdMicOff, MdAssistant, MdSend } from "react-icons/md";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

// =============================================================
// Invox: modular page with resizable Chat and Form panels
// -------------------------------------------------------------
// This file groups components in one place so you can paste it in.
// Later you can split into files:
// - components/invox/ChatPanel.tsx
// - components/invox/IncidentForm.tsx
// - pages/InvoxPage.tsx
// =============================================================

// ----------------------------------------------
// Schema & types
// ----------------------------------------------
const FormSchema = z.object({
  date: z.string().min(1, "Date of Report is required"),
  reporterName: z.string().min(1, "Name of Reporting Person is required"),
  title: z.string().min(1, "Title or Summary is required"),
  description: z.string().min(1, "Please provide a short description"),
  affectedLine: z
    .string()
    .min(1, "Affected Machine or Production Line is required"),
  correctiveAction: z
    .string()
    .min(1, "Please describe the corrective action plan"),
});
export type InvoxFormValues = z.infer<typeof FormSchema>;

// ----------------------------------------------
// AI extraction stub (replace with your real API)
// ----------------------------------------------
function simulateAIExtract(transcript: string): Partial<InvoxFormValues> {
  const nameMatch = transcript.match(/by\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i);
  const name = nameMatch?.[1] ?? "John Smith";
  const mentionsConveyor = /conveyor belt/i.test(transcript);

  const title = mentionsConveyor ? "Conveyor Belt Malfunction" : "Incident Report";
  const description = mentionsConveyor
    ? "The conveyor belt malfunctioned during the morning shift. Immediate stop and jam clearance were performed."
    : transcript.slice(0, 180);
  const correctiveAction = mentionsConveyor
    ? "Replace worn belt components and schedule regular maintenance checks."
    : "Investigate root cause and apply corrective measures.";

  return {
    reporterName: name,
    title,
    description,
    correctiveAction,
    // leave date & affectedLine empty intentionally
  };
}

// ----------------------------------------------
// Chat UI atoms
// ----------------------------------------------
function AssistantBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 p-4 shadow-sm">
      <div className="mb-1 flex items-center gap-2 font-medium">
        <MdAssistant className="h-5 w-5" /> Assistant
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-primary/5 text-foreground border border-border p-4 shadow-sm">
      <div className="mb-1 font-medium">You</div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

// ----------------------------------------------
// ChatPanel (left)
// ----------------------------------------------
interface ChatPanelProps {
  onExtract: (values: Partial<InvoxFormValues>) => void;
  missingFields: (keyof InvoxFormValues)[];
  initialTranscript?: string;
}
function ChatPanel({ onExtract, missingFields, initialTranscript }: ChatPanelProps) {
  const [listening, setListening] = React.useState(true);
  const [transcript, setTranscript] = React.useState(
    initialTranscript ||
      "We encountered an issue with the conveyor belt malfunctioning. The problem was noticed during the morning shift by John Smith. The immediate action taken was to stop the machine and clear the jam, but the underlying cause needs investigation."
  );
  const [messages, setMessages] = React.useState<React.ReactNode[]>([
    <AssistantBubble key="intro">
      <p>👋 Hi!</p>
      <p className="mt-2">
        I am always listening while you are speaking. Once you pause for about 3
        seconds, I’ll process what you said and fill out the form automatically.
        You can stop me at any time, then edit the fields manually before
        submitting.
      </p>
    </AssistantBubble>,
  ]);

  // When parent detects missing required fields, announce them.
  React.useEffect(() => {
    if (!missingFields.length) return;
    const fieldMap: Record<keyof InvoxFormValues, string> = {
      date: "Date of Report",
      reporterName: "Name of Reporting Person",
      title: "Title or Summary",
      description: "Detailed Description",
      affectedLine: "Affected Machine / Production Line",
      correctiveAction: "Corrective Action Plan",
    };
    const names = missingFields.map((k) => fieldMap[k]).join(", ");
    setMessages((prev) => [
      ...prev,
      <AssistantBubble key={`missing-${Date.now()}`}>
        I couldn’t find <strong>{names}</strong>. Please provide them to
        complete the report.
      </AssistantBubble>,
    ]);
  }, [missingFields]);

  const handleProcessTranscript = () => {
    setMessages((prev) => [
      ...prev,
      <UserBubble key={`u-${Date.now()}`}>{transcript}</UserBubble>,
    ]);

    const extracted = simulateAIExtract(transcript);
    onExtract(extracted);

    setMessages((prev) => [
      ...prev,
      <AssistantBubble key={`a-${Date.now()}`}>
        I’ve filled out the form with the details from your transcript.
      </AssistantBubble>,
    ]);
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {listening ? (
            <MdMic className="h-5 w-5 text-emerald-600" />
          ) : (
            <MdMicOff className="h-5 w-5 text-muted-foreground" />
          )}
          Assistant
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-4">
        <ScrollArea className="h-full rounded-lg border bg-background p-4">
          <div className="flex flex-col gap-4">{messages}</div>
        </ScrollArea>

        <div className="space-y-2">
          <Label htmlFor="transcript">Transcript</Label>
          <Textarea
            id="transcript"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Speak, or paste text here..."
            className="min-h-28"
          />
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="destructive"
            onClick={() => setListening((v) => !v)}
            className="gap-2"
          >
            {listening ? <MdMicOff /> : <MdMic />}
            {listening ? "Stop Listening" : "Start Listening"}
          </Button>

          <Button type="button" onClick={handleProcessTranscript} className="gap-2">
            <MdSend /> Process Transcript
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------
// IncidentForm (right)
// ----------------------------------------------
interface IncidentFormProps {
  patch: Partial<InvoxFormValues> | null; // values to merge into the form
  onMissingFields?: (missing: (keyof InvoxFormValues)[]) => void;
  onSubmit?: (values: InvoxFormValues) => void;
}
function IncidentForm({ patch, onMissingFields, onSubmit }: IncidentFormProps) {
  const form = useForm<InvoxFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      date: "",
      reporterName: "",
      title: "",
      description: "",
      affectedLine: "",
      correctiveAction: "",
    },
    mode: "onChange",
  });

  // Merge incoming patch and inform about missing required fields
  React.useEffect(() => {
    if (!patch) return;
    const next = { ...form.getValues(), ...patch } as InvoxFormValues;
    form.reset(next);
    const missing = getMissingRequired(next);
    onMissingFields?.(missing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(patch)]);

  const handleSubmit = (values: InvoxFormValues) => {
    onSubmit?.(values);
  };

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <CardTitle>Incident Report</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="grid h-full grid-rows-[1fr_auto] gap-4 p-4">
        <ScrollArea className="h-full rounded-lg">
          <form id="invox-form" className="grid gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
            {/* Date */}
            <div className="grid gap-2">
              <Label>Date of Report</Label>
              <Input type="date" {...form.register("date")} className={form.formState.errors.date ? "border-destructive" : ""} />
              {form.formState.errors.date && (
                <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
              )}
            </div>

            {/* Reporter */}
            <div className="grid gap-2">
              <Label>Name of Reporting Person</Label>
              <Input placeholder="John Smith" {...form.register("reporterName")} />
              {form.formState.errors.reporterName && (
                <p className="text-sm text-destructive">{form.formState.errors.reporterName.message}</p>
              )}
            </div>

            {/* Title */}
            <div className="grid gap-2">
              <Label>Title or Summary of Issue</Label>
              <Input placeholder="Conveyor Belt Malfunction" {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label>Detailed Problem Description</Label>
              <Textarea placeholder="Describe what happened..." className="min-h-28" {...form.register("description")} />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>

            {/* Affected line */}
            <div className="grid gap-2">
              <Label>Affected Machine or Production Line</Label>
              <Input placeholder="e.g., Conveyor Line 2" {...form.register("affectedLine")} className={form.formState.errors.affectedLine ? "border-destructive" : ""} />
              {form.formState.errors.affectedLine && (
                <p className="text-sm text-destructive">{form.formState.errors.affectedLine.message}</p>
              )}
            </div>

            {/* Corrective action */}
            <div className="grid gap-2">
              <Label>Describe the corrective action plan</Label>
              <Textarea placeholder="What will be done next?" className="min-h-24" {...form.register("correctiveAction")} />
              {form.formState.errors.correctiveAction && (
                <p className="text-sm text-destructive">{form.formState.errors.correctiveAction.message}</p>
              )}
            </div>
          </form>
        </ScrollArea>

        <div className="flex items-center justify-end gap-2">
          <Button type="submit" form="invox-form" className="bg-emerald-600 text-white hover:bg-emerald-700">
            Submit Form
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function getMissingRequired(v: InvoxFormValues): (keyof InvoxFormValues)[] {
  const keys: (keyof InvoxFormValues)[] = [
    "date",
    "reporterName",
    "title",
    "description",
    "affectedLine",
    "correctiveAction",
  ];
  return keys.filter((k) => !String(v[k] ?? "").trim());
}

// ----------------------------------------------
// Page container with resizable layout (centered)
// ----------------------------------------------
export function Invox() {
  const { t } = useTranslation();
  const [patch, setPatch] = React.useState<Partial<InvoxFormValues> | null>(null);
  const [missingFields, setMissingFields] = React.useState<(keyof InvoxFormValues)[]>([]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-muted/50">
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-12 py-6 w-full">
        <div className="mx-auto max-w-7xl">
          <ResizablePanelGroup
            direction="horizontal"
            className="rounded-lg border bg-background h-[calc(100vh-12rem)]"
          >
            <ResizablePanel defaultSize={40} minSize={25}>
              <ChatPanel
                onExtract={(vals) => setPatch(vals)}
                missingFields={missingFields}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={60} minSize={35}>
              <IncidentForm
                patch={patch}
                onMissingFields={(m) => setMissingFields(m)}
                onSubmit={(values) => {
                  console.log("Submit", values);
                }}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </main>
    </div>
  );
}

export default Invox;
