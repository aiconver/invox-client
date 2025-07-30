import { Trans } from "react-i18next";
import type { ReactNode } from "react";
import { AuthProvider as OidcProvider } from "react-oidc-context";
import { userManager } from "./oidcConfig.ts";

export function AuthProvider({ children }: { children: ReactNode }) {
	return <OidcProvider userManager={userManager}>{children}</OidcProvider>;
}
