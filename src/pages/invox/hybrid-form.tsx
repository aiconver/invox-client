// src/pages/hybrid/HybridFormPage.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

import { useRealtimeAudioRecorder } from "@/hooks/use-realtime-audio-recorder";
import { RecordingStatus } from "@/components/invox/hybrid/recording-status";
import { FormFields } from "@/components/invox/hybrid/form-fields";
import { TranscriptPanel } from "@/components/invox/hybrid/transcript-panel";
import { FormTemplate } from "@/types/form";

import { getFormTemplate, processForm, submitForm } from "@/services";

export function HybridFormPage() {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // auto-start control
  const autoStartTimeoutRef = useRef<number | null>(null);
  const [autoStartDone, setAutoStartDone] = useState(false);

  const { data: form, isLoading } = useQuery<FormTemplate>({
    queryKey: ["form", formId],
    queryFn: () => getFormTemplate(formId!),
    enabled: !!formId,
  });

  const handleSilenceDetected = useCallback(
    async (audioBlob: Blob) => {
      if (isProcessing || !formId) return;
      setIsProcessing(true);
      try {
        const result = await processForm(formId, audioBlob);
        if (result?.transcript) {
          setTranscript((prev) => `${prev} ${result.transcript}`);
        }
        if (result?.extracted?.filledTemplate) {
          setFormValues((prev) => ({ ...prev, ...result.extracted.filledTemplate }));
        }
      } catch (err) {
        setProcessingError("Failed to process audio: " + (err as Error).message);
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, formId]
  );

  const {
    isRecording,
    isListening,
    startRecording,
    stopRecording,
    error: audioError,
  } = useRealtimeAudioRecorder({
    onSilenceDetected: handleSilenceDetected,
    silenceThreshold: 3000,
    minRecordingTime: 2000,
  });

  // Reset auto-start flag when form changes
  useEffect(() => {
    setAutoStartDone(false);
  }, [form?.id]);

  // Auto-start effect
  useEffect(() => {
    if (!form || autoStartDone) return;

    autoStartTimeoutRef.current = window.setTimeout(() => {
      startRecording();
      setAutoStartDone(true);
      autoStartTimeoutRef.current = null;
    }, 1000);

    return () => {
      if (autoStartTimeoutRef.current) {
        clearTimeout(autoStartTimeoutRef.current);
        autoStartTimeoutRef.current = null;
      }
    };
  }, [form, startRecording, autoStartDone]);

  const handleToggleRecording = () => {
    if (isRecording) {
      // user pressed Stop — cancel any scheduled auto-start and mark done
      if (autoStartTimeoutRef.current) {
        clearTimeout(autoStartTimeoutRef.current);
        autoStartTimeoutRef.current = null;
      }
      setAutoStartDone(true);
      stopRecording();
    } else {
      startRecording();
      setAutoStartDone(true);
    }
  };

  const onChange = (name: string, value: string) =>
    setFormValues((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async () => {
    if (!formId) return;
    setIsSubmitting(true);
    try {
      const res = await submitForm({ templateId: formId, answers: formValues });
      if (res?.formId) navigate("/");
      else throw new Error("Invalid response from server");
    } catch (e) {
      alert("❌ Failed to submit form: " + (e as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const fields = Object.entries(form.structure).map(([name, config]) => ({
    name,
    config,
  }));

  return (
    <div className="flex flex-col h-full bg-muted/50">
      <Navbar />
      <BackButton label={`Back to ${form.department} forms`} />

      <div className="flex-1 overflow-auto p-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center mb-6 gap-2">
          <FileText className="text-primary w-6 h-6" />
          <h1 className="text-2xl font-bold">{form.name}</h1>
        </div>
        <p className="text-muted-foreground mb-4">
          Department: <strong>{form.department}</strong>
        </p>

        <div className="space-y-6">
          <RecordingStatus
            isRecording={isRecording}
            isListening={isListening}
            isProcessing={isProcessing}
            onToggle={handleToggleRecording}
            error={audioError}
            processingError={processingError}
          />

          <FormFields fields={fields} values={formValues} onChange={onChange} />

          <TranscriptPanel transcript={transcript} />

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(formValues).length === 0}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? "Submitting..." : "Submit Form"}
          </Button>
        </div>
      </div>
    </div>
  );
}
