import * as React from "react";
import { MdMic, MdMicOff, MdAssistant, MdSend } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormValues } from "@/components/form/schema";

type ChatPanelProps = {
  onExtract: (values: Partial<FormValues>) => void;
  missingFields: (keyof FormValues)[];
};

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
    // date & affectedLine intentionally left empty
  };
}

export default function ChatPanel({ onExtract, missingFields }: ChatPanelProps) {
  const [listening, setListening] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<BlobPart[]>([]);
  const [recordedBlob, setRecordedBlob] = React.useState<Blob | null>(null);

  const [transcript, setTranscript] = React.useState(
    "We encountered an issue with the conveyor belt malfunctioning. The problem was noticed during the morning shift by John Smith. The immediate action taken was to stop the machine and clear the jam, but the underlying cause needs investigation."
  );
  const [messages, setMessages] = React.useState<React.ReactNode[]>([
    <AssistantBubble key="intro">
      <p>👋 Hi!</p>
      <p className="mt-2">
        Click <strong>Start</strong> to record. When you’re done, click{" "}
        <strong>Stop</strong>, then <strong>Process</strong> to send the audio to the backend and get a transcript.
      </p>
    </AssistantBubble>,
  ]);

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

  const startRecording = async () => {
    try {
      setError(null);
      // Request microphone permission and start recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      mr.onstop = () => {
        // Build a single Blob from chunks
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        setRecordedBlob(blob);
        // stop all tracks in the stream
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setListening(true);
      setMessages((prev) => [
        ...prev,
        <AssistantBubble key={`started-${Date.now()}`}>🎙️ Recording started… speak now.</AssistantBubble>,
      ]);
    } catch (err: any) {
      setError(err?.message ?? "Failed to start recording.");
      setMessages((prev) => [
        ...prev,
        <AssistantBubble key={`err-start-${Date.now()}`}>
          ❌ Couldn’t access the microphone. Please allow mic permission and try again.
        </AssistantBubble>,
      ]);
    }
  };

  const stopRecording = () => {
    try {
      setError(null);
      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== "inactive") {
        mr.stop();
      }
      setListening(false);
      setMessages((prev) => [
        ...prev,
        <AssistantBubble key={`stopped-${Date.now()}`}>⏹️ Recording stopped.</AssistantBubble>,
      ]);
    } catch (err: any) {
      setError(err?.message ?? "Failed to stop recording.");
    }
  };

  // add this helper near top of the component file
function mimeToExt(mime: string | undefined) {
  if (!mime) return "webm";
  // e.g. "audio/webm;codecs=opus" -> "webm"
  const typeOnly = mime.split(";")[0];
  const ext = typeOnly.split("/")[1] || "webm";
  return ext;
}

async function stopRecorderAndGetBlob(
  mr: MediaRecorder | null,
  chunksRef: React.MutableRefObject<BlobPart[]>,
  fallbackMime: string
): Promise<Blob | null> {
  if (!mr) return null;

  // Already stopped
  if (mr.state === "inactive") {
    if (chunksRef.current.length === 0) return null;
    return new Blob(chunksRef.current, { type: mr.mimeType || fallbackMime });
  }

  // Stop + wait for final 'stop' event to flush chunks
  await new Promise<void>((resolve) => {
    const onStop = () => resolve();
    mr.addEventListener("stop", onStop, { once: true });
    mr.stop();
  });

  if (chunksRef.current.length === 0) return null;
  return new Blob(chunksRef.current, { type: mr.mimeType || fallbackMime });
}


  const handleProcess = async () => {
  setMessages((prev) => [...prev, <UserBubble key={`u-${Date.now()}`}>{transcript}</UserBubble>]);

  try {
    setProcessing(true);
    setError(null);

    // If still recording, stop and wait for final blob
    let blob = recordedBlob;
    if (listening || (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive")) {
      const mr = mediaRecorderRef.current;
      blob = await stopRecorderAndGetBlob(mr, chunksRef, "audio/webm");
      setListening(false);
      setRecordedBlob(blob);
      setMessages((prev) => [
        ...prev,
        <AssistantBubble key={`stopped-auto-${Date.now()}`}>⏹️ Recording stopped automatically.</AssistantBubble>,
      ]);
    }

    if (!blob || blob.size === 0) {
      // No recording — use the typed transcript path for now
      const extracted = simulateAIExtract(transcript);
      onExtract(extracted);
      setMessages((prev) => [
        ...prev,
        <AssistantBubble key={`a-${Date.now()}`}>No recording found; used the typed transcript instead.</AssistantBubble>,
      ]);
      return;
    }

    // Build form-data with the raw audio blob
    const ext = mimeToExt(blob.type);
    const filename = `recording.${ext}`;
    const form = new FormData();
    form.append("audio", blob, filename);

    console.log("[Transcribe] sending", { type: blob.type, size: blob.size, filename });

    // Call your backend endpoint
    const res = await fetch("/api/v1/form/transcribe", { method: "POST", body: form });

    // Read the JSON either way for better error messages
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      /* ignore parse errors */
    }

    if (!res.ok) {
      // Show backend error string if present
      throw new Error(data?.error || `HTTP ${res.status}`);
    }

    // ApiResponse<{ transcript: string }>
    const transcriptFromApi: string | undefined = data?.data?.transcript ?? data?.transcript;
    console.log("Transcription result:", transcriptFromApi);

    setMessages((prev) => [
      ...prev,
      <AssistantBubble key={`proc-${Date.now()}`}>
        ✅ Got your transcript from the backend. Check the console for details.
      </AssistantBubble>,
    ]);

    // Optional: immediately extract into your form
    // const extracted = simulateAIExtract(transcriptFromApi || "");
    // onExtract(extracted);
  } catch (err: any) {
    setError(err?.message ?? "Failed to process recording.");
    setMessages((prev) => [
      ...prev,
      <AssistantBubble key={`err-proc-${Date.now()}`}>❌ {String(err?.message || "Failed to process the recording.")}</AssistantBubble>,
    ]);
  } finally {
    setProcessing(false);
  }
};


  return (
    <div className="flex min-h-0 flex-col h-[calc(100vh-71px)]">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background/80">
        <div className="inline-flex items-center gap-2 font-semibold">
          {listening ? <MdMic className="h-4 w-4 text-emerald-600" /> : <MdMicOff className="h-4 w-4 text-muted-foreground" />}
          Assistant
          {recordedBlob && (
            <span className="ml-2 text-xs text-muted-foreground">
              recorded ~{Math.max(1, Math.round(recordedBlob.size / 16000))} KB
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={listening ? "secondary" : "default"}
            size="sm"
            onClick={startRecording}
            disabled={listening || processing}
            className="gap-2"
          >
            <MdMic /> Start
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={stopRecording}
            disabled={!listening || processing}
            className="gap-2"
          >
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
          <Textarea
            id="transcript"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="min-h-28"
          />
        </div>
      </div>
    </div>
  );
}
