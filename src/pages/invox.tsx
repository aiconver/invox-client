import { Navbar } from "@/components/layout/navbar";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getSubmittedForms } from "@/services/invox";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface SubmittedForm {
	id: string;
	templateId: string;
	createdAt: string;
	answers: Record<string, any>;
}

export function Invox() {
	const { t } = useTranslation();
	const [submittedForms, setSubmittedForms] = useState<SubmittedForm[] | null>(null);
	const [loading, setLoading] = useState(true);

	const navigate = useNavigate();

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
		const blob = new Blob([JSON.stringify(form.answers, null, 2)], { type: "application/json" });
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

	return (
		<main className="flex flex-col min-h-screen bg-muted/50">
			<Navbar />
			<div className="flex-1 px-4 sm:px-6 lg:px-12 py-6 w-full">
				<div className="flex items-center justify-between mb-6 max-w-7xl mx-auto">
					<Button onClick={handleStartFilling} variant="default" size="sm">
						Start Filling Form
					</Button>
					<h2 className="text-xl font-semibold">Your Submitted Forms</h2>
				</div>

				{loading ? (
					<p className="text-center text-muted">Loading submitted forms...</p>
				) : submittedForms?.length ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
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
		</main>
	);
}
