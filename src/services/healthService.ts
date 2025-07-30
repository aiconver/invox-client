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
