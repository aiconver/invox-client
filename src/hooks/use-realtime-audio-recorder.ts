// src/hooks/useRealtimeAudioRecorder.ts
import { useCallback, useEffect, useRef, useState } from "react";

type UseRealtimeAudioRecorderArgs = {
  onSilenceDetected: (audioBlob: Blob) => void;
  silenceThreshold?: number;   // ms of continued silence -> flush
  minRecordingTime?: number;   // ms minimum chunk duration
};

export function useRealtimeAudioRecorder({
  onSilenceDetected,
  silenceThreshold = 3000,
  minRecordingTime = 2000,
}: UseRealtimeAudioRecorderArgs) {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTime = useRef<number>(0);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrame = useRef<number | null>(null);
  const isRecordingRef = useRef<boolean>(false);

  const detectSpeech = useCallback(() => {
    if (!analyser.current || !isRecordingRef.current) return;

    const bufferLength = analyser.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    try {
      analyser.current.getByteFrequencyData(dataArray);

      // RMS + average thresholds tuned as in your original file.
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) sum += dataArray[i] * dataArray[i];
      const rms = Math.sqrt(sum / bufferLength);
      const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
      const isSpeaking = rms > 60 || average > 35;

      setIsListening(isSpeaking);

      if (isSpeaking) {
        if (silenceTimer.current) {
          clearTimeout(silenceTimer.current);
          silenceTimer.current = null;
        }
      } else if (!silenceTimer.current && isRecordingRef.current) {
        silenceTimer.current = setTimeout(() => {
          const dur = Date.now() - recordingStartTime.current;
          if (dur >= minRecordingTime && audioChunks.current.length > 0) {
            const audioBlob = new Blob(audioChunks.current, {
              type: mediaRecorder.current?.mimeType || "audio/webm",
            });
            onSilenceDetected(audioBlob);
            audioChunks.current = [];
            recordingStartTime.current = Date.now();
          }
          silenceTimer.current = null;
        }, silenceThreshold);
      }

      if (isRecordingRef.current) {
        animationFrame.current = requestAnimationFrame(detectSpeech);
      }
    } catch (e) {
      // no-op; keep the loop resilient
      console.error("detectSpeech error", e);
    }
  }, [onSilenceDetected, silenceThreshold, minRecordingTime]);

  const startRecording = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("getUserMedia is not supported in this browser");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      audioContext.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      if (audioContext.current.state === "suspended") {
        await audioContext.current.resume();
      }

      analyser.current = audioContext.current.createAnalyser();
      microphone.current = audioContext.current.createMediaStreamSource(stream);
      analyser.current.fftSize = 256;
      analyser.current.smoothingTimeConstant = 0.8;
      microphone.current.connect(analyser.current);

      const supported = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/wav",
      ];
      let selected = supported[0];
      for (const t of supported) {
        if (MediaRecorder.isTypeSupported(t)) {
          selected = t;
          break;
        }
      }

      mediaRecorder.current = new MediaRecorder(stream, { mimeType: selected });
      audioChunks.current = [];
      recordingStartTime.current = Date.now();

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };
      mediaRecorder.current.onerror = (e) =>
        setError("Recording failed: " + (e as any).error?.message || "");
      mediaRecorder.current.start(500); // 500ms slices

      setIsRecording(true);
      isRecordingRef.current = true;
      setError(null);

      setTimeout(() => detectSpeech(), 500);
    } catch (err) {
      setError("Failed to access microphone: " + (err as Error).message);
    }
  }, [detectSpeech]);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach((t) => t.stop());
    }
    if (silenceTimer.current) {
      clearTimeout(silenceTimer.current);
      silenceTimer.current = null;
    }
    if (audioContext.current && audioContext.current.state !== "closed") {
      audioContext.current.close();
    }
    setIsRecording(false);
    setIsListening(false);
  }, []);

  useEffect(() => stopRecording, [stopRecording]);

  return { isRecording, isListening, startRecording, stopRecording, error };
}
