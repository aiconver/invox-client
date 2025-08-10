import { Trans } from "react-i18next";
import { User } from "oidc-client-ts";
import config from "@/config/combined-config";

export function getUser() {
	const oidcStorage = localStorage.getItem(
		`oidc.user:${config.keycloakUrl}realms/${config.keycloakRealm}:${config.keycloakClientId}`,
	);
	if (!oidcStorage) {
		return null;
	}

	return User.fromStorageString(oidcStorage);
}

export function getHeaders() {
	const user = getUser();
	const token = user?.access_token;
	return {
		authorization: `Bearer ${token}`,
	};
}
