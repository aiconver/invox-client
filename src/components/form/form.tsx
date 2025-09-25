"use client";

import * as React from "react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

/** ---------- Types ---------- */
export type DynFieldType = "text" | "textarea" | "date" | "number" | "enum";

export type DynField = {
  id: string;
  label: string;
  type: DynFieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  pattern?: string;
};

type DynamicFormProps = {
  title?: string;
  fields: DynField[];
  values?: Record<string, any>;
  patch?: Record<string, any> | null;
  onMissingFields?: (missing: string[]) => void;
  onSubmit?: (values: Record<string, any>) => void;
  onChange?: (values: Record<string, any>) => void;
  processingState?: string;
};

/** ---------- Helpers ---------- */
function buildZodForField(f: DynField) {
  const required = !!f.required;
  switch (f.type) {
    case "date": {
      const base = z
        .string({ required_error: "Date is required" })
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
      return required ? base : base.optional().or(z.literal("")).transform((v) => v || undefined);
    }
    case "number": {
      const base = z.coerce.number({ invalid_type_error: "Enter a number" });
      return required ? base : base.optional();
    }
    case "enum": {
      const opts = (f.options ?? []).filter(Boolean);
      const base = opts.length ? z.enum(opts as [string, ...string[]]) : z.string();
      return required ? base : base.optional().or(z.literal("")).transform((v) => v || undefined);
    }
    case "text":
    case "textarea":
    default: {
      let base = z.string();
      if (f.pattern) {
        try {
          base = base.regex(new RegExp(f.pattern), "Invalid format");
        } catch {
          // ignore invalid regex patterns
        }
      }
      return required ? base.min(1, "This field is required") : base.optional();
    }
  }
}

function buildSchema(fields: DynField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) shape[f.id] = buildZodForField(f);
  return z.object(shape);
}

function defaultForType(t: DynFieldType) {
  switch (t) {
    case "number":
      return undefined;
    default:
      return "";
  }
}

function mergeValues(fields: DynField[], base?: Record<string, any>, patch?: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const f of fields) {
    const b = base?.[f.id];
    const p = patch?.[f.id];
    out[f.id] = p ?? b ?? defaultForType(f.type);
  }
  return out;
}

function computeMissingRequired(fields: DynField[], values: Record<string, any>) {
  const missing: string[] = [];
  for (const f of fields) {
    if (!f.required) continue;
    const v = values[f.id];
    const isEmpty =
      v === undefined || v === null || (typeof v === "string" && v.trim() === "");
    if (isEmpty) missing.push(f.id);
  }
  return missing;
}

/** ---------- Tiny loader UI ---------- */
function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="flex-1 min-h-0">
      <div
        className="h-full w-full flex items-center justify-center p-8"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="w-full max-w-xl">
          <div className="flex items-center gap-3 mb-6">
            {/* spinner */}
            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{label}</span>
              <span className="ml-2 animate-pulse">Please wait…</span>
            </div>
          </div>

          {/* Skeleton stack resembling form fields */}
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-40 rounded bg-muted/60" />
                <div className="h-9 w-full rounded bg-muted/50" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** ---------- Component ---------- */
export default function Form({
  title = "Report Overview",
  fields,
  values,
  patch,
  onMissingFields,
  onSubmit,
  onChange,
  processingState,
}: DynamicFormProps) {
  const schema = useMemo(() => buildSchema(fields), [fields]);
  const defaults = useMemo(() => mergeValues(fields, values, patch ?? undefined), [fields, values, patch]);

  const form = useForm<Record<string, any>>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
    mode: "onChange",
  });

  // Reset when defaults change (e.g., new patch from AI)
  React.useEffect(() => {
    form.reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(defaults)]);

  // Bubble current values upward + missing required (deduped)
  const watchAll = form.watch();
  const lastMissingRef = React.useRef<string>("");

  React.useEffect(() => {
    onChange?.(watchAll);

    const missing = computeMissingRequired(fields, watchAll);
    const key = missing.slice().sort().join("|"); // stable set key

    if (key !== lastMissingRef.current) {
      lastMissingRef.current = key;
      onMissingFields?.(missing);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, JSON.stringify(watchAll)]);

  const submit = (v: Record<string, any>) => onSubmit?.(v);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-background/80 font-semibold">
        {title}
      </div>

      {processingState === "" ? (
        <>
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <form
                id="invox-form"
                className="grid gap-4 px-4 py-4"
                onSubmit={form.handleSubmit(submit)}
              >
                {fields.map((f) => {
                  const err = (form.formState.errors as any)[f.id]?.message as string | undefined;
                  const inputId = `fld-${f.id}`;

                  return (
                    <div className="grid gap-1.5 min-w-0" key={f.id}>
                      <Label className="text-sm" htmlFor={inputId}>
                        {f.label} {f.required && <span className="text-destructive">*</span>}
                      </Label>

                      {f.type === "textarea" ? (
                        <Textarea
                          id={inputId}
                          placeholder={f.placeholder}
                          className="min-h-24"
                          aria-required={!!f.required}
                          aria-invalid={!!err}
                          {...form.register(f.id)}
                        />
                      ) : f.type === "enum" ? (
                        <select
                          id={inputId}
                          className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none"
                          defaultValue={(defaults[f.id] ?? "") as any}
                          aria-required={!!f.required}
                          aria-invalid={!!err}
                          {...form.register(f.id)}
                        >
                          <option value="">{f.placeholder ?? "Select…"}</option>
                          {(f.options ?? []).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : f.type === "date" ? (
                        <Input
                          id={inputId}
                          type="date"
                          placeholder={f.placeholder}
                          autoComplete="off"
                          aria-required={!!f.required}
                          aria-invalid={!!err}
                          {...form.register(f.id)}
                          className={err ? "border-destructive" : ""}
                        />
                      ) : f.type === "number" ? (
                        <Input
                          id={inputId}
                          type="number"
                          inputMode="decimal"
                          placeholder={f.placeholder}
                          aria-required={!!f.required}
                          aria-invalid={!!err}
                          {...form.register(f.id, { valueAsNumber: true })}
                          className={err ? "border-destructive" : ""}
                        />
                      ) : (
                        <Input
                          id={inputId}
                          placeholder={f.placeholder}
                          autoComplete={f.id === "reporterName" ? "name" : "off"}
                          aria-required={!!f.required}
                          aria-invalid={!!err}
                          {...form.register(f.id)}
                          className={err ? "border-destructive" : ""}
                        />
                      )}

                      {err && <p className="text-xs text-destructive">{err}</p>}
                    </div>
                  );
                })}

                {/* Spacer so the sticky footer never overlaps the last field */}
                <div className="h-20" aria-hidden />
              </form>
            </ScrollArea>
          </div>

          <div className="sticky bottom-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="px-4 py-3 flex items-center justify-end">
              <Button
                type="submit"
                form="invox-form"
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Submit Form
              </Button>
            </div>
          </div>
        </>
      ) : processingState === "transcribing" ? (
        <LoadingPanel label="Transcribing…" />
      ) : (
        <LoadingPanel label="Filling…" />
      )}
    </div>
  );
}
