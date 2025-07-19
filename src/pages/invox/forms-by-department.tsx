import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFormsByDepartment } from "@/services/invox";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { APP_ROUTES } from "@/lib/routes";

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
		<div className="flex flex-col h-full bg-muted/50">
			<Navbar />
			<div className="flex-1 overflow-auto p-6 max-w-4xl mx-auto w-full">
				<h1 className="text-2xl font-bold mb-6 text-center">
					Forms for Department: {decodedDepartment}
				</h1>
				<div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
					{forms?.map((form) => (
						<div
							key={form.id}
							className="rounded-lg border bg-white p-6 shadow-sm flex flex-col items-center text-center"
						>
							<div className="bg-muted p-3 rounded-md mb-4">
								<FileText className="w-6 h-6 text-primary" />
							</div>
							<p className="text-lg font-semibold mb-2">{form.name}</p>
							<Button
								variant="outline"
								className="text-sm mt-auto"
								onClick={() => {
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
		</div>
	);
}
