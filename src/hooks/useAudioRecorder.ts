"use client";

import * as React from "react";

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = React.useState(false);
  const [blob, setBlob] = React.useState<Blob | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<BlobPart[]>([]);
  const streamRef = React.useRef<MediaStream | null>(null);

  const start = React.useCallback(async () => {
    try {
      setError(null);
      setBlob(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mr = new MediaRecorder(stream);
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const out = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        setBlob(out);
        // stop all tracks
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true);
    } catch (e: any) {
      setError(e?.message ?? "Failed to start recording.");
    }
  }, []);

  const stop = React.useCallback(async () => {
    try {
      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== "inactive") {
        await new Promise<void>((resolve) => {
          mr.addEventListener("stop", () => resolve(), { once: true });
          mr.stop();
        });
      }
      setIsRecording(false);
    } catch (e: any) {
      setError(e?.message ?? "Failed to stop recording.");
    }
  }, []);

  const reset = React.useCallback(() => {
    setBlob(null);
    chunksRef.current = [];
    setError(null);
  }, []);

  return {
    isRecording,
    blob,
    error,
    start,
    stop,
    reset,
    // internal refs (rarely needed from outside)
    _mediaRecorderRef: mediaRecorderRef,
  };
}
