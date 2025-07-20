import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/navbar";
import { getSubmittedFormById } from "@/services/invox";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SubmittedForm {
	id: string;
	templateId: string;
	createdAt: string;
	answers: Record<string, string>;
}

export function FormViewPage() {
	const { formId } = useParams<{ formId: string }>();
	const [form, setForm] = useState<SubmittedForm | null>(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		if (!formId) return;
		getSubmittedFormById(formId)
			.then(setForm)
			.catch(() => setForm(null))
			.finally(() => setLoading(false));
	}, [formId]);

	const handleDownload = () => {
		if (!form) return;
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

	return (
		<main className="flex flex-col h-full bg-muted/50">
			<Navbar />
			<div className="flex-1 overflow-auto p-6 max-w-3xl mx-auto w-full space-y-6">
				<Button
					variant="ghost"
					className="flex items-center gap-2 text-sm"
					onClick={() => navigate(-1)}
				>
					<ArrowLeft className="w-4 h-4" />
					Back
				</Button>

				{loading ? (
					<p className="text-center text-muted">Loading form...</p>
				) : !form ? (
					<p className="text-center text-red-500">Form not found.</p>
				) : (
					<div className="bg-white border rounded shadow p-6 space-y-4">
						<div className="flex items-center gap-2 mb-4">
							<FileText className="text-primary w-5 h-5" />
							<h2 className="text-xl font-semibold">Submitted Form</h2>
						</div>
						<p className="text-sm text-muted-foreground">
							Submitted on:{" "}
							<span className="font-medium">
								{new Date(form.createdAt).toLocaleString()}
							</span>
						</p>

						<div className="space-y-3">
							{Object.entries(form.answers).map(([key, value]) => (
								<div key={key}>
									<p className="text-sm text-muted-foreground mb-1">Field {key}</p>
									<p className="bg-muted rounded px-3 py-2 text-sm">{value}</p>
								</div>
							))}
						</div>

						<Button variant="outline" className="w-full mt-6" onClick={handleDownload}>
							Download JSON
						</Button>
					</div>
				)}
			</div>
		</main>
	);
}
