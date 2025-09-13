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
// FULL‑BLEED layout: the split view covers 100% of the viewport
// below the top bar (assumed h-14 = 56px). No outer gray gutters.
// =============================================================

const FormSchema = z.object({
  date: z.string().min(1, "Date of Report is required"),
  reporterName: z.string().min(1, "Name of Reporting Person is required"),
  title: z.string().min(1, "Title or Summary is required"),
  description: z.string().min(1, "Please provide a short description"),
  affectedLine: z.string().min(1, "Affected Machine or Production Line is required"),
  correctiveAction: z.string().min(1, "Please describe the corrective action plan"),
});
export type InvoxFormValues = z.infer<typeof FormSchema>;

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
  return { reporterName: name, title, description, correctiveAction };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <CardTitle className="text-base font-semibold tracking-tight">{children}</CardTitle>;
}
function AssistantBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 p-4 shadow-sm">
      <div className="mb-1 flex items-center gap-2 font-medium"><MdAssistant className="h-5 w-5" /> Assistant</div>
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

// ---------------- ChatPanel ----------------
interface ChatPanelProps {
  onExtract: (values: Partial<InvoxFormValues>) => void;
  missingFields: (keyof InvoxFormValues)[];
  initialTranscript?: string;
}
function ChatPanel({ onExtract, missingFields, initialTranscript }: ChatPanelProps) {
  const [listening, setListening] = React.useState(false);
  const [transcript, setTranscript] = React.useState(
    initialTranscript ||
      "We encountered an issue with the conveyor belt malfunctioning. The problem was noticed during the morning shift by John Smith. The immediate action taken was to stop the machine and clear the jam, but the underlying cause needs investigation."
  );
  const [messages, setMessages] = React.useState<React.ReactNode[]>([
    <AssistantBubble key="intro">
      <p>👋 Hi!</p>
      <p className="mt-2">I’m listening while you speak. After a pause, I’ll auto-fill the form. You can stop me anytime and edit before submitting.</p>
    </AssistantBubble>,
  ]);

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
    setMessages((prev) => [...prev, (
      <AssistantBubble key={`missing-${Date.now()}`}>
        I couldn’t find <strong>{names}</strong>. Please provide them.
      </AssistantBubble>
    )]);
  }, [missingFields]);

  const handleProcessTranscript = () => {
    setMessages((prev) => [...prev, (<UserBubble key={`u-${Date.now()}`}>{transcript}</UserBubble>)]);
    const extracted = simulateAIExtract(transcript);
    onExtract(extracted);
    setMessages((prev) => [...prev, (
      <AssistantBubble key={`a-${Date.now()}`}>I’ve filled the form from your transcript.</AssistantBubble>
    )]);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background/80">
        <SectionTitle>
          <span className="inline-flex items-center gap-2">
            {listening ? <MdMic className="h-4 w-4 text-emerald-600" /> : <MdMicOff className="h-4 w-4 text-muted-foreground" />} Assistant
          </span>
        </SectionTitle>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={() => setListening((v) => !v)} className="gap-2">
            {listening ? <MdMicOff /> : <MdMic />}{listening ? "Stop" : "Start"}
          </Button>
          <Button size="sm" onClick={handleProcessTranscript} className="gap-2"><MdSend /> Process</Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-4">
        <ScrollArea className="h-full rounded-lg border bg-background p-4">
          <div className="flex flex-col gap-4">{messages}</div>
        </ScrollArea>

        <div className="mt-4 space-y-2">
          <Label htmlFor="transcript" className="text-xs text-muted-foreground">Transcript</Label>
          <Textarea id="transcript" value={transcript} onChange={(e) => setTranscript(e.target.value)} className="min-h-28" placeholder="Speak or paste text…" />
        </div>
      </div>
    </div>
  );
}

// ---------------- IncidentForm ----------------
interface IncidentFormProps {
  patch: Partial<InvoxFormValues> | null;
  onMissingFields?: (missing: (keyof InvoxFormValues)[]) => void;
  onSubmit?: (values: InvoxFormValues) => void;
}
function IncidentForm({ patch, onMissingFields, onSubmit }: IncidentFormProps) {
  const form = useForm<InvoxFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { date: "", reporterName: "", title: "", description: "", affectedLine: "", correctiveAction: "" },
    mode: "onChange",
  });

  React.useEffect(() => {
    if (!patch) return;
    const next = { ...form.getValues(), ...patch } as InvoxFormValues;
    form.reset(next);
    onMissingFields?.(getMissingRequired(next));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(patch)]);

  const handleSubmit = (v: InvoxFormValues) => onSubmit?.(v);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="px-4 py-3 border-b bg-background/80">
        <SectionTitle>Incident Report</SectionTitle>
      </div>

      <div className="flex-1 min-h-0 p-4">
        <ScrollArea className="h-full rounded-lg">
          <form id="invox-form" className="grid gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-1.5"><Label className="text-sm">Date of Report</Label><Input type="date" {...form.register("date")} className={form.formState.errors.date ? "border-destructive" : ""} />{form.formState.errors.date && (<p className="text-xs text-destructive">{form.formState.errors.date.message}</p>)}</div>
            <div className="grid gap-1.5"><Label className="text-sm">Name of Reporting Person</Label><Input placeholder="John Smith" {...form.register("reporterName")} />{form.formState.errors.reporterName && (<p className="text-xs text-destructive">{form.formState.errors.reporterName.message}</p>)}</div>
            <div className="grid gap-1.5"><Label className="text-sm">Title or Summary of Issue</Label><Input placeholder="Conveyor Belt Malfunction" {...form.register("title")} />{form.formState.errors.title && (<p className="text-xs text-destructive">{form.formState.errors.title.message}</p>)}</div>
            <div className="grid gap-1.5"><Label className="text-sm">Detailed Problem Description</Label><Textarea placeholder="Describe what happened…" className="min-h-28" {...form.register("description")} />{form.formState.errors.description && (<p className="text-xs text-destructive">{form.formState.errors.description.message}</p>)}</div>
            <div className="grid gap-1.5"><Label className="text-sm">Affected Machine or Production Line</Label><Input placeholder="e.g., Conveyor Line 2" {...form.register("affectedLine")} className={form.formState.errors.affectedLine ? "border-destructive" : ""} />{form.formState.errors.affectedLine && (<p className="text-xs text-destructive">{form.formState.errors.affectedLine.message}</p>)}</div>
            <div className="grid gap-1.5"><Label className="text-sm">Describe the corrective action plan</Label><Textarea placeholder="What will be done next?" className="min-h-24" {...form.register("correctiveAction")} />{form.formState.errors.correctiveAction && (<p className="text-xs text-destructive">{form.formState.errors.correctiveAction.message}</p>)}</div>
          </form>
        </ScrollArea>
        <div className="mt-3 flex items-center justify-end"><Button type="submit" form="invox-form" className="bg-emerald-600 text-white hover:bg-emerald-700">Submit Form</Button></div>
      </div>
    </div>
  );
}

function getMissingRequired(v: InvoxFormValues): (keyof InvoxFormValues)[] {
  const keys: (keyof InvoxFormValues)[] = ["date", "reporterName", "title", "description", "affectedLine", "correctiveAction"]; return keys.filter((k) => !String(v[k] ?? "").trim());
}

// ---------------- FULL‑BLEED PAGE ----------------
export function Invox() {
  const { t } = useTranslation();
  const [patch, setPatch] = React.useState<Partial<InvoxFormValues> | null>(null);
  const [missingFields, setMissingFields] = React.useState<(keyof InvoxFormValues)[]>([]);

  return (
    // Anchor below the sticky top bar (h-14). If your header height differs, adjust top-14 accordingly.
    <div className="fixed inset-x-0 top-14 bottom-0 bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        <ResizablePanel defaultSize={42} minSize={25} className="min-w-[280px]">
          <ChatPanel onExtract={(vals) => setPatch(vals)} missingFields={missingFields} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={58} minSize={35}>
          <IncidentForm
            patch={patch}
            onMissingFields={(m) => setMissingFields(m)}
            onSubmit={(values) => { console.log("Submit", values); }}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default Invox;
