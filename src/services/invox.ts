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

export const getFormTemplate = async ( id : string ) => {
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

	// No transformation needed, just return raw as-is
	return raw as { id: string; name: string }[];
};

