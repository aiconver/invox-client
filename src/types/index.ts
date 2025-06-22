
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee';
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
  adminId: string;
  createdAt: Date;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  organizationId: string;
  createdAt: Date;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'number' | 'date' | 'multiple-choice' | 'textarea';
  label: string;
  required: boolean;
  options?: string[]; // for multiple-choice
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface FormTemplate {
  id: string;
  title: string;
  description: string;
  organizationId: string;
  departmentId: string;
  fields: FormField[];
  architecture: 'single-shot' | 'multi-agent' | 'one-by-one';
  createdAt: Date;
  createdBy: string;
  assignedEmployees?: string[];
}

export interface FormAssignment {
  id: string;
  formTemplateId: string;
  employeeId: string;
  assignedAt: Date;
  completedAt?: Date;
  reviewedAt?: Date;
  verifiedAt?: Date;
  status: 'pending' | 'in-review' | 'verified';
}

export interface FormResponse {
  id: string;
  assignmentId: string;
  fieldResponses: FieldResponse[];
  audioFiles: { [fieldId: string]: string }; // URLs to audio files
  transcripts: { [fieldId: string]: string };
  submittedAt: Date;
  processingTime: number;
  tokenCost: number;
  status: 'pending' | 'in-review' | 'verified';
}

export interface FieldResponse {
  fieldId: string;
  value: string;
  confidence?: number;
}

export interface RecordingState {
  isRecording: boolean;
  currentFieldId: string | null;
  audioBlob: Blob | null;
  transcript: string;
}
