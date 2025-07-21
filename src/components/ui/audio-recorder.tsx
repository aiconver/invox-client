import { Mic, StopCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { processForm } from "@/services/invox";
import { EditableFormPreview } from "../invox/EditableFormPreview";

interface Props {
	formId: string;
	formStructure: {
		fields: {
			type: string;
			question: string;
			required?: boolean;
		}[];
	};
	fields: { question: string; type: string; required?: boolean }[];
}

export function AudioRecorder({ formId, formStructure, fields }: Props) {
	const { isRecording, toggleRecording, audioBlob, audioUrl } = useAudioRecorder();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [transcript, setTranscript] = useState<string | null>(null);
	const [extractedValues, setExtractedValues] = useState<Record<string, any> | null>(null);

	const handleSubmit = async () => {
		if (!audioBlob) return;
		setIsSubmitting(true);
		setTranscript(null);
		setExtractedValues(null);

		try {
			const result = await processForm(formId, audioBlob);
			setTranscript(result.transcript);

			const filled = result.extracted.filledTemplate;

			// Check if keys are semantic (not all numeric)
			const isIndexBased = Object.keys(filled).every((key) => /^\d+$/.test(key));

			let indexBasedValues: Record<number, string>;

			if (isIndexBased) {
				// Already in desired format
				indexBasedValues = filled;
			} else {
				// Transform semantic-keyed values to index-based using fields
				indexBasedValues = fields.reduce((acc, field, idx) => {
					acc[idx] = filled[field.question] ?? "";
					return acc;
				}, {} as Record<number, string>);
			}

			setExtractedValues(indexBasedValues);
			setSubmitted(true);
		} catch (err) {
			console.error("Audio submission error:", err);
			alert("Submission failed: " + (err as Error).message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="mt-8 text-center space-y-6">
			<Button onClick={toggleRecording} variant={isRecording ? "destructive" : "default"} className="gap-2">
				{isRecording ? <><StopCircle className="w-4 h-4" />Stop</> : <><Mic className="w-4 h-4" />Start</>}
			</Button>

			{audioUrl && (
				<div className="space-y-2">
					<p className="text-sm text-muted-foreground">Recorded Audio:</p>
					<audio controls src={audioUrl} className="w-full" />
				</div>
			)}

			{audioBlob && (
				<Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
					{isSubmitting ? (
						<><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing...</>
					) : (
						"Process Form"
					)}
				</Button>
			)}

			{submitted && (
				<div className="text-left bg-white p-4 border rounded shadow-sm space-y-4">
					<p className="text-green-600 text-sm font-medium">✅ Audio Processed successfully!</p>

					{transcript && (
						<div>
							<h4 className="font-semibold text-sm mb-1">Transcript:</h4>
							<p className="text-sm bg-muted p-2 rounded">{transcript}</p>
						</div>
					)}

					{extractedValues && (
						<EditableFormPreview
							formId={formId}
							fields={formStructure.fields}
							initialValues={extractedValues}
						/>
					)}

				</div>
			)}
		</div>
	);
}
