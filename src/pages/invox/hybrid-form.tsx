// FormPage.tsx - Complete real-time audio form in one file
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useCallback, useEffect } from "react";
import { getFormTemplate, processForm, submitForm } from "@/services/invox";
import { Navbar } from "@/components/layout/navbar";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { FileText, Mic, MicOff, Loader2 } from "lucide-react";

// Fixed Real-time Audio Hook
function useRealtimeAudioRecorder({
    onSilenceDetected,
    silenceThreshold = 3000,
    minRecordingTime = 2000
}: {
    onSilenceDetected: (audioBlob: Blob) => void;
    silenceThreshold?: number;
    minRecordingTime?: number;
}) {
    const [isRecording, setIsRecording] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);
    const silenceTimer = useRef<NodeJS.Timeout | null>(null);
    const recordingStartTime = useRef<number>(0);
    const audioContext = useRef<AudioContext | null>(null);
    const analyser = useRef<AnalyserNode | null>(null);
    const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrame = useRef<number | null>(null);
    const isRecordingRef = useRef<boolean>(false); // Add ref to track recording state

    const detectSpeech = useCallback(() => {
        // Use ref instead of state to avoid stale closure issues
        if (!analyser.current || !isRecordingRef.current) {
            console.log('Analyser not ready or not recording, stopping detection', {
                analyserReady: !!analyser.current,
                isRecording: isRecordingRef.current
            });
            return;
        }

        const bufferLength = analyser.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        try {
            analyser.current.getByteFrequencyData(dataArray);

            // Calculate RMS (root mean square) for better audio level detection
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i] * dataArray[i];
            }
            const rms = Math.sqrt(sum / bufferLength);
            
            // Calculate average for comparison
            const average = dataArray.reduce((a, b) => a + b) / bufferLength;
            
            // Adjusted thresholds based on your audio levels
            // Your background noise is around RMS 45-50, so we need higher thresholds
            const speechThreshold = 60; // Increased from 15 to 60
            const averageThreshold = 35; // Increased from 8 to 35
            const isSpeaking = rms > speechThreshold || average > averageThreshold;
            
            // Log more frequently to see the silence detection working
            if (Math.random() < 0.1) { // Log ~10% of frames to see silence detection
                console.log(`Audio levels - RMS: ${rms.toFixed(2)}, Average: ${average.toFixed(2)}, Speaking: ${isSpeaking}, Thresholds: RMS>${speechThreshold}, Avg>${averageThreshold}`);
            }

            setIsListening(isSpeaking);

            if (isSpeaking) {
                // Clear silence timer if speaking
                if (silenceTimer.current) {
                    clearTimeout(silenceTimer.current);
                    silenceTimer.current = null;
                    console.log('🎤 Speech detected - cleared silence timer');
                }
            } else {
                // Start silence timer if not already running
                if (!silenceTimer.current && isRecordingRef.current) {
                    console.log('⏸️ Starting silence timer...');
                    silenceTimer.current = setTimeout(() => {
                        const recordingDuration = Date.now() - recordingStartTime.current;
                        console.log(`🔄 Silence timer triggered. Duration: ${recordingDuration}ms, Chunks: ${audioChunks.current.length}`);
                        
                        if (recordingDuration >= minRecordingTime && audioChunks.current.length > 0) {
                            console.log('✅ Processing audio chunk after silence');
                            // Process current audio chunk
                            const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm;codecs=opus' });
                            console.log(`📦 Created audio blob: ${audioBlob.size} bytes`);
                            onSilenceDetected(audioBlob);
                            
                            // Reset for next recording segment
                            audioChunks.current = [];
                            recordingStartTime.current = Date.now();
                            console.log('🔄 Reset for next recording segment');
                        } else {
                            console.log('⏭️ Skipping audio chunk (too short or no data)');
                        }
                        silenceTimer.current = null;
                    }, silenceThreshold);
                }
            }

            // Continue monitoring if recording
            if (isRecordingRef.current) {
                animationFrame.current = requestAnimationFrame(detectSpeech);
            }
        } catch (error) {
            console.error('❌ Error in detectSpeech:', error);
        }
    }, [onSilenceDetected, silenceThreshold, minRecordingTime]);

    const startRecording = useCallback(async () => {
        try {
            console.log('🎙️ Starting recording process...');
            
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("getUserMedia is not supported in this browser");
            }

            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: false, // Turn off noise suppression to better detect speech
                    autoGainControl: true,
                    sampleRate: 44100
                } 
            });

            console.log('✅ Microphone access granted');
            const audioTracks = stream.getAudioTracks();
            console.log(`📊 Audio tracks: ${audioTracks.length}`, audioTracks[0]?.getSettings());

            if (audioTracks.length === 0) {
                throw new Error("No audio tracks found in the stream");
            }

            // Set up audio analysis
            audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            // Resume audio context if it's suspended
            if (audioContext.current.state === 'suspended') {
                console.log('🔄 Resuming suspended audio context...');
                await audioContext.current.resume();
            }
            
            analyser.current = audioContext.current.createAnalyser();
            microphone.current = audioContext.current.createMediaStreamSource(stream);
            
            // Better settings for speech detection
            analyser.current.fftSize = 256; // Smaller for faster processing
            analyser.current.smoothingTimeConstant = 0.8; // More smoothing
            microphone.current.connect(analyser.current);

            console.log('🎚️ Audio analysis setup complete');

            // Set up media recorder
            mediaRecorder.current = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });
            audioChunks.current = [];
            recordingStartTime.current = Date.now();

            mediaRecorder.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.current.push(event.data);
                    // Less frequent logging
                    if (audioChunks.current.length % 20 === 0) {
                        console.log(`📊 Audio chunks collected: ${audioChunks.current.length}, Latest: ${event.data.size} bytes`);
                    }
                }
            };

            mediaRecorder.current.onerror = (event) => {
                console.error('❌ MediaRecorder error:', event);
                setError('Recording failed: ' + event.error?.message);
            };

            mediaRecorder.current.onstart = () => {
                console.log('▶️ MediaRecorder started');
            };

            mediaRecorder.current.onstop = () => {
                console.log('⏹️ MediaRecorder stopped');
            };

            // Start recording
            mediaRecorder.current.start(500);
            
            // Update both state and ref
            setIsRecording(true);
            isRecordingRef.current = true; // Critical: Update ref immediately
            setError(null);

            console.log('✅ Recording started successfully');

            // Start speech detection with longer delay to ensure everything is ready
            setTimeout(() => {
                console.log('🔍 Starting speech detection...', {
                    analyserReady: !!analyser.current,
                    isRecording: isRecordingRef.current,
                    audioContextState: audioContext.current?.state
                });
                detectSpeech();
            }, 500); // Increased delay from 200ms to 500ms

        } catch (err) {
            console.error('❌ Recording setup error:', err);
            setError("Failed to access microphone: " + (err as Error).message);
        }
    }, [detectSpeech]);

    const stopRecording = useCallback(() => {
        console.log('⏹️ Stopping recording...');
        
        // Update ref first to stop speech detection loop
        isRecordingRef.current = false;
        
        // Cancel animation frame
        if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
            animationFrame.current = null;
        }

        if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
            mediaRecorder.current.stop();
            mediaRecorder.current.stream.getTracks().forEach(track => {
                track.stop();
                console.log('🔇 Stopped track:', track.kind);
            });
        }

        if (silenceTimer.current) {
            clearTimeout(silenceTimer.current);
            silenceTimer.current = null;
            console.log('⏹️ Cleared silence timer');
        }

        if (audioContext.current && audioContext.current.state !== 'closed') {
            audioContext.current.close();
            console.log('🔇 Closed audio context');
        }

        setIsRecording(false);
        setIsListening(false);
        console.log('✅ Recording stopped completely');
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            console.log('🧹 Cleaning up audio recorder...');
            stopRecording();
        };
    }, [stopRecording]);

    return {
        isRecording,
        isListening,
        startRecording,
        stopRecording,
        error
    };
}
// Main FormPage Component
export function HybridFormPage() {
    const { formId } = useParams<{ formId: string }>();
    const navigate = useNavigate();

    // Form data state
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Query for form template
    const { data: form, isLoading, error } = useQuery({
        queryKey: ["form", formId],
        queryFn: () => getFormTemplate(formId!),
        enabled: !!formId,
    });

    // Handle silence detection and audio processing
    const handleSilenceDetected = useCallback(async (audioBlob: Blob) => {
        if (isProcessing || !formId) {
            console.log('⏭️ Skipping audio processing - already processing or no form ID');
            return; // Prevent multiple simultaneous processing
        }

        console.log('🔄 Starting audio processing...', { blobSize: audioBlob.size, formId });
        setIsProcessing(true);
        try {
            const result = await processForm(formId, audioBlob);
            console.log('✅ Audio processing result:', result);
            
            // Update transcript
            if (result.transcript) {
                setTranscript(prev => {
                    const newTranscript = prev + " " + result.transcript;
                    console.log('📝 Updated transcript:', newTranscript);
                    return newTranscript;
                });
            }
            
            // Update form values with new extracted data
            if (result.extracted?.filledTemplate) {
                setFormValues(prev => {
                    const newValues = { ...prev, ...result.extracted.filledTemplate };
                    console.log('📋 Updated form values:', newValues);
                    return newValues;
                });
            }
        } catch (err) {
            console.error("❌ Audio processing error:", err);
            // Optionally show error to user
            setError("Failed to process audio: " + (err as Error).message);
        } finally {
            setIsProcessing(false);
            console.log('✅ Audio processing completed');
        }
    }, [isProcessing, formId]);

    // Real-time audio recorder hook
    const {
        isRecording,
        isListening,
        startRecording,
        stopRecording,
        error: audioError
    } = useRealtimeAudioRecorder({
        onSilenceDetected: handleSilenceDetected,
        silenceThreshold: 3000,
        minRecordingTime: 2000
    });

    // Auto-start recording when form is loaded
    useEffect(() => {
        if (form && !isRecording) {
            console.log('📋 Form loaded, auto-starting recording in 1 second...');
            const timer = setTimeout(() => {
                startRecording();
            }, 1000); // Small delay to let user see the interface first

            return () => clearTimeout(timer);
        }
    }, [form, isRecording, startRecording]);

    // Handle input changes
    const handleInputChange = (fieldName: string, value: string) => {
        setFormValues(prev => ({
            ...prev,
            [fieldName]: value
        }));
        console.log(`✏️ Manual input change: ${fieldName} = ${value}`);
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!formId) return;
        
        console.log('📤 Submitting form:', { formId, formValues });
        setIsSubmitting(true);
        try {
            const result = await submitForm({
                templateId: formId,
                answers: formValues,
            });

            console.log('✅ Form submission result:', result);

            if (result?.formId) {
                navigate("/qa");
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (err) {
            console.error('❌ Form submission error:', err);
            alert("❌ Failed to submit form: " + (err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading state
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

    // Flatten structure for form rendering
    const fields = Object.entries(form.structure).map(([name, config]) => ({
        name,
        type: config.type,
        required: config.required,
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
                    {/* Recording Status with Audio Level Display */}
                    <div className="bg-white rounded-lg p-4 shadow border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {isRecording ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                        <Mic className="w-5 h-5 text-red-500" />
                                        <span className="text-sm font-medium">
                                            {isListening ? "🎤 Speaking detected..." : "⏸️ Listening for speech..."}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <MicOff className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm text-gray-600">Recording stopped</span>
                                    </div>
                                )}
                                
                                {isProcessing && (
                                    <div className="flex items-center gap-2 ml-4">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm text-blue-600">Processing audio...</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                    {isRecording ? "3s silence = auto-process" : "Click to start"}
                                </span>
                                <Button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    variant={isRecording ? "destructive" : "default"}
                                    size="sm"
                                >
                                    {isRecording ? "Stop Recording" : "Start Recording"}
                                </Button>
                            </div>
                        </div>

                        {audioError && (
                            <div className="mt-2 p-2 bg-red-50 rounded text-red-700 text-sm">
                                <strong>Microphone Error:</strong> {audioError}
                                <div className="mt-1 text-xs">
                                    • Check if microphone permission is granted<br/>
                                    • Try clicking the microphone icon in your browser's address bar<br/>
                                    • Ensure no other apps are using your microphone<br/>
                                    • Try refreshing the page and clicking "Allow" when prompted
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-2 text-xs text-gray-500">
                            💡 Tip: Speak clearly, then pause for 3 seconds to auto-fill the form
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="bg-white rounded-lg p-6 shadow border space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Form Fields</h2>
                            <p className="text-sm text-gray-500">
                                Speak naturally - fields will be filled automatically
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {fields.map((field) => (
                                <div key={field.name} className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        {field.name}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={formValues[field.name] || ""}
                                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                                        placeholder={`Speak about ${field.name.toLowerCase()}...`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Transcript Display */}
                    {transcript && (
                        <div className="bg-gray-50 rounded-lg p-4 border">
                            <h3 className="text-sm font-semibold mb-2">Live Transcript:</h3>
                            <p className="text-sm text-gray-700 leading-relaxed">{transcript.trim()}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting || Object.keys(formValues).length === 0}
                        className="w-full"
                        size="lg"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Form"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function setError(arg0: string) {
    throw new Error("Function not implemented.");
}
