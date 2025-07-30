import { apiClient } from "@/lib/axios";

export const getSubmittedForms = async () => {
  const response = await apiClient.post("/rpc", {
    jsonrpc: "2.0",
    method: "form.get",
    params: {},
    id: 1,
  });
  return response.data.result;
};

export const getSubmittedFormById = async (id: string) => {
  const response = await apiClient.post("/rpc", {
    jsonrpc: "2.0",
    method: "form.get",
    params: { id },
    id: 1,
  });
  return response.data.result;
};

export const submitForm = async ({
  templateId,
  answers,
}: {
  templateId: string;
  answers: Record<string, string>;
}): Promise<{ message: string; formId: string }> => {
  const response = await apiClient.post("/rpc", {
    jsonrpc: "2.0",
    method: "form.add",
    params: { formData: { templateId, answers } },
    id: 1,
  });

  if (response.data?.error) throw new Error(response.data.error.message);
  return response.data.result;
};
