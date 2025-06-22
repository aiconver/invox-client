
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Calendar, Clock, CheckCircle2, AlertCircle, Eye, FileCheck } from 'lucide-react';
import { FormTemplate, FormField, FieldResponse } from '@/types';
import FormFilling from './FormFilling';

const EmployeeDashboard: React.FC = () => {
  const [assignedForms] = useState([
    {
      id: '1',
      title: 'Customer Feedback Survey',
      description: 'Collect feedback about our latest product release',
      status: 'pending' as const,
      dueDate: '2024-06-10',
      estimatedTime: '5 minutes',
      fields: [
        { id: 'f1', type: 'text' as const, label: 'What is your overall satisfaction with our product?', required: true },
        { id: 'f2', type: 'number' as const, label: 'Rate our customer service (1-10)', required: true },
        { id: 'f3', type: 'textarea' as const, label: 'Any additional feedback?', required: false }
      ],
      architecture: 'multi-agent' as const
    },
    {
      id: '2',
      title: 'Weekly Status Report',
      description: 'Report on weekly achievements and blockers',
      status: 'in-review' as const,
      dueDate: '2024-06-08',
      estimatedTime: '10 minutes',
      fields: [
        { id: 'f4', type: 'textarea' as const, label: 'What did you accomplish this week?', required: true },
        { id: 'f5', type: 'textarea' as const, label: 'What blockers did you encounter?', required: false },
        { id: 'f6', type: 'text' as const, label: 'What are your priorities for next week?', required: true }
      ],
      architecture: 'single-shot' as const,
      submittedAt: '2024-06-07T10:30:00Z'
    },
    {
      id: '3',
      title: 'Training Evaluation',
      description: 'Evaluate the effectiveness of recent training sessions',
      status: 'verified' as const,
      dueDate: '2024-06-05',
      estimatedTime: '8 minutes',
      fields: [
        { id: 'f7', type: 'multiple-choice' as const, label: 'How would you rate the training?', required: true, options: ['Excellent', 'Good', 'Fair', 'Poor'] },
        { id: 'f8', type: 'textarea' as const, label: 'What could be improved?', required: false }
      ],
      architecture: 'one-by-one' as const,
      completedAt: '2024-06-05T14:30:00Z',
      verifiedAt: '2024-06-06T09:15:00Z'
    }
  ]);

  const [activeForm, setActiveForm] = useState<FormTemplate | null>(null);

  const handleStartForm = (formData: any) => {
    const formTemplate: FormTemplate = {
      id: formData.id,
      title: formData.title,
      description: formData.description,
      organizationId: 'org-1',
      departmentId: formData.departmentId || 'dept-1',
      fields: formData.fields,
      architecture: formData.architecture,
      createdAt: new Date(),
      createdBy: 'admin-1'
    };
    setActiveForm(formTemplate);
  };

  const handleFormSubmit = (responses: FieldResponse[], audioFiles: { [fieldId: string]: Blob }, transcripts: { [fieldId: string]: string }) => {
    console.log('Form submitted:', { responses, audioFiles, transcripts });
    // Here you would typically send the data to your backend
    setActiveForm(null);
    // Show success toast or update form status
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'in-review': return 'default';
      case 'verified': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'in-review': return <Eye className="h-4 w-4" />;
      case 'verified': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in-review': return 'In Review';
      case 'verified': return 'Verified';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Welcome back! You have {assignedForms.filter(f => f.status === 'pending').length} pending forms.
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {assignedForms.filter(f => f.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {assignedForms.filter(f => f.status === 'in-review').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <FileCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {assignedForms.filter(f => f.status === 'verified').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Forms */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Forms</CardTitle>
          <CardDescription>Forms assigned to you by your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignedForms.map((form) => (
              <div key={form.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{form.title}</h3>
                      <Badge variant={getStatusColor(form.status)} className="flex items-center space-x-1">
                        {getStatusIcon(form.status)}
                        <span>{getStatusText(form.status)}</span>
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{form.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Due: {new Date(form.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{form.estimatedTime}</span>
                      </div>
                      <span>{form.fields.length} questions</span>
                      <Badge variant="outline" className="text-xs">
                        Single Recording
                      </Badge>
                    </div>
                    
                    {form.status === 'in-review' && form.submittedAt && (
                      <div className="text-xs text-muted-foreground">
                        Submitted: {new Date(form.submittedAt).toLocaleString()}
                      </div>
                    )}
                    
                    {form.status === 'verified' && form.verifiedAt && (
                      <div className="text-xs text-green-600">
                        Verified: {new Date(form.verifiedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    {form.status === 'verified' ? (
                      <Button variant="outline" size="sm">View Results</Button>
                    ) : form.status === 'in-review' ? (
                      <Button variant="outline" size="sm" disabled>
                        Under Review
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => handleStartForm(form)}>
                        Start Form
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Filling Dialog */}
      <Dialog open={!!activeForm} onOpenChange={() => setActiveForm(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {activeForm && (
            <FormFilling
              formTemplate={activeForm}
              onSubmit={handleFormSubmit}
              onCancel={() => setActiveForm(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeDashboard;
