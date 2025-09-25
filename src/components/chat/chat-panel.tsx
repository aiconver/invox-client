"use client";
import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AssistantMessage, UserMessage } from "./Bubbles";
import { useRecorder } from "../../hooks/use-recorder";
import Typewriter from "typewriter-effect";
import RecorderControls from "./recorder-controls";

type ChatPanelProps = {
  onTranscript: (transcript: string) => void;
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

export default function ChatPanel({
  onTranscript,
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

  // placeholders for "Transcribing…" and "Filling…"
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

  // recorder
  const recorder = useRecorder({
    onTranscript: (t) => {
      removeById(transcribeMsgIdRef.current);
      transcribeMsgIdRef.current = null;

      setMessages((p) => [
        ...p,
        { id: `u-${Date.now()}`, type: "user", content: t, timestamp: new Date() },
      ]);
      onTranscript(t);
    },
  });

  // blink: Transcribing…
  React.useEffect(() => {
    if (recorder.state === "processing" && !transcribeMsgIdRef.current) {
      transcribeMsgIdRef.current = addBlink("Transcribing…");
    }
    if (recorder.state !== "processing" && transcribeMsgIdRef.current) {
      removeById(transcribeMsgIdRef.current);
      transcribeMsgIdRef.current = null;
    }
  }, [recorder.state]);

  // blink: Filling…
  React.useEffect(() => {
    if (processingState === "filling" && !fillMsgIdRef.current) {
      fillMsgIdRef.current = addBlink("Filling…");
    }
    if (processingState !== "filling" && fillMsgIdRef.current) {
      removeById(fillMsgIdRef.current);
      fillMsgIdRef.current = null;
    }
  }, [processingState]);

  // assistant summary
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

      <RecorderControls
        state={recorder.state}
        audioLevel={recorder.audioLevel}
        isProcessing={recorder.isProcessing}
        error={recorder.error}
        selectedLang={selectedLang}
        setSelectedLang={setSelectedLang}
        onStart={recorder.start}
        onStopAndProcess={recorder.stopAndProcess}
        onClearError={recorder.clearError}
      />
    </div>
  );
}
