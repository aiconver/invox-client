import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/navbar";
import { RecentTemplatesSection } from "@/components/invox/recent-templates-section";
import { DashboardActions } from "@/components/invox/DashboardActions";
import { SubmittedFormsSection } from "@/components/invox/SubmittedFormsSection";

export function Invox() {
	const { t } = useTranslation();

	return (
		<div className="min-h-screen w-full flex flex-col bg-muted/50">
			<Navbar />
			<main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-12 py-6 w-full space-y-10">
				<DashboardActions />
				<div className="max-w-7xl mx-auto">
					<RecentTemplatesSection />
				</div>
				<SubmittedFormsSection />
			</main>
		</div>
	);
}
