export type FilledField = {
  value: string | number | null;
  confidence?: number;
  changed?: boolean;
  previousValue?: string | number | null;
  source: "ai" | "user";
  evidence?: { transcriptSnippet?: string; startChar?: number; endChar?: number };
};

export async function fillTemplateApi(input: {
  templateId: string;
  transcript: string;
  fields: { id: string; label: string; type: "text" | "textarea" | "date" | "number" | "enum"; required?: boolean; options?: string[] }[];
  currentValues?: Record<string, { value: string | number | null; source?: "user" | "ai"; locked?: boolean }>;
  options?: { mode?: "incremental" | "fresh"; preserveUserEdits?: boolean; fillOnlyEmpty?: boolean; returnEvidence?: boolean };
}) {
  const res = await fetch("/api/v1/form/fill", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok || body?.success === false) {
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
  return body.data as { filled: Record<string, FilledField>; model: string };
}
