// components/ui/editable-form-preview.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
	formId: string;
	fields: { question: string; type: string; required?: boolean }[];
	initialValues: Record<string, string>;
}

export function EditableFormPreview({ formId, fields, initialValues }: Props) {
	const [editableValues, setEditableValues] = useState<Record<string, string>>(initialValues);

	const handleChange = (idx: number, value: string) => {
		setEditableValues((prev) => ({
			...prev,
			[idx]: value,
		}));
	};

	const handleSubmit = async () => {
		try {
			// Replace with proper RPC call
			await fetch("/api/submit-form", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ formId, values: editableValues }),
			});
			alert("✅ Form submitted successfully!");
		} catch (err) {
			alert("❌ Failed to submit form");
		}
	};

	return (
		<div className="space-y-2">
			<h4 className="font-semibold text-sm mb-2">Review & Edit Form:</h4>
			<div className="space-y-3">
				{fields.map((field, idx) => (
					<div key={idx}>
						<label className="text-sm text-muted-foreground mb-1 block">{field.question}</label>
						<input
							type="text"
							className="w-full bg-white border px-3 py-2 rounded shadow-sm text-sm"
							value={editableValues[idx] ?? ""}
							onChange={(e) => handleChange(idx, e.target.value)}
						/>
					</div>
				))}
			</div>

			<Button onClick={handleSubmit} className="w-full mt-4">
				Submit Final Form
			</Button>
		</div>
	);
}
