import { useState, useRef, useCallback, useEffect } from "react";
import hark from "hark";

export type RecorderState = "idle" | "listening" | "speaking" | "processing" | "error";

export interface UseDebugRecorderProps {
  onTranscript: (t: string) => void;
  silenceDurationMs?: number; // default 5000
}

export interface UseDebugRecorderResult {
  state: RecorderState;
  isAutoMode: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  audioLevel: number;          // 0..1 (normalized from dB)
  silenceCountdown: number;    // seconds remaining
  startAutoMode: () => Promise<void>;
  stopAutoMode: () => void;
  toggleAutoMode: () => Promise<void>;
  manualStop: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

export function useDebugRecorder({
  onTranscript,
  silenceDurationMs = 5000,
}: UseDebugRecorderProps): UseDebugRecorderResult {
  const [state, setState] = useState<RecorderState>("idle");
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [silenceCountdown, setSilenceCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // hark + timers
  const harkRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // re-arm guard: require fresh speech after each (re)start/processing
  const hadSpeechSinceRestartRef = useRef<boolean>(false);

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

  const startMediaRecorder = useCallback((stream: MediaStream) => {
    const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/wav";
    const mr = new MediaRecorder(stream, { mimeType: mime });
    mediaRecorderRef.current = mr;
    audioChunksRef.current = [];
    mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
    mr.start(250); // ensure chunks exist when we stop
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
    clearTimers(); // prevent stale countdowns from firing mid-process

    const blob = await stopRecorderAndGetBlob();
    if (!blob) {
      setError("No recording data");
      setState("error");
      return;
    }
    setState("processing");
    try {
      const ext = blob.type.includes("webm") ? "webm" : "wav";
      const fd = new FormData();
      fd.append("audio", blob, `rec-${Date.now()}.${ext}`);
      const res = await fetch("/api/v1/form/transcribe", { method: "POST", body: fd });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const t = data?.data?.transcript ?? data?.transcript;
      if (!t) throw new Error("No transcript");
      onTranscript(t);

      if (isAutoMode && streamRef.current) {
        // re-arm: require new speech for next turn
        hadSpeechSinceRestartRef.current = false;
        audioChunksRef.current = [];
        startMediaRecorder(streamRef.current);
        setSilenceCountdown(0);
        setState("listening");
      } else {
        setState("idle");
      }
    } catch (e: any) {
      setError(e?.message || "Process failed");
      setState("error");
    }
  }, [isAutoMode, onTranscript, startMediaRecorder, stopRecorderAndGetBlob, clearTimers]);

  const startRecording = useCallback(async () => {
    setError(null);

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    streamRef.current = stream;

    // Start MediaRecorder
    startMediaRecorder(stream);

    // Init hark
    const harker = (hark as any)(stream, {
      interval: 100,   // 100ms checks
      threshold: -65,  // dB; lower (-70/-75) = more sensitive
      play: false,
    });
    harkRef.current = harker;

    // volume (dB ~[-100..0]) → [0..1] for UI
    harker.on("volume_change", (dB: number) => {
      const normalized = Math.min(1, Math.max(0, (dB + 100) / 100));
      setAudioLevel(normalized);
    });

    harker.on("speaking", () => {
      clearTimers(); // cancel any pending silence from a previous segment
      hadSpeechSinceRestartRef.current = true; // fresh speech observed
      if (state !== "speaking") setState("speaking");
    });

    harker.on("stopped_speaking", () => {
      // don’t arm while processing, and require fresh speech since restart
      if (state === "processing") return;
      if (!hadSpeechSinceRestartRef.current) return;

      if (state !== "listening") setState("listening");

      // start visual countdown
      setSilenceCountdown(Math.round(silenceDurationMs / 1000));
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = setInterval(() => {
        setSilenceCountdown((s) => {
          const next = Math.max(0, s - 1);
          if (next === 0 && countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          return next;
        });
      }, 1000);

      // schedule auto-process
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        if (
          hadSpeechSinceRestartRef.current &&
          mediaRecorderRef.current?.state === "recording"
        ) {
          processNow();
        }
      }, silenceDurationMs);
    });

    // fresh cycle: require new speech
    hadSpeechSinceRestartRef.current = false;
    setSilenceCountdown(0);
    setState("listening");
  }, [clearTimers, processNow, silenceDurationMs, startMediaRecorder, state]);

  const stopRecording = useCallback(() => {
    // stop hark
    if (harkRef.current) {
      try { harkRef.current.stop(); } catch {}
      harkRef.current = null;
    }

    // timers
    clearTimers();
    setSilenceCountdown(0);

    // stop media recorder
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      try { mr.stop(); } catch {}
    }
    mediaRecorderRef.current = null;

    // stop tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => { try { t.stop(); } catch {} });
      streamRef.current = null;
    }

    setState("idle");
  }, [clearTimers]);

  const startAutoMode = useCallback(async () => {
    setIsAutoMode(true);
    await startRecording();
  }, [startRecording]);

  const stopAutoMode = useCallback(() => {
    setIsAutoMode(false);
    stopRecording();
  }, [stopRecording]);

  const toggleAutoMode = useCallback(async () => {
    if (isAutoMode) stopAutoMode(); else await startAutoMode();
  }, [isAutoMode, startAutoMode, stopAutoMode]);

  const manualStop = useCallback(async () => {
    if (isListening) await processNow();
  }, [isListening, processNow]);

  const clearError = useCallback(() => {
    setError(null);
    if (state === "error") setState("idle");
  }, [state]);

  useEffect(() => () => stopRecording(), [stopRecording]);

  return {
    state,
    isAutoMode,
    isListening,
    isSpeaking,
    isProcessing,
    audioLevel,
    silenceCountdown,
    startAutoMode,
    stopAutoMode,
    toggleAutoMode,
    manualStop,
    error,
    clearError,
  };
}
