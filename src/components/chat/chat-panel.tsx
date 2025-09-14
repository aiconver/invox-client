"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RecorderControls } from "./controls";
// Removed TranscriptEditor import — we no longer allow manual edits
import { useRecorder } from "@/hooks/useAudioRecorder";
import { AssistantBubble, UserBubble } from "./Bubbles";

type ChatPanelProps = {
  missingFields: string[];
  onTranscript: (transcript: string) => void;
  onExtract?: (values: Record<string, any>) => void; // (unused now)
  isFilling?: boolean;
};

function mimeToExt(mime?: string) {
  if (!mime) return "webm";
  const typeOnly = mime.split(";")[0];
  return typeOnly.split("/")[1] || "webm";
}

export default function ChatPanel({
  onTranscript,
  missingFields,
  onExtract,
  isFilling,
}: ChatPanelProps) {
  const { listening, recordedBlob, error: recError, start, stop } = useRecorder();
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Removed editable transcript state and dummy initial value

  const [messages, setMessages] = React.useState<React.ReactNode[]>([
    <AssistantBubble key="intro">
      <p>👋 Hi!</p>
      <p className="mt-2">
        Click <strong>Start</strong> to record. When you’re done, click <strong>Stop</strong>, then{" "}
        <strong>Process</strong> to transcribe and fill the form.
      </p>
    </AssistantBubble>,
  ]);

  // show missing fields (deduped)
  const lastMissingKeyRef = React.useRef<string>("");
  React.useEffect(() => {
    const key = [...missingFields].sort().join("|");
    if (!key || key === lastMissingKeyRef.current) return;
    lastMissingKeyRef.current = key;

    setMessages((prev) => [
      ...prev,
      <AssistantBubble key={`missing-${Date.now()}`}>
        I couldn’t find <strong>{missingFields.join(", ")}</strong>. Please provide them.
      </AssistantBubble>,
    ]);
  }, [missingFields]);

  // reflect recorder error into our UI
  React.useEffect(() => {
    if (!recError) return;
    setMessages((prev) => [
      ...prev,
      <AssistantBubble key={`rec-err-${Date.now()}`}>❌ {recError}</AssistantBubble>,
    ]);
  }, [recError]);

  const startRecording = async () => {
    await start();
    setMessages((prev) => [
      ...prev,
      <AssistantBubble key={`started-${Date.now()}`}>
        🎙️ Recording started… speak now.
      </AssistantBubble>,
    ]);
  };

  const stopRecording = async () => {
    await stop();
    setMessages((prev) => [
      ...prev,
      <AssistantBubble key={`stopped-${Date.now()}`}>
        ⏹️ Recording stopped.
      </AssistantBubble>,
    ]);
  };

  const handleProcess = async () => {
    try {
      setProcessing(true);
      setError(null);

      if (listening) await stop();

      // Require an actual recording — no manual/typed transcript fallback
      if (!recordedBlob || recordedBlob.size === 0) {
        const msg = "No recording found. Please record audio first.";
        setError(msg);
        setMessages((prev) => [
          ...prev,
          <AssistantBubble key={`no-blob-${Date.now()}`}>❌ {msg}</AssistantBubble>,
        ]);
        return;
      }

      // Build multipart
      const ext = mimeToExt(recordedBlob.type);
      const filename = `recording.${ext}`;
      const form = new FormData();
      form.append("audio", recordedBlob, filename);

      // POST → transcribe
      const res = await fetch("/api/v1/form/transcribe", {
        method: "POST",
        body: form,
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        /* ignore */
      }

      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      const transcriptFromApi: string | undefined = data?.data?.transcript ?? data?.transcript;
      console.log("Transcription result:", transcriptFromApi);

      if (!transcriptFromApi) {
        throw new Error("No transcript returned by the server.");
      }

      // Display ONLY what the user actually said (from API). No dummy text, no editing
      setMessages((prev) => [
        ...prev,
        <UserBubble key={`u-${Date.now()}`}>{transcriptFromApi}</UserBubble>,
        <AssistantBubble key={`proc-${Date.now()}`}>
          ✅ Transcript ready. Filling the form…
        </AssistantBubble>,
      ]);

      onTranscript(transcriptFromApi);
    } catch (err: any) {
      const msg = err?.message ?? "Failed to process recording.";
      setError(msg);
      setMessages((prev) => [
        ...prev,
        <AssistantBubble key={`err-proc-${Date.now()}`}>❌ {String(msg)}</AssistantBubble>,
      ]);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-71px)] min-h-0 flex-col overflow-hidden">
      {/* Sticky controls header (always visible) */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <RecorderControls
          listening={listening}
          processing={processing}
          isFilling={isFilling}
          recordedBlob={recordedBlob}
          onStart={startRecording}
          onStop={stopRecording}
          onProcess={handleProcess}
        />
      </div>

      {/* Scrollable middle: messages only (editor removed) */}
      <div className="flex-1 min-h-0 px-4 pb-4">
        <ScrollArea className="h-full rounded-lg border bg-background p-4">
          <div className="flex flex-col gap-4">
            {messages}
            {error && (
              <AssistantBubble>
                <span className="text-red-600 font-medium">Error:</span> {error}
              </AssistantBubble>
            )}
            {/* Spacer so content never hides beneath the sticky header’s shadow */}
            <div className="h-2" aria-hidden />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
