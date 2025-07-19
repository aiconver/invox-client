import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFormTemplate } from "@/services/invox";
import { Navbar } from "@/components/layout/navbar";
import { FileText } from "lucide-react";

export function FormPage() {
	const { formId } = useParams();

	const { data: form, isLoading, error } = useQuery({
		queryKey: ["form", formId],
		queryFn: () => getFormTemplate({ id: formId }),
		enabled: !!formId,
	});

	if (isLoading) {
		return (
			<div className="p-4">
				<Navbar />
				<p className="text-center text-muted">Loading form...</p>
			</div>
		);
	}

	if (error || !form) {
		return (
			<div className="p-4">
				<Navbar />
				<p className="text-center text-red-500">Error loading form.</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-muted/50">
			<Navbar />
			<div className="flex-1 overflow-auto p-6 max-w-3xl mx-auto w-full">
				<div className="flex items-center mb-6 gap-2">
					<FileText className="text-primary w-6 h-6" />
					<h1 className="text-2xl font-bold">{form.name}</h1>
				</div>

				{/* Placeholder to display structure — replace with form rendering later */}
				<pre className="text-sm bg-white rounded-lg p-4 shadow border overflow-auto">
					{JSON.stringify(form.structure, null, 2)}
				</pre>
			</div>
		</div>
	);
}
