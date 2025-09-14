"use client";

import * as React from "react";
import { MdMic, MdMicOff, MdSend } from "react-icons/md";
import { Button } from "@/components/ui/button";

type Props = {
  listening: boolean;
  processing: boolean;
  isFilling?: boolean;
  recordedBlob?: Blob | null;
  onStart: () => void;
  onStop: () => void;
  onProcess: () => void;
};

export function RecorderControls({
  listening,
  processing,
  isFilling,
  recordedBlob,
  onStart,
  onStop,
  onProcess,
}: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b bg-background/80">
      <div className="inline-flex items-center gap-2 font-semibold">
        {listening ? (
          <MdMic className="h-4 w-4 text-emerald-600" />
        ) : (
          <MdMicOff className="h-4 w-4 text-muted-foreground" />
        )}
        Assistant
        {recordedBlob && (
          <span className="ml-2 text-xs text-muted-foreground">
            recorded ~{Math.max(1, Math.round(recordedBlob.size / 1024))} KB
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant={listening ? "secondary" : "default"}
          size="sm"
          onClick={onStart}
          disabled={listening || processing}
          className="gap-2"
        >
          <MdMic /> Start
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={onStop}
          disabled={!listening || processing}
          className="gap-2"
        >
          <MdMicOff /> Stop
        </Button>

        <Button
          size="sm"
          onClick={onProcess}
          disabled={processing || isFilling}
          className="gap-2"
        >
          <MdSend /> {processing ? "Processing..." : isFilling ? "Filling..." : "Process"}
        </Button>
      </div>
    </div>
  );
}
