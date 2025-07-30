import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFormsByDepartment } from "@/services";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { APP_ROUTES } from "@/lib/routes";
import { BackButton } from "@/components/ui/back-button";

export function FormsByDepartmentPage() {
	const { department } = useParams();
	const decodedDepartment = decodeURIComponent(department ?? "");
	const navigate = useNavigate();

	const { data: forms, isLoading, error } = useQuery({
		queryKey: ["forms", decodedDepartment],
		queryFn: () => getFormsByDepartment(decodedDepartment),
		enabled: !!decodedDepartment,
	});

	if (isLoading) {
		return (
			<div className="p-4">
				<Navbar />
				<p className="text-center text-muted">Loading forms...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4">
				<Navbar />
				<p className="text-center text-red-500">Error loading forms.</p>
			</div>
		);
	}

	return (
		<main className="flex flex-col h-full bg-muted/50">
			<Navbar />
			<BackButton label={`Back to Departments`} />
			<div className="flex-1 overflow-auto p-6">
				<h2 className="text-xl font-semibold text-center mb-2">
					Forms in {decodedDepartment}
				</h2>
				<p className="text-center text-muted-foreground mb-6">
					Select a form to start filling it
				</p>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{forms?.map((form) => (
						<div
							key={form.id}
							className="rounded-lg border bg-white p-6 shadow-sm flex flex-col items-center text-center"
						>
							<div className="bg-muted p-3 rounded-md mb-4">
								<FileText className="w-6 h-6 text-primary" />
							</div>
							<h3 className="text-lg font-semibold mb-2">{form.name}</h3>
							<Button
								variant="outline"
								className="text-sm mt-auto"
								onClick={() => {
									if (form.processingType === "HybridFeedback") {
										const path = APP_ROUTES.hybridform.to.replace(":formId", encodeURIComponent(form.id));
										navigate(path);
										return;
									}
									const path = APP_ROUTES.form.to.replace(":formId", encodeURIComponent(form.id));
									navigate(path);
								}}
							>
								Fill
							</Button>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
