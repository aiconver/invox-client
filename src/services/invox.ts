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
