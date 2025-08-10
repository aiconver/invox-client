import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/navbar";
import { RecentTemplatesSection } from "@/components/invox/recent-templates-section";
import { DashboardActions } from "@/components/invox/dashboard-actions";
import { SubmittedForms } from "@/components/invox/submited-form";
import { useAuthRoles } from "@/components/auth/use-auth-roles";

export function Invox() {
	const { t } = useTranslation();
	const {isAdmin, isEmployee} = useAuthRoles();

	return (
		<div className="min-h-screen w-full flex flex-col bg-muted/50">
			<Navbar />
			<main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-12 py-6 w-full space-y-10">
				<DashboardActions />
				{isEmployee && (
					<div className="max-w-7xl mx-auto">
						<RecentTemplatesSection />
					</div>
				)}
				<SubmittedForms />
			</main>
		</div>
	);
}
