import { useTranslation } from "react-i18next";
import { useAuthRoles } from "@/components/auth/use-auth-roles";

export function Invox() {
	const { t } = useTranslation();
	const {isAdmin, isEmployee} = useAuthRoles();

	return (
		<div className="min-h-screen w-full flex flex-col bg-muted/50">
			<main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-12 py-6 w-full space-y-10">
				{isEmployee && (
					<div className="max-w-7xl mx-auto">
						Hello
					</div>
				)}
			</main>
		</div>
	);
}
