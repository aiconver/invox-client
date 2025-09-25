"use client";
import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AssistantMessage, UserMessage } from "./Bubbles";
import { Button } from "@/components/ui/button";
import { MdPlayArrow, MdStop } from "react-icons/md";
import { useRecorder } from "./useRecorder"; // <-- updated hook
import Typewriter from "typewriter-effect";

type ChatPanelProps = {
  missingFields: string[];
  onTranscript: (transcript: string) => void;
  isFilling: boolean;
  chatResponse?: string | null;
  processingState?: string; // "filling" to show the blink
  selectedLang: string;
  setSelectedLang: (lang: string) => void;
};

type Message = {
  id: string;
  type: "assistant" | "user";
  content: React.ReactNode;
  timestamp: Date;
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function TypewriterBubble({ text }: { text: string }) {
  return (
    <Typewriter
      options={{ delay: 10, cursor: "", loop: false, deleteSpeed: Infinity }}
      onInit={(tw) => {
        const safe = escapeHtml(text).replace(/\n/g, "<br/>");
        tw.typeString(safe).start();
      }}
    />
  );
}

export default function DebugChatPanel({
  onTranscript,
  missingFields,
  isFilling,
  chatResponse,
  processingState,
  selectedLang,
  setSelectedLang,
}: ChatPanelProps) {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "intro",
      type: "assistant",
      content: (
        <>
          Hi! Click <b>Start</b> to record, then <b>Stop &amp; Process</b>. You’ll see{" "}
          <i>Transcribing…</i> and <i>Filling…</i> while I work—then I’ll fill the form. Describe the
          incident in your own words.
        </>
      ),
      timestamp: new Date(),
    },
  ]);

  // blinking placeholders (keep ids so we can remove them cleanly)
  const transcribeMsgIdRef = React.useRef<string | null>(null);
  const fillMsgIdRef = React.useRef<string | null>(null);

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

  // recorder (new simplified hook)
  const recorder = useRecorder({
    onTranscript: (t) => {
      // remove "Transcribing…" once transcript arrives
      removeById(transcribeMsgIdRef.current);
      transcribeMsgIdRef.current = null;

      setMessages((p) => [
        ...p,
        { id: `u-${Date.now()}`, type: "user", content: t, timestamp: new Date() },
      ]);
      onTranscript(t);
    },
  });

  // Show/hide "Transcribing…" based on processing state from hook
  React.useEffect(() => {
    if (recorder.state === "processing" && !transcribeMsgIdRef.current) {
      transcribeMsgIdRef.current = addBlink("Transcribing…");
    }
    if (recorder.state !== "processing" && transcribeMsgIdRef.current) {
      removeById(transcribeMsgIdRef.current);
      transcribeMsgIdRef.current = null;
    }
  }, [recorder.state]);

  // Show/hide "Filling…" while backend fill runs (driven by parent)
  React.useEffect(() => {
    if (processingState === "filling" && !fillMsgIdRef.current) {
      fillMsgIdRef.current = addBlink("Filling…");
    }
    if (processingState !== "filling" && fillMsgIdRef.current) {
      removeById(fillMsgIdRef.current);
      fillMsgIdRef.current = null;
    }
  }, [processingState]);

  // Append assistant summary when chatResponse arrives
  React.useEffect(() => {
    if (!chatResponse) return;
    removeById(fillMsgIdRef.current);
    fillMsgIdRef.current = null;

    setMessages((p) => [
      ...p,
      {
        id: `cr-${Date.now()}`,
        type: "assistant",
        content: <TypewriterBubble text={chatResponse} />,
        timestamp: new Date(),
      },
    ]);
  }, [chatResponse]);

  const canStart = recorder.state === "idle" || recorder.state === "error";
  const canStopAndProcess = recorder.state === "recording";

  return (
    <div className="flex h-[calc(100vh-150px)] min-h-0 flex-col overflow-hidden">
      <div className="flex-1 min-h-0 p-4">
        <ScrollArea className="h-full rounded-lg border bg-background">
          <div className="p-4 min-h-full" aria-live="polite">
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
            State: <b>{recorder.state}</b> · Audio:{" "}
            <b>{(recorder.audioLevel * 100).toFixed(1)}%</b>
          </div>
          <div className="flex gap-3 items-center">
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="en">English</option>
              <option value="de">German</option>
            </select>

            <Button onClick={recorder.start} disabled={!canStart || recorder.isProcessing} className="gap-2">
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
