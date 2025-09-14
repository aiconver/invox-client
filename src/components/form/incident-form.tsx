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

  // bubble current values to parent so iterative fill preserves user edits
  onChange?: (values: Record<string, any>) => void;
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

/** ---------- Component ---------- */
export default function IncidentForm({
  title = "Incident Report",
  fields,
  values,
  patch,
  onMissingFields,
  onSubmit,
  onChange,
}: DynamicFormProps) {
  const schema = useMemo(() => buildSchema(fields), [fields]);
  const defaults = useMemo(
    () => mergeValues(fields, values, patch ?? undefined),
    [fields, values, patch]
  );

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
      <div className="px-4 py-3 border-b bg-background/80 font-semibold">{title}</div>

      <div className="flex-1 min-h-0 p-4">
        <ScrollArea className="h-full rounded-lg">
          <form id="invox-form" className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
            {fields.map((f) => {
              const err = (form.formState.errors as any)[f.id]?.message as string | undefined;

              return (
                <div className="grid gap-1.5" key={f.id}>
                  <Label className="text-sm">
                    {f.label} {f.required && <span className="text-destructive">*</span>}
                  </Label>

                  {f.type === "textarea" ? (
                    <Textarea
                      placeholder={f.placeholder}
                      className="min-h-24"
                      {...form.register(f.id)}
                    />
                  ) : f.type === "enum" ? (
                    <select
                      className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none"
                      defaultValue={(defaults[f.id] ?? "") as any}
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
                      type="date"
                      placeholder={f.placeholder}
                      {...form.register(f.id)}
                      className={err ? "border-destructive" : ""}
                    />
                  ) : f.type === "number" ? (
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder={f.placeholder}
                      {...form.register(f.id, { valueAsNumber: true })}
                      className={err ? "border-destructive" : ""}
                    />
                  ) : (
                    <Input
                      placeholder={f.placeholder}
                      {...form.register(f.id)}
                      className={err ? "border-destructive" : ""}
                    />
                  )}

                  {err && <p className="text-xs text-destructive">{err}</p>}
                </div>
              );
            })}
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
