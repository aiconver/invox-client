
import { frontendEnvSchema } from "./envSchema";

const parsed = frontendEnvSchema.safeParse(import.meta.env);
if (!parsed.success) {
  console.error("❌ Invalid VITE_ environment variables in frontend:");
  console.error(parsed.error.format());
  throw new Error("Invalid frontend .env configuration");
}

const config = {
  keycloakRealm: parsed.data.VITE_APP_KEYCLOAK_REALM,
  keycloakClientId: parsed.data.VITE_APP_KEYCLOAK_CLIENTID,
  keycloakUrl: parsed.data.VITE_APP_KEYCLOAK_URL,
  apiBaseUrl: parsed.data.VITE_APP_API_BASE_URL,
};

export default config;
