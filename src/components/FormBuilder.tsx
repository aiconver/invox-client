
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormTemplate } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

interface FormBuilderProps {
  initialData?: FormTemplate;
  onSave: (form: Omit<FormTemplate, 'id' | 'organizationId' | 'createdAt' | 'createdBy'>) => void;
  onCancel: () => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ initialData, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState('dept-1');
  const [architecture, setArchitecture] = useState<FormTemplate['architecture']>('single-shot');
  const [fields, setFields] = useState<FormField[]>([]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setDepartmentId(initialData.departmentId);
      setArchitecture(initialData.architecture);
      setFields(initialData.fields);
    }
  }, [initialData]);

  const addField = () => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: 'text',
      label: '',
      required: false
    };
    setFields([...fields, newField]);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const updatedFields = fields.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    );
    setFields(updatedFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (title && fields.length > 0) {
      onSave({
        title,
        description,
        departmentId,
        fields,
        architecture
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Form' : 'Create New Form'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="title">Form Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter form title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dept-1">Customer Service</SelectItem>
                <SelectItem value="dept-2">Human Resources</SelectItem>
                <SelectItem value="dept-3">IT Security</SelectItem>
                <SelectItem value="dept-4">Operations</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="architecture">AI Architecture</Label>
            <Select value={architecture} onValueChange={(value: FormTemplate['architecture']) => setArchitecture(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select architecture" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single-shot">Single-shot</SelectItem>
                <SelectItem value="one-by-one">One-by-one</SelectItem>
                <SelectItem value="multi-agent">Multi-agent</SelectItem>
                <SelectItem value="per-question-multi">Per-question multi</SelectItem>
                <SelectItem value="local-hybrid">Local hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter form description"
            rows={3}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Form Fields</h3>
            <Button onClick={addField} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id} className="p-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Field Label</Label>
                  <Input
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    placeholder="Enter field label"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Field Type</Label>
                  <Select value={field.type} onValueChange={(value: FormField['type']) => updateField(index, { type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                      <SelectItem value="textarea">Textarea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end space-x-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`required-${index}`}
                      checked={field.required}
                      onChange={(e) => updateField(index, { required: e.target.checked })}
                    />
                    <Label htmlFor={`required-${index}`}>Required</Label>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeField(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {field.type === 'multiple-choice' && (
                <div className="mt-4 space-y-2">
                  <Label>Options (comma-separated)</Label>
                  <Input
                    value={field.options?.join(', ') || ''}
                    onChange={(e) => updateField(index, { options: e.target.value.split(', ').filter(o => o.trim()) })}
                    placeholder="Option 1, Option 2, Option 3"
                  />
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title || fields.length === 0}>
            {initialData ? 'Update Form' : 'Create Form'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormBuilder;
