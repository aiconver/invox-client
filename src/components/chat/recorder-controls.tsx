"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { MdPlayArrow, MdStop } from "react-icons/md";

export type RecorderState = "idle" | "recording" | "processing" | "error";

export type RecorderControlsProps = {
  state: RecorderState;
  audioLevel: number;               // 0..1
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

  return (
    <div className="border-t bg-background/95">
      <div className="p-4 flex items-center justify-between">
        <div className="text-sm">
          State: <b>{state}</b> · Audio: <b>{(audioLevel * 100).toFixed(1)}%</b>
        </div>
        <div className="flex gap-3 items-center">
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="en">English</option>
            <option value="de">German</option>
          </select>

          <Button onClick={onStart} disabled={!canStart || isProcessing} className="gap-2">
            <MdPlayArrow /> Start
          </Button>

          <Button
            onClick={onStopAndProcess}
            disabled={!canStopAndProcess}
            variant="outline"
            className="gap-2"
          >
            <MdStop /> Stop &amp; Process
          </Button>
        </div>
      </div>

      {error && (
        <div className="px-4 pb-4">
          <div className="text-red-600 text-sm">Error: {error}</div>
          <Button onClick={onClearError} variant="outline" size="sm" className="mt-2">
            Dismiss
          </Button>
        </div>
      )}
    </div>
  );
}
