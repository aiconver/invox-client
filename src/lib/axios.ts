import config from "@/config/combined-config";
import axios, { AxiosHeaders } from "axios";
import { AuthContextProps } from "react-oidc-context";

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
    // Ensure we have an AxiosHeaders instance, then set the header
    (config.headers ??= new AxiosHeaders()).set("Authorization", `Bearer ${token}`);
  }
  return config;
});

export { apiClient };
