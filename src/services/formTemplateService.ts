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

export const addFormTemplate = async (input: {
  name: string;
  department: string;
  processingType: string;
  structure: Record<string, any>;
  domainKnowledge?: string;
}): Promise<{ message: string; templateId: string }> => {  
  const response = await apiClient.post("/rpc", {
    jsonrpc: "2.0",
    method: "formTemplate.create",
    params: input,
    id: 1,
  });

  if (response.data?.error) throw new Error(response.data.error.message);
  return response.data.result;
}

export const updateFormTemplate = async (input: {
  id: string;
  name: string;
  department: string;
  processingType: string;
  structure: Record<string, any>;
  domainKnowledge?: string;
}): Promise<{ message: string; templateId: string }> => {
  const response = await apiClient.post("/rpc", {
    jsonrpc: "2.0",
    method: "formTemplate.update",
    params: input,
    id: 1,
  });

  if (response.data?.error) throw new Error(response.data.error.message);
  return response.data.result;
}


export const deleteFormTemplate = async (id: string): Promise<{ success: boolean }> => {
  const response = await apiClient.post("/rpc", {
    jsonrpc: "2.0",
    method: "formTemplate.delete",
    params: { id },
    id: 1,
  });

  if (response.data?.error) throw new Error(response.data.error.message);
  return response.data.result;
};


export const getAssignableUsers = async (formTemplateId: string) => {
  const response = await apiClient.post("/rpc", {
    jsonrpc: "2.0",
    method: "formTemplate.getAssignableUsers",
    params: { formTemplateId },
    id: 1,
  })
  return response.data.result
}

export const assignUsers = async (formTemplateId: string, userIds: string[]) => {
  const response = await apiClient.post("/rpc", {
    jsonrpc: "2.0",
    method: "formTemplate.assignUsers",
    params: { formTemplateId, userIds },
    id: 1,
  })
  if (response.data?.error) throw new Error(response.data.error.message)
  return response.data.result
}