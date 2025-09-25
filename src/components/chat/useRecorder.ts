import { useState, useRef, useCallback, useEffect } from "react";
import hark from "hark";
import { transcribeAudio } from "@/services/form-service"; // adjust path if needed

export type RecorderState = "idle" | "recording" | "processing" | "error";

export interface UseRecorderProps {
  onTranscript: (t: string) => void;
}

export interface UseRecorderResult {
  state: RecorderState;
  isRecording: boolean;
  isProcessing: boolean;
  audioLevel: number;          // 0..1 (normalized from dB)
  start: () => Promise<void>;
  stopAndProcess: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

export function useRecorder({ onTranscript }: UseRecorderProps): UseRecorderResult {
  const [state, setState] = useState<RecorderState>("idle");
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const harkRef = useRef<ReturnType<typeof hark> | null>(null);

  const cleanup = useCallback(() => {
    // stop hark
    try { harkRef.current?.stop(); } catch {}
    harkRef.current = null;

    // stop recorder
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      try { mr.stop(); } catch {}
    }
    mediaRecorderRef.current = null;

    // stop tracks
    if (streamRef.current) {
      for (const t of streamRef.current.getTracks()) {
        try { t.stop(); } catch {}
      }
      streamRef.current = null;
    }
  }, []);

  const start = useCallback(async () => {
    setError(null);

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    streamRef.current = stream;

    // mediarecorder
    const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/wav";
    const mr = new MediaRecorder(stream, { mimeType: mime });
    mediaRecorderRef.current = mr;
    audioChunksRef.current = [];

    mr.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mr.start(250);
    setState("recording");

    // volume meter via hark
    const harker = hark(stream, { interval: 100, threshold: -75, play: false });
    harkRef.current = harker;
    harker.on("volume_change", (dB: number) => {
      // dB ~ [-100..0] → [0..1]
      const normalized = Math.min(1, Math.max(0, (dB + 100) / 100));
      setAudioLevel(normalized);
    });
  }, []);

  const stopRecorderAndGetBlob = useCallback(async (): Promise<Blob | null> => {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state === "inactive") return null;

    return new Promise<Blob | null>((resolve) => {
      const onStop = () => {
        mr.removeEventListener("stop", onStop);
        const mime = mr.mimeType || (MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/wav");
        const blob = new Blob(audioChunksRef.current, { type: mime });
        resolve(blob.size > 0 ? blob : null);
      };
      mr.addEventListener("stop", onStop);
      try { mr.stop(); } catch { resolve(null); }
    });
  }, []);

  const stopAndProcess = useCallback(async () => {
    if (state !== "recording") return;
    setState("processing");

    try {
      const blob = await stopRecorderAndGetBlob();
      if (!blob) throw new Error("No recording data");

      const { transcript } = await transcribeAudio({ blob });
      if (!transcript) throw new Error("No transcript");

      onTranscript(transcript);
      setState("idle");
    } catch (e: any) {
      setError(e?.message || "Processing failed");
      setState("error");
    } finally {
      cleanup();
    }
  }, [state, stopRecorderAndGetBlob, onTranscript, cleanup]);

  const clearError = useCallback(() => {
    setError(null);
    if (state === "error") setState("idle");
  }, [state]);

  useEffect(() => () => cleanup(), [cleanup]);

  return {
    state,
    isRecording: state === "recording",
    isProcessing: state === "processing",
    audioLevel,
    start,
    stopAndProcess,
    error,
    clearError,
  };
}
