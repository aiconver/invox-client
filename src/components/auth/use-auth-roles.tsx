import { jwtDecode } from "jwt-decode";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";

interface DecodedToken {
	preferredUsername?: string;
	email?: string;
	realmAccess?: {
		roles?: string[];
	};
}

export const useAuthRoles = () => {
	const auth = useAuth();

	const [roles, setRoles] = useState<string[]>([]);
	const [id, setId] = useState<string | null>(null);
	const [isReady, setIsReady] = useState(false);

	const parseToken = useCallback(() => {
		if (!auth?.user?.access_token) {
			return;
		}

		try {
			const tokenClaims: any = jwtDecode<DecodedToken>(auth.user.access_token);

			// console.log("Token decoded:", tokenClaims);

			const roleList = tokenClaims.realm_access?.roles || [];
			setRoles(roleList);
			setId(tokenClaims.sub ?? null)
			setIsReady(true);
		} catch (error) {
			console.error("Error decoding access token:", error);
			setIsReady(false);
		}
	}, [auth?.user?.access_token]);

	useEffect(() => {
		parseToken();
	}, [parseToken]);

	const isSystemAdmin = roles.includes("systemAdmin");
	const isOperator = roles.includes("operator");
	const isProjectManager = roles.includes("projectManager");
	const isMerchandiser = roles.includes("merchandiser");
	const isCustomer = roles.includes("customer");

	return {
		auth,
		roles,
		id,
		isSystemAdmin,
		isOperator,
		isProjectManager,
		isMerchandiser,
		isCustomer,
		isReady,
	};
};