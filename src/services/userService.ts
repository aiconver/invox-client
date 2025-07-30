import { apiClient } from "@/lib/axios";
import { UserFormInput } from "@/types/user";

export const getAllUsers = async (): Promise<
	{ id: string; username: string; email: string; firstName: string; lastName: string; role: string }[]
> => {
	const response = await apiClient.post("/rpc", {
		jsonrpc: "2.0",
		method: "user.get",
		params: {},
		id: 1,
	});
	return response.data.result;
};

export const deleteUserById = async (id: string): Promise<void> => {
	await apiClient.post("/rpc", {
		jsonrpc: "2.0",
		method: "user.delete",
		params: { id },
		id: 1,
	});
};

export const addUser = async (data: any): Promise<void> => {
  await apiClient.post("/rpc", {
    jsonrpc: "2.0",
    method: "user.add",
    params: data,
    id: 1,
  });
};

export const getUserById = async (id: string): Promise<any> => {
  const response = await apiClient.post("/rpc", {
    jsonrpc: "2.0",
    method: "user.get",
    params: { id },
    id: 1,
  });
  return response.data.result;
};

export const updateUser = async (
  id: string,
  updates: UserFormInput
): Promise<void> => {
  await apiClient.post("/rpc", {
    jsonrpc: "2.0",
    method: "user.update",
    params: { id, ...updates },
    id: 1,
  });
};