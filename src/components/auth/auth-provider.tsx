// src/components/auth/auth-provider.tsx
import { ReactNode, useEffect } from "react";
import { AuthProvider as OidcProvider, useAuth } from "react-oidc-context";
import { userManager } from "./oidcConfig";
import { setAuthContext } from "@/lib/axios";

// ⬇️ This wraps your auth logic and watches for login success
function AuthWatcher({ children }: { children: ReactNode }) {
	const auth = useAuth();

	useEffect(() => {
		if (auth.isAuthenticated) {
			setAuthContext(auth); // ✅ Global token set
		}
	}, [auth.isAuthenticated]);

	return <>{children}</>;
}

// ⬇️ This is your top-level provider
export function AuthProvider({ children }: { children: ReactNode }) {
	return (
		<OidcProvider userManager={userManager}>
			<AuthWatcher>{children}</AuthWatcher>
		</OidcProvider>
	);
}
