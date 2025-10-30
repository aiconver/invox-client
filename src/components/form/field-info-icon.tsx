
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { FieldMetadata } from "@/types/form";

export default function FieldInfoIcon({
  fieldId,
  metadata,
  hasValue,
}: {
  fieldId: string;
  metadata?: FieldMetadata;
  hasValue: boolean;
}) {
  if (!metadata || !hasValue) return null;

  const { confidence, source, evidence, changed, reason } = metadata;
  if (confidence === undefined && !source) return null;

  const confidenceDot = (conf?: number) => {
    if (conf === undefined) return "bg-muted-foreground";
    if (conf >= 0.8) return "bg-emerald-500 dark:bg-emerald-400";
    if (conf >= 0.5) return "bg-amber-500 dark:bg-amber-400";
    return "bg-rose-500 dark:bg-rose-400";
  };

  const confidenceLabel = (conf?: number) => {
    if (conf === undefined) return "Unknown";
    if (conf >= 0.8) return "High";
    if (conf >= 0.5) return "Medium";
    return "Low";
  };

  const sourceChip =
    source === "ai"
      ? "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] bg-blue-600 text-white dark:bg-blue-500"
      : "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] bg-violet-600 text-white dark:bg-violet-500";

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="ml-1.5 inline-flex text-foreground/70 hover:text-foreground transition-colors"
            aria-label={`Information for ${fieldId}`}
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>

        <TooltipContent
          side="right"
          align="end"
          className="max-w-xs bg-popover text-popover-foreground border border-border shadow-md rounded-md"
        >
          <div className="space-y-2 text-xs leading-relaxed">
            {/* Source */}
            {source && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Source:</span>
                <span className={sourceChip}>{source === "ai" ? "AI Generated" : "User Input"}</span>
              </div>
            )}

            {/* Confidence */}
            {confidence !== undefined && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Confidence:</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${confidenceDot(confidence)}`} />
                  <span>
                    {confidenceLabel(confidence)} ({Math.round(confidence * 100)}%)
                  </span>
                </span>
              </div>
            )}

            {/* Contradiction */}
            {reason?.type === "CONTRADICTED" && (
              <div className="pt-2 mt-2 border-t border-border space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Issue:</span>
                  <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] bg-destructive text-destructive-foreground">
                    Contradicted
                  </span>
                </div>
                {reason.message && (
                  <div className="opacity-80 italic break-words">
                    “{reason.message}”
                  </div>
                )}
              </div>
            )}

            {/* Changed */}
            {changed && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Status:</span>
                <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] bg-orange-500 text-white dark:bg-orange-400">
                  Recently updated
                </span>
              </div>
            )}

            {/* Evidence */}
            {evidence?.transcriptSnippet && (
              <div className="pt-2 mt-2 border-t border-border">
                <div className="font-semibold mb-1">Evidence:</div>
                <div className="opacity-80 italic whitespace-pre-wrap break-words">
                  “{evidence.transcriptSnippet}”
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
