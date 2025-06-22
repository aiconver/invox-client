
import { z } from "zod";

export const frontendEnvSchema = z.object({
  VITE_APP_KEYCLOAK_REALM: z.string().optional(),
  VITE_APP_KEYCLOAK_CLIENTID: z.string().optional(),
  VITE_APP_KEYCLOAK_URL: z.string().optional(),
  VITE_APP_API_BASE_URL: z.string().default("http://localhost:3000/api"),
});

export type FrontendEnv = z.infer<typeof frontendEnvSchema>;
