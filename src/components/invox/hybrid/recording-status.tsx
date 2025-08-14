// src/components/hybrid/RecordingStatus.tsx
import { Button } from "@/components/ui/button";
import { Loader2, Mic, MicOff } from "lucide-react";

type Props = {
  isRecording: boolean;
  isListening: boolean;
  isProcessing: boolean;
  hint?: string;
  onToggle: () => void;
  error?: string | null;
  processingError?: string | null;
};

export function RecordingStatus({
  isRecording,
  isListening,
  isProcessing,
  hint = "3s silence = auto-process",
  onToggle,
  error,
  processingError,
}: Props) {
  return (
    <div className="bg-white rounded-lg p-4 shadow border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isRecording ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <Mic className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium">
                {isListening ? "🎤 Speaking detected..." : "⏸️ Listening for speech..."}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <MicOff className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">Recording stopped</span>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center gap-2 ml-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-blue-600">Processing audio...</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {isRecording ? hint : "Click to start"}
          </span>
          <Button onClick={onToggle} variant={isRecording ? "destructive" : "default"} size="sm">
            {isRecording ? "Stop Recording" : "Start Recording"}
          </Button>
        </div>
      </div>

      {(error || processingError) && (
        <div className="mt-2 p-2 bg-red-50 rounded text-red-700 text-sm">
          <strong>Error:</strong> {error || processingError}
          <div className="mt-1 text-xs">
            • Check microphone permission<br />
            • Click the mic icon in the browser’s address bar<br />
            • Close other apps using the microphone<br />
            • Refresh and click “Allow”
          </div>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        💡 Tip: Speak clearly, then pause for 3 seconds to auto‑fill the form
      </div>
    </div>
  );
}
