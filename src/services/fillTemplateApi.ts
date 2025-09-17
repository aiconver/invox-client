import { apiClient } from "@/lib/axios";

export type FilledField = {
  value: string | number | null;
  confidence?: number;
  changed?: boolean;
  previousValue?: string | number | null;
  source: "ai" | "user";
  evidence?: { transcriptSnippet?: string; startChar?: number; endChar?: number };
};

type DynFieldType = "text" | "textarea" | "date" | "number" | "enum";

export type DynField = {
  id: string;
  label: string;
  type: DynFieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
};

type FewShotExample = {
  id: string;
  text: string;
  expected: Record<string, string | number | null>;
};

export async function fillTemplateApi(input: {
  templateId: string;
  transcript?: string;         // back-compat
  oldTranscript?: string;      // new
  newTranscript?: string;      // new
  fields: DynField[];
  fewShots: FewShotExample[];
  currentValues?: Record<
    string,
    { value: string | number | null; source?: "user" | "ai"; locked?: boolean }
  >;
  options?: {
    mode?: "incremental" | "fresh";
    preserveUserEdits?: boolean;
    fillOnlyEmpty?: boolean;
    returnEvidence?: boolean;
  };
}) {
  try {
    const res = await apiClient.post("/api/v1/form/fill", input);

    if (!res.data || res.data.success === false) {
      throw new Error(res.data?.error || "Unknown API error");
    }

    return res.data.data as {
      filled: Record<string, FilledField>;
      model: string;
      transcript?: { old: string; new: string; combined: string };
    };
  } catch (err: any) {
    const message =
      err.response?.data?.error ||
      err.message ||
      "Request failed";
    throw new Error(message);
  }
}
