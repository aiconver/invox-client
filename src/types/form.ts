// Field values returned by the model
export type FilledField = {
  value: string | number | null;
  confidence?: number;
  changed?: boolean;
  previousValue?: string | number | null;
  source: "ai" | "user";
  evidence?: { transcriptSnippet?: string; startChar?: number; endChar?: number };
  reason?: {
    type: "CONTRADICTED";
    message: string;
  };
};

export type DynFieldType = "text" | "textarea" | "date" | "number" | "enum";

export type DynField = {
  id: string;
  label: string;
  type: DynFieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
};

export type FewShotExample = {
  id: string;
  text: string;
  expected: Record<string, string | number | null>;
};

// ----- service payloads -----

export type TranscribeResult = {
  transcript: string;
  language?: string;
  durationInSeconds?: number;
};

export type FillTemplateInput = {
  templateId: string;
  transcript?: string;
  oldTranscript?: string;
  newTranscript?: string;
  fields: DynField[];
  lang: string;
  currentValues?: Record<
    string,
    { value: string | number | null; source?: "user" | "ai"; locked?: boolean }
  >;
  approach?: "singleLlmAllField";
};

export type FillTemplateResult = {
  chatResponse: null;
  filled: Record<string, FilledField>;
  model: string;
  transcript?: { old: string; new: string; combined: string };
};

export type FieldMetadata = Pick<
  FilledField,
  "source" | "confidence" | "changed" | "evidence" | "reason"
>;