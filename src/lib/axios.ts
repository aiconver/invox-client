import { Trans } from "react-i18next";
import axios from "axios";
import type { AuthContextProps } from "react-oidc-context";
import config from "@/config/combined-config";

const apiClient = axios.create({
	baseURL: config.apiBaseUrl,
	maxBodyLength: 50 * 1024 * 1024, // 50MB
  	maxContentLength: 50 * 1024 * 1024, // 50MB
});

let latestAuth: AuthContextProps | null = null;

export const setAuthContext = (auth: AuthContextProps) => {
	latestAuth = auth;
};

apiClient.interceptors.request.use((config) => {
	const token = latestAuth?.user?.access_token;
	if (token) {
		config.headers = {
			...(config.headers || {}),
			Authorization: `Bearer ${token}`,
		};
	}
	return config;
});

export { apiClient };
