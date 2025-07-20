// components/AudioRecorder.tsx
import { Mic, StopCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";

export function AudioRecorder({ formId }: { formId: string }) {
	const { isRecording, toggleRecording, audioBlob, audioUrl } = useAudioRecorder();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = async () => {
		if (!audioBlob) return;
		setIsSubmitting(true);
		try {
			const formData = new FormData();
			formData.append("audio", audioBlob);
			formData.append("formId", formId);
			await fetch("/api/process-audio", { method: "POST", body: formData });
			setSubmitted(true);
		} catch (err) {
			alert("Submission failed");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="mt-8 text-center space-y-4">
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
					{isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Submitting...</> : "Submit Audio"}
				</Button>
			)}

			{submitted && <p className="text-green-600 text-sm font-medium">Audio submitted successfully!</p>}
		</div>
	);
}
