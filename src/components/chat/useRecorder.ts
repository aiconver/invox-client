import { useState, useRef, useCallback, useEffect } from "react";
import hark from "hark";
import { uploadAndTranscribe } from "@/services/transcriptionApi";

export type RecorderState = "idle" | "listening" | "speaking" | "processing" | "error";

export interface UseDebugRecorderProps {
  onTranscript: (t: string) => void;
  silenceDurationMs?: number; // default 5000 — kept for future auto mode
}

export interface UseDebugRecorderResult {
  state: RecorderState;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  audioLevel: number;          // 0..1 (normalized from dB)

  // ---- Manual mode API (ACTIVE) ----
  startManual: () => Promise<void>;
  stopAndProcess: () => Promise<void>;
  // Alias for backward compatibility:
  manualStop: () => Promise<void>;

  // ---- Automatic mode API (INACTIVE; kept for later) ----
  // isAutoMode: boolean;
  // silenceCountdown: number;
  // startAutoMode: () => Promise<void>;
  // stopAutoMode: () => void;
  // toggleAutoMode: () => Promise<void>;

  error: string | null;
  clearError: () => void;
}

export function useDebugRecorder({
  onTranscript,
  silenceDurationMs = 5000,
}: UseDebugRecorderProps): UseDebugRecorderResult {
  const [state, setState] = useState<RecorderState>("idle");
  // const [isAutoMode, setIsAutoMode] = useState(false); // [AUTO MODE]
  const [audioLevel, setAudioLevel] = useState(0);
  const [silenceCountdown, setSilenceCountdown] = useState(0); // [AUTO MODE]
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // hark + timers
  const harkRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // [AUTO MODE]
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null); // [AUTO MODE]

  // re-arm guard: require fresh speech after each (re)start/processing
  const hadSpeechSinceRestartRef = useRef<boolean>(false); // [AUTO MODE]

  const isListening = state === "listening" || state === "speaking";
  const isSpeaking = state === "speaking";
  const isProcessing = state === "processing";

  const clearTimers = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const cleanupStream = useCallback(() => {
    // Stop hark
    if (harkRef.current) {
      try { harkRef.current.stop(); } catch {}
      harkRef.current = null;
    }
    // Stop media recorder if still active
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      try { mr.stop(); } catch {}
    }
    mediaRecorderRef.current = null;

    // Stop tracks & release mic
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => { try { t.stop(); } catch {} });
      streamRef.current = null;
    }

    // Reset timers / counters
    clearTimers();
    setSilenceCountdown(0);
  }, [clearTimers]);

  const startMediaRecorder = useCallback((stream: MediaStream) => {
    const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/wav";
    const mr = new MediaRecorder(stream, { mimeType: mime });
    mediaRecorderRef.current = mr;
    audioChunksRef.current = [];
    mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
    mr.start(250); // small chunk size ensures we have data on stop
  }, []);

  const stopRecorderAndGetBlob = useCallback(async (): Promise<Blob | null> => {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state === "inactive") return null;
    return new Promise<Blob | null>((resolve) => {
      const mime = mr.mimeType || (MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/wav");
      const onStop = () => {
        mr.removeEventListener("stop", onStop);
        const blob = new Blob(audioChunksRef.current, { type: mime });
        resolve(blob.size > 0 ? blob : null);
      };
      mr.addEventListener("stop", onStop);
      try { mr.stop(); } catch { resolve(null); }
    });
  }, []);

  const processNow = useCallback(async () => {
    clearTimers();

    const blob = await stopRecorderAndGetBlob();
    if (!blob) {
      setError("No recording data");
      setState("error");
      return;
    }

    const ext = blob.type.includes("webm") ? "webm" : "wav";
    const filename = `rec-${Date.now()}.${ext}`;
    const controller = new AbortController();

    setState("processing");

    try {
      const { transcript } = await uploadAndTranscribe(blob, {
        filename,
        onUploadProgress: () => {},
        signal: controller.signal,
      });

      if (!transcript) throw new Error("No transcript");
      onTranscript(transcript);

      // If auto mode were enabled, we would restart recording here. For manual, go idle.
      // if (isAutoMode && streamRef.current) { ... } // [AUTO MODE]
      setState("idle");
    } catch (e: any) {
      if (e?.name === "CanceledError" || e?.message === "canceled") {
        // optional: handle user-cancel differently
      }
      setError(e?.message || "Process failed");
      setState("error");
    } finally {
      // In manual mode, always release the mic after processing.
      cleanupStream();
    }
  }, [clearTimers, cleanupStream, onTranscript, stopRecorderAndGetBlob]);

  const startRecording = useCallback(async () => {
    setError(null);

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    streamRef.current = stream;

    startMediaRecorder(stream);

    // Init hark for volume meter (auto actions commented)
    const harker = (hark as any)(stream, {
      interval: 100,
      threshold: -75,
      play: false,
    });
    harkRef.current = harker;

    // volume (dB ~[-100..0]) → [0..1] for UI
    harker.on("volume_change", (dB: number) => {
      const normalized = Math.min(1, Math.max(0, (dB + 100) / 100));
      setAudioLevel(normalized);
    });

    // Speaking state purely for UI now — auto triggers are disabled
    harker.on("speaking", () => {
      // hadSpeechSinceRestartRef.current = true; // [AUTO MODE]
      if (state !== "speaking") setState("speaking");
    });

    harker.on("stopped_speaking", () => {
      if (state !== "listening") setState("listening");

      // [AUTO MODE] Countdown + auto-process on silence (commented for static mode)
      // setSilenceCountdown(Math.round(silenceDurationMs / 1000));
      // if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      // countdownIntervalRef.current = setInterval(() => { ... }, 1000);
      // if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      // silenceTimerRef.current = setTimeout(() => { processNow(); }, silenceDurationMs);
    });

    // hadSpeechSinceRestartRef.current = false; // [AUTO MODE]
    setSilenceCountdown(0);
    setState("listening");
  }, [silenceDurationMs, startMediaRecorder, state]);

  // ---- Manual API ----
  const startManual = useCallback(async () => {
    await startRecording();
  }, [startRecording]);

  const stopAndProcess = useCallback(async () => {
    if (isListening) {
      await processNow();
    }
  }, [isListening, processNow]);

  // Back-compat alias
  const manualStop = stopAndProcess;

  // ---- Auto API (kept for the future; not used now) ----
  // const startAutoMode = useCallback(async () => {
  //   setIsAutoMode(true);
  //   await startRecording();
  // }, [startRecording]);
  // const stopAutoMode = useCallback(() => {
  //   setIsAutoMode(false);
  //   cleanupStream();
  //   setState("idle");
  // }, [cleanupStream]);
  // const toggleAutoMode = useCallback(async () => {
  //   if (isAutoMode) stopAutoMode(); else await startAutoMode();
  // }, [isAutoMode, startAutoMode, stopAutoMode]);

  const clearError = useCallback(() => {
    setError(null);
    if (state === "error") setState("idle");
  }, [state]);

  // On unmount, clean up everything
  useEffect(() => () => cleanupStream(), [cleanupStream]);

  return {
    state,
    isListening,
    isSpeaking,
    isProcessing,
    audioLevel,

    startManual,
    stopAndProcess,
    manualStop,

    // isAutoMode,              // [AUTO MODE]
    // silenceCountdown,        // [AUTO MODE]
    // startAutoMode,           // [AUTO MODE]
    // stopAutoMode,            // [AUTO MODE]
    // toggleAutoMode,          // [AUTO MODE]

    error,
    clearError,
  };
}
