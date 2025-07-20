// hooks/useAudioRecorder.ts
import { useState, useRef, useEffect } from "react";

export function useAudioRecorder() {
	const [isRecording, setIsRecording] = useState(false);
	const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
	const [audioUrl, setAudioUrl] = useState<string | null>(null);

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);

	useEffect(() => {
		if (!isRecording) return;

		const startRecording = async () => {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const mediaRecorder = new MediaRecorder(stream);
			mediaRecorderRef.current = mediaRecorder;
			audioChunksRef.current = [];

			mediaRecorder.ondataavailable = (e) => {
				if (e.data.size > 0) audioChunksRef.current.push(e.data);
			};

			mediaRecorder.onstop = () => {
				const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
				const url = URL.createObjectURL(blob);
				setAudioBlob(blob);
				setAudioUrl(url);
				stream.getTracks().forEach((t) => t.stop());
			};

			mediaRecorder.start();
		};

		startRecording().catch(() => setIsRecording(false));
	}, [isRecording]);

	const toggleRecording = () => {
		if (isRecording) {
			mediaRecorderRef.current?.stop();
			setIsRecording(false);
		} else {
			setAudioUrl(null);
			setAudioBlob(null);
			setIsRecording(true);
		}
	};

	return { isRecording, audioBlob, audioUrl, toggleRecording };
}
