import { apiClient } from "@/lib/axios";

type FormFieldDefinition = {
  type: string;
  required: boolean;
};

export const getFormTemplate = async (id: string) => {
  const response = await apiClient.post("/rpc", {
    jsonrpc: "2.0",
    method: "formTemplate.get",
    params: { id },
    id: 1,
  });
  const result = response.data?.result;
  if (!result || typeof result !== "object") {
    throw new Error("Form not found or invalid response");
  }
  return result as {
    id: string;
    name: string;
    department: string;
    processingType: string;
    structure: Record<string, FormFieldDefinition>;
  };
};

export const getFormDepartments = async () => {
  const response = await apiClient.post("/rpc", {
    jsonrpc: "2.0",
    method: "formTemplate.departmentsWithTemplateCount",
    params: {},
    id: 1,
  });

  const raw = response.data?.result;
  if (!Array.isArray(raw)) {
    throw new Error("Unexpected response: no result array in formTemplate.getDepartments");
  }

  return raw.map((item) => ({
    name: item.department,
    formCount: Number(item.count),
  }));
};

export const getFormsByDepartment = async (department: string) => {
  const response = await apiClient.post("/rpc", {
    jsonrpc: "2.0",
    method: "formTemplate.get",
    params: { department },
    id: 1,
  });

  const raw = response.data?.result;
  if (!Array.isArray(raw)) {
    throw new Error("Unexpected response: no result array");
  }

  return raw as { id: string; name: string }[];
};

export const addFormTemplate = async ({
  name,
  department,
  processingType,
  structure,
}: {
  name: string;
  department: string;
  processingType: string;
  structure: Record<string, any>;
}): Promise<{ message: string; templateId: string }> => {
  const response = await apiClient.post("/rpc", {
    jsonrpc: "2.0",
    method: "formTemplate.create",
    params: { name, department, processingType, structure },
    id: 1,
  });

  if (response.data?.error) throw new Error(response.data.error.message);
  return response.data.result;
};
