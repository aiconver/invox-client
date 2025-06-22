
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormTemplate } from '@/types';
import FormBuilder from './FormBuilder';

interface EditFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: FormTemplate | null;
  onSave: (form: FormTemplate) => void;
}

const EditFormDialog: React.FC<EditFormDialogProps> = ({ 
  open, 
  onOpenChange, 
  form, 
  onSave 
}) => {
  const handleSave = (formData: Omit<FormTemplate, 'id' | 'organizationId' | 'createdAt' | 'createdBy'>) => {
    if (form) {
      const updatedForm: FormTemplate = {
        ...form,
        ...formData
      };
      onSave(updatedForm);
    }
  };

  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Form: {form.title}</DialogTitle>
        </DialogHeader>
        <FormBuilder
          initialData={form}
          onSave={handleSave}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditFormDialog;
