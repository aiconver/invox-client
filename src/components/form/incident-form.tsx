import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormSchema, FormValues } from "./schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

type IncidentFormProps = {
  patch: Partial<FormValues> | null;
  onMissingFields?: (missing: (keyof FormValues)[]) => void;
  onSubmit?: (values: FormValues) => void;
};

export default function IncidentForm({ patch, onMissingFields, onSubmit }: IncidentFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      date: "",
      reporterName: "",
      title: "",
      description: "",
      affectedLine: "",
      correctiveAction: "",
    },
    mode: "onChange",
  });

  React.useEffect(() => {
    if (!patch) return;
    const next = { ...form.getValues(), ...patch } as FormValues;
    form.reset(next);
    onMissingFields?.(getMissing(next));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(patch)]);

  const submit = (v: FormValues) => onSubmit?.(v);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="px-4 py-3 border-b bg-background/80 font-semibold">Incident Report</div>

      <div className="flex-1 min-h-0 p-4">
        <ScrollArea className="h-full rounded-lg">
          <form id="invox-form" className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
            <div className="grid gap-1.5">
              <Label className="text-sm">Date of Report</Label>
              <Input type="date" {...form.register("date")} className={form.formState.errors.date ? "border-destructive" : ""} />
              {form.formState.errors.date && <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>}
            </div>

            <div className="grid gap-1.5">
              <Label className="text-sm">Name of Reporting Person</Label>
              <Input placeholder="John Smith" {...form.register("reporterName")} />
              {form.formState.errors.reporterName && <p className="text-xs text-destructive">{form.formState.errors.reporterName.message}</p>}
            </div>

            <div className="grid gap-1.5">
              <Label className="text-sm">Title or Summary of Issue</Label>
              <Input placeholder="Conveyor Belt Malfunction" {...form.register("title")} />
              {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
            </div>

            <div className="grid gap-1.5">
              <Label className="text-sm">Detailed Problem Description</Label>
              <Textarea className="min-h-28" placeholder="Describe what happened…" {...form.register("description")} />
              {form.formState.errors.description && <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>}
            </div>

            <div className="grid gap-1.5">
              <Label className="text-sm">Affected Machine or Production Line</Label>
              <Input placeholder="e.g., Conveyor Line 2" {...form.register("affectedLine")} className={form.formState.errors.affectedLine ? "border-destructive" : ""} />
              {form.formState.errors.affectedLine && <p className="text-xs text-destructive">{form.formState.errors.affectedLine.message}</p>}
            </div>

            <div className="grid gap-1.5">
              <Label className="text-sm">Describe the corrective action plan</Label>
              <Textarea className="min-h-24" placeholder="What will be done next?" {...form.register("correctiveAction")} />
              {form.formState.errors.correctiveAction && <p className="text-xs text-destructive">{form.formState.errors.correctiveAction.message}</p>}
            </div>
          </form>
        </ScrollArea>

        <div className="mt-3 flex items-center justify-end">
          <Button type="submit" form="invox-form" className="bg-emerald-600 text-white hover:bg-emerald-700">
            Submit Form
          </Button>
        </div>
      </div>
    </div>
  );
}

function getMissing(v: FormValues): (keyof FormValues)[] {
  const keys: (keyof FormValues)[] = ["date", "reporterName", "title", "description", "affectedLine", "correctiveAction"];
  return keys.filter((k) => !String(v[k] ?? "").trim());
}
