
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

export type RecorderState = "idle" | "recording" | "processing" | "error";

export type RecorderControlsProps = {
  state: RecorderState;
  audioLevel: number; // 0..1
  isProcessing: boolean;
  error: string | null;
  selectedLang: string;
  setSelectedLang: (lang: string) => void;
  onStart: () => Promise<void>;
  onStopAndProcess: () => Promise<void>;
  onClearError: () => void;
};

export default function RecorderControls({
  state,
  audioLevel,
  isProcessing,
  error,
  selectedLang,
  setSelectedLang,
  onStart,
  onStopAndProcess,
  onClearError,
}: RecorderControlsProps) {
  const canStart = state === "idle" || state === "error";
  const canStopAndProcess = state === "recording";
  const isRecording = state === "recording";

  // Generate waveform bars based on audio level
  const bars = 40;
  const waveformBars = Array.from({ length: bars }, (_, i) => {
    const position = i / bars;
    const wave = Math.sin(position * Math.PI * 4 + Date.now() / 200);
    const height = isRecording ? (0.3 + audioLevel * 0.7) * (0.5 + wave * 0.5) : 0.1;
    return height;
  });

  return (
    <div className="border-t bg-gradient-to-b from-background to-muted/20">
      <div className="p-4 space-y-4">
        {/* Compact Control Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Language Selection */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground mr-1">
              Language:
            </span>
            <Button
              variant={selectedLang === "en" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLang("en")}
              className="h-8 px-3"
            >
              English
            </Button>
            <Button
              variant={selectedLang === "de" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLang("de")}
              className="h-8 px-3"
            >
              German
            </Button>
          </div>

          {/* Recording Button */}
          {!isRecording ? (
            <Button
              onClick={onStart}
              disabled={!canStart || isProcessing}
              size="sm"
              className="gap-2 h-8 shadow-md hover:shadow-lg transition-all"
            >
              <Mic className="w-4 h-4" />
              Start Recording
            </Button>
          ) : (
            <Button
              onClick={onStopAndProcess}
              disabled={!canStopAndProcess}
              variant="destructive"
              size="sm"
              className="gap-2 h-8 shadow-md hover:shadow-lg transition-all"
            >
              <MicOff className="w-4 h-4" />
              Stop Recording
            </Button>
          )}
        </div>

        {/* Compact Waveform Visualization */}
        <div className="relative h-16 bg-muted/30 rounded-lg overflow-hidden border border-border/50">
          <div className="absolute inset-0 flex items-center justify-center gap-0.5 px-2">
            {waveformBars.map((height, i) => (
              <div
                key={i}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  isRecording
                    ? "bg-gradient-to-t from-primary to-primary/60"
                    : "bg-muted-foreground/20"
                }`}
                style={{
                  height: `${height * 100}%`,
                  minHeight: "2px",
                }}
              />
            ))}
          </div>
          
          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-red-600">REC</span>
            </div>
          )}
          
          {/* Processing State */}
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 pb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="text-red-800 text-xs font-medium mb-1">Error</div>
                <div className="text-red-600 text-xs">{error}</div>
              </div>
              <Button
                onClick={onClearError}
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-red-700 hover:bg-red-100"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}