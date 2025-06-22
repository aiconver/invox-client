
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Calendar, Clock, CheckCircle2, AlertCircle, Eye, FileCheck, RotateCcw, ArrowLeft, FileText } from 'lucide-react';
import { FormTemplate, FormField, FieldResponse, Department } from '@/types';
import { toast } from '@/hooks/use-toast';
import FormFilling from '@/features/forms/components/FormFilling';
import DepartmentSelector from './DepartmentSelector';

const EmployeeDashboard: React.FC = () => {
  const [departments] = useState<Department[]>([
    {
      id: 'dept-1',
      name: 'Customer Service',
      description: 'Handle customer inquiries and feedback',
      organizationId: 'org-1'
    },
    {
      id: 'dept-2', 
      name: 'Human Resources',
      description: 'Employee management and onboarding',
      organizationId: 'org-1'
    },
    {
      id: 'dept-3',
      name: 'IT Security',
      description: 'Information security and compliance',
      organizationId: 'org-1'
    },
    {
      id: 'dept-4',
      name: 'Operations',
      description: 'Daily operations and reporting',
      organizationId: 'org-1'
    }
  ]);

  const [assignedForms] = useState([
    {
      id: '1',
      title: 'Customer Feedback Survey',
      description: 'Collect feedback about our latest product release',
      status: 'pending' as const,
      dueDate: '2024-06-15',
      estimatedTime: '5 minutes',
      departmentId: 'dept-1',
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
      dueDate: '2024-06-12',
      estimatedTime: '10 minutes',
      departmentId: 'dept-4',
      fields: [
        { id: 'f4', type: 'textarea' as const, label: 'What did you accomplish this week?', required: true },
        { id: 'f5', type: 'textarea' as const, label: 'What blockers did you encounter?', required: false },
        { id: 'f6', type: 'text' as const, label: 'What are your priorities for next week?', required: true }
      ],
      architecture: 'single-shot' as const,
      submittedAt: '2024-06-10T10:30:00Z'
    },
    {
      id: '3',
      title: 'Training Evaluation',
      description: 'Evaluate the effectiveness of recent training sessions',
      status: 'verified' as const,
      dueDate: '2024-06-08',
      estimatedTime: '8 minutes',
      departmentId: 'dept-2',
      fields: [
        { id: 'f7', type: 'multiple-choice' as const, label: 'How would you rate the training?', required: true, options: ['Excellent', 'Good', 'Fair', 'Poor'] },
        { id: 'f8', type: 'textarea' as const, label: 'What could be improved?', required: false }
      ],
      architecture: 'one-by-one' as const,
      completedAt: '2024-06-08T14:30:00Z',
      verifiedAt: '2024-06-09T09:15:00Z',
      resultAccepted: true
    },
    {
      id: '4',
      title: 'Employee Onboarding Survey',
      description: 'Help us improve our onboarding process',
      status: 'redo' as const,
      dueDate: '2024-06-14',
      estimatedTime: '7 minutes',
      departmentId: 'dept-2',
      fields: [
        { id: 'f9', type: 'multiple-choice' as const, label: 'How clear was the onboarding process?', required: true, options: ['Very Clear', 'Clear', 'Unclear', 'Very Unclear'] },
        { id: 'f10', type: 'textarea' as const, label: 'What would you change about the onboarding?', required: true }
      ],
      architecture: 'multi-agent' as const,
      submittedAt: '2024-06-11T15:20:00Z',
      rejectedAt: '2024-06-12T11:00:00Z',
      rejectionReason: 'Incomplete responses detected. Please provide more detailed answers.'
    },
    {
      id: '5',
      title: 'Project Performance Review',
      description: 'Quarterly performance assessment',
      status: 'verified' as const,
      dueDate: '2024-06-05',
      estimatedTime: '15 minutes',
      departmentId: 'dept-4',
      fields: [
        { id: 'f11', type: 'textarea' as const, label: 'Describe your key achievements this quarter', required: true },
        { id: 'f12', type: 'number' as const, label: 'Rate your overall performance (1-10)', required: true },
        { id: 'f13', type: 'textarea' as const, label: 'What are your goals for next quarter?', required: true }
      ],
      architecture: 'single-shot' as const,
      completedAt: '2024-06-05T16:45:00Z',
      verifiedAt: '2024-06-06T10:30:00Z',
      resultAccepted: false,
      rejectionReason: 'Goals need to be more specific and measurable'
    },
    {
      id: '6',
      title: 'IT Security Compliance Check',
      description: 'Annual security awareness assessment',
      status: 'pending' as const,
      dueDate: '2024-06-20',
      estimatedTime: '12 minutes',
      departmentId: 'dept-3',
      fields: [
        { id: 'f14', type: 'multiple-choice' as const, label: 'How often do you update your passwords?', required: true, options: ['Monthly', 'Quarterly', 'Annually', 'Never'] },
        { id: 'f15', type: 'multiple-choice' as const, label: 'Do you use two-factor authentication?', required: true, options: ['Always', 'Sometimes', 'Never'] }
      ],
      architecture: 'one-by-one' as const
    }
  ]);

  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [activeForm, setActiveForm] = useState<FormTemplate | null>(null);

  // Calculate form counts per department
  const formCounts = departments.reduce((acc, dept) => {
    acc[dept.id] = assignedForms.filter(form => form.departmentId === dept.id).length;
    return acc;
  }, {} as { [departmentId: string]: number });

  // Filter forms by selected department
  const filteredForms = selectedDepartmentId 
    ? assignedForms.filter(form => form.departmentId === selectedDepartmentId)
    : [];

  const selectedDepartment = departments.find(dept => dept.id === selectedDepartmentId);

  const handleSelectDepartment = (departmentId: string) => {
    setSelectedDepartmentId(departmentId);
    const department = departments.find(d => d.id === departmentId);
    
    toast({
      title: "📁 Department Selected",
      description: `Viewing forms for ${department?.name}`,
      className: "border-blue-200 bg-blue-50 text-blue-800",
    });
  };

  const handleBackToDepartments = () => {
    setSelectedDepartmentId(null);
    
    toast({
      title: "🏠 Back to Departments",
      description: "Select a department to view its forms",
      className: "border-gray-200 bg-gray-50 text-gray-800",
    });
  };

  const handleStartForm = (formData: any) => {
    const formTemplate: FormTemplate = {
      id: formData.id,
      title: formData.title,
      description: formData.description,
      organizationId: 'org-1',
      departmentId: formData.departmentId,
      fields: formData.fields,
      architecture: formData.architecture,
      createdAt: new Date(),
      createdBy: 'admin-1'
    };
    setActiveForm(formTemplate);
    
    toast({
      title: "🎯 Form Started",
      description: `Starting "${formTemplate.title}". Good luck!`,
      className: "border-blue-200 bg-blue-50 text-blue-800",
    });
  };

  const handleFormSubmit = (responses: FieldResponse[], audioFiles: { [fieldId: string]: Blob }, transcripts: { [fieldId: string]: string }) => {
    console.log('Form submitted:', { responses, audioFiles, transcripts });
    
    toast({
      title: "✅ Form Submitted Successfully",
      description: `Your responses have been submitted for review. You'll be notified once verified.`,
      className: "border-green-200 bg-green-50 text-green-800",
    });
    
    setActiveForm(null);
  };

  const handleRedoForm = (formData: any) => {
    const formTemplate: FormTemplate = {
      id: formData.id,
      title: formData.title,
      description: formData.description,
      organizationId: 'org-1',
      departmentId: formData.departmentId,
      fields: formData.fields,
      architecture: formData.architecture,
      createdAt: new Date(),
      createdBy: 'admin-1'
    };
    setActiveForm(formTemplate);
    
    toast({
      title: "🔄 Redo Form",
      description: `Restarting "${formTemplate.title}". Please provide updated responses.`,
      className: "border-orange-200 bg-orange-50 text-orange-800",
    });
  };

  const handleViewResults = (formId: string) => {
    const form = filteredForms.find(f => f.id === formId);
    toast({
      title: "📊 View Results",
      description: `Viewing results for "${form?.title}"`,
      className: "border-purple-200 bg-purple-50 text-purple-800",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'in-review': return 'default';
      case 'verified': return 'secondary';
      case 'redo': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'in-review': return <Eye className="h-4 w-4" />;
      case 'verified': return <CheckCircle2 className="h-4 w-4" />;
      case 'redo': return <RotateCcw className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in-review': return 'In Review';
      case 'verified': return 'Verified';
      case 'redo': return 'Needs Redo';
      default: return status;
    }
  };

  const getActionButton = (form: any) => {
    if (form.status === 'verified') {
      const isRejected = Math.random() > 0.7;
      
      if (isRejected) {
        return (
          <Button size="sm" variant="outline" onClick={() => handleRedoForm(form)}>
            🔄 Redo Form
          </Button>
        );
      } else {
        return (
          <Button variant="outline" size="sm" onClick={() => handleViewResults(form.id)}>
            📊 View Results
          </Button>
        );
      }
    } else if (form.status === 'in-review') {
      return (
        <Button variant="outline" size="sm" disabled>
          ⏳ Under Review
        </Button>
      );
    } else {
      return (
        <Button size="sm" onClick={() => handleStartForm(form)}>
          ▶️ Start Form
        </Button>
      );
    }
  };

  // Show department selector if no department is selected
  if (!selectedDepartmentId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <div className="text-sm text-muted-foreground">
            Welcome back! Select a department to view your assigned forms.
          </div>
        </div>

        <DepartmentSelector 
          departments={departments}
          onSelectDepartment={handleSelectDepartment}
          formCounts={formCounts}
        />
      </div>
    );
  }

  // Show forms for selected department
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleBackToDepartments}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Departments
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{selectedDepartment?.name}</h1>
            {selectedDepartment?.description && (
              <p className="text-muted-foreground">{selectedDepartment.description}</p>
            )}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          You have {filteredForms.filter(f => f.status === 'pending' || f.status === 'redo').length} forms requiring attention.
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {filteredForms.filter(f => f.status === 'pending').length}
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
              {filteredForms.filter(f => f.status === 'in-review').length}
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
              {filteredForms.filter(f => f.status === 'verified').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Redo</CardTitle>
            <RotateCcw className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {filteredForms.filter(f => f.status === 'redo').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Forms */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Forms</CardTitle>
          <CardDescription>Forms assigned to you in {selectedDepartment?.name}</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredForms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No forms assigned to this department yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredForms.map((form) => (
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
                          {!form.resultAccepted && form.rejectionReason && (
                            <div className="text-xs text-orange-600 mt-1">
                              Note: {form.rejectionReason}
                            </div>
                          )}
                        </div>
                      )}

                      {form.status === 'redo' && form.rejectionReason && (
                        <div className="text-xs text-orange-600">
                          Reason for redo: {form.rejectionReason}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      {getActionButton(form)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
