import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FileText, Rocket } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/lib/routes";
import { getSubmittedForms } from "@/services/invox";
import { RecentTemplatesSection } from "@/components/invox/recent-templates-section";

interface SubmittedForm {
	id: string;
	templateId: string;
	createdAt: string;
	answers: Record<string, any>;
}

export function Invox() {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [submittedForms, setSubmittedForms] = useState<SubmittedForm[] | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getSubmittedForms()
			.then(setSubmittedForms)
			.catch((err) => {
				console.error("Failed to load submitted forms:", err);
			})
			.finally(() => setLoading(false));
	}, []);

	const handleView = (formId: string) => {
		navigate(`/qa/forms/view/${formId}`);
	};

	const handleDownload = (form: SubmittedForm) => {
		const blob = new Blob([JSON.stringify(form.answers, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `form-${form.id}.json`;
		link.click();
		URL.revokeObjectURL(url);
	};

	const handleStartFilling = () => {
		navigate(APP_ROUTES.departments.to);
	};

	const recentTemplates = [
		{
			id: "baea1ff1-c377-47f5-a478-ddb626347666",
			name: "Exit Interview Form",
		},
		{
			id: "94faf526-2544-4a07-a734-69b4f886433e",
			name: "Daily Operations Log",
		},
		{
			id: "7ec6b41c-5696-46b4-bde5-dfbfd82aa194",
			name: "Equipment Maintenance Record",
		},
		{
			id: "9c437b6b-3ee3-4a86-bf5f-338ea3ae1d3f",
			name: "Inventory Check",
		},
		{
			id: "825d3ff9-d292-4ddf-89a1-629d81793066",
			name: "Incident Report",
		},
	];

	return (
		<main className="flex flex-col min-h-screen bg-muted/50">
			<Navbar />
			<div className="flex-1 px-4 sm:px-6 lg:px-12 py-6 w-full space-y-10">
				<div className="max-w-7xl mx-auto flex items-center justify-between">
					<Button onClick={handleStartFilling} variant="default" size="sm">
						Start Filling Form
					</Button>
					<h2 className="text-xl font-semibold">Your Submitted Forms</h2>
				</div>

				<div className="max-w-7xl mx-auto">
					<RecentTemplatesSection templates={recentTemplates} />
				</div>

				<div className="max-w-7xl mx-auto">
					{loading ? (
						<p className="text-center text-muted">Loading submitted forms...</p>
					) : submittedForms?.length ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{submittedForms.map((form) => (
								<div
									key={form.id}
									className="rounded-lg border bg-white p-6 shadow-sm flex flex-col items-start"
								>
									<div className="bg-muted p-3 rounded-md mb-4">
										<FileText className="w-5 h-5 text-primary" />
									</div>
									<p className="text-sm text-muted-foreground mb-2">
										Submitted on:
										<br />
										<span className="text-black font-medium">
											{new Date(form.createdAt).toLocaleString()}
										</span>
									</p>
									<div className="mt-auto flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleView(form.id)}
										>
											View
										</Button>
										<Button
											variant="secondary"
											size="sm"
											onClick={() => handleDownload(form)}
										>
											Download
										</Button>
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="text-center text-muted">
							You haven’t submitted any forms yet.
						</p>
					)}
				</div>
			</div>
		</main>
	);
}
