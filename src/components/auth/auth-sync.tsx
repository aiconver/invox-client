import { Trans } from "react-i18next";
import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { setAuthContext } from "@/lib/axios";

export function AuthSync() {
	const auth = useAuth();
	useEffect(() => {
		setAuthContext(auth);
	}, [auth]);
	return null;
}
