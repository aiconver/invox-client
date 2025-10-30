import { useEffect, useState } from "react";
import { hasAuthParams } from "react-oidc-context";
import { Outlet } from "react-router-dom";
import { AuthError } from "./auth-error";
import { useAuthRoles } from "./use-auth-roles";
import { LayoutSkeleton } from "../skeleton/layout-skeleton";

export function ProtectedRoute({
	requiredRoles,
}: {
	requiredRoles?: (
		| "admin"
		| "employee"
	)[];
}) {
	const { auth, roles } = useAuthRoles();
	const [hasTriedSignin, setHasTriedSignin] = useState(false);

	useEffect(() => {
		if (
			!(
				hasAuthParams() ||
				auth.isAuthenticated ||
				auth.activeNavigator ||
				auth.isLoading ||
				hasTriedSignin
			)
		) {
			void auth.signinRedirect();
			setHasTriedSignin(true);
		}
	}, [auth, hasTriedSignin]);

	if (auth.error) {
		void auth.signinRedirect();
		return (
			<AuthError
				title="We are having trouble signing you in"
				description={`Please try again later. (${auth.error})`}
			/>
		);
	}

	if (auth.isLoading) {
		return <LayoutSkeleton />;
	}

	if (!auth.isAuthenticated) {
		return (
			<AuthError
				title="You are not authenticated"
				description="Please sign in to continue."
			/>
		);
	}

	if (
		requiredRoles &&
		requiredRoles.length > 0 &&
		!requiredRoles.some((role) => roles.includes(role))
	) {
		return (
			<AuthError
				title="You are not authorized"
				description="You do not have permission to access this resource."
			/>
		);
	}

	return <Outlet />;
}
