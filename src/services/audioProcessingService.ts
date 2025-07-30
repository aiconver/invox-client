import { apiClient } from "@/lib/axios";

export interface ProcessedFormResult {
  transcript: string;
  extracted: {
    message: string;
    filledTemplate: Record<string, any>;
    confidence: number;
    missingFields: string[];
    warnings: string[];
  };
}

export const processForm = async (
  formTemplateId: string,
  audioBlob: Blob
): Promise<ProcessedFormResult> => {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

  const response = await apiClient.post("/rpc", {
    jsonrpc: "2.0",
    method: "form.processForm",
    params: { formTemplateId, audio: base64Audio },
    id: 1,
  });

  const result = response.data?.result;
  if (!result || typeof result !== "object") {
    throw new Error("Invalid response from form.processForm");
  }

  return result as ProcessedFormResult;
};
