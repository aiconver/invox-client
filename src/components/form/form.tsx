"use client";

import * as React from "react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import DownloadBar from "./download-bar";
import FieldInfoIcon from "./field-info-icon";
import LoadingPanel from "./loading-panel";
import { computeMissingRequired, mergeValues } from "./utils";
import { Input } from "../ui/input";

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
  metadata?: Record<string, any>;
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

/** ---------- Component ---------- */
export default function Form({
  title = "Report Overview",
  fields,
  values,
  patch,
  metadata,
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

                  const fieldMeta = metadata?.[f.id];
                  const currentValue = watchAll[f.id];  // Get the current form value
                  const hasValue = currentValue !== null &&
                    currentValue !== undefined &&
                    currentValue !== "";  // Check if it's filled

                  return (
                    <div className="grid gap-1.5 min-w-0" key={f.id}>
                      <Label className="text-sm" htmlFor={inputId}>
                        {f.label} {f.required && <span className="text-destructive">*</span>}
                        {/* 🆕 Info icon */}
                        <FieldInfoIcon fieldId={f.id} metadata={fieldMeta} hasValue={hasValue} />
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

          <DownloadBar
            title={title}
            fields={fields.map(f => ({ id: f.id, label: f.label }))}
            values={watchAll}
          />
        </>
      ) : processingState === "transcribing" ? (
        <LoadingPanel label="Transcribing…" />
      ) : (
        <LoadingPanel label="Filling…" />
      )}
    </div>
  );
}
