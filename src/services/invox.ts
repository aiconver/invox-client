// src/services/invox.ts
import { apiClient } from "@/lib/axios";

export const testPing = async (): Promise<string> => {
	const response = await apiClient.post("/rpc", {
		jsonrpc: "2.0",
		method: "ping",
		params: {},
		id: 1,
	});
	return response.data.result;
};

export const getFormTemplate = async (id: string) => {
	const response = await apiClient.post("/rpc", {
		jsonrpc: "2.0",
		method: "formTemplate.get",
		params: { id },
		id: 1,
	});

	const form = response.data?.result;
	if (!form || typeof form !== "object") {
		throw new Error("Form not found or invalid response");
	}
	return form;
};

export const getFormDepartments = async (): Promise<
	{ name: string; formCount: number }[]
> => {
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

export const processForm = async (formTemplateId: string, audioBlob: Blob) => {
	const arrayBuffer = await audioBlob.arrayBuffer();
	const uint8Array = new Uint8Array(arrayBuffer);
	const base64Audio = btoa(String.fromCharCode(...uint8Array));

	const response = await apiClient.post("/rpc", {
		jsonrpc: "2.0",
		method: "form.processForm",
		params: {
			formTemplateId,
			audio: base64Audio,
		},
		id: 1,
	});

	const result = response.data?.result;
	if (!result || typeof result !== "object") {
		throw new Error("Invalid response from form.processForm");
	}

	return result as {
		transcript: string;
		extracted: {
			message: string;
			filledTemplate: Record<string, any>;
			confidence: number;
			missingFields: string[];
			warnings: string[];
		};
	};
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
    params: {
      formData: {
        templateId,
        answers,
      },
    },
    id: 1,
  });

  if (response.data?.error) throw new Error(response.data.error.message);
  return response.data.result;
};


// services/invox.ts
export const getSubmittedForms = async (): Promise<
	{ id: string; templateId: string; answers: Record<string, any>; createdAt: string }[]
> => {
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
	return response.data?.result;
};