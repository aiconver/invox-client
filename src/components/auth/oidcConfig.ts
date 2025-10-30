// src/auth/oidcConfig.ts
import { UserManager, WebStorageStateStore } from "oidc-client-ts";
import config from "@/config/combined-config";

export const userManager = new UserManager({
	authority: `${config.keycloakUrl}realms/${config.keycloakRealm}`,
	// biome-ignore lint/style/useNamingConvention: <explanation>
	client_id: config.keycloakClientId,
	// biome-ignore lint/style/useNamingConvention: <explanation>
	redirect_uri: `${window.location.origin}${window.location.pathname}`,
	// biome-ignore lint/style/useNamingConvention: <explanation>
	post_logout_redirect_uri: window.location.origin,
	// biome-ignore lint/style/useNamingConvention: <explanation>
	response_type: "code", // required for Authorization Code Flow
	scope: "openid profile email", // adjust scopes as needed
	userStore: new WebStorageStateStore({ store: window.localStorage }),
	monitorSession: true, // auto-detect login/logout in other tabs
	// automaticSilentRenew: true, // optional: for silent token renewal
	// silent_redirect_uri: `${window.location.origin}/silent-renew.html`,
});
