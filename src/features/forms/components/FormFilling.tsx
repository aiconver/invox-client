
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormTemplate, FormField, FieldResponse } from '@/types';
import VoiceRecorder from '@/features/voice/components/VoiceRecorder';
import { Check, AlertCircle } from 'lucide-react';

interface FormFillingProps {
  formTemplate: FormTemplate;
  onSubmit: (responses: FieldResponse[], audioFiles: { [fieldId: string]: Blob }, transcripts: { [fieldId: string]: string }) => void;
  onCancel: () => void;
}

const FormFilling: React.FC<FormFillingProps> = ({ formTemplate, onSubmit, onCancel }) => {
  const [audioFile, setAudioFile] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState('');
  const [responses, setResponses] = useState<FieldResponse[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRecordingComplete = (audioBlob: Blob, fullTranscript: string) => {
    setAudioFile(audioBlob);
    setTranscript(fullTranscript);
    
    // Process the transcript to extract answers for each question
    // This is a mock implementation - in real app, you'd use AI to parse the transcript
    const processedResponses: FieldResponse[] = formTemplate.fields.map((field, index) => ({
      fieldId: field.id,
      value: `Answer ${index + 1} extracted from: "${fullTranscript}"`,
      confidence: 0.85
    }));
    
    setResponses(processedResponses);
  };

  const handleSubmit = () => {
    if (!audioFile || responses.length === 0) return;
    
    const audioFiles = { 'all_questions': audioFile };
    const transcripts = { 'all_questions': transcript };
    
    onSubmit(responses, audioFiles, transcripts);
  };

  const canSubmit = audioFile && transcript && responses.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{formTemplate.title}</CardTitle>
          <p className="text-muted-foreground">{formTemplate.description}</p>
        </CardHeader>
      </Card>

      {/* Display All Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>All Questions</span>
            <Badge variant="outline">{formTemplate.fields.length} questions</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formTemplate.fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg">
                <div className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-medium">{field.label}</h4>
                    {field.required && (
                      <Badge variant="destructive" className="mt-1">Required</Badge>
                    )}
                    {field.type === 'multiple-choice' && field.options && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">Options:</p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {field.options.map((option, optIndex) => (
                            <li key={optIndex}>{option}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Single Voice Recording for All Questions */}
      <VoiceRecorder
        fieldLabel="Record your answers to all questions above"
        isRequired={true}
        onRecordingComplete={handleRecordingComplete}
      />

      {/* Show Extracted Responses */}
      {responses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Extracted Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {formTemplate.fields.map((field, index) => {
                const response = responses.find(r => r.fieldId === field.id);
                return (
                  <div key={field.id} className="p-3 bg-muted rounded-lg">
                    <h5 className="font-medium text-sm">Q{index + 1}: {field.label}</h5>
                    <p className="text-sm text-muted-foreground mt-1">
                      {response?.value || 'No answer extracted'}
                    </p>
                    {response?.confidence && (
                      <Badge variant="outline" className="mt-1">
                        Confidence: {Math.round(response.confidence * 100)}%
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        
        <Button 
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="bg-green-600 hover:bg-green-700"
        >
          <Check className="h-4 w-4 mr-2" />
          Submit Form
        </Button>
      </div>
    </div>
  );
};

export default FormFilling;
