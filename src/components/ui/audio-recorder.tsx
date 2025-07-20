import { Mic, StopCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { processForm } from "@/services/invox";

export function AudioRecorder({ formId }: { formId: string }) {
	const { isRecording, toggleRecording, audioBlob, audioUrl } = useAudioRecorder();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [transcript, setTranscript] = useState<string | null>(null);
	const [extracted, setExtracted] = useState<Record<string, any> | null>(null);

	const handleSubmit = async () => {
		if (!audioBlob) return;
		setIsSubmitting(true);
		setTranscript(null);
		setExtracted(null);

		try {
			const result = await processForm(formId, audioBlob);
			setTranscript(result.transcript);
			setExtracted(result.extracted.filledTemplate);
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
						<><Loader2 className="w-4 h-4 animate-spin mr-2" />Submitting...</>
					) : (
						"Submit Audio"
					)}
				</Button>
			)}

			{submitted && (
				<div className="text-left bg-white p-4 border rounded shadow-sm space-y-4">
					<p className="text-green-600 text-sm font-medium">✅ Audio submitted successfully!</p>

					{transcript && (
						<div>
							<h4 className="font-semibold text-sm mb-1">Transcript:</h4>
							<p className="text-sm bg-muted p-2 rounded">{transcript}</p>
						</div>
					)}

					{extracted && (
						<div>
							<h4 className="font-semibold text-sm mb-1">Extracted Values:</h4>
							<pre className="text-sm bg-muted p-2 rounded overflow-auto">
								{JSON.stringify(extracted, null, 2)}
							</pre>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
