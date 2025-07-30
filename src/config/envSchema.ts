import { z } from "zod";

export const frontendEnvSchema = z.object({
	VITE_APP_KEYCLOAK_REALM: z.string(),
	VITE_APP_KEYCLOAK_CLIENTID: z.string(),
	VITE_APP_KEYCLOAK_URL: z.string().url(),
	VITE_APP_API_BASE_URL: z.string().url(),
});

export type FrontendEnv = z.infer<typeof frontendEnvSchema>;
