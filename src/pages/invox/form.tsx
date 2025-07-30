import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFormTemplate } from "@/services";
import { Navbar } from "@/components/layout/navbar";
import { FileText } from "lucide-react";
import { AudioRecorder } from "@/components/ui/audio-recorder";
import { BackButton } from "@/components/ui/back-button";

export function FormPage() {
	const { formId } = useParams<{ formId: string }>();

	const { data: form, isLoading, error } = useQuery({
		queryKey: ["form", formId],
		queryFn: () => getFormTemplate(formId!),
		enabled: !!formId,
	});

	if (isLoading || !form) {
		return (
			<div className="p-4">
				<Navbar />
				<p className="text-center text-muted">
					{isLoading ? "Loading form..." : "Error loading form."}
				</p>
			</div>
		);
	}

	// Flatten structure for backward-compatible rendering or usage
	const fields = Object.entries(form.structure).map(([name, config]) => ({
		name,
		type: config.type,
		required: config.required,
	}));

	return (
		<div className="flex flex-col h-full bg-muted/50">
			<Navbar />
			<BackButton label={`Back to ${form.department} forms`} />

			<div className="flex-1 overflow-auto p-6 max-w-3xl mx-auto w-full">
				<div className="flex items-center mb-6 gap-2">
					<FileText className="text-primary w-6 h-6" />
					<h1 className="text-2xl font-bold">{form.name}</h1>
				</div>
				<p className="text-muted-foreground mb-4">
					Department: <strong>{form.department}</strong>
				</p>

				<div className="bg-white rounded-lg p-6 shadow border space-y-2 mt-6">
					<h2 className="text-lg font-semibold mb-2">
						You must speak about the following things:
					</h2>
					<ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
						{fields.map((field, idx) => (
							<li key={idx}>
								<span className="text-black">{field.name}</span>
								{field.required && <span className="text-red-500 ml-1">*</span>}
							</li>
						))}
					</ul>
				</div>

				<AudioRecorder formId={formId!} formStructure={form.structure} fields={fields} />
			</div>
		</div>
	);
}
