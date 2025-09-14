"use client";

import * as React from "react";
import { MdMic, MdMicOff, MdSend } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormValues } from "@/components/form/schema";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { uploadAndTranscribe } from "@/services/transcriptionApi";
import { AssistantBubble, UserBubble } from "@/components/chat/Bubbles";

type ChatPanelProps = {
  onExtract: (values: Partial<FormValues>) => void;
  missingFields: (keyof FormValues)[];
};

// simple stub — replace with your real extractor
function simulateAIExtract(transcript: string): Partial<FormValues> {
  const nameMatch = transcript.match(/by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i);
  const name = nameMatch?.[1] ?? "John Smith";
  const isConveyor = /conveyor belt/i.test(transcript);
  return {
    reporterName: name,
    title: isConveyor ? "Conveyor Belt Malfunction" : "Incident Report",
    description: isConveyor
      ? "The conveyor belt malfunctioned during the morning shift. Immediate stop and jam clearance were performed."
      : transcript.slice(0, 180),
    correctiveAction: isConveyor
      ? "Replace worn belt components and schedule regular maintenance checks."
      : "Investigate root cause and apply corrective measures.",
  };
}

export default function ChatPanel({ onExtract, missingFields }: ChatPanelProps) {
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [transcript, setTranscript] = React.useState(
    "We encountered an issue with the conveyor belt malfunctioning. The problem was noticed during the morning shift by John Smith. The immediate action taken was to stop the machine and clear the jam, but the underlying cause needs investigation."
  );
  const [messages, setMessages] = React.useState<React.ReactNode[]>([
    <AssistantBubble key="intro">
      <p>👋 Hi!</p>
      <p className="mt-2">
        Click <strong>Start</strong> to record. When you’re done, click <strong>Stop</strong>, then{" "}
        <strong>Process</strong> to send the audio to the backend and get a transcript.
      </p>
    </AssistantBubble>,
  ]);

  const { isRecording, blob, error: recError, start, stop, reset } = useAudioRecorder();

  React.useEffect(() => {
    if (recError) {
      setMessages((prev) => [
        ...prev,
        <AssistantBubble key={`rec-err-${Date.now()}`}>
          ❌ Microphone error: {recError}
        </AssistantBubble>,
      ]);
    }
  }, [recError]);

  // tell user which fields are still missing
  React.useEffect(() => {
    if (!missingFields.length) return;
    const labels: Record<keyof FormValues, string> = {
      date: "Date of Report",
      reporterName: "Name of Reporting Person",
      title: "Title or Summary",
      description: "Detailed Description",
      affectedLine: "Affected Machine / Production Line",
      correctiveAction: "Corrective Action Plan",
    };
    const names = missingFields.map((k) => labels[k]).join(", ");
    setMessages((prev) => [
      ...prev,
      <AssistantBubble key={`missing-${Date.now()}`}>
        I couldn’t find <strong>{names}</strong>. Please provide them.
      </AssistantBubble>,
    ]);
  }, [missingFields]);

  const handleProcess = async () => {
    setMessages((prev) => [...prev, <UserBubble key={`u-${Date.now()}`}>{transcript}</UserBubble>]);

    try {
      setProcessing(true);
      setError(null);

      // If still recording, stop first
      if (isRecording) {
        await stop();
        setMessages((prev) => [
          ...prev,
          <AssistantBubble key={`auto-stop-${Date.now()}`}>⏹️ Recording stopped automatically.</AssistantBubble>,
        ]);
      }

      if (!blob || blob.size === 0) {
        const extracted = simulateAIExtract(transcript);
        onExtract(extracted);
        setMessages((prev) => [
          ...prev,
          <AssistantBubble key={`no-rec-${Date.now()}`}>No recording found; used the typed transcript instead.</AssistantBubble>,
        ]);
        return;
      }

      const { transcript: t } = await uploadAndTranscribe(blob);
      console.log("Transcription result:", t);

      setMessages((prev) => [
        ...prev,
        <AssistantBubble key={`proc-${Date.now()}`}>✅ Got your transcript from the backend. Check the console.</AssistantBubble>,
      ]);

      // If you want: auto-extract
      // onExtract(simulateAIExtract(t || ""));

      // Optional: reset after successful process
      // reset();
    } catch (e: any) {
      setError(e?.message ?? "Failed to process recording.");
      setMessages((prev) => [
        ...prev,
        <AssistantBubble key={`err-proc-${Date.now()}`}>❌ {String(e?.message || "Failed to process the recording.")}</AssistantBubble>,
      ]);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-col h-[calc(100vh-71px)]">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background/80">
        <div className="inline-flex items-center gap-2 font-semibold">
          {isRecording ? <MdMic className="h-4 w-4 text-emerald-600" /> : <MdMicOff className="h-4 w-4 text-muted-foreground" />}
          Assistant
          {blob && (
            <span className="ml-2 text-xs text-muted-foreground">
              recorded ~{Math.max(1, Math.round(blob.size / 1024))} KB
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant={isRecording ? "secondary" : "default"} size="sm" onClick={start} disabled={isRecording || processing} className="gap-2">
            <MdMic /> Start
          </Button>
          <Button variant="destructive" size="sm" onClick={stop} disabled={!isRecording || processing} className="gap-2">
            <MdMicOff /> Stop
          </Button>
          <Button size="sm" onClick={handleProcess} disabled={processing} className="gap-2">
            <MdSend /> {processing ? "Processing..." : "Process"}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-4">
        <ScrollArea className="h-full rounded-lg border bg-background p-4">
          <div className="flex flex-col gap-4">
            {messages}
            {error && (
              <AssistantBubble>
                <span className="text-red-600 font-medium">Error:</span> {error}
              </AssistantBubble>
            )}
          </div>
        </ScrollArea>

        <div className="mt-4 space-y-2">
          <Label htmlFor="transcript" className="text-xs text-muted-foreground">
            Transcript (manual text; optional)
          </Label>
          <Textarea id="transcript" value={transcript} onChange={(e) => setTranscript(e.target.value)} className="min-h-28" />
        </div>
      </div>
    </div>
  );
}
