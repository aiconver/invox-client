// src/types/forms.ts
export type FieldConfig = {
    type: string;
    required?: boolean;
  };
  
  export type FormTemplate = {
    id: string;
    name: string;
    department: string;
    structure: Record<string, FieldConfig>;
  };
  