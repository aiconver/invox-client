"use client";
import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AssistantMessage, UserMessage } from "./Bubbles";
import { Button } from "@/components/ui/button";
import { MdPlayArrow, MdStop /*, MdPause */ } from "react-icons/md";
import { useDebugRecorder } from "./useRecorder";

type ChatPanelProps = {
  missingFields: string[];
  onTranscript: (transcript: string) => void;
  isFilling: boolean;
  chatResponse?: string | null;
  processingState?: string; 
};

type Message = {
  id: string;
  type: "assistant" | "user";
  content: React.ReactNode;
  timestamp: Date;
};

export default function DebugChatPanel({
  onTranscript,
  missingFields,
  isFilling,
  chatResponse,
  processingState,
}: ChatPanelProps) {
  const [messages, setMessages] = React.useState<Message[]>([
    { id: "intro", type: "assistant", content: <>Hi! Click <b>Start</b> to record, then <b>Stop &amp; Process</b>. You’ll see <i>Transcribing…</i> and <i>Filling…</i> while I work—then I’ll fill the form. Describe the incident in your own words.</>, timestamp: new Date() },
  ]);

  // Refs to track temporary blinking placeholders so we can remove them later
  const transcribeMsgIdRef = React.useRef<string | null>(null);
  const fillMsgIdRef = React.useRef<string | null>(null);

  // Helpers to add/remove blinking assistant messages
  const addBlink = (text: string) => {
    const id = `${text}-${Date.now()}`;
    setMessages((p) => [
      ...p,
      {
        id,
        type: "assistant",
        content: <span className="animate-pulse">{text}</span>,
        timestamp: new Date(),
      },
    ]);
    return id;
  };

  const removeById = (id: string | null) => {
    if (!id) return;
    setMessages((p) => p.filter((m) => m.id !== id));
  };

  // Initialize recorder (must be before effects that use `recorder`)
  const recorder = useDebugRecorder({
    onTranscript: (t) => {
      // Clear the "Transcribing…" placeholder as soon as transcript arrives
      removeById(transcribeMsgIdRef.current);
      transcribeMsgIdRef.current = null;

      setMessages((p) => [
        ...p,
        { id: `u-${Date.now()}`, type: "user", content: t, timestamp: new Date() },
      ]);
      onTranscript(t);
    },
    silenceDurationMs: 5000, // kept for future auto mode
  });

  // Show/hide "Transcribing…" while the recorder is processing audio
  React.useEffect(() => {
    if (recorder.state === "processing" && !transcribeMsgIdRef.current) {
      transcribeMsgIdRef.current = addBlink("Transcribing…");
    }
    if (recorder.state !== "processing" && transcribeMsgIdRef.current) {
      removeById(transcribeMsgIdRef.current);
      transcribeMsgIdRef.current = null;
    }
  }, [recorder.state]);

  // Show/hide "Filling…" while backend fill runs
  React.useEffect(() => {
    if (processingState === "filling" && !fillMsgIdRef.current) {
      fillMsgIdRef.current = addBlink("Filling…");
    }
    if (processingState !== "filling" && fillMsgIdRef.current) {
      removeById(fillMsgIdRef.current);
      fillMsgIdRef.current = null;
    }
  }, [processingState]);

  // When chatResponse arrives, remove "Filling…" and append assistant summary
  React.useEffect(() => {
    if (!chatResponse) return;
    removeById(fillMsgIdRef.current);
    fillMsgIdRef.current = null;

    setMessages((p) => [
      ...p,
      {
        id: `cr-${Date.now()}`,
        type: "assistant",
        content: chatResponse,
        timestamp: new Date(),
      },
    ]);
  }, [chatResponse]);

  const canStart = recorder.state === "idle" || recorder.state === "error";
  const canStopAndProcess = recorder.state === "listening" || recorder.state === "speaking";

  return (
    <div className="flex h-[calc(100vh-150px)] min-h-0 flex-col overflow-hidden">
      <div className="flex-1 min-h-0 p-4">
        <ScrollArea className="h-full rounded-lg border bg-background">
          <div className="p-4 min-h-full">
            {messages.map((m) =>
              m.type === "assistant" ? (
                <AssistantMessage key={m.id}>{m.content}</AssistantMessage>
              ) : (
                <UserMessage key={m.id}>{m.content}</UserMessage>
              )
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="border-t bg-background/95">
        <div className="p-4 flex items-center justify-between">
          <div className="text-sm">
            State: <b>{recorder.state}</b> · Audio: <b>{(recorder.audioLevel * 100).toFixed(1)}%</b>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={recorder.startManual}
              disabled={!canStart || recorder.isProcessing}
              className="gap-2"
            >
              <MdPlayArrow /> Start
            </Button>

            <Button
              onClick={recorder.stopAndProcess}
              disabled={!canStopAndProcess}
              variant="outline"
              className="gap-2"
            >
              <MdStop /> Stop &amp; Process
            </Button>
          </div>
        </div>

        {recorder.error && (
          <div className="px-4 pb-4">
            <div className="text-red-600 text-sm">Error: {recorder.error}</div>
            <Button onClick={recorder.clearError} variant="outline" size="sm" className="mt-2">
              Dismiss
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
