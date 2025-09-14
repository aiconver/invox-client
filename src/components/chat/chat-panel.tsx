"use client";
import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AssistantMessage, UserMessage } from "./Bubbles";
import { Button } from "@/components/ui/button";
import { MdPlayArrow, MdPause, MdStop } from "react-icons/md";
import { useDebugRecorder } from "./useRecorder";

type ChatPanelProps = {
  missingFields: string[];
  onTranscript: (transcript: string) => void;
};

type Message = {
  id: string;
  type: "assistant" | "user";
  content: React.ReactNode;
  timestamp: Date;
};

export default function DebugChatPanel({ onTranscript, missingFields }: ChatPanelProps) {
  const [messages, setMessages] = React.useState<Message[]>([
    { id: "intro", type: "assistant", content: "Hi! Minimal voice capture.", timestamp: new Date() },
  ]);

  const recorder = useDebugRecorder({
    onTranscript: (t) => {
      setMessages((p) => [
        ...p,
        { id: `u-${Date.now()}`, type: "user", content: t, timestamp: new Date() },
      ]);
      onTranscript(t);
    },
    silenceDurationMs: 5000,
  });

  React.useEffect(() => {
    if (!missingFields?.length) return;
    setMessages((p) => [
      ...p,
      {
        id: `m-${Date.now()}`,
        type: "assistant",
        content: <>Missing: <strong>{missingFields.join(", ")}</strong></>,
        timestamp: new Date(),
      },
    ]);
  }, [missingFields]);

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
            State: <b>{recorder.state}</b> · Audio: <b>{(recorder.audioLevel * 100).toFixed(1)}%</b> ·
            Silence in: <b>{recorder.silenceCountdown}s</b>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={recorder.toggleAutoMode}
              disabled={recorder.state === "processing"}
              variant={recorder.isAutoMode ? "secondary" : "default"}
              className="gap-2"
            >
              {recorder.isAutoMode ? (<><MdPause /> Stop Auto</>) : (<><MdPlayArrow /> Start Auto</>)}
            </Button>
            {recorder.isListening && (
              <Button onClick={recorder.manualStop} variant="outline" className="gap-2">
                <MdStop /> Stop & Process
              </Button>
            )}
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
