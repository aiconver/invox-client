import { frontendEnvSchema } from "./env-schema";

const rawEnv = {
	VITE_APP_KEYCLOAK_REALM: import.meta.env.VITE_APP_KEYCLOAK_REALM,
	VITE_APP_KEYCLOAK_CLIENTID: import.meta.env.VITE_APP_KEYCLOAK_CLIENTID,
	VITE_APP_KEYCLOAK_URL: import.meta.env.VITE_APP_KEYCLOAK_URL,
	VITE_APP_API_BASE_URL: import.meta.env.VITE_APP_API_BASE_URL,
};

const parsed = frontendEnvSchema.safeParse(rawEnv);

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
