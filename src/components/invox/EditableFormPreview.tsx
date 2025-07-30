import { useState } from "react";
import { Button } from "@/components/ui/button";
import { submitForm } from "@/services";
import { useNavigate } from "react-router-dom";

interface Props {
	formId: string;
	fields: { question: string; type: string; required?: boolean }[];
	initialValues: Record<string, string>;
}

export function EditableFormPreview({ formId, fields, initialValues }: Props) {
	const navigate = useNavigate();
	const [editableValues, setEditableValues] = useState<Record<string, string>>(initialValues);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	const handleChange = (fieldKey: string, value: string) => {
		setEditableValues((prev) => ({
			...prev,
			[fieldKey]: value,
		}));
	};

	const handleSubmit = async () => {
		setIsSubmitting(true);
		setSubmitted(false);

		try {
			const result = await submitForm({
				templateId: formId,
				answers: editableValues,
			});

			if (result?.formId) {
				setSubmitted(true);
				navigate("/qa");
			} else {
				throw new Error("Invalid response from server");
			}
		} catch (err) {
			alert("❌ Failed to submit form: " + (err as Error).message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="space-y-4 mt-6 text-left">
			<h4 className="font-semibold text-sm mb-2">Review & Edit Form:</h4>

			<div className="space-y-3">
				{Array.isArray(fields) &&
					fields.map((field) => (
						<div key={field.question}>
							<label className="text-sm text-muted-foreground mb-1 block">
								{field.question}
								{field.required && <span className="text-red-500 ml-1">*</span>}
							</label>
							<input
								type="text"
								className="w-full bg-white border px-3 py-2 rounded shadow-sm text-sm"
								value={editableValues[field.question] ?? ""}
								onChange={(e) => handleChange(field.question, e.target.value)}
							/>
						</div>
					))}
			</div>

			<Button onClick={handleSubmit} disabled={isSubmitting} className="w-full mt-4">
				{isSubmitting ? "Submitting..." : "Submit Final Form"}
			</Button>

			{submitted && (
				<p className="text-green-600 text-sm font-medium mt-2">
					✅ Form submitted successfully!
				</p>
			)}
		</div>
	);
}
