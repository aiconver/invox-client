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
};

type Message = {
  id: string;
  type: "assistant" | "user";
  content: React.ReactNode;
  timestamp: Date;
  chatResponse?: string | null;
};

export default function DebugChatPanel({ onTranscript, missingFields, isFilling, chatResponse }: ChatPanelProps) {
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
    silenceDurationMs: 5000, // kept for future auto mode
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

  React.useEffect(() => {
    if (!chatResponse) return;
    setMessages(p => [
      ...p,
      { id: `cr-${Date.now()}`, type: "assistant", content: chatResponse, timestamp: new Date() },
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
            {/* · Silence in: <b>{recorder.silenceCountdown}s</b>  // [AUTO MODE] keep for later */}
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

            {/*
            // [AUTO MODE] — kept for later use:
            <Button
              onClick={recorder.toggleAutoMode}
              disabled={recorder.state === "processing"}
              variant={recorder.isAutoMode ? "secondary" : "default"}
              className="gap-2"
            >
              {recorder.isAutoMode ? (<><MdPause /> Stop Auto</>) : (<><MdPlayArrow /> Start Auto</>)}
            </Button>
            */}
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
