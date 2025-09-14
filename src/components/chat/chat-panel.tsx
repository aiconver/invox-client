"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RecorderControls } from "./controls";
import { useRecorder } from "@/hooks/useAudioRecorder";
import { AssistantMessage, UserMessage } from "./Bubbles";

type ChatPanelProps = {
  missingFields: string[];
  onTranscript: (transcript: string) => void;
  onExtract?: (values: Record<string, any>) => void;
  isFilling?: boolean;
};

type Message = {
  id: string;
  type: 'assistant' | 'user';
  content: React.ReactNode;
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

  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: 'intro',
      type: 'assistant',
      content: (
        <>
          <p>👋 Hi!</p>
          <p className="mt-2">
            Click <strong>Start</strong> to record. When you're done, click <strong>Stop</strong>, then{" "}
            <strong>Process</strong> to transcribe and fill the form.
          </p>
        </>
      ),
    },
  ]);

  // show missing fields (deduped)
  const lastMissingKeyRef = React.useRef<string>("");
  React.useEffect(() => {
    const key = [...missingFields].sort().join("|");
    if (!key || key === lastMissingKeyRef.current) return;
    lastMissingKeyRef.current = key;

    setMessages((prev) => [
      ...prev,
      {
        id: `missing-${Date.now()}`,
        type: 'assistant',
        content: (
          <>
            I couldn't find <strong>{missingFields.join(", ")}</strong>. Please provide them.
          </>
        ),
      },
    ]);
  }, [missingFields]);

  // reflect recorder error into our UI
  React.useEffect(() => {
    if (!recError) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `rec-err-${Date.now()}`,
        type: 'assistant',
        content: `❌ ${recError}`,
      },
    ]);
  }, [recError]);

  const startRecording = async () => {
    await start();
    setMessages((prev) => [
      ...prev,
      {
        id: `started-${Date.now()}`,
        type: 'assistant',
        content: '🎙️ Recording started… speak now.',
      },
    ]);
  };

  const stopRecording = async () => {
    await stop();
    setMessages((prev) => [
      ...prev,
      {
        id: `stopped-${Date.now()}`,
        type: 'assistant',
        content: '⏹️ Recording stopped.',
      },
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
          {
            id: `no-blob-${Date.now()}`,
            type: 'assistant',
            content: `❌ ${msg}`,
          },
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

      // Display user message and assistant response
      setMessages((prev) => [
        ...prev,
        {
          id: `u-${Date.now()}`,
          type: 'user',
          content: transcriptFromApi,
        },
        {
          id: `proc-${Date.now()}`,
          type: 'assistant',
          content: '✅ Transcript ready. Filling the form…',
        },
      ]);

      onTranscript(transcriptFromApi);
    } catch (err: any) {
      const msg = err?.message ?? "Failed to process recording.";
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-proc-${Date.now()}`,
          type: 'assistant',
          content: `❌ ${String(msg)}`,
        },
      ]);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-150px)] min-h-0 flex-col overflow-hidden">
      {/* Chat Area (Top) */}
      <div className="flex-1 min-h-0 p-4">
        <ScrollArea className="h-full rounded-lg border bg-background">
          <div className="p-4 min-h-full">
            {messages.map((message) =>
              message.type === 'assistant' ? (
                <AssistantMessage key={message.id}>{message.content}</AssistantMessage>
              ) : (
                <UserMessage key={message.id}>{message.content}</UserMessage>
              )
            )}
            {error && (
              <AssistantMessage>
                <span className="text-red-600 font-medium">Error:</span> {error}
              </AssistantMessage>
            )}
            {/* Spacer for bottom padding */}
            <div className="h-4" aria-hidden />
          </div>
        </ScrollArea>
      </div>

      {/* Controls Panel (Bottom Left) */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-4">
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
      </div>
    </div>
  );
}