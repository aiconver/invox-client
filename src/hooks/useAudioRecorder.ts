"use client";

import * as React from "react";

/**
 * MediaRecorder hook:
 * - start(): asks for mic, starts recording
 * - stop(): stops and resolves when final blob is ready
 * - recordedBlob: latest blob (null if none)
 * - listening: recording state
 * - error: last error string (if any)
 */
export function useRecorder() {
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<BlobPart[]>([]);
  const streamRef = React.useRef<MediaStream | null>(null);

  const [listening, setListening] = React.useState(false);
  const [recordedBlob, setRecordedBlob] = React.useState<Blob | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const start = React.useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mr = new MediaRecorder(stream);
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        setRecordedBlob(blob);
        // stop all tracks
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      mediaRecorderRef.current = mr;
      mr.start();
      setListening(true);
    } catch (e: any) {
      setError(e?.message ?? "Failed to start recording.");
      setListening(false);
    }
  }, []);

  const stop = React.useCallback(async (): Promise<Blob | null> => {
    try {
      const mr = mediaRecorderRef.current;
      if (!mr) return recordedBlob;

      if (mr.state !== "inactive") {
        await new Promise<void>((resolve) => {
          mr.addEventListener("stop", () => resolve(), { once: true });
          mr.stop();
        });
      }
      setListening(false);
      return new Blob(chunksRef.current, { type: mr?.mimeType || "audio/webm" });
    } catch (e: any) {
      setError(e?.message ?? "Failed to stop recording.");
      setListening(false);
      return recordedBlob;
    }
  }, [recordedBlob]);

  return {
    listening,
    recordedBlob,
    error,
    start,
    stop,
  };
}
